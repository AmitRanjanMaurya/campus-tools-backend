'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Eye, Download, Copy, Share2, Brain } from 'lucide-react';

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
  children: string[];
  parent?: string;
}

interface SharedMindMap {
  id: string;
  title: string;
  description: string;
  nodes: { [key: string]: MindMapNode };
  connections: { from: string; to: string }[];
  shareId: string;
  createdAt: string;
  views: number;
}

export default function SharedMindMapViewer() {
  const params = useParams();
  const shareId = params.shareId as string;
  const [mindMap, setMindMap] = useState<SharedMindMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadSharedMindMap();
  }, [shareId]);

  const loadSharedMindMap = async () => {
    try {
      const response = await fetch(`/api/mind-map-collaboration?shareId=${shareId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load mind map');
      }

      setMindMap(data.mindMap);
    } catch (error) {
      console.error('Error loading shared mind map:', error);
      setError(error instanceof Error ? error.message : 'Failed to load mind map');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    alert('Share link copied to clipboard!');
  };

  const exportMindMap = (format: 'png' | 'pdf' | 'json') => {
    if (!mindMap) return;

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

    // Simple canvas export for visual formats
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw nodes
    Object.values(mindMap.nodes).forEach(node => {
      ctx.fillStyle = node.color;
      ctx.fillRect(node.x - 60, node.y - 30, 120, 60);
      
      ctx.fillStyle = node.textColor;
      ctx.font = `${node.fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(node.text, node.x, node.y + 5);
    });

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${mindMap.title}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  const renderConnections = () => {
    if (!mindMap) return null;
    
    return mindMap.connections.map((connection, index) => {
      const fromNode = mindMap.nodes[connection.from];
      const toNode = mindMap.nodes[connection.to];
      
      if (!fromNode || !toNode) return null;

      return (
        <line
          key={index}
          x1={fromNode.x}
          y1={fromNode.y}
          x2={toNode.x}
          y2={toNode.y}
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    });
  };

  const renderNodes = () => {
    if (!mindMap) return null;
    
    return Object.values(mindMap.nodes).map(node => (
      <div
        key={node.id}
        className="absolute"
        style={{
          left: node.x - node.width / 2,
          top: node.y - node.height / 2,
          width: node.width,
          height: node.height,
          backgroundColor: node.color,
          color: node.textColor,
          borderRadius: node.shape === 'circle' ? '50%' : node.shape === 'ellipse' ? '50%' : '8px',
          clipPath: node.shape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none'
        }}
      >
        <div className="flex items-center justify-center h-full p-2 text-center">
          <span style={{ fontSize: node.fontSize }}>{node.text}</span>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading shared mind map...</p>
        </div>
      </div>
    );
  }

  if (error || !mindMap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Mind Map Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || 'The shared mind map could not be found or may have been removed.'}
            </p>
            <Link
              href="/tools/mind-map"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Your Own Mind Map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tools/mind-map" className="flex items-center text-secondary-600 hover:text-primary-600">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Create Your Own
              </Link>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-bold">{mindMap.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                <span>{mindMap.views} views</span>
              </div>

              <button
                onClick={copyShareLink}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>

              <div className="relative group">
                <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
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

          {mindMap.description && (
            <p className="text-gray-600 mt-2">{mindMap.description}</p>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            className="w-full h-full relative bg-white"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: '0 0'
            }}
          >
            {/* SVG for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {renderConnections()}
            </svg>

            {/* Nodes */}
            {renderNodes()}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
              className="w-10 h-10 bg-white border rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50"
            >
              +
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
              className="w-10 h-10 bg-white border rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50"
            >
              -
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="w-10 h-10 bg-white border rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50"
            >
              ⌂
            </button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Created: {new Date(mindMap.createdAt).toLocaleDateString()}
            </div>
            <div>
              Nodes: {Object.keys(mindMap.nodes).length}
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span>Shared Mind Map</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
