import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Code, Database, Globe } from 'lucide-react';
import ProgressiveImage from '../components/ui/ProgressiveImage';
import GlassCard from '../components/ui/GlassCard';
import GlassCTA from '../components/ui/GlassCTA';
import SocialLinks from '../components/ui/SocialLinks';
import { projects } from '../data/portfolio';
import { useAnalytics } from '../hooks/useAnalytics';

const Home: React.FC = () => {
  const featuredProjects = projects.filter(project => project.featured).slice(0, 2);
  
  // Track page visit
  useAnalytics('home');

  return (
    <div className="min-h-screen relative pt-24">
      <div className="container mx-auto px-6">
        {/* Hero Section - Two Column Layout */}
        <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] relative">
          {/* Left Side - Social Links (positioned lower) */}
          <div className="hidden lg:block">
            <SocialLinks vertical className="fixed left-8 bottom-32 transform" />
          </div>

          {/* Main Content - Two Column Grid with Wider Left Column */}
          <div className="grid lg:grid-cols-5 gap-16 items-center max-w-7xl mx-auto w-full">
            
            {/* Left Column - Text Content in Wider Glass Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="hero-glass-container rounded-3xl p-8 lg:p-12 relative order-2 lg:order-1 min-h-[400px] lg:min-h-[450px] flex flex-col justify-center lg:col-span-3"
            >
              {/* Wavy Glass Effect Layers */}
              <div className="wavy-glass-effect"></div>
              <div className="glass-distortion"></div>
              
              {/* Content */}
              <div className="relative z-10 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <p className="text-azure-400 text-lg font-medium mb-6 tracking-wider">
                    HI I'M
                  </p>
                  
                  {/* Name with decorative line */}
                  <div className="relative mb-8">
                    <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4 leading-none">
                      OWEN
                    </h1>
                    {/* Decorative line */}
                    <div className="flex items-center justify-center lg:justify-start">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: 140 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="h-1 bg-azure-400"
                      ></motion.div>
                    </div>
                  </div>
                  
                  <p className="text-azure-400 text-xl font-medium tracking-wider mb-6">
                    A FULL STACK DEVELOPER
                  </p>
                </motion.div>

                {/* Introduction Text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="mb-6"
                >
                  <p className="text-white/90 text-lg leading-relaxed">
                    I craft digital experiences that blend beautiful design with powerful functionality. 
                    Specializing in modern web technologies, I build scalable applications that make a difference.
                  </p>
                </motion.div>

                {/* Skills Icons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="flex justify-center lg:justify-start space-x-8 mb-8"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="flex items-center space-x-2 text-white/70 hover:text-azure-400 transition-colors duration-300"
                  >
                    <Code size={20} />
                    <span className="text-sm font-medium">Frontend</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="flex items-center space-x-2 text-white/70 hover:text-azure-400 transition-colors duration-300"
                  >
                    <Database size={20} />
                    <span className="text-sm font-medium">Backend</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="flex items-center space-x-2 text-white/70 hover:text-azure-400 transition-colors duration-300"
                  >
                    <Globe size={20} />
                    <span className="text-sm font-medium">Full Stack</span>
                  </motion.div>
                </motion.div>

                {/* Glassmorphism CTA Component */}
                <div className="mb-6">
                  <GlassCTA delay={1.1} />
                </div>

                {/* Mobile Social Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                  className="lg:hidden"
                >
                  <SocialLinks />
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column - Owen's Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="relative order-1 lg:order-2 flex justify-center lg:justify-end lg:col-span-2"
            >
              {/* Image Container - Increased Height for more dominance */}
              <div className="relative w-96 h-[690px]">
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-azure-400/15 via-transparent to-azure-600/8 rounded-2xl blur-2xl transform scale-110"></div>
                
                {/* Owen's Image - Direct without glass container */}
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                >
                  <ProgressiveImage
                    src="/images/profile/OwenProfile.png"
                    alt="Owen - Full Stack Developer"
                    wrapperClassName="w-full h-full"
                    className="object-cover object-center"
                    aspectClass="w-full h-full"
                  />
                  
                  {/* Subtle Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                </motion.div>
                
                {/* Floating Elements - Adjusted for taller image */}
                <motion.div
                  animate={{ 
                    y: [0, -8, 0],
                    rotate: [0, 2, 0]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-3 -right-3 w-16 h-16 bg-azure-400/10 rounded-full backdrop-blur-sm border border-azure-400/20"
                ></motion.div>
                
                <motion.div
                  animate={{ 
                    y: [0, 6, 0],
                    rotate: [0, -3, 0]
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/5 rounded-full backdrop-blur-sm border border-white/10"
                ></motion.div>

                {/* Decorative Elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/4 -left-6 w-2 h-2 bg-azure-400 rounded-full opacity-60"
                ></motion.div>
                
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute bottom-1/3 -right-4 w-1 h-1 bg-white/60 rounded-full"
                ></motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Scroll Indicator (positioned lower) */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="fixed right-8 bottom-32 transform flex flex-col items-center"
            >
              <span className="text-white/60 text-sm mb-4 transform rotate-90 origin-center whitespace-nowrap">
                SCROLL
              </span>
              <div className="w-px h-16 bg-white/30"></div>
              <ArrowDown className="text-white/60 mt-2 animate-bounce" size={16} />
            </motion.div>
          </div>
        </div>

        {/* Featured Projects Section - Compact for single page */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="pb-20"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Featured Work</h2>
            <p className="text-white/60">Some of my recent projects</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {featuredProjects.map((project, index) => (
              <GlassCard key={project.id} delay={1.3 + index * 0.2} className="p-6">
                <div className="aspect-video rounded-xl overflow-hidden mb-4">
                  <ProgressiveImage
                    src={project.imageUrl}
                    alt={project.title}
                    wrapperClassName="w-full h-full"
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    aspectClass="w-full h-full"
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
                <p className="text-white/70 mb-3 text-sm line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span 
                      key={tech}
                      className="px-2 py-1 bg-azure-400/20 text-azure-400 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;