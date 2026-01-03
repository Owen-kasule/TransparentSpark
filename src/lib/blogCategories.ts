export const BLOG_CATEGORIES = [
  'AI-Augmented Development',
  'Full-Stack Architecture',
  'DevSecOps & Security',
  'Cloud-Native & Scaling',
  'Product & UI/UX Design',
  'Emerging Tech (Web3 & XR)',
  'Engineering Culture & Career',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
