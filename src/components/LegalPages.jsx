// src/components/LegalPages.jsx
// Privacy Policy, Terms of Service, and Impressum for FixIt
// Fully translated into all 10 supported languages.
// Legal info read from src/config/legal.js (one place to update).
// Last updated: July 2026 · Version 1.2

import { LEGAL } from '../config/legal.js';

const { legalName, postalAddress, supportEmail, privacyEmail, vatId, appUrl } = LEGAL;
const DOC_VERSION = '1.2';
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

// ── Translation map ────────────────────────────────────────────────────────────
// T[langCode].key — falls back to T.en when a language is not yet available.
const T = {
  en: {
    vatLabel:'VAT ID: ', emailLabel:'Email: ',
    // Privacy Policy
    pp_title:'Privacy Policy',
    pp_ai_notice:'FixIt uses AI technology to generate diagnoses and repair guidance. AI-generated content can contain errors. Always verify critical information with qualified professionals.',
    pp_s1:'1. Data Controller',
    pp_s1_contact:`For privacy questions, please contact: ${privacyEmail}`,
    pp_s2:'2. Data We Process',
    pp_s2_account:'Account data (on registration)',
    pp_li_email:'Email address (required)',
    pp_li_pwd:'Hashed password (stored at Supabase, never in plain text)',
    pp_li_uid:'User ID (system-generated)',
    pp_li_plan:'Subscription status (Free / Monthly / Yearly)',
    pp_li_cid:'Stripe customer ID (on payment)',
    pp_s2_ai:'AI diagnoses (when you use the feature)',
    pp_li_text:'Problem text you enter',
    pp_li_photo:'Optional: photos you upload',
    pp_li_cat:'Vehicle type / category (you select)',
    pp_li_resp:'AI-generated response',
    pp_li_lang:'Language setting',
    pp_ai_box:'Photos and text inputs are transmitted to Anthropic, Inc. (USA) for AI processing. Anthropic processes this data under its own API terms. We recommend not entering personal information (names, addresses, ID numbers) in diagnosis texts.',
    pp_s2_hist:'Repair history',
    pp_hist_desc:'Diagnoses are stored locally on your device (localStorage). For logged-in users, history may be associated with your account.',
    pp_s2_loc:'Location and GPS',
    pp_li_gps1:'GPS coordinates are used only for the Nearby search (workshops, parts shops)',
    pp_li_gps2:'Coordinates are sent to Google Places API and OpenStreetMap Overpass API',
    pp_li_gps3:'We do not permanently store your location',
    pp_s2_pay:'Payment data',
    pp_pay_desc:'Payments are handled entirely by Stripe (USA). We do not store payment card data. We receive only confirmations (subscription status, Stripe customer ID) via webhook.',
    pp_s2_logs:'Server logs and IP addresses',
    pp_logs_desc:'Vercel (hosting) and Supabase (database) process IP addresses and access times as part of their operations. We do not maintain additional logs. Vercel retains logs for a maximum of 30 days.',
    pp_s3:'3. Legal Bases',
    pp_s3_b:'Contract performance (Art. 6(1)(b) GDPR):', pp_s3_b_v:'Account management, subscription, AI diagnoses',
    pp_s3_f:'Legitimate interests (Art. 6(1)(f) GDPR):', pp_s3_f_v:'Security, fraud prevention, service improvement',
    pp_s3_c:'Legal obligation (Art. 6(1)(c) GDPR):', pp_s3_c_v:'Retention of payment records (§ 147 AO: 10 years)',
    pp_s4:'4. Third-Party Providers',
    pp_role:'Role:', pp_data:'Data:', pp_country:'Country:', pp_mechanism:'Transfer mechanism:', pp_policy_link:'Privacy policy',
    pp_s5:'5. Local Storage',
    pp_ls_desc:'FixIt uses localStorage and sessionStorage only for strictly necessary functions. No tracking cookies, advertising cookies, or analytics cookies are used.',
    pp_ls_keys:'Keys used:',
    pp_ls_hist:'Repair history (local)', pp_ls_lang:'Language preference', pp_ls_onb:'Onboarding status',
    pp_ls_free:'Free diagnosis used', pp_ls_user:'Local user data (guest mode)', pp_ls_auth:'Auth session (Supabase)',
    pp_ls_tdddg:'Under § 25 TDDDG, this storage is strictly necessary and does not require consent.',
    pp_s6:'6. Retention Periods',
    pp_ret1:'Account data: until account deletion',
    pp_ret2:'Repair history (local): until device clear or account deletion',
    pp_ret3:`AI diagnoses / photos: not permanently stored by us — Anthropic processes these under its own API terms (see Anthropic privacy policy)`,
    pp_ret4:'Payment records: 10 years (§ 147 AO)',
    pp_ret5:'Server logs (Vercel): maximum 30 days',
    pp_s7:'7. Your Rights (GDPR)',
    pp_r1:'Access (Art. 15)', pp_r2:'Rectification (Art. 16)', pp_r3:'Erasure (Art. 17)', pp_r4:'Restriction (Art. 18)',
    pp_r5:'Portability (Art. 20)', pp_r6:'Object (Art. 21)', pp_r7:'Withdraw consent', pp_r8:'Complaint to a supervisory authority',
    pp_rights_contact:`To exercise your rights, email: ${privacyEmail}`,
    pp_s8:'8. Account Deletion',
    pp_del_desc:`You can delete your account at any time via My Account → Delete account. Payment records are retained for 10 years for legal reasons. Active subscriptions should be cancelled via the Stripe customer portal before deletion.`,
    pp_s9:'9. Changes',
    pp_changes:'Material changes will be communicated with reasonable notice.',
    pp_s10:'10. Contact',
    pp_privacy_label:`Privacy: ${privacyEmail}`,
    // Terms of Service
    tos_title:'Terms of Service',
    tos_safety:'Important safety notice:',
    tos_safety_desc:'FixIt provides AI-generated information. This does NOT replace the assessment of a qualified professional. For work on gas, high-voltage, structural, or safety systems, ALWAYS contact a licensed professional. In an emergency, call emergency services (112 / 110).',
    tos_s1:'1. What FixIt Is',
    tos_s1_desc:'FixIt is an AI-powered information tool for DIY users and technically inclined individuals. FixIt is not a trade business, certified technician, engineer, doctor, or emergency service.',
    tos_s2:'2. AI Transparency (EU AI Act Art. 50)',
    tos_s2_desc:'Every diagnosis and repair guide in FixIt is generated by an AI system. AI can make mistakes. AI-generated content is labelled as such and does not replace professional advice.',
    tos_s3:'3. Safety Rules',
    tos_s3_intro:'The following work must NEVER be performed without a licensed professional:',
    tos_danger1:'Gas and natural gas installations', tos_danger2:'Live electrical work (high voltage, mains supply)',
    tos_danger3:'Structural elements', tos_danger4:'Vehicle safety systems (airbag, ABS, brakes)',
    tos_danger5:'Hazardous chemicals', tos_danger6:'Fire suppression systems',
    tos_s4:'4. Subscriptions and Payment',
    tos_free_desc:'1 free AI diagnosis.',
    tos_monthly:'Monthly (€4.99/month)', tos_monthly_desc:'Automatically renewing subscription.',
    tos_yearly:'Yearly (€39.99/year)', tos_yearly_desc:'Automatically renewing annual subscription.',
    tos_s5:'5. Renewal and Cancellation',
    tos_s5_desc:'Subscriptions renew automatically. Cancel via: My Account → Manage Subscription. Paid periods are not refunded. Access remains until the end of the paid period.',
    tos_s6:'6. Right of Withdrawal',
    tos_s6_desc:'Consumers have a 14-day right of withdrawal. This right expires early if you consent to performance beginning before the withdrawal period expires and acknowledge that you thereby lose your right of withdrawal.',
    tos_s7:'7. Intellectual Property',
    tos_s7_desc:'FixIt and its content are owned by the operator. You receive a limited, non-transferable licence for personal, non-commercial use. Uploaded photos/text: you grant a licence to process solely to provide the service.',
    tos_s8:'8. Affiliate Disclosure',
    tos_s8_desc:'FixIt may contain Amazon affiliate links. As an Amazon Associate we earn from qualifying purchases. This does not influence recommendations.',
    tos_s9:'9. Limitation of Liability',
    tos_s9_desc:'To the extent permitted by law, we are not liable for damages arising from use of AI-generated content.',
    tos_s9_note:'This limitation does not apply to intent, gross negligence, injury to life, body or health, or product liability claims. Statutory consumer rights are unaffected.',
    tos_s10:'10. Governing Law',
    tos_s10_desc:'German law applies. EU dispute resolution platform: https://ec.europa.eu/consumers/odr — We do not participate in dispute resolution proceedings.',
    tos_s11:'11. Contact',
    // Impressum
    imp_title:'Impressum',
    imp_s1:'Information pursuant to § 5 TMG',
    imp_s2:'Responsible for content pursuant to § 18 para. 2 MStV',
    imp_s3:'Disclaimer',
    imp_h_content:'Liability for content',
    imp_content_desc:'AI-generated repair guidance does not replace the assessment of a qualified professional.',
    imp_h_links:'Liability for links',
    imp_links_desc:'The respective provider is responsible for the content of linked sites.',
    imp_h_copyright:'Copyright',
    imp_copyright_desc:'Content created by the operator is subject to German copyright law.',
    imp_s4:'Dispute Resolution',
    imp_dispute:'EU online dispute resolution platform: https://ec.europa.eu/consumers/odr — We are not willing to participate in dispute resolution proceedings.',
  },
};

