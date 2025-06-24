"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-30 backdrop-blur-lg"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white text-2xl font-bold">
              Syncre
            </Link>
          </div>

          {/* Primary Nav */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="py-2 px-3 text-gray-300 hover:text-white transition duration-300 rounded-md">
              Home
            </Link>
            <Link href="/about" className="py-2 px-3 text-gray-300 hover:text-white transition duration-300 rounded-md">
              About
            </Link>
            <Link href="/team" className="py-2 px-3 text-gray-300 hover:text-white transition duration-300 rounded-md">
              Team
            </Link>
          </div>

          {/* Secondary Nav (Login) */}
          <div>
            <Link href="/login" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition duration-300">
              Login
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
