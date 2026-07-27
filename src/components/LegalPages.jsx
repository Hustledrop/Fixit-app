// src/components/LegalPages.jsx
// Self-contained Privacy Policy, Terms of Service, and Impressum for FixIt
// All contact / legal info read from src/config/legal.js — one place to update.
// Last updated: July 2026 · Version 1.1
// Bilingual: lang='de' → German, otherwise English

import { LEGAL } from '../config/legal.js';

const { legalName, postalAddress, supportEmail, privacyEmail, vatId, appUrl } = LEGAL;
const DOC_VERSION = '1.1';
const DOC_DATE    = 'July 2026';

// ── Shared styles ──────────────────────────────────────────────────────────────
const h1   = { fontSize:'1.45rem', fontWeight:900, color:'rgba(255,255,255,0.92)', marginBottom:6, marginTop:0, letterSpacing:'-0.02em' };
const h2   = { fontSize:'1.05rem', fontWeight:800, color:'rgba(255,255,255,0.85)', marginTop:32, marginBottom:8, paddingBottom:4, borderBottom:'1px solid rgba(255,255,255,0.08)' };
const h3   = { fontSize:'0.9rem',  fontWeight:700, color:'rgba(255,255,255,0.78)', marginTop:18, marginBottom:4 };
const p    = { marginBottom:12, color:'rgba(255,255,255,0.65)' };
const ul   = { paddingLeft:20, marginBottom:12, color:'rgba(255,255,255,0.65)' };
const li   = { marginBottom:4 };
const warn = { background:'rgba(232,82,26,0.09)', border:'1px solid rgba(232,82,26,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:'0.82rem', color:'rgba(232,82,26,0.85)', lineHeight:1.6 };
const box  = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'10px 14px', marginBottom:12, fontSize:'0.82rem' };
const meta = { fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', marginBottom:24 };

// ── Helper: only render VAT when configured ───────────────────────────────────
const VatLine = ({ de }) => vatId && vatId.trim()
  ? <>{de ? 'USt-IdNr.: ' : 'VAT ID: '}{vatId}<br/></>
  : null;

// ── Shared owner block used in all three pages ────────────────────────────────
const OwnerBlock = ({ de }) => (
  <div style={box}>
    {legalName   ? <><strong>{legalName}</strong><br/></> : null}
    {postalAddress ? <>{postalAddress}<br/></> : null}
    <VatLine de={de}/>
    {de ? 'E-Mail: ' : 'Email: '}{supportEmail}
  </div>
);

// ── Privacy Policy ─────────────────────────────────────────────────────────────
export function PrivacyPage({ lang }) {
  const de = lang === 'de';
  return (
    <div>
      <h1 style={h1}>{de ? 'Datenschutzerklärung' : 'Privacy Policy'}</h1>
      <div style={meta}>Version {DOC_VERSION} · {DOC_DATE} · FixIt · {appUrl}</div>

      {/* AI Transparency — EU AI Act Art. 50, required in UI */}
      <div style={warn}>
        🤖 {de
          ? 'FixIt verwendet KI-Technologie, um Diagnosen und Reparaturanleitungen zu erstellen. KI-generierte Inhalte können Fehler enthalten. Überprüfen Sie kritische Informationen stets mit Fachleuten.'
          : 'FixIt uses AI technology to generate diagnoses and repair guidance. AI-generated content can contain errors. Always verify critical information with qualified professionals.'}
      </div>

      {/* 1. Controller */}
      <h2 style={h2}>{de ? '1. Verantwortlicher' : '1. Data Controller'}</h2>
      <OwnerBlock de={de}/>
      <p style={p}>{de
        ? `Für Fragen zum Datenschutz wenden Sie sich bitte an: ${privacyEmail}`
        : `For privacy questions, please contact: ${privacyEmail}`}</p>

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
          ? 'Fotos und Texteingaben werden zur KI-Verarbeitung an Anthropic, Inc. (USA) übertragen. Anthropic verarbeitet diese Daten gemäß seinen eigenen API-Nutzungsbedingungen. Wir empfehlen, keine persönlichen Informationen (Namen, Adressen, Ausweisnummern) in Diagnose-Texte einzugeben.'
          : 'Photos and text inputs are transmitted to Anthropic, Inc. (USA) for AI processing. Anthropic processes this data under its own API terms. We recommend not entering personal information (names, addresses, ID numbers) in diagnosis texts.'}
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
          mechanism: de ? 'Kein Drittlandtransfer' : 'No third-country transfer',
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
        ? 'Gemäß § 25 TDDDG ist die Nutzung dieser Speicher technisch notwendig und erfordert keine Einwilligung.'
        : 'Under § 25 TDDDG, this storage is strictly necessary and does not require consent.'}</p>

      {/* 6. Retention */}
      <h2 style={h2}>{de ? '6. Speicherdauer' : '6. Retention Periods'}</h2>
      <ul style={ul}>
        <li style={li}>{de ? 'Kontodaten: bis zur Löschung des Kontos' : 'Account data: until account deletion'}</li>
        <li style={li}>{de ? 'Reparaturverlauf (lokal): bis zur Gerätbereinigung oder Kontolöschung' : 'Repair history (local): until device clear or account deletion'}</li>
        <li style={li}>{de ? 'KI-Diagnosen / Fotos: von uns nicht dauerhaft gespeichert — Anthropic verarbeitet diese gemäß seinen eigenen API-Bedingungen (siehe Anthropic-Datenschutzerklärung)' : 'AI diagnoses / photos: not permanently stored by us — Anthropic processes these under its own API terms (see Anthropic privacy policy)'}</li>
        <li style={li}>{de ? 'Zahlungsnachweise: 10 Jahre (§ 147 AO)' : 'Payment records: 10 years (§ 147 AO)'}</li>
        <li style={li}>{de ? 'Server-Logs (Vercel): maximal 30 Tage' : 'Server logs (Vercel): maximum 30 days'}</li>
      </ul>

      {/* 7. Rights */}
      <h2 style={h2}>{de ? '7. Ihre Rechte (DSGVO)' : '7. Your Rights (GDPR)'}</h2>
      <ul style={ul}>
        <li style={li}><strong>{de ? 'Auskunft (Art. 15)' : 'Access (Art. 15)'}</strong></li>
        <li style={li}><strong>{de ? 'Berichtigung (Art. 16)' : 'Rectification (Art. 16)'}</strong></li>
        <li style={li}><strong>{de ? 'Löschung (Art. 17)' : 'Erasure (Art. 17)'}</strong></li>
        <li style={li}><strong>{de ? 'Einschränkung (Art. 18)' : 'Restriction (Art. 18)'}</strong></li>
        <li style={li}><strong>{de ? 'Datenübertragbarkeit (Art. 20)' : 'Portability (Art. 20)'}</strong></li>
        <li style={li}><strong>{de ? 'Widerspruch (Art. 21)' : 'Object (Art. 21)'}</strong></li>
        <li style={li}><strong>{de ? 'Einwilligungswiderruf' : 'Withdraw consent'}</strong></li>
        <li style={li}><strong>{de ? 'Beschwerde bei einer Aufsichtsbehörde' : 'Complaint to a supervisory authority'}</strong></li>
      </ul>
      <p style={p}>{de
        ? `Zur Ausübung Ihrer Rechte senden Sie eine E-Mail an: ${privacyEmail}`
        : `To exercise your rights, email: ${privacyEmail}`}</p>

      {/* 8. Account deletion */}
      <h2 style={h2}>{de ? '8. Kontolöschung' : '8. Account Deletion'}</h2>
      <p style={p}>{de
        ? 'Sie können Ihr Konto jederzeit löschen über Mein Konto → Konto löschen. Zahlungsnachweise werden aus gesetzlichen Gründen 10 Jahre aufbewahrt. Aktive Abonnements sollten vor der Löschung über das Stripe-Kundenportal gekündigt werden.'
        : 'You can delete your account at any time via My Account → Delete account. Payment records are retained for 10 years for legal reasons. Active subscriptions should be cancelled via the Stripe customer portal before deletion.'}</p>

      {/* 9. Changes */}
      <h2 style={h2}>{de ? '9. Änderungen' : '9. Changes'}</h2>
      <p style={p}>{de
        ? 'Wesentliche Änderungen werden mit ausreichend Vorlauf angekündigt.'
        : 'Material changes will be communicated with reasonable notice.'}</p>

      {/* 10. Contact */}
      <h2 style={h2}>{de ? '10. Kontakt' : '10. Contact'}</h2>
      <OwnerBlock de={de}/>
      <p style={p}>{de ? `Datenschutz: ${privacyEmail}` : `Privacy: ${privacyEmail}`}</p>
    </div>
  );
}

