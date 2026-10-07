import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService, documentService } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import UploadZone from '../components/UploadZone';
import InsightCard from '../components/InsightCard';
import DocumentDrawer from '../components/DocumentDrawer';
import { 
  Layers, 
  FileText, 
  Sparkles, 
  Database, 
  AlertTriangle, 
  Compass, 
  Trash2, 
  ArrowLeft, 
  Download, 
  Filter, 
  CheckCircle2, 
  Eye,
  RefreshCw,
  Share2
} from 'lucide-react';

export default function ProjectWorkspacePage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [insights, setInsights] = useState([]);
  const [stats, setStats] = useState({ total: 0, empirical: 0, methodological: 0, strategic: 0, avgConfidence: 0 });
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Document Drawer inspection state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [highlightedSnippet, setHighlightedSnippet] = useState('');

  // All user projects for the sidebar
  const [allProjects, setAllProjects] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch project and documents
      const [projRes, insightsRes, allProjRes] = await Promise.all([
        projectService.getById(projectId),
        projectService.getInsights(projectId),
        projectService.getAll()
      ]);

      setProject(projRes.data.project);
      setDocuments(projRes.data.documents || []);
      setInsights(insightsRes.data.insights || []);
      setStats(insightsRes.data.stats || { total: 0, empirical: 0, methodological: 0, strategic: 0, avgConfidence: 0 });
      setAllProjects(allProjRes.data.projects || []);
    } catch (err) {
      console.error('Failed to load project workspace:', err);
      setError(err.response?.data?.error || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleUploadSuccess = () => {
    loadData();
  };

  const handleDeleteDocument = async (docId, filename) => {
    if (!window.confirm(`Are you sure you want to remove "${filename}" and its associated insights?`)) {
      return;
    }
    try {
      await documentService.delete(docId);
      loadData();
    } catch (err) {
      alert('Failed to delete document: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleViewCitation = (insight) => {
    // Locate the corresponding document
    const doc = documents.find(d => d.id === insight.document_id) || {
      id: insight.document_id,
      filename: insight.filename,
      raw_text: insight.raw_text,
      analysis_focus: insight.analysis_focus || 'Summary',
      file_size: insight.raw_text?.length || 1000
    };
    setSelectedDoc(doc);
    setHighlightedSnippet(insight.citation_snippet || '');
  };

  const handleOpenDocument = (docId) => {
    documentService.getById(docId)
      .then(res => {
        setSelectedDoc(res.data.document);
        setHighlightedSnippet('');
      })
      .catch(err => {
        const found = documents.find(d => d.id === docId);
        if (found) {
          setSelectedDoc(found);
          setHighlightedSnippet('');
        }
      });
  };

  const handleExportJSON = () => {
    const exportData = {
      project,
      stats,
      documentsCount: documents.length,
      insights,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_synthesis_${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredInsights = activeCategory === 'ALL'
    ? insights
    : insights.filter(i => i.category.toUpperCase() === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center font-mono text-xs text-slate-400">
          LOADING RESEARCH WORKSPACE...
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm mb-4">
            {error || 'Research project not found.'}
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-nexus-600 hover:bg-nexus-500 inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar
          projects={allProjects}
          activeProjectId={projectId}
          onOpenNewProjectModal={() => navigate('/dashboard')}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Workspace Header */}
          <div className="mb-6 pb-6 border-b border-slate-800/80">
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
              <Link to="/dashboard" className="hover:text-nexus-400 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-200">Workspace</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {project.title}
                </h1>
                {project.description && (
                  <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3 self-start sm:self-auto">
                <button
                  onClick={handleExportJSON}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center space-x-2 transition-colors"
                  title="Export Synthesized Dossier"
                >
                  <Download className="w-3.5 h-3.5 text-nexus-400" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={loadData}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                  title="Refresh Insights"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dimensional Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Empirical</span>
                  <div className="text-xl font-bold text-cyan-400 font-mono">{stats.empirical || 0}</div>
                </div>
                <Database className="w-5 h-5 text-cyan-500/40" />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Method Gaps</span>
                  <div className="text-xl font-bold text-amber-400 font-mono">{stats.methodological || 0}</div>
                </div>
                <AlertTriangle className="w-5 h-5 text-amber-500/40" />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Strategic</span>
                  <div className="text-xl font-bold text-purple-400 font-mono">{stats.strategic || 0}</div>
                </div>
                <Compass className="w-5 h-5 text-purple-500/40" />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Avg Confidence</span>
                  <div className="text-xl font-bold text-emerald-400 font-mono">
                    {Math.round((stats.avgConfidence || 0.9) * 100)}%
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-emerald-500/40" />
              </div>
            </div>
          </div>

          {/* Section 1: Upload Zone */}
          <div className="mb-8">
            <UploadZone
              projectId={projectId}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>

          {/* Section 2: Ingested Documents List */}
          {documents.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Ingested Literature Repository ({documents.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs group"
                  >
                    <div 
                      onClick={() => handleOpenDocument(doc.id)}
                      className="flex items-center space-x-2.5 truncate cursor-pointer flex-1 mr-2"
                    >
                      <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-slate-200 font-medium truncate group-hover:text-nexus-400 transition-colors">
                          {doc.filename}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {(doc.file_size / 1024).toFixed(1)} KB • {doc.analysis_focus || 'Summary'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenDocument(doc.id)}
                        className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                        title="View Raw Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Synthesized Insights with Dimensional Tabs */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-nexus-400" />
                  <span>Synthesized Knowledge Graph & Insights</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Target domain classifications with source citation mapping
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveCategory('ALL')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    activeCategory === 'ALL'
                      ? 'bg-nexus-500/20 text-nexus-300 border border-nexus-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({insights.length})
                </button>
                <button
                  onClick={() => setActiveCategory('EMPIRICAL')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    activeCategory === 'EMPIRICAL'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Empirical ({stats.empirical})
                </button>
                <button
                  onClick={() => setActiveCategory('METHODOLOGICAL')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    activeCategory === 'METHODOLOGICAL'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Gaps ({stats.methodological})
                </button>
                <button
                  onClick={() => setActiveCategory('STRATEGIC')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    activeCategory === 'STRATEGIC'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Strategic ({stats.strategic})
                </button>
              </div>
            </div>

            {/* Insights Cards Grid */}
            {filteredInsights.length === 0 ? (
              <div className="glass-panel rounded-2xl p-10 text-center border border-dashed border-slate-800">
                <p className="text-xs text-slate-400">
                  No insights found for this category filter. Upload documents to trigger extraction.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onViewCitation={handleViewCitation}
                    onOpenDocument={handleOpenDocument}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Raw Document Drawer with Citation Highlighting */}
      {selectedDoc && (
        <DocumentDrawer
          document={selectedDoc}
          highlightedSnippet={highlightedSnippet}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
