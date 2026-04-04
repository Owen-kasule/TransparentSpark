import { supabase } from './supabase';
import type { SiteContent, SiteSection } from '../types/content';
import { defaultContent } from './contentDefaults';

/**
 * Deep merges stored content over defaults so every field has a value.
 */
function deepMerge<T extends Record<string, any>>(defaults: T, overrides: Partial<T>): T {
  const result = { ...defaults };
  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const val = overrides[key];
    if (val === undefined || val === null) continue;
    if (
      typeof val === 'object' &&
      !Array.isArray(val) &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key] as any, val as any);
    } else {
      result[key] = val as T[keyof T];
    }
  }
  return result;
}

/**
 * Load all site content sections, merged with defaults.
 */
export async function loadAllContent(): Promise<SiteContent> {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('section, content');

    if (error) throw error;

    const merged = { ...defaultContent };
    if (data) {
      for (const row of data) {
        const section = row.section as SiteSection;
        if (section in defaultContent) {
          (merged as any)[section] = deepMerge(
            (defaultContent as any)[section],
            row.content || {}
          );
        }
      }
    }
    return merged;
  } catch (err) {
    console.warn('Failed to load site content, using defaults:', err);
    return { ...defaultContent };
  }
}

/**
 * Save a single section's content to Supabase.
 */
export async function saveSection<K extends SiteSection>(
  section: K,
  content: SiteContent[K]
): Promise<void> {
  const { error } = await supabase
    .from('site_content')
    .upsert(
      { section, content: content as any, updated_at: new Date().toISOString() },
      { onConflict: 'section' }
    );

  if (error) throw error;
}

/**
 * Upload an image to the site-images bucket.
 * Returns the public URL.
 */
export async function uploadImage(
  file: Blob,
  path: string
): Promise<string> {
  const { error } = await supabase.storage
    .from('site-images')
    .upload(path, file, { upsert: true, contentType: 'image/jpeg' });

  if (error) throw error;

  const { data } = supabase.storage.from('site-images').getPublicUrl(path);
  return data.publicUrl;
}