// ── Terms of Service ───────────────────────────────────────────────────────────
export function TermsPage({ lang }) {
  const de = lang === 'de';
  return (
    <div>
      <h1 style={h1}>{de ? 'Nutzungsbedingungen' : 'Terms of Service'}</h1>
      <div style={meta}>Version {DOC_VERSION} · {DOC_DATE} · FixIt · {appUrl}</div>

      <div style={warn}>
        ⚠️ <strong>{de ? 'Wichtiger Sicherheitshinweis:' : 'Important safety notice:'}</strong> {de
          ? 'FixIt stellt KI-generierte Informationen bereit. Diese ersetzen NICHT die Beurteilung durch einen qualifizierten Fachmann. Bei Arbeiten an Gas-, Hochspannungs-, Tragwerk- oder Sicherheitssystemen wenden Sie sich IMMER an einen zugelassenen Fachbetrieb. Im Notfall rufen Sie den Notruf (112 / 110).'
          : 'FixIt provides AI-generated information. This does NOT replace the assessment of a qualified professional. For work on gas, high-voltage, structural, or safety systems, ALWAYS contact a licensed professional. In an emergency, call emergency services (112 / 110).'}
      </div>

      <h2 style={h2}>{de ? '1. Was FixIt ist' : '1. What FixIt Is'}</h2>
      <p style={p}>{de
        ? 'FixIt ist ein KI-gestütztes Informationswerkzeug für Heimwerker und technisch versierte Nutzer. FixIt ist kein Fachbetrieb, kein zertifizierter Handwerker, kein Ingenieur und kein Notfalldienst.'
        : 'FixIt is an AI-powered information tool for DIY users. FixIt is not a trade business, certified technician, engineer, or emergency service.'}</p>

      <h2 style={h2}>{de ? '2. KI-Transparenz (EU KI-Verordnung Art. 50)' : '2. AI Transparency (EU AI Act Art. 50)'}</h2>
      <p style={p}>{de
        ? 'Jede Diagnose und jede Reparaturanleitung in FixIt wird von einem KI-System generiert. KI kann Fehler machen. KI-generierte Inhalte sind als solche gekennzeichnet und ersetzen keine professionelle Beratung.'
        : 'Every diagnosis and repair guide in FixIt is generated by an AI system. AI can make mistakes. AI-generated content is labelled as such and does not replace professional advice.'}</p>

      <h2 style={h2}>{de ? '3. Sicherheitsregeln' : '3. Safety Rules'}</h2>
      <p style={p}>{de ? 'Nie ohne zugelassenen Fachbetrieb:' : 'Never without a licensed professional:'}</p>
      <ul style={ul}>
        {[de?'Gas- und Erdgasinstallationen':'Gas and natural gas installations',
          de?'Arbeiten unter Spannung':'Live electrical work',
          de?'Tragende Bauteile und Statik':'Structural elements',
          de?'Fahrzeugsicherheitssysteme (Airbag, ABS, Bremsen)':'Vehicle safety systems (airbag, ABS, brakes)',
          de?'Gefährliche Chemikalien':'Hazardous chemicals',
          de?'Brandschutzanlagen':'Fire suppression systems',
        ].map(item => <li key={item} style={li}>{item}</li>)}
      </ul>

      <h2 style={h2}>{de ? '4. Abonnements und Zahlung' : '4. Subscriptions and Payment'}</h2>
      <div style={box}>
        <strong>Free</strong> — {de ? '1 kostenlose KI-Diagnose.' : '1 free AI diagnosis.'}<br/><br/>
        <strong>{de ? 'Monthly (€4.99/Monat)' : 'Monthly (€4.99/month)'}</strong> — {de ? 'Automatisch verlängertes Abonnement.' : 'Automatically renewing subscription.'}<br/><br/>
        <strong>{de ? 'Yearly (€39.99/Jahr)' : 'Yearly (€39.99/year)'}</strong> — {de ? 'Automatisch verlängertes Jahres-Abonnement.' : 'Automatically renewing annual subscription.'}
      </div>

      <h2 style={h2}>{de ? '5. Verlängerung und Kündigung' : '5. Renewal and Cancellation'}</h2>
      <p style={p}>{de
        ? 'Abonnements verlängern sich automatisch. Kündigung über: Mein Konto → Abonnement verwalten. Bereits bezahlte Zeiträume werden nicht erstattet. Zugang bleibt bis Ende des bezahlten Zeitraums erhalten.'
        : 'Subscriptions renew automatically. Cancel via: My Account → Manage Subscription. Paid periods are not refunded. Access remains until the end of the paid period.'}</p>

      <h2 style={h2}>{de ? '6. Widerrufsrecht' : '6. Right of Withdrawal'}</h2>
      <p style={p}>{de
        ? 'Verbrauchern steht ein 14-tägiges Widerrufsrecht zu. Dieses erlischt vorzeitig, wenn Sie dem sofortigen Leistungsbeginn zustimmen und bestätigen, dass Sie damit Ihr Widerrufsrecht verlieren.'
        : 'Consumers have a 14-day right of withdrawal. This right expires early if you consent to performance beginning before the withdrawal period expires and acknowledge that you thereby lose your right of withdrawal.'}</p>

      <h2 style={h2}>{de ? '7. Geistiges Eigentum' : '7. Intellectual Property'}</h2>
      <p style={p}>{de
        ? 'FixIt und seine Inhalte sind Eigentum des Betreibers. Sie erhalten eine beschränkte, nicht übertragbare Lizenz zur persönlichen, nicht-kommerziellen Nutzung. Hochgeladene Fotos/Texte: Sie erteilen uns eine Lizenz zur Verarbeitung ausschließlich zur Erbringung des Dienstes.'
        : 'FixIt and its content are owned by the operator. You receive a limited, non-transferable licence for personal, non-commercial use. Uploaded photos/text: you grant a licence to process solely to provide the service.'}</p>

      <h2 style={h2}>{de ? '8. Affiliate-Hinweis' : '8. Affiliate Disclosure'}</h2>
      <p style={p}>{de
        ? 'FixIt kann Links zu Produkten bei Amazon oder anderen Händlern enthalten. Als Amazon-Partner verdienen wir an qualifizierten Käufen. Dies beeinflusst keine Empfehlungen.'
        : 'FixIt may contain Amazon affiliate links. As an Amazon Associate we earn from qualifying purchases. This does not influence recommendations.'}</p>

      <h2 style={h2}>{de ? '9. Haftungsbeschränkung' : '9. Limitation of Liability'}</h2>
      <p style={p}>{de
        ? 'Im Rahmen des gesetzlich Zulässigen haften wir nicht für Schäden durch Verwendung KI-generierter Inhalte.'
        : 'To the extent permitted by law, we are not liable for damages arising from use of AI-generated content.'}</p>
      <div style={box}>
        ℹ️ {de
          ? 'Diese Beschränkung gilt nicht für Vorsatz, grobe Fahrlässigkeit, Schäden aus der Verletzung von Leben, Körper oder Gesundheit, sowie Ansprüche nach dem Produkthaftungsgesetz. Gesetzliche Verbraucherrechte bleiben unberührt.'
          : 'This limitation does not apply to intent, gross negligence, injury to life, body or health, or product liability claims. Statutory consumer rights are unaffected.'}
      </div>

      <h2 style={h2}>{de ? '10. Anwendbares Recht' : '10. Governing Law'}</h2>
      <p style={p}>{de
        ? 'Es gilt deutsches Recht. EU-Plattform zur Streitbeilegung: https://ec.europa.eu/consumers/odr — Wir nehmen an Schlichtungsverfahren nicht teil.'
        : 'German law applies. EU dispute resolution platform: https://ec.europa.eu/consumers/odr — We do not participate in dispute resolution proceedings.'}</p>

      <h2 style={h2}>{de ? '11. Kontakt' : '11. Contact'}</h2>
      <OwnerBlock de={de}/>
    </div>
  );
}

