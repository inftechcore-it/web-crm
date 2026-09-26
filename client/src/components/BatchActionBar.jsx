import React, { useState } from 'react';
import {
  CheckSquare,
  Trash2,
  ArrowRightCircle,
  FileSpreadsheet,
  X,
  AlertCircle
} from 'lucide-react';
import { PIPELINE_STAGES } from '../utils/formatters';

export default function BatchActionBar({
  selectedCount,
  onClearSelection,
  onBatchUpdateStatus,
  onBatchDelete,
  onExportSelected
}) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-sky-400/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Count Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-500/30">
            {selectedCount}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-100">
              {selectedCount} {selectedCount === 1 ? 'Lead' : 'Leads'} Selected
            </span>
            <span className="block text-[10px] text-slate-400">
              Section 4: Bulk Operations
            </span>
          </div>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Update Stage Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 font-medium">Stage:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedStatus(val);
                if (val) {
                  onBatchUpdateStatus(val);
                  setSelectedStatus('');
                }
              }}
              className="bg-transparent text-xs text-sky-300 font-semibold outline-hidden cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-400">Move to...</option>
              {PIPELINE_STAGES.map(stage => (
                <option key={stage} value={stage} className="bg-slate-900 text-white">
                  {stage}
                </option>
              ))}
            </select>
          </div>

          {/* Export Selected */}
          <button
            onClick={onExportSelected}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* Delete Selected */}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 bg-rose-900/80 px-2 py-1 rounded-xl border border-rose-600 animate-pulse">
              <span className="text-[11px] font-bold text-white">Confirm?</span>
              <button
                onClick={() => {
                  onBatchDelete();
                  setConfirmDelete(false);
                }}
                className="px-2 py-0.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-0.5 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                No
              </button>
            </div>
          )}

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer ml-1"
            title="Deselect all"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
}
