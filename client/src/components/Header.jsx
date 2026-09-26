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
  Building2
} from 'lucide-react';
import { formatCurrencyLakhs } from '../utils/formatters';
import { EXPORT_EXCEL_URL, EXPORT_CSV_URL } from '../services/api';

export default function Header({ stats, onRefresh, loading }) {
  const overview = stats?.overview || {};

  return (
    <header className="glass-panel sticky top-0 z-30 border-b border-sky-100 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-500/20 text-white">
              <Tv className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 font-heading">
                  Collabsight <span className="text-sky-600">AV CRM</span>
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-sky-100 text-sky-800 rounded-full border border-sky-200">
                  Enterprise SMB
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Turnkey Audio-Visual Client Pipeline • Mumbai MMR & Tier 2/3 Hubs
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 bg-sky-50/70 p-2 sm:p-2.5 rounded-xl border border-sky-100/80">
            <div className="flex items-center gap-2 px-2 border-r border-sky-200/60 last:border-r-0">
              <Building2 className="w-4 h-4 text-sky-600" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Leads</div>
                <div className="text-sm font-bold text-slate-800 leading-tight">
                  {overview.totalLeads ?? 0}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2 border-r border-sky-200/60 last:border-r-0">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Pipeline Value</div>
                <div className="text-sm font-bold text-sky-700 leading-tight">
                  {formatCurrencyLakhs(overview.totalPipelineValue)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2 border-r border-sky-200/60 last:border-r-0">
              <Flame className="w-4 h-4 text-red-500" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Hot Deals</div>
                <div className="text-sm font-bold text-red-600 leading-tight">
                  {overview.hotLeadsCount ?? 0}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Deals Won</div>
                <div className="text-sm font-bold text-emerald-700 leading-tight">
                  {overview.wonLeadsCount ?? 0} ({overview.conversionRate ?? 0}%)
                </div>
              </div>
            </div>
          </div>

          {/* Header Action Buttons (Export & Refresh) */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh CRM Data"
              className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg border border-slate-200 hover:border-sky-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            </button>

            <a
              href={EXPORT_EXCEL_URL}
              download
              title="Export Formatted Multi-Sheet Excel (.xlsx)"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Excel</span>
            </a>

            <a
              href={EXPORT_CSV_URL}
              download
              title="Export Standard CRM CSV (.csv)"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
}
