import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface AIRequest {
  question: string
  subject: string
  reasoningStyle: 'basic' | 'exam' | 'expert'
  imageData?: string
}

interface AIResponse {
  finalAnswer: string
  steps: string[]
  diagram?: string
  conceptsUsed: string[]
  suggestedFlashcard?: {
    front: string
    back: string
  }
  visualExplanation?: string
  codeExample?: string
  relatedTopics: string[]
  difficulty: 'basic' | 'intermediate' | 'advanced'
}

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBqjjhJfgUJPM8w9xR8D3KQWvCPQXwmhWA'
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json()
    const { question, subject, reasoningStyle, imageData } = body

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Get AI response using Gemini
    const response = await getGeminiResponse(question, subject, reasoningStyle, imageData)
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error processing AI request:', error)
    // Fallback to mock response if Gemini fails
    const fallbackResponse = generateFallbackResponse('general question', 'general', 'basic')
    return NextResponse.json(fallbackResponse)
  }
}

async function getGeminiResponse(question: string, subject: string, reasoningStyle: string, imageData?: string): Promise<AIResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    // Create detailed prompt based on requirements
    const prompt = createEducationalPrompt(question, subject, reasoningStyle)

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the AI response into structured format
    return parseGeminiResponse(text, subject)

  } catch (error) {
    console.error('Gemini API error:', error)
    // Return fallback response
    return generateFallbackResponse(question, subject, reasoningStyle)
  }
}

function createEducationalPrompt(question: string, subject: string, reasoningStyle: string): string {
  const styleInstructions = {
    basic: "Provide simple, clear explanations suitable for beginners",
    exam: "Give detailed step-by-step solutions as if preparing for an exam",
    expert: "Provide in-depth analysis with advanced concepts and multiple approaches"
  }

  return `You are an expert academic tutor for ${subject}. A student has asked: "${question}"

Please provide a comprehensive solution with the following structure:

STYLE: ${styleInstructions[reasoningStyle as keyof typeof styleInstructions]}

Please format your response exactly as follows:

FINAL_ANSWER: [Write the direct answer here]

STEPS:
1. [First step with clear explanation]
2. [Second step with clear explanation]
3. [Continue with numbered steps]

CONCEPTS_USED: [List 3-5 key concepts, separated by commas]

VISUAL_EXPLANATION: [Explain how to visualize this concept or draw a simple diagram]

${subject === 'computer-science' ? 'CODE_EXAMPLE: [If applicable, provide a simple code example]' : ''}

${subject === 'mathematics' || subject === 'physics' ? 'DIAGRAM: [If applicable, provide ASCII art or simple text diagram]' : ''}

FLASHCARD_FRONT: [A good question for revision]
FLASHCARD_BACK: [Concise answer for the flashcard]

RELATED_TOPICS: [List 3-5 related topics to explore, separated by commas]

DIFFICULTY: [basic/intermediate/advanced]

Please ensure your explanation is accurate, educational, and helpful for a student learning this topic.`
}

function parseGeminiResponse(text: string, subject: string): AIResponse {
  const response: AIResponse = {
    finalAnswer: '',
    steps: [],
    conceptsUsed: [],
    relatedTopics: [],
    difficulty: 'basic'
  }

  try {
    // Extract sections using regex
    const finalAnswerMatch = text.match(/FINAL_ANSWER:\s*(.+?)(?:\n|$)/i)
    if (finalAnswerMatch) {
      response.finalAnswer = finalAnswerMatch[1].trim()
    }

    // Extract steps
    const stepsMatch = text.match(/STEPS:\s*([\s\S]*?)(?=CONCEPTS_USED:|$)/i)
    if (stepsMatch) {
      const stepsText = stepsMatch[1].trim()
      response.steps = stepsText.split('\n')
        .filter(step => step.trim())
        .map(step => step.replace(/^\d+\.\s*/, '').trim())
        .filter(step => step.length > 0)
    }

    // Extract concepts
    const conceptsMatch = text.match(/CONCEPTS_USED:\s*(.+?)(?:\n|$)/i)
    if (conceptsMatch) {
      response.conceptsUsed = conceptsMatch[1].split(',').map(c => c.trim()).filter(c => c)
    }

    // Extract visual explanation
    const visualMatch = text.match(/VISUAL_EXPLANATION:\s*(.+?)(?:\n|$)/i)
    if (visualMatch) {
      response.visualExplanation = visualMatch[1].trim()
    }

    // Extract code example for CS
    const codeMatch = text.match(/CODE_EXAMPLE:\s*([\s\S]*?)(?=FLASHCARD_FRONT:|RELATED_TOPICS:|$)/i)
    if (codeMatch) {
      response.codeExample = codeMatch[1].trim()
    }

    // Extract diagram
    const diagramMatch = text.match(/DIAGRAM:\s*([\s\S]*?)(?=FLASHCARD_FRONT:|RELATED_TOPICS:|$)/i)
    if (diagramMatch) {
      response.diagram = diagramMatch[1].trim()
    }

    // Extract flashcard
    const flashcardFrontMatch = text.match(/FLASHCARD_FRONT:\s*(.+?)(?:\n|$)/i)
    const flashcardBackMatch = text.match(/FLASHCARD_BACK:\s*(.+?)(?:\n|$)/i)
    if (flashcardFrontMatch && flashcardBackMatch) {
      response.suggestedFlashcard = {
        front: flashcardFrontMatch[1].trim(),
        back: flashcardBackMatch[1].trim()
      }
    }

    // Extract related topics
    const relatedMatch = text.match(/RELATED_TOPICS:\s*(.+?)(?:\n|$)/i)
    if (relatedMatch) {
      response.relatedTopics = relatedMatch[1].split(',').map(t => t.trim()).filter(t => t)
    }

    // Extract difficulty
    const difficultyMatch = text.match(/DIFFICULTY:\s*(.+?)(?:\n|$)/i)
    if (difficultyMatch) {
      const diff = difficultyMatch[1].trim().toLowerCase()
      if (['basic', 'intermediate', 'advanced'].includes(diff)) {
        response.difficulty = diff as 'basic' | 'intermediate' | 'advanced'
      }
    }

    // Ensure we have at least some content
    if (!response.finalAnswer) {
      response.finalAnswer = "I've analyzed your question and provided a detailed explanation below."
    }
    if (response.steps.length === 0) {
      response.steps = ["Let me break down this problem step by step for you."]
    }

  } catch (error) {
    console.error('Error parsing Gemini response:', error)
  }

  return response
}

