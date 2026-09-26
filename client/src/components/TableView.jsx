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
  AlertCircle
} from 'lucide-react';
import {
  formatCurrencyLakhs,
  formatVerticalName,
  getPriorityBadgeClass,
  getStatusBadgeClass,
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
  sortBy,
  sortOrder,
  onSortChange
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-sky-100/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              
              <th className="py-3.5 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
              </th>

              <th
                onClick={() => handleSort('company_name')}
                className="py-3.5 px-4 cursor-pointer hover:text-sky-700 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Company & Location</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('vertical')}
                className="py-3.5 px-4 cursor-pointer hover:text-sky-700 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Vertical</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3.5 px-4">Contact & Role</th>

              <th className="py-3.5 px-4 min-w-[200px]">Primary AV Requirement</th>

              <th
                onClick={() => handleSort('deal_value')}
                className="py-3.5 px-4 cursor-pointer hover:text-sky-700 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Deal Est.</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('priority')}
                className="py-3.5 px-4 cursor-pointer hover:text-sky-700 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('status')}
                className="py-3.5 px-4 cursor-pointer hover:text-sky-700 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Pipeline Stage</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3.5 px-4 text-right pr-6">
                <span>Section 5: Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="9" className="py-16 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm">
                    <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading Collabsight CRM Leads...</span>
                  </div>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-16 text-center text-slate-400">
                  <div className="max-w-sm mx-auto space-y-2">
                    <AlertCircle className="w-8 h-8 text-sky-400 mx-auto" />
                    <p className="font-semibold text-slate-700 text-sm">No leads match your active filters</p>
                    <p className="text-xs text-slate-400">
                      Try clearing search parameters, or fetch new leads using the Ingestion section above.
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
                    className={`hover:bg-sky-50/50 transition-colors ${
                      isSelected ? 'bg-sky-50/80' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(lead.id)}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </td>

                    {/* Company & Location */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenPitchModal(lead, 'email')}
                            className="font-bold text-slate-900 hover:text-sky-600 text-left transition-colors cursor-pointer"
                          >
                            {lead.company_name}
                          </button>
                          {lead.website && (
                            <a
                              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Visit Website"
                              className="text-slate-400 hover:text-sky-600"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <span className="font-semibold text-sky-800">{lead.city}</span>
                          {lead.sub_region && lead.sub_region !== lead.city && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="truncate max-w-[180px]">{lead.sub_region}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Vertical */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {formatVerticalName(lead.vertical)}
                      </span>
                    </td>

                    {/* Contact & Role */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {lead.suggested_contact_name || 'Key Decision Maker'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal truncate max-w-[150px]">
                        {lead.target_role || 'IT / Facility Admin'}
                      </div>
                    </td>

                    {/* Primary AV Requirement */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-700 font-medium line-clamp-2" title={lead.primary_av_need}>
                        {lead.primary_av_need}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate max-w-[220px]">
                        {lead.pitch_angle}
                      </div>
                    </td>

                    {/* Deal Value */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sky-800">
                        {formatCurrencyLakhs(lead.deal_value)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lead.budget_tier ? lead.budget_tier.split(' ')[0] : 'Medium'}
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getPriorityBadgeClass(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </td>

                    {/* Inline Pipeline Stage Dropdown */}
                    <td className="py-3.5 px-4">
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

                    {/* SECTION 5: OUTREACH & QUICK ACTIONS */}
                    <td className="py-3.5 px-4 text-right pr-6">
                      <div className="inline-flex items-center gap-1 justify-end">
                        
                        {/* 1-Click Cold Email */}
                        <button
                          onClick={() => onOpenPitchModal(lead, 'email')}
                          title="Generate & Copy Tailored Cold Email"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg border border-transparent hover:border-sky-200 transition-all cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>

                        {/* Direct WhatsApp Pitch */}
                        <button
                          onClick={() => onOpenPitchModal(lead, 'whatsapp')}
                          title="Generate WhatsApp Pitch & Open Web Link"
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
                              className="text-[10px] font-bold text-rose-700 hover:underline"
                            >
                              Del
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-[10px] text-slate-400 hover:text-slate-600"
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

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="py-3 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-semibold text-slate-900">{leads.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{pagination.total}</span> leads
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all"
            >
              Previous
            </button>
            <span className="font-medium text-slate-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
