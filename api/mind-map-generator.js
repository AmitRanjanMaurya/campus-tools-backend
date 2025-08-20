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
      const { topic, subtopics = [], style = 'hierarchical' } = req.body;

      if (!topic) {
        return res.status(400).json({
          success: false,
          error: 'Topic is required'
        });
      }

      // Mock mind map generation (replace with actual AI integration)
      const mockMindMap = {
        centralTopic: topic,
        style,
        nodes: [
          {
            id: 'central',
            text: topic,
            level: 0,
            children: subtopics.length > 0 ? subtopics.map((subtopic, i) => `sub_${i}`) : ['sub_0', 'sub_1', 'sub_2']
          },
          ...((subtopics.length > 0 ? subtopics : ['Key Concept 1', 'Key Concept 2', 'Key Concept 3']).map((subtopic, i) => ({
            id: `sub_${i}`,
            text: subtopic,
            level: 1,
            parent: 'central',
            children: [`detail_${i}_1`, `detail_${i}_2`]
          }))),
          // Add detail nodes
          ...Array.from({ length: (subtopics.length || 3) * 2 }, (_, i) => {
            const parentIndex = Math.floor(i / 2);
            const detailIndex = i % 2 + 1;
            return {
              id: `detail_${parentIndex}_${detailIndex}`,
              text: `Detail ${detailIndex} for concept ${parentIndex + 1}`,
              level: 2,
              parent: `sub_${parentIndex}`,
              children: []
            };
          })
        ],
        metadata: {
          totalNodes: (subtopics.length || 3) * 3 + 1,
          maxDepth: 2,
          generatedAt: new Date().toISOString(),
          style
        }
      };

      return res.status(200).json({
        success: true,
        data: mockMindMap
      });
    }

    // GET request - return service info
    return res.status(200).json({
      success: true,
      message: 'Mind Map Generator API',
      endpoints: {
        POST: '/api/mind-map-generator - Generate mind map structure',
      },
      parameters: {
        topic: 'string (required) - Central topic for the mind map',
        subtopics: 'array (optional) - Array of subtopic strings',
        style: 'string (optional) - hierarchical, radial, flowchart (default: hierarchical)'
      }
    });

  } catch (error) {
    console.error('Mind Map Generator API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
