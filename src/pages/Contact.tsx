import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, ArrowDown, AlertCircle, Loader2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import SocialLinks from '../components/ui/SocialLinks';
import { useAnalytics } from '../hooks/useAnalytics';
import { abstractEmailValidator } from '../lib/abstractEmailValidator';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Email validation state
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    isChecking: false,
    message: '',
    hasBeenTouched: false
  });

  // Track page visit
  useAnalytics('contact');

  // Pre-fill email from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    if (emailFromUrl) {
      setFormData(prev => ({
        ...prev,
        email: emailFromUrl
      }));
    }
  }, []);

  // Debounced email validation
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
            console.log(`📧 Email validation for ${email}:`, result);
            setEmailValidation({
              isValid: result.isValid,
              isChecking: false,
              message: result.reason,
              hasBeenTouched: true
            });
          } catch (error) {
            console.error('❌ Email validation error:', error);
            setEmailValidation({
              isValid: false,
              isChecking: false,
              message: '❌ Error validating email. Please try again.',
              hasBeenTouched: true
            });
          }
        }, 2400); // Wait 2400ms after user stops typing
      };
    })(),
    []
  );

  // Validate email when it changes
  useEffect(() => {
    debouncedEmailValidation(formData.email);
  }, [formData.email, debouncedEmailValidation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if email is invalid
    if (!emailValidation.isValid && emailValidation.hasBeenTouched) {
      return;
    }
    
    // Handle form submission here
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'owenatug@gmail.com', href: 'mailto:owenatug@gmail.com' },
    { icon: Phone, label: 'Phone', value: '+256774711146', href: 'tel:+256774711146' },
    { icon: MapPin, label: 'Location', value: 'Kampala, Uganda', href: '#' }
  ];

  return (
    <div className="min-h-screen md:min-h-0 lg:min-h-screen relative pt-4 lg:pt-24 pb-0.5 lg:pb-12">
      {/* Social Links on all pages */}
      <div className="hidden lg:block">
  <SocialLinks vertical className="fixed left-8 bottom-32 transform z-[60]" />
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

      <div className="container mx-auto px-6 space-y-4 lg:space-y-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4 lg:mb-12"
        >
          <h1 className="ui-page-title mb-5">
            CONTACT
          </h1>
          <div className="flex items-center justify-center mb-6">
            <div className="h-1 w-24 bg-azure-400"></div>
          </div>
          <p className="ui-lead max-w-2xl mx-auto">
            Ready to start your next project? Let's discuss how we can work together.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 ui-grid-gap lg:gap-8 mb-12">
          {/* Contact Form */}
          <GlassCard delay={0.2} className="p-6">
            <h2 className="ui-section-title">Get In Touch</h2>
            
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <CheckCircle className="text-green-400 mx-auto mb-3" size={40} />
                <h3 className="text-lg font-semibold text-white mb-2">Message Sent!</h3>
                <p className="text-white/70 text-sm">Thank you for reaching out. I'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-white/80 text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400 transition-colors duration-300 text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none transition-colors duration-300 text-sm pr-10 ${
                          emailValidation.hasBeenTouched
                            ? emailValidation.isValid
                              ? 'border-green-400 focus:border-green-400'
                              : 'border-red-400 focus:border-red-400'
                            : 'border-white/20 focus:border-azure-400'
                        }`}
                        placeholder="your@email.com"
                      />
                      
                      {/* Validation Icon */}
                      {emailValidation.isChecking && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="text-azure-400 animate-spin" size={16} />
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
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-white/80 text-sm font-medium mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400 transition-colors duration-300 text-sm"
                    placeholder="Project inquiry"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-white/80 text-sm font-medium mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-azure-400 transition-colors duration-300 resize-none text-sm"
                    placeholder="Tell me about your project..."
                  />
                </div>
                
                <motion.button
                  type="submit"
                  disabled={!emailValidation.isValid && emailValidation.hasBeenTouched}
                  whileHover={{ scale: emailValidation.isValid || !emailValidation.hasBeenTouched ? 1.02 : 1 }}
                  whileTap={{ scale: emailValidation.isValid || !emailValidation.hasBeenTouched ? 0.98 : 1 }}
                  className={`w-full px-4 py-2 rounded-lg transition-colors duration-300 font-medium flex items-center justify-center space-x-2 text-sm ${
                    emailValidation.isValid || !emailValidation.hasBeenTouched
                      ? 'bg-azure-500 hover:bg-azure-600 text-white'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} />
                  <span>Send Message</span>
                </motion.button>
              </form>
            )}
          </GlassCard>

          {/* Contact Info & Services */}
          <div className="space-y-4 md:space-y-6">
            <GlassCard delay={0.4} className="p-6">
              <h3 className="ui-section-title">Contact Information</h3>
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <a
                    key={index}
                    href={info.href}
                    className="flex items-center space-x-3 text-white/80 hover:text-azure-400 transition-colors duration-300 group"
                  >
                    <div className="w-10 h-10 bg-azure-500/20 rounded-lg flex items-center justify-center group-hover:bg-azure-500/30 transition-colors duration-300">
                      <info.icon size={16} className="text-azure-400" />
                    </div>
                    <div>
                      <p className="ui-meta">{info.label}</p>
                      <p className="font-medium text-sm">{info.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </GlassCard>

            <GlassCard delay={0.6} className="p-6">
              <h3 className="ui-section-title">Services</h3>
              <div className="flex flex-wrap gap-2">
                {['Web Development', 'Mobile Apps', 'API Design', 'Consulting'].map((service) => (
                  <span 
                    key={service}
                    className="px-3 py-1 bg-azure-400/20 text-azure-400 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </GlassCard>

            <GlassCard delay={0.8} className="p-6 hidden lg:block">
              <h3 className="ui-section-title">Follow Me</h3>
              <p className="ui-body mb-4">
                Stay updated with my latest projects and insights
              </p>
              <div className="hidden lg:block">
                <SocialLinks />
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Mobile Social Links removed - footer handles will be used on small screens */}
      </div>
    </div>
  );
};

export default Contact;