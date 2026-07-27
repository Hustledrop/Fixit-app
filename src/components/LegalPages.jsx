// src/components/LegalPages.jsx
// Self-contained Privacy Policy and Terms of Service for FixIt
// Last updated: July 2026 · Version 1.0
// Bilingual: lang='de' → German, otherwise English

const h1 = { fontSize:'1.45rem', fontWeight:900, color:'rgba(255,255,255,0.92)', marginBottom:6, marginTop:0, letterSpacing:'-0.02em' };
const h2 = { fontSize:'1.05rem', fontWeight:800, color:'rgba(255,255,255,0.85)', marginTop:32, marginBottom:8, paddingBottom:4, borderBottom:'1px solid rgba(255,255,255,0.08)' };
const h3 = { fontSize:'0.9rem', fontWeight:700, color:'rgba(255,255,255,0.78)', marginTop:18, marginBottom:4 };
const p  = { marginBottom:12, color:'rgba(255,255,255,0.65)' };
const ul = { paddingLeft:20, marginBottom:12, color:'rgba(255,255,255,0.65)' };
const li = { marginBottom:4 };
const warn = { background:'rgba(232,82,26,0.09)', border:'1px solid rgba(232,82,26,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:'0.82rem', color:'rgba(232,82,26,0.85)', lineHeight:1.6 };
const box  = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'10px 14px', marginBottom:12, fontSize:'0.82rem' };
const meta = { fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', marginBottom:24 };

// ── PLACEHOLDERS (owner must fill in before launch) ────────────────────────
const OWNER_NAME    = '[LEGAL NAME REQUIRED]';
const OWNER_ADDR    = '[POSTAL ADDRESS REQUIRED]';
const OWNER_EMAIL   = '[SUPPORT EMAIL REQUIRED]';
const PRIVACY_EMAIL = '[PRIVACY EMAIL REQUIRED]';
const VAT_ID        = '[VAT ID IF AVAILABLE]';
const APP_URL       = 'https://www.fixit-app.com';
const DOC_VERSION   = '1.0';
const DOC_DATE      = 'July 2026';

// ── Privacy Policy ─────────────────────────────────────────────────────────
export function PrivacyPage({ lang }) {
  const de = lang === 'de';
  return (
    <div>
      <h1 style={h1}>{de ? 'Datenschutzerklärung' : 'Privacy Policy'}</h1>
      <div style={meta}>Version {DOC_VERSION} · {DOC_DATE} · FixIt · {APP_URL}</div>

      {/* AI Transparency Notice — prominently at top per EU AI Act Art. 50 */}
      <div style={warn}>
        🤖 {de
          ? 'FixIt verwendet KI (Anthropic Claude), um Diagnosen und Reparaturanleitungen zu erstellen. KI-generierte Inhalte können Fehler enthalten. Überprüfen Sie kritische Informationen stets mit Fachleuten.'
          : 'FixIt uses AI (Anthropic Claude) to generate diagnoses and repair guidance. AI-generated content can contain errors. Always verify critical information with qualified professionals.'}
      </div>

      {/* 1. Controller */}
      <h2 style={h2}>{de ? '1. Verantwortlicher' : '1. Data Controller'}</h2>
      <div style={box}>
        <strong>{OWNER_NAME}</strong><br/>
        {OWNER_ADDR}<br/>
        {VAT_ID}<br/>
        {de ? 'Kontakt: ' : 'Contact: '}{OWNER_EMAIL}
      </div>
      <p style={p}>{de
        ? 'Für Fragen zum Datenschutz wenden Sie sich bitte an die oben genannte E-Mail-Adresse.'
        : 'For privacy questions, please contact us at the email address above.'}</p>

      {/* 2. Data collected */}
      <h2 style={h2}>{de ? '2. Welche Daten wir verarbeiten' : '2. Data We Process'}</h2>

      <h3 style={h3}>{de ? 'Kontodaten (bei Registrierung)' : 'Account data (on registration)'}</h3>
      <ul style={ul}>
        <li style={li}>{de ? 'E-Mail-Adresse (Pflichtfeld)' : 'Email address (required)'}</li>
        <li style={li}>{de ? 'Verschlüsseltes Passwort (gespeichert bei Supabase, niemals im Klartext)' : 'Hashed password (stored at Supabase, never in plain text)'}</li>
        <li style={li}>{de ? 'Nutzer-ID (systemgeneriert)' : 'User ID (system-generated)'}</li>
        <li style={li}>{de ? 'Abonnementstatus (Free / Monthly / Yearly)' : 'Subscription status (Free / Monthly / Yearly)'}</li>
        <li style={li}>{de ? 'Stripe-Kunden-ID (bei Zahlung)' : 'Stripe customer ID (on payment)'}</li>
      </ul>

      <h3 style={h3}>{de ? 'KI-Diagnosen (bei Nutzung der Funktion)' : 'AI diagnoses (when you use the feature)'}</h3>
      <ul style={ul}>
        <li style={li}>{de ? 'Von Ihnen eingegebener Problemtext' : 'Problem text you enter'}</li>
        <li style={li}>{de ? 'Optional: von Ihnen hochgeladene Fotos' : 'Optional: photos you upload'}</li>
        <li style={li}>{de ? 'Fahrzeugtyp / Kategorie (von Ihnen ausgewählt)' : 'Vehicle type / category (you select)'}</li>
        <li style={li}>{de ? 'KI-generierte Antwort' : 'AI-generated response'}</li>
        <li style={li}>{de ? 'Spracheinstellung' : 'Language setting'}</li>
      </ul>
      <div style={box}>
        ⚠️ {de
          ? 'Fotos und Prompts werden an Anthropic (USA) zur KI-Verarbeitung übertragen. Anthropic verarbeitet diese Daten gemäß seinen API-Nutzungsbedingungen. Wir empfehlen, keine persönlichen Informationen (Namen, Adressen, Ausweisnummern) in Diagnose-Texte einzugeben.'
          : 'Photos and prompts are transmitted to Anthropic (USA) for AI processing. Anthropic processes this data under its API terms. We recommend not entering personal information (names, addresses, ID numbers) in diagnosis texts.'}
      </div>

      <h3 style={h3}>{de ? 'Reparaturverlauf' : 'Repair history'}</h3>
      <p style={p}>{de
        ? 'Diagnosen werden lokal auf Ihrem Gerät (localStorage) gespeichert. Für angemeldete Nutzer kann der Verlauf mit dem Konto verknüpft sein.'
        : 'Diagnoses are stored locally on your device (localStorage). For logged-in users, history may be associated with your account.'}</p>

      <h3 style={h3}>{de ? 'Standort und GPS' : 'Location and GPS'}</h3>
      <ul style={ul}>
        <li style={li}>{de ? 'GPS-Koordinaten werden nur für die Nearby-Suche (Werkstätten, Teilehandel) verwendet' : 'GPS coordinates are used only for the Nearby search (workshops, parts shops)'}</li>
        <li style={li}>{de ? 'Koordinaten werden an Google Places API und OpenStreetMap Overpass API übertragen' : 'Coordinates are sent to Google Places API and OpenStreetMap Overpass API'}</li>
        <li style={li}>{de ? 'Wir speichern Ihren Standort nicht dauerhaft' : 'We do not permanently store your location'}</li>
      </ul>

      <h3 style={h3}>{de ? 'Zahlungsdaten' : 'Payment data'}</h3>
      <p style={p}>{de
        ? 'Zahlungen werden vollständig von Stripe (USA) abgewickelt. Wir speichern keine Zahlungskartendaten. Wir empfangen nur Bestätigungen (Abonnementstatus, Stripe-Kunden-ID) via Webhook.'
        : 'Payments are handled entirely by Stripe (USA). We do not store payment card data. We receive only confirmations (subscription status, Stripe customer ID) via webhook.'}</p>

      <h3 style={h3}>{de ? 'Server-Logs und IP-Adressen' : 'Server logs and IP addresses'}</h3>
      <p style={p}>{de
        ? 'Vercel (Hosting) und Supabase (Datenbank) verarbeiten IP-Adressen und Zugriffszeiten im Rahmen ihres Betriebs. Wir führen keine zusätzliche Protokollierung. Vercel speichert Logs für maximal 30 Tage.'
        : 'Vercel (hosting) and Supabase (database) process IP addresses and access times as part of their operations. We do not maintain additional logs. Vercel retains logs for a maximum of 30 days.'}</p>

      {/* 3. Legal bases */}
      <h2 style={h2}>{de ? '3. Rechtsgrundlagen' : '3. Legal Bases'}</h2>
      <ul style={ul}>
        <li style={li}><strong>{de ? 'Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO):' : 'Contract performance (Art. 6(1)(b) GDPR):'}</strong> {de ? 'Kontoverwaltung, Abonnement, KI-Diagnosen' : 'Account management, subscription, AI diagnoses'}</li>
        <li style={li}><strong>{de ? 'Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO):' : 'Legitimate interests (Art. 6(1)(f) GDPR):'}</strong> {de ? 'Sicherheit, Betrugsprävention, Serviceverbesserung' : 'Security, fraud prevention, service improvement'}</li>
        <li style={li}><strong>{de ? 'Gesetzliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO):' : 'Legal obligation (Art. 6(1)(c) GDPR):'}</strong> {de ? 'Aufbewahrung von Zahlungsnachweisen (§ 147 AO: 10 Jahre)' : 'Retention of payment records (§ 147 AO: 10 years)'}</li>
      </ul>

      {/* 4. Third-party providers */}
      <h2 style={h2}>{de ? '4. Drittanbieter' : '4. Third-Party Providers'}</h2>

      {[
        {
          name: 'Anthropic, Inc.',
          role: de ? 'KI-Verarbeitung (Claude API)' : 'AI processing (Claude API)',
          data: de ? 'Problemtext, Fotos, Spracheinstellung' : 'Problem text, photos, language setting',
          country: 'USA',
          mechanism: 'EU SCCs / Anthropic DPA',
          policy: 'https://www.anthropic.com/legal/privacy',
        },
        {
          name: 'Supabase, Inc.',
          role: de ? 'Datenbank und Authentifizierung' : 'Database and authentication',
          data: de ? 'E-Mail, Nutzer-ID, Abonnementstatus, Stripe-Kunden-ID' : 'Email, user ID, subscription status, Stripe customer ID',
          country: de ? 'Irland / EU (West EU — Ireland, kein Drittlandtransfer)' : 'Ireland / EU (West EU — Ireland, no third-country transfer)',
          mechanism: de ? 'Kein Drittlandtransfer erforderlich (EU-Hosting)' : 'No third-country transfer required (EU hosting)',
          policy: 'https://supabase.com/privacy',
        },
        {
          name: 'Stripe, Inc.',
          role: de ? 'Zahlungsabwicklung' : 'Payment processing',
          data: de ? 'E-Mail, Zahlungsdaten, Abonnementstatus' : 'Email, payment data, subscription status',
          country: 'USA',
          mechanism: 'EU SCCs / Stripe DPA',
          policy: 'https://stripe.com/de/privacy',
        },
        {
          name: 'Vercel, Inc.',
          role: de ? 'Hosting und Serverless-Funktionen' : 'Hosting and serverless functions',
          data: de ? 'IP-Adresse, Anfrage-Metadaten, Logs' : 'IP address, request metadata, logs',
          country: 'USA',
          mechanism: 'EU SCCs / Vercel DPA',
          policy: 'https://vercel.com/legal/privacy-policy',
        },
        {
          name: 'Google LLC',
          role: de ? 'Google Places API (Nearby-Suche)' : 'Google Places API (Nearby search)',
          data: de ? 'GPS-Koordinaten, Suchanfragen' : 'GPS coordinates, search queries',
          country: 'USA',
          mechanism: 'EU SCCs / Google Cloud DPA',
          policy: 'https://policies.google.com/privacy',
        },
        {
          name: 'OpenStreetMap / Overpass API',
          role: de ? 'Kartendaten für Nearby-Suche' : 'Map data for Nearby search',
          data: de ? 'GPS-Koordinaten' : 'GPS coordinates',
          country: de ? 'Deutschland / EU' : 'Germany / EU',
          mechanism: 'N/A (keine personenbezogenen Daten übertragen)',
          policy: 'https://wiki.openstreetmap.org/wiki/Privacy_Policy',
        },
      ].map(p2 => (
        <div key={p2.name} style={{...box, marginBottom:10}}>
          <strong style={{color:'rgba(255,255,255,0.85)'}}>{p2.name}</strong><br/>
          <span style={{color:'rgba(255,255,255,0.45)',fontSize:'0.78rem'}}>
            {de ? 'Funktion:' : 'Role:'} {p2.role}<br/>
            {de ? 'Daten:' : 'Data:'} {p2.data}<br/>
            {de ? 'Land:' : 'Country:'} {p2.country}<br/>
            {de ? 'Mechanismus:' : 'Transfer mechanism:'} {p2.mechanism}<br/>
            <a href={p2.policy} target="_blank" rel="noopener noreferrer" style={{color:'rgba(232,82,26,0.7)'}}>{de ? 'Datenschutzerklärung' : 'Privacy policy'}</a>
          </span>
        </div>
      ))}

      {/* 5. Local storage */}
      <h2 style={h2}>{de ? '5. Lokale Datenspeicherung' : '5. Local Storage'}</h2>
      <p style={p}>{de
        ? 'FixIt verwendet localStorage und sessionStorage ausschließlich für technisch notwendige Funktionen. Es werden keine Tracking-Cookies, Werbe-Cookies oder Analyse-Cookies eingesetzt.'
        : 'FixIt uses localStorage and sessionStorage only for strictly necessary functions. No tracking cookies, advertising cookies, or analytics cookies are used.'}</p>
      <div style={box}>
        <strong>{de ? 'Genutzte Schlüssel:' : 'Keys used:'}</strong><br/>
        <span style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.5)',lineHeight:1.8}}>
          <code>fixit_history</code> — {de ? 'Reparaturverlauf (lokal)' : 'Repair history (local)'}<br/>
          <code>fixit_lang</code> — {de ? 'Sprachauswahl' : 'Language preference'}<br/>
          <code>fixit_onboarding_done</code> — {de ? 'Onboarding-Status' : 'Onboarding status'}<br/>
          <code>fixit_free_diagnosis_used</code> — {de ? 'Freie Diagnose genutzt' : 'Free diagnosis used'}<br/>
          <code>fixit_user</code> — {de ? 'Lokale Nutzerdaten (Gästemodus)' : 'Local user data (guest mode)'}<br/>
          <code>supabase.auth.token</code> — {de ? 'Authentifizierungs-Session (Supabase)' : 'Auth session (Supabase)'}
        </span>
      </div>
      <p style={p}>{de
        ? 'Gemäß §25 TDDDG ist die Nutzung dieser Speicher technisch notwendig und erfordert keine Einwilligung.'
        : 'Under §25 TDDDG, this storage is strictly necessary and does not require consent.'}</p>

      {/* 6. Retention */}
      <h2 style={h2}>{de ? '6. Speicherdauer' : '6. Retention Periods'}</h2>
      <ul style={ul}>
        <li style={li}>{de ? 'Kontodaten: bis zur Löschung des Kontos' : 'Account data: until account deletion'}</li>
        <li style={li}>{de ? 'Reparaturverlauf (lokal): bis zur Gerätbereinigung oder Kontolöschung' : 'Repair history (local): until device clear or account deletion'}</li>
        <li style={li}>{de ? 'KI-Diagnosen / Fotos: von uns nicht dauerhaft gespeichert — Anthropic verarbeitet diese gemäß seinen eigenen API-Bedingungen (siehe Anthropic-Datenschutzerklärung)' : 'AI diagnoses / photos: not permanently stored by us — Anthropic processes these under its own API terms (see Anthropic privacy policy)'}</li>
        <li style={li}>{de ? 'Zahlungsnachweise: 10 Jahre (§ 147 AO)' : 'Payment records: 10 years (§ 147 AO)'}</li>
        <li style={li}>{de ? 'Server-Logs (Vercel): maximal 30 Tage' : 'Server logs (Vercel): maximum 30 days'}</li>
      </ul>

      {/* 7. Your rights */}
      <h2 style={h2}>{de ? '7. Ihre Rechte (DSGVO)' : '7. Your Rights (GDPR)'}</h2>
      <p style={p}>{de ? 'Sie haben folgende Rechte:' : 'You have the following rights:'}</p>
      <ul style={ul}>
        <li style={li}><strong>{de ? 'Auskunft (Art. 15):' : 'Access (Art. 15):'}</strong> {de ? 'Welche Daten wir über Sie haben' : 'What data we hold about you'}</li>
        <li style={li}><strong>{de ? 'Berichtigung (Art. 16):' : 'Rectification (Art. 16):'}</strong> {de ? 'Unrichtige Daten korrigieren lassen' : 'Correct inaccurate data'}</li>
        <li style={li}><strong>{de ? 'Löschung (Art. 17):' : 'Erasure (Art. 17):'}</strong> {de ? 'Löschung Ihrer Daten verlangen' : 'Request deletion of your data'}</li>
        <li style={li}><strong>{de ? 'Einschränkung (Art. 18):' : 'Restriction (Art. 18):'}</strong> {de ? 'Verarbeitung einschränken lassen' : 'Restrict processing'}</li>
        <li style={li}><strong>{de ? 'Datenübertragbarkeit (Art. 20):' : 'Portability (Art. 20):'}</strong> {de ? 'Ihre Daten in maschinenlesbarem Format erhalten' : 'Receive your data in a machine-readable format'}</li>
        <li style={li}><strong>{de ? 'Widerspruch (Art. 21):' : 'Object (Art. 21):'}</strong> {de ? 'Der Verarbeitung widersprechen' : 'Object to processing'}</li>
        <li style={li}><strong>{de ? 'Einwilligungswiderruf:' : 'Withdraw consent:'}</strong> {de ? 'Jederzeit widerrufbar, ohne Rückwirkung' : 'Withdraw at any time without retroactive effect'}</li>
        <li style={li}><strong>{de ? 'Beschwerde:' : 'Complaint:'}</strong> {de ? 'Sie können sich bei der zuständigen Aufsichtsbehörde beschweren. In Deutschland: Landesbeauftragte für Datenschutz (je nach Bundesland).' : 'You may lodge a complaint with your national supervisory authority.'}</li>
      </ul>
      <p style={p}>{de
        ? `Zur Ausübung Ihrer Rechte senden Sie eine E-Mail an: ${PRIVACY_EMAIL}`
        : `To exercise your rights, email: ${PRIVACY_EMAIL}`}</p>

      {/* 8. Account deletion */}
      <h2 style={h2}>{de ? '8. Kontolöschung' : '8. Account Deletion'}</h2>
      <p style={p}>{de
        ? 'Sie können Ihr Konto jederzeit löschen über Mein Konto → Konto löschen. Dabei werden gelöscht: Ihr Profil, Authentifizierungsdaten, lokal gespeicherter Verlauf. Zahlungsnachweise werden aus gesetzlichen Gründen 10 Jahre aufbewahrt. Aktive Abonnements sollten vor der Löschung über das Stripe-Kundenportal gekündigt werden.'
        : 'You can delete your account at any time via My Account → Delete account. This deletes: your profile, authentication data, locally stored history. Payment records are retained for 10 years for legal reasons. Active subscriptions should be cancelled via the Stripe customer portal before deletion.'}</p>

      {/* 9. Changes */}
      <h2 style={h2}>{de ? '9. Änderungen dieser Erklärung' : '9. Changes to This Policy'}</h2>
      <p style={p}>{de
        ? 'Wesentliche Änderungen werden mit ausreichend Vorlauf angekündigt. Die jeweils gültige Version ist im App-Konto-Bereich und auf der Website abrufbar.'
        : 'Material changes will be communicated with reasonable notice. The current version is always accessible in the app account section and on the website.'}</p>

      {/* Contact */}
      <h2 style={h2}>{de ? '10. Kontakt' : '10. Contact'}</h2>
      <div style={box}>
        {OWNER_NAME}<br/>{OWNER_ADDR}<br/>
        {de ? 'Datenschutz: ' : 'Privacy: '}{PRIVACY_EMAIL}<br/>
        {de ? 'Support: ' : 'Support: '}{OWNER_EMAIL}
      </div>
    </div>
  );
}

