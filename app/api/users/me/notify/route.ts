import { NextResponse } from 'next/server';
import { createConnection, RowDataPacket, Connection } from 'mysql2/promise';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

        const [rows] = await connection.execute<RowDataPacket[]>(
            'SELECT notify FROM users WHERE hash = ? AND salt = ?',
            [hash, salt]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const notifications = rows[0].notify ? JSON.parse(rows[0].notify) : [];
        
        return NextResponse.json({ notifications }, { status: 200 });

    } catch (error) {
        console.error('Error fetching notifications:', error);
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

export async function POST(request: Request) {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let connection: Connection | undefined;
    try {
        const { action, notificationId } = await request.json();
        
        if (!action || !notificationId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }
        
        if (!['mark_read', 'mark_all_read', 'delete'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
        
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

        const [rows] = await connection.execute<RowDataPacket[]>(
            'SELECT id, notify FROM users WHERE hash = ? AND salt = ?',
            [hash, salt]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = rows[0];
        const notifications = user.notify ? JSON.parse(user.notify) : [];
        
        if (action === 'mark_read') {
            const index = notifications.findIndex((n: any) => n.id === notificationId);
            if (index !== -1) {
                notifications[index].read = true;
            }
        } else if (action === 'mark_all_read') {
            for (const notification of notifications) {
                notification.read = true;
            }
        } else if (action === 'delete') {
            const index = notifications.findIndex((n: any) => n.id === notificationId);
            if (index !== -1) {
                notifications.splice(index, 1);
            }
        }
        
        await connection.execute(
            'UPDATE users SET notify = ? WHERE id = ?',
            [JSON.stringify(notifications), user.id]
        );
        
        return NextResponse.json({ 
            message: 'Notification updated successfully',
            notifications
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating notifications:', error);
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