function generateFallbackResponse(question: string, subject: string, reasoningStyle: string): AIResponse {
  // Enhanced fallback responses based on keywords and subject
  const questionLower = question.toLowerCase()

  if (subject === 'mathematics' && (questionLower.includes('solve') || questionLower.includes('equation'))) {
    return {
      finalAnswer: "To solve this equation, we need to isolate the variable and find its value.",
      steps: [
        "Identify the type of equation (linear, quadratic, etc.)",
        "Move all terms with variables to one side",
        "Move all constant terms to the other side", 
        "Simplify and solve for the variable",
        "Check the solution by substituting back"
      ],
      conceptsUsed: ["Algebraic Manipulation", "Equation Solving", "Variable Isolation"],
      suggestedFlashcard: {
        front: "What are the basic steps to solve an equation?",
        back: "1. Identify equation type 2. Isolate variable terms 3. Solve 4. Check solution"
      },
      visualExplanation: "Think of an equation as a balance scale - whatever you do to one side, you must do to the other.",
      relatedTopics: ["Linear Equations", "Quadratic Formula", "Factoring", "Graphing"],
      difficulty: 'basic'
    }
  }

  if (subject === 'physics' && (questionLower.includes('force') || questionLower.includes('motion'))) {
    return {
      finalAnswer: "This physics problem involves analyzing forces and motion using Newton's laws.",
      steps: [
        "Draw a free body diagram showing all forces",
        "Identify known and unknown quantities",
        "Choose appropriate physics equations",
        "Apply Newton's laws of motion",
        "Solve algebraically and check units"
      ],
      conceptsUsed: ["Newton's Laws", "Force Analysis", "Kinematics"],
      suggestedFlashcard: {
        front: "What is Newton's Second Law?",
        back: "F = ma (Force equals mass times acceleration)"
      },
      visualExplanation: "Forces are vectors - they have both magnitude and direction.",
      relatedTopics: ["Momentum", "Energy", "Circular Motion", "Friction"],
      difficulty: 'intermediate'
    }
  }

  if (subject === 'computer-science' && questionLower.includes('algorithm')) {
    return {
      finalAnswer: "Algorithm analysis involves understanding time complexity, space complexity, and efficiency.",
      steps: [
        "Understand what the algorithm is supposed to do",
        "Trace through the algorithm with sample input",
        "Count the number of operations performed",
        "Express time complexity using Big O notation",
        "Consider space complexity and optimization"
      ],
      conceptsUsed: ["Algorithms", "Time Complexity", "Big O Notation", "Efficiency"],
      codeExample: `# Example: Linear Search
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

# Time Complexity: O(n)
# Space Complexity: O(1)`,
      suggestedFlashcard: {
        front: "What is Big O notation?",
        back: "Mathematical notation to describe the time complexity of algorithms"
      },
      visualExplanation: "Think of complexity as how the runtime grows as input size increases.",
      relatedTopics: ["Data Structures", "Sorting", "Searching", "Optimization"],
      difficulty: 'intermediate'
    }
  }

  // General fallback
  return {
    finalAnswer: `I understand you're asking about ${subject}. Let me help you work through this systematically.`,
    steps: [
      "First, let's understand exactly what the question is asking",
      "Identify the key information and concepts involved",
      "Break down the problem into smaller, manageable parts",
      "Apply relevant formulas, principles, or methods",
      "Work through the solution step by step",
      "Verify the answer makes sense in context"
    ],
    conceptsUsed: ["Problem Solving", "Critical Thinking", "Systematic Analysis"],
    suggestedFlashcard: {
      front: "What's the best approach to solve academic problems?",
      back: "1. Understand the question 2. Identify key info 3. Choose method 4. Solve systematically"
    },
    visualExplanation: "Every academic problem has a logical structure that can be approached methodically.",
    relatedTopics: ["Study Techniques", "Problem Solving", "Critical Analysis", "Subject Fundamentals"],
    difficulty: reasoningStyle === 'expert' ? 'advanced' : reasoningStyle === 'exam' ? 'intermediate' : 'basic'
  }
}
