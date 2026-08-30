import { useState, useEffect, useRef, useCallback } from 'react';
import { LANGS, tx, getStatusLabel, getDiffLabel } from './data/lang.js';
import { getCountry, smartCC, mapsUrlFor, getStores, getOnlineStores, getLocalStoreSearch, getMarketLang, queryNeedsTranslation, getEmergencySearchQuery, getCountryName } from './data/countries.js';
import { EMRG, getEmrgT, getEmrgS } from './data/emergency.js';
import { getQP } from './data/quickproblems.js';
import { useLocation } from './hooks/useLocation.js';
import { useAI } from './hooks/useAI.js';
import { useNearby, MAP_CATS } from './hooks/useNearby.js';
import { PrivacyPage, TermsPage, ImpressumPage } from './components/LegalPages.jsx';
import LEGAL from './config/legal.js'; // triggers build-time warning if required fields are empty
import { C, s, Spinner, NavBar, BackBtn, LangPicker, Screen, Scroll } from './components/UI.jsx';
import { useAuth } from './useAuth.js';
import { getAccessToken, resetPasswordForEmail, updatePassword } from './auth.js';
import { AUTH_AVAILABLE, checkUsage, incrementUsage, restoreProStatus, sb as getSbClient } from './auth.js';

// ── localStorage helpers (prefixed fixit_) ────────────────────────────────────
const LS = {
  get: k => { try { return JSON.parse(localStorage.getItem('fixit_'+k)); } catch { return null; } },
  set: (k,v) => { try { localStorage.setItem('fixit_'+k, JSON.stringify(v)); } catch {} },
};
// Returns the localStorage key for diagnosis history scoped to the current user.
// Logged-in users get 'fixit_history:<uid>' — completely isolated per account.
// Unauthenticated sessions use 'fixit_history:guest' — never merged into any account.
function historyKey(uid) {
  return uid ? 'history:' + uid : 'history:guest';
}
// Session storage for tab-return persistence (cleared when browser closes)
const SS = {
  get: k => { try { return JSON.parse(sessionStorage.getItem('fixit_'+k)); } catch { return null; } },
  set: (k,v) => { try { sessionStorage.setItem('fixit_'+k, JSON.stringify(v)); } catch {} },
  del: k => { try { sessionStorage.removeItem('fixit_'+k); } catch {} },
};

// ── AI loading messages (cycles during diagnosis) ─────────────────────────────
const AI_MSGS = {
  en:['AI analysis running… (20–40 sec)','Identifying the cause…','Preparing repair steps…','Finding parts and tools…'],
  de:['KI-Analyse läuft… (ca. 20–40 Sek.)','Ursache wird ermittelt…','Reparaturschritte werden erstellt…','Teile und Werkzeuge werden gesucht…'],
  fr:['Analyse du problème…','Identification de la cause…','Préparation des étapes…','Recherche des pièces…'],
  es:['Analizando tu problema…','Identificando la causa…','Preparando los pasos…','Buscando repuestos…'],
  it:['Analisi del problema…','Identificazione della causa…','Preparazione dei passi…','Ricerca dei ricambi…'],
  pl:['Analiza problemu…','Identyfikacja przyczyny…','Przygotowanie kroków…','Szukanie części…'],
  sr:['Analiza problema u toku…','Otkrivanje uzroka…','Priprema koraka…','Traženje delova…'],
  hr:['Analiza problema u tijeku…','Otkrivanje uzroka…','Priprema koraka…','Traženje dijelova…'],
  mk:['Анализа на проблемот…','Откривање на причината…','Подготовка на чекорите…','Барање делови…'],
  tr:['Problem analiz ediliyor…','Neden belirleniyor…','Adımlar hazırlanıyor…','Parçalar aranıyor…'],
};


// ── Category recognition label for Parts Finder ─────────────────────────────
// Returns e.g. "Fahrzeug erkannt" / "Gerät erkannt" / "Tier erkannt" etc.
function catRecognitionLabel(vType, lang) {
  const de = lang==='de', fr = lang==='fr', es = lang==='es', it = lang==='it';
  const mk = lang==='mk', sr = lang==='sr', hr = lang==='hr', pl = lang==='pl', tr = lang==='tr';
  const labels = {
    car:        de?'Fahrzeug erkannt':fr?'Véhicule reconnu':es?'Vehículo detectado':it?'Veicolo rilevato':mk?'Возило препознаено':(sr||hr)?'Vozilo prepoznato':pl?'Pojazd rozpoznany':tr?'Araç tanındı':'Vehicle detected',
    bike:       de?'Fahrrad erkannt':fr?'Vélo reconnu':es?'Bicicleta detectada':it?'Bici rilevata':mk?'Велосипед препознаен':(sr||hr)?'Bicikl prepoznat':pl?'Rower rozpoznany':tr?'Bisiklet tanındı':'Bike detected',
    tech:       de?'Gerät erkannt':fr?'Appareil reconnu':es?'Dispositivo detectado':it?'Dispositivo rilevato':mk?'Уред препознаен':(sr||hr)?'Uređaj prepoznat':pl?'Urządzenie rozpoznane':tr?'Cihaz tanındı':'Device detected',
    appliances: de?'Gerät erkannt':fr?'Appareil reconnu':es?'Electrodoméstico detectado':it?'Elettrodomestico rilevato':mk?'Апарат препознаен':(sr||hr)?'Aparat prepoznat':pl?'Urządzenie rozpoznane':tr?'Cihaz tanındı':'Appliance detected',
    garden:     de?'Gartenprodukt erkannt':fr?'Produit jardin reconnu':es?'Producto jardín detectado':it?'Prodotto giardino rilevato':mk?'Градинарски производ препознаен':(sr||hr)?'Vrtni proizvod prepoznat':pl?'Produkt ogrodowy rozpoznany':tr?'Bahçe ürünü tanındı':'Garden product detected',
    pets:       de?'Tierprodukt erkannt':fr?'Produit animal reconnu':es?'Producto mascota detectado':it?'Prodotto animale rilevato':mk?'Производ за миленик препознаен':(sr||hr)?'Proizvod za ljubimca prepoznat':pl?'Produkt dla zwierząt rozpoznany':tr?'Evcil hayvan ürünü tanındı':'Pet product detected',
    home:       de?'Produkt erkannt':fr?'Produit reconnu':es?'Producto detectado':it?'Prodotto rilevato':mk?'Производ препознаен':(sr||hr)?'Proizvod prepoznan':pl?'Produkt rozpoznany':tr?'Ürün tanındı':'Product detected',
  };
  return labels[vType] || (de?'Produkt erkannt':'Product detected');
}

// ── Category terminology mapper ───────────────────────────────────────────────
// Returns UI labels adapted to the category — pets/garden differ from repair
function catTerms(cat, lang) {
  const de = lang === 'de';
  const fr = lang === 'fr';
  const es = lang === 'es';
  const it = lang === 'it';
  const mk = lang === 'mk';
  const sr = lang === 'sr';
  const hr = lang === 'hr';

  const isPet    = cat === 'pets';
  const isGarden = cat === 'garden';
  const isBike   = cat === 'bike';
  const isMoto   = cat === 'motorcycle' || cat === 'moto';
  const isCar    = cat === 'car';
  const isTech   = cat === 'tech';
  // Everything else (home, appliances) = repair

  if (isPet) return {
    tools:     de?'Empfohlene Hilfsmittel':fr?'Accessoires recommandés':es?'Accesorios recomendados':it?'Accessori consigliati':mk?'Препорачани средства':(sr||hr)?'Preporučena sredstva':'Recommended Supplies',
    parts:     de?'Empfohlene Produkte':fr?'Produits recommandés':es?'Productos recomendados':it?'Prodotti consigliati':mk?'Препорачани производи':(sr||hr)?'Preporučeni proizvodi':'Recommended Products',
    steps:     de?'Pflegehinweise':fr?'Conseils de soin':es?'Consejos de cuidado':it?'Consigli di cura':mk?'Упатства за нега':(sr||hr)?'Saveti za negu':'Care Guide',
    fixedQ:    de?'Hat das geholfen?':fr?'Cela a-t-il aidé?':es?'¿Ha ayudado?':it?'Ha aiutato?':mk?'Дали помогна?':(sr||hr)?'Da li je pomoglo?':'Did this help?',
    fixedY:    de?'✅ Ja, hat geholfen!':fr?'✅ Oui, aidé!':es?'✅ Sí, ayudó!':it?'✅ Sì, ha aiutato!':mk?'✅ Да, помогна!':(sr||hr)?'✅ Da, pomoglo!':'✅ Yes, helped!',
    fixedN:    de?'❌ Weitere Hilfe nötig':fr?'❌ Aide supplémentaire':es?'❌ Más ayuda necesaria':it?'❌ Serve altro aiuto':mk?'❌ Потребна е уште помош':(sr||hr)?'❌ Potrebna dodatna pomoć':'❌ More help needed',
    proBtn:    de?'Tierarzt finden':fr?'Trouver un vétérinaire':es?'Buscar veterinario':it?'Trova veterinario':mk?'Најди ветеринар':(sr||hr)?'Nađi veterinara':'Find a Vet',
    partsBtn:  de?'Produkte suchen':fr?'Chercher produits':es?'Buscar productos':it?'Cerca prodotti':mk?'Барај производи':(sr||hr)?'Traži proizvode':'Find Products',
    loading:   de?['Problem wird analysiert…','Symptome werden erkannt…','Pflegehinweise werden erstellt…','Tierarzt-Empfehlungen werden gesucht…']:
               fr?['Analyse du problème…','Identification des symptômes…','Préparation des conseils…','Recherche vétérinaire…']:
               es?['Analizando el problema…','Identificando síntomas…','Preparando consejos…','Buscando veterinario…']:
               mk?['Анализа на проблемот…','Препознавање на симптомите…','Подготовка на совети…','Барање ветеринар…']:
               (sr||hr)?['Analiza problema…','Prepoznavanje simptoma…','Priprema saveta…','Traženje veterinara…']:
               ['Analyzing the problem…','Identifying symptoms…','Preparing care advice…','Finding vet recommendations…'],
  };
  if (isGarden) return {
    tools:     de?'Benötigte Materialien':fr?'Matériaux nécessaires':es?'Materiales necesarios':it?'Materiali necessari':mk?'Потребни материјали':(sr||hr)?'Potrebni materijali':'Materials Needed',
    parts:     de?'Empfohlene Gartenprodukte':fr?'Produits de jardin':es?'Productos de jardín':it?'Prodotti da giardino':mk?'Градинарски производи':(sr||hr)?'Vrtni proizvodi':'Garden Products',
    steps:     de?'Pflegeschritte':fr?'Étapes de soin':es?'Pasos de cuidado':it?'Passi di cura':mk?'Чекори за нега':(sr||hr)?'Koraci nege':'Care Steps',
    fixedQ:    de?'Hat das geholfen?':fr?'Cela a-t-il aidé?':es?'¿Ha ayudado?':it?'Ha aiutato?':mk?'Дали помогна?':(sr||hr)?'Da li je pomoglo?':'Did this help?',
    fixedY:    de?'✅ Ja, Problem gelöst!':lang==='tr'?'✅ Evet, çözüldü!':lang==='pl'?'✅ Tak, rozwiązane!':'✅ Yes, sorted!',
    fixedN:    de?'❌ Noch nicht gelöst':lang==='tr'?'❌ Hâlâ çözülmedi':lang==='pl'?'❌ Nadal nie rozwiązane':'❌ Still not solved',
    proBtn:    de?'Gärtner finden':lang==='tr'?'Bahçıvan bul':lang==='pl'?'Znajdź ogrodnika':'Find a Gardener',
    partsBtn:  de?'Gartenprodukte suchen':lang==='tr'?'Bahçe ürünleri bul':lang==='pl'?'Znajdź produkty ogrodowe':'Find Garden Products',
    loading:   de?['Gartenproblem wird analysiert…','Ursache wird ermittelt…','Pflegeschritte werden erstellt…','Gartenprodukte werden gesucht…']:
               ['Analyzing garden problem…','Identifying the cause…','Preparing care steps…','Finding garden products…'],
  };
  if (isMoto) return {
    tools:     de?'Benötigte Teile & Werkzeug':fr?'Pièces et outils nécessaires':es?'Piezas y herramientas':mk?'Потребни делови и алати':(sr||hr)?'Potrebni delovi i alati':'Parts & Tools Needed',
    parts:     de?'Motorradteile':fr?'Pièces moto':es?'Repuestos moto':it?'Ricambi moto':mk?'Делови за мотор':(sr||hr)?'Delovi za motor':'Motorcycle Parts',
    steps:     de?'Reparaturschritte':fr?'Étapes de réparation':es?'Pasos de reparación':mk?'Чекори за поправка':(sr||hr)?'Koraci popravke':'Repair Steps',
    fixedQ:    de?'Wurde das Problem behoben?':fr?'Problème résolu?':es?'¿Se resolvió?':mk?'Дали се реши проблемот?':(sr||hr)?'Da li je problem rešen?':'Was the problem fixed?',
    fixedY:    de?'✅ Ja, behoben!':fr?'✅ Oui, résolu!':es?'✅ Sí!':mk?'✅ Да!':(sr||hr)?'✅ Da, popravljeno!':'✅ Yes, fixed!',
    fixedN:    de?'❌ Noch defekt':fr?'❌ Toujours en panne':es?'❌ Aún defectuoso':mk?'❌ Сè уште':(sr||hr)?'❌ Još nije':'❌ Not fixed yet',
    proBtn:    de?'Motorradwerkstatt finden':fr?'Trouver atelier moto':es?'Buscar taller de motos':it?'Trova officina moto':mk?'Најди мото сервис':(sr||hr)?'Nađi moto servis':lang==='tr'?'Motosiklet servisi bul':lang==='pl'?'Znajdź serwis moto':'Find Moto Repair',
    partsBtn:  de?'Motorradteile finden':fr?'Trouver des pièces moto':es?'Buscar repuestos moto':it?'Trovare parti moto':mk?'Барај делови за мотор':(sr||hr)?'Traži dijelove za motor':lang==='tr'?'Motor parçası bul':lang==='pl'?'Znajdź części motocyklowe':'Find Moto Parts',
    loading:   de?['Motorradproblem wird analysiert…','Ursache wird ermittelt…','Reparaturschritte werden erstellt…','Teile werden gesucht…']:
               mk?['Анализа на проблемот…','Откривање на причината…','Подготовка на чекорите…','Барање делови…']:
               (sr||hr)?['Analiza problema…','Otkrivanje uzroka…','Priprema koraka…','Traženje delova…']:
               ['Analyzing motorcycle issue…','Identifying the cause…','Preparing repair steps…','Finding parts…'],
  };
  if (isBike) {
    const tr = lang==='tr', pl = lang==='pl';
    return {
    tools:     de?'Benötigte Werkzeuge':tr?'Gerekli araçlar':pl?'Potrzebne narzędzia':'Tools Needed',
    parts:     de?'Fahrradteile und Zubehör':tr?'Bisiklet parçaları':pl?'Części rowerowe':'Bike Parts & Accessories',
    steps:     de?'Reparaturschritte':tr?'Onarım adımları':pl?'Kroki naprawy':'Repair Steps',
    fixedQ:    de?'Wurde das Problem behoben?':tr?'Sorun çözüldü mü?':pl?'Czy problem został rozwiązany?':'Was the problem fixed?',
    fixedY:    de?'✅ Ja, funktioniert!':tr?'✅ Evet, çalışıyor!':pl?'✅ Tak, działa!':'✅ Yes, working!',
    fixedN:    de?'❌ Noch nicht behoben':tr?'❌ Hâlâ bozuk':pl?'❌ Nadal zepsute':'❌ Not fixed yet',
    proBtn:    de?'Fahrradwerkstatt finden':tr?'Bisiklet tamircisi bul':pl?'Znajdź serwis rowerowy':'Find Bike Shop',
    partsBtn:  de?'Fahrradteile suchen':tr?'Bisiklet parçası bul':pl?'Znajdź części rowerowe':'Find Bike Parts',
    loading:   de?['Fahrradproblem wird analysiert…','Ursache wird ermittelt…','Reparaturschritte werden erstellt…','Fahrradteile werden gesucht…']:
               tr?['Bisiklet sorunu analiz ediliyor…','Neden araştırılıyor…','Onarım adımları hazırlanıyor…','Bisiklet parçaları aranıyor…']:
               pl?['Analiza problemu rowerowego…','Identyfikacja przyczyny…','Przygotowanie kroków naprawy…','Szukanie części rowerowych…']:
               ['Analyzing bike issue…','Identifying the cause…','Preparing repair steps…','Finding bike parts…'],
  };}
  // Default: repair (home, appliances, car, tech)
  return {
    tools:     de?'Benötigte Werkzeuge':fr?'Outils nécessaires':es?'Herramientas necesarias':it?'Strumenti necessari':mk?'Потребни алатки':(sr||hr)?'Potrebni alati':lang==='tr'?'Gerekli araçlar':lang==='pl'?'Potrzebne narzędzia':'Tools Needed',
    parts:     de?'Benötigte Teile':fr?'Pièces nécessaires':es?'Piezas necesarias':it?'Parti necessarie':mk?'Потребни делови':(sr||hr)?'Potrebni delovi':lang==='tr'?'Gerekli parçalar':lang==='pl'?'Potrzebne części':'Parts Needed',
    steps:     de?'Reparaturschritte':fr?'Étapes de réparation':es?'Pasos de reparación':it?'Passi di riparazione':mk?'Чекори за поправка':(sr||hr)?'Koraci popravke':lang==='tr'?'Onarım adımları':lang==='pl'?'Kroki naprawy':'Repair Steps',
    fixedQ:    de?'Hat das geholfen?':fr?'Cela a-t-il résolu?':es?'¿Se resolvió?':it?'Il problema è risolto?':mk?'Дали се поправи?':(sr||hr)?'Da li je popravljeno?':'Did this fix it?',
    fixedY:    de?'✅ Ja, behoben!':fr?'✅ Oui, résolu!':es?'✅ Sí, solucionado!':it?'✅ Sì, risolto!':mk?'✅ Да, поправено!':(sr||hr)?'✅ Da, popravljeno!':lang==='tr'?'✅ Evet, çözüldü!':lang==='pl'?'✅ Tak, naprawione!':'✅ Yes, fixed!',
    fixedN:    de?'❌ Noch defekt':fr?'❌ Toujours en panne':es?'❌ Aún defectuoso':it?'❌ Ancora rotto':mk?'❌ Сè уште дефектно':(sr||hr)?'❌ Još uvek pokvareno':lang==='tr'?'❌ Hâlâ bozuk':lang==='pl'?'❌ Nadal zepsute':'❌ Still broken',
    proBtn:    (isCar)?(de?'Autowerkstatt finden':fr?'Trouver un garage':es?'Buscar taller':it?'Trova officina':mk?'Најди автосервис':(sr||hr)?'Nađi auto servis':lang==='tr'?'Araba tamircisi bul':lang==='pl'?'Znajdź warsztat':'Find Auto Repair'):
             (cat==='motorcycle'||cat==='moto')?(de?'Motorradwerkstatt finden':fr?'Trouver un atelier moto':es?'Buscar taller de motos':it?'Trova officina moto':mk?'Најди мото сервис':(sr||hr)?'Nađi moto servis':lang==='tr'?'Motosiklet servisi bul':lang==='pl'?'Znajdź serwis moto':'Find Moto Repair'):
             (isTech)?(de?'Elektronik-Reparatur finden':fr?'Trouver réparation électronique':es?'Buscar reparación electrónica':it?'Trova riparazione elettronica':mk?'Најди електронски сервис':(sr||hr)?'Nađi servis elektronike':lang==='tr'?'Elektronik tamircisi bul':lang==='pl'?'Znajdź serwis elektroniczny':'Find Electronics Repair'):
             (cat==='appliances')?(de?'Gerätereparatur finden':fr?'Trouver réparateur électroménager':es?'Buscar reparación electrodomésticos':it?'Trova riparatore elettrodomestici':mk?'Најди сервис за апарати':(sr||hr)?'Nađi servis aparata':lang==='tr'?'Ev aletleri tamircisi bul':lang==='pl'?'Znajdź serwis AGD':'Find Appliance Repair'):
             de?'Fachmann finden':fr?'Trouver un pro':es?'Buscar profesional':it?'Trova professionista':mk?'Најди стручњак':(sr||hr)?'Nađi stručnjaka':lang==='tr'?'Usta bul':lang==='pl'?'Znajdź fachowca':'Find Professional',
    partsBtn:  cat==='car'?(de?'Autoteile finden':fr?'Trouver des pièces auto':it?'Trova ricambi auto':es?'Buscar repuestos':lang==='pl'?'Znajdź części do auta':mk?'Барај авто делови':(sr||hr)?'Traži auto dijelove':lang==='tr'?'Araba parçası bul':'Find Auto Parts'):
             cat==='motorcycle'||cat==='moto'?(de?'Motorradteile finden':fr?'Trouver des pièces moto':es?'Buscar repuestos moto':it?'Trovare parti moto':mk?'Барај делови за мотор':(sr||hr)?'Traži dijelove za motor':lang==='tr'?'Motor parçası bul':lang==='pl'?'Znajdź części motocyklowe':'Find Moto Parts'):
             cat==='tech'?(de?'Ersatzteile finden':lang==='tr'?'Yedek parça bul':lang==='pl'?'Znajdź części zamienne':'Find Spare Parts'):
             cat==='appliances'?(de?'Ersatzteile finden':lang==='tr'?'Yedek parça bul':lang==='pl'?'Znajdź części zamienne':'Find Spare Parts'):
               (de?'Teile finden':fr?'Trouver les pièces':es?'Buscar piezas':it?'Trovare parti':mk?'Барај делови':(sr||hr)?'Traži dijelove':lang==='tr'?'Parça bul':lang==='pl'?'Znajdź części':'Find Parts'),
    loading:   de?['Problem wird analysiert…','Ursache wird ermittelt…','Reparaturschritte werden erstellt…','Teile und Werkzeuge werden gesucht…']:
               fr?['Analyse du problème…','Identification de la cause…','Préparation des étapes…','Recherche des pièces…']:
               es?['Analizando tu problema…','Identificando la causa…','Preparando los pasos…','Buscando repuestos…']:
               it?['Analisi del problema…','Identificazione della causa…','Preparazione dei passi…','Ricerca dei ricambi…']:
               mk?['Анализа на проблемот…','Откривање на причината…','Подготовка на чекорите…','Барање делови…']:
               (sr||hr)?['Analiza problema…','Otkrivanje uzroka…','Priprema koraka…','Traženje delova…']:
               lang==='tr'?['Problem analiz ediliyor…','Neden araştırılıyor…','Onarım adımları hazırlanıyor…','Parça ve araçlar bulunuyor…']:
               lang==='pl'?['Analiza problemu…','Identyfikacja przyczyny…','Przygotowanie kroków…','Szukanie części i narzędzi…']:
               ['Analyzing your problem…','Identifying the cause…','Preparing repair steps…','Finding parts and tools…'],
  };
}

const CSS = `
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes toast{0%{opacity:0;transform:translateY(10px)}20%,80%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-10px)}}
::-webkit-scrollbar{display:none}
*{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
`;

