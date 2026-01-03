import React, { useState, useEffect, useRef } from 'react';
import ProgressiveImage from '../components/ui/ProgressiveImage';
import { motion } from 'framer-motion';
import { Download, Award, Users, Coffee, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import SocialLinks from '../components/ui/SocialLinks';
import AddReviewButton from '../components/reviews/AddReviewButton';
import { testimonials } from '../data/portfolio';
import { useAnalytics } from '../hooks/useAnalytics';

const About: React.FC = () => {
  const [counters, setCounters] = useState({ experience: 0, clients: 0, projects: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);
  const getVisibleFromWidth = (width: number) => {
    if (width < 768) return 1;
    if (width < 1024) return 2;
    if (width < 1440) return 3;
    return 4;
  };

  const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const [isMobile, setIsMobile] = useState(initialWidth < 1024);
  const [storyHeights, setStoryHeights] = useState<{ full: number; collapsed: number }>({ full: 0, collapsed: 0 });
  const [visibleCount, setVisibleCount] = useState(getVisibleFromWidth(initialWidth));
  const storyRef = useRef<HTMLDivElement | null>(null);

  // Track page visit
  useAnalytics('about');

  const stats = [
    { icon: Award, label: 'Years Experience', value: '5+', target: 5, key: 'experience' },
    { icon: Users, label: 'Happy Clients', value: '50+', target: 50, key: 'clients' },
    { icon: Coffee, label: 'Projects Completed', value: '100+', target: 100, key: 'projects' },
  ];

  // Count-up animation effect
  useEffect(() => {
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        stats.forEach((stat) => {
          const duration = 2000; // 2 seconds
          const steps = 60; // 60 steps for smooth animation
          const increment = stat.target / steps;
          let current = 0;
          
          const interval = setInterval(() => {
            current += increment;
            if (current >= stat.target) {
              current = stat.target;
              clearInterval(interval);
            }
            
            setCounters(prev => ({
              ...prev,
              [stat.key]: Math.floor(current)
            }));
          }, duration / steps);
        });
        
        setHasAnimated(true);
      }, 800); // Start animation after initial page load

      return () => clearTimeout(timer);
    }
  }, [hasAnimated]);

  // Track viewport width to keep desktop layout untouched and clamp story only on mobile
  useEffect(() => {
    const measureStory = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 0;
      setIsMobile(width < 1024);
      setVisibleCount(getVisibleFromWidth(width));

      if (storyRef.current) {
        const lineHeight = parseFloat(getComputedStyle(storyRef.current).lineHeight) || 24;
        const collapsed = Math.max(0, lineHeight * 5 + 4); // 5 lines + breathing room
        setStoryHeights({
          full: storyRef.current.scrollHeight,
          collapsed
        });
      }
    };

    measureStory();
    window.addEventListener('resize', measureStory);
    window.addEventListener('orientationchange', measureStory);
    return () => {
      window.removeEventListener('resize', measureStory);
      window.removeEventListener('orientationchange', measureStory);
    };
  }, []);

  useEffect(() => {
    const el = storyRef.current;
    if (!el) return;
    setStoryHeights(prev => ({
      ...prev,
      full: el.scrollHeight
    }));
  }, [isStoryExpanded]);

  // Testimonials carousel effect - infinite loop in one direction
  useEffect(() => {
    const totalSlides = Math.max(1, Math.ceil(testimonials.length / visibleCount));
    if (isPaused || testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => 
        (prevIndex + 1) % totalSlides
      );
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused, visibleCount, testimonials.length]);

  // Clamp index when visibleCount changes
  useEffect(() => {
    const totalSlides = Math.max(1, Math.ceil(testimonials.length / visibleCount));
    if (currentTestimonialIndex >= totalSlides) {
      setCurrentTestimonialIndex(0);
    }
  }, [visibleCount, testimonials.length]);

  const totalSlides = Math.max(1, Math.ceil(testimonials.length / visibleCount));

  // Get testimonials for current view based on visible count
  const getCurrentTestimonials = (count: number) => {
    const result = [];
    const start = (currentTestimonialIndex * count) % testimonials.length;
    for (let i = 0; i < count; i++) {
      const index = (start + i) % testimonials.length;
      result.push(testimonials[index]);
    }
    return result;
  };

  const currentTestimonials = getCurrentTestimonials(visibleCount);

  // Handle card click to pause/resume
  const handleCardClick = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="min-h-screen relative pt-4 lg:pt-24 pb-0.5 lg:pb-12">
      {/* Social Links on all pages */}
      <div className="hidden lg:block">
  <SocialLinks vertical className="fixed left-8 bottom-32 transform z-[60]" />
      </div>

      {/* Scroll Indicator */}
      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="fixed right-8 bottom-32 transform flex flex-col items-center"
        >
          <span className="text-white/60 text-sm mb-4 transform rotate-90 origin-center whitespace-nowrap">
            SCROLL
          </span>
          <div className="w-px h-16 bg-white/30"></div>
          <ArrowDown className="text-white/60 mt-2 animate-bounce" size={16} />
        </motion.div>
      </div>

      <div className="container mx-auto px-6 space-y-4 lg:space-y-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4 lg:mb-12"
        >
          <h1 className="ui-page-title mb-5">
            ABOUT ME
          </h1>
          <div className="flex items-center justify-center mb-6">
            <div className="h-1 w-24 bg-azure-400"></div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 ui-grid-gap lg:gap-8 mb-12">
          {/* Bio Section */}
          <GlassCard delay={0.2} className="p-6">
            <h2 className="ui-section-title text-center lg:text-left">My Story</h2>
            <motion.div
              ref={storyRef}
              initial={false}
              animate={{
                maxHeight: isMobile && !isStoryExpanded && storyHeights.collapsed
                  ? storyHeights.collapsed
                  : storyHeights.full || 'none'
              }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              style={{
                overflow: 'hidden',
                display: isMobile && !isStoryExpanded ? ('-webkit-box' as any) : 'block',
                WebkitLineClamp: isMobile && !isStoryExpanded ? 5 : 'unset',
                WebkitBoxOrient: 'vertical' as any
              }}
              className="space-y-3 ui-body leading-relaxed"
            >
              <p>
                I'm Owen, a passionate full-stack developer with over 5 years of experience 
                creating digital solutions that make a real impact. My journey began with a 
                curiosity about how things work on the web.
              </p>
              <p>
                I specialize in modern JavaScript frameworks, cloud technologies, and 
                database design. Whether it's building a responsive frontend with React 
                or architecting a scalable backend with Node.js, I bring both technical 
                expertise and creative problem-solving to every project.
              </p>
            </motion.div>

            {/* Read more toggle for mobile */}
            {isMobile && (
              <button
                onClick={() => setIsStoryExpanded(prev => !prev)}
                className="mt-3 text-azure-400 text-sm font-medium flex items-center justify-center gap-2"
              >
                {isStoryExpanded ? 'Show less' : 'Read more'}
              </button>
            )}

            {/* Interactive Resume Link */}
            <Link to="/resume" className="mt-6 flex justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 flex items-center space-x-2 bg-azure-500 hover:bg-azure-600 text-white px-4 py-2 rounded-xl transition-colors duration-300 text-sm"
              >
                <Download size={16} />
                <span>View Interactive Resume</span>
              </motion.button>
            </Link>
          </GlassCard>

          {/* Stats & Skills */}
          <div className="space-y-4 md:space-y-6">
            {/* Stats with Count-up Animation */}
            <GlassCard delay={0.4} className="p-6">
              <h3 className="ui-section-title text-center lg:text-left">By the Numbers</h3>
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="text-azure-400 mx-auto mb-2" size={20} />
                    <motion.div 
                      className="text-xl font-bold text-white"
                      initial={{ scale: 1 }}
                      animate={{ scale: hasAnimated ? [1, 1.1, 1] : 1 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.2 }}
                    >
                      {counters[stat.key as keyof typeof counters]}
                      {stat.key === 'experience' && '+'}
                      {stat.key === 'clients' && '+'}
                      {stat.key === 'projects' && '+'}
                    </motion.div>
                    <div className="ui-meta">{stat.label}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Skills */}
            <GlassCard delay={0.6} className="p-6">
              <h3 className="ui-section-title text-center lg:text-left">Tech Stack</h3>
              <div className="space-y-3">
                {[
                  { category: 'Frontend', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'] },
                  { category: 'Backend', skills: ['Node.js', 'Express', 'Python', 'PostgreSQL'] },
                  { category: 'Tools', skills: ['Git', 'Docker', 'AWS', 'Figma'] }
                ].map((group, index) => (
                  <div key={index}>
                    <h4 className="text-azure-400 font-semibold mb-2 ui-meta">{group.category}</h4>
                    <div className="flex flex-wrap gap-1">
                      {group.skills.map((skill) => (
                        <span 
                          key={skill}
                          className="px-2 py-1 bg-white/10 text-white/80 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Testimonials - Simple 3 Cards with Slide Effect */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <div className="flex flex-col md:flex-row md:flex-nowrap items-center justify-center gap-3 md:gap-3 mb-4 md:mb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center md:text-center md:leading-tight">
                What People Say
              </h2>
              <div className="flex-shrink-0 md:ml-2">
                <AddReviewButton />
              </div>
            </div>
            <p className="text-white/60 text-sm mb-4 text-center">
              Click any card to {isPaused ? 'resume' : 'pause'} the slideshow
            </p>
          </div>

          <div className="w-full max-w-6xl mx-auto">
            <motion.div 
              key={currentTestimonialIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="grid testimonials-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
            >
              {currentTestimonials.map((testimonial: any, index: number) => (
                <motion.div
                  key={`${testimonial.id}-${index}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.6, ease: 'easeInOut', delay: isMobile ? 0 : index * 0.1 }}
                  onClick={handleCardClick}
                  className={`cursor-pointer ${isMobile ? 'w-full' : ''}`}
                  drag={isMobile || visibleCount === 2 ? 'x' : false}
                  style={{ touchAction: 'pan-y' }}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (!(isMobile || visibleCount === 2)) return;
                    if (info.offset.x < -50) {
                      setCurrentTestimonialIndex((prev) => (prev + 1) % totalSlides);
                    } else if (info.offset.x > 50) {
                      setCurrentTestimonialIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
                    }
                  }}
                >
                  <GlassCard className={`p-6 h-full hover:scale-105 transition-transform duration-300 ${isPaused ? 'ring-2 ring-azure-400/50' : ''}`}>
                    <div className="flex items-center mb-4">
                      <ProgressiveImage 
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        wrapperClassName="w-12 h-12 rounded-full mr-4 overflow-hidden"
                        className="object-cover"
                        initialBlur
                        skeleton
                        lazy
                      />
                      <div>
                        <h4 className="text-white font-semibold text-sm">{testimonial.name}</h4>
                        <p className="text-white/60 text-xs">{testimonial.role}</p>
                        <p className="text-azure-400 text-xs font-medium">{testimonial.company}</p>
                      </div>
                    </div>
                    <p className="text-white/80 italic text-sm leading-relaxed">
                      "{testimonial.content}"
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Smooth Progress Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => {
              const isActive = index === currentTestimonialIndex;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  className="focus:outline-none"
                  aria-label={`Go to testimonial ${index + 1}`}
                >
                  <motion.div
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                      isActive ? 'bg-azure-400' : 'bg-white/30'
                    }`}
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      opacity: isActive ? 1 : 0.5
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  />
                </button>
              );
            })}
          </div>

          {/* Pause/Resume Status */}
          {isPaused && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-4"
            >
              <span className="text-azure-400 text-sm font-medium">
                ⏸️ Slideshow Paused - Click any card to resume
              </span>
            </motion.div>
          )}
        </motion.section>

        {/* Mobile Social Links removed - footer handles will be used on small screens */}
      </div>
    </div>
  );
};

export default About;
