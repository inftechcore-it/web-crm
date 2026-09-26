import React from 'react';
import {
  Search,
  Filter,
  X,
  Flame,
  MapPin,
  Briefcase,
  Layers,
  Sparkles,
  Tag
} from 'lucide-react';
import { VERTICAL_OPTIONS, CITY_OPTIONS, PIPELINE_STAGES } from '../utils/formatters';

export default function FilterBar({
  filters,
  setFilters,
  onResetFilters,
  searchSets = []
}) {
  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.vertical && filters.vertical !== 'all') ||
    (filters.city && filters.city !== 'all') ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    (filters.search_name && filters.search_name !== 'all')
  );

  const applyPreset = (preset) => {
    switch (preset) {
      case 'hot':
        setFilters(prev => ({ ...prev, priority: 'Hot', status: 'all', vertical: 'all', city: 'all', search_name: 'all' }));
        break;
      case 'mmr':
        setFilters(prev => ({ ...prev, city: 'all', search: 'Thane', priority: 'all', status: 'all', vertical: 'all', search_name: 'all' }));
        break;
      case 'active_pipeline':
        setFilters(prev => ({ ...prev, status: 'Meeting Fixed', priority: 'all', vertical: 'all', city: 'all', search_name: 'all' }));
        break;
      case 'won':
        setFilters(prev => ({ ...prev, status: 'Won', priority: 'all', vertical: 'all', city: 'all', search_name: 'all' }));
        break;
      case 'corporate':
        setFilters(prev => ({ ...prev, vertical: 'corporate_it', priority: 'all', status: 'all', city: 'all', search_name: 'all' }));
        break;
      default:
        onResetFilters();
        break;
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-sky-100 shadow-xs p-4 mb-6">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            placeholder="Search company, city, contact, search name, AV need (e.g. 'Teams Room', 'BKC Architects')..."
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-hidden"
          />
          {filters.search && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          
          {/* REQUIREMENT 4: Search Name Filter */}
          <div className="relative">
            <select
              value={filters.search_name || 'all'}
              onChange={(e) => setFilters(prev => ({ ...prev, search_name: e.target.value, page: 1 }))}
              className={`w-full py-2 pl-2.5 pr-7 text-xs font-semibold rounded-xl border transition-all outline-hidden appearance-none cursor-pointer ${
                filters.search_name && filters.search_name !== 'all'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                  : 'bg-slate-50 hover:bg-slate-100/80 text-slate-700 border-slate-200'
              }`}
            >
              <option value="all">🏷️ All Search Sets</option>
              {searchSets.map(s => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.count})
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
          </div>

          {/* Vertical Dropdown */}
          <div className="relative">
            <select
              value={filters.vertical}
              onChange={(e) => setFilters(prev => ({ ...prev, vertical: e.target.value, page: 1 }))}
              className="w-full py-2 pl-2.5 pr-7 text-xs bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-medium rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-hidden appearance-none cursor-pointer"
            >
              {VERTICAL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
          </div>

          {/* Region / City Dropdown */}
          <div className="relative">
            <select
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value, page: 1 }))}
              className="w-full py-2 pl-2.5 pr-7 text-xs bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-medium rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-hidden appearance-none cursor-pointer"
            >
              {CITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
          </div>

          {/* Priority Dropdown */}
          <div className="relative">
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value, page: 1 }))}
              className="w-full py-2 pl-2.5 pr-7 text-xs bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-medium rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-hidden appearance-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="Hot">🔥 Hot</option>
              <option value="Warm">⚡ Warm</option>
              <option value="Cold">❄️ Cold</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
          </div>

          {/* Stage Dropdown */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-full py-2 pl-2.5 pr-7 text-xs bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-medium rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-hidden appearance-none cursor-pointer"
            >
              <option value="all">All Pipeline Stages</option>
              {PIPELINE_STAGES.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
          </div>

        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}

      </div>

      {/* Smart Presets Ribbon */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-sky-500" />
          Smart Presets:
        </span>

        <button
          onClick={() => applyPreset('all')}
          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all cursor-pointer"
        >
          All Leads
        </button>

        <button
          onClick={() => applyPreset('hot')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all cursor-pointer"
        >
          <Flame className="w-3 h-3 text-red-500 fill-red-500" />
          <span>Hot Priority</span>
        </button>

        <button
          onClick={() => applyPreset('corporate')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-all cursor-pointer"
        >
          <Briefcase className="w-3 h-3 text-sky-600" />
          <span>Corporate IT / ITES</span>
        </button>

        <button
          onClick={() => applyPreset('active_pipeline')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer"
        >
          <Layers className="w-3 h-3 text-amber-600" />
          <span>Meeting Fixed</span>
        </button>

        <button
          onClick={() => applyPreset('won')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
        >
          <span>🏆 Closed Won</span>
        </button>

        {filters.search_name && filters.search_name !== 'all' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
            <Tag className="w-3 h-3 text-indigo-600" />
            <span>Search Set: {filters.search_name}</span>
            <button
              onClick={() => setFilters(prev => ({ ...prev, search_name: 'all' }))}
              className="hover:text-indigo-950 font-bold ml-1 cursor-pointer"
            >
              ✕
            </button>
          </span>
        )}
      </div>

    </div>
  );
}
