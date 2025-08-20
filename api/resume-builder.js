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
      const { 
        personalInfo, 
        experience = [], 
        education = [], 
        skills = [], 
        template = 'modern' 
      } = req.body;

      if (!personalInfo || !personalInfo.name || !personalInfo.email) {
        return res.status(400).json({
          success: false,
          error: 'Personal info with name and email is required'
        });
      }

      // Mock resume generation (replace with actual PDF generation)
      const mockResume = {
        template,
        personalInfo,
        sections: {
          experience: experience.map((exp, i) => ({
            id: i + 1,
            ...exp,
            formatted: true
          })),
          education: education.map((edu, i) => ({
            id: i + 1,
            ...edu,
            formatted: true
          })),
          skills: skills.map((skill, i) => ({
            id: i + 1,
            name: skill,
            category: 'general'
          }))
        },
        formatting: {
          template,
          font: 'Arial',
          fontSize: 12,
          margins: '1 inch',
          pageCount: 1
        },
        generated: {
          timestamp: new Date().toISOString(),
          version: '1.0',
          downloadUrl: `https://example.com/resume_${Date.now()}.pdf`,
          previewUrl: `https://example.com/preview_${Date.now()}.png`
        }
      };

      return res.status(200).json({
        success: true,
        data: mockResume,
        message: 'Resume generated successfully'
      });
    }

    // GET request - return service info
    return res.status(200).json({
      success: true,
      message: 'Resume Builder API',
      endpoints: {
        POST: '/api/resume-builder - Generate resume PDF',
      },
      parameters: {
        personalInfo: 'object (required) - {name, email, phone, address}',
        experience: 'array (optional) - Work experience entries',
        education: 'array (optional) - Education entries', 
        skills: 'array (optional) - Skills list',
        template: 'string (optional) - modern, classic, minimal (default: modern)'
      },
      templates: ['modern', 'classic', 'minimal', 'creative']
    });

  } catch (error) {
    console.error('Resume Builder API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
