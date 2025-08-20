import { NextRequest, NextResponse } from 'next/server'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
}

interface QuizGenerationRequest {
  content: string
  subject: string
  difficulty: string
  questionCount: number
  questionType: string
  inputMethod: string
}

export async function POST(request: NextRequest) {
  try {
    const { content, subject, difficulty, questionCount, questionType, inputMethod }: QuizGenerationRequest = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    console.log('Generating quiz:', { subject, difficulty, questionCount, questionType, inputMethod })

    // Generate quiz using OpenRouter AI
    const questions = await generateQuizQuestions(content, subject, difficulty, questionCount, questionType)
    
    return NextResponse.json({ questions })

  } catch (error) {
    console.error('Error generating quiz:', error)
    // Fallback to sample questions if AI fails
    const fallbackQuestions = generateFallbackQuestions('computer-science', 10, 'medium')
    return NextResponse.json({ questions: fallbackQuestions })
  }
}

async function generateQuizQuestions(
  content: string,
  subject: string,
  difficulty: string,
  questionCount: number,
  questionType: string
): Promise<Question[]> {
  try {
    console.log('Attempting OpenRouter API call for quiz generation...')
    
    const prompt = createQuizPrompt(content, subject, difficulty, questionCount, questionType)
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Student Tools Quiz Generator'
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
        max_tokens: 3000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const text = data.choices[0]?.message?.content || ''

    console.log('OpenRouter response received for quiz, length:', text.length)

    // Parse the AI response into structured questions
    const questions = parseQuizResponse(text, subject, difficulty)
    
    console.log('Parsed questions count:', questions.length)
    
    if (questions.length > 0) {
      return questions.slice(0, questionCount)
    }
    
    // If parsing failed, generate fallback
    return generateFallbackQuestions(subject, questionCount, difficulty)

  } catch (error) {
    console.error('OpenRouter API error for quiz:', error)
    return generateFallbackQuestions(subject, questionCount, difficulty)
  }
}

function createQuizPrompt(
  content: string,
  subject: string,
  difficulty: string,
  questionCount: number,
  questionType: string
): string {
  const difficultyInstructions = {
    easy: "Create basic, foundational questions suitable for beginners",
    medium: "Create moderate difficulty questions requiring understanding of concepts",
    hard: "Create challenging questions requiring deep understanding and analysis",
    mixed: "Create a mix of easy, medium, and hard questions"
  }

  const typeInstructions = {
    mcq: "multiple-choice questions with 4 options each",
    'true-false': "true/false questions",
    'fill-blank': "fill-in-the-blank questions",
    'short-answer': "short answer questions",
    mixed: "a mix of multiple-choice, true/false, and fill-in-the-blank questions"
  }

  return `You are an expert quiz generator for ${subject}. Create ${questionCount} ${typeInstructions[questionType as keyof typeof typeInstructions]} based on the following content:

CONTENT:
${content}

REQUIREMENTS:
- Subject: ${subject}
- Difficulty: ${difficulty} - ${difficultyInstructions[difficulty as keyof typeof difficultyInstructions]}
- Question Type: ${questionType}
- Number of Questions: ${questionCount}

Please format your response as a JSON array with the following structure:
[
  {
    "question": "What is the main purpose of a database index?",
    "options": ["To store data", "To improve query performance", "To backup data", "To encrypt data"],
    "correctAnswer": 1,
    "explanation": "Database indexes improve query performance by providing faster data retrieval paths.",
    "difficulty": "medium",
    "topic": "${subject}"
  }
]

IMPORTANT INSTRUCTIONS:
1. For multiple-choice questions, provide exactly 4 options
2. For true/false questions, provide exactly 2 options: ["True", "False"]
3. For fill-in-the-blank questions, use "___" in the question and provide the answer as the first option
4. correctAnswer should be the index (0-based) of the correct option
5. Always include a clear explanation for each question
6. Make questions directly related to the provided content
7. Ensure questions test understanding, not just memorization
8. Vary the difficulty if "mixed" is selected
9. Return ONLY the JSON array, no additional text

Generate educational, accurate questions that help students learn and test their knowledge effectively.`
}

