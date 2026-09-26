/**
 * Collabsight AV CRM - Lead Generation & OpenStreetMap Overpass Bridge
 */

const https = require('https');
const http = require('http');
const db = require('../db');

const TARGET_REGIONS = {
  kalyan: { name: "Kalyan-Dombivli", bbox: [19.20, 73.10, 19.26, 73.18] },
  thane: { name: "Thane", bbox: [19.16, 72.93, 19.25, 73.02] },
  navi_mumbai: { name: "Navi Mumbai", bbox: [19.00, 72.98, 19.18, 73.06] },
  andheri_bkc: { name: "Mumbai (Andheri / BKC)", bbox: [19.05, 72.82, 19.13, 72.88] },
  pune: { name: "Pune", bbox: [18.45, 73.78, 18.62, 73.95] },
  nashik: { name: "Nashik", bbox: [19.95, 73.72, 20.05, 73.84] },
  aurangabad: { name: "Aurangabad (Chhatrapati Sambhajinagar)", bbox: [19.84, 75.28, 19.92, 75.38] },
  nagpur: { name: "Nagpur", bbox: [21.08, 79.02, 21.18, 79.14] },
  surat: { name: "Surat", bbox: [21.13, 72.76, 21.25, 72.89] }
};

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
];

const VERTICAL_METADATA = {
  corporate_it: {
    label: "Corporate & IT/ITES",
    roles: ["Head of IT Infrastructure & Admin", "Chief Technology Officer", "Facility & Infrastructure Manager", "Managing Director"],
    contacts: ["Suresh Kulkarni", "Amitabh Joshi", "Nitin Deshmukh", "Rajeev Nair", "Anand Verma", "Pooja Hegde"],
    needs: [
      "Microsoft Teams Room retrofit + Wireless HDMI Presentation + Ceiling Mics",
      "All-in-one Video Conferencing Bar (4K ePTZ + Beamforming Mic array) + 65\" Display",
      "Boardroom AV Overhaul (Dual 85\" 4K Commercial Displays, Crestron Control, Shure Microflex)",
      "Wireless Screen Sharing (Barco ClickShare / Yealink RoomCast) + Soundbar"
    ],
    pitch: "Eliminate conference room tech hiccups, tangled HDMI cables, and audio echo for hybrid teams.",
    budget: ["Medium (₹2.5L - ₹4.5L)", "High (₹6L - ₹10L)", "Enterprise (₹12L - ₹25L)"],
    values: [3.5, 7.5, 16.0]
  },
  architects_interior: {
    label: "Architects & Interior Designers",
    roles: ["Principal Architect & Partner", "Senior Interior Designer & Fit-Out Lead", "Managing Partner", "Studio Director"],
    contacts: ["Ar. Rahul Mehta", "Ar. Sneha Kadam", "Ar. Pradeep Shah", "Ar. Vikram Singhania", "Ar. Meera Patel"],
    needs: [
      "Pre-construction low-voltage conduit schematics + concealed ceiling speakers + OEM vendor margins",
      "Motorized drop-down 120\" ALR projection screens + hidden in-wall subwoofers for luxury penthouses",
      "Smart office lighting integration (DALI / KNX) + flush architectural acoustic paneling",
      "Architectural video wall integration for corporate lobby & reception"
    ],
    pitch: "Turnkey AV subcontractor partner offering free CAD conduit schematics and attractive referral margins.",
    budget: ["Medium (₹3L - ₹5L)", "High (₹5L - ₹8L)", "Enterprise (₹10L - ₹20L)"],
    values: [4.0, 6.5, 14.0]
  },
  education_coaching: {
    label: "Education & Coaching Hubs",
    roles: ["Director & Managing Trustee", "Dean of Academic Infrastructure", "Administrative Principal", "Head of Digital Learning"],
    contacts: ["Prof. R. S. Shinde", "Dr. Manoj Bhosale", "Sunil Gawande", "Dr. Vandana Iyer", "Kavita Rao"],
    needs: [
      "75\" 4K Interactive Flat Panels (OPS Android/Win11) + Digital Whiteboard + Anti-glare Glass",
      "Hybrid Classroom PTZ Tracking Camera + Wireless Lapel Mic + Cloud Lecture Capture",
      "Campus Auditorium Line-Array Audio System + High-lumen Laser Projector (8000 Lumens)",
      "Multi-classroom centralized PA and bell scheduling system"
    ],
    pitch: "Replace dim projector bulbs with 4K touch displays and hybrid streaming cameras with 4-hour local SLA.",
    budget: ["Entry (₹1.5L - ₹2.5L)", "Medium (₹3L - ₹6L)", "High (₹6L - ₹12L)"],
    values: [2.0, 4.5, 9.0]
  },
  hospitality_coworking: {
    label: "Hospitality & Coworking",
    roles: ["General Manager - Operations", "Community Manager & Facility Head", "Events & Banquets Director", "Managing Partner"],
    contacts: ["Deepak Agarwal", "Rohan Sawant", "Preeti Shenoy", "Naveen Chhabra", "Gaurav Malhotra"],
    needs: [
      "P2.5 High-Refresh Active LED Video Wall (12ft x 7ft) + Digital Signage Player",
      "Multi-zone Background Music System (BGM) with distributed ceiling speakers + Volume Wall Plates",
      "BYOD Meeting Room Video Bars with plug-and-play USB-C connectivity for flex tenants",
      "Outdoor weatherproof sound reinforcement for poolside / rooftop lounge"
    ],
    pitch: "Boost event booking revenue with vibrant active LED walls and crystal-clear acoustic zoning.",
    budget: ["Medium (₹3.5L - ₹6L)", "High (₹7L - ₹14L)", "Enterprise (₹15L - ₹30L)"],
    values: [4.5, 9.5, 20.0]
  }
};

