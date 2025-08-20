'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Share2,
  Palette,
  Brain,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Mic,
  Users,
  LayoutTemplate,
  Bot,
  Eye,
  EyeOff,
  Copy,
  Layout,
  Circle,
  Square,
  Triangle,
  Star,
  Heart,
  Lightbulb,
  Target,
  Flag,
  BookOpen,
  Calculator,
  Globe
} from 'lucide-react';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  textColor: string;
  fontSize: number;
  shape: 'circle' | 'rectangle' | 'ellipse' | 'triangle' | 'diamond';
  icon?: string;
  parent?: string;
  children: string[];
  attachments: {
    type: 'link' | 'image' | 'formula' | 'note';
    content: string;
    title?: string;
  }[];
  isCollapsed: boolean;
  notes: string;
  tags: string[];
}

interface MindMap {
  id: string;
  title: string;
  description: string;
  nodes: { [key: string]: MindMapNode };
  connections: { from: string; to: string }[];
  layout: 'free' | 'radial' | 'tree' | 'hierarchical';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  template?: string;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const SHAPES = [
  { name: 'circle', icon: Circle, label: 'Circle' },
  { name: 'rectangle', icon: Square, label: 'Rectangle' },
  { name: 'ellipse', icon: Circle, label: 'Ellipse' },
  { name: 'triangle', icon: Triangle, label: 'Triangle' },
  { name: 'diamond', icon: Star, label: 'Diamond' }
];

const ICONS = [
  { name: 'lightbulb', icon: Lightbulb, label: 'Idea' },
  { name: 'target', icon: Target, label: 'Goal' },
  { name: 'flag', icon: Flag, label: 'Important' },
  { name: 'book', icon: BookOpen, label: 'Study' },
  { name: 'calculator', icon: Calculator, label: 'Math' },
  { name: 'globe', icon: Globe, label: 'Global' },
  { name: 'heart', icon: Heart, label: 'Favorite' },
  { name: 'star', icon: Star, label: 'Star' }
];

const TEMPLATES = [
  {
    id: 'project-planning',
    name: 'Project Planning',
    description: 'Organize your project into phases and tasks',
    icon: Target
  },
  {
    id: 'exam-revision',
    name: 'Exam Revision',
    description: 'Structure your exam topics and subtopics',
    icon: BookOpen
  },
  {
    id: 'brainstorming',
    name: 'Brainstorming',
    description: 'Generate and organize creative ideas',
    icon: Lightbulb
  },
  {
    id: 'concept-mapping',
    name: 'Concept Mapping',
    description: 'Visualize relationships between concepts',
    icon: Brain
  }
];

export default function MindMapCreator() {
  const [mindMap, setMindMap] = useState<MindMap>({
    id: '',
    title: 'New Mind Map',
    description: '',
    nodes: {},
    connections: [],
    layout: 'free',
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    nodeId: string | null;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  }>({
    isDragging: false,
    nodeId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  });
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showNotesConverter, setShowNotesConverter] = useState(false);
  const [savedMaps, setSavedMaps] = useState<MindMap[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [notesContent, setNotesContent] = useState('');
  const [notesFormat, setNotesFormat] = useState<'markdown' | 'plain'>('plain');
  const [isConvertingNotes, setIsConvertingNotes] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved maps on component mount
  useEffect(() => {
    const saved = localStorage.getItem('student_tools_mindmaps');
    if (saved) {
      setSavedMaps(JSON.parse(saved));
    }
  }, []);

  // Create a new node
  const createNode = useCallback((x: number = 400, y: number = 300, text: string = 'New Node', parentId?: string) => {
    const id = Date.now().toString();
    const newNode: MindMapNode = {
      id,
      text,
      x,
      y,
      width: 120,
      height: 60,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      textColor: '#FFFFFF',
      fontSize: 14,
      shape: 'rectangle',
      children: [],
      attachments: [],
      isCollapsed: false,
      notes: '',
      tags: [],
      parent: parentId
    };

    setMindMap(prev => {
      const updated = {
        ...prev,
        nodes: {
          ...prev.nodes,
          [id]: newNode
        },
        updatedAt: new Date().toISOString()
      };

      // Add connection if there's a parent
      if (parentId && prev.nodes[parentId]) {
        updated.nodes[parentId].children.push(id);
        updated.connections.push({ from: parentId, to: id });
      }

      return updated;
    });

    return id;
  }, []);

  // Initialize with center node
  useEffect(() => {
    if (Object.keys(mindMap.nodes).length === 0) {
      createNode(400, 300, 'Central Topic');
    }
  }, [createNode, mindMap.nodes]);

  // Update node
  const updateNode = useCallback((nodeId: string, updates: Partial<MindMapNode>) => {
    setMindMap(prev => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [nodeId]: { ...prev.nodes[nodeId], ...updates }
      },
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // Delete node
  const deleteNode = useCallback((nodeId: string) => {
    setMindMap(prev => {
      const node = prev.nodes[nodeId];
      if (!node) return prev;

      const newNodes = { ...prev.nodes };
      const newConnections = prev.connections.filter(
        conn => conn.from !== nodeId && conn.to !== nodeId
      );

      // Remove from parent's children
      if (node.parent && newNodes[node.parent]) {
        newNodes[node.parent].children = newNodes[node.parent].children.filter(
          childId => childId !== nodeId
        );
      }

      // Delete children recursively
      const deleteChildren = (id: string) => {
        const children = newNodes[id]?.children || [];
        children.forEach(childId => {
          deleteChildren(childId);
          delete newNodes[childId];
        });
      };

      deleteChildren(nodeId);
      delete newNodes[nodeId];

      return {
        ...prev,
        nodes: newNodes,
        connections: newConnections,
        updatedAt: new Date().toISOString()
      };
    });
    
    setSelectedNode(null);
  }, []);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null);
      setShowStylePanel(false);
    }
  }, []);

