import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'Text too short for rewriting (minimum 10 characters)' }, { status: 400 });
    }

    // Build rewrite prompt
    const prompt = `You are an advanced academic writing assistant. Your task is to rewrite the following text to make it original while preserving the core meaning and information.

ORIGINAL TEXT:
"${text}"

REWRITING GUIDELINES:
1. Maintain the original meaning and key information
2. Use different sentence structures and vocabulary
3. Ensure the rewritten text is academically appropriate
4. Keep the same tone and style as much as possible
5. Make it plagiarism-free while being accurate
6. Preserve any technical terms that shouldn't be changed
7. Keep the same length approximately

Please provide 2-3 different rewrite options in the following format:

OPTION 1:
[Rewritten text version 1]

OPTION 2:
[Rewritten text version 2]

OPTION 3:
[Rewritten text version 3]

WRITING TIPS:
- Use synonyms where appropriate
- Restructure sentences creatively
- Change passive to active voice or vice versa
- Combine or split sentences as needed

Provide only the rewritten versions, no additional explanation.`;

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://campustoolshub.com',
        'X-Title': 'CampusToolsHub - Rewrite Assistant'
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
        max_tokens: 2000
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter API error:', data.error || data);
      return NextResponse.json({ 
        error: data.error?.message || 'Failed to rewrite text' 
      }, { status: 500 });
    }

    // Extract result from OpenRouter response
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    if (!aiResponse) {
      return NextResponse.json({ error: 'No response from AI service' }, { status: 500 });
    }

    return NextResponse.json({ result: aiResponse });

  } catch (error) {
    console.error('Rewrite assistant error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
