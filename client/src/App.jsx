import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FilterBar from './components/FilterBar';
import TableView from './components/TableView';
import KanbanView from './components/KanbanView';
import AnalyticsView from './components/AnalyticsView';
import PitchGeneratorView from './components/PitchGeneratorView';
import LeadsBySearchSetView from './components/LeadsBySearchSetView';
import GenerateLeadsView from './components/GenerateLeadsView';
import BatchActionBar from './components/BatchActionBar';

import GenerateLeadsModal from './components/modals/GenerateLeadsModal';
import PitchOutreachModal from './components/modals/PitchOutreachModal';
import AddLeadModal from './components/modals/AddLeadModal';
import ActivityLogModal from './components/modals/ActivityLogModal';
import ImportCsvModal from './components/modals/ImportCsvModal';

import { Table, Columns3 } from 'lucide-react';

import {
  fetchLeads,
  fetchStats,
  fetchSearchSetsMeta,
  updateLead,
  deleteLead,
  batchDeleteLeads,
  batchUpdateStatus,
  enrichLeadWithPlaces
} from './services/api';

export default function App() {
  // Navigation: 'generate' | 'all_leads' | 'pitch' | 'search_sets' | 'analytics'
  const [activeView, setActiveView] = useState('all_leads');
  const [allLeadsDisplayMode, setAllLeadsDisplayMode] = useState('table'); // 'table' | 'kanban'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Leads & Pipeline Data
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchSetsMeta, setSearchSetsMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // Sorting & Filtering State
  const [filters, setFilters] = useState({
    search: '',
    vertical: 'all',
    city: 'all',
    priority: 'all',
    status: 'all',
    search_name: 'all',
    page: 1,
    limit: 20
  });

  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });

  // Modal Visibility States
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateMode, setGenerateMode] = useState('osm');

  const [pitchModalOpen, setPitchModalOpen] = useState(false);
  const [selectedLeadForPitch, setSelectedLeadForPitch] = useState(null);
  const [pitchInitialTab, setPitchInitialTab] = useState('email');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);

  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedLeadForActivity, setSelectedLeadForActivity] = useState(null);

  const [importModalOpen, setImportModalOpen] = useState(false);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, statsRes, metaRes] = await Promise.all([
        fetchLeads({
          ...filters,
          sortBy,
          sortOrder
        }),
        fetchStats(),
        fetchSearchSetsMeta().catch(() => null)
      ]);

      setLeads(leadsRes.leads || []);
      setPagination({
        total: leadsRes.total,
        page: leadsRes.page,
        limit: leadsRes.limit,
        totalPages: leadsRes.totalPages
      });
      setStats(statsRes);
      if (metaRes) setSearchSetsMeta(metaRes);
    } catch (err) {
      console.error('Error loading CRM data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Stage change handler (optimistic update)
  const handleStageChange = async (id, newStatus) => {
    try {
      setLeads(prev =>
        prev.map(l => (l.id === id ? { ...l, status: newStatus } : l))
      );
      await updateLead(id, { status: newStatus });
      const newStats = await fetchStats();
      setStats(newStats);
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  // Delete lead handler
  const handleDeleteLead = async (id) => {
    try {
      await deleteLead(id);
      setSelectedIds(prev => prev.filter(item => item !== id));
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Google Places on-demand enrichment handler
  const handleEnrichLead = async (leadId) => {
    try {
      const res = await enrichLeadWithPlaces(leadId);
      if (res.success && res.lead) {
        setLeads(prev => prev.map(l => (l.id === leadId ? res.lead : l)));
        const newStats = await fetchStats();
        setStats(newStats);
        return res;
      }
    } catch (err) {
      console.error('Error enriching lead:', err);
      throw err;
    }
  };

  // Batch stage change
  const handleBatchUpdateStatus = async (status) => {
    if (selectedIds.length === 0) return;
    try {
      await batchUpdateStatus(selectedIds, status);
      setSelectedIds([]);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Batch delete
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await batchDeleteLeads(selectedIds);
      setSelectedIds([]);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Export Selected as CSV
  const handleExportSelected = () => {
    const selectedLeads = leads.filter(l => selectedIds.includes(l.id));
    if (selectedLeads.length === 0) return;

    const headers = [
      "ID", "Search Name", "Timestamp", "Company Name", "Vertical", "City",
      "Sub-region", "Phone", "Target Role", "Contact Person",
      "Primary AV Need", "Priority", "Stage", "Deal Value"
    ];
    const rows = selectedLeads.map(l => [
      `"${l.id}"`,
      `"${l.search_name || ''}"`,
      `"${l.created_at || ''}"`,
      `"${l.company_name}"`,
      `"${l.vertical}"`,
      `"${l.city}"`,
      `"${l.sub_region || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.target_role || ''}"`,
      `"${l.suggested_contact_name || ''}"`,
      `"${(l.primary_av_need || '').replace(/"/g, '""')}"`,
      `"${l.priority}"`,
      `"${l.status}"`,
      `"${l.deal_value}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Collabsight_Selected_${selectedIds.length}_Leads.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pitch modal opener (keeps row-level pitch modal working!)
  const handleOpenPitchModal = (lead, tab = 'email') => {
    setSelectedLeadForPitch(lead);
    setPitchInitialTab(tab);
    setPitchModalOpen(true);
  };

  // Edit lead modal opener
  const handleOpenEditModal = (lead) => {
    setLeadToEdit(lead);
    setAddModalOpen(true);
  };

  // Add lead modal opener
  const handleOpenAddModal = () => {
    setLeadToEdit(null);
    setAddModalOpen(true);
  };

  // Activity modal opener
  const handleOpenActivityModal = (lead) => {
    setSelectedLeadForActivity(lead);
    setActivityModalOpen(true);
  };

  // Generate modal opener
  const handleOpenGenerateModal = (mode = 'osm') => {
    setGenerateMode(mode);
    setGenerateModalOpen(true);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      vertical: 'all',
      city: 'all',
      priority: 'all',
      status: 'all',
      search_name: 'all',
      page: 1,
      limit: filters.limit || 20
    });
  };

  // Page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Limit change (20, 50, 100, 200)
  const handleLimitChange = (newLimit) => {
    setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Sort change
  const handleSortChange = (col, order) => {
    setSortBy(col);
    setSortOrder(order);
  };

  // Quick filter by Search Name
  const handleFilterBySearchName = (name) => {
    setActiveView('all_leads');
    setAllLeadsDisplayMode('table');
    setFilters(prev => ({ ...prev, search_name: name, page: 1 }));
  };

  const isAllLeadsActive = activeView === 'all_leads' || activeView === 'table' || activeView === 'kanban';

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      
      {/* 5-Item Navigation Menu Bar (Sidebar) */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        totalResults={pagination.total}
        stats={stats}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Layout with padding-left for Sidebar */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Top Header */}
        <Header
          stats={stats}
          onRefresh={loadData}
          loading={loading}
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* 1. GENERATE LEADS VIEW (Contains the 3 requested methods) */}
          {activeView === 'generate' && (
            <GenerateLeadsView
              onSuccess={loadData}
              onOpenAddModal={handleOpenAddModal}
              onOpenImportModal={() => setImportModalOpen(true)}
              onNavigateToAllLeads={() => setActiveView('all_leads')}
            />
          )}

          {/* 2. ALL LEADS VIEW (Table & Kanban Views with Filters & Pagination) */}
          {isAllLeadsActive && (
            <div className="space-y-4">
              
              {/* Header for All Leads with Table/Kanban Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-md rounded-2xl border border-sky-100 p-3.5 shadow-2xs">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                    <span>2. All Leads</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">
                      {pagination.total} Total
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Comprehensive lead pipeline with Search Set tags and live timestamps
                  </p>
                </div>

                {/* Table vs Kanban Toggle */}
                <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200 shadow-inner self-start sm:self-auto">
                  <button
                    onClick={() => setAllLeadsDisplayMode('table')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      allLeadsDisplayMode === 'table'
                        ? 'bg-white text-sky-700 shadow-xs border border-sky-100'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Table View</span>
                  </button>

                  <button
                    onClick={() => setAllLeadsDisplayMode('kanban')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      allLeadsDisplayMode === 'kanban'
                        ? 'bg-white text-sky-700 shadow-xs border border-sky-100'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Columns3 className="w-3.5 h-3.5" />
                    <span>Kanban View</span>
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <FilterBar
                filters={filters}
                setFilters={setFilters}
                onResetFilters={handleResetFilters}
                searchSets={searchSetsMeta?.searchSets || []}
              />

              {/* Table Mode */}
              {allLeadsDisplayMode === 'table' && (
                <TableView
                  leads={leads}
                  loading={loading}
                  selectedIds={selectedIds}
                  setSelectedIds={setSelectedIds}
                  onStageChange={handleStageChange}
                  onOpenPitchModal={handleOpenPitchModal}
                  onOpenActivityModal={handleOpenActivityModal}
                  onOpenEditModal={handleOpenEditModal}
                  onDeleteLead={handleDeleteLead}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  onFilterBySearchName={handleFilterBySearchName}
                  onEnrichLead={handleEnrichLead}
                />
              )}

              {/* Kanban Mode */}
              {allLeadsDisplayMode === 'kanban' && (
                <KanbanView
                  leads={leads}
                  onStageChange={handleStageChange}
                  onOpenPitchModal={handleOpenPitchModal}
                  onOpenActivityModal={handleOpenActivityModal}
                  onOpenEditModal={handleOpenEditModal}
                  onEnrichLead={handleEnrichLead}
                />
              )}

            </div>
          )}

          {/* 3. PITCH GENERATOR VIEW */}
          {activeView === 'pitch' && (
            <PitchGeneratorView
              leads={leads}
              onLeadActivityLogged={loadData}
            />
          )}

          {/* 4. LEADS BY SEARCH SET VIEW */}
          {activeView === 'search_sets' && (
            <LeadsBySearchSetView
              onOpenPitchModal={handleOpenPitchModal}
              onOpenActivityModal={handleOpenActivityModal}
              onOpenEditModal={handleOpenEditModal}
              onStageChange={handleStageChange}
            />
          )}

          {/* 5. ANALYTICS & INSIGHTS VIEW */}
          {activeView === 'analytics' && (
            <AnalyticsView
              stats={stats}
              onOpenPitchModal={handleOpenPitchModal}
            />
          )}

        </main>

        {/* Floating Batch Action Bar */}
        <BatchActionBar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          onBatchUpdateStatus={handleBatchUpdateStatus}
          onBatchDelete={handleBatchDelete}
          onExportSelected={handleExportSelected}
        />

        {/* Footer */}
        <footer className="py-5 border-t border-slate-200/60 bg-white/40 text-center text-xs text-slate-400">
          <p>
            Collabsight Technologies Pvt Ltd • Audio-Visual System Integration CRM • Kalyan & Thane, MMR
          </p>
        </footer>

      </div>

      {/* Modals */}
      <GenerateLeadsModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        initialMode={generateMode}
        onSuccess={loadData}
      />

      <PitchOutreachModal
        isOpen={pitchModalOpen}
        onClose={() => setPitchModalOpen(false)}
        lead={selectedLeadForPitch}
        initialTab={pitchInitialTab}
      />

      <AddLeadModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        leadToEdit={leadToEdit}
        onSuccess={loadData}
      />

      <ActivityLogModal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        lead={selectedLeadForActivity}
        onUpdated={loadData}
      />

      <ImportCsvModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={loadData}
      />

    </div>
  );
}
