import React, { useState } from 'react';
import {
  Mail,
  MessageCircle,
  PhoneCall,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  Building2,
  ArrowUpDown,
  History,
  CheckCircle2,
  AlertCircle,
  Tag,
  Clock,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Globe,
  Search,
  Zap,
  Loader2,
  Check
} from 'lucide-react';

const LinkedInIcon = ({ className = "w-2.5 h-2.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);
import {
  formatCurrencyLakhs,
  formatVerticalName,
  getPriorityBadgeClass,
  getStatusBadgeClass,
  formatDateTime,
  PIPELINE_STAGES
} from '../utils/formatters';

export default function TableView({
  leads = [],
  loading = false,
  selectedIds = [],
  setSelectedIds,
  onStageChange,
  onOpenPitchModal,
  onOpenActivityModal,
  onOpenEditModal,
  onDeleteLead,
  pagination = {},
  onPageChange,
  onLimitChange,
  sortBy,
  sortOrder,
  onSortChange,
  onFilterBySearchName,
  onEnrichLead
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [enrichingId, setEnrichingId] = useState(null);
  const [enrichSuccessId, setEnrichSuccessId] = useState(null);

  const handleEnrich = async (lead) => {
    if (!onEnrichLead || enrichingId) return;
    setEnrichingId(lead.id);
    try {
      await onEnrichLead(lead.id);
      setEnrichSuccessId(lead.id);
      setTimeout(() => setEnrichSuccessId(null), 3000);
    } catch (err) {
      console.error('Enrich lead error:', err);
    } finally {
      setEnrichingId(null);
    }
  };

  const isAllSelected = leads.length > 0 && leads.every(l => selectedIds.includes(l.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map(l => l.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      onSortChange(column, sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSortChange(column, 'ASC');
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-sky-100 shadow-xs overflow-hidden">
      
      {/* Table Container */}
      <div className="overflow-x-auto min-h-[420px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-sky-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              
              <th className="py-3.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
              </th>

              {/* REQUIREMENT 4: Search Name Column */}
              <th
                onClick={() => handleSort('search_name')}
                className="py-3.5 px-3 cursor-pointer hover:text-sky-700 transition-colors select-none min-w-[140px]"
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-sky-600" />
                  <span>Search Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* REQUIREMENT 5: Timestamp Column */}
              <th
                onClick={() => handleSort('created_at')}
                className="py-3.5 px-3 cursor-pointer hover:text-sky-700 transition-colors select-none min-w-[140px]"
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-sky-600" />
                  <span>Timestamp</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('company_name')}
                className="py-3.5 px-4 cursor-pointer hover:text-sky-700 transition-colors select-none min-w-[180px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Company & Location</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('vertical')}
                className="py-3.5 px-3 cursor-pointer hover:text-sky-700 transition-colors select-none min-w-[130px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Vertical</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3.5 px-3 min-w-[130px]">Contact & Role</th>

              <th className="py-3.5 px-4 min-w-[190px]">Primary AV Requirement</th>

              <th
                onClick={() => handleSort('deal_value')}
                className="py-3.5 px-3 cursor-pointer hover:text-sky-700 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Deal Est.</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('priority')}
                className="py-3.5 px-3 cursor-pointer hover:text-sky-700 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('status')}
                className="py-3.5 px-3 cursor-pointer hover:text-sky-700 transition-colors select-none min-w-[120px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Pipeline Stage</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3.5 px-4 text-right pr-6 min-w-[140px]">
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="11" className="py-16 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm">
                    <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading CRM Leads...</span>
                  </div>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="11" className="py-16 text-center text-slate-400">
                  <div className="max-w-sm mx-auto space-y-2">
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-semibold text-slate-600">No leads match your active filters</p>
                    <p className="text-xs text-slate-400">
                      Try resetting filters or fetch fresh leads using the menu on the left.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedIds.includes(lead.id);

                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-sky-50/40 transition-colors group ${
                      isSelected ? 'bg-sky-50/70' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(lead.id)}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </td>

                    {/* REQUIREMENT 4: Search Name Badge */}
                    <td className="py-3.5 px-3">
                      {lead.search_name ? (
                        <button
                          type="button"
                          onClick={() => onFilterBySearchName && onFilterBySearchName(lead.search_name)}
                          title={`Filter by Search Set: ${lead.search_name}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100 transition-all text-left max-w-[150px] truncate cursor-pointer"
                        >
                          <Tag className="w-2.5 h-2.5 shrink-0 text-indigo-500" />
                          <span className="truncate">{lead.search_name}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Unlabeled</span>
                      )}
                    </td>

                    {/* REQUIREMENT 5: Timestamp */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{formatDateTime(lead.created_at)}</span>
                      </div>
                    </td>

                    {/* Company & Location */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                          <span>{lead.company_name}</span>
                          {lead.rating && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              ⭐ {lead.rating}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <span className="font-semibold text-sky-800">{lead.city}</span>
                          {lead.sub_region && lead.sub_region !== lead.city && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="truncate max-w-[160px]">{lead.sub_region}</span>
                            </>
                          )}
                        </div>

                        {/* Verified Search & Profile Shortcuts */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {/* Google Maps link */}
                          <a
                            href={lead.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.company_name + ' ' + (lead.city || ''))}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Verify on Google Maps & Reviews"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition-colors"
                          >
                            <MapPin className="w-2.5 h-2.5" />
                            <span>Maps</span>
                          </a>

                          {/* LinkedIn Person / Org search */}
                          <a
                            href={lead.linkedin_url || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(lead.company_name + ' ' + (lead.target_role || 'Decision Maker') + ' ' + (lead.city || ''))}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Find Decision Maker on LinkedIn"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 transition-colors"
                          >
                            <LinkedInIcon className="w-2.5 h-2.5" />
                            <span>LinkedIn</span>
                          </a>

                          {/* Official Website or Google Search */}
                          {lead.website ? (
                            <a
                              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Visit Verified Website"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-1.5 py-0.5 rounded border border-sky-200 transition-colors"
                            >
                              <Globe className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[85px]">{lead.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                            </a>
                          ) : (
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(lead.company_name + ' ' + (lead.city || '') + ' official website')}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Search Google for Official Site"
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded transition-colors"
                            >
                              <Search className="w-2.5 h-2.5" />
                              <span>Find Site</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Vertical */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {formatVerticalName(lead.vertical)}
                      </span>
                    </td>

                    {/* Contact & Role */}
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-800 truncate max-w-[130px]">
                        {lead.suggested_contact_name || 'Key Decision Maker'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal truncate max-w-[130px]">
                        {lead.target_role || 'IT / Facility Admin'}
                      </div>
                      {lead.phone && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[130px]">
                          {lead.phone}
                        </div>
                      )}
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          title={`Email ${lead.email}`}
                          className="inline-block text-[10px] text-sky-600 hover:underline truncate max-w-[130px]"
                        >
                          {lead.email}
                        </a>
                      )}
                    </td>

                    {/* Primary AV Requirement */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-700 font-medium line-clamp-2" title={lead.primary_av_need}>
                        {lead.primary_av_need}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate max-w-[200px]">
                        {lead.pitch_angle}
                      </div>
                    </td>

                    {/* Deal Value */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-sky-800">
                        {formatCurrencyLakhs(lead.deal_value)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lead.budget_tier ? lead.budget_tier.split(' ')[0] : 'Medium'}
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getPriorityBadgeClass(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </td>

                    {/* Inline Pipeline Stage Dropdown */}
                    <td className="py-3.5 px-3">
                      <select
                        value={lead.status}
                        onChange={(e) => onStageChange(lead.id, e.target.value)}
                        className={`text-[11px] font-semibold py-1 px-2 rounded-lg border cursor-pointer outline-hidden transition-all ${getStatusBadgeClass(lead.status)}`}
                      >
                        {PIPELINE_STAGES.map(stage => (
                          <option key={stage} value={stage} className="bg-white text-slate-800">
                            {stage}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Row-Level Actions (Keeping row-level pitch generator as requested!) */}
                    <td className="py-3.5 px-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1">

                        {/* ⚡ Enrich via Google Places */}
                        <button
                          onClick={() => handleEnrich(lead)}
                          disabled={enrichingId === lead.id}
                          title={lead.google_place_id ? "Re-enrich with Google Places" : "⚡ Enrich via Google Places & Live Verification"}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            enrichSuccessId === lead.id
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                              : enrichingId === lead.id
                              ? 'text-amber-600 bg-amber-50 border-amber-200 animate-pulse'
                              : lead.google_place_id
                              ? 'text-sky-600 hover:text-sky-800 hover:bg-sky-50 border-transparent hover:border-sky-200'
                              : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200/60'
                          }`}
                        >
                          {enrichingId === lead.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : enrichSuccessId === lead.id ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                        </button>
                        
                        {/* Cold Email Pitch */}
                        <button
                          onClick={() => onOpenPitchModal(lead, 'email')}
                          title="Generate & Copy Tailored Cold Email"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg border border-transparent hover:border-sky-200 transition-all cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>

                        {/* WhatsApp Outreach */}
                        <button
                          onClick={() => onOpenPitchModal(lead, 'whatsapp')}
                          title="Send One-Click WhatsApp AV Pitch"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-200 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>

                        {/* 60s Call Script */}
                        <button
                          onClick={() => onOpenPitchModal(lead, 'call')}
                          title="View 60-Second Cold Call Script & Objections"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200 transition-all cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </button>

                        {/* Activity History & Logger */}
                        <button
                          onClick={() => onOpenActivityModal(lead)}
                          title="Log Meeting / Note / History"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-200 transition-all cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Lead */}
                        <button
                          onClick={() => onOpenEditModal(lead)}
                          title="Edit Lead Details"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Single Lead */}
                        {deleteConfirmId === lead.id ? (
                          <div className="inline-flex items-center gap-1 bg-rose-50 px-1.5 py-0.5 rounded-lg border border-rose-200">
                            <button
                              onClick={() => {
                                onDeleteLead(lead.id);
                                setDeleteConfirmId(null);
                              }}
                              className="text-[10px] font-bold text-rose-700 hover:underline cursor-pointer"
                            >
                              Del
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(lead.id)}
                            title="Delete Lead"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* REQUIREMENT 6: Enhanced Pagination Footer with Limit Dropdown (20, 50, 100, 200) and Arrow Controls */}
      <div className="py-3 px-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        
        {/* Left: Range and Total Counts */}
        <div className="flex items-center gap-3">
          <div>
            Showing <span className="font-bold text-slate-900">{leads.length > 0 ? ((pagination.page - 1) * pagination.limit + 1) : 0}</span> to{' '}
            <span className="font-bold text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total || 0)}</span> of{' '}
            <span className="font-bold text-sky-700">{pagination.total || 0}</span> leads
          </div>

          {/* Rows per page selector: 20, 50, 100, 200 */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Show:</span>
            <select
              value={pagination.limit || 100}
              onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
              className="py-1 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:border-sky-500 outline-hidden cursor-pointer"
            >
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
              <option value="200">200 / page</option>
            </select>
          </div>
        </div>

        {/* Right: Page Navigation with Arrow Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            title="Previous Page"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="px-3 py-1 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-xs shadow-2xs">
            Page {pagination.page || 1} of {Math.max(1, pagination.totalPages || 1)}
          </div>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= (pagination.totalPages || 1)}
            title="Next Page"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
