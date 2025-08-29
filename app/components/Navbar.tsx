"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { FiHome, FiInfo, FiDownload, FiLogIn, FiChevronDown, FiLogOut, FiSettings, FiUser, FiMessageSquare } from 'react-icons/fi';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Image from 'next/image';

interface User {
  id: string;
  username: string;
  email: string;
  profile_picture: string;
}

const navLinks = [
  { href: '/', label: 'Home', icon: <FiHome size={18} /> },
  { href: '/#about', label: 'About', icon: <FiInfo size={18} /> },
  { href: '/#download', label: 'Download', icon: <FiDownload size={18} /> },
];

const Navbar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePath, setActivePath] = useState(pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // --- Scrollspy logic for section highlighting ---
  useEffect(() => {
    if (isScrolling) return;
    const handleScroll = () => {
      const scrollY = window.scrollY + 120; // vissza az eredeti, nem a viewport közepét
      const home = document.getElementById('home');
      const about = document.getElementById('about');
      const download = document.getElementById('download');
      let current = '/';
      if (home && about && download) {
        if (scrollY >= download.offsetTop) {
          current = '/#download';
        } else if (scrollY >= about.offsetTop) {
          current = '/#about';
        } else {
          current = '/';
        }
      }
      setActivePath(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolling]);

  useEffect(() => {
    // Csak akkor állítsd át activePath-et pathname-re, ha NEM szekciót nézel ("/", "/#about", "/#download") és nem scrollozol!
    if (!isScrolling && !navLinks.some(link => link.href === pathname)) {
      setActivePath(pathname);
    }
  }, [pathname, isScrolling]);

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

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const links = Array.from(containerRef.current.querySelectorAll("a"));
    const idx = navLinks.findIndex(link => link.href === activePath);
    if (idx !== -1 && links[idx]) {
      const rect = (links[idx] as HTMLElement).getBoundingClientRect();
      const parentRect = containerRef.current.getBoundingClientRect();
      setIndicatorStyle({
        left: rect.left - parentRect.left,
        width: rect.width,
      });
    }
  }, [activePath, navLinks]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsDropdownOpen(false);
  };

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
        <div className="flex items-center gap-x-2">
          <Link
            href="/contacts"
            onMouseEnter={() => setActivePath('/contacts')}
            className={`relative flex items-center gap-x-2 py-2 px-4 rounded-full text-base font-medium transition-colors duration-300 ${activePath === '/contacts' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
          >
            {activePath === '/contacts' && (
              <motion.div
                layoutId="active-nav-pill"
                className="absolute inset-0 bg-blue-600 rounded-full"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10"><FiMessageSquare size={18} /></span>
            <span className={`relative z-10 ${activePath === '/contacts' ? 'inline' : 'hidden'} md:inline`}>Chats</span>
          </Link>
          <div
            className="relative"
            onMouseEnter={() => {
              setActivePath('');
              setIsDropdownOpen(true);
            }}
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
                  className="absolute top-full right-0 mt-2 w-48 bg-white/5 border border-white/10 rounded-lg shadow-lg z-20"
                >
                  <ul className="py-1">
                    <li>
                      <Link
                        href="/settings"
                        className="w-full flex items-center gap-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors duration-300"
                      >
                        <FiSettings />
                        <span>Settings</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/profile"
                        className="w-full flex items-center gap-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors duration-300"
                      >
                        <FiUser />
                        <span>Profile</span>
                      </Link>
                    </li>
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
        </div>
      );
    }

    return (
      <Link
        href="/login"
        onMouseEnter={() => setActivePath('/login')}
        className={`relative flex items-center gap-x-2 py-2 px-4 rounded-full text-base font-medium transition-colors duration-300 ${activePath === '/login' ? 'text-white' : 'text-gray-300 hover:text-white'
          }`}
      >
        {activePath === '/login' && (
          <motion.div
            layoutId="active-nav-pill"
            className="absolute inset-0 bg-blue-600 rounded-full"
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
        )}
        <span className="relative z-10"><FiLogIn size={18} /></span>
        <span className="relative z-10">Login</span>
      </Link>
    );
  };

  return (
    <div className="fixed top-[30px] w-full flex justify-center z-50 px-4">
      <nav
        className="w-full max-w-[1000px] h-[75px] flex items-center justify-between rounded-full bg-white/5 backdrop-blur-lg px-6"
      >
        <div className="flex items-center gap-x-2" ref={containerRef}>
          {navLinks.map((link) => {
            const isSectionLink = link.href.startsWith('/#');
            const isHome = link.href === '/';
            return (
              <Link
                key={link.href}
                href={link.href}
                scroll={false}
                onClick={
                  isSectionLink
                    ? (e) => {
                        e.preventDefault();
                        const id = link.href.split('#')[1];
                        const el = document.getElementById(id);
                        if (el) {
                          setIsScrolling(true);
                          setActivePath(link.href);
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
                          scrollTimeout.current = setTimeout(() => {
                            setIsScrolling(false);
                          }, 700);
                        }
                      }
                    : isHome
                    ? (e) => {
                        e.preventDefault();
                        setIsScrolling(true);
                        setActivePath('/');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
                        scrollTimeout.current = setTimeout(() => {
                          setIsScrolling(false);
                        }, 700);
                      }
                    : undefined
                }
                className={`relative flex items-center gap-x-2 py-2 px-4 rounded-full text-base font-medium transition-colors duration-300 ${
                  activePath === link.href ? 'text-white' : 'text-gray-300'
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
                <span className={`relative z-10 ${activePath === link.href ? 'inline' : 'hidden'} md:inline`}>{link.label}</span>
              </Link>
            );
          })}
        </div>
        {renderAuthSection()}
      </nav>
    </div>
  );
};

export default Navbar;
