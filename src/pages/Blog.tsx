import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Tag, ArrowDown, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import SocialLinks from '../components/ui/SocialLinks';
import BlogSearch from '../components/blog/BlogSearch';
import SEO from '../components/SEO';
import { useAnalytics } from '../hooks/useAnalytics';
import { getFeaturedPosts, getRecentPosts, getAllCategories, getAllPosts, type BlogPost } from '../data/blogData';
import ProgressiveImage from '../components/ui/ProgressiveImage';
import BlogCardCarousel from '../components/blog/BlogCardCarousel';
import { supabase } from '../lib/supabase';

const Blog: React.FC = () => {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [additionalPosts, setAdditionalPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<BlogPost[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [moreArticlesCategory, setMoreArticlesCategory] = useState<string>('all');
  
  // Streaming loading states
  const [featuredLoaded, setFeaturedLoaded] = useState(false);
  const [recentLoaded, setRecentLoaded] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [additionalLoaded, setAdditionalLoaded] = useState(false);

  // Track page visit
  useAnalytics('blog');

  // Consistent excerpt / description truncation (character-based for uniformity)
  const EXCERPT_MAX_CHARS = 120; // adjust as desired
  const truncateExcerpt = (text: string, max: number = EXCERPT_MAX_CHARS) => {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.slice(0, max).trimEnd() + '…';
  };
  
  // Responsive uniform card heights (mobile -> desktop) for consistent grid alignment
  const CARD_HEIGHT_BASE = 'h-[360px]'; // mobile base height
  const CARD_HEIGHT_RESP = 'md:h-[400px] lg:h-[420px]'; // scale up on larger screens
  const cardHeightClass = `${CARD_HEIGHT_BASE} ${CARD_HEIGHT_RESP} flex flex-col`; // applied to outer card

  useEffect(() => {
    loadBlogData();
    
    // Set up real-time subscription for blog posts
    const subscription = supabase
      .channel('blog_posts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'blog_posts',
          filter: 'published=eq.true'
        }, 
        (payload: any) => {
          console.log('Blog posts updated:', payload);
          // Reload data when posts are added, updated, or deleted
          loadBlogData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadBlogData = async () => {
    try {
      setIsLoading(true);
      
      // Stream 1: Load featured posts immediately (highest priority)
      getFeaturedPosts().then(featured => {
        setFeaturedPosts(featured);
        setFeaturedLoaded(true);
        setIsLoading(false); // Show page as soon as featured posts load
      }).catch(error => {
        console.error('Error loading featured posts:', error);
        setFeaturedLoaded(true);
        setIsLoading(false);
      });
      
      // Stream 2: Load recent posts (second priority)
      getRecentPosts().then(recent => {
        setRecentPosts(recent);
        setRecentLoaded(true);
      }).catch(error => {
        console.error('Error loading recent posts:', error);
        setRecentLoaded(true);
      });
      
      // Stream 3: Load categories (third priority)
      getAllCategories().then(allCategories => {
        setCategories(allCategories);
        setCategoriesLoaded(true);
      }).catch(error => {
        console.error('Error loading categories:', error);
        setCategoriesLoaded(true);
      });
      
      // Stream 4: Load additional posts (lowest priority)
      getAllPosts().then(allPosts => {
        const additional = allPosts
          .filter(post => !post.featured)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(3, 9);
        setAdditionalPosts(additional);
        setAdditionalLoaded(true);
      }).catch(error => {
        console.error('Error loading additional posts:', error);
        setAdditionalLoaded(true);
      });
      
    } catch (error) {
      console.error('Error loading blog data:', error);
      setIsLoading(false);
    }
  };

  const handleSearchResults = (results: BlogPost[]) => {
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
    // Reset category filter when searching to show all search results
    if (results.length > 0) {
      setSelectedCategory('all');
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowSearchResults(false); // Hide search results when filtering by category
  };

  const handleMoreArticlesCategorySelect = (category: string) => {
    setMoreArticlesCategory(category);
  };

  // Filter posts by selected category
  const getFilteredPosts = (posts: BlogPost[]) => {
    if (selectedCategory === 'all') return posts;
    return posts.filter(post => post.category === selectedCategory);
  };

  // Filter posts for More Articles section
  const getFilteredMoreArticlesPosts = (posts: BlogPost[]) => {
    if (moreArticlesCategory === 'all') return posts;
    return posts.filter(post => post.category === moreArticlesCategory);
  };

  // Get post count for each category
  const getCategoryCount = (category: string) => {
    if (category === 'all') {
      return featuredPosts.length + recentPosts.length + additionalPosts.length;
    }
    const allPosts = [...featuredPosts, ...recentPosts, ...additionalPosts];
    return allPosts.filter(post => post.category === category).length;
  };

  // Get post count for More Articles section specifically
  const getMoreArticlesCategoryCount = (category: string) => {
    if (category === 'all') {
      return additionalPosts.length;
    }
    return additionalPosts.filter(post => post.category === category).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 relative">
        {/* Social Links on all pages */}
        <div className="hidden lg:block">
          <SocialLinks vertical className="fixed left-8 bottom-32 transform" />
        </div>

        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
              BLOG
            </h1>
            <div className="flex items-center justify-center mb-4">
              <div className="h-1 w-24 bg-azure-400"></div>
            </div>
            <p className="text-white/70 max-w-2xl mx-auto text-sm mb-8">
              Insights, tutorials, and thoughts on modern web development
            </p>
          </motion.div>

          {/* Loading State */}
          <div className="flex items-center justify-center py-20">
            <GlassCard className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-400 mx-auto mb-4"></div>
              <p className="text-white/70">Loading articles...</p>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 relative">
      <SEO 
        title="Blog - Insights & Tutorials"
        description="Explore insights, tutorials, and thoughts on modern web development. Learn React, TypeScript, CSS, and more."
        url="/blog"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Owen's Development Blog",
          "description": "Insights, tutorials, and thoughts on modern web development",
          "url": "https://owen-portfolio.com/blog",
          "author": {
            "@type": "Person",
            "name": "Owen",
            "url": "https://owen-portfolio.com"
          },
          "blogPost": featuredPosts.map(post => ({
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "datePublished": post.date,
            "author": {
              "@type": "Person",
              "name": post.author_name
            },
            "url": `https://owen-portfolio.com/blog/${post.id}`
          }))
        }}
      />
      
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
          className="text-center mb-8"
        >
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
            BLOG
          </h1>
          <div className="flex items-center justify-center mb-4">
            <div className="h-1 w-24 bg-azure-400"></div>
          </div>
          <p className="text-white/70 max-w-2xl mx-auto text-sm mb-8">
            Insights, tutorials, and thoughts on modern web development
          </p>

          {/* Search Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <BlogSearch onSearchResults={handleSearchResults} />
          </motion.div>

          {/* Categories Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6"
          >
            <GlassCard className="p-4">
              <h3 className="text-lg font-bold text-white mb-3 text-center">Categories</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {!categoriesLoaded ? (
                  // Skeleton loading for categories
                  [...Array(6)].map((_, index) => (
                    <div key={`category-skeleton-${index}`} className="w-20 h-6 bg-white/10 rounded-full animate-pulse"></div>
                  ))
                ) : (
                  <>
                    <button 
                      onClick={() => handleCategorySelect('all')}
                      className={`px-3 py-1 rounded-full text-sm transition-colors duration-300 cursor-pointer border ${
                        selectedCategory === 'all' 
                          ? 'bg-azure-400 text-white border-azure-400' 
                          : 'bg-azure-400/20 text-azure-400 border-azure-400/30 hover:bg-azure-400/30 hover:border-azure-400/50'
                      }`}
                    >
                      <Tag size={12} className="inline mr-1" />
                      All
                      {categoriesLoaded && (
                        <span className="ml-1 text-xs opacity-70">
                          ({getCategoryCount('all')})
                        </span>
                      )}
                    </button>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <button 
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors duration-300 cursor-pointer border ${
                            selectedCategory === category 
                              ? 'bg-azure-400 text-white border-azure-400' 
                              : 'bg-azure-400/20 text-azure-400 border-azure-400/30 hover:bg-azure-400/30 hover:border-azure-400/50'
                          }`}
                        >
                          <Tag size={12} className="inline mr-1" />
                          {category}
                          {categoriesLoaded && (
                            <span className="ml-1 text-xs opacity-70">
                              ({getCategoryCount(category)})
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="text-white/60">No categories available</p>
                    )}
                  </>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Search Results Section */}
        {showSearchResults && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Search Results ({searchResults.length})
                </h2>
                <div className="flex items-center space-x-4">
                  {selectedCategory !== 'all' && (
                    <span className="px-3 py-1 bg-azure-400/20 text-azure-400 rounded-full text-sm">
                      <Tag size={12} className="inline mr-1" />
                      {selectedCategory}
                    </span>
                  )}
                  <button
                    onClick={clearSearch}
                    className="text-white/60 hover:text-white transition-colors duration-300 text-sm"
                  >
                    Clear search
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((post, index) => (
                  <Link key={post.id} to={`/blog/${post.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group"
                    >
                      <div className={`bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300 group-hover:scale-105 border border-white/10 ${cardHeightClass}`}>
                        <div className="rounded-lg overflow-hidden mb-3 relative h-[140px] md:h-[160px] lg:h-[180px]">
                          <ProgressiveImage
                            src={post.image_url}
                            alt={post.title}
                            wrapperClassName="w-full h-full"
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            initialBlur
                            skeleton
                            lazy
                          />
                          {post.featured && (
                            <div className="absolute top-2 right-2 bg-azure-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Featured
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center space-x-3 mb-2 h-[28px]">
                            <span className="px-2 py-1 bg-azure-400/20 text-azure-400 rounded-full text-xs">
                              {post.category}
                            </span>
                            <div className="flex items-center text-white/60 text-xs">
                              <Calendar size={12} className="mr-1" />
                              {new Date(post.date).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-azure-400 transition-colors duration-300 h-[44px]">
                            {post.title}
                          </h3>
                          
                          <p className="text-white/70 text-sm mb-3 line-clamp-2 h-[40px]">{truncateExcerpt(post.excerpt)}</p>
                          
                          <div className="flex items-center justify-between mt-auto h-[24px]">
                            <div className="flex items-center space-x-4 text-white/60 text-xs">
                              <div className="flex items-center">
                                <Clock size={12} className="mr-1" />
                                {post.read_time}
                              </div>
                              <div className="flex items-center">
                                <Eye size={12} className="mr-1" />
                                {post.views}
                              </div>
                              <div className="flex items-center">
                                <Heart size={12} className="mr-1" />
                                {post.likes}
                              </div>
                            </div>
                            <ArrowRight size={16} className="text-azure-400 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </GlassCard>
          </motion.section>
        )}

        {/* Featured Posts */}
        {!showSearchResults && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                {selectedCategory === 'all' ? 'Featured Posts' : `Featured Posts in ${selectedCategory}`}
              </h2>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => handleCategorySelect('all')}
                  className="text-azure-400 hover:text-white text-sm transition-colors duration-300"
                >
                  View All
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {!featuredLoaded ? (
                // Skeleton loading for featured posts
                [...Array(3)].map((_, index) => (
                  <GlassCard key={`featured-skeleton-${index}`} delay={0.5 + index * 0.1} className="p-4 animate-pulse">
                    <div className="aspect-video rounded-lg bg-white/10 mb-3"></div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-16 h-4 bg-white/10 rounded-full"></div>
                      <div className="w-20 h-3 bg-white/10 rounded"></div>
                    </div>
                    <div className="w-full h-5 bg-white/10 rounded mb-2"></div>
                    <div className="w-3/4 h-5 bg-white/10 rounded mb-3"></div>
                    <div className="w-full h-4 bg-white/10 rounded"></div>
                    <div className="w-1/2 h-4 bg-white/10 rounded"></div>
                  </GlassCard>
                ))
              ) : (() => {
                const filteredFeaturedPosts = getFilteredPosts(featuredPosts);
                return filteredFeaturedPosts.length > 0 ? (
                  filteredFeaturedPosts.slice(0, 3).map((post, index) => (
                    <Link key={post.id} to={`/blog/${post.id}`}>
                      <GlassCard delay={0.5 + index * 0.1} className={`p-4 group hover:scale-105 transition-transform duration-300 ${cardHeightClass}`}>
                        <div className="rounded-lg overflow-hidden mb-3 relative h-[140px] md:h-[160px] lg:h-[180px]">
                          <BlogCardCarousel
                            images={post.images}
                            fallback={post.image_url}
                            alt={post.title}
                            badge={<div className="absolute top-2 right-2 bg-azure-500 text-white px-2 py-1 rounded-full text-xs font-medium">Featured</div>}
                            className="h-full"
                          />
                        </div>
                        <div className="flex items-center space-x-3 mb-2 h-[28px]">
                          <span className="px-2 py-1 bg-azure-400/20 text-azure-400 rounded-full text-xs">
                            {post.category}
                          </span>
                          <div className="flex items-center text-white/60 text-xs">
                            <Calendar size={12} className="mr-1" />
                            {new Date(post.date).toLocaleDateString()}
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-azure-400 transition-colors duration-300 h-[44px]">
                          {post.title}
                        </h3>
                        <p className="text-white/70 text-sm mb-3 line-clamp-2 h-[40px]">{truncateExcerpt(post.excerpt)}</p>
                        <div className="flex items-center justify-between h-[24px] mt-auto">
                          <div className="flex items-center space-x-4 text-white/60 text-xs">
                            <div className="flex items-center">
                              <Clock size={12} className="mr-1" />
                              {post.read_time}
                            </div>
                            <div className="flex items-center">
                              <Eye size={12} className="mr-1" />
                              {post.views}
                            </div>
                            <div className="flex items-center">
                              <Heart size={12} className="mr-1" />
                              {post.likes}
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-azure-400 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </GlassCard>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-white/60">
                      No featured posts available{selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}
                    </p>
                  </div>
                );
              })()}
            </div>
          </motion.section>
        )}

        {/* Recent Posts */}
        {!showSearchResults && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                {selectedCategory === 'all' ? 'Recent Posts' : `Recent Posts in ${selectedCategory}`}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {!recentLoaded ? (
                // Skeleton loading for recent posts
                [...Array(3)].map((_, index) => (
                  <GlassCard key={`recent-skeleton-${index}`} delay={0.7 + index * 0.1} className="p-4 animate-pulse">
                    <div className="aspect-video rounded-lg bg-white/10 mb-3"></div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-16 h-4 bg-white/10 rounded-full"></div>
                      <div className="w-20 h-3 bg-white/10 rounded"></div>
                    </div>
                    <div className="w-full h-5 bg-white/10 rounded mb-2"></div>
                    <div className="w-3/4 h-5 bg-white/10 rounded mb-3"></div>
                    <div className="w-full h-4 bg-white/10 rounded"></div>
                    <div className="w-1/2 h-4 bg-white/10 rounded"></div>
                  </GlassCard>
                ))
              ) : (() => {
                const filteredRecentPosts = getFilteredPosts(recentPosts);
                return filteredRecentPosts.length > 0 ? (
                  filteredRecentPosts.slice(0, 3).map((post, index) => (
                    <Link key={post.id} to={`/blog/${post.id}`}>
                      <GlassCard delay={0.7 + index * 0.1} className={`p-4 group hover:scale-105 transition-transform duration-300 ${cardHeightClass}`}>
                        <div className="aspect-video rounded-lg overflow-hidden mb-3 relative">
                          <BlogCardCarousel
                            images={post.images}
                            fallback={post.image_url}
                            alt={post.title}
                            className="h-full"
                          />
                        </div>
                        <div className="flex items-center space-x-3 mb-2 h-[28px]">
                          <span className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs">
                            {post.category}
                          </span>
                          <div className="flex items-center text-white/60 text-xs">
                            <Calendar size={12} className="mr-1" />
                            {new Date(post.date).toLocaleDateString()}
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-azure-400 transition-colors duration-300 h-[44px]">
                          {post.title}
                        </h3>
                        <p className="text-white/70 text-sm mb-3 line-clamp-2 h-[40px]">{truncateExcerpt(post.excerpt)}</p>
                        <div className="flex items-center justify-between h-[24px] mt-auto">
                          <div className="flex items-center space-x-4 text-white/60 text-xs">
                            <div className="flex items-center">
                              <Clock size={12} className="mr-1" />
                              {post.read_time}
                            </div>
                            <div className="flex items-center">
                              <Eye size={12} className="mr-1" />
                              {post.views}
                            </div>
                            <div className="flex items-center">
                              <Heart size={12} className="mr-1" />
                              {post.likes}
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-azure-400 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </GlassCard>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-white/60">
                      No recent posts available{selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}
                    </p>
                  </div>
                );
              })()}
            </div>
          </motion.section>
        )}

        {/* More Articles Snippet */}
        {!showSearchResults && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mb-8"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {moreArticlesCategory === 'all' ? 'More Articles' : `More Articles in ${moreArticlesCategory}`}
              </h2>
              <p className="text-white/60 text-sm mb-4">Discover more insights and tutorials</p>
              
              {/* Simple Category Filter */}
              <div className="flex flex-wrap justify-center gap-2">
                <button 
                  onClick={() => handleMoreArticlesCategorySelect('all')}
                  className={`px-3 py-1 rounded-full text-xs transition-colors duration-300 cursor-pointer ${
                    moreArticlesCategory === 'all' 
                      ? 'bg-azure-400 text-white' 
                      : 'bg-azure-400/20 text-azure-400 hover:bg-azure-400/30'
                  }`}
                >
                  All ({getMoreArticlesCategoryCount('all')})
                </button>
                {categories.map((category) => (
                  <button 
                    key={category}
                    onClick={() => handleMoreArticlesCategorySelect(category)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors duration-300 cursor-pointer ${
                      moreArticlesCategory === category 
                        ? 'bg-azure-400 text-white' 
                        : 'bg-azure-400/20 text-azure-400 hover:bg-azure-400/30'
                    }`}
                  >
                    {category} ({getMoreArticlesCategoryCount(category)})
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {!additionalLoaded ? (
                // Skeleton loading for additional posts
                [...Array(6)].map((_, index) => (
                  <motion.div
                    key={`additional-skeleton-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
                  >
                    <GlassCard className="p-4 h-full animate-pulse">
                      <div className="aspect-video rounded-lg bg-white/10 mb-3"></div>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-16 h-4 bg-white/10 rounded-full"></div>
                        <div className="w-16 h-3 bg-white/10 rounded"></div>
                      </div>
                      <div className="w-full h-4 bg-white/10 rounded mb-2"></div>
                      <div className="w-3/4 h-4 bg-white/10 rounded mb-3"></div>
                      <div className="w-full h-3 bg-white/10 rounded"></div>
                      <div className="w-1/2 h-3 bg-white/10 rounded"></div>
                    </GlassCard>
                  </motion.div>
                ))
              ) : (() => {
                const filteredAdditionalPosts = getFilteredMoreArticlesPosts(additionalPosts);
                return filteredAdditionalPosts.length > 0 ? (
                  filteredAdditionalPosts.map((post, index) => (
                    <Link key={post.id} to={`/blog/${post.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
                        className="group"
                      >
                        <GlassCard className={`p-4 hover:scale-105 transition-transform duration-300 h-full ${cardHeightClass}`}> 
                          <div className="rounded-lg overflow-hidden mb-3 h-[140px] md:h-[160px] lg:h-[180px] relative">
                            <BlogCardCarousel
                              images={post.images}
                              fallback={post.image_url}
                              alt={post.title}
                              className="h-full"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-2 h-[28px]">
                            <span className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs">
                              {post.category}
                            </span>
                            <div className="flex items-center text-white/60 text-xs">
                              <Calendar size={10} className="mr-1" />
                              {new Date(post.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                          
                          <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-azure-400 transition-colors duration-300 h-[44px]">
                            {post.title}
                          </h3>
                          
                          <p className="text-white/70 text-sm mb-3 line-clamp-2 h-[40px]">{truncateExcerpt(post.excerpt)}</p>
                          
                          <div className="flex items-center justify-between text-xs h-[24px] mt-auto">
                            <div className="flex items-center space-x-3 text-white/60">
                              <div className="flex items-center">
                                <Clock size={10} className="mr-1" />
                                {post.read_time}
                              </div>
                              <div className="flex items-center">
                                <Eye size={10} className="mr-1" />
                                {post.views > 1000 ? `${(post.views / 1000).toFixed(1)}k` : post.views}
                              </div>
                            </div>
                            <ArrowRight size={14} className="text-azure-400 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </GlassCard>
                      </motion.div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-white/60">
                      No additional posts available{moreArticlesCategory !== 'all' ? ` in ${moreArticlesCategory}` : ''}
                    </p>
                  </div>
                );
              })()}
            </div>
            
            {/* View All Posts Button */}
            {additionalLoaded && (
              <div className="text-center mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                >
                  <p className="text-white/60 text-sm">
                    {moreArticlesCategory === 'all' 
                      ? 'Use the filters above to explore articles by specific topics'
                      : `Currently showing ${moreArticlesCategory} articles. Change the filter above to explore other topics.`
                    }
                  </p>
                </motion.div>
              </div>
            )}
          </motion.section>
        )}

        {/* Mobile Social Links */}
        <div className="lg:hidden text-center mb-8">
          <SocialLinks />
        </div>
      </div>
    </div>
  );
};

export default Blog;