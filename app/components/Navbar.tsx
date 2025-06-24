"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { FiHome, FiInfo, FiUsers, FiLogIn } from 'react-icons/fi';

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
        <div className="flex items-center gap-x-4">
          <Link href="/" className={`flex items-center gap-x-2 py-2 px-4 rounded-full text-base font-medium transition-colors duration-300 ${pathname === '/' ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white'}`}>
            <FiHome size={18} />
            <span>Home</span>
          </Link>
          <Link href="/about" className={`flex items-center gap-x-2 py-2 px-4 rounded-full text-base font-medium transition-colors duration-300 ${pathname === '/about' ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white'}`}>
            <FiInfo size={18} />
            <span>About</span>
          </Link>
          <Link href="/team" className={`flex items-center gap-x-2 py-2 px-4 rounded-full text-base font-medium transition-colors duration-300 ${pathname === '/team' ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white'}`}>
            <FiUsers size={18} />
            <span>Team</span>
          </Link>
        </div>
        <Link href="/login" className="flex items-center gap-x-2 py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition duration-300 text-base">
          <FiLogIn size={18} />
          <span>Login</span>
        </Link>
      </motion.nav>
    </div>
  );
};

export default Navbar;
