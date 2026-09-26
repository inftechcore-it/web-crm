const db = require('./db');
const fs = require('fs');
const path = require('path');

function parseBudgetTierToValue(tier) {
  if (!tier) return 3.5;
  const str = tier.toLowerCase();
  if (str.includes('12l') || str.includes('25l') || str.includes('enterprise')) return 18.0;
  if (str.includes('6l') || str.includes('10l')) return 8.0;
  if (str.includes('5l') || str.includes('8l')) return 6.5;
  if (str.includes('2.5l') || str.includes('4.5l') || str.includes('medium')) return 3.5;
  if (str.includes('1l') || str.includes('2.5l') || str.includes('entry')) return 1.8;
  return 3.0;
}

function seedDatabase(force = false) {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM leads').get();
  if (countRow.count > 0 && !force) {
    console.log(`Database already contains ${countRow.count} leads. Skipping seed.`);
    return countRow.count;
  }

  if (force) {
    db.prepare('DELETE FROM activities').run();
    db.prepare('DELETE FROM leads').run();
    db.prepare('DELETE FROM generation_jobs').run();
    console.log('Cleared existing database tables for fresh seed.');
  }

  let leadsData = [];
  const seedFile = path.resolve(__dirname, 'seed_leads.json');
  if (fs.existsSync(seedFile)) {
    leadsData = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));
  }

  const insertLead = db.prepare(`
    INSERT INTO leads (
      id, company_name, vertical, city, sub_region, address, phone,
      website, target_role, suggested_contact_name, primary_av_need,
      pitch_angle, budget_tier, priority, status, deal_value, notes, search_name, created_at, updated_at
    ) VALUES (
      @id, @company_name, @vertical, @city, @sub_region, @address, @phone,
      @website, @target_role, @suggested_contact_name, @primary_av_need,
      @pitch_angle, @budget_tier, @priority, @status, @deal_value, @notes, @search_name,
      datetime('now', @created_offset), datetime('now')
    )
  `);

  const insertActivity = db.prepare(`
    INSERT INTO activities (lead_id, action_type, summary, outcome, created_at)
    VALUES (?, ?, ?, ?, datetime('now', ?))
  `);

  const insertJob = db.prepare(`
    INSERT INTO generation_jobs (source, region, vertical, leads_added, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);

  const transaction = db.transaction((leads) => {
    let inserted = 0;
    leads.forEach((lead, index) => {
      const dealValue = parseBudgetTierToValue(lead.budget_tier);
      // Give varied realistic statuses for a rich initial pipeline view
      let status = lead.status || 'New';
      if (index === 0) status = 'Meeting Fixed';
      else if (index === 1) status = 'Contacted';
      else if (index === 2) status = 'Proposal Sent';
      else if (index === 6) status = 'Won';
      else if (index === 10) status = 'Contacted';
      else if (index === 15) status = 'Proposal Sent';

      const offsetDays = `-${(index % 14)} days`;

      insertLead.run({
        id: lead.lead_id || `LEAD-${Date.now()}-${index}`,
        company_name: lead.company_name,
        vertical: lead.vertical,
        city: lead.city,
        sub_region: lead.sub_region || lead.city,
        address: lead.address || `${lead.sub_region || ''}, ${lead.city}, Maharashtra`,
        phone: lead.phone || '+91 22 2000 0000',
        website: lead.website || '',
        target_role: lead.target_role || 'IT Admin / Infrastructure Head',
        suggested_contact_name: lead.suggested_contact_name || 'Business Owner',
        primary_av_need: lead.primary_av_need || 'Video Conferencing & Interactive Displays',
        pitch_angle: lead.pitch_angle || 'Turnkey AV supply and local support SLA.',
        budget_tier: lead.budget_tier || 'Medium (₹2.5L - ₹4.5L)',
        priority: lead.priority || 'Warm',
        status: status,
        deal_value: dealValue,
        notes: `High prospective AV client in ${lead.city}. Identified for ${lead.primary_av_need}.`,
        created_offset: offsetDays
      });
      inserted++;
    });

    // Seed sample activities for realistic CRM history
    insertActivity.run('LEAD-CORP-001', 'Meeting', 'Site audit of 2 conference rooms in Wagle Estate conducted by Collabsight technical team.', 'Client requested quote for dual 75" display + Teams Bar setup.', '-2 days');
    insertActivity.run('LEAD-CORP-001', 'Email', 'Shared commercial proposal and hardware spec sheet (Logitech Rally Plus + Shure mic array).', 'Proposal delivered to Ramesh Kulkarni.', '-1 days');
    insertActivity.run('LEAD-CORP-002', 'Call', 'Initial discovery call with Vikas Patil regarding Kalyan office setup.', 'Positive interest; requested WhatsApp catalog.', '-3 days');
    insertActivity.run('LEAD-CORP-002', 'WhatsApp', 'Sent Collabsight AV portfolio and pricing tiers.', 'Delivered and read.', '-2 days');
    insertActivity.run('LEAD-CORP-003', 'Call', 'Spoke to IT admin team about Mahape MBP facility boardroom acoustic challenges.', 'Scheduled demo for next Tuesday.', '-4 days');

    insertJob.run('Curated_Seed', 'Mumbai MMR & Tier 2-3', 'All Verticals', inserted);
    return inserted;
  });

  const total = transaction(leadsData);
  console.log(`Successfully seeded ${total} leads into SQLite database.`);
  return total;
}

if (require.main === module) {
  seedDatabase(true);
}

module.exports = { seedDatabase };
