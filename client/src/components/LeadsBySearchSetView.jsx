import React, { useState, useEffect } from 'react';
import {
  Tag,
  Calendar,
  Layers,
  Briefcase,
  MapPin,
  Filter,
  CheckCircle2,
  TrendingUp,
  Download,
  Mail,
  MessageCircle,
  ExternalLink,
  PhoneCall,
  History,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  formatCurrencyLakhs,
  formatVerticalName,
  getPriorityBadgeClass,
  getStatusBadgeClass,
  formatDateTime,
  PIPELINE_STAGES,
  VERTICAL_OPTIONS
} from '../utils/formatters';
import { fetchSearchSetsMeta, fetchLeads, EXPORT_CSV_URL } from '../services/api';

const DIMENSIONS = [
  { id: 'search_set', label: 'Search Set / Batch Label', icon: Tag },
  { id: 'category', label: 'Domain Category', icon: Briefcase },
  { id: 'date', label: 'Ingestion Date', icon: Calendar },
  { id: 'status', label: 'Pipeline Stage', icon: Layers },
  { id: 'city', label: 'City / Commercial Hub', icon: MapPin }
];

export default function LeadsBySearchSetView({
  onOpenPitchModal,
  onOpenActivityModal,
  onOpenEditModal,
  onStageChange
}) {
  const [meta, setMeta] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Cascading Dropdown States
  const [selectedDimension, setSelectedDimension] = useState('search_set');
  const [subSelection, setSubSelection] = useState('');

  // Filtered Leads State
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Load Metadata
  useEffect(() => {
    async function loadMeta() {
      setLoadingMeta(true);
      try {
        const data = await fetchSearchSetsMeta();
        setMeta(data);

        // Set initial sub-selection based on default dimension
        if (data.searchSets && data.searchSets.length > 0) {
          setSubSelection(data.searchSets[0].search_name);
        }
      } catch (err) {
        console.error('Error loading search sets meta:', err);
      } finally {
        setLoadingMeta(false);
      }
    }
    loadMeta();
  }, []);

  // When dimension changes, pick first available subSelection
  const handleDimensionChange = (newDim) => {
    setSelectedDimension(newDim);
    if (!meta) return;

    if (newDim === 'category') {
      setSubSelection(meta.categories?.[0]?.vertical || 'corporate_it');
    } else if (newDim === 'search_set') {
      setSubSelection(meta.searchSets?.[0]?.search_name || 'all');
    } else if (newDim === 'date') {
      setSubSelection(meta.dates?.[0]?.date_str || 'today');
    } else if (newDim === 'status') {
      setSubSelection(meta.statuses?.[0]?.status || 'New');
    } else if (newDim === 'city') {
      setSubSelection(meta.cities?.[0]?.city || 'Kalyan');
    }
  };

  // Fetch leads whenever dimension or subSelection changes
  useEffect(() => {
    async function loadFilteredLeads() {
      if (!subSelection) return;
      setLoadingLeads(true);
      try {
        const queryParams = { limit: 200 };

        if (selectedDimension === 'search_set') {
          queryParams.search_name = subSelection;
        } else if (selectedDimension === 'category') {
          queryParams.vertical = subSelection;
        } else if (selectedDimension === 'date') {
          queryParams.date_range = subSelection;
        } else if (selectedDimension === 'status') {
          queryParams.status = subSelection;
        } else if (selectedDimension === 'city') {
          queryParams.city = subSelection;
        }

        const res = await fetchLeads(queryParams);
        setLeads(res.leads || []);
      } catch (err) {
        console.error('Error fetching leads for search set view:', err);
      } finally {
        setLoadingLeads(false);
      }
    }

    loadFilteredLeads();
  }, [selectedDimension, subSelection]);

  // Aggregate Metrics for this active set
  const totalValue = leads.reduce((sum, l) => sum + (Number(l.deal_value) || 0), 0);
  const hotLeads = leads.filter(l => l.priority === 'Hot').length;
  const wonLeads = leads.filter(l => l.status === 'Won').length;

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-sky-600 to-cyan-500 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-xs">
                Requirement 7: Search Set Intelligence
              </span>
              <span className="text-xs text-sky-100">• Dynamic Cascading Filtering</span>
            </div>
            <h2 className="text-2xl font-bold font-heading">
              🔍 Leads by Search Set & Categorical Aspects
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl mt-1">
              Group, compare, and inspect lead cohorts by Search Set labels, Domain Categories, Ingestion Timestamps, or Pipeline stages.
            </p>
          </div>
        </div>
      </div>

      {/* CASCADING FILTER CONTROLS BAR */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-sky-100 p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* STEP 1: First Dropdown - Search By Dimension */}
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-sky-600" />
              <span>1. Search By Filter (Dimension):</span>
            </label>
            <div className="relative">
              <select
                value={selectedDimension}
                onChange={(e) => handleDimensionChange(e.target.value)}
                className="w-full py-2.5 pl-3.5 pr-8 bg-slate-50 hover:bg-slate-100 font-bold text-slate-800 text-xs sm:text-sm rounded-xl border border-slate-300 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-hidden transition-all cursor-pointer appearance-none"
              >
                {DIMENSIONS.map(dim => (
                  <option key={dim.id} value={dim.id}>
                    {dim.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>
          </div>

          {/* Arrow Divider */}
          <div className="hidden md:flex md:col-span-1 items-center justify-center pt-5">
            <ArrowRight className="w-5 h-5 text-sky-500" />
          </div>

          {/* STEP 2: Cascading Second Dropdown based on Dimension */}
          <div className="md:col-span-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>
                2. Select{' '}
                {selectedDimension === 'category'
                  ? 'Domain Category'
                  : selectedDimension === 'search_set'
                  ? 'Search Set Label'
                  : selectedDimension === 'date'
                  ? 'Ingestion Date'
                  : selectedDimension === 'status'
                  ? 'Pipeline Stage'
                  : 'City / Commercial Hub'}
              </span>
              <span className="text-[10px] text-sky-600 font-normal">cascading dropdown</span>
            </label>

            <div className="relative">
              {/* If Dimension === 'category' */}
              {selectedDimension === 'category' && (
                <select
                  value={subSelection}
                  onChange={(e) => setSubSelection(e.target.value)}
                  className="w-full py-2.5 pl-3.5 pr-8 bg-sky-50/70 border border-sky-300 font-bold text-sky-900 text-xs sm:text-sm rounded-xl focus:bg-white focus:border-sky-500 outline-hidden transition-all cursor-pointer appearance-none"
                >
                  {VERTICAL_OPTIONS.filter(v => v.value !== 'all').map(v => {
                    const count = meta?.categories?.find(c => c.vertical === v.value)?.count || 0;
                    return (
                      <option key={v.value} value={v.value}>
                        🏢 {v.label} ({count} leads)
                      </option>
                    );
                  })}
                </select>
              )}

              {/* If Dimension === 'search_set' */}
              {selectedDimension === 'search_set' && (
                <select
                  value={subSelection}
                  onChange={(e) => setSubSelection(e.target.value)}
                  className="w-full py-2.5 pl-3.5 pr-8 bg-indigo-50/70 border border-indigo-300 font-bold text-indigo-950 text-xs sm:text-sm rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden transition-all cursor-pointer appearance-none"
                >
                  {meta?.searchSets && meta.searchSets.length > 0 ? (
                    meta.searchSets.map(s => (
                      <option key={s.search_name} value={s.search_name}>
                        🏷️ {s.search_name} ({s.count} leads — ₹{s.total_value || 0}L)
                      </option>
                    ))
                  ) : (
                    <option value="">No search sets recorded yet</option>
                  )}
                </select>
              )}

              {/* If Dimension === 'date' */}
              {selectedDimension === 'date' && (
                <select
                  value={subSelection}
                  onChange={(e) => setSubSelection(e.target.value)}
                  className="w-full py-2.5 pl-3.5 pr-8 bg-amber-50/70 border border-amber-300 font-bold text-amber-950 text-xs sm:text-sm rounded-xl focus:bg-white focus:border-amber-500 outline-hidden transition-all cursor-pointer appearance-none"
                >
                  <option value="today">📅 Today's Ingestion</option>
                  <option value="yesterday">📅 Yesterday</option>
                  <option value="last_7_days">📅 Last 7 Days</option>
                  <option value="last_30_days">📅 Last 30 Days</option>
                  {meta?.dates?.map(d => (
                    <option key={d.date_str} value={d.date_str}>
                      Specific Date: {d.date_str} ({d.count} leads)
                    </option>
                  ))}
                </select>
              )}

              {/* If Dimension === 'status' */}
              {selectedDimension === 'status' && (
                <select
                  value={subSelection}
                  onChange={(e) => setSubSelection(e.target.value)}
                  className="w-full py-2.5 pl-3.5 pr-8 bg-purple-50/70 border border-purple-300 font-bold text-purple-950 text-xs sm:text-sm rounded-xl focus:bg-white focus:border-purple-500 outline-hidden transition-all cursor-pointer appearance-none"
                >
                  {PIPELINE_STAGES.map(st => {
                    const count = meta?.statuses?.find(s => s.status === st)?.count || 0;
                    return (
                      <option key={st} value={st}>
                        📊 {st} ({count} leads)
                      </option>
                    );
                  })}
                </select>
              )}

              {/* If Dimension === 'city' */}
              {selectedDimension === 'city' && (
                <select
                  value={subSelection}
                  onChange={(e) => setSubSelection(e.target.value)}
                  className="w-full py-2.5 pl-3.5 pr-8 bg-emerald-50/70 border border-emerald-300 font-bold text-emerald-950 text-xs sm:text-sm rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden transition-all cursor-pointer appearance-none"
                >
                  {meta?.cities?.map(c => (
                    <option key={c.city} value={c.city}>
                      📍 {c.city} ({c.count} leads)
                    </option>
                  ))}
                </select>
              )}

              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>
          </div>

        </div>
      </div>

      {/* ACTIVE SET STATS METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Leads In Cohort</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">
            {leads.length}
          </div>
          <div className="text-[11px] text-sky-600 font-medium mt-0.5">
            Selected: {subSelection || 'None'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Cohort Deal Pipeline</div>
          <div className="text-xl font-bold text-sky-700 mt-0.5">
            {formatCurrencyLakhs(totalValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Est. AV Turnover</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">High-Priority Hot Deals</div>
          <div className="text-xl font-bold text-red-600 mt-0.5">
            {hotLeads}
          </div>
          <div className="text-[11px] text-red-500 mt-0.5">Immediate follow-up</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-400">Deals Closed Won</div>
          <div className="text-xl font-bold text-emerald-600 mt-0.5">
            {wonLeads}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            {leads.length > 0 ? `${((wonLeads / leads.length) * 100).toFixed(0)}% conversion` : '0%'}
          </div>
        </div>

      </div>

      {/* FILTERED LEADS TABLE */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
        
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">
              Leads in "{subSelection || selectedDimension}"
            </span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-sky-100 text-sky-800 font-semibold">
              {leads.length} records
            </span>
          </div>

          <a
            href={EXPORT_CSV_URL}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Set CSV</span>
          </a>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-sky-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">Search Name</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-4">Company & City</th>
                <th className="py-3 px-3">Vertical</th>
                <th className="py-3 px-3">Contact Person</th>
                <th className="py-3 px-4">Primary AV Need</th>
                <th className="py-3 px-3">Deal Value</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Pipeline Stage</th>
                <th className="py-3 px-4 text-right pr-6">Pitch Outreach</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loadingLeads ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2 text-sky-600 font-semibold">
                      <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Filtering cohort leads...</span>
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">No leads found in this cohort</p>
                    <p className="text-xs text-slate-400 mt-1">Select another search set or dimension above.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-sky-50/40 transition-colors">
                    
                    {/* Search Name */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Tag className="w-2.5 h-2.5 text-indigo-500" />
                        <span className="truncate max-w-[120px]">{lead.search_name || 'Unlabeled'}</span>
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDateTime(lead.created_at)}
                    </td>

                    {/* Company */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{lead.company_name}</div>
                      <div className="text-[11px] text-sky-700 font-medium">{lead.city}</div>
                    </td>

                    {/* Vertical */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {formatVerticalName(lead.vertical)}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {lead.suggested_contact_name || 'Decision Maker'}
                    </td>

                    {/* Need */}
                    <td className="py-3 px-4 max-w-[200px] truncate" title={lead.primary_av_need}>
                      {lead.primary_av_need}
                    </td>

                    {/* Deal Value */}
                    <td className="py-3 px-3 font-bold text-sky-800">
                      {formatCurrencyLakhs(lead.deal_value)}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getPriorityBadgeClass(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </td>

                    {/* Stage */}
                    <td className="py-3 px-3">
                      <select
                        value={lead.status}
                        onChange={(e) => onStageChange(lead.id, e.target.value)}
                        className={`text-[11px] font-semibold py-1 px-2 rounded-lg border cursor-pointer outline-hidden ${getStatusBadgeClass(lead.status)}`}
                      >
                        {PIPELINE_STAGES.map(stage => (
                          <option key={stage} value={stage} className="bg-white text-slate-800">
                            {stage}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenPitchModal(lead, 'email')}
                          title="Generate Email Pitch"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenPitchModal(lead, 'whatsapp')}
                          title="Generate WhatsApp Pitch"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenActivityModal(lead)}
                          title="View Lead Activity"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