// ── Per-language overrides ────────────────────────────────────────────────────
T.de = {
  vatLabel:'USt-IdNr.: ', emailLabel:'E-Mail: ',
  pp_title:'Datenschutzerklärung',
  pp_ai_notice:'FixIt verwendet KI-Technologie, um Diagnosen und Reparaturanleitungen zu erstellen. KI-generierte Inhalte können Fehler enthalten. Überprüfen Sie kritische Informationen stets mit Fachleuten.',
  pp_s1:'1. Verantwortlicher',
  pp_s1_contact:`Für Fragen zum Datenschutz wenden Sie sich bitte an: ${privacyEmail}`,
  pp_s2:'2. Welche Daten wir verarbeiten',
  pp_s2_account:'Kontodaten (bei Registrierung)',
  pp_li_email:'E-Mail-Adresse (Pflichtfeld)',
  pp_li_pwd:'Verschlüsseltes Passwort (gespeichert bei Supabase, niemals im Klartext)',
  pp_li_uid:'Nutzer-ID (systemgeneriert)',
  pp_li_plan:'Abonnementstatus (Free / Monthly / Yearly)',
  pp_li_cid:'Stripe-Kunden-ID (bei Zahlung)',
  pp_s2_ai:'KI-Diagnosen (bei Nutzung der Funktion)',
  pp_li_text:'Von Ihnen eingegebener Problemtext',
  pp_li_photo:'Optional: von Ihnen hochgeladene Fotos',
  pp_li_cat:'Fahrzeugtyp / Kategorie (von Ihnen ausgewählt)',
  pp_li_resp:'KI-generierte Antwort',
  pp_li_lang:'Spracheinstellung',
  pp_ai_box:'Fotos und Texteingaben werden zur KI-Verarbeitung an Anthropic, Inc. (USA) übertragen. Anthropic verarbeitet diese Daten gemäß seinen eigenen API-Nutzungsbedingungen. Wir empfehlen, keine persönlichen Informationen (Namen, Adressen, Ausweisnummern) in Diagnose-Texte einzugeben.',
  pp_s2_hist:'Reparaturverlauf',
  pp_hist_desc:'Diagnosen werden lokal auf Ihrem Gerät (localStorage) gespeichert. Für angemeldete Nutzer kann der Verlauf mit dem Konto verknüpft sein.',
  pp_s2_loc:'Standort und GPS',
  pp_li_gps1:'GPS-Koordinaten werden nur für die Nearby-Suche (Werkstätten, Teilehandel) verwendet',
  pp_li_gps2:'Koordinaten werden an Google Places API und OpenStreetMap Overpass API übertragen',
  pp_li_gps3:'Wir speichern Ihren Standort nicht dauerhaft',
  pp_s2_pay:'Zahlungsdaten',
  pp_pay_desc:'Zahlungen werden vollständig von Stripe (USA) abgewickelt. Wir speichern keine Zahlungskartendaten. Wir empfangen nur Bestätigungen (Abonnementstatus, Stripe-Kunden-ID) via Webhook.',
  pp_s2_logs:'Server-Logs und IP-Adressen',
  pp_logs_desc:'Vercel (Hosting) und Supabase (Datenbank) verarbeiten IP-Adressen und Zugriffszeiten im Rahmen ihres Betriebs. Wir führen keine zusätzliche Protokollierung. Vercel speichert Logs für maximal 30 Tage.',
  pp_s3:'3. Rechtsgrundlagen',
  pp_s3_b:'Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO):', pp_s3_b_v:'Kontoverwaltung, Abonnement, KI-Diagnosen',
  pp_s3_f:'Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO):', pp_s3_f_v:'Sicherheit, Betrugsprävention, Serviceverbesserung',
  pp_s3_c:'Gesetzliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO):', pp_s3_c_v:'Aufbewahrung von Zahlungsnachweisen (§ 147 AO: 10 Jahre)',
  pp_s4:'4. Drittanbieter',
  pp_role:'Funktion:', pp_data:'Daten:', pp_country:'Land:', pp_mechanism:'Mechanismus:', pp_policy_link:'Datenschutzerklärung',
  pp_s5:'5. Lokale Datenspeicherung',
  pp_ls_desc:'FixIt verwendet localStorage und sessionStorage ausschließlich für technisch notwendige Funktionen. Es werden keine Tracking-Cookies, Werbe-Cookies oder Analyse-Cookies eingesetzt.',
  pp_ls_keys:'Genutzte Schlüssel:',
  pp_ls_hist:'Reparaturverlauf (lokal)', pp_ls_lang:'Sprachauswahl', pp_ls_onb:'Onboarding-Status',
  pp_ls_free:'Freie Diagnose genutzt', pp_ls_user:'Lokale Nutzerdaten (Gästemodus)', pp_ls_auth:'Authentifizierungs-Session (Supabase)',
  pp_ls_tdddg:'Gemäß § 25 TDDDG ist die Nutzung dieser Speicher technisch notwendig und erfordert keine Einwilligung.',
  pp_s6:'6. Speicherdauer',
  pp_ret1:'Kontodaten: bis zur Löschung des Kontos',
  pp_ret2:'Reparaturverlauf (lokal): bis zur Gerätbereinigung oder Kontolöschung',
  pp_ret3:'KI-Diagnosen / Fotos: von uns nicht dauerhaft gespeichert — Anthropic verarbeitet diese gemäß seinen eigenen API-Bedingungen (siehe Anthropic-Datenschutzerklärung)',
  pp_ret4:'Zahlungsnachweise: 10 Jahre (§ 147 AO)',
  pp_ret5:'Server-Logs (Vercel): maximal 30 Tage',
  pp_s7:'7. Ihre Rechte (DSGVO)',
  pp_r1:'Auskunft (Art. 15)', pp_r2:'Berichtigung (Art. 16)', pp_r3:'Löschung (Art. 17)', pp_r4:'Einschränkung (Art. 18)',
  pp_r5:'Datenübertragbarkeit (Art. 20)', pp_r6:'Widerspruch (Art. 21)', pp_r7:'Einwilligungswiderruf', pp_r8:'Beschwerde bei einer Aufsichtsbehörde',
  pp_rights_contact:`Zur Ausübung Ihrer Rechte senden Sie eine E-Mail an: ${privacyEmail}`,
  pp_s8:'8. Kontolöschung',
  pp_del_desc:'Sie können Ihr Konto jederzeit löschen über Mein Konto → Konto löschen. Zahlungsnachweise werden aus gesetzlichen Gründen 10 Jahre aufbewahrt. Aktive Abonnements sollten vor der Löschung über das Stripe-Kundenportal gekündigt werden.',
  pp_s9:'9. Änderungen',
  pp_changes:'Wesentliche Änderungen werden mit ausreichend Vorlauf angekündigt.',
  pp_s10:'10. Kontakt',
  pp_privacy_label:`Datenschutz: ${privacyEmail}`,
  tos_title:'Nutzungsbedingungen',
  tos_safety:'Wichtiger Sicherheitshinweis:',
  tos_safety_desc:'FixIt stellt KI-generierte Informationen bereit. Diese ersetzen NICHT die Beurteilung durch einen qualifizierten Fachmann. Bei Arbeiten an Gas-, Hochspannungs-, Tragwerk- oder Sicherheitssystemen wenden Sie sich IMMER an einen zugelassenen Fachbetrieb. Im Notfall rufen Sie den Notruf (112 / 110).',
  tos_s1:'1. Was FixIt ist',
  tos_s1_desc:'FixIt ist ein KI-gestütztes Informationswerkzeug für Heimwerker und technisch versierte Nutzer. FixIt ist kein Fachbetrieb, kein zertifizierter Handwerker, kein Ingenieur und kein Notfalldienst.',
  tos_s2:'2. KI-Transparenz (EU KI-Verordnung Art. 50)',
  tos_s2_desc:'Jede Diagnose und jede Reparaturanleitung in FixIt wird von einem KI-System generiert. KI kann Fehler machen. KI-generierte Inhalte sind als solche gekennzeichnet und ersetzen keine professionelle Beratung.',
  tos_s3:'3. Sicherheitsregeln',
  tos_s3_intro:'Nie ohne zugelassenen Fachbetrieb:',
  tos_danger1:'Gas- und Erdgasinstallationen', tos_danger2:'Arbeiten unter Spannung',
  tos_danger3:'Tragende Bauteile und Statik', tos_danger4:'Fahrzeugsicherheitssysteme (Airbag, ABS, Bremsen)',
  tos_danger5:'Gefährliche Chemikalien', tos_danger6:'Brandschutzanlagen',
  tos_s4:'4. Abonnements und Zahlung',
  tos_free_desc:'1 kostenlose KI-Diagnose.',
  tos_monthly:'Monthly (€4.99/Monat)', tos_monthly_desc:'Automatisch verlängertes Abonnement.',
  tos_yearly:'Yearly (€39.99/Jahr)', tos_yearly_desc:'Automatisch verlängertes Jahres-Abonnement.',
  tos_s5:'5. Verlängerung und Kündigung',
  tos_s5_desc:'Abonnements verlängern sich automatisch. Kündigung über: Mein Konto → Abonnement verwalten. Bereits bezahlte Zeiträume werden nicht erstattet. Zugang bleibt bis Ende des bezahlten Zeitraums erhalten.',
  tos_s6:'6. Widerrufsrecht',
  tos_s6_desc:'Verbrauchern steht ein 14-tägiges Widerrufsrecht zu. Dieses erlischt vorzeitig, wenn Sie dem sofortigen Leistungsbeginn zustimmen und bestätigen, dass Sie damit Ihr Widerrufsrecht verlieren.',
  tos_s7:'7. Geistiges Eigentum',
  tos_s7_desc:'FixIt und seine Inhalte sind Eigentum des Betreibers. Sie erhalten eine beschränkte, nicht übertragbare Lizenz zur persönlichen, nicht-kommerziellen Nutzung. Hochgeladene Fotos/Texte: Sie erteilen uns eine Lizenz zur Verarbeitung ausschließlich zur Erbringung des Dienstes.',
  tos_s8:'8. Affiliate-Hinweis',
  tos_s8_desc:'FixIt kann Links zu Produkten bei Amazon oder anderen Händlern enthalten. Als Amazon-Partner verdienen wir an qualifizierten Käufen. Dies beeinflusst keine Empfehlungen.',
  tos_s9:'9. Haftungsbeschränkung',
  tos_s9_desc:'Im Rahmen des gesetzlich Zulässigen haften wir nicht für Schäden durch Verwendung KI-generierter Inhalte.',
  tos_s9_note:'Diese Beschränkung gilt nicht für Vorsatz, grobe Fahrlässigkeit, Schäden aus der Verletzung von Leben, Körper oder Gesundheit, sowie Ansprüche nach dem Produkthaftungsgesetz. Gesetzliche Verbraucherrechte bleiben unberührt.',
  tos_s10:'10. Anwendbares Recht',
  tos_s10_desc:'Es gilt deutsches Recht. EU-Plattform zur Streitbeilegung: https://ec.europa.eu/consumers/odr — Wir nehmen an Schlichtungsverfahren nicht teil.',
  tos_s11:'11. Kontakt',
  imp_title:'Impressum',
  imp_s1:'Angaben gemäß § 5 TMG',
  imp_s2:'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
  imp_s3:'Haftungsausschluss',
  imp_h_content:'Haftung für Inhalte',
  imp_content_desc:'KI-generierte Reparaturanleitungen ersetzen nicht die Beurteilung durch einen qualifizierten Fachmann.',
  imp_h_links:'Haftung für Links',
  imp_links_desc:'Für die Inhalte verlinkter Seiten ist der jeweilige Anbieter verantwortlich.',
  imp_h_copyright:'Urheberrecht',
  imp_copyright_desc:'Die durch den Seitenbetreiber erstellten Inhalte unterliegen dem deutschen Urheberrecht.',
  imp_s4:'Streitschlichtung',
  imp_dispute:'EU-Plattform zur Online-Streitbeilegung: https://ec.europa.eu/consumers/odr — Wir sind nicht bereit, an Streitbeilegungsverfahren teilzunehmen.',
};

T.fr = {
  vatLabel:'N° TVA : ', emailLabel:'E-mail : ',
  pp_title:'Politique de confidentialité',
  pp_ai_notice:"FixIt utilise la technologie IA pour générer des diagnostics et des guides de réparation. Le contenu généré par IA peut contenir des erreurs. Vérifiez toujours les informations critiques auprès de professionnels qualifiés.",
  pp_s1:'1. Responsable du traitement',
  pp_s1_contact:`Pour toute question relative à la confidentialité, veuillez contacter : ${privacyEmail}`,
  pp_s2:'2. Données que nous traitons',
  pp_s2_account:'Données de compte (à l\'inscription)',
  pp_li_email:'Adresse e-mail (obligatoire)',
  pp_li_pwd:'Mot de passe haché (stocké chez Supabase, jamais en clair)',
  pp_li_uid:'Identifiant utilisateur (généré par le système)',
  pp_li_plan:'Statut d\'abonnement (Free / Monthly / Yearly)',
  pp_li_cid:'Identifiant client Stripe (lors du paiement)',
  pp_s2_ai:'Diagnostics IA (lors de l\'utilisation de la fonctionnalité)',
  pp_li_text:'Texte du problème que vous saisissez',
  pp_li_photo:'Facultatif : photos que vous téléchargez',
  pp_li_cat:'Type de véhicule / catégorie (vous sélectionnez)',
  pp_li_resp:'Réponse générée par IA',
  pp_li_lang:'Paramètre de langue',
  pp_ai_box:'Les photos et textes sont transmis à Anthropic, Inc. (États-Unis) pour le traitement IA. Anthropic traite ces données selon ses propres conditions d\'utilisation de l\'API. Nous vous recommandons de ne pas saisir d\'informations personnelles (noms, adresses, numéros d\'identité) dans les textes de diagnostic.',
  pp_s2_hist:'Historique des réparations',
  pp_hist_desc:'Les diagnostics sont stockés localement sur votre appareil (localStorage). Pour les utilisateurs connectés, l\'historique peut être associé à votre compte.',
  pp_s2_loc:'Localisation et GPS',
  pp_li_gps1:'Les coordonnées GPS ne sont utilisées que pour la recherche Nearby (ateliers, pièces détachées)',
  pp_li_gps2:'Les coordonnées sont envoyées à l\'API Google Places et à l\'API Overpass d\'OpenStreetMap',
  pp_li_gps3:'Nous ne stockons pas définitivement votre localisation',
  pp_s2_pay:'Données de paiement',
  pp_pay_desc:'Les paiements sont entièrement gérés par Stripe (États-Unis). Nous ne stockons aucune donnée de carte bancaire. Nous recevons uniquement des confirmations (statut d\'abonnement, identifiant client Stripe) via webhook.',
  pp_s2_logs:'Journaux serveur et adresses IP',
  pp_logs_desc:'Vercel (hébergement) et Supabase (base de données) traitent les adresses IP et les horodatages d\'accès dans le cadre de leurs opérations. Nous ne maintenons pas de journaux supplémentaires. Vercel conserve les journaux 30 jours maximum.',
  pp_s3:'3. Bases légales',
  pp_s3_b:'Exécution du contrat (Art. 6(1)(b) RGPD) :', pp_s3_b_v:'Gestion du compte, abonnement, diagnostics IA',
  pp_s3_f:'Intérêts légitimes (Art. 6(1)(f) RGPD) :', pp_s3_f_v:'Sécurité, prévention de la fraude, amélioration du service',
  pp_s3_c:'Obligation légale (Art. 6(1)(c) RGPD) :', pp_s3_c_v:'Conservation des documents comptables (§ 147 AO : 10 ans)',
  pp_s4:'4. Prestataires tiers',
  pp_role:'Rôle :', pp_data:'Données :', pp_country:'Pays :', pp_mechanism:'Mécanisme de transfert :', pp_policy_link:'Politique de confidentialité',
  pp_s5:'5. Stockage local',
  pp_ls_desc:'FixIt utilise localStorage et sessionStorage uniquement pour des fonctions strictement nécessaires. Aucun cookie de suivi, publicitaire ou analytique n\'est utilisé.',
  pp_ls_keys:'Clés utilisées :',
  pp_ls_hist:'Historique des réparations (local)', pp_ls_lang:'Préférence de langue', pp_ls_onb:'Statut d\'intégration',
  pp_ls_free:'Diagnostic gratuit utilisé', pp_ls_user:'Données utilisateur locales (mode invité)', pp_ls_auth:'Session d\'authentification (Supabase)',
  pp_ls_tdddg:'En vertu du § 25 TDDDG, ce stockage est strictement nécessaire et ne requiert pas de consentement.',
  pp_s6:'6. Durées de conservation',
  pp_ret1:'Données de compte : jusqu\'à la suppression du compte',
  pp_ret2:'Historique des réparations (local) : jusqu\'à l\'effacement de l\'appareil ou la suppression du compte',
  pp_ret3:'Diagnostics IA / photos : non stockés définitivement par nous — Anthropic les traite selon ses propres conditions d\'utilisation de l\'API',
  pp_ret4:'Documents comptables : 10 ans (§ 147 AO)',
  pp_ret5:'Journaux serveur (Vercel) : 30 jours maximum',
  pp_s7:'7. Vos droits (RGPD)',
  pp_r1:'Accès (Art. 15)', pp_r2:'Rectification (Art. 16)', pp_r3:'Effacement (Art. 17)', pp_r4:'Limitation (Art. 18)',
  pp_r5:'Portabilité (Art. 20)', pp_r6:'Opposition (Art. 21)', pp_r7:'Retrait du consentement', pp_r8:'Réclamation auprès d\'une autorité de contrôle',
  pp_rights_contact:`Pour exercer vos droits, envoyez un e-mail à : ${privacyEmail}`,
  pp_s8:'8. Suppression du compte',
  pp_del_desc:'Vous pouvez supprimer votre compte à tout moment via Mon compte → Supprimer le compte. Les documents comptables sont conservés 10 ans pour des raisons légales. Les abonnements actifs doivent être annulés via le portail client Stripe avant la suppression.',
  pp_s9:'9. Modifications',
  pp_changes:'Les modifications importantes seront communiquées avec un préavis raisonnable.',
  pp_s10:'10. Contact',
  pp_privacy_label:`Confidentialité : ${privacyEmail}`,
  tos_title:'Conditions d\'utilisation',
  tos_safety:'Avis de sécurité important :',
  tos_safety_desc:'FixIt fournit des informations générées par IA. Cela ne remplace PAS l\'évaluation d\'un professionnel qualifié. Pour les travaux sur le gaz, l\'électricité haute tension, la structure ou les systèmes de sécurité, contactez TOUJOURS un professionnel agréé. En cas d\'urgence, appelez les secours (112).',
  tos_s1:'1. Ce qu\'est FixIt',
  tos_s1_desc:'FixIt est un outil d\'information alimenté par IA pour les bricoleurs. FixIt n\'est pas une entreprise artisanale, un technicien certifié, un ingénieur ou un service d\'urgence.',
  tos_s2:'2. Transparence IA (Règlement IA de l\'UE Art. 50)',
  tos_s2_desc:'Chaque diagnostic et guide de réparation dans FixIt est généré par un système IA. L\'IA peut faire des erreurs. Le contenu généré par IA est signalé comme tel et ne remplace pas les conseils professionnels.',
  tos_s3:'3. Règles de sécurité',
  tos_s3_intro:'Ne jamais effectuer sans professionnel agréé :',
  tos_danger1:'Installations gaz et gaz naturel', tos_danger2:'Travaux électriques sous tension',
  tos_danger3:'Éléments structurels', tos_danger4:'Systèmes de sécurité du véhicule (airbag, ABS, freins)',
  tos_danger5:'Produits chimiques dangereux', tos_danger6:'Systèmes de protection incendie',
  tos_s4:'4. Abonnements et paiement',
  tos_free_desc:'1 diagnostic IA gratuit.',
  tos_monthly:'Mensuel (€4,99/mois)', tos_monthly_desc:'Abonnement à renouvellement automatique.',
  tos_yearly:'Annuel (€39,99/an)', tos_yearly_desc:'Abonnement annuel à renouvellement automatique.',
  tos_s5:'5. Renouvellement et résiliation',
  tos_s5_desc:'Les abonnements se renouvellent automatiquement. Annulez via : Mon compte → Gérer l\'abonnement. Les périodes payées ne sont pas remboursées. L\'accès reste disponible jusqu\'à la fin de la période payée.',
  tos_s6:'6. Droit de rétractation',
  tos_s6_desc:'Les consommateurs ont un droit de rétractation de 14 jours. Ce droit expire prématurément si vous consentez à ce que l\'exécution commence avant l\'expiration du délai et reconnaissez ainsi perdre votre droit de rétractation.',
  tos_s7:'7. Propriété intellectuelle',
  tos_s7_desc:'FixIt et son contenu appartiennent à l\'opérateur. Vous recevez une licence limitée et non transférable pour un usage personnel et non commercial. Photos/textes téléchargés : vous accordez une licence pour les traiter uniquement dans le cadre du service.',
  tos_s8:'8. Divulgation d\'affiliation',
  tos_s8_desc:'FixIt peut contenir des liens affiliés Amazon. En tant qu\'associé Amazon, nous gagnons sur les achats éligibles. Cela n\'influence pas les recommandations.',
  tos_s9:'9. Limitation de responsabilité',
  tos_s9_desc:'Dans les limites permises par la loi, nous ne sommes pas responsables des dommages résultant de l\'utilisation du contenu généré par IA.',
  tos_s9_note:'Cette limitation ne s\'applique pas à l\'intention, à la négligence grave, aux atteintes à la vie, au corps ou à la santé, ni aux réclamations en responsabilité du fait des produits. Les droits légaux des consommateurs restent inchangés.',
  tos_s10:'10. Droit applicable',
  tos_s10_desc:'Le droit allemand s\'applique. Plateforme européenne de règlement des litiges : https://ec.europa.eu/consumers/odr — Nous ne participons pas aux procédures de règlement des litiges.',
  tos_s11:'11. Contact',
  imp_title:'Mentions légales',
  imp_s1:'Informations conformément au § 5 TMG',
  imp_s2:'Responsable du contenu conformément au § 18 al. 2 MStV',
  imp_s3:'Avis de non-responsabilité',
  imp_h_content:'Responsabilité pour le contenu',
  imp_content_desc:'Les guides de réparation générés par IA ne remplacent pas l\'évaluation d\'un professionnel qualifié.',
  imp_h_links:'Responsabilité pour les liens',
  imp_links_desc:'Le fournisseur respectif est responsable du contenu des sites liés.',
  imp_h_copyright:'Droit d\'auteur',
  imp_copyright_desc:'Le contenu créé par l\'opérateur est soumis au droit d\'auteur allemand.',
  imp_s4:'Règlement des litiges',
  imp_dispute:'Plateforme européenne de règlement des litiges en ligne : https://ec.europa.eu/consumers/odr — Nous ne sommes pas disposés à participer aux procédures de règlement des litiges.',
};

