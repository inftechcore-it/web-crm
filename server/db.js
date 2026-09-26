const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'crm.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency & performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      vertical TEXT NOT NULL,
      city TEXT NOT NULL,
      sub_region TEXT,
      address TEXT,
      phone TEXT,
      website TEXT,
      target_role TEXT,
      suggested_contact_name TEXT,
      primary_av_need TEXT,
      pitch_angle TEXT,
      budget_tier TEXT,
      priority TEXT DEFAULT 'Warm',
      status TEXT DEFAULT 'New',
      deal_value REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      summary TEXT NOT NULL,
      outcome TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS generation_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      region TEXT,
      vertical TEXT,
      leads_added INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
    CREATE INDEX IF NOT EXISTS idx_leads_vertical ON leads(vertical);
    CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_activities_lead ON activities(lead_id);
  `);

  // Safe schema migrations for new enrichment fields
  const leadCols = db.prepare("PRAGMA table_info(leads)").all();
  const colNames = leadCols.map(c => c.name);

  if (!colNames.includes('search_name')) {
    db.exec(`ALTER TABLE leads ADD COLUMN search_name TEXT;`);
  }
  if (!colNames.includes('email')) {
    db.exec(`ALTER TABLE leads ADD COLUMN email TEXT;`);
  }
  if (!colNames.includes('linkedin_url')) {
    db.exec(`ALTER TABLE leads ADD COLUMN linkedin_url TEXT;`);
  }
  if (!colNames.includes('google_place_id')) {
    db.exec(`ALTER TABLE leads ADD COLUMN google_place_id TEXT;`);
  }
  if (!colNames.includes('maps_url')) {
    db.exec(`ALTER TABLE leads ADD COLUMN maps_url TEXT;`);
  }
  if (!colNames.includes('rating')) {
    db.exec(`ALTER TABLE leads ADD COLUMN rating REAL;`);
  }

  db.exec(`CREATE INDEX IF NOT EXISTS idx_leads_search_name ON leads(search_name);`);

  console.log('SQL Database initialized successfully at:', dbPath);
}

initDb();

module.exports = db;
