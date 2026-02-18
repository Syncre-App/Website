"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, MouseEvent } from 'react';
import { useAuth } from '../../lib/AuthProvider';

const navLinks = [
  { href: '/', label: 'Overview' },
  { href: '/#features', label: 'Features' },
  { href: '/#app', label: 'App' },
];

const sectionLinks = navLinks.filter((link) => link.href.startsWith('/#'));

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token } = useAuth();
  const isLoggedIn = !!token && !!user;
  const isAppPage = pathname?.startsWith('/app');
  
  const [activePath, setActivePath] = useState(pathname || '/');
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isScrolling) return;
    const handleScroll = () => {
      const offset = window.scrollY + 140;
      let current = '/';
      sectionLinks.forEach((link) => {
        const id = link.href.split('#')[1];
        const el = document.getElementById(id);
        if (el && offset >= el.offsetTop) {
          current = link.href;
        }
      });
      setActivePath((prev) => (prev.startsWith('/#') || prev === '/' ? current : prev));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolling]);

  useEffect(() => {
    if (isScrolling) return;
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const hashHref = '/' + hash;
        if (sectionLinks.some((link) => link.href === hashHref)) {
          setActivePath(hashHref);
          return;
        }
      }
    }
    if (!sectionLinks.some((link) => link.href === pathname)) {
      setActivePath(pathname || '/');
    }
  }, [pathname, isScrolling]);

  const handleSectionClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.split('#')[1];
    const el = document.getElementById(id);
    if (!el) return;
    try {
      window.history.pushState(null, '', href);
    } catch {}
    setIsScrolling(true);
    setActivePath(href);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 700);
  };

  const handleHomeClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      window.history.pushState(null, '', '/');
    } catch {}
    setIsScrolling(true);
    setActivePath('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 700);
  };

  // fast smooth scroll-to-top helper
  const scrollToTopSmoothFast = () =>
    new Promise<void>((resolve) => {
      if (typeof window === 'undefined') return resolve();
      const start = Date.now();
      const maxMs = 500;
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {}
      const check = () => {
        // consider "close enough" to top or timeout as finished
        if (window.scrollY <= 8 || Date.now() - start >= maxMs) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    });

  const centerLinks = navLinks.filter((l) => l.href !== '/chat');

  const renderNavLink = (link: { href: string; label: string }) => {
    const isSectionLink = link.href.startsWith('/#');
    const isHome = link.href === '/';
    return (
      <Link
        key={link.href}
        href={link.href}
        scroll={false}
        onClick={
          isSectionLink
            ? (e) => handleSectionClick(e as MouseEvent<HTMLAnchorElement>, link.href)
            : isHome
            ? handleHomeClick
            : undefined
        }
        className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${
          activePath === link.href ? 'text-white' : 'text-gray-300 hover:text-white'
        }`}
      >
        {activePath === link.href && (
          <motion.div
            layoutId="active-nav-pill"
            className="absolute inset-0 bg-white/15 rounded-full"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        <span className="relative z-10">{link.label}</span>
      </Link>
    );
  };

  // App page navbar (fixed top, black background)
  if (isAppPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/app" className="flex items-center">
              <span className="text-xl font-bold text-white">Syncre</span>
            </Link>

            {/* Right side - Profile or Login */}
            <div className="flex items-center">
              {isLoggedIn ? (
                <Link 
                  href="/app/profile" 
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="relative">
                    <img
                      src={user?.profile_picture || '/default-avatar.svg'}
                      alt={user?.username || 'Profile'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
                  </div>
                </Link>
              ) : (
                <Link 
                  href="/app"
                  className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-white/90 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Landing page navbar (floating, glass effect)
  return (
    <div className="fixed top-6 w-full flex justify-center z-50 px-4">
      <nav className="relative w-full max-w-[1100px] min-h-[72px] flex items-center rounded-full bg-white/5 backdrop-blur-2xl px-6 border border-white/10 shadow-[0_10px_60px_rgba(15,15,20,0.45)]">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">Syncre</Link>

        {/* center links */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-x-1 flex-wrap justify-center">
          {centerLinks.map((link) => renderNavLink(link))}
        </div>

        {/* Right side - Login button or App link */}
        <div className="absolute right-6 flex items-center">
          {isLoggedIn ? (
            <Link 
              href="/app"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Open App
            </Link>
          ) : (
            <Link 
              href="/app"
              className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
