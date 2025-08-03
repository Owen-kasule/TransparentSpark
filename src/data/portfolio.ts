import { Project, Testimonial, SocialLink } from '../types';

export const projects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with React, Node.js, and MongoDB. Features include user authentication, payment processing, and admin dashboard.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'JWT'],
    imageUrl: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com/Owen-kasule/ecommerce',
    featured: true
  },
  {
    id: '2',
    title: 'Task Management App',
    description: 'Collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
    technologies: ['React', 'TypeScript', 'Socket.io', 'Express', 'PostgreSQL'],
    imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com/Owen-kasule/taskapp',
    featured: true
  },
  {
    id: '3',
    title: 'Weather Dashboard',
    description: 'Modern weather application with location-based forecasts, interactive maps, and detailed weather analytics.',
    technologies: ['Vue.js', 'Node.js', 'OpenWeather API', 'Chart.js'],
    imageUrl: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800',
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com/Owen-kasule/weather',
    featured: false
  }
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Product Manager',
    company: 'TechCorp',
    content: 'Owen delivered exceptional work on our e-commerce platform. His attention to detail and technical expertise made the project a huge success.',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'CTO',
    company: 'StartupXYZ',
    content: 'Working with Owen was a pleasure. He brought innovative solutions to complex problems and delivered ahead of schedule.',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Design Lead',
    company: 'Creative Agency',
    content: 'Owen perfectly translated our designs into functional, responsive web applications. His code quality is outstanding.',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '4',
    name: 'David Thompson',
    role: 'Founder',
    company: 'InnovateLab',
    content: 'Outstanding developer with exceptional problem-solving skills. Owen transformed our vision into a scalable, robust application.',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '5',
    name: 'Lisa Wang',
    role: 'Engineering Manager',
    company: 'DataFlow Inc',
    content: 'Owen\'s expertise in full-stack development is remarkable. He delivered a complex dashboard that exceeded all our expectations.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '6',
    name: 'James Miller',
    role: 'VP of Technology',
    company: 'CloudTech Solutions',
    content: 'Incredible attention to detail and clean code architecture. Owen built our entire backend infrastructure with zero downtime.',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '7',
    name: 'Rachel Green',
    role: 'UI/UX Designer',
    company: 'PixelPerfect',
    content: 'Working with Owen was seamless. He brought our designs to life with pixel-perfect precision and smooth animations.',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '8',
    name: 'Alex Kumar',
    role: 'Lead Developer',
    company: 'NextGen Apps',
    content: 'Owen\'s technical skills are top-notch. He optimized our application performance by 300% and improved user experience significantly.',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '9',
    name: 'Maria Santos',
    role: 'Project Manager',
    company: 'GlobalTech',
    content: 'Professional, reliable, and incredibly talented. Owen delivered our project on time and within budget with exceptional quality.',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150'
  }
];

export const socialLinks: SocialLink[] = [
  { platform: 'GitHub', url: 'https://github.com/Owen-kasule', icon: 'github' },
  { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/owen-muhereza-kasule-teachrooot/', icon: 'linkedin' },
  { platform: 'Twitter', url: 'https://x.com/KingOWEN99', icon: 'twitter' },
  { platform: 'Instagram', url: 'https://www.instagram.com/muhereza_0wen/', icon: 'instagram' },
  { platform: 'WhatsApp', url: 'https://wa.me/256757791959', icon: 'whatsapp' }
];