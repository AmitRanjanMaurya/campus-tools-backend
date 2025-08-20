'use client'

interface StructuredDataProps {
  data: object
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Common structured data generators
export const generateBreadcrumbStructuredData = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
})

export const generateFAQStructuredData = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
})

export const generateHowToStructuredData = (
  name: string, 
  description: string, 
  steps: Array<{name: string, text: string}>
) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": name,
  "description": description,
  "step": steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text
  }))
})

export const generateOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "StudentTools",
  "url": process.env.NEXT_PUBLIC_BASE_URL || "https://studenttools.vercel.app",
  "logo": {
    "@type": "ImageObject",
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || "https://studenttools.vercel.app"}/logo.png`
  },
  "description": "Comprehensive academic productivity platform with 20+ tools for students",
  "foundingDate": "2024",
  "sameAs": [
    "https://twitter.com/studenttools",
    "https://facebook.com/studenttools",
    "https://linkedin.com/company/studenttools"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "contact@campustoolshub.com"
  }
})
