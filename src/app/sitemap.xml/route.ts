import { NextResponse } from 'next/server'
import { loadBlogPosts } from '@/utils/blogStorage'

export async function GET() {
  try {
    const blogPosts = loadBlogPosts()
    const publishedPosts = blogPosts.filter(post => post.status === 'published')
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://campustoolshub.com'
    
    // Define all tool pages for better SEO
    const toolPages = [
      'gpa-calculator',
      'resume-builder', 
      'study-timer',
      'flashcards',
      'notes',
      'ai-study-guide',
      'plagiarism-checker',
      'citation-generator',
      'timetable',
      'unit-converter',
      'scientific-calculator',
      'mind-map',
      'quiz-generator',
      'whiteboard',
      'pdf-annotator',
      'formula-repository',
      'internship-finder',
      'grade-tracker',
      'deadline-tracker',
      'budget-planner',
      'lab-report-generator',
      'code-playground',
      'ai-doubt-solver',
      'resume-analyzer'
    ]
    
    const staticPages = [
      {
        url: `${baseUrl}/`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: '1.0'
      },
      {
        url: `${baseUrl}/tools`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly', 
        priority: '0.9'
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: '0.8'
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: '0.6'
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: '0.5'
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'yearly',
        priority: '0.3'
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'yearly',
        priority: '0.3'
      }
    ]
    
    // Add all tool pages
    const toolPageUrls = toolPages.map(tool => ({
      url: `${baseUrl}/tools/${tool}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: '0.8'
    }))
    
    // Add blog post pages
    const blogPages = publishedPosts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt).toISOString(),
      changeFrequency: 'monthly',
      priority: '0.7'
    }))
    
    const allPages = [...staticPages, ...toolPageUrls, ...blogPages]
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
    <mobile:mobile/>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 })
  }
}
