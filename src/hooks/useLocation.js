import { useState, useCallback, useRef } from 'react';
import { LANG_TO_CC, COUNTRIES } from '../data/countries.js';

const MAX_GEOCODE_ATTEMPTS = 3;
const RETRY_DELAY_MS       = 2000;  // 2 s between attempts

export function useLocation() {
  const [lat,        setLat]        = useState(null);
  const [lng,        setLng]        = useState(null);
  const [city,       setCity]       = useState('');
  const [country,    setCountry]    = useState('DEFAULT');
  const [geocodeErr, setGeocodeErr] = useState(false);   // all retries exhausted
  const [locStatus,  setLocStatus]  = useState('idle');

  const requested    = useRef(false);
  const geocoding    = useRef(false);  // concurrency guard — only one call at a time
  const geocodeAttempts = useRef(0);
  const lastLatRef   = useRef(null);

  // ── Core geocode call — one attempt ──────────────────────────────────────
  const _doGeocode = async (la, lo) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${la}&lon=${lo}&format=json&zoom=14`;
    console.log(`[FixIt] geocode attempt ${geocodeAttempts.current}/${MAX_GEOCODE_ATTEMPTS} url=${url}`);

    let r;
    try {
      r = await fetch(url, {
        headers: { 'Accept-Language': 'en,local' },
        signal:  AbortSignal.timeout(10000),  // 10 s hard limit per attempt
      });
    } catch (err) {
      // Network / CORS / timeout
      console.warn(`[FixIt] geocode network error: ${err.name} ${err.message}`);
      throw new Error(`network:${err.name}`);
    }

    if (!r.ok) {
      let body = '';
      try { body = await r.text(); } catch (_) {}
      console.warn(`[FixIt] Nominatim HTTP ${r.status} body="${body.slice(0, 200)}"`);
      throw new Error(`http:${r.status}`);
    }

    const d = await r.json();
    const a = d.address || {};
    console.log(`[FixIt] REVERSE_GEOCODE city=${a.city||''} town=${a.town||''} village=${a.village||''} country_code=${a.country_code||''}`);

    const ct =
      a.town         ||
      a.village      ||
      a.suburb       ||
      a.city         ||
      a.municipality ||
      a.county       || '';
    const c2 = (a.country_code || '').toUpperCase();

    console.log(`[FixIt] DISPLAY_LOCATION selected="${ct}" country=${c2} → setCountry(${COUNTRIES[c2] ? c2 : 'DEFAULT'})`);
    setCity(ct);
    setCountry(COUNTRIES[c2] ? c2 : 'DEFAULT');
    setGeocodeErr(false);
    lastLatRef.current = [la, lo];
    geocodeAttempts.current = 0;  // reset on success
  };

  // ── Retry loop — up to MAX_GEOCODE_ATTEMPTS with delay ───────────────────
  const resolveCountry = useCallback(async (la, lo) => {
    if (geocoding.current) {
      console.log('[FixIt] resolveCountry: already in progress, skipping');
      return;
    }
    if (geocodeAttempts.current >= MAX_GEOCODE_ATTEMPTS) {
      console.warn('[FixIt] resolveCountry: max attempts reached');
      return;
    }

    geocoding.current = true;
    try {
      geocodeAttempts.current += 1;
      await _doGeocode(la, lo);
    } catch (err) {
      console.warn(`[FixIt] geocode attempt ${geocodeAttempts.current} failed: ${err.message}`);
      if (geocodeAttempts.current < MAX_GEOCODE_ATTEMPTS) {
        console.log(`[FixIt] retrying geocode in ${RETRY_DELAY_MS}ms…`);
        setTimeout(() => {
          geocoding.current = false;   // release guard before retry
          resolveCountry(la, lo);
        }, RETRY_DELAY_MS);
        return;                        // don't release guard yet — retry pending
      } else {
        console.error('[FixIt] geocode: all attempts exhausted — showing error state');
        setGeocodeErr(true);
      }
    } finally {
      // Only release the guard when we are NOT scheduling a retry
      if (geocodeAttempts.current >= MAX_GEOCODE_ATTEMPTS || !geocoding.current) {
        geocoding.current = false;
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GPS request ───────────────────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (requested.current) {
      // GPS was already requested. If country is still DEFAULT, the geocode
      // may have failed — allow a retry by resetting the attempt counter.
      if (lat && lng && country === 'DEFAULT') {
        console.log(`[FixIt] requestLocation: GPS done, retrying geocode lat=${lat} lng=${lng}`);
        geocodeAttempts.current = 0;
        resolveCountry(lat, lng);
      } else {
        console.log(`[FixIt] requestLocation: already requested, country=${country}`);
      }
      return;
    }
    requested.current = true;
    if (!navigator.geolocation) { setLocStatus('denied'); return; }
    setLocStatus('loading');
    console.log('[FixIt] requestLocation: starting GPS');

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const la = parseFloat(pos.coords.latitude.toFixed(6));
        const lo = parseFloat(pos.coords.longitude.toFixed(6));
        console.log(`[FixIt] GPS success lat=${la} lng=${lo}`);
        setLat(la); setLng(lo); setLocStatus('ok');

        const prevLa = lastLatRef.current?.[0];
        const prevLo = lastLatRef.current?.[1];
        const moved  = !prevLa || Math.abs(la - prevLa) > 0.005 || Math.abs(lo - prevLo) > 0.005;
        if (!moved) {
          console.log(`[FixIt] GPS: position unchanged, skipping geocode (country=${country})`);
          return;
        }
        geocodeAttempts.current = 0;
        await resolveCountry(la, lo);
      },
      err => {
        console.warn('[FixIt] GPS denied/error:', err.code, err.message);
        setLocStatus('denied');
        requested.current = false;
      },
      { timeout: 12000, maximumAge: 0, enableHighAccuracy: true }
    );
  }, [lat, lng, country, resolveCountry]);

  // ── Public helper for Emergency screen ───────────────────────────────────
  // Call from a useEffect — never from inside a render body.
  // Resets attempt counter so a manual retry always gets a fresh 3 attempts.
  const resolveCountryIfNeeded = useCallback(() => {
    if (country !== 'DEFAULT') return;       // already resolved — nothing to do
    console.log(`[FixIt] resolveCountryIfNeeded: country=DEFAULT lat=${lat} lng=${lng}`);
    geocodeAttempts.current = 0;             // fresh attempt budget
    setGeocodeErr(false);
    if (!lat || !lng) {
      requestLocation();                     // GPS not yet started
    } else {
      resolveCountry(lat, lng);             // GPS done, geocode failed — retry
    }
  }, [country, lat, lng, requestLocation, resolveCountry]);

  const getCC = useCallback(lang => {
    if (country && country !== 'DEFAULT') return country;
    const g = LANG_TO_CC[lang];
    return (g && COUNTRIES[g]) ? g : 'DEFAULT';
  }, [country]);

  return {
    lat, lng, city, country, geocodeErr,
    locStatus, requestLocation, resolveCountryIfNeeded, getCC,
  };
}
