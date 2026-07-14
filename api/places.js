// api/places.js — HTTP handler for direct /api/places testing
// Core logic is in places-lib.js (shared with nearby.js)
const { fetchPlacesForCategory } = require('./places-lib.js');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET')     { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { cat = 'garage', lat, lng, radius = '30000', city = '' } = req.query;
  const latN    = parseFloat(lat);
  const lngN    = parseFloat(lng);

  if (isNaN(latN) || isNaN(lngN)) {
    return res.status(400).json({ error: 'Invalid lat/lng' });
  }

  const { fetchPlacesForCategory: fp, GOOGLE_KEY } = require('./places-lib.js');
  if (!GOOGLE_KEY) {
    return res.status(200).json({
      configured: false, results: [],
      message: 'Add GOOGLE_MAPS_API_KEY to Vercel environment variables.',
    });
  }

  const result = await fetchPlacesForCategory(cat, latN, lngN, parseInt(radius) || 30000, city);
  res.status(200).json(result);
};
