"use client";

// import { FaDiscord, FaGithub, FaGoogle } from 'react-icons/fa';
import { FaDiscord } from 'react-icons/fa';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const handleLogin = (provider: 'google' | 'discord' | 'github') => {
        if (provider === 'discord') {
            window.location.href = `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&scope=${process.env.NEXT_PUBLIC_SCOPE}`;
        } else {
            console.log(`Login with ${provider} is not implemented yet.`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
            <motion.div
                className="w-full max-w-md bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <h1 className="text-4xl font-bold mb-2">Login</h1>
                <div className="w-20 h-1 bg-blue-500 rounded-full mx-auto mb-8"></div>

                <div className="space-y-4">
                    <button
                        onClick={() => handleLogin('discord')}
                        className="w-full flex items-center justify-center gap-x-3 py-3 px-4 rounded-lg bg-[#5865F2] text-white font-semibold hover:bg-[#4752C4] transition-colors duration-300"
                    >
                        <FaDiscord size={22} />
                        <span>Login with Discord</span>
                    </button>
                    {/* <button
                        onClick={() => handleLogin('google')}
                        className="w-full flex items-center justify-center gap-x-3 py-3 px-4 rounded-lg bg-white text-gray-800 font-semibold hover:bg-gray-200 transition-colors duration-300"
                    >
                        <FaGoogle size={22} />
                        <span>Login with Google</span>
                    </button>
                    <button
                        onClick={() => handleLogin('github')}
                        className="w-full flex items-center justify-center gap-x-3 py-3 px-4 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-colors duration-300"
                    >
                        <FaGithub size={22} />
                        <span>Login with GitHub</span>
                    </button> */}
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;