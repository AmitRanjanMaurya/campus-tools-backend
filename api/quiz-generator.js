export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { topic, difficulty, questionCount = 5 } = req.body;

      if (!topic) {
        return res.status(400).json({
          success: false,
          error: 'Topic is required'
        });
      }

      // Mock quiz generation (replace with actual AI integration)
      const mockQuiz = {
        topic,
        difficulty: difficulty || 'medium',
        totalQuestions: questionCount,
        questions: Array.from({ length: questionCount }, (_, i) => ({
          id: i + 1,
          question: `Sample question ${i + 1} about ${topic}?`,
          options: [
            `Option A for question ${i + 1}`,
            `Option B for question ${i + 1}`,
            `Option C for question ${i + 1}`,
            `Option D for question ${i + 1}`
          ],
          correctAnswer: Math.floor(Math.random() * 4),
          explanation: `This is the explanation for question ${i + 1} about ${topic}.`
        })),
        metadata: {
          generatedAt: new Date().toISOString(),
          estimatedDuration: questionCount * 2, // 2 minutes per question
          passingScore: 70
        }
      };

      return res.status(200).json({
        success: true,
        data: mockQuiz
      });
    }

    // GET request - return service info
    return res.status(200).json({
      success: true,
      message: 'Quiz Generator API',
      endpoints: {
        POST: '/api/quiz-generator - Generate quiz questions',
      },
      parameters: {
        topic: 'string (required) - Subject/topic for the quiz',
        difficulty: 'string (optional) - easy, medium, hard',
        questionCount: 'number (optional) - Number of questions (default: 5)'
      }
    });

  } catch (error) {
    console.error('Quiz Generator API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
