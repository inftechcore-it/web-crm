/**
 * Collabsight AV CRM - Excel and CSV Exporter Service
 */

const XLSX = require('xlsx');
const db = require('../db');

function exportToCsv(leads) {
  const ws = XLSX.utils.json_to_sheet(leads);
  const csv = XLSX.utils.sheet_to_csv(ws);
  return csv;
}

function exportToExcelWorkbook(leads) {
  const wb = XLSX.utils.book_new();

  // Tab 1: Clean Leads Data
  const cleanLeads = leads.map(l => ({
    "Lead ID": l.id,
    "Company Name": l.company_name,
    "Vertical": l.vertical,
    "City": l.city,
    "Sub-Region": l.sub_region || '',
    "Phone": l.phone || '',
    "Website": l.website || '',
    "Target Role": l.target_role || '',
    "Contact Person": l.suggested_contact_name || '',
    "Primary AV Need": l.primary_av_need || '',
    "Pitch Angle": l.pitch_angle || '',
    "Budget Tier": l.budget_tier || '',
    "Priority": l.priority || 'Warm',
    "Pipeline Stage": l.status || 'New',
    "Deal Value (₹ Lakhs)": l.deal_value || 0,
    "Notes": l.notes || '',
    "Created Date": l.created_at || ''
  }));

  const wsLeads = XLSX.utils.json_to_sheet(cleanLeads);

  // Set column widths
  wsLeads['!cols'] = [
    { wch: 18 }, // ID
    { wch: 30 }, // Company Name
    { wch: 22 }, // Vertical
    { wch: 16 }, // City
    { wch: 28 }, // Sub-Region
    { wch: 18 }, // Phone
    { wch: 24 }, // Website
    { wch: 28 }, // Target Role
    { wch: 22 }, // Contact Person
    { wch: 45 }, // Primary AV Need
    { wch: 40 }, // Pitch Angle
    { wch: 20 }, // Budget Tier
    { wch: 10 }, // Priority
    { wch: 16 }, // Status
    { wch: 18 }, // Deal Value
    { wch: 35 }, // Notes
    { wch: 20 }  // Created Date
  ];

  XLSX.utils.book_append_sheet(wb, wsLeads, "AV SMB Leads");

  // Tab 2: Vertical Breakdown Summary
  const verticalSummary = db.prepare(`
    SELECT
      vertical,
      COUNT(*) as total_leads,
      ROUND(SUM(deal_value), 2) as pipeline_value_lakhs,
      SUM(CASE WHEN priority = 'Hot' THEN 1 ELSE 0 END) as hot_leads,
      SUM(CASE WHEN status = 'Won' THEN 1 ELSE 0 END) as won_leads
    FROM leads
    GROUP BY vertical
  `).all();
  const wsVertical = XLSX.utils.json_to_sheet(verticalSummary);
  XLSX.utils.book_append_sheet(wb, wsVertical, "Vertical Summary");

  // Tab 3: City / Regional Breakdown Summary
  const citySummary = db.prepare(`
    SELECT
      city,
      COUNT(*) as total_leads,
      ROUND(SUM(deal_value), 2) as pipeline_value_lakhs,
      SUM(CASE WHEN status = 'Won' THEN 1 ELSE 0 END) as won_leads
    FROM leads
    GROUP BY city
    ORDER BY total_leads DESC
  `).all();
  const wsCity = XLSX.utils.json_to_sheet(citySummary);
  XLSX.utils.book_append_sheet(wb, wsCity, "City Breakdown");

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

module.exports = {
  exportToCsv,
  exportToExcelWorkbook
};
