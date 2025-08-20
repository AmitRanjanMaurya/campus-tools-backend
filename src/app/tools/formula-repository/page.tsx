'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  BookOpen, 
  Calculator, 
  Atom, 
  Zap, 
  Triangle, 
  ArrowLeft,
  Copy,
  Star,
  Filter,
  Download,
  Heart,
  Eye,
  Bookmark,
  Share2
} from 'lucide-react'
import Link from 'next/link'

interface Formula {
  id: string
  name: string
  formula: string
  latex: string
  description: string
  category: string
  subject: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  variables: Array<{
    symbol: string
    description: string
    unit?: string
  }>
  examples: Array<{
    problem: string
    solution: string
  }>
  tags: string[]
  isFavorite: boolean
  usageCount: number
}

const FORMULA_CATEGORIES = {
  computer_science: {
    name: 'Computer Science',
    icon: Calculator,
    color: 'blue',
    subjects: ['Data Structures', 'Algorithms', 'Database Systems', 'Networking', 'Operating Systems']
  },
  civil: {
    name: 'Civil Engineering',
    icon: Triangle,
    color: 'orange',
    subjects: ['Structural Analysis', 'Geotechnical', 'Transportation', 'Hydraulics', 'Construction']
  },
  mechanical: {
    name: 'Mechanical Engineering',
    icon: Atom,
    color: 'green',
    subjects: ['Thermodynamics', 'Mechanics', 'Heat Transfer', 'Fluid Mechanics', 'Machine Design']
  },
  electrical: {
    name: 'Electrical Engineering',
    icon: Zap,
    color: 'purple',
    subjects: ['Circuit Theory', 'Power Systems', 'Control Systems', 'Electronics', 'Electromagnetics']
  },
  chemical: {
    name: 'Chemical Engineering',
    icon: BookOpen,
    color: 'red',
    subjects: ['Process Control', 'Reaction Engineering', 'Thermochemistry', 'Mass Transfer', 'Unit Operations']
  },
  mathematics: {
    name: 'Engineering Mathematics',
    icon: Calculator,
    color: 'indigo',
    subjects: ['Calculus', 'Linear Algebra', 'Differential Equations', 'Statistics', 'Numerical Methods']
  }
}

