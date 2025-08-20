import fs from 'fs';
import path from 'path';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  author: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  publishedAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published';
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    customUrl?: string;
  };
  readTime: number;
  views: number;
}

const BLOG_DATA_PATH = path.join(process.cwd(), 'data', 'blog-posts.json');

// Ensure data directory exists
export function ensureDataDirectory() {
  const dataDir = path.dirname(BLOG_DATA_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load blog posts from file
export function loadBlogPosts(): BlogPost[] {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(BLOG_DATA_PATH)) {
      return [];
    }
    const data = fs.readFileSync(BLOG_DATA_PATH, 'utf-8');
    const posts = JSON.parse(data);
    
    // Convert date strings back to Date objects
    return posts.map((post: any) => ({
      ...post,
      publishedAt: new Date(post.publishedAt),
      updatedAt: new Date(post.updatedAt)
    }));
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
}

// Save blog posts to file
export function saveBlogPosts(posts: BlogPost[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(BLOG_DATA_PATH, JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error('Error saving blog posts:', error);
  }
}

// Generate a URL-friendly slug
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Calculate reading time
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
