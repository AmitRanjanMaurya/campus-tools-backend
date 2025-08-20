'use client'

import Head from 'next/head'
import { usePathname } from 'next/navigation'

interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  canonicalUrl?: string
  noindex?: boolean
  schema?: any
}

export default function SEO({
  title,
  description,
  keywords = [],
  ogImage = '/og-images/default.png',
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author,
  canonicalUrl,
  noindex = false,
  schema
}: SEOProps) {
  const pathname = usePathname()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://campustoolshub.com'
  const fullUrl = canonicalUrl || `${siteUrl}${pathname}`
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`

  // Ensure title is optimized length (50-60 characters)
  const optimizedTitle = title.length > 60 ? `${title.substring(0, 57)}...` : title
  
  // Ensure description is optimized length (150-160 characters)
  const optimizedDescription = description.length > 160 ? `${description.substring(0, 157)}...` : description

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{optimizedTitle}</title>
      <meta name="description" content={optimizedDescription} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="author" content={author || 'Student Tools'} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={optimizedTitle} />
      <meta property="og:description" content={optimizedDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Student Tools" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={optimizedTitle} />
      <meta name="twitter:description" content={optimizedDescription} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:site" content="@StudentTools" />

      {/* Article specific meta tags */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#3B82F6" />

      {/* Additional SEO Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      
      {/* Schema.org JSON-LD */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </Head>
  )
}

// Schema generators for different content types
export const generateToolSchema = (tool: {
  name: string
  description: string
  url: string
  category: string
  features: string[]
  rating?: number
  reviewCount?: number
}) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": tool.name,
  "description": tool.description,
  "url": tool.url,
  "applicationCategory": tool.category,
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": tool.features,
  "aggregateRating": tool.rating ? {
    "@type": "AggregateRating",
    "ratingValue": tool.rating,
    "reviewCount": tool.reviewCount || 1,
    "bestRating": 5,
    "worstRating": 1
  } : undefined,
  "author": {
    "@type": "Organization",
    "name": "Student Tools",
    "url": process.env.NEXT_PUBLIC_SITE_URL
  }
})

export const generateArticleSchema = (article: {
  title: string
  description: string
  url: string
  publishedTime: string
  modifiedTime?: string
  author: string
  authorUrl?: string
  imageUrl: string
  wordCount?: number
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "url": article.url,
  "datePublished": article.publishedTime,
  "dateModified": article.modifiedTime || article.publishedTime,
  "author": {
    "@type": "Person",
    "name": article.author,
    "url": article.authorUrl
  },
  "publisher": {
    "@type": "Organization",
    "name": "Student Tools",
    "url": process.env.NEXT_PUBLIC_SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
    }
  },
  "image": {
    "@type": "ImageObject",
    "url": article.imageUrl,
    "width": 1200,
    "height": 630
  },
  "wordCount": article.wordCount,
  "articleSection": "Education",
  "inLanguage": "en-US"
})

export const generateWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Student Tools",
  "url": process.env.NEXT_PUBLIC_SITE_URL,
  "description": "Free online tools for students - GPA calculator, resume builder, study timer, and more educational resources",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "author": {
    "@type": "Organization",
    "name": "Student Tools",
    "url": process.env.NEXT_PUBLIC_SITE_URL
  }
})

export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Student Tools",
  "url": process.env.NEXT_PUBLIC_SITE_URL,
  "description": "Free online tools and resources for students worldwide",
  "foundingDate": "2024",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "contact@campustoolshub.com"
  },
  "sameAs": [
    "https://twitter.com/StudentTools",
    "https://facebook.com/StudentTools",
    "https://linkedin.com/company/studenttools"
  ]
})
