import React, { useState, useEffect, useCallback } from 'react';
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
  Sliders,
  Landmark,
  Layers,
  FileCheck,
  RefreshCw,
  ExternalLink,
  Filter
} from 'lucide-react';
import {
  generateLeads,
  createLead,
  importCsvLeads,
  fetchPlacesStatus,
  generateFromGooglePlaces,
  importMcaCsv,
  importMsmeCsv,
  previewDiscoveryCsv,
  fetchDiscoveryJobs,
  fetchDiscoveryStats
} from '../services/api';
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
  // 1. Generation Engine State (Curated / OSM / Places)
  const [engineMode, setEngineMode] = useState('curated'); // 'curated' | 'osm' | 'places'
  const [regionKey, setRegionKey] = useState('kalyan');
  const [customHub, setCustomHub] = useState('Kalyan-Dombivli');
  const [searchName, setSearchName] = useState('Kalyan Tech Hub - Corporate IT');
  const [verticalKey, setVerticalKey] = useState('corporate_it');
  const [count, setCount] = useState(8);
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState(null);
  const [genError, setGenError] = useState(null);
  const [placesStatus, setPlacesStatus] = useState(null);

  useEffect(() => {
    fetchPlacesStatus().then(setPlacesStatus).catch(() => setPlacesStatus({ configured: false }));
  }, []);

  // 4. Government Data Discovery State (MCA & Udyam MSME)
  const [govTab, setGovTab] = useState('mca'); // 'mca' | 'msme'
  const [govFile, setGovFile] = useState(null);
  const [govDragging, setGovDragging] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [govImporting, setGovImporting] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [govSuccessSummary, setGovSuccessSummary] = useState(null);
  const [govError, setGovError] = useState(null);
  const [discoveryStats, setDiscoveryStats] = useState(null);

  const loadDiscoveryStats = useCallback(async () => {
    try {
      const res = await fetchDiscoveryStats();
      if (res.success) setDiscoveryStats(res.stats);
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadDiscoveryStats();
  }, [loadDiscoveryStats]);

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
      let res;
      if (engineMode === 'places') {
        if (!placesStatus?.configured) {
          throw new Error('Google Places API key is not configured. Add GOOGLE_PLACES_API_KEY in server/.env file or use 1-click Enrich on individual leads.');
        }
        res = await generateFromGooglePlaces({
          query: finalHub,
          city: finalHub,
          vertical: verticalKey,
          count,
          searchName: finalSearch
        });
      } else {
        res = await generateLeads({
          regionKey,
          verticalKey,
          mode: engineMode,
          count,
          customHub: finalHub,
          searchName: finalSearch
        });
      }
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

  // Government File Drag & Drop / Selection
  const handleGovFileSelect = async (file) => {
    if (!file) return;
    setGovFile(file);
    setGovError(null);
    setGovSuccessSummary(null);
    setPreviewLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await previewDiscoveryCsv(formData, govTab);
      setPreviewData(res);
    } catch (err) {
      console.error('Preview error:', err);
      setGovError(err.message || 'Failed to preview CSV file');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    setGovTab(newTab);
    setGovFile(null);
    setPreviewData(null);
    setGovSuccessSummary(null);
    setGovError(null);
    setActiveJob(null);
  };

  // Trigger Government Data Stream & Poll Progress
  const handleTriggerGovImport = async () => {
    if (!govFile || govImporting) return;
    setGovImporting(true);
    setGovError(null);
    setGovSuccessSummary(null);

    const pollInterval = setInterval(async () => {
      try {
        const jobsRes = await fetchDiscoveryJobs();
        if (jobsRes.jobs && jobsRes.jobs.length > 0) {
          const latest = jobsRes.jobs[0];
          setActiveJob(latest);
          if (latest.status === 'completed' || latest.status === 'failed') {
            clearInterval(pollInterval);
          }
        }
      } catch (e) {}
    }, 2000);

    try {
      const formData = new FormData();
      formData.append('file', govFile);
      const result = govTab === 'mca'
        ? await importMcaCsv(formData)
        : await importMsmeCsv(formData);

      clearInterval(pollInterval);
      setGovSuccessSummary(`Inserted ${result.inserted} new leads | Skipped ${result.skipped} duplicates | Errors: ${result.errors}`);
      setActiveJob(null);
      loadDiscoveryStats();
      if (onSuccess) onSuccess();
    } catch (err) {
      clearInterval(pollInterval);
      console.error('Government import error:', err);
      setGovError(err.message || 'Government data import failed');
    } finally {
      setGovImporting(false);
    }
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
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold gap-1 flex-wrap">
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
              <button
                type="button"
                onClick={() => setEngineMode('places')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  engineMode === 'places'
                    ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📍 Google Places API</span>
                {placesStatus?.configured ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Google API Key Active"></span>
                ) : (
                  <span className="text-[9px] font-normal text-amber-700 bg-amber-100 px-1 rounded">Key Setup</span>
                )}
              </button>
            </div>
          </div>

          {/* Places API Status Notice */}
          {engineMode === 'places' && (
            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
              placesStatus?.configured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              {placesStatus?.configured ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Google Places API Active:</strong> Real-time verified official websites, direct phone numbers, and ratings will be extracted from Google Maps.</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Google Places API Setup Guide</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    To scrape live businesses via Google Places API: add your Google Cloud API key in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">server/.env</code> as <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">GOOGLE_PLACES_API_KEY=AIzaSy...</code>.
                  </p>
                  <p className="text-[11px] text-amber-700">
                    💡 <em>Tip: You can also use the 1-click ⚡ Enrich or LinkedIn/Maps verification buttons on any lead in the All Leads table without an API key!</em>
                  </p>
                </div>
              )}
            </div>
          )}

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

      {/* 4. GOVERNMENT DATA DISCOVERY ENGINE (MCA & UDYAM MSME) */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-sm p-6 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  🏛️ Government Data Discovery Engine
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Official Registries
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bulk ingest verified companies from MCA Company Master & Udyam MSME with automated NIC vertical classification and director mapping.
              </p>
            </div>
          </div>

          {/* Aggregated Discovery Stats */}
          {discoveryStats && (
            <div className="flex items-center gap-3 text-xs">
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-medium">MCA Imported: </span>
                <span className="font-bold text-slate-800">{discoveryStats.total_mca_imported}</span>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-medium">MSME Imported: </span>
                <span className="font-bold text-slate-800">{discoveryStats.total_msme_imported}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Selection: MCA Company Master vs Udyam MSME */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleTabChange('mca')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                govTab === 'mca'
                  ? 'bg-white text-sky-800 shadow-xs border border-sky-100 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Landmark className="w-4 h-4 text-sky-600" />
              <span>MCA Company Master (data.gov.in / mca.gov.in)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('msme')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                govTab === 'msme'
                  ? 'bg-white text-indigo-800 shadow-xs border border-indigo-100 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Udyam MSME Directory (udyamregistration.gov.in)</span>
            </button>
          </div>
        </div>

        {/* Download Guide & External Link Instructions */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold gap-2">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {govTab === 'mca'
                  ? 'How to obtain official MCA Company Master Data:'
                  : 'How to obtain official Udyam MSME Registration Data:'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {govTab === 'mca' ? (
                <>
                  <a
                    href="https://www.mca.gov.in/content/mca/global/en/data-and-reports/company-statistics/company-master-data.html"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-sky-700 hover:underline bg-white px-2.5 py-1 rounded-lg border border-sky-200"
                  >
                    <span>mca.gov.in</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://data.gov.in/resource/company-master-data"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-sky-700 hover:underline bg-white px-2.5 py-1 rounded-lg border border-sky-200"
                  >
                    <span>data.gov.in</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              ) : (
                <a
                  href="https://udyamregistration.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:underline bg-white px-2.5 py-1 rounded-lg border border-indigo-200"
                >
                  <span>udyamregistration.gov.in</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            {govTab === 'mca'
              ? 'Download the monthly Company Master ZIP/CSV for Maharashtra (RoC-Mumbai or RoC-Pune). Upload the unzipped CSV below. The engine will automatically filter for "Maharashtra" + "Active" status, classify NIC codes (6201, 7110, 8510, 5510, etc.) into CRM verticals, extract primary director names, estimate AV budget from Authorised Capital, and assign priority.'
              : 'Download the state-level Udyam Registration CSV for Maharashtra. Upload the CSV below. The engine filters for Maharashtra enterprises, auto-classifies service/industrial categories, extracts districts, and assigns priority based on commencement date.'}
          </p>
        </div>

        {/* Drag-and-Drop Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setGovDragging(true); }}
          onDragLeave={() => setGovDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setGovDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleGovFileSelect(file);
          }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            govDragging
              ? 'border-sky-500 bg-sky-50/80 scale-[1.01]'
              : govFile
              ? 'border-emerald-400 bg-emerald-50/30'
              : 'border-slate-300 hover:border-sky-400 bg-slate-50/50'
          }`}
        >
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto shadow-2xs">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                {govFile ? `Selected: ${govFile.name}` : `Drag & Drop ${govTab === 'mca' ? 'MCA Company Master' : 'Udyam MSME'} CSV`}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {govFile
                  ? `${(govFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for parsing & ingestion`
                  : 'Supports large files (streams in 500-row chunks with zero memory overflow)'}
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 cursor-pointer shadow-xs transition-all">
              <span>{govFile ? 'Choose Different File' : 'Browse Local CSV'}</span>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleGovFileSelect(file);
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Loading Preview Spinner */}
        {previewLoading && (
          <div className="p-6 text-center text-xs text-sky-600 font-semibold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Scanning first 500 rows and calculating Maharashtra + NIC vertical matches...</span>
          </div>
        )}

        {/* Preview Table & Filter Preview Statistics */}
        {previewData && !previewLoading && (
          <div className="space-y-4">
            
            {/* Filter Preview Banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Filter Preview:</strong> Sample scan matched <span className="font-extrabold text-indigo-700">{previewData.matchingCount}</span> verified Maharashtra active entities out of {previewData.sampleChecked} sampled records.
                </span>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0">
                NIC Auto-Classification Active
              </span>
            </div>

            {/* Preview Table (First 5 parsed rows) */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Company / Enterprise</th>
                    <th className="py-2.5 px-3">Identifier</th>
                    <th className="py-2.5 px-3">{govTab === 'mca' ? 'RoC / City' : 'District'}</th>
                    <th className="py-2.5 px-3">Mapped Vertical</th>
                    <th className="py-2.5 px-3">{govTab === 'mca' ? 'Key Director' : 'Type'}</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.previewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-[200px] truncate">
                        {row.company_name || row.enterprise_name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {row.cin || row.udyam_number || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3">
                        {row.roc_code || row.district || row.state}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.mapped_vertical === 'Unmapped'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          {row.mapped_vertical || row.major_activity || 'Corporate IT'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[150px]">
                        {row.directors || row.type || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {row.is_match ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                            Skip (Out of scope)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ingestion Trigger Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleTriggerGovImport}
                disabled={govImporting}
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-600 via-amber-500 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
              >
                {govImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Streaming & Ingesting Government Records...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Start Ingestion: Ingest Verified {govTab === 'mca' ? 'MCA Company' : 'MSME'} Leads</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* Live Progress Bar (During active streaming import) */}
        {govImporting && (
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-sky-900">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
                <span>Processing Stream: {activeJob ? `Job #${activeJob.id} - ${activeJob.total_rows} rows parsed` : 'Initializing stream...'}</span>
              </span>
              <span>{activeJob ? `${activeJob.leads_inserted} inserted` : 'Streaming...'}</span>
            </div>
            
            <div className="w-full bg-sky-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-indigo-600 h-2.5 rounded-full animate-pulse transition-all duration-300"
                style={{ width: activeJob && activeJob.total_rows > 0 ? `${Math.min(100, Math.round((activeJob.leads_inserted / Math.max(1, activeJob.total_rows)) * 100))}%` : '50%' }}
              ></div>
            </div>

            {activeJob && (
              <div className="flex items-center gap-4 text-[11px] text-sky-700 pt-1">
                <span>Total Streamed: <strong>{activeJob.total_rows}</strong></span>
                <span>•</span>
                <span className="text-emerald-700">Inserted: <strong>{activeJob.leads_inserted}</strong></span>
                <span>•</span>
                <span className="text-slate-500">Skipped (duplicates/non-matching): <strong>{activeJob.leads_skipped}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Success Summary Banner */}
        {govSuccessSummary && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span><strong>Ingestion Succeeded:</strong> {govSuccessSummary}</span>
            </div>
            {onNavigateToAllLeads && (
              <button
                type="button"
                onClick={onNavigateToAllLeads}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all cursor-pointer shrink-0"
              >
                View Leads in CRM
              </button>
            )}
          </div>
        )}

        {/* Error Banner */}
        {govError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{govError}</span>
          </div>
        )}

      </div>

    </div>
  );
}
