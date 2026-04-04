import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SiteContent, SiteSection } from '../types/content';
import { defaultContent } from '../lib/contentDefaults';
import { loadAllContent, saveSection } from '../lib/contentService';
import { generatePalette } from '../lib/colorPalette';

interface SiteContentCtx {
  content: SiteContent;
  isLoaded: boolean;
  update: <K extends SiteSection>(section: K, data: SiteContent[K]) => Promise<void>;
  reload: () => Promise<void>;
}

const Context = createContext<SiteContentCtx>({
  content: defaultContent,
  isLoaded: false,
  update: async () => {},
  reload: async () => {},
});

export const useContent = () => useContext(Context);

/**
 * Inject CSS custom properties for the dynamic azure palette.
 */
function applyThemeColor(hex: string) {
  const palette = generatePalette(hex);
  const root = document.documentElement;
  for (const [shade, color] of Object.entries(palette)) {
    root.style.setProperty(`--azure-${shade}`, color);
  }
}

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [isLoaded, setIsLoaded] = useState(false);

  const load = async () => {
    const data = await loadAllContent();
    setContent(data);
    setIsLoaded(true);
    if (data.theme.primaryColor) {
      applyThemeColor(data.theme.primaryColor);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async <K extends SiteSection>(section: K, data: SiteContent[K]) => {
    await saveSection(section, data);
    setContent(prev => ({ ...prev, [section]: data }));
    if (section === 'theme') {
      applyThemeColor((data as any).primaryColor || defaultContent.theme.primaryColor);
    }
  };

  return (
    <Context.Provider value={{ content, isLoaded, update, reload: load }}>
      {children}
    </Context.Provider>
  );
};
