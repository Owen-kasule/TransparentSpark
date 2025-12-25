import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mail, X, Star, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import validator from 'validator';
import { supabase } from '../../lib/supabase';
import { abstractEmailValidator, ValidationResult } from '../../lib/abstractEmailValidator';
import GlassCard from '../ui/GlassCard';

interface EmailFormData {
  email: string;
}

interface ReviewFormData {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

const AddReviewButton: React.FC = () => {
  const [step, setStep] = useState<'button' | 'email' | 'review' | 'success'>('button');
  const [userEmail, setUserEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const emailForm = useForm<EmailFormData>();
  const reviewForm = useForm<ReviewFormData>();

  const validateEmailWithAbstractAPI = async (email: string): Promise<ValidationResult> => {
    try {
      // First check basic email format
      if (!validator.isEmail(email)) {
        return {
          email,
          isValid: false,
          status: 'invalid',
          reason: 'Invalid email format',
          details: null
        };
      }

      // Use Abstract API for comprehensive validation
      const result = await abstractEmailValidator.validateSingleEmail(email);
      return result;
    } catch (error) {
      console.error('Email validation error:', error);
      return {
        email,
        isValid: false,
        status: 'error',
        reason: error instanceof Error ? error.message : 'Validation service unavailable',
        details: null
      };
    }
  };

  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const result = await validateEmailWithAbstractAPI(data.email);
      setValidationResult(result);
      
      if (result.isValid) {
        setUserEmail(data.email);
        setStep('review');
        toast.success('Email validated successfully! Please fill out your review.');
      } else {
        toast.error(`Email validation failed: ${result.reason}`);
      }
    } catch (error) {
      console.error('Email validation error:', error);
      toast.error('Error validating email. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleReviewSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    
    try {
      const reviewData = {
        ...data,
        email: userEmail,
        status: 'pending'
      };

      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('your-project')) {
        toast.error('Please set up Supabase connection first. Click "Connect to Supabase" in the top right.');
        return;
      }

      const { error } = await supabase
        .from('reviews')
        .insert([reviewData]);

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Please set up Supabase connection first.');
        return;
      }

      setStep('success');
      toast.success('Review submitted successfully! It will be reviewed before being published.');
      
      // Reset forms
      emailForm.reset();
      reviewForm.reset();
      setValidationResult(null);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setStep('button');
        setUserEmail('');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Please set up Supabase connection first.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setStep('button');
    setUserEmail('');
    emailForm.reset();
    reviewForm.reset();
    setValidationResult(null);
  };

  const StarRating: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`transition-colors duration-200 hover:scale-110 ${
              star <= value ? 'text-yellow-400' : 'text-white/30 hover:text-yellow-300'
            }`}
          >
            <Star size={24} fill={star <= value ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Add Review Button */}
      <motion.button
        onClick={() => setStep('email')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-azure-500 hover:bg-azure-600 text-white px-6 py-3 rounded-xl transition-colors duration-300 font-medium flex items-center space-x-2 shadow-lg text-sm sm:text-base"
      >
        <Plus size={20} />
        <span>Add Review</span>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {step !== 'button' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassCard className="p-6 relative">
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-200 z-10"
                >
                  <X size={20} />
                </button>

                {/* Email Step */}
                {step === 'email' && (
                  <div>
                    <div className="text-center mb-6">
                      <Mail className="text-azure-400 mx-auto mb-3" size={32} />
                      <h3 className="text-xl font-bold text-white mb-2">Verify Your Email</h3>
                      <p className="text-white/70 text-sm">
                        We use Abstract API for advanced email validation to ensure authenticity. 
                        Your email will be verified for deliverability and quality.
                      </p>
                    </div>

                    <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                      <div>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          {...emailForm.register('email', { 
                            required: 'Email is required',
                            validate: (value) => validator.isEmail(value) || 'Please enter a valid email format'
                          })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400 transition-colors duration-300"
                          disabled={isValidating}
                        />
                        {emailForm.formState.errors.email && (
                          <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                            <AlertCircle size={14} />
                            <span>{emailForm.formState.errors.email.message}</span>
                          </p>
                        )}
                      </div>

                      {/* Validation Result */}
                      {validationResult && !validationResult.isValid && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="text-red-400" size={16} />
                            <span className="text-red-400 font-medium text-sm">Validation Failed</span>
                          </div>
                          <p className="text-red-300 text-sm">{validationResult.reason}</p>
                          {validationResult.details?.autocorrect && (
                            <p className="text-white/70 text-sm mt-1">
                              Did you mean: <span className="text-azure-400">{validationResult.details.autocorrect}</span>?
                            </p>
                          )}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isValidating}
                        className="w-full bg-azure-500 hover:bg-azure-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors duration-300 font-medium flex items-center justify-center space-x-2"
                      >
                        {isValidating ? (
                          <>
                            <Loader className="animate-spin" size={16} />
                            <span>Validating Email...</span>
                          </>
                        ) : (
                          <>
                            <Mail size={16} />
                            <span>Verify Email</span>
                          </>
                        )}
                      </button>

                      {/* Validation Info */}
                      <div className="text-center">
                        <p className="text-white/50 text-xs">
                          We check for email deliverability, quality score, and disposable addresses using Abstract API
                        </p>
                      </div>
                    </form>
                  </div>
                )}

                {/* Review Form Step */}
                {step === 'review' && (
                  <div>
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <CheckCircle className="text-green-400" size={20} />
                        <Star className="text-azure-400" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Add Your Review</h3>
                      <p className="text-white/70 text-sm">
                        Email verified: <span className="text-green-400">{userEmail}</span>
                      </p>
                    </div>

                    <form onSubmit={reviewForm.handleSubmit(handleReviewSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input
                            type="text"
                            placeholder="Your Name"
                            {...reviewForm.register('name', { required: 'Name is required' })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400 transition-colors duration-300 text-sm"
                          />
                          {reviewForm.formState.errors.name && (
                            <p className="text-red-400 text-xs mt-1">
                              {reviewForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Your Role"
                            {...reviewForm.register('role', { required: 'Role is required' })}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400 transition-colors duration-300 text-sm"
                          />
                          {reviewForm.formState.errors.role && (
                            <p className="text-red-400 text-xs mt-1">
                              {reviewForm.formState.errors.role.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Company Name"
                          {...reviewForm.register('company', { required: 'Company is required' })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400 transition-colors duration-300 text-sm"
                        />
                        {reviewForm.formState.errors.company && (
                          <p className="text-red-400 text-xs mt-1">
                            {reviewForm.formState.errors.company.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          Rating *
                        </label>
                        <StarRating
                          value={reviewForm.watch('rating') || 0}
                          onChange={(value) => reviewForm.setValue('rating', value)}
                        />
                        {!reviewForm.watch('rating') && (
                          <p className="text-red-400 text-xs mt-1">
                            Please select a rating
                          </p>
                        )}
                      </div>

                      <div>
                        <textarea
                          placeholder="Share your experience working with Owen... (minimum 50 characters)"
                          rows={4}
                          {...reviewForm.register('content', { 
                            required: 'Review content is required',
                            minLength: { value: 50, message: 'Review must be at least 50 characters' }
                          })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400 transition-colors duration-300 resize-none text-sm"
                        />
                        <div className="flex justify-between items-center mt-1">
                          {reviewForm.formState.errors.content && (
                            <p className="text-red-400 text-xs">
                              {reviewForm.formState.errors.content.message}
                            </p>
                          )}
                          <p className="text-white/40 text-xs ml-auto">
                            {reviewForm.watch('content')?.length || 0}/50 min
                          </p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || !reviewForm.watch('rating')}
                        className="w-full bg-azure-500 hover:bg-azure-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors duration-300 font-medium flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader className="animate-spin" size={16} />
                            <span>Submitting Review...</span>
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            <span>Submit Review</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Success Step */}
                {step === 'success' && (
                  <div className="text-center py-6">
                    <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">Review Submitted!</h3>
                    <p className="text-white/70 text-sm mb-4">
                      Thank you for your review. It will be reviewed and published soon.
                    </p>
                    <div className="text-white/50 text-xs">
                      <p>✓ Email verified with Abstract API</p>
                      <p>✓ Review submitted for approval</p>
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddReviewButton;
