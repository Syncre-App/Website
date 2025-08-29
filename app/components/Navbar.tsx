"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { FiHome, FiInfo, FiUsers, FiLogIn, FiChevronDown, FiLogOut, FiSettings, FiUser, FiMessageSquare, FiBell, FiX, FiCheck, FiDownload } from 'react-icons/fi';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Image from 'next/image';

interface Notification {
  id: string;
  title: string;
  userid: string;
  type?: string;
  read?: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  profile_picture: string;
  notifications: Notification[];
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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationPage, setNotificationPage] = useState(0);
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

  const unreadNotificationsCount = user?.notifications?.filter(n => !n.read)?.length || 0;
  const paginatedNotifications = user?.notifications?.slice(notificationPage * 5, (notificationPage * 5) + 5) || [];
  const totalPages = Math.ceil((user?.notifications?.length || 0) / 5);

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
    localStorage.removeItem('user');
    setUser(null);
    setIsDropdownOpen(false);
  };

  // Chat UI removed — no remote or authenticated features

  // Auth UI removed: no Login/Logout/Notifications in navbar
  const renderAuthSection = () => null;

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
