export const LANG_TO_CC = {
  de:'DE',fr:'FR',it:'IT',es:'ES',pl:'PL',nl:'NL',pt:'PT',
  sr:'RS',hr:'HR',bs:'BA',sl:'SI',mk:'MK',bg:'BG',sq:'AL',
  ro:'RO',el:'GR',tr:'TR',uk:'UA',cs:'CZ',sv:'SE',da:'DK',
  no:'NO',fi:'FI',en:'GB',ru:'RU',ar:'SA',he:'IL',zh:'CN',
  ja:'JP',ko:'KR',hi:'IN',me:'ME',
};

export const COUNTRIES = {
  DE:{name:"Germany",flag:"🇩🇪",e:"112",fire:"112",police:"110",amb:"112",doc:"116117",
      rs:{n:"ADAC",num:"0800 5 10 11 12"},ph:{n:"Tierärztlicher Notdienst",num:"011612"},pa:{n:"Tierrettung",num:""}},
  AT:{name:"Austria",flag:"🇦🇹",e:"112",fire:"122",police:"133",amb:"144",doc:"141",
      rs:{n:"ÖAMTC",num:"120"},ph:{n:"Tierarzt Notdienst",num:""},pa:{n:"Wiener Tierrettung",num:"699 1780 3808"}},
  CH:{name:"Switzerland",flag:"🇨🇭",e:"112",fire:"118",police:"117",amb:"144",doc:"0900 57 67 47",
      rs:{n:"TCS",num:"0800 140 140"},ph:{n:"Vet Notfall",num:""},pa:{n:"Tierrettung ZH",num:"044 261 41 41"}},
  GB:{name:"UK",flag:"🇬🇧",e:"999",fire:"999",police:"999",amb:"999",doc:"111",
      rs:{n:"AA/RAC",num:"0800 887 766"},ph:{n:"RSPCA 24hr",num:"0300 1234 999"},pa:{n:"PDSA",num:"0800 731 2502"}},
  FR:{name:"France",flag:"🇫🇷",e:"112",fire:"18",police:"17",amb:"15",doc:"116117",
      rs:{n:"AXA Assistance",num:"01 55 92 24 24"},ph:{n:"SPA",num:"01 45 00 25 25"},pa:{n:"Vet Urgence",num:""}},
  ES:{name:"Spain",flag:"🇪🇸",e:"112",fire:"080",police:"091",amb:"061",doc:"",
      rs:{n:"RACE",num:"900 200 093"},ph:{n:"SEPRONA",num:"062"},pa:{n:"Vet Urgencias",num:""}},
  IT:{name:"Italy",flag:"🇮🇹",e:"112",fire:"115",police:"113",amb:"118",doc:"",
      rs:{n:"ACI",num:"803 116"},ph:{n:"LAV",num:"06 4461325"},pa:{n:"Vet Urgenza",num:""}},
  RS:{name:"Serbia",flag:"🇷🇸",e:"112",fire:"193",police:"192",amb:"194",doc:"",
      rs:{n:"AMSS",num:"1987"},ph:{n:"Vet Stanica Beograd",num:"011 2768 258"},pa:{n:"Sklonište Beograd",num:"011 3412 690"}},
  HR:{name:"Croatia",flag:"🇭🇷",e:"112",fire:"193",police:"192",amb:"194",doc:"",
      rs:{n:"HAK",num:"1987"},ph:{n:"Vet Zagreb",num:"01 4444 000"},pa:{n:"Sklonište Zagreb",num:"01 2401 818"}},
  MK:{name:"North Macedonia",flag:"🇲🇰",e:"112",fire:"193",police:"192",amb:"194",doc:"",
      rs:{n:"AMSM",num:"196"},ph:{n:"Vet Klinika Skopje",num:"02 3131 100"},pa:{n:"Azil Skopje",num:""}},
  TR:{name:"Turkey",flag:"🇹🇷",e:"112",fire:"110",police:"155",amb:"112",doc:"182",
      rs:{n:"Türkiye Sigorta",num:"444 8 460"},ph:{n:"Veteriner Acil",num:""},pa:{n:"Hayvan Barınağı",num:""}},
  PL:{name:"Poland",flag:"🇵🇱",e:"112",fire:"998",police:"997",amb:"999",doc:"",
      rs:{n:"PZM",num:"9637"},ph:{n:"TOZ",num:"22 628 21 36"},pa:{n:"Schronisko",num:""}},
  US:{name:"USA",flag:"🇺🇸",e:"911",fire:"911",police:"911",amb:"911",doc:"",
      rs:{n:"AAA",num:"1-800-222-4357"},ph:{n:"ASPCA",num:"888-426-4435"},pa:{n:"Animal Control",num:"311"}},
  AU:{name:"Australia",flag:"🇦🇺",e:"000",fire:"000",police:"000",amb:"000",doc:"",
      rs:{n:"NRMA",num:"13 11 11"},ph:{n:"RSPCA",num:"1300 278 3589"},pa:{n:"Animal Emergency",num:"1300 919 016"}},
  NL:{name:"Netherlands",flag:"🇳🇱",e:"112",fire:"112",police:"112",amb:"112",doc:"",
      rs:{n:"ANWB",num:"088 269 2888"},ph:{n:"Dierenbescherming",num:"0800 1877"},pa:{n:"Dierenambulance",num:""}},
  // ── Global emergency data — added for full international support ────────────
  // European Union: 112 is the pan-EU emergency number in all member states
  GR:{name:"Greece",     flag:"🇬🇷",e:"112",fire:"199",police:"100",amb:"166",doc:"1016",
      rs:{n:"ELPA",      num:"10400"},     ph:{n:"Vet Emergency",num:"210 6010 903"}},
  PT:{name:"Portugal",   flag:"🇵🇹",e:"112",fire:"112",police:"112",amb:"112",doc:"808 24 24 24",
      rs:{n:"ACP",       num:"808 222 111"},ph:{n:"Vet Emergency",num:"112"}},
  BE:{name:"Belgium",    flag:"🇧🇪",e:"112",fire:"100",police:"101",amb:"100",doc:"1733",
      rs:{n:"Touring",   num:"0800 68 800"}, ph:{n:"Vet Emergency",num:"112"}},
  NL:{name:"Netherlands",flag:"🇳🇱",e:"112",fire:"112",police:"112",amb:"112",doc:"0900 8833",
      rs:{n:"ANWB",      num:"088 269 28 88"},ph:{n:"Vet Emergency",num:"0900 1814"}},
  DK:{name:"Denmark",    flag:"🇩🇰",e:"112",fire:"112",police:"112",amb:"112",doc:"1813",
      rs:{n:"Falck",     num:"70 10 20 30"}, ph:{n:"Vet Emergency",num:"112"}},
  SE:{name:"Sweden",     flag:"🇸🇪",e:"112",fire:"112",police:"112",amb:"112",doc:"1177",
      rs:{n:"Assistancekåren",num:"020 912 912"},ph:{n:"Vet Emergency",num:"031 11 22 33"}},
  NO:{name:"Norway",     flag:"🇳🇴",e:"112",fire:"110",police:"112",amb:"113",doc:"116 117",
      rs:{n:"NAF",       num:"08505"},       ph:{n:"Vet Emergency",num:"22 99 38 00"}},
  FI:{name:"Finland",    flag:"🇫🇮",e:"112",fire:"112",police:"112",amb:"112",doc:"116 117",
      rs:{n:"Autoliitto",num:"0200 8080"},   ph:{n:"Vet Emergency",num:"112"}},
  IE:{name:"Ireland",    flag:"🇮🇪",e:"112",fire:"112",police:"112",amb:"112",doc:"1550 400 911",
      rs:{n:"AA Ireland",num:"0818 22 77 28"},ph:{n:"Vet Emergency",num:"112"}},
  CZ:{name:"Czech Rep.",flag:"🇨🇿",e:"112",fire:"150",police:"158",amb:"155",doc:"1214",
      rs:{n:"ÚAMK",      num:"1230"},        ph:{n:"Vet Emergency",num:"112"}},
  SK:{name:"Slovakia",   flag:"🇸🇰",e:"112",fire:"150",police:"158",amb:"155",doc:"",
      rs:{n:"SATC",      num:"18 123"},      ph:{n:"Vet Emergency",num:"112"}},
  HU:{name:"Hungary",    flag:"🇭🇺",e:"112",fire:"105",police:"107",amb:"104",doc:"104",
      rs:{n:"Magyar Autóklub",num:"188"},    ph:{n:"Vet Emergency",num:"112"}},
  RO:{name:"Romania",    flag:"🇷🇴",e:"112",fire:"112",police:"112",amb:"112",doc:"112",
      rs:{n:"ACR",       num:"9271"},        ph:{n:"Vet Emergency",num:"112"}},
  BG:{name:"Bulgaria",   flag:"🇧🇬",e:"112",fire:"160",police:"166",amb:"150",doc:"",
      rs:{n:"UAABB",     num:"0800 120 13"}, ph:{n:"Vet Emergency",num:"112"}},
  LT:{name:"Lithuania",  flag:"🇱🇹",e:"112",fire:"101",police:"102",amb:"103",doc:"",
      rs:{n:"LAMAC",     num:"1888"},        ph:{n:"Vet Emergency",num:"112"}},
  LV:{name:"Latvia",     flag:"🇱🇻",e:"112",fire:"01",police:"02",amb:"03",doc:"",
      rs:{n:"LAMB",      num:"1888"},        ph:{n:"Vet Emergency",num:"112"}},
  EE:{name:"Estonia",    flag:"🇪🇪",e:"112",fire:"112",police:"110",amb:"112",doc:"1220",
      rs:{n:"Autoabi",   num:"1888"},        ph:{n:"Vet Emergency",num:"112"}},
  SI:{name:"Slovenia",   flag:"🇸🇮",e:"112",fire:"112",police:"113",amb:"112",doc:"",
      rs:{n:"AMZS",      num:"1987"},        ph:{n:"Vet Emergency",num:"112"}},
  LU:{name:"Luxembourg", flag:"🇱🇺",e:"112",fire:"112",police:"113",amb:"112",doc:"",
      rs:{n:"ACL",       num:"26000"},       ph:{n:"Vet Emergency",num:"112"}},
  CY:{name:"Cyprus",     flag:"🇨🇾",e:"112",fire:"112",police:"112",amb:"112",doc:"",
      rs:{n:"OELMEK",    num:"22 313 131"},  ph:{n:"Vet Emergency",num:"112"}},
  MT:{name:"Malta",      flag:"🇲🇹",e:"112",fire:"112",police:"112",amb:"112",doc:"51110",
      rs:{n:"Falzon",    num:"2337 4888"},   ph:{n:"Vet Emergency",num:"112"}},
  // Balkans / South-East Europe
  AL:{name:"Albania",    flag:"🇦🇱",e:"112",fire:"18 18",police:"19",amb:"127",doc:"",
      rs:{n:"ACA",       num:"+355 42 233 333"},ph:{n:"Vet Emergency",num:"112"}},
  BA:{name:"Bosnia",     flag:"🇧🇦",e:"112",fire:"123",police:"122",amb:"124",doc:"",
      rs:{n:"BIHAMK",    num:"1282"},        ph:{n:"Vet Emergency",num:"112"}},
  ME:{name:"Montenegro", flag:"🇲🇪",e:"112",fire:"123",police:"122",amb:"124",doc:"",
      rs:{n:"AMSCG",     num:"19807"},       ph:{n:"Vet Emergency",num:"112"}},
  XK:{name:"Kosovo",     flag:"🏳️",e:"112",fire:"193",police:"192",amb:"194",doc:"",
      rs:{n:"Kosovo AA", num:"038 244 244"}, ph:{n:"Vet Emergency",num:"112"}},
  // Nordic/other European
  IS:{name:"Iceland",    flag:"🇮🇸",e:"112",fire:"112",police:"112",amb:"112",doc:"1770",
      rs:{n:"FÍB",       num:"1 800 8888"},  ph:{n:"Vet Emergency",num:"112"}},
  // North America
  CA:{name:"Canada",     flag:"🇨🇦",e:"911",fire:"911",police:"911",amb:"911",doc:"",
      rs:{n:"CAA",       num:"1-800-222-4357"},ph:{n:"Vet Emergency",num:"911"}},
  MX:{name:"Mexico",     flag:"🇲🇽",e:"911",fire:"911",police:"911",amb:"911",doc:"",
      rs:{n:"Angeles Verdes",num:"078"},     ph:{n:"Vet Emergency",num:"911"}},
  // Asia-Pacific
  JP:{name:"Japan",      flag:"🇯🇵",e:"110",fire:"119",police:"110",amb:"119",doc:"",
      rs:{n:"JAF",       num:"0570-00-8139"},ph:{n:"Vet Emergency",num:"119"}},
  CN:{name:"China",      flag:"🇨🇳",e:"110",fire:"119",police:"110",amb:"120",doc:"",
      rs:{n:"CNAC",      num:"400 810 9999"},ph:{n:"Vet Emergency",num:"120"}},
  KR:{name:"South Korea",flag:"🇰🇷",e:"119",fire:"119",police:"112",amb:"119",doc:"",
      rs:{n:"KAMA",      num:"1588-0100"},   ph:{n:"Vet Emergency",num:"119"}},
  IN:{name:"India",      flag:"🇮🇳",e:"112",fire:"101",police:"100",amb:"108",doc:"",
      rs:{n:"WIAA",      num:"1800 300 1212"},ph:{n:"Vet Emergency",num:"112"}},
  // Middle East
  IL:{name:"Israel",     flag:"🇮🇱",e:"100",fire:"102",police:"100",amb:"101",doc:"",
      rs:{n:"Shagrir",   num:"*3456"},       ph:{n:"Vet Emergency",num:"101"}},
  SA:{name:"Saudi Arabia",flag:"🇸🇦",e:"911",fire:"998",police:"999",amb:"997",doc:"",
      rs:{n:"NCM",       num:"920000560"},   ph:{n:"Vet Emergency",num:"997"}},
  AE:{name:"UAE",        flag:"🇦🇪",e:"999",fire:"997",police:"999",amb:"998",doc:"",
      rs:{n:"AA UAE",    num:"800 4900"},    ph:{n:"Vet Emergency",num:"997"}},
  // Africa
  ZA:{name:"South Africa",flag:"🇿🇦",e:"112",fire:"10111",police:"10111",amb:"10177",doc:"",
      rs:{n:"AA South Africa",num:"083 843 22 22"},ph:{n:"Vet Emergency",num:"10177"}},
  // South America
  BR:{name:"Brazil",     flag:"🇧🇷",e:"190",fire:"193",police:"190",amb:"192",doc:"",
      rs:{n:"ABA",       num:"0800 703 0303"},ph:{n:"Vet Emergency",num:"192"}},
  AR:{name:"Argentina",  flag:"🇦🇷",e:"911",fire:"100",police:"101",amb:"107",doc:"",
      rs:{n:"ACA",       num:"0810 888 9888"},ph:{n:"Vet Emergency",num:"107"}},

  DEFAULT:{name:"International",flag:"🌍",e:"112",fire:"112",police:"112",amb:"112",doc:"",
           rs:{n:"Local Roadside",num:"112"},ph:{n:"Local Vet",num:""},pa:{n:"Animal Shelter",num:""}},
};