export default function App() {
  // Version marker — confirms which bundle the phone is running
  // Change BUILD_ID here forces cache-busted re-evaluation
  console.log('[FixIt] BUILD 2026-08-04T14:00Z loaded');
  const [lang, setLang]           = useState(() => SS.get('lang') || 'en');
  const [selLang, setSelLang]     = useState('en');
  const [showLP, setShowLP]       = useState(false);
  const [screen, setScreen]       = useState('splash'); // always start at splash; restore happens in boot effect
  const [prevScr, setPrevScr]     = useState('home');
  const [curFix, setCurFix]       = useState(() => SS.get('curFix') || 'home');
  const [photo, setPhoto]         = useState(null);
  const [photoB64, setPhotoB64]   = useState(null);
  const [photoMime, setPhotoMime] = useState(null);
  const [vType, setVType]         = useState('car');
  const [vInput, setVInput]       = useState('');
  const [pInput, setPInput]       = useState('');
  const [pResults, setPResults]   = useState(null);
  const [hsnModel, setHsnModel]     = useState(''); // extra model field when HSN/TSN entered
  const [mapCat, setMapCat]       = useState('garage');
  // ── Auth / paywall state ──────────────────────────────────────────────────
  const [freeLimitHit,      setFreeLimitHit]      = useState(false); // paywall overlay
  const [freeRepairActive,  setFreeRepairActive]  = useState(false); // unlocks parts+nearby during free session
  // Cache of AI-translated part queries: Map<original, translated>
  // Avoids repeat API calls when the user clicks multiple store links for the same query.
  const translatedQueryCache = useRef({});
  const [freeRepairDone,    setFreeRepairDone]    = useState(false); // celebration screen after free trial ends
  const [showInstallModal,  setShowInstallModal]  = useState(false); // iOS install instructions
  const [authScreen,    setAuthScreen]    = useState(null);  // null|'login'|'signup'|'account'
  const [authEmail,     setAuthEmail]     = useState('');
  const [authPwd,       setAuthPwd]       = useState('');
  const [authErr,       setAuthErr]       = useState('');
  const [authBusy,      setAuthBusy]      = useState(false);
  const [resetPwd,      setResetPwd]      = useState('');
  const [resetConfirm,  setResetConfirm]  = useState('');
  const [resetSent,     setResetSent]     = useState(false);
  const [checkoutBusy,  setCheckoutBusy]  = useState(false);
  const [portalBusy,    setPortalBusy]    = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [legalPage,     setLegalPage]     = useState(null); // 'privacy' | 'terms' | null
  const [paywallSource, setPaywallSource] = useState('diagnosis'); // 'diagnosis' | 'nearby' | 'parts'
  const [deleteBusy,    setDeleteBusy]    = useState(false);
  const [emrgKey, setEmrgKey]     = useState(null);
  const [aiMsgIdx, setAiMsgIdx]   = useState(0);
  const [feedback, setFeedback]   = useState(null); // null | 'fixed' | 'broken'
  const [toast, setToast]         = useState(null);
  // ── Navigation stack (in-memory only — never persisted) ──────────────────
  const [navStack, setNavStack]       = useState([]);

  // ── Diagnosis history (persisted in fixit_history) ─────────────────────
  // Loaded once on mount with migration: removes corrupted string entries
  // (screen-name strings that were previously mixed in via the same state variable)
  const [diagHistory, setDiagHistory] = useState(() => {
    // On first render user is unknown — read the guest key only.
    // The login useEffect will swap to the user-scoped key once auth resolves.
    const raw = LS.get(historyKey(null)) || [];
    const cleaned = raw.filter(isValidDiagEntry);
    return cleaned;
  });

  const [restoredResult, setRestoredResult] = useState(null); // set when viewing a history entry

  // ── diagnosisRunId: unique per submit, carried through to save guard ───
  const diagRunIdRef   = useRef(null);   // set on each new submission
  const [diagCategory, setDiagCategory] = useState(null);
  const savedRunIdsRef = useRef(new Set()); // prevents double-save per run
  const [nearbyBump,  setNearbyBump]  = useState(0); // increment to force nearby refresh
  const [nearbyForce, setNearbyForce] = useState(false); // true = bypass 30min cache
  const [isOnline, setIsOnline]   = useState(navigator.onLine);
  const [showPWA, setShowPWA]     = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [onboardSlide, setOnboardSlide] = useState(0);
  const [totalSaved, setTotalSaved]   = useState(() => LS.get('totalSaved') || 0);
  const [profile, setProfile]         = useState(() => LS.get('profile') || null); // {vehicles:[], home:{}}
  const problemRef = useRef('');
  const diagCategoryRef = useRef('home'); // category of CURRENT diagnosis
  const aiMsgTimer = useRef(null);
  const pwaPrompt  = useRef(null);

  const { lat, lng, city, country, geocodeErr, locStatus, requestLocation, resolveCountryIfNeeded, getCC } = useLocation();
  const { result: aiResult, loading: aiLoading, error: aiError, diagnose, reset: aiReset } = useAI();
  const { bizs, loading: bizLoading, error: bizError, stale: bizStale, fallback: bizFallback, fetchBiz } = useNearby();
  const { user, profile: authProfile, isPro, authLoading, authEvent, login, signup, logout, refreshProfile } = useAuth();

  const t   = useCallback(k => tx(lang, k), [lang]);
  // cc: used for Nearby, Parts, Maps URLs — language-informed country
  const cc  = smartCC(country, lang);

  // ccGPS: raw GPS country only — NEVER uses language as a fallback
  // Used exclusively by the Emergency screen so language changes never alter
  // which country's emergency services are displayed.
  const ccGPS = (country && country !== 'DEFAULT') ? country : 'DEFAULT';
  const cdGPS = getCountry(ccGPS);   // country data for Emergency screen
  const cd    = getCountry(cc);      // country data for everything else

  const mu  = useCallback(q => mapsUrlFor(q, lat, lng, cc, lang), [lat, lng, cc, lang]);

  // Boot
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const bl = (navigator.language||'en').substring(0,2).toLowerCase();
    setSelLang(LANGS[bl] ? bl : 'en');
    const tm = setTimeout(() => {
      // Check onboarding
      if (!LS.get('onboarding_done')) {
        setScreen('onboarding');
      } else {
        setScreen('splash-r');
      }
    }, 900);

    // Restore state from a previous session if user navigated away (e.g. opened a store tab)
    // visibilitychange fires on tab return; pageshow handles Safari bfcache
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const savedLang   = SS.get('lang');
        const savedFix    = SS.get('curFix');
        if (savedLang) setLang(l => l !== savedLang ? savedLang : l);
        if (savedFix)  setCurFix(f => f !== savedFix ? savedFix : f);
        // If we have a saved diagnosis and were on result screen, stay there
        // (screen is already set; just make sure we don't reset to splash)
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Online/offline detection
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // PWA install prompt
    const handleInstall = e => { e.preventDefault(); pwaPrompt.current = e; };
    window.addEventListener('beforeinstallprompt', handleInstall);

    // PWA visit counter
    const visits = (LS.get('visits') || 0) + 1;
    LS.set('visits', visits);
    if (visits >= 3 && !LS.get('pwa_dismissed') && !window.matchMedia('(display-mode: standalone)').matches) {
      setTimeout(() => setShowPWA(true), 5000);
    }

    return () => {
      document.head.removeChild(style);
      clearTimeout(tm);
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('beforeinstallprompt', handleInstall);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // AI loading message cycle
  useEffect(() => {
    if (aiLoading) {
      setAiMsgIdx(0);
      aiMsgTimer.current = setInterval(() => {
        setAiMsgIdx(i => {
          const msgs = AI_MSGS[lang] || AI_MSGS.en;
          return (i + 1) % msgs.length;
        });
      }, 2200);
    } else {
      clearInterval(aiMsgTimer.current);
    }
    return () => clearInterval(aiMsgTimer.current);
  }, [aiLoading, lang]);

  // Nearby fetch: triggered by nearbyBump (incremented by goto+category change+refresh).
  // Safety guard: never fetch unless the user is authenticated AND Pro.
  // goto() already prevents non-Pro users from reaching screen='nearby',
  // but this defence-in-depth check ensures no API call fires even if state
  // becomes inconsistent (e.g. Pro subscription lapsed between renders).
  useEffect(() => {
    if (screen === 'nearby' && lat && lng && user && (isPro || freeRepairActive)) {
      fetchBiz(mapCat, lat, lng, nearbyForce, city, country);
      if (nearbyForce) setNearbyForce(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearbyBump, mapCat]);

  // Persist key UI state so returning from external store tab restores correctly
  useEffect(() => {
    if (lang) SS.set('lang', lang);
  }, [lang]);

  useEffect(() => {
    if (curFix) SS.set('curFix', curFix);
  }, [curFix]);

  useEffect(() => {
    // Persist screen — but not splash/onboarding/loc-ask (transient boot screens)
    if (screen && !['splash','splash-r','onboarding','loc-ask'].includes(screen)) {
      SS.set('lastScreen', screen);
    }
  }, [screen]);

  useEffect(() => {
    if (aiResult) {
      SS.set('aiResult', aiResult);
      SS.set('aiProblem', problemRef.current);
    }
  }, [aiResult]);

  // Restore diagnosis when user returns from external tab (iPhone Safari pageshow)
  useEffect(() => {
    const handlePageShow = (e) => {
      // e.persisted = true means Safari restored from bfcache (back from external tab)
      if (e.persisted) {
        const savedScreen = SS.get('lastScreen');
        const savedResult = SS.get('aiResult');
        // Only restore to result screen if we have a saved diagnosis
        if (savedResult && savedScreen === 'result') {
          // Don't call goto() — just set screen directly to avoid side effects
          setScreen('result');
        }
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []); // eslint-disable-line

  // Save to history when AI result arrives (top-level, legal)
  // diagRunIdRef.current is set by handleSubmit before calling diagnose()
  // so each diagnosis run has a unique ID that prevents double-saves
  useEffect(() => {
    console.log('[FixIt] saveHistory useEffect fired', { hasResult: !!aiResult, runId: diagRunIdRef.current });
    if (aiResult) {
      // Attach the active category so part-chip handlers can read it from `r._category`
      // instead of relying on curFix, which may not reflect the motorcycle category
      // when the user typed a motorcycle problem without selecting a motorcycle category tab.
      // Primary source: AI-returned _detectedCategory (language-neutral enum, set server-side)
      // This is the fix for image-only diagnosis where prob='' and keyword detection fails.
      if (aiResult._detectedCategory) {
        aiResult._category = aiResult._detectedCategory;
      } else if (!aiResult._category) {
        // Fallback 1: diagCategoryRef captures effectiveCat from text diagnosis
        aiResult._category = diagCategoryRef.current || curFix;
        // Fallback 2: re-detect from AI result text (handles image-only + old history entries)
        if (aiResult._category === 'home') {
          const resultText = [
            aiResult.diagnosis    || '',
            aiResult.proTip       || '',
            (aiResult.partsNeeded || []).join(' '),
            (aiResult.causes      || []).join(' '),
            (aiResult.steps       || []).map(s => (s.description || '') + ' ' + (s.title || '')).join(' '),
            problemRef.current    || '',
          ].join(' ').trim();
          const detected = resultText ? detectCategoryFromText(resultText) : null;
          if (detected) aiResult._category = detected;
        }
      }
      if (aiResult._category) setDiagCategory(aiResult._category);
      saveToHistory(aiResult, problemRef.current, diagRunIdRef.current);
    }
  }, [aiResult]); // eslint-disable-line

  function goto(s) {
    // ── Auth / entitlement gate — runs BEFORE setScreen ──────────────────────
    // Nearby and Parts require an authenticated Pro user.
    // Check auth first so the screen never changes and no API is ever called.
    if (s === 'nearby' || s === 'parts') {
      if (!user) {
        // Guest: show sign-in / create-account modal
        setAuthScreen('login');
        return;
      }
      if (!isPro && !freeRepairActive) {
        const alreadyUsed = authProfile?.free_trial_completed_at;
        if (alreadyUsed) { setFreeRepairDone(true); }
        else { setPaywallSource(s === 'nearby' ? 'nearby' : 'parts'); setFreeLimitHit(true); }
        return;
      }
    }
    // ── Navigation ───────────────────────────────────────────────────────────
    const skip = ['splash','splash-r','onboarding','loc-ask'];
    if (!skip.includes(screen) && screen !== s) {
      setNavStack(h => [...h.slice(-19), screen]);
    }
    setScreen(s);
    if (s === 'nearby') {
      // Set the default nearby category based on the current repair category.
      // This ensures motorcycle repairs show moto shops, home repairs show
      // hardware stores, etc. — not always 'garage' (car repair).
      const nearbyDefault = (
        curFix === 'car'                              ? 'garage'   :
        curFix === 'motorcycle' || curFix === 'bike'  ? 'moto'     :
        curFix === 'home'                             ? 'hardware' :
        curFix === 'appliances'                       ? 'hardware' :
        curFix === 'garden'                           ? 'hardware' :
        curFix === 'tech'                             ? 'it'       :
        curFix === 'pets'                             ? 'vet'      :
                                                        'garage'
      );
      setMapCat(nearbyDefault);
      setNearbyBump(b => b + 1);
    }
    if (s !== 'result') setFeedback(null);
  }

  function goBack() {
    setNavStack(h => {
      if (h.length === 0) { setScreen('home'); return h; }
      const prev = h[h.length - 1];
      setScreen(prev);
      return h.slice(0, -1);
    });
  }

  // Back button — always shows when history has entries (or when forced via onPress)
  const BackBtn = ({ onPress } = {}) => {
    const canGoBack = navStack.length > 0 || !!onPress;
    if (!canGoBack) return null;
    return (
      <button onClick={onPress || goBack} style={{
        background:'transparent', border:'none', color:C.m, cursor:'pointer',
        fontSize:'0.85rem', fontWeight:600, padding:'4px 0', fontFamily:'inherit',
        display:'flex', alignItems:'center', gap:4, marginBottom:8,
      }}>
← {lang==='de'?'Zurück':lang==='fr'?'Retour':lang==='es'?'Atrás':lang==='it'?'Indietro':
(lang==='mk')?'Назад':(lang==='sr'||lang==='hr')?'Natrag':lang==='tr'?'Geri':lang==='pl'?'Wstecz':'Back'}
      </button>
    );
  };

  function openFix(cat) {
    setCurFix(cat);
    setPrevScr('home');
    clearPhoto();
    problemRef.current = '';   // always start fresh when switching category
    goto('fix-now');
  }

  function clearPhoto() {
    setPhoto(null); setPhotoB64(null); setPhotoMime(null);
  }

  function confirmLang() { setLang(selLang); goto('loc-ask'); }

  function detectMime(b64) {
    // Detect real image type from base64 magic bytes — never trust browser MIME alone
    if (b64.startsWith('/9j/'))   return 'image/jpeg';
    if (b64.startsWith('iVBOR'))  return 'image/png';
    if (b64.startsWith('UklGR'))  return 'image/webp';
    if (b64.startsWith('R0lGO'))  return 'image/gif';
    return null; // unknown / unsupported
  }

  function handlePhoto(e) {
    const f = e.target.files[0]; if (!f) return;

    // Client-side resize + compress before upload.
    // Vercel body limit is 4.5 MB. iPhone photos can be 12+ MB raw.
    // We target ≤2.5 MB binary (~3.3 MB base64) so the full JSON request stays under 4.5 MB.
    const MAX_BYTES = 2.5 * 1024 * 1024;
    const MAX_DIM   = 1920; // longest side cap — sufficient for AI vision analysis

    // Read EXIF orientation tag from a JPEG's binary (first 64 KB is enough).
    // Needed for browsers that don't auto-rotate on canvas drawImage (older Safari/WebKit).
    function getExifOrientation(b64str) {
      try {
        const bin = atob(b64str.slice(0, 87380));
        if (bin.charCodeAt(0) !== 0xFF || bin.charCodeAt(1) !== 0xD8) return 1;
        let i = 2;
        while (i < bin.length - 1) {
          if (bin.charCodeAt(i) !== 0xFF) break;
          const marker = bin.charCodeAt(i + 1);
          const len    = (bin.charCodeAt(i + 2) << 8) | bin.charCodeAt(i + 3);
          if (marker === 0xE1) {
            const exif  = bin.slice(i + 4, i + 4 + len);
            const isLE  = exif[6] === 'I';
            const rd16  = (o) => isLE ? (exif.charCodeAt(o) | (exif.charCodeAt(o+1) << 8))
                                      : ((exif.charCodeAt(o) << 8) | exif.charCodeAt(o+1));
            const ifd   = 6 + rd16(10);
            const count = rd16(ifd);
            for (let j = 0; j < count; j++) {
              const off = ifd + 2 + j * 12;
              if (rd16(off) === 0x0112) return rd16(off + 8);
            }
          }
          if (marker === 0xDA) break;
          i += 2 + len;
        }
      } catch (_) {}
      return 1;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      const b64     = dataUrl.split(',')[1];
      const rawMime = detectMime(b64);

      if (!rawMime) {
        showToast(
          lang === 'de' ? '⚠️ Bildformat nicht unterstützt. Bitte JPG, PNG oder WebP verwenden.'
        : lang === 'fr' ? '⚠️ Format non supporté. Utilisez JPG, PNG ou WebP.'
        : lang === 'it' ? '⚠️ Formato non supportato. Usa JPG, PNG o WebP.'
        : lang === 'es' ? '⚠️ Formato no compatible. Usa JPG, PNG o WebP.'
        : lang === 'pl' ? '⚠️ Format nieobsługiwany. Użyj JPG, PNG lub WebP.'
        : lang === 'mk' ? '⚠️ Форматот не е поддржан. Користете JPG, PNG или WebP.'
        : (lang==='sr'||lang==='hr') ? '⚠️ Format nije podržan. Koristite JPG, PNG ili WebP.'
        : '⚠️ Image format not supported. Please upload JPG, PNG or WebP.');
        return;
      }

      const img = new Image();
      img.onload = () => {
        const orientation = rawMime === 'image/jpeg' ? getExifOrientation(b64) : 1;
        const swap = orientation >= 5; // 90° or 270° rotation needed
        const srcW = img.naturalWidth;
        const srcH = img.naturalHeight;

        // Canvas output dimensions (post-rotation)
        let outW = swap ? srcH : srcW;
        let outH = swap ? srcW : srcH;
        if (outW > MAX_DIM || outH > MAX_DIM) {
          const scale = Math.min(MAX_DIM / outW, MAX_DIM / outH);
          outW = Math.round(outW * scale);
          outH = Math.round(outH * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width  = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');

        // Apply EXIF rotation so the image is visually upright
        ctx.save();
        if      (orientation === 2) ctx.transform(-1,  0,  0,  1, outW,    0);
        else if (orientation === 3) ctx.transform(-1,  0,  0, -1, outW, outH);
        else if (orientation === 4) ctx.transform( 1,  0,  0, -1,    0, outH);
        else if (orientation === 5) ctx.transform( 0,  1,  1,  0,    0,    0);
        else if (orientation === 6) ctx.transform( 0,  1, -1,  0, outH,    0);
        else if (orientation === 7) ctx.transform( 0, -1, -1,  0, outH, outW);
        else if (orientation === 8) ctx.transform( 0, -1,  1,  0,    0, outW);
        // orientation===1: no transform needed
        ctx.drawImage(img,
          0, 0, srcW, srcH,             // source rect
          0, 0, swap ? outH : outW, swap ? outW : outH  // dest rect (pre-swap logical size)
        );
        ctx.restore();

        // Encode to JPEG, reducing quality until under MAX_BYTES
        let quality = 0.85;
        let outUrl  = canvas.toDataURL('image/jpeg', quality);
        let outB64  = outUrl.split(',')[1];
        while (outB64.length * 0.75 > MAX_BYTES && quality > 0.3) {
          quality -= 0.1;
          outUrl   = canvas.toDataURL('image/jpeg', quality);
          outB64   = outUrl.split(',')[1];
        }

        if (outB64.length * 0.75 > MAX_BYTES) {
          showToast(
            lang === 'de' ? '⚠️ Bild zu groß. Bitte kleineres Bild verwenden.'
          : lang === 'fr' ? '⚠️ Image trop grande. Utilisez une image plus petite.'
          : lang === 'it' ? '⚠️ Immagine troppo grande. Usa un\'immagine più piccola.'
          : lang === 'es' ? '⚠️ Imagen demasiado grande. Usa una imagen más pequeña.'
          : lang === 'pl' ? '⚠️ Obraz za duży. Użyj mniejszego obrazu.'
          : '⚠️ Image too large to process. Please use a smaller image.');
          return;
        }

        setPhoto(outUrl);
        setPhotoB64(outB64);
        setPhotoMime('image/jpeg'); // always JPEG after canvas compression
        // Clear stale problem text so image-only diagnosis sends prob='' to the server.
        // Without this, extractVehicleFromText(oldText) produces a badge from the previous run.
        problemRef.current = '';
        const _ta = document.getElementById('fixit-problem-input');
        if (_ta) _ta.value = '';
      };
      img.onerror = () => {
        showToast(lang === 'de'
          ? '⚠️ Bild konnte nicht geladen werden.'
          : '⚠️ Could not load image.');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(f);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // Detects diagnosis category from free-text when curFix==='home' (NavBar Fix entry).
  // Returns a valid category string or null (caller keeps 'home').
  function detectCategoryFromText(text) {
    if (!text) return null;
    const t = text.toLowerCase();
    // Motorcycle / scooter — checked first (shares brand names with cars)
    if (/\baprilia|vespa|piaggio|gilera|malaguti|kymco|sym\b/.test(t)) return 'motorcycle';
    if (/\b(motocro|enduro|scooter|moped|mofa|motorrad|motorbike|motorcycle|atv|quad|pit.?bike|dirt.?bike)\b/.test(t)) return 'motorcycle';
    if (/\b(ktm|husqvarna|sherco|ducati|triumph|harley|gasgas)\b/.test(t)) return 'motorcycle';
    if (/\b(z[uü]ndkerze|spark.?plug|vergaser|carburet|hauptd[uü]se|main.?jet|nema.?iskra|iskra|kettenöl|ölfilter.*motor|luftfilter.*motor)\b/.test(t)) return 'motorcycle';
    // Tech / devices
    if (/\b(wifi|wi-fi|wlan|router|laptop|computer|smartphone|handy|drucker|printer|bluetooth|gaming|playstation|xbox)\b/.test(t)) return 'tech';
    // Car — makes, models, and automotive part terms
    if (/\b(kfz|fahrzeug|kühlwasser|getriebe|kupplung|bremse|bremsbelag|auspuff|abgas|dpf|agr|egr|turbo|diesel|benzin|petrol|starter|lichtmaschine|alternator|batterie|battery|radiator|thermostat|zahnriemen|timing.?belt)\b/.test(t)) return 'car';
    if (/öl(?:wechsel|wanne|pumpe|filter|kühler)|ölstandanzei/.test(t)) return 'car';
    // Automotive compound nouns common in image diagnosis — prefix match (no trailing \b)
    if (/\b(thermostat|motorblock|zylinderko|zylinder|kolben|nockenwelle|kurbelwelle|kurbelgeh|einspritz|kraftstoff|lenkgetriebe|lenk|bremsscheibe|bremssattel|stossdämpf|spurstange|achse|gelenk|antriebswelle|kupplung|schaltgetriebe|automatikgetriebe|vergaser|drosselklapp|ansaugkrümmer|abgaskrümmer|krümmer|luft(?:filter|mas|kühler)|wasser(?:pumpe|kühler)|öl(?:kühler|filter|pumpe|wanne)|servo|hydraulik|abs\b|esp\b|airbag|sicherheitsgurt|fensterheber|scheibenwisch|klimakompressor|kompressor.*auto|condenser.*auto)/.test(t)) return 'car';
    // English automotive compound terms
    if (/\b(thermostat.?hous|cylinder.?head|engine.?block|crankshaft|camshaft|piston|valve.?cover|oil.?pan|fuel.?pump|water.?pump|brake.?disc|brake.?caliper|shock.?absorb|control.?arm|tie.?rod|drive.?shaft|intake.?manifold|exhaust.?manifold|throttle.?body|turbocharger|intercooler|radiator.?hose|timing.?chain|head.?gasket|spark.?plug.?boot|ignition.?coil)/.test(t)) return 'car';
    if (/\b(vw|volkswagen|golf|polo|passat|tiguan|touareg|caddy|transporter|t-roc|t-cross|arteon|audi|a[1-9]\b|q[1-9]\b|tt\b|r8\b|mercedes|benz|bmw|serie|3er|5er|7er|x[1-9]\b|ford|focus|fiesta|mondeo|kuga|puma|ranger|transit|seat|ibiza|leon|ateca|tarraco|arona|citroen|citroën|c[1-9]\b|berlingo|fiat|500|panda|tipo|punto|opel|corsa|astra|insignia|mokka|zafira|renault|clio|megane|scenic|kadjar|duster|peugeot|208|308|508|3008|5008|skoda|octavia|fabia|superb|kodiaq|karoq|hyundai|tucson|santa|kona|ioniq|kia|sportage|sorento|stinger|ceed|toyota|corolla|camry|rav4|yaris|aygo|highlander|honda|civic|accord|cr-v|hr-v|jazz|fr-v|mazda|cx-[0-9]|mx-[0-9]|mazda[0-9]|subaru|impreza|forester|outback|nissan|qashqai|juke|leaf|micra|note|volvo|v[0-9]{2}|xc[0-9]{2}|s[0-9]{2}|porsche|cayenne|macan|panamera|911|glühkerze|glow.?plug|einspritz|injektor|injector|zylinder|cylinder|kolben|piston|nockenwelle|camshaft|kurbelwelle|crankshaft|ölpumpe)\b/.test(t)) return 'car';
    // Garden
    if (/\b(rasenmäher|lawn.?mow|garten|garden|kettensäge|chainsaw|freischneider)\b/.test(t)) return 'garden';
    // Appliances
    if (/\b(waschmaschine|washing.?machine|kühlschrank|fridge|geschirrspüler|dishwasher|mikrowelle|microwave|staubsauger|vacuum|boiler|heizung)\b/.test(t)) return 'appliances';
    // Bicycle
    if (/\b(fahrrad|bicycle|ebike|e-bike|pedelec|mountainbike)\b/.test(t)) return 'bike';
    // Pets
    if (/\b(hund|dog|katze|cat|haustier|tierarzt)\b/.test(t)) return 'pets';
    return null;
  }

    async function runAI(override) {
    // Read textarea DOM directly as fallback — catches any onChange race conditions
    if (!override) {
      const el = document.getElementById('fixit-problem-input');
      if (el && el.value.trim()) problemRef.current = el.value.trim();
    }
    const prob = override ?? problemRef.current;
    if (!prob && !photoB64) { showToast(t('descProblem')); return; }

    // ── Free limit check ─────────────────────────────────────────────────────
    // Emergency keywords always bypass the limit
    const EMERGENCY_BYPASS = /gas\s*(leak|geruch)|gasleitung|live\s*(wire|cable)|240v|230v|stromschlag|sicherungskasten|tragende\s+wand|asbestos|asbest|notfall|emergency/i;
    const isEmergency = EMERGENCY_BYPASS.test(prob);

    if (!isEmergency) {
      if (!user) {
        // Guest: require authentication — never show usage/paywall messaging to guests
        setAuthScreen('login');
        return;
      }
      if (!isPro && AUTH_AVAILABLE) {
        // Authenticated free user: check Supabase usage (server is authoritative)
        const usage = await checkUsage(user.id);
        if (usage && !usage.allowed) { setFreeRepairActive(false); setFreeRepairDone(true); return; }
      }
    }
    // Clear stale photoB64 only when the visible photo preview is gone.
    // Do NOT clear when override is set — retries must re-send the original image.
    if (!photo && photoB64) clearPhoto();
    // ALWAYS clear old parts search state — never reuse from a previous diagnosis
    setPResults(null);
    setVInput('');
    setPInput('');
    setHsnModel('');
    // When curFix is 'home' (user arrived via NavBar Fix without selecting a tile),
    // detect the actual category from the problem text. This makes motorcycle, tech,
    // car etc. diagnoses open the correct Parts tab automatically — same as when the
    // user explicitly taps a category tile (which sets curFix before runAI).
    const effectiveCat = (curFix === 'home' && prob)
      ? (detectCategoryFromText(prob) || 'home')
      : curFix;
    diagCategoryRef.current = effectiveCat;
    setPrevScr('fix-now');
    setFeedback(null);
    // Generate a new runId for this submission; prevents double-save from
    // React StrictMode double-effects and rapid resubmits/retries
    diagRunIdRef.current = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
    // Store image for this run so History Retry can resend the same photo
    setRestoredResult(null); // clear any restored history result
    setDiagCategory(null); // reset so previous category doesn't show before new result arrives
    aiReset(); // clear stale vehicle badge / previous result before navigating
    goto('result');
    await diagnose({ problem: prob, photoB64, photoMime, category: effectiveCat, lang, countryName: cd.name, cc, userProfile: profile });
  }

  // ── Shared validator for diagnosis history entries ──────────────────────
  // Used when loading from LS (migration) and before saving a new entry.
  function isValidDiagEntry(h) {
    if (!h || typeof h !== 'object' || Array.isArray(h)) return false;
    const hasInput = (typeof h.problem === 'string' && h.problem.trim().length > 0)
                  || h.problem === 'Photo diagnosis';
    if (!hasInput) return false;
    if (!h.diagnosis || typeof h.diagnosis !== 'string' || h.diagnosis.trim().length === 0) return false;
    if (!h.date || typeof h.date !== 'string') return false;
    const ts = new Date(h.date);
    if (isNaN(ts.getTime())) return false;
    if (h._error || h._fallback || h._loading) return false;
    // Only reject exact-match placeholder strings that indicate a failed/loading state.
    // Do NOT use startsWith — real AI diagnoses often begin with "Error code...",
    // "Invalid sensor reading..." etc. which are legitimate diagnostic content.
    const BAD_EXACT = new Set(['try again','timed out','error','invalid','undefined','loading','…']);
    if (BAD_EXACT.has(h.diagnosis.toLowerCase().trim())) return false;
    return true;
  }

  function saveToHistory(result, prob, runId) {
    console.log('[FixIt] saveToHistory CALLED', {
      hasResult: !!result,
      runId,
      diagnosis: result?.diagnosis?.slice(0,40),
      problem: (prob || problemRef.current || '').slice(0,40),
      savedRunIds: Array.from(savedRunIdsRef.current),
    });
    if (!result) { console.log('[FixIt] saveToHistory EXIT: no result'); return; }

    // ── Run-ID dedup: one save per diagnosis run ──────────────────────────
    // runId is set by handleSubmit before calling diagnose().
    // We use crypto.randomUUID() to guarantee uniqueness even on fast double-clicks.
    if (runId) {
      if (savedRunIdsRef.current.has(runId)) {
        console.log('[FixIt] saveToHistory EXIT: duplicate runId', runId);
        return;
      }
      savedRunIdsRef.current.add(runId);
    } else {
      console.warn('[FixIt] saveToHistory: no runId — dedup skipped');
    }

    // ── Reject error/fallback results ────────────────────────────────────
    if (result._fallback) { console.log('[FixIt] saveToHistory EXIT: _fallback'); return; }
    if (result._error)    { console.log('[FixIt] saveToHistory EXIT: _error'); return; }
    if (!result.diagnosis){ console.log('[FixIt] saveToHistory EXIT: no diagnosis'); return; }

    const prob_ = prob || problemRef.current || 'Photo diagnosis';
    if (!prob_?.trim() && prob_ !== 'Photo diagnosis') {
      console.log('[FixIt] saveToHistory EXIT: empty problem', prob_);
      return;
    }

    // ── Mark free diagnosis as used ──────────────────────────────────────
    if (!result.callPro && !result._fallback) {
      LS.set('free_diagnosis_used', true); // cosmetic cache only — server record is authoritative
      if (user && AUTH_AVAILABLE && !isPro) {
        incrementUsage(user.id).catch(() => {});
        setFreeRepairActive(true); // immediate UI unlock for this session
        // Refresh profile so authProfile.free_trial_completed_at is populated.
        // The useEffect watching authProfile will confirm freeRepairActive on next render.
        refreshProfile && refreshProfile();
      }
    }

    // ── Parse estimatedCost midpoint for savings tracking ────────────────
    function parseSaving(costStr) {
      if (!costStr) return 0;
      const nums = (costStr.match(/[\d]+/g) || []).map(Number);
      if (nums.length === 0) return 0;
      if (nums.length === 1) return nums[0];
      return Math.round((nums[0] + nums[nums.length-1]) / 2);
    }
    const savedAmt = parseSaving(result.estimatedCost);

    // ── Build the complete entry (store full result for restore) ─────────
    const entry = {
      id:            Date.now(),
      problem:       prob_,
      // ── Complete AI result — every field rendered by the result screen ────
      // Stored verbatim so history restore is pixel-identical to original result.
      // No truncation except what the API already applied (diagnosis≤420, steps≤4).
      // Base fields
      diagnosis:     result.diagnosis     || '',
      confidence:    result.confidence    ?? null,
      status:        (result.status && result.status !== 'success') ? result.status : null,
      difficulty:    result.difficulty    || '',
      timeEstimate:  result.timeEstimate  || '',
      estimatedCost: result.estimatedCost || '',
      warningLevel:  result.warningLevel  || '',
      safetyWarning: result.safetyWarning || '',
      // Causes (rendered as bullet list)
      causes:        Array.isArray(result.causes)     ? result.causes.slice(0, 4)  : [],
      // Repair steps (rendered as numbered cards with emoji + tip)
      steps:         Array.isArray(result.steps)      ? result.steps.slice(0, 4)   : [],
      // Tools and parts (rendered as pill tags / shopping links)
      tools:         Array.isArray(result.tools)      ? result.tools               : [],
      partsNeeded:   Array.isArray(result.partsNeeded)? result.partsNeeded         : [],
      // Expert tip and pro-call reason
      proTip:        result.proTip        || '',
      proReason:     result.proReason     || '',
      callPro:       result.callPro       ?? false,
      proSearchQuery:result.proSearchQuery|| '',
      // ── Metadata (not rendered, used for history management) ────────────
      savedAmt,
      category:      result._category || curFix,
      lang:          lang,
      date:          new Date().toISOString(),
      cc,
      fixed:         null,
       // flag: original diagnosis included an image
    };

    // ── Validate the entry before saving ─────────────────────────────────
    if (!isValidDiagEntry(entry)) {
      console.warn('[FixIt] saveToHistory EXIT: validation failed', {
        problem: entry.problem?.slice(0,30),
        diagnosis: entry.diagnosis?.slice(0,30),
        date: entry.date,
      });
      return;
    }
    console.log('[FixIt] saveToHistory: validation PASSED, saving entry id', entry.id);

    // ── Prepend to diagHistory (use functional update to avoid stale closure) ─
    setDiagHistory(prev => {
      const updated = [entry, ...prev].slice(0, 20);
      // Write to user-scoped key — never to the global 'history' key
      LS.set(historyKey(user?.id), updated);
      return updated;
    });

    // ── Persist to Supabase via server-side API (non-blocking) ─────────
    // Uses /api/save-diagnosis with service_role key — guaranteed to write
    // regardless of client session state or RLS issues.
    if (user && AUTH_AVAILABLE) {
      (async () => {
        try {
          const token = await getAccessToken().catch(() => null);
          if (!token) { console.warn('[FixIt] save-diagnosis: no token'); return; }
          const resp = await fetch('/api/save-diagnosis', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ entry }),
          });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok || data.error) {
            console.error('[FixIt] save-diagnosis FAILED:', resp.status, data.error);
          } else {
            console.log('[FixIt] save-diagnosis OK id=', entry.id);
          }
        } catch (e) {
          console.error('[FixIt] save-diagnosis threw:', e.message);
        }
      })();
    }
  }

  function handleFeedback(val) {
    setFeedback(val);
    setDiagHistory(prev => {
      const updated = prev.map((h, i) => i === 0 ? {...h, fixed: val === 'fixed'} : h);
      LS.set(historyKey(user?.id), updated);
      return updated;
    });

    // Only count savings when user CONFIRMS the repair worked
    if (val === 'fixed') {
      const thisEntry = (diagHistory || [])[0];
      const amt = thisEntry?.savedAmt || 0;
      if (amt > 0) {
        const prev = LS.get('totalSaved') || 0;
        const next = prev + amt;
        LS.set('totalSaved', next);
        setTotalSaved(next);
      }
    }
  }

  async function handleShare() {
    const r = aiResult;
    if (!r) return;

    // Build shareable summary text (synchronous — must complete before any async call
    // so navigator.share() is called within the user gesture window)
    const savedLine = r.estimatedCost
      ? (lang==='de' ? `Mögliches Sparpotenzial: ca. ${r.estimatedCost}`
       : lang==='tr' ? `Tahmini tasarruf: yaklaşık ${r.estimatedCost}`
       : lang==='pl' ? `Potencjalne oszczędności: ok. ${r.estimatedCost}`
       : lang==='sr'||lang==='hr' ? `Procjena uštedine: oko ${r.estimatedCost}`
       : lang==='mk' ? `Проценета заштеда: ок. ${r.estimatedCost}`
       : `Estimated savings: approx. ${r.estimatedCost}`)
      : '';

    const headline =
      lang==='de' ? '🔧 Gerade selbst repariert mit FixIt!' :
      lang==='tr' ? '🔧 FixIt ile kendim tamir ettim!' :
      lang==='pl' ? '🔧 Sam naprawiłem z FixIt!' :
      lang==='fr' ? '🔧 Réparé moi-même avec FixIt !' :
      lang==='es' ? '🔧 ¡Lo arreglé yo mismo con FixIt!' :
      lang==='it' ? '🔧 Riparato da solo con FixIt!' :
      lang==='sr'||lang==='hr' ? '🔧 Sam/a popravio/la uz FixIt!' :
      lang==='mk' ? '🔧 Сам/а поправив со FixIt!' :
      '🔧 Just fixed it myself with FixIt!';

    const shareLines = [
      headline,
      savedLine,
      r.status || '',
      'https://www.fixit-app.com',
    ].filter(Boolean);
    const shareText = shareLines.join('\n');
    const shareUrl  = 'https://www.fixit-app.com';

    // Path A: Web Share API (iPhone, Android Chrome — must be called synchronously
    // within the user gesture; no await before this call)
    if (navigator.share) {
      try {
        await navigator.share({ title: 'FixIt', text: shareText, url: shareUrl });
        return;
      } catch (err) {
        // User cancelled (AbortError) or API failed — fall through to clipboard
        if (err?.name === 'AbortError') return; // user dismissed intentionally
        console.warn('[FixIt] navigator.share failed:', err);
      }
    }

    // Path B: Clipboard fallback (desktop browsers, unsupported browsers)
    try {
      await navigator.clipboard.writeText(shareText);
      setToast(
        lang==='de' ? '✅ In Zwischenablage kopiert!' :
        lang==='tr' ? '✅ Panoya kopyalandı!' :
        lang==='pl' ? '✅ Skopiowano do schowka!' :
        lang==='fr' ? '✅ Copié dans le presse-papiers !' :
        lang==='es' ? '✅ ¡Copiado al portapapeles!' :
        lang==='it' ? '✅ Copiato negli appunti!' :
        '✅ Copied to clipboard!'
      );
    } catch (_) {
      // Clipboard also denied — last resort: show the text in a toast so user can copy manually
      setToast('FixIt — ' + shareUrl);
    }
  }

  function extractSearchableProduct(raw, category) {
    if (!raw) return '';
    const s = raw.trim();

    // Pattern: "Kein ... – nur X erforderlich/benötigt" → extract X
    const nurMatch = s.match(/nur\s+(.+?)(?:\s+(?:erforderlich|benötigt|needed|required))?[–\-]?\s*$/i) ||
                     s.match(/only\s+(?:a\s+|an\s+)?(.+?)(?:\s+(?:required|needed))?$/i);
    if (nurMatch) {
      const extracted = nurMatch[1].trim().replace(/\s+(erforderlich|benötigt|needed|required)$/i, '').trim();
      if (extracted.length > 1) return extracted;
    }

    // Pattern: "X oder Y" → take first item only
    const oderMatch = s.match(/^([^–\-,]+?)\s+(?:oder|or)\s+/i);
    if (oderMatch && !s.toLowerCase().startsWith('kein') && !s.toLowerCase().startsWith('no ')) {
      return oderMatch[1].trim();
    }

    // Pattern: "Kein Ersatzteil nötig..." whole sentence starting with negation → return empty
    // so the caller falls back to problem context
    if (/^(kein|keine|no\s+replacement|no\s+part)/i.test(s)) {
      // Try to find tool/product after "nur" / "only"
      const fallback = s.match(/(?:nur|only)\s+(?:ein\s+|eine\s+|a\s+|an\s+)?([A-ZÄÖÜ][a-zäöüA-ZÄÖÜ0-9\-]+)/);
      if (fallback) return fallback[1];
      return ''; // signal: no part, use context
    }

    return ''; // no special pattern matched — let cleanProductSearchQuery handle it
  }

  // Clean AI-generated part name into a real buyable search query.
  // Call signature: (partName, _unused, category, brandOrModel, _unused2)
  // All callers: cleanProductSearchQuery(part, '', category, brand, '')
  function cleanProductSearchQuery(partName, _d, category, brandOrModel, _l) {
    if (!partName) return '';
    let q = partName.trim();

    // SHORT QUERY BYPASS: if already 2-5 words and no filler patterns, return as-is
    // New AI prompt generates short purchasable queries — don't mangle them
    const wordCount = q.split(/\s+/).length;
    const hasFillerPattern = /passend|Ersatzteil|kompatibel|für das|für den|für die|zur Reparatur|zum Modell/i.test(q);
    if (wordCount <= 5 && !hasFillerPattern) return q;

    // 1. Strip ALL parenthetical content (prices, conditions, explanations)
    q = q.replace(/\([^)]*\)/gi, '');

    // 2. Strip prices like €10-30, €5, 10€, $15
    q = q.replace(/€\s*[\d.,]+(-[\d.,]+)?/g, '');
    q = q.replace(/[\d.,]+\s*€/g, '');
    q = q.replace(/\$\s*[\d.,]+/g, '');

    // 3. Truncate at connectors — keep only the primary product name
    // "WLAN-Repeater bei schlechter Abdeckung" → "WLAN-Repeater"
    // "Neemöl oder pflanzliches Insektizid" → "Neemöl"
    q = q.replace(/\s+(?:oder|or)\s+.*/i, '');  // strip alternatives after "oder/or"
    q = q.replace(/\s+(bei\s+\w|\bfalls\b|\bwenn\b|\bfür\b|\bif\b\s|\bfor\b\s|\bwith\b\s).*/i, '');

    // 4. Strip leading filler words — loop until stable (Ggf. neuer X needs 2 passes)
    const leadingRe = /^(ggf\.?\s*|evtl\.?\s*|optional[:,]?\s*|falls\s+\S+,?\s*|if\s+broken[:,]?\s*|maybe[:,]?\s*|bei\s+Bedarf[:,]?\s*|neue[nrms]?\s+(?=\S)|je\s+nach\s+\S+\s*|possibly[:,]?\s*)/i;
    let _prev = '';
    while (q !== _prev) { _prev = q; q = q.replace(leadingRe, '').trim(); }

    // 5. Remove duplicate consecutive words (case-insensitive): "Beko Beko" → "Beko"
    q = q.replace(/\b(\w+)\s+\1\b/gi, '$1');

    // 5b. Strip common German part-name filler prefixes: "Ersatz-" → ""
    // "Ersatz-Antriebsriemen" → "Antriebsriemen", "Ersatz Dichtung" → "Dichtung"
    q = q.replace(/\bErsatz[-\s]/gi, '');
    q = q.replace(/\bReplacement\b\s*/gi, '');

    // 6a. Strip everything after em-dash or long dash (explanatory suffix)
    q = q.replace(/\s*[–—].*$/, '').trim();

    // 6b. Collapse multiple spaces
    q = q.replace(/\s{2,}/g, ' ').trim();

    // Fallback if everything was stripped
    if (!q) q = (category || 'repair part').trim();

    // Prepend brand/model when provided and not already in query
    // Skip for pets/garden (no brands), skip 2-letter country codes (de, en, fr)
    const brand = (brandOrModel || '').trim();
    const isPureLang = /^[a-z]{2}$/i.test(brand); // reject "de", "en", "fr" etc.
    const skipCats  = ['pets', 'garden'].includes(category);
    if (brand && !isPureLang && !skipCats) {
      const brandWord = brand.toLowerCase().split(' ')[0];
      if (!q.toLowerCase().includes(brandWord)) {
        q = brand.split(' ').slice(0, 4).join(' ') + ' ' + q;
      }
    }

    return q.trim();
  }

  // Maps common symptom phrases to buyable product search terms
  function symptomToProducts(prob, cat, lang) {
    const p = prob.toLowerCase();
    const de = lang === 'de';
    // Garden
    if (cat === 'garden') {
      if (/pflanzen.*sterb|pflanzen.*gelb|vergilb/i.test(p)) return de ? 'Pflanzendünger Blumenerde pH-Test' : 'plant fertilizer potting soil';
      if (/schädling|insekt|blattlaus/i.test(p)) return de ? 'Schädlingsspray Insektenmittel' : 'pest spray insecticide';
      if (/rasen|gras/i.test(p)) return de ? 'Rasensamen Rasendünger' : 'grass seed lawn fertilizer';
      if (/unkraut/i.test(p)) return de ? 'Unkrautvernichter Unkrautstecher' : 'weed killer';
      return ''; // no match — use raw query is ok for garden tools
    }
    // Car
    if (cat === 'car') {
      if (/springt nicht an|startet nicht|start/i.test(p)) return de ? 'Autobatterie Starthilfekabel Anlasser' : 'car battery jump leads starter motor';
      if (/überhitz|kühlwasser|temperatur/i.test(p)) return de ? 'Kühlmittel Thermostat Kühlerschlauch' : 'coolant thermostat radiator hose';
      if (/öl.*verlier|ölverlust/i.test(p)) return de ? 'Motoröl Dichtring Ölwannendichtung' : 'engine oil seal gasket';
      if (/bremse|bremst/i.test(p)) return de ? 'Bremsbeläge Bremsscheibe' : 'brake pads brake disc';
      if (/reifen|platt/i.test(p)) return de ? 'Reifen Flickset Reifenluft' : 'tyre repair kit tyre pump';
    }
    // Appliances
    if (cat === 'appliances') {
      if (/waschmaschine.*schleuder|schleuder/i.test(p)) return de ? 'Ablaufpumpe Motorkohlen Keilriemen Waschmaschine' : 'washing machine pump motor brushes belt';
      if (/ofen.*heiz|backofen/i.test(p)) return de ? 'Heizelement Ofendichtung Thermostat Backofen' : 'oven heating element door seal thermostat';
      if (/kühlschrank|kühlt nicht/i.test(p)) return de ? 'Kompressor Kühlschrank Thermostat' : 'fridge compressor thermostat';
      if (/spülmaschine/i.test(p)) return de ? 'Spülmaschinenpumpe Sprüharm Dichtung' : 'dishwasher pump spray arm seal';
    }
    // Tech
    if (cat === 'tech') {
      if (/laptop.*langsam|computer.*langsam/i.test(p)) return de ? 'SSD Festplatte RAM Arbeitsspeicher Laptop Reinigung' : 'SSD RAM laptop cleaning';
      if (/lädt nicht|ladekabel|akku/i.test(p)) return de ? 'Ladekabel USB-C Akku Ersatz' : 'charging cable USB-C battery replacement';
      if (/wlan|wifi|internet/i.test(p)) return de ? 'WLAN Repeater Router USB WLAN Stick' : 'WiFi repeater router USB adapter';
      if (/bildschirm|display/i.test(p)) return de ? 'Laptop Display Ersatz Monitor HDMI' : 'laptop screen replacement monitor';
    }
    // Home
    if (cat === 'home') {
      if (/wasserhahn.*tropf|tropfend/i.test(p)) return de ? 'Wasserhahn Dichtung Kartusche Ersatz' : 'tap washer cartridge replacement';
      if (/toilette.*läuft|wc.*läuft/i.test(p)) return de ? 'WC Füllventil Ablaufventil Spülkasten' : 'toilet fill valve flush valve cistern';
      if (/steckdose|schalter|elektro/i.test(p)) return de ? 'Steckdose Lichtschalter Unterputzdose' : 'electrical socket switch outlet box';
      if (/tür.*schließ|schloss/i.test(p)) return de ? 'Türschloss Türband Schließblech' : 'door lock hinge strike plate';
    }
    // Bike
    if (cat === 'bike') {
      if (/bremse|bremst/i.test(p)) return de ? 'Fahrrad Bremsbeläge Bremszug' : 'bike brake pads cable';
      if (/reifen|platt|schlauch/i.test(p)) return de ? 'Fahrradschlauch Flickset Fahrradreifen' : 'inner tube puncture repair kit tyre';
      if (/kette|gangschaltung|schaltz/i.test(p)) return de ? 'Fahrradkette Kassette Schaltwerk' : 'bike chain cassette derailleur';
    }
    return ''; // no match found
  }

  function buildPartsQueryFromDiagnosis(result, problem, category, vehicleCtx) {
    const parts = result?.partsNeeded || [];
    const prob  = (problem || '').trim();

    // Build a compact vehicle prefix from detected context (e.g. "BMW X3 2.0d")
    const vPrefix = vehicleCtx
      ? [vehicleCtx.make, vehicleCtx.model, vehicleCtx.engine, vehicleCtx.year]
          .filter(Boolean).join(' ').trim()
      : '';

    // Helper: ensure vehicle prefix is in a query (avoid duplication)
    // Checks for make OR model first-word — so "Golf 7 AGM..." is not re-prefixed with "VW"
    function ensureVehicle(q) {
      if (!vPrefix || !q) return q;
      const qUp = q.toUpperCase();
      const vehicleTokens = [vehicleCtx?.make, (vehicleCtx?.model||'').split(' ')[0]]
        .filter(s => s && s.length > 2);
      const alreadyHasVehicle = vehicleTokens.some(t => qUp.includes(t.toUpperCase()));
      return alreadyHasVehicle ? q : `${vPrefix} ${q}`;
    }

    if (parts.length > 0) {
      // First try smart extraction (handles "Kein Ersatzteil – nur Ladegerät" cases)
      const smart = extractSearchableProduct(parts[0], category);
      if (smart && smart.length > 1) {
        const cleaned = cleanProductSearchQuery(smart, '', category, '', '');
        if (cleaned && cleaned.length > 1) return ensureVehicle(cleaned);
      }
      // Fallback: clean the raw part name
      const first = cleanProductSearchQuery(parts[0], '', category, '', '');
      if (first && first.length > 2) return ensureVehicle(first);
    }
    // Convert symptom text to product query if possible
    const symQuery = symptomToProducts(prob, category, lang);
    if (symQuery) return ensureVehicle(symQuery);
    // Last fallback: cleaned problem text
    if (prob && prob.length < 40) return ensureVehicle(cleanProductSearchQuery(prob, '', category, '', ''));
    return vPrefix || category || 'repair part';
  }

  function findParts() {
    if (!pInput.trim()) return;
    const isHSN = /^\d{4}/.test(vInput.trim());
    // Pass empty brandOrModel — vInput is prepended separately in searchQ below
    // This prevents "trek marlin 6 trek marlin 6 bremsbelag" duplication
    const cleanPart = cleanProductSearchQuery(pInput, '', vType, '', '');
    let searchQ;
    if (isHSN && hsnModel.trim()) {
      searchQ = `${hsnModel.trim()} ${cleanPart}`;
    } else if (isHSN && !hsnModel.trim()) {
      searchQ = `Autoteile ${cleanPart}`;
    } else {
      searchQ = vInput ? `${vInput} ${cleanPart}` : cleanPart;
    }
    setPResults({ q: cleanPart, vehicle: vInput, hsnModel: hsnModel.trim(), searchQ, isHSN, category: vType });
  }

  // ── Stripe checkout ────────────────────────────────────────────────────────
  async function startCheckout(plan) {
    if (!user) { setAuthScreen('signup'); return; }
    setCheckoutBusy(true);
    // Navigate the current tab to Stripe Checkout.
    // We do NOT use window.open() because browsers block async popup redirections:
    // window.open('','_blank') creates a blank popup synchronously, but then
    // win.location.href after an await is silently blocked by Safari iOS and others.
    // The popup stays blank and nothing happens — the confirmed root cause of the
    // yearly checkout "does nothing" bug.
    // Same-tab navigation (window.location.href) always works.
    // Stripe redirects back to success_url / cancel_url after the user acts.
    try {
      const token = await getAccessToken();
      if (!token) {
        showToast(t('connectionError'));
        return;
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        // Navigate the current tab — works on every browser, no popup required
        window.location.href = data.url;
      } else {
        console.error('[checkout] no url returned:', data);
        showToast(data.message || (lang==='de'?'Zahlung nicht verfügbar':'Payment unavailable'));
      }
    } catch (err) {
      console.error('[checkout] error:', err);
      showToast(t('connectionError'));
    }
    finally { setCheckoutBusy(false); }
  }

  // ── Stripe Customer Portal ──────────────────────────────────────────────────
  async function openPortal() {
    if (!user) return;
    setPortalBusy(true);
    // Open blank window synchronously (before await) to preserve the user-gesture
    // context — async/await breaks it, causing popup blockers to block window.open.
    const win = window.open('', '_blank');
    try {
      const res  = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.url) {
        if (win && !win.closed) {
          win.location.href = data.url;
        } else {
          // Popup was blocked — navigate same tab (Stripe return_url brings user back)
          window.location.href = data.url;
        }
      } else {
        if (win) win.close();
        showToast(data.message || (t('portalUnavailable')));
      }
    } catch (_) {
      if (win) win.close();
      showToast(t('connectionError'));
    } finally {
      setPortalBusy(false);
    }
  }

  // ── Delete account ────────────────────────────────────────────────────────
  async function handleDeleteAccount() {
    if (!user) return;
    setDeleteBusy(true);
    try {
      // Get the access token BEFORE logout so the server can verify identity.
      const token = await getAccessToken();
      if (!token) { showToast(t('deleteError')); return; }

      // Call the server-side endpoint which:
      //   1. Verifies the JWT
      //   2. Cancels any active Stripe subscription
      //   3. Calls supabase.auth.admin.deleteUser() — requires service-role key
      //   Supabase then cascades:
      //     → profiles ON DELETE CASCADE (row deleted)
      //     → usage    ON DELETE CASCADE (row deleted)
      //     → payments ON DELETE SET NULL (anonymised; retained for legal compliance)
      const res = await fetch('/api/delete-account', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('[delete-account] server error:', res.status, data);
        showToast(data.message || t('deleteError'));
        return;
      }

      // Deletion succeeded — clear all local state and sign out cleanly.
      // (The server already removed the auth.users row, so signOut is just cleanup.)
      await logout();
      setAuthScreen(null);
      setDeleteConfirm(false);
      setFreeLimitHit(false);
      setScreen('home');
      setNavStack([]);
      LS.set('free_diagnosis_used', false);
      showToast(t('accountDeleted'));

    } catch (err) {
      console.error('[delete-account] unexpected error:', err);
      showToast(t('deleteError'));
    } finally { setDeleteBusy(false); }
  }

  // ── Auth actions ──────────────────────────────────────────────────────────
  async function handleAuthSubmit() {
    if (!authEmail.trim() || !authPwd.trim()) {
      setAuthErr(t('emailRequired'));
      return;
    }
    setAuthBusy(true); setAuthErr('');
    try {
      if (authScreen === 'signup') {
        await signup(authEmail.trim(), authPwd);
      } else {
        await login(authEmail.trim(), authPwd);
        await refreshProfile();
      }
      if (authScreen === 'signup') {
        // Show verification screen — do not let user proceed until confirmed
        setAuthScreen('verify-email');
        setAuthPwd(''); // clear password but keep email for display
      } else {
        await refreshProfile();
        setAuthScreen(null); setAuthEmail(''); setAuthPwd('');
      }
    } catch (err) {
      const msg = err.message || '';
      setAuthErr(
        msg.includes('Invalid login') ? (t('invalidCredentials')) :
        msg.includes('already registered') ? (t('emailTaken')) :
        msg.includes('auth_unavailable') ? (lang==='de'?'Supabase nicht konfiguriert — App läuft im Gastmodus.':'Supabase not configured — app runs in guest mode.') :
        msg
      );
    } finally { setAuthBusy(false); }
  }

  async function handleForgotSubmit() {
    if (!authEmail.trim()) { setAuthErr(lang==='de'?'Bitte E-Mail eingeben':'Please enter your email'); return; }
    setAuthBusy(true); setAuthErr('');
    try {
      await resetPasswordForEmail(authEmail.trim());
      // Always show success regardless of whether email exists — prevents enumeration
      setResetSent(true);
    } catch (err) {
      const msg = err.message || '';
      setAuthErr(
        msg.includes('auth_unavailable') ? (lang==='de'?'Auth nicht verfügbar':'Auth unavailable') :
        msg.includes('Invalid email') ? (lang==='de'?'Ungültige E-Mail-Adresse':'Invalid email address') :
        lang==='de'?'Fehler beim Senden. Bitte erneut versuchen.':'Error sending link. Please try again.'
      );
    } finally { setAuthBusy(false); }
  }

  async function handleResetSubmit() {
    if (!resetPwd || !resetConfirm) { setAuthErr(lang==='de'?'Bitte beide Felder ausfüllen':'Please fill in both fields'); return; }
    if (resetPwd.length < 6) { setAuthErr(lang==='de'?'Passwort muss mindestens 6 Zeichen haben':'Password must be at least 6 characters'); return; }
    if (resetPwd !== resetConfirm) { setAuthErr(t('passwordsNoMatch')); return; }
    setAuthBusy(true); setAuthErr('');
    try {
      await updatePassword(resetPwd);
      // Password updated successfully — clear the recovery session state,
      // clear the inputs, and redirect to sign-in with a success toast.
      setResetPwd(''); setResetConfirm('');
      showToast(t('passwordUpdated'));
      setAuthScreen('login');
    } catch (err) {
      const msg = err.message || '';
      setAuthErr(
        msg.includes('auth_unavailable')  ? (lang==='de'?'Auth nicht verfügbar':'Auth unavailable') :
        msg.includes('Password should be') ? (lang==='de'?'Passwort muss mindestens 6 Zeichen haben':'Password must be at least 6 characters') :
        lang==='de'?'Passwort konnte nicht aktualisiert werden. Bitte neu anfordern.':'Could not update password. Please request a new link.'
      );
    } finally { setAuthBusy(false); }
  }

  // ── React to Supabase auth events ─────────────────────────────────────────
  // Detects PASSWORD_RECOVERY (fired when user arrives via reset email link)
  // and switches to the reset-password screen immediately.
  useEffect(() => {
    if (authEvent === 'PASSWORD_RECOVERY') {
      setAuthScreen('reset-password');
    }
  }, [authEvent]);

  // ── Derive free trial state from Supabase profile (account-scoped) ──────────
  useEffect(() => {
    if (authProfile && !isPro) {
      if (authProfile.free_trial_completed_at) {
        setFreeRepairActive(true);
      }
    } else if (!authProfile) {
      setFreeRepairActive(false);
      setFreeRepairDone(false);
    }
  }, [authProfile, isPro]);

  // ── Sync analysis history on login ─────────────────────────────────────────
  // Triggered when user changes (null → logged-in, or account switch).
  // Security rules:
  //   • Reads ONLY from user-scoped localStorage key: history:<uid>
  //   • NEVER reads from history:guest or the previous in-memory state
  //     (state may still contain the previous user's entries if this is an
  //     account switch without a page reload)
  //   • Merges user-scoped local entries with Supabase cloud entries
  //   • Deduplicates by entry.id; keeps newest 50 (UI shows latest 20)
  //   • Non-blocking — never delays the UI
  useEffect(() => {
    if (!user || !AUTH_AVAILABLE) return;
    // Load this user's local entries immediately (synchronous, no flash of empty)
    // then update with merged cloud+local once Supabase responds.
    const _localImmediate = (LS.get(historyKey(user.id)) || []).filter(isValidDiagEntry);
    setDiagHistory(_localImmediate);
    (async () => {
      try {
        // Step 1: read this user's local history (safe — scoped key)
        const localEntries = _localImmediate;

        // Step 2: fetch cloud entries (ordered newest-first, up to 100)
        let cloudEntries = [];
        const client = await getSbClient();
        if (client) {
          const { data, error } = await client
            .from('diagnoses')
            .select('entry, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100);
          if (error) {
            console.error('[FixIt] diagnoses fetch FAILED:', error.code, error.message, '— check RLS policy');
          } else {
            cloudEntries = (data || []).map(r => r.entry).filter(isValidDiagEntry);
            console.log('[FixIt] diagnoses fetch:', cloudEntries.length, 'valid entries for user', user.id.slice(0,8));
          }
        }

        // Step 3: merge cloud + local, dedup by entry.id (cloud wins on conflict)
        const seen = new Set();
        const merged = [...cloudEntries, ...localEntries]
          .filter(e => { if (!e?.id || seen.has(e.id)) return false; seen.add(e.id); return true; })
          .slice(0, 50);

        // Step 4: write merged list to user-scoped local key and update state
        LS.set(historyKey(user.id), merged);
        setDiagHistory(merged);
        console.log('[FixIt] history synced:', merged.length, 'entries for user', user.id.slice(0,8));
      } catch (e) {
        // Sync failed — load local-only as fallback
        console.warn('[FixIt] history sync failed (non-fatal):', e.message);
        const localOnly = (LS.get(historyKey(user.id)) || []).filter(isValidDiagEntry);
        setDiagHistory(localOnly);
      }
    })();
  }, [user]); // eslint-disable-line

  // ── Market-language query normalisation for Parts links ─────────────────────
  // Called when a user clicks a store URL or Maps link in the Parts screen.
  // If the query is already in the market language (or the market uses the same script),
  // opens the URL immediately. If not, calls /api/translate-part once (result cached),
  // then opens the translated URL.
  // Opens a store link. For stores with a `resolve` property (Polo, Louis),
  // attempts to find the direct product URL server-side first.
  // Falls back to the store's `u(q)` URL (Google site-search) if resolution fails.
  function openStore(st, query) {
    if (!st.resolve) {
      // No resolution needed (Amazon, eBay, etc.) — open via translateAndOpen
      // so the query is translated to the market language before building the URL.
      translateAndOpen(st.u, query);
      return;
    }

    // ── Moto stores with resolve: property ──────────────────────────────────
    // Flow:
    //   1. Open a new tab immediately (popup policy; FixIt stays open).
    //   2. Show a brief loading page so the user never sees a raw blank tab.
    //   3. Try to resolve a direct product URL with a strict 1.5 s timeout.
    //      - Hit  → navigate the tab to the exact product page.
    //      - Miss → immediately navigate to the store's verified search URL
    //               with the full query pre-entered (never homepage, never 404).
    const tabWin = window.open('', '_blank');
    if (tabWin) {
      tabWin.document.write(
        '<!DOCTYPE html><html><head><meta charset="utf-8"><title>...</title>' +
        '<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;' +
        'height:100vh;margin:0;background:#0f1117;color:#fff;font-size:1.1rem}' +
        '</style></head><body><div>🔍 ' +
        (lang === 'de' ? 'Wird geöffnet…' :
         lang === 'fr' ? 'Ouverture…' :
         lang === 'it' ? 'Apertura…' :
         lang === 'pl' ? 'Otwieranie…' : 'Opening…') +
        '</div></body></html>'
      );
    }

    const searchFallback = st.u(query); // verified generic search URL — always works

    (async () => {
      let targetUrl = searchFallback; // default to search if resolve is slow or fails

      try {
        // 1.5 s hard timeout — resolver must respond within this window.
        // If it can find a direct product URL that fast (cache hit), great.
        // Otherwise the user gets the search page immediately — no long wait.
        const ctrl    = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 1500);

        let resp, data;
        try {
          resp = await fetch('/api/resolve-store-url', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ query, domain: st.resolve }),
            signal:  ctrl.signal,
          });
          data = await resp.json().catch(() => ({}));
        } finally {
          clearTimeout(timeout);
        }

        // Accept only a validated direct product URL on the correct domain.
        if (resp && resp.ok && data && data.url) {
          targetUrl = data.url; // direct product page
          console.log('[FixIt] openStore resolved:', data.url, data.cached ? '(cache)' : '(live)');
        } else {
          console.log('[FixIt] openStore: no direct URL, using search fallback:', searchFallback);
        }
      } catch (err) {
        // AbortError (timeout) or network error → fall through to search.
        if (err.name !== 'AbortError') {
          console.error('[FixIt] openStore error:', err.message);
        } else {
          console.log('[FixIt] openStore: resolver timeout, using search fallback');
        }
      }

      // Navigate the already-open tab.
      // tabWin.location.href works because we own the tab (opened without noopener).
      if (tabWin && !tabWin.closed) {
        tabWin.location.href = targetUrl;
      }
    })();
  }

  async function translateAndOpen(url_builder, query, targetUrl) {
    // Fast path: UI language matches market language — open immediately, no translation needed.
    if (!queryNeedsTranslation(query, cc, lang)) {
      window.open(targetUrl || url_builder(query), '_blank', 'noopener,noreferrer');
      return;
    }
    // Cache hit: this query was already translated this session.
    if (translatedQueryCache.current[query]) {
      const cached = translatedQueryCache.current[query];
      const cacheUrl = targetUrl || url_builder(cached);
      console.log('[FixIt] ═══ CACHE HIT — opening directly ═══',
        {original: query, translated: cached, url: cacheUrl});
      // On mobile, if window.open is blocked (returns null), fall back to
      // navigating the current tab as a last resort.
      const cacheWin = window.open(cacheUrl, '_blank', 'noopener,noreferrer');
      if (!cacheWin) {
        console.warn('[FixIt] window.open blocked (mobile). Navigating current tab.');
        window.location.href = cacheUrl;
      }
      return;
    }
    // Translation needed.
    // Open about:blank synchronously — browser popup policy requires window.open
    // to be in the synchronous part of the click handler.
    // We then use location.replace() on the SAME tab after translation completes.
    // location.replace() sends the FixIt app URL as the HTTP Referer (not about:blank),
    // which is why Polo Motorrad and Louis Motorrad serve the search correctly.
    // (location.href navigation from about:blank sends an empty Referer, causing
    // those sites to drop the query or redirect to their homepage.)
    const pending = window.open('about:blank', '_blank', 'noopener,noreferrer');
    try {
      const token = await getAccessToken().catch(() => null);
      const resp = await fetch('/api/translate-part', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query,
          queryLang:   lang,
          countryCode: cc,
          category:    vType || 'car',
          vehicleCtx:  pResults?.vehicleCtx || null,
        }),
      });
      const data = await resp.json();
      const translated = data?.translated || query;
      translatedQueryCache.current[query] = translated;
      const finalUrl = targetUrl || url_builder(translated);
      console.log('[FixIt] translateAndOpen',
        {original: query, translated, finalUrl});
      // Navigate the already-open tab with location.replace().
      // replace() removes about:blank from history and sends the opener URL as Referer.
      if (pending && !pending.closed) {
        pending.location.replace(finalUrl);
      } else if (!pending) {
        // Popup was blocked by the browser (common on mobile).
        // Translation is now cached — the next tap will hit the cache and open directly.
        // As an immediate fallback, try window.open once more (succeeds if user gesture is fresh).
        console.warn('[FixIt] translateAndOpen: popup blocked, trying direct open.');
        const retry = window.open(finalUrl, '_blank', 'noopener,noreferrer');
        if (!retry) window.location.href = finalUrl;
      } else {
        // pending.closed: user closed the tab while waiting.
        console.warn('[FixIt] translateAndOpen: pending tab was closed before navigation');
      }
    } catch (err) {
      console.error('[FixIt] translateAndOpen error:', err);
      const fallbackUrl = targetUrl || url_builder(query);
      if (pending && !pending.closed) {
        pending.location.replace(fallbackUrl);
      }
    }
  }

  // ── Check Stripe redirect on app load ────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    const portal = params.get('portal');
    if (portal === 'return') {
      window.history.replaceState({}, '', '/');
      // Refresh immediately, then retry at 2 s and 5 s.
      // The Stripe webhook (which writes cancel_at) fires asynchronously after
      // the portal redirect and may not have reached Supabase on the first read.
      refreshProfile();
      setTimeout(() => refreshProfile(), 2000);
      setTimeout(() => refreshProfile(), 5000);
    }
    if (checkout === 'success') {
      window.history.replaceState({}, '', '/');
      showToast(t('proUnlocked'));
      setFreeLimitHit(false);
      // Refresh immediately, then retry after 2 s and 5 s to catch the webhook DB write.
      // The Stripe webhook fires asynchronously and may take a moment to update the profile.
      if (user) {
        refreshProfile();
        setTimeout(() => refreshProfile(), 2000);
        setTimeout(() => refreshProfile(), 5000);
      }
    } else if (checkout === 'cancelled') {
      window.history.replaceState({}, '', '/');
    }
  }, []); // eslint-disable-line

  // ── Emergency: resolve country when screen is active and country unknown ──
  // Safe side-effect: runs only when screen, country, lat, or lng changes.
  // resolveCountryIfNeeded is memoized; it is a no-op when country is already set.
  useEffect(() => {
    if ((screen === 'emergency' || screen === 'parts') && country === 'DEFAULT') {
      resolveCountryIfNeeded();
    }
  }, [screen, country, lat, lng, resolveCountryIfNeeded]);

  const hr = new Date().getHours();
  const greeting = hr < 12 ? t('goodMorning') : hr < 18 ? t('goodAfternoon') : t('goodEvening');
  const aiMsgs = AI_MSGS[lang] || AI_MSGS.en;


  // ── Auth & Paywall modals — defined before screen returns, rendered as siblings ──
  const AUTH_MODAL = (
    <>
      {/* ── Paywall overlay ── */}
      {freeLimitHit && (
        <div style={{position:'fixed',inset:0,background:'#08060A',zIndex:300,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px',overflow:'auto'}}>          <div style={{position:'absolute',top:-80,right:-80,width:320,height:320,borderRadius:'50%',background:'radial-gradient(circle,rgba(232,82,26,0.18) 0%,transparent 70%)',pointerEvents:'none'}}/>          <button onClick={()=>setFreeLimitHit(false)} style={{position:'absolute',top:'max(20px,env(safe-area-inset-top))',right:20,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,width:36,height:36,cursor:'pointer',color:'rgba(255,255,255,0.5)',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'}}>✕</button>          <div style={{fontSize:'2.2rem',fontWeight:900,letterSpacing:'-0.03em',marginBottom:6}}><span style={{color:'#EDEAE4'}}>FIX</span><span style={{color:'#E8521A'}}>IT</span></div>          <div style={{width:40,height:2,background:'#E8521A',borderRadius:1,marginBottom:28}}/>          <div style={{fontSize:'2.8rem',marginBottom:16}}>{paywallSource==='nearby'?'📍':paywallSource==='parts'?'🔩':'🔓'}</div>          <div style={{fontSize:'1.4rem',fontWeight:800,textAlign:'center',marginBottom:10,color:'#F0EDE8'}}>{paywallSource==='nearby'?(lang==='de'?'Nearby ist eine Pro-Funktion':'Nearby Services is a Pro feature'):paywallSource==='parts'?(lang==='de'?'Teile-Suche ist eine Pro-Funktion':'Parts Lookup is a Pro feature'):t('freeDiagnosisUsed')}</div>          <div style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.45)',textAlign:'center',lineHeight:1.65,marginBottom:24,maxWidth:300}}>{paywallSource==='nearby'?(lang==='de'?'Finde Werkstätten und Teilehandel in deiner Nähe — mit einem Pro-Abonnement.':'Find workshops and parts shops near you — with a Pro subscription.'):paywallSource==='parts'?(lang==='de'?'Suche nach Ersatzteilen bei lokalen Händlern oder online — mit einem Pro-Abonnement.':'Search for spare parts at local dealers or online — with a Pro subscription.'):t('freeDiagnosisDesc')}</div>          <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginBottom:24}}>            {[['🔒','Nearby'],['🔒',lang==='de'?'Teile':'Parts'],['✅',lang==='de'?'Notfall':'Emergency'],['🔒',lang==='de'?'Unbegrenzte KI':'Unlimited AI']].map(([ic,lb])=>(              <div key={lb} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:100,padding:'5px 12px',fontSize:'0.72rem',color:'rgba(255,255,255,0.55)',display:'flex',gap:5,alignItems:'center'}}><span>{ic}</span><span>{lb}</span></div>            ))}          </div>          {!user ? (            <button onClick={()=>{setFreeLimitHit(false);setAuthScreen('signup');}} style={{width:'100%',maxWidth:340,background:'rgba(232,82,26,0.9)',border:'none',borderRadius:14,padding:'14px',fontSize:'0.9rem',fontWeight:700,color:'#fff',fontFamily:'inherit',cursor:'pointer',marginBottom:10}}>              🔑 {t('createAccountUpgrade')}              <div style={{fontSize:'0.72rem',fontWeight:400,marginTop:3,opacity:0.8}}>{lang==='de'?'Kostenlos registrieren':'Free to sign up'}</div>            </button>          ) : (            <div style={{width:'100%',maxWidth:340,display:'flex',flexDirection:'column',gap:8}}>              {/* Yearly — highlighted as best value */}              <button onClick={()=>startCheckout('yearly')} disabled={checkoutBusy} style={{background:'linear-gradient(135deg,rgba(232,82,26,0.25),rgba(232,82,26,0.12))',border:'1px solid rgba(232,82,26,0.5)',borderRadius:12,padding:'13px',cursor:checkoutBusy?'wait':'pointer',fontFamily:'inherit',color:'#F0EDE8',textAlign:'left',opacity:checkoutBusy?0.7:1}}>                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:2}}>                  <div style={{fontSize:'0.6rem',fontWeight:700,color:'rgba(232,82,26,0.8)',letterSpacing:'0.1em',textTransform:'uppercase'}}>{t('yearlyBestValue')}</div>                  <div style={{fontSize:'0.58rem',background:'rgba(232,82,26,0.25)',border:'1px solid rgba(232,82,26,0.4)',borderRadius:4,padding:'1px 5px',color:'rgba(232,82,26,0.9)',fontWeight:700,whiteSpace:'nowrap'}}>{t('save33')}</div>                </div>                <div style={{fontSize:'1rem',fontWeight:800,marginBottom:2}}>€39.99 / {t('perYear')}</div>                <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)'}}>{t('yearlyEquivalent')}</div>              </button>              {/* Monthly */}              <button onClick={()=>startCheckout('monthly')} disabled={checkoutBusy} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'13px',cursor:checkoutBusy?'wait':'pointer',fontFamily:'inherit',color:'rgba(255,255,255,0.65)',textAlign:'left',opacity:checkoutBusy?0.7:1}}>                <div style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.5)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:3}}>{t('monthlyPlanLabel')}</div>                <div style={{fontSize:'0.95rem',fontWeight:700}}>€4.99 / {t('perMonth')}</div>              </button>            </div>          )}          <button onClick={()=>setFreeLimitHit(false)} style={{marginTop:14,width:'100%',maxWidth:340,background:'none',border:'1px solid rgba(255,255,255,0.09)',borderRadius:14,padding:'12px',color:'rgba(255,255,255,0.35)',fontSize:'0.8rem',cursor:'pointer',fontFamily:'inherit'}}>{t('backToApp')}</button>          <div style={{marginTop:10,fontSize:'0.65rem',color:'rgba(255,255,255,0.2)',textAlign:'center'}}>{t('renewsAutomatically')}</div>        </div>      )}
      {/* ── Login / Signup modal ── */}
      {(authScreen === 'login' || authScreen === 'signup') && (
        <div onClick={()=>{setAuthScreen(null);setAuthErr('');setAuthEmail('');setAuthPwd('');}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#141210',border:'1px solid rgba(255,255,255,0.09)',borderRadius:22,width:'100%',maxWidth:360,padding:'28px 24px',boxShadow:'0 20px 60px rgba(0,0,0,0.6)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
              <div>
                <div style={{fontSize:'1.1rem',fontWeight:800,color:'#F0EDE8'}}>{authScreen==='signup'?(t('createAccount')):(t('signIn'))}</div>
                <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)',marginTop:2}}>{authScreen==='signup'?(t('freeSignUp')):(t('welcomeBack'))}</div>
              </div>
              <button onClick={()=>{setAuthScreen(null);setAuthErr('');setAuthEmail('');setAuthPwd('');}} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,width:34,height:34,cursor:'pointer',color:'rgba(255,255,255,0.5)',fontFamily:'inherit',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</button>
            </div>
            {!AUTH_AVAILABLE && (
              <div style={{background:'rgba(232,178,26,0.1)',border:'1px solid rgba(232,178,26,0.3)',borderRadius:10,padding:'10px 12px',fontSize:'0.73rem',color:'rgba(232,178,26,0.85)',marginBottom:14,lineHeight:1.5}}>
                ⚙️ {lang==='de'?'Auth nicht konfiguriert — Supabase-Variablen fehlen. App läuft im Gastmodus.':'Auth not configured — Supabase env vars missing. App runs in guest mode.'}
              </div>
            )}
            <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} type="email"
              placeholder={t('emailPlaceholder')}
              style={{background:AUTH_AVAILABLE?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.13)',borderRadius:10,padding:'13px 14px',fontSize:'0.9rem',color:AUTH_AVAILABLE?'#F0EDE8':'rgba(255,255,255,0.25)',fontFamily:'inherit',width:'100%',boxSizing:'border-box',marginBottom:10,outline:'none',pointerEvents:AUTH_AVAILABLE&&!authBusy?'auto':'none'}}
              autoComplete="email" disabled={!AUTH_AVAILABLE||authBusy} readOnly={!AUTH_AVAILABLE}/>
            <input value={authPwd} onChange={e=>setAuthPwd(e.target.value)} type="password"
              placeholder={t('passwordPlaceholder')}
              style={{background:AUTH_AVAILABLE?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.13)',borderRadius:10,padding:'13px 14px',fontSize:'0.9rem',color:AUTH_AVAILABLE?'#F0EDE8':'rgba(255,255,255,0.25)',fontFamily:'inherit',width:'100%',boxSizing:'border-box',marginBottom:authErr?8:16,outline:'none',pointerEvents:AUTH_AVAILABLE&&!authBusy?'auto':'none'}}
              autoComplete={authScreen==='signup'?'new-password':'current-password'}
              disabled={!AUTH_AVAILABLE||authBusy} readOnly={!AUTH_AVAILABLE}
              onKeyDown={e=>e.key==='Enter'&&AUTH_AVAILABLE&&handleAuthSubmit()}/>
            {authScreen === 'login' && (
              <button onClick={()=>{setAuthScreen('forgot');setAuthErr('');setResetSent(false);}}
                style={{background:'none',border:'none',color:'rgba(255,255,255,0.35)',fontSize:'0.72rem',cursor:'pointer',textAlign:'right',width:'100%',padding:'0 0 8px',fontFamily:'inherit',display:'block'}}>
                {t('forgotPassword')}
              </button>
            )}
            {authErr && <div style={{fontSize:'0.72rem',color:'rgba(214,59,47,0.9)',marginBottom:12,lineHeight:1.45}}>{authErr}</div>}
            <button onClick={handleAuthSubmit} disabled={!AUTH_AVAILABLE||authBusy}
              style={{background:AUTH_AVAILABLE?'#E8521A':'rgba(255,255,255,0.06)',border:'none',borderRadius:12,padding:'13px',fontSize:'0.9rem',fontWeight:700,color:AUTH_AVAILABLE?'#fff':'rgba(255,255,255,0.25)',fontFamily:'inherit',width:'100%',cursor:AUTH_AVAILABLE&&!authBusy?'pointer':'not-allowed',marginBottom:12,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {authBusy?<Spinner/>:authScreen==='signup'?(t('createAccount')):(t('signIn'))}
            </button>
            <button onClick={()=>{setAuthScreen(authScreen==='login'?'signup':'login');setAuthErr('');}}
              style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:'0.75rem',cursor:'pointer',width:'100%',textAlign:'center',padding:'4px',fontFamily:'inherit'}}>
              {authScreen==='login'?(t('noAccount')):(t('alreadyAccount'))}
            </button>
          </div>
        </div>
      )}
      {/* ── Account modal ── */}
      {authScreen === 'account' && (() => {
        const normalizedPlan = String(authProfile?.plan || '').trim().toLowerCase();
        const isYearly  = normalizedPlan === 'yearly';
        const isMonthly = normalizedPlan === 'monthly';
        const de = lang === 'de';
        const rowStyle   = {background:'rgba(255,255,255,0.04)',borderRadius:12,padding:'12px 14px',marginBottom:8};
        const labelStyle = {fontSize:'0.58rem',color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',marginBottom:3,textTransform:'uppercase'};
        const dividerStyle = {borderTop:'1px solid rgba(255,255,255,0.06)',margin:'10px 0'};
        const linkBtn  = {background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:'0.8rem',cursor:'pointer',fontFamily:'inherit',textAlign:'left',padding:'9px 0',width:'100%',display:'flex',alignItems:'center',gap:8};
        const actionBtn = {background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:11,padding:'11px 14px',color:C.t,fontSize:'0.83rem',cursor:'pointer',fontFamily:'inherit',width:'100%',textAlign:'left',display:'flex',alignItems:'center',gap:8,marginBottom:6};
        return (
          <div onClick={()=>{setAuthScreen(null);setDeleteConfirm(false);}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',zIndex:500,display:'flex',alignItems:'flex-end',justifyContent:'center',padding:'0 0 env(safe-area-inset-bottom,0)'}}>
            <div onClick={e=>e.stopPropagation()} style={{background:'#141210',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'22px 22px 0 0',width:'100%',maxWidth:480,padding:'8px 0 0',maxHeight:'92dvh',overflowY:'auto'}}>
              {/* Handle bar */}
              <div style={{width:40,height:4,borderRadius:2,background:'rgba(255,255,255,0.15)',margin:'0 auto 16px'}}/>
              <div style={{padding:'0 22px 28px'}}>
                {/* Header */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
                  <div style={{fontSize:'1.05rem',fontWeight:800,color:C.t}}>{t('myAccount')}</div>
                  <button onClick={()=>{setAuthScreen(null);setDeleteConfirm(false);}} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,width:34,height:34,cursor:'pointer',color:'rgba(255,255,255,0.45)',fontFamily:'inherit',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                </div>
                {user ? (<>
                  {/* Email */}
                  <div style={rowStyle}>
                    <div style={labelStyle}>E-MAIL</div>
                    <div style={{fontSize:'0.88rem',color:C.t,wordBreak:'break-all'}}>{user.email}</div>
                  </div>
                  {/* Plan */}
                  <div style={{...rowStyle,background:isPro?'rgba(232,82,26,0.07)':'rgba(255,255,255,0.04)',border:`1px solid ${isPro?'rgba(232,82,26,0.2)':'rgba(255,255,255,0.06)'}`,marginBottom:14}}>
                    <div style={labelStyle}>{t('planLabel')}</div>
                    {(()=>{
                      const cancelAt=authProfile?.cancel_at?new Date(authProfile.cancel_at).toLocaleDateString(lang==='de'?'de-DE':'en-GB',{day:'numeric',month:'long',year:'numeric'}):null;
                      const planLabel=isYearly?(de?'Pro Jährlich':'Pro Yearly'):isMonthly?(de?'Pro Monatlich':'Pro Monthly'):'Pro';
                      if(isPro) return(<><div style={{fontSize:'0.93rem',fontWeight:800,color:'#E8521A',marginBottom:2}}>{cancelAt?'⏳':'✅'} FixIt {planLabel}</div><div style={{fontSize:'0.72rem',color:cancelAt?'rgba(232,178,26,0.75)':'rgba(255,255,255,0.35)'}}>{cancelAt?(de?`Wird gekündigt am ${cancelAt}`:`Cancels on ${cancelAt}`):(isYearly?t('activeSubYearly'):isMonthly?t('activeSubMonthly'):(de?'Aktives Abonnement':'Active subscription'))}</div></>);
                      return<div style={{fontSize:'0.88rem',color:'rgba(255,255,255,0.45)'}}>{t('freePlan')}</div>;
                    })()}
                  </div>
                  {/* Subscription management — shown for any active subscriber */}
                  {isPro && <>
                    <button onClick={openPortal} disabled={portalBusy}
                      style={{...actionBtn,borderColor:'rgba(232,82,26,0.25)',opacity:portalBusy?.6:1}}>
                      <span>💳</span><span style={{flex:1}}>{t('manageSub')}</span>{portalBusy&&<span style={{fontSize:'0.7rem',color:C.m}}>…</span>}
                    </button>
                    <div style={dividerStyle}/>
                  </>}
                  {/* Free user — upgrade CTA */}
                  {!isPro && <>
                    <button onClick={()=>{setAuthScreen(null);setPaywallSource('diagnosis');setFreeLimitHit(true);}}
                      style={{...actionBtn,background:'rgba(232,82,26,0.12)',border:'1px solid rgba(232,82,26,0.35)',color:C.t}}>
                      <span>🚀</span><span style={{flex:1}}>{t('upgradePro')}</span>
                    </button>
                    <div style={dividerStyle}/>
                  </>}
                  {/* Links */}
                  <button onClick={()=>window.open('mailto:fixitapp.support@gmail.com','_blank')} style={linkBtn}>
                    <span>✉️</span>{t('support')}
                  </button>
                  <button onClick={()=>setLegalPage('privacy')} style={linkBtn}>
                    <span>🔒</span>{t('privacyPolicy')}
                  </button>
                  <button onClick={()=>setLegalPage('terms')} style={linkBtn}>
                    <span>📄</span>{t('termsOfService')}
                  </button>
                  <button onClick={()=>setLegalPage('impressum')} style={linkBtn}>
                    <span>ℹ️</span>Impressum
                  </button>
                  <div style={dividerStyle}/>
                  {/* Sign out */}
                  <button onClick={async()=>{
                    await logout();
                    // Clear all user-specific state immediately on sign-out so the
                    // next user or guest session never inherits previous account data.
                    setAuthScreen(null);
                    setDeleteConfirm(false);
                    setFreeLimitHit(false); setFreeRepairActive(false); setFreeRepairDone(false);
                    setScreen('home');
                    setNavStack([]);
                    // IMPORTANT: clear in-memory history immediately.
                    // Do NOT fall back to localStorage guest history — show empty list.
                    // The previous user's localStorage key ('history:<uid>') is untouched
                    // and will only be readable if the same account logs in again.
                    setDiagHistory([]);
                    LS.set('free_diagnosis_used', false);
                  }} style={{...linkBtn,color:'rgba(255,255,255,0.5)'}}>
                    <span>↩</span>{t('signOut')}
                  </button>
                  {/* Delete account — two-step confirm */}
                  {!deleteConfirm
                    ? <button onClick={()=>setDeleteConfirm(true)} style={{...linkBtn,color:'rgba(214,59,47,0.5)',marginTop:2}}>
                        <span>🗑</span>{t('deleteAccount')}
                      </button>
                    : <div style={{background:'rgba(214,59,47,0.08)',border:'1px solid rgba(214,59,47,0.25)',borderRadius:12,padding:'12px 14px',marginTop:4}}>
                        <div style={{fontSize:'0.78rem',color:'rgba(214,59,47,0.8)',marginBottom:10}}>{t('deleteConfirmMsg')}</div>
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={()=>setDeleteConfirm(false)} style={{flex:1,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,padding:'9px',color:C.m,cursor:'pointer',fontFamily:'inherit',fontSize:'0.8rem'}}>{t('cancel')}</button>
                          <button onClick={handleDeleteAccount} disabled={deleteBusy} style={{flex:1,background:'rgba(214,59,47,0.15)',border:'1px solid rgba(214,59,47,0.35)',borderRadius:9,padding:'9px',color:'rgba(214,59,47,0.9)',cursor:'pointer',fontFamily:'inherit',fontSize:'0.8rem'}}>
                            {deleteBusy?'…':(t('delete'))}
                          </button>
                        </div>
                      </div>}
                </>) : (
                  <div style={{textAlign:'center',padding:'20px 0'}}>
                    <div style={{color:'rgba(255,255,255,0.45)',fontSize:'0.85rem',marginBottom:16}}>{t('notSignedIn')}</div>
                    <button onClick={()=>setAuthScreen('login')} style={{background:'#E8521A',border:'none',borderRadius:12,padding:'13px',fontSize:'0.88rem',fontWeight:700,color:'#fff',fontFamily:'inherit',width:'100%',cursor:'pointer'}}>{de?'Anmelden':'Sign in'}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
      {/* ── Verify-email screen — shown after signup, blocks app access ── */}
      {authScreen === 'verify-email' && (
        <div style={{position:'fixed',inset:0,background:'#08060A',zIndex:500,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px'}}>
          <div style={{fontSize:'2.2rem',fontWeight:900,letterSpacing:'-0.03em',marginBottom:6}}>
            <span style={{color:'#EDEAE4'}}>FIX</span><span style={{color:'#E8521A'}}>IT</span>
          </div>
          <div style={{width:40,height:2,background:'#E8521A',borderRadius:1,marginBottom:32}}/>
          <div style={{fontSize:'3rem',marginBottom:16}}>📧</div>
          <div style={{fontSize:'1.3rem',fontWeight:800,color:'#F0EDE8',textAlign:'center',marginBottom:10}}>
            {lang==='de'?'E-Mail bestätigen':'Verify your email'}
          </div>
          <div style={{fontSize:'0.85rem',color:'rgba(255,255,255,0.5)',textAlign:'center',lineHeight:1.75,maxWidth:300,marginBottom:28}}>
            {lang==='de'
              ? <>Wir haben einen Bestätigungslink an <strong style={{color:'rgba(255,255,255,0.75)'}}>{authEmail}</strong> gesendet. Klicke auf den Link, um dein Konto zu aktivieren.</>
              : <>We sent a verification link to <strong style={{color:'rgba(255,255,255,0.75)'}}>{authEmail}</strong>. Click the link to activate your account.</>}
          </div>
          <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.3)',textAlign:'center',maxWidth:280,marginBottom:24}}>
            {lang==='de'
              ? 'Nach dem Klick wirst du automatisch zu FixIt zurückgeleitet.'
              : 'After clicking, you will be returned to FixIt automatically.'}
          </div>
          <button onClick={()=>{setAuthScreen(null);setAuthEmail('');}}
            style={{background:'none',border:'1px solid rgba(255,255,255,0.12)',borderRadius:12,padding:'11px 24px',color:'rgba(255,255,255,0.4)',cursor:'pointer',fontFamily:'inherit',fontSize:'0.82rem'}}>
            {lang==='de'?'Zurück':'Back'}
          </button>
        </div>
      )}

      {/* ── Free repair completed ─────────────────────────────────── */}
      {freeRepairDone && !isPro && (
        <div style={{position:'fixed',inset:0,background:'#08060A',zIndex:490,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',overflowY:'auto',padding:'40px 24px 32px'}}>
          <div style={{width:'100%',maxWidth:400}}>
            <div style={{textAlign:'center',marginBottom:24}}>
              <div style={{fontSize:'2.8rem',marginBottom:10}}>🎉</div>
              <div style={{fontSize:'1.4rem',fontWeight:900,color:'#F0EDE8',letterSpacing:'-0.02em',marginBottom:8,lineHeight:1.2}}>
                {t('trialCompleteTitle')}
              </div>
              <div style={{fontSize:'0.83rem',color:'rgba(255,255,255,0.48)',lineHeight:1.6,maxWidth:290,margin:'0 auto'}}>
                {t('trialCompleteDesc')}
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'14px 16px',marginBottom:14}}>
              <div style={{fontSize:'0.65rem',fontWeight:700,color:'rgba(255,255,255,0.28)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8}}>{t('trialCompleted')}</div>
              {['trialDiagnosis','trialGuide','trialSteps','trialParts','trialNearby'].map((k,i)=>(
                <div key={i} style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.62)',padding:'3px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>{'✅ '}{t(k)}</div>
              ))}
            </div>
            <div style={{background:'rgba(232,82,26,0.07)',border:'1px solid rgba(232,82,26,0.22)',borderRadius:12,padding:'14px 16px',marginBottom:18}}>
              <div style={{fontSize:'0.65rem',fontWeight:700,color:'rgba(232,82,26,0.55)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8}}>{t('trialUnlockWith')}</div>
              {['trialUnlimitedAI','trialUnlimitedGuides','trialUnlimitedParts','trialUnlimitedNearby','trialFutureAI'].map((k,i)=>(
                <div key={i} style={{fontSize:'0.82rem',color:'rgba(232,82,26,0.78)',padding:'3px 0',borderBottom:'1px solid rgba(232,82,26,0.07)'}}>{'🔓 '}{t(k)}</div>
              ))}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:10}}>
              <button onClick={()=>startCheckout('yearly')} disabled={checkoutBusy} style={{background:'linear-gradient(135deg,rgba(232,82,26,0.2),rgba(232,82,26,0.09))',border:'2px solid rgba(232,82,26,0.5)',borderRadius:12,padding:'13px',cursor:checkoutBusy?'wait':'pointer',fontFamily:'inherit',color:'#F0EDE8',textAlign:'left'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}><span style={{fontSize:'0.63rem',fontWeight:700,color:'rgba(232,82,26,0.78)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{t('yearlyBestValue')}</span><span style={{fontSize:'0.6rem',background:'rgba(232,82,26,0.18)',border:'1px solid rgba(232,82,26,0.32)',borderRadius:20,padding:'2px 6px',color:'rgba(232,82,26,0.82)',fontWeight:700}}>{t('save33')}</span></div>
                <div><span style={{fontSize:'1.4rem',fontWeight:900}}>€39.99</span><span style={{fontSize:'0.73rem',opacity:0.5}}>/{t('perYear')}</span></div>
                <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.38)',marginTop:2}}>{t('yearlyEquivalent')}</div>
              </button>
              <button onClick={()=>startCheckout('monthly')} disabled={checkoutBusy} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'13px',cursor:checkoutBusy?'wait':'pointer',fontFamily:'inherit',color:'#F0EDE8',textAlign:'left'}}>
                <div style={{fontSize:'0.63rem',fontWeight:700,color:'rgba(255,255,255,0.32)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:2}}>{t('monthlyPlanLabel')}</div>
                <div><span style={{fontSize:'1.32rem',fontWeight:800}}>€4.99</span><span style={{fontSize:'0.73rem',opacity:0.5}}>/{t('perMonth')}</span></div>
              </button>
            </div>
            <div style={{fontSize:'0.67rem',color:'rgba(255,255,255,0.28)',textAlign:'center',marginBottom:14}}>{t('renewsAutomatically')}</div>
            <button onClick={()=>setFreeRepairDone(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.28)',fontSize:'0.74rem',cursor:'pointer',fontFamily:'inherit',width:'100%',textAlign:'center',padding:'6px'}}>
              {t('trialBackToRepair')}
            </button>
          </div>
        </div>
      )}

      {/* ── iOS install instructions modal ───────────────────────────── */}
      {showInstallModal && (
        <div onClick={()=>setShowInstallModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:600,display:'flex',alignItems:'flex-end',justifyContent:'center',padding:'0 0 32px'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#1C1A1F',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px 16px 16px 16px',padding:'24px 24px 28px',width:'100%',maxWidth:380,margin:'0 16px'}}>
            <div style={{fontSize:'1.05rem',fontWeight:800,color:'#F0EDE8',marginBottom:6,textAlign:'center'}}>
              {lang==='de'?'FixIt installieren':'Install FixIt'}
            </div>
            <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',textAlign:'center',marginBottom:20}}>
              {lang==='de'?'Safari on iPhone / iPad':'Safari on iPhone / iPad'}
            </div>
            {[
              {icon:'1️⃣', label: lang==='de'?'Tippe auf das Teilen-Symbol unten in Safari':'Tap the Share button at the bottom of Safari'},
              {icon:'2️⃣', label: lang==='de'?'Waehle "Zum Home-Bildschirm hinzufuegen"':'Choose "Add to Home Screen"'},
              {icon:'3️⃣', label: lang==='de'?'Tippe oben rechts auf "Hinzufuegen"':'Tap "Add" in the top right'},
            ].map((step,i)=>(
              <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:14}}>
                <span style={{fontSize:'1.4rem',flexShrink:0}}>{step.icon}</span>
                <div style={{fontSize:'0.83rem',color:'rgba(255,255,255,0.7)',lineHeight:1.5,paddingTop:2}}>{step.label}</div>
              </div>
            ))}
            <div style={{background:'rgba(232,82,26,0.08)',borderRadius:8,padding:'10px 12px',marginBottom:18,fontSize:'0.75rem',color:'rgba(232,82,26,0.7)',textAlign:'center'}}>
              {lang==='de'?'Das App-Symbol erscheint auf deinem Home-Bildschirm':'The app icon will appear on your Home Screen'}
            </div>
            <button onClick={()=>setShowInstallModal(false)} style={{width:'100%',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'11px',color:'rgba(255,255,255,0.6)',fontFamily:'inherit',fontSize:'0.85rem',cursor:'pointer'}}>
              {lang==='de'?'Schliessen':'Close'}
            </button>
          </div>
        </div>
      )}

      {/* ── Forgot Password screen ─────────────────────────────────────── */}
      {authScreen === 'forgot' && (
        <div style={{position:'fixed',inset:0,background:'#08060A',zIndex:500,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px'}}>
          <div style={{fontSize:'2.2rem',fontWeight:900,letterSpacing:'-0.03em',marginBottom:6}}>
            <span style={{color:'#EDEAE4'}}>FIX</span><span style={{color:'#E8521A'}}>IT</span>
          </div>
          <div style={{width:40,height:2,background:'#E8521A',borderRadius:1,marginBottom:32}}/>
          {resetSent ? (<>
            <div style={{fontSize:'3rem',marginBottom:16}}>📬</div>
            <div style={{fontSize:'1.25rem',fontWeight:800,color:'#F0EDE8',textAlign:'center',marginBottom:10}}>{t('resetEmailSent')}</div>
            <div style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.5)',textAlign:'center',lineHeight:1.75,maxWidth:310,marginBottom:28}}>{t('resetEmailDesc')}</div>
            <button onClick={()=>{setAuthScreen('login');setResetSent(false);setAuthEmail('');}}
              style={{background:'#E8521A',border:'none',borderRadius:12,padding:'13px 28px',fontSize:'0.88rem',fontWeight:700,color:'#fff',fontFamily:'inherit',cursor:'pointer'}}>
              {t('backToSignIn')}
            </button>
          </>) : (<>
            <div style={{fontSize:'3rem',marginBottom:16}}>🔑</div>
            <div style={{fontSize:'1.25rem',fontWeight:800,color:'#F0EDE8',textAlign:'center',marginBottom:8}}>{t('resetPassword')}</div>
            <div style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.4)',textAlign:'center',marginBottom:24,maxWidth:290}}>
              {lang==='de'?'Gib deine E-Mail ein. Wir senden dir einen Link zum Zurücksetzen.':'Enter your email. We\'ll send you a reset link.'}
            </div>
            <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} type="email"
              placeholder={t('emailPlaceholder')} autoComplete="email"
              style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.13)',borderRadius:10,padding:'13px 14px',fontSize:'0.9rem',color:'#F0EDE8',fontFamily:'inherit',width:'100%',maxWidth:340,boxSizing:'border-box',marginBottom:10,outline:'none'}}
              onKeyDown={e=>{if(e.key==='Enter')handleForgotSubmit();}}/>
            {authErr && <div style={{fontSize:'0.72rem',color:'rgba(214,59,47,0.9)',marginBottom:10,maxWidth:340,textAlign:'center'}}>{authErr}</div>}
            <button onClick={handleForgotSubmit} disabled={authBusy}
              style={{background:'#E8521A',border:'none',borderRadius:12,padding:'13px',fontSize:'0.9rem',fontWeight:700,color:'#fff',fontFamily:'inherit',width:'100%',maxWidth:340,cursor:authBusy?'wait':'pointer',marginBottom:12,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {authBusy?<Spinner/>:t('sendResetLink')}
            </button>
            <button onClick={()=>{setAuthScreen('login');setAuthErr('');}}
              style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',fontSize:'0.75rem',cursor:'pointer',fontFamily:'inherit',padding:'4px'}}>
              {t('backToSignIn')}
            </button>
          </>)}
        </div>
      )}

      {/* ── Reset Password screen (reached via email link — PASSWORD_RECOVERY) ── */}
      {authScreen === 'reset-password' && (
        <div style={{position:'fixed',inset:0,background:'#08060A',zIndex:500,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px'}}>
          <div style={{fontSize:'2.2rem',fontWeight:900,letterSpacing:'-0.03em',marginBottom:6}}>
            <span style={{color:'#EDEAE4'}}>FIX</span><span style={{color:'#E8521A'}}>IT</span>
          </div>
          <div style={{width:40,height:2,background:'#E8521A',borderRadius:1,marginBottom:32}}/>
          <div style={{fontSize:'3rem',marginBottom:16}}>🔒</div>
          <div style={{fontSize:'1.25rem',fontWeight:800,color:'#F0EDE8',textAlign:'center',marginBottom:8}}>{t('createNewPassword')}</div>
          <div style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.4)',textAlign:'center',marginBottom:24,maxWidth:290}}>
            {lang==='de'?'Wähle ein neues Passwort für dein Konto.':'Choose a new password for your account.'}
          </div>
          <input value={resetPwd} onChange={e=>setResetPwd(e.target.value)} type="password"
            placeholder={t('newPasswordPlaceholder')} autoComplete="new-password"
            style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.13)',borderRadius:10,padding:'13px 14px',fontSize:'0.9rem',color:'#F0EDE8',fontFamily:'inherit',width:'100%',maxWidth:340,boxSizing:'border-box',marginBottom:10,outline:'none'}}/>
          <input value={resetConfirm} onChange={e=>setResetConfirm(e.target.value)} type="password"
            placeholder={t('confirmPasswordPlaceholder')} autoComplete="new-password"
            style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.13)',borderRadius:10,padding:'13px 14px',fontSize:'0.9rem',color:'#F0EDE8',fontFamily:'inherit',width:'100%',maxWidth:340,boxSizing:'border-box',marginBottom:10,outline:'none'}}
            onKeyDown={e=>{if(e.key==='Enter')handleResetSubmit();}}/>
          {authErr && <div style={{fontSize:'0.72rem',color:'rgba(214,59,47,0.9)',marginBottom:10,maxWidth:340,textAlign:'center'}}>{authErr}</div>}
          <button onClick={handleResetSubmit} disabled={authBusy}
            style={{background:'#E8521A',border:'none',borderRadius:12,padding:'13px',fontSize:'0.9rem',fontWeight:700,color:'#fff',fontFamily:'inherit',width:'100%',maxWidth:340,cursor:authBusy?'wait':'pointer',marginBottom:12,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            {authBusy?<Spinner/>:t('updatePassword')}
          </button>
        </div>
      )}

      {/* ── Legal page modals — Privacy Policy and Terms of Service ── */}
      {legalPage && (
        <div style={{position:'fixed',inset:0,background:'#0A0808',zIndex:600,display:'flex',flexDirection:'column',overflowY:'auto'}}>
          {/* Header */}
          <div style={{position:'sticky',top:0,background:'rgba(10,8,8,0.97)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'14px 20px',display:'flex',alignItems:'center',gap:12,zIndex:1,backdropFilter:'blur(8px)',WebkitBackdropFilter:'blur(8px)'}}>
            <button onClick={()=>setLegalPage(null)} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,padding:'6px 12px',color:'rgba(255,255,255,0.55)',cursor:'pointer',fontFamily:'inherit',fontSize:'0.8rem'}}>← {t('backBtn')}</button>
            <div style={{fontSize:'0.92rem',fontWeight:700,color:'rgba(255,255,255,0.8)'}}>
              {legalPage==='privacy'   ? (lang==='de'?'Datenschutzerklärung':'Privacy Policy')
               : legalPage==='terms'  ? (lang==='de'?'Nutzungsbedingungen':'Terms of Service')
               : 'Impressum'}
            </div>
          </div>
          {/* Content */}
          <div style={{padding:'24px 20px 60px',maxWidth:680,margin:'0 auto',width:'100%',color:'rgba(255,255,255,0.75)',fontSize:'0.88rem',lineHeight:1.75}}>
            {legalPage==='privacy'   && <PrivacyPage    lang={lang}/>}
            {legalPage==='terms'     && <TermsPage      lang={lang}/>}
            {legalPage==='impressum' && <ImpressumPage  lang={lang}/>}
          </div>
        </div>
      )}
    </>
  );

  // ── ONBOARDING ───────────────────────────────────────────────────────────────
  if (screen === 'onboarding') {
    const slides = [
      { icon:'🔍', title: t('describeYourProblem'), sub: lang==='de'?'Tippe oder fotografiere — die KI analysiert es sofort.':lang==='tr'?'Yaz veya fotoğrafla — yapay zeka hemen analiz eder.':lang==='pl'?'Wpisz lub sfotografuj — AI analizuje natychmiast.':'Type or photograph — AI analyses it instantly.' },
      { icon:'🤖', title: t('getExactSteps'), sub: lang==='de'?'Schritt-für-Schritt-Anleitung mit Bildern und Teilevorschlägen.':lang==='tr'?'Resimler ve parça önerileriyle adım adım kılavuz.':lang==='pl'?'Instrukcja krok po kroku ze zdjęciami i sugestiami części.':'Step-by-step guide with images and parts suggestions.' },
      { icon:'🛒', title: t('findPartsNearYou'), sub: lang==='de'?'Lokale Shops und Online-Preise auf einen Blick.':lang==='tr'?'Yerel mağazalar ve çevrimiçi fiyatlar bir bakışta.':lang==='pl'?'Lokalne sklepy i ceny online na jednym ekranie.':'Local stores and online prices at a glance.' },
    ];
    const slide = onboardSlide;
    const setSlide = setOnboardSlide;
    const isLast = slide === slides.length - 1;
    const done = () => { LS.set('onboarding_done', true); setScreen('splash-r'); };
    return (
      <div style={{position:'absolute',inset:0,background:C.d,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 28px'}}>
        <button onClick={done} style={{position:'absolute',top:54,right:24,background:'none',border:'none',color:C.m,fontSize:'0.82rem',cursor:'pointer',fontFamily:'inherit'}}>Skip</button>
        <div style={{fontSize:'5rem',marginBottom:24,animation:'slideUp .5s ease'}}>{slides[slide].icon}</div>
        <div style={{fontSize:'1.5rem',fontWeight:800,textAlign:'center',marginBottom:12,letterSpacing:'-0.02em',animation:'slideUp .5s ease'}}>{slides[slide].title}</div>
        <div style={{fontSize:'0.92rem',color:C.m,textAlign:'center',lineHeight:1.65,maxWidth:300,marginBottom:40,animation:'slideUp .5s ease'}}>{slides[slide].sub}</div>
        <div style={{display:'flex',gap:8,marginBottom:32}}>
          {slides.map((_,i)=><div key={i} style={{width:i===slide?24:8,height:8,borderRadius:4,background:i===slide?C.o:'rgba(255,255,255,0.15)',transition:'width .3s'}}/>)}
        </div>
        <button onClick={isLast?done:()=>setSlide(s=>s+1)} style={{...s.btn,maxWidth:300,borderRadius:16,padding:16,fontSize:'1rem'}}>
          {isLast?(lang==='de'?"Los geht's! 🔧":lang==='tr'?'Hadi başlayalım! 🔧':lang==='pl'?'Zaczynamy! 🔧':lang==='mk'?'Ајде да почнеме! 🔧':lang==='hr'?'Počnimo! 🔧':"Let's Fix It! 🔧"):'Next →'}
        </button>
        <style>{CSS}</style>
      </div>
    );
  }

  // ── SPLASH ───────────────────────────────────────────────────────────────────
  if (screen === 'splash' || screen === 'splash-r') {
    const l = LANGS[selLang]||LANGS.en;
    const ts = k => tx(selLang, k);
    const ready = screen === 'splash-r';
    return (
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,padding:'40px 28px',background:C.d}}>
        {showLP && <LangPicker lang={selLang} setLang={lc=>{setSelLang(lc);setShowLP(false);}} setShowLP={setShowLP} LANGS={LANGS} t={k=>tx(selLang,k)}/>}
        <div style={{fontSize:'3rem',fontWeight:900,letterSpacing:'-0.03em'}}>FIX<span style={{color:C.o}}>IT</span></div>
        <div style={{display:'flex',alignItems:'center',gap:8,fontSize:'0.82rem',color:C.m}}>
          <span style={{width:7,height:7,background:C.o,borderRadius:'50%',animation:'blink .9s infinite',flexShrink:0}}/>
          {ready?ts('langDetected'):ts('detecting')}
        </div>
        <div style={{background:'rgba(232,82,26,0.07)',border:'1px solid rgba(232,82,26,0.2)',borderRadius:22,padding:22,textAlign:'center',width:'100%',maxWidth:340}}>
          <div style={{fontSize:'2.8rem',marginBottom:8}}>{l.f}</div>
          <div style={{fontSize:'1.2rem',fontWeight:800,marginBottom:4}}>{l.n} — {l.na}</div>
        </div>
        {ready && <>
          <button onClick={confirmLang} style={{...s.btn,maxWidth:340,borderRadius:16,padding:16,fontSize:'1rem'}}>
            {ts('continueIn')} {l.na} →
          </button>
          <button onClick={()=>setShowLP(true)} style={{background:'none',border:'none',color:C.m,fontSize:'0.82rem',cursor:'pointer',textDecoration:'underline',fontFamily:'inherit'}}>
            {ts('chooseOther')}
          </button>
        </>}
        <style>{CSS}</style>
      </div>
    );
  }

  // ── LOC-ASK ──────────────────────────────────────────────────────────────────
  if (screen === 'loc-ask') return (
    <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20,padding:'40px 28px',background:C.d}}>
      <div style={{fontSize:'4rem'}}>📍</div>
      <div style={{fontSize:'1.4rem',fontWeight:800,textAlign:'center'}}>{t('allowLocation')}</div>
      <div style={{fontSize:'0.88rem',color:C.m,textAlign:'center',lineHeight:1.65,maxWidth:300}}>{t('locationDesc')}</div>
      <div style={{display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:340}}>
        <button style={{...s.btn,padding:16,borderRadius:16,fontSize:'1rem'}} onClick={()=>{goto('home');requestLocation();}}>📍 {t('allow')}</button>
        <button style={{...s.btn,...s.btnSec,padding:14,borderRadius:16}} onClick={()=>goto('home')}>{t('skipNow')}</button>
      </div>
      <style>{CSS}</style>
    </div>
  );

  // ── HOME ─────────────────────────────────────────────────────────────────────
  // ── HISTORY SCREEN ────────────────────────────────────────────────────────
  // Rendered as a proper full-screen view — same pattern as fix-now, result, etc.
  // Avoids all z-index / overflow / stacking-context issues that plagued the modal approach.
  if (screen === 'history') return (
    <>
    <Screen>
      <div style={{padding:'52px 20px 14px',borderBottom:`1px solid ${C.b}`,flexShrink:0,display:'flex',alignItems:'center',gap:12}}>
        <button onClick={()=>goto('home')} style={{background:'none',border:'none',color:C.m,fontSize:'0.85rem',cursor:'pointer',padding:'0 8px 0 0',fontFamily:'inherit'}}>←</button>
        <div style={{fontSize:'1.1rem',fontWeight:800}}>🕐 {lang==='de'?'Verlauf':lang==='tr'?'Tamir Geçmişi':lang==='pl'?'Historia Napraw':lang==='mk'?'Историја':lang==='hr'?'Povijest':'Repair History'} <span style={{fontSize:'0.8rem',fontWeight:400,color:C.m}}>({diagHistory.length})</span></div>
      </div>
      <Scroll>
<div style={{fontSize:'1rem',fontWeight:800,marginBottom:16}}>🕐 {lang==='de'?'Verlauf':lang==='tr'?'Tamir Geçmişi':lang==='pl'?'Historia Napraw':lang==='mk'?'Историја':lang==='hr'?'Povijest':'Repair History'}</div>
      {diagHistory.filter(isValidDiagEntry).map(h=>{
        // Safe date formatting — never call new Date() on an unvalidated value
        const dateStr = (() => {
          const d = new Date(h.date);
          return isNaN(d.getTime()) ? '' : d.toLocaleDateString(lang, {day:'numeric',month:'short',year:'numeric'});
        })();
        return (
          <div key={h.id} style={{...s.card,marginBottom:8,cursor:'pointer'}}
               onClick={()=>{
                 // Restore the full saved result to the result screen
                 setRestoredResult({
                   // All fields the result screen renders — must match what saveToHistory stores
                   diagnosis:     h.diagnosis,
                   confidence:    h.confidence    ?? 0,
                   status:        h.status        || null,
                   difficulty:    h.difficulty    || '',
                   timeEstimate:  h.timeEstimate  || '',
                   estimatedCost: h.estimatedCost || '',
                   warningLevel:  h.warningLevel  || '',
                   safetyWarning: h.safetyWarning || '',
                   causes:        Array.isArray(h.causes)      ? h.causes      : [],
                   steps:         Array.isArray(h.steps)       ? h.steps       : [],
                   tools:         Array.isArray(h.tools)       ? h.tools       : [],
                   partsNeeded:   Array.isArray(h.partsNeeded) ? h.partsNeeded : [],
                   proTip:        h.proTip        || '',
                   proReason:     h.proReason     || '',
                   callPro:       h.callPro       ?? false,
                   proSearchQuery:h.proSearchQuery|| '',
                   _category:     (() => {
                     // Use saved category. For old entries saved with 'home' as a
                     // fallback, try to detect from the saved problem text.
                     const saved = h.category;
                     if (saved && saved !== 'home') return saved;
                     // 'home' may be a stale default — re-detect from problem text
                     const detected = detectCategoryFromText && detectCategoryFromText(h.problem || '');
                     return detected || saved || 'home';
                   })(),
                 });
                 problemRef.current = h.problem;
                 setCurFix(h.category || 'home');
                 diagCategoryRef.current = h.category || 'home';
                 aiReset();
                 goto('result');
               }}>
            <div style={{fontSize:'0.82rem',fontWeight:700,marginBottom:4}}>{h.problem}</div>
            <div style={{fontSize:'0.72rem',color:C.m,marginBottom:6,WebkitLineClamp:2,display:'-webkit-box',WebkitBoxOrient:'vertical',overflow:'hidden'}}>{h.diagnosis}</div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              {dateStr && <span style={{fontSize:'0.65rem',color:C.m}}>{dateStr}</span>}
              {h.fixed===true  && <span style={{fontSize:'0.65rem',color:C.g}}>{lang==='de'?'✅ Behoben':lang==='tr'?'✅ Çözüldü':lang==='pl'?'✅ Naprawiono':'✅ Fixed'}</span>}
              {h.fixed===false && <span style={{fontSize:'0.65rem',color:C.r}}>{lang==='de'?'❌ Nicht behoben':lang==='tr'?'❌ Çözülmedi':lang==='pl'?'❌ Nie naprawiono':'❌ Not fixed'}</span>}

            </div>
          </div>
        );
      })}
      {diagHistory.length === 0 && <div style={{textAlign:'center',color:C.m,padding:'20px 0'}}>No repairs yet</div>}
      {totalSaved > 0 && <div style={{background:'rgba(26,158,92,0.08)',border:'1px solid rgba(26,158,92,0.18)',borderRadius:10,padding:'10px 14px',marginBottom:12,textAlign:'center'}}>
        <div style={{fontSize:'0.65rem',color:C.m,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:2}}>{lang==='de'?'Mögliches Sparpotenzial mit FixIt':lang==='tr'?'FixIt ile tahmini tasarruf':lang==='pl'?'Potencjalne oszczędności z FixIt':'Estimated savings with FixIt'}</div>
        <div style={{fontSize:'1.5rem',fontWeight:900,color:C.g}}>ca. €{totalSaved}</div>
        <div style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.22)',marginTop:4}}>{lang==='de'?'Schätzung basierend auf typischen Reparaturkosten. Keine Garantie.':lang==='tr'?'Tipik onarım maliyetlerine göre tahmin. Garanti yoktur.':lang==='pl'?'Szacunek oparty na typowych kosztach naprawy. Bez gwarancji.':'Estimate based on typical repair costs. No guarantee.'}</div>
      </div>}
      <button onClick={async ()=>{
        // Confirmation before deleting
        const confirmMsg = lang==='de' ? 'Verlauf wirklich löschen?' :
          lang==='tr' ? 'Geçmişi silmek istediğinizden emin misiniz?' :
          lang==='pl' ? 'Czy na pewno usunąć historię?' :
          lang==='fr' ? "Supprimer tout l'historique ?" :
          lang==='it' ? 'Eliminare tutta la cronologia?' :
          lang==='es' ? '¿Eliminar todo el historial?' :
          lang==='mk' ? 'Да се избрише историјата?' :
          (lang==='sr'||lang==='hr') ? 'Obrisati svu istoriju?' :
          'Delete all history?';
        if (!window.confirm(confirmMsg)) return;
        // 1. Clear in-memory state immediately
        setDiagHistory([]);
        setTotalSaved(0);
        // 2. Clear this user's local history key (never touches other users)
        LS.set(historyKey(user?.id), []);
        LS.set('totalSaved', 0);
        // 3. Delete this user's rows from Supabase (non-blocking, best-effort)
        if (user && AUTH_AVAILABLE) {
          (async () => {
            try {
              const client = await getSbClient();
              if (client) {
                const { error } = await client
                  .from('diagnoses')
                  .delete()
                  .eq('user_id', user.id);
                if (error) console.error('[FixIt] delete history Supabase error:', error.message);
                else console.log('[FixIt] Supabase history deleted for user', user.id.slice(0,8));
              }
            } catch (e) { console.error('[FixIt] delete history threw:', e.message); }
          })();
        }
      }} style={{...s.btn,...s.btnSec,marginTop:8,fontSize:'0.78rem',padding:'10px'}}>{
        lang==='de'?'Verlauf löschen':
        lang==='tr'?'Geçmişi temizle':
        lang==='pl'?'Wyczyść historię':
        lang==='fr'?"Effacer l'historique":
        lang==='it'?'Cancella cronologia':
        lang==='es'?'Borrar historial':
        lang==='mk'?'Избриши историја':
        (lang==='sr'||lang==='hr')?'Obriši istoriju':
        'Delete history'
      }</button>
      </Scroll>
      <NavBar screen="history" t={t} goto={goto}/>
      <style>{CSS}</style>
    </Screen>
    </>
  );

  if (screen === 'home') return (
    <>
    <Screen>
      {showLP && <LangPicker lang={lang} setLang={lc=>{setLang(lc);setShowLP(false);aiReset();setPResults(null);setPInput('');setVInput('');}} setShowLP={setShowLP} LANGS={LANGS} t={t}/>}
      {/* Offline banner */}
      {!isOnline && <div style={{background:'rgba(232,178,26,0.15)',borderBottom:'1px solid rgba(232,178,26,0.3)',padding:'8px 16px',fontSize:'0.72rem',color:C.y,textAlign:'center',flexShrink:0}}>⚠️ {t('offlineEmergencyBanner')}</div>}
      {/* PWA install banner */}
      {showPWA && <div style={{background:'rgba(232,82,26,0.1)',borderBottom:`1px solid ${C.b}`,padding:'10px 16px',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
        <div style={{flex:1,fontSize:'0.78rem'}}>📲 {lang==='de'?'FixIt installieren für schnelleren Zugriff':lang==='tr'?'Daha hızlı erişim için FixIt yükle':lang==='pl'?'Zainstaluj FixIt dla szybszego dostępu':'Install FixIt for faster access'}</div>
        <button onClick={()=>{
                const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream;
                if(isIOS){setShowInstallModal(true);}
                else if(pwaPrompt.current){pwaPrompt.current.prompt();pwaPrompt.current=null;LS.set('pwa_dismissed',true);setShowPWA(false);}
              }} style={{background:C.o,border:'none',borderRadius:8,padding:'5px 12px',color:'#fff',fontSize:'0.72rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{/iPad|iPhone|iPod/.test(navigator.userAgent)?'How?':'Install'}</button>
        <button onClick={()=>{LS.set('pwa_dismissed',true);setShowPWA(false);}} style={{background:'none',border:'none',color:C.m,fontSize:'0.78rem',cursor:'pointer',fontFamily:'inherit'}}>✕</button>
      </div>}
      <div style={{background:'linear-gradient(160deg,#1f0c00,#0A0908 65%)',padding:'52px 20px 20px',flexShrink:0}}>
        {/* ── Modern 3-column header ── */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,gap:8}}>
          {/* Left: location */}
          <div style={{flex:1,minWidth:0}}>
            {lat
              ? <div style={{display:'flex',alignItems:'center',gap:5,fontSize:'0.7rem',color:C.g,background:'rgba(26,158,92,0.1)',border:'1px solid rgba(26,158,92,0.18)',borderRadius:100,padding:'5px 10px',maxWidth:140,overflow:'hidden'}}>
                  <span style={{flexShrink:0}}>📍</span>
                  <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{city||`${lat.toFixed(2)},${lng.toFixed(2)}`}</span>
                </div>
              : <div style={{width:24}}/>}
          </div>
          {/* Centre: FixIt logo */}
          <div style={{fontSize:'1.45rem',fontWeight:900,letterSpacing:'-0.01em',flexShrink:0}}>FIX<span style={{color:C.o}}>IT</span></div>
          {/* Right: history + lang flag + user icon */}
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'flex-end',gap:6,minWidth:0}}>
            {diagHistory.length > 0 &&
              <button onClick={()=>goto('history')} title="History"
                style={{background:C.c,border:`1px solid ${C.b}`,borderRadius:10,width:34,height:34,cursor:'pointer',color:C.m,fontFamily:'inherit',fontSize:'0.7rem',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                🕐{diagHistory.length}
              </button>}
            {/* Language — shows flag only */}
            <button onClick={()=>setShowLP(true)} title={LANGS[lang]?.n}
              style={{background:C.c,border:`1px solid ${C.b}`,borderRadius:10,width:34,height:34,cursor:'pointer',fontFamily:'inherit',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {LANGS[lang]?.f}
            </button>
            {/* User icon */}
            <button onClick={()=>{setAuthScreen(user?'account':'login');if(user)refreshProfile();}} title={user?user.email:(t('signIn'))}
              style={{background:user?'rgba(255,255,255,0.08)':'rgba(232,82,26,0.15)',border:`1px solid ${user?'rgba(255,255,255,0.12)':'rgba(232,82,26,0.35)'}`,borderRadius:10,width:34,height:34,cursor:'pointer',color:user?C.t:'#E8521A',fontFamily:'inherit',fontSize:user&&isPro?'0.55rem':'1rem',fontWeight:user&&isPro?800:400,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,position:'relative'}}>
              {user
                ? isPro
                  ? <span style={{color:'#E8521A',letterSpacing:'0.02em'}}>PRO</span>
                  : <span>👤</span>
                : <span>👤</span>}
            </button>
          </div>
        </div>
        <div style={{fontSize:'0.78rem',color:C.m,marginBottom:3}}>{greeting}</div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <div style={{fontSize:'1.3rem',fontWeight:800}}>{t('welcome')}</div>
          {totalSaved > 0 && (
            <div style={{display:'flex',flexDirection:'column',gap:2}}>
              <div style={{background:'rgba(26,158,92,0.12)',border:'1px solid rgba(26,158,92,0.25)',
                borderRadius:100,padding:'3px 10px',fontSize:'0.68rem',fontWeight:600,color:C.g,
                display:'flex',alignItems:'center',gap:4,whiteSpace:'nowrap'}}>
                💰 {lang==='de'?'Sparpotenzial':lang==='tr'?'Tahmini tasarruf':lang==='pl'?'Potencjalne oszczędności':'Est. savings'}: <span style={{fontWeight:800}}>ca. €{totalSaved}</span>
              </div>
              <div style={{fontSize:'0.55rem',color:'rgba(255,255,255,0.2)',textAlign:'center',lineHeight:1.3}}>
                {lang==='de'?'Schätzung. Keine Garantie.':lang==='tr'?'Tahmin. Garanti değil.':lang==='pl'?'Szacunek. Brak gwarancji.':'Estimate. No guarantee.'}
              </div>
            </div>
          )}
        </div>
        <div onClick={()=>openFix('home')} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'14px 16px',display:'flex',alignItems:'center',gap:10,color:C.m,cursor:'pointer'}}>
          🔍 <span>{t('descProblem')}</span>
        </div>
      </div>
      <Scroll>
        {/* Emergency banner */}
        <div onClick={()=>{resolveCountryIfNeeded();goto('emergency');}} style={{background:'linear-gradient(135deg,#2A0000,#1A0000)',border:'1px solid rgba(214,59,47,0.3)',borderRadius:18,padding:16,display:'flex',alignItems:'center',gap:14,marginBottom:22,cursor:'pointer',animation:'fadeIn .4s ease'}}>
          <span style={{width:8,height:8,background:C.r,borderRadius:'50%',flexShrink:0,animation:'blink 1.2s infinite'}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:'0.7rem',color:C.r,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:2}}>{t('emergencyHelp')}</div>
            <div style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.75)'}}>{t('emergencySubtitle')}</div>
          </div>
          <div style={{color:C.r,fontSize:'1.1rem'}}>→</div>
        </div>
        <div style={{fontSize:'0.68rem',fontWeight:700,color:C.m,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>{t('whatNeedsFixing')}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:22}}>
          {[['🏠',t('homeRepair'),'home',true],['🚗',t('carProblems'),'car',false],['📱',t('techDevices'),'tech',false],['🌿',t('garden'),'garden',false],['🍳',t('appliances'),'appliances',false],['🐾',t('petHealth'),'pets',false]].map(([em,nm,cat,hi],i)=>(
            <div key={cat} onClick={()=>openFix(cat)} style={{background:hi?'rgba(232,82,26,0.07)':C.c,border:`1px solid ${hi?'rgba(232,82,26,0.35)':C.b}`,borderRadius:18,padding:16,cursor:'pointer',animation:`fadeIn ${.3+i*.07}s ease`}}>
              <span style={{fontSize:'1.8rem',marginBottom:8,display:'block'}}>{em}</span>
              <div style={{fontSize:'0.85rem',fontWeight:700,marginBottom:3}}>{nm}</div>
              <div style={{fontSize:'0.7rem',color:C.m}}>{t('tapToFix')}</div>
            </div>
          ))}
        </div>
        {/* Location prompt */}
        {!lat && locStatus !== 'loading' && (
          <div style={{...s.card,background:'rgba(26,95,232,0.06)',borderColor:'rgba(26,95,232,0.2)',textAlign:'center'}}>
            <div style={{fontSize:'1.5rem',marginBottom:8}}>📍</div>
            <div style={{fontSize:'0.86rem',fontWeight:700,marginBottom:6}}>{t('enableLocBanner')}</div>
            <div style={{fontSize:'0.75rem',color:C.m,marginBottom:6}}>{t('enableLocDesc')}</div>
            {locStatus === 'denied' && <div style={{fontSize:'0.72rem',color:C.y,marginBottom:8}}>⚠️ {lang==='de'?'GPS-Zugriff verweigert. Einstellungen → Datenschutz → Standort → FixIt.':lang==='tr'?'GPS reddedildi. Ayarlar → Gizlilik → Konum → FixIt.':lang==='pl'?'GPS odmówiony. Ustawienia → Prywatność → Lokalizacja → FixIt.':'GPS denied. Enable in Settings → Privacy → Location → FixIt.'}</div>}
            <button onClick={()=>goto('loc-ask')} style={{...s.btn,width:'auto',padding:'10px 20px',borderRadius:100}}>{t('allow')}</button>
          </div>
        )}
      </Scroll>
      <NavBar screen={screen} t={t} goto={goto}/>
      <style>{CSS}</style>
    </Screen>

    {AUTH_MODAL}
    </>
  );

  // ── FIX NOW ──────────────────────────────────────────────────────────────────
  if (screen === 'fix-now') return (
    <>
    <Screen>
      {showLP && <LangPicker lang={lang} setLang={lc=>{setLang(lc);setShowLP(false);aiReset();setPResults(null);setPInput('');setVInput('');}} setShowLP={setShowLP} LANGS={LANGS} t={t}/>}
      <div style={{padding:'52px 20px 14px',borderBottom:`1px solid ${C.b}`,flexShrink:0}}>
          <BackBtn/>
        <div style={{fontSize:'1.35rem',fontWeight:800,letterSpacing:'-0.02em',marginBottom:4}}>{t('fixItNow')}</div>
        <div style={{fontSize:'0.82rem',color:C.m}}>{t('descOrPhoto')}</div>
      </div>
      {!isOnline && <div style={{background:'rgba(26,95,232,0.1)',padding:'10px 20px',fontSize:'0.78rem',color:C.bl,flexShrink:0}}>🔌 {lang==='de'?'Internetverbindung für KI-Analyse erforderlich.':'Connect to internet to use AI repair guide.'}</div>}
      <Scroll>
        {photo && (
          <div style={{position:'relative',marginBottom:14}}>
            <img src={photo} alt="upload" style={{width:'100%',borderRadius:14,maxHeight:180,objectFit:'cover',display:'block'}}/>
            <button onClick={clearPhoto} style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.65)',border:'none',color:'#fff',borderRadius:'50%',width:28,height:28,cursor:'pointer',fontFamily:'inherit'}}>✕</button>
          </div>
        )}
        <label style={{background:'rgba(232,82,26,0.04)',border:'2px dashed rgba(232,82,26,0.25)',borderRadius:20,padding:'24px 20px',textAlign:'center',marginBottom:14,cursor:'pointer',display:'block'}}>
          <input type="file" accept="image/*" onChange={handlePhoto} style={{display:'none'}}/>
          <div style={{fontSize:'2rem',marginBottom:6}}>📸</div>
          <div style={{fontSize:'0.92rem',fontWeight:700,marginBottom:4}}>{t('takePhoto')}</div>
          <div style={{fontSize:'0.73rem',color:C.m,marginBottom:10}}>{t('photoDesc')}</div>
          <span style={{background:C.o,color:'#fff',borderRadius:100,padding:'8px 20px',fontSize:'0.78rem',fontWeight:700}}>{t('cameraUpload')}</span>
        </label>
        <div style={s.card}>
          <div style={{fontSize:'0.65rem',color:C.m,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>{t('describeWords')}</div>
          <textarea
            id="fixit-problem-input"
            placeholder={t('descProblem')}
            onChange={e=>{problemRef.current=e.target.value;}}
            defaultValue={problemRef.current}
            style={{...s.inp,resize:'none',height:90,marginBottom:10}}
          />
          <button onClick={()=>runAI()} style={{...s.btn,opacity:!isOnline?0.5:1}} disabled={!isOnline}>{t('getAIGuide')}</button>
        </div>
        <div style={{fontSize:'0.68rem',fontWeight:700,color:C.m,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>{t('commonProblems')}</div>
        {getQP(lang,curFix).map((p,i)=>(
          <div key={i} onClick={()=>{ if(!isOnline) return; problemRef.current=p.t; runAI(p.t); }} style={{...s.card,display:'flex',alignItems:'center',gap:12,cursor:isOnline?'pointer':'not-allowed',marginBottom:8,opacity:isOnline?1:0.5,animation:`fadeIn ${.25+i*.05}s ease`}}>
            <span style={{fontSize:'1.1rem',flexShrink:0}}>{p.e}</span>
            <span style={{fontSize:'0.85rem',fontWeight:600,flex:1}}>{p.t}</span>
            <span style={{color:C.m}}>→</span>
          </div>
        ))}
      </Scroll>
      <NavBar screen={screen} t={t} goto={goto}/>
      <style>{CSS}</style>
    </Screen>
    {AUTH_MODAL}
    </>
  );

  // ── RESULT ───────────────────────────────────────────────────────────────────
  if (screen === 'result') {
    const r   = restoredResult || aiResult;
    // Single source of truth for the active diagnosis category.
    // r._category is set by useEffect (fresh) or restoredResult._category (history).
    // Falls back to curFix only when _category is absent (old history entries).
    // Never defaults to 'home' unless the entry itself is categorised as 'home'.
    // r._category is set by useEffect AFTER paint — use diagCategoryRef as bridge for fresh results
    const effectiveCat = (r && r._category) ? r._category : (diagCategory || diagCategoryRef.current || curFix);
    const pct = r?.confidence||0;
    const col = r?.callPro?C.r:pct<60?C.y:C.g;
    const ci  = 170, off = ci-(ci*pct/100);
    // Normalize AI-generated proSearchQuery to short, local-intent friendly term
    function normalizeProSearch(raw, cat, _unused) {
      // Maps search uses GPS country language, not UI language.
      const ml = getMarketLang(cc);
      const mDE=ml==='de', mFR=ml==='fr', mIT=ml==='it', mES=ml==='es',
            mPL=ml==='pl', mTR=ml==='tr', mMK=ml==='mk', mSR=ml==='sr'||ml==='hr',
            mSV=ml==='sv', mNO=ml==='no', mDA=ml==='da', mFI=ml==='fi',
            mNL=ml==='nl', mPT=ml==='pt', mPTBR=ml==='pt-br', mEL=ml==='el',
            mCS=ml==='cs', mSK=ml==='sk', mHU=ml==='hu', mRO=ml==='ro', mBG=ml==='bg';
      const defaults = {
        car:        mDE?'Autowerkstatt':mFR?'Garage automobile':mIT?'Officina auto':mES?'Taller mecánico':mMK?'Автосервис':mSR?'Auto servis':mTR?'Araba tamircisi':mPL?'Warsztat samochodowy':mSV?'bilverkstad':mNO?'bilverksted':mDA?'autoværksted':mFI?'autokorjaamo':mNL?'autogarage':mPT?'oficina de automóveis':mPTBR?'oficina mecânica':mEL?'συνεργείο αυτοκινήτων':mCS?'autoservis':mSK?'autoservis':mHU?'autószerelő':mRO?'service auto':mBG?'автосервиз':'car repair shop',
        motorcycle: mDE?'Motorradwerkstatt':mFR?'Atelier moto':mIT?'Officina moto':mES?'Taller de motos':mMK?'Сервис за мотори':mSR?'Servis motocikla':mTR?'Motosiklet servisi':mPL?'Serwis motocyklowy':mSV?'motorcykel reparation':mNO?'motorsykkel reparasjon':mDA?'motorcykel reparation':mFI?'moottoripyörä huolto':mNL?'motorfiets reparatie':mPT?'reparação mota':mPTBR?'conserto moto':mEL?'επισκευή μοτοσικλέτας':mCS?'oprava motocyklu':mSK?'oprava motocykla':mHU?'motorkerékpár javítás':mRO?'reparație motocicletă':mBG?'ремонт на мотоциклет':'motorcycle repair',
        moto:       mDE?'Motorradwerkstatt':mFR?'Atelier moto':mIT?'Officina moto':mES?'Taller de motos':mMK?'Сервис за мотори':mSR?'Servis motocikla':mTR?'Motosiklet servisi':mPL?'Serwis motocyklowy':mSV?'motorcykel reparation':mNO?'motorsykkel reparasjon':mDA?'motorcykel reparation':mFI?'moottoripyörä huolto':mNL?'motorfiets reparatie':mPT?'reparação mota':mPTBR?'conserto moto':mEL?'επισκευή μοτοσικλέτας':mCS?'oprava motocyklu':mSK?'oprava motocykla':mHU?'motorkerékpár javítás':mRO?'reparație motocicletă':mBG?'ремонт на мотоциклет':'motorcycle repair',
        bike:       mDE?'Fahrradwerkstatt':mFR?'Atelier vélo':mIT?'Officina bici':mES?'Taller de bicicletas':mMK?'Сервис за велосипеди':mSR?'Servis bicikla':mTR?'Bisiklet tamircisi':mPL?'Serwis rowerowy':mSV?'cykel reparation':mNO?'sykkel reparasjon':mDA?'cykel reparation':mFI?'polkupyörä huolto':mNL?'fiets reparatie':mPT?'reparação bicicleta':mPTBR?'conserto bicicleta':mEL?'επισκευή ποδηλάτου':mCS?'oprava kola':mSK?'oprava bicykla':mHU?'kerékpár javítás':mRO?'reparație bicicletă':mBG?'ремонт на велосипед':'bike repair shop',
        tech:       mDE?'Elektronik Reparatur':mFR?'Réparation électronique':mIT?'Riparazione elettronica':mES?'Reparación electrónica':mMK?'Електронски сервис':mSR?'Servis elektronike':mTR?'Elektronik tamircisi':mPL?'Serwis elektroniczny':mSV?'elektronik reparation':mNO?'elektronikk reparasjon':mDA?'elektronik reparation':mFI?'elektroniikka huolto':mNL?'elektronica reparatie':mPT?'reparação eletrónica':mPTBR?'assistência técnica eletrônica':mEL?'επισκευή ηλεκτρονικών':mCS?'oprava elektroniky':mSK?'oprava elektroniky':mHU?'elektronika javítás':mRO?'reparație electronică':mBG?'ремонт на електроника':'electronics repair',
        appliances: mDE?'Hausgeräte Reparatur':mFR?'Réparation électroménager':mIT?'Riparazione elettrodomestici':mES?'Reparación electrodomésticos':mMK?'Сервис за апарати':mSR?'Servis aparata':mTR?'Ev aletleri tamircisi':mPL?'Serwis AGD':mSV?'hushållsapparater reparation':mNO?'hvitevarer reparasjon':mDA?'husholdningsapparater reparation':mFI?'kodinkoneet huolto':mNL?'huishoudapparaten reparatie':mPT?'reparação eletrodomésticos':mPTBR?'assistência técnica eletrodomésticos':mEL?'επισκευή οικιακών συσκευών':mCS?'oprava spotřebičů':mSK?'oprava spotrebičov':mHU?'háztartási gép javítás':mRO?'reparație electrocasnice':mBG?'ремонт на домакински уреди':'appliance repair',
        home:       mDE?'Handwerker':mFR?'Artisan':mIT?'Artigiano':mES?'Técnico del hogar':mMK?'Мајстор':mSR?'Majstor':mTR?'Usta':mPL?'Fachowiec':mSV?'hantverkare':mNO?'håndverker':mDA?'håndværker':mFI?'käsityöläinen':mNL?'klusjesman':mPT?'técnico doméstico':mPTBR?'técnico doméstico':mEL?'τεχνίτης':mCS?'řemeslník':mSK?'remeselník':mHU?'kézműves':mRO?'meșteșugar':mBG?'майстор':'handyman',
        garden:     mDE?'Gärtner Gartencenter':mFR?'Jardinerie':mIT?'Centro giardinaggio':mES?'Centro de jardinería':mMK?'Градинарство':mSR?'Vrtni centar':mTR?'Bahçe merkezi':mPL?'Centrum ogrodnicze':mSV?'trädgård service':mNO?'hageservice':mDA?'haveservice':mFI?'puutarhapalvelu':mNL?'tuincentrum':mPT?'jardim serviço':mPTBR?'jardinagem serviço':mEL?'κηπουρός':mCS?'zahradní centrum':mSK?'záhradné centrum':mHU?'kertészet':mRO?'centru grădinărit':mBG?'градинарство':'garden center',
        pets:       mDE?'Tierarzt':mFR?'Vétérinaire':mIT?'Veterinario':mES?'Veterinario':mMK?'Ветеринар':mSR?'Veterinar':mTR?'Veteriner':mPL?'Weterynarz':mSV?'veterinär':mNO?'veterinær':mDA?'dyrlæge':mFI?'eläinlääkäri':mNL?'dierenarts':mPT?'veterinário':mPTBR?'veterinário':mEL?'κτηνίατρος':mCS?'veterinář':mSK?'veterinár':mHU?'állatorvos':mRO?'veterinar':mBG?'ветеринар':'veterinarian',
      };
      const categoryDefault = defaults[cat] || (mDE?'Fachmann':mFR?'Professionnel':mES?'Profesional':mMK?'Стручњак':mSR?'Stručnjak':mSV?'hantverkare':mNO?'håndverker':mNL?'reparatie':mPT?'serviço reparação':mPTBR?'assistência técnica':mEL?'επισκευή':mCS?'oprava':mSK?'oprava':mHU?'javítás':mRO?'reparație':mBG?'ремонт':'repair service');
      // For repair-shop categories, always use the generic market-localized term.
      // AI's proSearchQuery (e.g. "ABS Reparatur BMW") must never reach the Maps query.
      const ALWAYS_GENERIC = new Set(['car','motorcycle','moto','bike']);
      if (ALWAYS_GENERIC.has(cat) || !raw || !raw.trim() || raw.trim().length > 40) return categoryDefault;
      return raw.trim();
    }
    const isDE = lang === 'de';
    const ct  = catTerms(effectiveCat, lang);  // category from saved entry, not stale curFix
    const proQ = normalizeProSearch(r?.proSearchQuery, effectiveCat, isDE)||`${effectiveCat} repair service`;



    return (
      <Screen>
        {showLP && <LangPicker lang={lang} setLang={lc=>{setLang(lc);setShowLP(false);aiReset();setPResults(null);setPInput('');setVInput('');}} setShowLP={setShowLP} LANGS={LANGS} t={t}/>}
        <div style={{padding:'52px 20px 14px',background:'linear-gradient(160deg,#001a0d,#0A0908 60%)',borderBottom:`1px solid ${C.b}`,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <BackBtn/>
            {r && <button onClick={handleShare} style={{background:'none',border:`1px solid ${C.b}`,borderRadius:100,padding:'5px 12px',fontSize:'0.72rem',cursor:'pointer',color:C.m,fontFamily:'inherit'}}>↗ {lang==='de'?'Teilen':lang==='tr'?'Paylaş':lang==='pl'?'Udostępnij':'Share'}</button>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{position:'relative',width:68,height:68,flexShrink:0}}>
              <svg viewBox="0 0 68 68" width="68" height="68" style={{transform:'rotate(-90deg)'}}>
                <circle fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" cx="34" cy="34" r="27"/>
                <circle fill="none" stroke={col} strokeWidth="5" strokeLinecap="round" strokeDasharray={ci} strokeDashoffset={r?off:ci} cx="34" cy="34" r="27" style={{transition:'stroke-dashoffset 1s ease'}}/>
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:800}}>{r?`${pct}%`:'…'}</div>
            </div>
            <div>
              <div style={{fontSize:'1rem',fontWeight:800,marginBottom:3,color:r?.callPro?C.r:C.t}}>{getStatusLabel(r?.status, lang) || (aiLoading?(ct.loading||AI_MSGS[lang]||AI_MSGS.en)[aiMsgIdx % (ct.loading||AI_MSGS[lang]||AI_MSGS.en).length]:'…')}</div>
              <div style={{fontSize:'0.75rem',color:C.m}}>{r?`⏱ ${r.timeEstimate} · ${r.estimatedCost}`:(aiLoading?'':'' )}</div>
            </div>
          </div>
        </div>
        <Scroll>
          {/* Loading with cycling messages */}
          {aiLoading && (
            <div style={{textAlign:'center',padding:'40px 20px',display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
              <div style={{position:'relative',width:60,height:60}}>
                <div style={{position:'absolute',inset:0,border:`3px solid rgba(255,255,255,0.06)`,borderTopColor:C.o,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
                <div style={{position:'absolute',inset:6,border:`2px solid rgba(255,255,255,0.04)`,borderTopColor:'rgba(232,82,26,0.4)',borderRadius:'50%',animation:'spin 1.2s linear infinite reverse'}}/>
              </div>
              <div style={{fontSize:'0.92rem',color:C.t,fontWeight:600}}>{(ct.loading||AI_MSGS[lang]||AI_MSGS.en)[aiMsgIdx % (ct.loading||AI_MSGS[lang]||AI_MSGS.en).length]}</div>
              <div style={{fontSize:'0.75rem',color:C.m}}>{t('diagnosingWait')}</div>
            </div>
          )}
          {/* Error */}
          {aiError && !aiLoading && (() => {
            const errCode = typeof aiError==='object'?aiError.code:aiError;
            const isKeyIssue  = ['nokey','missing_api_key','invalid_api_key','invalid_api_key_format','badkey'].includes(errCode);
            const isNetworkErr = ['network','anthropic_network_error'].includes(errCode);
            const isOverload   = ['rate_limited','anthropic_overloaded','ai_timeout'].includes(errCode);
            const isBadReq     = ['anthropic_bad_request','anthropic_api_error'].includes(errCode);
            const savedProb    = problemRef.current;
            return (
              <div style={{...s.card,background:isKeyIssue?'rgba(232,178,26,0.06)':'rgba(232,82,26,0.06)',borderColor:isKeyIssue?'rgba(232,178,26,0.25)':'rgba(232,82,26,0.2)',animation:'fadeIn .4s ease'}}>
                <div style={{fontSize:'1.5rem',textAlign:'center',marginBottom:12}}>{isKeyIssue?'⚙️':errCode==='rate_limited'?'⏱️':errCode==='timeout'?'⌛':errCode==='json_parse_fallback'?'🔄':isNetworkErr?'📡':'🔧'}</div>
                <div style={{fontSize:'1rem',fontWeight:800,textAlign:'center',marginBottom:8}}>
                  {isKeyIssue ? t('aiNoKey') :
                    errCode==='rate_limited'        ? (lang==='de'?'Tageslimit erreicht':lang==='tr'?'Günlük limit doldu':lang==='pl'?'Osiągnięto dzienny limit':'Daily limit reached') :
                    errCode==='timeout'             ? (lang==='de'?'Analyse hat zu lange gedauert':lang==='tr'?'Analiz çok uzun sürdü':lang==='pl'?'Analiza trwała zbyt długo':'Analysis timed out') :
                    errCode==='json_parse_fallback' ? (lang==='de'?'Analyse konnte nicht verarbeitet werden':lang==='tr'?'Analiz işlenemedi':lang==='pl'?'Nie udało się przetworzyć analizy':'Analysis could not be processed') :
                    t('aiUnavailable')}
                </div>
                <div style={{fontSize:'0.86rem',color:C.m,textAlign:'center',lineHeight:1.65,marginBottom:savedProb?8:16}}>
                  {isKeyIssue?t('aiNoKeyDesc'):(lang==='de'?'Bitte nochmals versuchen. Deine Eingabe wird erneut gesendet.':lang==='tr'?'Lütfen tekrar dene. Giriş yeniden gönderilecek.':lang==='pl'?'Spróbuj ponownie. Twoje dane zostaną przesłane ponownie.':'Please try again. Your input will be resent.')}
                </div>
                {!isKeyIssue && savedProb && (
                  <div style={{background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'8px 10px',marginBottom:8,fontSize:'0.72rem',color:C.m,lineHeight:1.5}}>
                    📝 {lang==='de'?'Ihr Text':'Your text'}: <em style={{color:C.t}}>{savedProb.substring(0,80)}{savedProb.length>80?'…':''}</em>
                  </div>
                )}

                <button onClick={()=>{ const el=document.getElementById('fixit-problem-input'); if(el&&el.value.trim()) problemRef.current=el.value.trim(); runAI(savedProb||problemRef.current); }} style={s.btn}>{t('tryAgain')}</button>
                <div style={{height:10}}/>
                <button onClick={()=>{window.open(mu(proQ), '_blank', 'noopener,noreferrer');}} style={{...s.btn,...s.btnSec}}>{ct.proBtn}</button>
              </div>
            );
          })()}
          {/* Results */}
          {r && !aiLoading && <div style={{animation:'fadeIn .4s ease'}}>
            {r.safetyWarning && <div style={{
                ...s.card,
                background: r.warningLevel==='danger' ? 'rgba(214,59,47,0.14)' : 'rgba(214,59,47,0.06)',
                borderColor: r.warningLevel==='danger' ? 'rgba(214,59,47,0.6)' : 'rgba(214,59,47,0.25)',
                borderWidth: r.warningLevel==='danger' ? 2 : 1,
              }}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <span style={{fontSize:'1.2rem'}}>{r.warningLevel==='danger'?'🚨':'⚠️'}</span>
                <div style={{fontSize:'0.62rem',fontWeight:700,color:C.r,textTransform:'uppercase',letterSpacing:'0.1em'}}>
                  {r.warningLevel==='danger'
                    ? (lang==='de'?'SICHERHEITSWARNUNG — PROFESSIONELLE HILFE ERFORDERLICH':lang==='tr'?'GÜVENLİK UYARISI — UZMAN GEREKLİ':lang==='pl'?'OSTRZEŻENIE BEZPIECZEŃSTWA — WYMAGANY FACHOWIEC':'SAFETY WARNING — PROFESSIONAL REQUIRED')
                    : t('safetyWarning')}
                </div>
              </div>
              <div style={{fontSize:'0.86rem',lineHeight:1.7,color:r.warningLevel==='danger'?'rgba(255,255,255,0.9)':C.t}}>{r.safetyWarning}</div>
            </div>}
            <div style={{...s.card,background:'rgba(26,158,92,0.05)',borderColor:'rgba(26,158,92,0.2)'}}>
              <div style={{fontSize:'0.62rem',fontWeight:700,color:C.g,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>{t('diagnosis')}</div>
              <div style={{fontSize:'0.86rem',lineHeight:1.65,marginBottom:10}}>{r.diagnosis}</div>
              {r._fallback && (
                <div style={{background:'rgba(232,178,26,0.08)',border:'1px solid rgba(232,178,26,0.25)',borderRadius:10,padding:'12px 14px',marginBottom:12}}>
                  <div style={{fontSize:'0.72rem',color:C.y,marginBottom:10}}>
                    ⚡ {lang==='de'?'Schnellanalyse — für vollständige Diagnose erneut versuchen oder Foto hochladen.':'Quick analysis — retry or upload a photo for a complete diagnosis.'}
                  </div>
                  <button onClick={()=>runAI(problemRef.current||undefined)} style={{...s.btn,padding:'10px 16px',fontSize:'0.82rem',width:'auto'}}>
                    🔄 {lang==='de'?'Erneut analysieren':lang==='tr'?'Tekrar analiz et':lang==='pl'?'Analizuj ponownie':'Retry analysis'}
                  </button>
                </div>
              )}
              {r._vehicleCtx && (
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                  <div style={{background:'rgba(26,95,232,0.12)',border:'1px solid rgba(26,95,232,0.2)',
                    borderRadius:100,padding:'4px 10px',fontSize:'0.65rem',fontWeight:700,
                    color:'rgba(100,149,237,0.9)',display:'flex',alignItems:'center',gap:5}}>
                    <span>🚗</span>
                    <span>{[r._vehicleCtx.make,r._vehicleCtx.model,r._vehicleCtx.generation,r._vehicleCtx.engine,r._vehicleCtx.year].filter(Boolean).join(' ')}</span>
                  </div>
                  <div style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.22)'}}>
                    {lang==='de'?'erkannt':lang==='tr'?'algılandı':lang==='pl'?'wykryto':'detected'}
                  </div>
                </div>
              )}
              {r.causes?.length>0 && <div style={{marginBottom:10}}>
                <div style={{fontSize:'0.62rem',fontWeight:700,color:C.m,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6}}>{t('possibleCauses')}</div>
                {r.causes.map((c,i)=><div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}><span style={{fontSize:'0.6rem',color:C.g,flexShrink:0}}>◆</span><span style={{fontSize:'0.8rem',color:'rgba(240,237,232,0.8)'}}>{c}</span></div>)}
              </div>}
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                <span style={{padding:'5px 11px',borderRadius:100,fontSize:'0.7rem',fontWeight:600,background:'rgba(26,158,92,0.12)',color:C.g,border:'1px solid rgba(26,158,92,0.2)'}}>⏱ {r.timeEstimate}</span>
                <span style={{padding:'5px 11px',borderRadius:100,fontSize:'0.7rem',fontWeight:600,background:'rgba(26,158,92,0.1)',color:C.g,border:'1px solid rgba(26,158,92,0.2)'}}>
                  💰 {lang==='de'?'Sparpotenzial ca.':lang==='tr'?'Tahmini tasarruf':lang==='pl'?'Potencjał oszczędności':'Est. saving'} {r.estimatedCost}
                </span>
                {r.difficulty && <span style={{padding:'5px 11px',borderRadius:100,fontSize:'0.7rem',fontWeight:600,background:'rgba(26,158,92,0.1)',color:C.g,border:'1px solid rgba(26,158,92,0.2)'}}>{getDiffLabel(r.difficulty, lang)}</span>}
              </div>
            </div>
            {/* Steps with real images */}
            {r.steps?.length>0 && <div style={{...s.card,padding:0,overflow:'hidden'}}>
              <div style={{padding:'14px 14px 6px'}}>
                <div style={{fontSize:'0.62rem',fontWeight:700,color:C.o,textTransform:'uppercase',letterSpacing:'0.1em'}}>{ct.steps}</div>
              </div>
              <div style={{padding:'0 12px 12px',display:'flex',flexDirection:'column',gap:12}}>
                {r.steps.map((st,i)=>{
                  const googleImgUrl = st.imageQuery
                    ? `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(st.imageQuery)}`
                    : null;
                  return (
                    <div key={i} style={{border:`1px solid ${C.b}`,borderRadius:16,overflow:'hidden',background:C.c,animation:`fadeIn ${.4+i*.1}s ease`}}>
                      <div style={{position:'relative',background:'#151210',minHeight:70,display:'flex',alignItems:'center',padding:'12px 14px',gap:12}}>
                        <span style={{fontSize:'2rem',flexShrink:0}}>{st.emoji||'🔧'}</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:'0.6rem',fontWeight:700,color:C.o,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}}>{t('step')} {i+1} {t('of')} {r.steps.length}</div>
                          <div style={{fontSize:'0.78rem',color:C.m,lineHeight:1.4}}>{st.title}</div>
                        </div>
                        {googleImgUrl && (
                          <button onClick={()=>window.open(googleImgUrl, '_blank', 'noopener,noreferrer')} style={{background:'rgba(26,95,232,0.15)',border:'1px solid rgba(26,95,232,0.3)',borderRadius:8,padding:'6px 10px',color:C.bl,fontSize:'0.65rem',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,fontFamily:'inherit'}}>
                            🔍 {lang==='de'?'Bild':lang==='tr'?'Görsel':lang==='pl'?'Obraz':'Image'}
                          </button>
                        )}
                        <div style={{position:'absolute',top:8,left:8,background:C.o,color:'#fff',fontSize:'0.6rem',fontWeight:800,padding:'3px 8px',borderRadius:100}}>{i+1}</div>
                      </div>
                      <div style={{padding:'13px 14px'}}>
                        <div style={{fontSize:'0.9rem',fontWeight:800,marginBottom:6}}>{st.title}</div>
                        <div style={{fontSize:'0.8rem',color:'rgba(240,237,232,0.82)',lineHeight:1.6}}>{st.description}</div>
                        {st.tip && <div style={{display:'flex',gap:8,background:'rgba(232,82,26,0.07)',border:'1px solid rgba(232,82,26,0.18)',borderRadius:10,padding:9,marginTop:10}}>
                          <span>{t('photoTip')}</span>
                          <div style={{fontSize:'0.74rem',color:'rgba(240,237,232,0.7)',lineHeight:1.5,flex:1}}>{st.tip}</div>
                        </div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>}
            {r.tools?.length>0 && <div style={s.card}>
              <div style={{fontSize:'0.62rem',fontWeight:700,color:C.bl,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>{ct.tools}</div>
              <div style={{display:'flex',flexWrap:'wrap'}}>{r.tools.map((tool,i)=><span key={i} onClick={()=>window.open(`https://www.amazon.com/s?k=${encodeURIComponent(tool)}`, '_blank', 'noopener,noreferrer')} style={{padding:'5px 11px',borderRadius:100,fontSize:'0.7rem',fontWeight:600,background:'rgba(26,95,232,0.12)',color:C.bl,border:'1px solid rgba(26,95,232,0.2)',cursor:'pointer',margin:3}}>{tool} →</span>)}</div>
            </div>}
            {r.partsNeeded?.length>0 && <div style={{...s.card,background:'rgba(232,82,26,0.04)',borderColor:'rgba(232,82,26,0.15)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}><div style={{fontSize:'0.62rem',fontWeight:700,color:C.o,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:0}}>{ct.parts}</div>
              <div style={{fontSize:'0.6rem',color:'rgba(255,178,36,0.65)',fontStyle:'italic'}}>{lang==='de'?'Suchvorschläge':lang==='tr'?'Arama önerileri':lang==='pl'?'Sugestie':'Search suggestions'}</div></div>
              <div style={{display:'flex',flexWrap:'wrap'}}>{r.partsNeeded.map((p,i)=><span key={i} onClick={()=>{
                      // Use r._category (attached at diagnosis time) so the correct
                      // Parts tab is selected even when curFix differs from the diagnosis category.
                      // Falls back to curFix for old history entries without _category.
                      const _baseCat = r._category || curFix;
                      const cat2=_baseCat==='car'?'car':_baseCat==='motorcycle'?'moto':_baseCat==='moto'?'moto':_baseCat==='bike'?'moto':_baseCat==='tech'?'tech':_baseCat==='appliances'?'appliances':_baseCat==='garden'?'garden':_baseCat==='pets'?'pets':'home';
                       const cq2 = cleanProductSearchQuery(p,'',cat2,'','');
                       setPInput(cq2); setVInput(''); setHsnModel(''); setVType(cat2);
                       setPResults({ q: cq2, vehicle: '', hsnModel: '', searchQ: cq2, isHSN: false, category: cat2, fromDiagnosis: true });
                      if (!user) { setAuthScreen('login'); } else if (isPro || freeRepairActive) { goto('parts'); } else if (authProfile?.free_trial_completed_at) { setFreeRepairDone(true); } else { setPaywallSource('parts'); setFreeLimitHit(true); }
                    }} style={{padding:'5px 11px',borderRadius:100,fontSize:'0.7rem',fontWeight:600,background:'rgba(232,82,26,0.12)',color:C.o,border:'1px solid rgba(232,82,26,0.2)',cursor:'pointer',margin:3}}>{p} →</span>)}</div>
              <div style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.25)',marginTop:8,lineHeight:1.5}}>
                {r._vehicleCtx ? (
                  lang==='de'
                    ? `Suchvorschläge für ${[r._vehicleCtx.make, r._vehicleCtx.model, r._vehicleCtx.engine].filter(Boolean).join(' ')}. Bitte vor dem Kauf über Fahrgestellnummer, vorhandenes Teile-Etikett oder Fahrzeughandbuch prüfen.`
                    : lang==='tr'
                    ? `${[r._vehicleCtx.make, r._vehicleCtx.model, r._vehicleCtx.engine].filter(Boolean).join(' ')} için arama önerileri. Satın almadan önce şasi numarası veya mevcut parça etiketi ile doğrulayın.`
                    : `Search suggestions for ${[r._vehicleCtx.make, r._vehicleCtx.model, r._vehicleCtx.engine].filter(Boolean).join(' ')}. Verify compatibility via VIN, existing part label, or vehicle manual before buying.`
                ) : (
                  lang==='de'?'Bitte Modellnummer prüfen oder altes Teil vergleichen, bevor Sie Ersatzteile kaufen.':
                  lang==='tr'?'Satın almadan önce model numarasını veya eski parçayı kontrol edin.':
                  lang==='pl'?'Sprawdź numer modelu lub porównaj stary element przed zakupem.':
                  'Please verify your model number or compare the old part before buying.'
                )}
              </div>
            </div>}
            {r.proTip && <div style={{...s.card,background:'rgba(232,178,26,0.05)',borderColor:'rgba(232,178,26,0.2)'}}>
              <div style={{fontSize:'0.62rem',fontWeight:700,color:C.y,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>{t('expertTip')}</div>
              <div style={{fontSize:'0.86rem',lineHeight:1.65}}>{r.proTip}</div>
            </div>}
            {/* Did this fix it? */}
            {!feedback && <div style={{...s.card,background:'rgba(255,255,255,0.03)',textAlign:'center'}}>
              <div style={{fontSize:'0.78rem',fontWeight:700,marginBottom:12}}>{ct.fixedQ}</div>
              <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                <button onClick={()=>handleFeedback('fixed')} style={{...s.btn,width:'auto',padding:'10px 20px',background:'rgba(26,158,92,0.15)',color:C.g,border:`1px solid rgba(26,158,92,0.3)`}}>{ct.fixedY}</button>
                <button onClick={()=>handleFeedback('broken')} style={{...s.btn,width:'auto',padding:'10px 20px',background:'rgba(214,59,47,0.1)',color:C.r,border:`1px solid rgba(214,59,47,0.25)`}}>{ct.fixedN}</button>
              </div>
            </div>}
            {feedback === 'fixed' && <div style={{...s.card,background:'rgba(26,158,92,0.08)',borderColor:'rgba(26,158,92,0.3)',textAlign:'center'}}>
              <div style={{fontSize:'1.5rem',marginBottom:8}}>🎉</div>
              <div style={{fontSize:'1rem',fontWeight:800,marginBottom:8,color:C.g}}>{lang==='de'?'Glückwunsch! Problem behoben!':lang==='tr'?'Tebrikler! Problem çözüldü!':lang==='pl'?'Gratulacje! Problem rozwiązany!':'Problem Fixed!'}</div>
              <button onClick={handleShare} style={{...s.btn,marginBottom:8}}>↗ {lang==='de'?'Teilen':lang==='tr'?'Paylaş':lang==='pl'?'Udostępnij':'Share Fix'}</button>
            </div>}
            {feedback === 'broken' && <div style={{...s.card,background:'rgba(214,59,47,0.06)',borderColor:'rgba(214,59,47,0.25)',textAlign:'center'}}>
              <div style={{fontSize:'1.5rem',marginBottom:8}}>🔧</div>
              <div style={{fontSize:'0.9rem',fontWeight:700,marginBottom:12}}>{lang==='de'?'Noch nicht behoben?':lang==='tr'?'Henüz düzeltilmedi mi?':lang==='pl'?'Jeszcze nie naprawione?':'Not fixed yet?'}</div>
              <button onClick={()=>{window.open(mu(proQ), '_blank', 'noopener,noreferrer');}} style={{...s.btn,background:C.r}}>{ct.proBtn}</button>
            </div>}
            {r.callPro ? (
              <div style={{...s.card,background:'rgba(214,59,47,0.06)',borderColor:'rgba(214,59,47,0.25)'}}>
                <div style={{fontSize:'0.62rem',fontWeight:700,color:C.r,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>{t('proRequired')}</div>
                <div style={{fontSize:'0.86rem',lineHeight:1.65,marginBottom:12}}>{r.proReason}</div>
                <button onClick={()=>{window.open(mu(proQ), '_blank', 'noopener,noreferrer');}} style={{...s.btn,background:C.r}}>{ct.proBtn}</button>
              </div>
            ) : (
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>{
                  // effectiveCat is derived from r._category (set at save/restore time),
                  // falling back to curFix only for old entries. Never depends on stale curFix.
                  // Read r._category at click time (same as chip handler) to get the
                  // post-useEffect corrected category — not the stale render-time closure.
                  const _btnCat = (r && r._category) ? r._category : curFix;
                  const cat=_btnCat==='car'?'car':_btnCat==='motorcycle'?'moto':_btnCat==='moto'?'moto':_btnCat==='bike'?'moto':_btnCat==='tech'?'tech':_btnCat==='appliances'?'appliances':_btnCat==='garden'?'garden':_btnCat==='pets'?'pets':'home';
                  setVType(cat);
                  // Build query from CURRENT diagnosis — never reuse old parts search
                  const detectedVehicle = r._vehicleCtx;
                  const diagQuery = buildPartsQueryFromDiagnosis(r, problemRef.current, _btnCat, detectedVehicle);
                  // Build the vehicle label string for the vInput field
                  const vehicleLabel = detectedVehicle
                    ? [detectedVehicle.make, detectedVehicle.model, detectedVehicle.engine, detectedVehicle.year].filter(Boolean).join(' ')
                    : '';
                  setPInput(diagQuery);
                  setVInput(vehicleLabel); // populate vehicle field with detected vehicle
                  setHsnModel('');
                  // vType already set correctly above via setVType(cat) — do NOT override
                  // Pre-populate pResults so parts are immediately visible
                  const fullSearchQ = diagQuery; // vehicle already in diagQuery via ensureVehicle
                  setPResults({ q: diagQuery, vehicle: vehicleLabel, hsnModel: '', searchQ: fullSearchQ, isHSN: false, category: cat, fromDiagnosis: true, vehicleCtx: detectedVehicle });
                  if (!user) { setAuthScreen('login'); } else if (isPro || freeRepairActive) { goto('parts'); } else if (authProfile?.free_trial_completed_at) { setFreeRepairDone(true); } else { setPaywallSource('parts'); setFreeLimitHit(true); }
                }} style={s.btn}>{ct.partsBtn}</button>
                <button onClick={()=>{window.open(mu(proQ), '_blank', 'noopener,noreferrer');}} style={{...s.btn,...s.btnSec}}>{ct.proBtn}</button>
              </div>
            )}
          </div>}
        </Scroll>
        {/* Toast */}
        {toast && <div style={{position:'fixed',bottom:120,left:'50%',transform:'translateX(-50%)',background:'rgba(30,30,30,0.95)',color:'#fff',padding:'10px 20px',borderRadius:100,fontSize:'0.82rem',fontWeight:600,animation:'toast 2.5s ease forwards',whiteSpace:'nowrap',zIndex:200}}>{toast}</div>}
        <NavBar screen={screen} t={t} goto={goto}/>
        <style>{CSS}</style>
      </Screen>
    );
  }

  // ── EMERGENCY ────────────────────────────────────────────────────────────────
  // Emergency debug — verify GPS country is independent of language
  if (screen === 'emergency') console.log('[FixIt] EMERGENCY raw_country=' + country + ' ccGPS=' + ccGPS + ' lang=' + lang + ' city=' + city + ' geocodeErr=' + geocodeErr + ' emergency_country=' + (cdGPS?.name||'DEFAULT/International'));
  if (screen === 'emergency') return (
    <Screen bg="#060000">
      {showLP && <LangPicker lang={lang} setLang={lc=>{setLang(lc);setShowLP(false);aiReset();setPResults(null);setPInput('');setVInput('');}} setShowLP={setShowLP} LANGS={LANGS} t={t}/>}
      {!isOnline && <div style={{background:'rgba(232,178,26,0.1)',borderBottom:'1px solid rgba(232,178,26,0.2)',padding:'8px 16px',fontSize:'0.72rem',color:C.y,textAlign:'center',flexShrink:0}}>⚠️ {t('offlineEmergencyBanner')}</div>}
      <div style={{padding:'52px 20px 14px',background:'linear-gradient(160deg,rgba(214,59,47,0.1),transparent 60%)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:6,fontSize:'0.62rem',fontWeight:700,color:C.r,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>
          <span style={{width:8,height:8,background:C.r,borderRadius:'50%',animation:'blink 1.2s infinite'}}/>
          {t('emergencyMode')}
        </div>
        <div style={{fontSize:'1.4rem',fontWeight:800,letterSpacing:'-0.02em',marginBottom:4}}>{t('whatsHappening')}</div>
        <div style={{fontSize:'0.78rem',color:C.m}}>{t('selectCategory')}</div>
      </div>
      <Scroll pad="14px 20px">
        {ccGPS === 'DEFAULT' && (
          <div style={{background:geocodeErr?'rgba(214,59,47,0.08)':'rgba(232,178,26,0.08)',border:`1px solid ${geocodeErr?'rgba(214,59,47,0.25)':'rgba(232,178,26,0.2)'}`,borderRadius:14,padding:'14px 18px',marginBottom:10}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:geocodeErr?8:0}}>
              <span style={{fontSize:'1.2rem'}}>📍</span>
              <div>
                <div style={{fontSize:'0.82rem',fontWeight:700,color:geocodeErr?C.r:C.y}}>
                  {locStatus==='denied'
                    ? t('gpsNotPermitted')
                    : geocodeErr
                      ? t('locationCouldNotResolve')
                      : t('detectingLocation')}
                </div>
                <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.35)',marginTop:2}}>
                  {geocodeErr
                    ? t('tapToRetry')
                    : t('enableGpsForEmergency')}
                </div>
              </div>
            </div>
            {geocodeErr && (
              <button onClick={resolveCountryIfNeeded}
                style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,padding:'8px 14px',color:C.t,fontSize:'0.78rem',cursor:'pointer',fontFamily:'inherit',width:'100%'}}>
                🔄 {t('retryWord')}
              </button>
            )}
          </div>
        )}
        {/* ── Main emergency button ── */}
        <a href={`tel:${cdGPS.e}`} style={{background:ccGPS==='DEFAULT'?'rgba(214,59,47,0.5)':C.r,borderRadius:20,padding:18,display:'flex',alignItems:'center',gap:14,marginBottom:10,textDecoration:'none'}}>
          <div style={{fontSize:'2rem'}}>🆘</div>
          <div style={{flex:1}}>
            <div style={{fontSize:'0.92rem',fontWeight:800,color:'#fff',marginBottom:3}}>{t('callWord')} {cdGPS.e} — {getCountryName(ccGPS, lang).toUpperCase()}</div>
            <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.75)'}}>{t('generalEmergencyNumber')}</div>
          </div>
          <div style={{color:'#fff',fontSize:'1.2rem'}}>→</div>
        </a>
        {/* ── Individual service call buttons ── */}
        {!cdGPS.noData && (() => {
          const svcBtn = (href, icon, label, num, providerName) => num ? (
            <a key={href} href={`tel:${num.replace(/\s/g,'')}`}
               style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:'12px 16px',display:'flex',alignItems:'center',gap:12,marginBottom:6,textDecoration:'none',color:C.t}}>
              <span style={{fontSize:'1.3rem',flexShrink:0,width:28,textAlign:'center'}}>{icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:'0.8rem',fontWeight:600}}>{label}</div>
                {providerName && <div style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.45)',marginTop:1,fontStyle:'italic'}}>{providerName}</div>}
                <div style={{fontSize:'0.72rem',color:C.m,marginTop:providerName?0:1}}>{num}</div>
              </div>
              <div style={{fontSize:'0.9rem',color:'rgba(255,255,255,0.35)'}}>→</div>
            </a>
          ) : null;
          return (<>
            {svcBtn('amb',  '🚑', t('ambulance'),            cdGPS.amb)}
            {svcBtn('fire', '🚒', t('fireDepartment'),        cdGPS.fire)}
            {svcBtn('pol',  '👮', t('policeLabel'),            cdGPS.police)}
            {svcBtn('doc',  '👨‍⚕️', t('medicalAssistance'),  cdGPS.doc)}
            {cdGPS.rs?.num  && svcBtn('rs',  '🚗', cdGPS.rs.n,   cdGPS.rs.num)}
            {cdGPS.ph?.num  && svcBtn('ph',  '🐾', t('veterinaryEmergency'), cdGPS.ph.num, cdGPS.ph.n)}
          </>);
        })()}
        {cdGPS.noData && (
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:'12px 14px',marginBottom:6,fontSize:'0.72rem',color:'rgba(255,255,255,0.45)'}}>
            📍 <strong style={{color:C.t}}>{cdGPS.name}</strong> — {t('localDataUnavailable')}
          </div>
        )}
        {Object.entries(EMRG).map(([key,ec],idx)=>{
          const titles=getEmrgT(key,lang);
          return (
            <div key={key} onClick={()=>{setEmrgKey(key);goto('emrg-detail');}} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',marginBottom:8,animation:`fadeIn ${.25+idx*.06}s ease`}}>
              <span style={{fontSize:'1.4rem',flexShrink:0}}>{ec.ic}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:'0.88rem',fontWeight:700,marginBottom:3}}>{titles[0]}</div>
                <div style={{fontSize:'0.7rem',color:C.m}}>{titles[1]}</div>
              </div>
              <span style={{padding:'4px 10px',borderRadius:100,fontSize:'0.62rem',fontWeight:700,background:ec.badge==='URGENT'?'rgba(214,59,47,0.2)':'rgba(232,178,26,0.2)',color:ec.badge==='URGENT'?C.r:C.y,flexShrink:0}}>{ec.badge==='URGENT'?t('badgeUrgent'):t('badgeAsap')}</span>
            </div>
          );
        })}
      </Scroll>
      <NavBar screen={screen} t={t} goto={goto}/>
      <style>{CSS}</style>
    </Screen>
  );

  // ── EMRG DETAIL ──────────────────────────────────────────────────────────────
  if (screen === 'emrg-detail' && emrgKey) {
    const ec=EMRG[emrgKey], titles=getEmrgT(emrgKey,lang), steps=getEmrgS(emrgKey,lang);
    const CallBtn=({icon,label,num,type='p'})=>(
      <a href={`tel:${num}`} style={{display:'flex',alignItems:'center',gap:12,borderRadius:16,padding:14,marginBottom:8,textDecoration:'none',background:type==='p'?C.r:type==='s'?'rgba(232,178,26,0.1)':'rgba(26,95,232,0.1)'}}>
        <span style={{fontSize:'1.4rem',flexShrink:0}}>{icon}</span>
        <div style={{flex:1}}><div style={{fontSize:'0.86rem',fontWeight:700,color:type==='p'?'#fff':type==='s'?C.y:C.bl}}>{label}</div><div style={{fontSize:'0.67rem',color:type==='p'?'rgba(255,255,255,0.7)':C.m}}>{t('tapToCall')}</div></div>
        <div style={{fontWeight:800,color:type==='p'?'#fff':type==='s'?C.y:C.bl,fontSize:'1rem',flexShrink:0}}>{num}</div>
      </a>
    );
    const MapBtn=({icon,label,query})=>(
      <button onClick={()=>window.open(mu(query), '_blank', 'noopener,noreferrer')} style={{display:'flex',alignItems:'center',gap:12,borderRadius:16,padding:14,marginBottom:8,border:'1px solid rgba(232,178,26,0.2)',width:'100%',background:'rgba(232,178,26,0.08)',cursor:'pointer',textAlign:'left',fontFamily:'inherit'}}>
        <span style={{fontSize:'1.4rem',flexShrink:0}}>{icon}</span>
        <div style={{flex:1}}><div style={{fontSize:'0.86rem',fontWeight:700,color:C.y}}>{label}</div><div style={{fontSize:'0.67rem',color:C.m}}>{t('openMapNear')}</div></div>
        <div style={{color:C.y,fontSize:'1rem'}}>→</div>
      </button>
    );
    return (
      <Screen bg="#060000">
        {showLP && <LangPicker lang={lang} setLang={lc=>{setLang(lc);setShowLP(false);aiReset();setPResults(null);setPInput('');setVInput('');}} setShowLP={setShowLP} LANGS={LANGS} t={t}/>}
        <div style={{padding:'52px 20px 14px',borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
          <BackBtn onPress={()=>goto('emergency')}/>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:'2.2rem'}}>{ec.ic}</span>
            <div><div style={{fontSize:'1.2rem',fontWeight:800}}>{titles[0]}</div><div style={{fontSize:'0.78rem',color:C.m}}>{titles[1]}</div></div>
          </div>
        </div>
        <Scroll pad="14px 20px">
          <div style={{background:'rgba(214,59,47,0.06)',border:'1px solid rgba(214,59,47,0.2)',borderRadius:14,padding:14,marginBottom:12}}>
            <div style={{fontSize:'0.62rem',fontWeight:700,color:C.r,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>{t('callNow')}</div>
            {ec.call==='roadside'&&<><CallBtn icon="🚗" label={`${cdGPS.rs?.n}: ${cdGPS.rs?.num}`} num={cdGPS.rs?.num||'112'} type="s"/><CallBtn icon="🆘" label={`${t('emergencyCallLabel')}: ${cdGPS.e}`} num={cdGPS.e}/><MapBtn icon="🗺️" label={t('nearestGarage')} query="car garage mechanic near me"/></>}
            {ec.call==='vet'&&<>{cdGPS.ph?.num&&<CallBtn icon="🐾" label={`${t('veterinaryEmergency')}${cdGPS.ph.n ? ` — ${cdGPS.ph.n}` : ''}`} num={cdGPS.ph.num} type="s"/>}{cdGPS.pa?.num&&cdGPS.pa.num.length>3&&<CallBtn icon="🚑" label={`${cdGPS.pa.n}: ${cdGPS.pa.num}`} num={cdGPS.pa.num} type="i"/>}<MapBtn icon="🗺️" label={t('emergencyVet')} query="emergency vet open now 24h"/><MapBtn icon="🏥" label={t('animalClinicNear')} query="animal clinic veterinarian near me"/></>}
            {ec.call==='fire'&&<><CallBtn icon="🚒" label={`${t('fireCallLabel')}: ${cdGPS.fire}`} num={cdGPS.fire}/><CallBtn icon="🆘" label={`${t('emergencyCallLabel')}: ${cdGPS.e}`} num={cdGPS.e}/></>}
            {ec.call==='plumber'&&<><CallBtn icon="🆘" label={`${t('emergencyCallLabel')}: ${cdGPS.e}`} num={cdGPS.e}/><MapBtn icon="🔧" label={t('emergencyPlumber')} query={getEmergencySearchQuery('plumber', ccGPS)}/></>}
            {ec.call==='power'&&<><CallBtn icon="🆘" label={`${t('emergencyCallLabel')}: ${cdGPS.e}`} num={cdGPS.e}/><MapBtn icon="⚡" label={t('electricityProvider')} query={cc==='DE'?'Stadtwerke Strom Störung Netzbetreiber Stromausfall':cc==='AT'?'Stromnetz Störung Stadtwerke':cc==='CH'?'Stromnetzbetreiber Störung':cc==='FR'?'panne électrique signaler fournisseur':cc==='GB'?'power cut report network operator':cc==='US'?'power outage report electric utility':'electricity power outage report'}/></>}
            {ec.call==='emergency'&&<CallBtn icon="🆘" label={`${t('emergencyCallLabel')}: ${cdGPS.e}`} num={cdGPS.e}/>}
          </div>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:14,marginBottom:12}}>
            <div style={{fontSize:'0.62rem',fontWeight:700,color:C.o,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>{t('immediateSteps')}</div>
            {steps.map((step,i)=>(
              <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:10}}>
                <div style={{width:26,height:26,background:C.o,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',fontWeight:800,color:'#fff',flexShrink:0}}>{i+1}</div>
                <div style={{fontSize:'0.84rem',lineHeight:1.6,color:'rgba(240,237,232,0.88)',flex:1,paddingTop:2}}>{step}</div>
              </div>
            ))}
          </div>
          <div style={{background:'rgba(232,82,26,0.06)',border:'1px solid rgba(232,82,26,0.2)',borderRadius:14,padding:14}}>
            <div style={{fontSize:'0.62rem',fontWeight:700,color:C.o,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>📍 {t('emergencyNumbers')} — {cdGPS.name}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[['🆘','Emergency',cdGPS.e],['🚒','Fire',cdGPS.fire],['👮','Police',cdGPS.police],['🚑','Ambulance',cdGPS.amb]].map(([ic,lb,nm])=>(
                <a key={lb} href={`tel:${nm}`} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:10,textAlign:'center',display:'block',textDecoration:'none'}}>
                  <div style={{fontSize:'1.2rem',marginBottom:3}}>{ic}</div>
                  <div style={{fontSize:'0.62rem',color:C.m,marginBottom:2}}>{lb}</div>
                  <div style={{fontSize:'0.9rem',fontWeight:800,color:C.r}}>{nm}</div>
                </a>
              ))}
            </div>
          </div>
          {/* Affiliate disclosure — shown only when shop links are visible */}
          <div style={{textAlign:'center',padding:'12px 16px 4px',fontSize:'0.65rem',color:'rgba(255,255,255,0.2)',lineHeight:1.5}}>
            As an Amazon Associate, FixIt may earn from qualifying purchases.
          </div>
        </Scroll>
        <NavBar screen={screen} t={t} goto={goto}/>
        <style>{CSS}</style>
      </Screen>
    );
  }

  // ── NEARBY ───────────────────────────────────────────────────────────────────
  if (screen === 'nearby') {
    // Hard render guard — defence in depth after goto() gate and useEffect gate.
    // If a user is not authenticated or not Pro, redirect to home immediately.
    if (!user) {
      setAuthScreen('login');
      setScreen('home');
      return null;
    }
    if (!isPro && !freeRepairActive) {
      if (authProfile?.free_trial_completed_at) { setFreeRepairDone(true); } else { setPaywallSource('nearby'); setFreeLimitHit(true); }
      setScreen('home'); return null;
    }
    const catLabels={garage:t('catGarage'),parts:t('catParts'),tyres:t('catTyres'),petrol:t('catPetrol'),hardware:t('catHardware'),vet:t('catVet'),it:t('catIT'),moto:t('motorcycle')};
    // Category-specific Google Maps search terms (correct service type, not product)
    // catMapsQ: short, intent-friendly local service search terms per language
    const _isDE = lang === 'de', _isTR = lang === 'tr',
          _isHR = lang === 'hr' || lang === 'sr',
          _isMK = lang === 'mk', _isFR = lang === 'fr',
          _isES = lang === 'es', _isIT = lang === 'it';
    const catMapsQ={
      garage:   _isDE?'Autowerkstatt in der Nähe':_isTR?'Araba tamircisi yakınımda':_isHR?'Auto servis u blizini':_isMK?'Автосервис во близина':_isFR?'Garage automobile près de moi':_isES?'Taller mecánico cercano':_isIT?'Officina auto vicino':'car repair near me',
      parts:    _isDE?'Autoteile in der Nähe':_isTR?'Oto yedek parça yakınımda':_isHR?'Auto dijelovi u blizini':_isMK?'Автоделови во близина':'auto parts store near me',
      tyres:    _isDE?'Reifenservice in der Nähe':_isTR?'Lastik servisi yakınımda':_isHR?'Servis za gume u blizini':_isMK?'Вулканизер во близина':'tyre service near me',
      petrol:   _isDE?'Tankstelle in der Nähe':_isTR?'Benzin istasyonu yakınımda':_isHR?'Benzinska stanica u blizini':_isMK?'Бензинска пумпа во близина':'petrol station near me',
      hardware: _isDE?'Baumarkt in der Nähe':_isTR?'Hırdavatçı yakınımda':_isHR?'Željezarija u blizini':_isMK?'Железарија и градежни материјали во близина':'hardware store near me',
      vet:      _isDE?'Tierarzt in der Nähe':_isTR?'Veteriner yakınımda':_isHR?'Veterinar u blizini':_isMK?'Ветеринарна станица во близина':'veterinarian near me',
      it:       _isDE?'Computer Reparatur in der Nähe':_isTR?'Bilgisayar tamiri yakınımda':_isHR?'Servis računala u blizini':_isMK?'Компјутерски сервис во близина':'computer repair near me',
      moto:     _isDE?'Motorradwerkstatt in der Nähe':_isTR?'Motosiklet servisi yakınımda':_isHR?'Servis motocikla u blizini':_isMK?'Сервис за мотор во близина':_isFR?'Garage moto près de moi':_isES?'Taller motos cerca de mí':_isIT?'Officina moto vicino':'motorcycle repair near me',
    };
    return (
      <Screen>
        {showLP && <LangPicker lang={lang} setLang={lc=>{setLang(lc);setShowLP(false);aiReset();setPResults(null);setPInput('');setVInput('');}} setShowLP={setShowLP} LANGS={LANGS} t={t}/>}
        <div style={{padding:'52px 20px 12px',borderBottom:`1px solid ${C.b}`,flexShrink:0}}>
          <BackBtn/>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
            <div style={{fontSize:'1.2rem',fontWeight:800,flex:1}}>{t('findNearby')}</div>
            <button onClick={()=>{if(lat){setNearbyForce(true);setNearbyBump(b=>b+1);}else goto('loc-ask');}} style={{background:C.o,border:'none',borderRadius:100,padding:'8px 16px',color:'#fff',fontSize:'0.75rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{t('refresh')}</button>
          </div>
          <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:2}}>
            {Object.keys(MAP_CATS).map(k=>(
              <button key={k} onClick={()=>{setMapCat(k);setNearbyBump(b=>b+1);}} style={{padding:'7px 14px',borderRadius:100,fontSize:'0.72rem',fontWeight:600,whiteSpace:'nowrap',cursor:'pointer',border:k===mapCat?'none':`1px solid ${C.b}`,background:k===mapCat?C.o:C.c,color:k===mapCat?'#fff':C.m,flexShrink:0,fontFamily:'inherit'}}>
                {MAP_CATS[k].icon} {catLabels[k]||k}
              </button>
            ))}
          </div>
        </div>
        {/* Skeleton map while loading, real schematic when loaded */}
        <div style={{height:155,background:'#0D1420',position:'relative',overflow:'hidden',flexShrink:0}}>
          {bizLoading ? (
            <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,#0D1420 25%,#1a2030 50%,#0D1420 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite'}}/>
          ) : (
            <>
              <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',backgroundSize:'28px 28px'}}/>
              <div style={{position:'absolute',top:'42%',left:0,right:0,height:6,background:'rgba(255,255,255,0.06)',borderRadius:3}}/>
              <div style={{position:'absolute',left:'35%',top:0,bottom:0,width:5,background:'rgba(255,255,255,0.06)'}}/>
              {lat ? <>
                <div style={{position:'absolute',top:'44%',left:'48%',transform:'translate(-50%,-50%)',width:16,height:16,background:C.bl,borderRadius:'50%',border:'3px solid #fff',boxShadow:'0 0 0 6px rgba(26,95,232,0.2)'}}/>
                {bizs.slice(0,3).map((b,i)=>{
                  const pos=[{top:'18%',left:'28%'},{top:'25%',left:'65%'},{top:'62%',left:'22%'}][i];
                  const clr=[C.g,C.bl,C.o][i]; const bg2=['#1A3A2A','#1A2A4A','#3A1800'][i];
                  return <div key={i} style={{position:'absolute',...pos,display:'flex',flexDirection:'column',alignItems:'center',transform:'translateX(-50%)'}}>
                    <div style={{background:bg2,color:clr,padding:'4px 10px',borderRadius:100,fontSize:'0.62rem',fontWeight:800,whiteSpace:'nowrap',marginBottom:3}}>{i===0?'⭐ ':''}{b.dist<1?Math.round(b.dist*1000)+'m':b.dist.toFixed(1)+'km'}</div>
                    <div style={{width:2,height:7,background:clr,borderRadius:2}}/>
                  </div>;
                })}
                <div style={{position:'absolute',bottom:6,right:10,fontSize:'0.55rem',color:'rgba(255,255,255,0.3)'}}>📍 {city||`${lat.toFixed(3)},${lng.toFixed(3)}`} · OSM</div>
              </> : <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(10,9,8,0.8)'}}>
                {locStatus==='denied' ? (
                  <div style={{textAlign:'center',padding:20}}>
                    <div style={{fontSize:'2rem',marginBottom:8}}>📍</div>
                    <div style={{fontSize:'0.82rem',color:C.m,marginBottom:12}}>{lang==='de'?'GPS verweigert. Standort in Einstellungen aktivieren.':lang==='tr'?'GPS reddedildi. Ayarlardan etkinleştirin.':lang==='pl'?'GPS odmówiony. Włącz lokalizację w ustawieniach.':'GPS denied. Enable location in Settings.'}</div>
                    <button onClick={()=>goto('loc-ask')} style={{...s.btn,width:'auto',padding:'8px 16px',fontSize:'0.78rem'}}>How to enable →</button>
                  </div>
                ) : (
                  <button onClick={()=>goto('loc-ask')} style={{...s.btn,width:'auto',padding:'10px 20px'}}>📍 {t('enableLocation')}</button>
                )}
              </div>}
            </>
          )}
        </div>
        <Scroll pad="12px 20px">
          {!lat && locStatus!=='loading' && <div style={{...s.card,background:'rgba(26,95,232,0.06)',borderColor:'rgba(26,95,232,0.2)',textAlign:'center',marginBottom:12}}>
            <div style={{fontSize:'1.5rem',marginBottom:8}}>📍</div>
            <div style={{fontSize:'0.86rem',fontWeight:700,marginBottom:6}}>{t('locationNeeded')}</div>
            <div style={{fontSize:'0.75rem',color:C.m,marginBottom:12}}>{t('locationNeededDesc')}</div>
            {locStatus==='denied' && <div style={{fontSize:'0.72rem',color:C.y,marginBottom:10}}>⚠️ {lang==='de'?'GPS verweigert — Einstellungen → Datenschutz → Standort → FixIt aktivieren.':lang==='tr'?'GPS reddedildi — Ayarlar → Gizlilik → Konum → FixIt':lang==='pl'?'GPS odmówiony — Ustawienia → Prywatność → Lokalizacja → FixIt':'GPS denied — go to Settings → Privacy → Location → enable FixIt.'}</div>}
            <button onClick={()=>goto('loc-ask')} style={{...s.btn,width:'auto',padding:'10px 20px',borderRadius:100}}>{t('enableLocation')}</button>
          </div>}
          {/* ONE status block — loading shows spinner + Maps button; error shows Maps button; never duplicates */}
          {bizLoading && (
            <div style={{textAlign:'center',padding:'24px 20px',color:C.m,display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
              <Spinner size={32}/>
              <div style={{fontSize:'0.78rem'}}>{t('loadingPlaces')}</div>
            </div>
          )}
          {!bizLoading && bizError && (
            <div style={{...s.card,textAlign:'center',padding:'20px 16px'}}>
              <div style={{fontSize:'1.4rem',marginBottom:8}}>{bizError==='empty'?'🔍':'📡'}</div>
              <div style={{fontSize:'0.85rem',fontWeight:700,marginBottom:4}}>
                {bizError==='empty'
                  ? (lang==='de'?`Kein ${catLabels[mapCat]} in der Nähe gefunden`:lang==='tr'?`Yakında ${catLabels[mapCat]} bulunamadı`:lang==='pl'?`Nie znaleziono ${catLabels[mapCat]} w pobliżu`:`No nearby ${catLabels[mapCat]} found`)
                  : (lang==='de'?'Ergebnisse konnten nicht geladen werden':lang==='tr'?'Sonuçlar yüklenemedi':lang==='pl'?'Nie udało się załadować wyników':'Could not load results')}
              </div>
              <div style={{fontSize:'0.72rem',color:C.m,marginBottom:14,lineHeight:1.5}}>
                {lang==='de'?'Google Maps zeigt alle Optionen in deiner Nähe.':
                 lang==='tr'?'Google Maps yakınımdaki tüm seçenekleri gösterir.':
                 lang==='pl'?'Google Maps pokaże wszystkie opcje w pobliżu.':
                 'Google Maps shows all nearby options.'}
              </div>
              <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                {bizError==='error'&&<button onClick={()=>lat&&setNearbyBump(b=>b+1)} style={{...s.btn,...s.btnSec,width:'auto',padding:'10px 16px',fontSize:'0.78rem'}}>{t('retryBtn')||'↻ '+(lang==='de'?'Erneut versuchen':lang==='tr'?'Tekrar dene':lang==='pl'?'Spróbuj ponownie':'Try again')}</button>}
                <button onClick={()=>window.open(mu(`${catMapsQ[mapCat]||catLabels[mapCat]}`), '_blank', 'noopener,noreferrer')}
                  style={{...s.btn,width:'auto',padding:'10px 18px'}}>
                  {t('openGoogleMaps')}
                </button>
              </div>
            </div>
          )}

          {!bizLoading&&!bizError&&bizs.length>0&&<>
            <div style={{fontSize:'0.7rem',fontWeight:700,color:C.m,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>{bizs.length} {t('realResultsFrom')}</div>
            {bizs.map((b,i)=>(
              <div key={i} onClick={()=>b.phone?(window.location=`tel:${b.phone}`):window.open(mu(`${b.name} ${b.addr}`), '_blank', 'noopener,noreferrer')} style={{...s.card,display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer',background:i===0?'rgba(26,158,92,0.04)':C.c,borderColor:i===0?'rgba(26,158,92,0.35)':C.b,animation:`fadeIn ${.3+i*.04}s ease`}}>
                <div style={{width:44,height:44,borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0,background:'rgba(26,158,92,0.1)'}}>{i===0?'🏆':MAP_CATS[mapCat]?.icon||'📍'}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.88rem',fontWeight:700,marginBottom:3,display:'flex',alignItems:'center',gap:6}}><span>{i===0?'🏆 ':''}{b.name}</span>{b.source==='google'&&<span style={{fontSize:'0.52rem',background:'rgba(26,95,232,0.15)',color:'rgba(26,95,232,0.7)',borderRadius:4,padding:'1px 4px',letterSpacing:'0.04em',flexShrink:0}}>G</span>}</div>
                  <div style={{fontSize:'0.7rem',color:C.m,lineHeight:1.5}}>
                    {b.addr}
                    {b.phone&&<><br/><a href={`tel:${b.phone}`} onClick={e=>e.stopPropagation()} style={{color:C.bl}}>📞 {b.phone}</a></>}
                    {b.opening&&<><br/>🕐 {b.opening}</>}
                    {b.website&&<><br/><span onClick={e=>{e.stopPropagation();window.open(b.website.startsWith('http')?b.website:'https://'+b.website, '_blank', 'noopener,noreferrer');}} style={{color:C.bl,cursor:'pointer'}}>🌐 {t('website')}</span></>}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:'0.9rem',fontWeight:800,color:C.g}}>{b.dist<1?Math.round(b.dist*1000)+'m':b.dist.toFixed(1)+'km'}</div>
                  {b.rating&&<div style={{fontSize:'0.62rem',color:'rgba(232,178,26,0.8)',marginTop:2}}>★ {b.rating.toFixed(1)}</div>}
                  {b.phone&&<div style={{fontSize:'0.65rem',fontWeight:700,color:C.bl,marginTop:4}}>📞 {t('call')}</div>}
                </div>
              </div>
            ))}
            <div onClick={()=>window.open(mu(`${catMapsQ[mapCat]||catLabels[mapCat]}`), '_blank', 'noopener,noreferrer')} style={{...s.card,textAlign:'center',cursor:'pointer',marginTop:4,border:`1px solid rgba(26,95,232,0.2)`,background:'rgba(26,95,232,0.04)'}}>
              <div style={{fontSize:'0.88rem',fontWeight:700,marginBottom:3}}>{t('openGoogleMaps')}</div>
              <div style={{fontSize:'0.72rem',color:C.m}}>{t('allResultsMap')}</div>
            </div>
          </>}

          {/* Affiliate disclosure — shown only when shop links are visible */}
          <div style={{textAlign:'center',padding:'12px 16px 4px',fontSize:'0.65rem',color:'rgba(255,255,255,0.2)',lineHeight:1.5}}>
            As an Amazon Associate, FixIt may earn from qualifying purchases.
          </div>
        </Scroll>
        <NavBar screen={screen} t={t} goto={goto}/>
        <style>{CSS}</style>
      </Screen>
    );
  }

  // ── PARTS ────────────────────────────────────────────────────────────────────
  if (screen === 'parts') {
    // Hard render guard — same defence-in-depth as nearby.
    if (!user) {
      setAuthScreen('login');
      setScreen('home');
      return null;
    }
    if (!isPro && !freeRepairActive) {
      if (authProfile?.free_trial_completed_at) { setFreeRepairDone(true); } else { setPaywallSource('parts'); setFreeLimitHit(true); }
      setScreen('home'); return null;
    }
    const localStores      = getStores(vType, cc, vType === 'moto' ? (pResults?.vehicle || '') : '');          // category-specific ONLINE stores
    const onlineStores     = getOnlineStores(cc);            // generic Amazon/eBay/Idealo
    const localSearchTerm  = getLocalStoreSearch(vType, getMarketLang(cc)); // local Google Maps term — uses MARKET language, not UI language
    const localMapsUrl     = mu(localSearchTerm);             // Google Maps search URL
    const ptCt = catTerms(vType, lang); // category-aware terms for parts screen
    const isPetParts = vType === 'pets';
    const isBikeParts = vType === 'bike';
    const isRepairParts = !isPetParts && vType !== 'garden';
    const vPH = vType==='car'?t('vehicleInputCar'):vType==='bike'?t('vehicleInputBike'):(vType==='home'||vType==='appliances')?t('vehicleInputHome'):
                vType==='pets'?(t('vehicleInputPet')):t('vehicleInputDefault');
    return (
      <Screen>
        {showLP && <LangPicker lang={lang} setLang={lc=>{setLang(lc);setShowLP(false);aiReset();setPResults(null);setPInput('');setVInput('');}} setShowLP={setShowLP} LANGS={LANGS} t={t}/>}
        <div style={{padding:'52px 20px 14px',borderBottom:`1px solid ${C.b}`,flexShrink:0}}>
          <BackBtn/>
          <div style={{fontSize:'1.35rem',fontWeight:800,letterSpacing:'-0.02em',marginBottom:4}}>
            {(vType==='car'?t('partsTitleCar'):vType==='moto'?t('partsTitleMoto'):vType==='bike'?t('partsTitleBike'):vType==='tech'?t('partsTitleTech'):vType==='appliances'?t('partsTitleAppl'):vType==='garden'?t('partsTitleGarden'):vType==='pets'?t('partsTitlePets'):t('partsTitleHome'))}
          </div>
          <div style={{fontSize:'0.82rem',color:C.m}}>{t('partsSubtitle')}</div>
        </div>
        <Scroll>
          <div style={s.card}>
            <div style={{fontSize:'0.68rem',fontWeight:700,color:C.m,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>{t('searchingFor')}</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
              {[['car',t('catCar')],['moto',t('motorcycle')],['home',t('catHome')],['appliances',t('catAppliance')],['garden',t('catGarden')],['tech',t('catTech')],['bike',t('catBike')],['pets',t('catPets')]].map(([tp,lb])=>(
                <button key={tp} onClick={()=>{setVType(tp);setVInput('');setHsnModel('');}} style={{padding:'7px 14px',borderRadius:100,fontSize:'0.76rem',fontWeight:600,cursor:'pointer',border:'none',background:vType===tp?C.bl:'rgba(255,255,255,0.06)',color:vType===tp?'#fff':C.m,fontFamily:'inherit'}}>{lb}</button>
              ))}
            </div>
            <input value={vInput} onChange={e=>setVInput(e.target.value)} placeholder={vPH} style={{...s.inp,marginBottom:6}}/>
            <div style={{fontSize:'0.65rem',color:C.m,lineHeight:1.5}}>{t('vehicleHint')}</div>
            {/^\d{4}/.test(vInput.trim()) && (
              <div style={{marginTop:10,padding:'10px 12px',background:'rgba(232,178,26,0.08)',border:'1px solid rgba(232,178,26,0.2)',borderRadius:10}}>
                <div style={{fontSize:'0.65rem',color:C.y,fontWeight:700,marginBottom:6}}>
                  {t('addVehicleModel')}
                </div>
                <input
                  value={hsnModel}
                  onChange={e=>setHsnModel(e.target.value)}
                  placeholder={lang==='de'?'z.B. VW Golf 7 2.0 TDI 2017':lang==='tr'?'örn. VW Golf 7 2.0 TDI 2017':lang==='pl'?'np. VW Golf 7 2.0 TDI 2017':'e.g. VW Golf 7 2.0 TDI 2017'}
                  style={{...s.inp,marginBottom:0}}
                />
              </div>
            )}
          </div>
          <div style={s.card}>
            <div style={{fontSize:'0.65rem',color:C.m,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>{isPetParts?(lang==='de'?'Welches Produkt wird benötigt?':'What product is needed?'):isBikeParts?(lang==='de'?'Welches Teil oder Zubehör?':'Which part or accessory?'):t('whatPartNeeded')}</div>
            <input value={pInput} onChange={e=>setPInput(e.target.value)} placeholder={isPetParts?(lang==='de'?'z.B. Flohmittel, Futternapf, Leine':'e.g. flea treatment, food bowl, leash'):
                isBikeParts?(lang==='de'?'z.B. Bremsbelag, Kette, Schlauch':lang==='tr'?'örn. fren balataları, zincir, iç lastik':lang==='pl'?'np. klocki hamulcowe, łańcuch, dętka':'e.g. brake pads, chain, inner tube'):
                t('partInputPlaceholder')} style={{...s.inp,marginBottom:10}}/>
            <button onClick={findParts} style={s.btn}>{isPetParts?(lang==='de'?'Produkte suchen':lang==='tr'?'Ürün bul':lang==='pl'?'Znajdź produkty':'Find Products'):isBikeParts?(lang==='de'?'Fahrradteile suchen':'Find Bike Parts'):t('findPartsBtn')}</button>
          </div>
          <div style={{...s.card,display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <span>{lat?'✅':'📍'}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.72rem',fontWeight:700}}>{lat?`📍 ${city||`${lat.toFixed(3)},${lng.toFixed(3)}`}`:t('locationNeeded')}</div>
              <div style={{fontSize:'0.62rem',color:C.m}}>{lat?`${t('storesFor')} ${cd.name} (GPS)`:t('locationNeededDesc')}</div>
            </div>
            {!lat&&<button onClick={()=>goto('loc-ask')} style={{background:C.o,border:'none',borderRadius:8,padding:'5px 10px',color:'#fff',fontSize:'0.65rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{t('allow')}</button>}
          </div>
          {!pResults&&<div style={{...s.card,textAlign:'center',color:C.m}}>
            <div style={{fontSize:'2rem',marginBottom:10}}>🔩</div>
            <div style={{fontSize:'0.86rem',fontWeight:700,marginBottom:5}}>{isPetParts?(lang==='de'?'Produkt eingeben':lang==='tr'?'Ürün gir':lang==='pl'?'Wpisz produkt':'Enter product'):t('typePartFirst')}</div>
            <div style={{fontSize:'0.7rem',lineHeight:1.5,color:C.g}}>📍 {localSearchTerm} · {lang==='de'?'Amazon · eBay · Idealo':'Amazon · eBay'}</div>
          </div>}
          {pResults&&<>
            {pResults.fromDiagnosis && aiResult?.partsNeeded?.length > 1 ? (
              <div style={{marginBottom:10}}>
                <div style={{fontSize:'0.7rem',fontWeight:700,color:C.m,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>
                  {t('partsFromDiagnosis')}
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {aiResult.partsNeeded.map((part,pi)=>(
                    <span key={pi} onClick={()=>{
                        const cq = cleanProductSearchQuery(part,'',pResults.category||vType,'','');
                        // Prepend vehicle if it is not already in the cleaned query
                        const vc = pResults.vehicleCtx;
                        const vcStr = vc ? [vc.make, vc.model, vc.engine].filter(Boolean).join(' ') : '';
                        const vehicleTokens = [vc?.make, (vc?.model||'').split(' ')[0]].filter(s => s && s.length > 2);
                        const alreadyHasVehicle = !vcStr || vehicleTokens.some(t => cq.toUpperCase().includes(t.toUpperCase()));
                        const finalQ = alreadyHasVehicle ? cq : `${vcStr} ${cq}`;
                        setPInput(cq);
                        setPResults({...pResults, q:finalQ, searchQ:finalQ});
                      }}
                      style={{padding:'6px 12px',borderRadius:100,fontSize:'0.75rem',fontWeight:600,cursor:'pointer',margin:2,
                        background:pResults.q===cleanProductSearchQuery(part,'',pResults.category||vType,'','')?C.o:'rgba(232,82,26,0.12)',
                        color:pResults.q===cleanProductSearchQuery(part,'',pResults.category||vType,'','')?'#fff':C.o,
                        border:`1px solid ${pResults.q===cleanProductSearchQuery(part,'',pResults.category||vType,'','')?C.o:'rgba(232,82,26,0.2)'}`}}>
                      {(()=>{
                          const cq = cleanProductSearchQuery(part,'',pResults.category||vType,'','');
                          const vc = pResults.vehicleCtx;
                          const vcStr = vc ? [vc.make, vc.model, vc.engine].filter(Boolean).join(' ') : '';
                          if (!vcStr) return cq || part;
                          const vcTokens = [vc?.make, (vc?.model||'').split(' ')[0]].filter(s => s && s.length > 2);
                          const alreadyHas = !vcStr || vcTokens.some(t => cq.toUpperCase().includes(t.toUpperCase()));
                          return alreadyHas ? (cq || part) : `${vcStr} ${cq || part}`;
                        })()}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{fontSize:'0.7rem',fontWeight:700,color:C.m,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>
                {t('resultsFor')}: "<strong style={{color:C.t}}>{pResults.q}</strong>"{pResults.vehicle?` · ${t('vehicle')}: ${pResults.vehicle}`:''}
              </div>
            )}
            {pResults.vehicle&&<div style={{...s.card,background:'rgba(26,95,232,0.06)',borderColor:'rgba(26,95,232,0.2)',marginBottom:10}}>
              <div style={{fontSize:'0.65rem',fontWeight:700,color:C.bl,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6}}>
                {catRecognitionLabel(vType, lang)}
                {pResults.isHSN && cc==='DE' && ' — HSN/TSN'}
              </div>
              <div style={{fontSize:'0.78rem',color:C.t,lineHeight:1.6,marginBottom:6}}>
                {pResults.isHSN
                  ? (pResults.hsnModel
                    ? `${t('searchWord')}: "${pResults.hsnModel}" — ${t('searchWord')}: "${pResults.searchQ}"`
                    : t('hsnDetected'))
                  : `${t('searchWord')}: "${pResults.searchQ}"`}
              </div>
              {pResults.isHSN && !pResults.hsnModel && <div style={{fontSize:'0.7rem',color:C.m}}>
                {t('tipAddModel')}
              </div>}
            </div>}
            {/* VIN compatibility warning — shown when vehicle was auto-detected */}
            {pResults.vehicleCtx && pResults.fromDiagnosis && (
              <div style={{display:'flex',alignItems:'flex-start',gap:8,
                background:'rgba(251,191,36,0.06)',border:'1px solid rgba(251,191,36,0.2)',
                borderRadius:10,padding:'10px 14px',marginBottom:10}}>
                <span style={{fontSize:'1rem',flexShrink:0}}>⚠️</span>
                <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.55)',lineHeight:1.6}}>
                  {lang==='de'
                    ? `Suchvorschläge für ${[pResults.vehicleCtx.make, pResults.vehicleCtx.model, pResults.vehicleCtx.engine].filter(Boolean).join(' ')}. Bitte vor dem Kauf über Fahrgestellnummer, vorhandenes Teile-Etikett oder Fahrzeughandbuch prüfen.`
                    : lang==='tr'
                    ? `${[pResults.vehicleCtx.make, pResults.vehicleCtx.model, pResults.vehicleCtx.engine].filter(Boolean).join(' ')} için arama önerileri. Satın almadan önce şasi numarası veya mevcut parça etiketi ile doğrulayın.`
                    : lang==='pl'
                    ? `Sugestie wyszukiwania dla ${[pResults.vehicleCtx.make, pResults.vehicleCtx.model, pResults.vehicleCtx.engine].filter(Boolean).join(' ')}. Przed zakupem sprawdź numer VIN, etykietę istniejącej części lub podręcznik pojazdu.`
                    : `Search suggestions for ${[pResults.vehicleCtx.make, pResults.vehicleCtx.model, pResults.vehicleCtx.engine].filter(Boolean).join(' ')}. Please verify compatibility via VIN, existing part label, or vehicle manual before buying.`}
                </div>
              </div>
            )}
            {/* LOKALE GESCHÄFTE — real nearby stores via Google Maps, NOT online shops */}
            <div style={{...s.card,background:'rgba(26,158,92,0.05)',borderColor:'rgba(26,158,92,0.2)',marginBottom:10}}>
              <div style={{fontSize:'0.62rem',fontWeight:700,color:C.g,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>
                📍 {t('localStoresNearby')} {lat?'(GPS)':''}
              </div>
              {/* Single Google Maps button — opens real nearby local stores for this category */}
              <div onClick={()=>window.open(localMapsUrl, '_blank', 'noopener,noreferrer')}
                style={{background:'rgba(26,158,92,0.12)',border:'1px solid rgba(26,158,92,0.35)',borderRadius:12,padding:'12px 14px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',marginBottom:8}}>
                <div style={{fontSize:'1.4rem'}}>🗺️</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.86rem',fontWeight:700,color:C.g}}>
                    {t(vType==='car'?'localStoreCar':vType==='moto'?'localStoreMoto':vType==='bike'?'localStoreBike':vType==='appliances'?'localStoreAppl':vType==='tech'?'localStoreTech':vType==='garden'?'localStoreGarden':vType==='pets'?'localStorePets':'localStoreHome')}
                  </div>
                  <div style={{fontSize:'0.65rem',color:C.m}}>
                    {lat ? t('gpsActiveNear') : t('openGoogleMapsSearch')}
                  </div>
                </div>
                <div style={{color:C.g,fontWeight:700}}>→</div>
              </div>
              {/* product-name Maps search removed */}
            </div>
            {/* ONLINE-SHOPS — category-specific + generic */}
            <div style={s.card}>
              <div style={{fontSize:'0.62rem',fontWeight:700,color:C.m,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>
                🛒 {t('onlineShops')}
              </div>
              {/* Category-specific online stores (Autodoc for car, MediaMarkt for tech, etc.) */}
              {localStores.map((st,i)=>(
                <div key={`cat-${i}`} onClick={()=>openStore(st, pResults.searchQ)} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',marginBottom:7}}>
                  <div style={{flex:1}}><div style={{fontSize:'0.86rem',fontWeight:700,display:'flex',alignItems:'center',gap:8}}>{st.n}{st.badge&&<span style={{background:C.o,color:'#fff',fontSize:'0.5rem',padding:'2px 7px',borderRadius:100,fontWeight:700}}>{st.badge}</span>}</div></div>
                  <div style={{color:C.m}}>→</div>
                </div>
              ))}
              {/* Generic online stores (Amazon, eBay, Idealo) */}
              {onlineStores.map((st,i)=>(
                <div key={`gen-${i}`} onClick={()=>openStore(st, pResults.searchQ)} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',marginBottom:7}}>
                  <div style={{flex:1}}><div style={{fontSize:'0.86rem',fontWeight:700}}>{st.n}</div></div>
                  <div style={{color:C.m}}>→</div>
                </div>
              ))}
            </div>
          </>}
          {/* Affiliate disclosure — shown only when shop links are visible */}
          <div style={{textAlign:'center',padding:'12px 16px 4px',fontSize:'0.65rem',color:'rgba(255,255,255,0.2)',lineHeight:1.5}}>
            As an Amazon Associate, FixIt may earn from qualifying purchases.
          </div>
        </Scroll>
        <NavBar screen={screen} t={t} goto={goto}/>
        <style>{CSS}</style>
      </Screen>
    );
  }

  return null;
}
