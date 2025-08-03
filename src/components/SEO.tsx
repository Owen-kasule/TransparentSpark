import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  structuredData?: any;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Owen - Full Stack Developer',
  description = 'Full Stack Developer crafting digital experiences with modern web technologies. Explore my portfolio, blog, and projects.',
  image = '/images/profile/owen-profile.jpg',
  url = 'https://owen-portfolio.com',
  type = 'website',
  author = 'Owen',
  publishedTime,
  modifiedTime,
  tags = [],
  structuredData
}) => {
  const fullTitle = title.includes('Owen') ? title : `${title} | Owen - Full Stack Developer`;
  const fullUrl = url.startsWith('http') ? url : `https://owen-portfolio.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://owen-portfolio.com${image}`;

  // Default structured data for website
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? 'Article' : 'WebSite',
    "name": fullTitle,
    "description": description,
    "url": fullUrl,
    "image": fullImage,
    "author": {
      "@type": "Person",
      "name": author,
      "url": "https://owen-portfolio.com",
      "sameAs": [
        "https://github.com/owen-kasule",
        "https://linkedin.com/in/owen-kasule",
        "https://twitter.com/owen-kasule"
      ]
    }
  };

  // Blog article structured data
  const articleStructuredData = type === 'article' ? {
    ...defaultStructuredData,
    "@type": "BlogPosting",
    "headline": title,
    "datePublished": publishedTime,
    "dateModified": modifiedTime || publishedTime,
    "keywords": tags.join(', '),
    "publisher": {
      "@type": "Person",
      "name": author,
      "url": "https://owen-portfolio.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": fullUrl
    }
  } : defaultStructuredData;

  const finalStructuredData = structuredData || articleStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Owen - Full Stack Developer" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:creator" content="@owen-kasule" />

      {/* Article specific meta */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Keywords */}
      {tags.length > 0 && <meta name="keywords" content={tags.join(', ')} />}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>

      {/* Additional SEO meta */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
    </Helmet>
  );
};

export default SEO;
