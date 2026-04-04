import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award, 
  Download, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink,
  Star,
  ArrowDown
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import SocialLinks from '../components/ui/SocialLinks';
import { useContent } from '../contexts/SiteContentContext';

const Resume: React.FC = () => {
  const { content } = useContent();
  const resume = content.resume;
  const [activeSection, setActiveSection] = useState('experience');

  const resumeData = {
    ...resume,
    projects: content.projects.projects.map(p => ({
      id: p.id,
      name: p.title,
      description: p.description,
      technologies: p.technologies,
      link: p.liveUrl || p.githubUrl || '#',
      featured: p.featured,
    })),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const sections = [
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: Award }
  ];

  const renderExperience = () => (
    <div className="space-y-4 md:space-y-6">
      {resumeData.experience.map((job, index) => (
        <motion.div
          key={job.id}
          variants={itemVariants}
          className="w-full"
        >
          <GlassCard delay={0.2 + index * 0.1} className="w-full p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 sm:mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{job.position}</h3>
                <p className="text-blue-400 font-medium text-sm sm:text-base">{job.company}</p>
              </div>
              <div className="text-left sm:text-right text-xs sm:text-sm text-gray-300">
                <p>{job.duration}</p>
                <p className="flex items-center gap-1 mt-1">
                  <MapPin size={12} className="sm:hidden" />
                  <MapPin size={14} className="hidden sm:inline" />
                  {job.location}
                </p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">{job.description}</p>
            
            <div className="mb-3 sm:mb-4">
              <h4 className="text-white font-medium mb-2">Key Achievements:</h4>
              <ul className="space-y-1">
                {job.achievements.map((achievement, index) => (
                  <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                    <Star size={12} className="text-blue-400 mt-1 flex-shrink-0" />
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {job.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-azure-400/20 text-azure-400 rounded-full text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-4 md:space-y-6">
      {Object.entries(resumeData.skills).map(([category, skills], index) => (
        <motion.div key={category} variants={itemVariants} className="w-full">
          <GlassCard delay={0.2 + index * 0.1} className="w-full p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 capitalize">
              {category} Skills
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-azure-400/20 text-azure-400 rounded-lg hover:bg-azure-400/30 transition-colors duration-200 text-xs sm:text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-4 md:space-y-6">
      {resumeData.education.map((edu, index) => (
        <motion.div key={edu.id} variants={itemVariants} className="w-full">
          <GlassCard delay={0.2 + index * 0.1} className="w-full p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 sm:mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{edu.degree}</h3>
                <p className="text-blue-400 font-medium text-sm sm:text-base">{edu.school}</p>
              </div>
              <div className="text-left sm:text-right text-xs sm:text-sm text-gray-300">
                <p>{edu.duration}</p>
                <p className="flex items-center gap-1 mt-1">
                  <MapPin size={12} className="sm:hidden" />
                  <MapPin size={14} className="hidden sm:inline" />
                  {edu.location}
                </p>
              </div>
            </div>
            
            <div className="mb-3 sm:mb-4">
              <p className="text-gray-300 text-sm sm:text-base">
                <span className="text-white font-medium">GPA:</span> {edu.gpa}
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Relevant Courses:</h4>
              <div className="flex flex-wrap gap-2">
                {edu.relevantCourses.map((course) => (
                  <span
                    key={course}
                    className="px-2 py-1 bg-azure-400/20 text-azure-400 rounded-full text-xs"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-4 md:space-y-6">
      {resumeData.projects.map((project, index) => (
        <motion.div key={project.id} variants={itemVariants} className="w-full">
          <GlassCard delay={0.2 + index * 0.1} className="w-full p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 sm:mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{project.name}</h3>
                <p className="text-gray-300 text-sm sm:text-base">{project.description}</p>
              </div>
              {project.featured && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30 self-start sm:self-auto">
                  Featured
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-azure-400/20 text-azure-400 rounded-full text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
            
            <a
              href={project.link}
              className="inline-flex items-center gap-2 text-azure-400 hover:text-azure-300 transition-colors duration-200"
            >
              <ExternalLink size={16} />
              View Project
            </a>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'experience':
        return renderExperience();
      case 'skills':
        return renderSkills();
      case 'education':
        return renderEducation();
      case 'projects':
        return renderProjects();
      default:
        return renderExperience();
    }
  };

  return (
    <div className="min-h-screen md:min-h-0 lg:min-h-screen relative pt-4 lg:pt-20 pb-0.5 lg:pb-12">
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

      <div className="container mx-auto px-4 sm:px-6 space-y-4 md:space-y-6 lg:space-y-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-0 lg:mb-12"
        >
          <h1 className="ui-page-title mb-4 sm:mb-5">
            RESUME
          </h1>
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="h-1 w-24 bg-azure-400"></div>
          </div>
          
          {/* Personal Info Card */}
          <GlassCard delay={0.2} className="w-full p-4 sm:p-6 mt-6">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{resumeData.personal.name}</h2>
              <p className="text-base sm:text-lg md:text-xl text-blue-400 mb-3 sm:mb-4">{resumeData.personal.title}</p>
              <p className="text-gray-300 text-sm sm:text-base">{resumeData.personal.summary}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-gray-300 max-w-full break-words">
                <Mail size={14} className="text-azure-400" />
                <span className="break-all sm:break-words">{resumeData.personal.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 max-w-full break-words">
                <Phone size={14} className="text-azure-400" />
                <span>{resumeData.personal.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 max-w-full break-words">
                <MapPin size={14} className="text-azure-400" />
                <span>{resumeData.personal.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300 max-w-full break-words">
                <ExternalLink size={14} className="text-azure-400" />
                <a href={`https://${resumeData.personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-azure-400 transition-colors">
                  LinkedIn
                </a>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Navigation Tabs */}
        <GlassCard delay={0.4} className="w-full mb-0 lg:mb-6 p-3 sm:p-4">
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-1 sm:flex sm:gap-0 sm:space-x-1 bg-white/10 p-1 rounded-lg w-full max-w-md sm:max-w-none">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-md transition-all duration-200 text-xs sm:text-sm ${
                      activeSection === section.id
                        ? 'bg-azure-500 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    <Icon size={14} className="sm:hidden" />
                    <Icon size={16} className="hidden sm:inline" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full mb-0 lg:mb-12"
        >
          {renderContent()}
        </motion.div>

        {/* Certifications Section */}
        <GlassCard delay={0.8} className="w-full p-4 sm:p-6 mb-0 lg:mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 text-center">Certifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resumeData.certifications.map((cert, index) => (
              <div key={index} className="flex justify-between items-center p-2.5 sm:p-3 bg-white/10 rounded-lg border border-white/20">
                <div>
                  <p className="text-white font-medium text-sm">{cert.name}</p>
                  <p className="text-white/60 text-xs">{cert.issuer}</p>
                </div>
                <span className="text-azure-400 text-xs sm:text-sm">{cert.date}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Download Button */}
        <div className="text-center">
          <motion.a
            href="/resume.pdf"
            download="Owen_Kasule_Muhereza_Resume.pdf"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex bg-azure-500 hover:bg-azure-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-colors duration-300 font-medium items-center space-x-2 text-sm sm:text-base"
          >
            <Download size={18} className="sm:hidden" />
            <Download size={20} className="hidden sm:inline" />
            <span>Download PDF Version</span>
          </motion.a>
        </div>
      </div>

      {/* Mobile Social Links removed - footer handles will be used on small screens */}
    </div>
  );
};

export default Resume; 