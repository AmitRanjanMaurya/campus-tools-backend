'use client'

import React, { useState, useRef } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Eye,
  Edit3
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: string
}

export default function RichTextEditor({ value, onChange, placeholder = "Start writing your blog post...", height = "400px" }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertLink = () => {
    const url = prompt('Enter the URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const insertImage = () => {
    const url = prompt('Enter the image URL:')
    if (url) {
      execCommand('insertImage', url)
    }
  }

  const formatBlock = (tag: string) => {
    execCommand('formatBlock', tag)
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const toolbarButtons = [
    { icon: Undo, command: 'undo', tooltip: 'Undo' },
    { icon: Redo, command: 'redo', tooltip: 'Redo' },
    { divider: true },
    { icon: Bold, command: 'bold', tooltip: 'Bold' },
    { icon: Italic, command: 'italic', tooltip: 'Italic' },
    { icon: Underline, command: 'underline', tooltip: 'Underline' },
    { divider: true },
    { icon: Heading1, action: () => formatBlock('h1'), tooltip: 'Heading 1' },
    { icon: Heading2, action: () => formatBlock('h2'), tooltip: 'Heading 2' },
    { icon: Heading3, action: () => formatBlock('h3'), tooltip: 'Heading 3' },
    { divider: true },
    { icon: List, command: 'insertUnorderedList', tooltip: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', tooltip: 'Numbered List' },
    { icon: Quote, action: () => formatBlock('blockquote'), tooltip: 'Quote' },
    { divider: true },
    { icon: AlignLeft, command: 'justifyLeft', tooltip: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', tooltip: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', tooltip: 'Align Right' },
    { divider: true },
    { icon: Link, action: insertLink, tooltip: 'Insert Link' },
    { icon: Image, action: insertImage, tooltip: 'Insert Image' },
    { icon: Code, command: 'insertHTML', value: '<code></code>', tooltip: 'Code' }
  ]

  const renderPreview = () => {
    return (
      <div 
        className="prose prose-sm max-w-none p-4 min-h-full"
        dangerouslySetInnerHTML={{ __html: value }}
        style={{ minHeight: height }}
      />
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-1 flex-wrap">
        <div className="flex items-center gap-1 mr-4">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 text-sm rounded flex items-center gap-2 ${
              !isPreview ? 'bg-white border shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 text-sm rounded flex items-center gap-2 ${
              isPreview ? 'bg-white border shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>

        {!isPreview && (
          <div className="flex items-center gap-1">
            {toolbarButtons.map((button, index) => (
              button.divider ? (
                <div key={index} className="w-px h-6 bg-gray-300 mx-1" />
              ) : (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (button.action) {
                      button.action()
                    } else if (button.command) {
                      execCommand(button.command, button.value)
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                  title={button.tooltip}
                >
                  {button.icon && React.createElement(button.icon, { className: "h-4 w-4" })}
                </button>
              )
            ))}
          </div>
        )}
      </div>

      {/* Editor/Preview Area */}
      <div className="bg-white">
        {isPreview ? (
          renderPreview()
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            dangerouslySetInnerHTML={{ __html: value }}
            className="p-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset min-h-full text-left"
            style={{ 
              minHeight: height,
              direction: 'ltr',
              textAlign: 'left'
            }}
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* Character Count */}
      <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-sm text-gray-500 flex justify-between">
        <span>
          {value.replace(/<[^>]*>/g, '').length} characters
        </span>
        <span>
          ~{Math.ceil(value.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)} min read
        </span>
      </div>

      <style jsx>{`
        [contenteditable] {
          direction: ltr !important;
          text-align: left !important;
        }
        
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
          direction: ltr;
          text-align: left;
        }
        
        .prose h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
          text-align: left;
        }
        
        .prose h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
          text-align: left;
        }
        
        .prose h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        
        .prose blockquote {
          border-left: 4px solid #E5E7EB;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: #6B7280;
        }
        
        .prose code {
          background-color: #F3F4F6;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.9em;
        }
        
        .prose ul, .prose ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .prose li {
          margin: 0.5em 0;
        }
        
        .prose a {
          color: #3B82F6;
          text-decoration: underline;
        }
        
        .prose img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}
