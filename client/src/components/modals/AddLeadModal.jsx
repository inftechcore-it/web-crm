import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Edit2,
  Building2,
  MapPin,
  Briefcase,
  Phone,
  Globe,
  User,
  Tv,
  IndianRupee,
  Layers,
  Sparkles
} from 'lucide-react';
import { createLead, updateLead } from '../../services/api';
import { PIPELINE_STAGES } from '../../utils/formatters';

const AV_NEED_PRESETS = [
  "Microsoft Teams Room retrofit + Wireless HDMI Presentation + Ceiling Mics",
  "All-in-one Video Conferencing Bar (4K ePTZ + Beamforming Mic) + 65\" Display",
  "75\" 4K Interactive Flat Panel (IFPD OPS Android/Win11) + Digital Whiteboard",
  "P2.5 Active LED Video Wall (12x7ft) + Digital Signage Player for Banquet",
  "Pre-construction low-voltage conduit schematics + concealed ceiling speakers",
  "Campus Auditorium Line-Array Audio System + High-lumen Laser Projector"
];

export default function AddLeadModal({
  isOpen,
  onClose,
  leadToEdit = null,
  onSuccess
}) {
  const isEditing = Boolean(leadToEdit);

  const [formData, setFormData] = useState({
    company_name: '',
    vertical: 'corporate_it',
    city: 'Thane',
    sub_region: '',
    address: '',
    phone: '',
    website: '',
    target_role: 'Head of IT Infrastructure & Admin',
    suggested_contact_name: '',
    primary_av_need: AV_NEED_PRESETS[0],
    pitch_angle: 'Upgrade conference room tech with 4K auto-tracking bar and zero loose cables.',
    budget_tier: 'Medium (₹2.5L - ₹4.5L)',
    deal_value: 3.5,
    priority: 'Warm',
    status: 'New',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (leadToEdit) {
      setFormData({
        company_name: leadToEdit.company_name || '',
        vertical: leadToEdit.vertical || 'corporate_it',
        city: leadToEdit.city || 'Thane',
        sub_region: leadToEdit.sub_region || '',
        address: leadToEdit.address || '',
        phone: leadToEdit.phone || '',
        website: leadToEdit.website || '',
        target_role: leadToEdit.target_role || '',
        suggested_contact_name: leadToEdit.suggested_contact_name || '',
        primary_av_need: leadToEdit.primary_av_need || '',
        pitch_angle: leadToEdit.pitch_angle || '',
        budget_tier: leadToEdit.budget_tier || 'Medium (₹2.5L - ₹4.5L)',
        deal_value: leadToEdit.deal_value || 3.5,
        priority: leadToEdit.priority || 'Warm',
        status: leadToEdit.status || 'New',
        notes: leadToEdit.notes || ''
      });
    } else {
      setFormData({
        company_name: '',
        vertical: 'corporate_it',
        city: 'Thane',
        sub_region: '',
        address: '',
        phone: '',
        website: '',
        target_role: 'Head of IT Infrastructure & Admin',
        suggested_contact_name: '',
        primary_av_need: AV_NEED_PRESETS[0],
        pitch_angle: 'Upgrade conference room tech with 4K auto-tracking bar and zero loose cables.',
        budget_tier: 'Medium (₹2.5L - ₹4.5L)',
        deal_value: 3.5,
        priority: 'Warm',
        status: 'New',
        notes: ''
      });
    }
    setError(null);
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim()) {
      setError('Company Name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await updateLead(leadToEdit.id, formData);
      } else {
        await createLead(formData);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-600 to-sky-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {isEditing ? <Edit2 className="w-5 h-5 text-sky-100" /> : <PlusCircle className="w-5 h-5 text-sky-100" />}
            <div>
              <h2 className="text-base font-bold font-heading">
                {isEditing ? `Edit Lead: ${leadToEdit.company_name}` : 'Add New Commercial AV Lead'}
              </h2>
              <p className="text-xs text-sky-100">
                {isEditing ? 'Update pipeline details & AV specs' : 'Section 1: Manual Ingestion Form'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Section: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="e.g. Apex Tech Solutions LLP"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Industry Vertical</label>
              <select
                value={formData.vertical}
                onChange={e => setFormData({ ...formData, vertical: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-hidden font-medium"
              >
                <option value="corporate_it">Corporate & IT/ITES</option>
                <option value="architects_interior">Architects & Interior Designers</option>
                <option value="education_coaching">Education & Coaching Hubs</option>
                <option value="hospitality_coworking">Hospitality & Coworking</option>
              </select>
            </div>
          </div>

          {/* Section: Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City / Hub</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Kalyan, Thane, Navi Mumbai, Pune"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sub-Region / Commercial Area</label>
              <input
                type="text"
                value={formData.sub_region}
                onChange={e => setFormData({ ...formData, sub_region: e.target.value })}
                placeholder="e.g. Wagle Estate / Hinjawadi"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-hidden"
              />
            </div>
          </div>

          {/* Section: Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person Name</label>
              <input
                type="text"
                value={formData.suggested_contact_name}
                onChange={e => setFormData({ ...formData, suggested_contact_name: e.target.value })}
                placeholder="e.g. Rahul Deshmukh"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation / Role</label>
              <input
                type="text"
                value={formData.target_role}
                onChange={e => setFormData({ ...formData, target_role: e.target.value })}
                placeholder="e.g. IT Head / Managing Director"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98XXX XXXXX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
              <input
                type="text"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://company.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-hidden"
              />
            </div>
          </div>

          {/* Section: Primary AV Requirement */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary AV Requirement</label>
            <textarea
              rows="2"
              value={formData.primary_av_need}
              onChange={e => setFormData({ ...formData, primary_av_need: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-hidden"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Presets:</span>
              {AV_NEED_PRESETS.slice(0, 3).map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, primary_av_need: p })}
                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 rounded-md text-slate-600 transition-colors"
                >
                  {p.slice(0, 35)}...
                </button>
              ))}
            </div>
          </div>

          {/* Deal Value, Priority, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deal Value (₹ Lakhs)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.deal_value}
                onChange={e => setFormData({ ...formData, deal_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-hidden font-bold text-sky-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-hidden font-semibold"
              >
                <option value="Hot">🔥 Hot</option>
                <option value="Warm">⚡ Warm</option>
                <option value="Cold">❄️ Cold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pipeline Stage</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-hidden font-semibold"
              >
                {PIPELINE_STAGES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Internal Collabsight Notes</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Met client at trade fair. Follow up with 4K demo kit."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Lead')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
