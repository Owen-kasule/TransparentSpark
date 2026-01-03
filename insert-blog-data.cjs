import { supabase } from '../lib/supabase';

const categories = [
  'AI-Augmented Development',
  'Full-Stack Architecture',
  'DevSecOps & Security',
  'Cloud-Native & Scaling',
  'Product & UI/UX Design',
  'Emerging Tech (Web3 & XR)',
  'Engineering Culture & Career'
];

const samplePosts = categories.flatMap((cat, i) => [
  {
    id: randomUUID(),
    title: `Sample ${cat} Article #1`,
    slug: `sample-${cat.toLowerCase()}-1`,
    excerpt: `This is a short excerpt for the first ${cat} article.`,
    content: `This is a sample post about ${cat}.`,
    date: new Date(Date.now() - (i+1)*86400000).toISOString().slice(0,10),
    read_time: `${6 + i} min read`,
    category: cat,
    image_url: `https://images.pexels.com/photos/1103538${i}/pexels-photo-1103538${i}.jpeg?auto=compress&cs=tinysrgb&w=800`,
    images: [
      `https://images.pexels.com/photos/1103538${i}/pexels-photo-1103538${i}.jpeg?auto=compress&cs=tinysrgb&w=800`,
      `https://images.pexels.com/photos/1103539${i}/pexels-photo-1103539${i}.jpeg?auto=compress&cs=tinysrgb&w=800`
    ],
    featured: i % 2 === 0,
    views: 100 + i * 10,
    likes: 10 + i,
    tags: [cat, 'Sample', 'Demo'],
    author_name: `Author ${cat}`,
    author_avatar: `https://images.pexels.com/photos/22045${i}/pexels-photo-22045${i}.jpeg?auto=compress&cs=tinysrgb&w=150`,
    author_bio: `This is a sample bio for ${cat} author.`,
    published: true,
    is_sample: true,
    published_at: new Date(Date.now() - (i+1)*86400000).toISOString(),
    created_at: new Date(Date.now() - (i+1)*86400000).toISOString(),
    updated_at: new Date(Date.now() - (i+1)*86400000).toISOString()
  },
  {
    id: randomUUID(),
    title: `Sample ${cat} Article #2`,
    slug: `sample-${cat.toLowerCase()}-2`,
    excerpt: `This is a short excerpt for the second ${cat} article.`,
    content: `Another sample post about ${cat}.`,
    date: new Date(Date.now() - (i+2)*86400000).toISOString().slice(0,10),
    read_time: `${7 + i} min read`,
    category: cat,
    image_url: `https://images.pexels.com/photos/1103540${i}/pexels-photo-1103540${i}.jpeg?auto=compress&cs=tinysrgb&w=800`,
    images: [
      `https://images.pexels.com/photos/1103540${i}/pexels-photo-1103540${i}.jpeg?auto=compress&cs=tinysrgb&w=800`,
      `https://images.pexels.com/photos/1103541${i}/pexels-photo-1103541${i}.jpeg?auto=compress&cs=tinysrgb&w=800`
    ],
    featured: i % 2 !== 0,
    views: 120 + i * 10,
    likes: 12 + i,
    tags: [cat, 'Sample', 'Demo'],
    author_name: `Author ${cat}`,
    author_avatar: `