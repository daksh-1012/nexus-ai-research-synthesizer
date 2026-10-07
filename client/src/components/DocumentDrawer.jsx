import React from 'react';
import { X, FileText, Download, Copy, Sparkles, Check } from 'lucide-react';

export default function DocumentDrawer({ document, highlightedSnippet, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!document) return null;

  const handleCopyText = () => {
    navigator.clipboard.writeText(document.raw_text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to render text with highlighted snippet
  const renderTextWithHighlight = (text, snippet) => {
    if (!snippet || !text) return text;

    const cleanSnippet = snippet.replace(/\.\.\.$/, '').trim();
    const index = text.toLowerCase().indexOf(cleanSnippet.toLowerCase());

    if (index === -1) {
      return text;
    }

    const before = text.slice(0, index);
    const match = text.slice(index, index + cleanSnippet.length);
    const after = text.slice(index + cleanSnippet.length);

    return (
      <>
        {before}
        <mark className="bg-nexus-400/30 text-nexus-200 px-1 py-0.5 rounded border border-nexus-400/50 font-medium">
          {match}
        </mark>
        {after}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-nexus-500/15 border border-nexus-500/30 flex items-center justify-center text-nexus-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white truncate max-w-md">
                {document.filename}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {(document.file_size / 1024).toFixed(1)} KB • Focus: {document.analysis_focus || 'Summary'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyText}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Copy Raw Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Highlight notification bar */}
        {highlightedSnippet && (
          <div className="p-3 bg-nexus-500/10 border-b border-nexus-500/20 flex items-center space-x-2 text-xs text-nexus-300">
            <Sparkles className="w-4 h-4 text-nexus-400 flex-shrink-0" />
            <span className="truncate">Active Citation Highlighted in Text</span>
          </div>
        )}

        {/* Text Viewer Content */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap select-text">
          {renderTextWithHighlight(document.raw_text, highlightedSnippet)}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Processed by Nexus Document Ingestion Pipeline</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
