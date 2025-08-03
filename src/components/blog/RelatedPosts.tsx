import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Eye, Heart, BookOpen } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { BlogPost } from '../../data/blogData';

interface RelatedPostsProps {
  posts: BlogPost[];
  currentPostId: string;
  title?: string;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ 
  posts, 
  currentPostId, 
  title = "Related Posts" 
}) => {
  // Filter out the current post
  const filteredPosts = posts.filter(post => post.id !== currentPostId);

  if (filteredPosts.length === 0) {
    return null;
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <BookOpen className="text-azure-400" size={24} />
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {filteredPosts.slice(0, 3).map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              to={`/blog/${post.id}`}
              className="group block h-full"
            >
              <div className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300 h-full flex flex-col group-hover:scale-105">
                {/* Image */}
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={post.image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-azure-500 text-white rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>

                  {/* Featured Badge */}
                  {post.featured && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-yellow-500 text-black rounded-full text-xs font-medium">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Meta Info */}
                  <div className="flex items-center space-x-3 mb-2 text-white/60 text-xs">
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{post.read_time}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-azure-400 transition-colors duration-300 flex-1">
                    {post.title}
                  </h4>

                  {/* Excerpt */}
                  <p className="text-white/70 text-sm mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Stats and Read More */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center space-x-3 text-white/60 text-xs">
                      {post.views && (
                        <div className="flex items-center space-x-1">
                          <Eye size={12} />
                          <span>{post.views.toLocaleString()}</span>
                        </div>
                      )}
                      {post.likes && (
                        <div className="flex items-center space-x-1">
                          <Heart size={12} />
                          <span>{post.likes}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 text-azure-400 text-xs font-medium">
                      <span>Read More</span>
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* View All Posts Link */}
      {filteredPosts.length > 3 && (
        <div className="text-center mt-6">
          <Link
            to="/blog"
            className="inline-flex items-center space-x-2 text-azure-400 hover:text-azure-300 transition-colors duration-300 font-medium"
          >
            <span>View All Posts</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </GlassCard>
  );
};

export default RelatedPosts;