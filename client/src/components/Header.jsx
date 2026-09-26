import React from 'react';
import {
  Tv,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  TrendingUp,
  Flame,
  CheckCircle2,
  Building2,
  Menu
} from 'lucide-react';
import { formatCurrencyLakhs } from '../utils/formatters';
import { EXPORT_EXCEL_URL, EXPORT_CSV_URL } from '../services/api';

export default function Header({ stats, onRefresh, loading, onToggleMobileMenu }) {
  const overview = stats?.overview || {};

  return (
    <header className="glass-panel sticky top-0 z-30 border-b border-sky-100 bg-white/90 shadow-2xs backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Left: Mobile Menu Button + Title / Context */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-heading">
                  Collabsight <span className="text-sky-600">AV CRM</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-800 rounded-full border border-sky-200">
                  Enterprise SMB
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Audio-Visual Client Pipeline & Geospatial Lead Engine • Pan India
              </p>
            </div>
          </div>

          {/* Center / Right: Quick Metrics Bar & Refresh */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            <div className="flex items-center gap-2 sm:gap-3 bg-sky-50/70 p-1.5 sm:p-2 rounded-xl border border-sky-100/80">
              <div className="flex items-center gap-1.5 px-2 border-r border-sky-200/60">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Total Leads</div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {overview.totalLeads ?? 0}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2 border-r border-sky-200/60">
                <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Pipeline</div>
                  <div className="text-xs font-bold text-sky-700 leading-tight">
                    {formatCurrencyLakhs(overview.totalPipelineValue)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2 border-r border-sky-200/60">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Hot Deals</div>
                  <div className="text-xs font-bold text-red-600 leading-tight">
                    {overview.hotLeadsCount ?? 0}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Won</div>
                  <div className="text-xs font-bold text-emerald-700 leading-tight">
                    {overview.wonLeadsCount ?? 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh CRM Data"
              className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl border border-slate-200 hover:border-sky-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
