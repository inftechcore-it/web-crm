/**
 * Formatting and utility helpers for Collabsight AV CRM
 */

export function formatCurrencyLakhs(value) {
  if (value === undefined || value === null || isNaN(value)) return '₹0.0L';
  const num = Number(value);
  return `₹${num.toFixed(1)}L`;
}

export function formatVerticalName(vertical) {
  switch (vertical) {
    case 'corporate_it':
      return 'Corporate & IT/ITES';
    case 'architects_interior':
      return 'Architects & Interior';
    case 'education_coaching':
      return 'Education & Coaching';
    case 'hospitality_coworking':
      return 'Hospitality & Coworking';
    default:
      return vertical ? vertical.replace(/_/g, ' ') : 'General SMB';
  }
}

export function getPriorityBadgeClass(priority) {
  switch ((priority || '').toLowerCase()) {
    case 'hot':
      return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/20';
    case 'warm':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
    case 'cold':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-sky-50 text-sky-700 border-sky-200';
  }
}

export function getStatusBadgeClass(status) {
  switch (status) {
    case 'New':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'Contacted':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Meeting Fixed':
      return 'bg-amber-50 text-amber-700 border-amber-300';
    case 'Proposal Sent':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Won':
      return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
    case 'Lost':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export const PIPELINE_STAGES = [
  'New',
  'Contacted',
  'Meeting Fixed',
  'Proposal Sent',
  'Won',
  'Lost'
];

export const VERTICAL_OPTIONS = [
  { value: 'all', label: 'All Verticals' },
  { value: 'corporate_it', label: 'Corporate & IT/ITES' },
  { value: 'architects_interior', label: 'Architects & Interior' },
  { value: 'education_coaching', label: 'Education & Coaching' },
  { value: 'hospitality_coworking', label: 'Hospitality & Coworking' }
];

export const CITY_OPTIONS = [
  { value: 'all', label: 'All Cities & Regions' },
  { value: 'Kalyan', label: 'Kalyan-Dombivli' },
  { value: 'Thane', label: 'Thane' },
  { value: 'Navi Mumbai', label: 'Navi Mumbai' },
  { value: 'Mumbai', label: 'Mumbai (Andheri/BKC)' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Nashik', label: 'Nashik' },
  { value: 'Aurangabad', label: 'Aurangabad' },
  { value: 'Nagpur', label: 'Nagpur' },
  { value: 'Surat', label: 'Surat' }
];