T.es = {
  vatLabel:'NIF/CIF: ', emailLabel:'Correo: ',
  pp_title:'Política de privacidad',
  pp_ai_notice:'FixIt utiliza tecnología de IA para generar diagnósticos y guías de reparación. El contenido generado por IA puede contener errores. Verifique siempre la información crítica con profesionales cualificados.',
  pp_s1:'1. Responsable del tratamiento',
  pp_s1_contact:`Para preguntas sobre privacidad, contacte: ${privacyEmail}`,
  pp_s2:'2. Datos que tratamos', pp_s2_account:'Datos de cuenta (al registrarse)',
  pp_li_email:'Dirección de correo electrónico (obligatoria)',
  pp_li_pwd:'Contraseña cifrada (almacenada en Supabase, nunca en texto plano)',
  pp_li_uid:'ID de usuario (generado por el sistema)', pp_li_plan:'Estado de suscripción (Free / Monthly / Yearly)',
  pp_li_cid:'ID de cliente de Stripe (al pagar)',
  pp_s2_ai:'Diagnósticos de IA (al usar la función)', pp_li_text:'Texto del problema que introduce',
  pp_li_photo:'Opcional: fotos que sube', pp_li_cat:'Tipo de vehículo / categoría (usted selecciona)',
  pp_li_resp:'Respuesta generada por IA', pp_li_lang:'Configuración de idioma',
  pp_ai_box:`Las fotos y textos se transmiten a Anthropic, Inc. (EE.UU.) para el procesamiento de IA. Anthropic procesa estos datos según sus propios términos de la API. Recomendamos no introducir información personal (nombres, direcciones, números de identificación) en los textos de diagnóstico.`,
  pp_s2_hist:'Historial de reparaciones',
  pp_hist_desc:'Los diagnósticos se almacenan localmente en su dispositivo (localStorage). Para usuarios conectados, el historial puede estar asociado a su cuenta.',
  pp_s2_loc:'Ubicación y GPS',
  pp_li_gps1:'Las coordenadas GPS solo se usan para la búsqueda Nearby (talleres, repuestos)',
  pp_li_gps2:'Las coordenadas se envían a la API de Google Places y a la API Overpass de OpenStreetMap',
  pp_li_gps3:'No almacenamos su ubicación de forma permanente',
  pp_s2_pay:'Datos de pago',
  pp_pay_desc:'Los pagos son gestionados íntegramente por Stripe (EE.UU.). No almacenamos datos de tarjetas. Solo recibimos confirmaciones (estado de suscripción, ID de cliente Stripe) via webhook.',
  pp_s2_logs:'Registros del servidor y direcciones IP',
  pp_logs_desc:'Vercel (alojamiento) y Supabase (base de datos) procesan direcciones IP y marcas de tiempo de acceso en el marco de sus operaciones. No mantenemos registros adicionales. Vercel conserva los registros un máximo de 30 días.',
  pp_s3:'3. Bases jurídicas',
  pp_s3_b:'Ejecución del contrato (Art. 6(1)(b) RGPD):', pp_s3_b_v:'Gestión de cuentas, suscripción, diagnósticos IA',
  pp_s3_f:'Intereses legítimos (Art. 6(1)(f) RGPD):', pp_s3_f_v:'Seguridad, prevención del fraude, mejora del servicio',
  pp_s3_c:'Obligación legal (Art. 6(1)(c) RGPD):', pp_s3_c_v:'Conservación de registros contables (§ 147 AO: 10 años)',
  pp_s4:'4. Terceros proveedores',
  pp_role:'Función:', pp_data:'Datos:', pp_country:'País:', pp_mechanism:'Mecanismo de transferencia:', pp_policy_link:'Política de privacidad',
  pp_s5:'5. Almacenamiento local',
  pp_ls_desc:'FixIt usa localStorage y sessionStorage únicamente para funciones estrictamente necesarias. No se utilizan cookies de seguimiento, publicidad ni analítica.',
  pp_ls_keys:'Claves usadas:', pp_ls_hist:'Historial de reparaciones (local)', pp_ls_lang:'Preferencia de idioma',
  pp_ls_onb:'Estado de incorporación', pp_ls_free:'Diagnóstico gratuito utilizado',
  pp_ls_user:'Datos de usuario locales (modo invitado)', pp_ls_auth:'Sesión de autenticación (Supabase)',
  pp_ls_tdddg:'Según el § 25 TDDDG, este almacenamiento es estrictamente necesario y no requiere consentimiento.',
  pp_s6:'6. Períodos de retención',
  pp_ret1:'Datos de cuenta: hasta la eliminación de la cuenta',
  pp_ret2:'Historial de reparaciones (local): hasta el borrado del dispositivo o la eliminación de la cuenta',
  pp_ret3:'Diagnósticos IA / fotos: no almacenados permanentemente por nosotros — Anthropic los procesa según sus propios términos de API',
  pp_ret4:'Registros contables: 10 años (§ 147 AO)', pp_ret5:'Registros del servidor (Vercel): máximo 30 días',
  pp_s7:'7. Sus derechos (RGPD)',
  pp_r1:'Acceso (Art. 15)', pp_r2:'Rectificación (Art. 16)', pp_r3:'Supresión (Art. 17)', pp_r4:'Limitación (Art. 18)',
  pp_r5:'Portabilidad (Art. 20)', pp_r6:'Oposición (Art. 21)', pp_r7:'Retirada del consentimiento', pp_r8:'Reclamación ante una autoridad de control',
  pp_rights_contact:`Para ejercer sus derechos, envíe un correo a: ${privacyEmail}`,
  pp_s8:'8. Eliminación de cuenta',
  pp_del_desc:'Puede eliminar su cuenta en cualquier momento desde Mi cuenta → Eliminar cuenta. Los registros contables se conservan 10 años por razones legales. Las suscripciones activas deben cancelarse a través del portal de clientes de Stripe antes de la eliminación.',
  pp_s9:'9. Cambios', pp_changes:'Los cambios importantes se comunicarán con suficiente antelación.',
  pp_s10:'10. Contacto', pp_privacy_label:`Privacidad: ${privacyEmail}`,
  tos_title:'Términos de servicio', tos_safety:'Aviso de seguridad importante:',
  tos_safety_desc:'FixIt proporciona información generada por IA. Esto NO reemplaza la evaluación de un profesional cualificado. Para trabajos en gas, alta tensión, estructura o sistemas de seguridad, contacte SIEMPRE a un profesional autorizado. En caso de emergencia, llame al 112.',
  tos_s1:'1. Qué es FixIt', tos_s1_desc:'FixIt es una herramienta de información con IA para usuarios de bricolaje. FixIt no es una empresa artesanal, técnico certificado, ingeniero ni servicio de emergencias.',
  tos_s2:'2. Transparencia IA (Reglamento IA de la UE Art. 50)', tos_s2_desc:'Cada diagnóstico y guía de reparación en FixIt es generado por un sistema de IA. La IA puede cometer errores. El contenido generado por IA está etiquetado como tal y no reemplaza el asesoramiento profesional.',
  tos_s3:'3. Normas de seguridad', tos_s3_intro:'Nunca sin profesional autorizado:',
  tos_danger1:'Instalaciones de gas y gas natural', tos_danger2:'Trabajos eléctricos en tensión',
  tos_danger3:'Elementos estructurales', tos_danger4:'Sistemas de seguridad del vehículo (airbag, ABS, frenos)',
  tos_danger5:'Productos químicos peligrosos', tos_danger6:'Sistemas de protección contra incendios',
  tos_s4:'4. Suscripciones y pago',
  tos_free_desc:'1 diagnóstico IA gratuito.',
  tos_monthly:'Mensual (€4,99/mes)', tos_monthly_desc:'Suscripción de renovación automática.',
  tos_yearly:'Anual (€39,99/año)', tos_yearly_desc:'Suscripción anual de renovación automática.',
  tos_s5:'5. Renovación y cancelación', tos_s5_desc:'Las suscripciones se renuevan automáticamente. Cancele desde: Mi cuenta → Gestionar suscripción. Los períodos pagados no se reembolsan. El acceso permanece hasta el final del período pagado.',
  tos_s6:'6. Derecho de desistimiento', tos_s6_desc:'Los consumidores tienen un derecho de desistimiento de 14 días. Este derecho expira anticipadamente si consiente que la ejecución comience antes del plazo y reconoce así perder su derecho de desistimiento.',
  tos_s7:'7. Propiedad intelectual', tos_s7_desc:'FixIt y su contenido son propiedad del operador. Recibe una licencia limitada e intransferible para uso personal y no comercial. Fotos/textos subidos: otorga una licencia para procesarlos únicamente para la prestación del servicio.',
  tos_s8:'8. Divulgación de afiliados', tos_s8_desc:'FixIt puede contener enlaces de afiliados de Amazon. Como asociado de Amazon, ganamos por las compras calificadas. Esto no influye en las recomendaciones.',
  tos_s9:'9. Limitación de responsabilidad', tos_s9_desc:'En la medida permitida por la ley, no somos responsables de los daños derivados del uso del contenido generado por IA.',
  tos_s9_note:'Esta limitación no se aplica a la intención, negligencia grave, lesiones a la vida, cuerpo o salud, ni a reclamaciones de responsabilidad por productos. Los derechos legales de los consumidores no se ven afectados.',
  tos_s10:'10. Ley aplicable', tos_s10_desc:'Se aplica la ley alemana. Plataforma europea de resolución de litigios: https://ec.europa.eu/consumers/odr — No participamos en procedimientos de resolución de litigios.',
  tos_s11:'11. Contacto',
  imp_title:'Aviso legal', imp_s1:'Información según el § 5 TMG',
  imp_s2:'Responsable del contenido según el § 18 párr. 2 MStV',
  imp_s3:'Descargo de responsabilidad', imp_h_content:'Responsabilidad por el contenido',
  imp_content_desc:'Las guías de reparación generadas por IA no reemplazan la evaluación de un profesional cualificado.',
  imp_h_links:'Responsabilidad por los enlaces', imp_links_desc:'El proveedor respectivo es responsable del contenido de los sitios enlazados.',
  imp_h_copyright:'Derechos de autor', imp_copyright_desc:'El contenido creado por el operador está sujeto a la ley de derechos de autor alemana.',
  imp_s4:'Resolución de litigios', imp_dispute:'Plataforma europea de resolución de litigios en línea: https://ec.europa.eu/consumers/odr — No estamos dispuestos a participar en procedimientos de resolución de litigios.',
};

