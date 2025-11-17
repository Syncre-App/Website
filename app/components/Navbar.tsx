"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, MouseEvent } from 'react';

const navLinks = [
  { href: '/', label: 'Overview' },
  { href: '/#features', label: 'Features' },
  { href: '/#app', label: 'App' },
  { href: '/#team', label: 'Team' },
  { href: '/chat', label: 'Web chat' },
];

const sectionLinks = navLinks.filter((link) => link.href.startsWith('/#'));

const Navbar = () => {
  const pathname = usePathname();
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
    if (!sectionLinks.some((link) => link.href === pathname)) {
      setActivePath(pathname || '/');
    }
  }, [pathname, isScrolling]);

  const handleSectionClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.split('#')[1];
    const el = document.getElementById(id);
    if (!el) return;
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
    setIsScrolling(true);
    setActivePath('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 700);
  };

  return (
    <div className="fixed top-6 w-full flex justify-center z-50 px-4">
      <nav className="relative w-full max-w-[1100px] min-h-[72px] flex items-center rounded-full bg-white/5 backdrop-blur-2xl px-6 border border-white/10 shadow-[0_10px_60px_rgba(15,15,20,0.45)]">
        <div className="text-lg font-semibold tracking-tight text-white">Syncre</div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-x-1 flex-wrap justify-center">
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
                    ? (e) => handleSectionClick(e, link.href)
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
          })}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
