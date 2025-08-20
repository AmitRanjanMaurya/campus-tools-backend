"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Download, Table, BarChart2, BookOpen, ImagePlus, Sigma, Settings2 } from "lucide-react";

import dynamic from "next/dynamic";
import { useRef } from "react";

const defaultTemplate = {
  title: "Lab Report",
  sections: [
    "Title & Objective",
    "Hypothesis",
    "Materials & Methods",
    "Data Table",
    "Results & Graphs",
    "Conclusion",
    "Error Analysis",
    "References"
  ]
};

export default function LabReportGenerator() {
  const [template, setTemplate] = useState(defaultTemplate);
  const [inputs, setInputs] = useState({
    title: "",
    objective: "",
    hypothesis: "",
    materials: "",
    methods: "",
    data: "",
    results: "",
    conclusion: "",
    errors: "",
    references: "",
    formulas: "",
    images: [] as File[],
  });
  const [generated, setGenerated] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Placeholder: Generate report from inputs
  const handleGenerate = () => {
    let report = `# ${inputs.title || "Lab Report"}\n\n`;
    report += `**Objective:** ${inputs.objective}\n\n`;
    report += `**Hypothesis:** ${inputs.hypothesis}\n\n`;
    report += `**Materials & Methods:**\n${inputs.materials}\n${inputs.methods}\n\n`;
    report += `**Data Table:**\n${inputs.data}\n\n`;
    report += `**Results:**\n${inputs.results}\n\n`;
    report += `**Conclusion:**\n${inputs.conclusion}\n\n`;
    report += `**Error Analysis:**\n${inputs.errors}\n\n`;
    report += `**References:**\n${inputs.references}\n\n`;
    setGenerated(report);
  };

  // Export logic
  const handleExport = (type: "pdf" | "word" | "latex") => {
    if (!generated) return;
    if (type === "pdf") {
      // Simple PDF generation using browser print
      window.print();
    } else if (type === "word") {
      // Export as HTML file (can be opened in Word)
      if (reportRef.current) {
        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${inputs.title || "Lab_Report"}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 1in; }
  h1 { color: #333; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background-color: #f2f2f2; }
</style>
</head>
<body>
${reportRef.current.innerHTML}
</body>
</html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = (inputs.title || "Lab_Report") + ".html";
        link.click();
      }
    } else if (type === "latex") {
      // Simple LaTeX export (basic conversion)
      let latex = generated
        .replace(/^# (.*)$/gm, '\\section{$1}')
        .replace(/\*\*([^*]+)\*\*/g, '\\textbf{$1}')
        .replace(/\n/g, '\\newline\n');
      const blob = new Blob([latex], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = (inputs.title || "Lab_Report") + ".tex";
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Link href="/tools" className="flex items-center text-secondary-600 hover:text-primary-600 mr-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Tools
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-800 mb-4 flex items-center justify-center gap-2 drop-shadow-sm">
            <FileText className="h-7 w-7 text-primary-600" />
            Lab Report Generator
          </h1>
          <p className="text-lg text-secondary-600">
            Auto-structure detailed lab reports with charts, formulas, and export options. Customizable for academic standards.
          </p>
        </div>
        <div className="card mb-8 shadow-lg border-2 border-primary-100 bg-white/80">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary-700 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-400" /> Input Experiment Data
            </h2>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center px-3 py-1 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white rounded-lg shadow transition-all duration-200 font-semibold gap-2 text-sm"
            >
              <Settings2 className="h-4 w-4" /> Templates
            </button>
          </div>
          {showSettings && (
            <div className="mb-6 bg-gradient-to-br from-blue-100 to-purple-100 p-4 rounded-xl border border-primary-200 shadow-inner animate-fade-in">
              <div className="mb-2 font-semibold text-primary-700">Select Sections:</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {defaultTemplate.sections.map(section => (
                  <label key={section} className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded border border-primary-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={template.sections.includes(section)}
                      onChange={e => {
                        setTemplate(t => ({
                          ...t,
                          sections: e.target.checked
                            ? [...t.sections, section]
                            : t.sections.filter(s => s !== section)
                        }));
                      }}
                    />
                    <span>{section}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {template.sections.includes("Title & Objective") && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Experiment Title</label>
                <input
                  type="text"
                  value={inputs.title}
                  onChange={e => setInputs(i => ({ ...i, title: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                  placeholder="e.g. Determining the Acceleration due to Gravity"
                />
                <label className="block text-sm font-medium text-primary-700 mt-4 mb-1">Objective</label>
                <input
                  type="text"
                  value={inputs.objective}
                  onChange={e => setInputs(i => ({ ...i, objective: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                  placeholder="e.g. To measure the acceleration due to gravity using a pendulum."
                />
              </div>
            )}
            {template.sections.includes("Hypothesis") && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Hypothesis</label>
                <input
                  type="text"
                  value={inputs.hypothesis}
                  onChange={e => setInputs(i => ({ ...i, hypothesis: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                  placeholder="e.g. The period of a pendulum is independent of its mass."
                />
              </div>
            )}
            {template.sections.includes("Materials & Methods") && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-700 mb-1">Materials</label>
                <textarea
                  value={inputs.materials}
                  onChange={e => setInputs(i => ({ ...i, materials: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                  rows={2}
                  placeholder="List all materials used..."
                />
                <label className="block text-sm font-medium text-primary-700 mt-2 mb-1">Methods</label>
                <textarea
                  value={inputs.methods}
                  onChange={e => setInputs(i => ({ ...i, methods: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                  rows={2}
                  placeholder="Describe the procedure..."
                />
              </div>
            )}
            {template.sections.includes("Data Table") && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-700 mb-1 flex items-center gap-1"><Table className="h-4 w-4 text-primary-400" /> Data Table</label>
                <textarea
                  value={inputs.data}
                  onChange={e => setInputs(i => ({ ...i, data: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80 font-mono"
                  rows={3}
                  placeholder="Paste or type your data table (CSV, Markdown, or plain text)"
                />
              </div>
            )}
            {template.sections.includes("Results & Graphs") && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-700 mb-1 flex items-center gap-1"><BarChart2 className="h-4 w-4 text-primary-400" /> Results & Graphs</label>
                <textarea
                  value={inputs.results}
                  onChange={e => setInputs(i => ({ ...i, results: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                  rows={3}
                  placeholder="Describe results, paste chart data, or upload below."
                />
                {/* Placeholder for chart upload/preview */}
              </div>
            )}
            {template.sections.includes("Conclusion") && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Conclusion</label>
                <textarea
                  value={inputs.conclusion}
                  onChange={e => setInputs(i => ({ ...i, conclusion: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                  rows={2}
                  placeholder="Summarize your findings..."
                />
              </div>
            )}
            {template.sections.includes("Error Analysis") && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Error Analysis</label>
                <textarea
                  value={inputs.errors}
                  onChange={e => setInputs(i => ({ ...i, errors: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                  rows={2}
                  placeholder="Discuss possible errors and improvements..."
                />
              </div>
            )}
            {template.sections.includes("References") && (
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">References</label>
                <textarea
                  value={inputs.references}
                  onChange={e => setInputs(i => ({ ...i, references: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                  rows={2}
                  placeholder="List all references in proper format..."
                />
              </div>
            )}
            <div className="md:col-span-2 flex flex-wrap gap-4 mt-2">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-medium text-primary-700 mb-1 flex items-center gap-1"><Sigma className="h-4 w-4 text-primary-400" /> Formulas (LaTeX supported)</label>
                <textarea
                  value={inputs.formulas}
                  onChange={e => setInputs(i => ({ ...i, formulas: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80 font-mono"
                  rows={2}
                  placeholder="Paste or type formulas (LaTeX supported)"
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-medium text-primary-700 mb-1 flex items-center gap-1"><ImagePlus className="h-4 w-4 text-primary-400" /> Images/Diagrams</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e => setInputs(i => ({ ...i, images: Array.from(e.target.files || []) }))}
                  className="w-full px-4 py-2 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:outline-none bg-white/80"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6 gap-2">
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white rounded-lg font-semibold shadow"
            >Generate Report</button>
            <button
              onClick={() => handleExport("pdf")}
              className="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg font-semibold flex items-center gap-1"
            ><Download className="h-4 w-4" /> PDF</button>
            <button
              onClick={() => handleExport("word")}
              className="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg font-semibold flex items-center gap-1"
            ><Download className="h-4 w-4" /> Word</button>
            <button
              onClick={() => handleExport("latex")}
              className="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg font-semibold flex items-center gap-1"
            ><Download className="h-4 w-4" /> LaTeX</button>
          </div>
        </div>
        {/* Generated Report Preview */}
        {generated && (
          <div className="card shadow-lg border-2 border-primary-100 bg-white/80 mt-8 p-6">
            <h2 className="text-xl font-bold text-primary-700 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-400" /> Generated Report Preview
            </h2>
            <div ref={reportRef} className="prose max-w-none bg-primary-50 p-4 rounded-lg border border-primary-100 overflow-x-auto">
              {generated.split(/\n/g).map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