// For it, pl, sr, hr, mk, tr — full legal text in those languages
// using professional translations of the same structure
T.it = { vatLabel:'P.IVA: ', emailLabel:'Email: ', pp_title:'Informativa sulla privacy', pp_ai_notice:'FixIt utilizza la tecnologia AI per generare diagnosi e guide di riparazione. Il contenuto generato dall\'AI può contenere errori. Verificate sempre le informazioni critiche con professionisti qualificati.', pp_s1:'1. Titolare del trattamento', pp_s1_contact:`Per domande sulla privacy, contattare: ${privacyEmail}`, pp_s2:'2. Dati che trattiamo', pp_s2_account:'Dati account (alla registrazione)', pp_li_email:'Indirizzo e-mail (obbligatorio)', pp_li_pwd:'Password con hash (archiviata su Supabase, mai in chiaro)', pp_li_uid:'ID utente (generato dal sistema)', pp_li_plan:'Stato abbonamento (Free / Monthly / Yearly)', pp_li_cid:'ID cliente Stripe (al pagamento)', pp_s2_ai:'Diagnosi AI (quando si utilizza la funzione)', pp_li_text:'Testo del problema inserito', pp_li_photo:'Facoltativo: foto caricate', pp_li_cat:'Tipo di veicolo / categoria (selezionato dall\'utente)', pp_li_resp:'Risposta generata dall\'AI', pp_li_lang:'Impostazione lingua', pp_ai_box:`Le foto e i testi vengono trasmessi ad Anthropic, Inc. (USA) per l'elaborazione AI. Anthropic tratta questi dati secondo i propri termini di utilizzo dell'API. Si consiglia di non inserire informazioni personali nei testi di diagnosi.`, pp_s2_hist:'Cronologia riparazioni', pp_hist_desc:'Le diagnosi sono archiviate localmente sul dispositivo (localStorage). Per gli utenti registrati, la cronologia può essere associata all\'account.', pp_s2_loc:'Posizione e GPS', pp_li_gps1:'Le coordinate GPS sono utilizzate solo per la ricerca Nearby (officine, ricambi)', pp_li_gps2:'Le coordinate vengono inviate all\'API Google Places e all\'API Overpass di OpenStreetMap', pp_li_gps3:'Non archiviamo definitivamente la vostra posizione', pp_s2_pay:'Dati di pagamento', pp_pay_desc:'I pagamenti sono gestiti interamente da Stripe (USA). Non archiviamo dati delle carte. Riceviamo solo conferme (stato abbonamento, ID cliente Stripe) tramite webhook.', pp_s2_logs:'Log del server e indirizzi IP', pp_logs_desc:'Vercel (hosting) e Supabase (database) trattano indirizzi IP e timestamp di accesso nell\'ambito delle loro operazioni. Non conserviamo log aggiuntivi. Vercel conserva i log per un massimo di 30 giorni.', pp_s3:'3. Basi giuridiche', pp_s3_b:'Esecuzione del contratto (Art. 6(1)(b) GDPR):', pp_s3_b_v:'Gestione account, abbonamento, diagnosi AI', pp_s3_f:'Interessi legittimi (Art. 6(1)(f) GDPR):', pp_s3_f_v:'Sicurezza, prevenzione delle frodi, miglioramento del servizio', pp_s3_c:'Obbligo legale (Art. 6(1)(c) GDPR):', pp_s3_c_v:'Conservazione dei documenti contabili (§ 147 AO: 10 anni)', pp_s4:'4. Fornitori terzi', pp_role:'Ruolo:', pp_data:'Dati:', pp_country:'Paese:', pp_mechanism:'Meccanismo di trasferimento:', pp_policy_link:'Informativa sulla privacy', pp_s5:'5. Archiviazione locale', pp_ls_desc:'FixIt utilizza localStorage e sessionStorage solo per funzioni strettamente necessarie. Non vengono utilizzati cookie di tracciamento, pubblicitari o analitici.', pp_ls_keys:'Chiavi utilizzate:', pp_ls_hist:'Cronologia riparazioni (locale)', pp_ls_lang:'Preferenza lingua', pp_ls_onb:'Stato onboarding', pp_ls_free:'Diagnosi gratuita utilizzata', pp_ls_user:'Dati utente locali (modalità ospite)', pp_ls_auth:'Sessione autenticazione (Supabase)', pp_ls_tdddg:'Ai sensi del § 25 TDDDG, questo archiviazione è strettamente necessaria e non richiede consenso.', pp_s6:'6. Periodi di conservazione', pp_ret1:'Dati account: fino all\'eliminazione dell\'account', pp_ret2:'Cronologia riparazioni (locale): fino alla cancellazione del dispositivo o all\'eliminazione dell\'account', pp_ret3:'Diagnosi AI / foto: non archiviate definitivamente da noi — Anthropic le tratta secondo i propri termini API', pp_ret4:'Documenti contabili: 10 anni (§ 147 AO)', pp_ret5:'Log server (Vercel): massimo 30 giorni', pp_s7:'7. I vostri diritti (GDPR)', pp_r1:'Accesso (Art. 15)', pp_r2:'Rettifica (Art. 16)', pp_r3:'Cancellazione (Art. 17)', pp_r4:'Limitazione (Art. 18)', pp_r5:'Portabilità (Art. 20)', pp_r6:'Opposizione (Art. 21)', pp_r7:'Revoca del consenso', pp_r8:'Reclamo presso un\'autorità di controllo', pp_rights_contact:`Per esercitare i vostri diritti, inviate un'e-mail a: ${privacyEmail}`, pp_s8:'8. Eliminazione account', pp_del_desc:`Potete eliminare il vostro account in qualsiasi momento da Il mio account → Elimina account. I documenti contabili sono conservati per 10 anni per motivi legali. Gli abbonamenti attivi devono essere annullati tramite il portale clienti Stripe prima dell'eliminazione.`, pp_s9:'9. Modifiche', pp_changes:'Le modifiche sostanziali saranno comunicate con ragionevole preavviso.', pp_s10:'10. Contatto', pp_privacy_label:`Privacy: ${privacyEmail}`, tos_title:'Termini di servizio', tos_safety:'Avviso di sicurezza importante:', tos_safety_desc:'FixIt fornisce informazioni generate dall\'AI. Questo NON sostituisce la valutazione di un professionista qualificato. Per lavori su gas, alta tensione, strutture o sistemi di sicurezza, contattate SEMPRE un professionista autorizzato. In caso di emergenza, chiamate il 112.', tos_s1:'1. Cos\'è FixIt', tos_s1_desc:'FixIt è uno strumento informativo basato sull\'AI per appassionati del fai-da-te. FixIt non è un\'impresa artigianale, un tecnico certificato, un ingegnere né un servizio di emergenza.', tos_s2:'2. Trasparenza AI (Regolamento IA UE Art. 50)', tos_s2_desc:'Ogni diagnosi e guida di riparazione in FixIt è generata da un sistema AI. L\'AI può commettere errori. Il contenuto generato dall\'AI è etichettato come tale e non sostituisce la consulenza professionale.', tos_s3:'3. Regole di sicurezza', tos_s3_intro:'Mai senza professionista autorizzato:', tos_danger1:'Impianti a gas e gas naturale', tos_danger2:'Lavori elettrici sotto tensione', tos_danger3:'Elementi strutturali', tos_danger4:'Sistemi di sicurezza del veicolo (airbag, ABS, freni)', tos_danger5:'Sostanze chimiche pericolose', tos_danger6:'Sistemi antincendio', tos_s4:'4. Abbonamenti e pagamento', tos_free_desc:'1 diagnosi AI gratuita.', tos_monthly:'Mensile (€4,99/mese)', tos_monthly_desc:'Abbonamento a rinnovo automatico.', tos_yearly:'Annuale (€39,99/anno)', tos_yearly_desc:'Abbonamento annuale a rinnovo automatico.', tos_s5:'5. Rinnovo e cancellazione', tos_s5_desc:'Gli abbonamenti si rinnovano automaticamente. Annullate tramite: Il mio account → Gestisci abbonamento. I periodi pagati non vengono rimborsati. L\'accesso rimane fino alla fine del periodo pagato.', tos_s6:'6. Diritto di recesso', tos_s6_desc:'I consumatori hanno un diritto di recesso di 14 giorni. Questo diritto decade anticipatamente se acconsentite che l\'esecuzione inizi prima della scadenza del termine e riconoscete così di perdere il vostro diritto di recesso.', tos_s7:'7. Proprietà intellettuale', tos_s7_desc:'FixIt e il suo contenuto sono di proprietà dell\'operatore. Ricevete una licenza limitata e non trasferibile per uso personale e non commerciale. Foto/testi caricati: concedete una licenza per elaborarli unicamente per la fornitura del servizio.', tos_s8:'8. Divulgazione di affiliazione', tos_s8_desc:'FixIt può contenere link di affiliazione Amazon. Come associato Amazon, guadagniamo sugli acquisti idonei. Questo non influenza le raccomandazioni.', tos_s9:'9. Limitazione di responsabilità', tos_s9_desc:'Nella misura consentita dalla legge, non siamo responsabili per i danni derivanti dall\'utilizzo del contenuto generato dall\'AI.', tos_s9_note:'Questa limitazione non si applica a dolo, colpa grave, lesioni alla vita, al corpo o alla salute, né a rivendicazioni di responsabilità da prodotto. I diritti legali dei consumatori restano invariati.', tos_s10:'10. Legge applicabile', tos_s10_desc:'Si applica la legge tedesca. Piattaforma europea di risoluzione delle controversie: https://ec.europa.eu/consumers/odr — Non partecipiamo a procedure di risoluzione delle controversie.', tos_s11:'11. Contatto', imp_title:'Note legali', imp_s1:'Informazioni ai sensi del § 5 TMG', imp_s2:'Responsabile del contenuto ai sensi del § 18 c. 2 MStV', imp_s3:'Esclusione di responsabilità', imp_h_content:'Responsabilità per il contenuto', imp_content_desc:'Le guide di riparazione generate dall\'AI non sostituiscono la valutazione di un professionista qualificato.', imp_h_links:'Responsabilità per i link', imp_links_desc:'Il rispettivo fornitore è responsabile del contenuto dei siti collegati.', imp_h_copyright:'Diritto d\'autore', imp_copyright_desc:'Il contenuto creato dall\'operatore è soggetto al diritto d\'autore tedesco.', imp_s4:'Risoluzione delle controversie', imp_dispute:'Piattaforma europea per la risoluzione delle controversie online: https://ec.europa.eu/consumers/odr — Non siamo disposti a partecipare a procedure di risoluzione delle controversie.' };

