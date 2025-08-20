import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { input, detailLevel, language, outputType } = await req.json();
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key missing' }, { status: 500 });
  }

  // DeepSeek API endpoint
  const endpoint = 'https://api.deepseek.com/v1/chat/completions';

  // Build prompt for study guide with explicit section formatting
  const prompt = `You are an expert AI tutor. Your task is to generate a complete, student-friendly, and organized study guide for the given topic or subject.\n\nRequirements:\n1. Topic Overview: Start with a short introduction of the topic (3-5 lines).\n2. Key Concepts: List all major sub-topics and explain them clearly.\n3. Definitions: Include important definitions with examples if necessary.\n4. Formulas / Equations (if applicable): List all important formulas and where to use them.\n5. Flowcharts / Diagrams (text-based): Describe important processes with numbered steps or diagrams in text.\n6. Bullet Summary: Provide a crisp bullet-point summary at the end.\n7. Exam Tips: Share 3-5 short exam tips for remembering the topic or scoring high.\n8. MCQs or Practice Questions: Add 5 sample multiple-choice questions (with correct answers).\n9. Language: Keep the language simple and easy for students to understand (class 10–12 level or beginner college level).\n\nInput Topic: ${input}\n\nFormat your response using headings, bullet points, and spacing for readability.`;

  const body = {
    model: "deepseek-chat",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('DeepSeek API error:', data.error || data);
      return NextResponse.json({ error: data.error || 'Failed to generate summary' }, { status: 500 });
    }
    // DeepSeek returns output in choices[0].message.content
    return NextResponse.json({ result: data.choices?.[0]?.message?.content || '' });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
