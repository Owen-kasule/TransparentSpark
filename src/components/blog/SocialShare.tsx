import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Facebook, 
  Linkedin, 
  Link, 
  Copy, 
  CheckCircle,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

// Custom WhatsApp and X (Twitter) icons
const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface SocialShareProps {
  url: string;
  title: string;
  description: string;
  className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ 
  url, 
  title, 
  description, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    text: description,
    url
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'Twitter',
      icon: XIcon,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      url: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this article: ${title}\n\n${description}\n\n${url}`)}`
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error('Failed to share');
        }
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleSocialShare = (platform: typeof socialPlatforms[0]) => {
    window.open(
      platform.url,
      'share-dialog',
      'width=600,height=400,resizable=yes,scrollbars=yes'
    );
    
    toast.success(`Opening ${platform.name}...`);
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Desktop: Horizontal Icons Layout */}
      <div className="hidden lg:flex items-center space-x-3">
        <span className="text-white/60 text-sm font-medium">Share:</span>
        
        {/* Social Platform Icons - All Same Color */}
        {socialPlatforms.map((platform) => (
          <button
            key={platform.name}
            onClick={() => handleSocialShare(platform)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 group text-white/70 hover:text-white"
            title={`Share on ${platform.name}`}
          >
            <platform.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
          </button>
        ))}

        {/* Copy Link Button - Same Color */}
        <button
          onClick={handleCopyLink}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 group"
          title="Copy Link"
        >
          {copied ? (
            <CheckCircle size={18} className="text-green-400" />
          ) : (
            <Copy size={18} className="text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
          )}
        </button>
      </div>

      {/* Mobile: Dropdown Menu */}
      <div className="lg:hidden">
        {/* Share Button */}
        <button
          onClick={handleNativeShare}
          className="flex items-center space-x-2 px-4 py-2 bg-azure-500/20 text-azure-400 rounded-lg hover:bg-azure-500/30 transition-colors duration-300"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>

        {/* Share Menu - Vertical Layout for Mobile */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute top-full right-0 mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50"
            >
              <div className="p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                  <Share2 size={16} />
                  <span>Share this post</span>
                </h4>
                
                {/* Social Platform Buttons - Vertical Layout with Icons and Names */}
                <div className="space-y-2 mb-4">
                  {socialPlatforms.map((platform) => (
                    <button
                      key={platform.name}
                      onClick={() => handleSocialShare(platform)}
                      className="w-full flex items-center space-x-3 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-300"
                    >
                      <platform.icon size={16} className="text-white/70" />
                      <span>Share on {platform.name}</span>
                    </button>
                  ))}
                </div>

                {/* Copy Link */}
                <div className="border-t border-white/20 pt-3">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center space-x-3 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-300"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={16} className="text-green-400" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="text-white/70" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors duration-300"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default SocialShare;