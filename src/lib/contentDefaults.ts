import type { SiteContent } from '../types/content';

/**
 * Default content extracted from all current hardcoded page values.
 * Used as fallback when no custom content is stored in Supabase.
 */
export const defaultContent: SiteContent = {
  theme: {
    primaryColor: '#38bdf8',
    heroDesktopLight: '/hero-light.jpg',
    heroDesktopDark: '/hero-dark.jpg',
    heroMobile: '/mobilebg.png',
  },

  home: {
    heroGreeting: 'HI I\'M',
    heroFirstName: 'OWEN',
    heroMiddleInitial: 'K.',
    heroLastName: 'muhereze',
    heroSubtitle: 'A FULL STACK DEVELOPER',
    heroDescription:
      'I craft digital experiences that blend beautiful design with powerful functionality. Specializing in modern web technologies, I build scalable applications that make a difference.',
    heroSkills: [
      { icon: 'code', label: 'Frontend' },
      { icon: 'database', label: 'Backend' },
      { icon: 'globe', label: 'Full Stack' },
    ],
    ctaPrimaryText: "Let's Connect",
    ctaPrimaryLink: '/contact',
    ctaSecondaryText: 'View My Resume',
    ctaSecondaryTextShort: 'Resume',
    ctaSecondaryLink: '/resume',
    featuredTitle: 'Featured Work',
    featuredSubtitle: 'Some of my recent projects',
    profileImageDesktop: '/images/profile/OwenProfile.png',
    profileImageMobile: '/images/profile/OwenProfile-Mobile.png',
  },

  about: {
    pageTitle: 'ABOUT ME',
    storyTitle: 'My Story',
    storyParagraphs: [
      "I'm Owen, a passionate full-stack developer with over 5 years of experience creating digital solutions that make a real impact. My journey began with a curiosity about how things work on the web.",
      'I specialize in modern JavaScript frameworks, cloud technologies, and database design. Whether it\'s building a responsive frontend with React or architecting a scalable backend with Node.js, I bring both technical expertise and creative problem-solving to every project.',
    ],
    statsTitle: 'By the Numbers',
    stats: [
      { label: 'Years Experience', value: '5+', target: 5 },
      { label: 'Happy Clients', value: '50+', target: 50 },
      { label: 'Projects Completed', value: '100+', target: 100 },
    ],
    techStackTitle: 'Tech Stack',
    techStack: [
      { category: 'Frontend', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'] },
      { category: 'Backend', skills: ['Node.js', 'Express', 'Python', 'PostgreSQL'] },
      { category: 'Tools', skills: ['Git', 'Docker', 'AWS', 'Figma'] },
    ],
  },

  contact: {
    pageTitle: 'CONTACT',
    pageSubtitle:
      "Ready to start your next project? Let's discuss how we can work together.",
    formTitle: 'Get In Touch',
    contactInfo: [
      { icon: 'mail', label: 'Email', value: 'owenatug@gmail.com', href: 'mailto:owenatug@gmail.com' },
      { icon: 'phone', label: 'Phone', value: '+256774711146', href: 'tel:+256774711146' },
      { icon: 'mapPin', label: 'Location', value: 'Kampala, Uganda', href: '#' },
    ],
    successTitle: 'Message Sent!',
    successMessage: "Thank you for reaching out. I'll get back to you soon.",
    recipientEmail: 'owenatug@gmail.com',
  },

  resume: {
    personal: {
      name: 'Owen Kasule Muhereza',
      title: 'Software Engineer | Technical Problem Solver',
      email: 'owenatug@gmail.com',
      phone: '+256774711146',
      location: 'Uganda',
      linkedin: 'www.linkedin.com/in/owen-muhereza-kasule-teachrooot',
      summary:
        "Developer with 2 years' experience building web solutions. Skilled in front-end, back-end, and Power Platform tools. Team-oriented and focused on delivering smooth, user-friendly experiences.",
    },
    experience: [
      {
        id: 1,
        company: 'Mountain River Partners',
        position: 'Bookkeeping Intern',
        duration: '2025 - 2025',
        location: 'Uganda',
        description:
          'Led peers with clear communication, kept 100% deadlines, and adapted swiftly under pressure.',
        achievements: [
          'Led peers with clear communication, kept 100% deadlines, and adapted swiftly under pressure',
          'Reconciled daily QuickBooks transactions and audited 20+ monthly ledgers under GAAP, eliminating discrepancies and ensuring full compliance',
        ],
        technologies: ['QuickBooks', 'GAAP', 'Financial Auditing', 'Team Leadership'],
      },
      {
        id: 2,
        company: 'Guild Digital Foundation',
        position: 'Software Developer',
        duration: '2023 - 2024',
        location: 'Uganda',
        description:
          'Managed and optimized databases, applications, and servers to ensure seamless backend support for web and mobile apps.',
        achievements: [
          'Managed and optimized databases, applications, and servers to ensure seamless backend support for web and mobile apps',
          'Collaborated on internal research tools using Microsoft Power Platform (Power Apps & Power BI), enhancing user workflows and data visibility for reporting',
        ],
        technologies: ['Power Apps', 'Power BI', 'Database Management', 'Microsoft Power Platform'],
      },
    ],
    education: [
      {
        id: 1,
        degree: 'Bachelor of Science in Software Development',
        school: 'BYU-Idaho - USA',
        duration: 'Expected 2026',
        location: 'USA',
        gpa: 'In Progress',
        relevantCourses: ['Software Development', 'Programming', 'Database Systems', 'Web Development'],
      },
      {
        id: 2,
        degree: 'Diploma in Information Technology',
        school: 'Isbat University - Uganda',
        duration: '2023',
        location: 'Uganda',
        gpa: 'Completed',
        relevantCourses: ['Information Technology', 'Computer Science', 'Programming Fundamentals'],
      },
    ],
    skills: {
      technical: [
        'Database Management (Relational Databases, Optimization)',
        'Full-Stack Development (Python, PHP, JavaScript, MySQL, PSQL)',
        'Problem-Solving and Troubleshooting',
        'Debugging',
      ],
      soft: [
        'Remote Collaboration (Cross-functional teamwork, clear communication)',
        'Continuous Learning and Adaptability',
        'Critical Thinking',
        'Reliability & Accountability',
        'Emotional Intelligence',
        'Customer Service & CRM Systems (Email & Phone Support, CRM tools)',
      ],
    },
    certifications: [
      { name: 'QuickBooks Online Certification Level 1', issuer: 'Intuit', date: '2025' },
      { name: 'Teaching English as a Foreign Language (TEFL)', issuer: 'TEFL Certification', date: '2024' },
    ],
  },

  projects: {
    pageTitle: 'PROJECTS',
    pageSubtitle:
      'A showcase of my work, featuring full-stack applications and innovative solutions.',
    projects: [
      {
        id: '1',
        title: 'E-Commerce Platform',
        description:
          'Full-stack e-commerce solution with React, Node.js, and MongoDB. Features include user authentication, payment processing, and admin dashboard.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'JWT'],
        imageUrl:
          'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com/Owen-kasule/ecommerce',
        featured: true,
      },
      {
        id: '2',
        title: 'Task Management App',
        description:
          'Collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
        technologies: ['React', 'TypeScript', 'Socket.io', 'Express', 'PostgreSQL'],
        imageUrl:
          'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com/Owen-kasule/taskapp',
        featured: true,
      },
      {
        id: '3',
        title: 'Weather Dashboard',
        description:
          'Modern weather application with location-based forecasts, interactive maps, and detailed weather analytics.',
        technologies: ['Vue.js', 'Node.js', 'OpenWeather API', 'Chart.js'],
        imageUrl:
          'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800',
        liveUrl: 'https://example.com',
        githubUrl: 'https://github.com/Owen-kasule/weather',
        featured: false,
      },
    ],
  },

  footer: {
    brandName: 'TECHROOOT',
  },

  header: {
    logoText: 'O',
    navItems: [
      { name: 'HOME', path: '/' },
      { name: 'ABOUT', path: '/about' },
      { name: 'PROJECTS', path: '/projects' },
      { name: 'CONTACT', path: '/contact' },
    ],
  },

  social: {
    links: [
      { platform: 'GitHub', url: 'https://github.com/Owen-kasule', icon: 'github' },
      { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/owen-muhereza-kasule-teachrooot/', icon: 'linkedin' },
      { platform: 'Twitter', url: 'https://x.com/KingOWEN99', icon: 'twitter' },
      { platform: 'Instagram', url: 'https://www.instagram.com/muhereza_0wen/', icon: 'instagram' },
      { platform: 'WhatsApp', url: 'https://wa.me/256757791959', icon: 'whatsapp' },
    ],
  },
};
