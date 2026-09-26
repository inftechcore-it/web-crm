/**
 * Collabsight AV CRM - Export Controller
 */

const express = require('express');
const router = express.Router();
const leadService = require('../services/leadService');
const exportService = require('../services/exportService');

// GET /api/export/excel - Multi-tab formatted Excel sheet
router.get('/excel', (req, res) => {
  try {
    const { leads } = leadService.getLeads({ limit: 10000 });
    const buffer = exportService.exportToExcelWorkbook(leads);

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Collabsight_AV_Leads_${timestamp}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).json({ error: 'Excel export failed', details: err.message });
  }
});

// GET /api/export/csv - Standard CRM CSV
router.get('/csv', (req, res) => {
  try {
    const { leads } = leadService.getLeads({ limit: 10000 });
    const csvData = exportService.exportToCsv(leads);

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Collabsight_AV_Leads_${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ error: 'CSV export failed', details: err.message });
  }
});

// GET /api/export/json - Raw JSON export
router.get('/json', (req, res) => {
  try {
    const { leads } = leadService.getLeads({ limit: 10000 });
    res.setHeader('Content-Disposition', 'attachment; filename="Collabsight_AV_Leads.json"');
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: 'JSON export failed' });
  }
});

module.exports = router;
