/**
 * Collabsight AV CRM - Government Data Discovery Engine
 * Streams and parses MCA (Ministry of Corporate Affairs) Company Master & Udyam MSME data,
 * maps NIC industrial classes to AV verticals, calculates deal estimates, and ingests leads.
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const db = require('../db');

// NIC Code mappings to CRM Verticals
const NIC_VERTICAL_MAP = {
  // Corporate IT & Software
  '6201': 'corporate_it',
  '6202': 'corporate_it',
  '6209': 'corporate_it',
  '6311': 'corporate_it',

  // Architecture & Interior Fitouts
  '7110': 'architects_interior',
  '7410': 'architects_interior',
  '7420': 'architects_interior',

  // Education & Coaching Hubs
  '8510': 'education_coaching',
  '8520': 'education_coaching',
  '8530': 'education_coaching',
  '8540': 'education_coaching',
  '8550': 'education_coaching',

  // Hospitality & Coworking
  '5510': 'hospitality_coworking',
  '5520': 'hospitality_coworking',
  '5590': 'hospitality_coworking',
  '6810': 'hospitality_coworking',
  '6820': 'hospitality_coworking'
};

// ROC Code to City Mapping
const ROC_CITY_MAP = {
  'roc-mumbai': 'Mumbai',
  'mumbai': 'Mumbai',
  'roc-pune': 'Pune',
  'pune': 'Pune',
  'roc-nagpur': 'Nagpur',
  'nagpur': 'Nagpur'
};

// Vertical Metadata Templates
const VERTICAL_METADATA = {
  corporate_it: {
    target_role: 'IT Director / Infrastructure Head',
    primary_av_need: 'Executive Boardroom Video Conferencing (4K Dual Display) + Acoustic Ceiling Mic Array',
    pitch_angle: 'Replace unreliable conference audio with Teams/Zoom Certified hardware and 4-hour local SLA.'
  },
  architects_interior: {
    target_role: 'Principal Architect / Design Director',
    primary_av_need: 'Ultra-narrow Bezel Video Wall & Interactive Touch Presentation Display',
    pitch_angle: 'Deliver turnkey AV integration for your commercial fitouts with guaranteed architect margins.'
  },
  education_coaching: {
    target_role: 'Academic Director / Campus Admin',
    primary_av_need: 'Smart Hybrid Classroom Setup: 86-inch Interactive Flat Panel + Tracking Camera',
    pitch_angle: 'Modernize classrooms with interactive displays and hybrid recording systems.'
  },
  hospitality_coworking: {
    target_role: 'General Manager / Operations Lead',
    primary_av_need: 'Distributed Multi-Zone Background Audio + Meeting Room Scheduling Panels',
    pitch_angle: 'Standardize plug-and-play conference rooms across your properties.'
  }
};

/**
 * Clean & normalize keys of a raw CSV record
 */
function normalizeRecord(record) {
  const normalized = {};
  for (const [key, val] of Object.entries(record)) {
    const cleanKey = key.trim().toUpperCase().replace(/[\s-]+/g, '_');
    normalized[cleanKey] = typeof val === 'string' ? val.trim() : val;
  }
  return normalized;
}

/**
 * Map NIC industrial class to vertical
 */
function mapNicToVertical(industrialClass) {
  if (!industrialClass) return null;
  const cleaned = String(industrialClass).trim().replace(/[^0-9]/g, '');
  
  // Exact 4-digit match
  if (NIC_VERTICAL_MAP[cleaned]) {
    return NIC_VERTICAL_MAP[cleaned];
  }

  // Prefix match (e.g. 62011 -> 6201)
  for (const [code, vertical] of Object.entries(NIC_VERTICAL_MAP)) {
    if (cleaned.startsWith(code)) {
      return vertical;
    }
  }

  return null;
}

/**
 * Map ROC code to city
 */
function mapRocToCity(rocCode) {
  if (!rocCode) return 'Maharashtra';
  const clean = rocCode.toLowerCase().trim();
  for (const [key, city] of Object.entries(ROC_CITY_MAP)) {
    if (clean.includes(key)) {
      return city;
    }
  }
  return 'Maharashtra';
}

/**
 * Extract director name from DIRECTORS field
 */
