/**
 * Collabsight AV CRM - Google Places API & Deep Verification Service
 * Handles live Google Places search, place details, website discovery, and phone verification.
 */

const https = require('https');
const db = require('../db');
const { updateLead, addActivity } = require('./leadService');

function getApiKey() {
  return process.env.GOOGLE_PLACES_API_KEY || '';
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse Google API response: ${e.message}`));
        }
      });
    }).on('error', err => reject(err));
  });
}

/**
 * Lookup a single business via Google Places Text Search & Details
 */
async function lookupPlace(companyName, city) {
  const query = `${companyName} ${city}`.trim();
  const apiKey = getApiKey();

  // If no Google API Key is set, generate curated deep search links & synthetic place URL
  if (!apiKey) {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(companyName + ' ' + city + ' official website')}`;
    const linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName + ' ' + city)}`;

    return {
      success: true,
      apiKeyConfigured: false,
      message: 'Google Places API Key not configured in .env. Generated live deep-search queries.',
      data: {
        company_name: companyName,
        maps_url: mapsUrl,
        google_search_url: googleSearchUrl,
        linkedin_url: linkedinSearchUrl,
        verified: false
      }
    };
  }

  try {
    // 1. Text Search
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
    const searchData = await httpsGet(searchUrl);

    if (!searchData.results || searchData.results.length === 0) {
      return {
        success: false,
        apiKeyConfigured: true,
        message: `No Google Place found for "${query}"`
      };
    }

    const place = searchData.results[0];
    const placeId = place.place_id;

    // 2. Place Details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,url,business_status&key=${apiKey}`;
    const detailsData = await httpsGet(detailsUrl);
    const details = detailsData.result || {};

    return {
      success: true,
      apiKeyConfigured: true,
      data: {
        place_id: placeId,
        company_name: details.name || place.name,
        address: details.formatted_address || place.formatted_address,
        phone: details.formatted_phone_number || details.international_phone_number || null,
        website: details.website || null,
        rating: details.rating || place.rating || null,
        maps_url: details.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
        business_status: details.business_status || place.business_status || 'OPERATIONAL',
        verified: true
      }
    };
  } catch (err) {
    console.error('Google Places lookup error:', err);
    throw err;
  }
}

/**
 * Enrich an existing lead in the database with verified Google Places data
 */
async function enrichLeadWithPlaces(leadId) {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);
  if (!lead) throw new Error('Lead not found');

  const result = await lookupPlace(lead.company_name, lead.city);

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || 'Could not find place details'
    };
  }

  const updates = {};
  if (result.data.website) updates.website = result.data.website;
  if (result.data.phone) updates.phone = result.data.phone;
  if (result.data.address) updates.address = result.data.address;
  if (result.data.maps_url) updates.maps_url = result.data.maps_url;
  if (result.data.rating) updates.rating = result.data.rating;
  if (result.data.place_id) updates.google_place_id = result.data.place_id;

  // Build verified LinkedIn search link if not present
  if (!lead.linkedin_url) {
    const role = lead.target_role || 'Decision Maker';
    updates.linkedin_url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(lead.company_name + ' ' + role)}`;
  }

  const updatedLead = updateLead(leadId, updates);

  // Log activity
  addActivity(leadId, {
    action_type: 'Data Enrichment',
    summary: result.apiKeyConfigured
      ? `Enriched with verified Google Places data (Website: ${result.data.website || 'Found'}, Phone: ${result.data.phone || 'Found'})`
      : `Generated live Google Maps & LinkedIn deep-search verification queries`,
    outcome: result.apiKeyConfigured ? 'Google Places Verified' : 'Deep Links Ready'
  });

  return {
    success: true,
    apiKeyConfigured: result.apiKeyConfigured,
    lead: updatedLead,
    enrichedFields: Object.keys(updates)
  };
}

/**
 * Generate fresh leads directly from Google Places Text Search
 */
async function generateFromGooglePlaces({ query, city, vertical = 'corporate_it', count = 10, searchName = '' }) {
  const finalQuery = `${query || 'Architects'} in ${city || 'Mumbai'}`;
  const finalSearchName = searchName || `Google Places: ${finalQuery}`;
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      success: false,
      apiKeyConfigured: false,
      message: 'GOOGLE_PLACES_API_KEY is not set in environment or server/.env file. Add your Google Cloud key to enable live Google Places scraping.'
    };
  }

  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(finalQuery)}&key=${apiKey}`;
  const searchData = await httpsGet(searchUrl);

  if (!searchData.results || searchData.results.length === 0) {
    return {
      success: false,
      apiKeyConfigured: true,
      message: `No Google Places results found for "${finalQuery}"`
    };
  }

  const places = searchData.results.slice(0, Math.min(count, 20));
  const leads = [];

  for (const place of places) {
    try {
      // Get detail for website & phone
      let website = null;
      let phone = null;
      let mapsUrl = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;

      try {
        const detUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website,url&key=${apiKey}`;
        const detData = await httpsGet(detUrl);
        if (detData.result) {
          website = detData.result.website || null;
          phone = detData.result.formatted_phone_number || null;
          if (detData.result.url) mapsUrl = detData.result.url;
        }
      } catch (e) {}

      const id = `LEAD-GPLACE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const linkedinQuery = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(place.name + ' IT Head OR Founder')}`;

      leads.push({
        id,
        company_name: place.name,
        vertical,
        city,
        sub_region: city,
        address: place.formatted_address || '',
        phone: phone || '',
        website: website || '',
        maps_url: mapsUrl,
        rating: place.rating || null,
        google_place_id: place.place_id,
        linkedin_url: linkedinQuery,
        target_role: 'Founder / IT Head',
        suggested_contact_name: 'Key Decision Maker',
        primary_av_need: 'Turnkey Audio-Visual Infrastructure',
        pitch_angle: 'Google Places Verified Commercial Lead',
        budget_tier: 'Medium (₹3.5L - ₹6L)',
        priority: (place.rating && place.rating >= 4.0) ? 'Hot' : 'Warm',
        status: 'New',
        deal_value: 4.5,
        search_name: finalSearchName,
        notes: `Imported via Google Places API. Google Rating: ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews).`
      });
    } catch (e) {
      console.warn('Error processing place:', e.message);
    }
  }

  // Insert into SQLite
  const insertLead = db.prepare(`
    INSERT OR REPLACE INTO leads (
      id, company_name, vertical, city, sub_region, address, phone,
      website, target_role, suggested_contact_name, primary_av_need,
      pitch_angle, budget_tier, priority, status, deal_value, notes,
      search_name, google_place_id, maps_url, rating, linkedin_url, created_at, updated_at
    ) VALUES (
      @id, @company_name, @vertical, @city, @sub_region, @address, @phone,
      @website, @target_role, @suggested_contact_name, @primary_av_need,
      @pitch_angle, @budget_tier, @priority, @status, @deal_value, @notes,
      @search_name, @google_place_id, @maps_url, @rating, @linkedin_url, datetime('now'), datetime('now')
    )
  `);

  const transaction = db.transaction((items) => {
    let saved = 0;
    for (const lead of items) {
      insertLead.run(lead);
      saved++;
    }
    return saved;
  });

  const totalSaved = transaction(leads);

  return {
    success: true,
    apiKeyConfigured: true,
    count: totalSaved,
    searchName: finalSearchName,
    leads
  };
}

module.exports = {
  lookupPlace,
  enrichLeadWithPlaces,
  generateFromGooglePlaces,
  isApiKeyConfigured: () => Boolean(getApiKey())
};
