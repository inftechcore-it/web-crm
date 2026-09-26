import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Plus,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { fetchLeadById, logLeadActivity } from '../../services/api';

export default function ActivityLogModal({ isOpen, onClose, lead, onUpdated }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [actionType, setActionType] = useState('Call');
  const [summary, setSummary] = useState('');
  const [outcome, setOutcome] = useState('');

  useEffect(() => {
    if (isOpen && lead?.id) {
      loadLeadDetails(lead.id);
    }
  }, [isOpen, lead?.id]);

  const loadLeadDetails = async (id) => {
    setLoading(true);
    try {
      const data = await fetchLeadById(id);
      setActivities(data.activities || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !lead) return null;

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!summary.trim()) return;

    setSubmitting(true);
    try {
      const res = await logLeadActivity(lead.id, {
        action_type: actionType,
        summary: summary.trim(),
        outcome: outcome.trim()
      });
      if (res.success) {
        setSummary('');
        setOutcome('');
        loadLeadDetails(lead.id);
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Call': return <Phone className="w-3.5 h-3.5 text-amber-500" />;
      case 'Email': return <Mail className="w-3.5 h-3.5 text-sky-500" />;
      case 'WhatsApp': return <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Meeting': return <Calendar className="w-3.5 h-3.5 text-purple-500" />;
      default: return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-600 to-sky-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-100" />
            <div>
              <h2 className="text-base font-bold font-heading">
                Activity History: {lead.company_name}
              </h2>
              <p className="text-xs text-sky-100">
                Log touchpoints, meeting notes & commercial outcomes
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* New Activity Form */}
          <form onSubmit={handleAddActivity} className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-3">
            <span className="font-bold text-sky-900 block text-xs uppercase tracking-wider">
              Log New Interaction
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Type</label>
                <select
                  value={actionType}
                  onChange={e => setActionType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-medium outline-hidden"
                >
                  <option value="Call">Phone Call</option>
                  <option value="Email">Cold / Follow-up Email</option>
                  <option value="WhatsApp">WhatsApp Chat</option>
                  <option value="Meeting">On-site Meeting / Demo</option>
                  <option value="Site Audit">Acoustic / Room Audit</option>
                  <option value="Note">Internal Note</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Outcome</label>
                <input
                  type="text"
                  value={outcome}
                  onChange={e => setOutcome(e.target.value)}
                  placeholder="e.g. Demo scheduled for Friday"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Summary / Discussion Details *</label>
              <textarea
                rows="2"
                required
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="What was discussed? What are the next steps?"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl outline-hidden"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !summary.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Touchpoint</span>
              </button>
            </div>
          </form>

          {/* Timeline */}
          <div>
            <h3 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider">
              Historical Timeline ({activities.length})
            </h3>

            {loading ? (
              <div className="py-8 text-center text-slate-400">Loading activity timeline...</div>
            ) : activities.length === 0 ? (
              <div className="py-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No recorded interactions yet. Use the form above to log the first call or audit!
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {activities.map(item => (
                  <div key={item.id} className="relative flex items-start gap-3 pl-2">
                    <div className="h-7 w-7 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 z-10">
                      {getActivityIcon(item.action_type)}
                    </div>

                    <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{item.action_type}</span>
                        <span className="text-[10px] text-slate-400">
                          {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-700 leading-relaxed">{item.summary}</p>
                      {item.outcome && (
                        <div className="mt-1.5 inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Outcome: {item.outcome}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
