'use client'

import { useState, useEffect } from 'react'
import { 
  Calculator,
  Home,
  Car,
  CreditCard,
  Briefcase,
  GraduationCap,
  Coins,
  Download,
  Share2,
  BarChart3,
  PieChart,
  TrendingUp,
  ArrowLeft,
  Info,
  DollarSign,
  Calendar,
  Percent,
  FileText,
  Smartphone,
  Target,
  Users,
  Award,
  Zap,
  Shield,
  Activity,
  RefreshCw,
  Eye,
  Settings,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'

// Types
interface LoanDetails {
  amount: number
  rate: number
  tenure: number
  emi: number
  totalInterest: number
  totalAmount: number
}

interface LoanType {
  id: string
  name: string
  icon: any
  description: string
  defaultRate: number
  maxAmount: number
  maxTenure: number
  features: string[]
  color: string
}

interface ComparisonLoan {
  id: string
  name: string
  bank: string
  rate: number
  amount: number
  tenure: number
  emi: number
  totalInterest: number
  processingFee: number
  features: string[]
}

export default function EMICalculator() {
  // State management
  const [currentView, setCurrentView] = useState<'main' | 'specialized' | 'compare' | 'guides' | 'analytics'>('main')
  const [selectedLoanType, setSelectedLoanType] = useState<string>('personal')
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [chartType, setChartType] = useState<'payment' | 'amortization'>('payment')
  
  // Calculator state
  const [loanAmount, setLoanAmount] = useState(1000000)
  const [interestRate, setInterestRate] = useState(8.5)
  const [loanTenure, setLoanTenure] = useState(20)
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years')
  
  // Advanced options
  const [processingFee, setProcessingFee] = useState(0)
  const [prepayment, setPrepayment] = useState(0)
  const [insurance, setInsurance] = useState(0)
  
  // Results
  const [emiDetails, setEmiDetails] = useState<LoanDetails>({
    amount: 1000000,
    rate: 8.5,
    tenure: 20,
    emi: 0,
    totalInterest: 0,
    totalAmount: 0
  })
  
  // Comparison state
  const [comparisonLoans, setComparisonLoans] = useState<ComparisonLoan[]>([])
  const [showComparison, setShowComparison] = useState(false)

  // Add CSS styles for sliders
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .slider {
        background: linear-gradient(to right, #3B82F6 0%, #3B82F6 50%, #E5E7EB 50%, #E5E7EB 100%);
      }
      .slider::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #3B82F6;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      .slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #3B82F6;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Loan types configuration
  const loanTypes: LoanType[] = [
    {
      id: 'home',
      name: 'Home Loan',
      icon: Home,
      description: 'Calculate EMI for home loans with tax benefits and prepayment options',
      defaultRate: 8.5,
      maxAmount: 50000000,
      maxTenure: 30,
      features: ['Tax Benefits', 'Prepayment Options', 'Step-up EMI', 'Balance Transfer'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'car',
      name: 'Car Loan',
      icon: Car,
      description: 'Plan your vehicle purchase with accurate EMI calculations',
      defaultRate: 9.5,
      maxAmount: 2000000,
      maxTenure: 7,
      features: ['New & Used Cars', 'Insurance Options', 'Fast Approval', 'Flexible Tenure'],
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'personal',
      name: 'Personal Loan',
      icon: CreditCard,
      description: 'Quick calculations for personal loans and instant approvals',
      defaultRate: 12.5,
      maxAmount: 4000000,
      maxTenure: 7,
      features: ['No Collateral', 'Quick Approval', 'Flexible Use', 'Minimal Documentation'],
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'business',
      name: 'Business Loan',
      icon: Briefcase,
      description: 'Calculate EMI for business loans and working capital',
      defaultRate: 11.5,
      maxAmount: 10000000,
      maxTenure: 10,
      features: ['Working Capital', 'Equipment Finance', 'Term Loans', 'Overdraft Facility'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'education',
      name: 'Education Loan',
      icon: GraduationCap,
      description: 'Plan education financing with moratorium period calculations',
      defaultRate: 9.0,
      maxAmount: 7500000,
      maxTenure: 15,
      features: ['Moratorium Period', 'Tax Benefits', 'Study Abroad', 'Collateral Free Options'],
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'gold',
      name: 'Gold Loan',
      icon: Coins,
      description: 'Calculate EMI against gold with flexible repayment options',
      defaultRate: 7.5,
      maxAmount: 2000000,
      maxTenure: 3,
      features: ['Quick Processing', 'Minimal Documentation', 'Flexible Repayment', 'Gold Security'],
      color: 'from-amber-500 to-amber-600'
    }
  ]

  // Calculate EMI
  const calculateEMI = () => {
    const principal = loanAmount
    const rate = interestRate / 100 / 12
    const tenure = tenureType === 'years' ? loanTenure * 12 : loanTenure
    
    if (rate === 0) {
      const emi = principal / tenure
      const totalAmount = principal
      const totalInterest = 0
      
      setEmiDetails({
        amount: principal,
        rate: interestRate,
        tenure: loanTenure,
        emi,
        totalInterest,
        totalAmount
      })
      return
    }
    
    const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1)
    const totalAmount = emi * tenure
    const totalInterest = totalAmount - principal
    
    setEmiDetails({
      amount: principal,
      rate: interestRate,
      tenure: loanTenure,
      emi,
      totalInterest,
      totalAmount
    })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  // Generate amortization schedule
  const generateAmortizationSchedule = () => {
    const schedule = []
    const principal = loanAmount
    const rate = interestRate / 100 / 12
    const tenure = tenureType === 'years' ? loanTenure * 12 : loanTenure
    
    let outstandingPrincipal = principal
    
    for (let month = 1; month <= Math.min(tenure, 12); month++) {
      const interestPayment = outstandingPrincipal * rate
      const principalPayment = emiDetails.emi - interestPayment
      outstandingPrincipal -= principalPayment
      
      schedule.push({
        month,
        emi: emiDetails.emi,
        principal: principalPayment,
        interest: interestPayment,
        outstanding: Math.max(0, outstandingPrincipal)
      })
    }
    
    return schedule
  }

  // Download PDF function
  const downloadPDF = () => {
    // Create a simple PDF download (in real app, use jsPDF)
    const pdfContent = `
EMI Calculator Results
=====================

Loan Amount: ${formatCurrency(loanAmount)}
Interest Rate: ${interestRate}% per annum
Loan Tenure: ${loanTenure} ${tenureType}

Monthly EMI: ${formatCurrency(emiDetails.emi)}
Total Interest: ${formatCurrency(emiDetails.totalInterest)}
Total Amount: ${formatCurrency(emiDetails.totalAmount)}

Generated on: ${new Date().toLocaleDateString()}
    `
    
    const blob = new Blob([pdfContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `emi-calculation-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Share results
  const shareResults = async () => {
    const shareData = {
      title: 'EMI Calculator Results',
      text: `Monthly EMI: ${formatCurrency(emiDetails.emi)} for loan of ${formatCurrency(loanAmount)}`,
      url: window.location.href
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`EMI: ${formatCurrency(emiDetails.emi)} for ${formatCurrency(loanAmount)} loan`)
      alert('Results copied to clipboard!')
    }
  }

  // Add to comparison
  const addToComparison = () => {
    const selectedType = loanTypes.find(type => type.id === selectedLoanType)
    const newLoan: ComparisonLoan = {
      id: Date.now().toString(),
      name: selectedType?.name || 'Personal Loan',
      bank: 'Bank A',
      rate: interestRate,
      amount: loanAmount,
      tenure: loanTenure,
      emi: emiDetails.emi,
      totalInterest: emiDetails.totalInterest,
      processingFee: processingFee,
      features: selectedType?.features || []
    }
    
    setComparisonLoans(prev => [...prev, newLoan])
    setShowComparison(true)
  }

  // Update loan type
  const updateLoanType = (typeId: string) => {
    setSelectedLoanType(typeId)
    const loanType = loanTypes.find(type => type.id === typeId)
    if (loanType) {
      setInterestRate(loanType.defaultRate)
    }
  }

  // Calculate on change
  useEffect(() => {
    calculateEMI()
  }, [loanAmount, interestRate, loanTenure, tenureType])

  if (currentView === 'main') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-green-600 rounded-2xl">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                EMI Calculator
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Calculate your monthly installments instantly & accurately. Plan your loans with our comprehensive EMI calculator.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Calculator */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Quick EMI Calculator</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Advanced
                    </button>
                    <button
                      onClick={() => setShowChart(!showChart)}
                      className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 inline mr-2" />
                      Chart
                    </button>
                  </div>
                </div>

                {/* Loan Type Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Loan Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {loanTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => updateLoanType(type.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedLoanType === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <type.icon className={`w-6 h-6 mx-auto mb-1 ${
                          selectedLoanType === type.id ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          selectedLoanType === type.id ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {type.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loan Amount */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">Loan Amount (₹)</label>
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(loanAmount)}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="100000"
                      max={loanTypes.find(type => type.id === selectedLoanType)?.maxAmount || 4000000}
                      step="50000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>₹1L</span>
                      <span>{formatCurrency(loanTypes.find(type => type.id === selectedLoanType)?.maxAmount || 4000000)}</span>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter loan amount"
                  />
                </div>

                {/* Interest Rate */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">Interest Rate (% per annum)</label>
                    <span className="text-lg font-bold text-green-600">{interestRate}%</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1%</span>
                      <span>20%</span>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter interest rate"
                  />
                </div>

                {/* Loan Tenure */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">Loan Tenure</label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-purple-600">{loanTenure}</span>
                      <select
                        value={tenureType}
                        onChange={(e) => setTenureType(e.target.value as 'years' | 'months')}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="years">Years</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min={tenureType === 'years' ? 1 : 12}
                      max={tenureType === 'years' ? (loanTypes.find(type => type.id === selectedLoanType)?.maxTenure || 7) : (loanTypes.find(type => type.id === selectedLoanType)?.maxTenure || 7) * 12}
                      step={tenureType === 'years' ? 1 : 12}
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{tenureType === 'years' ? '1 Year' : '12 Months'}</span>
                      <span>{tenureType === 'years' ? `${loanTypes.find(type => type.id === selectedLoanType)?.maxTenure || 7} Years` : `${(loanTypes.find(type => type.id === selectedLoanType)?.maxTenure || 7) * 12} Months`}</span>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Enter tenure in ${tenureType}`}
                  />
                </div>

                {/* Advanced Options */}
                {showAdvanced && (
                  <div className="bg-gray-50 p-6 rounded-xl mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Processing Fee (₹)</label>
                        <input
                          type="number"
                          value={processingFee}
                          onChange={(e) => setProcessingFee(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Annual Prepayment (₹)</label>
                        <input
                          type="number"
                          value={prepayment}
                          onChange={(e) => setPrepayment(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Insurance (₹/year)</label>
                        <input
                          type="number"
                          value={insurance}
                          onChange={(e) => setInsurance(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Calculate Button */}
                <button
                  onClick={calculateEMI}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105"
                >
                  <Calculator className="w-5 h-5 inline mr-2" />
                  Calculate EMI
                </button>
              </div>
            </div>

            {/* Results Panel */}
            <div className="space-y-6">
              {/* Monthly EMI */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly EMI</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {formatCurrency(emiDetails.emi)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Total Interest</div>
                      <div className="text-xl font-bold text-red-500">{formatCurrency(emiDetails.totalInterest)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Total Amount</div>
                      <div className="text-xl font-bold text-green-500">{formatCurrency(emiDetails.totalAmount)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Principal Amount</span>
                    <span className="font-bold text-blue-600">{formatCurrency(loanAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Interest</span>
                    <span className="font-bold text-red-500">{formatCurrency(emiDetails.totalInterest)}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>Principal</span>
                      <span>Interest</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                        style={{ 
                          width: `${(loanAmount / emiDetails.totalAmount) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{((loanAmount / emiDetails.totalAmount) * 100).toFixed(1)}%</span>
                      <span>{((emiDetails.totalInterest / emiDetails.totalAmount) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={downloadPDF}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={shareResults}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Result
                  </button>
                  <button
                    onClick={() => setCurrentView('analytics')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Chart
                  </button>
                  <button
                    onClick={addToComparison}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Compare
                  </button>
                </div>
              </div>

              {/* Navigation to other views */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Explore More</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCurrentView('guides')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Loan Guides
                  </button>
                  <button
                    onClick={() => setCurrentView('compare')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Compare Loans
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Why Choose Our Platform?</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Instant Results</div>
                      <div className="text-sm text-gray-500">Real-time calculations</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">100% Accurate</div>
                      <div className="text-sm text-gray-500">Bank-grade calculations</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Visual Analytics</div>
                      <div className="text-sm text-gray-500">Interactive charts</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Mobile Friendly</div>
                      <div className="text-sm text-gray-500">Works on all devices</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specialized Calculators */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Specialized Calculators</h2>
              <p className="text-lg text-gray-600">Choose the right calculator for your specific needs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loanTypes.map((type) => (
                <div key={type.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105">
                  <div className={`p-4 bg-gradient-to-r ${type.color} rounded-xl mb-4 text-center`}>
                    <type.icon className="w-8 h-8 text-white mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{type.name}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {type.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => updateLoanType(type.id)}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Calculate Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mt-12">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tools
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'analytics') {
    const amortizationData = generateAmortizationSchedule()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Loan Analytics</h1>
              <p className="text-gray-600">Visual breakdown of your loan payments</p>
            </div>
            <button
              onClick={() => setCurrentView('main')}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Breakdown Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Payment Breakdown</h3>
              <div className="relative">
                {/* Pie Chart Representation */}
                <div className="w-64 h-64 mx-auto relative">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 relative overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600"
                      style={{
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + (emiDetails.totalInterest / emiDetails.totalAmount) * 50}% 0%, 100% 100%, 0% 100%)`
                      }}
                    ></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center shadow-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">{formatCurrency(emiDetails.emi)}</div>
                        <div className="text-sm text-gray-500">Monthly EMI</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-gray-700">Principal</span>
                    </div>
                    <span className="font-bold">{formatCurrency(loanAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-gray-700">Interest</span>
                    </div>
                    <span className="font-bold">{formatCurrency(emiDetails.totalInterest)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amortization Schedule */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Amortization Schedule (First 12 Months)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Month</th>
                      <th className="text-right py-2">EMI</th>
                      <th className="text-right py-2">Principal</th>
                      <th className="text-right py-2">Interest</th>
                      <th className="text-right py-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationData.map((row) => (
                      <tr key={row.month} className="border-b border-gray-100">
                        <td className="py-2">{row.month}</td>
                        <td className="text-right py-2">{formatCurrency(row.emi)}</td>
                        <td className="text-right py-2 text-blue-600">{formatCurrency(row.principal)}</td>
                        <td className="text-right py-2 text-red-600">{formatCurrency(row.interest)}</td>
                        <td className="text-right py-2">{formatCurrency(row.outstanding)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{formatCurrency(emiDetails.emi)}</div>
              <div className="text-sm text-gray-500">Monthly EMI</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{formatCurrency(loanAmount)}</div>
              <div className="text-sm text-gray-500">Loan Amount</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Percent className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{interestRate}%</div>
              <div className="text-sm text-gray-500">Interest Rate</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{loanTenure}</div>
              <div className="text-sm text-gray-500">{tenureType === 'years' ? 'Years' : 'Months'}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'compare') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Loan Comparison</h1>
              <p className="text-gray-600">Compare different loan options side by side</p>
            </div>
            <button
              onClick={() => setCurrentView('main')}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {comparisonLoans.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Loans to Compare</h3>
              <p className="text-gray-600 mb-6">Add loans from the calculator to start comparing</p>
              <button
                onClick={() => setCurrentView('main')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Calculator
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {comparisonLoans.map((loan) => (
                <div key={loan.id} className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{loan.name}</h3>
                    <button
                      onClick={() => setComparisonLoans(prev => prev.filter(l => l.id !== loan.id))}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Monthly EMI</div>
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(loan.emi)}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm text-gray-600">Loan Amount</div>
                        <div className="font-semibold">{formatCurrency(loan.amount)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Interest Rate</div>
                        <div className="font-semibold">{loan.rate}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Tenure</div>
                        <div className="font-semibold">{loan.tenure} years</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total Interest</div>
                        <div className="font-semibold text-red-600">{formatCurrency(loan.totalInterest)}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Features</div>
                      <div className="space-y-1">
                        {loan.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (currentView === 'guides') {
    const guides = [
      {
        title: "Home Loan Guide",
        description: "Complete guide to home loans, eligibility, and tax benefits",
        icon: Home,
        color: "from-blue-500 to-blue-600",
        topics: ["Eligibility Criteria", "Tax Benefits", "Prepayment Options", "Interest Rate Types"],
        detailedContent: {
          overview: "Home loans are long-term secured loans offered by banks and financial institutions to help individuals purchase, construct, or renovate residential properties.",
          eligibility: [
            "Age: 21-65 years for salaried, 25-70 years for self-employed",
            "Minimum income: ₹25,000-30,000 per month for salaried individuals",
            "Credit score: 750+ for best interest rates",
            "Employment: Minimum 2-3 years of work experience",
            "Property: Clear title and approved by the lender"
          ],
          documents: [
            "Identity proof (Aadhaar, PAN Card, Passport)",
            "Address proof (Utility bills, rental agreement)",
            "Income proof (Salary slips, ITR, bank statements)",
            "Property documents (Sale deed, NOC, approvals)",
            "Passport size photographs"
          ],
          interestRates: {
            range: "8.5% - 12% per annum",
            factors: [
              "Credit score and credit history",
              "Loan amount and tenure",
              "Employment type and income stability",
              "Existing relationship with the bank",
              "Market conditions and repo rate"
            ]
          },
          tenure: "Up to 30 years (360 months)",
          loanAmount: "Up to 90% of property value (₹10 crore+ for some banks)",
          tips: [
            "Compare interest rates from multiple lenders",
            "Maintain a good credit score before applying",
            "Consider floating vs fixed interest rates",
            "Factor in processing fees and other charges",
            "Use balance transfer for better rates",
            "Prepay when possible to reduce interest burden"
          ],
          charges: [
            "Processing fees: 0.5% - 1% of loan amount",
            "Administrative charges: ₹5,000 - ₹15,000",
            "Legal and technical verification: ₹5,000 - ₹10,000",
            "Prepayment charges: 2-4% (floating rate loans exempt)",
            "Late payment charges: 2% per month on overdue amount"
          ]
        }
      },
      {
        title: "Personal Loan Guide", 
        description: "Everything you need to know about personal loans",
        icon: CreditCard,
        color: "from-green-500 to-green-600",
        topics: ["Documentation", "Interest Rates", "Quick Approval", "Credit Score Impact"],
        detailedContent: {
          overview: "Personal loans are unsecured loans that don't require collateral. They offer quick disbursement but come with higher interest rates due to increased risk for lenders.",
          eligibility: [
            "Age: 21-60 years for salaried, 25-65 years for self-employed",
            "Minimum income: ₹25,000 per month (varies by city)",
            "Credit score: 750+ for best rates and approval",
            "Employment: Minimum 1-2 years with current employer",
            "Clean credit history with no defaults"
          ],
          documents: [
            "Identity proof (Aadhaar, PAN, Passport)",
            "Address proof (utility bills, rental agreement)",
            "Income proof (3-6 months salary slips)",
            "Bank statements (3-6 months)",
            "Employment proof (offer letter, ID card)"
          ],
          interestRates: {
            range: "10.5% - 24% per annum",
            factors: [
              "Credit score (major factor)",
              "Income level and employment type",
              "Existing relationship with bank",
              "Loan amount and tenure",
              "Market competition and lender policies"
            ]
          },
          tenure: "1-5 years (12-60 months)",
          loanAmount: "₹50,000 to ₹40 lakhs (based on income)",
          tips: [
            "Improve credit score before applying",
            "Compare interest rates across lenders",
            "Borrow only what you need",
            "Choose shorter tenure to save on interest",
            "Avoid multiple loan applications simultaneously",
            "Consider balance transfer for existing loans"
          ],
          charges: [
            "Processing fees: 1-3% of loan amount",
            "Administrative charges: ₹999 - ₹4,999",
            "Prepayment charges: 2-5% (reducing over time)",
            "Late payment penalty: 2-3% per month",
            "Loan cancellation charges: ₹3,000 - ₹5,000"
          ]
        }
      },
      {
        title: "Car Loan Guide",
        description: "Vehicle financing options and best practices",
        icon: Car,
        color: "from-red-500 to-red-600", 
        topics: ["New vs Used", "Insurance", "Down Payment", "Loan Transfer"],
        detailedContent: {
          overview: "Car loans are secured loans where the vehicle serves as collateral. Banks and NBFCs offer competitive rates for both new and used vehicles.",
          eligibility: [
            "Age: 21-65 years for salaried, 25-65 years for self-employed",
            "Minimum income: ₹20,000-25,000 per month",
            "Credit score: 700+ for competitive rates",
            "Employment: 1-2 years of stable employment",
            "Valid driving license"
          ],
          documents: [
            "Identity and address proof",
            "Income proof (salary slips, bank statements)",
            "Employment proof (offer letter, ID card)",
            "Quotation from car dealer",
            "Insurance documents"
          ],
          interestRates: {
            range: "7.5% - 15% per annum",
            factors: [
              "New vs used car (new cars get better rates)",
              "Car make and model",
              "Loan amount and down payment",
              "Applicant's credit profile",
              "Lender type (banks vs NBFCs)"
            ]
          },
          tenure: "1-7 years (12-84 months)",
          loanAmount: "Up to 90% of car's on-road price",
          tips: [
            "Make higher down payment to reduce EMI",
            "Compare rates between banks and NBFCs",
            "Check for special offers during festive seasons",
            "Consider manufacturer financing options",
            "Read fine print for prepayment charges",
            "Ensure comprehensive insurance coverage"
          ],
          charges: [
            "Processing fees: ₹3,000 - ₹10,000",
            "Administrative charges: ₹1,000 - ₹5,000",
            "Documentation charges: ₹500 - ₹2,000",
            "Prepayment charges: 3-6% of outstanding amount",
            "Bounced EMI charges: ₹500 - ₹750 per instance"
          ]
        }
      },
      {
        title: "Education Loan Guide",
        description: "Financing your academic dreams",
        icon: GraduationCap,
        color: "from-purple-500 to-purple-600",
        topics: ["Course Eligibility", "Collateral Requirements", "Moratorium Period", "Tax Benefits"],
        detailedContent: {
          overview: "Education loans help students finance higher education in India and abroad. Government schemes and bank policies make quality education accessible to all economic backgrounds.",
          eligibility: [
            "Indian citizen with admission to recognized institution",
            "Age: No specific limit for student, co-applicant 21-65 years",
            "Good academic record (minimum 50-60% in qualifying exam)",
            "Co-applicant required (parent/spouse/sibling)",
            "Collateral may be required for loans above ₹7.5 lakhs"
          ],
          documents: [
            "Admission letter from institution",
            "Mark sheets and certificates",
            "Entrance exam scorecards",
            "Identity and address proof of student and co-applicant",
            "Income proof of co-applicant",
            "Cost estimate from institution",
            "Collateral documents (if applicable)"
          ],
          interestRates: {
            range: "8.5% - 15% per annum",
            factors: [
              "Course type (technical courses get better rates)",
              "Institution ranking and recognition",
              "Loan amount (higher amounts may need collateral)",
              "Co-applicant's credit profile",
              "Domestic vs international education"
            ]
          },
          tenure: "Course duration + 1 year + 10-15 years repayment",
          loanAmount: "Up to ₹1.5 crore (varies by bank and course)",
          tips: [
            "Apply early as processing takes time",
            "Compare interest rates and repayment terms",
            "Understand moratorium period benefits",
            "Consider tax benefits under Section 80E",
            "Check for interest subsidy schemes",
            "Maintain good academic performance"
          ],
          charges: [
            "Processing fees: ₹10,000 - ₹50,000 or 1% of loan amount",
            "Administrative charges: ₹5,000 - ₹15,000",
            "Collateral valuation charges: ₹5,000 - ₹10,000",
            "Prepayment: Usually no charges",
            "Late payment penalty: 2% per month"
          ],
          schemes: [
            "Central Sector Interest Subsidy Scheme",
            "Dr. APJ Abdul Kalam Interest Subsidy Scheme",
            "Padho Pardesh Scheme for overseas education",
            "Bank-specific schemes for meritorious students"
          ]
        }
      },
      {
        title: "Business Loan Guide",
        description: "Funding options for business growth",
        icon: Briefcase,
        color: "from-purple-500 to-purple-600",
        topics: ["Working Capital", "Equipment Finance", "Cash Flow", "Collateral"],
        detailedContent: {
          overview: "Business loans provide working capital and term loans for starting or expanding businesses. Various government schemes support MSMEs and startups.",
          eligibility: [
            "Business vintage: Minimum 1-3 years",
            "Annual turnover: Varies by loan type and bank",
            "Credit score: 700+ for proprietor/partners",
            "Valid business registration and licenses",
            "Positive cash flow and profitability"
          ],
          documents: [
            "Business registration documents",
            "Financial statements (2-3 years)",
            "Income Tax Returns (business and personal)",
            "Bank statements (12-18 months)",
            "Trade license and other permits",
            "Project report (for term loans)",
            "Collateral documents (if applicable)"
          ],
          interestRates: {
            range: "9% - 20% per annum",
            factors: [
              "Business type and industry risk",
              "Financial health and cash flow",
              "Collateral security offered",
              "Loan amount and tenure",
              "Credit history of business and promoters"
            ]
          },
          tenure: "1-10 years (varies by loan type)",
          loanAmount: "₹50,000 to ₹50 crores (based on requirement)",
          types: [
            "Working Capital Loans",
            "Term Loans for machinery/equipment",
            "Cash Credit facilities",
            "Letter of Credit facilities",
            "MSME loans under government schemes"
          ],
          tips: [
            "Maintain proper financial records",
            "Separate business and personal finances",
            "Build strong credit history",
            "Explore government subsidy schemes",
            "Consider collateral-free options for small amounts",
            "Plan cash flow for timely repayments"
          ],
          charges: [
            "Processing fees: 0.5-2% of loan amount",
            "Administrative charges: ₹5,000 - ₹25,000",
            "Inspection and valuation: ₹5,000 - ₹15,000",
            "Prepayment charges: 2-4% of outstanding",
            "Penal charges: 2-3% per month on overdues"
          ]
        }
      },
      {
        title: "Gold Loan Guide",
        description: "Quick loans against gold ornaments",
        icon: Coins,
        color: "from-amber-500 to-amber-600",
        topics: ["Gold Purity", "Quick Processing", "LTV Ratio", "Storage Safety"],
        detailedContent: {
          overview: "Gold loans are secured loans where gold ornaments serve as collateral. They offer quick disbursement with minimal documentation and competitive interest rates.",
          eligibility: [
            "Age: 18-75 years",
            "Indian citizen or NRI",
            "Own gold ornaments of 18-22 carat purity",
            "Minimum loan amount: ₹5,000-10,000",
            "No income proof required"
          ],
          documents: [
            "Identity proof (Aadhaar, PAN, Passport)",
            "Address proof (any government ID)",
            "Passport size photographs",
            "Gold ornaments for pledging",
            "Purchase receipt (if available)"
          ],
          interestRates: {
            range: "7% - 17% per annum",
            factors: [
              "Gold purity and market value",
              "Loan amount and tenure",
              "Lender type (banks vs NBFCs)",
              "Applicant's relationship with lender",
              "Market gold rates and volatility"
            ]
          },
          tenure: "3 months - 3 years",
          loanAmount: "Up to 75-90% of gold value",
          features: [
            "Quick disbursement (within hours)",
            "Minimal documentation",
            "No credit score requirement",
            "Flexible repayment options",
            "Safe storage of gold",
            "Part payment facility"
          ],
          tips: [
            "Check current gold rates before applying",
            "Compare loan-to-value ratios",
            "Understand storage and insurance policies",
            "Keep gold ornaments in good condition",
            "Consider interest-only EMI options",
            "Repay early to reduce interest burden"
          ],
          charges: [
            "Processing fees: ₹500 - ₹5,000",
            "Administrative charges: ₹200 - ₹1,000",
            "Storage and insurance: ₹100-500 per month",
            "Valuation charges: ₹250 - ₹500",
            "Late payment penalty: 2-3% per month"
          ],
          risks: [
            "Gold price fluctuation risk",
            "Margin call if gold value drops",
            "Auction risk in case of default",
            "Limited insurance coverage",
            "Interest accumulation over time"
          ]
        }
      }
    ]

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Loan Guides</h1>
              <p className="text-gray-600">Comprehensive guides to help you make informed decisions</p>
            </div>
            <button
              onClick={() => setCurrentView('main')}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {guides.map((guide, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-6">
                <div className={`p-4 bg-gradient-to-r ${guide.color} rounded-xl mb-4 text-center`}>
                  <guide.icon className="w-8 h-8 text-white mx-auto" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">{guide.title}</h3>
                <p className="text-gray-600 mb-4">{guide.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-2">What you'll learn:</div>
                  {guide.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">{topic}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setSelectedGuide(guide.title)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Read Guide
                </button>
              </div>
            ))}
          </div>

          {/* Detailed Guide View */}
          {selectedGuide && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedGuide}</h2>
                  <button
                    onClick={() => setSelectedGuide(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                
                {(() => {
                  const guide = guides.find(g => g.title === selectedGuide)
                  if (!guide?.detailedContent) return null
                  
                  return (
                    <div className="p-6 space-y-8">
                      {/* Overview */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Overview</h3>
                        <p className="text-gray-600 leading-relaxed">{guide.detailedContent.overview}</p>
                      </div>

                      {/* Eligibility */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Eligibility Criteria</h3>
                        <ul className="space-y-2">
                          {guide.detailedContent.eligibility.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Documents Required */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Documents Required</h3>
                        <ul className="space-y-2">
                          {guide.detailedContent.documents.map((doc, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <FileText className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Interest Rates */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Interest Rates</h3>
                        <div className="bg-blue-50 p-4 rounded-lg mb-3">
                          <div className="text-lg font-semibold text-blue-800">{guide.detailedContent.interestRates.range}</div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Factors affecting interest rates:</div>
                        <ul className="space-y-1">
                          {guide.detailedContent.interestRates.factors.map((factor, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Percent className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tenure & Amount */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">Loan Tenure</h4>
                          <p className="text-green-700">{guide.detailedContent.tenure}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-purple-800 mb-2">Loan Amount</h4>
                          <p className="text-purple-700">{guide.detailedContent.loanAmount}</p>
                        </div>
                      </div>

                      {/* Tips */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Expert Tips</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {guide.detailedContent.tips.map((tip, idx) => (
                            <div key={idx} className="bg-yellow-50 p-3 rounded-lg flex items-start gap-2">
                              <Target className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-sm">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Charges */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Charges & Fees</h3>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <ul className="space-y-2">
                            {guide.detailedContent.charges.map((charge, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <DollarSign className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 text-sm">{charge}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Special sections for specific loan types */}
                      {guide.detailedContent.schemes && (
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-3">Government Schemes</h3>
                          <ul className="space-y-2">
                            {guide.detailedContent.schemes.map((scheme, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Award className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{scheme}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {guide.detailedContent.types && (
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-3">Loan Types</h3>
                          <ul className="space-y-2">
                            {guide.detailedContent.types.map((type, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Briefcase className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{type}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {guide.detailedContent.features && (
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Features</h3>
                          <ul className="space-y-2">
                            {guide.detailedContent.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {guide.detailedContent.risks && (
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-3">Risks to Consider</h3>
                          <ul className="space-y-2">
                            {guide.detailedContent.risks.map((risk, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="bg-gradient-to-r from-blue-500 to-green-600 p-6 rounded-xl text-white text-center">
                        <h4 className="text-xl font-bold mb-2">Ready to Apply?</h4>
                        <p className="mb-4">Use our EMI calculator to plan your loan and compare offers</p>
                        <button
                          onClick={() => {
                            setSelectedGuide(null)
                            setCurrentView('main')
                          }}
                          className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                          Calculate EMI Now
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Financial Tips */}
          <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Quick Financial Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Check Your Credit Score</h4>
                <p className="text-sm text-gray-600">A good credit score (750+) can help you get better interest rates</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                  <Calculator className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Compare Multiple Lenders</h4>
                <p className="text-sm text-gray-600">Don't settle for the first offer. Shop around for the best rates</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                  <Percent className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Consider Prepayments</h4>
                <p className="text-sm text-gray-600">Making extra payments can significantly reduce your total interest</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
