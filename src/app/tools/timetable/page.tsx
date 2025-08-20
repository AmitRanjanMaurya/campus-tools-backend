'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Download, Trash2, Edit3, Clock, MapPin, User, Book, X, Save, AlertTriangle } from 'lucide-react'

interface ClassItem {
  id: string
  className: string
  subject: string
  location: string
  instructor: string
  day: string
  startTime: string
  endTime: string
  color: string
}

export default function TimetableMaker() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null)
  const [conflicts, setConflicts] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const timetableRef = useRef<HTMLDivElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    className: '',
    subject: '',
    location: '',
    instructor: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    color: '#3B82F6'
  })

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
  ]

  // Load data from localStorage on mount
  useEffect(() => {
    const savedClasses = localStorage.getItem('timetable-classes')
    if (savedClasses) {
      setClasses(JSON.parse(savedClasses))
    }
  }, [])

  const checkConflicts = useCallback(() => {
    const conflictIds: string[] = []
    for (let i = 0; i < classes.length; i++) {
      for (let j = i + 1; j < classes.length; j++) {
        const class1 = classes[i]
        const class2 = classes[j]
        if (class1.day === class2.day) {
          const start1 = parseInt(class1.startTime.replace(':', ''))
          const end1 = parseInt(class1.endTime.replace(':', ''))
          const start2 = parseInt(class2.startTime.replace(':', ''))
          const end2 = parseInt(class2.endTime.replace(':', ''))
          
          if ((start1 < end2 && end1 > start2)) {
            conflictIds.push(class1.id, class2.id)
          }
        }
      }
    }
    setConflicts(Array.from(new Set(conflictIds)))
  }, [classes])

  // Save to localStorage whenever classes change
  useEffect(() => {
    localStorage.setItem('timetable-classes', JSON.stringify(classes))
    checkConflicts()
  }, [classes, checkConflicts])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingClass) {
      setClasses(classes.map(c => c.id === editingClass.id ? 
        { ...formData, id: editingClass.id } : c
      ))
    } else {
      const newClass: ClassItem = {
        ...formData,
        id: Date.now().toString()
      }
      setClasses([...classes, newClass])
    }
    
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      className: '',
      subject: '',
      location: '',
      instructor: '',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      color: '#3B82F6'
    })
    setIsModalOpen(false)
    setEditingClass(null)
  }

  const handleEdit = (classItem: ClassItem) => {
    setFormData(classItem)
    setEditingClass(classItem)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setClasses(classes.filter(c => c.id !== id))
  }

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all classes?')) {
      setClasses([])
    }
  }

  const getClassesForSlot = (day: string, time: string) => {
    return classes.filter(c => {
      const classStart = parseInt(c.startTime.replace(':', ''))
      const classEnd = parseInt(c.endTime.replace(':', ''))
      const slotTime = parseInt(time.replace(':', ''))
      return c.day === day && classStart <= slotTime && classEnd > slotTime
    })
  }

  const downloadAsPDF = async () => {
    if (!timetableRef.current) {
      alert('No timetable to export!')
      return
    }
    
    if (classes.length === 0) {
      alert('Please add some classes first before exporting!')
      return
    }
    
    setIsExporting(true)
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default
      
      // Add a small delay to ensure the DOM is updated
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const canvas = await html2canvas(timetableRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: timetableRef.current.scrollWidth,
        height: timetableRef.current.scrollHeight
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('l', 'mm', 'a4') // landscape orientation
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`timetable-${new Date().toISOString().split('T')[0]}.pdf`)
      
      alert('PDF downloaded successfully!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadAsImage = async () => {
    if (!timetableRef.current) {
      alert('No timetable to export!')
      return
    }
    
    if (classes.length === 0) {
      alert('Please add some classes first before exporting!')
      return
    }
    
    setIsExporting(true)
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default
      
      // Add a small delay to ensure the DOM is updated
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const canvas = await html2canvas(timetableRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: timetableRef.current.scrollWidth,
        height: timetableRef.current.scrollHeight
      })
      
      const link = document.createElement('a')
      link.download = `timetable-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      alert('Image downloaded successfully!')
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Error generating image. Please try again.')
    } finally {
      setIsExporting(false)
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
            <h1 className="text-2xl font-bold text-gray-800">Timetable Maker</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Action Bar */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </button>
            
            <button
              onClick={downloadAsPDF}
              disabled={isExporting}
              className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-all duration-200 shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Generating...' : 'Download PDF'}
            </button>
            
            <button
              onClick={downloadAsImage}
              disabled={isExporting}
              className="inline-flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-lg transition-all duration-200 shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Generating...' : 'Save as Image'}
            </button>
            
            <button
              onClick={clearAll}
              className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 shadow-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </button>
          </div>
          
          {conflicts.length > 0 && (
            <div className="flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {conflicts.length} schedule conflicts detected
            </div>
          )}
        </div>

        {/* Timetable Grid */}
        <div 
          ref={timetableRef}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 text-center">My Weekly Timetable</h2>
            <p className="text-gray-600 text-center mt-1">Academic Schedule</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left font-semibold text-gray-800 min-w-[100px]">Time</th>
                  {days.map(day => (
                    <th key={day} className="p-4 text-center font-semibold text-gray-800 min-w-[140px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time, timeIndex) => (
                  <tr key={time} className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">
                      {time} - {timeSlots[timeIndex + 1] || '19:00'}
                    </td>
                    {days.map(day => {
                      const dayClasses = getClassesForSlot(day, time)
                      return (
                        <td key={`${day}-${time}`} className="p-2 border-r border-gray-100 h-20">
                          {dayClasses.map(classItem => (
                            <div
                              key={classItem.id}
                              className={`p-2 rounded-lg text-xs font-medium text-white mb-1 cursor-pointer group relative print:cursor-default ${
                                conflicts.includes(classItem.id) ? 'ring-2 ring-red-400' : ''
                              }`}
                              style={{ backgroundColor: classItem.color }}
                              onClick={() => !isExporting && handleEdit(classItem)}
                            >
                              <div className="font-semibold truncate">{classItem.className}</div>
                              <div className="text-xs opacity-90 truncate">{classItem.subject}</div>
                              <div className="text-xs opacity-75 truncate">{classItem.location}</div>
                              {classItem.instructor && (
                                <div className="text-xs opacity-75 truncate">{classItem.instructor}</div>
                              )}
                              
                              {/* Hover Actions - Hidden during export */}
                              {!isExporting && (
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDelete(classItem.id)
                                    }}
                                    className="p-1 bg-red-500 hover:bg-red-600 rounded text-white"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer for export */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Generated on {new Date().toISOString().split('T')[0]} | Total Classes: {classes.length} | 
              Weekly Hours: {classes.reduce((total, c) => {
                const start = parseInt(c.startTime.replace(':', ''))
                const end = parseInt(c.endTime.replace(':', ''))
                return total + (Math.floor(end / 100) - Math.floor(start / 100))
              }, 0)}h
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center">
              <Book className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{classes.length}</div>
                <div className="text-gray-600">Total Classes</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {classes.reduce((total, c) => {
                    const start = parseInt(c.startTime.replace(':', ''))
                    const end = parseInt(c.endTime.replace(':', ''))
                    return total + (Math.floor(end / 100) - Math.floor(start / 100))
                  }, 0)}h
                </div>
                <div className="text-gray-600">Weekly Hours</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{conflicts.length}</div>
                <div className="text-gray-600">Conflicts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingClass ? 'Edit Class' : 'Add New Class'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Book className="h-4 w-4 inline mr-1" />
                    Class Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.className}
                    onChange={(e) => setFormData({...formData, className: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Physics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject/Code
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., PHY101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Room 204"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Dr. Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Start Time
                    </label>
                    <select
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <select
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {timeSlots.slice(1).map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                      <option value="19:00">19:00</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({...formData, color})}
                        className={`w-8 h-8 rounded-lg border-2 ${
                          formData.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    {editingClass ? 'Update Class' : 'Add Class'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .print-optimized {
            background: white !important;
            box-shadow: none !important;
          }
          
          .print-table {
            border-collapse: collapse !important;
          }
          
          .print-table th,
          .print-table td {
            border: 1px solid #000 !important;
            padding: 8px !important;
          }
        }
        
        @page {
          margin: 1cm;
          size: A4 landscape;
        }
      `}</style>
    </div>
  )
}
