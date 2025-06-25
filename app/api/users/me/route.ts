import { NextResponse } from 'next/server';
import { createConnection, RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';

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

            const query = 'SELECT * FROM users WHERE hash = ? AND salt = ?';
            connection.query(query, [hash, salt], (error, results) => {
                connection.end();

                if (error) {
                    console.error('Database query error:', error);
                    resolve(NextResponse.json({ error: 'Database query failed' }, { status: 500 }));
                    return;
                }

                const users = results as RowDataPacket[];

                if (users.length === 0) {
                    resolve(NextResponse.json({ error: 'User not found' }, { status: 404 }));
                    return;
                }

                const user = users[0];

                // A szenzitív adatokat (hash, salt, accessToken) nem küldjük vissza a kliensnek.
                const { hash: userHash, salt: userSalt, accessToken, ...safeUserData } = user;

                resolve(NextResponse.json({ user: safeUserData }, { status: 200 }));
            });
        });
    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}