"use client";
import { Inter } from 'next/font/google';
import { motion, Variants } from 'framer-motion';
import { useRef } from 'react';
import Navbar from '../components/Navbar';

const inter = Inter({ subsets: ['latin'] });

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Home() {
  const homeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Navbar />
      <main className={`flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white ${inter.className}`}>
        <section ref={homeRef} id="home" className="flex flex-col items-center justify-center text-center min-h-screen w-full px-6 py-20 md:py-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-3 leading-tight" variants={itemVariants}>Syncre</motion.h1>
            <motion.p className="text-sm sm:text-base md:text-lg mb-6 max-w-xl mx-auto text-gray-200" variants={itemVariants}>
              Syncre is a secure, cross-platform mobile communication application built with React Native and Expo. It focuses on privacy and security through end-to-end encryption for all communications.
            </motion.p>
            <motion.p className="text-base sm:text-lg md:text-xl mb-8 font-medium max-w-2xl mx-auto" variants={itemVariants}>
              Fast. Private. Cross-platform — designed for people who value their conversations.
            </motion.p>
          </motion.div>
        </section>
        <section ref={aboutRef} id="about" className="flex flex-col items-center justify-center text-center min-h-screen w-full p-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 className="text-2xl sm:text-3xl font-bold mb-4" variants={itemVariants}>About Syncre</motion.h2>
            <motion.p className="text-sm sm:text-base md:text-lg mb-8 max-w-2xl text-gray-200 px-2" variants={itemVariants}>
              Syncre is designed for seamless, secure, and fast communication on mobile devices. Built with React Native and Expo, it brings native performance and a consistent experience across iOS and Android. End-to-end encryption is enabled by default for messages and media, so your conversations stay private.
            </motion.p>
            <motion.p className="text-sm sm:text-base max-w-2xl text-gray-300 px-2" variants={itemVariants}>
              Open-source and community-driven — auditable by anyone and continuously improved for security and reliability.
            </motion.p>
          </motion.div>
        </section>
        <section ref={downloadRef} id="download" className="flex flex-col items-center justify-center text-center min-h-screen w-full p-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 className="text-2xl sm:text-3xl font-bold mb-4" variants={itemVariants}>Get Syncre</motion.h2>
            <motion.p className="text-sm sm:text-base mb-6 max-w-xl text-gray-200" variants={itemVariants}>
              Install Syncre on your device. Mobile builds are available through the App Store / Play Store when published; use the installers below for desktop platforms.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch max-w-md w-full" variants={itemVariants}>
              <a href="/downloads/syncre-windows.exe" aria-label="Download Syncre for Windows" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition text-center">Windows</a>
              <a href="/downloads/syncre-macos.dmg" aria-label="Download Syncre for macOS" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition text-center">macOS</a>
              <a href="/downloads/syncre-linux.AppImage" aria-label="Download Syncre for Linux" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition text-center">Linux</a>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </>
  );
}