// ── Impressum ──────────────────────────────────────────────────────────────────
export function ImpressumPage({ lang }) {
  const de = lang === 'de';
  return (
    <div>
      <h1 style={h1}>Impressum</h1>
      <div style={meta}>FixIt · {appUrl}</div>

      <h2 style={h2}>{de ? 'Angaben gemäß § 5 TMG' : 'Information pursuant to § 5 TMG'}</h2>
      <OwnerBlock de={de}/>

      <h2 style={h2}>{de ? 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV' : 'Responsible for content pursuant to § 18 para. 2 MStV'}</h2>
      <div style={box}>
        {legalName    ? <>{legalName}<br/></> : null}
        {postalAddress ? <>{postalAddress}<br/></> : null}
      </div>

      <h2 style={h2}>{de ? 'Haftungsausschluss' : 'Disclaimer'}</h2>
      <h3 style={h3}>{de ? 'Haftung für Inhalte' : 'Liability for content'}</h3>
      <p style={p}>{de
        ? 'KI-generierte Reparaturanleitungen ersetzen nicht die Beurteilung durch einen qualifizierten Fachmann.'
        : 'AI-generated repair guidance does not replace the assessment of a qualified professional.'}</p>

      <h3 style={h3}>{de ? 'Haftung für Links' : 'Liability for links'}</h3>
      <p style={p}>{de
        ? 'Für die Inhalte verlinkter Seiten ist der jeweilige Anbieter verantwortlich.'
        : 'The respective provider is responsible for the content of linked sites.'}</p>

      <h3 style={h3}>{de ? 'Urheberrecht' : 'Copyright'}</h3>
      <p style={p}>{de
        ? 'Die durch den Seitenbetreiber erstellten Inhalte unterliegen dem deutschen Urheberrecht.'
        : 'Content created by the operator is subject to German copyright law.'}</p>

      <h2 style={h2}>{de ? 'Streitschlichtung' : 'Dispute Resolution'}</h2>
      <p style={p}>{de
        ? 'EU-Plattform zur Online-Streitbeilegung: https://ec.europa.eu/consumers/odr — Wir sind nicht bereit, an Streitbeilegungsverfahren teilzunehmen.'
        : 'EU online dispute resolution platform: https://ec.europa.eu/consumers/odr — We are not willing to participate in dispute resolution proceedings.'}</p>
    </div>
  );
}
