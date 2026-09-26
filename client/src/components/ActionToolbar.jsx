import React from 'react';
import {
  Zap,
  Sparkles,
  PlusCircle,
  UploadCloud,
  Table,
  Columns3,
  BarChart3,
  Layers,
  Globe
} from 'lucide-react';

export default function ActionToolbar({
  activeView,
  setActiveView,
  onOpenGenerateModal,
  onOpenAddModal,
  onOpenImportModal,
  totalResults = 0
}) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-sky-100 shadow-xs p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* SECTION 1: LEAD GENERATION & INGESTION */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 uppercase tracking-wider bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 self-start sm:self-auto">
            <Zap className="w-3.5 h-3.5 text-sky-600 fill-sky-500" />
            <span>Section 1: Ingestion</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenGenerateModal('osm')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 rounded-xl shadow-xs shadow-sky-500/20 hover:shadow-sky-500/30 transition-all cursor-pointer group"
            >
              <Globe className="w-3.5 h-3.5 text-sky-100 group-hover:rotate-12 transition-transform" />
              <span>⚡ Fetch Live OSM Leads</span>
            </button>

            <button
              onClick={() => onOpenGenerateModal('curated')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-sky-800 bg-sky-100/90 hover:bg-sky-200 border border-sky-300 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>🤖 Generate Curated Leads</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>➕ Add Single Lead</span>
            </button>

            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
              <span>📥 Import CSV</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: VIEW & WORKSPACE MODES */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Section 2: View Modes</span>
          </div>

          <div className="inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 shadow-inner">
            <button
              onClick={() => setActiveView('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeView === 'table'
                  ? 'bg-white text-sky-700 shadow-xs border border-sky-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table Grid</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-sky-100 text-sky-800">
                {totalResults}
              </span>
            </button>

            <button
              onClick={() => setActiveView('kanban')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeView === 'kanban'
                  ? 'bg-white text-sky-700 shadow-xs border border-sky-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>

            <button
              onClick={() => setActiveView('analytics')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeView === 'analytics'
                  ? 'bg-white text-sky-700 shadow-xs border border-sky-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
