"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { FiHome, FiInfo, FiUsers, FiLogIn, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface User {
  id: string;
  username: string;
  email: string;
  profile_picture: string;
}

const baseNavLinks = [
  { href: '/', label: 'Home', icon: <FiHome size={18} /> },
  { href: '/about', label: 'About', icon: <FiInfo size={18} /> },
  { href: '/team', label: 'Team', icon: <FiUsers size={18} /> },
];

const Navbar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePath, setActivePath] = useState(pathname);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const fetchUserData = async () => {
        try {
          const res = await fetch('/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsDropdownOpen(false);
  };

  const navLinks = [...baseNavLinks];
  if (!loading && !user) {
    navLinks.push({ href: '/login', label: 'Login', icon: <FiLogIn size={18} /> });
  }

  const renderAuthSection = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-x-2 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-white/10"></div>
          <div className="h-4 w-20 rounded bg-white/10"></div>
        </div>
      );
    }

    if (user) {
      return (
        <div
          className="relative"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <div className="flex items-center gap-x-3 p-1.5 rounded-full transition-colors duration-300 cursor-pointer">
            <Image
              src={user.profile_picture}
              alt={user.username}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-white font-medium text-base hidden sm:block">{user.username}</span>
            <FiChevronDown size={20} className={`text-gray-300 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-lg z-20"
              >
                <ul className="py-1">
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-x-3 px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                    >
                      <FiLogOut />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed top-[30px] w-full flex justify-center z-50 px-4">
      <motion.nav
        className="w-full max-w-[1000px] h-[75px] flex items-center justify-between rounded-full bg-white/5 backdrop-blur-lg px-6"
        initial={{ y: -150, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div
          className="flex items-center gap-x-2"
          onMouseLeave={() => setActivePath(pathname)}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => setActivePath(link.href)}
              className={`relative flex items-center gap-x-2 py-2 px-4 rounded-full text-base font-medium transition-colors duration-300 ${
                activePath === link.href ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              {activePath === link.href && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-blue-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">{link.icon}</span>
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </div>
        {renderAuthSection()}
      </motion.nav>
    </div>
  );
};

export default Navbar;
