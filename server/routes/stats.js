/**
 * Collabsight AV CRM - Analytics & Statistics Controller
 */

const express = require('express');
const router = express.Router();
const leadService = require('../services/leadService');

router.get('/', (req, res) => {
  try {
    const stats = leadService.getStats();
    res.json(stats);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to compute analytics', details: err.message });
  }
});

module.exports = router;
