import { NextResponse } from 'next/server';
import { createConnection, RowDataPacket } from 'mysql2/promise';
import jwt from 'jsonwebtoken';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const targetUserId = params.id;
    if (!targetUserId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let connection;
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

        const [currentUserRows] = await connection.execute<RowDataPacket[]>(
            'SELECT friends FROM users WHERE hash = ? AND salt = ?',
            [hash, salt]
        );

        if (currentUserRows.length === 0) {
            return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
        }
        const currentUserFriends = currentUserRows[0].friends ? JSON.parse(currentUserRows[0].friends) : [];

        const [targetUserRows] = await connection.execute<RowDataPacket[]>(
            'SELECT username, pfp, friends FROM users WHERE id = ?',
            [targetUserId]
        );

        if (targetUserRows.length === 0) {
            return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
        }
        const targetUser = targetUserRows[0];
        const targetUserFriends = targetUser.friends ? JSON.parse(targetUser.friends) : [];

        const commonFriendIds = currentUserFriends.filter((friendId: number) => targetUserFriends.includes(friendId));

        let commonFriendsDetails: RowDataPacket[] = [];
        if (commonFriendIds.length > 0) {
            const placeholders = commonFriendIds.map(() => '?').join(',');
            const [commonFriendRows] = await connection.execute<RowDataPacket[]>(
                `SELECT id, username, pfp FROM users WHERE id IN (${placeholders})`,
                commonFriendIds
            );
            commonFriendsDetails = commonFriendRows;
        }

        const responseData = {
            username: targetUser.username,
            pfp: targetUser.pfp,
            common_friends: commonFriendsDetails,
        };

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error('Error fetching user data:', error);
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