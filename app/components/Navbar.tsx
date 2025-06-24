"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <div className="fixed top-[30px] w-full flex justify-center z-50 px-4">
      <motion.nav 
        className="w-full max-w-[1000px] h-[75px] flex items-center justify-between rounded-full bg-white/5 backdrop-blur-lg px-6"
        initial={{ y: -150, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex items-center gap-x-2">
          <Link href="/" className={`py-1.5 px-4 rounded-full text-sm font-medium transition-colors duration-300 ${pathname === '/' ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white'}`}>
            Home
          </Link>
          <Link href="/about" className={`py-1.5 px-4 rounded-full text-sm font-medium transition-colors duration-300 ${pathname === '/about' ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white'}`}>
            About
          </Link>
          <Link href="/team" className={`py-1.5 px-4 rounded-full text-sm font-medium transition-colors duration-300 ${pathname === '/team' ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white'}`}>
            Team
          </Link>
        </div>
        <Link href="/login" className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition duration-300 text-sm">
          Login
        </Link>
      </motion.nav>
    </div>
  );
};

export default Navbar;
