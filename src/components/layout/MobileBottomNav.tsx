import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, User, FolderGit2, Mail, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// A mobile bottom navigation bar styled with glass / frosted look
const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: User },
  { to: '/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/contact', label: 'Contact', icon: Mail }
];

const blogItem = { to: '/blog', label: 'Blog', icon: BookOpen };

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
        <div className="relative max-w-xl mx-auto flex items-end justify-center gap-4">
          {/* Main pill menu */}
          <div className="relative flex-1 max-w-[520px]">
            <div className="absolute inset-0 rounded-[2rem] bg-black/35 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.75)]" />
            <ul className="relative flex items-stretch px-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = location.pathname === item.to;
                return (
                  <li key={item.to} className="flex-1">
                    <NavLink
                      to={item.to}
                      aria-label={item.label}
                      className={({ isActive }) =>
                        `group relative block w-full ` +
                        (isActive ? 'text-azure-300' : 'text-white/70 hover:text-white')
                      }
                    >
                      {/* Fixed-size touch target container (>= 48px height). */}
                      <div
                        className={
                          'relative w-full h-14 min-h-[56px] flex items-center justify-center ' +
                          'px-2 min-[360px]:px-3 min-[390px]:px-4'
                        }
                      >
                        {/* Active indicator layer (sized to full tab area, not icon). */}
                        {active && (
                          <motion.span
                            layoutId="mobile-nav-active"
                            className="absolute inset-1 rounded-[1.4rem] bg-white/10 border border-white/15"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}

                        {/* Content layer */}
                        <div className="relative z-10 flex flex-col items-center justify-center">
                          <Icon size={20} className="mb-0.5" />
                          <span className="text-[11px] font-medium leading-none tracking-wide">
                            {item.label}
                          </span>
                        </div>
                      </div>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Blog: standalone button */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-black/35 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.75)]" />
            <NavLink
              to={blogItem.to}
              aria-label={blogItem.label}
              className={({ isActive }) =>
                `relative w-16 h-16 min-h-[56px] rounded-full flex items-center justify-center transition-colors ` +
                (isActive
                  ? 'text-azure-300'
                  : 'text-white/75 hover:text-white')
              }
            >
              {location.pathname === blogItem.to && (
                <motion.span
                  layoutId="mobile-nav-blog-active"
                  className="absolute inset-2 rounded-full bg-azure-500/15 border border-azure-300/25"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <blogItem.icon size={22} className="relative" />
            </NavLink>
          </div>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
};

export default MobileBottomNav;