const SAMPLE_FORMULAS: Formula[] = [
  // Computer Science & Engineering
  {
    id: 'cs1',
    name: 'Time Complexity - Big O Notation',
    formula: 'O(n), O(log n), O(n²), O(2ⁿ)',
    latex: 'O(n), O(\\log n), O(n^2), O(2^n)',
    description: 'Describes the computational complexity of algorithms as input size grows',
    category: 'computer_science',
    subject: 'Algorithms',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'n', description: 'Input size or number of elements' },
      { symbol: 'O', description: 'Big O notation (upper bound)' }
    ],
    examples: [
      {
        problem: 'Linear search through array of 1000 elements',
        solution: 'Worst case: O(n) = O(1000) operations'
      },
      {
        problem: 'Binary search in sorted array of 1000 elements',
        solution: 'O(log n) = O(log₂ 1000) ≈ 10 operations'
      }
    ],
    tags: ['complexity', 'algorithms', 'performance', 'analysis'],
    isFavorite: false,
    usageCount: 0
  },
  {
    id: 'cs2',
    name: 'Binary Operations',
    formula: 'AND: A ∧ B, OR: A ∨ B, XOR: A ⊕ B, NOT: ¬A',
    latex: 'AND: A \\land B, OR: A \\lor B, XOR: A \\oplus B, NOT: \\neg A',
    description: 'Fundamental binary logic operations used in digital systems',
    category: 'computer_science',
    subject: 'Data Structures',
    difficulty: 'beginner',
    variables: [
      { symbol: 'A', description: 'First binary operand (0 or 1)' },
      { symbol: 'B', description: 'Second binary operand (0 or 1)' }
    ],
    examples: [
      {
        problem: 'Calculate 1 AND 0, 1 OR 0, 1 XOR 0',
        solution: '1 ∧ 0 = 0, 1 ∨ 0 = 1, 1 ⊕ 0 = 1'
      }
    ],
    tags: ['binary', 'logic', 'digital', 'gates'],
    isFavorite: false,
    usageCount: 0
  },
  {
    id: 'cs3',
    name: 'Database Normalization',
    formula: '1NF → 2NF → 3NF → BCNF',
    latex: '1NF \\rightarrow 2NF \\rightarrow 3NF \\rightarrow BCNF',
    description: 'Process of organizing database to reduce redundancy and improve data integrity',
    category: 'computer_science',
    subject: 'Database Systems',
    difficulty: 'advanced',
    variables: [
      { symbol: '1NF', description: 'First Normal Form - Atomic values' },
      { symbol: '2NF', description: 'Second Normal Form - No partial dependencies' },
      { symbol: '3NF', description: 'Third Normal Form - No transitive dependencies' },
      { symbol: 'BCNF', description: 'Boyce-Codd Normal Form - Enhanced 3NF' }
    ],
    examples: [
      {
        problem: 'Student table with repeated course info',
        solution: 'Split into Student, Course, and Enrollment tables'
      }
    ],
    tags: ['database', 'normalization', 'design', 'sql'],
    isFavorite: false,
    usageCount: 0
  },

  // Civil Engineering
  {
    id: 'ce1',
    name: 'Bending Moment (Simply Supported Beam)',
    formula: 'M = wL²/8 (uniformly distributed load)',
    latex: 'M = \\frac{wL^2}{8}',
    description: 'Maximum bending moment in a simply supported beam under uniform load',
    category: 'civil',
    subject: 'Structural Analysis',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'M', description: 'Maximum bending moment', unit: 'kN·m' },
      { symbol: 'w', description: 'Uniformly distributed load', unit: 'kN/m' },
      { symbol: 'L', description: 'Length of beam', unit: 'm' }
    ],
    examples: [
      {
        problem: 'Beam: L=6m, w=10kN/m. Find max moment.',
        solution: 'M = (10 × 6²)/8 = 360/8 = 45 kN·m'
      }
    ],
    tags: ['beam', 'moment', 'structural', 'load'],
    isFavorite: false,
    usageCount: 0
  },
  {
    id: 'ce2',
    name: 'Effective Depth of RCC Beam',
    formula: 'd = √(Mu/(0.87fyb))',
    latex: 'd = \\sqrt{\\frac{M_u}{0.87f_y b}}',
    description: 'Required effective depth for reinforced concrete beam design',
    category: 'civil',
    subject: 'Structural Analysis',
    difficulty: 'advanced',
    variables: [
      { symbol: 'd', description: 'Effective depth', unit: 'mm' },
      { symbol: 'Mu', description: 'Ultimate moment', unit: 'kN·m' },
      { symbol: 'fy', description: 'Yield strength of steel', unit: 'N/mm²' },
      { symbol: 'b', description: 'Width of beam', unit: 'mm' }
    ],
    examples: [
      {
        problem: 'Mu=100kN·m, fy=415N/mm², b=300mm',
        solution: 'd = √(100×10⁶/(0.87×415×300)) = 310mm'
      }
    ],
    tags: ['rcc', 'concrete', 'design', 'beam'],
    isFavorite: false,
    usageCount: 0
  },
  {
    id: 'ce3',
    name: 'Flow Rate in Pipes',
    formula: 'Q = A × V',
    latex: 'Q = A \\times V',
    description: 'Volumetric flow rate through circular pipes',
    category: 'civil',
    subject: 'Hydraulics',
    difficulty: 'beginner',
    variables: [
      { symbol: 'Q', description: 'Flow rate', unit: 'm³/s' },
      { symbol: 'A', description: 'Cross-sectional area', unit: 'm²' },
      { symbol: 'V', description: 'Average velocity', unit: 'm/s' }
    ],
    examples: [
      {
        problem: 'Pipe diameter 0.5m, velocity 2m/s',
        solution: 'A = π×(0.25)² = 0.196m², Q = 0.196×2 = 0.393m³/s'
      }
    ],
    tags: ['hydraulics', 'flow', 'pipe', 'fluid'],
    isFavorite: false,
    usageCount: 0
  },

  // Mechanical Engineering
  {
    id: 'me1',
    name: 'First Law of Thermodynamics',
    formula: 'Q = ΔU + W',
    latex: 'Q = \\Delta U + W',
    description: 'Energy conservation principle stating that heat equals change in internal energy plus work done',
    category: 'mechanical',
    subject: 'Thermodynamics',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'Q', description: 'Heat added to system', unit: 'J' },
      { symbol: 'ΔU', description: 'Change in internal energy', unit: 'J' },
      { symbol: 'W', description: 'Work done by system', unit: 'J' }
    ],
    examples: [
      {
        problem: 'Gas receives 500J heat, does 300J work',
        solution: 'ΔU = Q - W = 500 - 300 = 200J (internal energy increases)'
      }
    ],
    tags: ['thermodynamics', 'energy', 'heat', 'work'],
    isFavorite: false,
    usageCount: 0
  },
  {
    id: 'me2',
    name: 'Stress-Strain Relationship',
    formula: 'σ = E × ε (within elastic limit)',
    latex: '\\sigma = E \\times \\varepsilon',
    description: 'Hooke\'s law relating stress and strain in elastic materials',
    category: 'mechanical',
    subject: 'Mechanics',
    difficulty: 'beginner',
    variables: [
      { symbol: 'σ', description: 'Normal stress', unit: 'N/mm²' },
      { symbol: 'E', description: 'Modulus of elasticity', unit: 'GPa' },
      { symbol: 'ε', description: 'Strain (dimensionless)' }
    ],
    examples: [
      {
        problem: 'Steel rod: E=200GPa, strain=0.001',
        solution: 'σ = 200×10³ × 0.001 = 200 N/mm²'
      }
    ],
    tags: ['stress', 'strain', 'elasticity', 'material'],
    isFavorite: false,
    usageCount: 0
  },
  {
    id: 'me3',
    name: 'Heat Conduction Rate',
    formula: 'Q = -kA(dT/dx)',
    latex: 'Q = -kA\\frac{dT}{dx}',
    description: 'Fourier\'s law of heat conduction through materials',
    category: 'mechanical',
    subject: 'Heat Transfer',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'Q', description: 'Heat transfer rate', unit: 'W' },
      { symbol: 'k', description: 'Thermal conductivity', unit: 'W/m·K' },
      { symbol: 'A', description: 'Cross-sectional area', unit: 'm²' },
      { symbol: 'dT/dx', description: 'Temperature gradient', unit: 'K/m' }
    ],
    examples: [
      {
        problem: 'Wall: k=1.5W/m·K, A=10m², ΔT=20K, thickness=0.2m',
        solution: 'Q = 1.5×10×(20/0.2) = 1500W'
      }
    ],
    tags: ['heat', 'conduction', 'thermal', 'transfer'],
    isFavorite: false,
    usageCount: 0
  },

  // Electrical Engineering
  {
    id: 'ee1',
    name: 'Ohm\'s Law',
    formula: 'V = I × R',
    latex: 'V = I \\times R',
    description: 'Fundamental relationship between voltage, current, and resistance in electrical circuits',
    category: 'electrical',
    subject: 'Circuit Theory',
    difficulty: 'beginner',
    variables: [
      { symbol: 'V', description: 'Voltage', unit: 'V (Volts)' },
      { symbol: 'I', description: 'Current', unit: 'A (Amperes)' },
      { symbol: 'R', description: 'Resistance', unit: 'Ω (Ohms)' }
    ],
    examples: [
      {
        problem: 'Circuit with 12V supply and 4Ω resistance',
        solution: 'I = V/R = 12/4 = 3A'
      }
    ],
    tags: ['voltage', 'current', 'resistance', 'circuit'],
    isFavorite: false,
    usageCount: 0
  },
  {
    id: 'ee2',
    name: 'AC Power Formulas',
    formula: 'P = VI cos φ, Q = VI sin φ, S = VI',
    latex: 'P = VI\\cos\\phi, Q = VI\\sin\\phi, S = VI',
    description: 'Active, reactive, and apparent power in AC circuits',
    category: 'electrical',
    subject: 'Power Systems',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'P', description: 'Active power', unit: 'W' },
      { symbol: 'Q', description: 'Reactive power', unit: 'VAR' },
      { symbol: 'S', description: 'Apparent power', unit: 'VA' },
      { symbol: 'φ', description: 'Phase angle', unit: 'degrees' }
    ],
    examples: [
      {
        problem: 'V=230V, I=10A, cos φ=0.8',
        solution: 'P=230×10×0.8=1840W, Q=230×10×0.6=1380VAR'
      }
    ],
    tags: ['power', 'ac', 'reactive', 'apparent'],
    isFavorite: false,
    usageCount: 0
  },
  {
    id: 'ee3',
    name: 'Transformer Turns Ratio',
    formula: 'Np/Ns = Vp/Vs = Is/Ip',
    latex: '\\frac{N_p}{N_s} = \\frac{V_p}{V_s} = \\frac{I_s}{I_p}',
    description: 'Relationship between turns, voltages, and currents in ideal transformers',
    category: 'electrical',
    subject: 'Power Systems',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'Np', description: 'Primary turns' },
      { symbol: 'Ns', description: 'Secondary turns' },
      { symbol: 'Vp', description: 'Primary voltage', unit: 'V' },
      { symbol: 'Vs', description: 'Secondary voltage', unit: 'V' }
    ],
    examples: [
      {
        problem: 'Step-down: Np=1000, Ns=100, Vp=2300V',
        solution: 'Vs = Vp×(Ns/Np) = 2300×(100/1000) = 230V'
      }
    ],
    tags: ['transformer', 'turns', 'voltage', 'current'],
    isFavorite: false,
    usageCount: 0
  },

  // Chemical Engineering
  {
    id: 'che1',
    name: 'Reaction Rate Law',
    formula: 'r = k[A]^n[B]^m',
    latex: 'r = k[A]^n[B]^m',
    description: 'Rate of chemical reaction depends on concentration and reaction order',
    category: 'chemical',
    subject: 'Reaction Engineering',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'r', description: 'Reaction rate', unit: 'mol/L·s' },
      { symbol: 'k', description: 'Rate constant' },
      { symbol: '[A]', description: 'Concentration of A', unit: 'mol/L' },
      { symbol: 'n', description: 'Order with respect to A' }
    ],
    examples: [
      {
        problem: 'First order: k=0.05s⁻¹, [A]=2mol/L',
        solution: 'r = 0.05×2¹ = 0.1 mol/L·s'
      }
    ],
    tags: ['reaction', 'kinetics', 'rate', 'concentration'],
    isFavorite: false,
    usageCount: 0
  },
  {
    id: 'che2',
    name: 'Arrhenius Equation',
    formula: 'k = A exp(-Ea/RT)',
    latex: 'k = A e^{-\\frac{E_a}{RT}}',
    description: 'Temperature dependence of reaction rate constants',
    category: 'chemical',
    subject: 'Reaction Engineering',
    difficulty: 'advanced',
    variables: [
      { symbol: 'k', description: 'Rate constant' },
      { symbol: 'A', description: 'Pre-exponential factor' },
      { symbol: 'Ea', description: 'Activation energy', unit: 'J/mol' },
      { symbol: 'R', description: 'Gas constant', unit: '8.314 J/mol·K' },
      { symbol: 'T', description: 'Temperature', unit: 'K' }
    ],
    examples: [
      {
        problem: 'Ea=50kJ/mol, T increases from 300K to 310K',
        solution: 'Rate constant approximately doubles for 10K increase'
      }
    ],
    tags: ['arrhenius', 'temperature', 'activation', 'kinetics'],
    isFavorite: false,
    usageCount: 0
  },
  {
    id: 'che3',
    name: 'Mass Balance Equation',
    formula: 'Input - Output + Generation - Consumption = Accumulation',
    latex: '\\text{Input} - \\text{Output} + \\text{Generation} - \\text{Consumption} = \\text{Accumulation}',
    description: 'Fundamental principle for material balance in chemical processes',
    category: 'chemical',
    subject: 'Process Control',
    difficulty: 'intermediate',
    variables: [
      { symbol: 'Input', description: 'Mass flow in', unit: 'kg/s' },
      { symbol: 'Output', description: 'Mass flow out', unit: 'kg/s' },
      { symbol: 'Generation', description: 'Mass produced', unit: 'kg/s' },
      { symbol: 'Consumption', description: 'Mass consumed', unit: 'kg/s' }
    ],
    examples: [
      {
        problem: 'Steady state reactor: Input=100kg/h, Output=95kg/h',
        solution: 'Generation-Consumption = 95-100 = -5kg/h (net consumption)'
      }
    ],
    tags: ['mass', 'balance', 'process', 'material'],
    isFavorite: false,
    usageCount: 0
  },

  // Engineering Mathematics
  {
    id: 'math1',
    name: 'Laplace Transform',
    formula: 'L{f(t)} = ∫₀^∞ f(t)e^(-st) dt',
    latex: '\\mathcal{L}\\{f(t)\\} = \\int_0^\\infty f(t)e^{-st} dt',
    description: 'Transforms differential equations from time domain to frequency domain',
    category: 'mathematics',
    subject: 'Differential Equations',
    difficulty: 'advanced',
    variables: [
      { symbol: 'L{f(t)}', description: 'Laplace transform of f(t)' },
      { symbol: 's', description: 'Complex frequency variable' },
      { symbol: 't', description: 'Time variable' }
    ],
    examples: [
      {
        problem: 'Find L{e^(at)}',
        solution: 'L{e^(at)} = 1/(s-a) for s > a'
      }
    ],
    tags: ['laplace', 'transform', 'differential', 'frequency'],
    isFavorite: false,
    usageCount: 0
  },
  {
    id: 'math2',
    name: 'Fourier Series',
    formula: 'f(x) = a₀/2 + Σ(aₙcos(nπx/L) + bₙsin(nπx/L))',
    latex: 'f(x) = \\frac{a_0}{2} + \\sum_{n=1}^\\infty \\left(a_n\\cos\\frac{n\\pi x}{L} + b_n\\sin\\frac{n\\pi x}{L}\\right)',
    description: 'Represents periodic functions as sum of sines and cosines',
    category: 'mathematics',
    subject: 'Calculus',
    difficulty: 'advanced',
    variables: [
      { symbol: 'f(x)', description: 'Periodic function' },
      { symbol: 'L', description: 'Half period' },
      { symbol: 'aₙ, bₙ', description: 'Fourier coefficients' }
    ],
    examples: [
      {
        problem: 'Square wave with period 2π',
        solution: 'f(x) = (4/π)Σ(sin(2n-1)x)/(2n-1) for odd harmonics'
      }
    ],
    tags: ['fourier', 'series', 'periodic', 'harmonics'],
    isFavorite: false,
    usageCount: 0
  }
]

