// ─── Content type definitions for the CMS ───

export interface ImageSpec {
  width: number;
  height: number;
  maxSizeMB: number;
  label: string;
}

// ─── Image dimension requirements ───
export const IMAGE_SPECS: Record<string, ImageSpec> = {
  heroDesktopLight: { width: 1920, height: 1080, maxSizeMB: 3, label: 'Desktop Light Background' },
  heroDesktopDark:  { width: 1920, height: 1080, maxSizeMB: 3, label: 'Desktop Dark Background' },
  heroMobile:       { width: 390, height: 844,  maxSizeMB: 2, label: 'Mobile Background' },
  profileDesktop:   { width: 400, height: 600,  maxSizeMB: 2, label: 'Profile Image (Desktop)' },
  profileMobile:    { width: 160, height: 160,  maxSizeMB: 1, label: 'Profile Image (Mobile)' },
  projectThumb:     { width: 800, height: 450,  maxSizeMB: 2, label: 'Project Thumbnail' },
};

// ─── Field validation rules ───
export interface FieldRule {
  min: number;
  max: number;
}

export const TEXT_LIMITS: Record<string, FieldRule> = {
  // Home
  heroGreeting:       { min: 2, max: 20 },
  heroFirstName:      { min: 1, max: 20 },
  heroMiddleInitial:  { min: 0, max: 5 },
  heroLastName:       { min: 1, max: 30 },
  heroSubtitle:       { min: 5, max: 50 },
  heroDescription:    { min: 20, max: 500 },
  heroSkillLabel:     { min: 2, max: 20 },
  ctaButtonText:      { min: 3, max: 30 },
  featuredTitle:      { min: 3, max: 50 },
  featuredSubtitle:   { min: 5, max: 100 },
  // About
  pageTitle:          { min: 3, max: 30 },
  sectionTitle:       { min: 3, max: 40 },
  storyParagraph:     { min: 20, max: 1000 },
  statLabel:          { min: 2, max: 25 },
  statValue:          { min: 1, max: 10 },
  skillName:          { min: 1, max: 30 },
  skillCategory:      { min: 2, max: 20 },
  // Contact
  pageSubtitle:       { min: 10, max: 200 },
  contactLabel:       { min: 2, max: 20 },
  contactValue:       { min: 2, max: 60 },
  // Resume
  personName:         { min: 2, max: 60 },
  personTitle:        { min: 5, max: 80 },
  summary:            { min: 20, max: 500 },
  companyName:        { min: 2, max: 60 },
  jobTitle:           { min: 2, max: 60 },
  duration:           { min: 4, max: 30 },
  location:           { min: 2, max: 40 },
  description:        { min: 10, max: 500 },
  achievement:        { min: 10, max: 300 },
  technology:         { min: 1, max: 40 },
  degreeName:         { min: 5, max: 80 },
  schoolName:         { min: 2, max: 80 },
  certName:           { min: 3, max: 80 },
  certIssuer:         { min: 2, max: 60 },
  certDate:           { min: 4, max: 20 },
  // Projects
  projectTitle:       { min: 3, max: 60 },
  projectDescription: { min: 10, max: 500 },
  // Footer / Header
  brandName:          { min: 1, max: 30 },
  logoText:           { min: 1, max: 5 },
  navLabel:           { min: 2, max: 15 },
  // Social
  socialPlatform:     { min: 2, max: 20 },
  socialUrl:          { min: 5, max: 200 },
};

// ─── Section content interfaces ───

export interface ThemeContent {
  primaryColor: string;
  heroDesktopLight: string;
  heroDesktopDark: string;
  heroMobile: string;
}

export interface HomeContent {
  heroGreeting: string;
  heroFirstName: string;
  heroMiddleInitial: string;
  heroLastName: string;
  heroSubtitle: string;
  heroDescription: string;
  heroSkills: Array<{ icon: string; label: string }>;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryTextShort: string;
  ctaSecondaryLink: string;
  featuredTitle: string;
  featuredSubtitle: string;
  profileImageDesktop: string;
  profileImageMobile: string;
}

export interface AboutContent {
  pageTitle: string;
  storyTitle: string;
  storyParagraphs: string[];
  statsTitle: string;
  stats: Array<{ label: string; value: string; target: number }>;
  techStackTitle: string;
  techStack: Array<{ category: string; skills: string[] }>;
}

export interface ContactContent {
  pageTitle: string;
  pageSubtitle: string;
  formTitle: string;
  contactInfo: Array<{ icon: string; label: string; value: string; href: string }>;
  successTitle: string;
  successMessage: string;
  recipientEmail: string;
}

export interface ResumeContent {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    summary: string;
  };
  experience: Array<{
    id: number;
    company: string;
    position: string;
    duration: string;
    location: string;
    description: string;
    achievements: string[];
    technologies: string[];
  }>;
  education: Array<{
    id: number;
    degree: string;
    school: string;
    duration: string;
    location: string;
    gpa: string;
    relevantCourses: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
}

export interface ProjectsContent {
  pageTitle: string;
  pageSubtitle: string;
  projects: ProjectItem[];
}

export interface FooterContent {
  brandName: string;
}

export interface HeaderContent {
  logoText: string;
  navItems: Array<{ name: string; path: string }>;
}

export interface SocialContent {
  links: Array<{ platform: string; url: string; icon: string }>;
}

export interface SiteContent {
  theme: ThemeContent;
  home: HomeContent;
  about: AboutContent;
  contact: ContactContent;
  resume: ResumeContent;
  projects: ProjectsContent;
  footer: FooterContent;
  header: HeaderContent;
  social: SocialContent;
}

export type SiteSection = keyof SiteContent;
