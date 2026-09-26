/**
 * Collabsight AV CRM - Government Data Discovery Routes
 * Endpoints for importing MCA Company Master & Udyam MSME datasets,
 * checking job progress, and inspecting discovery stats.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  importMcaCsv,
  importMsmeCsv,
  previewCsv,
  getDiscoveryJobs,
  getDiscoveryStats
} = require('../services/discoveryService');

// Multer upload config for streaming large CSV files to disk temp storage
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 250 * 1024 * 1024 } // 250MB limit
});

/**
 * POST /api/discovery/import-mca
 * Import MCA Company Master CSV (Multipart File or JSON { csvPath })
 */
router.post('/import-mca', upload.single('file'), async (req, res) => {
  let targetPath = null;
  let filename = 'mca_upload.csv';
  let isTemp = false;

  try {
    if (req.file) {
      targetPath = req.file.path;
      filename = req.file.originalname;
      isTemp = true;
    } else if (req.body && req.body.csvPath) {
      targetPath = path.resolve(req.body.csvPath);
      filename = path.basename(targetPath);
      if (!fs.existsSync(targetPath)) {
        return res.status(400).json({ error: `File not found at: ${req.body.csvPath}` });
      }
    } else {
      return res.status(400).json({ error: 'Please upload a CSV file or provide csvPath in request body' });
    }

    const result = await importMcaCsv(targetPath, filename);
    return res.json({
      success: true,
      message: `MCA Ingestion completed: ${result.inserted} inserted, ${result.skipped} skipped, ${result.errors} errors.`,
      ...result
    });
  } catch (err) {
    console.error('Error importing MCA CSV:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to process MCA CSV'
    });
  } finally {
    if (isTemp && targetPath && fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
      } catch (e) {}
    }
  }
});

/**
 * POST /api/discovery/import-msme
 * Import Udyam MSME CSV (Multipart File or JSON { csvPath })
 */
router.post('/import-msme', upload.single('file'), async (req, res) => {
  let targetPath = null;
  let filename = 'msme_upload.csv';
  let isTemp = false;

  try {
    if (req.file) {
      targetPath = req.file.path;
      filename = req.file.originalname;
      isTemp = true;
    } else if (req.body && req.body.csvPath) {
      targetPath = path.resolve(req.body.csvPath);
      filename = path.basename(targetPath);
      if (!fs.existsSync(targetPath)) {
        return res.status(400).json({ error: `File not found at: ${req.body.csvPath}` });
      }
    } else {
      return res.status(400).json({ error: 'Please upload a CSV file or provide csvPath in request body' });
    }

    const result = await importMsmeCsv(targetPath, filename);
    return res.json({
      success: true,
      message: `MSME Ingestion completed: ${result.inserted} inserted, ${result.skipped} skipped, ${result.errors} errors.`,
      ...result
    });
  } catch (err) {
    console.error('Error importing MSME CSV:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to process MSME CSV'
    });
  } finally {
    if (isTemp && targetPath && fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
      } catch (e) {}
    }
  }
});

/**
 * POST /api/discovery/preview
 * Quick preview first 5 rows and filter matching statistics
 */
router.post('/preview', upload.single('file'), async (req, res) => {
  let targetPath = null;
  let isTemp = false;

  try {
    const type = req.query.type || 'mca';

    if (req.file) {
      targetPath = req.file.path;
      isTemp = true;
    } else if (req.body && req.body.csvPath) {
      targetPath = path.resolve(req.body.csvPath);
      if (!fs.existsSync(targetPath)) {
        return res.status(400).json({ error: `File not found at: ${req.body.csvPath}` });
      }
    } else {
      return res.status(400).json({ error: 'Please upload a CSV file or provide csvPath' });
    }

    const preview = await previewCsv(targetPath, type, 5);
    return res.json({
      success: true,
      type,
      ...preview
    });
  } catch (err) {
    console.error('Error previewing CSV:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to preview CSV'
    });
  } finally {
    if (isTemp && targetPath && fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
      } catch (e) {}
    }
  }
});

/**
 * GET /api/discovery/jobs
 * Returns last 20 import jobs with source, status, counts, created_at
 */
router.get('/jobs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const jobs = getDiscoveryJobs(limit);
    return res.json({ success: true, jobs });
  } catch (err) {
    console.error('Error fetching discovery jobs:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/discovery/stats
 * Returns { total_mca_imported, total_msme_imported, last_run }
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getDiscoveryStats();
    return res.json({ success: true, stats });
  } catch (err) {
    console.error('Error fetching discovery stats:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
