import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [lastModified, setLastModified] = useState<Date | null>(null);

  useEffect(() => {
    // Get the last modified date from the document
    const getLastModified = () => {
      if (document.lastModified) {
        const modifiedDate = new Date(document.lastModified);
        // If the document.lastModified is not available or invalid, use build time
        if (modifiedDate.getTime() > 0) {
          setLastModified(modifiedDate);
        } else {
          // Fallback to a recent date if document.lastModified is not available
          setLastModified(new Date());
        }
      } else {
        setLastModified(new Date());
      }
    };

    getLastModified();
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative z-10 bg-black/20 backdrop-blur-sm mb-[calc(64px+env(safe-area-inset-bottom))] md:mb-[calc(64px+env(safe-area-inset-bottom))] lg:mb-0" /* reserve space equal to nav height on mobile+tablet */
    >
      <div className="container mx-auto px-6">
        {/* Contained border line */}
        <div className="border-t border-white/10"></div>
        
        <div className="py-4">
          <div className="flex flex-col md:flex-row justify-center items-center md:space-y-0 md:space-x-8">
            {/* Mobile layout */}
            <div className="flex flex-col items-center md:hidden space-y-1">
              {lastModified && (
                <span className="text-white/40 text-[10px] leading-tight">
                  Last modified: {formatDateTime(lastModified)}
                </span>
              )}
              <span className="font-medium text-xs text-white/60">TECHROOOT © {currentYear}</span>
            </div>
            {/* Desktop layout */}
            <div className="hidden md:flex items-center space-x-8 text-sm text-white/60">
              <span className="font-medium">TECHROOOT © {currentYear}</span>
              <Link 
                to="/contact" 
                className="hover:text-white/80 transition-colors duration-300"
              >
                CONTACT
              </Link>
              {lastModified && (
                <span className="text-white/40 text-xs">
                  Last modified: {formatDateTime(lastModified)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;