"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, MouseEvent, useLayoutEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Overview' },
  { href: '/#features', label: 'Features' },
  { href: '/#app', label: 'App' },
  { href: '/#team', label: 'Team' },
  // { href: '/chat', label: 'Web chat' },
];

const sectionLinks = navLinks.filter((link) => link.href.startsWith('/#'));

const Navbar = () => {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname || '/');
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const linksContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [indicator, setIndicator] = useState<{ width: number; left: number } | null>(null);

  const updateIndicatorPosition = () => {
    const container = linksContainerRef.current;
    if (!container) {
      setIndicator(null);
      return;
    }
    const activeEl = linkRefs.current[activePath];
    if (!activeEl) {
      setIndicator(null);
      return;
    }
    setIndicator({
      width: activeEl.offsetWidth,
      left: activeEl.offsetLeft,
    });
  };

  useLayoutEffect(() => {
    updateIndicatorPosition();
    window.addEventListener('resize', updateIndicatorPosition);
    return () => window.removeEventListener('resize', updateIndicatorPosition);
  }, [activePath]);

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
        <div
          ref={linksContainerRef}
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-x-1 flex-wrap justify-center relative"
        >
          {indicator && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 h-10 rounded-full bg-white/15 pointer-events-none"
              initial={false}
              animate={{ left: indicator.left, width: indicator.width }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          {navLinks.map((link) => {
            const isSectionLink = link.href.startsWith('/#');
            const isHome = link.href === '/';
            const isActive = activePath === link.href;
            return (
              <div
                key={link.href}
                ref={(el) => {
                  if (el) {
                    linkRefs.current[link.href] = el;
                  } else {
                    delete linkRefs.current[link.href];
                  }
                }}
                className="relative"
              >
                <Link
                  href={link.href}
                  scroll={false}
                  onClick={
                    isSectionLink
                      ? (e) => handleSectionClick(e, link.href)
                      : isHome
                      ? handleHomeClick
                      : undefined
                  }
                  className={`block px-4 py-2 text-sm font-medium rounded-full transition-colors relative z-10 ${
                    isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
