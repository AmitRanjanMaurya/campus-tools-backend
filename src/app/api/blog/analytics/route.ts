import { NextRequest, NextResponse } from 'next/server';
import { BlogPost, loadBlogPosts } from '@/utils/blogStorage';

// GET - Get blog analytics and categories
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'categories') {
      const categories = [
        'Study Tips',
        'Tool Guide', 
        'Academic Success',
        'Productivity',
        'Technology',
        'Career Guidance',
        'Time Management',
        'Research Methods',
        'Exam Preparation',
        'Life Skills'
      ];
      return NextResponse.json({ categories });
    }

    if (type === 'tags') {
      const commonTags = [
        'productivity',
        'study techniques',
        'time management',
        'gpa',
        'grades',
        'academic performance',
        'focus',
        'motivation',
        'organization',
        'note-taking',
        'research',
        'writing',
        'mathematics',
        'science',
        'technology',
        'career',
        'internship',
        'resume',
        'interview',
        'skills'
      ];
      return NextResponse.json({ tags: commonTags });
    }

    if (type === 'stats') {
      const blogPosts = loadBlogPosts();
      const publishedPosts = blogPosts.filter((p: BlogPost) => p.status === 'published');
      const draftPosts = blogPosts.filter((p: BlogPost) => p.status === 'draft');
      const totalViews = blogPosts.reduce((sum: number, post: BlogPost) => sum + (post.views || 0), 0);
      
      // Get category counts
      const categoryMap = new Map<string, number>();
      blogPosts.forEach((post: BlogPost) => {
        if (post.category) {
          categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1);
        }
      });
      
      // Get popular tags
      const tagMap = new Map<string, number>();
      blogPosts.forEach((post: BlogPost) => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach((tag: string) => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
          });
        }
      });

      const stats = {
        totalPosts: blogPosts.length,
        publishedPosts: publishedPosts.length,
        draftPosts: draftPosts.length,
        totalViews,
        categories: Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count })),
        popularTags: Array.from(tagMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      };
      
      return NextResponse.json({ stats });
    }

    // Default analytics
    const analytics = {
      totalPosts: 0,
      totalViews: 0,
      totalCategories: 0,
      recentActivity: []
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
