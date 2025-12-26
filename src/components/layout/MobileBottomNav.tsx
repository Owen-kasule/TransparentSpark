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
        style={{ x: '-50%' }}
        className="fixed left-1/2 bottom-[env(safe-area-inset-bottom)] z-50 md:hidden w-full max-w-[100vw] box-border overflow-x-hidden pt-2 pb-[env(safe-area-inset-bottom)]"
        aria-label="Primary navigation"
      >
        {/* Inner content frame: centered, constrained width. */}
        <div className="w-full max-w-xl mx-auto">
          {/* All horizontal padding lives inside this frame. */}
          <div className="px-3 min-[360px]:px-4 box-border">
            <div className="relative flex items-end justify-center gap-3">
              {/* Main pill menu */}
              <div className="relative flex-1 min-w-0 max-w-[520px] overflow-hidden">
                <div className="absolute inset-0 rounded-[2rem] bg-black/35 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.75)]" />
                <ul className="relative flex items-stretch px-2">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const active = location.pathname === item.to;
                    return (
                      <li key={item.to} className="flex-1 min-w-0">
                        <NavLink
                          to={item.to}
                          aria-label={item.label}
                          className={() =>
                            'group relative block w-full text-white/75 hover:text-white transition-colors'
                          }
                        >
                          {/* Fixed-size touch target container (>= 48px height). */}
                          <div className="relative w-full h-14 min-h-[56px] flex items-center justify-center">
                            {/* Active indicator layer (sized to full tab area, not icon). */}
                            {active && (
                              <motion.span
                                layoutId="mobile-nav-active"
                                className="absolute inset-[2px] rounded-[1.5rem] bg-azure-500/10 border border-azure-300/25 shadow-[0_0_0_1px_rgba(14,165,233,0.08)]"
                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                              />
                            )}

                            {/* Content layer */}
                            <div className="relative z-10">
                              {/*
                                Inner content wrapper adds a visual buffer zone.
                                Padding scales with viewport width (content shrinks inward on small screens).
                              */}
                              <div className="flex flex-col items-center justify-center px-1.5 min-[360px]:px-2.5 min-[390px]:px-3 py-1.5">
                                <Icon className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 mb-0.5" />
                                <span className="text-[10px] min-[360px]:text-[11px] font-medium leading-none tracking-wide">
                                  {item.label}
                                </span>
                              </div>
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
                    `relative w-14 h-14 min-[390px]:w-16 min-[390px]:h-16 min-h-[56px] rounded-full flex items-center justify-center transition-colors ` +
                    (isActive
                      ? 'text-azure-300'
                      : 'text-white/75 hover:text-white')
                  }
                >
                  {location.pathname === blogItem.to && (
                    <motion.span
                      layoutId="mobile-nav-blog-active"
                      className="absolute inset-[6px] rounded-full bg-azure-500/15 border border-azure-300/25"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <blogItem.icon size={22} className="relative" />
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
};

export default MobileBottomNav;
