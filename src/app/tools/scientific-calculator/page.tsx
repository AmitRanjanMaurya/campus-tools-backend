'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronRight, Calculator, Delete, RotateCcw } from 'lucide-react'

export default function ScientificCalculator() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<string>('')
  const [operation, setOperation] = useState<string>('')
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [isDegMode, setIsDegMode] = useState(true)
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    basic: true,
    trigonometry: false,
    logarithmic: false,
    power: false,
    constants: false
  })

  // Calculator functions organized by category
  const calculatorFunctions = {
    basic: {
      name: 'Basic Operations',
      color: 'blue',
      functions: [
        { label: '+', value: '+', type: 'operator' },
        { label: '−', value: '-', type: 'operator' },
        { label: '×', value: '*', type: 'operator' },
        { label: '÷', value: '/', type: 'operator' },
        { label: '%', value: '%', type: 'operator' },
        { label: '(', value: '(', type: 'bracket' },
        { label: ')', value: ')', type: 'bracket' },
        { label: '±', value: '±', type: 'function' }
      ]
    },
    trigonometry: {
      name: 'Trigonometry',
      color: 'purple',
      functions: [
        { label: 'sin', value: 'sin(', type: 'function' },
        { label: 'cos', value: 'cos(', type: 'function' },
        { label: 'tan', value: 'tan(', type: 'function' },
        { label: 'asin', value: 'asin(', type: 'function' },
        { label: 'acos', value: 'acos(', type: 'function' },
        { label: 'atan', value: 'atan(', type: 'function' }
      ]
    },
    logarithmic: {
      name: 'Logarithmic & Exponential',
      color: 'green',
      functions: [
        { label: 'ln', value: 'ln(', type: 'function' },
        { label: 'log', value: 'log(', type: 'function' },
        { label: 'e^x', value: 'exp(', type: 'function' },
        { label: '10^x', value: 'pow(10,', type: 'function' },
        { label: 'e', value: 'e', type: 'constant' },
        { label: '2^x', value: 'pow(2,', type: 'function' }
      ]
    },
    power: {
      name: 'Power & Roots',
      color: 'orange',
      functions: [
        { label: 'x²', value: '^2', type: 'function' },
        { label: 'x³', value: '^3', type: 'function' },
        { label: 'x^y', value: '^', type: 'operator' },
        { label: '√', value: 'sqrt(', type: 'function' },
        { label: '∛', value: 'cbrt(', type: 'function' },
        { label: '1/x', value: '1/', type: 'function' }
      ]
    },
    constants: {
      name: 'Constants',
      color: 'indigo',
      functions: [
        { label: 'π', value: 'pi', type: 'constant' },
        { label: 'e', value: 'e', type: 'constant' },
        { label: '∞', value: 'Infinity', type: 'constant' }
      ]
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(String(num))
      setWaitingForOperand(false)
    } else {
      setDisplay(display === '0' ? String(num) : display + num)
    }
  }

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === '') {
      setPreviousValue(String(inputValue))
    } else if (operation) {
      const currentValue = previousValue || '0'
      const newValue = calculate(currentValue, display, operation)

      setDisplay(String(newValue))
      setPreviousValue(String(newValue))
    }

    setWaitingForOperand(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: string, secondValue: string, operation: string) => {
    const prev = parseFloat(firstValue)
    const next = parseFloat(secondValue)

    switch (operation) {
      case '+': return prev + next
      case '-': return prev - next
      case '*': return prev * next
      case '/': return prev / next
      case '%': return prev % next
      case '^': return Math.pow(prev, next)
      default: return next
    }
  }

  const performCalculation = () => {
    if (previousValue !== '' && operation && !waitingForOperand) {
      const newValue = calculate(previousValue, display, operation)
      setDisplay(String(newValue))
      setPreviousValue('')
      setOperation('')
      setWaitingForOperand(true)
    }
  }

  const handleFunctionClick = (func: any) => {
    switch (func.type) {
      case 'operator':
        inputOperation(func.value)
        break
      case 'function':
        if (func.value === '±') {
          setDisplay(String(parseFloat(display) * -1))
        } else if (func.value === '^2') {
          setDisplay(String(Math.pow(parseFloat(display), 2)))
        } else if (func.value === '^3') {
          setDisplay(String(Math.pow(parseFloat(display), 3)))
        } else if (func.value.includes('sqrt')) {
          setDisplay(String(Math.sqrt(parseFloat(display))))
        } else if (func.value.includes('cbrt')) {
          setDisplay(String(Math.cbrt(parseFloat(display))))
        } else if (func.value.includes('sin')) {
          const val = isDegMode ? parseFloat(display) * Math.PI / 180 : parseFloat(display)
          setDisplay(String(Math.sin(val)))
        } else if (func.value.includes('cos')) {
          const val = isDegMode ? parseFloat(display) * Math.PI / 180 : parseFloat(display)
          setDisplay(String(Math.cos(val)))
        } else if (func.value.includes('tan')) {
          const val = isDegMode ? parseFloat(display) * Math.PI / 180 : parseFloat(display)
          setDisplay(String(Math.tan(val)))
        } else if (func.value.includes('ln')) {
          setDisplay(String(Math.log(parseFloat(display))))
        } else if (func.value.includes('log')) {
          setDisplay(String(Math.log10(parseFloat(display))))
        } else if (func.value.includes('exp')) {
          setDisplay(String(Math.exp(parseFloat(display))))
        } else {
          setDisplay(display === '0' ? func.value : display + func.value)
        }
        break
      case 'constant':
        const constValue = func.value === 'pi' ? Math.PI : func.value === 'e' ? Math.E : func.value
        setDisplay(display === '0' ? String(constValue) : display + constValue)
        break
      case 'bracket':
        setDisplay(display === '0' ? func.value : display + func.value)
        break
    }
  }

  const clearDisplay = () => {
    setDisplay('0')
    setPreviousValue('')
    setOperation('')
    setWaitingForOperand(false)
  }

  const deleteLast = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay('0')
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f1f9fe' }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/tools" 
                className="inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tools
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Scientific Calculator</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Calculator Display */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 p-6">
              
              {/* Display Screen */}
              <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-300">
                <div className="text-right">
                  <div className="text-sm text-gray-400 h-6">
                    {previousValue && operation && `${previousValue} ${operation}`}
                  </div>
                  <div className="text-4xl font-mono text-white font-light break-all">
                    {display}
                  </div>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setIsDegMode(!isDegMode)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    isDegMode 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isDegMode ? 'DEG' : 'RAD'}
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={deleteLast}
                    className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all duration-200"
                  >
                    <Delete className="h-5 w-5" />
                  </button>
                  <button
                    onClick={clearDisplay}
                    className="p-3 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg transition-all duration-200"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
                  <button
                    key={btn}
                    onClick={() => {
                      if (btn === '=') {
                        performCalculation()
                      } else if (['+', '-', '*', '/'].includes(btn)) {
                        inputOperation(btn)
                      } else {
                        inputNumber(btn)
                      }
                    }}
                    className={`p-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${
                      btn === '=' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg col-span-1' 
                        : ['+', '-', '*', '/'].includes(btn)
                        ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
                    }`}
                  >
                    {btn === '*' ? '×' : btn === '/' ? '÷' : btn === '-' ? '−' : btn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Function Panels */}
          <div className="space-y-4">
            {Object.entries(calculatorFunctions).map(([sectionKey, section]) => (
              <div key={sectionKey} className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="w-full p-4 text-left transition-all duration-300 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {expandedSections[sectionKey] ? (
                        <ChevronDown className="h-5 w-5 mr-3 text-gray-700" />
                      ) : (
                        <ChevronRight className="h-5 w-5 mr-3 text-gray-500" />
                      )}
                      <Calculator className={`h-5 w-5 mr-3 text-${section.color}-500`} />
                      <span className="font-semibold text-gray-800">{section.name}</span>
                    </div>
                  </div>
                </button>
                
                {expandedSections[sectionKey] && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-2">
                      {section.functions.map((func: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleFunctionClick(func)}
                          className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 bg-${section.color}-50 text-${section.color}-700 hover:bg-${section.color}-100 border border-${section.color}-200`}
                        >
                          {func.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-gray-200 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Basic Operations</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use number pad for input</li>
                <li>• Expand sections to access functions</li>
                <li>• Press = to calculate</li>
                <li>• Use Clear (C) to reset</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Advanced Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Toggle DEG/RAD for trigonometry</li>
                <li>• Access scientific functions via panels</li>
                <li>• Mobile-optimized layout</li>
                <li>• Real-time calculations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
