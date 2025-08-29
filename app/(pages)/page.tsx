"use client";
import { Inter } from 'next/font/google';
import { motion, Variants } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
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
  const [activeSection, setActiveSection] = useState("home");
  const homeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120; // offset for navbar height
      const sections = [
        { id: "home", ref: homeRef },
        { id: "about", ref: aboutRef },
        { id: "download", ref: downloadRef },
      ];
      let current = "home";
      for (const section of sections) {
        if (section.ref.current) {
          const top = section.ref.current.offsetTop;
          if (scrollY >= top) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Navbar
  
      />
      <main className={`flex flex-col min-h-screen items-center justify-center p-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white ${inter.className}`}>
        <section ref={homeRef} id="home" className="flex flex-col items-center justify-center text-center min-h-screen w-full p-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 className="text-5xl md:text-6xl font-bold mb-4" variants={itemVariants}>Syncre</motion.h1>
            <motion.p className="text-lg md:text-xl mb-8" variants={itemVariants}>A modern, open-source, cross-platform chat application.</motion.p>
          </motion.div>
        </section>
        <section ref={aboutRef} id="about" className="flex flex-col items-center justify-center text-center min-h-screen w-full p-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 className="text-4xl font-bold mb-4" variants={itemVariants}>About Syncre</motion.h2>
            <motion.p className="text-lg md:text-xl mb-8 max-w-2xl" variants={itemVariants}>
              Syncre is designed for seamless, secure, and fast communication. Built with modern technologies, it supports all major platforms and is fully open-source.
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
            <motion.h2 className="text-4xl font-bold mb-4" variants={itemVariants}>Download Syncre</motion.h2>
            <motion.p className="text-lg md:text-xl mb-8 max-w-2xl" variants={itemVariants}>
              Download Syncre for your platform:
            </motion.p>
            <motion.div className="flex flex-col md:flex-row gap-4 justify-center" variants={itemVariants}>
              <a href="/downloads/syncre-windows.exe" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">Windows</a>
              <a href="/downloads/syncre-macos.dmg" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">macOS</a>
              <a href="/downloads/syncre-linux.AppImage" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">Linux</a>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </>
  );
}
