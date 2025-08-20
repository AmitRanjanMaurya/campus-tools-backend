'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRightLeft, Ruler, Scale, Square, Box, Clock, Thermometer, Activity, Database, RotateCcw } from 'lucide-react'

// Academic Categories Configuration
const academicCategories = {
  'Basic Units': {
    name: 'Basic Units',
    description: 'Fundamental measurement units for everyday use',
    color: 'bg-blue-500',
    units: ['length', 'weight', 'area', 'volume', 'time', 'angle']
  }
}

// Unit Categories with comprehensive conversion data
const unitCategories = {
  length: {
    name: 'Length',
    description: 'Convert between different length measurements',
    icon: Ruler,
    formula: '1 meter = 100 centimeters = 1000 millimeters',
    units: {
      meter: { name: 'Meter (m)', multiplier: 1 },
      kilometer: { name: 'Kilometer (km)', multiplier: 1000 },
      centimeter: { name: 'Centimeter (cm)', multiplier: 0.01 },
      millimeter: { name: 'Millimeter (mm)', multiplier: 0.001 },
      inch: { name: 'Inch (in)', multiplier: 0.0254 },
      foot: { name: 'Foot (ft)', multiplier: 0.3048 },
      yard: { name: 'Yard (yd)', multiplier: 0.9144 },
      mile: { name: 'Mile (mi)', multiplier: 1609.344 }
    }
  },
  weight: {
    name: 'Weight/Mass',
    description: 'Convert between different weight and mass units',
    icon: Scale,
    formula: '1 kilogram = 1000 grams = 2.20462 pounds',
    units: {
      kilogram: { name: 'Kilogram (kg)', multiplier: 1 },
      gram: { name: 'Gram (g)', multiplier: 0.001 },
      pound: { name: 'Pound (lb)', multiplier: 0.453592 },
      ounce: { name: 'Ounce (oz)', multiplier: 0.0283495 },
      ton: { name: 'Metric Ton (t)', multiplier: 1000 }
    }
  },
  area: {
    name: 'Area',
    description: 'Convert between different area measurements',
    icon: Square,
    formula: '1 square meter = 10,000 square centimeters',
    units: {
      squareMeter: { name: 'Square Meter (m²)', multiplier: 1 },
      squareKilometer: { name: 'Square Kilometer (km²)', multiplier: 1000000 },
      squareCentimeter: { name: 'Square Centimeter (cm²)', multiplier: 0.0001 },
      squareInch: { name: 'Square Inch (in²)', multiplier: 0.00064516 },
      squareFoot: { name: 'Square Foot (ft²)', multiplier: 0.092903 },
      acre: { name: 'Acre (ac)', multiplier: 4046.86 }
    }
  },
  volume: {
    name: 'Volume',
    description: 'Convert between different volume measurements',
    icon: Box,
    formula: '1 liter = 1000 milliliters = 0.001 cubic meters',
    units: {
      liter: { name: 'Liter (L)', multiplier: 1 },
      milliliter: { name: 'Milliliter (mL)', multiplier: 0.001 },
      cubicMeter: { name: 'Cubic Meter (m³)', multiplier: 1000 },
      gallon: { name: 'US Gallon (gal)', multiplier: 3.78541 },
      quart: { name: 'US Quart (qt)', multiplier: 0.946353 }
    }
  },
  time: {
    name: 'Time',
    description: 'Convert between different time units',
    icon: Clock,
    formula: '1 hour = 60 minutes = 3600 seconds',
    units: {
      second: { name: 'Second (s)', multiplier: 1 },
      minute: { name: 'Minute (min)', multiplier: 60 },
      hour: { name: 'Hour (hr)', multiplier: 3600 },
      day: { name: 'Day (d)', multiplier: 86400 },
      week: { name: 'Week (wk)', multiplier: 604800 },
      month: { name: 'Month (mo)', multiplier: 2629746 },
      year: { name: 'Year (yr)', multiplier: 31556952 }
    }
  },
  temperature: {
    name: 'Temperature',
    description: 'Convert between Celsius, Fahrenheit, and Kelvin',
    icon: Thermometer,
    formula: 'C = (F-32)×5/9, K = C+273.15',
    units: {
      celsius: { name: 'Celsius (°C)', multiplier: 1, offset: 0 },
      fahrenheit: { name: 'Fahrenheit (°F)', multiplier: 5/9, offset: -32 },
      kelvin: { name: 'Kelvin (K)', multiplier: 1, offset: -273.15 }
    }
  },
  speed: {
    name: 'Speed/Velocity',
    description: 'Convert between different speed units',
    icon: Activity,
    formula: '1 m/s = 3.6 km/h = 2.237 mph',
    units: {
      meterPerSecond: { name: 'Meter/second (m/s)', multiplier: 1 },
      kilometerPerHour: { name: 'Kilometer/hour (km/h)', multiplier: 0.277778 },
      milePerHour: { name: 'Mile/hour (mph)', multiplier: 0.44704 },
      footPerSecond: { name: 'Foot/second (ft/s)', multiplier: 0.3048 },
      knot: { name: 'Knot (kn)', multiplier: 0.514444 }
    }
  },
  data: {
    name: 'Digital Storage',
    description: 'Convert between bytes, KB, MB, GB, and TB',
    icon: Database,
    formula: '1 KB = 1024 bytes, 1 MB = 1024 KB',
    units: {
      byte: { name: 'Byte (B)', multiplier: 1 },
      kilobyte: { name: 'Kilobyte (KB)', multiplier: 1024 },
      megabyte: { name: 'Megabyte (MB)', multiplier: 1048576 },
      gigabyte: { name: 'Gigabyte (GB)', multiplier: 1073741824 },
      terabyte: { name: 'Terabyte (TB)', multiplier: 1099511627776 }
    }
  },
  angle: {
    name: 'Angle',
    description: 'Convert between degrees, radians, and gradians',
    icon: RotateCcw,
    formula: '180° = π radians = 200 gradians',
    units: {
      degree: { name: 'Degree (°)', multiplier: 1 },
      radian: { name: 'Radian (rad)', multiplier: 57.2958 },
      gradian: { name: 'Gradian (gon)', multiplier: 0.9 }
    }
  }
}

