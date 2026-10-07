import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  FolderPlus, 
  Search, 
  Layers, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  Database,
  Plus
} from 'lucide-react';

export default function Sidebar({ projects = [], onOpenNewProjectModal, activeProjectId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const params = useParams();
  const currentId = activeProjectId || params.id;

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <aside className="w-full md:w-72 flex-shrink-0 border-r border-slate-800/80 bg-slate-950/70 p-4 flex flex-col h-auto md:min-h-[calc(100vh-4rem)]">
      {/* Header & New Project CTA */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-nexus-400" />
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Research Projects
          </h2>
        </div>
        <button
          onClick={onOpenNewProjectModal}
          className="p-1.5 rounded-lg bg-nexus-500/10 hover:bg-nexus-500/20 text-nexus-400 border border-nexus-500/30 transition-all flex items-center space-x-1 text-xs"
          title="Create New Research Project"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium hidden sm:inline">New</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Search className="w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter topics..."
          className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-nexus-500/50 transition-colors"
        />
      </div>

      {/* Project Items List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-800">
            <p className="text-xs text-slate-400">No matching projects found</p>
            <button
              onClick={onOpenNewProjectModal}
              className="mt-2 text-xs text-nexus-400 hover:text-nexus-300 font-medium inline-flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Create project</span>
            </button>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isActive = currentId === project.id;
            return (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className={`group block p-3 rounded-xl border transition-all text-left ${
                  isActive
                    ? 'bg-nexus-500/15 border-nexus-500/40 text-white shadow-sm shadow-nexus-500/10'
                    : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-semibold line-clamp-1 group-hover:text-nexus-300 transition-colors">
                    {project.title}
                  </h4>
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isActive ? 'text-nexus-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'}`} />
                </div>

                {project.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>{project.document_count || 0} docs</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-nexus-400" />
                    <span>{project.insight_count || 0} insights</span>
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Supabase & Gemini Health Status Tile at bottom */}
      <div className="pt-4 mt-auto border-t border-slate-800/80 text-[11px]">
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Gemini 2.5 Active</span>
          </div>
          <span className="text-slate-500 font-mono text-[10px]">Cloud RLS</span>
        </div>
      </div>
    </aside>
  );
}
