// Blog API endpoint
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Return sample blog posts
      const posts = [
        {
          id: 1,
          title: "10 Study Tips for College Students",
          excerpt: "Effective study strategies to boost your academic performance",
          content: "Here are proven study techniques that can help college students...",
          author: "Campus Tools Team",
          publishedAt: "2024-01-15",
          tags: ["study", "productivity", "college"]
        },
        {
          id: 2,
          title: "Time Management for Students",
          excerpt: "Learn how to balance studies, work, and personal life",
          content: "Time management is crucial for student success...",
          author: "Campus Tools Team",
          publishedAt: "2024-01-10",
          tags: ["time-management", "productivity"]
        }
      ];

      res.status(200).json({
        success: true,
        posts: posts,
        total: posts.length
      });
    } else if (req.method === 'POST') {
      // Handle blog post creation (authentication required)
      res.status(200).json({
        success: true,
        message: "Blog post created successfully",
        post: {
          id: 3,
          title: req.body.title || "New Post",
          content: req.body.content || "Post content"
        }
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Blog API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
