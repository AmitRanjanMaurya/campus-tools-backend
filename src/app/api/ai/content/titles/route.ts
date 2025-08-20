import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { keywords } = await request.json();

    if (!keywords || typeof keywords !== 'string') {
      return NextResponse.json({ error: 'Keywords are required' }, { status: 400 });
    }

    // AI-powered title generation (mock implementation)
    const titleTemplates = [
      `Complete Guide to ${keywords} for Students`,
      `Master ${keywords}: Essential Tips and Tricks`,
      `${keywords} Made Easy: Step-by-Step Tutorial`,
      `Top 10 ${keywords} Strategies That Actually Work`,
      `Ultimate ${keywords} Handbook for Academic Success`,
      `${keywords} Secrets: What Every Student Should Know`,
      `From Beginner to Expert: Your ${keywords} Journey`,
      `${keywords} Mastery: Proven Techniques for Success`,
      `Essential ${keywords} Skills Every Student Needs`,
      `${keywords} Excellence: Advanced Tips and Methods`,
      `How to Excel at ${keywords}: Student's Playbook`,
      `${keywords} Fundamentals: Building Strong Foundations`,
      `Advanced ${keywords} Techniques for High Achievers`,
      `${keywords} Success Stories: Learn from the Best`,
      `Breaking Down ${keywords}: Simple Yet Effective Methods`
    ];

    // Randomize and return top 5
    const shuffled = titleTemplates.sort(() => Math.random() - 0.5);
    const titles = shuffled.slice(0, 5);

    return NextResponse.json({ titles });

  } catch (error) {
    console.error('Title Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate titles' }, { status: 500 });
  }
}
