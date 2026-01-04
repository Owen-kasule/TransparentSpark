import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, User, FolderGit2, Mail, BookOpen } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// A mobile bottom navigation bar styled with glass / frosted look
const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: User },
  { to: '/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/contact', label: 'Contact', icon: Mail }
];

const blogItem = { to: '/blog', label: 'Blog', icon: BookOpen };

const collapseThresholdPx = 8;

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const rafRef = useRef<number | null>(null);

  const isBlogPage = location.pathname === blogItem.to;
  const isBlogPostPage = location.pathname.startsWith(`${blogItem.to}/`) && !isBlogPage;

  const activeMainItem = useMemo(() => {
    const pathname = location.pathname;

    const exact = navItems.find((item) => item.to !== '/' && pathname === item.to);
    if (exact) return exact;

    const nested = navItems.find(
      (item) => item.to !== '/' && (pathname === item.to || pathname.startsWith(`${item.to}/`))
    );
    if (nested) return nested;

    return navItems[0];
  }, [location.pathname]);

  const activeMainIndex = useMemo(() => {
    const pathname = location.pathname;
    const exactIndex = navItems.findIndex((item) => item.to !== '/' && pathname === item.to);
    if (exactIndex >= 0) return exactIndex;

    const nestedIndex = navItems.findIndex(
      (item) => item.to !== '/' && (pathname === item.to || pathname.startsWith(`${item.to}/`))
    );
    if (nestedIndex >= 0) return nestedIndex;

    return 0;
  }, [location.pathname]);

  const leftCollapsedItem = useMemo(() => {
    if (isBlogPostPage) return null;
    if (isBlogPage) return blogItem;
    return activeMainItem;
  }, [activeMainItem, isBlogPage, isBlogPostPage]);

  const rightCollapsedItem = useMemo(() => {
    if (isBlogPostPage) return blogItem;
    if (isBlogPage) return navItems[0];
    return blogItem;
  }, [isBlogPage, isBlogPostPage]);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current != null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;

        const y = window.scrollY;
        if (y === 0) {
          setCollapsed(false);
          return;
        }

        if (y > collapseThresholdPx) {
          setCollapsed(true);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const handleActiveTapExpand = (e: React.MouseEvent) => {
    if (!collapsed) return;
    e.preventDefault();
    setCollapsed(false);
  };

  return (
    <AnimatePresence>
      <>
        {/* Bottom nav: mobile + tablet (hidden on desktop) */}
        <motion.nav
          key="mobile-bottom-nav"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{ x: '-50%' }}
          className="mobile-bottom-nav fixed left-1/2 bottom-0 z-50 w-full max-w-[100vw] box-border overflow-x-hidden pt-2 pb-0 lg:hidden"
          aria-label="Primary navigation"
        >
          <LayoutGroup id="mobile-bottom-nav">
            {/* Inner content frame: centered, constrained width. */}
            <div className="w-full max-w-xl mx-auto">
              {/* All horizontal padding lives inside this frame. */}
              <div className="px-3 min-[360px]:px-4 box-border">
                <div
                  className={
                    'relative flex items-end w-full gap-3 ' +
                    (collapsed
                      ? leftCollapsedItem
                        ? 'justify-between'
                        : 'justify-end'
                      : 'justify-center')
                  }
                >
                  {/* Main pill menu */}
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 350, damping: 32 }}
                    className={
                      'relative min-w-0 overflow-hidden ' +
                      (collapsed
                        ? leftCollapsedItem
                          ? 'shrink-0 w-[72px]'
                          : 'hidden'
                        : 'flex-1 max-w-[520px]')
                    }
                  >
                    <div className="absolute inset-0 rounded-[2rem] bg-black/35 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.75)]" />

                    {!collapsed && (
                      <ul className="relative flex items-stretch px-2">
                        {/* Sliding active indicator for main tabs (GitHub-style). */}
                        {!isBlogPage && !isBlogPostPage && (
                          <motion.span
                            className="absolute top-[2px] bottom-[2px] left-2 rounded-[1.5rem] bg-azure-500/10 border border-azure-300/25 shadow-[0_0_0_1px_rgba(14,165,233,0.08)]"
                            style={{ width: `calc((100% - 16px) / ${navItems.length})` }}
                            animate={{ x: `${activeMainIndex * 100}%` }}
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          />
                        )}
                        {navItems.map((item) => {
                          const Icon = item.icon;
                          const active = !isBlogPage && !isBlogPostPage && activeMainItem.to === item.to;
                          return (
                            <li key={item.to} className="flex-1 min-w-0">
                              <NavLink
                                to={item.to}
                                aria-label={item.label}
                                className={() =>
                                  'group relative block w-full transition-colors ' +
                                  (active ? 'text-white' : 'text-white/75 hover:text-white')
                                }
                              >
                                {/* Fixed-size touch target container (>= 48px height). */}
                                <div className="relative w-full h-14 min-h-[56px] flex items-center justify-center">
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
                    )}

                    {collapsed && leftCollapsedItem && (
                      <div className="relative flex items-stretch px-2">
                        <NavLink
                          to={leftCollapsedItem.to}
                          aria-label={leftCollapsedItem.label}
                          onClick={handleActiveTapExpand}
                          className={() =>
                            'group relative block w-full text-white/85 hover:text-white transition-colors'
                          }
                        >
                          <div className="relative w-full h-14 min-h-[56px] flex items-center justify-center">
                            <motion.span
                              layoutId="mobile-nav-active"
                              className="absolute inset-[2px] rounded-[1.5rem] bg-azure-500/10 border border-azure-300/25 shadow-[0_0_0_1px_rgba(14,165,233,0.08)]"
                              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            />
                            <div className="relative z-10">
                              <leftCollapsedItem.icon size={22} className="relative" />
                            </div>
                          </div>
                        </NavLink>
                      </div>
                    )}
                  </motion.div>

                  {/* Right standalone button (Blog/Home depending on state) */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-full bg-black/35 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.75)]" />
                    <NavLink
                      to={collapsed ? rightCollapsedItem.to : blogItem.to}
                      aria-label={collapsed ? rightCollapsedItem.label : blogItem.label}
                      className={({ isActive }) =>
                        `relative w-14 h-14 min-[390px]:w-16 min-[390px]:h-16 min-h-[56px] rounded-full flex items-center justify-center transition-colors ` +
                        (isActive || (collapsed && isBlogPostPage)
                          ? 'text-azure-300'
                          : 'text-white/75 hover:text-white')
                      }
                    >
                      {((!collapsed && (isBlogPage || isBlogPostPage)) || (collapsed && isBlogPostPage)) && (
                        <motion.span
                          layoutId="mobile-nav-active"
                          className="absolute inset-[6px] rounded-full bg-azure-500/15 border border-azure-300/25"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      {collapsed ? (
                        <rightCollapsedItem.icon size={22} className="relative" />
                      ) : (
                        <blogItem.icon size={22} className="relative" />
                      )}
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </LayoutGroup>
        </motion.nav>
      </>
    </AnimatePresence>
  );
};

export default MobileBottomNav;
