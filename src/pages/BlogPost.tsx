import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  BookOpen, 
  Tag, 
  Eye,
  Heart,
  MessageCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowDown
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import SocialLinks from '../components/ui/SocialLinks';
import CommentSection from '../components/blog/CommentSection';
import SocialShare from '../components/blog/SocialShare';
import RelatedPosts from '../components/blog/RelatedPosts';
import SEO from '../components/SEO';
import { useAnalytics } from '../hooks/useAnalytics';
import { getBlogPostById, getRelatedPosts, getAllPosts, type BlogPost } from '../data/blogData';
import { blogService } from '../lib/blogService';

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [additionalRelatedPosts, setAdditionalRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isLikeStatusLoaded, setIsLikeStatusLoaded] = useState(false);

  // Ref for comments section
  const commentsRef = useRef<HTMLDivElement>(null);
  // Bulletproof like state management
  const likeStateRef = useRef<{
    isLiked: boolean;
    count: number;
    isUserSet: boolean;
    lastAction: number;
    isProcessing: boolean;
  }>({
    isLiked: false,
    count: 0,
    isUserSet: false,
    lastAction: 0,
    isProcessing: false
  });

  // Track page visit
  useAnalytics(`blog-post-${id}`);

  useEffect(() => {
    if (!id) {
      navigate('/blog');
      return;
    }

    // Reset like state when post changes
    likeStateRef.current = { 
      isLiked: false, 
      count: 0, 
      isUserSet: false, 
      lastAction: 0, 
      isProcessing: false 
    };
    loadBlogPost();
  }, [id]);

  const loadBlogPost = async () => {
    if (!id) return;
    
    // Don't reload if we're in the middle of a like operation
    if (likeStateRef.current.isProcessing) {
      console.log('🔄 Skipping loadBlogPost during like operation');
      return;
    }

    try {
      setIsLoading(true);
      
      // Load the blog post
      const foundPost = await getBlogPostById(id);
      
      if (foundPost) {
        setPost(foundPost);
        setCommentCount(foundPost.comments || 0);
        
        // Only update like count if user hasn't set their own state
        if (!likeStateRef.current.isUserSet) {
          setLikeCount(foundPost.likes || 0);
        }
        
        // Track view
        await blogService.trackView(id);
        
        // Check if user has liked this post (only if user hasn't set their own state)
        if (!likeStateRef.current.isUserSet) {
          const hasLiked = await blogService.hasLiked(id);
          setIsLiked(hasLiked);
          likeStateRef.current.isLiked = hasLiked;
        } else {
          // Use the user's set state
          setIsLiked(likeStateRef.current.isLiked);
        }
        setIsLikeStatusLoaded(true);
        
        // Get related posts
        const related = await getRelatedPosts(id, foundPost.category, 3);
        setRelatedPosts(related);

        // Get additional related posts for the bottom snippet
        const allPosts = await getAllPosts();
        const additional = allPosts
          .filter(p => p.id !== id && !related.some(rp => rp.id === p.id))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 6);
        setAdditionalRelatedPosts(additional);
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
      setIsLikeStatusLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!id) return;

    // Prevent multiple rapid clicks with timestamp check
    const now = Date.now();
    if (likeStateRef.current.isProcessing || (now - likeStateRef.current.lastAction) < 500) {
      console.log('🚫 Like action blocked - too soon or already processing');
      return;
    }

    // Store current state before making changes
    const currentLikeState = isLiked;
    const currentLikeCount = likeCount;

    console.log('🔍 Like action started:', { currentLikeState, currentLikeCount, postId: id });

    try {
      // Set processing flags
      setIsLiking(true);
      likeStateRef.current.isProcessing = true;
      likeStateRef.current.lastAction = now;
      
      // Update UI immediately for better UX (optimistic update)
      const newLikeState = !currentLikeState;
      const newLikeCount = currentLikeState ? Math.max(0, currentLikeCount - 1) : currentLikeCount + 1;
      
      console.log('🎨 Optimistic update:', { newLikeState, newLikeCount });
      
      // Update all state immediately
      setIsLiked(newLikeState);
      setLikeCount(newLikeCount);
      
      // Update the ref to track user's state
      likeStateRef.current = {
        isLiked: newLikeState,
        count: newLikeCount,
        isUserSet: true,
        lastAction: now,
        isProcessing: true
      };
      
      // Make the API call to sync with server
      const serverResponse = await blogService.toggleLike(id);
      
      console.log('🔄 Server response:', { serverResponse, expected: newLikeState });
      
      // The server response should match our optimistic update
      // If it doesn't, there was an error or the server state is different
      if (serverResponse !== newLikeState) {
        console.warn('❌ Server state mismatch, reverting optimistic update...');
        // Revert to original state if server response doesn't match
        setIsLiked(currentLikeState);
        setLikeCount(currentLikeCount);
        
        // Update the ref to match reverted state
        likeStateRef.current = {
          isLiked: currentLikeState,
          count: currentLikeCount,
          isUserSet: true,
          lastAction: now,
          isProcessing: false
        };
      } else {
        console.log('✅ Server response matches optimistic update');
        // Update ref to mark processing as complete
        likeStateRef.current.isProcessing = false;
      }
      
    } catch (error) {
      console.error('❌ Error handling like:', error);
      // Revert to original state on error
      setIsLiked(currentLikeState);
      setLikeCount(currentLikeCount);
      
      // Update the ref to match reverted state
      likeStateRef.current = {
        isLiked: currentLikeState,
        count: currentLikeCount,
        isUserSet: true,
        lastAction: now,
        isProcessing: false
      };
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentClick = () => {
    // Smooth scroll to comments section
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const nextImage = () => {
    if (post) {
      setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
    }
  };

  const prevImage = () => {
    if (post) {
      setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
    }
  };

  // Enhanced markdown to HTML conversion
  const convertMarkdownToHtml = (markdown: string): string => {
    return markdown
      // Convert headers (must be done before other replacements)
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Convert code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      
      // Convert inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // Convert bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Convert line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      
      // Wrap in paragraphs
      .replace(/^(?!<[h1-6]|<pre|<ul|<ol|<li)(.+)$/gim, '<p>$1</p>')
      
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<pre>.*<\/pre>)<\/p>/g, '$1');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-400 mx-auto mb-4"></div>
          <p className="text-white/70">Loading blog post...</p>
        </GlassCard>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-white/70 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link
            to="/blog"
            className="bg-azure-500 hover:bg-azure-600 text-white px-6 py-3 rounded-lg transition-colors duration-300 inline-flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Blog</span>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const currentUrl = window.location.href;

  return (
    <div className="min-h-screen pt-20 pb-12 relative">
      {post && (
        <SEO 
          title={post.title}
          description={post.excerpt}
          image={post.image_url}
          url={`/blog/${post.id}`}
          type="article"
          author={post.author_name}
          publishedTime={new Date(post.date).toISOString()}
          modifiedTime={post.updated_at ? new Date(post.updated_at).toISOString() : new Date(post.date).toISOString()}
          tags={post.tags}
          structuredData={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.excerpt,
            "image": post.image_url,
            "datePublished": new Date(post.date).toISOString(),
            "dateModified": post.updated_at ? new Date(post.updated_at).toISOString() : new Date(post.date).toISOString(),
            "author": {
              "@type": "Person",
              "name": post.author_name,
              "image": post.author_avatar,
              "description": post.author_bio
            },
            "publisher": {
              "@type": "Person",
              "name": "Owen",
              "url": "https://owen-portfolio.com"
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://owen-portfolio.com/blog/${post.id}`
            },
            "wordCount": post.content.split(' ').length,
            "timeRequired": post.read_time,
            "keywords": post.tags.join(', '),
            "articleSection": post.category,
            "interactionStatistic": [
              {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/ReadAction",
                "userInteractionCount": post.views
              },
              {
                "@type": "InteractionCounter", 
                "interactionType": "https://schema.org/LikeAction",
                "userInteractionCount": likeCount
              }
            ]
          }}
        />
      )}
      
      {/* Social Links */}
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

      <div className="container mx-auto px-6 max-w-4xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            to="/blog"
            className="inline-flex items-center space-x-2 text-white/70 hover:text-azure-400 transition-colors duration-300"
          >
            <ArrowLeft size={16} />
            <span>Back to Blog</span>
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Hero Image Gallery */}
          <div className="relative aspect-video rounded-2xl overflow-hidden">
            <img 
              src={post.images[currentImageIndex]} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            {post.images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <button
                  onClick={prevImage}
                  className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-300"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* Image Indicators */}
            {post.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {post.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-azure-500 text-white rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>
          </div>

          {/* Article Meta */}
          <GlassCard className="p-6">
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                {post.title}
              </h1>
              
              <p className="text-white/80 text-lg leading-relaxed">
                {post.excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-white/60 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{post.read_time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye size={16} />
                  <span>{post.views.toLocaleString()} views</span>
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center space-x-4 pt-4 border-t border-white/10">
                <img 
                  src={post.author_avatar} 
                  alt={post.author_name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{post.author_name}</h3>
                  <p className="text-white/60 text-sm">{post.author_bio}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    disabled={isLiking || !isLikeStatusLoaded}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isLiked 
                        ? 'bg-red-500/30 text-red-400 border border-red-400/50 hover:bg-red-500/40' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                    } ${isLiking ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    <Heart 
                      size={16} 
                      fill={isLiked ? 'currentColor' : 'none'} 
                      className={`transition-all duration-300 ${isLiking ? 'animate-pulse' : ''} ${
                        isLiked ? 'text-red-400' : 'text-white/70'
                      }`}
                    />
                    <span className={`font-medium ${isLiked ? 'text-red-400' : 'text-white/70'}`}>
                      {likeCount}
                    </span>
                  </button>
                  
                  {/* Clickable Comment Count */}
                  <button
                    onClick={handleCommentClick}
                    className="flex items-center space-x-2 text-white/60 hover:text-azure-400 transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
                    title="Go to comments"
                  >
                    <MessageCircle size={16} />
                    <span>{commentCount} comments</span>
                  </button>
                </div>

                {/* Social Share Component */}
                <SocialShare
                  url={currentUrl}
                  title={post.title}
                  description={post.excerpt}
                />
              </div>
            </div>
          </GlassCard>

          {/* Article Content */}
          <GlassCard className="p-8">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: convertMarkdownToHtml(post.content)
              }}
            />
          </GlassCard>

          {/* Tags */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-azure-400/20 text-azure-400 rounded-full text-sm hover:bg-azure-400/30 transition-colors duration-300 cursor-pointer flex items-center space-x-1"
                >
                  <Tag size={12} />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <RelatedPosts 
              posts={relatedPosts} 
              currentPostId={post.id}
              title="Related Articles"
            />
          )}

          {/* Comments Section with Ref */}
          <div ref={commentsRef}>
            <CommentSection 
              postId={post.id} 
              postTitle={post.title}
              onCommentCountChange={setCommentCount}
            />
          </div>

          {/* More Related Articles Snippet - AFTER Comments */}
          {additionalRelatedPosts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <GlassCard className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">More Related Articles</h2>
                  <p className="text-white/60 text-sm">Continue exploring related topics and insights</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {additionalRelatedPosts.map((relatedPost, index) => (
                    <Link key={relatedPost.id} to={`/blog/${relatedPost.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        className="group"
                      >
                        <div className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300 h-full flex flex-col group-hover:scale-105 border border-white/10">
                          {/* Image */}
                          <div className="aspect-video relative overflow-hidden">
                            <img 
                              src={relatedPost.image_url} 
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            
                            {/* Category Badge */}
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-1 bg-azure-500/80 text-white rounded-full text-xs font-medium">
                                {relatedPost.category}
                              </span>
                            </div>

                            {/* Featured Badge */}
                            {relatedPost.featured && (
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
                                <Calendar size={10} />
                                <span>{new Date(relatedPost.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock size={10} />
                                <span>{relatedPost.read_time}</span>
                              </div>
                            </div>

                            {/* Title */}
                            <h4 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-azure-400 transition-colors duration-300 flex-1 text-sm">
                              {relatedPost.title}
                            </h4>

                            {/* Excerpt */}
                            <p className="text-white/70 text-xs mb-3 line-clamp-2">
                              {relatedPost.excerpt}
                            </p>

                            {/* Stats and Read More */}
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center space-x-3 text-white/60 text-xs">
                                <div className="flex items-center space-x-1">
                                  <Eye size={10} />
                                  <span>{relatedPost.views > 1000 ? `${(relatedPost.views / 1000).toFixed(1)}k` : relatedPost.views}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Heart size={10} />
                                  <span>{relatedPost.likes}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 text-azure-400 text-xs font-medium">
                                <span>Read</span>
                                <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform duration-300" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>

                {/* View All Posts Link */}
                <div className="text-center mt-6">
                  <Link
                    to="/blog"
                    className="inline-flex items-center space-x-2 text-azure-400 hover:text-azure-300 transition-colors duration-300 font-medium"
                  >
                    <BookOpen size={16} />
                    <span>View All Articles</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </GlassCard>
            </motion.section>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Link
              to="/blog"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors duration-300 flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>All Posts</span>
            </Link>
            
            <Link
              to="/blog"
              className="bg-azure-500 hover:bg-azure-600 text-white px-6 py-3 rounded-lg transition-colors duration-300 flex items-center space-x-2"
            >
              <BookOpen size={16} />
              <span>More Articles</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.article>

        {/* Mobile Social Links */}
        <div className="lg:hidden text-center mt-8">
          <SocialLinks />
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;