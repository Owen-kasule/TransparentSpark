import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  const mainNavItems = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT', path: '/about' },
    { name: 'PROJECTS', path: '/projects' },
    { name: 'CONTACT', path: '/contact' }
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          // Scrolling down
          setIsVisible(false);
        } else {
          // Scrolling up
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 hidden lg:block"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Reduced gradient blur background that doesn't extend too far down */}
      <div className="absolute inset-0 h-20 bg-gradient-to-b from-black/60 via-black/40 to-transparent backdrop-blur-xl"></div>
      
      <motion.div 
        className="relative px-6 py-4"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white mr-12">
            <span className="bg-gradient-to-r from-azure-400 to-azure-600 bg-clip-text text-transparent">
              O
            </span>
          </Link>

          {/* Desktop Navigation - Left aligned main items */}
          <nav className="hidden md:flex items-center justify-between w-full">
            <div className="flex space-x-8">
              {mainNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
                    isActive(item.path) 
                      ? 'text-azure-400 border border-azure-400/50 bg-azure-400/10' 
                      : 'text-white/80 hover:text-azure-400 hover:border hover:border-azure-400/30 hover:bg-azure-400/5'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Blog link isolated on the right */}
            <Link
              to="/blog"
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg border ${
                isActive('/blog') 
                  ? 'text-azure-400 border-azure-400/50 bg-azure-400/10' 
                  : 'text-white/80 border-white/20 hover:text-azure-400 hover:border-azure-400/50 hover:bg-azure-400/5'
              }`}
            >
              BLOG
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 hover:text-azure-400 transition-colors duration-300"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-white/20 max-w-7xl mx-auto"
            >
              {[...mainNavItems, { name: 'BLOG', path: '/blog' }].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-3 px-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                    isActive(item.path) 
                      ? 'text-azure-400 bg-azure-400/10' 
                      : 'text-white/80 hover:text-azure-400 hover:bg-azure-400/5'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.header>
  );
};

export default Header;