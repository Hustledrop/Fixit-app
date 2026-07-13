import { useState, useCallback, useRef } from 'react';
import { LANG_TO_CC, COUNTRIES } from '../data/countries.js';

export function useLocation() {
  const [lat, setLat]         = useState(null);
  const [lng, setLng]         = useState(null);
  const [city, setCity]       = useState('');
  const [country, setCountry] = useState('DEFAULT');
  const [locStatus, setLocStatus] = useState('idle');
  const requested  = useRef(false);
  const lastLatRef = useRef(null); // track last geocoded position

  const requestLocation = useCallback(() => {
    if (requested.current) return;
    requested.current = true;
    if (!navigator.geolocation) { setLocStatus('denied'); return; }
    setLocStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const la = parseFloat(pos.coords.latitude.toFixed(6));
        const lo = parseFloat(pos.coords.longitude.toFixed(6));
        setLat(la); setLng(lo); setLocStatus('ok');

        // Only re-geocode if position changed meaningfully (>500m diff)
        const prevLa = lastLatRef.current?.[0];
        const prevLo = lastLatRef.current?.[1];
        const moved  = !prevLa || Math.abs(la - prevLa) > 0.005 || Math.abs(lo - prevLo) > 0.005;

        if (!moved) return; // use cached city — position hasn't changed
        lastLatRef.current = [la, lo];

        console.log(`[FixIt] GPS lat=${la} lng=${lo}`);
        try {
          // Request local language names for best place name matching
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${la}&lon=${lo}&format=json&zoom=14`,
            { headers: { 'Accept-Language': 'en,local' } }
          );
          const d = await r.json();
          const a = d.address || {};

          // Log all relevant fields for debugging
          console.log(`[FixIt] REVERSE_GEOCODE city=${a.city||''} town=${a.town||''} village=${a.village||''} municipality=${a.municipality||''} suburb=${a.suburb||''} county=${a.county||''}`);

          // Priority order: town → village → suburb → city → municipality → county
          // 
          // WHY this order:
          // - "city" in Nominatim often returns the administrative capital or region capital
          //   (e.g. for Veles, MK: city="Skopje" because it's in the Skopje statistical region)
          // - "town" returns the actual settlement name (e.g. "Veles")
          // - "village" returns the actual village for rural locations
          // - We fall back to "city" only when town/village are absent (large cities)
          const ct =
            a.town         ||   // exact settlement — most reliable for towns/small cities
            a.village      ||   // rural settlements
            a.suburb       ||   // urban district within a large city (correct for city quarters)
            a.city         ||   // large city (or wrong regional capital — accept only as fallback)
            a.municipality ||   // admin unit name
            a.county       ||   // region
            '';

          const c2 = (a.country_code || '').toUpperCase();
          console.log(`[FixIt] DISPLAY_LOCATION selected="${ct}" country=${c2}`);
          setCity(ct);
          setCountry(COUNTRIES[c2] ? c2 : 'DEFAULT');
        } catch (err) {
          console.warn('[FixIt] Geocode failed:', err.message);
          // GPS ok, geocode failed — keep DEFAULT country
        }
      },
      () => { setLocStatus('denied'); requested.current = false; },
      {
        timeout: 12000,
        // maximumAge: 0 forces a fresh position every time — prevents stale Skopje position
        // when the device was previously in a different city.
        maximumAge: 0,
        enableHighAccuracy: true,  // more accurate position on mobile
      }
    );
  }, []);

  // Return best country code: GPS country → lang fallback → DEFAULT
  const getCC = useCallback((lang) => {
    if (country && country !== 'DEFAULT') return country;
    const g = LANG_TO_CC[lang];
    return (g && COUNTRIES[g]) ? g : 'DEFAULT';
  }, [country]);

  return { lat, lng, city, country, locStatus, requestLocation, getCC };
}