// ── Terms of Service ───────────────────────────────────────────────────────
export function TermsPage({ lang }) {
  const de = lang === 'de';
  return (
    <div>
      <h1 style={h1}>{de ? 'Nutzungsbedingungen' : 'Terms of Service'}</h1>
      <div style={meta}>Version {DOC_VERSION} · {DOC_DATE} · FixIt · {APP_URL}</div>

      {/* Safety warning — most prominent */}
      <div style={warn}>
        ⚠️ <strong>{de ? 'Wichtiger Sicherheitshinweis:' : 'Important safety notice:'}</strong> {de
          ? 'FixIt stellt KI-generierte Informationen bereit. Diese ersetzen NICHT die Beurteilung durch einen qualifizierten Fachmann. Bei Arbeiten an Gas-, Hochspannungs-, Tragwerk- oder Sicherheitssystemen wenden Sie sich IMMER an einen zugelassenen Fachbetrieb. Im Notfall rufen Sie den Notruf (112 / 110).'
          : 'FixIt provides AI-generated information. This does NOT replace the assessment of a qualified professional. For work on gas, high-voltage, structural, or safety systems, ALWAYS contact a licensed professional. In an emergency, call emergency services (112 / 110).'}
      </div>

      {/* 1. What FixIt is */}
      <h2 style={h2}>{de ? '1. Was FixIt ist — und was nicht' : '1. What FixIt Is — and Is Not'}</h2>
      <p style={p}>{de
        ? 'FixIt ist ein KI-gestütztes Informationswerkzeug für Heimwerker und technisch versierte Nutzer. Die App analysiert beschriebene Probleme und erzeugt Reparaturvorschläge auf Basis von KI-Modellen.'
        : 'FixIt is an AI-powered information tool for DIY users and technically inclined individuals. The app analyses described problems and generates repair suggestions based on AI models.'}</p>
      <p style={p}>{de
        ? 'FixIt ist kein Fachbetrieb, kein zertifizierter Handwerker, kein Ingenieur, kein Arzt und kein Notfalldienst. FixIt gibt keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der KI-generierten Inhalte.'
        : 'FixIt is not a trade business, certified technician, engineer, doctor, or emergency service. FixIt does not warrant the accuracy, completeness, or currency of AI-generated content.'}</p>

      {/* 2. AI transparency */}
      <h2 style={h2}>{de ? '2. KI-Transparenz (EU KI-Verordnung)' : '2. AI Transparency (EU AI Act)'}</h2>
      <p style={p}>{de
        ? 'Gemäß Artikel 50 der EU KI-Verordnung informieren wir Sie: Jede Diagnose und jede Reparaturanleitung in FixIt wird von einem KI-System (Anthropic Claude) generiert. KI kann Fehler machen. Jeder generierte Inhalt ist mit einem Hinweis versehen.'
        : 'Pursuant to Article 50 of the EU AI Act, we inform you: every diagnosis and repair guide in FixIt is generated by an AI system (Anthropic Claude). AI can make mistakes. Every generated piece of content carries a notice.'}</p>
      <ul style={ul}>
        <li style={li}>{de ? 'KI-generierte Inhalte sind als solche gekennzeichnet' : 'AI-generated content is labelled as such'}</li>
        <li style={li}>{de ? 'Kritische Informationen sollten von einem Fachmann überprüft werden' : 'Critical information should be verified by a professional'}</li>
        <li style={li}>{de ? 'FixIt-Ergebnisse stellen keine professionelle, zertifizierte oder garantierte Beratung dar' : 'FixIt results do not constitute professional, certified, or guaranteed advice'}</li>
      </ul>

      {/* 3. Safety rules */}
      <h2 style={h2}>{de ? '3. Sicherheitsregeln' : '3. Safety Rules'}</h2>
      <p style={p}>{de ? 'Folgende Arbeiten dürfen NIEMALS ohne zugelassenen Fachbetrieb durchgeführt werden:' : 'The following work must NEVER be performed without a licensed professional:'}</p>
      <ul style={ul}>
        {[
          de ? 'Gas- und Erdgasinstallationen' : 'Gas and natural gas installations',
          de ? 'Arbeiten unter Spannung (Hochvolt, Einspeisung)' : 'Live electrical work (high voltage, mains supply)',
          de ? 'Tragende Bauteile und Statik' : 'Structural elements and load-bearing work',
          de ? 'Fahrzeugsicherheitssysteme (Airbag, ABS, Bremsen)' : 'Vehicle safety systems (airbag, ABS, brakes)',
          de ? 'Gefährliche Chemikalien und Dämpfe' : 'Hazardous chemicals and fumes',
          de ? 'Brandschutzanlagen und Rauchmelder' : 'Fire suppression and smoke detection systems',
          de ? 'Medizinische oder elektrische Implantate' : 'Medical or electrical implants',
        ].map(item => <li key={item} style={li}>{item}</li>)}
      </ul>

      {/* 4. Subscription */}
      <h2 style={h2}>{de ? '4. Abonnements und Zahlung' : '4. Subscriptions and Payment'}</h2>
      <p style={p}>{de ? 'FixIt bietet folgende Pläne an:' : 'FixIt offers the following plans:'}</p>
      <div style={box}>
        <strong>Free</strong> — {de ? '1 kostenlose KI-Diagnose. Kein Ablaufdatum.' : '1 free AI diagnosis. No expiry.'}<br/><br/>
        <strong>{de ? 'Monthly (€4.99/Monat)' : 'Monthly (€4.99/month)'}</strong> — {de ? 'Automatisch verlängertes Abonnement. Erste Abbuchung bei Kaufbestätigung.' : 'Automatically renewing subscription. First charge on purchase confirmation.'}<br/><br/>
        <strong>{de ? 'Yearly (€39.99/Jahr)' : 'Yearly (€39.99/year)'}</strong> — {de ? 'Automatisch verlängertes Jahres-Abonnement. Erste Abbuchung bei Kaufbestätigung.' : 'Automatically renewing annual subscription. First charge on purchase confirmation.'}
      </div>
      <p style={p}>{de
        ? 'Mit dem Abschluss eines Abonnements stimmen Sie zu, dass wir die fälligen Beträge automatisch über Stripe abbuchen. Preise verstehen sich inklusive gesetzlicher MwSt., sofern zutreffend.'
        : 'By subscribing you agree that we may charge the applicable amount automatically via Stripe. Prices include statutory VAT where applicable.'}</p>

      {/* 5. Renewal and cancellation */}
      <h2 style={h2}>{de ? '5. Verlängerung und Kündigung' : '5. Renewal and Cancellation'}</h2>
      <p style={p}>{de
        ? 'Abonnements verlängern sich automatisch, sofern sie nicht mindestens 24 Stunden vor Ablauf des jeweiligen Zeitraums gekündigt werden. Kündigung über: Mein Konto → Abonnement verwalten (Stripe-Kundenportal).'
        : 'Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Cancel via: My Account → Manage Subscription (Stripe customer portal).'}</p>
      <p style={p}>{de
        ? 'Bereits bezahlte Zeiträume werden nicht erstattet. Nach Kündigung bleibt der Zugang bis zum Ende des bezahlten Zeitraums erhalten.'
        : 'Paid periods are not refunded. After cancellation, access remains until the end of the paid period.'}</p>

      {/* 6. Right of withdrawal (Widerrufsrecht) */}
      <h2 style={h2}>{de ? '6. Widerrufsrecht' : '6. Right of Withdrawal'}</h2>
      <p style={p}>{de
        ? 'Verbrauchern steht grundsätzlich ein 14-tägiges Widerrufsrecht zu. Dieses Widerrufsrecht erlischt vorzeitig, wenn Sie ausdrücklich zustimmen, dass wir mit der Ausführung des digitalen Inhalts vor Ablauf der Widerrufsfrist beginnen, und Sie bestätigen, dass Sie damit Ihr Widerrufsrecht verlieren.'
        : 'Consumers generally have a 14-day right of withdrawal. This right expires early if you expressly consent to performance beginning before the withdrawal period expires and acknowledge that you thereby lose your right of withdrawal.'}</p>
      <p style={p}>{de
        ? 'Wenn Sie die App sofort nutzen möchten, werden Sie beim Kauf zur Zustimmung zum sofortigen Leistungsbeginn aufgefordert.'
        : 'If you wish to use the app immediately, you will be asked to consent to immediate performance at the time of purchase.'}</p>

      {/* 7. Intellectual property */}
      <h2 style={h2}>{de ? '7. Geistiges Eigentum' : '7. Intellectual Property'}</h2>
      <p style={p}>{de
        ? 'FixIt und seine Inhalte sind Eigentum von ' + OWNER_NAME + '. Sie erhalten eine beschränkte, nicht übertragbare Lizenz zur persönlichen, nicht-kommerziellen Nutzung.'
        : 'FixIt and its content are owned by ' + OWNER_NAME + '. You receive a limited, non-transferable licence for personal, non-commercial use.'}</p>
      <p style={p}>{de
        ? 'Wenn Sie Fotos oder Texte hochladen, erteilen Sie uns eine Lizenz zur Verarbeitung dieser Inhalte ausschließlich zur Erbringung des Dienstes (KI-Diagnose). Wir beanspruchen kein Eigentum an Ihren Inhalten.'
        : 'When you upload photos or text, you grant us a licence to process that content solely to provide the service (AI diagnosis). We do not claim ownership of your content.'}</p>

      {/* 8. Prohibited use */}
      <h2 style={h2}>{de ? '8. Verbotene Nutzung' : '8. Prohibited Use'}</h2>
      <ul style={ul}>
        {[
          de ? 'Gewerbliche Nutzung ohne schriftliche Genehmigung' : 'Commercial use without written permission',
          de ? 'Automatisiertes Scraping oder Massenanfragen' : 'Automated scraping or bulk requests',
          de ? 'Hochladen illegaler, beleidigender oder urheberrechtlich geschützter Inhalte' : 'Uploading illegal, offensive, or copyrighted content',
          de ? 'Umgehung von Nutzungsbeschränkungen oder Zugangssperren' : 'Circumventing usage limits or access controls',
          de ? 'Nutzung der App zur Erstellung gefährlicher Anleitungen' : 'Using the app to generate dangerous instructions',
        ].map(item => <li key={item} style={li}>{item}</li>)}
      </ul>

      {/* 9. Affiliate disclosure */}
      <h2 style={h2}>{de ? '9. Affiliate-Hinweis' : '9. Affiliate Disclosure'}</h2>
      <p style={p}>{de
        ? 'FixIt kann Links zu Produkten bei Amazon oder anderen Händlern enthalten. Als Amazon-Partner verdienen wir an qualifizierten Käufen. Dies hat keinen Einfluss auf die generierten Empfehlungen.'
        : 'FixIt may contain links to products on Amazon or other retailers. As an Amazon Associate we earn from qualifying purchases. This does not influence generated recommendations.'}</p>

      {/* 10. Liability */}
      <h2 style={h2}>{de ? '10. Haftungsbeschränkung' : '10. Limitation of Liability'}</h2>
      <p style={p}>{de
        ? 'Im Rahmen des gesetzlich Zulässigen haften wir nicht für Schäden, die durch die Verwendung KI-generierter Inhalte entstehen, insbesondere nicht für Sachschäden, Folgeschäden oder entgangenen Gewinn.'
        : 'To the extent permitted by law, we are not liable for damages arising from use of AI-generated content, including property damage, consequential losses, or loss of profit.'}</p>
      <div style={box}>
        ℹ️ {de
          ? 'Hinweis: Diese Haftungsbeschränkung gilt nicht für Schäden aus Vorsatz oder grober Fahrlässigkeit, für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, sowie für Ansprüche nach dem Produkthaftungsgesetz. Die gesetzlichen Verbraucherrechte bleiben unberührt.'
          : 'Note: This limitation does not apply to damages from intent or gross negligence, to damages from injury to life, body or health, or to claims under product liability law. Statutory consumer rights are unaffected.'}
      </div>

      {/* 11. Consumer rights */}
      <h2 style={h2}>{de ? '11. Verbraucherrechte' : '11. Consumer Rights'}</h2>
      <p style={p}>{de
        ? 'Als Verbraucher mit Wohnsitz in der EU haben Sie Rechte gemäß der EU-Verbraucherrechterichtlinie und dem deutschen Verbraucherrecht, die durch diese Nutzungsbedingungen nicht eingeschränkt werden.'
        : 'As a consumer resident in the EU you have rights under the EU Consumer Rights Directive and applicable national consumer law that these terms do not restrict.'}</p>

      {/* 12. Governing law */}
      <h2 style={h2}>{de ? '12. Anwendbares Recht und Streitbeilegung' : '12. Governing Law and Dispute Resolution'}</h2>
      <p style={p}>{de
        ? 'Es gilt deutsches Recht. Für Verbraucher bleibt das zwingende Verbraucherrecht des Wohnsitzlandes unberührt.'
        : 'German law applies. For consumers, mandatory consumer protection law of your country of residence remains unaffected.'}</p>
      <p style={p}>{de
        ? 'Die EU-Kommission stellt eine Online-Plattform zur Streitbeilegung bereit: https://ec.europa.eu/consumers/odr. Wir sind nicht zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle verpflichtet und nehmen hieran nicht teil.'
        : 'The European Commission provides an online dispute resolution platform: https://ec.europa.eu/consumers/odr. We are not required to participate in consumer dispute resolution proceedings and do not do so.'}</p>

      {/* 13. Contact */}
      <h2 style={h2}>{de ? '13. Kontakt' : '13. Contact'}</h2>
      <div style={box}>
        {OWNER_NAME}<br/>{OWNER_ADDR}<br/>
        {OWNER_EMAIL}
      </div>
    </div>
  );
}

