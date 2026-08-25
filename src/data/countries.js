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
const STORES = {
  car: {
    DE:[
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay.de 🛒",u:(q)=>`https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
      {n:"Idealo.de 💰",u:(q)=>`https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${encodeURIComponent(q)}`},
    ],
    AT:[
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/en-en/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    CH:[
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GB:[
      {n:"Euro Car Parts 🔴",u:(q)=>`https://www.eurocarparts.com/search?q=${encodeURIComponent(q)}`},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FR:[
      {n:"Amazon.fr 📦",u:(q)=>`https://www.amazon.fr/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    US:[
      {n:"AutoZone 🔴",u:(q)=>`https://www.autozone.com/searchresult?searchtext=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"RockAuto 🔩",u:(q)=>`https://www.rockauto.com/en/partsearch/?query=${encodeURIComponent(q)}`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay 🛒",u:(q)=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
    ],
  
    mk:'продавница за авто делови сервис',
  },
  tech: {
    DE:[
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.de/de/search.html?query=${encodeURIComponent(q)}`},
      {n:"Saturn 🔵",u:(q)=>`https://www.saturn.de/de/search.html?query=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"Idealo.de 💰",u:(q)=>`https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${encodeURIComponent(q)}`},
    ],
    AT:[
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.at/de/search.html?query=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    CH:[
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.ch/de/search.html?query=${encodeURIComponent(q)}`},
      {n:"Digitec 💻",u:(q)=>`https://www.digitec.ch/search?q=${encodeURIComponent(q)}`},
    ],
    GB:[
      {n:"Currys 🔵",u:(q)=>`https://www.currys.co.uk/search?q=${encodeURIComponent(q)}`},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FR:[
      {n:"Fnac 🔵",u:(q)=>`https://www.fnac.com/SearchResult/ResultList.aspx?Search=${encodeURIComponent(q)}`},
      {n:"Darty 🔴",u:(q)=>`https://www.darty.com/nav/extra/search/search.html?type=SIMPLE&query=${encodeURIComponent(q)}`},
      {n:"Amazon.fr 📦",u:(q)=>`https://www.amazon.fr/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    US:[
      {n:"Best Buy 🔵",u:(q)=>`https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}`},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay 🛒",u:(q)=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
    ],
  
    mk:'сервис за компјутери мобилни телефони',
  },
  home: {
    DE:[
      {n:"OBI 🟡",u:(q)=>`https://www.obi.de/search/${encodeURIComponent(q)}/`},
      {n:"Bauhaus 🏗️",u:(q)=>`https://www.bauhaus.info/suche?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"Idealo.de 💰",u:(q)=>`https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${encodeURIComponent(q)}`},
    ],
    AT:[
      {n:"OBI 🟡",u:(q)=>`https://www.obi.at/search/${encodeURIComponent(q)}/`},
      {n:"Bauhaus 🏗️",u:(q)=>`https://www.bauhaus.at/suche?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    CH:[
      {n:"Bauhaus 🏗️",u:(q)=>`https://www.bauhaus.ch/suche?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GB:[
      {n:"B&Q 🟡",u:(q)=>`https://www.diy.com/search?q=${encodeURIComponent(q)}`},
      {n:"Screwfix 🔵",u:(q)=>`https://www.screwfix.com/search?q=${encodeURIComponent(q)}`},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    FR:[
      {n:"Leroy Merlin 🟢",u:(q)=>`https://www.leroymerlin.fr/recherche/${encodeURIComponent(q)}`},
      {n:"Castorama 🔵",u:(q)=>`https://www.castorama.fr/search?query=${encodeURIComponent(q)}`},
      {n:"Amazon.fr 📦",u:(q)=>`https://www.amazon.fr/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    US:[
      {n:"Home Depot 🟠",u:(q)=>`https://www.homedepot.com/s/${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Lowe's 🔵",u:(q)=>`https://www.lowes.com/search?searchTerm=${encodeURIComponent(q)}`},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    MK:[
      {n:"Leroy Merlin 🟢",u:(q)=>`https://www.leroymerlin.rs/pretraga?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay 🛒",u:(q)=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
    ],
    RS:[
      {n:"Leroy Merlin 🟢",u:(q)=>`https://www.leroymerlin.rs/pretraga?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    HR:[
      {n:"Bauhaus 🏗️",u:(q)=>`https://www.bauhaus.hr/suche?q=${encodeURIComponent(q)}`},
      {n:"Leroy Merlin 🟢",u:(q)=>`https://www.leroymerlin.hr/pretraga?q=${encodeURIComponent(q)}`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay 🛒",u:(q)=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
    ],
  
    mk:'продавница за градежни материјали',
  },
  appliances: {
    DE:[
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"MediaMarkt 🔴",u:(q)=>`https://www.mediamarkt.de/de/search.html?query=${encodeURIComponent(q)}`},
      {n:"Saturn 🔵",u:(q)=>`https://www.saturn.de/de/search.html?query=${encodeURIComponent(q)}`},
      {n:"Idealo.de 💰",u:(q)=>`https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${encodeURIComponent(q)}`},
    ],
    GB:[
      {n:"Currys 🔵",u:(q)=>`https://www.currys.co.uk/search?q=${encodeURIComponent(q)}`},
      {n:"AO.com 🟡",u:(q)=>`https://ao.com/search?q=${encodeURIComponent(q)}`},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    US:[
      {n:"Best Buy 🔵",u:(q)=>`https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}`},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay 🛒",u:(q)=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
    ],
  
    mk:'поправка апарати сервис бела техника',
  },
  garden: {
    DE:[
      {n:"OBI Garten 🌿",u:(q)=>`https://www.obi.de/search/${encodeURIComponent(q)}/`},
      {n:"Bauhaus Garten 🌱",u:(q)=>`https://www.bauhaus.info/suche?q=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GB:[
      {n:"B&Q Garden 🌿",u:(q)=>`https://www.diy.com/search?q=${encodeURIComponent(q)}`},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    US:[
      {n:"Home Depot Garden 🌿",u:(q)=>`https://www.homedepot.com/s/${encodeURIComponent(q)}`},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
  
    mk:'градинарски центар расадник цветна',
  },
  pets: {
    DE:[
      {n:"Zooplus 🐾",u:(q)=>`https://www.zooplus.de/shop/search?text=${encodeURIComponent(q)}`},
      {n:"Fressnapf 🐕",u:(q)=>`https://www.fressnapf.de/search?query=${encodeURIComponent(q)}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    GB:[
      {n:"Pets at Home 🐾",u:(q)=>`https://www.petsathome.com/shop/en/pets/search?q=${encodeURIComponent(q)}`},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    US:[
      {n:"PetSmart 🐾",u:(q)=>`https://www.petsmart.com/search/?q=${encodeURIComponent(q)}`,badge:"BEST"},
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
  
    mk:'продавница за миленици ветеринар',
  },
  bike: {
    DE:[
      {n:"Bike24 🚲",u:(q)=>`https://www.bike24.de/search?q=${encodeURIComponent(q)}`,badge:"TOP"},
      {n:"Fahrrad XXL 🏪",u:(q)=>`https://www.fahrrad-xxl.de/search/?query=${encodeURIComponent(q)}`},
      {n:"ROSE Bikes 🌹",u:(q)=>`https://www.rosebikes.de/search?q=${encodeURIComponent(q)}`},
      {n:"Bike-Discount 💰",u:(q)=>`https://www.bike-discount.de/catalogsearch/result/?q=${encodeURIComponent(q)}`},
      {n:"Decathlon 🏃",u:(q)=>`https://www.decathlon.de/search?Ntt=${encodeURIComponent(q.split(' ').slice(-2).join(' '))}`},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay.de 🛒",u:(q)=>`https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
    ],
    GB:[
      {n:"Wiggle 🔵",u:(q)=>`https://www.wiggle.co.uk/search/?q=${encodeURIComponent(q)}`},
      {n:"Amazon.co.uk 📦",u:(q)=>`https://www.amazon.co.uk/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
    ],
    DEFAULT:[
      {n:"Amazon 📦",u:(q)=>`https://www.amazon.com/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
      {n:"eBay 🛒",u:(q)=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`},
    ],
  
    mk:'продавница за велосипеди велосервис',
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
    MK:[
      {n:"FC-Moto 🏍️",u:(q)=>`https://www.fc-moto.com/en-en/?search=${encodeURIComponent(q)}`,badge:"BEST",types:["road","scooter","mx"]},
      {n:"Amazon.de 📦",u:(q)=>`https://www.amazon.de/s?tag=fixitapp-20&k=${encodeURIComponent(q)}`},
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
  const isDACH = ['DE','AT','CH'].includes(cc);
  const isUK   = cc === 'GB';
  const isFR   = cc === 'FR';
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

