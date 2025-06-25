import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from 'mysql2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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

        // const createTableQuery = `
        //     CREATE TABLE IF NOT EXISTS users (
        //         id INT AUTO_INCREMENT PRIMARY KEY,
        //         userid VARCHAR(255) NOT NULL UNIQUE,
        //         email VARCHAR(255) NOT NULL,
        //         profile_picture VARCHAR(255),
        //         username VARCHAR(255) NOT NULL,
        //         friends TEXT
        //     )
        // `;

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

        const dmsResponse = await fetch('https://discord.com/api/users/@me/channels', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!dmsResponse.ok) {
            return NextResponse.redirect(new URL(`/error?error=Failed to fetch DMs.`, request.url));
        }
        const dmsData = await dmsResponse.json();

        const profilePictureUrl = userData.avatar
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator) % 5}.png`;

        const friends = dmsData
            .filter((dm: any) => dm.type === 1)
            .map((dm: any) => ({
                id: dm.recipients[0].id,
                username: dm.recipients[0].username,
                avatar: dm.recipients[0].avatar
                    ? `https://cdn.discordapp.com/avatars/${dm.recipients[0].id}/${dm.recipients[0].avatar}.png`
                    : `https://cdn.discordapp.com/embed/avatars/${parseInt(dm.recipients[0].discriminator) % 5}.png`,
            }));

        const userId = userData.id;
        const existingUser = await new Promise<any[]>((resolve, reject) => {
            connection.query('SELECT * FROM users WHERE userid = ?', [userId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results as any[]);
                }
            });
        });

        if (existingUser.length > 0) {
            const user = existingUser[0];
            const userIdWithSalt = `${user.hash}:${user.salt}`;
            const token = jwt.sign({ userid: userIdWithSalt }, process.env.JWT_SECRET!, { expiresIn: '2d' });
            return NextResponse.redirect(new URL(`/login?token=${token}`, request.url));
        } else {
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto.createHash('sha256').update(userId + salt).digest('hex');
            const userIdWithSalt = `${hash}:${salt}`;

            const token = jwt.sign({ userid: userIdWithSalt }, process.env.JWT_SECRET!, { expiresIn: '2d' });

            const newUser = {
                id: userId,
                salt: salt,
                hash: hash,
                email: userData.email,
                profile_picture: profilePictureUrl,
                username: userData.username,
                friends: JSON.stringify(friends),
            };
            await new Promise<void>((resolve, reject) => {
                connection.query('INSERT INTO users SET ?', newUser, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                    }
                });
            });

            return NextResponse.redirect(new URL(`/login?token=${token}`, request.url));
        }
    } catch (error) {
        console.error('Callback route error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}