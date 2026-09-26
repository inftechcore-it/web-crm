/**
 * Collabsight AV CRM - Leads Route Controller
 */

const express = require('express');
const router = express.Router();
const leadService = require('../services/leadService');
const osmService = require('../services/osmService');
const pitchService = require('../services/pitchService');
const googlePlacesService = require('../services/googlePlacesService');

// GET /api/leads/places/status - Check if Google Places API Key is configured
router.get('/places/status', (req, res) => {
  res.json({
    configured: googlePlacesService.isApiKeyConfigured()
  });
});

// GET /api/leads - Query with search & filters
router.get('/', (req, res) => {
  try {
    const result = leadService.getLeads(req.query);
    res.json(result);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Failed to fetch leads', details: err.message });
  }
});

// GET /api/leads/meta/search-sets - Get search set and dimension metadata for cascading filters
router.get('/meta/search-sets', (req, res) => {
  try {
    const meta = leadService.getSearchSetsMeta();
    res.json(meta);
  } catch (err) {
    console.error('Error fetching search sets metadata:', err);
    res.status(500).json({ error: 'Failed to fetch search sets metadata', details: err.message });
  }
});

// POST /api/leads/generate - Trigger live OSM or curated generation
router.post('/generate', async (req, res) => {
  try {
    const {
      regionKey = 'kalyan',
      verticalKey = 'corporate_it',
      mode = 'auto',
      count = 8,
      customHub = '',
      searchName = ''
    } = req.body;

    const result = await osmService.generateAndSaveLeads({
      regionKey,
      verticalKey,
      mode,
      count: parseInt(count, 10) || 8,
      customHub: (customHub || '').trim(),
      searchName: (searchName || '').trim()
    });
    res.json({
      success: true,
      message: `Generated and added ${result.count} new leads via ${result.source}`,
      ...result
    });
  } catch (err) {
    console.error('Error generating leads:', err);
    res.status(500).json({ error: 'Lead generation failed', details: err.message });
  }
});

// POST /api/leads/batch-delete - Delete multiple
router.post('/batch-delete', (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No lead IDs provided' });
    }
    const count = leadService.batchDelete(ids);
    res.json({ success: true, count, message: `Successfully deleted ${count} leads` });
  } catch (err) {
    console.error('Batch delete error:', err);
    res.status(500).json({ error: 'Batch delete failed', details: err.message });
  }
});

// POST /api/leads/batch-status - Update status of multiple
router.post('/batch-status', (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({ error: 'Invalid parameters for batch status update' });
    }
    const count = leadService.batchUpdateStatus(ids, status);
    res.json({ success: true, count, message: `Successfully updated ${count} leads to '${status}'` });
  } catch (err) {
    console.error('Batch status update error:', err);
    res.status(500).json({ error: 'Batch status update failed', details: err.message });
  }
});

// POST /api/leads/import - Bulk import parsed CSV records
router.post('/import', (req, res) => {
  try {
    const { leads } = req.body;
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: 'No lead records provided' });
    }

    let inserted = 0;
    for (const lead of leads) {
      if (lead.company_name) {
        leadService.createLead(lead);
        inserted++;
      }
    }

    res.json({ success: true, count: inserted, message: `Successfully imported ${inserted} leads` });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: 'Lead import failed', details: err.message });
  }
});

// GET /api/leads/:id - Single lead detail with activities
router.get('/:id', (req, res) => {
  try {
    const lead = leadService.getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lead', details: err.message });
  }
});

// GET /api/leads/:id/pitch - Generate personalized cold email, whatsapp, phone script
router.get('/:id/pitch', (req, res) => {
  try {
    const lead = leadService.getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const coldEmail = pitchService.generateColdEmail(lead);
    const whatsapp = pitchService.generateWhatsAppPitch(lead);
    const callingScript = pitchService.generateCallingScript(lead);

    res.json({
      leadId: lead.id,
      companyName: lead.company_name,
      coldEmail,
      whatsapp,
      callingScript
    });
  } catch (err) {
    console.error('Pitch generation error:', err);
    res.status(500).json({ error: 'Pitch generation failed', details: err.message });
  }
});

// POST /api/leads/:id/activity - Log activity for a lead
router.post('/:id/activity', (req, res) => {
  try {
    const { action_type, summary, outcome } = req.body;
    if (!action_type || !summary) {
      return res.status(400).json({ error: 'action_type and summary are required' });
    }
    const activity = leadService.addActivity(req.params.id, { action_type, summary, outcome });
    res.json({ success: true, activity });
  } catch (err) {
    console.error('Activity logging error:', err);
    res.status(500).json({ error: 'Failed to log activity', details: err.message });
  }
});

// POST /api/leads - Create single lead
router.post('/', (req, res) => {
  try {
    if (!req.body.company_name) {
      return res.status(400).json({ error: 'company_name is required' });
    }
    const newLead = leadService.createLead(req.body);
    res.status(201).json(newLead);
  } catch (err) {
    console.error('Error creating lead:', err);
    res.status(500).json({ error: 'Failed to create lead', details: err.message });
  }
});

// PUT /api/leads/:id - Update lead
router.put('/:id', (req, res) => {
  try {
    const updated = leadService.updateLead(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Lead not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating lead:', err);
    res.status(500).json({ error: 'Failed to update lead', details: err.message });
  }
});

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', (req, res) => {
  try {
    const deleted = leadService.deleteLead(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('Error deleting lead:', err);
    res.status(500).json({ error: 'Failed to delete lead', details: err.message });
  }
});

// POST /api/leads/:id/enrich-places - Enrich individual lead using Google Places & live lookup
router.post('/:id/enrich-places', async (req, res) => {
  try {
    const result = await googlePlacesService.enrichLeadWithPlaces(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Places enrichment error:', err);
    res.status(500).json({ error: 'Failed to enrich lead', details: err.message });
  }
});

// POST /api/leads/generate-places - Direct lead generation via Google Places API
router.post('/generate-places', async (req, res) => {
  try {
    const { query, city, vertical, count, searchName } = req.body;
    const result = await googlePlacesService.generateFromGooglePlaces({
      query,
      city,
      vertical,
      count: parseInt(count, 10) || 10,
      searchName
    });
    res.json(result);
  } catch (err) {
    console.error('Google Places generation error:', err);
    res.status(500).json({ error: 'Google Places generation failed', details: err.message });
  }
});

module.exports = router;
