import { NextResponse } from 'next/server';
import { createConnection, RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { from_id } = await request.json();
        if (!from_id) {
            return NextResponse.json({ error: '`from_id` is required' }, { status: 400 });
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

                const findCurrentUserQuery = 'SELECT id, pending_friends, friends FROM users WHERE hash = ? AND salt = ?';
                connection.query(findCurrentUserQuery, [hash, salt], (error, currentUserResults) => {
                    if (error) {
                        return connection.rollback(() => {
                            connection.end();
                            resolve(NextResponse.json({ error: 'Database query failed for current user' }, { status: 500 }));
                        });
                    }

                    const currentUsers = currentUserResults as RowDataPacket[];
                    if (currentUsers.length === 0) {
                        return connection.rollback(() => {
                            connection.end();
                            resolve(NextResponse.json({ error: 'Current user not found' }, { status: 404 }));
                        });
                    }
                    const currentUser = currentUsers[0];
                    const to_id = currentUser.id;

                    const findFromUserQuery = 'SELECT id, pending_friends, friends FROM users WHERE id = ?';
                    connection.query(findFromUserQuery, [from_id], (error, fromUserResults) => {
                        if (error) {
                            return connection.rollback(() => {
                                connection.end();
                                resolve(NextResponse.json({ error: 'Database query failed for from_user' }, { status: 500 }));
                            });
                        }

                        const fromUsers = fromUserResults as RowDataPacket[];
                        if (fromUsers.length === 0) {
                            return connection.rollback(() => {
                                connection.end();
                                resolve(NextResponse.json({ error: 'Requesting user not found' }, { status: 404 }));
                            });
                        }
                        const fromUser = fromUsers[0];

                        const currentUserPending = currentUser.pending_friends ? JSON.parse(currentUser.pending_friends) : [];
                        const requestIndex = currentUserPending.findIndex((req: any) => req.from === from_id && req.to === to_id);

                        if (requestIndex === -1) {
                            return connection.rollback(() => {
                                connection.end();
                                resolve(NextResponse.json({ error: 'Friend request not found' }, { status: 404 }));
                            });
                        }

                        currentUserPending.splice(requestIndex, 1);
                        const newCurrentUserPendingJson = JSON.stringify(currentUserPending);

                        const fromUserPending = fromUser.pending_friends ? JSON.parse(fromUser.pending_friends) : [];
                        const fromUserRequestIndex = fromUserPending.findIndex((req: any) => req.from === from_id && req.to === to_id);
                        if (fromUserRequestIndex !== -1) {
                            fromUserPending.splice(fromUserRequestIndex, 1);
                        }
                        const newFromUserPendingJson = JSON.stringify(fromUserPending);

                        const currentUserFriends = currentUser.friends ? JSON.parse(currentUser.friends) : [];
                        if (!currentUserFriends.includes(from_id)) {
                            currentUserFriends.push(from_id);
                        }
                        const newCurrentUserFriendsJson = JSON.stringify(currentUserFriends);

                        const fromUserFriends = fromUser.friends ? JSON.parse(fromUser.friends) : [];
                        if (!fromUserFriends.includes(to_id)) {
                            fromUserFriends.push(to_id);
                        }
                        const newFromUserFriendsJson = JSON.stringify(fromUserFriends);

                        const updateCurrentUserQuery = 'UPDATE users SET pending_friends = ?, friends = ? WHERE id = ?';
                        connection.query(updateCurrentUserQuery, [newCurrentUserPendingJson, newCurrentUserFriendsJson, to_id], (error) => {
                            if (error) {
                                return connection.rollback(() => {
                                    connection.end();
                                    resolve(NextResponse.json({ error: 'Failed to update current user' }, { status: 500 }));
                                });
                            }

                            const chatId = uuidv4();
                            const createChatQuery = 'INSERT INTO chats (id, user1_id, user2_id) VALUES (?, ?, ?)';
                            const [user1, user2] = [to_id, from_id].sort((a, b) => a - b);
                            connection.query(createChatQuery, [chatId, user1, user2], (error) => {
                                if (error) {
                                    return connection.rollback(() => {
                                        connection.end();
                                        resolve(NextResponse.json({ error: 'Failed to create chat' }, { status: 500 }));
                                    });
                                }
                            });

                            const updateFromUserQuery = 'UPDATE users SET pending_friends = ?, friends = ? WHERE id = ?';
                            connection.query(updateFromUserQuery, [newFromUserPendingJson, newFromUserFriendsJson, from_id], (error) => {
                                if (error) {
                                    return connection.rollback(() => {
                                        connection.end();
                                        resolve(NextResponse.json({ error: 'Failed to update requesting user' }, { status: 500 }));
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
                                    resolve(NextResponse.json({ message: 'Friend request accepted' }, { status: 200 }));
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
