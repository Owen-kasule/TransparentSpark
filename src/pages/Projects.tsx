import React, { useState } from 'react';
import ProgressiveImage from '../components/ui/ProgressiveImage';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Filter, Download, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import SocialLinks from '../components/ui/SocialLinks';
import { projects } from '../data/portfolio';
import { useAnalytics } from '../hooks/useAnalytics';

const Projects: React.FC = () => {
  const [filter, setFilter] = useState('all');
  
  // Track page visit
  useAnalytics('projects');
  
  const allTechnologies = Array.from(
    new Set(projects.flatMap(project => project.technologies))
  );

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.technologies.includes(filter));

  return (
    <div className="min-h-screen pt-24 pb-12 relative">
      {/* Social Links on all pages */}
      <div className="hidden lg:block">
        <SocialLinks vertical className="fixed left-8 bottom-32 transform" />
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

      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            PROJECTS
          </h1>
          <div className="flex items-center justify-center mb-6">
            <div className="h-1 w-24 bg-azure-400"></div>
          </div>
          <p className="text-white/70 max-w-2xl mx-auto">
            A showcase of my work, featuring full-stack applications and innovative solutions.
          </p>
        </motion.div>

        {/* Filter */}
        <GlassCard delay={0.2} className="mb-8 p-4">
          <div className="flex items-center justify-center flex-wrap gap-3">
            <div className="flex items-center text-white/60 mr-4">
              <Filter size={16} className="mr-2" />
              <span className="text-sm">Filter by:</span>
            </div>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all duration-300 text-sm ${
                filter === 'all' 
                  ? 'bg-azure-500 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              All
            </button>
            {allTechnologies.slice(0, 5).map((tech) => (
              <button
                key={tech}
                onClick={() => setFilter(tech)}
                className={`px-3 py-1 rounded-lg transition-all duration-300 text-sm ${
                  filter === tech 
                    ? 'bg-azure-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Projects Grid - Compact for single page */}
        <motion.div
          layout
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="h-full group hover:scale-105 transition-transform duration-300 p-4">
                <div className="aspect-video rounded-xl overflow-hidden mb-4 relative">
                  <ProgressiveImage 
                    src={project.imageUrl}
                    alt={project.title}
                    wrapperClassName="w-full h-full"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    initialBlur
                    skeleton
                    lazy
                  />
                  {project.featured && (
                    <div className="absolute top-2 right-2 bg-azure-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
                <p className="text-white/70 mb-3 text-sm line-clamp-2">{project.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span 
                      key={tech}
                      className="px-2 py-1 bg-azure-400/20 text-azure-400 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-4 mt-auto">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-white/70 hover:text-azure-400 transition-colors duration-300"
                    >
                      <ExternalLink size={14} />
                      <span className="text-xs">Live</span>
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-white/70 hover:text-azure-400 transition-colors duration-300"
                    >
                      <Github size={14} />
                      <span className="text-xs">Code</span>
                    </a>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Resume Section */}
        <GlassCard delay={0.8} className="text-center p-6">
          <h2 className="text-2xl font-bold text-white mb-3">Want to See More?</h2>
          <p className="text-white/70 mb-4 text-sm">
            View my interactive resume for a complete overview of my experience and skills.
          </p>
          <Link to="/resume">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-azure-500 hover:bg-azure-600 text-white px-6 py-2 rounded-xl transition-colors duration-300 font-medium text-sm flex items-center space-x-2 mx-auto"
            >
              <Download size={16} />
              <span>View Interactive Resume</span>
            </motion.button>
          </Link>
        </GlassCard>

        {/* Mobile Social Links */}
        <div className="lg:hidden text-center mt-8">
          <SocialLinks />
        </div>
      </div>
    </div>
  );
};

export default Projects;