import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Database, 
  AlertTriangle, 
  Compass, 
  FileText, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  Search,
  BookOpen
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Ambient lighting effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-nexus-600/25 to-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-nexus-500/10 border border-nexus-500/20 text-nexus-400 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation AI Research Synthesizer</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Transform Complex Documents Into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-nexus-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Structured Research Intelligence
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Nexus automates academic extraction and evidence-based decision-making. Ingest raw PDFs and text, uncover empirical findings, identify methodological gaps, and synthesize actionable strategic insights with Google Gemini.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-nexus-600 via-nexus-500 to-cyan-500 hover:from-nexus-500 hover:to-cyan-400 shadow-xl shadow-nexus-500/25 transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Launch Research Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-medium text-sm text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore Demo Account</span>
            </Link>
          </div>

          {/* Interactive Live Preview Mockup */}
          <div className="mt-14 max-w-4xl mx-auto glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400">
                  nexus://synthesizer/project/marine-microplastics
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Gemini 2.5 Flash • 96% Confidence
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-2">
                  Empirical Finding
                </span>
                <p className="text-xs text-slate-300">
                  PET polymers constitute 61.4% of synthetic particles, yielding a 3.4x bio-magnification factor in apex predator stomach samples.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
                  Methodological Gap
                </span>
                <p className="text-xs text-slate-300">
                  333-micron manta trawl filtration systematically fails to capture nanoplastics under 20 microns, inducing baseline underestimation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 mb-2">
                  Strategic Insight
                </span>
                <p className="text-xs text-slate-300">
                  Mandate international standardized Raman spectroscopy and mass spectrometry treaties over legacy filtration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement vs Nexus Solution Section */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-nexus-400 uppercase tracking-widest">
              Core Problem & Solution
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Why Traditional Research Synthesis Breaks Down
            </h3>
            <p className="text-slate-400 text-sm mt-3">
              Researchers spend up to 70% of their time parsing unstructured PDFs and manually synthesizing disparate citations. Nexus fixes this fundamentally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Problem */}
            <div className="glass-panel rounded-2xl p-8 border border-rose-500/20 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">The Friction: Information Overload</h4>
              <p className="text-slate-400 text-xs mb-6">
                Academic teams and policy analysts drown in fragmented literature without reproducible synthesis pipelines.
              </p>
              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start space-x-2.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>Unstructured PDF tables and metrics trapped in multi-page appendices.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>Methodological biases go unnoticed due to time constraints in manual literature reviews.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>Disconnect between raw scientific data and actionable strategic policies.</span>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="glass-panel rounded-2xl p-8 border border-nexus-500/30 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-nexus-500/15 border border-nexus-500/40 flex items-center justify-center text-nexus-400 mb-5">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">The Solution: Nexus AI Engine</h4>
              <p className="text-slate-400 text-xs mb-6">
                Automated multi-dimensional extraction engine turning complex documents into categorized JSON intelligence.
              </p>
              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Empirical Findings:</strong> Extracts numerical findings, sample sizes, and p-values directly.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Methodological Gaps:</strong> Highlights sampling limitations and procedural blindspots.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Source Citation Mapping:</strong> Maps every generated insight back to the verbatim source text.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Three Dimensional Framework */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-semibold text-nexus-400 uppercase tracking-widest">
              Core Architecture
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Three Dimensions of Research Synthesis
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white mb-2">Empirical Findings</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verifiable outcomes, statistical distributions, biological and chemical assays, sample sizes (N=), and empirical effect sizes.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-amber-500/20">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white mb-2">Methodological Gaps</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flaws, sensor resolution constraints, confounding factors, missing control cohorts, and systematic underestimations.
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-purple-500/20">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white mb-2">Strategic Insights</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Actionable recommendations for institutional policy, research roadmap prioritization, and evidence-backed governance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-nexus-400" />
            <span className="font-semibold text-slate-300">Nexus: AI Research Synthesizer</span>
          </div>
          <div>
            Built with React, Vite, Node/Express, Supabase PostgreSQL, and Google Gemini API.
          </div>
          <div className="font-mono text-[11px]">
            Production Ready v1.0.0
          </div>
        </div>
      </footer>
    </div>
  );
}