export const getCountry = cc => {
  if (COUNTRIES[cc]) return COUNTRIES[cc];
  if (!cc || cc === 'DEFAULT') return COUNTRIES.DEFAULT;
  // Country detected by GPS but not yet in our dataset.
  // Return a meaningful object that keeps the real country code visible.
  return {
    name:    cc,                          // show the ISO code (e.g. "GR") until we add data
    flag:    '🌍',
    e:       '112',
    fire:    '112',
    police:  '112',
    amb:     '112',
    doc:     '',
    rs:      { n: 'Local Roadside', num: '112' },
    ph:      { n: 'Vet Emergency',  num: '' },
    noData:  true,                        // Emergency screen checks this for the notice
  };
};

// GPS-first country detection — language is ONLY a fallback when GPS unavailable
export function smartCC(gpsCountry, lang) {
  if (gpsCountry && gpsCountry !== 'DEFAULT') return gpsCountry;
  const g = LANG_TO_CC[lang];
  return (g && COUNTRIES[g]) ? g : 'DEFAULT';
}

export function mapsUrlFor(q, lat, lng, cc, lang) {
  // Always use the ?api=1&query= endpoint — this guarantees a SEARCH RESULTS LIST.
  // The legacy /search/QUERY/@lat,lng,14z path can redirect to a single business
  // page when Google matches the query strongly to one place. The api=1 endpoint
  // always shows the list regardless of query specificity.
  const enc = encodeURIComponent(q);
  const gl  = (cc || 'us').toLowerCase();
  const hl  = lang || 'en';
  if (lat && lng) {
    // Include GPS coordinates as the search center using the ll parameter.
    // The api=1 endpoint does not accept @lat,lng in the path, but the ll
    // parameter correctly centres the search on the user's GPS location.
    return `https://www.google.com/maps/search/?api=1&query=${enc}&ll=${lat},${lng}&gl=${gl}&hl=${hl}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${enc}&gl=${gl}&hl=${hl}`;
}

// ── STORES: GPS-based (language is irrelevant for store selection) ────────────
// All URLs use encodeURIComponent on the search term when called
// 🟢 = confirmed search URL (Google-verified with real product term)
// 🟡 = confirmed category fallback (direct relevant product listing, no homepage)
// Implementation based on final verified matrix (Sep 2026)
const STORES = {
  car: {
    DE:[
      // autodoc.de: "Largest European online car parts", Jun-Jul 2026 confirmed — category fallback (vehicle-selector primary) 🟡
      {n:"AUTODOC 🔧",u:()=>`https://www.autodoc.de/autoteile/`},
      // kfzteile24.de: 3M+ auto parts confirmed — category fallback 🟡
      {n:"KFZTeile24 🔩",u:()=>`https://www.kfzteile24.de/ersatzteile-verschleissteile/`},
      // atp-autoteile.de: ATE, Brembo, TRW confirmed — category fallback 🟡
      {n:"ATP Autoteile 🔩",u:()=>`https://www.atp-autoteile.de/de/`},
      // mister-auto.de: 300,000+ parts confirmed — category fallback 🟡
      {n:"Mister-Auto 🔧",u:()=>`https://www.mister-auto.de/`},
      // bandel-online.de: 200,000 parts, 12,000+ brake sets — category fallback (vehicle-selector) 🟡
      {n:"Bandel 🔩",u:()=>`https://www.bandel-online.de/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    AT:[
      // forstinger.com: Aug 2026 confirmed, car+bike+moto — category fallback 🟡
      {n:"Forstinger 🔧",u:()=>`https://www.forstinger.com/Produkte/AUTO/Autozubehoer/`},
      // autodoc.at: 7.8M products — category fallback (vehicle-selector) 🟡
      {n:"AUTODOC 🔧",u:()=>`https://www.autodoc.at/autoteile/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    CH:[
      // LOCKED — do not change
      {n:"Auto-Doc.ch 🔧",u:()=>`https://www.auto-doc.ch/autoteile/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GB:[
      // eurocarparts.com: "UK's #1 car parts", 250+ stores — category fallback 🟡
      {n:"Euro Car Parts 🔧",u:()=>`https://www.eurocarparts.com/car-parts`,badge:"BEST"},
      // halfords.com: Jul 29 2026 confirmed, also UK #1 bike retailer — category fallback 🟡
      {n:"Halfords 🔴",u:()=>`https://www.halfords.com/motoring/car-parts/`},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FR:[
      // oscaro.com: "1M+ parts, French leader" — category fallback (vehicle-selector) 🟡
      {n:"Oscaro 🔧",u:()=>`https://www.oscaro.com/`},
      // auto-doc.fr: AUTODOC FR domain — category fallback 🟡
      {n:"Auto-Doc.fr 🔧",u:()=>`https://www.auto-doc.fr/autoteile/`},
      {n:"Amazon.fr 📦",u:(q)=>`https://www.amazon.fr/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    IT:[
      // auto-doc.it: AUTODOC IT domain — category fallback 🟡
      {n:"Auto-Doc.it 🔧",u:()=>`https://www.auto-doc.it/autoteile/`},
      // norauto.it: Mobivia Group — category fallback 🟡
      {n:"Norauto 🔧",u:()=>`https://www.norauto.it/e/ricambi-auto.html`},
      {n:"Amazon.it 📦",u:(q)=>`https://www.amazon.it/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    ES:[
      // autodoc.es: 6.7M products — category fallback 🟡
      {n:"AUTODOC 🔧",u:()=>`https://www.autodoc.es/autoteile/`},
      // norauto.es: Mobivia Group — category fallback 🟡
      {n:"Norauto 🔧",u:()=>`https://www.norauto.es/e/recambios-auto.html`},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    PL:[
      // autodoc.pl: confirmed — category fallback 🟡
      {n:"AUTODOC 🔧",u:()=>`https://www.autodoc.pl/autoteile/`},
      {n:"Allegro 🛒",u:(q)=>`https://allegro.pl/listing?string=${encodeURIComponent(q)}`},
    ],
    NL:[
      // bol.com: confirmed search URL 🟢
      {n:"Bol.com 🟠",u:(q)=>`https://www.bol.com/nl/nl/s/?searchtext=${encodeURIComponent(q)}`,badge:"BEST"},
      // autodoc.nl: vehicle-selector — category fallback 🟡
      {n:"AUTODOC 🔧",u:()=>`https://www.autodoc.nl/autoteile/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    BE:[
      // bol.com BE: confirmed search URL 🟢
      {n:"Bol.com 🟠",u:(q)=>`https://www.bol.com/be/nl/s/?searchtext=${encodeURIComponent(q)}`,badge:"BEST"},
      // auto5.be: Norauto Group BE — category fallback 🟡
      {n:"Auto5 🔧",u:()=>`https://www.auto5.be/nl/c/auto-onderdelen.html`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    SE:[
      // biltema.se: Nordic car parts chain — category fallback (vehicle-selector) 🟡
      {n:"Biltema 🔧",u:()=>`https://www.biltema.se/bil---mc/bilreservdelar/bromssystem/`},
      // skruvat.se: Nordic auto parts — category fallback 🟡
      {n:"Skruvat 🔩",u:()=>`https://www.skruvat.se/reservdelar/bromssystem/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    NO:[
      // biltema.no: confirmed category 🟡
      {n:"Biltema 🔧",u:()=>`https://www.biltema.no/bil-og-mc/`},
      // autodoc.no: platform-confirmed — category fallback 🟡
      {n:"AUTODOC 🔧",u:()=>`https://www.autodoc.no/autoteile/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DK:[
      // biltema.dk: 48 DK stores — category fallback 🟡
      {n:"Biltema 🔧",u:()=>`https://www.biltema.dk/bil-og-mc/`},
      // thansen.dk: confirmed brake pads category 🟡
      {n:"thansen 🔩",u:()=>`https://www.thansen.dk/bil/reservedele/bremseklodser/n-237396699`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FI:[
      // motonet.fi: "Autoilevan ihmisen tavaratalo" — category fallback 🟡
      {n:"Motonet 🔧",u:()=>`https://www.motonet.fi/tuoteryhmat/autotarvikkeet/`},
      // autodoc.fi: platform-confirmed — category fallback 🟡
      {n:"AUTODOC 🔧",u:()=>`https://www.autodoc.fi/autoteile/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GR:[
      // skroutz.gr: 39.81M visits/month Jun 2026, all categories 🟢
      {n:"Skroutz 🛒",u:(q)=>`https://www.skroutz.gr/search?keyphrase=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    PT:[
      // norauto.pt: 70,000+ references, Mobivia Group — category fallback 🟡
      {n:"Norauto 🔧",u:()=>`https://www.norauto.pt/e/pecas-auto.html`,badge:"BEST"},
      // auto-doc.pt: AUTODOC PT domain — category fallback 🟡
      {n:"Auto-Doc.pt 🔧",u:()=>`https://www.auto-doc.pt/autoteile/`},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    TR:[
      // trendyol.com: confirmed search URL 🟢
      {n:"Trendyol 🛒",u:(q)=>`https://www.trendyol.com/sr?q=${encodeURIComponent(q)}`,badge:"BEST"},
    ],
    AU:[
      // supercheapauto.com.au: confirmed search URL 🟢
      {n:"Supercheap Auto 🔴",u:(q)=>`https://www.supercheapauto.com.au/search?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // repco.com.au: confirmed search URL 🟢
      {n:"Repco 🔧",u:(q)=>`https://www.repco.com.au/search?text=${encodeURIComponent(q)}`},
    ],
    CA:[
      // canadiantire.ca: Brembo confirmed, Aug 2026 — category fallback 🟡
      {n:"Canadian Tire 🔧",u:()=>`https://www.canadiantire.ca/en/cat/automotive/auto-parts-DC0000011.html`,badge:"BEST"},
      {n:"Amazon.ca 📦",u:(q)=>`https://www.amazon.ca/s?k=${encodeURIComponent(q)}`},
    ],
    US:[
      // AutoZone: searchText capital T confirmed from live Google URL ✅
      {n:"AutoZone 🔴",u:(q)=>`https://www.autozone.com/searchresult?searchText=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"RockAuto 🔩",u:(q)=>`https://www.rockauto.com/en/partsearch/?query=${encodeURIComponent(q)}`},
    ],
    MK:[
      // avtodelovionline.mk: WooCommerce confirmed 🟢
      {n:"AvtodeloviOnline 🔧",u:(q)=>`https://avtodelovionline.mk/?s=${encodeURIComponent(q)}&post_type=product`,badge:"BEST"},
      // avtodelovi-online.mk: WooCommerce confirmed 🟢
      {n:"AvtoDelovi 🔩",u:(q)=>`https://avtodelovi-online.mk/?s=${encodeURIComponent(q)}&post_type=product`},
    ],
    RS:[
      // Gigatron covers auto accessories (bela tehnika, tools) — ananas for general 🟢
      {n:"Ananas.rs 🍍",u:(q)=>`https://www.ananas.rs/pretraga?q=${encodeURIComponent(q)}`},
      // silux.rs: RS auto chain — category fallback 🟡
      {n:"Silux 🔧",u:()=>`https://www.silux.rs/auto-delovi/`},
    ],
    HR:[
      // webshop.tokic.hr: "Largest HR auto parts", 300,000+ parts — category fallback 🟡
      {n:"Tokić 🔧",u:()=>`https://webshop.tokic.hr/t/dodatna-oprema`,badge:"BEST"},
      // autodoc.hr: platform-confirmed — category fallback 🟡
      {n:"AUTODOC 🔧",u:()=>`https://www.autodoc.hr/autoteile/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay 🛒",u:(q)=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
    ],
  },
  tech: {
    DE:[
      // MediaMarkt.de: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.de/de/search.html?query=${encodeURIComponent(q)}`,badge:"BEST"},
      // Saturn.de: SAP Hybris confirmed 🟢
      {n:"Saturn 🔵",u:(q)=>`https://www.saturn.de/de/search.html?query=${encodeURIComponent(q)}`},
      // alternate.de: live page nav confirmed /Notebook slug 🟡
      {n:"Alternate 💻",u:()=>`https://www.alternate.de/Notebook`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    AT:[
      // MediaMarkt.at: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.at/at/search.html?query=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    CH:[
      // LOCKED — do not change
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.ch/de/search.html?query=${encodeURIComponent(q)}`},
      {n:"Digitec 💻",u:(q)=>`https://www.digitec.ch/search?q=${encodeURIComponent(q)}`},
    ],
    GB:[
      // currys.co.uk: SFCC platform, Pixel 11 promo Aug-Sep 2026 — category fallback 🟡
      {n:"Currys 🔵",u:()=>`https://www.currys.co.uk/computing/laptops/laptops`,badge:"BEST"},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FR:[
      // fnac.com: laptops category confirmed Jul 2026 — category fallback 🟡
      {n:"Fnac 🔵",u:()=>`https://www.fnac.com/Ordinateurs-portables/shi48967/w-4`,badge:"BEST"},
      // boulanger.com: Summer soldes 2026 confirmed — category fallback 🟡
      {n:"Boulanger 🟠",u:()=>`https://www.boulanger.com/c/tous-les-ordinateurs-portables`},
      // ldlc.com: Jun 2026 buying guide confirmed — category fallback 🟡
      {n:"LDLC 💻",u:()=>`https://www.ldlc.com/informatique/ordinateur-portable/pc-portable/c4265/`},
      {n:"Amazon.fr 📦",u:(q)=>`https://www.amazon.fr/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    IT:[
      // MediaWorld.it (MediaMarkt IT): SAP Hybris confirmed 🟢
      {n:"MediaWorld 🔴",u:(q)=>`https://www.mediaworld.it/it/search.html?query=${encodeURIComponent(q)}`,badge:"BEST"},
      // unieuro.it: 400+ stores, Fnac Darty Group, Jul 2026 — category fallback 🟡
      {n:"Unieuro 💻",u:()=>`https://www.unieuro.it/online/Informatica/Notebook`},
      {n:"Amazon.it 📦",u:(q)=>`https://www.amazon.it/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    ES:[
      // PcComponentes: confirmed search URL 🟢
      {n:"PcComponentes 💻",u:(q)=>`https://www.pccomponentes.com/buscar/?query=${encodeURIComponent(q)}`,badge:"BEST"},
      // MediaMarkt.es: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.es/es/search.html?query=${encodeURIComponent(q)}`},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    PL:[
      // MediaMarkt.pl: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.pl/pl/search.html?query=${encodeURIComponent(q)}`,badge:"BEST"},
      // x-kom.pl: Aug-Sep 2026 Lenovo promo confirmed — category fallback 🟡
      {n:"x-kom 💻",u:()=>`https://www.x-kom.pl/g-2/c/159-laptopy-notebooki-ultrabooki.html`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    NL:[
      // MediaMarkt.nl: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.nl/nl/search.html?query=${encodeURIComponent(q)}`,badge:"BEST"},
      // coolblue.nl: confirmed search URL 🟢
      {n:"Coolblue 🔵",u:(q)=>`https://www.coolblue.nl/zoeken?query=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    BE:[
      // MediaMarkt.be: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.be/nl/search.html?query=${encodeURIComponent(q)}`,badge:"BEST"},
      // coolblue.be: confirmed search URL 🟢
      {n:"Coolblue 🔵",u:(q)=>`https://www.coolblue.be/zoeken?query=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    SE:[
      // elgiganten.se: SPA category — category fallback 🟡
      {n:"Elgiganten 🔵",u:()=>`https://www.elgiganten.se/datorer-kontor/datorer/laptop`},
      // netonnet.se: confirmed category 🟡
      {n:"NetOnNet 💻",u:()=>`https://www.netonnet.se/art/datorer/laptop/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    NO:[
      // elkjop.no: SPA, Sep 2026 confirmed — category fallback 🟡
      {n:"Elkjøp 🔵",u:()=>`https://www.elkjop.no/pc-datautstyr-og-kontor/pc/barbar-pc`,badge:"BEST"},
      // komplett.no: MacBook M5 2026 confirmed — category fallback 🟡
      {n:"Komplett 💻",u:()=>`https://www.komplett.no/category/22/laptops`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DK:[
      // elgiganten.dk: SPA category — category fallback 🟡
      {n:"Elgiganten 🔵",u:()=>`https://www.elgiganten.dk/datorer-kontor/datorer/laptop`},
      // proshop.dk: confirmed category 🟡
      {n:"Proshop 💻",u:()=>`https://www.proshop.dk/Kategori/Laptop/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FI:[
      // verkkokauppa.com: © 1992-2026 confirmed — category fallback 🟡
      {n:"Verkkokauppa 💻",u:()=>`https://www.verkkokauppa.com/fi/catalog/information-technology/tietotekniikka`,badge:"BEST"},
      // power.fi: confirmed category 🟡
      {n:"Power 🔵",u:()=>`https://www.power.fi/c/4915/tietotekniikka/tietokoneet/kannettavat-tietokoneet/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GR:[
      // skroutz.gr: all categories confirmed 🟢
      {n:"Skroutz 🛒",u:(q)=>`https://www.skroutz.gr/search?keyphrase=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    PT:[
      // worten.pt: PT #1 electronics, 7.9M visits/mo — category fallback 🟡
      {n:"Worten 🔵",u:()=>`https://www.worten.pt/informatica-e-acessorios`,badge:"BEST"},
      // MediaMarkt.pt: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.pt/pt/search.html?query=${encodeURIComponent(q)}`},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    TR:[
      // trendyol.com: confirmed search URL 🟢
      {n:"Trendyol 🛒",u:(q)=>`https://www.trendyol.com/sr?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // mediamarkt.com.tr: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.com.tr/search.html?query=${encodeURIComponent(q)}`},
    ],
    AU:[
      // jbhifi.com.au: Shopify-inferred — category fallback 🟡
      {n:"JB Hi-Fi 🔵",u:()=>`https://www.jbhifi.com.au/collections/computers`,badge:"BEST"},
      {n:"Amazon.com.au 📦",u:(q)=>`https://www.amazon.com.au/s?k=${encodeURIComponent(q)}`},
    ],
    CA:[
      // bestbuy.ca: confirmed search URL 🟢
      {n:"Best Buy 🔵",u:(q)=>`https://www.bestbuy.ca/en-CA/Search/SearchResults.aspx?query=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon.ca 📦",u:(q)=>`https://www.amazon.ca/s?k=${encodeURIComponent(q)}`},
    ],
    US:[
      {n:"Best Buy 🔵",u:(q)=>`https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}`},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    MK:[
      // neptun.mk: MK's largest electronics chain — category fallback 🟡
      {n:"Нептун 🔴",u:()=>`https://www.neptun.mk/KOMPJUTERI.nspx`,badge:"BEST"},
      // anhoch.com: confirmed category 🟡
      {n:"Anhoch 💻",u:()=>`https://anhoch.com/category/3003/prenosni-kompjuteri-laptopi`},
      // tehnomarket.com.mk: confirmed category 🟡
      {n:"Tehnomarket 💻",u:()=>`https://www.tehnomarket.com.mk/category/4003/laptopi`},
    ],
    RS:[
      // gigatron.rs: Feb-Jul 2026 confirmed — category fallback 🟡
      {n:"Gigatron 🔵",u:()=>`https://www.gigatron.rs/laptop-racunari-i-it-oprema`,badge:"BEST"},
      // ananas.rs: confirmed search URL 🟢
      {n:"Ananas.rs 🍍",u:(q)=>`https://www.ananas.rs/pretraga?q=${encodeURIComponent(q)}`},
    ],
    HR:[
      // links.hr: "National leader in PC sales", 15 stores — category fallback 🟡
      {n:"Links 🔵",u:()=>`https://www.links.hr/hr/laptopi-i-oprema-0101`,badge:"BEST"},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay 🛒",u:(q)=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
    ],
  },
  home: {
    DE:[
      // obi.de: path-based search confirmed 🟢
      {n:"OBI 🟡",u:(q)=>`https://www.obi.de/search/${encodeURIComponent(q)}/`,badge:"BEST"},
      // hornbach.de: /s/ confirmed 🟢
      {n:"HORNBACH 🟠",u:(q)=>`https://www.hornbach.de/s/${encodeURIComponent(q)}`},
      // bauhaus.info: /search?q= confirmed from live page "Ähnliche Begriffe" links 🟢
      {n:"Bauhaus 🏗️",u:(q)=>`https://www.bauhaus.info/search?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    AT:[
      // obi.at: /search/rasenm%C3%A4her/ confirmed Jul 2026 🟢
      {n:"OBI 🟡",u:(q)=>`https://www.obi.at/search/${encodeURIComponent(q)}/`,badge:"BEST"},
      // hornbach.at: /s/ confirmed 🟢
      {n:"HORNBACH 🟠",u:(q)=>`https://www.hornbach.at/s/${encodeURIComponent(q)}`},
      // bauhaus.at: same platform as .info, /search?q= confirmed 🟢
      {n:"Bauhaus 🏗️",u:(q)=>`https://www.bauhaus.at/search?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    CH:[
      // LOCKED — do not change
      {n:"Bauhaus 🏗️",u:(q)=>`https://www.bauhaus.ch/de/search?q=${encodeURIComponent(q)}`},
      {n:"HORNBACH 🟠",u:(q)=>`https://www.hornbach.ch/de/s/${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GB:[
      // B&Q diy.com: drills category Sep 2, 2026 confirmed — category fallback 🟡
      {n:"B&Q 🟡",u:()=>`https://www.diy.com/departments/tools-equipment/power-tools/drills/DIY637279.cat`,badge:"BEST"},
      // screwfix.com: drills confirmed, 1,726 stores — category fallback 🟡
      {n:"Screwfix 🔵",u:()=>`https://www.screwfix.com/c/tools/drills/cat830704`},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FR:[
      // leroymerlin.fr: /search?q= confirmed 🟢
      {n:"Leroy Merlin 🟢",u:(q)=>`https://www.leroymerlin.fr/search?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // castorama.fr: drills May-Aug 2026 Bosch promo — category fallback 🟡
      {n:"Castorama 🔵",u:()=>`https://www.castorama.fr/outillage/outillage-electroportatif/perceuse-visseuse-perceuse-a-percussion-et-tournevis-sans-fil/cat_id_3796.cat`},
      {n:"Amazon.fr 📦",u:(q)=>`https://www.amazon.fr/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    IT:[
      // leroymerlin.it: SPA — category fallback 🟡
      {n:"Leroy Merlin 🟢",u:()=>`https://www.leroymerlin.it/prodotti/utensileria/`,badge:"BEST"},
      {n:"Amazon.it 📦",u:(q)=>`https://www.amazon.it/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    ES:[
      // leroymerlin.es: SPA — category fallback 🟡
      {n:"Leroy Merlin 🟢",u:()=>`https://www.leroymerlin.es/productos/herramientas/`,badge:"BEST"},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    PL:[
      // obi.pl: confirmed search URL 🟢
      {n:"OBI 🟡",u:(q)=>`https://www.obi.pl/search/${encodeURIComponent(q)}/`,badge:"BEST"},
      // leroymerlin.pl: /szukaj.html?q= confirmed 🟢
      {n:"Leroy Merlin 🟢",u:(q)=>`https://www.leroymerlin.pl/szukaj.html?q=${encodeURIComponent(q)}`},
      // castorama.pl: Kingfisher PL — category fallback 🟡
      {n:"Castorama 🔵",u:(q)=>`https://www.castorama.pl/wyszukaj?q=${encodeURIComponent(q)}`},
    ],
    NL:[
      // hornbach.nl: /s/ confirmed 🟢
      {n:"HORNBACH 🟠",u:(q)=>`https://www.hornbach.nl/s/${encodeURIComponent(q)}`,badge:"BEST"},
      // gamma.nl: probable search URL 🟡
      {n:"Gamma 🟡",u:(q)=>`https://www.gamma.nl/zoeken?text=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    BE:[
      // brico.be: confirmed tools category 🟡
      {n:"Brico 🔵",u:()=>`https://www.brico.be/nl/gereedschap-werkplaats/to1/`,badge:"BEST"},
      // hubo.be: BE DIY chain — category fallback 🟡
      {n:"Hubo 🔵",u:(q)=>`https://www.hubo.be/nl/zoeken?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    SE:[
      // biltema.se: probable search 🟡
      {n:"Biltema 🏗️",u:(q)=>`https://www.biltema.se/soksida/?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // jula.se: /catalog/ confirmed 52 products 🟡
      {n:"Jula 🔵",u:()=>`https://www.jula.se/catalog/verktyg-och-maskiner/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    NO:[
      // biltema.no: probable search 🟡
      {n:"Biltema 🏗️",u:(q)=>`https://www.biltema.no/soksida/?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // jula.no: Jun 2026 catalog confirmed 🟡
      {n:"Jula 🔵",u:()=>`https://www.jula.no/catalog/verktyg-och-maskiner/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DK:[
      // biltema.dk: probable search 🟡
      {n:"Biltema 🏗️",u:(q)=>`https://www.biltema.dk/sogesiden/?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // silvan.dk: confirmed DK DIY — category fallback 🟡
      {n:"Silvan 🔵",u:()=>`https://www.silvan.dk/elvaerktoj/boremaskiner/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FI:[
      // k-rauta.fi: 787 products Sep 15 2026 confirmed — category fallback 🟡
      {n:"K-Rauta 🏗️",u:()=>`https://www.k-rauta.fi/kategoria/piha/puutarhatyokalut`,badge:"BEST"},
      // motonet.fi: tools section confirmed 🟡
      {n:"Motonet 🔧",u:()=>`https://www.motonet.fi/tuoteryhmat/tyokalut/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GR:[
      // skroutz.gr: all categories confirmed 🟢
      {n:"Skroutz 🛒",u:(q)=>`https://www.skroutz.gr/search?keyphrase=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    PT:[
      // worten.pt: confirmed 🟡
      {n:"Worten 🔵",u:()=>`https://www.worten.pt/bricolage`,badge:"BEST"},
      // leroymerlin.pt: SPA — category fallback 🟡
      {n:"Leroy Merlin 🟢",u:()=>`https://www.leroymerlin.pt/produtos/ferramentas/`},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    TR:[
      // trendyol.com: confirmed 🟢
      {n:"Trendyol 🛒",u:(q)=>`https://www.trendyol.com/sr?q=${encodeURIComponent(q)}`,badge:"BEST"},
    ],
    AU:[
      // bunnings.com.au: confirmed search URL 🟢
      {n:"Bunnings 🟠",u:(q)=>`https://www.bunnings.com.au/search/products?q=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon.com.au 📦",u:(q)=>`https://www.amazon.com.au/s?k=${encodeURIComponent(q)}`},
    ],
    CA:[
      // homedepot.ca: Jul 28 2026 confirmed — category fallback 🟡
      {n:"Home Depot 🟠",u:()=>`https://www.homedepot.ca/en/home/categories/tools.html`,badge:"BEST"},
      // lowes.ca: confirmed search URL 🟡
      {n:"Lowe's 🔵",u:(q)=>`https://www.lowes.ca/search?term=${encodeURIComponent(q)}`},
      {n:"Amazon.ca 📦",u:(q)=>`https://www.amazon.ca/s?k=${encodeURIComponent(q)}`},
    ],
    US:[
      {n:"Home Depot 🟠",u:(q)=>`https://www.homedepot.com/s/${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Lowe's 🔵",u:(q)=>`https://www.lowes.com/search?searchTerm=${encodeURIComponent(q)}`},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    MK:[
      // ananas.mk: confirmed search URL 🟢
      {n:"Анanas.mk 🍍",u:(q)=>`https://www.ananas.mk/pretraga?q=${encodeURIComponent(q)}`,badge:"BEST"},
    ],
    RS:[
      // okov.rs: "20,000 products", DeWalt confirmed — category fallback 🟡
      {n:"Okov 🏗️",u:()=>`https://www.okov.rs/en/alati/elektricni-alat-i-pribor`,badge:"BEST"},
      // leroymerlin.rs: confirmed search URL 🟢
      {n:"Leroy Merlin RS 🟢",u:(q)=>`https://www.leroymerlin.rs/pretraga?q=${encodeURIComponent(q)}`},
      {n:"Ananas.rs 🍍",u:(q)=>`https://www.ananas.rs/pretraga?q=${encodeURIComponent(q)}`},
    ],
    HR:[
      // pevex.hr: Sep 21 2026 Bosch/Einhell/Makita confirmed — category fallback 🟡
      {n:"Pevex 🏗️",u:()=>`https://www.pevex.hr/zeljeznarija/elektricni-rucni-alat`,badge:"BEST"},
      // leroymerlin.hr: confirmed search URL 🟢
      {n:"Leroy Merlin HR 🟢",u:(q)=>`https://www.leroymerlin.hr/pretraga?q=${encodeURIComponent(q)}`},
      {n:"Bauhaus HR 🏗️",u:(q)=>`https://www.bauhaus.hr/search?q=${encodeURIComponent(q)}`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay 🛒",u:(q)=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
    ],
  },
  appliances: {
    DE:[
      // MediaMarkt.de: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.de/de/search.html?query=${encodeURIComponent(q)}`,badge:"BEST"},
      // Saturn.de: Miele/OK Aug 2026 confirmed — category fallback 🟡
      {n:"Saturn 🔵",u:()=>`https://www.saturn.de/de/category/waschmaschinen-1202.html`},
      // otto.de: Samsung review Aug 2026 confirmed — category fallback 🟡
      {n:"Otto 🟠",u:()=>`https://www.otto.de/haushalt/waschmaschinen/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    AT:[
      // MediaMarkt.at: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.at/at/search.html?query=${encodeURIComponent(q)}`,badge:"BEST"},
      // ottoversand.at: confirmed category 🟡
      {n:"Otto 🟠",u:()=>`https://www.ottoversand.at/technik/haushaltstechnik/waschmaschinen/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    CH:[
      // LOCKED — do not change
      {n:"Galaxus 🔵",u:(q)=>`https://www.galaxus.ch/search?query=${encodeURIComponent(q)}`},
      {n:"Digitec 💻",u:(q)=>`https://www.digitec.ch/search?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GB:[
      // currys.co.uk: SFCC platform, washing machines confirmed — category fallback 🟡
      {n:"Currys 🔵",u:()=>`https://www.currys.co.uk/appliances/laundry/washing-machines`,badge:"BEST"},
      // ao.com: Jul 24 2026 "UK's most trusted electrical retailer" — category fallback 🟡
      {n:"AO.com 🟡",u:()=>`https://ao.com/laundry/washing-machines`},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FR:[
      // darty.com: Mar-Apr 2026 confirmed — category fallback 🟡
      {n:"Darty 🔴",u:()=>`https://www.darty.com/nav/achat/gros_electromenager/lavage/`,badge:"BEST"},
      // fnac.com: 1,174 WM references confirmed — category fallback 🟡
      {n:"Fnac 🔵",u:()=>`https://www.fnac.com/Lave-Linge/Equipement-Gros-Electromenager/nsh501239/w-4`},
      // boulanger.com: Summer soldes 2026 confirmed — category fallback 🟡
      {n:"Boulanger 🟠",u:()=>`https://www.boulanger.com/c/lave-linge`},
      {n:"Amazon.fr 📦",u:(q)=>`https://www.amazon.fr/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    IT:[
      // MediaWorld.it: SAP Hybris confirmed 🟢
      {n:"MediaWorld 🔴",u:(q)=>`https://www.mediaworld.it/it/search.html?query=${encodeURIComponent(q)}`,badge:"BEST"},
      // unieuro.it: Black Friday 2026 confirmed — category fallback 🟡
      {n:"Unieuro 💻",u:()=>`https://www.unieuro.it/online/Lavatrici`},
      {n:"Amazon.it 📦",u:(q)=>`https://www.amazon.it/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    ES:[
      // MediaMarkt.es: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.es/es/search.html?query=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    PL:[
      // MediaMarkt.pl: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.pl/pl/search.html?query=${encodeURIComponent(q)}`,badge:"BEST"},
      // euro.com.pl: RTV Euro AGD — category fallback 🟡
      {n:"RTV Euro AGD 🔵",u:()=>`https://www.euro.com.pl/pralki,agd/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    NL:[
      // coolblue.nl: confirmed search URL 🟢
      {n:"Coolblue 🔵",u:(q)=>`https://www.coolblue.nl/zoeken?query=${encodeURIComponent(q)}`,badge:"BEST"},
      // MediaMarkt.nl: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.nl/nl/search.html?query=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    BE:[
      // coolblue.be: confirmed search URL 🟢
      {n:"Coolblue 🔵",u:(q)=>`https://www.coolblue.be/zoeken?query=${encodeURIComponent(q)}`,badge:"BEST"},
      // vandenborre.be: Feb 2026 ASKO WM confirmed — category fallback 🟡
      {n:"Vanden Borre 🟠",u:()=>`https://www.vandenborre.be/wasmachine-droogkast/wasmachine`},
      // MediaMarkt.be: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.be/nl/search.html?query=${encodeURIComponent(q)}`},
    ],
    SE:[
      // elgiganten.se: SPA category — category fallback 🟡
      {n:"Elgiganten 🔵",u:()=>`https://www.elgiganten.se/vitvaror/tvatt-tork/tvattmaskin`,badge:"BEST"},
      // netonnet.se: confirmed category 🟡
      {n:"NetOnNet 💻",u:()=>`https://www.netonnet.se/art/vitvaror/tvattmaskin`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    NO:[
      // elkjop.no: SPA category confirmed — category fallback 🟡
      {n:"Elkjøp 🔵",u:()=>`https://www.elkjop.no/hvitevarer/vask-og-tork/vaskemaskin`,badge:"BEST"},
      // komplett.no: Electrolux 2026 confirmed — category fallback 🟡
      {n:"Komplett 💻",u:()=>`https://www.komplett.no/department/10639/hvitevarer`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DK:[
      // elgiganten.dk: SPA category 🟡
      {n:"Elgiganten 🔵",u:()=>`https://www.elgiganten.dk/vitvaror/tvatt-tork/tvattmaskin`,badge:"BEST"},
      // power.dk: confirmed category 🟡
      {n:"Power 🔵",u:()=>`https://www.power.dk/c/1213/hvidevarer/`},
      // whiteaway.com: DK appliances specialist — category fallback 🟡
      {n:"WhiteAway 🟠",u:()=>`https://www.whiteaway.com/dk/vaskemaskine/`},
    ],
    FI:[
      // verkkokauppa.com: confirmed category 🟡
      {n:"Verkkokauppa 💻",u:()=>`https://www.verkkokauppa.com/fi/catalog/washing-machines/pyykinpesukoneet`,badge:"BEST"},
      // gigantti.fi: Bosch/Siemens Sep 2026 confirmed — category fallback 🟡
      {n:"Gigantti 🔵",u:()=>`https://www.gigantti.fi/kodinkoneet`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GR:[
      // skroutz.gr: all categories confirmed 🟢
      {n:"Skroutz 🛒",u:(q)=>`https://www.skroutz.gr/search?keyphrase=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    PT:[
      // worten.pt: Samsung/LG/Bosch confirmed — category fallback 🟡
      {n:"Worten 🔵",u:()=>`https://www.worten.pt/grandes-eletrodomesticos/`,badge:"BEST"},
      // MediaMarkt.pt: SAP Hybris confirmed 🟢
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.pt/pt/search.html?query=${encodeURIComponent(q)}`},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    TR:[
      // trendyol.com: confirmed 🟢
      {n:"Trendyol 🛒",u:(q)=>`https://www.trendyol.com/sr?q=${encodeURIComponent(q)}`,badge:"BEST"},
    ],
    AU:[
      // thegoodguys.com.au: $2.81B revenue, Jul 2026 confirmed — category fallback 🟡
      {n:"The Good Guys 🏪",u:()=>`https://www.thegoodguys.com.au/laundry/washing-machines`,badge:"BEST"},
      {n:"Amazon.com.au 📦",u:(q)=>`https://www.amazon.com.au/s?k=${encodeURIComponent(q)}`},
    ],
    CA:[
      // bestbuy.ca: confirmed search URL 🟢
      {n:"Best Buy 🔵",u:(q)=>`https://www.bestbuy.ca/en-CA/Search/SearchResults.aspx?query=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon.ca 📦",u:(q)=>`https://www.amazon.ca/s?k=${encodeURIComponent(q)}`},
    ],
    US:[
      {n:"Best Buy 🔵",u:(q)=>`https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}`},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    MK:[
      // neptun.mk: MK's largest white goods chain — category fallback 🟡
      {n:"Нептун 🔴",u:()=>`https://www.neptun.mk/MASINI_ZA_PERENE1.nspx`,badge:"BEST"},
      // ananas.mk: confirmed appliances category 🟡
      {n:"Анanas.mk 🍍",u:()=>`https://www.ananas.mk/kategorii/bela-tehnika`},
    ],
    RS:[
      // gigatron.rs: bela tehnika section confirmed — category fallback 🟡
      {n:"Gigatron 🔵",u:()=>`https://www.gigatron.rs/bela-tehnika/`,badge:"BEST"},
      {n:"Ananas.rs 🍍",u:(q)=>`https://www.ananas.rs/pretraga?q=${encodeURIComponent(q)}`},
    ],
    HR:[
      // elipso.hr: Aug-Sep 2026 deals confirmed — category fallback 🟡
      {n:"Elipso 🔵",u:()=>`https://www.elipso.hr/bijela-tehnika/perilice-rublja/`,badge:"BEST"},
      // emmezeta.hr: Jul 2026 active confirmed — category fallback 🟡
      {n:"Emmezeta 🟠",u:()=>`https://www.emmezeta.hr/bijela-tehnika/samostojeca/perilice-rublja.html`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay 🛒",u:(q)=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
    ],
  },
  garden: {
    DE:[
      // obi.de: /search/rasenm%C3%A4her/ confirmed 🟢
      {n:"OBI Garten 🌿",u:(q)=>`https://www.obi.de/search/${encodeURIComponent(q)}/`,badge:"BEST"},
      // hornbach.de: /s/ confirmed 🟢
      {n:"HORNBACH 🟠",u:(q)=>`https://www.hornbach.de/s/${encodeURIComponent(q)}`},
      // dehner.de: /search?q= confirmed from live page Sep 2026 🟢
      {n:"Dehner 🌱",u:(q)=>`https://www.dehner.de/search?q=${encodeURIComponent(q)}`},
      // bauhaus.info: /search?q= confirmed — dynamic search for any garden query 🟢
      {n:"Bauhaus Garten 🏗️",u:(q)=>`https://www.bauhaus.info/search?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    AT:[
      // obi.at: Jul 2026 lawnmower deals confirmed 🟢
      {n:"OBI 🌿",u:(q)=>`https://www.obi.at/search/${encodeURIComponent(q)}/`,badge:"BEST"},
      // hornbach.at: /s/ confirmed 🟢
      {n:"HORNBACH 🟠",u:(q)=>`https://www.hornbach.at/s/${encodeURIComponent(q)}`},
      // dehner.at: same platform as .de, /search?q= 🟢
      {n:"Dehner 🌱",u:(q)=>`https://www.dehner.at/search?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    CH:[
      // LOCKED — do not change
      {n:"Bauhaus Garten 🌱",u:(q)=>`https://www.bauhaus.ch/de/search?q=${encodeURIComponent(q)}`},
      {n:"Landi 🌿",u:()=>`https://www.landi.ch/shop/garteninsektizide_100303`},
    ],
    GB:[
      // B&Q diy.com: lawnmowers Einhell/Flymo/Bosch confirmed — category fallback 🟡
      {n:"B&Q Garden 🌿",u:()=>`https://www.diy.com/departments/outdoor-garden/garden-power-tools/lawnmowers/DIY780402.cat`,badge:"BEST"},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FR:[
      // leroymerlin.fr: /search?q= confirmed 🟢
      {n:"Leroy Merlin 🟢",u:(q)=>`https://www.leroymerlin.fr/search?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // gammvert.fr: /s/ confirmed, 800+ stores, Soldes 2026 🟢
      {n:"Gamm Vert 🌿",u:(q)=>`https://www.gammvert.fr/s/${encodeURIComponent(q)}`},
      // castorama.fr: thermal mowers confirmed — category fallback 🟡
      {n:"Castorama 🔵",u:()=>`https://www.castorama.fr/tondeuse-thermique/cat_id_0003183.cat`},
      {n:"Amazon.fr 📦",u:(q)=>`https://www.amazon.fr/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    IT:[
      // leroymerlin.it: SPA — category fallback 🟡
      {n:"Leroy Merlin 🟢",u:()=>`https://www.leroymerlin.it/prodotti/giardino-e-terrazzo/`,badge:"BEST"},
      {n:"Amazon.it 📦",u:(q)=>`https://www.amazon.it/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    ES:[
      // leroymerlin.es: SPA — category fallback 🟡
      {n:"Leroy Merlin 🟢",u:()=>`https://www.leroymerlin.es/productos/jardin/`,badge:"BEST"},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    PL:[
      // obi.pl: confirmed search URL 🟢
      {n:"OBI 🌿",u:(q)=>`https://www.obi.pl/search/${encodeURIComponent(q)}/`,badge:"BEST"},
      // leroymerlin.pl: /szukaj.html?q= confirmed 🟢
      {n:"Leroy Merlin 🟢",u:(q)=>`https://www.leroymerlin.pl/szukaj.html?q=${encodeURIComponent(q)}`},
      {n:"Allegro 🛒",u:(q)=>`https://allegro.pl/listing?string=${encodeURIComponent(q)}`},
    ],
    NL:[
      // hornbach.nl: /s/ confirmed 🟢
      {n:"HORNBACH 🟠",u:(q)=>`https://www.hornbach.nl/s/${encodeURIComponent(q)}`,badge:"BEST"},
      // praxis.nl: tuin confirmed — category fallback 🟡
      {n:"Praxis 🌿",u:()=>`https://www.praxis.nl/tuin-terras-buitenleven/ga1/`},
      // intratuin.nl: Gardena confirmed — category fallback 🟡
      {n:"Intratuin 🌱",u:()=>`https://www.intratuin.nl/tuingereedschap`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    BE:[
      // brico.be: 1,011 garden products confirmed — category fallback 🟡
      {n:"Brico 🔵",u:()=>`https://www.brico.be/nl/tuin-terras-buitenleven/ga1/`,badge:"BEST"},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    SE:[
      // biltema.se: probable search 🟡
      {n:"Biltema 🌿",u:(q)=>`https://www.biltema.se/soksida/?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // granngarden.se: confirmed category 🟡
      {n:"Granngården 🌱",u:()=>`https://www.granngarden.se/tradgard`},
      // jula.se: 52 lawn mowers confirmed — category fallback 🟡
      {n:"Jula 🔵",u:()=>`https://www.jula.se/catalog/tradgard/tradgardsmaskiner/grasklippare/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    NO:[
      // plantasjen.no: "Norway's leading garden center", 76 stores — category fallback 🟡
      {n:"Plantasjen 🌿",u:()=>`https://www.plantasjen.no/hageredskap/`,badge:"BEST"},
      // biltema.no: probable search 🟡
      {n:"Biltema 🌱",u:(q)=>`https://www.biltema.no/soksida/?q=${encodeURIComponent(q)}`},
      // jula.no: Jun 2026 catalog confirmed 🟡
      {n:"Jula 🔵",u:()=>`https://www.jula.no/catalog/tradgard/tradgardsmaskiner/grasklippare/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DK:[
      // biltema.dk: probable search 🟡
      {n:"Biltema 🌿",u:(q)=>`https://www.biltema.dk/sogesiden/?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // silvan.dk: plæneklippere confirmed — category fallback 🟡
      {n:"Silvan 🌱",u:()=>`https://www.silvan.dk/have/ploeneklippere/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FI:[
      // k-rauta.fi: 787 products Sep 2026 confirmed — category fallback 🟡
      {n:"K-Rauta 🏗️",u:()=>`https://www.k-rauta.fi/kategoria/piha/puutarhatyokalut`,badge:"BEST"},
      // motonet.fi: garden section confirmed 🟡
      {n:"Motonet 🌿",u:()=>`https://www.motonet.fi/tuoteryhmat/piha-ja-puutarha/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GR:[
      // skroutz.gr: all categories confirmed 🟢
      {n:"Skroutz 🛒",u:(q)=>`https://www.skroutz.gr/search?keyphrase=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    PT:[
      // worten.pt: confirmed 🟡
      {n:"Worten 🔵",u:()=>`https://www.worten.pt/jardim`,badge:"BEST"},
      // leroymerlin.pt: SPA — category fallback 🟡
      {n:"Leroy Merlin 🟢",u:()=>`https://www.leroymerlin.pt/produtos/jardim/`},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    TR:[
      // trendyol.com: confirmed 🟢
      {n:"Trendyol 🛒",u:(q)=>`https://www.trendyol.com/sr?q=${encodeURIComponent(q)}`,badge:"BEST"},
    ],
    AU:[
      // bunnings.com.au: confirmed search URL 🟢
      {n:"Bunnings 🟠",u:(q)=>`https://www.bunnings.com.au/search/products?q=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon.com.au 📦",u:(q)=>`https://www.amazon.com.au/s?k=${encodeURIComponent(q)}`},
    ],
    CA:[
      // homedepot.ca: lawn mowers confirmed — category fallback 🟡
      {n:"Home Depot 🌿",u:()=>`https://www.homedepot.ca/en/home/categories/outdoors/outdoor-power-equipment/lawn-mowers/f/lz8`,badge:"BEST"},
      // canadiantire.ca: confirmed category 🟡
      {n:"Canadian Tire 🔧",u:()=>`https://www.canadiantire.ca/en/cat/outdoor-living/outdoor-power-equipment/lawn-mowers-DC0001575.html`},
      {n:"Amazon.ca 📦",u:(q)=>`https://www.amazon.ca/s?k=${encodeURIComponent(q)}`},
    ],
    US:[
      {n:"Home Depot Garden 🌿",u:(q)=>`https://www.homedepot.com/s/${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    MK:[
      // ananas.mk: garden confirmed 🟡
      {n:"Анanas.mk 🍍",u:()=>`https://www.ananas.mk/kategorii/dom-i-gradina/gradina-i-terasa`,badge:"BEST"},
    ],
    RS:[
      // okov.rs: "baštu i domaćinstvo" confirmed — category fallback 🟡
      {n:"Okov 🏗️",u:()=>`https://www.okov.rs/sr/`,badge:"BEST"},
      {n:"Ananas.rs 🍍",u:(q)=>`https://www.ananas.rs/pretraga?q=${encodeURIComponent(q)}`},
    ],
    HR:[
      // pevex.hr: garden section confirmed — category fallback 🟡
      {n:"Pevex 🌿",u:()=>`https://www.pevex.hr/vrt-i-sezona/`,badge:"BEST"},
      // bauhaus.hr: same platform, /search?q= confirmed 🟢
      {n:"Bauhaus HR 🌱",u:(q)=>`https://www.bauhaus.hr/search?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
  },
  pets: {
    DE:[
      // zooplus.de: /search/results?q= confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.de/search/results?q=${encodeURIComponent(q)}`,badge:"TOP"},
      // fressnapf.de: dog food category confirmed — category fallback 🟡
      {n:"Fressnapf 🐕",u:()=>`https://www.fressnapf.de/c/hund/hundefutter/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    AT:[
      // zooplus.at: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.at/search/results?q=${encodeURIComponent(q)}`,badge:"TOP"},
      // fressnapf.at: dog food category confirmed — category fallback 🟡
      {n:"Fressnapf 🐕",u:()=>`https://www.fressnapf.at/c/hund/hundefutter/`},
    ],
    CH:[
      // LOCKED — do not change
      {n:"Qualipet 🐾",u:()=>`https://www.qualipet.ch/de/hunde/`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GB:[
      // petsathome.com: /search?searchTerm= confirmed Jul 2026 🟢
      {n:"Pets at Home 🐾",u:(q)=>`https://www.petsathome.com/search?searchTerm=${encodeURIComponent(q)}`,badge:"BEST"},
      // zooplus.co.uk: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.co.uk/search/results?q=${encodeURIComponent(q)}`},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FR:[
      // zooplus.fr: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.fr/search/results?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // zoomalia.com: /moteurrecherche/recherche/search/?q= confirmed, Sep 4 2026 🟢
      {n:"Zoomalia 🐕",u:(q)=>`https://www.zoomalia.com/moteurrecherche/recherche/search/?q=${encodeURIComponent(q)}`},
      // wanimo.com: Royal Canin/Hill's confirmed — category fallback 🟡
      {n:"Wanimo 🐾",u:()=>`https://www.wanimo.com/fr/chiens/alimentation-pour-chien-sc1/`},
      {n:"Amazon.fr 📦",u:(q)=>`https://www.amazon.fr/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    IT:[
      // arcaplanet.it: Aug 27 2026 catalogue, IT #1 pet chain — category fallback 🟡
      {n:"Arcaplanet 🐾",u:()=>`https://www.arcaplanet.it/cane`,badge:"BEST"},
      // zooplus.it: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.it/search/results?q=${encodeURIComponent(q)}`},
      {n:"Amazon.it 📦",u:(q)=>`https://www.amazon.it/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    ES:[
      // zooplus.es: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.es/search/results?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // kiwoko.com: ES/PT #1 pet chain — category fallback 🟡
      {n:"Kiwoko 🐕",u:()=>`https://www.kiwoko.com/comida-para-perros/`},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    PL:[
      // allegro.pl: confirmed 🟢
      {n:"Allegro 🛒",u:(q)=>`https://allegro.pl/listing?string=${encodeURIComponent(q)}`,badge:"BEST"},
      // zooplus.pl: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.pl/search/results?q=${encodeURIComponent(q)}`},
      // maxizoo.pl: Fressnapf Group — category fallback 🟡
      {n:"Maxi Zoo 🐕",u:()=>`https://www.maxizoo.pl/pies/karma-sucha-dla-psa/`},
    ],
    NL:[
      // petsplace.nl: 200 stores NL+BE — category fallback 🟡
      {n:"Pets Place 🐾",u:()=>`https://www.petsplace.nl/hond/hondenvoer`,badge:"BEST"},
      // zooplus.nl: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.nl/search/results?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    BE:[
      // zooplus.be: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.be/search/results?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // tomandco.com: Belgian chain since 1991 — category fallback 🟡
      {n:"Tom&Co 🐕",u:()=>`https://www.tomandco.com/nl-be/honden/hondenvoer.html`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    SE:[
      // zooplus.se: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.se/search/results?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // arkenzoo.se (Musti SE): dog food category confirmed — category fallback 🟡
      {n:"Arken Zoo 🐕",u:()=>`https://www.arkenzoo.se/hund-hundmat`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    NO:[
      // zooplus.no: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.no/search/results?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // musti.no: Jun 2026 sitemap confirmed — category fallback 🟡
      {n:"Musti 🐕",u:()=>`https://www.musti.no/hund-hundefor`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DK:[
      // zooplus.dk: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.dk/search/results?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // musti.dk: Nordic chain — category fallback 🟡
      {n:"Musti 🐕",u:()=>`https://www.musti.dk/hund-hundefor`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FI:[
      // zooplus.fi: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.fi/search/results?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // mustijamirri.fi: 100+ stores since 1988 — category fallback 🟡
      {n:"Musti ja Mirri 🐕",u:()=>`https://www.mustijamirri.fi/koirat-koiranruoka`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GR:[
      // skroutz.gr: all categories confirmed 🟢
      {n:"Skroutz 🛒",u:(q)=>`https://www.skroutz.gr/search?keyphrase=${encodeURIComponent(q)}`,badge:"BEST"},
      // zooplus.gr: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.gr/search/results?q=${encodeURIComponent(q)}`},
    ],
    PT:[
      // zooplus.pt: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.pt/search/results?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // kiwoko.pt: ES/PT #1 pet chain — category fallback 🟡
      {n:"Kiwoko 🐕",u:()=>`https://www.kiwoko.pt/alimentacao-caes/`},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    TR:[
      // trendyol.com: confirmed 🟢
      {n:"Trendyol 🛒",u:(q)=>`https://www.trendyol.com/sr?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // petlebi.com: TR pet specialist — category fallback 🟡
      {n:"Petlebi 🐾",u:()=>`https://www.petlebi.com/kopek/kopek-mamasi/`},
    ],
    AU:[
      // petbarn.com.au: "Australia's #1 Pet Retailer" — category fallback 🟡
      {n:"Petbarn 🐾",u:()=>`https://www.petbarn.com.au/c/dogs`,badge:"BEST"},
      // petcircle.com.au: AU online pet — category fallback 🟡
      {n:"Pet Circle 🐕",u:()=>`https://www.petcircle.com.au/dogs/food/`},
      {n:"Amazon.com.au 📦",u:(q)=>`https://www.amazon.com.au/s?k=${encodeURIComponent(q)}`},
    ],
    CA:[
      // amazon.ca: confirmed 🟢
      {n:"Amazon.ca 📦",u:(q)=>`https://www.amazon.ca/s?k=${encodeURIComponent(q)}`,badge:"BEST"},
      // petvalu.ca: CA nationwide — category fallback 🟡
      {n:"Pet Valu 🐾",u:()=>`https://www.petvalu.ca/dogs/food/`},
    ],
    US:[
      {n:"PetSmart 🐾",u:()=>`https://www.petsmart.com/dog`,badge:"BEST"},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    MK:[
      // ananas.mk: pet shop section confirmed 🟡
      {n:"Анanas.mk 🍍",u:()=>`https://www.ananas.mk/promo/bf_pet_shop`,badge:"BEST"},
      // mona.mk: active MK pet shop, nationwide delivery — category fallback 🟡
      {n:"Mona 🐾",u:()=>`https://mona.mk/kucinja-ishrana`},
    ],
    RS:[
      // ananas.rs: confirmed 🟢
      {n:"Ananas.rs 🍍",u:(q)=>`https://www.ananas.rs/pretraga?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // pet-centar.rs: RS/HR pet chain — category fallback 🟡
      {n:"Pet Centar 🐾",u:()=>`https://www.pet-centar.rs/hrana-za-pse/`},
    ],
    HR:[
      // zooplus.hr: confirmed 🟢
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.hr/search/results?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // pet-centar.hr: HR/RS pet chain — category fallback 🟡
      {n:"Pet Centar 🐾",u:()=>`https://www.pet-centar.hr/hrana-za-pse/`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
  },
  bike: {
    DE:[
      // bike24.com: "Best German Bike Shop 2026" 5th year — all bike parts 🟡
      {n:"Bike24 🚲",u:()=>`https://www.bike24.com/cycling/parts`,badge:"TOP"},
      // fahrrad-xxl.de: all bike parts & components 🟡
      {n:"Fahrrad XXL 🏪",u:()=>`https://www.fahrrad-xxl.de/fahrradteile/`},
      // rosebikes.com: 110 years, Bocholt DE — all bike parts 🟡
      {n:"ROSE Bikes 🌹",u:()=>`https://www.rosebikes.com/bike-parts`},
      // bike-discount.de: all bike parts & components 🟡
      {n:"Bike-Discount 💰",u:()=>`https://www.bike-discount.de/de/fahrradteile`},
      // decathlon.de: Ntt= confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.de/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    AT:[
      // bike24 ships to AT — all bike parts 🟡
      {n:"Bike24 🚲",u:()=>`https://www.bike24.com/cycling/parts`,badge:"TOP"},
      // hervis.at: bike brakes confirmed — category fallback 🟡
      {n:"Hervis 🔵",u:()=>`https://www.hervis.at/shop/Sportwelten/Bike/Bremsen/c/3_rad_bremsen`},
      // decathlon.at: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.at/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    CH:[
      // LOCKED — do not change
      {n:"Galaxus 🔵",u:(q)=>`https://www.galaxus.ch/search?query=${encodeURIComponent(q)}`},
      {n:"Veloplus 🚲",u:(q)=>`https://www.veloplus.ch/de/search/products?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GB:[
      // halfords.com: Sep 2 2026 confirmed bikes — category fallback 🟡
      {n:"Halfords 🔴",u:()=>`https://www.halfords.com/bikes/`,badge:"BEST"},
      // wiggle.com: all bike parts confirmed 🟡
      {n:"Wiggle 🚲",u:()=>`https://www.wiggle.com/cycle/bike-parts`},
      // decathlon.co.uk: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.co.uk/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FR:[
      // decathlon.fr: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.fr/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`,badge:"BEST"},
      // alltricks.fr: "100% French bike specialist" — all bike components 🟡
      {n:"Alltricks 🚲",u:()=>`https://www.alltricks.fr/C-40583-composants-velo`},
      // probikeshop.fr: FR cycling specialist — all bike parts 🟡
      {n:"Probikeshop 🔵",u:()=>`https://www.probikeshop.fr/c/pieces-velo/`},
      {n:"Amazon.fr 📦",u:(q)=>`https://www.amazon.fr/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    IT:[
      // decathlon.it: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.it/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`,badge:"BEST"},
      // alltricks.it: ships to IT — all bike components 🟡
      {n:"Alltricks 🚲",u:()=>`https://www.alltricks.it/C-40583-composants-velo`},
      {n:"Amazon.it 📦",u:(q)=>`https://www.amazon.it/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    ES:[
      // decathlon.es: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.es/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`,badge:"BEST"},
      // alltricks.es: ships to ES — all bike components 🟡
      {n:"Alltricks 🚲",u:()=>`https://www.alltricks.es/C-40583-composants-velo`},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    PL:[
      // decathlon.pl: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.pl/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`,badge:"BEST"},
      // centrumrowerowe.pl: PL bike specialist, all brakes section 🟡
      {n:"CentrumRowerowe 🚲",u:()=>`https://www.centrumrowerowe.pl/hamulce/`},
      {n:"Allegro 🛒",u:(q)=>`https://allegro.pl/listing?string=${encodeURIComponent(q)}`},
    ],
    NL:[
      // mantel.com: "NL's largest bike store", fietsonderdelen (all bike parts) confirmed 🟡
      {n:"Mantel 🚲",u:()=>`https://www.mantel.com/fietsonderdelen`,badge:"BEST"},
      // decathlon.nl: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.nl/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    BE:[
      // decathlon.be: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.be/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`,badge:"BEST"},
      // mantel.com: fietsonderdelen (all bike parts) confirmed — ships to BE 🟡
      {n:"Mantel 🚲",u:()=>`https://www.mantel.com/fietsonderdelen`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    SE:[
      // biltema.se: cykel section confirmed 🟡
      {n:"Biltema 🚲",u:()=>`https://www.biltema.se/cykel---elcykel/`,badge:"BEST"},
      // decathlon.se: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.se/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    NO:[
      // biltema.no: cykel section confirmed 🟡
      {n:"Biltema 🚲",u:()=>`https://www.biltema.no/cykel-og-elsykkel/`,badge:"BEST"},
      // decathlon.no: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.no/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DK:[
      // thansen.dk: "Cykler, cykeldele og cykeltilbehør" — all cycling 🟡
      {n:"thansen 🔵",u:()=>`https://www.thansen.dk/cykel/n297284770`,badge:"BEST"},
      // decathlon.dk: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.dk/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`},
    ],
    FI:[
      // motonet.fi: bike section confirmed 🟡
      {n:"Motonet 🚲",u:()=>`https://www.motonet.fi/tuoteryhmat/polkupyoraily/`,badge:"BEST"},
      // decathlon.fi: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.fi/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GR:[
      // skroutz.gr: all categories confirmed 🟢
      {n:"Skroutz 🛒",u:(q)=>`https://www.skroutz.gr/search?keyphrase=${encodeURIComponent(q)}`,badge:"BEST"},
      // decathlon.gr: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.gr/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`},
    ],
    PT:[
      // decathlon.pt: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.pt/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`,badge:"BEST"},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    TR:[
      // trendyol.com: confirmed 🟢
      {n:"Trendyol 🛒",u:(q)=>`https://www.trendyol.com/sr?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // decathlon.com.tr: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.com.tr/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`},
    ],
    AU:[
      // 99bikes.com.au: AU #1 cycling Mar 2026 — all components 🟡
      {n:"99 Bikes 🚲",u:()=>`https://www.99bikes.com.au/components`,badge:"BEST"},
      // decathlon.com.au: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.com.au/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`},
      {n:"Amazon.com.au 📦",u:(q)=>`https://www.amazon.com.au/s?k=${encodeURIComponent(q)}`},
    ],
    CA:[
      // amazon.ca: confirmed 🟢
      {n:"Amazon.ca 📦",u:(q)=>`https://www.amazon.ca/s?k=${encodeURIComponent(q)}`,badge:"BEST"},
      // sportchek.ca: Aug-Sep 2026 confirmed — category fallback 🟡
      {n:"Sport Chek 🚲",u:()=>`https://www.sportchek.ca/en/cat/shop-by-sport/cycling/bikes-DC2000683.html`},
      // mec.ca: confirmed 🟡
      {n:"MEC 🌲",u:()=>`https://www.mec.ca/en/products/cycling`},
    ],
    US:[
      {n:"REI 🏔️",u:(q)=>`https://www.rei.com/search?q=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    MK:[
      // ananas.mk: bikes+scooters category confirmed 🟡
      {n:"Анanas.mk 🍍",u:()=>`https://www.ananas.mk/promo/sport_rekreacija_velosipedi_trotineti`,badge:"BEST"},
    ],
    RS:[
      // ananas.rs: confirmed 🟢
      {n:"Ananas.rs 🍍",u:(q)=>`https://www.ananas.rs/pretraga?q=${encodeURIComponent(q)}`,badge:"BEST"},
      // decathlon.rs: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.rs/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`},
    ],
    HR:[
      // decathlon.hr: confirmed 🟢
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.hr/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`,badge:"BEST"},
      // ciklo-centar.hr: HR bike specialist — all bike parts 🟡
      {n:"Ciklo Centar 🚲",u:()=>`https://ciklo-centar.hr/dijelovi/`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay 🛒",u:(q)=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
    ],
  },
  motorcycle: {
    DE:[
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/de-de/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"Scooter Attack 🛵",u:(q)=>`https://www.scooter-attack.com/search?sSearch=${encodeURIComponent(q)}`,types:["scooter"]},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay.de 🛒",u:(q)=>`https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=6000`,types:["road","scooter","mx","atv"]},
    ],
    AT:[
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/de-at/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    CH:[
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/de-ch/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GB:[
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/en-gb/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"Demon Tweeks 🔴",u:(q)=>`https://www.demon-tweeks.com/search?q=${encodeURIComponent(q)}`,types:["road","mx","atv"]},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FR:[
      {n:"Motoblouz 🏍️",u:(q)=>`https://www.motoblouz.com/recherche/${encodeURIComponent(q)}.html`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/fr-fr/?search=${encodeURIComponent(q)}`,types:["road","scooter","mx"]},
      {n:"Amazon.fr 📦",u:(q)=>`https://www.amazon.fr/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    IT:[
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/it-it/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"Motocross Center 🏍️",u:(q)=>`https://www.motocross-center.com/it/search?query=${encodeURIComponent(q)}`,types:["mx"]},
      {n:"Amazon.it 📦",u:(q)=>`https://www.amazon.it/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    ES:[
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/es-es/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    PL:[
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/pl-pl/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"Scooter Attack 🛵",u:(q)=>`https://www.scooter-attack.com/search?sSearch=${encodeURIComponent(q)}`,types:["scooter"]},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    HR:[
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/hr-hr/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay 🛒",u:(q)=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=6000`,types:["road","scooter","mx","atv"]},
    ],
    RS:[
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/en-en/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    NL:[
      // fc-moto.de: confirmed 🟢
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/en-en/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      // louis.nl: "Europe's No.1 motorcycle spare parts" — all service parts 🟡
      {n:"Louis 🔧",u:()=>`https://www.louis.eu/en/catalog/motorcycle-service-parts`,types:["road","scooter"]},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    BE:[
      // fc-moto.de: confirmed 🟢
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/en-en/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      // louis.eu: ships to BE — all motorcycle service parts 🟡
      {n:"Louis 🔧",u:()=>`https://www.louis.eu/en/catalog/motorcycle-service-parts`,types:["road","scooter"]},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    SE:[
      // fc-moto.de: confirmed 🟢
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/en-en/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      // biltema.se: MC section confirmed 🟡
      {n:"Biltema 🏍️",u:()=>`https://www.biltema.se/bil---mc/bilreservdelar/bromssystem/`,types:["road","scooter"]},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    NO:[
      // fc-moto.de: confirmed 🟢
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/en-en/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      // biltema.no: MC section confirmed 🟡
      {n:"Biltema 🏍️",u:()=>`https://www.biltema.no/bil-og-mc/`,types:["road","scooter"]},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DK:[
      // fc-moto.de: confirmed 🟢
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/en-en/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      // thansen.dk: scooter/MC section confirmed 🟡
      {n:"thansen 🔵",u:()=>`https://www.thansen.dk/scooter-mc/scooter-og-knallert/reservedele/n-240974473`,types:["road","scooter"]},
      // biltema.dk: MC section 🟡
      {n:"Biltema 🏍️",u:()=>`https://www.biltema.dk/bil-og-mc/`,types:["road","scooter"]},
    ],
    FI:[
      // fc-moto.de: confirmed 🟢
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/en-en/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      // motonet.fi: moottoripyörä section confirmed 🟡
      {n:"Motonet 🔧",u:()=>`https://www.motonet.fi/tuoteryhmat/moottoripyoraily`,types:["road","scooter","mx"]},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GR:[
      // skroutz.gr: all categories confirmed 🟢
      {n:"Skroutz 🛒",u:(q)=>`https://www.skroutz.gr/search?keyphrase=${encodeURIComponent(q)}`,badge:"BEST"},
      // fc-moto.de: confirmed 🟢
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/en-en/?search=${encodeURIComponent(q)}`,types:["road","scooter","mx"]},
    ],
    PT:[
      // fc-moto.de: /pt-pt/ locale confirmed 🟢
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/pt-pt/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"Amazon.es 📦",u:(q)=>`https://www.amazon.es/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    TR:[
      // trendyol.com: confirmed 🟢
      {n:"Trendyol 🛒",u:(q)=>`https://www.trendyol.com/sr?q=${encodeURIComponent(q)}`,badge:"BEST"},
    ],
    AU:[
      // mcas.com.au: /search-results?q= confirmed Sep 2026 🟢
      {n:"MCAS 🏍️",u:(q)=>`https://www.mcas.com.au/search-results?q=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      // supercheapauto.com.au: confirmed 🟢
      {n:"Supercheap Auto 🔴",u:(q)=>`https://www.supercheapauto.com.au/search?q=${encodeURIComponent(q)}`,types:["road","scooter"]},
    ],
    CA:[
      // fortnine.ca: Week 36 2026 confirmed — category fallback 🟡
      {n:"FortNine 🏍️",u:()=>`https://www.fortnine.ca/en/motorcycle-brake-parts`,badge:"BEST",types:["road","scooter","mx"]},
      // amazon.ca: confirmed 🟢
      {n:"Amazon.ca 📦",u:(q)=>`https://www.amazon.ca/s?k=${encodeURIComponent(q)}`},
    ],
    MK:[
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/en-en/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      // ananas.mk: auto & moto section confirmed 🟡
      {n:"Анanas.mk 🍍",u:()=>`https://www.ananas.mk/promo/avto_moto`},
    ],
    US:[
      {n:"RevZilla 🏍️",u:(q)=>`https://www.revzilla.com/search?query=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter"]},
      {n:"Rocky Mountain ATV/MC 🏔️",u:(q)=>`https://www.rockymountainatvmc.com/search/q-${encodeURIComponent(q)}`,types:["mx","atv"]},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DEFAULT:[
      {n:"FC-Moto 🌍",u:(q)=>`https://www.fc-moto.com/en-en/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"Scooter Attack 🛵",u:(q)=>`https://www.scooter-attack.com/search?sSearch=${encodeURIComponent(q)}`,types:["scooter"]},
      {n:"eBay 🛒",u:(q)=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=6000`,types:["road","scooter","mx","atv"]},
    ],
  },
};

// GPS-based store lookup — language plays NO role here
// Category-specific ONLINE stores (previously misnamed as local stores)
export function getCategoryOnlineStores(category, cc, vehicleHint) {
  // 'moto' is the nearby/UI key; 'motorcycle' is the STORES key — normalise here
  const normalised = category === 'moto' ? 'motorcycle' : category;
  const cat = STORES[normalised] || STORES.home;
  const storeList = cat[cc] || cat.DEFAULT || STORES.home.DEFAULT;

  // For motorcycle category: filter stores by vehicle subtype.
  // Stores with a types[] array are subtype-specific.
  // Stores without types[] are broad fallbacks (Amazon, non-annotated) — always shown.
  if (normalised === 'motorcycle' && vehicleHint) {
    const subtype = detectMotoSubtype(vehicleHint);
    return storeList.filter(st => !st.types || st.types.includes(subtype));
  }
  return storeList;
}

// Backward compat alias
// ── Moto subtype detection ──────────────────────────────────────────────────
// Returns 'scooter' | 'mx' | 'atv' | 'road' based on vehicle name string.
// Priority: vehicleCtx.motoType (structured) → pattern match on name → 'road'.
// Patterns use make/model tokens only — no country/language/product names.
export function detectMotoSubtype(vehicleName, structuredSubtype) {
  // 1. Prefer structured subtype if provided by vehicleCtx (future: AI returns this)
  if (structuredSubtype) {
    const s = structuredSubtype.toLowerCase();
    if (s === 'scooter' || s === 'moped') return 'scooter';
    if (s === 'mx' || s === 'enduro' || s === 'motocross' || s === 'cross') return 'mx';
    if (s === 'atv' || s === 'quad') return 'atv';
    if (s === 'road' || s === 'touring' || s === 'naked' || s === 'sport') return 'road';
  }

  // 2. Pattern match on vehicle name string (make + model)
  if (!vehicleName) return 'road';
  const v = vehicleName.toLowerCase();

  // ATV / Quad — check first (Polaris, Can-Am also make road/snow vehicles)
  const ATV = /\batv\b|\bquad\b|\b4x4\b|\boutlander\b|\bgrizzly\b|\bkodiak\b|\bbrute[\s-]force\b|\bforeman\b|\bpioneer\b|\bfour[\s-]?trax\b|\btrx\b|\bsportsman\b|\bcan[\s-]am\b|\bpolaris\b|\brenegade\b|\bdefender\b|\bmaverick\b/;
  if (ATV.test(v)) return 'atv';

  // Motocross / Enduro / Off-road
  const MX = /\bmotocross\b|\benduro\b|\b(mx|cross|dirtbike)\b|\boff[\s-]?road\b|\btrial\b|\bsupermoto\b|\bexc\b|\bexce?\b|\bsxf?\b|\bxcw\b|\bxcf\b|\byz|\bcrf|\bcr\b|\bklx|\bkxf?|\brmz|\brmx|\bdrz|\bwr\b|\b(te|fe|tc|fc)\b|\b(rr|ec|ex)\b(?!\d{3})|\bsherco\b|\bgasgas\b|\bgas[\s-]gas\b|\bhusqvarna\b|\bktm\b/;
  if (MX.test(v)) return 'mx';

  // Scooter / Moped / Maxi-scooter
  const SCOOTER = /\bscooter\b|\bmoped\b|\bmofa\b|\broller\b|\bmaxi[\s-]?scoot|\bsr\s*\d{2,3}\b|\bvespa\b|\bpiaggio\b|\b(px|lx|gts|primavera|sprint)\b|\bpcx\b|\bsh\s*\d|\bnss\b|\bforza\b|\bintegra\b|\bsilverw|\bx[\s-]?adv\b|\bnmax\b|\bxmax\b|\btmax\b|\bxenter\b|\btricity\b|\baeox\b|\bkymco\b|\bsym\b|\bpeugeot\b|\bspeedfight\b|\bgilera\b|\bmalaguti\b|\bderbi\b|\baprilia.*\bsr\b|\bpgo\b|\bkeeway\b|\bznen\b|\bbarossa\b|\brieju\b|\bonyx\b/;
  if (SCOOTER.test(v)) return 'scooter';

  // Default: road motorcycle
  return 'road';
}


export function getStores(category, cc, vehicleHint) {
  return getCategoryOnlineStores(category, cc, vehicleHint);
}

// Local store search terms per category — used to open Google Maps nearby search
export const LOCAL_STORE_SEARCH = {
  car: {
    en:'auto parts store',       de:'Autoteile KFZ Teile',
    fr:'magasin de pièces auto', es:'tienda de repuestos de coche',
    it:'negozio ricambi auto',   pl:'sklep z częściami samochodowymi',
    sr:'prodavnica auto delova', hr:'prodavaonica auto dijelova',
    mk:'продавница за авто делови', tr:'araba parçaları mağazası',
    sv:'bildelsbutik',           no:'bildelerbutikk',
    da:'bildelsbutik',           fi:'autovaraosakauppa',
    nl:'autoonderdelen winkel',  pt:'loja de peças auto',
    'pt-br':'loja de peças automotivas', el:'κατάστημα ανταλλακτικών αυτοκινήτου',
    cs:'prodejna autodílů',      sk:'predajňa autodielcov',
    hu:'autóalkatrész bolt',     ro:'magazin piese auto',
    bg:'магазин за авточасти',
  },
  bike: {
    en:'bike shop bicycle store', de:'Fahrradladen Fahrradgeschäft',
    fr:'magasin de vélos',        es:'tienda de bicicletas',
    it:'negozio biciclette',      pl:'sklep rowerowy',
    sr:'prodavnica bicikala',     hr:'prodavaonica bicikala',
    mk:'продавница за велосипеди', tr:'bisiklet mağazası',
    sv:'cykelaffär',              no:'sykkelbutikk',
    da:'cykelbutik',              fi:'pyöräliike',
    nl:'fietswinkel',             pt:'loja de bicicletas',
    'pt-br':'loja de bicicletas', el:'κατάστημα ποδηλάτων',
    cs:'prodejna kol',            sk:'predajňa bicyklov',
    hu:'kerékpárüzlet',           ro:'magazin biciclete',
    bg:'магазин за велосипеди',
  },
  tech: {
    // Parts-store intent: phone/electronics parts & accessories, NOT repair shop
    en:'phone parts electronics store',  de:'Handy Ersatzteile Elektronik',
    fr:'pièces téléphone électronique',   es:'repuestos móvil electrónica',
    it:'ricambi telefono elettronica',    pl:'części do telefonu elektronika',
    sr:'delovi za telefon elektronika',   hr:'dijelovi za telefon elektronika',
    mk:'делови за телефон електроника',   tr:'telefon yedek parça mağazası',
    sv:'mobildelar elektronikaffär',      no:'mobiltilbehør elektronikkbutikk',
    da:'mobiltilbehør elektroniksforretning', fi:'puhelinosat elektroniikkakauppa',
    nl:'telefoononderdelen elektronica',  pt:'peças telemóvel eletrónica',
    'pt-br':'peças celular eletrônica',   el:'ανταλλακτικά τηλεφώνου ηλεκτρονικά',
    cs:'náhradní díly telefonu elektro',  sk:'náhradné diely telefónu elektro',
    hu:'telefonalkatrész elektronika',    ro:'piese telefon electronice',
    bg:'резервни части телефон електроника',
  },
  appliances: {
    // Parts-store intent: spare parts for washing machines etc., NOT repair shop
    en:'appliance parts spare parts store',  de:'Waschmaschinen Ersatzteile Hausgeräte',
    fr:'pièces électroménager rechange',     es:'repuestos electrodomésticos',
    it:'ricambi elettrodomestici',           pl:'części zamienne AGD',
    sr:'rezervni delovi kućnih aparata',     hr:'rezervni dijelovi kućanskih aparata',
    mk:'резервни делови за бела техника',    tr:'beyaz eşya yedek parça',
    sv:'reservdelar vitvaror',               no:'reservedeler hvitevarer',
    da:'reservedele hvidevarer',             fi:'kodinkoneiden varaosat',
    nl:'onderdelen huishoudapparaten',       pt:'peças eletrodomésticos',
    'pt-br':'peças eletrodomésticos',        el:'ανταλλακτικά οικιακών συσκευών',
    cs:'náhradní díly spotřebiče',           sk:'náhradné diely spotrebiče',
    hu:'háztartási gép alkatrész',           ro:'piese schimb electrocasnice',
    bg:'резервни части за домакински уреди',
  },
  home: {
    en:'hardware store DIY shop',  de:'Baumarkt Eisenwaren',
    fr:'quincaillerie bricolage',   es:'ferretería bricolaje',
    it:'ferramenta fai da te',      pl:'sklep budowlany narzędzia',
    sr:'prodavnica građevinskog materijala', hr:'prodavaonica građevinskog materijala',
    mk:'продавница за градежен материјал',   tr:'yapı market hırdavatçı',
    sv:'byggvaruhus järnhandel',    no:'byggvarehandel',
    da:'byggemarked isenkram',      fi:'rautakauppa rakennustarvikeliike',
    nl:'bouwmarkt ijzerhandel',     pt:'loja de ferragens bricolage',
    'pt-br':'loja de ferragens faça você mesmo', el:'κατάστημα δομικών υλικών',
    cs:'železářství stavebniny',    sk:'železiarstvo stavebniny',
    hu:'vasáru barkácsáruház',      ro:'magazin bricolaj feronerie',
    bg:'строителен магазин железария',
  },
  garden: {
    en:'garden center plant nursery',  de:'Gartencenter Pflanzen',
    fr:'jardinerie pépinière',          es:'centro de jardinería vivero',
    it:'centro giardinaggio vivaio',    pl:'centrum ogrodnicze rośliny',
    sr:'baštovansko-cvetni centar',     hr:'vrtni centar rasadnik',
    mk:'градинарски центар расадник',   tr:'bahçe merkezi fidanlık',
    sv:'trädgårdscenter plantskola',    no:'hagesenteret planteskole',
    da:'havecenter planteskole',        fi:'puutarhakeskus taimitarha',
    nl:'tuincentrum plantsoen',         pt:'centro de jardinagem viveiro',
    'pt-br':'garden center viveiro',    el:'κέντρο κήπου φυτώριο',
    cs:'zahradní centrum školka',       sk:'záhradné centrum škôlka',
    hu:'kertészeti központ',            ro:'centru grădinărit pepinieră',
    bg:'градински център разсадник',
  },
  motorcycle: {
    en:'motorcycle parts shop scooter repair',
    de:'Motorrad Ersatzteile Motorradhandel',
    fr:'pièces moto scooter accessoires moto',
    es:'recambios moto accesorios scooter',
    it:'ricambi moto scooter accessori moto',
    pl:'części motocyklowe sklep moto',
    sr:'delovi za motocikl prodavnica',
    hr:'dijelovi za motocikl prodavaonica',
    mk:'делови за мотоцикл продавница',
    tr:'motosiklet yedek parça mağazası',
    sv:'motorcykeldelar tillbehör',
    no:'motorsykkeldelar tilbehør',
    da:'motorcykeldele tilbehør',
    fi:'moottoripyörän varaosat',
    nl:'motorfiets onderdelen winkel',
    pt:'peças mota acessórios',
    'pt-br':'peças moto acessórios',
    el:'ανταλλακτικά μοτοσικλέτας',
    cs:'náhradní díly motocykl',
    sk:'náhradné diely motocykel',
    hu:'motorkerékpár alkatrész',
    ro:'piese schimb motocicletă',
    bg:'резервни части мотоциклет',
  },
  pets: {
    en:'pet shop pet store',   de:'Zoohandlung Tierhandlung',
    fr:'animalerie magasin animaux', es:'tienda de mascotas animales',
    it:'negozio animali domestici',  pl:'sklep zoologiczny',
    sr:'prodavnica za kućne ljubimce', hr:'prodavaonica za kućne ljubimce',
    mk:'продавница за миленици',      tr:'evcil hayvan mağazası',
    sv:'djuraffär husdjursbutik',      no:'dyrebutikk kjæledyr',
    da:'dyrebutikk kæledyr',           fi:'lemmikkieläinkauppa',
    nl:'dierenwinkel huisdieren',      pt:'loja de animais estimação',
    'pt-br':'petshop loja de animais', el:'κατάστημα κατοικίδιων',
    cs:'zoologická prodejna',          sk:'zoologická predajňa',
    hu:'kisállatkereskedés',           ro:'magazin animale companie',
    bg:'зоомагазин домашни любимци',
  },
};

export function getLocalStoreSearch(category, lang) {
  // 'moto' is the Parts/Nearby UI key; 'motorcycle' is the LOCAL_STORE_SEARCH key.
  // Without this normalisation, getLocalStoreSearch('moto', ...) falls through to
  // LOCAL_STORE_SEARCH.home → 'Baumarkt Eisenwaren' — wrong for motorcycle.
  const normalised = category === 'moto' ? 'motorcycle' : category;
  const entry = LOCAL_STORE_SEARCH[normalised] || LOCAL_STORE_SEARCH.home;
  return entry[lang] || entry.en;
}

export function getOnlineStores(cc) {
  const isDACH = ['DE','AT'].includes(cc);   // CH removed — has its own branch below
  const isCH   = cc === 'CH';
  const isUK   = cc === 'GB';
  const isFR   = cc === 'FR';
  if (isCH) return [
    {n:"Galaxus 🔵",   u:(q)=>`https://www.galaxus.ch/search?query=${encodeURIComponent(q)}`},
    {n:"Ricardo 🛒",   u:(q)=>`https://www.ricardo.ch/de/search?searchtext=${encodeURIComponent(q)}`},
  ];
  return [
    {n:`Amazon ${isDACH?'🇩🇪':isUK?'🇬🇧':isFR?'🇫🇷':'🌍'}`,
     u:(q)=>`https://www.${isDACH?'amazon.de':isUK?'amazon.co.uk':isFR?'amazon.fr':'amazon.com'}/s?k=${encodeURIComponent(q)}`},
    {n:`eBay ${isDACH?'🇩🇪':isUK?'🇬🇧':'🌍'}`,
     u:(q)=>`https://www.${isDACH?'ebay.de':isUK?'ebay.co.uk':'ebay.com'}/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
    {n:"Idealo 💰",
     u:(q)=>`https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${encodeURIComponent(q)}`},
  ];
}

// ── Emergency service search queries — keyed by GPS country, not UI language ──
// Used for Google Maps search buttons in the emergency screen.
// Fallback: English if no country-specific entry exists.
// Never uses UI language — the search must use terms locals actually search for.
const EMERGENCY_QUERIES = {
  // plumber_emergency
  plumber: {
    DE:'Sanitär Notdienst Rohrbruch',
    AT:'Klempner Notdienst Rohrbruch',
    CH:'Sanitärinstallateur Notdienst',
    GB:'emergency plumber 24h',
    IE:'emergency plumber 24h',
    US:'emergency plumber near me',
    AU:'emergency plumber near me',
    FR:'plombier urgence 24h',
    ES:'fontanero urgencias 24h',
    IT:'idraulico urgenza 24h',
    PT:'canalizador urgência 24h',
    PL:'awaryjny hydraulik 24h',
    NL:'loodgieter spoed 24h',
    BE:'plombier urgence 24h',
    SE:'akut rörmokare 24h',
    NO:'rørlegger nødhjelp 24h',
    DK:'blikkenslager nødreparation',
    FI:'putkimies hätäpalvelu 24h',
    GR:'υδραυλικός 24 ώρες επείγον',
    CY:'υδραυλικός 24 ώρες',
    RO:'instalator urgenta 24h',
    HU:'vízvezetékszerelő sürgős',
    CZ:'havarijní instalatér 24h',
    SK:'havarijný inštalatér 24h',
    RS:'hitni vodoinstalater 24h',
    HR:'hitni vodoinstalater 24h',
    BA:'hitni vodoinstalater 24h',
    ME:'hitni vodoinstalater 24h',
    MK:'водоводџија водоинсталатер итен',  // водоводџија is MK-specific (not Serbian), anchors Google Maps to North Macedonia
    BG:'авариен водопроводчик 24h',
    LT:'avarinis santechnikas 24h',
    LV:'avārijas santehniķis 24h',
    EE:'avariivõetud torumees 24h',
    SI:'urgentni vodovodar 24h',
    AL:'hidraulik urgjent 24h',
    XK:'hidraulik urgjent 24h',
    TR:'acil tesisatçı 24h',
    IL:'שרברב חירום 24 שעות',
    SA:'سباك طارئ 24 ساعة',
    AE:'emergency plumber 24h',
    JP:'緊急水道修理 24時間',
    KR:'긴급 배관공 24시간',
    CN:'紧急水管工 24小时',
    IN:'emergency plumber 24h',
    BR:'encanador emergência 24h',
    AR:'plomero urgencias 24h',
    ZA:'emergency plumber 24h',
    NG:'emergency plumber 24h',
    ID:'tukang ledeng darurat 24h',
    PH:'emergency plumber 24h',
  },
};

// Default English fallbacks per service key
const EMERGENCY_QUERY_FALLBACKS = {
  plumber: 'emergency plumber 24h',
};

/**
 * Returns a Google Maps search query localized to the GPS country.
 * Falls back to English if the country has no specific entry.
 * Never uses UI language — the query language follows the GPS country.
 *
 * @param {string} serviceKey - e.g. 'plumber'
 * @param {string} countryCode - ISO alpha-2 from GPS, e.g. 'GR'
 * @returns {string} search query in the local language
 */
export function getEmergencySearchQuery(serviceKey, countryCode) {
  const map = EMERGENCY_QUERIES[serviceKey];
  if (!map) return EMERGENCY_QUERY_FALLBACKS[serviceKey] || 'emergency service near me';
  return map[countryCode] || EMERGENCY_QUERY_FALLBACKS[serviceKey] || 'emergency service near me';
}

// ── Localized country name resolver ──────────────────────────────────────────
// Uses Intl.DisplayNames (built into every modern browser and Node 22+).
// GPS country code determines WHICH country; UI lang determines HOW it reads.
// 'sr' (Serbian) uses Latin script in this app → mapped to 'sr-Latn'.
const INTL_LANG_MAP = { sr: 'sr-Latn' };

// Maps country code → primary commerce/search language key (for store URLs + Google Maps).
// Completely independent of the UI language.
// Example: cc='DE' → 'de' even if UI is 'mk' (Macedonian).
// MK (North Macedonia) maps to 'de' because German-market stores (Amazon.de, FC-Moto, etc.)
// serve MK customers far better than any Macedonian-language e-commerce.
const CC_TO_MARKET_LANG = {
  DE:'de', AT:'de', CH:'de', LU:'de', LI:'de',
  GB:'en', US:'en', AU:'en', CA:'en', NZ:'en', IE:'en',
  FR:'fr', BE:'fr', MC:'fr',
  IT:'it', SM:'it', VA:'it',
  ES:'es', MX:'es', AR:'es', CL:'es', CO:'es',
  PL:'pl',
  RS:'sr', BA:'sr', ME:'sr',
  HR:'hr',
  MK:'mk',  // North Macedonia — users search in Macedonian
  TR:'tr',
  // Extended market coverage
  SE:'sv', NO:'no', DK:'da', FI:'fi',
  NL:'nl',
  PT:'pt', BR:'pt-br',  // separate: European vs Brazilian Portuguese
  GR:'el',
  CZ:'cs', SK:'sk',     // separate: Czech vs Slovak
  HU:'hu', RO:'ro', BG:'bg',
};

export function getMarketLang(cc) {
  return CC_TO_MARKET_LANG[String(cc||'').toUpperCase()] || 'en';
}

// Checks whether a string is in a latin-script language.
// Returns false if it contains Cyrillic, Greek, Arabic, CJK, etc.
function isLatinScript(str) {
  // Covers Basic Latin + Latin-1 Supplement + Latin Extended A/B (0x0000–0x024F)
  // This includes Polish (ą,ę,ś,ź,ż), French (é,è,ç), German (ä,ö,ü,ß),
  // Croatian (č,ć,đ,š,ž), Turkish (ğ,ı,ş), etc.
  // Cyrillic starts at 0x0400 — anything above 0x024F that isn't a space/punct is non-latin.
  if (!str) return true;
  for (let i = 0; i < str.length; i++) {
    const cp = str.codePointAt(i);
    // Allow: Basic Latin (0-127), Latin supplements (128-591), spaces, punctuation, digits
    if (cp > 0x024F && cp !== 0x20 && cp !== 0x2019 && cp !== 0x2018) {
      // Reject Cyrillic (0x0400+), Greek (0x0370+), Arabic (0x0600+), CJK (0x4E00+), etc.
      return false;
    }
  }
  return true;
}




// Latin-script market languages — queries must be in latin for these markets.
const LATIN_MARKET_LANGS = new Set([
  'de','en','fr','es','it','pl','hr','tr','sv','no','da','nl','pt','cs','hu','ro',
]);


/**
 * Detects whether a Parts search query needs market-language normalisation.
 * For synchronous/fallback use only — the full AI-based normalisation is handled
 * by /api/translate-part (called from App.jsx before opening store URLs).
 *
 * Returns the query as-is. The function is kept as a lightweight check point;
 * App.jsx calls translatePartForMarket() for the actual async normalisation.
 */
export function normalizeQueryForMarket(query, cc, category, vehicleCtx) {
  if (!query) return query;
  // Pass through — normalisation is handled asynchronously by translatePartForMarket
  return query;
}

/**
 * Returns true when a query is in the wrong script for the given market language.
 * Used by App.jsx to decide whether to call /api/translate-part.
 */
export function queryNeedsTranslation(query, cc, queryLang) {
  if (!query) return false;
  // If country is unknown (GPS not loaded yet), we cannot determine the market language.
  // Do not translate — open with the original query immediately.
  if (!cc || cc === 'DEFAULT') return false;
  const marketLang = getMarketLang(cc);
  if (!queryLang) return LATIN_MARKET_LANGS.has(marketLang) && !isLatinScript(query);
  return queryLang !== marketLang;
}


// ── Word-level translation for Cyrillic → Latin market language ───────────────
// Covers: MK (Macedonian), SR (Serbian), HR (Croatian Cyrillic), BG (Bulgarian)
// Strategy:
//   1. Split query into tokens (words, numbers, codes, dimensions)
//   2. Translate known Cyrillic descriptive words → market language equivalent
//   3. Always preserve: numbers, dimensions (50cc, 28mm, R134a), codes, brand names
//   4. Reassemble in order — the product structure is preserved

// Cyrillic → market-language translation tables for common repair part words.
// Each entry: [cyrillic_word_or_root, {de, en, fr, it, es, pl, hr, tr, nl, pt, sv}]
// Words are matched case-insensitively and root-matched (e.g. "филтер" matches "филтерот").


/**
 * Returns the country name for `cc` localized to `lang`.
 * Falls back to English if the locale or region is not supported.
 * Never hardcodes country name strings — all data comes from the browser's
 * ICU dataset via Intl.DisplayNames.
 *
 * @param {string} cc   - ISO 3166-1 alpha-2 country code, e.g. 'DE'
 * @param {string} lang - UI language code, e.g. 'it'
 * @returns {string}    - localized country name, e.g. 'Germania'
 */
export function getCountryName(cc, lang) {
  if (!cc || cc === 'DEFAULT') return '';
  const locale = INTL_LANG_MAP[lang] || lang;
  try {
    const dn = new Intl.DisplayNames([locale, 'en'], { type: 'region' });
    return dn.of(cc.toUpperCase()) || cc;
  } catch (_) {
    return cc;
  }
}

