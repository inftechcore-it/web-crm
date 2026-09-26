import React from 'react';
import {
  TrendingUp,
  Flame,
  Award,
  Users,
  Target,
  BarChart,
  PieChart,
  MapPin,
  Clock,
  Briefcase
} from 'lucide-react';
import { formatCurrencyLakhs, formatVerticalName } from '../utils/formatters';

export default function AnalyticsView({ stats = {}, onOpenPitchModal }) {
  const overview = stats.overview || {};
  const byVertical = stats.byVertical || [];
  const byStatus = stats.byStatus || [];
  const byCity = stats.byCity || [];
  const recentActivities = stats.recentActivities || [];

  const maxVerticalCount = Math.max(...byVertical.map(v => v.count), 1);
  const maxCityCount = Math.max(...byCity.map(c => c.count), 1);

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Accounts */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-sky-100 p-4 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Accounts</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-heading">
            {overview.totalLeads ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Active in CRM Database
          </p>
        </div>

        {/* Card 2: Pipeline Value */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-sky-100 p-4 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline Value</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-700 mt-2 font-heading">
            {formatCurrencyLakhs(overview.totalPipelineValue)}
          </div>
          <p className="text-[11px] text-sky-600 font-medium mt-1">
            Estimated AV Deal Size
          </p>
        </div>

        {/* Card 3: Hot Priority Deals */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-red-100 p-4 shadow-2xs hover:shadow-xs transition-all bg-gradient-to-br from-white to-red-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Hot Priority</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <Flame className="w-4 h-4 fill-red-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 mt-2 font-heading">
            {overview.hotLeadsCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Urgent AV Retrofit Needs
          </p>
        </div>

        {/* Card 4: Won Value */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100 p-4 shadow-2xs hover:shadow-xs transition-all bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Deals Won</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-heading">
            {formatCurrencyLakhs(overview.wonDealValue)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {overview.wonLeadsCount ?? 0} Closed Contracts
          </p>
        </div>

        {/* Card 5: Win Conversion Rate */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-purple-100 p-4 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Win Rate</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2 font-heading">
            {overview.conversionRate ?? 0}%
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            {overview.meetingsFixedCount ?? 0} Meetings • {overview.proposalsSentCount ?? 0} Proposals
          </p>
        </div>

      </div>

      {/* Row 2: Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vertical Distribution */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-sky-100 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                Pipeline by Industry Vertical
              </h2>
              <p className="text-xs text-slate-400">SMB breakdown by commercial segment</p>
            </div>
            <Briefcase className="w-4 h-4 text-sky-600" />
          </div>

          <div className="mt-4 space-y-3.5">
            {byVertical.map(item => {
              const pct = Math.round((item.count / maxVerticalCount) * 100);
              return (
                <div key={item.vertical} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {formatVerticalName(item.vertical)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">{item.count} leads</span>
                      <span className="font-bold text-sky-700">{formatCurrencyLakhs(item.total_value)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional / City Distribution */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-sky-100 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                Regional Hub Distribution
              </h2>
              <p className="text-xs text-slate-400">MMR & Tier-2/3 Commercial Corridor</p>
            </div>
            <MapPin className="w-4 h-4 text-sky-600" />
          </div>

          <div className="mt-4 space-y-3.5">
            {byCity.map(item => {
              const pct = Math.round((item.count / maxCityCount) * 100);
              return (
                <div key={item.city} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {item.city}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">{item.count} accounts</span>
                      <span className="font-bold text-sky-700">{formatCurrencyLakhs(item.total_value)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-600 to-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Row 3: Pipeline Stages & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline Funnel */}
        <div className="lg:col-span-1 bg-white/90 backdrop-blur-md rounded-2xl border border-sky-100 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                Pipeline Funnel
              </h2>
              <p className="text-xs text-slate-400">Conversion across stages</p>
            </div>
            <BarChart className="w-4 h-4 text-sky-600" />
          </div>

          <div className="mt-4 space-y-2.5">
            {byStatus.map(stage => (
              <div key={stage.status} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">{stage.status}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    {stage.count}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {formatCurrencyLakhs(stage.total_value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-2xl border border-sky-100 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-heading">
                Recent Interaction Log
              </h2>
              <p className="text-xs text-slate-400">Audits, emails, calls & status updates</p>
            </div>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>

          <div className="mt-4 divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent activity logged yet.
              </div>
            ) : (
              recentActivities.map(act => (
                <div key={act.id} className="py-2.5 flex items-start gap-3">
                  <div className="mt-0.5 h-6 w-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {act.action_type.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {act.company_name || 'Prospect'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {act.created_at ? new Date(act.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                      {act.summary}
                    </p>
                    {act.outcome && (
                      <span className="inline-block mt-1 text-[10px] font-medium text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                        Outcome: {act.outcome}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
