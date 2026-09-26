import React from 'react';
import {
  Tv,
  Table,
  Columns3,
  BarChart3,
  Zap,
  Globe,
  Sparkles,
  PlusCircle,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Target,
  SearchCheck,
  TrendingUp,
  Flame,
  CheckCircle2,
  X,
  Menu
} from 'lucide-react';
import { EXPORT_EXCEL_URL, EXPORT_CSV_URL } from '../services/api';
import { formatCurrencyLakhs } from '../utils/formatters';

export default function Sidebar({
  activeView,
  setActiveView,
  onOpenGenerateModal,
  onOpenAddModal,
  onOpenImportModal,
  totalResults = 0,
  stats,
  mobileOpen = false,
  setMobileOpen
}) {
  const overview = stats?.overview || {};

  const handleNavClick = (view) => {
    setActiveView(view);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        
        {/* Brand & Logo Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Tv className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white font-heading">
                Collabsight <span className="text-sky-400">AV CRM</span>
              </div>
              <div className="text-[10px] text-slate-400">Audio-Visual Pipeline</div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          
          {/* SECTION 2: VIEW MODES & WORKSPACES */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-bold text-sky-400 uppercase tracking-wider">
              <span>Section 2: View Modes</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            </div>

            <nav className="space-y-1">
              {/* Table View */}
              <button
                onClick={() => handleNavClick('table')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeView === 'table'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Table className="w-4 h-4 shrink-0 text-sky-300" />
                  <span>Table Grid</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeView === 'table' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {totalResults}
                </span>
              </button>

              {/* Kanban View */}
              <button
                onClick={() => handleNavClick('kanban')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeView === 'kanban'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Columns3 className="w-4 h-4 shrink-0 text-sky-300" />
                <span>Kanban Board</span>
              </button>

              {/* Analytics View */}
              <button
                onClick={() => handleNavClick('analytics')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeView === 'analytics'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0 text-sky-300" />
                <span>Analytics & Insights</span>
              </button>

              {/* REQUIREMENT 2: Dedicated Pitch Generator Section */}
              <button
                onClick={() => handleNavClick('pitch')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeView === 'pitch'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Pitch Generator</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.2 rounded-md">
                  All-Platform
                </span>
              </button>

              {/* REQUIREMENT 7: Leads by Search Set Section */}
              <button
                onClick={() => handleNavClick('search_sets')}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeView === 'search_sets'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SearchCheck className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>Leads by Search Set</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold bg-purple-500/30 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded-md">
                  New
                </span>
              </button>
            </nav>
          </div>

          {/* SECTION 1: LEAD GENERATION & INGESTION */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              <span>Section 1: Ingestion</span>
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <div className="space-y-1.5">
              {/* Fetch Live OSM Leads (Requirement 3 & 4) */}
              <button
                onClick={() => {
                  onOpenGenerateModal('osm');
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 rounded-xl transition-all cursor-pointer shadow-xs shadow-sky-500/20 group text-left"
              >
                <Globe className="w-4 h-4 text-sky-100 group-hover:rotate-12 transition-transform shrink-0" />
                <div>
                  <div>⚡ Fetch Live OSM Leads</div>
                  <div className="text-[10px] text-sky-100/80 font-normal">Pan India Custom Search</div>
                </div>
              </button>

              {/* Curated Generator */}
              <button
                onClick={() => {
                  onOpenGenerateModal('curated');
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700 rounded-xl transition-all cursor-pointer text-left"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>🤖 Curated Seed Leads</span>
              </button>

              {/* Add Single Lead */}
              <button
                onClick={() => {
                  onOpenAddModal();
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all cursor-pointer text-left"
              >
                <PlusCircle className="w-4 h-4 text-sky-400 shrink-0" />
                <span>➕ Add Single Lead</span>
              </button>

              {/* Import CSV */}
              <button
                onClick={() => {
                  onOpenImportModal();
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all cursor-pointer text-left"
              >
                <UploadCloud className="w-4 h-4 text-slate-400 shrink-0" />
                <span>📥 Import CSV Records</span>
              </button>
            </div>
          </div>

          {/* Quick Export Tools */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Export Pipelines
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={EXPORT_EXCEL_URL}
                download
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-semibold transition-all border border-slate-700/60"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </a>

              <a
                href={EXPORT_CSV_URL}
                download
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-all border border-slate-700/60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </a>
            </div>
          </div>

        </div>

        {/* Sidebar Footer: Quick Pipeline Metric Badge */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-sky-400" />
                Pipeline Value
              </span>
              <span className="font-bold text-sky-400">
                {formatCurrencyLakhs(overview.totalPipelineValue)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Deals Won
              </span>
              <span className="font-semibold text-emerald-400">
                {overview.wonLeadsCount || 0} ({overview.conversionRate || 0}%)
              </span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
