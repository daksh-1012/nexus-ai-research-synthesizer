import React, { useState, useRef } from 'react';
import { documentService } from '../services/api';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Sliders,
  Cpu
} from 'lucide-react';

export default function UploadZone({ projectId, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [analysisFocus, setAnalysisFocus] = useState('Summary');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);
  const fileInputRef = useRef(null);

  const allowedMimeTypes = ['application/pdf', 'text/plain'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setErrorMessage('');
    setSuccessData(null);

    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    const isExtensionValid = ext === 'pdf' || ext === 'txt';
    const isMimeValid = allowedMimeTypes.includes(selectedFile.type);

    if (!isExtensionValid && !isMimeValid) {
      setErrorMessage('Invalid file type. Only PDF (.pdf) and plain text (.txt) documents are supported.');
      return;
    }

    if (selectedFile.size > maxSizeBytes) {
      setErrorMessage(`File is too large (${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed size is 5MB.`);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !projectId) return;

    setUploading(true);
    setUploadProgress(10);
    setErrorMessage('');
    setSuccessData(null);
    setStatusMessage('Parsing raw document structure and text...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      formData.append('analysisFocus', analysisFocus);

      // Trigger Gemini synthesis pipeline
      setTimeout(() => {
        setStatusMessage('Executing Gemini AI synthesis pipeline (@google/genai)...');
        setUploadProgress(60);
      }, 900);

      const res = await documentService.upload(formData, (percent) => {
        setUploadProgress(Math.min(95, Math.max(20, percent)));
      });

      setUploadProgress(100);
      setStatusMessage('Synthesis complete! Insights mapped to source text.');
      setSuccessData(res.data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (onUploadSuccess) {
        onUploadSuccess(res.data);
      }
    } catch (err) {
      console.error('Upload Error:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to process and synthesize document.';
      setErrorMessage(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-nexus-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-nexus-500/15 border border-nexus-500/30 flex items-center justify-center text-nexus-400">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Document Ingestion Pipeline</h3>
            <p className="text-xs text-slate-400">Upload research PDFs or raw text for structured LLM synthesis</p>
          </div>
        </div>

        {/* 5MB Limit Badge */}
        <span className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          Max 5MB • PDF / TXT
        </span>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success banner */}
      {successData && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300 text-xs">
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>
              Successfully synthesized <strong>{successData.document?.filename}</strong> ({successData.insights?.length || 0} insights generated)
            </span>
          </div>
          <button onClick={() => setSuccessData(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleUpload}>
        {/* Hidden Project_ID */}
        <input type="hidden" name="Project_ID" value={projectId} />

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-nexus-400 bg-nexus-500/10 scale-[1.01]'
              : file
              ? 'border-cyan-500/50 bg-slate-900/80'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            name="File_Upload"
            accept=".pdf,.txt,application/pdf,text/plain"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-white">{file.name}</div>
              <div className="text-xs text-slate-400 font-mono">
                {(file.size / 1024).toFixed(1)} KB • {file.type || 'Plain Text'}
              </div>
              <p className="text-[11px] text-cyan-400 pt-1">Click to replace file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:text-nexus-400 transition-colors">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Drag & drop research paper here, or <span className="text-nexus-400 underline">browse files</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports scientific PDFs and structured text files up to 5MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Focus & Controls */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              <Sliders className="w-3.5 h-3.5 text-nexus-400" />
              <span>Analysis Focus</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Summary', 'Data Extraction', 'Critique'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAnalysisFocus(mode)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    analysisFocus === mode
                      ? 'bg-nexus-500/20 border-nexus-400 text-nexus-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:self-end">
            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-nexus-600 via-nexus-500 to-cyan-500 hover:from-nexus-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-nexus-500/20 transition-all flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Execute AI Synthesis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar & Stage Indicator */}
        {uploading && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 animate-fade-in">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-nexus-400 font-medium flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 animate-pulse" />
                <span>{statusMessage}</span>
              </span>
              <span className="text-slate-400 font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-nexus-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
