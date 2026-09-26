/**
 * Collabsight AV CRM - Express Server Entry Point
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { seedDatabase } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Auto-seed check on boot (ensures 45 curated leads are loaded)
seedDatabase(false);

// API Routes
app.use('/api/leads', require('./routes/leads'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/export', require('./routes/export'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    company: 'Collabsight Technologies Pvt Ltd',
    service: 'AV CRM Web API',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if present
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Collabsight AV CRM Backend API is active. Start Vite frontend on http://localhost:5173');
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Collabsight AV CRM Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`=======================================================`);
});
