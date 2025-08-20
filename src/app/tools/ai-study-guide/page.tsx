"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, BookOpen, Brain, ListChecks, Download, QrCode, Languages, RefreshCw, Users, ArrowLeft, Share2, Lightbulb, CheckCircle, HelpCircle, X } from "lucide-react";
import Link from "next/link";

export default function AIStudyGuide() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [detailLevel, setDetailLevel] = useState("exam");
  const [language, setLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; concepts: string[]; questions: string[]; mindmap: any }>({ summary: "", concepts: [], questions: [], mindmap: null });
  const [tab, setTab] = useState("summary");
  const [studyGuide, setStudyGuide] = useState<any>(null);
  const [qrCode, setQrCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handler with text extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      
      // Extract text from file
      if (file.type === 'text/plain') {
        const text = await file.text();
        setRawText(text);
      } else if (file.type === 'application/pdf') {
        // For PDF, we'll show a message that it's uploaded
        setRawText(`PDF file "${file.name}" uploaded. The content will be processed when you generate the guide.`);
      }
    }
  };

  // AI processing
  const handleGenerate = async () => {
    if (!rawText.trim()) {
      alert("Please enter some text or upload a file first!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/ai-study-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: rawText,
          detailLevel,
          language,
          outputType: "guide",
        }),
      });
      
      // Check if response is ok first
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      // Check if response has content
      const responseText = await res.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error("Empty response from server");
      }
      
      // Try to parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Response Text:", responseText);
        throw new Error("Invalid response format from server");
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const aiText = data.result || "";
      
      if (!aiText.trim()) {
        throw new Error("No content received from AI service");
      }

      // Show which provider was used
      if (data.provider) {
        console.log(`Study guide generated using: ${data.provider}`);
      }
      
      if (data.fallback) {
        alert(data.message || "Using fallback template");
      }
      
      // Parse the AI response into structured data
      const structuredResult = parseAIResponse(aiText);
      setStudyGuide(structuredResult);
      
    } catch (err) {
      console.error("Generate error:", err);
      let errMsg = "Failed to generate study guide";
      
      if (err instanceof Error) {
        errMsg = err.message;
      } else if (typeof err === 'string') {
        errMsg = err;
      } else if (err && typeof err === 'object') {
        // Handle object errors better
        if ('message' in err) {
          errMsg = String(err.message);
        } else {
          errMsg = `API Error: ${JSON.stringify(err)}`;
        }
      }
      
      // Show more user-friendly error messages
      if (errMsg.includes('API key')) {
        errMsg = "API service is not configured. Please contact support.";
      } else if (errMsg.includes('Failed to fetch')) {
        errMsg = "Network error. Please check your internet connection.";
      } else if (errMsg.includes('429')) {
        errMsg = "Service is busy. Please try again in a moment.";
      } else if (errMsg.includes('JSON')) {
        errMsg = "Server response error. Please try again.";
      }
      
      alert("Error generating study guide: " + errMsg);
      setStudyGuide(null);
    }
    setIsLoading(false);
  };

  // Parse AI response into structured sections
  const parseAIResponse = (text: string) => {
    // Extract different sections
    let summary = "";
    let keyPoints: string[] = [];
    let questionsAndAnswers: { question: string; answer: string }[] = [];
    let topics: string[] = [];
    
    // Extract summary/overview
    const summaryMatch = text.match(/\*\*Overview\*\*:?([\s\S]*?)(?=\*\*|$)/i) || 
                        text.match(/\*\*Introduction\*\*:?([\s\S]*?)(?=\*\*|$)/i);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
    } else {
      // Use first paragraph as summary
      const firstParagraph = text.split('\n\n')[0];
      summary = firstParagraph.replace(/\*\*/g, '').trim();
    }

    // Extract Key Concepts/Points
    const conceptsMatch = text.match(/\*\*Key Concepts?\*\*:?([\s\S]*?)(?=\*\*|$)/i) || 
                         text.match(/\*\*Important Terms?\*\*:?([\s\S]*?)(?=\*\*|$)/i);
    if (conceptsMatch && conceptsMatch[1]) {
      keyPoints = conceptsMatch[1]
        .split(/\n/)
        .map(line => line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 10); // Filter out short lines
    }

    // Extract Practice Questions
    const questionsMatch = text.match(/\*\*Practice Questions?\*\*:?([\s\S]*?)(?=\*\*|$)/i);
    if (questionsMatch && questionsMatch[1]) {
      const questionLines = questionsMatch[1]
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      questionLines.forEach(line => {
        if (line.match(/^\d+\./)) {
          questionsAndAnswers.push({
            question: line.replace(/^\d+\.\s*/, ''),
            answer: "Consider the key concepts above to answer this question."
          });
        }
      });
    }

    // Extract topics for study
    const topicsMatch = text.match(/\*\*Study Tips?\*\*:?([\s\S]*?)(?=\*\*|$)/i) ||
                       text.match(/\*\*Topics?\*\*:?([\s\S]*?)(?=\*\*|$)/i);
    if (topicsMatch && topicsMatch[1]) {
      topics = topicsMatch[1]
        .split(/\n/)
        .map(line => line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 5);
    }

    // Fallback: extract bullet points if sections are empty
    if (keyPoints.length === 0 || topics.length === 0) {
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const bulletItems = lines.filter(line => 
        line.match(/^[-•*]\s+/) || 
        line.match(/^\d+\.\s+/) ||
        line.includes(':')
      );
      
      if (keyPoints.length === 0) {
        keyPoints = bulletItems.slice(0, Math.min(5, bulletItems.length));
      }
      if (topics.length === 0) {
        topics = bulletItems.slice(-3);
      }
    }

    // Default questions if none found
    if (questionsAndAnswers.length === 0) {
      questionsAndAnswers = [
        { question: "What are the main concepts covered in this topic?", answer: "Review the key points above." },
        { question: "How can you apply this knowledge practically?", answer: "Consider real-world examples and applications." },
        { question: "What are the most important terms to remember?", answer: "Focus on the definitions and explanations provided." }
      ];
    }

    return {
      summary: summary || "Study guide generated successfully.",
      keyPoints: keyPoints.length > 0 ? keyPoints : ["Key concepts extracted from content"],
      questionsAndAnswers,
      topics: topics.length > 0 ? topics : ["Review main concepts", "Practice applications", "Study definitions"]
    };
  };

  // Export functions
  const exportToPDF = () => {
    if (!studyGuide) {
      alert("Please generate a study guide first!");
      return;
    }
    
    const content = `
      <h1>AI Study Guide</h1>
      <h2>Summary</h2>
      <p>${studyGuide.summary}</p>
      <h2>Key Points</h2>
      <ul>${studyGuide.keyPoints.map((point: string) => `<li>${point}</li>`).join('')}</ul>
      <h2>Questions & Answers</h2>
      ${studyGuide.questionsAndAnswers.map((qa: any) => `<div style="margin-bottom: 10px;"><strong>Q: ${qa.question}</strong><br>A: ${qa.answer}</div>`).join('')}
      <h2>Topics to Study</h2>
      <ul>${studyGuide.topics.map((topic: string) => `<li>${topic}</li>`).join('')}</ul>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Study Guide</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportToDoc = () => {
    if (!studyGuide) {
      alert("Please generate a study guide first!");
      return;
    }
    
    const content = `AI Study Guide\n\nSummary:\n${studyGuide.summary}\n\nKey Points:\n${studyGuide.keyPoints.join('\n')}\n\nQuestions & Answers:\n${studyGuide.questionsAndAnswers.map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}\n\nTopics to Study:\n${studyGuide.topics.join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study-guide.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateQR = () => {
    if (!studyGuide) {
      alert("Please generate a study guide first!");
      return;
    }
    
    const qrData = encodeURIComponent(studyGuide.summary.substring(0, 500) + "...");
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
    
    const qrSvg = `<img src="${qrUrl}" alt="QR Code" style="width: 200px; height: 200px;" />`;
    setQrCode(qrSvg);
  };

  const saveToNotes = () => {
    if (!studyGuide) {
      alert("Please generate a study guide first!");
      return;
    }
    
    const savedNotes = localStorage.getItem('student_tools_notes') || '[]';
    const notes = JSON.parse(savedNotes);
    
    const newNote = {
      id: Date.now().toString(),
      title: `Study Guide - ${new Date().toLocaleDateString()}`,
      content: `${studyGuide.summary}\n\nKey Points:\n${studyGuide.keyPoints.join('\n')}\n\nTopics:\n${studyGuide.topics.join('\n')}`,
      category: 'Study',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    notes.push(newNote);
    localStorage.setItem('student_tools_notes', JSON.stringify(notes));
    alert("Study guide saved to Notes!");
  };

  const regenerate = () => {
    if (rawText.trim()) {
      handleGenerate();
    } else {
      alert("Please enter some text first!");
    }
  };

  const changeLanguage = () => {
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'Hindi' },
      { code: 'mr', name: 'Marathi' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' }
    ];
    
    const currentIndex = languages.findIndex(lang => lang.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
    
    alert(`Language changed to ${languages[nextIndex].name}`);
  };

  const collaborate = () => {
    if (!result.summary) {
      alert("Please generate a study guide first!");
      return;
    }
    
    // Copy to clipboard for sharing
    navigator.clipboard.writeText(result.summary).then(() => {
      alert("Study guide copied to clipboard! You can now share it with others.");
    }).catch(() => {
      alert("Unable to copy to clipboard. Please select and copy the content manually.");
    });
  };

  const shareOnFacebook = () => {
    if (!studyGuide) {
      alert("Please generate a study guide first!");
      return;
    }
    
    const shareText = `Check out my AI-generated study guide! Key points: ${studyGuide.keyPoints?.slice(0, 3).join(', ')}...`;
    const shareUrl = encodeURIComponent(window.location.href);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${encodeURIComponent(shareText)}`;
    
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/tools" className="flex items-center text-secondary-600 hover:text-primary-600 mr-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Tools
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary-600" />
            AI Study Guide Generator
          </h1>
        </div>

        {/* Upload and Options */}
        <div className="mb-6 bg-white rounded-xl p-6 shadow-lg border border-primary-100">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center cursor-pointer p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-500 transition-colors"
                >
                  <UploadCloud className="h-8 w-8 mb-2 text-primary-500" />
                  <span className="text-sm font-medium text-primary-700">Upload Notes</span>
                  <span className="text-xs text-secondary-500">(txt/pdf)</span>
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".txt,.pdf" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                {uploadedFile && (
                  <div className="mt-2 text-xs text-green-600 text-center">
                    ✓ {uploadedFile.name}
                  </div>
                )}
              </div>
              <textarea
                className="flex-1 border-2 border-secondary-200 rounded-lg p-4 min-h-[120px] focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                placeholder="Enter your content here... e.g., lecture notes, textbook chapters, or study material"
                value={rawText}
                onChange={e => setRawText(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-sm font-medium text-secondary-700 mr-2">Detail Level:</label>
                <select 
                  value={detailLevel} 
                  onChange={e => setDetailLevel(e.target.value)} 
                  className="border-2 border-secondary-200 rounded-lg px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                >
                  <option value="exam">Exam Ready</option>
                  <option value="full">Full Detail</option>
                  <option value="summary">Quick Summary</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-700 mr-2">Language:</label>
                <select 
                  value={language} 
                  onChange={e => setLanguage(e.target.value)} 
                  className="border-2 border-secondary-200 rounded-lg px-3 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <button
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleGenerate}
                disabled={isLoading || (!uploadedFile && !rawText.trim())}
              >
                <BookOpen className="h-5 w-5" /> 
                {isLoading ? "Generating..." : "Generate Guide"}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Content */}
        {studyGuide && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-primary-100">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
              <h2 className="text-2xl font-bold text-secondary-800 flex items-center gap-2 mb-4 lg:mb-0">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                Your Study Guide
              </h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  <FileText className="h-4 w-4" />
                  PDF
                </button>
                <button onClick={exportToDoc} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Download className="h-4 w-4" />
                  DOC
                </button>
                <button onClick={generateQR} className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                  <QrCode className="h-4 w-4" />
                  QR
                </button>
                <button onClick={saveToNotes} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  <BookOpen className="h-4 w-4" />
                  Save to Notes
                </button>
                <button onClick={shareOnFacebook} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
            
            <div className="prose max-w-none">
              {studyGuide.summary && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h3 className="text-lg font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Summary
                  </h3>
                  <p className="text-blue-700">{studyGuide.summary}</p>
                </div>
              )}
              
              {studyGuide.keyPoints && studyGuide.keyPoints.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Key Points
                  </h3>
                  <ul className="space-y-2">
                    {studyGuide.keyPoints.map((point: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {studyGuide.questionsAndAnswers && studyGuide.questionsAndAnswers.length > 0 && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Questions & Answers
                  </h3>
                  <div className="space-y-4">
                    {studyGuide.questionsAndAnswers.map((qa: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-purple-200 pl-4">
                        <p className="font-semibold text-purple-800 mb-2">Q: {qa.question}</p>
                        <p className="text-purple-700">A: {qa.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {studyGuide.topics && studyGuide.topics.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Topics to Study
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {studyGuide.topics.map((topic: string, idx: number) => (
                      <div key={idx} className="bg-yellow-100 px-3 py-2 rounded-lg text-yellow-800 font-medium">
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {qrCode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">QR Code</h3>
                <button onClick={() => setQrCode('')} className="text-secondary-500 hover:text-secondary-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex justify-center">
                <div dangerouslySetInnerHTML={{ __html: qrCode }} />
              </div>
              <p className="text-sm text-secondary-600 text-center mt-4">
                Scan to access your study guide
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
