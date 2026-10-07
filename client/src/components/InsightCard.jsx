import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Quote, 
  Database, 
  AlertTriangle, 
  Compass, 
  FileText,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function InsightCard({ insight, onViewCitation, onOpenDocument }) {
  const [copied, setCopied] = useState(false);

  const { category, content, confidence_score, citation_snippet, filename } = insight;
  const scorePercent = Math.round((confidence_score || 0.85) * 100);

  // Category Configuration
  const categoryConfig = {
    Empirical: {
      label: 'Empirical Finding',
      badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      icon: Database,
      meterColor: 'bg-cyan-400',
      accentBorder: 'hover:border-cyan-500/40'
    },
    Methodological: {
      label: 'Methodological Gap',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      meterColor: 'bg-amber-400',
      accentBorder: 'hover:border-amber-500/40'
    },
    Strategic: {
      label: 'Strategic Insight',
      badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      icon: Compass,
      meterColor: 'bg-purple-400',
      accentBorder: 'hover:border-purple-500/40'
    }
  };

  const currentConfig = categoryConfig[category] || categoryConfig.Empirical;
  const IconComponent = currentConfig.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`glass-panel rounded-2xl p-5 border border-slate-800 transition-all duration-200 glass-panel-hover flex flex-col justify-between ${currentConfig.accentBorder}`}>
      <div>
        {/* Header: Category Badge & Confidence Score */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${currentConfig.badgeClass}`}>
              <IconComponent className="w-3.5 h-3.5" />
              <span>{currentConfig.label}</span>
            </span>
            {filename && (
              <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] text-slate-400 font-mono truncate max-w-[150px]">
                <FileText className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{filename}</span>
              </span>
            )}
          </div>

          {/* Confidence Score Pill */}
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-full px-2.5 py-1">
            <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full ${currentConfig.meterColor}`} 
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-300">
              {scorePercent}%
            </span>
          </div>
        </div>

        {/* Content Body */}
        <p className="text-sm text-slate-200 leading-relaxed font-normal mb-4">
          {content}
        </p>

        {/* Source Citation Snippet */}
        {citation_snippet && (
          <div className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-400 mb-1 font-mono text-[11px]">
              <Quote className="w-3 h-3 text-nexus-400" />
              <span>SOURCE CITATION SNIPPET</span>
            </div>
            <p className="text-slate-300 italic font-serif leading-relaxed line-clamp-3">
              "{citation_snippet}"
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        {citation_snippet && onViewCitation ? (
          <button
            onClick={() => onViewCitation(insight)}
            className="text-nexus-400 hover:text-nexus-300 font-medium inline-flex items-center space-x-1 transition-colors"
          >
            <span>Inspect in Context</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-slate-400 font-mono text-[11px]">Nexus Grounded</span>
        )}

        <div className="flex items-center space-x-2">
          {onOpenDocument && (
            <button
              onClick={() => onOpenDocument(insight.document_id)}
              title="Open full document"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center space-x-1"
            title="Copy insight text"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400">Copied</span>
              </>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