function parseQuizResponse(text: string, subject: string, difficulty: string): Question[] {
  try {
    // Try to extract JSON from the response
    let jsonMatch = text.match(/\[[\s\S]*\]/);
    let jsonText = jsonMatch ? jsonMatch[0] : text;
    
    // Clean up the JSON text
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(jsonText);
    
    if (Array.isArray(parsed)) {
      return parsed.map((item, index) => ({
        id: `${Date.now()}-${index}`,
        question: item.question || `Sample question ${index + 1}`,
        options: item.options || ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: typeof item.correctAnswer === 'number' ? item.correctAnswer : 0,
        explanation: item.explanation || "This is the correct answer.",
        difficulty: item.difficulty || difficulty,
        topic: item.topic || subject
      }));
    }
  } catch (error) {
    console.error('Error parsing quiz response:', error);
    console.log('Raw response text:', text.substring(0, 500));
  }
  
  // If parsing fails, try to extract questions from free text
  return extractQuestionsFromText(text, subject, difficulty);
}

function extractQuestionsFromText(text: string, subject: string, difficulty: string): Question[] {
  const questions: Question[] = [];
  
  // Try to find question patterns in the text
  const questionPatterns = [
    /(\d+[\.)]\s*(.+\?))[\s\S]*?([A-D][\.)]\s*.+)/gi,
    /(What|How|Why|When|Where|Which).+\?/gi,
    /(.+\?)[\s\S]*?(True|False)/gi
  ];
  
  let questionCount = 0;
  for (const pattern of questionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null && questionCount < 10) {
      const questionText = match[1] || match[0];
      if (questionText && questionText.length > 10) {
        questions.push({
          id: `extracted-${questionCount}`,
          question: questionText.trim(),
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          explanation: "AI-generated explanation based on the content.",
          difficulty: difficulty as 'easy' | 'medium' | 'hard',
          topic: subject
        });
        questionCount++;
      }
    }
  }
  
  return questions;
}

