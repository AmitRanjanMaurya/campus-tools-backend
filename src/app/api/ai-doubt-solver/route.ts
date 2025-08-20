import { NextRequest, NextResponse } from 'next/server'

interface AIResponse {
  finalAnswer: string
  steps: string[]
  conceptsUsed: string[]
  visualExplanation?: string
  codeExample?: string
  diagram?: string
  suggestedFlashcard?: {
    front: string
    back: string
  }
  relatedTopics: string[]
  difficulty: 'basic' | 'intermediate' | 'advanced'
}

export async function POST(request: NextRequest) {
  try {
    const { question, subject, reasoningStyle, imageData } = await request.json()

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    console.log('Processing question:', question.substring(0, 100) + '...')
    console.log('Subject:', subject, 'Style:', reasoningStyle)

    // Get AI response using OpenRouter
    const response = await getOpenRouterResponse(question, subject, reasoningStyle, imageData)
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error processing AI request:', error)
    // Fallback to contextual response
    const fallbackResponse = generateActualResponse('general question', 'general', 'basic')
    return NextResponse.json(fallbackResponse)
  }
}

async function getOpenRouterResponse(question: string, subject: string, reasoningStyle: string, imageData?: string): Promise<AIResponse> {
  try {
    console.log('Attempting OpenRouter API call...')
    
    const prompt = createEducationalPrompt(question, subject, reasoningStyle)
    
    console.log('Sending prompt to OpenRouter...')
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Student Tools AI Doubt Solver'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const text = data.choices[0]?.message?.content || ''

    console.log('OpenRouter response received, length:', text.length)

    // Parse the AI response into structured format
    const parsedResponse = parseAIResponse(text, subject)
    
    console.log('Parsed response validation:', {
      hasAnswer: !!parsedResponse.finalAnswer,
      stepsCount: parsedResponse.steps.length,
      conceptsCount: parsedResponse.conceptsUsed.length
    })
    
    // Always return the parsed response
    return parsedResponse

  } catch (error) {
    console.error('OpenRouter API error details:', error)
    // Return enhanced fallback response with actual question context
    return generateActualResponse(question, subject, reasoningStyle)
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

function parseAIResponse(text: string, subject: string): AIResponse {
  console.log('Parsing AI response of length:', text.length)
  
  const response: AIResponse = {
    finalAnswer: '',
    steps: [],
    conceptsUsed: [],
    relatedTopics: [],
    difficulty: 'basic'
  }

  try {
    // If the response doesn't follow our format, try to extract meaningful content
    if (!text.includes('FINAL_ANSWER:')) {
      console.log('Response not in expected format, creating structured response from free text')
      
      // Split text into sentences/paragraphs for steps
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
      
      response.finalAnswer = sentences[0]?.trim() || text.substring(0, 300).trim()
      response.steps = sentences.slice(1, 6).map((s, i) => `${s.trim()}`)
      
      // Generate basic concepts based on subject
      response.conceptsUsed = getSubjectConcepts(subject)
      response.relatedTopics = getSubjectTopics(subject)
      response.difficulty = 'intermediate'
      
      return response
    }

    // Extract sections using regex
    const finalAnswerMatch = text.match(/FINAL_ANSWER:\s*(.+?)(?:\n|STEPS:|$)/i)
    if (finalAnswerMatch) {
      response.finalAnswer = finalAnswerMatch[1].trim()
    }

    // Extract steps - handle multiple formats
    const stepsMatch = text.match(/STEPS:\s*([\s\S]*?)(?=CONCEPTS_USED:|VISUAL_EXPLANATION:|$)/i)
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
      response.finalAnswer = text.substring(0, 300).trim() || "I've analyzed your question and provided a detailed explanation below."
    }
    if (response.steps.length === 0) {
      // Create steps from the text if no structured steps found
      const lines = text.split('\n').filter(line => line.trim().length > 10)
      response.steps = lines.slice(0, 5).map((line) => line.trim())
    }

  } catch (error) {
    console.error('Error parsing AI response:', error)
    // Return at least the raw text as final answer
    response.finalAnswer = text.substring(0, 500).trim() || "Unable to parse the response properly."
    response.steps = ["Please see the answer above for the complete solution."]
  }

  console.log('Final parsed response:', {
    hasAnswer: !!response.finalAnswer,
    answerLength: response.finalAnswer.length,
    stepsCount: response.steps.length
  })

  return response
}

// Helper functions for fallback content
function getSubjectConcepts(subject: string): string[] {
  const concepts = {
    'mathematics': ['Algebra', 'Calculus', 'Geometry', 'Statistics'],
    'physics': ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics'],
    'chemistry': ['Atomic Structure', 'Chemical Bonds', 'Reactions', 'Thermochemistry'],
    'computer-science': ['Algorithms', 'Data Structures', 'Programming', 'Complexity Analysis'],
    'biology': ['Cell Biology', 'Genetics', 'Evolution', 'Ecology']
  }
  return concepts[subject as keyof typeof concepts] || ['Core Concepts', 'Fundamentals', 'Theory', 'Applications']
}

function getSubjectTopics(subject: string): string[] {
  const topics = {
    'mathematics': ['Linear Algebra', 'Differential Equations', 'Number Theory', 'Probability'],
    'physics': ['Classical Mechanics', 'Quantum Physics', 'Relativity', 'Particle Physics'],
    'chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Biochemistry'],
    'computer-science': ['Machine Learning', 'Database Systems', 'Software Engineering', 'Computer Networks'],
    'biology': ['Molecular Biology', 'Physiology', 'Anatomy', 'Microbiology']
  }
  return topics[subject as keyof typeof topics] || ['Advanced Topics', 'Research Areas', 'Applications', 'Case Studies']
}