T.pl = { vatLabel:'NIP: ', emailLabel:'E-mail: ', pp_title:'Polityka prywatności', pp_ai_notice:'FixIt używa technologii AI do generowania diagnoz i poradników naprawczych. Treści generowane przez AI mogą zawierać błędy. Zawsze weryfikuj kluczowe informacje z wykwalifikowanymi specjalistami.', pp_s1:'1. Administrator danych', pp_s1_contact:`W sprawach prywatności prosimy o kontakt: ${privacyEmail}`, pp_s2:'2. Przetwarzane dane', pp_s2_account:'Dane konta (przy rejestracji)', pp_li_email:'Adres e-mail (wymagany)', pp_li_pwd:'Hasło w postaci skrótu (przechowywane w Supabase, nigdy w postaci jawnej)', pp_li_uid:'ID użytkownika (generowane przez system)', pp_li_plan:'Status subskrypcji (Free / Monthly / Yearly)', pp_li_cid:'ID klienta Stripe (przy płatności)', pp_s2_ai:'Diagnozy AI (przy korzystaniu z funkcji)', pp_li_text:'Tekst problemu, który wprowadzasz', pp_li_photo:'Opcjonalnie: zdjęcia, które przesyłasz', pp_li_cat:'Typ pojazdu / kategoria (wybrana przez użytkownika)', pp_li_resp:'Odpowiedź wygenerowana przez AI', pp_li_lang:'Ustawienie języka', pp_ai_box:`Zdjęcia i teksty są przekazywane do Anthropic, Inc. (USA) w celu przetwarzania przez AI. Anthropic przetwarza te dane zgodnie z własnymi warunkami korzystania z API. Zalecamy, aby nie podawać danych osobowych (imion, adresów, numerów dokumentów) w tekstach diagnozy.`, pp_s2_hist:'Historia napraw', pp_hist_desc:'Diagnozy są przechowywane lokalnie na Twoim urządzeniu (localStorage). Dla zalogowanych użytkowników historia może być powiązana z kontem.', pp_s2_loc:'Lokalizacja i GPS', pp_li_gps1:'Współrzędne GPS są używane wyłącznie do wyszukiwania Nearby (warsztaty, sklepy z częściami)', pp_li_gps2:'Współrzędne są wysyłane do Google Places API i Overpass API OpenStreetMap', pp_li_gps3:'Nie przechowujemy Twojej lokalizacji na stałe', pp_s2_pay:'Dane płatności', pp_pay_desc:'Płatności są obsługiwane wyłącznie przez Stripe (USA). Nie przechowujemy danych kart płatniczych. Otrzymujemy tylko potwierdzenia (status subskrypcji, ID klienta Stripe) przez webhook.', pp_s2_logs:'Logi serwera i adresy IP', pp_logs_desc:'Vercel (hosting) i Supabase (baza danych) przetwarzają adresy IP i znaczniki czasu dostępu w ramach swojej działalności. Nie prowadzimy dodatkowych logów. Vercel przechowuje logi przez maksymalnie 30 dni.', pp_s3:'3. Podstawy prawne', pp_s3_b:'Wykonanie umowy (Art. 6(1)(b) RODO):', pp_s3_b_v:'Zarządzanie kontem, subskrypcja, diagnozy AI', pp_s3_f:'Uzasadniony interes (Art. 6(1)(f) RODO):', pp_s3_f_v:'Bezpieczeństwo, zapobieganie oszustwom, ulepszanie usług', pp_s3_c:'Obowiązek prawny (Art. 6(1)(c) RODO):', pp_s3_c_v:'Przechowywanie dokumentów księgowych (§ 147 AO: 10 lat)', pp_s4:'4. Dostawcy zewnętrzni', pp_role:'Rola:', pp_data:'Dane:', pp_country:'Kraj:', pp_mechanism:'Mechanizm transferu:', pp_policy_link:'Polityka prywatności', pp_s5:'5. Przechowywanie lokalne', pp_ls_desc:'FixIt używa localStorage i sessionStorage wyłącznie do niezbędnych funkcji. Nie są używane żadne pliki cookie śledzące, reklamowe ani analityczne.', pp_ls_keys:'Używane klucze:', pp_ls_hist:'Historia napraw (lokalna)', pp_ls_lang:'Preferencja języka', pp_ls_onb:'Status wdrożenia', pp_ls_free:'Bezpłatna diagnoza wykorzystana', pp_ls_user:'Lokalne dane użytkownika (tryb gościa)', pp_ls_auth:'Sesja uwierzytelniania (Supabase)', pp_ls_tdddg:'Zgodnie z § 25 TDDDG to przechowywanie jest niezbędne i nie wymaga zgody.', pp_s6:'6. Okresy przechowywania', pp_ret1:'Dane konta: do usunięcia konta', pp_ret2:'Historia napraw (lokalna): do wyczyszczenia urządzenia lub usunięcia konta', pp_ret3:'Diagnozy AI / zdjęcia: nie przechowywane trwale przez nas — Anthropic przetwarza je zgodnie z własnymi warunkami API', pp_ret4:'Dokumenty księgowe: 10 lat (§ 147 AO)', pp_ret5:'Logi serwera (Vercel): maksymalnie 30 dni', pp_s7:'7. Twoje prawa (RODO)', pp_r1:'Dostęp (Art. 15)', pp_r2:'Sprostowanie (Art. 16)', pp_r3:'Usunięcie (Art. 17)', pp_r4:'Ograniczenie przetwarzania (Art. 18)', pp_r5:'Przenoszenie danych (Art. 20)', pp_r6:'Sprzeciw (Art. 21)', pp_r7:'Wycofanie zgody', pp_r8:'Skarga do organu nadzorczego', pp_rights_contact:`Aby skorzystać ze swoich praw, wyślij e-mail na: ${privacyEmail}`, pp_s8:'8. Usunięcie konta', pp_del_desc:'Możesz usunąć swoje konto w dowolnym momencie w sekcji Moje konto → Usuń konto. Dokumenty księgowe są przechowywane przez 10 lat ze względów prawnych. Aktywne subskrypcje należy anulować w portalu klienta Stripe przed usunięciem.', pp_s9:'9. Zmiany', pp_changes:'O istotnych zmianach poinformujemy z wyprzedzeniem.', pp_s10:'10. Kontakt', pp_privacy_label:`Prywatność: ${privacyEmail}`, tos_title:'Warunki korzystania', tos_safety:'Ważna informacja o bezpieczeństwie:', tos_safety_desc:'FixIt dostarcza informacje generowane przez AI. Nie zastępuje to oceny wykwalifikowanego specjalisty. Przy pracach przy gazie, wysokim napięciu, konstrukcjach nośnych lub systemach bezpieczeństwa ZAWSZE skontaktuj się z licencjonowanym specjalistą. W nagłych przypadkach zadzwoń pod numer 112.', tos_s1:'1. Czym jest FixIt', tos_s1_desc:'FixIt to narzędzie informacyjne oparte na AI dla majsterkowiczów. FixIt nie jest firmą rzemieślniczą, certyfikowanym technikiem, inżynierem ani służbą ratunkową.', tos_s2:'2. Przejrzystość AI (Rozporządzenie AI UE Art. 50)', tos_s2_desc:'Każda diagnoza i poradnik naprawczy w FixIt jest generowany przez system AI. AI może popełniać błędy. Treści generowane przez AI są jako takie oznaczone i nie zastępują profesjonalnego doradztwa.', tos_s3:'3. Zasady bezpieczeństwa', tos_s3_intro:'Nigdy bez licencjonowanego specjalisty:', tos_danger1:'Instalacje gazowe i ziemnogaz', tos_danger2:'Prace elektryczne pod napięciem', tos_danger3:'Elementy konstrukcyjne', tos_danger4:'Systemy bezpieczeństwa pojazdu (poduszki powietrzne, ABS, hamulce)', tos_danger5:'Niebezpieczne chemikalia', tos_danger6:'Systemy ochrony przeciwpożarowej', tos_s4:'4. Subskrypcje i płatności', tos_free_desc:'1 bezpłatna diagnoza AI.', tos_monthly:'Miesięczna (€4,99/miesiąc)', tos_monthly_desc:'Subskrypcja automatycznie odnawiana.', tos_yearly:'Roczna (€39,99/rok)', tos_yearly_desc:'Roczna subskrypcja automatycznie odnawiana.', tos_s5:'5. Odnawianie i anulowanie', tos_s5_desc:'Subskrypcje odnawiają się automatycznie. Anuluj przez: Moje konto → Zarządzaj subskrypcją. Zapłacone okresy nie podlegają zwrotowi. Dostęp pozostaje do końca opłaconego okresu.', tos_s6:'6. Prawo odstąpienia od umowy', tos_s6_desc:'Konsumentom przysługuje 14-dniowe prawo odstąpienia od umowy. Wygasa ono przed terminem, jeśli wyrazisz zgodę na rozpoczęcie świadczenia przed upływem okresu odstąpienia i potwierdzisz utratę tego prawa.', tos_s7:'7. Własność intelektualna', tos_s7_desc:'FixIt i jego treści są własnością operatora. Otrzymujesz ograniczoną, nieprzenoszalną licencję do użytku osobistego i niekomercyjnego. Przesłane zdjęcia/teksty: udzielasz licencji na ich przetwarzanie wyłącznie w celu świadczenia usługi.', tos_s8:'8. Ujawnienie afiliacji', tos_s8_desc:'FixIt może zawierać linki afiliacyjne Amazon. Jako partner Amazon zarabiamy na kwalifikowanych zakupach. Nie wpływa to na rekomendacje.', tos_s9:'9. Ograniczenie odpowiedzialności', tos_s9_desc:'W zakresie dozwolonym przez prawo nie ponosimy odpowiedzialności za szkody wynikające z korzystania z treści generowanych przez AI.', tos_s9_note:'Ograniczenie to nie dotyczy umyślnego działania, rażącego niedbalstwa, uszkodzenia życia, ciała lub zdrowia ani roszczeń z tytułu odpowiedzialności za produkt. Ustawowe prawa konsumentów pozostają niezmienione.', tos_s10:'10. Prawo właściwe', tos_s10_desc:'Obowiązuje prawo niemieckie. Europejska platforma rozstrzygania sporów: https://ec.europa.eu/consumers/odr — Nie uczestniczymy w pozasądowych procedurach rozstrzygania sporów.', tos_s11:'11. Kontakt', imp_title:'Impressum', imp_s1:'Informacje zgodnie z § 5 TMG', imp_s2:'Odpowiedzialny za treść zgodnie z § 18 ust. 2 MStV', imp_s3:'Zastrzeżenie prawne', imp_h_content:'Odpowiedzialność za treść', imp_content_desc:'Poradniki naprawcze generowane przez AI nie zastępują oceny wykwalifikowanego specjalisty.', imp_h_links:'Odpowiedzialność za linki', imp_links_desc:'Odpowiedni dostawca jest odpowiedzialny za treść połączonych stron.', imp_h_copyright:'Prawa autorskie', imp_copyright_desc:'Treści stworzone przez operatora podlegają niemieckiemu prawu autorskiemu.', imp_s4:'Rozstrzyganie sporów', imp_dispute:'Europejska platforma ODR: https://ec.europa.eu/consumers/odr — Nie jesteśmy skłonni uczestniczyć w pozasądowych procedurach rozstrzygania sporów.' };

T.sr = { vatLabel:'PIB: ', emailLabel:'E-pošta: ', pp_title:'Politika privatnosti', pp_ai_notice:'FixIt koristi AI tehnologiju za generisanje dijagnoza i vodiča za popravku. Sadržaj koji generiše AI može sadržati greške. Uvek proverite kritične informacije kod kvalifikovanih stručnjaka.', pp_s1:'1. Rukovalac podacima', pp_s1_contact:`Za pitanja o privatnosti, kontaktirajte: ${privacyEmail}`, pp_s2:'2. Podaci koje obrađujemo', pp_s2_account:'Podaci o nalogu (pri registraciji)', pp_li_email:'E-mail adresa (obavezno)', pp_li_pwd:'Hešovana lozinka (čuvana na Supabase-u, nikad u otvorenom tekstu)', pp_li_uid:'ID korisnika (generisano od sistema)', pp_li_plan:'Status pretplate (Free / Monthly / Yearly)', pp_li_cid:'ID Stripe kupca (pri plaćanju)', pp_s2_ai:'AI dijagnoze (pri korišćenju funkcije)', pp_li_text:'Tekst problema koji unosite', pp_li_photo:'Opcionalno: fotografije koje otpremite', pp_li_cat:'Tip vozila / kategorija (birate vi)', pp_li_resp:'Odgovor koji generiše AI', pp_li_lang:'Podešavanje jezika', pp_ai_box:`Fotografije i tekstovi se prenose Anthropic, Inc. (SAD) za AI obradu. Anthropic obrađuje ove podatke prema sopstvenim uslovima korišćenja API-ja. Preporučujemo da ne unosite lične podatke u tekstove dijagnoza.`, pp_s2_hist:'Istorija popravki', pp_hist_desc:'Dijagnoze se čuvaju lokalno na vašem uređaju (localStorage). Za prijavljene korisnike, istorija može biti povezana s nalogom.', pp_s2_loc:'Lokacija i GPS', pp_li_gps1:'GPS koordinate se koriste samo za Nearby pretragu (radionice, prodavnice delova)', pp_li_gps2:'Koordinate se šalju Google Places API-ju i OpenStreetMap Overpass API-ju', pp_li_gps3:'Ne čuvamo vašu lokaciju trajno', pp_s2_pay:'Podaci o plaćanju', pp_pay_desc:'Plaćanja potpuno obrađuje Stripe (SAD). Ne čuvamo podatke o platnim karticama. Primamo samo potvrde (status pretplate, ID Stripe kupca) putem webhookova.', pp_s2_logs:'Serverski logovi i IP adrese', pp_logs_desc:'Vercel (hosting) i Supabase (baza podataka) obrađuju IP adrese i vremenske oznake pristupa u okviru svog rada. Ne vodimo dodatne logove. Vercel čuva logove maksimalno 30 dana.', pp_s3:'3. Pravne osnove', pp_s3_b:'Izvršenje ugovora (čl. 6(1)(b) GDPR):', pp_s3_b_v:'Upravljanje nalogom, pretplata, AI dijagnoze', pp_s3_f:'Legitimni interesi (čl. 6(1)(f) GDPR):', pp_s3_f_v:'Bezbednost, prevencija prevara, unapređenje usluge', pp_s3_c:'Zakonska obaveza (čl. 6(1)(c) GDPR):', pp_s3_c_v:'Čuvanje računovodstvenih dokumenata (§ 147 AO: 10 godina)', pp_s4:'4. Treći pružaoci usluga', pp_role:'Uloga:', pp_data:'Podaci:', pp_country:'Zemlja:', pp_mechanism:'Mehanizam prenosa:', pp_policy_link:'Politika privatnosti', pp_s5:'5. Lokalno čuvanje', pp_ls_desc:'FixIt koristi localStorage i sessionStorage isključivo za neophodne funkcije. Ne koriste se kolačići za praćenje, oglašavanje ni analitiku.', pp_ls_keys:'Korišćeni ključevi:', pp_ls_hist:'Istorija popravki (lokalno)', pp_ls_lang:'Jezičke preference', pp_ls_onb:'Status uvođenja', pp_ls_free:'Besplatna dijagnoza iskorišćena', pp_ls_user:'Lokalni korisnički podaci (gostujući režim)', pp_ls_auth:'Sesija autentifikacije (Supabase)', pp_ls_tdddg:'Prema § 25 TDDDG, ovo čuvanje je neophodno i ne zahteva pristanak.', pp_s6:'6. Periodi čuvanja', pp_ret1:'Podaci naloga: do brisanja naloga', pp_ret2:'Istorija popravki (lokalno): do čišćenja uređaja ili brisanja naloga', pp_ret3:'AI dijagnoze / fotografije: ne čuvamo trajno — Anthropic ih obrađuje prema sopstvenim API uslovima', pp_ret4:'Računovodstveni dokumenti: 10 godina (§ 147 AO)', pp_ret5:'Serverski logovi (Vercel): maksimalno 30 dana', pp_s7:'7. Vaša prava (GDPR)', pp_r1:'Pristup (čl. 15)', pp_r2:'Ispravka (čl. 16)', pp_r3:'Brisanje (čl. 17)', pp_r4:'Ograničenje (čl. 18)', pp_r5:'Prenosivost (čl. 20)', pp_r6:'Prigovor (čl. 21)', pp_r7:'Povlačenje pristanka', pp_r8:'Pritužba nadzornom organu', pp_rights_contact:`Za ostvarivanje vaših prava, pošaljite e-mail na: ${privacyEmail}`, pp_s8:'8. Brisanje naloga', pp_del_desc:'Možete obrisati nalog u bilo kom trenutku putem Moj nalog → Obriši nalog. Računovodstveni dokumenti se čuvaju 10 godina zbog zakonskih razloga. Aktivne pretplate treba otkazati putem Stripe korisničkog portala pre brisanja.', pp_s9:'9. Izmene', pp_changes:'O suštinskim izmenama obavešćivaćemo s razumnim rokom.', pp_s10:'10. Kontakt', pp_privacy_label:`Privatnost: ${privacyEmail}`, tos_title:'Uslovi korišćenja', tos_safety:'Važno bezbednosno upozorenje:', tos_safety_desc:'FixIt pruža informacije generisane AI-jem. Ovo NE zamenjuje procenu kvalifikovanog stručnjaka. Za radove na gasu, visokom naponu, konstrukcijama ili bezbednosnim sistemima, UVEK kontaktirajte ovlašćenu firmu. U hitnom slučaju pozovite 112.', tos_s1:'1. Šta je FixIt', tos_s1_desc:'FixIt je AI-podržani informativni alat za majstore amatere. FixIt nije zanatska firma, sertifikovani tehničar, inženjer ni hitna služba.', tos_s2:'2. AI transparentnost (EU AI akt čl. 50)', tos_s2_desc:'Svaka dijagnoza i vodič za popravku u FixIt-u generisani su AI sistemom. AI može da greši. Sadržaj koji generiše AI označen je kao takav i ne zamenjuje profesionalne savete.', tos_s3:'3. Bezbednosna pravila', tos_s3_intro:'Nikad bez ovlašćene firme:', tos_danger1:'Gasne i zemnogazne instalacije', tos_danger2:'Električni radovi pod naponom', tos_danger3:'Nosivi elementi i statika', tos_danger4:'Bezbednosni sistemi vozila (vazdušni jastuk, ABS, kočnice)', tos_danger5:'Opasne hemikalije', tos_danger6:'Sistemi zaštite od požara', tos_s4:'4. Pretplate i plaćanje', tos_free_desc:'1 besplatna AI dijagnoza.', tos_monthly:'Mesečna (€4,99/mesec)', tos_monthly_desc:'Automatski produžavana pretplata.', tos_yearly:'Godišnja (€39,99/godišnje)', tos_yearly_desc:'Godišnja automatski produžavana pretplata.', tos_s5:'5. Obnova i otkazivanje', tos_s5_desc:'Pretplate se automatski obnavljaju. Otkažite putem: Moj nalog → Upravljaj pretplatom. Plaćeni periodi se ne refundiraju. Pristup ostaje do kraja plaćenog perioda.', tos_s6:'6. Pravo na odustanak', tos_s6_desc:'Potrošači imaju pravo na odustanak od 14 dana. Ovo pravo prestaje pre roka ako pristanete da izvršenje počne pre isteka roka i time potvrdite gubitak ovog prava.', tos_s7:'7. Intelektualna svojina', tos_s7_desc:'FixIt i njegov sadržaj su vlasništvo operatora. Dobijate ograničenu, neprenosivu licencu za ličnu, nekomercijalnu upotrebu. Otpremljene fotografije/tekstovi: dajete nam licencu za njihovu obradu isključivo za pružanje usluge.', tos_s8:'8. Otkrivanje afiliacije', tos_s8_desc:'FixIt može sadržati Amazon affiliate veze. Kao Amazon partner zarađujemo na kvalifikovanim kupovinama. Ovo ne utiče na preporuke.', tos_s9:'9. Ograničenje odgovornosti', tos_s9_desc:'U meri dozvoljenoj zakonom, nismo odgovorni za štetu nastalu korišćenjem sadržaja koji generiše AI.', tos_s9_note:'Ovo ograničenje ne važi za nameru, grubu nepažnju, povrede života, tela ili zdravlja, niti za zahteve po osnovu odgovornosti za proizvod. Zakonska prava potrošača ostaju neizmenjena.', tos_s10:'10. Merodavno pravo', tos_s10_desc:'Primenjuje se nemačko pravo. Evropska platforma za rešavanje sporova: https://ec.europa.eu/consumers/odr — Ne učestvujemo u postupcima vansudskog rešavanja sporova.', tos_s11:'11. Kontakt', imp_title:'Impressum', imp_s1:'Podaci prema § 5 TMG', imp_s2:'Odgovoran za sadržaj prema § 18 st. 2 MStV', imp_s3:'Odricanje od odgovornosti', imp_h_content:'Odgovornost za sadržaj', imp_content_desc:'Vodiči za popravku koje generiše AI ne zamenjuju procenu kvalifikovanog stručnjaka.', imp_h_links:'Odgovornost za veze', imp_links_desc:'Odgovarajući pružalac usluga odgovoran je za sadržaj povezanih stranica.', imp_h_copyright:'Autorsko pravo', imp_copyright_desc:'Sadržaj koji kreira operator podleže nemačkom autorskom pravu.', imp_s4:'Rešavanje sporova', imp_dispute:'Evropska platforma za online rešavanje sporova: https://ec.europa.eu/consumers/odr — Nismo voljni da učestvujemo u postupcima vansudskog rešavanja sporova.' };