  // Handle canvas panning
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current && !dragState.isDragging) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [dragState.isDragging]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && !dragState.isDragging) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPan(prev => ({
        x: prev.x + deltaX / zoom,
        y: prev.y + deltaY / zoom
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else if (dragState.isDragging && dragState.nodeId) {
      // Handle node dragging
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const newX = (e.clientX - rect.left - pan.x * zoom) / zoom - dragState.offsetX;
      const newY = (e.clientY - rect.top - pan.y * zoom) / zoom - dragState.offsetY;

      updateNode(dragState.nodeId, { x: newX, y: newY });
    }
  }, [isPanning, lastPanPoint, zoom, dragState, pan, updateNode]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragState({
      isDragging: false,
      nodeId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0
    });
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(nodeId);
    setShowStylePanel(true);
  }, []);

  // Handle node double click (edit)
  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    setIsEditing(true);
    setSelectedNode(nodeId);
  }, []);

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const nodeX = (mindMap.nodes[nodeId].x * zoom) + (pan.x * zoom);
    const nodeY = (mindMap.nodes[nodeId].y * zoom) + (pan.y * zoom);

    setDragState({
      isDragging: true,
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left - nodeX,
      offsetY: e.clientY - rect.top - nodeY
    });
  }, [mindMap.nodes, zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleCanvasMouseMove(e);
  }, [handleCanvasMouseMove]);

  const handleMouseUp = useCallback(() => {
    handleCanvasMouseUp();
  }, [handleCanvasMouseUp]);

  // Add child node
  const addChildNode = useCallback((parentId: string) => {
    const parent = mindMap.nodes[parentId];
    if (!parent) return;

    const angle = (parent.children.length * 60) * (Math.PI / 180);
    const radius = 150;
    const x = parent.x + Math.cos(angle) * radius;
    const y = parent.y + Math.sin(angle) * radius;

    createNode(x, y, 'New Topic', parentId);
  }, [mindMap.nodes, createNode]);

  // Save mind map
  const saveMindMap = useCallback(() => {
    const updatedMap = {
      ...mindMap,
      id: mindMap.id || Date.now().toString(),
      updatedAt: new Date().toISOString()
    };

    setMindMap(updatedMap);

    const existingIndex = savedMaps.findIndex(map => map.id === updatedMap.id);
    const newSavedMaps = existingIndex >= 0 
      ? savedMaps.map((map, index) => index === existingIndex ? updatedMap : map)
      : [...savedMaps, updatedMap];

    setSavedMaps(newSavedMaps);
    localStorage.setItem('student_tools_mindmaps', JSON.stringify(newSavedMaps));
    
    alert('Mind map saved successfully!');
  }, [mindMap, savedMaps]);

  // Load mind map
  const loadMindMap = useCallback((mapData: MindMap) => {
    setMindMap(mapData);
    setSelectedNode(null);
    setShowStylePanel(false);
    setShowTemplates(false);
  }, []);

  // Export mind map
  const exportMindMap = useCallback(async (format: 'png' | 'pdf' | 'svg' | 'json') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(mindMap, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${mindMap.title}.json`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Create a larger canvas for better quality export
    const canvas = document.createElement('canvas');
    const canvasWidth = 2400;
    const canvasHeight = 1600;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate bounds of all nodes
    const nodes = Object.values(mindMap.nodes);
    if (nodes.length === 0) return;

    const minX = Math.min(...nodes.map(n => n.x - n.width / 2));
    const maxX = Math.max(...nodes.map(n => n.x + n.width / 2));
    const minY = Math.min(...nodes.map(n => n.y - n.height / 2));
    const maxY = Math.max(...nodes.map(n => n.y + n.height / 2));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Calculate scale to fit content in canvas with margins
    const margin = 100;
    const scaleX = (canvasWidth - 2 * margin) / contentWidth;
    const scaleY = (canvasHeight - 2 * margin) / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1.5); // Don't scale too much

    // Calculate offset to center content
    const offsetX = margin + (canvasWidth - 2 * margin - contentWidth * scale) / 2 - minX * scale;
    const offsetY = margin + (canvasHeight - 2 * margin - contentHeight * scale) / 2 - minY * scale;

    // Draw connections first
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 3 * scale;
    ctx.lineCap = 'round';

    mindMap.connections.forEach(connection => {
      const fromNode = mindMap.nodes[connection.from];
      const toNode = mindMap.nodes[connection.to];
      
      if (!fromNode || !toNode || fromNode.isCollapsed || toNode.isCollapsed) return;

      const startX = fromNode.x * scale + offsetX;
      const startY = fromNode.y * scale + offsetY;
      const endX = toNode.x * scale + offsetX;
      const endY = toNode.y * scale + offsetY;

      // Calculate arrow direction
      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const fromRadius = Math.max(fromNode.width, fromNode.height) / 2 * scale;
        const toRadius = Math.max(toNode.width, toNode.height) / 2 * scale;
        
        const fromOffsetX = (dx / distance) * fromRadius;
        const fromOffsetY = (dy / distance) * fromRadius;
        const toOffsetX = (dx / distance) * toRadius;
        const toOffsetY = (dy / distance) * toRadius;

        const connectionStartX = startX + fromOffsetX;
        const connectionStartY = startY + fromOffsetY;
        const connectionEndX = endX - toOffsetX;
        const connectionEndY = endY - toOffsetY;

        ctx.beginPath();
        ctx.moveTo(connectionStartX, connectionStartY);
        ctx.lineTo(connectionEndX, connectionEndY);
        ctx.stroke();

        // Draw arrowhead
        const arrowLength = 15 * scale;
        const arrowAngle = Math.PI / 6;
        const angle = Math.atan2(dy, dx);

        ctx.beginPath();
        ctx.moveTo(connectionEndX, connectionEndY);
        ctx.lineTo(
          connectionEndX - arrowLength * Math.cos(angle - arrowAngle),
          connectionEndY - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(connectionEndX, connectionEndY);
        ctx.lineTo(
          connectionEndX - arrowLength * Math.cos(angle + arrowAngle),
          connectionEndY - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const x = node.x * scale + offsetX;
      const y = node.y * scale + offsetY;
      const width = node.width * scale;
      const height = node.height * scale;

      // Save context for transformations
      ctx.save();

      // Draw node background
      ctx.fillStyle = node.color;
      
      if (node.shape === 'circle' || node.shape === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(x, y, width / 2, height / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
      } else if (node.shape === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(x, y - height / 2);
        ctx.lineTo(x + width / 2, y);
        ctx.lineTo(x, y + height / 2);
        ctx.lineTo(x - width / 2, y);
        ctx.closePath();
        ctx.fill();
      } else {
        // Rectangle and other shapes
        const borderRadius = 8 * scale;
        ctx.beginPath();
        ctx.roundRect(x - width / 2, y - height / 2, width, height, borderRadius);
        ctx.fill();
      }

      // Draw text
      ctx.fillStyle = node.textColor;
      ctx.font = `${node.fontSize * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Handle text wrapping
      const maxWidth = width * 0.8;
      const words = node.text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      
      if (currentLine) {
        lines.push(currentLine);
      }

      // Draw text lines
      const lineHeight = node.fontSize * scale * 1.2;
      const totalTextHeight = lines.length * lineHeight;
      const startY = y - totalTextHeight / 2 + lineHeight / 2;

      lines.forEach((line, index) => {
        ctx.fillText(line, x, startY + index * lineHeight);
      });

      ctx.restore();
    });

    // Handle different export formats
    if (format === 'pdf') {
      // For PDF, we'll convert canvas to image first
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        // Dynamic import of jsPDF
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({
          orientation: canvasWidth > canvasHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvasWidth, canvasHeight]
        });

        const reader = new FileReader();
        reader.onload = function() {
          const imgData = reader.result as string;
          pdf.addImage(imgData, 'PNG', 0, 0, canvasWidth, canvasHeight);
          pdf.save(`${mindMap.title}.pdf`);
        };
        reader.readAsDataURL(blob);
      }, 'image/png', 0.95);
    } else {
      // Convert to blob and download for PNG/JPEG
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${mindMap.title}.${format}`;
        link.click();
        URL.revokeObjectURL(url);
      }, format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
    }
  }, [mindMap]);

  // Generate AI mind map
  const generateAIMindMap = useCallback(async () => {
    if (!aiTopic.trim()) {
      alert('Please enter a topic for AI generation');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/mind-map-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic })
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate mind map');
      }

      // Apply AI generated structure
      setMindMap(prev => ({
        ...prev,
        title: aiTopic,
        nodes: data.result.nodes,
        connections: data.result.connections,
        updatedAt: new Date().toISOString()
      }));

      setAiTopic('');
      alert('AI mind map generated successfully!');
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Error generating AI mind map: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    setIsGeneratingAI(false);
  }, [aiTopic]);

  // Convert notes to mind map
  const convertNotesToMindMap = useCallback(async () => {
    if (!notesContent.trim()) {
      alert('Please enter some notes to convert');
      return;
    }

    setIsConvertingNotes(true);
    try {
      const response = await fetch('/api/notes-to-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notes: notesContent,
          format: notesFormat
        })
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to convert notes');
      }

      // Apply converted structure
      setMindMap(prev => ({
        ...prev,
        title: `Notes: ${notesContent.split('\n')[0].substring(0, 30)}...`,
        nodes: data.result.nodes,
        connections: data.result.connections,
        updatedAt: new Date().toISOString()
      }));

      setNotesContent('');
      setShowNotesConverter(false);
      alert('Notes converted to mind map successfully!');
    } catch (error) {
      console.error('Notes conversion error:', error);
      alert('Error converting notes: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    setIsConvertingNotes(false);
  }, [notesContent, notesFormat]);

  // Auto layout function
  const autoLayout = useCallback((layoutType: 'radial' | 'tree' | 'hierarchical') => {
    const nodes = { ...mindMap.nodes };
    const centerNode = Object.values(nodes).find(node => !node.parent);
    
    if (!centerNode) return;

    if (layoutType === 'radial') {
      // Radial layout - arrange nodes in circles
      const levels: { [key: string]: MindMapNode[] } = { '1': [centerNode] };
      
      // Group nodes by level
      Object.values(nodes).forEach(node => {
        if (node.parent) {
          const parentLevel = parseInt(Object.keys(levels).find(level => 
            levels[level].some(n => n.id === node.parent)
          ) || '1');
          const nodeLevel = (parentLevel + 1).toString();
          
          if (!levels[nodeLevel]) levels[nodeLevel] = [];
          levels[nodeLevel].push(node);
        }
      });

      // Position nodes
      Object.keys(levels).forEach(level => {
        const levelNodes = levels[level];
        const radius = parseInt(level) * 150;
        
        levelNodes.forEach((node, index) => {
          if (parseInt(level) === 1) {
            // Center node
            nodes[node.id] = { ...node, x: 400, y: 300 };
          } else {
            // Arrange in circle
            const angle = (index * 360 / levelNodes.length) * (Math.PI / 180);
            const x = 400 + Math.cos(angle) * radius;
            const y = 300 + Math.sin(angle) * radius;
            nodes[node.id] = { ...node, x, y };
          }
        });
      });
    } else if (layoutType === 'tree') {
      // Tree layout - hierarchical top-down
      const positionNode = (node: MindMapNode, x: number, y: number, level: number) => {
        nodes[node.id] = { ...node, x, y };
        
        const children = Object.values(nodes).filter(n => n.parent === node.id);
        if (children.length > 0) {
          const childSpacing = 200;
          const startX = x - (children.length - 1) * childSpacing / 2;
          
          children.forEach((child, index) => {
            positionNode(child, startX + index * childSpacing, y + 120, level + 1);
          });
        }
      };
      
      positionNode(centerNode, 400, 100, 0);
    }

    setMindMap(prev => ({
      ...prev,
      nodes,
      layout: layoutType,
      updatedAt: new Date().toISOString()
    }));
  }, [mindMap]);

  // Share mind map
  const shareMindMap = useCallback(async () => {
    try {
      const response = await fetch('/api/mind-map-collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share',
          data: {
            ...mindMap,
            isPublic: true
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to share mind map');
      }

      // Copy share link to clipboard
      const shareUrl = data.shareUrl;
      await navigator.clipboard.writeText(shareUrl);
      
      alert(`Mind map shared successfully! Share link copied to clipboard.\n\nShare URL: ${shareUrl}`);
    } catch (error) {
      console.error('Share error:', error);
      alert('Error sharing mind map: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [mindMap]);

  // Voice input (simplified)
  const startVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (selectedNode) {
        updateNode(selectedNode, { text: transcript });
      } else {
        createNode(400 + Math.random() * 200, 300 + Math.random() * 200, transcript);
      }
    };

    recognition.start();
  }, [selectedNode, updateNode, createNode]);

  // Load template
  const loadTemplate = useCallback((templateId: string) => {
    const templates: { [key: string]: Partial<MindMap> } = {
      'project-planning': {
        title: 'Project Planning',
        nodes: {
          '1': { id: '1', text: 'Project Goal', x: 1000, y: 750, width: 140, height: 70, color: '#3B82F6', textColor: '#FFFFFF', fontSize: 16, shape: 'circle', children: ['2', '3', '4'], attachments: [], isCollapsed: false, notes: '', tags: [] },
          '2': { id: '2', text: 'Phase 1: Planning', x: 700, y: 600, width: 130, height: 60, color: '#10B981', textColor: '#FFFFFF', fontSize: 14, shape: 'rectangle', children: ['5', '6'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '3': { id: '3', text: 'Phase 2: Development', x: 1000, y: 550, width: 150, height: 60, color: '#F59E0B', textColor: '#FFFFFF', fontSize: 14, shape: 'rectangle', children: ['7', '8'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '4': { id: '4', text: 'Phase 3: Testing', x: 1300, y: 600, width: 130, height: 60, color: '#EF4444', textColor: '#FFFFFF', fontSize: 14, shape: 'rectangle', children: ['9', '10'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '5': { id: '5', text: 'Requirements', x: 600, y: 450, width: 110, height: 50, color: '#06B6D4', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '2' },
          '6': { id: '6', text: 'Resources', x: 800, y: 450, width: 100, height: 50, color: '#06B6D4', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '2' },
          '7': { id: '7', text: 'Coding', x: 900, y: 400, width: 90, height: 50, color: '#84CC16', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '3' },
          '8': { id: '8', text: 'Documentation', x: 1100, y: 400, width: 120, height: 50, color: '#84CC16', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '3' },
          '9': { id: '9', text: 'Unit Testing', x: 1200, y: 450, width: 110, height: 50, color: '#F97316', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '4' },
          '10': { id: '10', text: 'Integration', x: 1400, y: 450, width: 110, height: 50, color: '#F97316', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '4' }
        },
        connections: [
          { from: '1', to: '2' },
          { from: '1', to: '3' },
          { from: '1', to: '4' },
          { from: '2', to: '5' },
          { from: '2', to: '6' },
          { from: '3', to: '7' },
          { from: '3', to: '8' },
          { from: '4', to: '9' },
          { from: '4', to: '10' }
        ]
      },
      'exam-revision': {
        title: 'Exam Revision',
        nodes: {
          '1': { id: '1', text: 'Subject Study Plan', x: 1000, y: 750, width: 160, height: 70, color: '#8B5CF6', textColor: '#FFFFFF', fontSize: 16, shape: 'circle', children: ['2', '3', '4'], attachments: [], isCollapsed: false, notes: '', tags: [] },
          '2': { id: '2', text: 'Chapter 1: Basics', x: 700, y: 600, width: 140, height: 60, color: '#06B6D4', textColor: '#FFFFFF', fontSize: 14, shape: 'rectangle', children: ['5', '6'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '3': { id: '3', text: 'Chapter 2: Advanced', x: 1000, y: 550, width: 150, height: 60, color: '#84CC16', textColor: '#FFFFFF', fontSize: 14, shape: 'rectangle', children: ['7', '8'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '4': { id: '4', text: 'Chapter 3: Practice', x: 1300, y: 600, width: 150, height: 60, color: '#F97316', textColor: '#FFFFFF', fontSize: 14, shape: 'rectangle', children: ['9', '10'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '5': { id: '5', text: 'Key Concepts', x: 600, y: 450, width: 110, height: 50, color: '#EC4899', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '2' },
          '6': { id: '6', text: 'Formulas', x: 800, y: 450, width: 100, height: 50, color: '#EC4899', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '2' },
          '7': { id: '7', text: 'Theorems', x: 900, y: 400, width: 100, height: 50, color: '#6366F1', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '3' },
          '8': { id: '8', text: 'Applications', x: 1100, y: 400, width: 110, height: 50, color: '#6366F1', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '3' },
          '9': { id: '9', text: 'Sample Problems', x: 1200, y: 450, width: 130, height: 50, color: '#10B981', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '4' },
          '10': { id: '10', text: 'Mock Tests', x: 1400, y: 450, width: 100, height: 50, color: '#10B981', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '4' }
        },
        connections: [
          { from: '1', to: '2' },
          { from: '1', to: '3' },
          { from: '1', to: '4' },
          { from: '2', to: '5' },
          { from: '2', to: '6' },
          { from: '3', to: '7' },
          { from: '3', to: '8' },
          { from: '4', to: '9' },
          { from: '4', to: '10' }
        ]
      },
      'brainstorming': {
        title: 'Brainstorming Session',
        nodes: {
          '1': { id: '1', text: 'Main Idea', x: 1000, y: 750, width: 140, height: 70, color: '#F59E0B', textColor: '#FFFFFF', fontSize: 16, shape: 'circle', children: ['2', '3', '4', '5', '6'], attachments: [], isCollapsed: false, notes: '', tags: [] },
          '2': { id: '2', text: 'Creative Solutions', x: 800, y: 550, width: 140, height: 60, color: '#EC4899', textColor: '#FFFFFF', fontSize: 14, shape: 'ellipse', children: ['7', '8'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '3': { id: '3', text: 'Innovative Approaches', x: 1200, y: 550, width: 160, height: 60, color: '#8B5CF6', textColor: '#FFFFFF', fontSize: 14, shape: 'ellipse', children: ['9', '10'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '4': { id: '4', text: 'Quick Wins', x: 700, y: 900, width: 120, height: 60, color: '#10B981', textColor: '#FFFFFF', fontSize: 14, shape: 'rectangle', children: ['11'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '5': { id: '5', text: 'Long-term Goals', x: 1000, y: 950, width: 140, height: 60, color: '#3B82F6', textColor: '#FFFFFF', fontSize: 14, shape: 'rectangle', children: ['12'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '6': { id: '6', text: 'Wild Ideas', x: 1300, y: 900, width: 120, height: 60, color: '#EF4444', textColor: '#FFFFFF', fontSize: 14, shape: 'diamond', children: ['13'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '7': { id: '7', text: 'Technology', x: 700, y: 400, width: 100, height: 50, color: '#06B6D4', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '2' },
          '8': { id: '8', text: 'Process', x: 900, y: 400, width: 90, height: 50, color: '#06B6D4', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '2' },
          '9': { id: '9', text: 'Design Thinking', x: 1100, y: 400, width: 130, height: 50, color: '#84CC16', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '3' },
          '10': { id: '10', text: 'Methodology', x: 1300, y: 400, width: 110, height: 50, color: '#84CC16', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '3' },
          '11': { id: '11', text: 'Immediate Actions', x: 600, y: 1050, width: 130, height: 50, color: '#F97316', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '4' },
          '12': { id: '12', text: 'Strategic Vision', x: 1000, y: 1100, width: 120, height: 50, color: '#6366F1', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '5' },
          '13': { id: '13', text: 'Crazy Concepts', x: 1400, y: 1050, width: 120, height: 50, color: '#EF4444', textColor: '#FFFFFF', fontSize: 12, shape: 'diamond', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '6' }
        },
        connections: [
          { from: '1', to: '2' },
          { from: '1', to: '3' },
          { from: '1', to: '4' },
          { from: '1', to: '5' },
          { from: '1', to: '6' },
          { from: '2', to: '7' },
          { from: '2', to: '8' },
          { from: '3', to: '9' },
          { from: '3', to: '10' },
          { from: '4', to: '11' },
          { from: '5', to: '12' },
          { from: '6', to: '13' }
        ]
      },
      'concept-mapping': {
        title: 'Concept Mapping',
        nodes: {
          '1': { id: '1', text: 'Core Concept', x: 1000, y: 750, width: 140, height: 70, color: '#6366F1', textColor: '#FFFFFF', fontSize: 16, shape: 'circle', children: ['2', '3', '4'], attachments: [], isCollapsed: false, notes: '', tags: [] },
          '2': { id: '2', text: 'Related Concept A', x: 700, y: 600, width: 150, height: 60, color: '#8B5CF6', textColor: '#FFFFFF', fontSize: 14, shape: 'ellipse', children: ['5', '6'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '3': { id: '3', text: 'Related Concept B', x: 1000, y: 550, width: 150, height: 60, color: '#EC4899', textColor: '#FFFFFF', fontSize: 14, shape: 'ellipse', children: ['7', '8'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '4': { id: '4', text: 'Related Concept C', x: 1300, y: 600, width: 150, height: 60, color: '#F59E0B', textColor: '#FFFFFF', fontSize: 14, shape: 'ellipse', children: ['9', '10'], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '1' },
          '5': { id: '5', text: 'Property 1', x: 600, y: 450, width: 100, height: 50, color: '#10B981', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '2' },
          '6': { id: '6', text: 'Property 2', x: 800, y: 450, width: 100, height: 50, color: '#10B981', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '2' },
          '7': { id: '7', text: 'Characteristic 1', x: 900, y: 400, width: 120, height: 50, color: '#06B6D4', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '3' },
          '8': { id: '8', text: 'Characteristic 2', x: 1100, y: 400, width: 120, height: 50, color: '#06B6D4', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '3' },
          '9': { id: '9', text: 'Example 1', x: 1200, y: 450, width: 100, height: 50, color: '#84CC16', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '4' },
          '10': { id: '10', text: 'Example 2', x: 1400, y: 450, width: 100, height: 50, color: '#84CC16', textColor: '#FFFFFF', fontSize: 12, shape: 'rectangle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [], parent: '4' },
          '11': { id: '11', text: 'Connection Point', x: 1000, y: 900, width: 130, height: 60, color: '#EF4444', textColor: '#FFFFFF', fontSize: 14, shape: 'diamond', children: [], attachments: [], isCollapsed: false, notes: '', tags: [] }
        },
        connections: [
          { from: '1', to: '2' },
          { from: '1', to: '3' },
          { from: '1', to: '4' },
          { from: '2', to: '5' },
          { from: '2', to: '6' },
          { from: '3', to: '7' },
          { from: '3', to: '8' },
          { from: '4', to: '9' },
          { from: '4', to: '10' },
          { from: '2', to: '11' },
          { from: '3', to: '11' },
          { from: '4', to: '11' }
        ]
      },
      'blank': {
        title: 'New Mind Map',
        nodes: {
          '1': { id: '1', text: 'Central Topic', x: 1000, y: 750, width: 140, height: 70, color: '#8B5CF6', textColor: '#FFFFFF', fontSize: 16, shape: 'circle', children: [], attachments: [], isCollapsed: false, notes: '', tags: [] }
        },
        connections: []
      }
    };

    const template = templates[templateId];
    if (template) {
      setMindMap(prev => ({
        ...prev,
        ...template,
        id: Date.now().toString(),
        description: '',
        layout: 'free',
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      setShowTemplates(false);
      setSelectedNode(null);
      setShowStylePanel(false);
    }
  }, []);

  // Render connection lines
  const renderConnections = () => {
    return mindMap.connections.map((connection, index) => {
      const fromNode = mindMap.nodes[connection.from];
      const toNode = mindMap.nodes[connection.to];
      
      if (!fromNode || !toNode || fromNode.isCollapsed || toNode.isCollapsed) return null;

      const startX = fromNode.x;
      const startY = fromNode.y;
      const endX = toNode.x;
      const endY = toNode.y;

      // Calculate connection points on node edges
      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance === 0) return null;

      const fromRadius = Math.max(fromNode.width, fromNode.height) / 2;
      const toRadius = Math.max(toNode.width, toNode.height) / 2;
      
      const fromOffsetX = (dx / distance) * fromRadius;
      const fromOffsetY = (dy / distance) * fromRadius;
      const toOffsetX = (dx / distance) * toRadius;
      const toOffsetY = (dy / distance) * toRadius;

      const connectionStartX = startX + fromOffsetX;
      const connectionStartY = startY + fromOffsetY;
      const connectionEndX = endX - toOffsetX;
      const connectionEndY = endY - toOffsetY;

      return (
        <g key={index}>
          <line
            x1={connectionStartX}
            y1={connectionStartY}
            x2={connectionEndX}
            y2={connectionEndY}
            stroke="#6B7280"
            strokeWidth="2"
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
          />
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6B7280"
              />
            </marker>
          </defs>
        </g>
      );
    });
  };

  // Render nodes
  const renderNodes = () => {
    return Object.values(mindMap.nodes).map(node => {
      const isSelected = selectedNode === node.id;
      const nodeIcon = ICONS.find(icon => icon.name === node.icon);
      
      return (
        <div
          key={node.id}
          className={`absolute cursor-pointer transition-all duration-200 ${
            isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
          } ${node.isCollapsed ? 'opacity-75' : ''}`}
          style={{
            left: node.x - node.width / 2,
            top: node.y - node.height / 2,
            width: node.width,
            height: node.height,
            backgroundColor: node.color,
            color: node.textColor,
            borderRadius: node.shape === 'circle' ? '50%' : node.shape === 'ellipse' ? '50%' : '8px',
            transform: node.shape === 'triangle' ? 'rotate(0deg)' : 'none',
            clipPath: node.shape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none',
            boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onClick={(e) => handleNodeClick(node.id, e)}
          onDoubleClick={() => handleNodeDoubleClick(node.id)}
          onMouseDown={(e) => handleMouseDown(node.id, e)}
        >
          <div className="flex flex-col items-center justify-center h-full p-2 text-center">
            {nodeIcon && (
              <nodeIcon.icon 
                className="w-4 h-4 mb-1 flex-shrink-0" 
                style={{ color: node.textColor }}
              />
            )}
            {isEditing && selectedNode === node.id ? (
              <input
                type="text"
                value={node.text}
                onChange={(e) => updateNode(node.id, { text: e.target.value })}
                onBlur={() => setIsEditing(false)}
                onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
                className="w-full bg-transparent text-center border-none outline-none"
                style={{ fontSize: node.fontSize, color: node.textColor }}
                autoFocus
              />
            ) : (
              <span 
                className="flex-1 flex items-center justify-center leading-tight"
                style={{ fontSize: node.fontSize }}
              >
                {node.text}
              </span>
            )}
            
            {/* Attachment indicators */}
            {node.attachments && node.attachments.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white" />
            )}
            
            {/* Tag indicators */}
            {node.tags && node.tags.length > 0 && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white" />
            )}
          </div>
          
          {/* Node controls */}
          {isSelected && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addChildNode(node.id);
                }}
                className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
                title="Add child node"
              >
                <Plus className="w-3 h-3" />
              </button>
              {node.children.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateNode(node.id, { isCollapsed: !node.isCollapsed });
                  }}
                  className={`w-6 h-6 ${node.isCollapsed ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white rounded-full flex items-center justify-center`}
                  title={node.isCollapsed ? 'Expand children' : 'Collapse children'}
                >
                  {node.isCollapsed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600"
                title="Edit text"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
                className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                title="Delete node"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tools" className="flex items-center text-secondary-600 hover:text-primary-600">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Tools
              </Link>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                <input
                  type="text"
                  value={mindMap.title}
                  onChange={(e) => setMindMap(prev => ({ ...prev, title: e.target.value }))}
                  className="text-xl font-bold bg-transparent border-none outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* AI Generator */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter topic for AI generation..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={generateAIMindMap}
                  disabled={isGeneratingAI}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Bot className="w-4 h-4" />
                  {isGeneratingAI ? 'Generating...' : 'AI Generate'}
                </button>
              </div>

              {/* Voice Input */}
              <button
                onClick={startVoiceInput}
                disabled={isListening}
                className={`p-2 rounded-lg transition-colors ${
                  isListening ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Notes to Mind Map */}
              <button
                onClick={() => setShowNotesConverter(!showNotesConverter)}
                className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                title="Convert notes to mind map"
              >
                <FileText className="w-4 h-4" />
              </button>

              {/* Templates */}
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                title="Templates"
              >
                <LayoutTemplate className="w-4 h-4" />
              </button>

              {/* Layout Options */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <button
                  onClick={() => autoLayout('radial')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    mindMap.layout === 'radial' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'
                  }`}
                  title="Radial layout"
                >
                  Radial
                </button>
                <button
                  onClick={() => autoLayout('tree')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    mindMap.layout === 'tree' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'
                  }`}
                  title="Tree layout"
                >
                  Tree
                </button>
              </div>

              {/* Privacy Toggle */}
              <button
                onClick={() => setMindMap(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                  mindMap.isPublic ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title={mindMap.isPublic ? 'Public mind map' : 'Private mind map'}
              >
                {mindMap.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="text-xs">{mindMap.isPublic ? 'Public' : 'Private'}</span>
              </button>

              {/* Share */}
              <button
                onClick={shareMindMap}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              {/* Save */}
              <button
                onClick={saveMindMap}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>

              {/* Export */}
              <div className="relative group">
                <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Download className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 hidden group-hover:block">
                  <button
                    onClick={() => exportMindMap('png')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Export as PNG
                  </button>
                  <button
                    onClick={() => exportMindMap('pdf')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => exportMindMap('json')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Canvas */}
          <div className="flex-1 relative overflow-auto bg-gray-100">
            <div
              ref={canvasRef}
              className="relative bg-white cursor-grab active:cursor-grabbing select-none"
              style={{
                width: `${2000 * zoom}px`,
                height: `${1500 * zoom}px`,
                minWidth: '100%',
                minHeight: '100%'
              }}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={(e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                setZoom(prev => Math.max(0.2, Math.min(3, prev + delta)));
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0'
                }}
              >
                {/* SVG for connections */}
                <svg 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    width: '2000px',
                    height: '1500px'
                  }}
                >
                  {renderConnections()}
                </svg>

                {/* Nodes */}
                {renderNodes()}
              </div>

              {/* Grid background */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                  `,
                  backgroundSize: `${50 * zoom}px ${50 * zoom}px`,
                  transform: `translate(${pan.x % (50 * zoom)}px, ${pan.y % (50 * zoom)}px)`
                }}
              />

              {/* Quick add button */}
              <button
                onClick={() => createNode(1000 + Math.random() * 100, 750 + Math.random() * 100)}
                className="absolute top-4 left-4 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 shadow-lg z-10"
                title="Add new node"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Mini-map */}
            <div className="absolute top-4 right-4 w-48 h-32 bg-white border rounded-lg shadow-lg p-2">
              <div className="text-xs text-gray-600 mb-1">Mini Map</div>
              <div className="relative w-full h-24 bg-gray-50 rounded overflow-hidden">
                <svg className="w-full h-full">
                  {/* Mini connections */}
                  {mindMap.connections.map((connection, index) => {
                    const fromNode = mindMap.nodes[connection.from];
                    const toNode = mindMap.nodes[connection.to];
                    
                    if (!fromNode || !toNode) return null;

                    return (
                      <line
                        key={index}
                        x1={fromNode.x / 10}
                        y1={fromNode.y / 10}
                        x2={toNode.x / 10}
                        y2={toNode.y / 10}
                        stroke="#9CA3AF"
                        strokeWidth="1"
                      />
                    );
                  })}
                  
                  {/* Mini nodes */}
                  {Object.values(mindMap.nodes).map(node => (
                    <circle
                      key={node.id}
                      cx={node.x / 10}
                      cy={node.y / 10}
                      r="3"
                      fill={node.color}
                    />
                  ))}
                  
                  {/* Viewport indicator */}
                  <rect
                    x={-pan.x / 10}
                    y={-pan.y / 10}
                    width={(canvasRef.current?.clientWidth || 800) / (10 * zoom)}
                    height={(canvasRef.current?.clientHeight || 600) / (10 * zoom)}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            {/* Enhanced Zoom controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
              <button
                onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              
              <div className="text-xs text-center py-1 min-w-[40px]">
                {Math.round(zoom * 100)}%
              </div>
              
              <button
                onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.2))}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50"
                title="Reset view"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {
                  // Fit all nodes in view
                  const nodes = Object.values(mindMap.nodes);
                  if (nodes.length === 0) return;
                  
                  const minX = Math.min(...nodes.map(n => n.x - n.width / 2));
                  const maxX = Math.max(...nodes.map(n => n.x + n.width / 2));
                  const minY = Math.min(...nodes.map(n => n.y - n.height / 2));
                  const maxY = Math.max(...nodes.map(n => n.y + n.height / 2));
                  
                  const contentWidth = maxX - minX;
                  const contentHeight = maxY - minY;
                  
                  const containerWidth = canvasRef.current?.clientWidth || 800;
                  const containerHeight = canvasRef.current?.clientHeight || 600;
                  
                  const scaleX = (containerWidth - 100) / contentWidth;
                  const scaleY = (containerHeight - 100) / contentHeight;
                  const newZoom = Math.min(scaleX, scaleY, 1);
                  
                  const centerX = (minX + maxX) / 2;
                  const centerY = (minY + maxY) / 2;
                  
                  setZoom(newZoom);
                  setPan({
                    x: containerWidth / 2 - centerX * newZoom,
                    y: containerHeight / 2 - centerY * newZoom
                  });
                }}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50"
                title="Fit to screen"
              >
                <Target className="w-4 h-4" />
              </button>
            </div>

            {/* Pan indicator */}
            {(Math.abs(pan.x) > 10 || Math.abs(pan.y) > 10) && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                Pan: {Math.round(pan.x)}, {Math.round(pan.y)}
              </div>
            )}
          </div>

          {/* Style Panel */}
          {showStylePanel && selectedNode && (
            <div className="w-80 bg-white border-l shadow-lg p-4 overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Node Properties</h3>
              
              {/* Colors */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => updateNode(selectedNode, { color })}
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Text Color</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateNode(selectedNode, { textColor: '#FFFFFF' })}
                    className="w-8 h-8 rounded border-2 border-gray-300 bg-white"
                    style={{ backgroundColor: '#FFFFFF' }}
                  />
                  <button
                    onClick={() => updateNode(selectedNode, { textColor: '#000000' })}
                    className="w-8 h-8 rounded border-2 border-gray-300 bg-black"
                    style={{ backgroundColor: '#000000' }}
                  />
                  <button
                    onClick={() => updateNode(selectedNode, { textColor: '#374151' })}
                    className="w-8 h-8 rounded border-2 border-gray-300"
                    style={{ backgroundColor: '#374151' }}
                  />
                </div>
              </div>

              {/* Shapes */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Shape</label>
                <div className="grid grid-cols-3 gap-2">
                  {SHAPES.map(shape => (
                    <button
                      key={shape.name}
                      onClick={() => updateNode(selectedNode, { shape: shape.name as any })}
                      className={`p-2 border rounded hover:bg-gray-50 flex items-center justify-center ${
                        mindMap.nodes[selectedNode]?.shape === shape.name ? 'bg-blue-100 border-blue-500' : ''
                      }`}
                    >
                      <shape.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Icons */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Icon</label>
                <div className="grid grid-cols-4 gap-2">
                  {ICONS.map(iconItem => (
                    <button
                      key={iconItem.name}
                      onClick={() => updateNode(selectedNode, { icon: iconItem.name })}
                      className={`p-2 border rounded hover:bg-gray-50 flex items-center justify-center ${
                        mindMap.nodes[selectedNode]?.icon === iconItem.name ? 'bg-blue-100 border-blue-500' : ''
                      }`}
                      title={iconItem.label}
                    >
                      <iconItem.icon className="w-4 h-4" />
                    </button>
                  ))}
                  <button
                    onClick={() => updateNode(selectedNode, { icon: undefined })}
                    className="p-2 border rounded hover:bg-gray-50 flex items-center justify-center"
                    title="No icon"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Font Size: {mindMap.nodes[selectedNode]?.fontSize || 14}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={mindMap.nodes[selectedNode]?.fontSize || 14}
                  onChange={(e) => updateNode(selectedNode, { fontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Node Size */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Node Size</label>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600">Width: {mindMap.nodes[selectedNode]?.width || 120}px</label>
                    <input
                      type="range"
                      min="80"
                      max="200"
                      value={mindMap.nodes[selectedNode]?.width || 120}
                      onChange={(e) => updateNode(selectedNode, { width: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Height: {mindMap.nodes[selectedNode]?.height || 60}px</label>
                    <input
                      type="range"
                      min="40"
                      max="120"
                      value={mindMap.nodes[selectedNode]?.height || 60}
                      onChange={(e) => updateNode(selectedNode, { height: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tags</label>
                <input
                  type="text"
                  placeholder="Add tags (comma-separated)"
                  value={mindMap.nodes[selectedNode]?.tags?.join(', ') || ''}
                  onChange={(e) => updateNode(selectedNode, { 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  className="w-full border rounded p-2 text-sm"
                />
                {mindMap.nodes[selectedNode]?.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {mindMap.nodes[selectedNode].tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={mindMap.nodes[selectedNode]?.notes || ''}
                  onChange={(e) => updateNode(selectedNode, { notes: e.target.value })}
                  className="w-full h-20 border rounded p-2 text-sm"
                  placeholder="Add notes..."
                />
              </div>

              {/* Attachments */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Attachments</label>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      const url = prompt('Enter URL:');
                      if (url) {
                        const currentAttachments = mindMap.nodes[selectedNode]?.attachments || [];
                        updateNode(selectedNode, {
                          attachments: [...currentAttachments, {
                            type: 'link',
                            content: url,
                            title: 'Link'
                          }]
                        });
                      }
                    }}
                    className="w-full p-2 border border-dashed rounded flex items-center justify-center gap-2 hover:bg-gray-50"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Add Link
                  </button>
                  <button 
                    onClick={() => {
                      const formula = prompt('Enter LaTeX formula (e.g., E = mc^2):');
                      if (formula) {
                        const currentAttachments = mindMap.nodes[selectedNode]?.attachments || [];
                        updateNode(selectedNode, {
                          attachments: [...currentAttachments, {
                            type: 'formula',
                            content: formula,
                            title: 'Formula'
                          }]
                        });
                      }
                    }}
                    className="w-full p-2 border border-dashed rounded flex items-center justify-center gap-2 hover:bg-gray-50"
                  >
                    <Calculator className="w-4 h-4" />
                    Add Formula
                  </button>
                  <button 
                    onClick={() => {
                      const note = prompt('Enter note:');
                      if (note) {
                        const currentAttachments = mindMap.nodes[selectedNode]?.attachments || [];
                        updateNode(selectedNode, {
                          attachments: [...currentAttachments, {
                            type: 'note',
                            content: note,
                            title: 'Note'
                          }]
                        });
                      }
                    }}
                    className="w-full p-2 border border-dashed rounded flex items-center justify-center gap-2 hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4" />
                    Add Note
                  </button>
                </div>

                {/* Display attachments */}
                {mindMap.nodes[selectedNode]?.attachments?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {mindMap.nodes[selectedNode].attachments.map((attachment, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{attachment.title}</span>
                          <button
                            onClick={() => {
                              const currentAttachments = mindMap.nodes[selectedNode]?.attachments || [];
                              updateNode(selectedNode, {
                                attachments: currentAttachments.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 truncate">{attachment.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Node Actions */}
              <div className="space-y-2 pt-4 border-t">
                <button
                  onClick={() => {
                    const currentNode = mindMap.nodes[selectedNode];
                    if (currentNode) {
                      updateNode(selectedNode, { isCollapsed: !currentNode.isCollapsed });
                    }
                  }}
                  className="w-full p-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  {mindMap.nodes[selectedNode]?.isCollapsed ? 'Expand' : 'Collapse'} Children
                </button>
                <button
                  onClick={() => addChildNode(selectedNode)}
                  className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Child Node
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this node?')) {
                      deleteNode(selectedNode);
                    }
                  }}
                  className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Node
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notes Converter Modal */}
        {showNotesConverter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Convert Notes to Mind Map</h3>
                <button
                  onClick={() => setShowNotesConverter(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Notes Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="plain"
                      checked={notesFormat === 'plain'}
                      onChange={(e) => setNotesFormat(e.target.value as 'plain')}
                      className="mr-2"
                    />
                    Plain Text / Bullet Points
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="markdown"
                      checked={notesFormat === 'markdown'}
                      onChange={(e) => setNotesFormat(e.target.value as 'markdown')}
                      className="mr-2"
                    />
                    Markdown
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Your Notes</label>
                <textarea
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  className="w-full h-64 border rounded p-3 text-sm font-mono"
                  placeholder={notesFormat === 'markdown' ? 
                    "# Main Topic\n\n## Subtopic 1\n- Point 1\n- Point 2\n\n## Subtopic 2\n- Point A\n- Point B" :
                    "Main Topic\n\n• Subtopic 1\n  - Point 1\n  - Point 2\n\n• Subtopic 2\n  - Point A\n  - Point B"
                  }
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNotesConverter(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={convertNotesToMindMap}
                  disabled={isConvertingNotes || !notesContent.trim()}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {isConvertingNotes ? 'Converting...' : 'Convert to Mind Map'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Choose Template</h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template.id)}
                    className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <template.icon className="w-6 h-6 text-purple-600" />
                      <h4 className="font-semibold">{template.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => loadTemplate('blank')}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-700">Start with Blank Canvas</div>
                    <div className="text-sm text-gray-500 mt-1">Create your mind map from scratch</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Maps Sidebar (if needed) */}
        {savedMaps.length > 0 && (
          <div className="hidden lg:block w-64 bg-white border-l p-4">
            <h3 className="font-bold mb-4">Saved Maps ({savedMaps.length})</h3>
            <div className="space-y-2">
              {savedMaps.slice(0, 5).map(map => (
                <button
                  key={map.id}
                  onClick={() => loadMindMap(map)}
                  className="w-full text-left p-3 border rounded hover:bg-gray-50"
                >
                  <div className="font-medium truncate">{map.title}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(map.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