// ── Impressum ─────────────────────────────────────────────────────────────────
export function ImpressumPage({ lang }) {
  const de = lang === 'de';
  return (
    <div>
      <h1 style={h1}>Impressum</h1>
      <div style={meta}>FixIt · {APP_URL}</div>

      <h2 style={h2}>{de ? 'Angaben gemäß § 5 TMG' : 'Information pursuant to § 5 TMG'}</h2>
      <div style={box}>
        <strong>{OWNER_NAME}</strong><br/>
        {OWNER_ADDR}<br/>
        {VAT_ID && <>{VAT_ID}<br/></>}
        {de ? 'E-Mail: ' : 'Email: '}{OWNER_EMAIL}
      </div>

      <h2 style={h2}>{de ? 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV' : 'Responsible for content pursuant to § 18 para. 2 MStV'}</h2>
      <div style={box}>
        {OWNER_NAME}<br/>
        {OWNER_ADDR}
      </div>

      <h2 style={h2}>{de ? 'Haftungsausschluss' : 'Disclaimer'}</h2>
      <h3 style={h3}>{de ? 'Haftung für Inhalte' : 'Liability for content'}</h3>
      <p style={p}>{de
        ? 'Die Inhalte dieser App wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Die KI-generierten Reparaturanleitungen ersetzen nicht die Beurteilung durch einen qualifizierten Fachmann.'
        : 'The content of this app has been compiled with the greatest care. However, we cannot guarantee the accuracy, completeness, or currency of the content. AI-generated repair guidance does not replace the assessment of a qualified professional.'}</p>

      <h3 style={h3}>{de ? 'Haftung für Links' : 'Liability for links'}</h3>
      <p style={p}>{de
        ? 'Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.'
        : 'Our app contains links to external third-party websites whose content we have no control over. We therefore cannot accept any liability for this external content. The respective provider or operator of the linked sites is always responsible for their content.'}</p>

      <h3 style={h3}>{de ? 'Urheberrecht' : 'Copyright'}</h3>
      <p style={p}>{de
        ? 'Die durch den Seitenbetreiber erstellten Inhalte und Werke in dieser App unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.'
        : 'The content and works created by the site operator in this app are subject to German copyright law. Reproduction, editing, distribution, and any kind of use outside the limits of copyright law require the written consent of the respective author or creator.'}</p>

      <h2 style={h2}>{de ? 'Streitschlichtung' : 'Dispute Resolution'}</h2>
      <p style={p}>{de
        ? 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'
        : 'The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr. We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.'}</p>
    </div>
  );
}