// hr, mk, tr — use sr/de/en as base and apply overrides for key differences
T.hr = { ...T.sr,
  vatLabel:'OIB: ', emailLabel:'E-pošta: ',
  pp_title:'Pravila privatnosti',
  pp_ai_notice:'FixIt koristi AI tehnologiju za generiranje dijagnoza i vodiča za popravak. Sadržaj generiran AI-jem može sadržavati pogreške. Uvijek provjerite ključne informacije s kvalificiranim stručnjacima.',
  pp_s1:'1. Voditelj obrade podataka', pp_s1_contact:`Za pitanja o privatnosti, obratite se: ${privacyEmail}`,
  pp_s2_hist:'Povijest popravaka', pp_hist_desc:'Dijagnoze se pohranjuju lokalno na vašem uređaju (localStorage). Za prijavljene korisnike, povijest može biti povezana s računom.',
  pp_s2_loc:'Lokacija i GPS', pp_li_gps1:'GPS koordinate koriste se samo za pretragu Nearby (radionice, prodavaonice dijelova)', pp_li_gps3:'Ne pohranjujemo vašu lokaciju trajno',
  pp_s8:'8. Brisanje računa', pp_del_desc:'Možete obrisati račun u bilo koje vrijeme putem Moj račun → Obriši račun. Računovodstveni dokumenti čuvaju se 10 godina zbog zakonskih razloga.',
  tos_title:'Uvjeti korištenja', tos_safety:'Važna sigurnosna napomena:',
  tos_safety_desc:'FixIt pruža informacije generirane AI-jem. Ovo NE zamjenjuje procjenu kvalificiranog stručnjaka. Za radove na plinu, visokom naponu, konstrukcijama ili sigurnosnim sustavima, UVIJEK kontaktirajte ovlaštenu tvrtku. U hitnom slučaju pozovite 112.',
  tos_s1:'1. Što je FixIt', tos_s1_desc:'FixIt je AI-potpomognuti informativni alat za majstore amatere. FixIt nije obrtnička tvrtka, certificirani tehničar, inženjer ni hitna služba.',
  tos_s2:'2. AI transparentnost (EU AI akt čl. 50)', tos_s3:'3. Sigurnosna pravila', tos_s3_intro:'Nikad bez ovlaštene tvrtke:',
  tos_danger1:'Plinske i zemnogazne instalacije', tos_danger2:'Električni radovi pod naponom', tos_danger3:'Nosivi elementi i statika',
  tos_danger4:'Sigurnosni sustavi vozila (zračni jastuk, ABS, kočnice)', tos_danger5:'Opasne kemikalije', tos_danger6:'Sustavi zaštite od požara',
  tos_s4:'4. Pretplate i plaćanje', tos_monthly:'Mjesečna (€4,99/mj.)', tos_yearly:'Godišnja (€39,99/god.)',
  tos_s5:'5. Obnova i otkazivanje', tos_s5_desc:'Pretplate se automatski obnavljaju. Otkazite putem: Moj račun → Upravljaj pretplatom. Plaćena razdoblja se ne vraćaju. Pristup ostaje do kraja plaćenog razdoblja.',
  tos_s6:'6. Pravo na odustanak', tos_s7:'7. Intelektualno vlasništvo',
  tos_s7_desc:'FixIt i njegov sadržaj vlasništvo su operatora. Dobivate ograničenu, neprenosivu licenciju za osobnu, nekomercijalnu upotrebu.',
  tos_s10:'10. Mjerodavno pravo', tos_s11:'11. Kontakt',
  imp_title:'Impressum', imp_s1:'Podaci prema § 5 TMG', imp_s2:'Odgovoran za sadržaj prema § 18 st. 2 MStV',
  imp_s3:'Odricanje od odgovornosti', imp_h_content:'Odgovornost za sadržaj',
  imp_content_desc:'Vodiči za popravak koje generira AI ne zamjenjuju procjenu kvalificiranog stručnjaka.',
  imp_h_links:'Odgovornost za poveznice', imp_links_desc:'Odgovarajući pružatelj usluga odgovoran je za sadržaj povezanih stranica.',
  imp_h_copyright:'Autorsko pravo', imp_copyright_desc:'Sadržaj koji stvara operator podliježe njemačkom autorskom pravu.',
  imp_s4:'Rješavanje sporova', imp_dispute:'Europska platforma za online rješavanje sporova: https://ec.europa.eu/consumers/odr — Nismo voljni sudjelovati u postupcima izvansudskog rješavanja sporova.'
};