const UnitConverter = () => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedAcademicField, setSelectedAcademicField] = useState('All Fields')
  const [fromUnit, setFromUnit] = useState('')
  const [toUnit, setToUnit] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState('')
  const [currentStep, setCurrentStep] = useState<'field' | 'category' | 'converter'>('field')

  const convertValue = (value: number, from: string, to: string, category: string) => {
    if (!value || isNaN(value)) return 0

    const categoryData = unitCategories[category as keyof typeof unitCategories]
    if (!categoryData) return 0

    const units = categoryData.units
    const fromUnit = units[from as keyof typeof units] as any
    const toUnit = units[to as keyof typeof units] as any

    if (!fromUnit || !toUnit) return 0

    // Special handling for temperature
    if (category === 'temperature') {
      let celsius = value
      
      // Convert from input to Celsius
      if (from === 'fahrenheit') {
        celsius = (value - 32) * 5/9
      } else if (from === 'kelvin') {
        celsius = value - 273.15
      }
      
      // Convert from Celsius to target
      if (to === 'fahrenheit') {
        return celsius * 9/5 + 32
      } else if (to === 'kelvin') {
        return celsius + 273.15
      } else {
        return celsius
      }
    }

    // Standard conversion using multipliers
    const baseValue = value * fromUnit.multiplier
    return baseValue / toUnit.multiplier
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/tools" className="flex items-center text-gray-600 hover:text-blue-600 mr-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Tools
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Universal Unit Converter
          </h1>
          <p className="text-lg text-gray-800">
            Step-by-step unit conversion - Choose field → Select category → Convert units
          </p>
        </div>

        <div className="card">
          {/* Step 1: Academic Field Selection */}
          {currentStep === 'field' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Choose Academic Field
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* All Fields Option */}
                <button
                  onClick={() => {
                    setSelectedAcademicField('All Fields')
                    setCurrentStep('category')
                  }}
                  className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className="flex items-center mb-3">
                    <span className="w-4 h-4 rounded-full bg-gray-500 mr-3"></span>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">All Fields</h4>
                  </div>
                  <p className="text-sm text-gray-800 mb-2">View all available categories</p>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">9 categories</span>
                </button>

                {/* Academic Field Options */}
                {Object.entries(academicCategories).map(([fieldKey, field]) => (
                  <button
                    key={fieldKey}
                    onClick={() => {
                      setSelectedAcademicField(fieldKey)
                      setCurrentStep('category')
                    }}
                    className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center mb-3">
                      <span className={`w-4 h-4 rounded-full ${field.color} mr-3`}></span>
                      <h4 className="font-semibold text-black group-hover:text-blue-600">{field.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{field.description}</p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{field.units.length} categories</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Category Selection */}
          {currentStep === 'category' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentStep('field')}
                  className="flex items-center text-gray-600 hover:text-blue-600"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Fields
                </button>
                <h3 className="text-xl font-semibold text-black">
                  {selectedAcademicField === 'All Fields' ? 'All Categories' : academicCategories[selectedAcademicField as keyof typeof academicCategories]?.name}
                </h3>
                <div></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(selectedAcademicField === 'All Fields' 
                  ? Object.keys(unitCategories)
                  : academicCategories[selectedAcademicField as keyof typeof academicCategories]?.units || []
                ).map((categoryKey) => {
                  const category = unitCategories[categoryKey as keyof typeof unitCategories]
                  if (!category) return null
                  
                  return (
                    <button
                      key={categoryKey}
                      onClick={() => {
                        setSelectedCategory(categoryKey)
                        const unitKeys = Object.keys(category.units)
                        setFromUnit(unitKeys[0] || '')
                        setToUnit(unitKeys[1] || unitKeys[0] || '')
                        setInputValue('1')
                        setCurrentStep('converter')
                      }}
                      className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center mb-3">
                        <category.icon className="h-6 w-6 text-blue-600 mr-3" />
                        <h4 className="font-semibold text-black group-hover:text-blue-600">{category.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {Object.keys(category.units).length} units
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Unit Converter */}
          {currentStep === 'converter' && selectedCategory && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentStep('category')}
                  className="flex items-center text-gray-600 hover:text-blue-600"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Categories
                </button>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-black">
                    {unitCategories[selectedCategory as keyof typeof unitCategories]?.name}
                  </h3>
                  <p className="text-sm text-gray-600">{unitCategories[selectedCategory as keyof typeof unitCategories]?.description}</p>
                </div>
                <div></div>
              </div>

              {/* Converter Interface */}
              <div className="space-y-6">
                {/* Input Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">From</label>
                    <select
                      value={fromUnit}
                      onChange={(e) => {
                        setFromUnit(e.target.value)
                        if (inputValue && toUnit && selectedCategory) {
                          const numValue = parseFloat(inputValue)
                          if (!isNaN(numValue)) {
                            const converted = convertValue(numValue, e.target.value, toUnit, selectedCategory)
                            setResult(converted.toString())
                          }
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-black"
                    >
                      {Object.entries(unitCategories[selectedCategory as keyof typeof unitCategories]?.units || {}).map(([key, unit]) => (
                        <option key={key} value={key}>{unit.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">To</label>
                    <select
                      value={toUnit}
                      onChange={(e) => {
                        setToUnit(e.target.value)
                        if (inputValue && fromUnit && selectedCategory) {
                          const numValue = parseFloat(inputValue)
                          if (!isNaN(numValue)) {
                            const converted = convertValue(numValue, fromUnit, e.target.value, selectedCategory)
                            setResult(converted.toString())
                          }
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-black"
                    >
                      {Object.entries(unitCategories[selectedCategory as keyof typeof unitCategories]?.units || {}).map(([key, unit]) => (
                        <option key={key} value={key}>{unit.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Value Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Enter Value</label>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value)
                        const numValue = parseFloat(e.target.value)
                        if (!isNaN(numValue) && fromUnit && toUnit && selectedCategory) {
                          const converted = convertValue(numValue, fromUnit, toUnit, selectedCategory)
                          setResult(converted.toString())
                        } else {
                          setResult('')
                        }
                      }}
                      placeholder="Enter a number"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Result</label>
                    <div className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-lg font-semibold text-blue-800">
                      {result || '0'}
                    </div>
                  </div>
                </div>

                {/* Swap button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      const temp = fromUnit
                      setFromUnit(toUnit)
                      setToUnit(temp)
                      if (inputValue) {
                        const numValue = parseFloat(inputValue)
                        if (!isNaN(numValue)) {
                          const converted = convertValue(numValue, toUnit, temp, selectedCategory)
                          setResult(converted.toString())
                        }
                      }
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Swap Units
                  </button>
                </div>

                {/* Quick Reference */}
                {unitCategories[selectedCategory as keyof typeof unitCategories]?.formula && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-black mb-2">Quick Reference</h4>
                    <p className="text-sm text-gray-700">
                      {unitCategories[selectedCategory as keyof typeof unitCategories]?.formula}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="card mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-black mb-2">Choose Field</h4>
              <p className="text-sm text-gray-600">Select an academic field or view all categories</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-black mb-2">Pick Category</h4>
              <p className="text-sm text-gray-600">Choose the type of measurement to convert</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-black mb-2">Convert</h4>
              <p className="text-sm text-gray-600">Enter your value and see instant results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnitConverter
