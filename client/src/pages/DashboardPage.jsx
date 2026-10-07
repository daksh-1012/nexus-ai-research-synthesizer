import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  Plus, 
  Layers, 
  FileText, 
  Sparkles, 
  Trash2, 
  ArrowRight, 
  TrendingUp, 
  Database, 
  Clock, 
  X,
  Search,
  BookOpen
} from 'lucide-react';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await projectService.getAll();
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load research projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setModalError('Project title is required');
      return;
    }

    setCreating(true);
    setModalError('');
    try {
      const res = await projectService.create({
        title: newTitle.trim(),
        description: newDescription.trim()
      });
      setProjects([res.data.project, ...projects]);
      setModalOpen(false);
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      const msg = err.response?.data?.details?.[0]?.message || err.response?.data?.error || 'Failed to create project';
      setModalError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (id, title, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}" and all its synthesized data?`)) {
      return;
    }

    try {
      await projectService.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete project: ' + (err.response?.data?.error || err.message));
    }
  };

  // Metrics summary
  const totalProjects = projects.length;
  const totalDocs = projects.reduce((acc, p) => acc + (p.document_count || 0), 0);
  const totalInsights = projects.reduce((acc, p) => acc + (p.insight_count || 0), 0);

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar
          projects={projects}
          onOpenNewProjectModal={() => setModalOpen(true)}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Research Workspace Dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Manage academic repositories, ingested papers, and synthesized intelligence
              </p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-nexus-600 via-nexus-500 to-cyan-500 hover:from-nexus-500 hover:to-cyan-400 shadow-lg shadow-nexus-500/20 transition-all flex items-center space-x-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New Research Project</span>
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
                <span>Active Research Topics</span>
                <Layers className="w-4 h-4 text-nexus-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">{totalProjects}</div>
              <p className="text-[11px] text-slate-500 mt-1">Cross-domain project workspaces</p>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
                <span>Ingested Documents</span>
                <FileText className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">{totalDocs}</div>
              <p className="text-[11px] text-slate-500 mt-1">PDF & TXT literature parsed</p>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
                <span>Synthesized Insights</span>
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">{totalInsights}</div>
              <p className="text-[11px] text-slate-500 mt-1">Empirical, Methodological, Strategic</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">Your Research Repositories</h2>
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-nexus-500/50"
              />
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-mono text-xs">
              LOADING REPOSITORIES...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-dashed border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-nexus-500/10 text-nexus-400 mx-auto flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white">No Research Projects Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                Create a research project to begin ingesting documents and running Gemini synthesis pipelines.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-nexus-600 hover:bg-nexus-500 transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-nexus-500/40 glass-panel-hover group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-bold text-white group-hover:text-nexus-300 transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, project.title, e)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {project.description || 'No description provided for this research topic.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>{project.document_count || 0} docs</span>
                      </span>
                      <span className="flex items-center space-x-1 text-nexus-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{project.insight_count || 0} insights</span>
                      </span>
                    </div>

                    <span className="text-nexus-400 group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1 font-medium">
                      <span>Enter Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md border border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Research Project</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. CRISPR Off-Target Sequencing Efficacy"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nexus-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Research Scope / Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Briefly state hypotheses, focus questions, or scope..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nexus-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl text-xs font-medium text-white bg-nexus-600 hover:bg-nexus-500 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Initialize Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