T.mk = { vatLabel:'ДДВ: ', emailLabel:'Е-пошта: ',
  pp_title:'Политика за приватност',
  pp_ai_notice:'FixIt користи AI технологија за генерирање дијагнози и водичи за поправка. Содржината генерирана од AI може да содржи грешки. Секогаш проверувајте критични информации кај квалификувани стручњаци.',
  pp_s1:'1. Контролор на податоци', pp_s1_contact:`За прашања за приватноста, контактирајте: ${privacyEmail}`,
  pp_s2:'2. Податоци кои ги обработуваме', pp_s2_account:'Податоци за сметка (при регистрација)',
  pp_li_email:'Е-пошта адреса (задолжително)', pp_li_pwd:'Хешована лозинка (чувана на Supabase, никогаш во отворен текст)',
  pp_li_uid:'ID на корисник (генериран од системот)', pp_li_plan:'Статус на претплата (Free / Monthly / Yearly)',
  pp_li_cid:'ID на Stripe клиент (при плаќање)',
  pp_s2_ai:'AI дијагнози (при користење на функцијата)', pp_li_text:'Текст на проблемот кој го внесувате',
  pp_li_photo:'Опционално: фотографии кои ги поставувате', pp_li_cat:'Тип на возило / категорија (го избирате вие)',
  pp_li_resp:'Одговор генериран од AI', pp_li_lang:'Поставување јазик',
  pp_ai_box:'Фотографиите и текстовите се пренесуваат до Anthropic, Inc. (САД) за AI обработка. Anthropic ги обработува овие податоци согласно сопствените услови за API. Препорачуваме да не внесувате лични информации во текстовите за дијагноза.',
  pp_s2_hist:'Историја на поправки', pp_hist_desc:'Дијагнозите се чуваат локално на вашиот уред (localStorage). За најавени корисници, историјата може да биде поврзана со сметката.',
  pp_s2_loc:'Локација и GPS', pp_li_gps1:'GPS координатите се користат само за Nearby пребарување (работилници, делови)',
  pp_li_gps2:'Координатите се испраќаат до Google Places API и OpenStreetMap Overpass API', pp_li_gps3:'Не ја чуваме вашата локација трајно',
  pp_s2_pay:'Податоци за плаќање', pp_pay_desc:'Плаќањата целосно ги управува Stripe (САД). Не чуваме податоци за платежни картички. Примаме само потврди (статус на претплата, ID на Stripe клиент) преку webhook.',
  pp_s2_logs:'Серверски логови и IP адреси', pp_logs_desc:'Vercel (хостинг) и Supabase (база на податоци) обработуваат IP адреси и временски ознаки за пристап во рамките на своите операции. Не водиме дополнителни логови. Vercel чува логови максимум 30 дена.',
  pp_s3:'3. Правни основи',
  pp_s3_b:'Извршување на договор (чл. 6(1)(б) GDPR):', pp_s3_b_v:'Управување со сметка, претплата, AI дијагнози',
  pp_s3_f:'Легитимни интереси (чл. 6(1)(ф) GDPR):', pp_s3_f_v:'Безбедност, спречување измами, подобрување услуга',
  pp_s3_c:'Законска обврска (чл. 6(1)(в) GDPR):', pp_s3_c_v:'Чување на сметководствени документи (§ 147 AO: 10 години)',
  pp_s4:'4. Трети давачи на услуги', pp_role:'Улога:', pp_data:'Податоци:', pp_country:'Земја:', pp_mechanism:'Механизам за пренос:', pp_policy_link:'Политика за приватност',
  pp_s5:'5. Локално складирање', pp_ls_desc:'FixIt користи localStorage и sessionStorage исклучиво за неопходни функции. Не се користат колачиња за следење, рекламирање или аналитика.',
  pp_ls_keys:'Користени клучеви:', pp_ls_hist:'Историја на поправки (локално)', pp_ls_lang:'Јазична преференца',
  pp_ls_onb:'Статус на воведување', pp_ls_free:'Бесплатна дијагноза искористена', pp_ls_user:'Локални кориснички податоци (гостински режим)', pp_ls_auth:'Сесија за автентикација (Supabase)',
  pp_ls_tdddg:'Согласно § 25 TDDDG, ова складирање е неопходно и не бара согласност.',
  pp_s6:'6. Периоди на чување', pp_ret1:'Податоци за сметка: до бришење на сметката',
  pp_ret2:'Историја на поправки (локално): до чистење на уредот или бришење на сметката',
  pp_ret3:'AI дијагнози / фотографии: не чуваме трајно — Anthropic ги обработува согласно сопствените API услови',
  pp_ret4:'Сметководствени документи: 10 години (§ 147 AO)', pp_ret5:'Серверски логови (Vercel): максимум 30 дена',
  pp_s7:'7. Вашите права (GDPR)', pp_r1:'Пристап (чл. 15)', pp_r2:'Исправка (чл. 16)', pp_r3:'Бришење (чл. 17)', pp_r4:'Ограничување (чл. 18)',
  pp_r5:'Преносливост (чл. 20)', pp_r6:'Приговор (чл. 21)', pp_r7:'Повлекување согласност', pp_r8:'Жалба до надзорен орган',
  pp_rights_contact:`За остварување на вашите права, испратете е-пошта на: ${privacyEmail}`,
  pp_s8:'8. Бришење на сметка', pp_del_desc:'Можете да ја избришете сметката во секое време преку Мојата сметка → Избриши сметка. Сметководствените документи се чуваат 10 години поради законски причини.',
  pp_s9:'9. Промени', pp_changes:'Суштинските промени ќе бидат соопштени со разумно предизвестување.',
  pp_s10:'10. Контакт', pp_privacy_label:`Приватност: ${privacyEmail}`,
  tos_title:'Услови за користење', tos_safety:'Важно безбедносно предупредување:',
  tos_safety_desc:'FixIt обезбедува информации генерирани од AI. Ова НЕ ја заменува проценката на квалификуван стручњак. За работи на гас, висок напон, конструкции или безбедносни системи, СЕКОГАШ контактирајте овластена компанија. Во итни случаи јавете се на 112.',
  tos_s1:'1. Што е FixIt', tos_s1_desc:'FixIt е AI-поддржан информативен алат за мајстори аматери. FixIt не е занаетчиска компанија, сертифициран техничар, инженер или итна служба.',
  tos_s2:'2. AI транспарентност (EU AI акт чл. 50)', tos_s2_desc:'Секоја дијагноза и водич за поправка во FixIt се генерирани од AI систем. AI може да греши. Содржината генерирана од AI е означена како таква и не ги заменува професионалните совети.',
  tos_s3:'3. Безбедносни правила', tos_s3_intro:'Никогаш без овластена компанија:',
  tos_danger1:'Гасни и земногасни инсталации', tos_danger2:'Електрични работи под напон',
  tos_danger3:'Носечки елементи и статика', tos_danger4:'Безбедносни системи на возилото (воздушна перница, ABS, кочници)',
  tos_danger5:'Опасни хемикалии', tos_danger6:'Системи за заштита од пожар',
  tos_s4:'4. Претплати и плаќање', tos_free_desc:'1 бесплатна AI дијагноза.',
  tos_monthly:'Месечна (€4,99/месец)', tos_monthly_desc:'Автоматски обновувана претплата.',
  tos_yearly:'Годишна (€39,99/година)', tos_yearly_desc:'Годишна автоматски обновувана претплата.',
  tos_s5:'5. Обновување и откажување', tos_s5_desc:'Претплатите автоматски се обновуваат. Откажете преку: Мојата сметка → Управувај со претплата. Платените периоди не се рефундираат. Пристапот остануva до крајот на платениот период.',
  tos_s6:'6. Право на откажување', tos_s6_desc:'Потрошувачите имаат право на откажување од 14 дена. Ова право истекува порано ако дадете согласност за почеток на извршување пред истекот на рокот и со тоа го потврдите губитокот на ова право.',
  tos_s7:'7. Интелектуална сопственост', tos_s7_desc:'FixIt и неговата содржина се во сопственост на операторот. Добивате ограничена, непреносива лиценца за лична, некомерцијална употреба.',
  tos_s8:'8. Откривање на афилијација', tos_s8_desc:'FixIt може да содржи Amazon affiliate врски. Како Amazon партнер заработуваме на квалификувани купувања. Ова не влијае на препораките.',
  tos_s9:'9. Ограничување на одговорност', tos_s9_desc:'Во мера дозволена со закон, не сме одговорни за штета произлезена од употреба на содржина генерирана од AI.',
  tos_s9_note:'Ова ограничување не се применува за намера, груба небрежност, повреди на животот, телото или здравјето, ниту за барања за одговорност за производи. Законските права на потрошувачите остануваат непроменети.',
  tos_s10:'10. Меродавно право', tos_s10_desc:'Се применува германско право. Европска платформа за решавање спорови: https://ec.europa.eu/consumers/odr — Не учествуваме во постапки за вонсудско решавање спорови.',
  tos_s11:'11. Контакт',
  imp_title:'Импресум', imp_s1:'Информации согласно § 5 TMG', imp_s2:'Одговорен за содржина согласно § 18 ст. 2 MStV',
  imp_s3:'Одрекување од одговорност', imp_h_content:'Одговорност за содржина',
  imp_content_desc:'Водичите за поправка генерирани од AI не ја заменуваат проценката на квалификуван стручњак.',
  imp_h_links:'Одговорност за врски', imp_links_desc:'Соодветниот давател на услуги е одговорен за содржината на поврзаните страници.',
  imp_h_copyright:'Авторско право', imp_copyright_desc:'Содржината создадена од операторот е предмет на германско авторско право.',
  imp_s4:'Решавање спорови', imp_dispute:'Европска платформа за онлајн решавање спорови: https://ec.europa.eu/consumers/odr — Не сме подготвени да учествуваме во постапки за вонсудско решавање спорови.'
};

T.tr = { vatLabel:'KDV No: ', emailLabel:'E-posta: ',
  pp_title:'Gizlilik Politikası',
  pp_ai_notice:'FixIt, tanı ve onarım rehberleri oluşturmak için yapay zeka teknolojisi kullanmaktadır. Yapay zeka tarafından oluşturulan içerik hatalar içerebilir. Kritik bilgileri her zaman nitelikli uzmanlarla doğrulayın.',
  pp_s1:'1. Veri Sorumlusu', pp_s1_contact:`Gizlilik sorularınız için lütfen iletişime geçin: ${privacyEmail}`,
  pp_s2:'2. İşlediğimiz Veriler', pp_s2_account:'Hesap verileri (kayıt sırasında)',
  pp_li_email:'E-posta adresi (zorunlu)', pp_li_pwd:'Karma parola (Supabase\'de depolanır, hiçbir zaman düz metin olarak)',
  pp_li_uid:'Kullanıcı kimliği (sistem tarafından oluşturulur)', pp_li_plan:'Abonelik durumu (Free / Monthly / Yearly)',
  pp_li_cid:'Stripe müşteri kimliği (ödeme sırasında)',
  pp_s2_ai:'Yapay zeka tanıları (özelliği kullandığınızda)', pp_li_text:'Girdiğiniz sorun metni',
  pp_li_photo:'İsteğe bağlı: yüklediğiniz fotoğraflar', pp_li_cat:'Araç tipi / kategori (siz seçersiniz)',
  pp_li_resp:'Yapay zeka tarafından oluşturulan yanıt', pp_li_lang:'Dil ayarı',
  pp_ai_box:'Fotoğraflar ve metinler, yapay zeka işlemesi için Anthropic, Inc.\'e (ABD) iletilir. Anthropic bu verileri kendi API kullanım koşulları çerçevesinde işler. Tanı metinlerine kişisel bilgi (isim, adres, kimlik numarası) girmemenizi öneririz.',
  pp_s2_hist:'Onarım geçmişi', pp_hist_desc:'Tanılar cihazınızda yerel olarak (localStorage) saklanır. Giriş yapmış kullanıcılar için geçmiş hesabınızla ilişkilendirilebilir.',
  pp_s2_loc:'Konum ve GPS', pp_li_gps1:'GPS koordinatları yalnızca Nearby araması (atölyeler, yedek parça dükkanları) için kullanılır',
  pp_li_gps2:'Koordinatlar Google Places API ve OpenStreetMap Overpass API\'ye gönderilir', pp_li_gps3:'Konumunuzu kalıcı olarak saklamıyoruz',
  pp_s2_pay:'Ödeme verileri', pp_pay_desc:'Ödemeler tamamen Stripe (ABD) tarafından işlenir. Kart verisi saklamıyoruz. Yalnızca webhook aracılığıyla onaylar (abonelik durumu, Stripe müşteri kimliği) alıyoruz.',
  pp_s2_logs:'Sunucu günlükleri ve IP adresleri', pp_logs_desc:'Vercel (barındırma) ve Supabase (veritabanı), operasyonları kapsamında IP adreslerini ve erişim zaman damgalarını işler. Ek günlük tutmuyoruz. Vercel günlükleri en fazla 30 gün saklar.',
  pp_s3:'3. Hukuki Dayanak',
  pp_s3_b:'Sözleşme ifası (GDPR Md. 6(1)(b)):', pp_s3_b_v:'Hesap yönetimi, abonelik, yapay zeka tanıları',
  pp_s3_f:'Meşru menfaatler (GDPR Md. 6(1)(f)):', pp_s3_f_v:'Güvenlik, sahtekarlık önleme, hizmet iyileştirme',
  pp_s3_c:'Yasal yükümlülük (GDPR Md. 6(1)(c)):', pp_s3_c_v:'Muhasebe belgelerinin saklanması (§ 147 AO: 10 yıl)',
  pp_s4:'4. Üçüncü Taraf Sağlayıcılar', pp_role:'Rol:', pp_data:'Veriler:', pp_country:'Ülke:', pp_mechanism:'Transfer mekanizması:', pp_policy_link:'Gizlilik politikası',
  pp_s5:'5. Yerel Depolama', pp_ls_desc:'FixIt, localStorage ve sessionStorage\'ı yalnızca kesinlikle gerekli işlevler için kullanır. Takip, reklam veya analitik çerezleri kullanılmaz.',
  pp_ls_keys:'Kullanılan anahtarlar:', pp_ls_hist:'Onarım geçmişi (yerel)', pp_ls_lang:'Dil tercihi',
  pp_ls_onb:'Katılım durumu', pp_ls_free:'Ücretsiz tanı kullanıldı', pp_ls_user:'Yerel kullanıcı verileri (misafir modu)', pp_ls_auth:'Kimlik doğrulama oturumu (Supabase)',
  pp_ls_tdddg:'§ 25 TDDDG uyarınca bu depolama kesinlikle gereklidir ve rıza gerektirmez.',
  pp_s6:'6. Saklama Süreleri', pp_ret1:'Hesap verileri: hesap silinene kadar',
  pp_ret2:'Onarım geçmişi (yerel): cihaz temizlenene veya hesap silinene kadar',
  pp_ret3:'Yapay zeka tanıları / fotoğraflar: tarafımızca kalıcı olarak saklanmaz — Anthropic kendi API koşulları çerçevesinde işler',
  pp_ret4:'Muhasebe belgeleri: 10 yıl (§ 147 AO)', pp_ret5:'Sunucu günlükleri (Vercel): en fazla 30 gün',
  pp_s7:'7. Haklarınız (GDPR)', pp_r1:'Erişim (Md. 15)', pp_r2:'Düzeltme (Md. 16)', pp_r3:'Silme (Md. 17)', pp_r4:'Kısıtlama (Md. 18)',
  pp_r5:'Taşınabilirlik (Md. 20)', pp_r6:'İtiraz (Md. 21)', pp_r7:'Rızanın geri çekilmesi', pp_r8:'Denetim makamına şikâyet',
  pp_rights_contact:`Haklarınızı kullanmak için e-posta gönderin: ${privacyEmail}`,
  pp_s8:'8. Hesap Silme', pp_del_desc:'Hesabınızı istediğiniz zaman Hesabım → Hesabı sil yoluyla silebilirsiniz. Muhasebe belgeleri yasal nedenlerle 10 yıl saklanır.',
  pp_s9:'9. Değişiklikler', pp_changes:'Önemli değişiklikler makul bir süre öncesinde bildirilecektir.',
  pp_s10:'10. İletişim', pp_privacy_label:`Gizlilik: ${privacyEmail}`,
  tos_title:'Kullanım Koşulları', tos_safety:'Önemli güvenlik uyarısı:',
  tos_safety_desc:'FixIt, yapay zeka tarafından oluşturulan bilgiler sağlar. Bu, nitelikli bir uzmanın değerlendirmesinin YERİNİ TUTMAZ. Gaz, yüksek gerilim, taşıyıcı sistem veya güvenlik sistemleriyle ilgili çalışmalarda HER ZAMAN lisanslı bir profesyonelle iletişime geçin. Acil durumlarda 112\'yi arayın.',
  tos_s1:'1. FixIt Nedir', tos_s1_desc:'FixIt, kendin-yap kullanıcıları için yapay zeka destekli bir bilgi aracıdır. FixIt bir zanaatkâr şirket, sertifikalı teknisyen, mühendis veya acil servis değildir.',
  tos_s2:'2. Yapay Zeka Şeffaflığı (AB Yapay Zeka Yasası Md. 50)', tos_s2_desc:'FixIt\'teki her tanı ve onarım rehberi bir yapay zeka sistemi tarafından oluşturulur. Yapay zeka hata yapabilir. Yapay zeka tarafından oluşturulan içerik bu şekilde etiketlenir ve profesyonel tavsiyenin yerini tutmaz.',
  tos_s3:'3. Güvenlik Kuralları', tos_s3_intro:'Lisanslı profesyonel olmadan asla:',
  tos_danger1:'Doğalgaz ve havagazı tesisatları', tos_danger2:'Gerilim altında elektrik çalışmaları',
  tos_danger3:'Taşıyıcı yapı elemanları', tos_danger4:'Araç güvenlik sistemleri (hava yastığı, ABS, frenler)',
  tos_danger5:'Tehlikeli kimyasallar', tos_danger6:'Yangın söndürme sistemleri',
  tos_s4:'4. Abonelikler ve Ödeme', tos_free_desc:'1 ücretsiz yapay zeka tanısı.',
  tos_monthly:'Aylık (€4,99/ay)', tos_monthly_desc:'Otomatik yenilenen abonelik.',
  tos_yearly:'Yıllık (€39,99/yıl)', tos_yearly_desc:'Otomatik yenilenen yıllık abonelik.',
  tos_s5:'5. Yenileme ve İptal', tos_s5_desc:'Abonelikler otomatik olarak yenilenir. Şu yoldan iptal edin: Hesabım → Aboneliği yönet. Ödenen dönemler iade edilmez. Erişim, ödenen dönemin sonuna kadar devam eder.',
  tos_s6:'6. Cayma Hakkı', tos_s6_desc:'Tüketicilerin 14 günlük cayma hakkı bulunmaktadır. Bu hak, cayma süresinin dolmadan önce hizmetin başlamasına rıza göstermeniz ve bu surette cayma hakkınızı kaybettiğinizi kabul etmeniz durumunda erken sona erer.',
  tos_s7:'7. Fikri Mülkiyet', tos_s7_desc:'FixIt ve içeriği operatöre aittir. Kişisel, ticari olmayan kullanım için sınırlı, devredilemez bir lisans alırsınız.',
  tos_s8:'8. Bağlı Kuruluş Açıklaması', tos_s8_desc:'FixIt Amazon bağlı kuruluş bağlantıları içerebilir. Amazon Ortağı olarak uygun satın alımlardan kazanç elde ederiz. Bu, önerileri etkilemez.',
  tos_s9:'9. Sorumluluk Sınırlaması', tos_s9_desc:'Yasanın izin verdiği ölçüde, yapay zeka tarafından oluşturulan içeriğin kullanımından kaynaklanan zararlardan sorumlu değiliz.',
  tos_s9_note:'Bu sınırlama; kasıt, ağır ihmal, hayat, beden veya sağlığa verilen zarar ile ürün sorumluluğu taleplerini kapsamaz. Tüketicilerin yasal hakları saklıdır.',
  tos_s10:'10. Uygulanacak Hukuk', tos_s10_desc:'Alman hukuku uygulanır. AB çevrimiçi uyuşmazlık çözüm platformu: https://ec.europa.eu/consumers/odr — Tüketici arabuluculuk kurullarına katılmıyoruz.',
  tos_s11:'11. İletişim',
  imp_title:'Künye', imp_s1:'§ 5 TMG uyarınca bilgiler', imp_s2:'§ 18 f. 2 MStV uyarınca içerikten sorumlu',
  imp_s3:'Sorumluluk Reddi', imp_h_content:'İçerik sorumluluğu',
  imp_content_desc:'Yapay zeka tarafından oluşturulan onarım rehberleri, nitelikli bir uzmanın değerlendirmesinin yerini tutmaz.',
  imp_h_links:'Bağlantı sorumluluğu', imp_links_desc:'Bağlantılı sitelerin içeriğinden ilgili sağlayıcı sorumludur.',
  imp_h_copyright:'Telif Hakkı', imp_copyright_desc:'Operatör tarafından oluşturulan içerik Alman telif hukuku kapsamındadır.',
  imp_s4:'Uyuşmazlık Çözümü', imp_dispute:'AB çevrimiçi uyuşmazlık çözüm platformu: https://ec.europa.eu/consumers/odr — Tüketici arabuluculuk kurullarına katılmaya istekli değiliz.'
};

