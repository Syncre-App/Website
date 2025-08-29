"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { FiHome, FiInfo, FiUsers, FiLogIn, FiChevronDown, FiLogOut, FiSettings, FiUser, FiMessageSquare, FiBell, FiX, FiCheck } from 'react-icons/fi';
import { useState, useEffect } from 'react';
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
  { href: '/about', label: 'About', icon: <FiInfo size={18} /> },
  { href: '/team', label: 'Team', icon: <FiUsers size={18} /> },
];

const Navbar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activePath, setActivePath] = useState(pathname);
  const [notificationPage, setNotificationPage] = useState(0);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const unreadNotificationsCount = user?.notifications?.filter(n => !n.read)?.length || 0;
  const paginatedNotifications = user?.notifications?.slice(notificationPage * 5, (notificationPage * 5) + 5) || [];
  const totalPages = Math.ceil((user?.notifications?.length || 0) / 5);

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
      <div className="w-full max-w-[1200px] flex items-center gap-x-8">
        <nav
          className="flex-1 max-w-[calc(100%-140px)] h-[75px] flex items-center justify-between rounded-full bg-white/5 backdrop-blur-lg px-6"
          onMouseLeave={() => setActivePath(pathname)}
        >
          <div className="flex items-center gap-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setActivePath(link.href)}
                className={`relative flex items-center gap-x-2 py-2 px-4 rounded-full text-base font-medium transition-colors duration-300 ${activePath === link.href ? 'text-white' : 'text-gray-300 hover:text-white'
                  }`}
              >
                {(activePath === link.href) && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-blue-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{link.icon}</span>
                <span className={`relative z-10 ${activePath === link.href ? 'inline' : 'hidden'} md:inline`}>{link.label}</span>
              </Link>
            ))}
          </div>
          {renderAuthSection()}
        </nav>
  <div className="flex-shrink-0"></div>
      </div>
    </div>
  );
};

export default Navbar;
