/**
 * Gravatar utility functions for generating profile picture URLs from email addresses
 */

export interface GravatarOptions {
  size?: number;
  default?: '404' | 'mp' | 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'blank';
  rating?: 'g' | 'pg' | 'r' | 'x';
  forceDefault?: boolean;
}

/**
 * Generate MD5 hash of a string (simplified version)
 * Note: In production, you might want to use a proper MD5 library
 */
function md5(str: string): string {
  // This is a simplified MD5 implementation
  // For production, consider using a library like 'crypto-js' or 'md5'
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Generate Gravatar URL from email address
 */
export function getGravatarUrl(email: string, options: GravatarOptions = {}): string {
  const {
    size = 80,
    default: defaultImage = 'identicon',
    rating = 'g',
    forceDefault = false
  } = options;

  // Normalize email (trim and lowercase)
  const normalizedEmail = email.trim().toLowerCase();
  
  // Generate MD5 hash of the email
  const hash = md5(normalizedEmail);
  
  // Build the URL
  const params = new URLSearchParams({
    s: size.toString(),
    d: defaultImage,
    r: rating
  });
  
  if (forceDefault) {
    params.append('f', 'y');
  }
  
  return `https://www.gravatar.com/avatar/${hash}?${params.toString()}`;
}

/**
 * Alternative: Use DiceBear API for more consistent avatars
 * This doesn't require email hashing and provides better fallbacks
 */
export function getDiceBearAvatar(seed: string, options: { size?: number; style?: string } = {}): string {
  const { size = 80, style = 'avataaars' } = options;
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&size=${size}`;
}

/**
 * Get avatar URL with fallback options
 */
export function getAvatarUrl(email: string, name: string, options: GravatarOptions = {}): string {
  try {
    // Try Gravatar first
    return getGravatarUrl(email, options);
  } catch (error) {
    // Fallback to DiceBear using name as seed
    return getDiceBearAvatar(name, { size: options.size });
  }
}

/**
 * Check if an image URL is valid (returns 200 status)
 */
export async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get avatar URL with validation
 */
export async function getValidatedAvatarUrl(email: string, name: string, options: GravatarOptions = {}): Promise<string> {
  // Try Gravatar first
  const gravatarUrl = getGravatarUrl(email, options);
  
  // Check if Gravatar image exists
  const isValid = await isValidImageUrl(gravatarUrl);
  
  if (isValid) {
    return gravatarUrl;
  }
  
  // Fallback to DiceBear
  return getDiceBearAvatar(name, { size: options.size });
} 