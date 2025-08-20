'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_TRACKING_ID || !window.gtag) return

    const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
    
    // Track page views with enhanced data for SEO
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
      page_title: document.title,
      anonymize_ip: true,
      respect_gdpr: true,
      send_page_view: true
    })

    // Track tool usage for SEO insights
    const toolMatch = pathname.match(/\/tools\/(.+)/)
    if (toolMatch) {
      window.gtag('event', 'tool_usage', {
        event_category: 'Tools',
        event_label: toolMatch[1],
        tool_name: toolMatch[1].replace(/-/g, ' '),
        page_path: url
      })
    }

    // Track blog article views
    const blogMatch = pathname.match(/\/blog\/(.+)/)
    if (blogMatch) {
      window.gtag('event', 'blog_view', {
        event_category: 'Blog',
        event_label: blogMatch[1],
        article_title: blogMatch[1].replace(/-/g, ' '),
        page_path: url
      })
    }

  }, [pathname, searchParams])

  // Don't load analytics in development
  if (process.env.NODE_ENV !== 'production' || !GA_TRACKING_ID) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              page_title: document.title,
              anonymize_ip: true,
              respect_gdpr: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });
          `,
        }}
      />
    </>
  )
}

// Enhanced utility functions for SEO and UX tracking
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      non_interaction: false
    })
  }
}

export const trackToolUsage = (toolName: string, action: string = 'use') => {
  trackEvent(action, 'Tools', toolName)
}

export const trackSearch = (searchTerm: string, resultCount: number = 0) => {
  trackEvent('search', 'Site Search', searchTerm, resultCount)
}

export const trackDownload = (fileName: string, fileType: string = 'unknown') => {
  trackEvent('download', 'Downloads', `${fileName}.${fileType}`)
}

export const trackSocialShare = (platform: string, url: string) => {
  trackEvent('share', 'Social', platform)
}

export const trackFormSubmission = (formName: string, success: boolean = true) => {
  trackEvent(success ? 'submit_success' : 'submit_error', 'Forms', formName)
}

export const trackQuizCompletion = (quizType: string, score: number, timeSpent: number) => {
  trackEvent('quiz_complete', 'Quizzes', quizType, score)
  trackEvent('quiz_time', 'Engagement', quizType, timeSpent)
}

export const trackError = (error: string, page: string) => {
  trackEvent('error', 'Errors', `${page}: ${error}`)
}

// Performance tracking for Core Web Vitals (SEO ranking factor)
export const trackWebVitals = () => {
  if (typeof window !== 'undefined') {
    // Dynamic import with proper error handling
    try {
      import('web-vitals').then((webVitals) => {
        if (webVitals.onCLS) {
          webVitals.onCLS((metric: any) => {
            window.gtag?.('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'CLS',
              value: Math.round(metric.value * 1000),
              non_interaction: true
            })
          })
        }

        if (webVitals.onFID) {
          webVitals.onFID((metric: any) => {
            window.gtag?.('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'FID',
              value: Math.round(metric.value),
              non_interaction: true
            })
          })
        }

        if (webVitals.onFCP) {
          webVitals.onFCP((metric: any) => {
            window.gtag?.('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'FCP',
              value: Math.round(metric.value),
              non_interaction: true
            })
          })
        }

        if (webVitals.onLCP) {
          webVitals.onLCP((metric: any) => {
            window.gtag?.('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'LCP',
              value: Math.round(metric.value),
              non_interaction: true
            })
          })
        }

        if (webVitals.onTTFB) {
          webVitals.onTTFB((metric: any) => {
            window.gtag?.('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'TTFB',
              value: Math.round(metric.value),
              non_interaction: true
            })
          })
        }
      }).catch(() => {
        // Silently fail if web-vitals is not available
        console.warn('web-vitals library not available')
      })
    } catch (error) {
      console.warn('Failed to load web-vitals:', error)
    }
  }
}
