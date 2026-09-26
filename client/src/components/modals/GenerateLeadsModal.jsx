import React, { useState } from 'react';
import {
  X,
  Zap,
  Globe,
  Sparkles,
  MapPin,
  Briefcase,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { generateLeads } from '../../services/api';

const REGIONS = [
  { key: 'kalyan', name: 'Kalyan-Dombivli' },
  { key: 'thane', name: 'Thane' },
  { key: 'navi_mumbai', name: 'Navi Mumbai' },
  { key: 'andheri_bkc', name: 'Mumbai (Andheri / BKC)' },
  { key: 'pune', name: 'Pune' },
  { key: 'nashik', name: 'Nashik' },
  { key: 'aurangabad', name: 'Aurangabad (Chh. Sambhajinagar)' },
  { key: 'nagpur', name: 'Nagpur' },
  { key: 'surat', name: 'Surat' }
];

const VERTICALS = [
  { key: 'corporate_it', name: 'Corporate & IT/ITES' },
  { key: 'architects_interior', name: 'Architects & Interior Designers' },
  { key: 'education_coaching', name: 'Education & Coaching Hubs' },
  { key: 'hospitality_coworking', name: 'Hospitality & Coworking' }
];

export default function GenerateLeadsModal({
  isOpen,
  onClose,
  initialMode = 'osm',
  onSuccess
}) {
  const [regionKey, setRegionKey] = useState('kalyan');
  const [verticalKey, setVerticalKey] = useState('corporate_it');
  const [mode, setMode] = useState(initialMode);
  const [count, setCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await generateLeads({
        regionKey,
        verticalKey,
        mode,
        count
      });
      setResult(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-100" />
            <div>
              <h2 className="text-base font-bold font-heading">
                {mode === 'osm' ? '⚡ Fetch Live OSM Leads' : '🤖 Generate Curated Leads'}
              </h2>
              <p className="text-xs text-sky-100">
                Section 1: Ingestion & Geo Enrichment Engine
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

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Mode Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Generation Source
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('osm')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'osm'
                    ? 'bg-sky-50 border-sky-400 text-sky-800 ring-2 ring-sky-500/20 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-4 h-4 text-sky-600 shrink-0" />
                <div className="text-left">
                  <div>Live OSM Overpass</div>
                  <div className="text-[10px] text-slate-400 font-normal">Real geospatial nodes</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('curated')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'curated'
                    ? 'bg-sky-50 border-sky-400 text-sky-800 ring-2 ring-sky-500/20 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                <div className="text-left">
                  <div>Curated Seed Ingestion</div>
                  <div className="text-[10px] text-slate-400 font-normal">Deterministic accounts</div>
                </div>
              </button>
            </div>
          </div>

          {/* Region Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              Target Commercial Hub
            </label>
            <select
              value={regionKey}
              onChange={(e) => setRegionKey(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-hidden"
            >
              {REGIONS.map(reg => (
                <option key={reg.key} value={reg.key}>{reg.name}</option>
              ))}
            </select>
          </div>

          {/* Vertical Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-sky-600" />
              Industry Vertical
            </label>
            <select
              value={verticalKey}
              onChange={(e) => setVerticalKey(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-hidden"
            >
              {VERTICALS.map(v => (
                <option key={v.key} value={v.key}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Count Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Batch Quantity
            </label>
            <div className="flex gap-2">
              {[5, 8, 12, 20].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    count === n
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {n} Leads
                </button>
              ))}
            </div>
          </div>

          {/* Result Alert */}
          {result && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">{result.message}</span>
                <span className="block text-[11px] text-emerald-700">
                  Added to SQLite database and loaded into your active view.
                </span>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {result ? 'Done' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 rounded-xl shadow-md shadow-sky-500/20 disabled:opacity-60 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Querying & Enriching...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Trigger Generation</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
