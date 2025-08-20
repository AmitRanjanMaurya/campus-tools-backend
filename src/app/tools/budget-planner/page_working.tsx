'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PlusCircle,
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  AlertTriangle,
  Download,
  Upload,
  Settings,
  Trash2,
  Edit3,
  Save,
  X,
  IndianRupee,
  Receipt,
  Bell,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Camera,
  CreditCard,
  Repeat,
  Tag,
  DollarSign,
  Split,
  Share2,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowLeft,
  BrainCircuit
} from 'lucide-react'

// TypeScript interfaces
interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  type: 'expense'
  recurring?: boolean
  splitWith?: string[]
  receipt?: string
  tags?: string[]
}

interface Income {
  id: string
  amount: number
  source: string
  date: string
  type: 'income'
  recurring?: boolean
}

interface Category {
  name: string
  budgetAmount: number
  color: string
  icon: string
}

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  description: string
}

interface BudgetData {
  expenses: Expense[]
  income: Income[]
  categories: Category[]
  goals: SavingsGoal[]
}

interface AIInsights {
  analysis: string
  insights: {
    healthScore: number
    savingsRate: number
    topSpendingCategories: Array<{ name: string; amount: number }>
    recommendations: string[]
  }
  suggestions: {
    dailySpendingLimit: number
    monthlySavingsTarget: number
    emergencyFundTarget: number
  }
}

const defaultCategories: Category[] = [
  { name: 'Food & Dining', budgetAmount: 3000, color: '#FF6B6B', icon: '🍕' },
  { name: 'Transportation', budgetAmount: 1500, color: '#4ECDC4', icon: '🚌' },
  { name: 'Education', budgetAmount: 2000, color: '#45B7D1', icon: '📚' },
  { name: 'Entertainment', budgetAmount: 1000, color: '#96CEB4', icon: '🎬' },
  { name: 'Shopping', budgetAmount: 1500, color: '#FECA57', icon: '🛍️' },
  { name: 'Health', budgetAmount: 800, color: '#FF9FF3', icon: '🏥' },
  { name: 'Miscellaneous', budgetAmount: 500, color: '#54A0FF', icon: '📦' }
]

