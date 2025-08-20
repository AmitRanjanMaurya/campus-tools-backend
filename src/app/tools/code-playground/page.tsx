'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Save, 
  Download, 
  Share2, 
  Copy, 
  Trash2, 
  Plus, 
  Folder, 
  File, 
  Settings, 
  Terminal, 
  Code, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Moon, 
  Sun, 
  Palette, 
  Upload, 
  FileText, 
  Github, 
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  Bug,
  Zap,
  BookOpen,
  Lightbulb,
  Award,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react'

// Types
interface CodeFile {
  id: string
  name: string
  language: string
  content: string
  isActive: boolean
}

interface Project {
  id: string
  name: string
  description: string
  files: CodeFile[]
  createdAt: string
  lastModified: string
  isPublic: boolean
  tags: string[]
  language: string
}

interface Template {
  id: string
  name: string
  description: string
  language: string
  files: Omit<CodeFile, 'id' | 'isActive'>[]
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface OutputResult {
  output: string
  error: string
  executionTime: number
  status: 'success' | 'error' | 'timeout'
}

export default function CodePlayground() {
  // State management
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [activeFileId, setActiveFileId] = useState<string>('')
  const [currentView, setCurrentView] = useState<'editor' | 'templates' | 'projects' | 'settings'>('editor')
  const [language, setLanguage] = useState('javascript')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [fontSize, setFontSize] = useState(14)
  const [showOutput, setShowOutput] = useState(true)
  const [showConsole, setShowConsole] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [outputResult, setOutputResult] = useState<OutputResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLanguage, setFilterLanguage] = useState('')
  const [loading, setLoading] = useState(false)

  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Supported languages
  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
    { value: 'json', label: 'JSON', icon: '📄' },
    { value: 'markdown', label: 'Markdown', icon: '📝' },
    { value: 'sql', label: 'SQL', icon: '🗄️' }
  ]

  // Templates
  const templates: Template[] = [
    {
      id: '1',
      name: 'Hello World JavaScript',
      description: 'Basic JavaScript starter template',
      language: 'javascript',
      files: [
        {
          name: 'index.js',
          language: 'javascript',
          content: `// Hello World in JavaScript
console.log("Hello, World!");

// Basic function example
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("Student"));

// Simple array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);`
        }
      ],
      tags: ['beginner', 'javascript', 'basics'],
      difficulty: 'beginner'
    },
    {
      id: '2',
      name: 'Python Data Analysis',
      description: 'Python template for data analysis with sample data',
      language: 'python',
      files: [
        {
          name: 'main.py',
          language: 'python',
          content: `# Python Data Analysis Example
import json

# Sample data
students = [
    {"name": "Alice", "score": 85, "subject": "Math"},
    {"name": "Bob", "score": 92, "subject": "Science"},
    {"name": "Charlie", "score": 78, "subject": "Math"},
    {"name": "Diana", "score": 95, "subject": "Science"}
]

# Calculate average score
total_score = sum(student["score"] for student in students)
average = total_score / len(students)
print(f"Average score: {average:.2f}")

# Find top performer
top_student = max(students, key=lambda x: x["score"])
print(f"Top performer: {top_student['name']} with {top_student['score']} points")

# Group by subject
subjects = {}
for student in students:
    subject = student["subject"]
    if subject not in subjects:
        subjects[subject] = []
    subjects[subject].append(student)

for subject, subject_students in subjects.items():
    avg_score = sum(s["score"] for s in subject_students) / len(subject_students)
    print(f"{subject} average: {avg_score:.2f}")`
        }
      ],
      tags: ['intermediate', 'python', 'data-analysis'],
      difficulty: 'intermediate'
    },
    {
      id: '3',
      name: 'HTML/CSS Landing Page',
      description: 'Responsive landing page template',
      language: 'html',
      files: [
        {
          name: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Landing Page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">Student Hub</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="hero">
            <div class="hero-content">
                <h1>Welcome to Student Hub</h1>
                <p>Your ultimate platform for academic success</p>
                <button class="cta-button">Get Started</button>
            </div>
        </section>

        <section class="features">
            <h2>Our Features</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <h3>Study Tools</h3>
                    <p>Access powerful study tools and resources</p>
                </div>
                <div class="feature-card">
                    <h3>Code Playground</h3>
                    <p>Practice coding in multiple languages</p>
                </div>
                <div class="feature-card">
                    <h3>Collaboration</h3>
                    <p>Work together with fellow students</p>
                </div>
            </div>
        </section>
    </main>
</body>
</html>`
        },
        {
          name: 'style.css',
          language: 'css',
          content: `/* Student Landing Page Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
}

/* Header Styles */
.header {
    background: #fff;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 5%;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2563eb;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s;
}

.nav-links a:hover {
    color: #2563eb;
}

/* Hero Section */
.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8rem 5% 4rem;
    text-align: center;
    margin-top: 60px;
}

.hero-content h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.hero-content p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.cta-button {
    background: #fff;
    color: #667eea;
    padding: 1rem 2rem;
    border: none;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.3s;
}

.cta-button:hover {
    transform: translateY(-2px);
}

/* Features Section */
.features {
    padding: 4rem 5%;
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
}

.features h2 {
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: #333;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: #f8fafc;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #2563eb;
}

/* Responsive Design */
@media (max-width: 768px) {
    .nav-links {
        gap: 1rem;
    }
    
    .hero-content h1 {
        font-size: 2rem;
    }
    
    .feature-grid {
        grid-template-columns: 1fr;
    }
}`
        }
      ],
      tags: ['beginner', 'html', 'css', 'responsive'],
      difficulty: 'beginner'
    },
    {
      id: '4',
      name: 'React Counter App',
      description: 'Simple React component example',
      language: 'javascript',
      files: [
        {
          name: 'App.jsx',
          language: 'javascript',
          content: `// React Counter App
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  const increment = () => setCount(count + step);
  const decrement = () => setCount(count - step);
  const reset = () => setCount(0);

  return (
    <div className="counter-app">
      <h1>React Counter App</h1>
      
      <div className="counter-display">
        <h2>Count: {count}</h2>
      </div>

      <div className="controls">
        <label>
          Step:
          <input
            type="number"
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            min="1"
          />
        </label>
      </div>

      <div className="buttons">
        <button onClick={decrement}>- {step}</button>
        <button onClick={reset}>Reset</button>
        <button onClick={increment}>+ {step}</button>
      </div>

      <div className="info">
        <p>Current step: {step}</p>
        <p>Total clicks: {Math.abs(count / step)}</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Counter />
    </div>
  );
}

export default App;`
        }
      ],
      tags: ['intermediate', 'react', 'javascript', 'components'],
      difficulty: 'intermediate'
    }
  ]

  // Default code content for different languages
  const defaultCode = {
    javascript: `// JavaScript Playground
console.log("Welcome to Code Playground!");

// Try some code here
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("Student"));`,
    
    python: `# Python Playground
print("Welcome to Code Playground!")

# Try some code here
def greet(name):
    return f"Hello, {name}!"

print(greet("Student"))`,
    
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML Playground</title>
</head>
<body>
    <h1>Welcome to HTML Playground!</h1>
    <p>Start building your webpage here.</p>
</body>
</html>`,
    
    css: `/* CSS Playground */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}`,

    java: `// Java Playground
public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to Java Playground!");
        
        // Try some code here
        String message = greet("Student");
        System.out.println(message);
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,

    cpp: `// C++ Playground
#include <iostream>
#include <string>

using namespace std;

string greet(string name) {
    return "Hello, " + name + "!";
}

int main() {
    cout << "Welcome to C++ Playground!" << endl;
    
    // Try some code here
    string message = greet("Student");
    cout << message << endl;
    
    return 0;
}`
  }

  // Load data from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('code-playground-projects')
    const savedTheme = localStorage.getItem('code-playground-theme')
    const savedFontSize = localStorage.getItem('code-playground-font-size')
    
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark')
    }
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize))
    }

    // Create default project if none exists
    if (!savedProjects || JSON.parse(savedProjects).length === 0) {
      createNewProject('My First Project', 'A simple starter project')
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('code-playground-projects', JSON.stringify(projects))
    }
  }, [projects])

  useEffect(() => {
    localStorage.setItem('code-playground-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('code-playground-font-size', fontSize.toString())
  }, [fontSize])

  // Helper functions
  const createNewProject = (name: string, description: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: name || 'Untitled Project',
      description: description || 'No description',
      files: [
        {
          id: Date.now().toString(),
          name: `main.${getFileExtension(language)}`,
          language,
          content: defaultCode[language as keyof typeof defaultCode] || '',
          isActive: true
        }
      ],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isPublic: false,
      tags: [language],
      language
    }

    setProjects(prev => [newProject, ...prev])
    setCurrentProject(newProject)
    setActiveFileId(newProject.files[0].id)
    setCurrentView('editor')
  }

  const getFileExtension = (lang: string) => {
    const extensions: { [key: string]: string } = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
      css: 'css',
      json: 'json',
      markdown: 'md',
      sql: 'sql'
    }
    return extensions[lang] || 'txt'
  }

  const addNewFile = () => {
    if (!currentProject) return

    const fileName = prompt('Enter file name:')
    if (!fileName) return

    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: fileName,
      language: getLanguageFromExtension(fileName),
      content: '',
      isActive: false
    }

    const updatedProject = {
      ...currentProject,
      files: [...currentProject.files, newFile],
      lastModified: new Date().toISOString()
    }

    setCurrentProject(updatedProject)
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
    setActiveFileId(newFile.id)
  }

  const getLanguageFromExtension = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const langMap: { [key: string]: string } = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      sql: 'sql'
    }
    return langMap[ext || ''] || 'javascript'
  }

  const deleteFile = (fileId: string) => {
    if (!currentProject || currentProject.files.length <= 1) return

    const updatedFiles = currentProject.files.filter(f => f.id !== fileId)
    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      lastModified: new Date().toISOString()
    }

    setCurrentProject(updatedProject)
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
    
    if (activeFileId === fileId) {
      setActiveFileId(updatedFiles[0]?.id || '')
    }
  }

  const updateFileContent = (content: string) => {
    if (!currentProject || !activeFileId) return

    const updatedFiles = currentProject.files.map(file =>
      file.id === activeFileId ? { ...file, content } : file
    )

    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      lastModified: new Date().toISOString()
    }

    setCurrentProject(updatedProject)
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
  }

  const runCode = async () => {
    if (!currentProject || !activeFileId) return

    setIsRunning(true)
    setLoading(true)

    // Simulate code execution
    setTimeout(() => {
      const activeFile = currentProject.files.find(f => f.id === activeFileId)
      if (!activeFile) return

      let output = ''
      let error = ''
      let status: 'success' | 'error' | 'timeout' = 'success'

      try {
        // Mock execution based on language
        switch (activeFile.language) {
          case 'javascript':
            // Simple JavaScript execution simulation
            if (activeFile.content.includes('console.log')) {
              const matches = activeFile.content.match(/console\.log\((.*?)\)/g)
              if (matches) {
                output = matches.map(match => {
                  const content = match.replace(/console\.log\(|\)/g, '')
                  return eval(content)
                }).join('\n')
              }
            } else {
              output = 'Code executed successfully'
            }
            break

          case 'python':
            // Mock Python output
            if (activeFile.content.includes('print')) {
              const matches = activeFile.content.match(/print\((.*?)\)/g)
              if (matches) {
                output = matches.map(match => {
                  const content = match.replace(/print\(|\)/g, '').replace(/"/g, '')
                  return content
                }).join('\n')
              }
            } else {
              output = 'Python code executed successfully'
            }
            break

          case 'html':
            output = 'HTML rendered successfully. Check the preview pane.'
            break

          case 'css':
            output = 'CSS styles applied successfully. Check the preview pane.'
            break

          default:
            output = `${activeFile.language} code executed successfully`
        }
      } catch (err) {
        error = (err as Error).message
        status = 'error'
      }

      setOutputResult({
        output,
        error,
        executionTime: Math.random() * 1000 + 100,
        status
      })
      setIsRunning(false)
      setLoading(false)
    }, 1500)
  }

  const saveProject = () => {
    if (!currentProject) return
    
    // Project is automatically saved to localStorage
    alert('Project saved successfully!')
  }

  const shareProject = () => {
    if (!currentProject) return

    const shareId = btoa(JSON.stringify(currentProject))
    const url = `${window.location.origin}/playground/shared/${shareId}`
    setShareUrl(url)
    setShowShareModal(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const downloadProject = () => {
    if (!currentProject) return

    const zip = {
      name: currentProject.name,
      files: currentProject.files.map(file => ({
        name: file.name,
        content: file.content
      }))
    }

    const blob = new Blob([JSON.stringify(zip, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentProject.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadTemplate = (template: Template) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      files: template.files.map((file, index) => ({
        id: (Date.now() + index).toString(),
        ...file,
        isActive: index === 0
      })),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isPublic: false,
      tags: template.tags,
      language: template.language
    }

    setProjects(prev => [newProject, ...prev])
    setCurrentProject(newProject)
    setActiveFileId(newProject.files[0].id)
    setCurrentView('editor')
    setShowTemplateModal(false)
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesLanguage = !filterLanguage || template.language === filterLanguage
    return matchesSearch && matchesLanguage
  })

  const activeFile = currentProject?.files.find(f => f.id === activeFileId)

  // Render functions
  const renderEditor = () => (
    <div className={`flex-1 flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      {/* File Tabs */}
      {currentProject && (
        <div className={`flex items-center gap-1 p-2 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          {currentProject.files.map(file => (
            <div
              key={file.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer ${
                activeFileId === file.id
                  ? theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800 border-l border-r border-t border-gray-200'
                  : theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => setActiveFileId(file.id)}
            >
              <File className="w-4 h-4" />
              <span>{file.name}</span>
              {currentProject.files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteFile(file.id)
                  }}
                  className="hover:bg-red-500 hover:text-white rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addNewFile}
            className={`p-2 rounded hover:bg-gray-200 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600'}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Code Editor */}
      <div className="flex-1 relative">
        <textarea
          ref={editorRef}
          value={activeFile?.content || ''}
          onChange={(e) => updateFileContent(e.target.value)}
          className={`w-full h-full p-4 resize-none font-mono outline-none ${
            theme === 'dark' 
              ? 'bg-gray-900 text-gray-100' 
              : 'bg-white text-gray-800'
          }`}
          style={{ fontSize: `${fontSize}px` }}
          placeholder={`Start coding in ${activeFile?.language || language}...`}
          spellCheck={false}
        />
        
        {/* Line numbers (simplified) */}
        <div className={`absolute left-0 top-0 p-4 pointer-events-none select-none font-mono ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`} style={{ fontSize: `${fontSize}px` }}>
          {activeFile?.content.split('\n').map((_, index) => (
            <div key={index} className="leading-6">
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderOutput = () => (
    <div className={`w-full h-64 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
      <div className={`flex items-center justify-between p-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <Terminal className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            Output
          </span>
          {outputResult && (
            <span className={`text-sm px-2 py-1 rounded ${
              outputResult.status === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {outputResult.status === 'success' ? 'Success' : 'Error'}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowOutput(!showOutput)}
          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
        >
          {showOutput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showOutput && (
        <div className="p-4 h-48 overflow-y-auto">
          {isRunning ? (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin">
                <Zap className="w-4 h-4" />
              </div>
              <span>Running code...</span>
            </div>
          ) : outputResult ? (
            <div className="space-y-2">
              {outputResult.output && (
                <div>
                  <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Output:
                  </div>
                  <pre className={`text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                    {outputResult.output}
                  </pre>
                </div>
              )}
              {outputResult.error && (
                <div>
                  <div className="text-sm font-medium mb-1 text-red-600">Error:</div>
                  <pre className="text-sm text-red-700">{outputResult.error}</pre>
                </div>
              )}
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Execution time: {outputResult.executionTime.toFixed(2)}ms
              </div>
            </div>
          ) : (
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Click "Run Code" to see output
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Projects</h2>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div
            key={project.id}
            className={`p-6 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              setCurrentProject(project)
              setActiveFileId(project.files[0]?.id || '')
              setCurrentView('editor')
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {project.name}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {project.description}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {project.language}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <File className="w-4 h-4" />
                <span>{project.files.length} files</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(project.lastModified).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className={`text-xs px-2 py-1 rounded ${
                    theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className={`text-xs px-2 py-1 rounded ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  +{project.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">Create your first project to get started</p>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      )}
    </div>
  )

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Code Templates</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className={`pl-10 pr-4 py-2 border rounded-lg ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            />
          </div>
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className={`px-4 py-2 border rounded-lg ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-800'
            }`}
          >
            <option value="">All Languages</option>
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className={`p-6 rounded-xl border transition-all hover:shadow-lg ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {template.name}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {template.description}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                template.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {template.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <span>{languages.find(l => l.value === template.language)?.icon}</span>
                <span>{languages.find(l => l.value === template.language)?.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <File className="w-4 h-4" />
                <span>{template.files.length} files</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {template.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className={`text-xs px-2 py-1 rounded ${
                    theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => loadTemplate(template)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Use Template
            </button>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No templates found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  )

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">Code Playground</h1>
            
            {/* Navigation */}
            <div className="flex gap-4">
              {[
                { key: 'editor', label: 'Editor', icon: Code },
                { key: 'projects', label: 'Projects', icon: Folder },
                { key: 'templates', label: 'Templates', icon: BookOpen }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCurrentView(key as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === key
                      ? 'bg-blue-600 text-white'
                      : theme === 'dark' 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-4">
            {currentView === 'editor' && currentProject && (
              <>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`px-3 py-2 border rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.icon} {lang.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  {isRunning ? 'Running...' : 'Run'}
                </button>

                <button
                  onClick={saveProject}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Save className="w-5 h-5" />
                </button>

                <button
                  onClick={shareProject}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Share2 className="w-5 h-5" />
                </button>

                <button
                  onClick={downloadProject}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Download className="w-5 h-5" />
                </button>
              </>
            )}

            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isFullscreen ? 'fixed inset-0 top-16 z-50' : ''}`}>
        {currentView === 'editor' ? (
          <div className="flex flex-col h-screen">
            <div className="flex-1 flex">
              {renderEditor()}
            </div>
            {renderOutput()}
          </div>
        ) : (
          <div className="p-6">
            {currentView === 'projects' && renderProjects()}
            {currentView === 'templates' && renderTemplates()}
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                className={`w-full p-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Project description"
                rows={3}
                className={`w-full p-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full p-3 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.icon} {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className={`flex-1 px-4 py-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  createNewProject(projectName, projectDescription)
                  setShowNewProjectModal(false)
                  setProjectName('')
                  setProjectDescription('')
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-4">Share Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Share URL:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className={`flex-1 p-3 border rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-800'
                    }`}
                  />
                  <button
                    onClick={() => copyToClipboard(shareUrl)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className={`flex-1 px-4 py-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
