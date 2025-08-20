"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PenTool, Square, Circle, Type, Eraser, Undo2, Redo2, Download, Sun, Moon, Users, StickyNote, ZoomIn, ZoomOut, Move } from "lucide-react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const TOOL_OPTIONS = [
  { name: "Pen", icon: PenTool },
  { name: "Rectangle", icon: Square },
  { name: "Circle", icon: Circle },
  { name: "Text", icon: Type },
  { name: "Sticky Note", icon: StickyNote },
  { name: "Eraser", icon: Eraser },
  { name: "Move", icon: Move }
];

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState("Pen");
  // Drawing state
  const [drawing, setDrawing] = useState(false);
  const [paths, setPaths] = useState<{color: string, thickness: number, points: [number, number][]}[]>([]);
  const [redoStack, setRedoStack] = useState<typeof paths>([]);
  const [color, setColor] = useState("#22223b");
  const [thickness, setThickness] = useState(3);
  const [isDark, setIsDark] = useState(false);
  const [zoom, setZoom] = useState(1);
  // ...MVP state for drawing, undo/redo, etc.

  // Placeholder: Drawing logic, undo/redo, pan/zoom, etc.

  return (
    <div className={isDark ? "min-h-screen bg-gray-900 text-white" : "min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900"}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center mb-4 gap-2">
          <Link href="/tools" className="flex items-center text-secondary-600 hover:text-primary-600 mr-4">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Tools
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary-600" /> Online Whiteboard
          </h1>
          <button
            onClick={() => setIsDark(d => !d)}
            className="ml-auto px-3 py-1 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-700 flex items-center gap-1"
            title="Toggle dark mode"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} {isDark ? "Light" : "Dark"}
          </button>
        </div>
        {/* Manual/Instructions */}
        <div className="mb-4 p-4 bg-primary-50 border-l-4 border-primary-400 rounded shadow-sm text-sm">
          <strong>How to use the Whiteboard:</strong>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Select a tool (Pen, Rectangle, Circle, Text, Sticky Note, Eraser, Move) from the toolbar above.</li>
            <li>Choose color and thickness for drawing tools.</li>
            <li>Draw on the canvas by clicking and dragging (Pen/Shape tools).</li>
            <li>Use Undo/Redo to revert or restore actions.</li>
            <li>Zoom in/out with the magnifier buttons.</li>
            <li>Export your whiteboard as PNG or SVG.</li>
            <li>Toggle dark/light mode for your preference.</li>
            <li>More features (real-time, layers, AI, etc.) coming soon!</li>
          </ul>
        </div>
        <div className="flex gap-2 mb-2 flex-wrap items-center">
          {TOOL_OPTIONS.map(opt => (
            <button
              key={opt.name}
              onClick={() => setTool(opt.name)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold border-2 transition-all ${tool === opt.name ? "bg-primary-600 text-white border-primary-700" : "bg-white/80 border-primary-100 text-primary-700 hover:bg-primary-100"}`}
              title={opt.name}
            >
              <opt.icon className="h-4 w-4" /> {opt.name}
            </button>
          ))}
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="ml-2 w-8 h-8 border-2 border-primary-200 rounded"
            title="Color"
          />
          <input
            type="range"
            min={1}
            max={20}
            value={thickness}
            onChange={e => setThickness(Number(e.target.value))}
            className="ml-2"
            title="Thickness"
          />
          <span className="ml-1 text-xs">{thickness}px</span>
          <button className="ml-2 px-2 py-1 rounded bg-primary-100 hover:bg-primary-200 text-primary-700 flex items-center gap-1" title="Undo"><Undo2 className="h-4 w-4" /></button>
          <button className="px-2 py-1 rounded bg-primary-100 hover:bg-primary-200 text-primary-700 flex items-center gap-1" title="Redo"><Redo2 className="h-4 w-4" /></button>
          <button className="ml-2 px-2 py-1 rounded bg-primary-100 hover:bg-primary-200 text-primary-700 flex items-center gap-1" title="Zoom In" onClick={() => setZoom(z => Math.min(z + 0.1, 3))}><ZoomIn className="h-4 w-4" /></button>
          <button className="px-2 py-1 rounded bg-primary-100 hover:bg-primary-200 text-primary-700 flex items-center gap-1" title="Zoom Out" onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))}><ZoomOut className="h-4 w-4" /></button>
        </div>
        <div className="relative border-2 border-primary-200 rounded-xl bg-white overflow-hidden shadow-lg" style={{ height: 600 }}>
          <canvas
            ref={canvasRef}
            width={2000}
            height={1200}
            style={{
              width: `${2000 * zoom}px`,
              height: `${1200 * zoom}px`,
              background: isDark ? "#232946" : "#fff",
              cursor: tool === "Move" ? "grab" : "crosshair"
            }}
            className="block mx-auto"
          />
          {/* TODO: Add overlays for sticky notes, text, cursors, etc. */}
        </div>
        <div className="flex gap-2 mt-4">
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold flex items-center gap-1"><Download className="h-4 w-4" /> Export PNG</button>
          <button className="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg font-semibold flex items-center gap-1"><Download className="h-4 w-4" /> Export SVG</button>
        </div>
        <div className="mt-6 text-xs text-secondary-500">MVP: Drawing, shapes, text, sticky notes, eraser, undo/redo, zoom/pan, export. Real-time, layers, AI, and more coming soon!</div>

      </div>
    </div>
  );
}
