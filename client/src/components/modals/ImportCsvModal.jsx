import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { importCsvLeads } from '../../services/api';

export default function ImportCsvModal({ isOpen, onClose, onSuccess }) {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const parseCsv = (text) => {
    try {
      const lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        setError('CSV must have a header row and at least one data row.');
        return [];
      }

      // Simple CSV line parser supporting quoted fields
      const parseLine = (line) => {
        const row = [];
        let inQuotes = false;
        let cur = '';
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            row.push(cur.trim().replace(/^"|"$/g, ''));
            cur = '';
          } else {
            cur += char;
          }
        }
        row.push(cur.trim().replace(/^"|"$/g, ''));
        return row;
      };

      const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i]);
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] || '';
        });

        const companyName = obj.company_name || obj.company || obj.name;
        if (companyName) {
          rows.push({
            company_name: companyName,
            vertical: obj.vertical || 'corporate_it',
            city: obj.city || 'Mumbai MMR',
            sub_region: obj.sub_region || obj.subregion || obj.area || '',
            phone: obj.phone || obj.mobile || '',
            website: obj.website || '',
            target_role: obj.target_role || obj.role || 'IT Admin',
            suggested_contact_name: obj.suggested_contact_name || obj.contact_person || obj.contact || '',
            primary_av_need: obj.primary_av_need || obj.av_need || 'Video Conferencing Hardware',
            pitch_angle: obj.pitch_angle || 'Turnkey AV supply and installation SLA.',
            budget_tier: obj.budget_tier || 'Medium (₹2.5L - ₹4.5L)',
            deal_value: parseFloat(obj.deal_value || obj.deal_value_lakhs) || 3.5,
            priority: obj.priority || 'Warm',
            status: obj.status || 'New',
            notes: obj.notes || 'Imported via CSV'
          });
        }
      }

      return rows;
    } catch (err) {
      console.error(err);
      setError('Could not parse CSV format. Please check delimiter and headers.');
      return [];
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCsvText(content);
        const rows = parseCsv(content);
        setParsedRows(rows);
      }
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setCsvText(text);
    if (text.trim()) {
      const rows = parseCsv(text);
      setParsedRows(rows);
    } else {
      setParsedRows([]);
    }
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) {
      setError('No valid rows found to import.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await importCsvLeads(parsedRows);
      setResult(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-600 to-sky-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-sky-100" />
            <div>
              <h2 className="text-base font-bold font-heading">
                Import CSV Leads
              </h2>
              <p className="text-xs text-sky-100">
                Section 1: Upload or paste standard B2B leads data
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* File Picker */}
          <div className="border-2 border-dashed border-sky-200 rounded-2xl p-5 text-center bg-sky-50/40 hover:bg-sky-50/80 transition-colors">
            <FileSpreadsheet className="w-8 h-8 text-sky-600 mx-auto mb-2" />
            <div className="font-bold text-slate-800 text-sm">Upload .csv file</div>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard headers (company_name, vertical, city, phone, website, etc.)
            </p>
            <label className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-xs cursor-pointer">
              <span>Choose CSV File</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Paste CSV Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Or paste CSV data directly:
            </label>
            <textarea
              rows="4"
              value={csvText}
              onChange={handleTextChange}
              placeholder={`company_name,vertical,city,phone,primary_av_need\nAcme IT Corp,corporate_it,Thane,+91 98200 11111,Teams Room Upgrade\nDesign Studio LLP,architects_interior,Kalyan,+91 98200 22222,Low-voltage CAD schematics`}
              className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-hidden leading-relaxed"
            />
          </div>

          {/* Preview count */}
          {parsedRows.length > 0 && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-sky-900">
                Ready to import <span className="font-bold">{parsedRows.length}</span> leads
              </span>
              <span className="text-[11px] text-sky-700">Preview: {parsedRows[0].company_name} ({parsedRows[0].city})</span>
            </div>
          )}

          {/* Result Alert */}
          {result && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">{result.message}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl cursor-pointer"
          >
            {result ? 'Done' : 'Cancel'}
          </button>

          <button
            onClick={handleImport}
            disabled={loading || parsedRows.length === 0}
            className="px-5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Importing...' : `Import ${parsedRows.length} Leads`}
          </button>
        </div>

      </div>
    </div>
  );
}
