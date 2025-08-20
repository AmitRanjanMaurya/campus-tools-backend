import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Clean HTML tags from content for keyword extraction
    const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Extract keywords using frequency analysis
    const words = cleanContent.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word: string) => {
        // Filter out common stop words and short words
        const stopWords = [
          'the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 
          'will', 'be', 'with', 'for', 'in', 'of', 'by', 'from', 'up', 'about', 
          'into', 'through', 'during', 'before', 'after', 'above', 'below', 
          'between', 'among', 'under', 'over', 'this', 'that', 'these', 'those',
          'can', 'could', 'should', 'would', 'may', 'might', 'must', 'shall',
          'have', 'has', 'had', 'do', 'does', 'did', 'get', 'got', 'make', 'made',
          'take', 'took', 'come', 'came', 'go', 'went', 'see', 'saw', 'know', 'knew'
        ];
        return word.length > 3 && !stopWords.includes(word);
      });

    // Count word frequency
    const wordCount: Record<string, number> = {};
    words.forEach((word: string) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Get top keywords
    const topKeywords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);

    // Generate optimized SEO metadata
    const metaTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
    
    const metaDescription = cleanContent.length > 160 
      ? cleanContent.substring(0, 157) + '...'
      : cleanContent;

    const metaKeywords = topKeywords.slice(0, 10).join(', ');

    // Generate Open Graph data
    const ogTitle = title.length > 95 ? title.substring(0, 92) + '...' : title;
    const ogDescription = cleanContent.length > 200 
      ? cleanContent.substring(0, 197) + '...'
      : cleanContent;

    // Additional SEO suggestions
    const suggestions = [];
    
    if (title.length < 30) {
      suggestions.push('Consider making your title longer (30-60 characters) for better SEO');
    }
    if (title.length > 60) {
      suggestions.push('Your title is too long for optimal SEO (60+ characters)');
    }
    if (metaDescription.length < 120) {
      suggestions.push('Consider making your meta description longer (120-160 characters)');
    }
    if (topKeywords.length < 5) {
      suggestions.push('Try to include more relevant keywords in your content');
    }

    const seo = {
      metaTitle,
      metaDescription,
      metaKeywords,
      ogTitle,
      ogDescription,
      ogImage: '', // Can be set manually or auto-generated
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': title,
        'description': metaDescription,
        'keywords': metaKeywords,
        'author': {
          '@type': 'Organization',
          'name': 'StudentTools Team'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'StudentTools',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://campustoolshub.com/logo.png'
          }
        }
      },
      suggestions,
      analytics: {
        titleLength: title.length,
        descriptionLength: metaDescription.length,
        keywordCount: topKeywords.length,
        contentLength: cleanContent.length,
        readabilityScore: calculateReadabilityScore(cleanContent)
      }
    };

    return NextResponse.json({ seo });

  } catch (error) {
    console.error('SEO Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate SEO metadata' }, { status: 500 });
  }
}

// Simple readability score calculation (Flesch Reading Ease approximation)
function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const syllables = countSyllables(text);

  if (sentences === 0 || words === 0) return 0;

  const avgSentenceLength = words / sentences;
  const avgSyllablesPerWord = syllables / words;

  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Simple syllable counting function
function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let syllables = 0;

  words.forEach((word: string) => {
    // Remove punctuation
    word = word.replace(/[^a-z]/g, '');
    if (word.length === 0) return;

    // Count vowel groups
    const vowelGroups = word.match(/[aeiouy]+/g) || [];
    syllables += vowelGroups.length;

    // Adjust for silent e
    if (word.endsWith('e') && vowelGroups.length > 1) {
      syllables--;
    }

    // Ensure at least 1 syllable per word
    if (syllables === 0) syllables = 1;
  });

  return syllables;
}
