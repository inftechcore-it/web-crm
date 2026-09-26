import React from 'react';
import {
  Tv,
  Zap,
  Users,
  Target,
  SearchCheck,
  BarChart3,
  FileSpreadsheet,
  Download,
  TrendingUp,
  CheckCircle2,
  X
} from 'lucide-react';
import { EXPORT_EXCEL_URL, EXPORT_CSV_URL } from '../services/api';
import { formatCurrencyLakhs } from '../utils/formatters';

const NAV_ITEMS = [
  {
    id: 'generate',
    label: '1. Generate Leads',
    shortLabel: 'Generate Leads',
    icon: Zap,
    badge: '3 Sources'
  },
  {
    id: 'all_leads',
    label: '2. All Leads',
    shortLabel: 'All Leads',
    icon: Users,
    showCount: true
  },
  {
    id: 'pitch',
    label: '3. Pitch Generator',
    shortLabel: 'Pitch Generator',
    icon: Target,
    badge: 'Multi-Channel'
  },
  {
    id: 'search_sets',
    label: '4. Leads by Search Set',
    shortLabel: 'Leads by Search Set',
    icon: SearchCheck
  },
  {
    id: 'analytics',
    label: '5. Analytics & Insights',
    shortLabel: 'Analytics & Insights',
    icon: BarChart3
  }
];

export default function Sidebar({
  activeView,
  setActiveView,
  totalResults = 0,
  stats,
  mobileOpen = false,
  setMobileOpen
}) {
  const overview = stats?.overview || {};

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
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

      {/* Main Sidebar Container */}
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
              <div className="text-[10px] text-slate-400 font-medium">Pan India Lead Hub</div>
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

        {/* Navigation Menu (The 5 Requested Sections) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeView === item.id ||
                (item.id === 'all_leads' && (activeView === 'table' || activeView === 'kanban'));

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/25 ring-1 ring-white/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-sky-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.showCount && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-sky-400 border border-slate-700'
                      }`}
                    >
                      {totalResults}
                    </span>
                  )}

                  {item.badge && !item.showCount && (
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700/80'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Data Exports */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Export Pipelines
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={EXPORT_EXCEL_URL}
                download
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-400 text-[11px] font-semibold transition-all border border-slate-700/60"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel (.xlsx)</span>
              </a>

              <a
                href={EXPORT_CSV_URL}
                download
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-all border border-slate-700/60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV (.csv)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Mini Pipeline Metrics */}
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
                Won Deals
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