function generateActualResponse(question: string, subject: string, reasoningStyle: string): AIResponse {
  const questionLower = question.toLowerCase()
  
  // Try to provide more contextual responses based on the actual question
  if (subject === 'computer-science') {
    if (questionLower.includes('algorithm') || questionLower.includes('sort') || questionLower.includes('search')) {
      return {
        finalAnswer: `This algorithm question requires analyzing the problem systematically. For algorithmic problems, we need to consider the input constraints, choose the right approach, and optimize for efficiency.`,
        steps: [
          "Understand the problem requirements and constraints",
          "Identify the appropriate algorithm or data structure",
          "Analyze time and space complexity",
          "Implement the solution with proper logic",
          "Test with sample inputs and edge cases",
          "Optimize if necessary for better performance"
        ],
        conceptsUsed: ["Algorithm Design", "Time Complexity", "Data Structures", "Problem Analysis"],
        codeExample: `// Example approach for algorithm problem
function solveProblem(input) {
  // Step 1: Validate and process input
  if (!input || input.length === 0) return null;
  
  // Step 2: Apply chosen algorithm
  let result = processAlgorithm(input);
  
  // Step 3: Return optimized result
  return result;
}`,
        suggestedFlashcard: {
          front: "What are the key steps in algorithm design?",
          back: "1. Understand problem 2. Choose approach 3. Analyze complexity 4. Implement 5. Test 6. Optimize"
        },
        relatedTopics: ["Big O Notation", "Sorting Algorithms", "Graph Algorithms", "Dynamic Programming"],
        difficulty: 'intermediate'
      }
    }

    if (questionLower.includes('data structure') || questionLower.includes('array') || questionLower.includes('list')) {
      return {
        finalAnswer: "This question involves understanding data structures and their operations. The choice of data structure depends on the specific operations needed and performance requirements.",
        steps: [
          "Identify which data structure is most appropriate for the use case",
          "Understand the operations needed (insert, delete, search, update)",
          "Consider time and space trade-offs for each operation",
          "Implement the data structure with required methods",
          "Optimize for the specific performance requirements",
          "Test with various data sizes and edge cases"
        ],
        conceptsUsed: ["Data Structures", "Arrays", "Linked Lists", "Memory Management", "Algorithm Complexity"],
        codeExample: `// Example data structure implementation
class CustomDataStructure {
  constructor() {
    this.data = [];
    this.size = 0;
  }
  
  insert(value) {
    this.data.push(value);
    this.size++;
    return true;
  }
  
  search(value) {
    return this.data.indexOf(value) !== -1;
  }
  
  delete(value) {
    const index = this.data.indexOf(value);
    if (index !== -1) {
      this.data.splice(index, 1);
      this.size--;
      return true;
    }
    return false;
  }
}`,
        suggestedFlashcard: {
          front: "What factors determine data structure choice?",
          back: "Time complexity, space complexity, operation types, frequency of operations, and memory constraints"
        },
        relatedTopics: ["Arrays", "Linked Lists", "Trees", "Hash Tables", "Stacks", "Queues"],
        difficulty: 'intermediate'
      }
    }
  }

  if (subject === 'mathematics') {
    if (questionLower.includes('solve') || questionLower.includes('equation') || questionLower.includes('=')) {
      return {
        finalAnswer: "To solve this mathematical equation, I'll apply systematic algebraic methods to isolate the variable and find the solution.",
        steps: [
          "Identify the type of equation (linear, quadratic, polynomial, etc.)",
          "Isolate terms with variables on one side of the equation",
          "Move all constant terms to the other side",
          "Apply appropriate solving techniques (factoring, quadratic formula, etc.)",
          "Simplify the expression to find the variable value",
          "Verify the solution by substituting back into the original equation"
        ],
        conceptsUsed: ["Algebraic Manipulation", "Equation Solving", "Variable Isolation", "Solution Verification"],
        diagram: `Example: ax + b = c
Step 1: ax = c - b    (subtract b from both sides)
Step 2: x = (c - b)/a  (divide both sides by a)
Check: a((c-b)/a) + b = c - b + b = c ✓`,
        suggestedFlashcard: {
          front: "What's the general approach to solving equations?",
          back: "Isolate the variable by performing inverse operations on both sides while maintaining equality"
        },
        relatedTopics: ["Linear Equations", "Quadratic Formula", "Systems of Equations", "Factoring"],
        difficulty: 'basic'
      }
    }
  }

  // Generic fallback based on subject
  return {
    finalAnswer: `I'll help you understand this ${subject} concept step by step. Let me break down the approach systematically.`,
    steps: [
      "First, let's identify the key components and requirements of this problem",
      "Next, we'll apply the relevant principles, formulas, and methodologies",
      "Then, we'll work through the solution systematically with clear reasoning",
      "We'll verify our approach and check for any potential errors",
      "Finally, we'll discuss the implications and related concepts"
    ],
    conceptsUsed: getSubjectConcepts(subject),
    relatedTopics: getSubjectTopics(subject),
    difficulty: reasoningStyle === 'expert' ? 'advanced' : reasoningStyle === 'exam' ? 'intermediate' : 'basic',
    suggestedFlashcard: {
      front: `What is a key concept in ${subject}?`,
      back: "Review the fundamental principles and their applications in problem-solving"
    },
    visualExplanation: `For ${subject} problems, it's helpful to visualize the concepts through diagrams, examples, or step-by-step breakdowns.`
  }
}