export default function BudgetPlanner() {
  // State management
  const [budgetData, setBudgetData] = useState<BudgetData>({
    expenses: [],
    income: [],
    categories: defaultCategories,
    goals: []
  })

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddIncome, setShowAddIncome] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null)

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    recurring: false,
    tags: ''
  })

  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    recurring: false
  })

  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    description: ''
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    budgetAmount: '',
    color: '#FF6B6B',
    icon: '📦'
  })

  // Filter states
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterDateRange, setFilterDateRange] = useState('thisMonth')
  const [searchTerm, setSearchTerm] = useState('')

  // Load data from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('budget-data')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setBudgetData(prev => ({
          ...prev,
          ...data,
          categories: data.categories?.length > 0 ? data.categories : defaultCategories
        }))
      } catch (error) {
        console.error('Error loading budget data:', error)
      }
    }
  }, [])

  // Save data to localStorage whenever budgetData changes
  useEffect(() => {
    if (budgetData.expenses.length > 0 || budgetData.income.length > 0 || budgetData.goals.length > 0) {
      localStorage.setItem('budget-data', JSON.stringify(budgetData))
    }
  }, [budgetData])

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      // Handle responsive layout changes if needed
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Utility functions
  const getCurrentMonthData = () => {
    const startOfMonth = new Date(currentYear, currentMonth, 1)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0)
    
    const monthlyExpenses = budgetData.expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= startOfMonth && expenseDate <= endOfMonth
    })
    
    const monthlyIncome = budgetData.income.filter(income => {
      const incomeDate = new Date(income.date)
      return incomeDate >= startOfMonth && incomeDate <= endOfMonth
    })
    
    return { monthlyExpenses, monthlyIncome }
  }

  const getCategoriesWithSpending = () => {
    const { monthlyExpenses } = getCurrentMonthData()
    
    return budgetData.categories.map(category => {
      const spentAmount = monthlyExpenses
        .filter(expense => expense.category === category.name)
        .reduce((sum, expense) => sum + expense.amount, 0)
      
      return { ...category, spentAmount }
    })
  }

  const getTotalIncome = () => {
    const { monthlyIncome } = getCurrentMonthData()
    return monthlyIncome.reduce((sum, income) => sum + income.amount, 0)
  }

  const getTotalExpenses = () => {
    const { monthlyExpenses } = getCurrentMonthData()
    return monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getSavingsRate = () => {
    const income = getTotalIncome()
    const expenses = getTotalExpenses()
    return income > 0 ? ((income - expenses) / income) * 100 : 0
  }

  // Add expense
  const handleAddExpense = () => {
    if (!expenseForm.amount || !expenseForm.category) return

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      description: expenseForm.description,
      date: expenseForm.date,
      type: 'expense',
      recurring: expenseForm.recurring,
      tags: expenseForm.tags ? expenseForm.tags.split(',').map(tag => tag.trim()) : []
    }

    setBudgetData(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExpense]
    }))

    // Reset form
    setExpenseForm({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      recurring: false,
      tags: ''
    })
    setShowAddExpense(false)
  }

  // Add income
  const handleAddIncome = () => {
    if (!incomeForm.amount || !incomeForm.source) return

    const newIncome: Income = {
      id: Date.now().toString(),
      amount: parseFloat(incomeForm.amount),
      source: incomeForm.source,
      date: incomeForm.date,
      type: 'income',
      recurring: incomeForm.recurring
    }

    setBudgetData(prev => ({
      ...prev,
      income: [...prev.income, newIncome]
    }))

    // Reset form
    setIncomeForm({
      amount: '',
      source: '',
      date: new Date().toISOString().split('T')[0],
      recurring: false
    })
    setShowAddIncome(false)
  }

  // Add savings goal
  const handleAddGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount) return

    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name: goalForm.name,
      targetAmount: parseFloat(goalForm.targetAmount),
      currentAmount: 0,
      deadline: goalForm.deadline,
      description: goalForm.description
    }

    setBudgetData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }))

    // Reset form
    setGoalForm({
      name: '',
      targetAmount: '',
      deadline: '',
      description: ''
    })
    setShowAddGoal(false)
  }

  // Add category
  const handleAddCategory = () => {
    if (!categoryForm.name || !categoryForm.budgetAmount) return

    const newCategory: Category = {
      name: categoryForm.name,
      budgetAmount: parseFloat(categoryForm.budgetAmount),
      color: categoryForm.color,
      icon: categoryForm.icon
    }

    setBudgetData(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }))

    // Reset form
    setCategoryForm({
      name: '',
      budgetAmount: '',
      color: '#FF6B6B',
      icon: '📦'
    })
    setShowAddCategory(false)
  }

  // Export data
  const handleExport = () => {
    const dataToExport = {
      ...budgetData,
      exportDate: new Date().toISOString(),
      monthYear: `${currentMonth + 1}-${currentYear}`
    }
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-${currentMonth + 1}-${currentYear}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Receipt processing (mock function)
  const handleReceiptUpload = async (file: File) => {
    try {
      // Mock OCR result - in real app, use OCR API
      const mockExpense = {
        amount: '150',
        category: 'Food & Dining',
        description: 'Restaurant bill',
        date: new Date().toISOString().split('T')[0]
      }
      
      setExpenseForm(prev => ({
        ...prev,
        ...mockExpense
      }))
      setShowAddExpense(true)
    } catch (error) {
      console.error('Receipt processing failed:', error)
    }
  }

  // AI Insights
  const getAIInsights = async () => {
    if (budgetData.expenses.length === 0 && budgetData.income.length === 0) {
      return
    }

    setLoadingInsights(true)
    
    try {
      const { monthlyExpenses, monthlyIncome } = getCurrentMonthData()
      
      const response = await fetch('/api/budget-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenses: monthlyExpenses,
          income: monthlyIncome,
          categories: budgetData.categories,
          prompt: `Provide insights for a student's budget for ${new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
        })
      })
      
      const result = await response.json()
      setAiInsights(result.data)
    } catch (error) {
      console.error('AI insights failed:', error)
    } finally {
      setLoadingInsights(false)
    }
  }

  // Delete functions
  const deleteExpense = (id: string) => {
    setBudgetData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(exp => exp.id !== id)
    }))
  }

  const deleteIncome = (id: string) => {
    setBudgetData(prev => ({
      ...prev,
      income: prev.income.filter(inc => inc.id !== id)
    }))
  }

  const deleteGoal = (id: string) => {
    setBudgetData(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal.id !== id)
    }))
  }

  // Navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(prev => prev - 1)
      } else {
        setCurrentMonth(prev => prev - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(prev => prev + 1)
      } else {
        setCurrentMonth(prev => prev + 1)
      }
    }
  }

  // Get filtered data
  const getFilteredExpenses = () => {
    const { monthlyExpenses } = getCurrentMonthData()
    
    return monthlyExpenses.filter(expense => {
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }

  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const remainingBudget = totalIncome - totalExpenses
  const savingsRate = getSavingsRate()
  const categoriesWithSpending = getCategoriesWithSpending()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Budget Planner
                </h1>
                <p className="text-gray-600">Comprehensive financial management for students</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Month Navigation */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-white rounded-md transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium text-gray-700 min-w-[140px] text-center">
                  {new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-white rounded-md transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={getAIInsights}
                disabled={loadingInsights}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                <BrainCircuit className="w-4 h-4" />
                {loadingInsights ? 'Analyzing...' : 'AI Insights'}
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'expenses', label: 'Expenses', icon: TrendingDown },
              { id: 'income', label: 'Income', icon: TrendingUp },
              { id: 'goals', label: 'Goals', icon: Target },
              { id: 'analytics', label: 'Analytics', icon: PieChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Remaining</p>
                    <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ₹{remainingBudget.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${remainingBudget >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
                    <Wallet className={`w-6 h-6 ${remainingBudget >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                    <p className={`text-2xl font-bold ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {savingsRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${savingsRate >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Target className={`w-6 h-6 ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-700">Add Expense</span>
                </button>

                <button
                  onClick={() => setShowAddIncome(true)}
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-700">Add Income</span>
                </button>

                <button
                  onClick={() => setShowAddGoal(true)}
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-700">Set Goal</span>
                </button>

                <button
                  onClick={() => setShowAddCategory(true)}
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Tag className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-700">Add Category</span>
                </button>
              </div>
            </div>

            {/* Category Budget Overview */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Budget Overview</h3>
              <div className="space-y-4">
                {categoriesWithSpending.map((category) => {
                  const percentage = category.budgetAmount > 0 ? (category.spentAmount / category.budgetAmount) * 100 : 0
                  const isOverBudget = percentage > 100

                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium text-gray-700">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-700'}`}>
                            ₹{category.spentAmount.toLocaleString()} / ₹{category.budgetAmount.toLocaleString()}
                          </span>
                          <p className="text-sm text-gray-500">{percentage.toFixed(1)}% used</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI Insights */}
            {aiInsights && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <BrainCircuit className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">AI Budget Insights</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">{aiInsights.analysis}</div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Health Score</p>
                    <p className="text-2xl font-bold text-purple-600">{aiInsights.insights.healthScore}/10</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Daily Limit</p>
                    <p className="text-2xl font-bold text-blue-600">₹{aiInsights.suggestions.dailySpendingLimit}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Monthly Target</p>
                    <p className="text-2xl font-bold text-green-600">₹{aiInsights.suggestions.monthlySavingsTarget}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search expenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {budgetData.categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Expense
                  </button>
                </div>
              </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Recent Expenses</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {getFilteredExpenses().length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No expenses found for the current filters.</p>
                  </div>
                ) : (
                  getFilteredExpenses()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense) => (
                      <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">
                                {budgetData.categories.find(cat => cat.name === expense.category)?.icon || '💸'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{expense.description || 'Unnamed expense'}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{expense.category}</span>
                                <span>•</span>
                                <span>{new Date(expense.date).toLocaleDateString()}</span>
                                {expense.recurring && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Repeat className="w-3 h-3" />
                                      Recurring
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-red-600">
                              -₹{expense.amount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Income Tab */}
        {activeTab === 'income' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Income Sources</h2>
              <button
                onClick={() => setShowAddIncome(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add Income
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {getCurrentMonthData().monthlyIncome.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No income recorded for this month.</p>
                  </div>
                ) : (
                  getCurrentMonthData().monthlyIncome
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((income) => (
                      <div key={income.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{income.source}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{new Date(income.date).toLocaleDateString()}</span>
                                {income.recurring && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Repeat className="w-3 h-3" />
                                      Recurring
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-green-600">
                              +₹{income.amount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => deleteIncome(income.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Savings Goals</h2>
              <button
                onClick={() => setShowAddGoal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Target className="w-4 h-4" />
                Add Goal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgetData.goals.length === 0 ? (
                <div className="col-span-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No savings goals set yet.</p>
                </div>
              ) : (
                budgetData.goals.map((goal) => {
                  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
                  const isCompleted = progress >= 100

                  return (
                    <div key={goal.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800">{goal.name}</h3>
                          <p className="text-sm text-gray-500">{goal.description}</p>
                        </div>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-gray-700'}`}>
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            ₹{goal.currentAmount.toLocaleString()}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            ₹{goal.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        
                        {goal.deadline && (
                          <div className="text-sm text-gray-500">
                            Deadline: {new Date(goal.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Budget Analytics</h2>
            
            {/* Analytics cards will be implemented with chart libraries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
                <div className="space-y-3">
                  {categoriesWithSpending
                    .filter(cat => cat.spentAmount > 0)
                    .sort((a, b) => b.spentAmount - a.spentAmount)
                    .map((category) => {
                      const percentage = totalExpenses > 0 ? (category.spentAmount / totalExpenses) * 100 : 0
                      
                      return (
                        <div key={category.name} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">{category.name}</span>
                            <span className="text-sm text-gray-600">
                              ₹{category.spentAmount.toLocaleString()} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trends</h3>
                <div className="text-center text-gray-500 py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Chart visualization coming soon</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add Expense</h3>
              <button
                onClick={() => setShowAddExpense(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {budgetData.categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What did you spend on?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring-expense"
                  checked={expenseForm.recurring}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, recurring: e.target.checked }))}
                  className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="recurring-expense" className="text-sm text-gray-700">
                  Recurring expense
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExpense}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      {showAddIncome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add Income</h3>
              <button
                onClick={() => setShowAddIncome(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <input
                  type="text"
                  value={incomeForm.source}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Part-time job, Scholarship, Allowance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring-income"
                  checked={incomeForm.recurring}
                  onChange={(e) => setIncomeForm(prev => ({ ...prev, recurring: e.target.checked }))}
                  className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="recurring-income" className="text-sm text-gray-700">
                  Recurring income
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddIncome(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIncome}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Income
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add Savings Goal</h3>
              <button
                onClick={() => setShowAddGoal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., New Laptop, Emergency Fund"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                <input
                  type="number"
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (Optional)</label>
                <input
                  type="date"
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={goalForm.description}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Why is this goal important to you?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add Category</h3>
              <button
                onClick={() => setShowAddCategory(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Books, Gym"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget</label>
                <input
                  type="number"
                  value={categoryForm.budgetAmount}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, budgetAmount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="📦"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back to Tools Button */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tools
        </Link>
      </div>
    </div>
  )
}
