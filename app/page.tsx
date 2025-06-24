"use client";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
          animation-fill-mode: backwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
      <main className={`flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white ${inter.className}`}>
        <div className="flex flex-col items-center justify-center text-center m-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up">Syncre</h1>
          <p className="text-lg md:text-xl mb-8 animate-fade-in-up animation-delay-200">A modern, open-source, and self-hosted alternative to Notion.</p>
        </div>
      </main>
    </>
  );
}
