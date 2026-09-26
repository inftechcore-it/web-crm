/**
 * Collabsight AV CRM - Frontend API Client
 */

const BASE_URL = '/api';

export async function fetchLeads(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const res = await fetch(`${BASE_URL}/leads?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch leads: ${res.statusText}`);
  return res.json();
}

export async function fetchLeadById(id) {
  const res = await fetch(`${BASE_URL}/leads/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch lead ${id}`);
  return res.json();
}

export async function createLead(data) {
  const res = await fetch(`${BASE_URL}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Failed to create lead`);
  return res.json();
}

export async function updateLead(id, updates) {
  const res = await fetch(`${BASE_URL}/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error(`Failed to update lead`);
  return res.json();
}

export async function deleteLead(id) {
  const res = await fetch(`${BASE_URL}/leads/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`Failed to delete lead`);
  return res.json();
}

export async function batchDeleteLeads(ids) {
  const res = await fetch(`${BASE_URL}/leads/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });
  if (!res.ok) throw new Error(`Failed to batch delete leads`);
  return res.json();
}

export async function batchUpdateStatus(ids, status) {
  const res = await fetch(`${BASE_URL}/leads/batch-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, status })
  });
  if (!res.ok) throw new Error(`Failed to batch update stage`);
  return res.json();
}

export async function generateLeads(payload) {
  const res = await fetch(`${BASE_URL}/leads/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to generate leads`);
  return res.json();
}

export async function fetchLeadPitch(id) {
  const res = await fetch(`${BASE_URL}/leads/${id}/pitch`);
  if (!res.ok) throw new Error(`Failed to generate pitch`);
  return res.json();
}

export async function logLeadActivity(id, activity) {
  const res = await fetch(`${BASE_URL}/leads/${id}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity)
  });
  if (!res.ok) throw new Error(`Failed to log activity`);
  return res.json();
}

export async function importCsvLeads(leads) {
  const res = await fetch(`${BASE_URL}/leads/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leads })
  });
  if (!res.ok) throw new Error(`Failed to import leads`);
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats`);
  return res.json();
}

export async function fetchSearchSetsMeta() {
  const res = await fetch(`${BASE_URL}/leads/meta/search-sets`);
  if (!res.ok) throw new Error(`Failed to fetch search sets metadata`);
  return res.json();
}

export async function fetchPlacesStatus() {
  const res = await fetch(`${BASE_URL}/leads/places/status`);
  if (!res.ok) return { configured: false };
  return res.json();
}

export async function enrichLeadWithPlaces(id) {
  const res = await fetch(`${BASE_URL}/leads/${id}/enrich-places`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to enrich lead with Google Places`);
  return res.json();
}

export async function generateFromGooglePlaces(payload) {
  const res = await fetch(`${BASE_URL}/leads/generate-places`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Google Places generation failed`);
  return res.json();
}

export const EXPORT_EXCEL_URL = `${BASE_URL}/export/excel`;
export const EXPORT_CSV_URL = `${BASE_URL}/export/csv`;
export const EXPORT_JSON_URL = `${BASE_URL}/export/json`;
