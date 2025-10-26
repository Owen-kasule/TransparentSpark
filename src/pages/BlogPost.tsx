import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Eye,
  Heart,
  MessageCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ProgressiveImage from '../components/ui/ProgressiveImage';
import GlassCard from '../components/ui/GlassCard';
import SocialLinks from '../components/ui/SocialLinks';
import CommentSection from '../components/blog/CommentSection';
import SocialShare from '../components/blog/SocialShare';
import SEO from '../components/SEO';
import { useAnalytics } from '../hooks/useAnalytics';
import { getBlogPostById, getRelatedPosts, getAllPosts, type BlogPost } from '../data/blogData';
import { blogService } from '../lib/blogService';
import 'prismjs/themes/prism-tomorrow.css';

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  // Generate streamlined fallback content
  const generateFallbackContent = (p: BlogPost) => {
    const hasSubstantialContent = p.content && p.content.trim().length > 600;
    if (hasSubstantialContent) return '';
    
    return `# ${p.title}

This ${p.category.toLowerCase()} article covers essential concepts and practical implementation details for modern web development. Below you'll find key insights, code examples, and actionable takeaways.

**In this article:** ${p.tags.slice(0, 3).join(', ')} • ${p.read_time} • ${p.category}

## Implementation Example

\`\`\`ts
// Sample implementation pattern
function createHandler(config: Config) {
  return async (request: Request) => {
    const result = await processRequest(request, config);
    return new Response(JSON.stringify(result));
  };
}
\`\`\`

**What's Next:** Continue exploring these concepts by implementing similar patterns in your own projects. This placeholder content will be replaced when the full article is added.`;
  };

  const [additionalRelatedPosts, setAdditionalRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isLikeStatusLoaded, setIsLikeStatusLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Ref for comments section
  const commentsRef = useRef<HTMLDivElement>(null);
  // Bulletproof like state management
  const likeStateRef = useRef<{
    isLiked: boolean;
    count: number;
    isUserSet: boolean;
    lastAction: number;
    isProcessing: boolean;
  }>({ isLiked: false, count: 0, isUserSet: false, lastAction: 0, isProcessing: false });

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

  // Hero gallery controls (restored)
  const nextImage = () => {
    if (!post || post.images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
  };

  const prevImage = () => {
    if (!post || post.images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
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


  // Enhanced markdown to HTML conversion
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

  const convertMarkdownToHtml = (markdown: string): string => {
    const processed = markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, lang, code) => {
        const safe = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre><code class="language-${lang || 'text'}">${safe}</code></pre>`;
      })
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // paragraphs
      .replace(/\r/g, '')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/^((?!<h[1-3]|<pre|<ul|<ol|<li|<p>).+)$/gim, '<p>$1</p>');

    // Add IDs to headings
    return processed.replace(/<h([1-3])>(.*?)<\/h\1>/g, (_m, level, text) => {
      const id = slugify(text.replace(/<[^>]+>/g, ''));
      return `<h${level} id="${id}">${text}</h${level}>`;
    });
  };

  const sanitizeSimple = (html: string) => html
    .replace(/<script.*?>[\s\S]*?<\/script>/gi, '')
    .replace(/ on[a-zA-Z]+="[^"]*"/g, '')
    .replace(/ on[a-zA-Z]+='[^']*'/g, '');

  const isoDurationFromReadTime = (read: string) => {
    const minutesMatch = read.match(/(\d+)/);
    if (!minutesMatch) return null;
    const m = parseInt(minutesMatch[1], 10);
    return `PT${Math.max(1, m)}M`;
  };

  const existingContent = post && post.content ? post.content.trim() : '';
  const needsFallbackExpansion = existingContent.length === 0 || existingContent.length < 200; // threshold
  const rawContent = post
    ? (needsFallbackExpansion
        ? (existingContent + (existingContent ? '\n\n---\n\n' : '') + generateFallbackContent(post))
        : existingContent)
    : '';
  const processedHtml = rawContent ? convertMarkdownToHtml(rawContent) : '';
  const safeHtml = sanitizeSimple(processedHtml);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Ensure article body always shows: add fallback displayHtml and apply prose-invert for visibility.
  const displayHtml = safeHtml && safeHtml.trim().length > 0
    ? safeHtml
    : '<p>No article content has been added yet. This post is awaiting full content.</p>';

  useEffect(() => {
    if (!contentRef.current) return;

    // Dynamically import Prism for highlighting
    import('prismjs').then(Prism => {
      if (contentRef.current) {
        // Highlight all code blocks within content
        // @ts-ignore
        if (Prism && Prism.highlightAllUnder) {
          // @ts-ignore
            Prism.highlightAllUnder(contentRef.current);
        }
      }
    }).catch(() => {});

    const pres = Array.from(contentRef.current.querySelectorAll('pre')) as HTMLElement[];
    pres.forEach(pre => {
      const codeEl = pre.querySelector('code');
      const text = codeEl?.textContent || '';
      const lineCount = text.split('\n').length;

      // Add copy button if not present
      if (!pre.querySelector('button.copy-btn')) {
        pre.classList.add('relative');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = 'Copy';
        btn.className = 'copy-btn absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white text-xs px-2 py-1 rounded border border-white/10 transition';
        btn.onclick = () => {
          navigator.clipboard.writeText(text).then(() => {
            btn.innerText = 'Copied';
            setTimeout(() => (btn.innerText = 'Copy'), 1500);
          });
        };
        pre.appendChild(btn);
      }

      // Collapsible long code blocks - more aggressive threshold
      if (lineCount > 12 && !pre.querySelector('button.toggle-collapse')) {
        pre.classList.add('collapsible-code', 'collapsed');
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.innerText = `Show ${lineCount - 8} more lines`;
        toggle.className = 'toggle-collapse absolute bottom-2 left-1/2 -translate-x-1/2 bg-azure-500/90 hover:bg-azure-500 text-white text-xs px-4 py-2 rounded-full shadow-lg transition-all hover:scale-105';
        toggle.onclick = () => {
          if (pre.classList.contains('collapsed')) {
            pre.classList.remove('collapsed');
            toggle.innerText = 'Show less';
          } else {
            pre.classList.add('collapsed');
            toggle.innerText = `Show ${lineCount - 8} more lines`;
          }
        };
        pre.appendChild(toggle);
      }
    });

    // Lazy-load images in markdown
    const imgs = Array.from(contentRef.current.querySelectorAll('img')) as HTMLImageElement[];
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          io.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    imgs.forEach(img => {
      // Convert to data-src pattern only if not already loaded
      if (!img.dataset.processed) {
        img.dataset.processed = 'true';
        if (!img.hasAttribute('loading')) img.loading = 'lazy';
        // If image is large (no width/height and not yet in viewport), use data-src swap
        if (!img.complete) {
          const original = img.src;
          img.dataset.src = original;
          // Use tiny transparent placeholder
          img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
          io.observe(img);
        }
        img.classList.add('md-inline-img');
      }
    });

    // Inject styles once
    if (!document.getElementById('blogpost-extra-styles')) {
      const style = document.createElement('style');
      style.id = 'blogpost-extra-styles';
      style.textContent = `
        pre.collapsible-code { position: relative; transition: max-height 0.3s ease-in-out; }
        pre.collapsible-code.collapsed { max-height: 200px; overflow: hidden; }
        pre.collapsible-code.collapsed:after { content: ''; position: absolute; left:0; right:0; bottom:0; height:60px; background: linear-gradient(to bottom, rgba(17,17,27,0), rgba(17,17,27,0.95)); pointer-events:none; }
        pre code { font-size: 0.85rem; line-height: 1.3; }
        .toggle-collapse { backdrop-filter: blur(4px); }
        .md-inline-img { transition: filter .4s ease, transform .6s ease; filter: blur(6px); transform: scale(1.02); }
        .md-inline-img:not([data-src]) { filter: blur(0); transform: scale(1); }
      `;
      document.head.appendChild(style);
    }

    return () => {
      io.disconnect();
    };
  }, [safeHtml]);

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
          <h1 className="fluid-h3 font-bold text-white mb-4">Post Not Found</h1>
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
    <div className="min-h-screen relative pt-4 lg:pt-20 pb-12">
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
            "timeRequired": isoDurationFromReadTime(post.read_time) || post.read_time,
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
      {/* Optional: remove fixed vertical social links for cleaner article page */}
      {/* Removed to reduce visual noise */}

      {/* Scroll Indicator */}
      {/* Scroll indicator removed for simplicity */}

      <div className="container mx-auto px-6 max-w-4xl space-y-4 lg:space-y-0">
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
          {post.images && post.images.length > 0 && (
            <div className="relative aspect-video rounded-2xl overflow-hidden not-prose">
              <img
                src={post.images[currentImageIndex]}
                alt={post.title}
                className="w-full h-full object-cover block"
                loading="eager"
              />
              {post.images.length > 1 && (
                <>
                  <div className="absolute inset-0 flex items-center justify-between p-4">
                    <button
                      onClick={prevImage}
                      className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-300"
                      aria-label="Previous image"
                      title="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-300"
                      aria-label="Next image"
                      title="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {post.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                        aria-label={`Go to image ${idx + 1}`}
                        title={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-azure-500 text-white rounded-full text-sm font-medium">
                  {post.category}
                </span>
              </div>
            </div>
          )}

          {/* Article Meta (now includes a small thumbnail instead of large hero) */}
          <GlassCard className="p-6 -mt-4 relative z-10">
            <div className="space-y-4">
              <h1 className="fluid-h2 font-bold text-white">
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
                <div className="flex items-center space-x-2">
                  <MessageCircle size={16} />
                  <span>{commentCount}</span>
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10 bg-white/5">
                  <ProgressiveImage
                    src={post.author_avatar}
                    alt={post.author_name}
                    wrapperClassName="w-full h-full"
                    className="object-cover"
                    aspectClass="w-full h-full"
                    initialBlur={false}
                    revealScale={false}
                  />
                </div>
                <div className="flex-1">
                  <div className="leading-tight mb-2">
                    <h3 className="text-white font-medium text-sm">{post.author_name}</h3>
                    <p className="text-white/50 text-xs">{post.author_bio}</p>
                  </div>
                  {/* Tags inline with author */}
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-azure-400/15 text-azure-300 rounded-full text-[10px] hover:bg-azure-400/25 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 4 && (
                      <span className="text-white/40 text-[10px] px-2 py-1">
                        +{post.tags.length - 4} more
                      </span>
                    )}
                  </div>
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
                  <button
                    onClick={handleCommentClick}
                    className="flex items-center space-x-2 text-white/60 hover:text-azure-400 transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-white/10"
                    title="Go to comments"
                  >
                    <MessageCircle size={16} />
                    <span>Comments</span>
                  </button>
                </div>
                {/* Condensed Share Dropdown */}
                <div className="relative">
                  <details className="group">
                    <summary className="list-none cursor-pointer flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white/70 text-sm border border-white/15">
                      <span>Share</span>
                      <ArrowRight size={14} className="group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="absolute right-0 mt-2 w-40 bg-[#111827] border border-white/10 rounded-lg shadow-lg p-2 flex flex-col gap-1 z-20">
                      <SocialShare url={currentUrl} title={post.title} description={post.excerpt} compact />
                    </div>
                  </details>
                </div>
               </div>
            </div>
          </GlassCard>

          {/* Article Content */}
          <GlassCard className="p-8">
            <div 
              ref={contentRef}
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: displayHtml
              }}
            />
          </GlassCard>

          {/* Comments Section with Ref */}
          <div ref={commentsRef} className="scroll-mt-24">
            <CommentSection 
              postId={post.id} 
              postTitle={post.title}
              onCommentCountChange={setCommentCount}
            />
          </div>

          {/* Related Articles */}
          {(relatedPosts.length > 0 || additionalRelatedPosts.length > 0) && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">You might also like</h3>
                <Link to="/blog" className="text-sm text-azure-400 hover:text-azure-300 transition-colors">
                  View all posts
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(relatedPosts.concat(additionalRelatedPosts).slice(0,3)).map((rp) => (
                  <Link key={rp.id} to={`/blog/${rp.id}`} className="group">
                    <div className="bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-lg overflow-hidden border border-white/10 h-full group-hover:border-azure-400/30">
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <ProgressiveImage
                          src={rp.image_url}
                          alt={rp.title}
                          wrapperClassName="w-full h-full"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          aspectClass="w-full h-full"
                        />
                        <span className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-azure-500/90 text-white font-medium">
                          {rp.category}
                        </span>
                      </div>
                      <div className="p-4">
                        <h4 className="text-white text-sm font-semibold mb-2 line-clamp-2 group-hover:text-azure-300 transition-colors">
                          {rp.title}
                        </h4>
                        <p className="text-white/60 text-xs line-clamp-2 mb-3">{rp.excerpt}</p>
                        <div className="flex items-center justify-between text-[10px] text-white/50">
                          <span>{rp.read_time}</span>
                          <span>{rp.views > 1000 ? `${(rp.views/1000).toFixed(1)}k` : rp.views} views</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Navigation */}
          <div className="text-center">
            <Link
              to="/blog"
              className="bg-azure-500 hover:bg-azure-600 text-white px-8 py-3 rounded-lg transition-colors duration-300 inline-flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back to All Posts</span>
            </Link>
          </div>
        </motion.article>

        {/* Mobile Social Links removed - footer handles will be used on small screens */}
      </div>
    </div>
  );
};

export default BlogPost;