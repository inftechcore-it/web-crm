import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  PhoneCall,
  ExternalLink,
  Flame,
  CheckCircle2,
  Building2,
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
  PIPELINE_STAGES
} from '../utils/formatters';

const STAGE_THEMES = {
  'New': {
    border: 'border-sky-200',
    headerBg: 'bg-sky-50',
    headerText: 'text-sky-800',
    badge: 'bg-sky-100 text-sky-800'
  },
  'Contacted': {
    border: 'border-blue-200',
    headerBg: 'bg-blue-50',
    headerText: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800'
  },
  'Meeting Fixed': {
    border: 'border-amber-200',
    headerBg: 'bg-amber-50',
    headerText: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-800'
  },
  'Proposal Sent': {
    border: 'border-purple-200',
    headerBg: 'bg-purple-50',
    headerText: 'text-purple-800',
    badge: 'bg-purple-100 text-purple-800'
  },
  'Won': {
    border: 'border-emerald-200',
    headerBg: 'bg-emerald-50',
    headerText: 'text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  'Lost': {
    border: 'border-slate-200',
    headerBg: 'bg-slate-100',
    headerText: 'text-slate-700',
    badge: 'bg-slate-200 text-slate-700'
  }
};

export default function KanbanView({
  leads = [],
  onStageChange,
  onOpenPitchModal,
  onOpenActivityModal,
  onOpenEditModal,
  onEnrichLead
}) {
  const [enrichingId, React_setEnrichingId] = React.useState(null);
  const [enrichSuccessId, React_setEnrichSuccessId] = React.useState(null);

  const handleEnrich = async (lead) => {
    if (!onEnrichLead || enrichingId) return;
    React_setEnrichingId(lead.id);
    try {
      await onEnrichLead(lead.id);
      React_setEnrichSuccessId(lead.id);
      setTimeout(() => React_setEnrichSuccessId(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      React_setEnrichingId(null);
    }
  };
  const getPrevStage = (current) => {
    const idx = PIPELINE_STAGES.indexOf(current);
    return idx > 0 ? PIPELINE_STAGES[idx - 1] : null;
  };

  const getNextStage = (current) => {
    const idx = PIPELINE_STAGES.indexOf(current);
    return idx < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[idx + 1] : null;
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[1280px]">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter(l => l.status === stage);
          const stageValue = stageLeads.reduce((acc, l) => acc + (Number(l.deal_value) || 0), 0);
          const theme = STAGE_THEMES[stage] || STAGE_THEMES['New'];

          return (
            <div
              key={stage}
              className={`flex-1 min-w-[280px] max-w-[340px] bg-slate-100/60 rounded-2xl border ${theme.border} p-3 flex flex-col shadow-2xs`}
            >
              {/* Column Header */}
              <div className={`p-2.5 rounded-xl ${theme.headerBg} border border-white/60 mb-3 flex items-center justify-between`}>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold text-xs ${theme.headerText}`}>
                      {stage}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${theme.badge}`}>
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    {formatCurrencyLakhs(stageValue)}
                  </div>
                </div>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                {stageLeads.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const prev = getPrevStage(lead.status);
                    const next = getNextStage(lead.status);

                    return (
                      <div
                        key={lead.id}
                        className="glass-card rounded-xl p-3.5 bg-white border border-sky-100 shadow-2xs hover:shadow-md transition-all group"
                      >
                        {/* Top Card Info: Priority & Vertical */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(lead.priority)}`}>
                            {lead.priority}
                          </span>
                          <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md font-medium truncate max-w-[120px]">
                            {formatVerticalName(lead.vertical)}
                          </span>
                        </div>

                        {/* Company Name */}
                        <button
                          onClick={() => onOpenPitchModal(lead, 'email')}
                          className="font-bold text-slate-900 text-xs hover:text-sky-600 text-left block transition-colors leading-snug cursor-pointer"
                        >
                          {lead.company_name}
                        </button>

                        {/* City & Sub-region */}
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1 flex-wrap">
                          <span className="font-semibold text-sky-800">{lead.city}</span>
                          {lead.sub_region && lead.sub_region !== lead.city && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[130px]">{lead.sub_region}</span>
                            </>
                          )}
                          {lead.rating && (
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              ⭐ {lead.rating}
                            </span>
                          )}
                        </div>

                        {/* Verified Search & Profile Shortcuts */}
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          <a
                            href={lead.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.company_name + ' ' + (lead.city || ''))}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Verify on Google Maps"
                            className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200"
                          >
                            <MapPin className="w-2.5 h-2.5" />
                            <span>Maps</span>
                          </a>

                          <a
                            href={lead.linkedin_url || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(lead.company_name + ' ' + (lead.target_role || 'Decision Maker') + ' ' + (lead.city || ''))}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Find on LinkedIn"
                            className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200"
                          >
                            <LinkedInIcon className="w-2.5 h-2.5" />
                            <span>LinkedIn</span>
                          </a>

                          {lead.website ? (
                            <a
                              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Visit Website"
                              className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-1.5 py-0.5 rounded border border-sky-200"
                            >
                              <Globe className="w-2.5 h-2.5" />
                              <span>Site</span>
                            </a>
                          ) : (
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(lead.company_name + ' ' + (lead.city || '') + ' official website')}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Search Site"
                              className="inline-flex items-center gap-0.5 text-[9px] font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded"
                            >
                              <Search className="w-2.5 h-2.5" />
                              <span>Search</span>
                            </a>
                          )}
                        </div>

                        {/* Contact Person */}
                        <div className="text-[11px] text-slate-700 mt-2 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                          <div className="font-semibold">{lead.suggested_contact_name || 'Decision Maker'}</div>
                          <div className="text-[10px] text-slate-400 truncate">{lead.target_role}</div>
                        </div>

                        {/* AV Need Snippet */}
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-2 leading-relaxed" title={lead.primary_av_need}>
                          {lead.primary_av_need}
                        </p>

                        {/* Deal Value */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-medium">Deal Est: </span>
                            <span className="text-xs font-bold text-sky-700">
                              {formatCurrencyLakhs(lead.deal_value)}
                            </span>
                          </div>

                          {/* Quick Outreach Icons */}
                          <div className="flex items-center gap-1">
                            {/* Enrich button */}
                            <button
                              onClick={() => handleEnrich(lead)}
                              disabled={enrichingId === lead.id}
                              title="Enrich with Google Places"
                              className={`p-1 rounded-md border transition-colors ${
                                enrichSuccessId === lead.id
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                                  : enrichingId === lead.id
                                  ? 'text-amber-600 bg-amber-50 border-amber-200 animate-pulse'
                                  : 'text-amber-500 hover:text-amber-700 hover:bg-amber-50 border-transparent hover:border-amber-200'
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

                            <button
                              onClick={() => onOpenPitchModal(lead, 'email')}
                              title="Cold Email"
                              className="p-1 text-slate-400 hover:text-sky-600 rounded-md hover:bg-sky-50 transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenPitchModal(lead, 'whatsapp')}
                              title="WhatsApp"
                              className="p-1 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenPitchModal(lead, 'call')}
                              title="Call Script"
                              className="p-1 text-slate-400 hover:text-amber-600 rounded-md hover:bg-amber-50 transition-colors"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Move Stage Ribbon */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          {prev ? (
                            <button
                              onClick={() => onStageChange(lead.id, prev)}
                              className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 px-2 py-0.5 rounded-md border border-slate-200 transition-colors cursor-pointer"
                              title={`Move back to ${prev}`}
                            >
                              <ChevronLeft className="w-3 h-3" />
                              <span>{prev}</span>
                            </button>
                          ) : <div />}

                          {next ? (
                            <button
                              onClick={() => onStageChange(lead.id, next)}
                              className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-sky-700 hover:text-white bg-sky-50 hover:bg-sky-600 px-2 py-0.5 rounded-md border border-sky-200 hover:border-sky-600 transition-all cursor-pointer shadow-2xs"
                              title={`Advance to ${next}`}
                            >
                              <span>{next}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Won
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
