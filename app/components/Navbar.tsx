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
  
  const handleNotificationAction = async (notificationId: string, action: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`/api/notifications/${notificationId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        if (user) {
          setUser({
            ...user,
            notifications: user.notifications.filter(n => n.id !== notificationId)
          });
        }
      }
    } catch (error) {
      console.error('Failed to handle notification action', error);
    }
  };
  
  const unreadNotificationsCount = user?.notifications?.filter(n => !n.read)?.length || 0;
  const paginatedNotifications = user?.notifications?.slice(notificationPage * 5, (notificationPage * 5) + 5) || [];
  const totalPages = Math.ceil((user?.notifications?.length || 0) / 5);

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
          <div className="relative mr-2">
            <button 
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                setNotificationPage(0);
              }}
              className="relative p-2 text-gray-300 hover:text-white transition-colors duration-300"
              onMouseEnter={() => setActivePath('')}
            >
              <FiBell size={20} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-80 bg-white/5 border border-white/10 rounded-lg shadow-lg z-30"
                >
                  <div className="p-3 border-b border-white/10">
                    <h3 className="text-white font-medium">Notifications</h3>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto">
                    {paginatedNotifications.length > 0 ? (
                      paginatedNotifications.map((notification) => (
                        <div key={notification.id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm text-white">{notification.title}</p>
                              {notification.userid !== "0" && (
                                <p className="text-xs text-gray-400 mt-1">From user #{notification.userid}</p>
                              )}
                            </div>
                            <div className="flex gap-x-2">
                              {notification.type === 'friend_request' ? (
                                <>
                                  <button 
                                    onClick={() => handleNotificationAction(notification.id, 'accept')} 
                                    className="p-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-500 rounded-full transition-colors"
                                  >
                                    <FiCheck size={14} />
                                  </button>
                                  <button 
                                    onClick={() => handleNotificationAction(notification.id, 'reject')}
                                    className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-500 rounded-full transition-colors"
                                  >
                                    <FiX size={14} />
                                  </button>
                                </>
                              ) : (
                                <button 
                                  onClick={() => handleNotificationAction(notification.id, 'dismiss')}
                                  className="p-1.5 bg-gray-600/20 hover:bg-gray-600/40 text-gray-400 rounded-full transition-colors"
                                >
                                  <FiX size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        No notifications
                      </div>
                    )}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="p-2 border-t border-white/10 flex justify-between items-center">
                      <button 
                        onClick={() => setNotificationPage(Math.max(0, notificationPage - 1))}
                        disabled={notificationPage === 0}
                        className={`px-3 py-1 rounded text-sm ${notificationPage === 0 ? 'text-gray-500' : 'text-white hover:bg-white/10'}`}
                      >
                        Prev
                      </button>
                      <span className="text-xs text-gray-400">
                        Page {notificationPage + 1} of {totalPages}
                      </span>
                      <button 
                        onClick={() => setNotificationPage(Math.min(totalPages - 1, notificationPage + 1))}
                        disabled={notificationPage === totalPages - 1}
                        className={`px-3 py-1 rounded text-sm ${notificationPage === totalPages - 1 ? 'text-gray-500' : 'text-white hover:bg-white/10'}`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
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
          ))}
        </div>
        {renderAuthSection()}
      </nav>
    </div>
  );
};

export default Navbar;
