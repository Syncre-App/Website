'use client';

import Navbar from '../../components/Navbar';

export default function Home() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-40 px-12 pb-12">
                <h1 className="text-4xl font-bold text-center mb-12">Team</h1>
                <p className="text-center text-lg mb-12">
                    Meet our team of dedicated professionals who are committed to delivering the best experience for you
                </p>
                <div className="flex flex-col items-center gap-12 sm:flex-row sm:justify-center">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-white/5 backdrop-blur-md rounded-2xl p-8 w-64 flex flex-col items-center shadow-md transition hover:shadow-xl"
                        >
                            <div className="bg-gray-700 rounded-full w-24 h-24 mb-4" />
                            <h2 className="text-xl font-bold mb-1">asdasd</h2>
                            <p className="text-sm text-gray-300">asdasdasdasdasd</p>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
}
