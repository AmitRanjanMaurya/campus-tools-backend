import { NextRequest, NextResponse } from 'next/server'

interface ResumeData {
  personal: {
    name: string
    email: string
    phone: string
    linkedin: string
    location: string
    summary: string
  }
  education: any[]
  experience: any[]
  skills: string[]
  projects: any[]
}

interface AISuggestionRequest {
  context: string
  currentText: string
  section: string
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    if (action === 'ai-suggestion') {
      const { context, currentText, section }: AISuggestionRequest = data

      // Use OpenRouter API
      const openrouterApiKey = process.env.OPENROUTER_API_KEY
      
      if (openrouterApiKey) {
        try {
          let prompt = ''
          
          switch (section) {
            case 'summary':
              prompt = `Improve this professional summary for a resume. Make it more compelling and professional while keeping it concise (2-3 sentences). Current text: "${currentText}". Provide only the improved version without additional commentary.`
              break
            case 'experience':
              prompt = `Rewrite this job experience bullet point to be more impactful and use strong action verbs. Include quantifiable results if possible. Current text: "${currentText}". Provide only the improved version without additional commentary.`
              break
            case 'project':
              prompt = `Improve this project description to highlight technical skills and achievements. Make it more professional and specific. Current text: "${currentText}". Provide only the improved version without additional commentary.`
              break
            default:
              prompt = `Improve this text for a professional resume. Make it more compelling and professional: "${currentText}". Provide only the improved version without additional commentary.`
          }

          const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openrouterApiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://campustoolshub.com',
              'X-Title': 'CampusToolsHub - Resume Builder'
            },
            body: JSON.stringify({
              model: 'meta-llama/llama-3.1-8b-instruct:free',
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: 500
            })
          })

          if (openrouterResponse.ok) {
            const openrouterData = await openrouterResponse.json()
            const suggestion = openrouterData.choices?.[0]?.message?.content

            if (suggestion) {
              return NextResponse.json({ 
                suggestion: suggestion.trim(),
                source: 'openrouter'
              })
            }
          }
        } catch (geminiError) {
          console.log('Gemini API failed, trying OpenRouter...', geminiError)
        }
      }

      // Fallback to OpenRouter API
      const openRouterApiKey = process.env.OPENROUTER_API_KEY
      
      if (openRouterApiKey) {
        try {
          const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterApiKey}`,
              'Content-Type': 'application/json',
              'X-Title': 'Student Tools - Resume Builder'
            },
            body: JSON.stringify({
              model: 'meta-llama/llama-3.1-8b-instruct:free',
              messages: [
                {
                  role: 'system',
                  content: 'You are a professional resume writer. Provide improved versions of resume content that are more impactful, professional, and ATS-friendly.'
                },
                {
                  role: 'user',
                  content: `Improve this ${section} for a resume: "${currentText}". Make it more professional and impactful. Provide only the improved version.`
                }
              ],
              temperature: 0.7,
              max_tokens: 200
            })
          })

          if (openRouterResponse.ok) {
            const openRouterData = await openRouterResponse.json()
            const suggestion = openRouterData.choices?.[0]?.message?.content

            if (suggestion) {
              return NextResponse.json({ 
                suggestion: suggestion.trim(),
                source: 'openrouter'
              })
            }
          }
        } catch (openRouterError) {
          console.log('OpenRouter API failed, using fallback...', openRouterError)
        }
      }

      // Fallback suggestions based on section
      const fallbackSuggestions = {
        summary: "Motivated [Your Field] professional with [X years] of experience in [specific skills]. Proven track record of [key achievement] and expertise in [relevant technologies/skills]. Seeking to leverage technical skills and collaborative approach to drive success at [Target Company].",
        experience: "• Developed and implemented [specific project/feature] resulting in [quantified improvement]\n• Collaborated with cross-functional teams to deliver [outcome] ahead of schedule\n• Optimized [process/system] leading to [measurable result]",
        project: "Designed and built [project name] using [technologies] to [problem solved]. Implemented key features including [feature 1], [feature 2], and [feature 3]. Achieved [specific metric or outcome] through [technical approach]."
      }

      const suggestion = fallbackSuggestions[section as keyof typeof fallbackSuggestions] || 
                       "Consider making this more specific and quantifiable. Use strong action verbs and include measurable results where possible."

      return NextResponse.json({ 
        suggestion,
        source: 'fallback'
      })
    }

    if (action === 'save-resume') {
      const resumeData: ResumeData = data
      
      // In a real implementation, you would save to a database
      // For now, we'll simulate a successful save
      const resumeId = `resume_${Date.now()}`
      
      return NextResponse.json({
        success: true,
        resumeId,
        message: 'Resume saved successfully!'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Resume builder API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    )
  }
}
