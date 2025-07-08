import { NextResponse } from 'next/server';
import { createConnection, RowDataPacket, Connection } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

interface Notification {
    id: string;
    title: string;
    userid: string;
    type?: string;
    read?: boolean;
    timestamp?: string;
}

interface FriendRequest {
    from: number;
    to: number;
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string; action: string }> }
) {
    const { id, action } = await params;
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['accept', 'reject', 'dismiss'].includes(action)) {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let connection: Connection | undefined;

    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET!) as { token: string };
        const [hash, salt] = decodedPayload.token.split(':');

        if (!hash || !salt) {
            return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 });
        }

        connection = await createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [userRows] = await connection.execute<RowDataPacket[]>(
            'SELECT id, username, notify, friends, pending_friends FROM users WHERE hash = ? AND salt = ?',
            [hash, salt]
        );

        if (userRows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }        const user = userRows[0];
        const notifications: Notification[] = user.notify ? JSON.parse(user.notify) : [];
        
        const notificationIndex = notifications.findIndex((n: Notification) => n.id === id);
        
        if (notificationIndex === -1) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }
        
        const notification = notifications[notificationIndex];
        notifications.splice(notificationIndex, 1);
        
        if (notification.type === 'friend_request' && (action === 'accept' || action === 'reject')) {
            const fromUserId = notification.userid;
            
            const pendingFriends: FriendRequest[] = user.pending_friends ? JSON.parse(user.pending_friends) : [];
            const requestIndex = pendingFriends.findIndex(
                (req: FriendRequest) => req.from === parseInt(fromUserId) && req.to === parseInt(user.id)
            );

            if (requestIndex !== -1) {
                pendingFriends.splice(requestIndex, 1);

                if (action === 'accept') {
                    const friends = user.friends ? JSON.parse(user.friends) : [];
                    if (!friends.includes(parseInt(fromUserId))) {
                        friends.push(parseInt(fromUserId));
                    }

                    const [senderRows] = await connection.execute<RowDataPacket[]>(
                        'SELECT id, username, friends, pending_friends, notify FROM users WHERE id = ?',
                        [fromUserId]
                    );

                    if (senderRows.length > 0) {
                        const sender = senderRows[0];
                        const senderFriends = sender.friends ? JSON.parse(sender.friends) : [];
                        const senderPending = sender.pending_friends ? JSON.parse(sender.pending_friends) : [];
                        const senderNotify = sender.notify ? JSON.parse(sender.notify) : [];
                        
                        if (!senderFriends.includes(parseInt(user.id))) {
                            senderFriends.push(parseInt(user.id));
                        }
                        
                        const senderRequestIndex = senderPending.findIndex(
                            (req: FriendRequest) => req.from === parseInt(fromUserId) && req.to === parseInt(user.id)
                        );
                        
                        if (senderRequestIndex !== -1) {
                            senderPending.splice(senderRequestIndex, 1);
                        }

                        senderNotify.push({
                            id: uuidv4(),
                            title: `${user.username} accepted your friend request`,
                            userid: user.id,
                            type: 'friend_accept',
                            read: false,
                            timestamp: new Date().toISOString()
                        });

                        await connection.execute(
                            'UPDATE users SET friends = ?, pending_friends = ?, notify = ? WHERE id = ?',
                            [
                                JSON.stringify(senderFriends),
                                JSON.stringify(senderPending),
                                JSON.stringify(senderNotify),
                                fromUserId
                            ]
                        );

                        try {
                            const chatId = uuidv4();
                            const [user1, user2] = [parseInt(user.id), parseInt(fromUserId)].sort((a, b) => a - b);

                            const [existingChatRows] = await connection.execute<RowDataPacket[]>(
                                'SELECT id FROM chats WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
                                [user1, user2, user2, user1]
                            );

                            if (existingChatRows.length === 0) {
                                await connection.execute(
                                    'INSERT INTO chats (id, user1_id, user2_id, created_at) VALUES (?, ?, ?, NOW())',
                                    [chatId, user1, user2]
                                );
                            }
                        } catch (error) {
                            console.error('Error creating chat:', error);
                        }
                    }

                    await connection.execute(
                        'UPDATE users SET friends = ?, pending_friends = ?, notify = ? WHERE id = ?',
                        [
                            JSON.stringify(friends),
                            JSON.stringify(pendingFriends),
                            JSON.stringify(notifications),
                            user.id
                        ]
                    );

                    return NextResponse.json({ message: 'Friend request accepted' }, { status: 200 });
                } else if (action === 'reject') {
                    await connection.execute(
                        'UPDATE users SET pending_friends = ?, notify = ? WHERE id = ?',
                        [JSON.stringify(pendingFriends), JSON.stringify(notifications), user.id]
                    );

                    const [senderRows] = await connection.execute<RowDataPacket[]>(
                        'SELECT id, pending_friends FROM users WHERE id = ?',
                        [fromUserId]
                    );

                    if (senderRows.length > 0) {
                        const sender = senderRows[0];
                        const senderPending = sender.pending_friends ? JSON.parse(sender.pending_friends) : [];
                        
                        const senderRequestIndex = senderPending.findIndex(
                            (req: FriendRequest) => req.from === parseInt(fromUserId) && req.to === parseInt(user.id)
                        );
                        
                        if (senderRequestIndex !== -1) {
                            senderPending.splice(senderRequestIndex, 1);
                        }
                        
                        await connection.execute(
                            'UPDATE users SET pending_friends = ? WHERE id = ?',
                            [JSON.stringify(senderPending), fromUserId]
                        );
                    }

                    return NextResponse.json({ message: 'Friend request rejected' }, { status: 200 });
                }
            }
        }

        await connection.execute(
            'UPDATE users SET notify = ? WHERE id = ?',
            [JSON.stringify(notifications), user.id]
        );

        return NextResponse.json({ message: 'Notification processed successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error handling notification action:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}