import React, { useState } from 'react';
import {
  Sparkles,
  Globe,
  PlusCircle,
  UploadCloud,
  MapPin,
  Briefcase,
  Tag,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Search,
  Building2,
  ArrowRight,
  Phone,
  User,
  Sliders
} from 'lucide-react';
import { generateLeads, createLead, importCsvLeads } from '../services/api';
import { VERTICAL_OPTIONS, CITY_OPTIONS } from '../utils/formatters';

const PRESET_REGIONS = [
  { key: 'kalyan', name: 'Kalyan-Dombivli', city: 'Kalyan' },
  { key: 'thane', name: 'Thane', city: 'Thane' },
  { key: 'navi_mumbai', name: 'Navi Mumbai', city: 'Navi Mumbai' },
  { key: 'andheri_bkc', name: 'Mumbai (Andheri / BKC)', city: 'Mumbai' },
  { key: 'pune', name: 'Pune (Hinjawadi / Baner)', city: 'Pune' },
  { key: 'bengaluru', name: 'Bengaluru (HSR / Koramangala / Whitefield)', city: 'Bengaluru' },
  { key: 'delhi_ncr', name: 'Delhi NCR (Gurugram / Noida / CP)', city: 'Delhi NCR' },
  { key: 'hyderabad', name: 'Hyderabad (HITEC City / Gachibowli)', city: 'Hyderabad' },
  { key: 'ahmedabad', name: 'Ahmedabad (SG Highway)', city: 'Ahmedabad' },
  { key: 'chennai', name: 'Chennai (OMR / Guindy)', city: 'Chennai' },
  { key: 'kolkata', name: 'Kolkata (Salt Lake / New Town)', city: 'Kolkata' },
  { key: 'nashik', name: 'Nashik', city: 'Nashik' },
  { key: 'surat', name: 'Surat', city: 'Surat' }
];

