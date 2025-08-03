import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Calendar, AlertCircle, CheckCircle, Loader, Heart, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import validator from 'validator';
import { supabase } from '../../lib/supabase';
import { abstractEmailValidator } from '../../lib/abstractEmailValidator';
import { getCommentsForPost } from '../../data/blogData';
import GlassCard from '../ui/GlassCard';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../../lib/gravatar';

// Database comment interface
interface DBComment {
  id: string;
  blog_post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  avatar?: string; // Optional avatar URL
  likes?: number; // Added for likes
}

// Database reply interface
interface DBReply {
  id: string;
  comment_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  avatar?: string;
  likes?: number; // Added for likes
}

interface CommentFormData {
  name: string;
  email: string;
  content: string;
}

interface ReplyFormData {
  content: string;
}

interface CommentSectionProps {
  postId: string;
  postTitle: string;
  onCommentCountChange?: (count: number) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, onCommentCountChange }) => {
  const [comments, setComments] = useState<DBComment[]>([]);
  const [replies, setReplies] = useState<DBReply[]>([]);
  const [dummyComments, setDummyComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyFormData, setReplyFormData] = useState<{ [key: string]: string }>({});
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Add a ref to prevent duplicate like requests
  const likeRequestInProgress = useRef<{[id: string]: boolean}>({});

  // Email validation state for real-time validation
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    isChecking: false,
    message: '',
    hasBeenTouched: false
  });

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<CommentFormData>();
  const { reset: resetReply } = useForm<ReplyFormData>();

  useEffect(() => {
    loadComments();
  }, [postId]);

  // Debounced email validation for real-time feedback
  const debouncedEmailValidation = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (email: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (!email || email.trim() === '') {
            setEmailValidation({
              isValid: false,
              isChecking: false,
              message: '',
              hasBeenTouched: false
            });
            return;
          }

          setEmailValidation(prev => ({ ...prev, isChecking: true }));

          try {
            const result = await abstractEmailValidator.validateSingleEmail(email);
            console.log(`📧 Email validation for comment: ${email}:`, result);
            setEmailValidation({
              isValid: result.isValid,
              isChecking: false,
              message: result.reason,
              hasBeenTouched: true
            });
          } catch (error) {
            console.error('❌ Email validation error in comment form:', error);
            setEmailValidation({
              isValid: false,
              isChecking: false,
              message: '❌ Error validating email. Please try again.',
              hasBeenTouched: true
            });
          }
        }, 2400); // Wait 2400ms after user stops typing (same as contact form)
      };
    })(),
    []
  );

  // Validate email when it changes
  useEffect(() => {
    const email = watch('email');
    if (email) {
      debouncedEmailValidation(email);
    }
  }, [watch('email'), debouncedEmailValidation]);

  // Real-time subscription for likes
  useEffect(() => {
    const commentSub = supabase
      .channel('public:blog_comments')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'blog_comments' }, (payload: any) => {
        const updated = payload.new;
        setComments(prev => prev.map(c => c.id === updated.id ? { ...c, likes: updated.likes } : c));
      })
      .subscribe();

    const replySub = supabase
      .channel('public:comment_replies')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'comment_replies' }, (payload: any) => {
        const updated = payload.new;
        setReplies(prev => prev.map(r => r.id === updated.id ? { ...r, likes: updated.likes } : r));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commentSub);
      supabase.removeChannel(replySub);
    };
  }, []);

  useEffect(() => {
    // Update comment count when comments change
    if (onCommentCountChange) {
      const totalCount = comments.length + getTotalDummyCommentCount();
      onCommentCountChange(totalCount);
    }
  }, [comments, dummyComments, onCommentCountChange]);

  const getTotalDummyCommentCount = () => {
    let count = dummyComments.length;
    dummyComments.forEach(comment => {
      if (comment.replies) {
        count += comment.replies.length;
      }
    });
    return count;
  };

  const loadComments = async () => {
    try {
      setIsLoading(true);
      
      // Load dummy comments
      const dummyData = getCommentsForPost(postId);
      setDummyComments(dummyData);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project')) {
        console.log('Supabase not configured, using dummy comments only');
        setComments([]);
        return;
      }

      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('blog_post_id', postId)
        .in('status', ['approved', 'pending']) // Show both approved and pending comments
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading comments:', error);
        setComments([]);
      } else {
        // Add avatars to comments
        const commentsWithAvatars = (data || []).map((comment: any) => ({
          ...comment,
          avatar: getAvatarUrl(comment.author_email, comment.author_name, { size: 40 })
        }));
        setComments(commentsWithAvatars);

        // Load replies for all comments
        if (commentsWithAvatars.length > 0) {
          const commentIds = commentsWithAvatars.map((c: DBComment) => c.id);
          const { data: repliesData, error: repliesError } = await supabase
            .from('comment_replies')
            .select('*')
            .in('comment_id', commentIds)
            .in('status', ['approved', 'pending'])
            .order('created_at', { ascending: true });

          if (repliesError) {
            console.error('Error loading replies:', repliesError);
            setReplies([]);
          } else {
            // Add avatars to replies
            const repliesWithAvatars = (repliesData || []).map((reply: any) => ({
              ...reply,
              avatar: getAvatarUrl(reply.author_email, reply.author_name, { size: 32 })
            }));
            setReplies(repliesWithAvatars);
          }
        }
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = async (email: string): Promise<boolean> => {
    try {
      setIsValidatingEmail(true);
      
      // Basic format check first
      if (!validator.isEmail(email)) {
        toast.error('Please enter a valid email format');
        return false;
      }

      // Use Abstract API for validation
      const result = await abstractEmailValidator.validateSingleEmail(email);
      
      if (!result.isValid) {
        toast.error(`Email validation failed: ${result.reason}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Email validation error:', error);
      toast.error('Email validation failed. Please try again.');
      return false;
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const onSubmit = async (data: CommentFormData) => {
    try {
      setIsSubmitting(true);

      // Use real-time validation state if available, otherwise validate
      if (emailValidation.hasBeenTouched && !emailValidation.isValid) {
        toast.error('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }

      // If not validated yet, validate now
      if (!emailValidation.hasBeenTouched) {
        const isEmailValid = await validateEmail(data.email);
        if (!isEmailValid) {
          setIsSubmitting(false);
          return;
        }
      }

      // Create comment immediately (local-first approach)
      const newComment: DBComment = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        blog_post_id: postId,
        author_name: data.name.trim(),
        author_email: data.email.toLowerCase().trim(),
        content: data.content.trim(),
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar: getAvatarUrl(data.email.toLowerCase().trim(), data.name.trim(), { size: 40 })
      };

      // Add comment to state immediately
      setComments(prev => [...prev, newComment]);
      
      // Update comment count immediately
      if (onCommentCountChange) {
        onCommentCountChange(getTotalDummyCommentCount() + comments.length + 1);
      }

      // Show success message immediately
      toast.success('Comment posted successfully!');
      reset();
      setShowCommentForm(false);

      // Try to save to database in background (non-blocking)
      const saveToDatabase = async () => {
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (!supabaseUrl || supabaseUrl.includes('your-project')) {
            console.log('📝 Supabase not configured, keeping comment local');
            return;
          }

          console.log('🔄 Attempting to save comment to database...');
          
          // Try to save comment to database
          const { data: insertedComment, error } = await supabase
            .from('blog_comments')
            .insert([{
              blog_post_id: postId,
              author_name: data.name.trim(),
              author_email: data.email.toLowerCase().trim(),
              content: data.content.trim(),
              status: 'approved'
            }])
            .select()
            .single();

          if (error) {
            console.log('❌ Database save failed:', error);
            console.log('📝 Comment remains local (database unavailable)');
            
            // Show a subtle notification that it's saved locally
            toast('Comment saved locally (database unavailable)', {
              icon: '💾',
              duration: 3000
            });
          } else {
            console.log('✅ Database save successful:', insertedComment.id);
            
            // Update the comment with real ID
            const realCommentWithAvatar = {
              ...insertedComment,
              avatar: insertedComment.avatar || getAvatarUrl(insertedComment.author_email, insertedComment.author_name, { size: 40 })
            };
            
            setComments(prev => prev.map(c => 
              c.id === newComment.id ? realCommentWithAvatar : c
            ));
            
            console.log('✅ Comment updated with database ID');
            
            // Show success notification
            toast.success('Comment saved to database!', {
              duration: 2000
            });
          }

        } catch (error) {
          console.log('📝 Database save failed, comment remains local:', error);
          
          // Show a subtle notification that it's saved locally
          toast('Comment saved locally (database unavailable)', {
            icon: '💾',
            duration: 3000
          });
        }
      };

      // Save to database in background (don't wait for it)
      saveToDatabase();

    } catch (error) {
      console.error('Error in comment submission:', error);
      
      // Even if there's an error, try to add the comment locally
      try {
        const fallbackComment: DBComment = {
          id: `fallback-${Date.now()}`,
          blog_post_id: postId,
          author_name: data.name.trim(),
          author_email: data.email.toLowerCase().trim(),
          content: data.content.trim(),
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          avatar: getAvatarUrl(data.email.toLowerCase().trim(), data.name.trim(), { size: 40 })
        };

        setComments(prev => [...prev, fallbackComment]);
        toast.success('Comment posted successfully! (Fallback mode)');
        reset();
        setShowCommentForm(false);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        toast.error('Failed to submit comment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update handleLikeComment to persist to DB
  const handleLikeComment = async (commentId: string, isReply = false) => {
    if (likeRequestInProgress.current[commentId]) return;
    likeRequestInProgress.current[commentId] = true;

    if (!isReply) {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;
      const newLikes = (comment.likes || 0) + (likedComments.has(commentId) ? -1 : 1);
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: newLikes } : c));
      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (newSet.has(commentId)) newSet.delete(commentId); else newSet.add(commentId);
        return newSet;
      });
      // Persist to DB
      await supabase.from('blog_comments').update({ likes: newLikes }).eq('id', commentId);
    } else {
      const reply = replies.find(r => r.id === commentId);
      if (!reply) return;
      const newLikes = (reply.likes || 0) + (likedComments.has(commentId) ? -1 : 1);
      setReplies(prev => prev.map(r => r.id === commentId ? { ...r, likes: newLikes } : r));
      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (newSet.has(commentId)) newSet.delete(commentId); else newSet.add(commentId);
        return newSet;
      });
      // Persist to DB
      await supabase.from('comment_replies').update({ likes: newLikes }).eq('id', commentId);
    }
    likeRequestInProgress.current[commentId] = false;
  };

  const handleReplyClick = (commentId: string) => {
    if (replyingTo === commentId) {
      setReplyingTo(null);
      resetReply();
    } else {
      setReplyingTo(commentId);
      resetReply();
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleReplySubmission = async (commentId: string) => {
    const replyContent = replyFormData[commentId];
    if (!replyContent || replyContent.trim().length < 10) {
      toast.error('Reply must be at least 10 characters long');
      return;
    }

    // Find the comment to get author info for the reply
    const parentComment = comments.find(c => c.id === commentId);
    if (!parentComment) {
      toast.error('Parent comment not found');
      return;
    }

    // Create reply immediately (local-first approach)
    const newReply: DBReply = {
      id: `local-reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      comment_id: commentId,
      author_name: 'You',
      author_email: 'reply@local.com',
      content: replyContent.trim(),
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      avatar: getAvatarUrl('reply@local.com', 'You', { size: 32 })
    };

    // Add reply to state immediately
    setReplies(prev => [...prev, newReply]);

    // Debug: Log expandedReplies before and after
    console.log('Before expanding:', Array.from(expandedReplies));
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      newSet.add(commentId);
      console.log('After expanding:', Array.from(newSet));
      return newSet;
    });

    // Scroll to the new reply after a short delay (for better UX)
    setTimeout(() => {
      const replyElement = document.getElementById(`reply-${newReply.id}`);
      if (replyElement) {
        replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);

    // Clear reply form and close reply input
    setReplyFormData(prev => ({ ...prev, [commentId]: '' }));
    setReplyingTo(null);
    
    // Auto-expand replies to show the new reply
    // setExpandedReplies(prev => new Set([...prev, commentId])); // This line is now handled by the new setExpandedReplies call

    // Show success message immediately
    toast.success('Reply added successfully!');

    // Try to save to database in background (non-blocking)
    const saveReplyToDatabase = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl || supabaseUrl.includes('your-project')) {
          console.log('📝 Supabase not configured, keeping reply local');
          return;
        }

        console.log('🔄 Attempting to save reply to database...');
        
        const { data: savedReply, error } = await supabase
          .from('comment_replies')
          .insert([{
            comment_id: commentId,
            author_name: 'You',
            author_email: 'reply@local.com',
            content: replyContent.trim()
          }])
          .select()
          .single();

        if (error) {
          console.log('❌ Reply database save failed:', error);
        } else {
          console.log('✅ Reply database save successful:', savedReply.id);
          
          // Update reply with real ID
          const realReplyWithAvatar: DBReply = {
            ...savedReply,
            avatar: savedReply.avatar || getAvatarUrl(savedReply.author_email, savedReply.author_name, { size: 32 })
          };
          
          setReplies(prev => prev.map(r => 
            r.id === newReply.id ? realReplyWithAvatar : r
          ));
          
          console.log('✅ Reply updated with database ID');
        }
      } catch (error) {
        console.log('📝 Reply database save failed, reply remains local:', error);
      }
    };

    // Save to database in background (don't wait for it)
    saveReplyToDatabase();
  };

  const handleReplyInputChange = (commentId: string, value: string) => {
    setReplyFormData(prev => ({ ...prev, [commentId]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRepliesForComment = (commentId: string): DBReply[] => {
    return replies.filter(reply => reply.comment_id === commentId);
  };

  const renderComment = (comment: any, isReply = false) => (
    <motion.div
      key={comment.id}
      id={isReply ? `reply-${comment.id}` : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white/5 rounded-lg p-4 border border-white/10 ${isReply ? 'ml-8 mt-3' : ''}`}
    >
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-azure-500/20 rounded-full flex items-center justify-center text-azure-400 font-semibold text-sm flex-shrink-0 overflow-hidden">
          {comment.avatar ? (
            <img 
              src={comment.avatar} 
              alt={comment.author_name} 
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = getInitials(comment.author_name);
              }}
            />
          ) : (
            getInitials(comment.author_name)
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="text-white font-semibold text-sm">{comment.author || comment.author_name}</h4>
            <div className="flex items-center space-x-1 text-white/60 text-xs">
              <Calendar size={12} />
              <span>{formatDate(comment.date || comment.created_at)}</span>
            </div>
          </div>
          
          <p className="text-white/80 leading-relaxed text-sm mb-3">{comment.content}</p>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleLikeComment(comment.id, isReply)}
              className={`flex items-center space-x-1 text-xs transition-colors duration-200 hover:scale-105 ${
                likedComments.has(comment.id) 
                  ? 'text-red-400' 
                  : 'text-white/60 hover:text-red-400'
              }`}
            >
              <Heart 
                size={14} 
                fill={likedComments.has(comment.id) ? 'currentColor' : 'none'} 
                className="transition-transform duration-200"
              />
              <span>
                {(comment.likes || 0) + (likedComments.has(comment.id) ? (isReply ? 0 : 1) : 0)}
              </span>
            </button>
            
            {!isReply && (
              <button 
                onClick={() => handleReplyClick(comment.id)}
                className={`flex items-center space-x-1 transition-colors duration-200 text-xs hover:scale-105 ${
                  replyingTo === comment.id 
                    ? 'text-azure-400' 
                    : 'text-white/60 hover:text-azure-400'
                }`}
              >
                <Reply size={14} />
                <span>{replyingTo === comment.id ? 'Cancel' : 'Reply'}</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {replyingTo === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-azure-500/20 rounded-full flex items-center justify-center text-azure-400 font-semibold text-xs flex-shrink-0">
                    You
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={replyFormData[comment.id] || ''}
                      onChange={(e) => handleReplyInputChange(comment.id, e.target.value)}
                      placeholder={`Reply to ${comment.author || comment.author_name}...`}
                      rows={3}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400 transition-colors duration-300 resize-none text-sm"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-white/40 text-xs">
                        {(replyFormData[comment.id] || '').length}/500 characters
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReplyClick(comment.id)}
                          className="px-3 py-1 text-white/60 hover:text-white transition-colors duration-200 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReplySubmission(comment.id)}
                          disabled={!replyFormData[comment.id] || replyFormData[comment.id].trim().length < 10}
                          className="bg-azure-500 hover:bg-azure-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs transition-colors duration-200 flex items-center space-x-1"
                        >
                          <Send size={12} />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies Section */}
          {!isReply && (
            <div className="mt-4">
              {(() => {
                const commentReplies = getRepliesForComment(comment.id);
                const hasReplies = commentReplies.length > 0;
                
                return (
                  <>
                    {hasReplies && (
                      <div className="mb-3">
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="flex items-center space-x-1 text-azure-400 hover:text-azure-300 text-xs transition-colors duration-200"
                        >
                          {expandedReplies.has(comment.id) ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )}
                          <span>
                            {expandedReplies.has(comment.id) ? 'Hide' : 'Show'} {commentReplies.length} {commentReplies.length === 1 ? 'reply' : 'replies'}
                          </span>
                        </button>
                      </div>
                    )}
                    
                    <AnimatePresence>
                      {expandedReplies.has(comment.id) && hasReplies && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3"
                        >
                          {commentReplies.map((reply) => renderComment(reply, true))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const totalComments = comments.length + replies.length + getTotalDummyCommentCount();

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageCircle className="text-azure-400" size={24} />
          <h3 className="text-xl font-bold text-white">
            Comments ({totalComments})
          </h3>
        </div>
        
        {!showCommentForm && (
          <button
            onClick={() => setShowCommentForm(true)}
            className="bg-azure-500 hover:bg-azure-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center space-x-2"
          >
            <MessageCircle size={16} />
            <span>Add Comment</span>
          </button>
        )}
      </div>

      {/* Comment Form */}
      <AnimatePresence>
        {showCommentForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <GlassCard className="p-6 bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Leave a Comment</h4>
                <button
                  onClick={() => setShowCommentForm(false)}
                  className="text-white/60 hover:text-white transition-colors duration-300"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Avatar Preview */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-azure-500/20 rounded-full flex items-center justify-center text-azure-400 font-semibold text-sm overflow-hidden">
                    {watch('email') && watch('name') ? (
                      <img 
                        src={getAvatarUrl(watch('email'), watch('name'), { size: 48 })} 
                        alt="Avatar preview" 
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = getInitials(watch('name') || 'U');
                        }}
                      />
                    ) : (
                      getInitials(watch('name') || 'U')
                    )}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Your avatar will be generated from your email</p>
                    <p className="text-white/60 text-xs">Using Gravatar or fallback avatar</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      {...register('name', { 
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                        maxLength: { value: 50, message: 'Name must be less than 50 characters' }
                      })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400 transition-colors duration-300"
                      placeholder="Your name"
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                        <AlertCircle size={12} />
                        <span>{errors.name.message}</span>
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Email * (not published)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        {...register('email', { 
                          required: 'Email is required',
                          validate: (value) => validator.isEmail(value) || 'Please enter a valid email'
                        })}
                        className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none transition-colors duration-300 pr-10 ${
                          emailValidation.hasBeenTouched
                            ? emailValidation.isValid
                              ? 'border-green-400 focus:border-green-400'
                              : 'border-red-400 focus:border-red-400'
                            : 'border-white/20 focus:border-azure-400'
                        }`}
                        placeholder="your@email.com"
                        disabled={isSubmitting}
                      />
                      
                      {/* Validation Icon */}
                      {emailValidation.isChecking && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader className="text-azure-400 animate-spin" size={16} />
                        </div>
                      )}
                      
                      {emailValidation.hasBeenTouched && !emailValidation.isChecking && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {emailValidation.isValid ? (
                            <CheckCircle className="text-green-400" size={16} />
                          ) : (
                            <AlertCircle className="text-red-400" size={16} />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Validation Message */}
                    {emailValidation.hasBeenTouched && emailValidation.message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-1 text-xs flex items-center space-x-1 ${
                          emailValidation.isValid ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {emailValidation.isValid ? (
                          <CheckCircle size={12} />
                        ) : (
                          <AlertCircle size={12} />
                        )}
                        <span>{emailValidation.message}</span>
                      </motion.div>
                    )}
                    
                    {/* Form validation errors */}
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1 flex items-center space-x-1">
                        <AlertCircle size={12} />
                        <span>{errors.email.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Comment *
                  </label>
                  <textarea
                    {...register('content', { 
                      required: 'Comment is required',
                      minLength: { value: 10, message: 'Comment must be at least 10 characters' },
                      maxLength: { value: 1000, message: 'Comment must be less than 1000 characters' }
                    })}
                    rows={4}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400 transition-colors duration-300 resize-none"
                    placeholder="Share your thoughts about this post..."
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.content && (
                      <p className="text-red-400 text-xs flex items-center space-x-1">
                        <AlertCircle size={12} />
                        <span>{errors.content.message}</span>
                      </p>
                    )}
                    <p className="text-white/40 text-xs ml-auto">
                      {watch('content')?.length || 0}/1000
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-white/60 text-xs">
                    Your email will be validated but not published. Comments are moderated.
                  </p>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || isValidatingEmail || (!emailValidation.isValid && emailValidation.hasBeenTouched)}
                    className={`px-6 py-2 rounded-lg transition-colors duration-300 flex items-center space-x-2 ${
                      isSubmitting || isValidatingEmail || (!emailValidation.isValid && emailValidation.hasBeenTouched)
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        : 'bg-azure-500 hover:bg-azure-600 text-white'
                    }`}
                  >
                    {isSubmitting || isValidatingEmail ? (
                      <>
                        <Loader className="animate-spin" size={16} />
                        <span>{isValidatingEmail ? 'Validating...' : 'Submitting...'}</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit Comment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader className="animate-spin text-azure-400 mx-auto mb-4" size={32} />
            <p className="text-white/60">Loading comments...</p>
          </div>
        ) : totalComments === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="text-white/30 mx-auto mb-4" size={48} />
            <p className="text-white/60 mb-2">No comments yet</p>
            <p className="text-white/40 text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <>
            {/* Dummy Comments */}
            {dummyComments.map((comment) => (
              <div key={comment.id}>
                {renderComment(comment)}
                
                {/* Replies Toggle Button */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-8 mt-2">
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="flex items-center space-x-2 text-azure-400 hover:text-azure-300 transition-colors duration-200 text-sm"
                    >
                      {expandedReplies.has(comment.id) ? (
                        <>
                          <ChevronUp size={16} />
                          <span>Hide {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          <span>Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Render replies when expanded */}
                <AnimatePresence>
                  {expandedReplies.has(comment.id) && comment.replies && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {comment.replies.map((reply: any) => (
                        renderComment(reply, true)
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            
            {/* Real Comments from Supabase */}
            {comments.map((comment) => (
              renderComment(comment)
            ))}
          </>
        )}
      </div>

      {/* Comment Guidelines */}
      <div className="mt-6 p-4 bg-azure-500/10 border border-azure-500/20 rounded-lg">
        <h4 className="text-azure-400 font-medium mb-2">💬 Comment Guidelines</h4>
        <ul className="text-white/60 text-sm space-y-1">
          <li>• Be respectful and constructive in your comments</li>
          <li>• Your email will be validated but never published</li>
          <li>• Comments are moderated and may take time to appear</li>
          <li>• Spam and inappropriate content will be removed</li>
          <li>• You can reply to comments to start discussions</li>
          <li>• Click "Show replies" to view responses to comments</li>
        </ul>
      </div>
    </GlassCard>
  );
};

export default CommentSection;