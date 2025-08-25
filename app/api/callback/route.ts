import { NextRequest, NextResponse } from 'next/server';
import { createConnection, RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface DbUser extends RowDataPacket {
    id: string;
    accessToken: string;
    hash: string;
    salt: string;
    email: string;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/error?error=Discord not given a code...', request.url));
    }

    try {
        const connection = createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        connection.connect((err) => {
            if (err) {
                console.error('Database connection error:', err);
                return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
            }
        });

        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
                client_secret: process.env.CLIENT_SECRET!,
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return NextResponse.json({ error: 'Failed to fetch access token', details: tokenData.error_description }, { status: 400 });
        }

        const accessToken = tokenData.access_token;

        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userResponse.ok) {
            const errorDetails = await userResponse.json();
            return NextResponse.json({ error: 'Failed to fetch user data', details: errorDetails }, { status: userResponse.status });
        }
        const userData = await userResponse.json();

        const profilePictureUrl = userData.avatar
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator) % 5}.png`;

        const userId = userData.id;
        const existingUser = await new Promise<DbUser[]>((resolve, reject) => {
            connection.query('SELECT * FROM users WHERE id = ?', [userId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results as DbUser[]);
                }
            });
        });

        const existingUser2 = await new Promise<DbUser[]>((resolve, reject) => {
            connection.query('SELECT * FROM users WHERE email = ?', [userData.email], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results as DbUser[]);
                }
            });
        });

        if (existingUser.length > 0) {
            const user = existingUser[0];
            if (user.accessToken !== accessToken) {
                await new Promise<void>((resolve, reject) => {
                    connection.query('UPDATE users SET accessToken = ? WHERE id = ?', [accessToken, userId], (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                });
            }

            const userIdWithSalt = `${user.hash}:${user.salt}`;
            const token = jwt.sign({ token: userIdWithSalt }, process.env.JWT_SECRET!, { expiresIn: '2d' });
            return NextResponse.redirect(new URL(`/login?token=${token}`, request.url));
        } else {
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto.createHash('sha256').update(userId + salt).digest('hex');
            const userIdWithSalt = `${hash}:${salt}`;

            const token = jwt.sign({ token: userIdWithSalt }, process.env.JWT_SECRET!, { expiresIn: '2d' });

            const newUser = {
                id: userId,
                salt: salt,
                hash: hash,
                email: userData.email,
                profile_picture: profilePictureUrl,
                username: userData.username,
                friends: JSON.stringify([]),
                pending_friends: JSON.stringify([]),
                notify: JSON.stringify([]),
                created_at: new Date(),
                accessToken: accessToken,
            };
            async function safeInsert(table: string, data: Record<string, any>) {
                let payload = { ...data } as Record<string, any>;
                const removed = new Set<string>();
                while (true) {
                    try {
                        await new Promise<void>((resolve, reject) => {
                            connection.query(`INSERT INTO ${table} SET ?`, payload, (error) => {
                                if (error) reject(error);
                                else resolve();
                            });
                        });
                        return;
                    } catch (err: any) {
                        if (err && err.code === 'ER_BAD_FIELD_ERROR' && typeof err.sqlMessage === 'string') {
                            const m = err.sqlMessage.match(/Unknown column '([^']+)' in 'INSERT INTO'/);
                            if (m && m[1]) {
                                const col = m[1];
                                if (removed.has(col)) throw err;
                                removed.add(col);
                                delete payload[col];
                                const camel = col.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
                                delete payload[camel];
                                const snake = camel.replace(/([A-Z])/g, '_$1').toLowerCase();
                                delete payload[snake];
                                continue;
                            }
                        }
                        throw err;
                    }
                }
            }

            await safeInsert('users', newUser);

            return NextResponse.redirect(new URL(`/login?token=${token}`, request.url));
        }
    } catch (error) {
        console.error('Callback route error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}