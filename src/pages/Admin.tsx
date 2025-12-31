import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { 
  Github, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Mail,
  MessageSquare,
  TrendingUp,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader,
  RefreshCw,
  Star,
  Edit,
  Trash2,
  Plus,
  Search,
  Upload,
  Globe,
  Image,
  Activity,
  BarChart,
  MapPin,
  Clock,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { supabase, checkAdminAuthorization, getGitHubUserData } from '../lib/supabase';
import EmailValidator from '../components/admin/EmailValidator';
import GlassCard from '../components/ui/GlassCard';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  github_id: string;
  username: string;
  avatar_url: string;
  email: string;
  created_at: string;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AdminUser | null;
  error: string | null;
  retryCount: number;
}

interface Review {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  featured: boolean;
  published: boolean;
  views: number;
  likes: number;
  created_at: string;
}

interface Comment {
  id: string;
  blog_post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface AnalyticsData {
  totalViews: number;
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  recentViews: Array<{ date: string; views: number }>;
  topPages: Array<{ page: string; views: number }>;
  topCountries: Array<{ country: string; views: number }>;
}

const Admin: React.FC = () => {
  // Auth state
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    error: null,
    retryCount: 0
  });

  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  // Data state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal actions (state values not currently rendered)
  const [, setShowModal] = useState(false);
  const [, setModalType] = useState<'edit' | 'view' | 'delete'>('view');
  const [, setSelectedItem] = useState<any>(null);

  // Bulletproof state update function
  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  // Force loading to false - emergency escape hatch
  const forceStopLoading = () => {
    console.warn('🚨 Force stopping loading state');
    updateAuthState({ isLoading: false });
  };

  // Comprehensive error handler
  const handleAuthError = (error: any, context: string) => {
    console.error(`❌ Auth error in ${context}:`, error);
    
    const errorMessage = error?.message || error?.toString() || 'Unknown authentication error';
    
    updateAuthState({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      error: `${context}: ${errorMessage}`
    });
    
    toast.error(`Authentication failed: ${errorMessage}`);
  };

  // Load all admin data
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadReviews(),
        loadBlogPosts(),
        loadComments(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load some admin data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load reviews
  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  // Load blog posts
  const loadBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  };

  // Load comments
  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      // Get basic counts
      const [viewsResult, usersResult, postsResult, commentsResult] = await Promise.all([
        supabase.from('analytics').select('*', { count: 'exact' }),
        supabase.from('admin_users').select('*', { count: 'exact' }),
        supabase.from('blog_posts').select('*', { count: 'exact' }),
        supabase.from('blog_comments').select('*', { count: 'exact' })
      ]);

      // Get recent views data
      const { data: recentViewsData } = await supabase
        .from('analytics')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      // Get top pages
      const { data: topPagesData } = await supabase
        .from('analytics')
        .select('page')
        .limit(10);

      // Get top countries
      const { data: topCountriesData } = await supabase
        .from('analytics')
        .select('country')
        .not('country', 'is', null)
        .limit(10);

      // Process data
      const recentViews = processRecentViews(recentViewsData || []);
      const topPages = processTopPages(topPagesData || []);
      const topCountries = processTopCountries(topCountriesData || []);

      setAnalytics({
        totalViews: viewsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalPosts: postsResult.count || 0,
        totalComments: commentsResult.count || 0,
        recentViews,
        topPages,
        topCountries
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  // Process analytics data
  const processRecentViews = (data: any[]) => {
    const viewsByDate: { [key: string]: number } = {};
    data.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
    });

    return Object.entries(viewsByDate).map(([date, views]) => ({ date, views }));
  };

  const processTopPages = (data: any[]) => {
    const pageViews: { [key: string]: number } = {};
    data.forEach(item => {
      pageViews[item.page] = (pageViews[item.page] || 0) + 1;
    });

    return Object.entries(pageViews)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  };

  const processTopCountries = (data: any[]) => {
    const countryViews: { [key: string]: number } = {};
    data.forEach(item => {
      if (item.country && item.country !== 'Unknown') {
        countryViews[item.country] = (countryViews[item.country] || 0) + 1;
      }
    });

    return Object.entries(countryViews)
      .map(([country, views]) => ({ country, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  };

  // Update review status
  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .eq('id', reviewId);

      if (error) throw error;
      
      await loadReviews();
      toast.success(`Review ${status} successfully`);
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  // Update comment status
  const updateCommentStatus = async (commentId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({ status })
        .eq('id', commentId);

      if (error) throw error;
      
      await loadComments();
      toast.success(`Comment ${status} successfully`);
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  // Toggle blog post featured status
  const togglePostFeatured = async (postId: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ featured: !featured })
        .eq('id', postId);

      if (error) throw error;
      
      await loadBlogPosts();
      toast.success(`Post ${!featured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  // Toggle blog post published status
  const togglePostPublished = async (postId: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !published })
        .eq('id', postId);

      if (error) throw error;
      
      await loadBlogPosts();
      toast.success(`Post ${!published ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };


  // Bulletproof authentication check with comprehensive error handling
  const checkAuth = async () => {
    console.log('🔍 Starting authentication check...');
    
    updateAuthState({ 
      isLoading: true, 
      error: null,
      retryCount: authState.retryCount + 1
    });

    const timeoutId = setTimeout(() => {
      console.warn('⏰ Auth check timeout - forcing stop loading');
      forceStopLoading();
    }, 10000);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      console.log('✅ Supabase client available');

      const sessionPromise = supabase.auth.getSession();
      const sessionResult = await Promise.race([
        sessionPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        )
      ]);

      const { data: { session }, error: sessionError } = sessionResult as any;

      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      console.log('📋 Session check result:', session ? 'Session found' : 'No session');

      if (!session?.user) {
        console.log('👤 No authenticated user found');
        updateAuthState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          error: null
        });
        clearTimeout(timeoutId);
        return;
      }

      await handleAuthenticatedUser(session.user);
      
    } catch (error) {
      handleAuthError(error, 'checkAuth');
    } finally {
      clearTimeout(timeoutId);
      if (authState.isLoading) {
        console.log('🔄 Ensuring loading state is stopped in finally block');
        updateAuthState({ isLoading: false });
      }
    }
  };

  // Handle authenticated user with comprehensive error handling
  const handleAuthenticatedUser = async (user: any) => {
    console.log('👤 Processing authenticated user:', user.id);

    try {
      const githubUserData = await getGitHubUserData(user.user_metadata?.provider_token);
      
      if (!githubUserData?.id) {
        throw new Error('Failed to get GitHub user data');
      }

      console.log('🐙 GitHub user data:', githubUserData.login);

      const adminUser = await checkAdminAuthorization(githubUserData.id.toString());
      
      if (!adminUser) {
        throw new Error(`User ${githubUserData.login} is not authorized as admin`);
      }

      console.log('✅ Admin authorization confirmed');

      updateAuthState({
        isLoading: false,
        isAuthenticated: true,
        user: adminUser,
        error: null
      });

      toast.success(`Welcome back, ${adminUser.username}!`);

      // Load admin data after successful authentication
      await loadAdminData();

    } catch (error) {
      handleAuthError(error, 'handleAuthenticatedUser');
    }
  };

  // GitHub sign-in with comprehensive error handling
  const signInWithGitHub = async () => {
    console.log('🔐 Starting GitHub sign-in...');
    
    updateAuthState({ isLoading: true, error: null });

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/admin`
        }
      });

      if (error) {
        throw error;
      }

      console.log('🔄 Redirecting to GitHub...');
      
    } catch (error) {
      handleAuthError(error, 'signInWithGitHub');
    }
  };

  // Sign out with error handling
  const signOut = async () => {
    console.log('🚪 Signing out...');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      updateAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null
      });

      toast.success('Signed out successfully');
      
    } catch (error) {
      handleAuthError(error, 'signOut');
    }
  };

  // Retry authentication
  const retryAuth = () => {
    console.log('🔄 Retrying authentication...');
    checkAuth();
  };

  // Initialize authentication on mount
  useEffect(() => {
    console.log('🚀 Admin component mounted, starting auth check...');
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔄 Auth state changed:', event);
        
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            await handleAuthenticatedUser(session.user);
          } else if (event === 'SIGNED_OUT') {
            updateAuthState({
              isLoading: false,
              isAuthenticated: false,
              user: null,
              error: null
            });
          }
        } catch (error) {
          handleAuthError(error, 'onAuthStateChange');
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Emergency timeout to prevent infinite loading
  useEffect(() => {
    if (authState.isLoading && authState.retryCount > 0) {
      const emergencyTimeout = setTimeout(() => {
        console.warn('🚨 Emergency timeout triggered - stopping loading');
        forceStopLoading();
      }, 15000);

      return () => clearTimeout(emergencyTimeout);
    }
  }, [authState.isLoading, authState.retryCount]);

  // Filter functions
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredBlogPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Loading state with retry option
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <GlassCard className="p-8 text-center max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="animate-spin text-azure-400" size={32} />
            <h2 className="text-xl font-bold text-white">Loading Admin Panel</h2>
            <p className="text-white/70 text-sm">
              Checking authentication... (Attempt {authState.retryCount})
            </p>
            
            {authState.retryCount > 1 && (
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={retryAuth}
                  className="px-4 py-2 bg-azure-500 hover:bg-azure-600 text-white rounded-lg text-sm transition-colors duration-300 flex items-center space-x-2"
                >
                  <RefreshCw size={14} />
                  <span>Retry</span>
                </button>
                <button
                  onClick={forceStopLoading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors duration-300"
                >
                  Force Continue
                </button>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    );
  }

  // Error state with retry option
  if (authState.error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <GlassCard className="p-8 text-center max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="text-red-400" size={32} />
            <h2 className="text-xl font-bold text-white">Authentication Error</h2>
            <p className="text-red-400 text-sm">{authState.error}</p>
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={retryAuth}
                className="px-4 py-2 bg-azure-500 hover:bg-azure-600 text-white rounded-lg text-sm transition-colors duration-300 flex items-center space-x-2"
              >
                <RefreshCw size={14} />
                <span>Retry</span>
              </button>
              <button
                onClick={() => updateAuthState({ error: null })}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors duration-300"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Not authenticated - show sign-in
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <GlassCard className="p-8 text-center max-w-md w-full">
          <div className="flex flex-col items-center space-y-6">
            <Shield className="text-azure-400" size={48} />
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
              <p className="text-white/70 text-sm">
                Sign in with your authorized GitHub account to access the admin panel.
              </p>
            </div>
            
            <button
              onClick={signInWithGitHub}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-3 border border-gray-700"
            >
              <Github size={20} />
              <span>Sign in with GitHub</span>
            </button>
            
            <p className="text-white/50 text-xs">
              Only authorized administrators can access this panel.
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Authenticated - show admin panel
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'blog-posts', label: 'Blog Posts', icon: FileText },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'email-validator', label: 'Email Validator', icon: Mail },
    { id: 'content', label: 'Content', icon: Edit },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="text-azure-400" size={24} />
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
                <CheckCircle size={14} />
                <span className="text-xs font-medium">AUTHENTICATED</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={authState.user?.avatar_url} 
                  alt={authState.user?.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white/80 text-sm">{authState.user?.username}</span>
              </div>
              
              <button
                onClick={signOut}
                className="text-white/60 hover:text-white transition-colors duration-300 p-2 rounded-lg hover:bg-white/10"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 mb-8 bg-white/5 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-300 text-sm ${
                activeTab === tab.id
                  ? 'bg-azure-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20">
              <div className="flex items-center space-x-3">
                <Loader className="animate-spin text-azure-400" size={20} />
                <span className="text-white">Loading...</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <BarChart3 className="text-azure-400" size={24} />
                  <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="text-azure-400" size={20} />
                      <span className="text-2xl font-bold text-white">{analytics?.totalUsers || 0}</span>
                    </div>
                    <p className="text-white/60 text-sm">Admin Users</p>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="text-green-400" size={20} />
                      <span className="text-2xl font-bold text-white">{analytics?.totalPosts || 0}</span>
                    </div>
                    <p className="text-white/60 text-sm">Blog Posts</p>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <MessageSquare className="text-yellow-400" size={20} />
                      <span className="text-2xl font-bold text-white">{analytics?.totalComments || 0}</span>
                    </div>
                    <p className="text-white/60 text-sm">Comments</p>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="text-purple-400" size={20} />
                      <span className="text-2xl font-bold text-white">{analytics?.totalViews || 0}</span>
                    </div>
                    <p className="text-white/60 text-sm">Total Views</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                      <Clock size={16} />
                      <span>Recent Reviews</span>
                    </h3>
                    <div className="space-y-2">
                      {reviews.slice(0, 3).map(review => (
                        <div key={review.id} className="flex items-center justify-between text-sm">
                          <span className="text-white/70">{review.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            review.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            review.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {review.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                      <MessageSquare size={16} />
                      <span>Recent Comments</span>
                    </h3>
                    <div className="space-y-2">
                      {comments.slice(0, 3).map(comment => (
                        <div key={comment.id} className="flex items-center justify-between text-sm">
                          <span className="text-white/70 truncate">{comment.author_name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            comment.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            comment.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {comment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-azure-500/10 border border-azure-500/20 rounded-lg">
                  <h3 className="text-azure-400 font-medium mb-2">🎉 Welcome to the Full Admin Panel!</h3>
                  <p className="text-white/70 text-sm">
                    You now have access to all admin features including content management, analytics, user management, and more.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <TrendingUp className="text-azure-400" size={24} />
                  <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Top Pages */}
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                      <BarChart size={16} />
                      <span>Top Pages</span>
                    </h3>
                    <div className="space-y-2">
                      {analytics?.topPages.map((page, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-white/70 truncate">{page.page}</span>
                          <span className="text-azure-400 font-medium">{page.views}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Countries */}
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                      <MapPin size={16} />
                      <span>Top Countries</span>
                    </h3>
                    <div className="space-y-2">
                      {analytics?.topCountries.map((country, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-white/70">{country.country}</span>
                          <span className="text-azure-400 font-medium">{country.views}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                      <Activity size={16} />
                      <span>Recent Activity</span>
                    </h3>
                    <div className="space-y-2">
                      <div className="text-sm text-white/70">
                        <div className="flex justify-between">
                          <span>Today's Views</span>
                          <span className="text-azure-400">
                            {analytics?.recentViews.find(v => v.date === new Date().toISOString().split('T')[0])?.views || 0}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-white/70">
                        <div className="flex justify-between">
                          <span>Pending Reviews</span>
                          <span className="text-yellow-400">
                            {reviews.filter(r => r.status === 'pending').length}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-white/70">
                        <div className="flex justify-between">
                          <span>Pending Comments</span>
                          <span className="text-yellow-400">
                            {comments.filter(c => c.status === 'pending').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'blog-posts' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <FileText className="text-azure-400" size={24} />
                    <h2 className="text-xl font-bold text-white">Blog Posts Management</h2>
                  </div>
                  <button className="bg-azure-500 hover:bg-azure-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center space-x-2">
                    <Plus size={16} />
                    <span>New Post</span>
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={16} />
                    <input
                      type="text"
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400"
                    />
                  </div>
                </div>

                {/* Posts List */}
                <div className="space-y-4">
                  {filteredBlogPosts.map(post => (
                    <div key={post.id} className="bg-white/5 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-semibold">{post.title}</h3>
                            {post.featured && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                                Featured
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              post.published ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {post.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <p className="text-white/70 text-sm mb-2">{post.excerpt}</p>
                          <div className="flex items-center space-x-4 text-xs text-white/60">
                            <span>Category: {post.category}</span>
                            <span>Views: {post.views}</span>
                            <span>Likes: {post.likes}</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => togglePostFeatured(post.id, post.featured)}
                            className={`p-2 rounded-lg transition-colors duration-300 ${
                              post.featured ? 'text-yellow-400 hover:bg-yellow-500/20' : 'text-white/60 hover:bg-white/10'
                            }`}
                            title={post.featured ? 'Remove from featured' : 'Add to featured'}
                          >
                            <Star size={16} fill={post.featured ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => togglePostPublished(post.id, post.published)}
                            className={`p-2 rounded-lg transition-colors duration-300 ${
                              post.published ? 'text-green-400 hover:bg-green-500/20' : 'text-gray-400 hover:bg-gray-500/20'
                            }`}
                            title={post.published ? 'Unpublish' : 'Publish'}
                          >
                            <Globe size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(post);
                              setModalType('edit');
                              setShowModal(true);
                            }}
                            className="p-2 text-azure-400 hover:bg-azure-500/20 rounded-lg transition-colors duration-300"
                            title="Edit post"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(post);
                              setModalType('delete');
                              setShowModal(true);
                            }}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-300"
                            title="Delete post"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'comments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <MessageSquare className="text-azure-400" size={24} />
                  <h2 className="text-xl font-bold text-white">Comments Management</h2>
                </div>

                {/* Search and Filter */}
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={16} />
                    <input
                      type="text"
                      placeholder="Search comments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-azure-400"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {filteredComments.map(comment => (
                    <div key={comment.id} className="bg-white/5 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-semibold">{comment.author_name}</h3>
                            <span className="text-white/60 text-sm">{comment.author_email}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              comment.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              comment.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {comment.status}
                            </span>
                          </div>
                          <p className="text-white/70 text-sm mb-2">{comment.content}</p>
                          <div className="flex items-center space-x-4 text-xs text-white/60">
                            <span>Post ID: {comment.blog_post_id}</span>
                            <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {comment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateCommentStatus(comment.id, 'approved')}
                                className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors duration-300"
                                title="Approve comment"
                              >
                                <ThumbsUp size={16} />
                              </button>
                              <button
                                onClick={() => updateCommentStatus(comment.id, 'rejected')}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-300"
                                title="Reject comment"
                              >
                                <ThumbsDown size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedItem(comment);
                              setModalType('delete');
                              setShowModal(true);
                            }}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-300"
                            title="Delete comment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Star className="text-azure-400" size={24} />
                  <h2 className="text-xl font-bold text-white">Reviews Management</h2>
                </div>

                {/* Search and Filter */}
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={16} />
                    <input
                      type="text"
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-azure-400"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {filteredReviews.map(review => (
                    <div key={review.id} className="bg-white/5 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-semibold">{review.name}</h3>
                            <span className="text-white/60 text-sm">{review.role} at {review.company}</span>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  fill={i < review.rating ? '#fbbf24' : 'none'}
                                  className={i < review.rating ? 'text-yellow-400' : 'text-white/30'}
                                />
                              ))}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              review.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              review.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {review.status}
                            </span>
                          </div>
                          <p className="text-white/70 text-sm mb-2">{review.content}</p>
                          <div className="flex items-center space-x-4 text-xs text-white/60">
                            <span>{review.email}</span>
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateReviewStatus(review.id, 'approved')}
                                className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors duration-300"
                                title="Approve review"
                              >
                                <ThumbsUp size={16} />
                              </button>
                              <button
                                onClick={() => updateReviewStatus(review.id, 'rejected')}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-300"
                                title="Reject review"
                              >
                                <ThumbsDown size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedItem(review);
                              setModalType('delete');
                              setShowModal(true);
                            }}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-300"
                            title="Delete review"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'email-validator' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <EmailValidator />
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Edit className="text-azure-400" size={24} />
                  <h2 className="text-xl font-bold text-white">Content Management</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Homepage</h3>
                    <p className="text-white/70 text-sm mb-3">Edit hero section, about, and featured content</p>
                    <button className="bg-azure-500 hover:bg-azure-600 text-white px-3 py-2 rounded text-sm transition-colors duration-300">
                      Edit Homepage
                    </button>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">About Page</h3>
                    <p className="text-white/70 text-sm mb-3">Update bio, skills, and experience</p>
                    <button className="bg-azure-500 hover:bg-azure-600 text-white px-3 py-2 rounded text-sm transition-colors duration-300">
                      Edit About
                    </button>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Projects</h3>
                    <p className="text-white/70 text-sm mb-3">Manage portfolio projects and case studies</p>
                    <button className="bg-azure-500 hover:bg-azure-600 text-white px-3 py-2 rounded text-sm transition-colors duration-300">
                      Edit Projects
                    </button>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Contact Info</h3>
                    <p className="text-white/70 text-sm mb-3">Update contact details and social links</p>
                    <button className="bg-azure-500 hover:bg-azure-600 text-white px-3 py-2 rounded text-sm transition-colors duration-300">
                      Edit Contact
                    </button>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">SEO Settings</h3>
                    <p className="text-white/70 text-sm mb-3">Meta tags, descriptions, and keywords</p>
                    <button className="bg-azure-500 hover:bg-azure-600 text-white px-3 py-2 rounded text-sm transition-colors duration-300">
                      Edit SEO
                    </button>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Navigation</h3>
                    <p className="text-white/70 text-sm mb-3">Customize menu items and structure</p>
                    <button className="bg-azure-500 hover:bg-azure-600 text-white px-3 py-2 rounded text-sm transition-colors duration-300">
                      Edit Navigation
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'media' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Image className="text-azure-400" size={24} />
                    <h2 className="text-xl font-bold text-white">Media Library</h2>
                  </div>
                  <button className="bg-azure-500 hover:bg-azure-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center space-x-2">
                    <Upload size={16} />
                    <span>Upload Media</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {/* Placeholder media items */}
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white/5 p-3 rounded-lg">
                      <div className="aspect-square bg-white/10 rounded mb-2 flex items-center justify-center">
                        <Image className="text-white/40" size={24} />
                      </div>
                      <p className="text-white/70 text-xs truncate">image-{i}.jpg</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Settings className="text-azure-400" size={24} />
                  <h2 className="text-xl font-bold text-white">Settings</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="text-white font-medium mb-4">Account Information</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-white/50">Username</label>
                        <p className="text-white/80">{authState.user?.username}</p>
                      </div>
                      <div>
                        <label className="text-white/50">Email</label>
                        <p className="text-white/80">{authState.user?.email}</p>
                      </div>
                      <div>
                        <label className="text-white/50">GitHub ID</label>
                        <p className="text-white/80">{authState.user?.github_id}</p>
                      </div>
                      <div>
                        <label className="text-white/50">Admin Since</label>
                        <p className="text-white/80">{new Date(authState.user?.created_at || '').toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
                    <button
                      onClick={signOut}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-300 flex items-center space-x-2"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;