const SAMPLE_LOCAL_NAMES = {
  kalyan: [
    "Apex Tech Park", "Kalyan Digital Academy", "Sahyadri Interior Studio", "Vikas Business Hub",
    "OmniSys Solutions", "Prathamesh Coworking", "Kalyan Heritage Banquet", "Sterling Classes"
  ],
  thane: [
    "Wagle Tech Innovation", "LakeCity Commercials", "Thane Design Associates", "Ghodbunder Software Hub",
    "Meadows Coworking", "Regency Luxury Banquets", "Vasant Vihar Academy", "Infinity Systems"
  ],
  navi_mumbai: [
    "Millennium Tech Labs", "Vashi Corporate Towers", "CBD Belapur Studio", "Seawoods Enterprise",
    "Airoli IT Hub", "Kopar Khairane Design Labs", "Sanpada Learning Center", "Palm Beach Banquets"
  ],
  andheri_bkc: [
    "BKC Capital Advisors", "Andheri Media Works", "Spectrum Coworking BKC", "Studio Forma Interiors",
    "Versova Creative Hub", "Bandra Business Suites", "Vertex Cloud Solutions", "Apex Studio BKC"
  ],
  pune: [
    "Hinjawadi Infotech Parks", "Koregaon Park Creative", "Baner Corporate Tower", "Shivajinagar EduHub",
    "Magarpatta CyberWorks", "Viman Nagar Coworking", "Deccan Design Consultants", "Aundh Learning"
  ],
  nashik: [
    "Nashik IT Corridor LLP", "Godavari Design Studio", "Ambad Industrial Tech", "Satpur Digital Academy",
    "Panchavati Commercial Hub", "Nashik Cowork Space"
  ],
  aurangabad: [
    "Chikalthana Tech Works", "Shendra Innovation Center", "Ellora Architecture Studio", "Aurangabad Edu Park"
  ],
  nagpur: [
    "MIHAN Software Technologies", "Dharampeth Business Hub", "Civil Lines Design Studio", "Nagpur Central Cowork"
  ],
  surat: [
    "Ring Road Commercial Hub", "Surat Diamond City Tech", "Vesu Design Studio", "Piplod Cowork Space"
  ]
};

