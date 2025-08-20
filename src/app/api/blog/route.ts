import { NextRequest, NextResponse } from 'next/server';
import { 
  BlogPost, 
  loadBlogPosts, 
  saveBlogPosts, 
  generateSlug, 
  calculateReadTime, 
  generateId 
} from '@/utils/blogStorage';

// GET - Fetch all blog posts or specific post
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const status = searchParams.get('status') || 'published';
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '10');
  const page = parseInt(searchParams.get('page') || '1');

  try {
    const blogPosts = loadBlogPosts();
    
    if (slug) {
      const post = blogPosts.find((p: BlogPost) => p.slug === slug && (status === 'all' || p.status === status));
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      
      // Increment view count
      post.views += 1;
      saveBlogPosts(blogPosts);
      
      return NextResponse.json({ post });
    }

    // Filter posts
    let filteredPosts = status === 'all' ? blogPosts : blogPosts.filter((p: BlogPost) => p.status === status);
    
    if (category) {
      filteredPosts = filteredPosts.filter((p: BlogPost) => p.category === category);
    }

    // Sort by published date (newest first)
    filteredPosts.sort((a: BlogPost, b: BlogPost) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    return NextResponse.json({
      posts: paginatedPosts,
      pagination: {
        total: filteredPosts.length,
        page,
        limit,
        pages: Math.ceil(filteredPosts.length / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const blogPosts = loadBlogPosts();
    
    // Generate slug from title
    const slug = generateSlug(body.title);

    // Check if slug already exists
    if (blogPosts.some((p: BlogPost) => p.slug === slug)) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    // Calculate read time
    const readTime = calculateReadTime(body.content);

    const newPost: BlogPost = {
      id: generateId(),
      ...body,
      slug,
      publishedAt: new Date(),
      updatedAt: new Date(),
      readTime,
      views: 0
    };

    blogPosts.push(newPost);
    saveBlogPosts(blogPosts);

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// PUT - Update existing blog post
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    const blogPosts = loadBlogPosts();

    const postIndex = blogPosts.findIndex((p: BlogPost) => p.id === id);
    if (postIndex === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Update slug if title changed
    let slug = body.slug;
    if (body.title && body.title !== blogPosts[postIndex].title) {
      slug = generateSlug(body.title);
    }

    // Calculate read time
    const readTime = calculateReadTime(body.content);

    blogPosts[postIndex] = {
      ...blogPosts[postIndex],
      ...body,
      slug,
      updatedAt: new Date(),
      readTime
    };

    saveBlogPosts(blogPosts);

    return NextResponse.json({ post: blogPosts[postIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE - Delete blog post
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
  }

  const blogPosts = loadBlogPosts();
  const postIndex = blogPosts.findIndex((p: BlogPost) => p.id === id);
  if (postIndex === -1) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  blogPosts.splice(postIndex, 1);
  saveBlogPosts(blogPosts);

  return NextResponse.json({ message: 'Post deleted successfully' });
}
