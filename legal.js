// ─── LEGAL CONFIGURATION ─────────────────────────────────────────────────────
// Fill in the required fields before public release.
// The build will warn (and in CI can be set to fail) if required fields are missing.
//
// REQUIRED BEFORE RELEASE:
//   legalName    — registered company name or sole trader full name (§ 5 TMG)
//   postalAddress — full postal address including country (§ 5 TMG)
//
// OPTIONAL:
//   vatId        — USt-IdNr. (leave empty string to hide from all legal pages)
//
// EMAILS (already configured to fixit-app.com defaults):
//   supportEmail — user-facing support contact
//   privacyEmail — GDPR / data-rights contact

export const LEGAL = {
  // ── REQUIRED — fill in before release ─────────────────────────────────────
  legalName:    '',        // e.g. 'Max Mustermann' or 'FixIt UG (haftungsbeschränkt)'
  postalAddress:'',        // e.g. 'Musterstraße 1, 12345 Musterstadt, Deutschland'

  // ── OPTIONAL ──────────────────────────────────────────────────────────────
  vatId:        '',        // USt-IdNr. e.g. 'DE123456789' — leave empty to hide entirely

  // ── CONTACT ───────────────────────────────────────────────────────────────
  supportEmail: 'support@fixit-app.com',
  privacyEmail: 'support@fixit-app.com',

  // ── APP URL ────────────────────────────────────────────────────────────────
  appUrl:       'https://www.fixit-app.com',
};

// ── Build-time validation ──────────────────────────────────────────────────────
const REQUIRED_FIELDS = ['legalName', 'postalAddress', 'supportEmail', 'privacyEmail'];
const missingFields   = REQUIRED_FIELDS.filter(k => !LEGAL[k] || LEGAL[k].trim() === '');
if (missingFields.length > 0) {
  // Change console.warn to `throw new Error(...)` in CI to fail the build on missing config.
  console.warn(
    `[FixIt Legal] ⚠️  Required legal fields not yet configured:\n` +
    missingFields.map(k => `  • ${k}`).join('\n') +
    `\n  Please fill in src/config/legal.js before public release.`
  );
}

export default LEGAL;
