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
import { projects } from '../data/portfolio';

const Resume: React.FC = () => {
  const [activeSection, setActiveSection] = useState('experience');

  const resumeData = {
    personal: {
      name: "Owen Kasule Muhereza",
      title: "Software Engineer | Technical Problem Solver",
      email: "owenatug@gmail.com",
      phone: "+256774711146",
      location: "Uganda",
      linkedin: "www.linkedin.com/in/owen-muhereza-kasule-teachrooot",
      summary: "Developer with 2 years' experience building web solutions. Skilled in front-end, back-end, and Power Platform tools. Team-oriented and focused on delivering smooth, user-friendly experiences."
    },
    experience: [
      {
        id: 1,
        company: "Mountain River Partners",
        position: "Bookkeeping Intern",
        duration: "2025 - 2025",
        location: "Uganda",
        description: "Led peers with clear communication, kept 100% deadlines, and adapted swiftly under pressure.",
        achievements: [
          "Led peers with clear communication, kept 100% deadlines, and adapted swiftly under pressure",
          "Reconciled daily QuickBooks transactions and audited 20+ monthly ledgers under GAAP, eliminating discrepancies and ensuring full compliance"
        ],
        technologies: ["QuickBooks", "GAAP", "Financial Auditing", "Team Leadership"]
      },
      {
        id: 2,
        company: "Guild Digital Foundation",
        position: "Software Developer",
        duration: "2023 - 2024",
        location: "Uganda",
        description: "Managed and optimized databases, applications, and servers to ensure seamless backend support for web and mobile apps.",
        achievements: [
          "Managed and optimized databases, applications, and servers to ensure seamless backend support for web and mobile apps",
          "Collaborated on internal research tools using Microsoft Power Platform (Power Apps & Power BI), enhancing user workflows and data visibility for reporting"
        ],
        technologies: ["Power Apps", "Power BI", "Database Management", "Microsoft Power Platform"]
      }
    ],
    education: [
      {
        id: 1,
        degree: "Bachelor of Science in Software Development",
        school: "BYU-Idaho - USA",
        duration: "Expected 2026",
        location: "USA",
        gpa: "In Progress",
        relevantCourses: ["Software Development", "Programming", "Database Systems", "Web Development"]
      },
      {
        id: 2,
        degree: "Diploma in Information Technology",
        school: "Isbat University - Uganda",
        duration: "2023",
        location: "Uganda",
        gpa: "Completed",
        relevantCourses: ["Information Technology", "Computer Science", "Programming Fundamentals"]
      }
    ],
    skills: {
      technical: ["Database Management (Relational Databases, Optimization)", "Full-Stack Development (Python, PHP, JavaScript, MySQL, PSQL)", "Problem-Solving and Troubleshooting", "Debugging"],
      soft: ["Remote Collaboration (Cross-functional teamwork, clear communication)", "Continuous Learning and Adaptability", "Critical Thinking", "Reliability & Accountability", "Emotional Intelligence", "Customer Service & CRM Systems (Email & Phone Support, CRM tools)"]
    },
    projects: projects.map(project => ({
      id: project.id,
      name: project.title,
      description: project.description,
      technologies: project.technologies,
      link: project.liveUrl || project.githubUrl || "#",
      featured: project.featured
    })),
    certifications: [
      {
        name: "QuickBooks Online Certification Level 1",
        issuer: "Intuit",
        date: "2025"
      },
      {
        name: "Teaching English as a Foreign Language (TEFL)",
        issuer: "TEFL Certification",
        date: "2024"
      }
    ]
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
    <div className="space-y-6">
      {resumeData.experience.map((job, index) => (
        <motion.div
          key={job.id}
          variants={itemVariants}
          className="w-full"
        >
          <GlassCard delay={0.2 + index * 0.1} className="w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">{job.position}</h3>
                <p className="text-blue-400 font-medium">{job.company}</p>
              </div>
              <div className="text-right text-sm text-gray-300">
                <p>{job.duration}</p>
                <p className="flex items-center gap-1 mt-1">
                  <MapPin size={14} />
                  {job.location}
                </p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">{job.description}</p>
            
            <div className="mb-4">
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
    <div className="space-y-6">
      {Object.entries(resumeData.skills).map(([category, skills], index) => (
        <motion.div key={category} variants={itemVariants} className="w-full">
          <GlassCard delay={0.2 + index * 0.1} className="w-full p-6">
            <h3 className="text-xl font-semibold text-white mb-4 capitalize">
              {category} Skills
            </h3>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-2 bg-azure-400/20 text-azure-400 rounded-lg hover:bg-azure-400/30 transition-colors duration-200"
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
    <div className="space-y-6">
      {resumeData.education.map((edu, index) => (
        <motion.div key={edu.id} variants={itemVariants} className="w-full">
          <GlassCard delay={0.2 + index * 0.1} className="w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">{edu.degree}</h3>
                <p className="text-blue-400 font-medium">{edu.school}</p>
              </div>
              <div className="text-right text-sm text-gray-300">
                <p>{edu.duration}</p>
                <p className="flex items-center gap-1 mt-1">
                  <MapPin size={14} />
                  {edu.location}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-300">
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
    <div className="space-y-6">
      {resumeData.projects.map((project, index) => (
        <motion.div key={project.id} variants={itemVariants} className="w-full">
          <GlassCard delay={0.2 + index * 0.1} className="w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">{project.name}</h3>
                <p className="text-gray-300">{project.description}</p>
              </div>
              {project.featured && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30">
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
            RESUME
          </h1>
          <div className="flex items-center justify-center mb-6">
            <div className="h-1 w-24 bg-azure-400"></div>
          </div>
          
          {/* Personal Info Card */}
          <GlassCard delay={0.2} className="w-full p-6 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">{resumeData.personal.name}</h2>
              <p className="text-xl text-blue-400 mb-4">{resumeData.personal.title}</p>
              <p className="text-gray-300">{resumeData.personal.summary}</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail size={16} className="text-azure-400" />
                {resumeData.personal.email}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Phone size={16} className="text-azure-400" />
                {resumeData.personal.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin size={16} className="text-azure-400" />
                {resumeData.personal.location}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <ExternalLink size={16} className="text-azure-400" />
                <a href={`https://${resumeData.personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-azure-400 transition-colors">
                  LinkedIn
                </a>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Navigation Tabs */}
        <GlassCard delay={0.4} className="w-full mb-8 p-4">
          <div className="flex justify-center">
            <div className="flex space-x-1 bg-white/10 p-1 rounded-lg">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-azure-500 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    <Icon size={16} />
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
          className="w-full mb-12"
        >
          {renderContent()}
        </motion.div>

        {/* Certifications Section */}
        <GlassCard delay={0.8} className="w-full p-6 mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4 text-center">Certifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resumeData.certifications.map((cert, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white/10 rounded-lg border border-white/20">
                <div>
                  <p className="text-white font-medium text-sm">{cert.name}</p>
                  <p className="text-white/60 text-xs">{cert.issuer}</p>
                </div>
                <span className="text-azure-400 text-sm">{cert.date}</span>
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
            className="inline-flex bg-azure-500 hover:bg-azure-600 text-white px-6 py-3 rounded-xl transition-colors duration-300 font-medium items-center space-x-2"
          >
            <Download size={20} />
            <span>Download PDF Version</span>
          </motion.a>
        </div>
      </div>

      {/* Mobile Social Links */}
      <div className="lg:hidden text-center mt-8">
        <SocialLinks />
      </div>
    </div>
  );
};

export default Resume; 