export default function GenerateLeadsView({
  onSuccess,
  onOpenAddModal,
  onOpenImportModal,
  onNavigateToAllLeads
}) {
  // 1. Generation Engine State (Curated / OSM)
  const [engineMode, setEngineMode] = useState('curated'); // 'curated' | 'osm'
  const [regionKey, setRegionKey] = useState('kalyan');
  const [customHub, setCustomHub] = useState('Kalyan-Dombivli');
  const [searchName, setSearchName] = useState('Kalyan Tech Hub - Corporate IT');
  const [verticalKey, setVerticalKey] = useState('corporate_it');
  const [count, setCount] = useState(8);
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState(null);
  const [genError, setGenError] = useState(null);

  // 2. Quick Add Single Lead State
  const [quickLead, setQuickLead] = useState({
    company_name: '',
    suggested_contact_name: '',
    phone: '',
    city: 'Kalyan',
    vertical: 'corporate_it',
    primary_av_need: 'Microsoft Teams Room & Wireless Screen Sharing',
    priority: 'Warm',
    deal_value: 3.5,
    search_name: 'Manual Direct Entry'
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addResult, setAddResult] = useState(null);

  // 3. Quick CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Handle Preset Select
  const handlePresetSelect = (reg) => {
    setRegionKey(reg.key);
    setCustomHub(reg.name);
    const vObj = VERTICAL_OPTIONS.find(v => v.value === verticalKey);
    setSearchName(`${reg.city} ${vObj?.label || 'Leads'}`);
  };

  // Trigger Generation
  const handleTriggerGeneration = async () => {
    setGenLoading(true);
    setGenError(null);
    setGenResult(null);

    const finalHub = customHub.trim() || 'Mumbai MMR';
    const finalSearch = searchName.trim() || `${finalHub} Batch`;

    try {
      const res = await generateLeads({
        regionKey,
        verticalKey,
        mode: engineMode,
        count,
        customHub: finalHub,
        searchName: finalSearch
      });
      setGenResult(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setGenError(err.message || 'Lead generation failed');
    } finally {
      setGenLoading(false);
    }
  };

  // Trigger Quick Add Lead
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickLead.company_name.trim()) return;

    setAddLoading(true);
    setAddResult(null);
    try {
      await createLead({
        ...quickLead,
        deal_value: Number(quickLead.deal_value) || 0,
        sub_region: quickLead.city
      });
      setAddResult(`Lead '${quickLead.company_name}' successfully added!`);
      setQuickLead({
        company_name: '',
        suggested_contact_name: '',
        phone: '',
        city: quickLead.city,
        vertical: quickLead.vertical,
        primary_av_need: 'Microsoft Teams Room & Wireless Screen Sharing',
        priority: 'Warm',
        deal_value: 3.5,
        search_name: 'Manual Direct Entry'
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setAddLoading(false);
    }
  };

  // Simple CSV Client Parse
  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length <= 1) return;

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const parsedLeads = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(r => r.trim().replace(/^"|"$/g, ''));
        if (row.length === 0 || !row[0]) continue;

        parsedLeads.push({
          company_name: row[0] || `Lead Company ${i}`,
          city: row[1] || 'Mumbai',
          vertical: row[2] || 'corporate_it',
          phone: row[3] || '',
          suggested_contact_name: row[4] || 'Decision Maker',
          primary_av_need: row[5] || 'Video Conferencing Hardware',
          deal_value: parseFloat(row[6]) || 3.0,
          search_name: 'CSV File Ingestion'
        });
      }

      setImportLoading(true);
      try {
        const res = await importCsvLeads(parsedLeads);
        setImportResult(`Successfully imported ${res.count || parsedLeads.length} leads from CSV!`);
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error(err);
      } finally {
        setImportLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 rounded-3xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-xs">
                Lead Ingestion Hub
              </span>
              <span className="text-xs text-sky-100">• 3 Dedicated Ingestion Methods</span>
            </div>
            <h2 className="text-2xl font-bold font-heading">
              ⚡ Lead Generation & Ingestion Center
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl mt-1">
              Choose your ingestion method: Curated Seed generation, Live OpenStreetMap geospatial extraction, Single Manual Lead entry, or Bulk CSV Import.
            </p>
          </div>

          {onNavigateToAllLeads && (
            <button
              onClick={onNavigateToAllLeads}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs shadow-md transition-all cursor-pointer self-start md:self-auto"
            >
              <span>View All Leads</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3 DISTINCT INGESTION SECTIONS AS REQUESTED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* METHOD 1: Curated Seed Leads & Live OSM Engine (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-sky-100 shadow-sm p-6 space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
                <Zap className="w-5 h-5 fill-sky-500 text-sky-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  1. 🤖 Curated Seed Leads & ⚡ Live OSM Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Geospatial Pan India Overpass & Deterministic Accounts
                </p>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setEngineMode('curated')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  engineMode === 'curated'
                    ? 'bg-white text-sky-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🤖 Curated
              </button>
              <button
                type="button"
                onClick={() => setEngineMode('osm')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  engineMode === 'osm'
                    ? 'bg-white text-sky-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Live OSM
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            
            {/* Target Commercial Hub (Pan India Search) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  Target Commercial Hub (Pan India)
                </span>
                <span className="text-[10px] text-sky-600 font-normal">custom editable search</span>
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  value={customHub}
                  onChange={(e) => setCustomHub(e.target.value)}
                  placeholder="Type ANY Indian hub (e.g. Connaught Place Delhi, HSR Layout Bengaluru)..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 font-semibold text-slate-900 rounded-xl border border-slate-300 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Presets */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PRESET_REGIONS.slice(0, 8).map(reg => (
                  <button
                    key={reg.key}
                    type="button"
                    onClick={() => handlePresetSelect(reg)}
                    className={`px-2 py-0.5 text-[11px] rounded-lg border transition-all cursor-pointer ${
                      customHub === reg.name
                        ? 'bg-sky-100 text-sky-800 border-sky-300 font-bold'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {reg.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Search Set Label */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-600" />
                Search Set Label (Batch Name)
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g. Indiranagar Cafes March, BKC Architects Q1..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-300 text-slate-800 focus:bg-white focus:border-sky-500 outline-hidden"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This label will be assigned to all generated leads and displayed in the <strong>Search Name</strong> column.
              </p>
            </div>

            {/* Vertical & Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-sky-600" />
                  Industry Vertical
                </label>
                <select
                  value={verticalKey}
                  onChange={(e) => {
                    setVerticalKey(e.target.value);
                    const vObj = VERTICAL_OPTIONS.find(v => v.value === e.target.value);
                    setSearchName(`${customHub} - ${vObj?.label || 'Leads'}`);
                  }}
                  className="w-full p-2.5 text-xs bg-slate-50 font-medium text-slate-800 rounded-xl border border-slate-300 focus:border-sky-500 outline-hidden cursor-pointer"
                >
                  <option value="corporate_it">Corporate & IT/ITES</option>
                  <option value="architects_interior">Architects & Interior Designers</option>
                  <option value="education_coaching">Education & Coaching Hubs</option>
                  <option value="hospitality_coworking">Hospitality & Coworking</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Batch Quantity
                </label>
                <div className="flex gap-2">
                  {[5, 8, 12, 20].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        count === n
                          ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Feedback */}
            {genResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold">{genResult.message}</span>
                  <span className="block text-[11px] text-emerald-700">
                    Tagged as: <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">{genResult.searchName}</code>
                  </span>
                </div>
              </div>
            )}

            {genError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{genError}</span>
              </div>
            )}

            {/* Ingestion Submit Button */}
            <button
              type="button"
              onClick={handleTriggerGeneration}
              disabled={genLoading}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 transition-all cursor-pointer shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {genLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enriching & Saving Leads...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>
                    Generate {count} Leads via {engineMode === 'osm' ? 'Live OSM Overpass' : 'Curated Engine'}
                  </span>
                </>
              )}
            </button>

          </div>

        </div>

        {/* RIGHT COLUMN: 2. Add Single Lead & 3. Import CSV Records (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* METHOD 2: ➕ Add Single Lead */}
          <div className="bg-white rounded-3xl border border-sky-100 shadow-sm p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
                  <PlusCircle className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    2. ➕ Add Single Lead
                  </h3>
                  <p className="text-[11px] text-slate-400">Direct manual account entry</p>
                </div>
              </div>

              {onOpenAddModal && (
                <button
                  type="button"
                  onClick={onOpenAddModal}
                  className="text-xs text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  open full modal
                </button>
              )}
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={quickLead.company_name}
                  onChange={(e) => setQuickLead(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="e.g. Apex Architect Studio"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={quickLead.city}
                    onChange={(e) => setQuickLead(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={quickLead.phone}
                    onChange={(e) => setQuickLead(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98XXXXXXXX"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vertical</label>
                  <select
                    value={quickLead.vertical}
                    onChange={(e) => setQuickLead(prev => ({ ...prev, vertical: e.target.value }))}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 outline-hidden cursor-pointer"
                  >
                    <option value="corporate_it">Corporate IT</option>
                    <option value="architects_interior">Architects</option>
                    <option value="education_coaching">Education</option>
                    <option value="hospitality_coworking">Hospitality</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Est. Deal Value (₹L)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={quickLead.deal_value}
                    onChange={(e) => setQuickLead(prev => ({ ...prev, deal_value: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 outline-hidden"
                  />
                </div>
              </div>

              {addResult && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{addResult}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={addLoading}
                className="w-full py-2 px-3 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-60"
              >
                {addLoading ? 'Saving...' : 'Add Single Lead to Database'}
              </button>
            </form>

          </div>

          {/* METHOD 3: 📥 Import CSV Records */}
          <div className="bg-white rounded-3xl border border-sky-100 shadow-sm p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
                  <UploadCloud className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    3. 📥 Import CSV Records
                  </h3>
                  <p className="text-[11px] text-slate-400">Bulk upload existing spreadsheets</p>
                </div>
              </div>

              {onOpenImportModal && (
                <button
                  type="button"
                  onClick={onOpenImportModal}
                  className="text-xs text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  open full wizard
                </button>
              )}
            </div>

            <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-5 text-center transition-all bg-slate-50/50">
              <UploadCloud className="w-8 h-8 text-sky-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Choose CSV File to Import</p>
              <p className="text-[10px] text-slate-400 mt-0.5 mb-3">
                Columns: Company, City, Vertical, Phone, Contact, Requirement, DealValue
              </p>
              
              <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-sky-700 bg-sky-100/80 hover:bg-sky-200 rounded-xl cursor-pointer transition-all">
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importLoading && (
              <div className="text-xs text-sky-600 font-semibold flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Parsing & Importing CSV records...</span>
              </div>
            )}

            {importResult && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{importResult}</span>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