function extractDirectorName(directorsField) {
  if (!directorsField) return 'Managing Director';
  
  const parts = directorsField.split(/[,;\n|]+/);
  if (!parts.length || !parts[0].trim()) return 'Managing Director';

  let first = parts[0]
    .replace(/\(?DIN\s*:?\s*[0-9A-Z]+\)?/gi, '')
    .replace(/[\[\]\(\)]/g, '')
    .trim();

  if (first.length > 2) {
    first = first
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return first || 'Managing Director';
}

/**
 * Calculate deal value and budget tier from AUTHORISED_CAP
 * <1Cr -> 2.5, 1-5Cr -> 4.5, 5-25Cr -> 8.0, >25Cr -> 15.0
 */
function calculateDealValue(authCap) {
  const num = parseFloat(String(authCap).replace(/[^0-9.]/g, '')) || 0;
  
  if (num < 10000000) { // < 1 Cr
    return { dealValue: 2.5, budgetTier: 'Standard (₹1.5L - ₹3.5L)' };
  } else if (num <= 50000000) { // 1 - 5 Cr
    return { dealValue: 4.5, budgetTier: 'Mid-Range (₹3.5L - ₹6L)' };
  } else if (num <= 250000000) { // 5 - 25 Cr
    return { dealValue: 8.0, budgetTier: 'High (₹6L - ₹12L)' };
  } else { // > 25 Cr
    return { dealValue: 15.0, budgetTier: 'Enterprise (>₹12L)' };
  }
}

/**
 * Determine lead priority based on registration date:
 * <2 years ago = Hot, 2-5 years = Warm, >5 years = Cold
 */
function calculatePriority(dateStr) {
  if (!dateStr) return 'Warm';
  
  let regDate = new Date(dateStr);
  if (isNaN(regDate.getTime())) {
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        regDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }
  }

  if (isNaN(regDate.getTime())) return 'Warm';

  const ageMs = Date.now() - regDate.getTime();
  const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);

  if (ageYears < 2) return 'Hot';
  if (ageYears <= 5) return 'Warm';
  return 'Cold';
}

/**
 * Create or update an import job in the database
 */
function createJob(source, filename) {
  const info = db.prepare(`
    INSERT INTO import_jobs (source, filename, status, created_at)
    VALUES (?, ?, 'running', datetime('now'))
  `).run(source, filename || 'upload.csv');
  return info.lastInsertRowid;
}

function updateJobProgress(jobId, { total, inserted, skipped, errors, status = 'running' }) {
  const completedAt = (status === 'completed' || status === 'failed') ? new Date().toISOString() : null;
  db.prepare(`
    UPDATE import_jobs
    SET total_rows = ?,
        leads_inserted = ?,
        leads_skipped = ?,
        errors = ?,
        status = ?,
        completed_at = COALESCE(?, completed_at)
    WHERE id = ?
  `).run(total, inserted, skipped, errors, status, completedAt, jobId);
}

/**
 * Stream & Ingest MCA Company Master CSV
 */
