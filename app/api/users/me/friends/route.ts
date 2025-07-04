import { NextResponse } from 'next/server';
import { createConnection, RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';

interface FriendRequest {
    from: number;
    to: number;
}

export async function GET(request: Request) {
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET!) as { token: string };
        
        const [hash, salt] = decodedPayload.token.split(':');

        if (!hash || !salt) {
            return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 });
        }

        return new Promise<NextResponse>((resolve) => {
            const connection = createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            connection.connect((err) => {
                if (err) {
                    console.error('Database connection error:', err);
                    resolve(NextResponse.json({ error: 'Database connection failed' }, { status: 500 }));
                    return;
                }
            });

            const getUserQuery = 'SELECT friends FROM users WHERE hash = ? AND salt = ?';
            connection.query(getUserQuery, [hash, salt], (error, results) => {
                if (error) {
                    connection.end();
                    console.error('Database query error:', error);
                    resolve(NextResponse.json({ error: 'Database query failed' }, { status: 500 }));
                    return;
                }

                const users = results as RowDataPacket[];
                if (users.length === 0) {
                    connection.end();
                    resolve(NextResponse.json({ error: 'User not found' }, { status: 404 }));
                    return;
                }

                const user = users[0];
                const friendIds = user.friends ? JSON.parse(user.friends) : [];

                if (friendIds.length === 0) {
                    connection.end();
                    resolve(NextResponse.json({ friends: [] }, { status: 200 }));
                    return;
                }

                const getFriendsQuery = 'SELECT id, username, email, profile_picture FROM users WHERE id IN (?)';
                connection.query(getFriendsQuery, [friendIds], (error, friendResults) => {
                    connection.end();
                    if (error) {
                        console.error('Database query error:', error);
                        resolve(NextResponse.json({ error: 'Database query failed' }, { status: 500 }));
                        return;
                    }

                    const friends = friendResults as RowDataPacket[];
                    resolve(NextResponse.json({ friends }, { status: 200 }));
                });
            });
        });
    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}

export async function POST(request: Request) {
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { to_id } = await request.json();
        if (!to_id) {
            return NextResponse.json({ error: '`to_id` is required' }, { status: 400 });
        }

        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET!) as { token: string };
        
        const [hash, salt] = decodedPayload.token.split(':');

        if (!hash || !salt) {
            return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 });
        }

        return new Promise<NextResponse>((resolve) => {
            const connection = createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            connection.connect((err) => {
                if (err) {
                    console.error('Database connection error:', err);
                    return resolve(NextResponse.json({ error: 'Database connection failed' }, { status: 500 }));
                }
            });

            connection.beginTransaction(err => {
                if (err) {
                    connection.end();
                    return resolve(NextResponse.json({ error: 'Failed to start transaction' }, { status: 500 }));
                }

                const findFromUserQuery = 'SELECT id, pending_friends FROM users WHERE hash = ? AND salt = ?';
                connection.query(findFromUserQuery, [hash, salt], (error, fromUserResults) => {
                    if (error) {
                        return connection.rollback(() => {
                            connection.end();
                            resolve(NextResponse.json({ error: 'Database query failed for sender' }, { status: 500 }));
                        });
                    }

                    const fromUsers = fromUserResults as RowDataPacket[];
                    if (fromUsers.length === 0) {
                        return connection.rollback(() => {
                            connection.end();
                            resolve(NextResponse.json({ error: 'User not found' }, { status: 404 }));
                        });
                    }
                    const fromUser = fromUsers[0];
                    const from_id = fromUser.id;

                    if (from_id === to_id) {
                        return connection.rollback(() => {
                            connection.end();
                            resolve(NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 }));
                        });
                    }

                    const findToUserQuery = 'SELECT id, pending_friends FROM users WHERE id = ?';
                    connection.query(findToUserQuery, [to_id], (error, toUserResults) => {
                        if (error) {
                            return connection.rollback(() => {
                                connection.end();
                                resolve(NextResponse.json({ error: 'Database query failed for receiver' }, { status: 500 }));
                            });
                        }

                        const toUsers = toUserResults as RowDataPacket[];
                        if (toUsers.length === 0) {
                            return connection.rollback(() => {
                                connection.end();
                                resolve(NextResponse.json({ error: 'Target user not found' }, { status: 404 }));
                            });
                        }
                        const toUser = toUsers[0];

                        const fromPending = fromUser.pending_friends ? JSON.parse(fromUser.pending_friends) : [];
                        const requestExists = fromPending.some((req: FriendRequest) => (req.from === from_id && req.to === to_id) || (req.from === to_id && req.to === from_id));
                        if (requestExists) {
                            return connection.rollback(() => {
                                connection.end();
                                resolve(NextResponse.json({ error: 'Friend request already exists or is pending' }, { status: 409 }));
                            });
                        }

                        const newRequest = { from: from_id, to: to_id };
                        
                        fromPending.push(newRequest);
                        const newFromPendingJson = JSON.stringify(fromPending);

                        const toPending = toUser.pending_friends ? JSON.parse(toUser.pending_friends) : [];
                        toPending.push(newRequest);
                        const newToPendingJson = JSON.stringify(toPending);

                        const updateFromUserQuery = 'UPDATE users SET pending_friends = ? WHERE id = ?';
                        connection.query(updateFromUserQuery, [newFromPendingJson, from_id], (error) => {
                            if (error) {
                                return connection.rollback(() => {
                                    connection.end();
                                    resolve(NextResponse.json({ error: 'Failed to update sender' }, { status: 500 }));
                                });
                            }

                            const updateToUserQuery = 'UPDATE users SET pending_friends = ? WHERE id = ?';
                            connection.query(updateToUserQuery, [newToPendingJson, to_id], (error) => {
                                if (error) {
                                    return connection.rollback(() => {
                                        connection.end();
                                        resolve(NextResponse.json({ error: 'Failed to update receiver' }, { status: 500 }));
                                    });
                                }

                                connection.commit((err) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.end();
                                            resolve(NextResponse.json({ error: 'Failed to commit transaction' }, { status: 500 }));
                                        });
                                    }
                                    connection.end();
                                    resolve(NextResponse.json({ message: 'Friend request sent' }, { status: 200 }));
                                });
                            });
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Token verification or body parsing error:', error);
        return NextResponse.json({ error: 'Invalid token or request body' }, { status: 401 });
    }
}