export default function FormulaRepository() {
  const [formulas, setFormulas] = useState<Formula[]>(SAMPLE_FORMULAS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'category'>('name')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)

  // Load formulas from localStorage
  useEffect(() => {
    const savedFormulas = localStorage.getItem('formula_repository')
    if (savedFormulas) {
      try {
        setFormulas(JSON.parse(savedFormulas))
      } catch (error) {
        console.error('Error loading formulas:', error)
      }
    }
  }, [])

  // Save formulas to localStorage
  const saveFormulas = (updatedFormulas: Formula[]) => {
    localStorage.setItem('formula_repository', JSON.stringify(updatedFormulas))
    setFormulas(updatedFormulas)
  }

  // Toggle favorite
  const toggleFavorite = (formulaId: string) => {
    const updatedFormulas = formulas.map(formula =>
      formula.id === formulaId 
        ? { ...formula, isFavorite: !formula.isFavorite }
        : formula
    )
    saveFormulas(updatedFormulas)
  }

  // Increment usage count
  const incrementUsage = (formulaId: string) => {
    const updatedFormulas = formulas.map(formula =>
      formula.id === formulaId 
        ? { ...formula, usageCount: formula.usageCount + 1 }
        : formula
    )
    saveFormulas(updatedFormulas)
  }

  // Copy formula to clipboard
  const copyFormula = async (formula: Formula) => {
    try {
      await navigator.clipboard.writeText(formula.formula)
      incrementUsage(formula.id)
      alert('Formula copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Filter formulas
  const filteredFormulas = formulas.filter(formula => {
    const matchesSearch = !searchQuery || 
      formula.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formula.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formula.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || formula.category === selectedCategory
    const matchesSubject = selectedSubject === 'all' || formula.subject === selectedSubject
    const matchesDifficulty = selectedDifficulty === 'all' || formula.difficulty === selectedDifficulty
    const matchesFavorites = !showFavoritesOnly || formula.isFavorite

    return matchesSearch && matchesCategory && matchesSubject && matchesDifficulty && matchesFavorites
  })

  // Sort formulas
  const sortedFormulas = [...filteredFormulas].sort((a, b) => {
    switch (sortBy) {
      case 'usage':
        return b.usageCount - a.usageCount
      case 'category':
        return a.category.localeCompare(b.category)
      case 'name':
      default:
        return a.name.localeCompare(b.name)
    }
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f1f9fe' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/tools" className="flex items-center text-primary-600 hover:text-primary-800 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Tools
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">Formula Repository</h1>
              <p className="text-secondary-600 mt-1">Quick access to mathematical and scientific formulas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showFavoritesOnly 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-secondary-600 border border-secondary-200 hover:bg-secondary-50'
              }`}
            >
              <Heart className={`h-4 w-4 mr-2 inline ${showFavoritesOnly ? 'fill-current' : ''}`} />
              {showFavoritesOnly ? 'Show All' : 'Favorites Only'}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search formulas, descriptions, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {Object.entries(FORMULA_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>{category.name}</option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field"
            >
              <option value="all">All Subjects</option>
              {selectedCategory !== 'all' && FORMULA_CATEGORIES[selectedCategory as keyof typeof FORMULA_CATEGORIES] ? 
                FORMULA_CATEGORIES[selectedCategory as keyof typeof FORMULA_CATEGORIES].subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                )) :
                Array.from(new Set(formulas.map(f => f.subject))).map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))
              }
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'usage' | 'category')}
              className="input-field"
            >
              <option value="name">Sort by Name</option>
              <option value="usage">Sort by Usage</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>

          {/* Category Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {Object.entries(FORMULA_CATEGORIES).map(([key, category]) => {
              const Icon = category.icon
              const count = formulas.filter(f => f.category === key).length
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedCategory === key 
                      ? `border-${category.color}-500 bg-${category.color}-50` 
                      : 'border-secondary-200 hover:border-secondary-300 bg-white'
                  }`}
                >
                  <Icon className={`h-6 w-6 mx-auto mb-2 text-${category.color}-600`} />
                  <div className="text-sm font-medium text-secondary-900">{category.name}</div>
                  <div className="text-xs text-secondary-500">{count} formulas</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-secondary-600">
            Found {sortedFormulas.length} formula{sortedFormulas.length !== 1 ? 's' : ''}
            {showFavoritesOnly && ' (favorites only)'}
          </p>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-secondary-400" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input-field text-sm py-1 px-2"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Formula Grid */}
        {sortedFormulas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFormulas.map(formula => (
              <FormulaCard
                key={formula.id}
                formula={formula}
                onToggleFavorite={() => toggleFavorite(formula.id)}
                onCopy={() => copyFormula(formula)}
                onView={() => setSelectedFormula(formula)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No formulas found</h3>
            <p className="text-secondary-600">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Formula Detail Modal */}
        {selectedFormula && (
          <FormulaDetailModal
            formula={selectedFormula}
            onClose={() => setSelectedFormula(null)}
            onCopy={() => copyFormula(selectedFormula)}
            onToggleFavorite={() => toggleFavorite(selectedFormula.id)}
          />
        )}
      </div>
    </div>
  )
}

// Formula Card Component
interface FormulaCardProps {
  formula: Formula
  onToggleFavorite: () => void
  onCopy: () => void
  onView: () => void
}

function FormulaCard({ formula, onToggleFavorite, onCopy, onView }: FormulaCardProps) {
  const category = FORMULA_CATEGORIES[formula.category as keyof typeof FORMULA_CATEGORIES]
  const Icon = category?.icon || Calculator

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50'
      case 'intermediate': return 'text-yellow-600 bg-yellow-50'
      case 'advanced': return 'text-red-600 bg-red-50'
      default: return 'text-secondary-600 bg-secondary-50'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${category?.color || 'blue'}-50`}>
            <Icon className={`h-5 w-5 text-${category?.color || 'blue'}-600`} />
          </div>
          <div>
            <h3 className="font-bold text-secondary-900">{formula.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-secondary-500">{formula.subject}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(formula.difficulty)}`}>
                {formula.difficulty}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={onToggleFavorite}
          className={`p-2 rounded-lg transition-colors ${
            formula.isFavorite 
              ? 'text-red-600 bg-red-50 hover:bg-red-100' 
              : 'text-secondary-400 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <Heart className={`h-4 w-4 ${formula.isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Formula */}
      <div className="bg-secondary-50 rounded-lg p-4 mb-4">
        <div className="font-mono text-lg text-center text-secondary-900 mb-2">
          {formula.formula}
        </div>
        <p className="text-sm text-secondary-600 text-center">{formula.description}</p>
      </div>

      {/* Variables Preview */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {formula.variables.slice(0, 3).map(variable => (
            <span key={variable.symbol} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
              {variable.symbol}: {variable.description}
            </span>
          ))}
          {formula.variables.length > 3 && (
            <span className="px-2 py-1 bg-secondary-100 text-secondary-600 rounded text-xs">
              +{formula.variables.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onCopy}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Copy className="h-3 w-3 mr-1 inline" />
            Copy
          </button>
          <button
            onClick={onView}
            className="px-3 py-1.5 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors text-sm font-medium"
          >
            <Eye className="h-3 w-3 mr-1 inline" />
            View
          </button>
        </div>
        
        {formula.usageCount > 0 && (
          <span className="text-xs text-secondary-500">
            Used {formula.usageCount} time{formula.usageCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}

// Formula Detail Modal Component
interface FormulaDetailModalProps {
  formula: Formula
  onClose: () => void
  onCopy: () => void
  onToggleFavorite: () => void
}

function FormulaDetailModal({ formula, onClose, onCopy, onToggleFavorite }: FormulaDetailModalProps) {
  const category = FORMULA_CATEGORIES[formula.category as keyof typeof FORMULA_CATEGORIES]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-secondary-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">{formula.name}</h2>
              <p className="text-secondary-600">{formula.subject} • {category?.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  formula.isFavorite 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                    : 'text-secondary-400 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Heart className={`h-5 w-5 ${formula.isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Formula Display */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <div className="font-mono text-3xl text-secondary-900 mb-2">
                {formula.formula}
              </div>
              <p className="text-secondary-700">{formula.description}</p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={onCopy}
                className="btn-primary"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Formula
              </button>
              <button className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors font-medium">
                <Share2 className="h-4 w-4 mr-2 inline" />
                Share
              </button>
            </div>
          </div>

          {/* Variables */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-3">Variables</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formula.variables.map(variable => (
                <div key={variable.symbol} className="bg-secondary-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="font-mono text-lg font-bold text-primary-600 bg-white rounded px-3 py-1">
                      {variable.symbol}
                    </div>
                    <div>
                      <div className="font-medium text-secondary-900">{variable.description}</div>
                      {variable.unit && (
                        <div className="text-sm text-secondary-600">Unit: {variable.unit}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          {formula.examples.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">Examples</h3>
              <div className="space-y-4">
                {formula.examples.map((example, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="mb-2">
                      <span className="font-medium text-green-800">Problem: </span>
                      <span className="text-green-700">{example.problem}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Solution: </span>
                      <span className="text-green-700 font-mono">{example.solution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {formula.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
