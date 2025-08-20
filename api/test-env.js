// Simple test endpoint for Vercel serverless functions
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Test response
  res.status(200).json({
    success: true,
    message: 'Campus Tools Backend API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      blog: '/api/blog',
      ai_doubt_solver: '/api/ai-doubt-solver',
      quiz_generator: '/api/quiz-generator',
      mind_map: '/api/mind-map-generator',
      plagiarism: '/api/plagiarism-check',
      resume: '/api/resume-builder'
    }
  });
}
