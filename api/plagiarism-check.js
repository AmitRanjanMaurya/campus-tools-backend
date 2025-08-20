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
      const { text, checkType = 'similarity' } = req.body;

      if (!text || text.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Text must be at least 10 characters long'
        });
      }

      // Mock plagiarism check (replace with actual plagiarism detection service)
      const mockResult = {
        originalText: text,
        textLength: text.length,
        wordCount: text.split(' ').length,
        checkType,
        results: {
          overallSimilarity: Math.floor(Math.random() * 30) + 5, // 5-35% random
          uniqueness: Math.floor(Math.random() * 20) + 75, // 75-95% random
          sources: [
            {
              url: 'https://example-source1.com',
              similarity: Math.floor(Math.random() * 15) + 5,
              matchedText: text.substring(0, Math.min(50, text.length)) + '...',
              title: 'Sample Academic Source 1'
            },
            {
              url: 'https://example-source2.com', 
              similarity: Math.floor(Math.random() * 10) + 3,
              matchedText: text.substring(20, Math.min(70, text.length)) + '...',
              title: 'Sample Academic Source 2'
            }
          ],
          flags: [
            {
              type: 'partial_match',
              severity: 'low',
              description: 'Some phrases found in common academic sources'
            }
          ]
        },
        recommendations: [
          'Consider paraphrasing highlighted sections',
          'Add proper citations for referenced material',
          'Review flagged passages for originality'
        ],
        metadata: {
          checkedAt: new Date().toISOString(),
          processingTime: Math.floor(Math.random() * 5000) + 1000, // 1-6 seconds
          databasesChecked: ['Academic Papers', 'Web Sources', 'Student Papers']
        }
      };

      return res.status(200).json({
        success: true,
        data: mockResult
      });
    }

    // GET request - return service info
    return res.status(200).json({
      success: true,
      message: 'Plagiarism Check API',
      endpoints: {
        POST: '/api/plagiarism-check - Check text for plagiarism',
      },
      parameters: {
        text: 'string (required) - Text to check for plagiarism (min 10 characters)',
        checkType: 'string (optional) - similarity, exact, paraphrase (default: similarity)'
      }
    });

  } catch (error) {
    console.error('Plagiarism Check API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