async function importMcaCsv(filePathOrStream, filename = 'mca_company_master.csv') {
  const jobId = createJob('MCA Company Master', filename);

  const stream = typeof filePathOrStream === 'string'
    ? fs.createReadStream(filePathOrStream)
    : filePathOrStream;

  let totalRows = 0;
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  const checkDuplicate = db.prepare(`
    SELECT id FROM leads 
    WHERE LOWER(TRIM(company_name)) = LOWER(TRIM(?))
      AND LOWER(TRIM(city)) = LOWER(TRIM(?))
    LIMIT 1
  `);

  const insertLead = db.prepare(`
    INSERT INTO leads (
      id, company_name, vertical, city, sub_region, address, phone, website,
      target_role, suggested_contact_name, primary_av_need, pitch_angle,
      budget_tier, priority, status, deal_value, notes, search_name,
      linkedin_url, maps_url, created_at, updated_at
    ) VALUES (
      @id, @company_name, @vertical, @city, @sub_region, @address, @phone, @website,
      @target_role, @suggested_contact_name, @primary_av_need, @pitch_angle,
      @budget_tier, @priority, 'New', @deal_value, @notes, @search_name,
      @linkedin_url, @maps_url, datetime('now'), datetime('now')
    )
  `);

  const nowYearMonth = new Date().toISOString().slice(0, 7);
  const chunk = [];
  const CHUNK_SIZE = 500;

  const parser = stream.pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true
    })
  );

  const processChunk = db.transaction((rows) => {
    let chunkInserted = 0;
    let chunkSkipped = 0;

    for (const raw of rows) {
      try {
        const row = normalizeRecord(raw);

        // 1. Filter: REGISTERED_STATE = "Maharashtra"
        const state = (row.REGISTERED_STATE || '').toLowerCase();
        if (!state.includes('maharashtra') && state !== 'mh') {
          chunkSkipped++;
          continue;
        }

        // 2. Filter: COMPANY_STATUS = "Active"
        const status = (row.COMPANY_STATUS || '').toLowerCase();
        if (status !== 'active') {
          chunkSkipped++;
          continue;
        }

        // 3. Map NIC Code to vertical
        const vertical = mapNicToVertical(row.INDUSTRIAL_CLASS);
        if (!vertical) {
          chunkSkipped++;
          continue;
        }

        const companyName = row.COMPANY_NAME;
        if (!companyName) {
          chunkSkipped++;
          continue;
        }

        // 4. Map ROC to City
        const city = mapRocToCity(row.ROC_CODE);

        // 5. Deduplicate
        const existing = checkDuplicate.get(companyName, city);
        if (existing) {
          chunkSkipped++;
          continue;
        }

        // 6. Metadata & Calculations
        const director = extractDirectorName(row.DIRECTORS);
        const { dealValue, budgetTier } = calculateDealValue(row.AUTHORISED_CAP);
        const priority = calculatePriority(row.DATE_OF_REGISTRATION);
        const searchName = `MCA-${vertical}-${city}-${nowYearMonth}`;
        const meta = VERTICAL_METADATA[vertical] || VERTICAL_METADATA.corporate_it;

        const id = `LEAD-MCA-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyName + ' ' + city)}`;
        const linkedinUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName + ' ' + meta.target_role)}`;

        insertLead.run({
          id,
          company_name: companyName,
          vertical,
          city,
          sub_region: row.ROC_CODE || city,
          address: `${city}, Maharashtra (CIN: ${row.CIN || 'N/A'})`,
          phone: '',
          website: '',
          target_role: meta.target_role,
          suggested_contact_name: director,
          primary_av_need: meta.primary_av_need,
          pitch_angle: meta.pitch_angle,
          budget_tier: budgetTier,
          priority,
          deal_value: dealValue,
          notes: `Verified Govt Record via MCA Company Master. CIN: ${row.CIN || 'N/A'}. Paid-up Capital: ₹${row.PAIDUP_CAP || row.AUTHORISED_CAP || '0'}. Reg Date: ${row.DATE_OF_REGISTRATION || 'N/A'}.`,
          search_name: searchName,
          linkedin_url: linkedinUrl,
          maps_url: mapsUrl
        });

        chunkInserted++;
      } catch (err) {
        errors++;
      }
    }

    return { chunkInserted, chunkSkipped };
  });

  try {
    for await (const row of parser) {
      totalRows++;
      chunk.push(row);

      if (chunk.length >= CHUNK_SIZE) {
        const res = processChunk(chunk);
        inserted += res.chunkInserted;
        skipped += res.chunkSkipped;
        chunk.length = 0;

        updateJobProgress(jobId, { total: totalRows, inserted, skipped, errors, status: 'running' });
      }
    }

    if (chunk.length > 0) {
      const res = processChunk(chunk);
      inserted += res.chunkInserted;
      skipped += res.chunkSkipped;
      chunk.length = 0;
    }

    updateJobProgress(jobId, { total: totalRows, inserted, skipped, errors, status: 'completed' });
  } catch (err) {
    console.error('MCA Import Error:', err);
    updateJobProgress(jobId, { total: totalRows, inserted, skipped, errors: errors + 1, status: 'failed' });
    throw err;
  }

  return {
    jobId,
    total: totalRows,
    inserted,
    skipped,
    errors
  };
}

/**
 * Stream & Ingest Udyam MSME CSV
 */
async function importMsmeCsv(filePathOrStream, filename = 'udyam_msme.csv') {
  const jobId = createJob('Udyam MSME', filename);

  const stream = typeof filePathOrStream === 'string'
    ? fs.createReadStream(filePathOrStream)
    : filePathOrStream;

  let totalRows = 0;
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  const checkDuplicate = db.prepare(`
    SELECT id FROM leads 
    WHERE LOWER(TRIM(company_name)) = LOWER(TRIM(?))
      AND LOWER(TRIM(city)) = LOWER(TRIM(?))
    LIMIT 1
  `);

  const insertLead = db.prepare(`
    INSERT INTO leads (
      id, company_name, vertical, city, sub_region, address, phone, website,
      target_role, suggested_contact_name, primary_av_need, pitch_angle,
      budget_tier, priority, status, deal_value, notes, search_name,
      linkedin_url, maps_url, created_at, updated_at
    ) VALUES (
      @id, @company_name, @vertical, @city, @sub_region, @address, @phone, @website,
      @target_role, @suggested_contact_name, @primary_av_need, @pitch_angle,
      @budget_tier, @priority, 'New', @deal_value, @notes, @search_name,
      @linkedin_url, @maps_url, datetime('now'), datetime('now')
    )
  `);

  const nowYearMonth = new Date().toISOString().slice(0, 7);
  const chunk = [];
  const CHUNK_SIZE = 500;

  const parser = stream.pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true
    })
  );

  const processChunk = db.transaction((rows) => {
    let chunkInserted = 0;
    let chunkSkipped = 0;

    for (const raw of rows) {
      try {
        const row = normalizeRecord(raw);

        // Filter state: Maharashtra
        const state = (row.STATE || row.REGISTERED_STATE || '').toLowerCase();
        if (!state.includes('maharashtra') && state !== 'mh') {
          chunkSkipped++;
          continue;
        }

        const enterpriseName = row.ENTERPRISE_NAME || row.COMPANY_NAME;
        if (!enterpriseName) {
          chunkSkipped++;
          continue;
        }

        const city = row.DISTRICT || row.CITY || 'Mumbai';

        // Deduplicate
        const existing = checkDuplicate.get(enterpriseName, city);
        if (existing) {
          chunkSkipped++;
          continue;
        }

        // Map vertical from major activity or type
        const activity = (row.MAJOR_ACTIVITY || '').toLowerCase();
        let vertical = 'corporate_it';
        if (activity.includes('architect') || activity.includes('interior') || activity.includes('design')) {
          vertical = 'architects_interior';
        } else if (activity.includes('educat') || activity.includes('school') || activity.includes('coaching')) {
          vertical = 'education_coaching';
        } else if (activity.includes('hotel') || activity.includes('hospital') || activity.includes('restaurant') || activity.includes('cowork')) {
          vertical = 'hospitality_coworking';
        }

        // Deal value based on MSME type
        const type = (row.TYPE || '').toLowerCase();
        let dealValue = 3.5;
        let budgetTier = 'Standard (₹1.5L - ₹3.5L)';
        if (type.includes('medium')) {
          dealValue = 8.0;
          budgetTier = 'High (₹6L - ₹12L)';
        } else if (type.includes('small')) {
          dealValue = 4.5;
          budgetTier = 'Mid-Range (₹3.5L - ₹6L)';
        }

        const priority = calculatePriority(row.DATE_OF_COMMENCEMENT || row.DATE_OF_REGISTRATION);
        const searchName = `MSME-${vertical}-${city}-${nowYearMonth}`;
        const meta = VERTICAL_METADATA[vertical] || VERTICAL_METADATA.corporate_it;

        const id = `LEAD-MSME-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enterpriseName + ' ' + city)}`;
        const linkedinUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(enterpriseName + ' ' + meta.target_role)}`;

        insertLead.run({
          id,
          company_name: enterpriseName,
          vertical,
          city,
          sub_region: row.DISTRICT || city,
          address: `${city}, Maharashtra (Udyam: ${row.UDYAM_NUMBER || 'N/A'})`,
          phone: '',
          website: '',
          target_role: meta.target_role,
          suggested_contact_name: 'Proprietor / Managing Partner',
          primary_av_need: meta.primary_av_need,
          pitch_angle: meta.pitch_angle,
          budget_tier: budgetTier,
          priority,
          deal_value: dealValue,
          notes: `Govt MSME Discovery. Udyam No: ${row.UDYAM_NUMBER || 'N/A'}. Activity: ${row.MAJOR_ACTIVITY || 'N/A'}. Type: ${row.TYPE || 'N/A'}.`,
          search_name: searchName,
          linkedin_url: linkedinUrl,
          maps_url: mapsUrl
        });

        chunkInserted++;
      } catch (e) {
        errors++;
      }
    }

    return { chunkInserted, chunkSkipped };
  });

  try {
    for await (const row of parser) {
      totalRows++;
      chunk.push(row);

      if (chunk.length >= CHUNK_SIZE) {
        const res = processChunk(chunk);
        inserted += res.chunkInserted;
        skipped += res.chunkSkipped;
        chunk.length = 0;

        updateJobProgress(jobId, { total: totalRows, inserted, skipped, errors, status: 'running' });
      }
    }

    if (chunk.length > 0) {
      const res = processChunk(chunk);
      inserted += res.chunkInserted;
      skipped += res.chunkSkipped;
      chunk.length = 0;
    }

    updateJobProgress(jobId, { total: totalRows, inserted, skipped, errors, status: 'completed' });
  } catch (err) {
    console.error('MSME Import Error:', err);
    updateJobProgress(jobId, { total: totalRows, inserted, skipped, errors: errors + 1, status: 'failed' });
    throw err;
  }

  return {
    jobId,
    total: totalRows,
    inserted,
    skipped,
    errors
  };
}

