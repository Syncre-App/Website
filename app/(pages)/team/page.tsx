'use client';

import Navbar from '../../components/Navbar';
import Image from 'next/image';

export default function Home() {
    const contributors = [
        {
            name: 'Balló Benedek',
            image: 'https://cdn.discordapp.com/avatars/801162422580019220/671dcf03377274db3494348e0ada8bab.webp',
            description: 'Lead Developer and Project Manager'
        },
        {
            name: 'Guti Balázs',
            image: 'https://cdn.discordapp.com/avatars/691581143669276692/5fd0c3677f16c82aab67d08870743181.webp',
            description: 'UI/UX Designer and Frontend Developer'
        },
        {
            name: 'Domokos Ádám',
            image: 'https://cdn.discordapp.com/avatars/1006581830880874618/b5dc767a0c6f906903958cbc795303f9.webp',
            description: 'Backend Developer and Database Administrator'
        },
    ];

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-40 px-12 pb-12">
                <h1 className="text-4xl font-bold text-center mb-12">Team</h1>
                <p className="text-center text-lg mb-12">
                    Meet our team of dedicated professionals who are committed to delivering the best experience for you
                </p>
                <div className="flex flex-col items-center gap-12 sm:flex-row sm:justify-center flex-wrap">
                    {contributors.map((contributor, index) => (
                        <div
                            key={index}
                            className="bg-gray-800 rounded-2xl p-8 w-64 flex flex-col items-center shadow-md transition hover:shadow-xl"
                        >
                            <div className="rounded-full overflow-hidden w-24 h-24 mb-4">
                                <Image
                                    src={contributor.image}
                                    alt={contributor.name}
                                    width={96}
                                    height={96}
                                    className="object-cover"
                                />
                            </div>
                            <h2 className="text-xl font-bold mb-1">{contributor.name}</h2>
                            <p className="text-sm text-gray-300 text-center">{contributor.description}</p>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
}