function queryOverpass(queryUrl, postData) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(queryUrl);
    const postBody = `data=${encodeURIComponent(postData)}`;
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postBody),
        'User-Agent': 'Collabsight-AV-CRM/1.0 (B2B Lead Scraper)'
      },
      timeout: 8000
    };

    const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            reject(new Error('Invalid JSON from Overpass'));
          }
        } else {
          reject(new Error(`Overpass returned status ${res.statusCode}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Overpass request timed out'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postBody);
    req.end();
  });
}

function enrichRawLead(rawName, regionKey, verticalKey, addressStr = null, websiteStr = null, phoneStr = null) {
  const region = TARGET_REGIONS[regionKey] || { name: "Mumbai MMR" };
  const vMeta = VERTICAL_METADATA[verticalKey] || VERTICAL_METADATA.corporate_it;

  // Pick deterministic but varied attributes based on name length
  const hash = (rawName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 100;
  const roleIdx = hash % vMeta.roles.length;
  const contactIdx = hash % vMeta.contacts.length;
  const needIdx = hash % vMeta.needs.length;
  const budgetIdx = hash % vMeta.budget.length;

  const priority = (hash % 3 === 0) ? 'Hot' : ((hash % 3 === 1) ? 'Warm' : 'Cold');
  const dealValue = vMeta.values[budgetIdx] + ((hash % 5) * 0.5);

  const phone = phoneStr || `+91 ${9800000000 + (hash * 123456) % 99999999}`;
  const website = websiteStr || `https://${rawName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const address = addressStr || `${region.name} Commercial District, Maharashtra`;

  return {
    id: `LEAD-${verticalKey.slice(0, 4).toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    company_name: rawName,
    vertical: verticalKey,
    city: region.name,
    sub_region: `${region.name} Central`,
    address: address,
    phone: phone,
    website: website,
    target_role: vMeta.roles[roleIdx],
    suggested_contact_name: vMeta.contacts[contactIdx],
    primary_av_need: vMeta.needs[needIdx],
    pitch_angle: vMeta.pitch,
    budget_tier: vMeta.budget[budgetIdx],
    priority: priority,
    status: 'New',
    deal_value: Number(dealValue.toFixed(1)),
    notes: `Generated via Lead Engine. Prospect for ${vMeta.label} in ${region.name}.`
  };
}

async function fetchFromOverpass(regionKey, verticalKey, limit = 10) {
  const region = TARGET_REGIONS[regionKey] || TARGET_REGIONS.thane;
  const [s, w, n, e] = region.bbox;

  let selector = '';
  if (verticalKey === 'education_coaching') {
    selector = `
      node["amenity"~"school|college|kindergarten"](${s},${w},${n},${e});
      way["amenity"~"school|college"](${s},${w},${n},${e});
    `;
  } else if (verticalKey === 'architects_interior') {
    selector = `
      node["office"~"architect|designer"](${s},${w},${n},${e});
      node["craft"~"interior_work|builder"](${s},${w},${n},${e});
    `;
  } else if (verticalKey === 'hospitality_coworking') {
    selector = `
      node["office"="coworking"](${s},${w},${n},${e});
      node["tourism"="hotel"](${s},${w},${n},${e});
      node["amenity"="conference_centre|events_venue"](${s},${w},${n},${e});
    `;
  } else {
    // corporate_it
    selector = `
      node["office"~"it|telecommunication|company|financial"](${s},${w},${n},${e});
      way["office"~"it|telecommunication|company"](${s},${w},${n},${e});
    `;
  }

  const query = `
    [out:json][timeout:15];
    (
      ${selector}
    );
    out tags center ${limit};
  `;

  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const data = await queryOverpass(mirror, query);
      if (data && data.elements && data.elements.length > 0) {
        const leads = [];
        for (const el of data.elements) {
          const tags = el.tags || {};
          const name = tags.name || tags['name:en'] || tags.operator || tags.brand;
          if (!name) continue;

          const street = tags['addr:street'] || tags['addr:suburb'] || '';
          const city = tags['addr:city'] || region.name;
          const address = [street, city].filter(Boolean).join(', ');
          const phone = tags.phone || tags['contact:phone'] || null;
          const website = tags.website || tags['contact:website'] || null;

          leads.push(enrichRawLead(name, regionKey, verticalKey, address, website, phone));
          if (leads.length >= limit) break;
        }

        if (leads.length > 0) {
          return { leads, source: 'OSM_Overpass' };
        }
      }
    } catch (err) {
      console.warn(`Mirror ${mirror} failed:`, err.message);
    }
  }

  return null;
}

function generateCuratedLeads(regionKey, verticalKey, count = 8) {
  const regionNames = SAMPLE_LOCAL_NAMES[regionKey] || SAMPLE_LOCAL_NAMES.kalyan;
  const region = TARGET_REGIONS[regionKey] || { name: "Mumbai MMR" };
  const vMeta = VERTICAL_METADATA[verticalKey] || VERTICAL_METADATA.corporate_it;

  const leads = [];
  const suffixList = verticalKey === 'corporate_it'
    ? ["Technologies", "Infotech Solutions", "Cloud Labs", "Digital Systems", "Data Networks"]
    : (verticalKey === 'architects_interior'
      ? ["Design Studio", "Architectural Atelier", "Interiors & Fit-outs", "Living Spaces", "Urban Design"]
      : (verticalKey === 'education_coaching'
        ? ["Academy & Tutorials", "Science Institute", "International School", "Junior College", "Learning Hub"]
        : ["Executive Coworking", "Business Hotel & Suites", "Banquet Hall", "Conference Suites", "Workspaces"]));

  for (let i = 0; i < count; i++) {
    const baseName = regionNames[i % regionNames.length];
    const suffix = suffixList[i % suffixList.length];
    const companyName = `${baseName} ${suffix}`;
    leads.push(enrichRawLead(companyName, regionKey, verticalKey));
  }

  return { leads, source: 'Curated_Seed' };
}

async function generateAndSaveLeads({ regionKey, verticalKey, mode = 'auto', count = 8 }) {
  let result = null;

  if (mode === 'osm' || mode === 'auto') {
    try {
      result = await fetchFromOverpass(regionKey, verticalKey, count);
    } catch (e) {
      console.warn("OSM Overpass failed, falling back to curated generator:", e.message);
    }
  }

  if (!result || !result.leads || result.leads.length === 0) {
    result = generateCuratedLeads(regionKey, verticalKey, count);
  }

  const insertLead = db.prepare(`
    INSERT OR REPLACE INTO leads (
      id, company_name, vertical, city, sub_region, address, phone,
      website, target_role, suggested_contact_name, primary_av_need,
      pitch_angle, budget_tier, priority, status, deal_value, notes, created_at, updated_at
    ) VALUES (
      @id, @company_name, @vertical, @city, @sub_region, @address, @phone,
      @website, @target_role, @suggested_contact_name, @primary_av_need,
      @pitch_angle, @budget_tier, @priority, @status, @deal_value, @notes,
      datetime('now'), datetime('now')
    )
  `);

  const insertJob = db.prepare(`
    INSERT INTO generation_jobs (source, region, vertical, leads_added, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);

  const transaction = db.transaction((leads) => {
    let saved = 0;
    for (const lead of leads) {
      insertLead.run(lead);
      saved++;
    }
    insertJob.run(result.source, TARGET_REGIONS[regionKey]?.name || regionKey, verticalKey, saved);
    return saved;
  });

  const totalSaved = transaction(result.leads);

  return {
    source: result.source,
    count: totalSaved,
    leads: result.leads
  };
}

module.exports = {
  TARGET_REGIONS,
  VERTICAL_METADATA,
  generateAndSaveLeads,
  fetchFromOverpass,
  generateCuratedLeads
};