/**
 * Preview first N rows of a CSV file for UI display
 */
async function previewCsv(filePathOrStream, type = 'mca', maxRows = 5) {
  const stream = typeof filePathOrStream === 'string'
    ? fs.createReadStream(filePathOrStream)
    : filePathOrStream;

  const parser = stream.pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true
    })
  );

  const previewRows = [];
  let matchingCount = 0;
  let totalChecked = 0;

  for await (const raw of parser) {
    totalChecked++;
    const row = normalizeRecord(raw);

    if (type === 'mca') {
      const state = (row.REGISTERED_STATE || '').toLowerCase();
      const status = (row.COMPANY_STATUS || '').toLowerCase();
      const vertical = mapNicToVertical(row.INDUSTRIAL_CLASS);
      const isMatch = (state.includes('maharashtra') || state === 'mh') && status === 'active' && Boolean(vertical);
      if (isMatch) matchingCount++;

      if (previewRows.length < maxRows) {
        previewRows.push({
          cin: row.CIN || '',
          company_name: row.COMPANY_NAME || '',
          roc_code: row.ROC_CODE || '',
          state: row.REGISTERED_STATE || '',
          industrial_class: row.INDUSTRIAL_CLASS || '',
          status: row.COMPANY_STATUS || '',
          directors: row.DIRECTORS || '',
          mapped_vertical: vertical || 'Unmapped',
          is_match: isMatch
        });
      }
    } else {
      const state = (row.STATE || row.REGISTERED_STATE || '').toLowerCase();
      const isMatch = state.includes('maharashtra') || state === 'mh';
      if (isMatch) matchingCount++;

      if (previewRows.length < maxRows) {
        previewRows.push({
          udyam_number: row.UDYAM_NUMBER || '',
          enterprise_name: row.ENTERPRISE_NAME || row.COMPANY_NAME || '',
          type: row.TYPE || '',
          major_activity: row.MAJOR_ACTIVITY || '',
          district: row.DISTRICT || '',
          state: row.STATE || '',
          is_match: isMatch
        });
      }
    }

    if (totalChecked >= 500) break;
  }

  return {
    previewRows,
    sampleChecked: totalChecked,
    matchingCount
  };
}

/**
 * Get last 20 import jobs
 */
function getDiscoveryJobs(limit = 20) {
  return db.prepare(`
    SELECT * FROM import_jobs
    ORDER BY id DESC
    LIMIT ?
  `).all(limit);
}

/**
 * Get aggregated discovery stats
 */
function getDiscoveryStats() {
  const mcaCount = db.prepare(`
    SELECT COUNT(*) as count FROM leads WHERE search_name LIKE 'MCA-%'
  `).get().count;

  const msmeCount = db.prepare(`
    SELECT COUNT(*) as count FROM leads WHERE search_name LIKE 'MSME-%'
  `).get().count;

  const lastJob = db.prepare(`
    SELECT created_at FROM import_jobs ORDER BY id DESC LIMIT 1
  `).get();

  return {
    total_mca_imported: mcaCount,
    total_msme_imported: msmeCount,
    last_run: lastJob ? lastJob.created_at : null
  };
}

module.exports = {
  importMcaCsv,
  importMsmeCsv,
  previewCsv,
  getDiscoveryJobs,
  getDiscoveryStats,
  mapNicToVertical,
  mapRocToCity,
  extractDirectorName,
  calculateDealValue,
  calculatePriority
};