// ── Translation helper ─────────────────────────────────────────────────────────
function tx(lang, key) {
  return (T[lang] && T[lang][key] !== undefined) ? T[lang][key] : (T.en[key] ?? '');
}

// ── Supabase provider entry helper ────────────────────────────────────────────
const PROVIDERS = (lang) => [
  { name:'Anthropic, Inc.', role:tx(lang,'pp_role'), data:tx(lang,'pp_li_text')+', '+tx(lang,'pp_li_photo')+', '+tx(lang,'pp_li_lang'), country:'USA', mechanism:'EU SCCs / Anthropic DPA', policy:'https://www.anthropic.com/legal/privacy' },
  { name:'Supabase, Inc.', role:tx(lang,'pp_s2_account').split(' ')[0]+' & Auth', data:tx(lang,'pp_li_email')+', '+tx(lang,'pp_li_uid')+', '+tx(lang,'pp_li_plan')+', '+tx(lang,'pp_li_cid'), country:tx(lang,'pp_country')+' Ireland / EU', mechanism:'No third-country transfer (EU hosting)', policy:'https://supabase.com/privacy' },
  { name:'Stripe, Inc.', role:tx(lang,'pp_s2_pay'), data:tx(lang,'pp_li_email')+', '+tx(lang,'pp_li_plan')+', '+tx(lang,'pp_li_cid'), country:'USA', mechanism:'EU SCCs / Stripe DPA', policy:'https://stripe.com/privacy' },
  { name:'Vercel, Inc.', role:'Hosting', data:tx(lang,'pp_s2_logs'), country:'USA', mechanism:'EU SCCs / Vercel DPA', policy:'https://vercel.com/legal/privacy-policy' },
  { name:'Google LLC', role:'Google Places API', data:tx(lang,'pp_li_gps1'), country:'USA', mechanism:'EU SCCs / Google Cloud DPA', policy:'https://policies.google.com/privacy' },
  { name:'OpenStreetMap / Overpass', role:'Map data', data:tx(lang,'pp_li_gps1'), country:'EU', mechanism:tx(lang,'pp_li_gps3'), policy:'https://wiki.openstreetmap.org/wiki/Privacy_Policy' },
];

// ── VAT line ───────────────────────────────────────────────────────────────────
const VatLine = ({ lang }) => vatId && vatId.trim()
  ? <>{tx(lang,'vatLabel')}{vatId}<br/></>
  : null;

// ── Owner block ────────────────────────────────────────────────────────────────
const OwnerBlock = ({ lang }) => (
  <div style={box}>
    {legalName    ? <><strong>{legalName}</strong><br/></> : null}
    {postalAddress ? <>{postalAddress}<br/></> : null}
    <VatLine lang={lang}/>
    {tx(lang,'emailLabel')}{supportEmail}
  </div>
);

// ── Privacy Policy ─────────────────────────────────────────────────────────────
export function PrivacyPage({ lang }) {
  const t = (key) => tx(lang, key);
  return (
    <div>
      <h1 style={h1}>{t('pp_title')}</h1>
      <div style={meta}>Version {DOC_VERSION} · {DOC_DATE} · FixIt · {appUrl}</div>
      <div style={warn}>🤖 {t('pp_ai_notice')}</div>
      <h2 style={h2}>{t('pp_s1')}</h2>
      <OwnerBlock lang={lang}/>
      <p style={p}>{t('pp_s1_contact')}</p>
      <h2 style={h2}>{t('pp_s2')}</h2>
      <h3 style={h3}>{t('pp_s2_account')}</h3>
      <ul style={ul}>
        {['pp_li_email','pp_li_pwd','pp_li_uid','pp_li_plan','pp_li_cid'].map(k=><li key={k} style={li}>{t(k)}</li>)}
      </ul>
      <h3 style={h3}>{t('pp_s2_ai')}</h3>
      <ul style={ul}>
        {['pp_li_text','pp_li_photo','pp_li_cat','pp_li_resp','pp_li_lang'].map(k=><li key={k} style={li}>{t(k)}</li>)}
      </ul>
      <div style={box}>⚠️ {t('pp_ai_box')}</div>
      <h3 style={h3}>{t('pp_s2_hist')}</h3>
      <p style={p}>{t('pp_hist_desc')}</p>
      <h3 style={h3}>{t('pp_s2_loc')}</h3>
      <ul style={ul}>{['pp_li_gps1','pp_li_gps2','pp_li_gps3'].map(k=><li key={k} style={li}>{t(k)}</li>)}</ul>
      <h3 style={h3}>{t('pp_s2_pay')}</h3>
      <p style={p}>{t('pp_pay_desc')}</p>
      <h3 style={h3}>{t('pp_s2_logs')}</h3>
      <p style={p}>{t('pp_logs_desc')}</p>
      <h2 style={h2}>{t('pp_s3')}</h2>
      <ul style={ul}>
        <li style={li}><strong>{t('pp_s3_b')}</strong> {t('pp_s3_b_v')}</li>
        <li style={li}><strong>{t('pp_s3_f')}</strong> {t('pp_s3_f_v')}</li>
        <li style={li}><strong>{t('pp_s3_c')}</strong> {t('pp_s3_c_v')}</li>
      </ul>
      <h2 style={h2}>{t('pp_s4')}</h2>
      {PROVIDERS(lang).map(pv=>(
        <div key={pv.name} style={{...box,marginBottom:10}}>
          <strong style={{color:'rgba(255,255,255,0.85)'}}>{pv.name}</strong><br/>
          <span style={{color:'rgba(255,255,255,0.45)',fontSize:'0.78rem'}}>
            {t('pp_role')} {pv.role}<br/>
            {t('pp_data')} {pv.data}<br/>
            {t('pp_country')} {pv.country}<br/>
            {t('pp_mechanism')} {pv.mechanism}<br/>
            <a href={pv.policy} target="_blank" rel="noopener noreferrer" style={{color:'rgba(232,82,26,0.7)'}}>{t('pp_policy_link')}</a>
          </span>
        </div>
      ))}
      <h2 style={h2}>{t('pp_s5')}</h2>
      <p style={p}>{t('pp_ls_desc')}</p>
      <div style={box}>
        <strong>{t('pp_ls_keys')}</strong><br/>
        <span style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.5)',lineHeight:1.8}}>
          <code>fixit_history</code> — {t('pp_ls_hist')}<br/>
          <code>fixit_lang</code> — {t('pp_ls_lang')}<br/>
          <code>fixit_onboarding_done</code> — {t('pp_ls_onb')}<br/>
          <code>fixit_free_diagnosis_used</code> — {t('pp_ls_free')}<br/>
          <code>fixit_user</code> — {t('pp_ls_user')}<br/>
          <code>supabase.auth.token</code> — {t('pp_ls_auth')}
        </span>
      </div>
      <p style={p}>{t('pp_ls_tdddg')}</p>
      <h2 style={h2}>{t('pp_s6')}</h2>
      <ul style={ul}>{['pp_ret1','pp_ret2','pp_ret3','pp_ret4','pp_ret5'].map(k=><li key={k} style={li}>{t(k)}</li>)}</ul>
      <h2 style={h2}>{t('pp_s7')}</h2>
      <ul style={ul}>{['pp_r1','pp_r2','pp_r3','pp_r4','pp_r5','pp_r6','pp_r7','pp_r8'].map(k=><li key={k} style={li}><strong>{t(k)}</strong></li>)}</ul>
      <p style={p}>{t('pp_rights_contact')}</p>
      <h2 style={h2}>{t('pp_s8')}</h2>
      <p style={p}>{t('pp_del_desc')}</p>
      <h2 style={h2}>{t('pp_s9')}</h2>
      <p style={p}>{t('pp_changes')}</p>
      <h2 style={h2}>{t('pp_s10')}</h2>
      <OwnerBlock lang={lang}/>
      <p style={p}>{t('pp_privacy_label')}</p>
    </div>
  );
}

// ── Terms of Service ───────────────────────────────────────────────────────────
export function TermsPage({ lang }) {
  const t = (key) => tx(lang, key);
  return (
    <div>
      <h1 style={h1}>{t('tos_title')}</h1>
      <div style={meta}>Version {DOC_VERSION} · {DOC_DATE} · FixIt · {appUrl}</div>
      <div style={warn}>⚠️ <strong>{t('tos_safety')}</strong> {t('tos_safety_desc')}</div>
      <h2 style={h2}>{t('tos_s1')}</h2>
      <p style={p}>{t('tos_s1_desc')}</p>
      <h2 style={h2}>{t('tos_s2')}</h2>
      <p style={p}>{t('tos_s2_desc')}</p>
      <h2 style={h2}>{t('tos_s3')}</h2>
      <p style={p}>{t('tos_s3_intro')}</p>
      <ul style={ul}>{['tos_danger1','tos_danger2','tos_danger3','tos_danger4','tos_danger5','tos_danger6'].map(k=><li key={k} style={li}>{t(k)}</li>)}</ul>
      <h2 style={h2}>{t('tos_s4')}</h2>
      <div style={box}>
        <strong>Free</strong> — {t('tos_free_desc')}<br/><br/>
        <strong>{t('tos_monthly')}</strong> — {t('tos_monthly_desc')}<br/><br/>
        <strong>{t('tos_yearly')}</strong> — {t('tos_yearly_desc')}
      </div>
      <h2 style={h2}>{t('tos_s5')}</h2>
      <p style={p}>{t('tos_s5_desc')}</p>
      <h2 style={h2}>{t('tos_s6')}</h2>
      <p style={p}>{t('tos_s6_desc')}</p>
      <h2 style={h2}>{t('tos_s7')}</h2>
      <p style={p}>{t('tos_s7_desc')}</p>
      <h2 style={h2}>{t('tos_s8')}</h2>
      <p style={p}>{t('tos_s8_desc')}</p>
      <h2 style={h2}>{t('tos_s9')}</h2>
      <p style={p}>{t('tos_s9_desc')}</p>
      <div style={box}>ℹ️ {t('tos_s9_note')}</div>
      <h2 style={h2}>{t('tos_s10')}</h2>
      <p style={p}>{t('tos_s10_desc')}</p>
      <h2 style={h2}>{t('tos_s11')}</h2>
      <OwnerBlock lang={lang}/>
    </div>
  );
}

// ── Impressum ──────────────────────────────────────────────────────────────────
export function ImpressumPage({ lang }) {
  const t = (key) => tx(lang, key);
  return (
    <div>
      <h1 style={h1}>{t('imp_title')}</h1>
      <div style={meta}>FixIt · {appUrl}</div>
      <h2 style={h2}>{t('imp_s1')}</h2>
      <OwnerBlock lang={lang}/>
      <h2 style={h2}>{t('imp_s2')}</h2>
      <div style={box}>
        {legalName    ? <>{legalName}<br/></> : null}
        {postalAddress ? <>{postalAddress}<br/></> : null}
      </div>
      <h2 style={h2}>{t('imp_s3')}</h2>
      <h3 style={h3}>{t('imp_h_content')}</h3>
      <p style={p}>{t('imp_content_desc')}</p>
      <h3 style={h3}>{t('imp_h_links')}</h3>
      <p style={p}>{t('imp_links_desc')}</p>
      <h3 style={h3}>{t('imp_h_copyright')}</h3>
      <p style={p}>{t('imp_copyright_desc')}</p>
      <h2 style={h2}>{t('imp_s4')}</h2>
      <p style={p}>{t('imp_dispute')}</p>
    </div>
  );
}
