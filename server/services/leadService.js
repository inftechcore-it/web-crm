/**
 * Collabsight AV CRM - Lead Data Service
 */

const db = require('../db');
const { v4: uuidv4 } = require('uuid');

function getLeads({
  search = '',
  vertical = '',
  city = '',
  priority = '',
  status = '',
  search_name = '',
  date_range = '',
  sortBy = 'created_at',
  sortOrder = 'DESC',
  page = 1,
  limit = 100
} = {}) {
  const conditions = [];
  const params = {};

  if (search && search.trim()) {
    conditions.push(`(
      company_name LIKE @search OR
      city LIKE @search OR
      sub_region LIKE @search OR
      suggested_contact_name LIKE @search OR
      primary_av_need LIKE @search OR
      search_name LIKE @search OR
      notes LIKE @search
    )`);
    params.search = `%${search.trim()}%`;
  }

  if (vertical && vertical !== 'all') {
    conditions.push(`vertical = @vertical`);
    params.vertical = vertical;
  }

  if (city && city !== 'all') {
    conditions.push(`city = @city`);
    params.city = city;
  }

  if (priority && priority !== 'all') {
    conditions.push(`priority = @priority`);
    params.priority = priority;
  }

  if (status && status !== 'all') {
    conditions.push(`status = @status`);
    params.status = status;
  }

  if (search_name && search_name !== 'all') {
    if (search_name === '__unlabeled__') {
      conditions.push(`(search_name IS NULL OR search_name = '')`);
    } else {
      conditions.push(`search_name = @search_name`);
      params.search_name = search_name;
    }
  }

  if (date_range && date_range !== 'all') {
    if (date_range === 'today') {
      conditions.push(`date(created_at) = date('now')`);
    } else if (date_range === 'yesterday') {
      conditions.push(`date(created_at) = date('now', '-1 day')`);
    } else if (date_range === 'last_7_days') {
      conditions.push(`created_at >= datetime('now', '-7 days')`);
    } else if (date_range === 'last_30_days') {
      conditions.push(`created_at >= datetime('now', '-30 days')`);
    } else {
      // Direct YYYY-MM-DD
      conditions.push(`date(created_at) = @date_range`);
      params.date_range = date_range;
    }
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validate sort field
  const allowedSortCols = ['company_name', 'vertical', 'city', 'priority', 'status', 'deal_value', 'created_at', 'search_name'];
  const safeSortCol = allowedSortCols.includes(sortBy) ? sortBy : 'created_at';
  const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countQuery = `SELECT COUNT(*) as total FROM leads ${whereClause}`;
  const totalRow = db.prepare(countQuery).get(params);
  const total = totalRow ? totalRow.total : 0;

  const parsedLimit = Math.max(1, Math.min(500, parseInt(limit, 10) || 100));
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (parsedPage - 1) * parsedLimit;

  params.limit = parsedLimit;
  params.offset = offset;

  const dataQuery = `
    SELECT * FROM leads
    ${whereClause}
    ORDER BY ${safeSortCol} ${safeSortOrder}
    LIMIT @limit OFFSET @offset
  `;

  const leads = db.prepare(dataQuery).all(params);

  return {
    leads,
    total,
    page: parsedPage,
    limit: parsedLimit,
    totalPages: Math.ceil(total / parsedLimit)
  };
}

function getLeadById(id) {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  if (!lead) return null;

  const activities = db.prepare('SELECT * FROM activities WHERE lead_id = ? ORDER BY created_at DESC').all(id);
  return { ...lead, activities };
}

function createLead(leadData) {
  const id = leadData.id || `LEAD-MANUAL-${Date.now()}`;
  const stmt = db.prepare(`
    INSERT INTO leads (
      id, company_name, vertical, city, sub_region, address, phone,
      website, target_role, suggested_contact_name, primary_av_need,
      pitch_angle, budget_tier, priority, status, deal_value, notes, search_name, created_at, updated_at
    ) VALUES (
      @id, @company_name, @vertical, @city, @sub_region, @address, @phone,
      @website, @target_role, @suggested_contact_name, @primary_av_need,
      @pitch_angle, @budget_tier, @priority, @status, @deal_value, @notes, @search_name,
      datetime('now'), datetime('now')
    )
  `);

  stmt.run({
    id,
    company_name: leadData.company_name,
    vertical: leadData.vertical || 'corporate_it',
    city: leadData.city || 'Mumbai',
    sub_region: leadData.sub_region || leadData.city || '',
    address: leadData.address || '',
    phone: leadData.phone || '',
    website: leadData.website || '',
    target_role: leadData.target_role || 'IT / Admin Head',
    suggested_contact_name: leadData.suggested_contact_name || '',
    primary_av_need: leadData.primary_av_need || 'Video Conferencing Hardware',
    pitch_angle: leadData.pitch_angle || '',
    budget_tier: leadData.budget_tier || 'Medium (₹2.5L - ₹4.5L)',
    priority: leadData.priority || 'Warm',
    status: leadData.status || 'New',
    deal_value: Number(leadData.deal_value || 0),
    notes: leadData.notes || '',
    search_name: leadData.search_name || ''
  });

  return getLeadById(id);
}

function updateLead(id, updates) {
  const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  if (!existing) return null;

  const allowedFields = [
    'company_name', 'vertical', 'city', 'sub_region', 'address', 'phone',
    'website', 'target_role', 'suggested_contact_name', 'primary_av_need',
    'pitch_angle', 'budget_tier', 'priority', 'status', 'deal_value', 'notes',
    'search_name', 'email', 'linkedin_url', 'google_place_id', 'maps_url', 'rating'
  ];

  const setClauses = [];
  const params = { id };

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = @${field}`);
      params[field] = updates[field];
    }
  }

  if (setClauses.length === 0) return existing;

  setClauses.push(`updated_at = datetime('now')`);

  const sql = `UPDATE leads SET ${setClauses.join(', ')} WHERE id = @id`;
  db.prepare(sql).run(params);

  // If status changed, auto log activity
  if (updates.status && updates.status !== existing.status) {
    addActivity(id, {
      action_type: 'Status Change',
      summary: `Stage updated from '${existing.status}' to '${updates.status}'`,
      outcome: 'Updated in CRM'
    });
  }

  return getLeadById(id);
}

function deleteLead(id) {
  const result = db.prepare('DELETE FROM leads WHERE id = ?').run(id);
  return result.changes > 0;
}

function batchDelete(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(',');
  const result = db.prepare(`DELETE FROM leads WHERE id IN (${placeholders})`).run(...ids);
  return result.changes;
}

function batchUpdateStatus(ids, newStatus) {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  const placeholders = ids.map(() => '?').join(',');
  const result = db.prepare(`UPDATE leads SET status = ?, updated_at = datetime('now') WHERE id IN (${placeholders})`).run(newStatus, ...ids);

  // Log activity for each
  const actStmt = db.prepare(`INSERT INTO activities (lead_id, action_type, summary, outcome, created_at) VALUES (?, 'Batch Status', ?, 'Batch Operation', datetime('now'))`);
  ids.forEach(id => {
    try {
      actStmt.run(id, `Batch moved to '${newStatus}'`);
    } catch (e) {}
  });

  return result.changes;
}

function addActivity(leadId, { action_type, summary, outcome = '' }) {
  const stmt = db.prepare(`
    INSERT INTO activities (lead_id, action_type, summary, outcome, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);
  const result = stmt.run(leadId, action_type, summary, outcome);
  return { id: result.lastInsertRowid, lead_id: leadId, action_type, summary, outcome, created_at: new Date().toISOString() };
}

function getStats() {
  const totalRow = db.prepare(`
    SELECT
      COUNT(*) as total_leads,
      COALESCE(SUM(deal_value), 0) as total_pipeline_value,
      SUM(CASE WHEN priority = 'Hot' THEN 1 ELSE 0 END) as hot_leads_count,
      SUM(CASE WHEN status = 'Won' THEN 1 ELSE 0 END) as won_leads_count,
      COALESCE(SUM(CASE WHEN status = 'Won' THEN deal_value ELSE 0 END), 0) as won_deal_value,
      SUM(CASE WHEN status = 'Meeting Fixed' THEN 1 ELSE 0 END) as meetings_fixed_count,
      SUM(CASE WHEN status = 'Proposal Sent' THEN 1 ELSE 0 END) as proposals_sent_count
    FROM leads
  `).get();

  const byVertical = db.prepare(`
    SELECT
      vertical,
      COUNT(*) as count,
      COALESCE(ROUND(SUM(deal_value), 2), 0) as total_value
    FROM leads
    GROUP BY vertical
    ORDER BY count DESC
  `).all();

  const byStatus = db.prepare(`
    SELECT
      status,
      COUNT(*) as count,
      COALESCE(ROUND(SUM(deal_value), 2), 0) as total_value
    FROM leads
    GROUP BY status
    ORDER BY count DESC
  `).all();

  const byCity = db.prepare(`
    SELECT
      city,
      COUNT(*) as count,
      COALESCE(ROUND(SUM(deal_value), 2), 0) as total_value
    FROM leads
    GROUP BY city
    ORDER BY count DESC
    LIMIT 10
  `).all();

  const recentActivities = db.prepare(`
    SELECT a.*, l.company_name
    FROM activities a
    LEFT JOIN leads l ON a.lead_id = l.id
    ORDER BY a.created_at DESC
    LIMIT 8
  `).all();

  return {
    overview: {
      totalLeads: totalRow.total_leads,
      totalPipelineValue: Number(totalRow.total_pipeline_value.toFixed(2)),
      hotLeadsCount: totalRow.hot_leads_count,
      wonLeadsCount: totalRow.won_leads_count,
      wonDealValue: Number(totalRow.won_deal_value.toFixed(2)),
      meetingsFixedCount: totalRow.meetings_fixed_count,
      proposalsSentCount: totalRow.proposals_sent_count,
      conversionRate: totalRow.total_leads > 0 ? Number(((totalRow.won_leads_count / totalRow.total_leads) * 100).toFixed(1)) : 0
    },
    byVertical,
    byStatus,
    byCity,
    recentActivities
  };
}

function getSearchSetsMeta() {
  const searchSets = db.prepare(`
    SELECT
      COALESCE(NULLIF(search_name, ''), 'Uncategorized') as search_name,
      COUNT(*) as count,
      MAX(created_at) as last_created,
      ROUND(SUM(deal_value), 2) as total_value
    FROM leads
    GROUP BY COALESCE(NULLIF(search_name, ''), 'Uncategorized')
    ORDER BY last_created DESC
  `).all();

  const categories = db.prepare(`
    SELECT
      vertical,
      COUNT(*) as count,
      ROUND(SUM(deal_value), 2) as total_value
    FROM leads
    GROUP BY vertical
    ORDER BY count DESC
  `).all();

  const dates = db.prepare(`
    SELECT
      strftime('%Y-%m-%d', created_at) as date_str,
      COUNT(*) as count
    FROM leads
    GROUP BY date_str
    ORDER BY date_str DESC
    LIMIT 30
  `).all();

  const statuses = db.prepare(`
    SELECT
      status,
      COUNT(*) as count
    FROM leads
    GROUP BY status
    ORDER BY count DESC
  `).all();

  const cities = db.prepare(`
    SELECT
      city,
      COUNT(*) as count
    FROM leads
    GROUP BY city
    ORDER BY count DESC
  `).all();

  return {
    searchSets,
    categories,
    dates,
    statuses,
    cities
  };
}

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  batchDelete,
  batchUpdateStatus,
  addActivity,
  getStats,
  getSearchSetsMeta
};
