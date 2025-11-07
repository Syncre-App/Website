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
        <section id="features" className="flex flex-col items-center justify-center text-center min-h-screen w-full p-24 bg-gray-900/20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 className="text-2xl sm:text-3xl font-bold mb-12" variants={itemVariants}>Features</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
                <div className="p-4 bg-blue-600/10 rounded-full">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 className="text-xl font-semibold">End-to-End Encryption</h3>
                <p className="text-gray-400 text-sm max-w-xs">Your conversations are your own. With state-of-the-art end-to-end encryption, no one—not even us—can read your messages.</p>
              </motion.div>
              <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
                <div className="p-4 bg-blue-600/10 rounded-full">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-xl font-semibold">Cross-Platform</h3>
                <p className="text-gray-400 text-sm max-w-xs">Syncre is available on all your devices. Seamlessly switch between your phone and tablet, with more platforms to come.</p>
              </motion.div>
              <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
                <div className="p-4 bg-blue-600/10 rounded-full">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8z"></path></svg>
                </div>
                <h3 className="text-xl font-semibold">Open Source</h3>
                <p className="text-gray-400 text-sm max-w-xs">Transparency is key to trust. Syncre is open-source, allowing anyone to audit the code and contribute to its development.</p>
              </motion.div>
            </div>
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
              The official version is not yet released, but you can enroll in the development program to get early access. The application will be available for Android and iOS.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch max-w-md w-full blur-sm pointer-events-none" variants={itemVariants}>
              <a href="#" aria-label="Download Syncre for Android" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition text-center">Android</a>
              <a href="#" aria-label="Download Syncre for iOS" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition text-center">iOS</a>
            </motion.div>
            <motion.p className="text-sm sm:text-base mt-6 max-w-xl text-gray-400" variants={itemVariants}>
              To enroll in the development version, please send an email to <a href="mailto:contact@devbeni.lol" className="text-blue-400 hover:underline">contact@devbeni.lol</a>.
            </motion.p>
          </motion.div>
        </section>
      </main>
    </>
  );
}
