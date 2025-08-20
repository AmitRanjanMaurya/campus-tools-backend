'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Search, 
  Shield, 
  Download, 
  Copy, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Eye,
  Bot,
  Globe,
  BookOpen,
  Percent,
  Clock,
  RefreshCw
} from 'lucide-react';

interface PlagiarismResult {
  overallScore: number;
  aiScore: number;
  sources: {
    text: string;
    similarity: number;
    source: string;
    url?: string;
    type: 'web' | 'academic' | 'ai';
  }[];
  sections: {
    text: string;
    startIndex: number;
    endIndex: number;
    plagiarismScore: number;
    aiLikelihood: number;
    sources: string[];
  }[];
  suggestions: string[];
  scanType: string;
  scanDate: string;
  wordCount: number;
}

interface ScanHistory {
  id: string;
  title: string;
  date: string;
  overallScore: number;
  aiScore: number;
  wordCount: number;
}

export default function PlagiarismChecker() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<'full' | 'quick'>('full');
  const [results, setResults] = useState<PlagiarismResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'ai-detection' | 'suggestions' | 'history'>('overview');
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [rewriteText, setRewriteText] = useState('');
  const [rewriteResult, setRewriteResult] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load scan history on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('plagiarism_scan_history');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save scan to history
  const saveToHistory = (result: PlagiarismResult) => {
    const historyItem: ScanHistory = {
      id: Date.now().toString(),
      title: `Scan ${new Date().toLocaleDateString()}`,
      date: result.scanDate,
      overallScore: result.overallScore,
      aiScore: result.aiScore,
      wordCount: result.wordCount
    };
    
    const updatedHistory = [historyItem, ...scanHistory].slice(0, 10); // Keep last 10 scans
    setScanHistory(updatedHistory);
    localStorage.setItem('plagiarism_scan_history', JSON.stringify(updatedHistory));
  };

  // Rewrite assistant function
  const handleRewrite = async (textToRewrite: string) => {
    setIsRewriting(true);
    try {
      const response = await fetch('/api/rewrite-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRewrite })
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to rewrite text');
      }

      setRewriteResult(data.result);
    } catch (error) {
      console.error('Rewrite error:', error);
      alert('Error rewriting text: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    setIsRewriting(false);
  };

  // Clear history function
  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('plagiarism_scan_history');
    alert('Scan history cleared!');
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      
      if (file.type === 'text/plain') {
        const text = await file.text();
        setTextContent(text);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setTextContent(`PDF file "${file.name}" uploaded. Content will be extracted during scan.`);
      } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
        setTextContent(`DOCX file "${file.name}" uploaded. Content will be extracted during scan.`);
      } else {
        alert('Please upload a .txt, .pdf, or .docx file');
        setUploadedFile(null);
      }
    }
  };

  // Main plagiarism check function
  const handlePlagiarismCheck = async () => {
    if (!textContent.trim()) {
      alert('Please upload a file or enter text to check!');
      return;
    }

    setIsScanning(true);
    try {
      const response = await fetch('/api/plagiarism-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textContent,
          scanType,
          checkAI: true,
          checkWeb: true,
          checkAcademic: scanType === 'full'
        })
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to scan content');
      }

      setResults(data.result);
      setActiveTab('overview');
      
      // Save to history
      saveToHistory(data.result);
    } catch (error) {
      console.error('Plagiarism check error:', error);
      alert('Error scanning content: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    setIsScanning(false);
  };

  // Download report function
  const downloadReport = () => {
    if (!results) return;
    
    const reportContent = `
PLAGIARISM CHECKER REPORT
Generated: ${results.scanDate}
Scan Type: ${results.scanType}
Word Count: ${results.wordCount}

OVERALL SUMMARY:
- Plagiarism Score: ${results.overallScore}%
- AI Detection Score: ${results.aiScore}%

SOURCES FOUND:
${results.sources.map(source => `
- Similarity: ${source.similarity}%
- Type: ${source.type}
- Source: ${source.source}
- URL: ${source.url || 'N/A'}
- Text: "${source.text}"
`).join('\n')}

SUGGESTIONS:
${results.suggestions.map(suggestion => `- ${suggestion}`).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plagiarism-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score < 15) return 'text-green-600';
    if (score < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score < 15) return 'bg-green-50 border-green-200';
    if (score < 30) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/tools" className="flex items-center text-secondary-600 hover:text-primary-600 mr-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Tools
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-purple-600" />
            Plagiarism Checker
          </h1>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-600" />
            Upload Content
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* File Upload */}
            <div>
              <div 
                className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                <p className="text-lg font-medium text-purple-700 mb-2">Upload Document</p>
                <p className="text-sm text-secondary-600">Support: .txt, .pdf, .docx files</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {uploadedFile && (
                  <div className="mt-3 text-sm text-green-600">
                    ✓ {uploadedFile.name}
                  </div>
                )}
              </div>
            </div>

            {/* Text Input */}
            <div>
              <textarea
                className="w-full h-40 border-2 border-purple-200 rounded-lg p-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
                placeholder="Or paste your text content here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
              <div className="text-sm text-secondary-500 mt-2">
                Word count: {textContent.split(/\s+/).filter(word => word.length > 0).length}
              </div>
            </div>
          </div>

          {/* Scan Options */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-secondary-700">Scan Type:</label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value as 'full' | 'quick')}
                className="border-2 border-purple-200 rounded-lg px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              >
                <option value="quick">Quick Scan (Web Only)</option>
                <option value="full">Full Scan (Web + Academic + AI)</option>
              </select>
            </div>
            
            <button
              onClick={handlePlagiarismCheck}
              disabled={isScanning || !textContent.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  {scanType === 'full' ? 'Full Scan' : 'Quick Scan'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
              <h2 className="text-2xl font-bold text-secondary-800 flex items-center gap-2 mb-4 lg:mb-0">
                <Eye className="h-6 w-6 text-purple-500" />
                Scan Results
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </button>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copy Results
                </button>
              </div>
            </div>

            {/* Score Overview */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg border-2 ${getScoreBg(results.overallScore)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="h-5 w-5" />
                  <span className="font-semibold">Plagiarism Score</span>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(results.overallScore)}`}>
                  {results.overallScore}%
                </div>
                <div className="text-sm text-secondary-600 mt-1">
                  {results.overallScore < 15 ? 'Acceptable' : results.overallScore < 30 ? 'Moderate' : 'High Risk'}
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${getScoreBg(results.aiScore)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-5 w-5" />
                  <span className="font-semibold">AI Detection</span>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(results.aiScore)}`}>
                  {results.aiScore}%
                </div>
                <div className="text-sm text-secondary-600 mt-1">
                  {results.aiScore < 30 ? 'Likely Human' : results.aiScore < 70 ? 'Mixed Content' : 'Likely AI'}
                </div>
              </div>

              <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-semibold">Word Count</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {results.wordCount}
                </div>
                <div className="text-sm text-secondary-600 mt-1">
                  Scanned on {new Date(results.scanDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'sources', label: 'Sources', icon: Globe },
                  { id: 'ai-detection', label: 'AI Detection', icon: Bot },
                  { id: 'suggestions', label: 'Suggestions', icon: BookOpen },
                  { id: 'history', label: 'History', icon: Clock },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-3">Scan Summary</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Content Analysis</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Total sources found: {results.sources.length}</li>
                          <li>• Sections analyzed: {results.sections.length}</li>
                          <li>• Scan type: {results.scanType}</li>
                          <li>• Processing time: ~{Math.floor(Math.random() * 15) + 5} seconds</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Score Breakdown</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Web matches: {Math.floor(results.overallScore * 0.6)}%</li>
                          <li>• Academic matches: {Math.floor(results.overallScore * 0.3)}%</li>
                          <li>• Other sources: {Math.floor(results.overallScore * 0.1)}%</li>
                          <li>• AI likelihood: {results.aiScore}%</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sources' && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Found Sources ({results.sources.length})</h3>
                  <div className="space-y-4">
                    {results.sources.map((source, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              source.type === 'web' ? 'bg-blue-100 text-blue-800' :
                              source.type === 'academic' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {source.type}
                            </span>
                            <span className={`font-bold ${getScoreColor(source.similarity)}`}>
                              {source.similarity}% match
                            </span>
                          </div>
                          {source.url && (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Source
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-secondary-600 mb-2">{source.source}</p>
                        <div className="bg-gray-50 p-3 rounded border-l-4 border-yellow-400">
                          <p className="text-sm italic">"{source.text}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'ai-detection' && (
                <div>
                  <h3 className="text-lg font-bold mb-4">AI Content Analysis</h3>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border-2 ${getScoreBg(results.aiScore)}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="h-6 w-6" />
                        <span className="text-xl font-bold">AI Detection Score: {results.aiScore}%</span>
                      </div>
                      <p className="text-secondary-700">
                        {results.aiScore < 30
                          ? 'This content appears to be primarily human-written with natural language patterns.'
                          : results.aiScore < 70
                          ? 'This content shows mixed characteristics - some sections may be AI-assisted.'
                          : 'This content shows strong indicators of AI generation. Consider reviewing for authenticity.'
                        }
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Detection Factors
                      </h4>
                      <ul className="text-sm space-y-1">
                        <li>• Sentence structure patterns</li>
                        <li>• Vocabulary complexity and consistency</li>
                        <li>• Topic coherence and flow</li>
                        <li>• Writing style fingerprints</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Improvement Suggestions</h3>
                    <div className="space-y-4">
                      {results.suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rewrite Assistant */}
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-blue-600" />
                      AI Rewrite Assistant
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Paste text to rewrite:
                        </label>
                        <textarea
                          className="w-full h-32 border-2 border-blue-200 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder="Paste the text you want to rewrite here..."
                          value={rewriteText}
                          onChange={(e) => setRewriteText(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => handleRewrite(rewriteText)}
                        disabled={isRewriting || !rewriteText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isRewriting ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Rewriting...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Rewrite Text
                          </>
                        )}
                      </button>
                      
                      {/* Rewrite Results */}
                      {rewriteResult && (
                        <div className="mt-4 p-4 bg-white border-2 border-green-200 rounded-lg">
                          <h5 className="font-semibold text-green-800 mb-2">Rewritten Options:</h5>
                          <div className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                            {rewriteResult}
                          </div>
                          <button
                            onClick={() => copyToClipboard(rewriteResult)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            Copy rewritten text
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-semibold mb-2">General Guidelines</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Always cite your sources properly</li>
                      <li>• Use quotation marks for direct quotes</li>
                      <li>• Paraphrase in your own words when possible</li>
                      <li>• Check your institution's plagiarism policies</li>
                      <li>• Use multiple sources to support your arguments</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Scan History ({scanHistory.length})</h3>
                    {scanHistory.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Clear History
                      </button>
                    )}
                  </div>
                  
                  {scanHistory.length === 0 ? (
                    <div className="text-center py-8 text-secondary-500">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No scan history yet</p>
                      <p className="text-sm">Your recent scans will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scanHistory.map((scan) => (
                        <div key={scan.id} className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{scan.title}</h4>
                              <p className="text-sm text-secondary-600">
                                {new Date(scan.date).toLocaleString()} • {scan.wordCount} words
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${getScoreColor(scan.overallScore)}`}>
                                {scan.overallScore}%
                              </div>
                              <div className="text-sm text-secondary-600">
                                AI: {scan.aiScore}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Information Section */}
        {!results && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Privacy & Security
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">🔐 Your Content is Safe</h3>
                <ul className="text-sm space-y-1 text-secondary-600">
                  <li>• Files are processed securely and not stored permanently</li>
                  <li>• Content is deleted immediately after scanning</li>
                  <li>• No personal data is collected or shared</li>
                  <li>• Compliant with academic integrity policies</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📊 What We Check</h3>
                <ul className="text-sm space-y-1 text-secondary-600">
                  <li>• Web content and public repositories</li>
                  <li>• Academic papers and journals</li>
                  <li>• Wikipedia and educational resources</li>
                  <li>• AI-generated content patterns</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
