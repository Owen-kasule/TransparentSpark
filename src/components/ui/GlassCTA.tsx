import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface GlassCTAProps {
  delay?: number;
}

const GlassCTA: React.FC<GlassCTAProps> = ({ delay = 0 }) => {
  const handleConnectClick = () => {
    window.location.href = '/contact';
  };

  const handleResumeClick = () => {
    window.location.href = '/resume';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative max-w-md"
    >
      {/* GitHub-style Pill Container */}
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-full overflow-hidden shadow-lg">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-azure-400/5 via-white/5 to-azure-600/5"></div>
        
        {/* Content - Two Balanced Buttons */}
    <div className="relative z-10 flex items-stretch">
          {/* Primary CTA - Let's Connect */}
          <motion.button
            onClick={handleConnectClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-azure-500 hover:bg-azure-600 text-white px-5 xs:px-6 py-2.5 md:py-3 font-medium transition-all duration-300 rounded-l-full whitespace-nowrap md:whitespace-normal text-[13px] xs:text-sm md:text-base lg:text-lg"
          >
      <span className="block">Let's Connect</span>
          </motion.button>

          {/* Secondary CTA - View My Resume */}
          <motion.button
            onClick={handleResumeClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex-1 bg-white/10 hover:bg-white/15 text-white/90 hover:text-white px-5 xs:px-6 py-2.5 md:py-3 font-medium transition-all duration-300 rounded-r-full flex items-center justify-center space-x-2 border-l border-white/20 whitespace-nowrap md:whitespace-normal text-[13px] xs:text-sm md:text-base lg:text-lg"
          >
      <span className="hidden sm:block">View My Resume</span>
      <span className="block sm:hidden">Resume</span>
            <ArrowRight size={14} className="opacity-60 group-hover:opacity-90 transition-opacity hidden sm:inline" />
          </motion.button>
        </div>
      </div>
      
      {/* Subtle Shadow */}
      <div className="absolute inset-0 bg-black/10 rounded-full blur-xl transform translate-y-1 -z-10"></div>
    </motion.div>
  );
};

export default GlassCTA;
