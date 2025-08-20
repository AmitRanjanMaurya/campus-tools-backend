import { NextRequest, NextResponse } from 'next/server';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  textColor: string;
  fontSize: number;
  shape: 'circle' | 'rectangle' | 'ellipse' | 'triangle' | 'diamond';
  icon?: string;
  parent?: string;
  children: string[];
  attachments: any[];
  isCollapsed: boolean;
  notes: string;
  tags: string[];
}

interface MindMapStructure {
  nodes: { [key: string]: MindMapNode };
  connections: { from: string; to: string }[];
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required and must be a string' },
        { status: 400 }
      );
    }

    // Try OpenRouter API first, but continue with fallback if not available
    let useOpenRouter = false;
    if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your-openrouter-api-key-here') {
      useOpenRouter = true;
    }

    const prompt = `Create a comprehensive mind map structure for the topic: "${topic}"

Generate a detailed mind map with:
1. A central topic node
2. 4-8 main branches (level 1 subtopics)
3. 2-4 sub-branches for each main branch (level 2 subtopics)
4. Include relevant details, examples, or concepts for each node

Return the response as a JSON object with this exact structure:
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

Make sure all IDs are unique and the content is educational and relevant to the topic.
Focus on creating a logical hierarchy that helps with learning and understanding.
Respond only with the JSON object, no additional text.`;

    let aiData;
    
    if (useOpenRouter) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://campustoolshub.com',
            'X-Title': 'CampusToolsHub - Mind Map Generator'
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

        if (response.ok) {
          const apiData = await response.json();
          const text = apiData.choices?.[0]?.message?.content || '';

          try {
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              aiData = JSON.parse(jsonMatch[0]);
            }
          } catch (parseError) {
            console.log('AI response parsing failed, using fallback');
          }
        }
      } catch (error) {
        console.log('OpenRouter API failed, using fallback:', error);
      }
    }
    
    // If OpenRouter failed or not configured, use enhanced fallback
    if (!aiData) {
      aiData = generateFallbackMindMap(topic);
    }

    // Convert AI structure to mind map format
    const mindMapStructure = convertToMindMapStructure(aiData);

    return NextResponse.json({
      success: true,
      result: mindMapStructure
    });

  } catch (error) {
    console.error('Mind map generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate mind map',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function convertToMindMapStructure(aiData: any): MindMapStructure {
  const nodes: { [key: string]: MindMapNode } = {};
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

function generateFallbackMindMap(topic: string): any {
  const topicWords = topic.toLowerCase().split(' ');
  const topicLower = topic.toLowerCase();
  
  // Check for specific AI/ML topics first
  if (topicLower.includes('deep learning') || topicLower.includes('deep neural') || topicLower.includes('neural network')) {
    return generateDeepLearningMindMap(topic);
  } else if (topicLower.includes('machine learning') || topicLower.includes('ml') || topicWords.some(word => ['supervised', 'unsupervised', 'reinforcement'].includes(word))) {
    return generateMachineLearningMindMap(topic);
  } else if (topicWords.some(word => ['artificial', 'intelligence', 'ai'].includes(word))) {
    return generateAIMindMap(topic);
  } else if (topicWords.some(word => ['data', 'science', 'analytics', 'visualization'].includes(word))) {
    return generateDataScienceMindMap(topic);
  } else if (topicWords.some(word => ['photosynthesis'].includes(word))) {
    return generatePhotosynthesisMindMap(topic);
  } else if (topicWords.some(word => ['cell', 'biology', 'cellular'].includes(word))) {
    return generateCellBiologyMindMap(topic);
  } else if (topicWords.some(word => ['algebra', 'equation', 'polynomial'].includes(word))) {
    return generateAlgebraMindMap(topic);
  } else if (topicWords.some(word => ['calculus', 'derivative', 'integral'].includes(word))) {
    return generateCalculusMindMap(topic);
  } else if (topicWords.some(word => ['physics', 'motion', 'force', 'energy'].includes(word))) {
    return generatePhysicsMindMap(topic);
  } else if (topicWords.some(word => ['chemistry', 'atom', 'molecule', 'reaction'].includes(word))) {
    return generateChemistryMindMap(topic);
  } else if (topicWords.some(word => ['history', 'war', 'revolution', 'empire'].includes(word))) {
    return generateHistoryMindMap(topic);
  } else if (topicWords.some(word => ['literature', 'poetry', 'novel', 'shakespeare'].includes(word))) {
    return generateLiteratureMindMap(topic);
  } else if (topicWords.some(word => ['programming', 'code', 'algorithm', 'software'].includes(word))) {
    return generateProgrammingMindMap(topic);
  } else if (topicWords.some(word => ['economics', 'market', 'finance', 'economy'].includes(word))) {
    return generateEconomicsMindMap(topic);
  } else if (topicWords.some(word => ['psychology', 'behavior', 'mind', 'cognitive'].includes(word))) {
    return generatePsychologyMindMap(topic);
  } else if (topicWords.some(word => ['geography', 'climate', 'earth', 'continent'].includes(word))) {
    return generateGeographyMindMap(topic);
  } else {
    return generateGeneralMindMap(topic);
  }
}

function generateDeepLearningMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Neural Networks',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '2a', text: 'Perceptrons', level: 2, parent: '2', color: '#7C3AED', children: [] },
          { id: '2b', text: 'Multi-layer Networks', level: 2, parent: '2', color: '#7C3AED', children: [] },
          { id: '2c', text: 'Activation Functions', level: 2, parent: '2', color: '#7C3AED', children: [] },
          { id: '2d', text: 'Backpropagation', level: 2, parent: '2', color: '#7C3AED', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Deep Architectures',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '3a', text: 'Convolutional Neural Networks (CNN)', level: 2, parent: '3', color: '#2563EB', children: [] },
          { id: '3b', text: 'Recurrent Neural Networks (RNN)', level: 2, parent: '3', color: '#2563EB', children: [] },
          { id: '3c', text: 'Long Short-Term Memory (LSTM)', level: 2, parent: '3', color: '#2563EB', children: [] },
          { id: '3d', text: 'Transformers', level: 2, parent: '3', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Training Techniques',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '4a', text: 'Gradient Descent', level: 2, parent: '4', color: '#059669', children: [] },
          { id: '4b', text: 'Regularization', level: 2, parent: '4', color: '#059669', children: [] },
          { id: '4c', text: 'Batch Normalization', level: 2, parent: '4', color: '#059669', children: [] },
          { id: '4d', text: 'Transfer Learning', level: 2, parent: '4', color: '#059669', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Applications',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '5a', text: 'Computer Vision', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5b', text: 'Natural Language Processing', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5c', text: 'Speech Recognition', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5d', text: 'Autonomous Systems', level: 2, parent: '5', color: '#D97706', children: [] }
        ]
      },
      {
        id: '6',
        text: 'Challenges',
        level: 1,
        parent: 'central',
        color: '#EF4444',
        children: [
          { id: '6a', text: 'Vanishing Gradients', level: 2, parent: '6', color: '#DC2626', children: [] },
          { id: '6b', text: 'Overfitting', level: 2, parent: '6', color: '#DC2626', children: [] },
          { id: '6c', text: 'Computational Resources', level: 2, parent: '6', color: '#DC2626', children: [] },
          { id: '6d', text: 'Interpretability', level: 2, parent: '6', color: '#DC2626', children: [] }
        ]
      }
    ]
  };
}

function generateMachineLearningMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Supervised Learning',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '2a', text: 'Linear Regression', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2b', text: 'Logistic Regression', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2c', text: 'Decision Trees', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2d', text: 'Support Vector Machines', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2e', text: 'Random Forest', level: 2, parent: '2', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Unsupervised Learning',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '3a', text: 'K-Means Clustering', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3b', text: 'Hierarchical Clustering', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3c', text: 'Principal Component Analysis', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3d', text: 'Association Rules', level: 2, parent: '3', color: '#059669', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Reinforcement Learning',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '4a', text: 'Q-Learning', level: 2, parent: '4', color: '#7C3AED', children: [] },
          { id: '4b', text: 'Policy Gradient', level: 2, parent: '4', color: '#7C3AED', children: [] },
          { id: '4c', text: 'Actor-Critic', level: 2, parent: '4', color: '#7C3AED', children: [] },
          { id: '4d', text: 'Multi-Armed Bandit', level: 2, parent: '4', color: '#7C3AED', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Model Evaluation',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '5a', text: 'Cross-Validation', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5b', text: 'Confusion Matrix', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5c', text: 'ROC Curves', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5d', text: 'Feature Selection', level: 2, parent: '5', color: '#D97706', children: [] }
        ]
      },
      {
        id: '6',
        text: 'Tools & Frameworks',
        level: 1,
        parent: 'central',
        color: '#EF4444',
        children: [
          { id: '6a', text: 'Scikit-learn', level: 2, parent: '6', color: '#DC2626', children: [] },
          { id: '6b', text: 'TensorFlow', level: 2, parent: '6', color: '#DC2626', children: [] },
          { id: '6c', text: 'PyTorch', level: 2, parent: '6', color: '#DC2626', children: [] },
          { id: '6d', text: 'Pandas', level: 2, parent: '6', color: '#DC2626', children: [] }
        ]
      }
    ]
  };
}

function generateAIMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Core Concepts',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '2a', text: 'Intelligence', level: 2, parent: '2', color: '#7C3AED', children: [] },
          { id: '2b', text: 'Reasoning', level: 2, parent: '2', color: '#7C3AED', children: [] },
          { id: '2c', text: 'Problem Solving', level: 2, parent: '2', color: '#7C3AED', children: [] },
          { id: '2d', text: 'Learning', level: 2, parent: '2', color: '#7C3AED', children: [] }
        ]
      },
      {
        id: '3',
        text: 'AI Approaches',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '3a', text: 'Symbolic AI', level: 2, parent: '3', color: '#2563EB', children: [] },
          { id: '3b', text: 'Machine Learning', level: 2, parent: '3', color: '#2563EB', children: [] },
          { id: '3c', text: 'Expert Systems', level: 2, parent: '3', color: '#2563EB', children: [] },
          { id: '3d', text: 'Neural Networks', level: 2, parent: '3', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '4',
        text: 'AI Applications',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '4a', text: 'Robotics', level: 2, parent: '4', color: '#059669', children: [] },
          { id: '4b', text: 'Computer Vision', level: 2, parent: '4', color: '#059669', children: [] },
          { id: '4c', text: 'Natural Language Processing', level: 2, parent: '4', color: '#059669', children: [] },
          { id: '4d', text: 'Game Playing', level: 2, parent: '4', color: '#059669', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Ethical Considerations',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '5a', text: 'Bias & Fairness', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5b', text: 'Privacy', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5c', text: 'Job Displacement', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5d', text: 'Transparency', level: 2, parent: '5', color: '#D97706', children: [] }
        ]
      }
    ]
  };
}

function generateDataScienceMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Data Collection',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '2a', text: 'Web Scraping', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2b', text: 'APIs', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2c', text: 'Databases', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2d', text: 'Surveys', level: 2, parent: '2', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Data Processing',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '3a', text: 'Data Cleaning', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3b', text: 'Data Transformation', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3c', text: 'Feature Engineering', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3d', text: 'Data Integration', level: 2, parent: '3', color: '#059669', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Analysis & Modeling',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '4a', text: 'Statistical Analysis', level: 2, parent: '4', color: '#7C3AED', children: [] },
          { id: '4b', text: 'Machine Learning', level: 2, parent: '4', color: '#7C3AED', children: [] },
          { id: '4c', text: 'Predictive Modeling', level: 2, parent: '4', color: '#7C3AED', children: [] },
          { id: '4d', text: 'Hypothesis Testing', level: 2, parent: '4', color: '#7C3AED', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Visualization',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '5a', text: 'Charts & Graphs', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5b', text: 'Dashboards', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5c', text: 'Interactive Plots', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5d', text: 'Storytelling', level: 2, parent: '5', color: '#D97706', children: [] }
        ]
      },
      {
        id: '6',
        text: 'Tools & Technologies',
        level: 1,
        parent: 'central',
        color: '#EF4444',
        children: [
          { id: '6a', text: 'Python/R', level: 2, parent: '6', color: '#DC2626', children: [] },
          { id: '6b', text: 'SQL', level: 2, parent: '6', color: '#DC2626', children: [] },
          { id: '6c', text: 'Tableau/Power BI', level: 2, parent: '6', color: '#DC2626', children: [] },
          { id: '6d', text: 'Jupyter Notebooks', level: 2, parent: '6', color: '#DC2626', children: [] }
        ]
      }
    ]
  };
}

function generatePhotosynthesisMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Light Reactions',
        level: 1,
        parent: 'central',
        color: '#22C55E',
        children: [
          { id: '2a', text: 'Chlorophyll', level: 2, parent: '2', color: '#16A34A', children: [] },
          { id: '2b', text: 'Photosystem I & II', level: 2, parent: '2', color: '#16A34A', children: [] },
          { id: '2c', text: 'ATP & NADPH', level: 2, parent: '2', color: '#16A34A', children: [] },
          { id: '2d', text: 'Oxygen Release', level: 2, parent: '2', color: '#16A34A', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Calvin Cycle',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '3a', text: 'Carbon Fixation', level: 2, parent: '3', color: '#2563EB', children: [] },
          { id: '3b', text: 'Reduction', level: 2, parent: '3', color: '#2563EB', children: [] },
          { id: '3c', text: 'Regeneration', level: 2, parent: '3', color: '#2563EB', children: [] },
          { id: '3d', text: 'Glucose Formation', level: 2, parent: '3', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Requirements',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '4a', text: 'Sunlight', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4b', text: 'Carbon Dioxide', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4c', text: 'Water', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4d', text: 'Chloroplasts', level: 2, parent: '4', color: '#D97706', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Products',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '5a', text: 'Glucose (C6H12O6)', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5b', text: 'Oxygen (O2)', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5c', text: 'Energy Storage', level: 2, parent: '5', color: '#7C3AED', children: [] }
        ]
      },
      {
        id: '6',
        text: 'Factors Affecting',
        level: 1,
        parent: 'central',
        color: '#EF4444',
        children: [
          { id: '6a', text: 'Light Intensity', level: 2, parent: '6', color: '#DC2626', children: [] },
          { id: '6b', text: 'Temperature', level: 2, parent: '6', color: '#DC2626', children: [] },
          { id: '6c', text: 'CO2 Concentration', level: 2, parent: '6', color: '#DC2626', children: [] }
        ]
      }
    ]
  };
}

function generateCellBiologyMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Cell Structure',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '2a', text: 'Cell Membrane', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2b', text: 'Nucleus', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2c', text: 'Cytoplasm', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2d', text: 'Organelles', level: 2, parent: '2', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Cell Types',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '3a', text: 'Prokaryotic', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3b', text: 'Eukaryotic', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3c', text: 'Plant Cells', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3d', text: 'Animal Cells', level: 2, parent: '3', color: '#059669', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Cell Functions',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '4a', text: 'Metabolism', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4b', text: 'Reproduction', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4c', text: 'Growth', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4d', text: 'Response', level: 2, parent: '4', color: '#D97706', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Cell Division',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '5a', text: 'Mitosis', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5b', text: 'Meiosis', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5c', text: 'Cell Cycle', level: 2, parent: '5', color: '#7C3AED', children: [] }
        ]
      }
    ]
  };
}

function generateAlgebraMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Variables & Constants',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '2a', text: 'Variables (x, y, z)', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2b', text: 'Constants', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2c', text: 'Coefficients', level: 2, parent: '2', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Operations',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '3a', text: 'Addition/Subtraction', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3b', text: 'Multiplication/Division', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3c', text: 'Exponents', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3d', text: 'Factoring', level: 2, parent: '3', color: '#059669', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Equations',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '4a', text: 'Linear Equations', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4b', text: 'Quadratic Equations', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4c', text: 'System of Equations', level: 2, parent: '4', color: '#D97706', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Functions',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '5a', text: 'Domain & Range', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5b', text: 'Graphing', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5c', text: 'Transformations', level: 2, parent: '5', color: '#7C3AED', children: [] }
        ]
      }
    ]
  };
}

function generateCalculusMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Limits',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '2a', text: 'Definition', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2b', text: 'Properties', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2c', text: 'Continuity', level: 2, parent: '2', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Derivatives',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '3a', text: 'Power Rule', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3b', text: 'Product Rule', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3c', text: 'Chain Rule', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3d', text: 'Applications', level: 2, parent: '3', color: '#059669', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Integrals',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '4a', text: 'Indefinite Integrals', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4b', text: 'Definite Integrals', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4c', text: 'Area Under Curve', level: 2, parent: '4', color: '#D97706', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Applications',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '5a', text: 'Optimization', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5b', text: 'Related Rates', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5c', text: 'Volume/Area', level: 2, parent: '5', color: '#7C3AED', children: [] }
        ]
      }
    ]
  };
}

function generatePhysicsMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Mechanics',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '2a', text: 'Motion', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2b', text: 'Forces', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2c', text: 'Energy', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2d', text: 'Momentum', level: 2, parent: '2', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Thermodynamics',
        level: 1,
        parent: 'central',
        color: '#EF4444',
        children: [
          { id: '3a', text: 'Temperature', level: 2, parent: '3', color: '#DC2626', children: [] },
          { id: '3b', text: 'Heat Transfer', level: 2, parent: '3', color: '#DC2626', children: [] },
          { id: '3c', text: 'Laws of Thermodynamics', level: 2, parent: '3', color: '#DC2626', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Waves & Optics',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '4a', text: 'Wave Properties', level: 2, parent: '4', color: '#059669', children: [] },
          { id: '4b', text: 'Sound Waves', level: 2, parent: '4', color: '#059669', children: [] },
          { id: '4c', text: 'Light Waves', level: 2, parent: '4', color: '#059669', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Electricity & Magnetism',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '5a', text: 'Electric Fields', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5b', text: 'Magnetic Fields', level: 2, parent: '5', color: '#D97706', children: [] },
          { id: '5c', text: 'Circuits', level: 2, parent: '5', color: '#D97706', children: [] }
        ]
      }
    ]
  };
}

function generateChemistryMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Atomic Structure',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '2a', text: 'Protons', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2b', text: 'Neutrons', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2c', text: 'Electrons', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2d', text: 'Electron Configuration', level: 2, parent: '2', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Chemical Bonds',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '3a', text: 'Ionic Bonds', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3b', text: 'Covalent Bonds', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3c', text: 'Metallic Bonds', level: 2, parent: '3', color: '#059669', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Chemical Reactions',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '4a', text: 'Synthesis', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4b', text: 'Decomposition', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4c', text: 'Combustion', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4d', text: 'Redox Reactions', level: 2, parent: '4', color: '#D97706', children: [] }
        ]
      },
      {
        id: '5',
        text: 'States of Matter',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '5a', text: 'Solid', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5b', text: 'Liquid', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5c', text: 'Gas', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5d', text: 'Phase Changes', level: 2, parent: '5', color: '#7C3AED', children: [] }
        ]
      }
    ]
  };
}

function generateHistoryMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Timeline',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '2a', text: 'Key Dates', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2b', text: 'Periods', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2c', text: 'Chronology', level: 2, parent: '2', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Key Figures',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '3a', text: 'Leaders', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3b', text: 'Innovators', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3c', text: 'Influential People', level: 2, parent: '3', color: '#059669', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Causes',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '4a', text: 'Political Factors', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4b', text: 'Economic Factors', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4c', text: 'Social Factors', level: 2, parent: '4', color: '#D97706', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Consequences',
        level: 1,
        parent: 'central',
        color: '#EF4444',
        children: [
          { id: '5a', text: 'Short-term Effects', level: 2, parent: '5', color: '#DC2626', children: [] },
          { id: '5b', text: 'Long-term Impact', level: 2, parent: '5', color: '#DC2626', children: [] },
          { id: '5c', text: 'Historical Significance', level: 2, parent: '5', color: '#DC2626', children: [] }
        ]
      }
    ]
  };
}

function generateLiteratureMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Themes',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '2a', text: 'Main Theme', level: 2, parent: '2', color: '#7C3AED', children: [] },
          { id: '2b', text: 'Sub-themes', level: 2, parent: '2', color: '#7C3AED', children: [] },
          { id: '2c', text: 'Symbolism', level: 2, parent: '2', color: '#7C3AED', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Characters',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '3a', text: 'Protagonist', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3b', text: 'Antagonist', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3c', text: 'Supporting Characters', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3d', text: 'Character Development', level: 2, parent: '3', color: '#059669', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Plot Structure',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '4a', text: 'Exposition', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4b', text: 'Rising Action', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4c', text: 'Climax', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4d', text: 'Resolution', level: 2, parent: '4', color: '#D97706', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Literary Devices',
        level: 1,
        parent: 'central',
        color: '#EF4444',
        children: [
          { id: '5a', text: 'Metaphor', level: 2, parent: '5', color: '#DC2626', children: [] },
          { id: '5b', text: 'Irony', level: 2, parent: '5', color: '#DC2626', children: [] },
          { id: '5c', text: 'Foreshadowing', level: 2, parent: '5', color: '#DC2626', children: [] }
        ]
      }
    ]
  };
}

function generateProgrammingMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Fundamentals',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '2a', text: 'Variables', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2b', text: 'Data Types', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2c', text: 'Operators', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2d', text: 'Syntax', level: 2, parent: '2', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Control Structures',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '3a', text: 'If/Else', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3b', text: 'Loops', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3c', text: 'Switch/Case', level: 2, parent: '3', color: '#059669', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Data Structures',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '4a', text: 'Arrays', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4b', text: 'Lists', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4c', text: 'Objects', level: 2, parent: '4', color: '#D97706', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Functions',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '5a', text: 'Parameters', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5b', text: 'Return Values', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5c', text: 'Scope', level: 2, parent: '5', color: '#7C3AED', children: [] }
        ]
      }
    ]
  };
}

function generateEconomicsMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Supply & Demand',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '2a', text: 'Supply Curve', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2b', text: 'Demand Curve', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2c', text: 'Market Equilibrium', level: 2, parent: '2', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Market Types',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '3a', text: 'Perfect Competition', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3b', text: 'Monopoly', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3c', text: 'Oligopoly', level: 2, parent: '3', color: '#059669', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Economic Indicators',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '4a', text: 'GDP', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4b', text: 'Inflation', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4c', text: 'Unemployment', level: 2, parent: '4', color: '#D97706', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Economic Systems',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '5a', text: 'Capitalism', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5b', text: 'Socialism', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5c', text: 'Mixed Economy', level: 2, parent: '5', color: '#7C3AED', children: [] }
        ]
      }
    ]
  };
}

function generatePsychologyMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Cognitive Processes',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '2a', text: 'Memory', level: 2, parent: '2', color: '#7C3AED', children: [] },
          { id: '2b', text: 'Attention', level: 2, parent: '2', color: '#7C3AED', children: [] },
          { id: '2c', text: 'Perception', level: 2, parent: '2', color: '#7C3AED', children: [] },
          { id: '2d', text: 'Learning', level: 2, parent: '2', color: '#7C3AED', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Behavioral Psychology',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '3a', text: 'Conditioning', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3b', text: 'Reinforcement', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3c', text: 'Social Learning', level: 2, parent: '3', color: '#059669', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Developmental Psychology',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '4a', text: 'Child Development', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4b', text: 'Adolescence', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4c', text: 'Adult Development', level: 2, parent: '4', color: '#D97706', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Mental Health',
        level: 1,
        parent: 'central',
        color: '#EF4444',
        children: [
          { id: '5a', text: 'Disorders', level: 2, parent: '5', color: '#DC2626', children: [] },
          { id: '5b', text: 'Therapy', level: 2, parent: '5', color: '#DC2626', children: [] },
          { id: '5c', text: 'Prevention', level: 2, parent: '5', color: '#DC2626', children: [] }
        ]
      }
    ]
  };
}

function generateGeographyMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Physical Geography',
        level: 1,
        parent: 'central',
        color: '#22C55E',
        children: [
          { id: '2a', text: 'Landforms', level: 2, parent: '2', color: '#16A34A', children: [] },
          { id: '2b', text: 'Climate', level: 2, parent: '2', color: '#16A34A', children: [] },
          { id: '2c', text: 'Weather Patterns', level: 2, parent: '2', color: '#16A34A', children: [] },
          { id: '2d', text: 'Natural Resources', level: 2, parent: '2', color: '#16A34A', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Human Geography',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '3a', text: 'Population', level: 2, parent: '3', color: '#2563EB', children: [] },
          { id: '3b', text: 'Culture', level: 2, parent: '3', color: '#2563EB', children: [] },
          { id: '3c', text: 'Economic Activity', level: 2, parent: '3', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Regions',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '4a', text: 'Continents', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4b', text: 'Countries', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4c', text: 'Cities', level: 2, parent: '4', color: '#D97706', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Environmental Issues',
        level: 1,
        parent: 'central',
        color: '#EF4444',
        children: [
          { id: '5a', text: 'Climate Change', level: 2, parent: '5', color: '#DC2626', children: [] },
          { id: '5b', text: 'Pollution', level: 2, parent: '5', color: '#DC2626', children: [] },
          { id: '5c', text: 'Conservation', level: 2, parent: '5', color: '#DC2626', children: [] }
        ]
      }
    ]
  };
}

function generateGeneralMindMap(topic: string) {
  return {
    centralTopic: topic,
    branches: [
      {
        id: '2',
        text: 'Definition & Overview',
        level: 1,
        parent: 'central',
        color: '#3B82F6',
        children: [
          { id: '2a', text: 'Basic Definition', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2b', text: 'Key Characteristics', level: 2, parent: '2', color: '#2563EB', children: [] },
          { id: '2c', text: 'Context', level: 2, parent: '2', color: '#2563EB', children: [] }
        ]
      },
      {
        id: '3',
        text: 'Components & Elements',
        level: 1,
        parent: 'central',
        color: '#10B981',
        children: [
          { id: '3a', text: 'Main Components', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3b', text: 'Sub-elements', level: 2, parent: '3', color: '#059669', children: [] },
          { id: '3c', text: 'Relationships', level: 2, parent: '3', color: '#059669', children: [] }
        ]
      },
      {
        id: '4',
        text: 'Applications & Uses',
        level: 1,
        parent: 'central',
        color: '#F59E0B',
        children: [
          { id: '4a', text: 'Practical Applications', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4b', text: 'Real-world Examples', level: 2, parent: '4', color: '#D97706', children: [] },
          { id: '4c', text: 'Case Studies', level: 2, parent: '4', color: '#D97706', children: [] }
        ]
      },
      {
        id: '5',
        text: 'Importance & Impact',
        level: 1,
        parent: 'central',
        color: '#8B5CF6',
        children: [
          { id: '5a', text: 'Significance', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5b', text: 'Benefits', level: 2, parent: '5', color: '#7C3AED', children: [] },
          { id: '5c', text: 'Future Implications', level: 2, parent: '5', color: '#7C3AED', children: [] }
        ]
      },
      {
        id: '6',
        text: 'Challenges & Considerations',
        level: 1,
        parent: 'central',
        color: '#EF4444',
        children: [
          { id: '6a', text: 'Limitations', level: 2, parent: '6', color: '#DC2626', children: [] },
          { id: '6b', text: 'Potential Issues', level: 2, parent: '6', color: '#DC2626', children: [] },
          { id: '6c', text: 'Solutions', level: 2, parent: '6', color: '#DC2626', children: [] }
        ]
      }
    ]
  };
}
