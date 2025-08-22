import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, User, FolderGit2, Mail, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// A mobile bottom navigation bar styled with glass / frosted look
const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: User },
  { to: '/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/contact', label: 'Contact', icon: Mail },
  { to: '/blog', label: 'Blog', icon: BookOpen }
];

const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence>
      <motion.nav
        key="mobile-bottom-nav"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2"
        aria-label="Primary navigation"
      >
        <div className="relative max-w-xl mx-auto">
          {/* Backdrop / glass layer */}
          <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-lg border border-white/10 shadow-[0_4px_30px_-5px_rgba(0,0,0,0.6)]" />
          <ul className="relative flex justify-between items-stretch">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <li key={item.to} className="flex-1">
                  <NavLink
                    to={item.to}
                    aria-label={item.label}
                    className={({ isActive }) => `group flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                      isActive ? 'text-azure-300' : 'text-white/55 hover:text-white'
                    }`}
                  >
                    <div className="relative h-6 flex items-center justify-center">
                      {active && (
                        <motion.span
                          layoutId="mobile-nav-pill"
                          className="absolute inset-0 -left-2 -right-2 rounded-full bg-azure-500/15 border border-azure-300/20"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <Icon size={18} className="relative" />
                    </div>
                    <span className="relative leading-none tracking-wide">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
};

export default MobileBottomNav;
