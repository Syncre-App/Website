"use client";
import { Inter } from 'next/font/google';
import { motion, Variants } from 'framer-motion';
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
  return (
    <>
      <Navbar />
      <main className={`flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white ${inter.className}`}>
        <motion.div
          className="flex flex-col items-center justify-center text-center m-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible">
          <motion.h1 className="text-5xl md:text-6xl font-bold mb-4" variants={itemVariants}>Syncre</motion.h1>
          <motion.p className="text-lg md:text-xl mb-8" variants={itemVariants}>A modern, open-source, cross-platform chat application.</motion.p>
        </motion.div>
      </main>
    </>
  );
}
