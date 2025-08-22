import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Code, Database, Globe } from 'lucide-react';
import ProgressiveImage from '../components/ui/ProgressiveImage';
import GlassCard from '../components/ui/GlassCard';
import GlassCTA from '../components/ui/GlassCTA';
import SocialLinks from '../components/ui/SocialLinks';
import { projects } from '../data/portfolio';
import { useAnalytics } from '../hooks/useAnalytics';

const Home: React.FC = () => {
  // Measure subtitle width so the inline blue bar matches it
  const subtitleRefSm = useRef<HTMLParagraphElement | null>(null);
  const subtitleRefLg = useRef<HTMLParagraphElement | null>(null);
  const owenRefSm = useRef<HTMLHeadingElement | null>(null);
  const owenRefLg = useRef<HTMLHeadingElement | null>(null);
  const nameRowSmRef = useRef<HTMLDivElement | null>(null);
  const nameRowLgRef = useRef<HTMLDivElement | null>(null);
  const barRefSm = useRef<HTMLSpanElement | null>(null);
  const barRefLg = useRef<HTMLSpanElement | null>(null);
  const hiImRefLg = useRef<HTMLParagraphElement | null>(null);
  const hiImRowLgRef = useRef<HTMLDivElement | null>(null);
  const fullNameRefLg = useRef<HTMLDivElement | null>(null);
  const muherezeRefLg = useRef<HTMLSpanElement | null>(null); // New ref for "Muhereze" only

  const [barWidthSm, setBarWidthSm] = useState<number>(0);
  const [barWidthLg, setBarWidthLg] = useState<number>(0);
  const subtitleWrapLgRef = useRef<HTMLDivElement | null>(null);

  console.log('🎯 Current bar widths:', { barWidthSm, barWidthLg });

  useEffect(() => {
    const parseGap = (el: HTMLElement | null): number => {
      if (!el) return 0;
      const style = getComputedStyle(el);
      // Try gap first, then column-gap for compatibility
      const gapStr = (style as any).gap || (style as any).columnGap || '0px';
      const num = parseFloat(String(gapStr));
      return Number.isFinite(num) ? num : 0;
    };

  const update = () => {
      console.log('🔵 Update called');
      // Small layout: bar width = subtitle width - (OWEN width + gap)
      if (subtitleRefSm.current) {
        const subW = subtitleRefSm.current.getBoundingClientRect().width;
        const nameW = owenRefSm.current?.getBoundingClientRect().width ?? 0;
        const gap = parseGap(nameRowSmRef.current);
        const raw = (subW - nameW - gap) - 1; // epsilon for rounding
        const barW = raw <= 0 ? 6 : raw; // avoid total disappearance on very tight widths
        const finalWidth = Math.max(0, Math.round(barW));
        console.log('📱 Small bar:', { subW, nameW, gap, raw, finalWidth });
        setBarWidthSm(finalWidth);
      }
      // Large layout: bar width = (end of "Muhereze") - (end of "HI I'M" + gap)
      if (hiImRefLg.current && hiImRowLgRef.current && muherezeRefLg.current && fullNameRefLg.current) {
        const hiImEndX = hiImRefLg.current.getBoundingClientRect().right;
        const gap = parseGap(hiImRowLgRef.current);
        const barLeftX = hiImEndX + gap; // bar starts after HI I'M plus the flex gap
        const muherezeEndX = muherezeRefLg.current.getBoundingClientRect().right;
        const fullNameStartX = fullNameRefLg.current.getBoundingClientRect().left;

        // Bar width from end of HI I'M to end of Muhereze
        const rawWidth = muherezeEndX - barLeftX;
        const finalWidth = Math.max(0, Math.round(rawWidth - 1)); // small epsilon to avoid overshoot
        setBarWidthLg(finalWidth);

        // Name width for aligning subtitle to end at Muhereze (apply imperatively to avoid inline style lint)
        const rawNameWidth = muherezeEndX - fullNameStartX;
        const finalNameWidth = Math.max(0, Math.round(rawNameWidth));
        if (subtitleWrapLgRef.current) {
          subtitleWrapLgRef.current.style.width = `${finalNameWidth}px`;
        }

        console.log('💻 Large metrics:', { hiImEndX, gap, barLeftX, muherezeEndX, fullNameStartX, rawWidth, finalWidth, rawNameWidth, finalNameWidth });
      }
    };
    // Defer to next frame to measure after first paint, then set widths for animation
    requestAnimationFrame(update);

    // After fonts load, recompute to ensure accurate widths and animate if needed
    const anyDoc: any = document as any;
    if (anyDoc.fonts && typeof anyDoc.fonts.ready?.then === 'function') {
      anyDoc.fonts.ready.then(() => {
        requestAnimationFrame(() => {
          update();
        });
      });
    }
  const roSm = subtitleRefSm.current ? new ResizeObserver(update) : null;
  const roLg = subtitleRefLg.current ? new ResizeObserver(update) : null;
    if (subtitleRefSm.current && roSm) roSm.observe(subtitleRefSm.current);
    if (subtitleRefLg.current && roLg) roLg.observe(subtitleRefLg.current);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
  roSm?.disconnect();
  roLg?.disconnect();
  // no timers to clear
    };
  }, []);
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
            <SocialLinks vertical className="fixed left-8 bottom-32 transform z-[60]" />
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
                  <div className="hidden lg:block mb-1">
                    <div ref={hiImRowLgRef} className="flex items-center gap-3 mb-1">
                      <p ref={hiImRefLg} className="text-azure-400 text-lg font-medium tracking-wider">HI I'M</p>
                      <motion.span
                        ref={barRefLg}
                        aria-hidden="true"
                        className="inline-block bg-azure-400/80 rounded align-middle hero-name-bar-lg shrink-0"
                        key={`lg-${barWidthLg}`}
                        initial={{ width: 0 }}
                        animate={{ width: barWidthLg }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                        style={{ height: '1.125rem', minWidth: '2px' }}
                        onAnimationStart={() => console.log('🎬 Large bar animation started')}
                        onAnimationComplete={() => console.log('✅ Large bar animation complete')}
                      />
                    </div>
                    <h1 ref={fullNameRefLg} className="font-bold text-white text-4xl lg:text-5xl leading-tight">
                      OWEN <span className="mx-1">K. </span><span ref={muherezeRefLg} className="capitalize">muhereze</span>
                    </h1>
                  </div>
                  
                  {/* Small/Medium: Inline image + name/title row */}
                  <div className="lg:hidden">
                    <div className="flex items-center gap-5 mb-4">
                      {/* Inline profile image */}
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border border-white/20 bg-white/5 shadow">
                        <ProgressiveImage
                          src="/images/profile/owen-profile.png"
                          alt="Owen - Full Stack Developer"
                          wrapperClassName="w-full h-full"
                          className="w-full h-full object-cover"
                          aspectClass="w-full h-full"
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-azure-400 text-sm font-medium tracking-wider mb-1 lg:hidden">HI I'M</p>
                        <div ref={nameRowSmRef} className="flex items-center gap-3 fluid-h2 leading-tight">
                          <h1 ref={owenRefSm} className="font-bold text-white leading-tight">OWEN</h1>
                          {/* Inline blue bar matching subtitle width and OWEN height */}
                          <motion.span
                            ref={barRefSm}
                            aria-hidden="true"
                            className="inline-block bg-azure-400/80 rounded align-middle hero-name-bar shrink-0"
                            key={`sm-${barWidthSm}`}
                            initial={{ width: 0 }}
                            animate={{ width: barWidthSm }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                            style={{ height: '1em', minWidth: '2px' }}
                            onAnimationStart={() => console.log('🎬 Small bar animation started')}
                            onAnimationComplete={() => console.log('✅ Small bar animation complete')}
                          />
                        </div>
                        <p className="text-azure-400 font-medium uppercase whitespace-nowrap tracking-[0.12em] text-[11px] sm:text-xs md:text-sm mt-1"><span ref={subtitleRefSm} className="inline-block">A FULL STACK DEVELOPER</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Large screens: subtitle under name with minimal spacing and right-aligned to name end */}
                  <div className="hidden lg:block">
                    <div ref={subtitleWrapLgRef} className="flex justify-end">
                      <p className="text-azure-400 fluid-body font-medium tracking-wider mb-2 uppercase tracking-[0.2em] text-right"><span ref={subtitleRefLg} className="inline-block">A FULL STACK DEVELOPER</span></p>
                    </div>
                  </div>
                </motion.div>

                {/* Introduction Text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="mb-6"
                >
                  <p className="text-white/90 fluid-body">
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
              className="relative order-1 lg:order-2 hidden lg:flex justify-center lg:justify-end lg:col-span-2 h-full"
            >
              {/* Image Container - Responsive, scales to always show full image */}
              <div className="relative h-full max-h-[420px] md:max-h-[calc(100vh-140px)] flex items-center">
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-azure-400/15 via-transparent to-azure-600/8 rounded-2xl blur-2xl transform scale-105"></div>
                
                {/* Owen's Image - Direct without glass container */}
                <motion.div
                  whileHover={{ scale: 1.01, y: -2 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="relative z-10 h-full max-h-full rounded-2xl overflow-hidden shadow-2xl flex"
                >
                  <div className="relative h-full max-h-full flex">
                    <ProgressiveImage
                      src="/images/profile/owen-profile.png"
                      alt="Owen - Full Stack Developer"
                      wrapperClassName="h-full max-h-full w-auto"
                      className="h-full w-auto max-h-full object-contain"
                      aspectClass="h-full"
                    />
                  </div>
                  
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
            <h2 className="fluid-h2 font-bold text-white mb-4">Featured Work</h2>
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