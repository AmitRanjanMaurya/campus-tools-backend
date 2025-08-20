// Authentication utility for blog admin
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  avatar?: string;
}

export class BlogAuth {
  private static readonly SESSION_KEY = 'blog_admin_session'
  private static readonly TOKEN_KEY = 'blog_admin_token'
  
  static async login(email: string, password: string): Promise<AdminUser | null> {
    try {
      const response = await fetch('/api/blog/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store token securely
        localStorage.setItem(this.TOKEN_KEY, data.token)
        
        // Store session data
        localStorage.setItem(this.SESSION_KEY, JSON.stringify({
          user: data.user,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        }))
        
        return data.user
      } else {
        // Handle specific error messages from server
        throw new Error(data.message || data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }
  
  static logout(): void {
    localStorage.removeItem(this.SESSION_KEY)
    localStorage.removeItem(this.TOKEN_KEY)
  }
  
  static async getCurrentUser(): Promise<AdminUser | null> {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY)
      if (!token) return null

      // Verify token with server
      const response = await fetch('/api/blog/auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.valid) {
          // Update session data
          localStorage.setItem(this.SESSION_KEY, JSON.stringify({
            user: data.user,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          }))
          return data.user
        }
      }

      // Token invalid, clear storage
      this.logout()
      return null
    } catch (error) {
      console.error('Error verifying token:', error)
      this.logout()
      return null
    }
  }
  
  static isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY)
    const session = localStorage.getItem(this.SESSION_KEY)
    return !!(token && session)
  }

  // Get session data without server verification (for quick checks)
  static getStoredUser(): AdminUser | null {
    try {
      const session = localStorage.getItem(this.SESSION_KEY)
      if (!session) return null
      
      const { user, timestamp } = JSON.parse(session)
      
      // Check if session is reasonably fresh (24 hours)
      const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000
      if (isExpired) {
        this.logout()
        return null
      }
      
      return user
    } catch {
      return null
    }
  }
}

// AI Content Generation utilities
export class AIContentGenerator {
  private static readonly API_ENDPOINT = '/api/ai/content';
  
  static async generateTitle(keywords: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/titles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.titles || [];
      }
    } catch (error) {
      console.error('Title generation failed:', error);
    }
    
    // Fallback suggestions
    return [
      `Complete Guide to ${keywords}`,
      `Top Tips for ${keywords}`,
      `Master ${keywords}: Student Guide`,
      `${keywords}: Everything You Need to Know`,
      `Ultimate ${keywords} Tutorial for Students`
    ];
  }
  
  static async expandContent(outline: string): Promise<string> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/expand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outline })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.content || outline;
      }
    } catch (error) {
      console.error('Content expansion failed:', error);
    }
    
    return outline;
  }
  
  static async generateSEO(title: string, content: string): Promise<{
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  }> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.seo;
      }
    } catch (error) {
      console.error('SEO generation failed:', error);
    }
    
    // Fallback SEO
    const words = content.replace(/[^\w\s]/g, '').split(/\s+/).slice(0, 100);
    const keywords = words.filter(w => w.length > 3).slice(0, 10).join(', ');
    
    return {
      metaTitle: title.length > 60 ? title.substring(0, 57) + '...' : title,
      metaDescription: content.substring(0, 150) + '...',
      metaKeywords: keywords
    };
  }
}

// Rich text editor utilities
export class RichTextUtils {
  static stripHTML(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
  
  static calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const words = this.stripHTML(content).split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }
  
  static generateExcerpt(content: string, maxLength = 160): string {
    const text = this.stripHTML(content);
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

// Image upload utilities
export class ImageUpload {
  static async uploadImage(file: File): Promise<string> {
    // In production, upload to cloud storage (Cloudinary, AWS S3, etc.)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // For demo, return data URL
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
  
  static validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
    }
    
    return { valid: true };
  }
}

// SEO optimization utilities
export class SEOOptimizer {
  static optimizeTitle(title: string): string {
    // Ensure title is 50-60 characters for optimal SEO
    if (title.length <= 60) return title;
    
    const words = title.split(' ');
    let optimized = '';
    
    for (const word of words) {
      if ((optimized + ' ' + word).length <= 57) {
        optimized += (optimized ? ' ' : '') + word;
      } else {
        break;
      }
    }
    
    return optimized + '...';
  }
  
  static optimizeDescription(description: string): string {
    // Ensure description is 150-160 characters
    if (description.length <= 160) return description;
    
    const truncated = description.substring(0, 157);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return truncated.substring(0, lastSpace) + '...';
  }
  
  static extractKeywords(content: string): string[] {
    // Simple keyword extraction (in production, use NLP libraries)
    const text = content.toLowerCase().replace(/[^\w\s]/g, '');
    const words = text.split(/\s+/);
    
    // Filter common words and short words
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'will', 'be', 'with', 'for', 'in', 'of', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'under', 'over']);
    
    const keywords = words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }
}
