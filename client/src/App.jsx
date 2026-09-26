import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ActionToolbar from './components/ActionToolbar';
import FilterBar from './components/FilterBar';
import TableView from './components/TableView';
import KanbanView from './components/KanbanView';
import AnalyticsView from './components/AnalyticsView';
import BatchActionBar from './components/BatchActionBar';

import GenerateLeadsModal from './components/modals/GenerateLeadsModal';
import PitchOutreachModal from './components/modals/PitchOutreachModal';
import AddLeadModal from './components/modals/AddLeadModal';
import ActivityLogModal from './components/modals/ActivityLogModal';
import ImportCsvModal from './components/modals/ImportCsvModal';

import {
  fetchLeads,
  fetchStats,
  updateLead,
  deleteLead,
  batchDeleteLeads,
  batchUpdateStatus
} from './services/api';

export default function App() {
  // Navigation & View Mode
  const [activeView, setActiveView] = useState('table'); // 'table' | 'kanban' | 'analytics'

  // Leads & Pipeline Data
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // Sorting & Filtering State
  const [filters, setFilters] = useState({
    search: '',
    vertical: 'all',
    city: 'all',
    priority: 'all',
    status: 'all',
    page: 1,
    limit: 100
  });

  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 100,
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
      const [leadsRes, statsRes] = await Promise.all([
        fetchLeads({
          ...filters,
          sortBy,
          sortOrder
        }),
        fetchStats()
      ]);

      setLeads(leadsRes.leads || []);
      setPagination({
        total: leadsRes.total,
        page: leadsRes.page,
        limit: leadsRes.limit,
        totalPages: leadsRes.totalPages
      });
      setStats(statsRes);
    } catch (err) {
      console.error('Error loading CRM data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Stage change handler (instant update with optimistic update)
  const handleStageChange = async (id, newStatus) => {
    try {
      setLeads(prev =>
        prev.map(l => (l.id === id ? { ...l, status: newStatus } : l))
      );
      await updateLead(id, { status: newStatus });
      // Refresh stats in background
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

    const headers = ["ID", "Company Name", "Vertical", "City", "Sub-region", "Phone", "Target Role", "Contact Person", "Primary AV Need", "Priority", "Stage", "Deal Value"];
    const rows = selectedLeads.map(l => [
      `"${l.id}"`,
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

  // Pitch modal opener
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
      page: 1,
      limit: 100
    });
  };

  // Page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Sort change
  const handleSortChange = (col, order) => {
    setSortBy(col);
    setSortOrder(order);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <Header
        stats={stats}
        onRefresh={loadData}
        loading={loading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* SECTION 1 & 2: Action Toolbar */}
        <ActionToolbar
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenGenerateModal={handleOpenGenerateModal}
          onOpenAddModal={handleOpenAddModal}
          onOpenImportModal={() => setImportModalOpen(true)}
          totalResults={pagination.total}
        />

        {/* SECTION 3: Smart Filter Presets (Only in Table or Kanban views) */}
        {activeView !== 'analytics' && (
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            onResetFilters={handleResetFilters}
          />
        )}

        {/* View Switching */}
        {activeView === 'table' && (
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
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        )}

        {activeView === 'kanban' && (
          <KanbanView
            leads={leads}
            onStageChange={handleStageChange}
            onOpenPitchModal={handleOpenPitchModal}
            onOpenActivityModal={handleOpenActivityModal}
            onOpenEditModal={handleOpenEditModal}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsView
            stats={stats}
            onOpenPitchModal={handleOpenPitchModal}
          />
        )}

      </main>

      {/* SECTION 4: Floating Batch Action Bar */}
      <BatchActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBatchUpdateStatus={handleBatchUpdateStatus}
        onBatchDelete={handleBatchDelete}
        onExportSelected={handleExportSelected}
      />

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

      {/* Footer Note */}
      <footer className="py-6 border-t border-slate-200/60 bg-white/40 text-center text-xs text-slate-400">
        <p>
          Collabsight Technologies Pvt Ltd • Audio-Visual System Integration CRM • Kalyan & Thane, MMR
        </p>
      </footer>
    </div>
  );
}
