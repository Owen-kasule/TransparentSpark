import React, { useEffect } from 'react';
import ProgressiveImage from '../ui/ProgressiveImage';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { motion } from 'framer-motion';

const Layout: React.FC = () => {
  const location = useLocation();

  // Smooth scroll to top on route change with minimal movement
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    // Small delay to ensure smooth transition
    const timer = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Images */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 dark:opacity-100 opacity-0 transition-opacity duration-500">
          <ProgressiveImage 
            src="/hero-dark.jpg"
            alt="Dark background"
            wrapperClassName="w-full h-full"
            className="object-cover"
            initialBlur
            skeleton
            lazy={false}
          />
        </div>
        <div className="absolute inset-0 dark:opacity-0 opacity-100 transition-opacity duration-500">
          <ProgressiveImage 
            src="/hero-light.jpg"
            alt="Light background"
            wrapperClassName="w-full h-full"
            className="object-cover"
            initialBlur
            skeleton
            lazy={false}
          />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-1 pt-0"
        >
          <Outlet />
        </motion.main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;