import { NextRequest, NextResponse } from 'next/server';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export async function POST(request: NextRequest) {
  try {
    const { notes, format } = await request.json();

    if (!notes || typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'Notes content is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    let prompt;
    
    if (format === 'markdown') {
      prompt = `
Convert the following Markdown notes into a structured mind map format:

${notes}

Analyze the content and create a hierarchical mind map structure with:
1. A central topic (main theme of the notes)
2. Main branches (major sections or topics)
3. Sub-branches (detailed points, examples, or subtopics)
4. Preserve the logical flow and relationships from the original notes

Return the response as a JSON object with this structure:
{
  "centralTopic": "Main topic name",
  "branches": [
    {
      "id": "unique_id",
      "text": "Branch title",
      "level": 1,
      "parent": "central",
      "color": "#3B82F6",
      "children": [
        {
          "id": "unique_id",
          "text": "Sub-branch title",
          "level": 2,
          "parent": "parent_id",
          "color": "#10B981",
          "children": []
        }
      ]
    }
  ]
}

Focus on extracting key concepts, maintaining hierarchical structure, and creating meaningful connections.
`;
    } else {
      // Handle bullet points or plain text
      prompt = `
Convert the following notes into a structured mind map format:

${notes}

Analyze the content and create a hierarchical mind map structure with:
1. A central topic (main theme of the notes)
2. Main branches (major sections or topics)
3. Sub-branches (detailed points, examples, or subtopics)
4. Extract key concepts and organize them logically

Return the response as a JSON object with this structure:
{
  "centralTopic": "Main topic name",
  "branches": [
    {
      "id": "unique_id",
      "text": "Branch title",
      "level": 1,
      "parent": "central",
      "color": "#3B82F6",
      "children": [
        {
          "id": "unique_id",
          "text": "Sub-branch title",
          "level": 2,
          "parent": "parent_id",
          "color": "#10B981",
          "children": []
        }
      ]
    }
  ]
}

Focus on identifying main topics, organizing information hierarchically, and creating a clear structure.
`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://campustoolshub.com',
        'X-Title': 'CampusToolsHub - Notes to Mind Map'
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

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const apiData = await response.json();
    const text = apiData.choices?.[0]?.message?.content || '';

    let aiData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      aiData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      
      // Fallback: Create a simple structure from the notes
      const lines = notes.split('\n').filter(line => line.trim().length > 0);
      const centralTopic = lines[0]?.replace(/[#*\-]/g, '').trim() || 'Notes Summary';
      
      aiData = {
        centralTopic,
        branches: lines.slice(1, 6).map((line, index) => ({
          id: `branch_${index + 1}`,
          text: line.replace(/[#*\-]/g, '').trim(),
          level: 1,
          parent: 'central',
          color: COLORS[index % COLORS.length],
          children: []
        }))
      };
    }

    // Convert AI structure to mind map format
    const mindMapStructure = convertToMindMapStructure(aiData);

    return NextResponse.json({
      success: true,
      result: mindMapStructure,
      originalNotes: notes
    });

  } catch (error) {
    console.error('Notes conversion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to convert notes to mind map',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function convertToMindMapStructure(aiData: any) {
  const nodes: { [key: string]: any } = {};
  const connections: { from: string; to: string }[] = [];

  // Create central node
  const centralId = '1';
  nodes[centralId] = {
    id: centralId,
    text: aiData.centralTopic || 'Central Topic',
    x: 400,
    y: 300,
    width: 140,
    height: 70,
    color: '#8B5CF6',
    textColor: '#FFFFFF',
    fontSize: 16,
    shape: 'circle',
    children: [],
    attachments: [],
    isCollapsed: false,
    notes: '',
    tags: []
  };

  let nodeIdCounter = 2;
  
  // Process branches
  if (aiData.branches && Array.isArray(aiData.branches)) {
    aiData.branches.forEach((branch: any, branchIndex: number) => {
      const branchId = nodeIdCounter.toString();
      nodeIdCounter++;

      // Calculate position for main branches (circular arrangement)
      const angle = (branchIndex * 360 / aiData.branches.length) * (Math.PI / 180);
      const radius = 200;
      const branchX = 400 + Math.cos(angle) * radius;
      const branchY = 300 + Math.sin(angle) * radius;

      // Create main branch node
      nodes[branchId] = {
        id: branchId,
        text: branch.text || `Branch ${branchIndex + 1}`,
        x: branchX,
        y: branchY,
        width: 120,
        height: 60,
        color: branch.color || COLORS[branchIndex % COLORS.length],
        textColor: '#FFFFFF',
        fontSize: 14,
        shape: 'rectangle',
        parent: centralId,
        children: [],
        attachments: [],
        isCollapsed: false,
        notes: '',
        tags: []
      };

      // Add to central node's children
      nodes[centralId].children.push(branchId);
      connections.push({ from: centralId, to: branchId });

      // Process sub-branches
      if (branch.children && Array.isArray(branch.children)) {
        branch.children.forEach((subBranch: any, subIndex: number) => {
          const subBranchId = nodeIdCounter.toString();
          nodeIdCounter++;

          // Calculate position for sub-branches
          const subAngle = angle + (subIndex - (branch.children.length - 1) / 2) * 0.8;
          const subRadius = 150;
          const subBranchX = branchX + Math.cos(subAngle) * subRadius;
          const subBranchY = branchY + Math.sin(subAngle) * subRadius;

          // Create sub-branch node
          nodes[subBranchId] = {
            id: subBranchId,
            text: subBranch.text || `Sub-branch ${subIndex + 1}`,
            x: subBranchX,
            y: subBranchY,
            width: 100,
            height: 50,
            color: subBranch.color || COLORS[(branchIndex + subIndex + 1) % COLORS.length],
            textColor: '#FFFFFF',
            fontSize: 12,
            shape: 'rectangle',
            parent: branchId,
            children: [],
            attachments: [],
            isCollapsed: false,
            notes: '',
            tags: []
          };

          // Add to parent branch's children
          nodes[branchId].children.push(subBranchId);
          connections.push({ from: branchId, to: subBranchId });
        });
      }
    });
  }

  return { nodes, connections };
}