function generateFallbackQuestions(subject: string, questionCount: number, difficulty: string): Question[] {
  const fallbackQuestions: { [key: string]: Question[] } = {
    'computer-science': [
      {
        id: 'cs-1',
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correctAnswer: 1,
        explanation: 'Binary search has O(log n) time complexity because it eliminates half of the search space in each iteration.',
        difficulty: 'medium',
        topic: 'computer-science'
      },
      {
        id: 'cs-2',
        question: 'Which data structure uses LIFO (Last In First Out) principle?',
        options: ['Queue', 'Stack', 'Array', 'Linked List'],
        correctAnswer: 1,
        explanation: 'Stack follows LIFO principle where the last element added is the first one to be removed.',
        difficulty: 'easy',
        topic: 'computer-science'
      },
      {
        id: 'cs-3',
        question: 'What is polymorphism in object-oriented programming?',
        options: ['Hiding data', 'Using multiple inheritance', 'Same interface, different implementations', 'Creating objects'],
        correctAnswer: 2,
        explanation: 'Polymorphism allows objects of different types to be treated as objects of a common base type.',
        difficulty: 'medium',
        topic: 'computer-science'
      },
      {
        id: 'cs-4',
        question: 'Which sorting algorithm has the best average case time complexity?',
        options: ['Bubble Sort', 'Selection Sort', 'Quick Sort', 'Insertion Sort'],
        correctAnswer: 2,
        explanation: 'Quick Sort has O(n log n) average case time complexity, which is optimal for comparison-based sorting.',
        difficulty: 'hard',
        topic: 'computer-science'
      },
      {
        id: 'cs-5',
        question: 'What does SQL stand for?',
        options: ['Structured Query Language', 'Standard Query Language', 'Sequential Query Language', 'Simple Query Language'],
        correctAnswer: 0,
        explanation: 'SQL stands for Structured Query Language, used for managing relational databases.',
        difficulty: 'easy',
        topic: 'computer-science'
      }
    ],
    'mathematics': [
      {
        id: 'math-1',
        question: 'What is the derivative of x²?',
        options: ['x', '2x', 'x²', '2'],
        correctAnswer: 1,
        explanation: 'Using the power rule, d/dx(x²) = 2x¹ = 2x.',
        difficulty: 'easy',
        topic: 'mathematics'
      },
      {
        id: 'math-2',
        question: 'What is the integral of 1/x?',
        options: ['ln|x| + C', 'x + C', '1/x² + C', 'e^x + C'],
        correctAnswer: 0,
        explanation: 'The integral of 1/x is ln|x| + C, where C is the constant of integration.',
        difficulty: 'medium',
        topic: 'mathematics'
      },
      {
        id: 'math-3',
        question: 'In a right triangle, what is sin²θ + cos²θ equal to?',
        options: ['0', '1', 'tan θ', '2'],
        correctAnswer: 1,
        explanation: 'This is the Pythagorean identity: sin²θ + cos²θ = 1 for any angle θ.',
        difficulty: 'easy',
        topic: 'mathematics'
      },
      {
        id: 'math-4',
        question: 'What is the limit of sin(x)/x as x approaches 0?',
        options: ['0', '1', '∞', 'undefined'],
        correctAnswer: 1,
        explanation: 'This is a standard limit: lim(x→0) sin(x)/x = 1.',
        difficulty: 'medium',
        topic: 'mathematics'
      },
      {
        id: 'math-5',
        question: 'What is the determinant of a 2×2 matrix [[a,b],[c,d]]?',
        options: ['ad + bc', 'ad - bc', 'ac - bd', 'ab - cd'],
        correctAnswer: 1,
        explanation: 'For a 2×2 matrix, the determinant is ad - bc.',
        difficulty: 'medium',
        topic: 'mathematics'
      }
    ],
    'physics': [
      {
        id: 'phy-1',
        question: 'What is Newton\'s second law of motion?',
        options: ['F = ma', 'E = mc²', 'v = u + at', 'PV = nRT'],
        correctAnswer: 0,
        explanation: 'Newton\'s second law states that Force equals mass times acceleration (F = ma).',
        difficulty: 'easy',
        topic: 'physics'
      },
      {
        id: 'phy-2',
        question: 'What is the speed of light in vacuum?',
        options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'],
        correctAnswer: 0,
        explanation: 'The speed of light in vacuum is approximately 3 × 10⁸ meters per second.',
        difficulty: 'easy',
        topic: 'physics'
      },
      {
        id: 'phy-3',
        question: 'What type of energy does a moving object possess?',
        options: ['Potential energy', 'Kinetic energy', 'Thermal energy', 'Chemical energy'],
        correctAnswer: 1,
        explanation: 'A moving object possesses kinetic energy, which depends on its mass and velocity.',
        difficulty: 'easy',
        topic: 'physics'
      },
      {
        id: 'phy-4',
        question: 'What is the unit of electric current?',
        options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
        correctAnswer: 1,
        explanation: 'The unit of electric current is Ampere (A), named after André-Marie Ampère.',
        difficulty: 'easy',
        topic: 'physics'
      },
      {
        id: 'phy-5',
        question: 'According to Ohm\'s law, what is the relationship between voltage, current, and resistance?',
        options: ['V = I/R', 'V = IR', 'V = I + R', 'V = I - R'],
        correctAnswer: 1,
        explanation: 'Ohm\'s law states that voltage equals current times resistance (V = IR).',
        difficulty: 'medium',
        topic: 'physics'
      }
    ],
    'chemistry': [
      {
        id: 'chem-1',
        question: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctAnswer: 2,
        explanation: 'The chemical symbol for gold is Au, from the Latin word "aurum".',
        difficulty: 'easy',
        topic: 'chemistry'
      },
      {
        id: 'chem-2',
        question: 'How many electrons can the first electron shell hold?',
        options: ['2', '8', '18', '32'],
        correctAnswer: 0,
        explanation: 'The first electron shell (K shell) can hold a maximum of 2 electrons.',
        difficulty: 'easy',
        topic: 'chemistry'
      },
      {
        id: 'chem-3',
        question: 'What is the pH of pure water at 25°C?',
        options: ['0', '7', '14', '1'],
        correctAnswer: 1,
        explanation: 'Pure water has a pH of 7 at 25°C, making it neutral.',
        difficulty: 'easy',
        topic: 'chemistry'
      },
      {
        id: 'chem-4',
        question: 'What type of bond is formed when electrons are shared between atoms?',
        options: ['Ionic bond', 'Covalent bond', 'Metallic bond', 'Hydrogen bond'],
        correctAnswer: 1,
        explanation: 'Covalent bonds are formed when electrons are shared between atoms.',
        difficulty: 'medium',
        topic: 'chemistry'
      },
      {
        id: 'chem-5',
        question: 'What is Avogadro\'s number?',
        options: ['6.022 × 10²³', '6.022 × 10²²', '6.022 × 10²⁴', '6.022 × 10²¹'],
        correctAnswer: 0,
        explanation: 'Avogadro\'s number is 6.022 × 10²³, representing the number of particles in one mole.',
        difficulty: 'medium',
        topic: 'chemistry'
      }
    ],
    'biology': [
      {
        id: 'bio-1',
        question: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic reticulum'],
        correctAnswer: 1,
        explanation: 'Mitochondria are called the powerhouse of the cell because they produce ATP energy.',
        difficulty: 'easy',
        topic: 'biology'
      },
      {
        id: 'bio-2',
        question: 'What is the basic unit of heredity?',
        options: ['Cell', 'Chromosome', 'Gene', 'DNA'],
        correctAnswer: 2,
        explanation: 'A gene is the basic unit of heredity, containing instructions for specific traits.',
        difficulty: 'easy',
        topic: 'biology'
      },
      {
        id: 'bio-3',
        question: 'What process do plants use to make their own food?',
        options: ['Respiration', 'Photosynthesis', 'Digestion', 'Fermentation'],
        correctAnswer: 1,
        explanation: 'Plants use photosynthesis to convert sunlight, water, and carbon dioxide into glucose.',
        difficulty: 'easy',
        topic: 'biology'
      },
      {
        id: 'bio-4',
        question: 'How many chambers does a human heart have?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 2,
        explanation: 'The human heart has 4 chambers: two atria and two ventricles.',
        difficulty: 'easy',
        topic: 'biology'
      },
      {
        id: 'bio-5',
        question: 'What is the molecule that carries genetic information?',
        options: ['RNA', 'DNA', 'Protein', 'Lipid'],
        correctAnswer: 1,
        explanation: 'DNA (Deoxyribonucleic acid) carries genetic information in all living organisms.',
        difficulty: 'easy',
        topic: 'biology'
      }
    ]
  };

  const subjectQuestions = fallbackQuestions[subject] || fallbackQuestions['computer-science'];
  
  // Filter by difficulty if specific difficulty is requested
  let filteredQuestions = subjectQuestions;
  if (difficulty !== 'mixed') {
    filteredQuestions = subjectQuestions.filter(q => q.difficulty === difficulty);
    if (filteredQuestions.length === 0) {
      filteredQuestions = subjectQuestions; // Fallback to all questions if none match difficulty
    }
  }

  // Return requested number of questions, repeating if necessary
  const questions: Question[] = [];
  for (let i = 0; i < questionCount; i++) {
    const questionIndex = i % filteredQuestions.length;
    const baseQuestion = filteredQuestions[questionIndex];
    questions.push({
      ...baseQuestion,
      id: `${baseQuestion.id}-${i}` // Ensure unique IDs
    });
  }

  return questions;
}
