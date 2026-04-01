import { createPretextBlockController } from "./pretext-layout.js";
import { createGrammarSliderTable } from "./grammar-slider-table.js";

const SUBCATEGORY_ALIASES = {
  Praeposition: "Präposition",
  "PrÃ¤position": "Präposition",
  "PrÃƒÂ¤position": "Präposition",
  "PrÃƒÆ’Ã‚Â¤position": "Präposition",
};

const TOPIC_CONFIG = {
  basics: { color: "#60a5fa" },
  vehicles: { color: "#fb923c" },
  nature: { color: "#4ade80" },
  food: { color: "#f87171" },
  travel: { color: "#facc15" },
  work: { color: "#818cf8" },
  health: { color: "#22d3ee" },
  people: { color: "#f472b6" },
  shopping: { color: "#34d399" },
  developertech: { color: "#0284c7" },
  itnetwork: { color: "#65a30d" },
};

const TOPIC_OPTIONS = Object.keys(TOPIC_CONFIG);
const SUBCATEGORY_OPTIONS = [
  "Nomen",
  "Verb",
  "Adjektiv",
  "Adverb",
  "Präposition",
  "Konjunktion",
  "Ausdruck",
  "Satz",
];
const CARD_SCOPE_OPTIONS = ["all", "de", "hr", "gb"];
const MODE_SCOPE_MAP = {
  de: "de",
  hr: "hr",
  en: "gb",
};
const searchSites = [
  { name: "dict.cc", icon: "C", url: (w) => `https://www.dict.cc/?s=${encodeURIComponent(w)}` },
  { name: "Google", icon: "G", url: (w) => `https://www.google.com/search?q=${encodeURIComponent(`${w} auf Deutsch`)}` },
  { name: "Linguee", icon: "L", url: (w) => `https://www.linguee.de/deutsch-englisch/search?query=${encodeURIComponent(w)}` },
  { name: "Leo", icon: "L", url: (w) => `https://dict.leo.org/german-english/${encodeURIComponent(w)}` },
];

const SESSION_SIZE = 10;
const SESSION_STORAGE_KEY = "germancro-session-cards";
const PUNCT = /[.,!?:;]/;
const FACTS_IMAGE_ROOT = "assets/facts";
const TOURISM_LINKS = {
  germany: "https://www.germany.travel/",
  states: {
    "baden-wuerttemberg": "https://www.tourismus-bw.de/",
    "bayern": "https://www.bayern.by/",
    "berlin": "https://www.visitberlin.de/",
    "brandenburg": "https://www.reiseland-brandenburg.de/",
    "bremen": "https://www.bremen-tourism.de/",
    "hamburg": "https://www.hamburg-tourism.de/",
    "hessen": "https://www.hessen-tourismus.de/",
    "mecklenburg-vorpommern": "https://www.auf-nach-mv.de/",
    "niedersachsen": "https://www.reiseland-niedersachsen.de/",
    "nordrhein-westfalen": "https://www.nrw-tourismus.de/",
    "rheinland-pfalz": "https://www.rlp-tourismus.com/",
    "saarland": "https://www.urlaub.saarland/",
    "sachsen": "https://www.sachsen-tourismus.de/",
    "sachsen-anhalt": "https://www.sachsen-anhalt-tourismus.de/",
    "schleswig-holstein": "https://www.sh-tourismus.de/",
    "thueringen": "https://www.thueringen-entdecken.de/",
  },
  countries: {
    "frankreich": "https://www.france.fr/",
    "spanien": "https://www.spain.info/",
    "england": "https://www.visitengland.com/",
    "schweden": "https://visitsweden.com/",
    "polen": "https://www.polen.travel/de/",
    "oesterreich": "https://www.austria.info/",
    "ungarn": "https://visithungary.com/",
    "kroatien": "https://croatia.hr/",
    "bosnien-herzegowina": "https://www.tourismbih.com/",
    "serbien": "https://www.serbia.travel/en",
    "nordmazedonien": "https://northmacedonia-timeless.com/",
    "albanien": "https://albania.al/",
    "griechenland": "https://www.visitgreece.gr/",
    "bulgarien": "https://bulgariatravel.org/en/",
    "tuerkei": "https://goturkiye.com/",
    "rumaenien": "https://www.romania.travel/",
    "ukraine": "https://ukraine.ua/visit/",
    "russland": "https://visitrussia.org.uk/",
    "weissrussland": "https://www.belarus.by/en/travel/",
    "tschechien": "https://www.visitczechia.com/",
    "slowakei": "https://slovakia.travel/en",
    "slowenien": "https://www.slovenia.info/en",
    "italien": "https://www.italia.it/en",
    "niederlande": "https://www.holland.com/global/tourism/discover-the-netherlands.htm",
    "belgien": "https://visitbelgium.com/",
    "daenemark": "https://www.visitdenmark.com/",
    "finnland": "https://www.visitfinland.com/",
    "norwegen": "https://www.visitnorway.com/",
    "irland": "https://www.ireland.com/",
    "schweiz": "https://www.myswitzerland.com/",
    "vatikanstadt": "https://www.vaticanstate.va/en/",
    "portugal": "https://www.visitportugal.com/",
    "montenegro": "https://www.montenegro.travel/en",
    "luxemburg": "https://www.visitluxembourg.com/",
    "liechtenstein": "https://tourismus.li/en/",
    "andorra": "https://visitandorra.com/en/",
    "kanada": "https://travel.destinationcanada.com/",
    "usa": "https://www.visittheusa.com/",
    "china": "https://www.visitchina.com/",
    "brasilien": "https://www.visitbrasil.com/",
    "australien": "https://www.australia.com/",
    "indien": "https://www.incredibleindia.gov.in/",
    "argentinien": "https://www.argentina.travel/en",
    "algerien": "https://www.algeria.com/",
    "mexiko": "https://www.visitmexico.com/en/",
    "indonesien": "https://www.indonesia.travel/gb/en/home",
    "japan": "https://www.japan.travel/en/",
    "suedkorea": "https://english.visitkorea.or.kr/",
    "pakistan": "https://www.tourism.gov.pk/",
    "bangladesch": "https://bangladeshtourismboard.gov.bd/",
    "nigeria": "https://tourism.gov.ng/",
    "aethiopien": "https://visitethiopia.et/",
    "aegypten": "https://www.experienceegypt.eg/",
    "suedafrika": "https://www.southafrica.net/gl/en/travel",
    "kasachstan": "https://kazakhstan.travel/en",
    "peru": "https://www.peru.travel/en",
    "kolumbien": "https://colombia.travel/en",
    "chile": "https://www.chile.travel/en/",
    "venezuela": "https://www.venezuelatuya.com/",
    "neuseeland": "https://www.newzealand.com/int/",
    "thailand": "https://www.tourismthailand.org/home",
    "vietnam": "https://vietnam.travel/",
  },
};
const OFFICIAL_LINKS = {
  germany: "https://www.deutschland.de/",
  states: {
    "baden-wuerttemberg": "https://www.baden-wuerttemberg.de/",
    "bayern": "https://www.bayern.de/",
    "berlin": "https://www.berlin.de/",
    "brandenburg": "https://www.brandenburg.de/",
    "bremen": "https://www.bremen.de/",
    "hamburg": "https://www.hamburg.de/",
    "hessen": "https://www.hessen.de/",
    "mecklenburg-vorpommern": "https://www.regierung-mv.de/",
    "niedersachsen": "https://www.niedersachsen.de/",
    "nordrhein-westfalen": "https://www.land.nrw/",
    "rheinland-pfalz": "https://www.rlp.de/",
    "saarland": "https://www.saarland.de/",
    "sachsen": "https://www.sachsen.de/",
    "sachsen-anhalt": "https://www.sachsen-anhalt.de/",
    "schleswig-holstein": "https://www.schleswig-holstein.de/",
    "thueringen": "https://thueringen.de/",
  },
  countries: {
    "frankreich": "https://www.gouvernement.fr/en",
    "spanien": "https://administracion.gob.es/",
    "england": "https://www.gov.uk/",
    "schweden": "https://sweden.se/",
    "polen": "https://www.gov.pl/web/gov",
    "oesterreich": "https://www.oesterreich.gv.at/en/",
    "ungarn": "https://abouthungary.hu/",
    "kroatien": "https://vlada.gov.hr/?lang=en",
    "bosnien-herzegowina": "https://bih.gov.ba/?lang=en",
    "serbien": "https://www.srbija.gov.rs/?lang=en-US",
    "nordmazedonien": "https://vlada.mk/?ln=en-gb",
    "albanien": "https://albania.al/",
    "griechenland": "https://www.gov.gr/en/",
    "bulgarien": "https://www.government.bg/en",
    "tuerkei": "https://www.turkiye.gov.tr/",
    "rumaenien": "https://www.romania.gov.ro/en/",
    "ukraine": "https://www.ukraine.ua/",
    "russland": "https://government.ru/en/",
    "weissrussland": "https://www.belarus.by/en/",
    "tschechien": "https://www.czech.cz/en/",
    "slowakei": "https://welcometoslovakia.gov.sk/",
    "slowenien": "https://slovenia.si/",
    "italien": "https://www.governo.it/en",
    "niederlande": "https://www.government.nl/",
    "belgien": "https://www.belgium.be/en",
    "daenemark": "https://denmark.dk/",
    "finnland": "https://finland.fi/",
    "norwegen": "https://www.norge.no/en",
    "irland": "https://www.gov.ie/en/",
    "schweiz": "https://www.admin.ch/gov/en/start.html",
    "vatikanstadt": "https://www.vaticanstate.va/en/",
    "portugal": "https://www.portugal.gov.pt/en/gc23",
    "montenegro": "https://www.gov.me/en",
    "luxemburg": "https://gouvernement.lu/en.html",
    "liechtenstein": "https://www.liechtenstein.li/en/",
    "andorra": "https://www.govern.ad/en/",
    "kanada": "https://www.canada.ca/en.html",
    "usa": "https://www.usa.gov/",
    "china": "https://english.www.gov.cn/",
    "brasilien": "https://www.gov.br/planalto/en",
    "australien": "https://www.australia.gov.au/",
    "indien": "https://www.india.gov.in/",
    "argentinien": "https://www.argentina.gob.ar/",
    "algerien": "https://www.interieur.gov.dz/",
    "dr-kongo": "https://www.primature.gouv.cd/",
    "saudi-arabien": "https://www.my.gov.sa/wps/portal/snp/main",
    "mexiko": "https://www.gob.mx/",
    "indonesien": "https://indonesia.go.id/",
    "sudan": "https://www.sudan.gov.sd/",
    "libyen": "https://government.gov.ly/",
    "iran": "https://en.irna.ir/",
    "mongolei": "https://mongolia.gov.mn/en/",
    "japan": "https://www.japan.go.jp/",
    "suedkorea": "https://www.korea.net/",
    "pakistan": "https://www.pakistan.gov.pk/",
    "bangladesch": "https://bangladesh.gov.bd/index.php",
    "nigeria": "https://statehouse.gov.ng/",
    "aethiopien": "https://pmo.gov.et/",
    "aegypten": "https://www.sis.gov.eg/",
    "suedafrika": "https://www.gov.za/",
    "kasachstan": "https://www.gov.kz/memleket/entities?lang=en",
    "peru": "https://www.gob.pe/en/",
    "kolumbien": "https://www.gov.co/",
    "chile": "https://www.gob.cl/en/",
    "venezuela": "https://mppre.gob.ve/en/",
    "neuseeland": "https://www.govt.nz/",
    "thailand": "https://www.thaigov.go.th/",
    "vietnam": "https://en.vietnamplus.vn/",
  },
  world: "https://www.un.org/en/",
};
const EUROPE_FLAG_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 90" role="img" aria-label="Flagge Europas">
    <rect width="150" height="90" fill="#003399"/>
    <g fill="#ffcc00">
      <circle cx="75" cy="19" r="3.2"/>
      <circle cx="89" cy="22.8" r="3.2"/>
      <circle cx="99.2" cy="33" r="3.2"/>
      <circle cx="103" cy="45" r="3.2"/>
      <circle cx="99.2" cy="57" r="3.2"/>
      <circle cx="89" cy="67.2" r="3.2"/>
      <circle cx="75" cy="71" r="3.2"/>
      <circle cx="61" cy="67.2" r="3.2"/>
      <circle cx="50.8" cy="57" r="3.2"/>
      <circle cx="47" cy="45" r="3.2"/>
      <circle cx="50.8" cy="33" r="3.2"/>
      <circle cx="61" cy="22.8" r="3.2"/>
    </g>
  </svg>`
)}`;
const FACTS_LOCALE_PATCHES = {
  de: {
    facts: {
      panelSubtitle: "Deutschland, Bundeslaender, Europa und Welt im Ueberblick.",
      tabs: { world: "Welt" },
      fields: {
        headquarters: "Hauptsitz",
        memberStates: "UN-Mitgliedstaaten",
        secretaryGeneral: "UN-Generalsekretaer",
        officialLanguages: "Amtssprachen"
      },
      featured: { overview: "Im Ueberblick", europeOverview: "EU im Ueberblick", worldOverview: "UN im Ueberblick" },
      names: {
        europe: "EU",
        world: "UN",
        countries: {
          "schweiz": "Schweiz",
          "vatikanstadt": "Vatikanstadt",
          "portugal": "Portugal",
          "montenegro": "Montenegro",
          "luxemburg": "Luxemburg",
          "liechtenstein": "Liechtenstein",
          "andorra": "Andorra",
          "liechtenstein": "Liechtenstein",
          "kosovo": "Kosovo",
          "kanada": "Kanada",
          "usa": "USA",
          "china": "China",
          "brasilien": "Brasilien",
          "australien": "Australien",
          "indien": "Indien",
          "argentinien": "Argentinien",
          "algerien": "Algerien",
          "dr-kongo": "DR Kongo",
          "saudi-arabien": "Saudi-Arabien",
          "mexiko": "Mexiko",
          "indonesien": "Indonesien",
          "sudan": "Sudan",
          "libyen": "Libyen",
          "iran": "Iran",
          "mongolei": "Mongolei",
          "japan": "Japan",
          "suedkorea": "Suedkorea",
          "pakistan": "Pakistan",
          "bangladesch": "Bangladesch",
          "nigeria": "Nigeria",
          "aethiopien": "Aethiopien",
          "aegypten": "Aegypten",
          "suedafrika": "Suedafrika",
          "kasachstan": "Kasachstan",
          "peru": "Peru",
          "kolumbien": "Kolumbien",
          "chile": "Chile",
          "venezuela": "Venezuela",
          "neuseeland": "Neuseeland",
          "thailand": "Thailand",
          "vietnam": "Vietnam"
        }
      },
      regions: {
        "Nordamerika": "Nordamerika",
        "Suedamerika": "Suedamerika",
        "Ostasien": "Ostasien",
        "Ozeanien": "Ozeanien",
        "Suedasien": "Suedasien",
        "Nordafrika": "Nordafrika",
        "Zentralafrika": "Zentralafrika",
        "Westasien": "Westasien",
        "Suedostasien": "Suedostasien",
        "Westafrika": "Westafrika",
        "Ostafrika": "Ostafrika",
        "Suedafrika": "Suedafrika",
        "Zentralasien": "Zentralasien",
        "Osteuropa": "Osteuropa",
        "Suedosteuropa und Vorderasien": "Suedosteuropa und Vorderasien"
      },
      stateForms: {
        "Globale Staatenorganisation": "Globale Staatenorganisation"
      },
      values: {
        europeOverviewText: "Die EU verbindet {memberStates} Mitgliedstaaten. Politisches Zentrum ist {capital}; zentrale Institutionen sind {institutions}.",
        worldOverviewText: "Die UN vereint {memberStates} Mitgliedstaaten. Hauptsitz ist {headquarters}; zentrale Organe sind {institutions}."
      }
    }
  },
  hr: {
    facts: {
      panelSubtitle: "Njemacka, savezne zemlje, Europa i svijet na jednom mjestu.",
      tabs: { world: "Svijet" },
      fields: {
        headquarters: "Sjediste",
        memberStates: "Drzave clanice UN-a",
        secretaryGeneral: "Glavni tajnik UN-a",
        officialLanguages: "Sluzbeni jezici"
      },
      featured: { overview: "Ukratko", europeOverview: "EU ukratko", worldOverview: "UN ukratko" },
      names: {
        europe: "EU",
        world: "UN",
        countries: {
          "schweiz": "Svicarska",
          "vatikanstadt": "Vatikan",
          "portugal": "Portugal",
          "montenegro": "Crna Gora",
          "luxemburg": "Luksemburg",
          "liechtenstein": "Lihtenstajn",
          "andorra": "Andora",
          "liechtenstein": "Lihtenstajn",
          "kosovo": "Kosovo",
          "kanada": "Kanada",
          "usa": "SAD",
          "china": "Kina",
          "brasilien": "Brazil",
          "australien": "Australija",
          "indien": "Indija",
          "argentinien": "Argentina",
          "algerien": "Alzir",
          "dr-kongo": "DR Kongo",
          "saudi-arabien": "Saudijska Arabija",
          "mexiko": "Meksiko",
          "indonesien": "Indonezija",
          "sudan": "Sudan",
          "libyen": "Libija",
          "iran": "Iran",
          "mongolei": "Mongolija",
          "japan": "Japan",
          "suedkorea": "Juzna Koreja",
          "pakistan": "Pakistan",
          "bangladesch": "Banglades",
          "nigeria": "Nigerija",
          "aethiopien": "Etiopija",
          "aegypten": "Egipat",
          "suedafrika": "Juznoafricka Republika",
          "kasachstan": "Kazahstan",
          "peru": "Peru",
          "kolumbien": "Kolumbija",
          "chile": "Cile",
          "venezuela": "Venezuela",
          "neuseeland": "Novi Zeland",
          "thailand": "Tajland",
          "vietnam": "Vijetnam"
        }
      },
      regions: {
        "Nordamerika": "Sjeverna Amerika",
        "Suedamerika": "Juzna Amerika",
        "Ostasien": "Istocna Azija",
        "Ozeanien": "Oceanija",
        "Suedasien": "Juzna Azija",
        "Nordafrika": "Sjeverna Afrika",
        "Zentralafrika": "Sredisnja Afrika",
        "Westasien": "Zapadna Azija",
        "Suedostasien": "Jugoistocna Azija",
        "Westafrika": "Zapadna Afrika",
        "Ostafrika": "Istocna Afrika",
        "Suedafrika": "Juzna Afrika",
        "Zentralasien": "Sredisnja Azija",
        "Osteuropa": "Istocna Europa",
        "Suedosteuropa und Vorderasien": "Jugoistocna Europa i Zapadna Azija"
      },
      stateForms: {
        "Globale Staatenorganisation": "globalna organizacija drzava"
      },
      values: {
        europeOverviewText: "EU povezuje {memberStates} drzava clanica. Politicko sredisiste je {capital}, a glavne institucije su {institutions}.",
        worldOverviewText: "UN okuplja {memberStates} drzave clanice. Glavno sjediste je u {headquarters}, a glavna tijela su {institutions}."
      }
    }
  },
  en: {
    facts: {
      panelSubtitle: "Germany, its states, Europe, and the world at a glance.",
      tabs: { world: "World" },
      fields: {
        headquarters: "Headquarters",
        memberStates: "UN member states",
        secretaryGeneral: "UN Secretary-General",
        officialLanguages: "Official languages"
      },
      featured: { overview: "At a glance", europeOverview: "EU at a glance", worldOverview: "UN at a glance" },
      names: {
        europe: "EU",
        world: "UN",
        countries: {
          "schweiz": "Switzerland",
          "vatikanstadt": "Vatican City",
          "portugal": "Portugal",
          "montenegro": "Montenegro",
          "luxemburg": "Luxembourg",
          "liechtenstein": "Liechtenstein",
          "andorra": "Andorra",
          "liechtenstein": "Liechtenstein",
          "kosovo": "Kosovo",
          "kanada": "Canada",
          "usa": "USA",
          "china": "China",
          "brasilien": "Brazil",
          "australien": "Australia",
          "indien": "India",
          "argentinien": "Argentina",
          "algerien": "Algeria",
          "dr-kongo": "DR Congo",
          "saudi-arabien": "Saudi Arabia",
          "mexiko": "Mexico",
          "indonesien": "Indonesia",
          "sudan": "Sudan",
          "libyen": "Libya",
          "iran": "Iran",
          "mongolei": "Mongolia",
          "japan": "Japan",
          "suedkorea": "South Korea",
          "pakistan": "Pakistan",
          "bangladesch": "Bangladesh",
          "nigeria": "Nigeria",
          "aethiopien": "Ethiopia",
          "aegypten": "Egypt",
          "suedafrika": "South Africa",
          "kasachstan": "Kazakhstan",
          "peru": "Peru",
          "kolumbien": "Colombia",
          "chile": "Chile",
          "venezuela": "Venezuela",
          "neuseeland": "New Zealand",
          "thailand": "Thailand",
          "vietnam": "Vietnam"
        }
      },
      regions: {
        "Nordamerika": "North America",
        "Suedamerika": "South America",
        "Ostasien": "East Asia",
        "Ozeanien": "Oceania",
        "Suedasien": "South Asia",
        "Nordafrika": "North Africa",
        "Zentralafrika": "Central Africa",
        "Westasien": "West Asia",
        "Suedostasien": "Southeast Asia",
        "Westafrika": "West Africa",
        "Ostafrika": "East Africa",
        "Suedafrika": "Southern Africa",
        "Zentralasien": "Central Asia",
        "Osteuropa": "Eastern Europe",
        "Suedosteuropa und Vorderasien": "Southeastern Europe and West Asia"
      },
      stateForms: {
        "Globale Staatenorganisation": "global organization of states"
      },
      values: {
        europeOverviewText: "The EU brings together {memberStates} member states. Its political center is {capital}, and key institutions include {institutions}.",
        worldOverviewText: "The UN brings together {memberStates} member states. Its headquarters are in {headquarters}, and key bodies include {institutions}."
      }
    }
  }
};
const STATE_NOTABLE_PEOPLE = {
  "baden-wuerttemberg": {
    science: ["Albert Einstein", "Johannes Kepler", "Carl Benz"],
    politics: ["Theodor Heuss", "Carlo Schmid", "Winfried Kretschmann"],
    art: ["Friedrich Schiller", "Hermann Hesse", "Otto Dix"],
  },
  bayern: {
    science: ["Werner Heisenberg", "Carl von Linde", "Rudolf Diesel"],
    politics: ["Franz Josef Strauss", "Kurt Eisner", "Markus Soeder"],
    art: ["Richard Wagner", "Franz Marc", "Oskar Maria Graf"],
  },
  berlin: {
    science: ["Albert Einstein", "Max Planck", "Rudolf Virchow"],
    politics: ["Willy Brandt", "Angela Merkel", "Walter Rathenau"],
    art: ["Marlene Dietrich", "Käthe Kollwitz", "Bertolt Brecht"],
  },
  brandenburg: {
    science: ["Hermann von Helmholtz", "Hasso Plattner", "Karl Foerster"],
    politics: ["Matthias Platzeck", "Dietmar Woidke", "Manfred Stolpe"],
    art: ["Heinrich von Kleist", "Theodor Fontane", "Wolfgang Joop"],
  },
  bremen: {
    science: ["Heinrich Wilhelm Olbers", "Adolf Bastian"],
    politics: ["Hans Koschnick", "Henning Scherf", "Karl Carstens"],
    art: ["Paula Modersohn-Becker", "Loriot", "Wilhelm Wagenfeld"],
  },
  hamburg: {
    science: ["Otto Stern", "Ernst Ruska", "Klaus Hasselmann"],
    politics: ["Helmut Schmidt", "Olaf Scholz", "Peter Tschentscher"],
    art: ["Johannes Brahms", "Udo Lindenberg", "Wolfgang Borchert"],
  },
  hessen: {
    science: ["Paul Ehrlich", "Robert Bunsen", "Otto Hahn"],
    politics: ["Joschka Fischer", "Georg-August Zinn", "Volker Bouffier"],
    art: ["Johann Wolfgang von Goethe", "Brüder Grimm", "Anne Frank"],
  },
  "mecklenburg-vorpommern": {
    science: ["Heinrich Schliemann", "Albrecht Kossel", "Otto Lilienthal"],
    politics: ["Angela Merkel", "Manuela Schwesig", "Joachim Gauck"],
    art: ["Caspar David Friedrich", "Fritz Reuter", "Uwe Johnson"],
  },
  niedersachsen: {
    science: ["Carl Friedrich Gauss", "Wilhelm Weber", "David Hilbert"],
    politics: ["Gerhard Schröder", "Christian Wulff", "Ernst Albrecht"],
    art: ["Wilhelm Busch", "Kurt Schwitters", "Niki de Saint Phalle"],
  },
  "nordrhein-westfalen": {
    science: ["Harald zur Hausen", "Max Born", "Julius Plücker"],
    politics: ["Konrad Adenauer", "Johannes Rau", "Armin Laschet"],
    art: ["Ludwig van Beethoven", "Heinrich Böll", "Joseph Beuys"],
  },
  "rheinland-pfalz": {
    science: ["Johannes Gutenberg", "Hermann Staudinger", "Julius Richard Petri"],
    politics: ["Helmut Kohl", "Malu Dreyer", "Kurt Beck"],
    art: ["Hildegard von Bingen", "Max Slevogt", "Thomas Nast"],
  },
  saarland: {
    science: ["Peter Grünberg", "Wolfgang Wahlster"],
    politics: ["Oskar Lafontaine", "Heiko Maas", "Annegret Kramp-Karrenbauer"],
    art: ["Max Ophüls", "Nicole", "Gerd Dudenhöffer"],
  },
  sachsen: {
    science: ["Gottfried Wilhelm Leibniz", "Wilhelm Ostwald", "Manfred von Ardenne"],
    politics: ["August Bebel", "Kurt Biedenkopf", "Stanislaw Tillich"],
    art: ["Richard Wagner", "Erich Kästner", "Caspar David Friedrich"],
  },
  "sachsen-anhalt": {
    science: ["Otto von Guericke", "Dorothea Erxleben", "Georg Cantor"],
    politics: ["Hans-Dietrich Genscher", "Reiner Haseloff", "Wolfgang Böhmer"],
    art: ["Georg Friedrich Händel", "Lyonel Feininger", "Johann Joachim Winckelmann"],
  },
  "schleswig-holstein": {
    science: ["Max Planck", "Otto Diels", "Ferdinand Tönnies"],
    politics: ["Willy Brandt", "Heide Simonis", "Daniel Günther"],
    art: ["Thomas Mann", "Günter Grass", "Emil Nolde"],
  },
  thueringen: {
    science: ["Carl Zeiss", "Ernst Abbe", "Johann Wolfgang Döbereiner"],
    politics: ["Bodo Ramelow", "Christine Lieberknecht", "Bernhard Vogel"],
    art: ["Johann Sebastian Bach", "Johann Wolfgang von Goethe", "Friedrich Schiller"],
  },
};

let allCards = [];
let persistentCards = [];
let sessionOnlyCards = [];
let selectedTopics = null;
let capabilities = { persistentSave: false };

let sessionCards = [];
let sessionIndex = 0;
let streak = 0;
let bestStreak = 0;
let totalCorrect = 0;
let totalAttempts = 0;
let forceCorrection = false;
let sessionStart = 0;
let totalCharsTyped = 0;
let difficulty = "easy";
let previousTypedValue = "";
let feedbackBurstTimer = null;
let answerGuideCompleteTimer = null;
let learningMode = "de";
let isPromptOrderSwapped = false;
let isSettingsOpen = false;
let germanyFacts = null;
let europeFacts = null;
let worldFacts = null;
let factsMode = "germany";
let selectedStateId = null;
let selectedEuropeCountryId = null;
let selectedWorldCountryId = null;
let locales = null;

const LEARNING_MODE_STORAGE_KEY = "germancro.learningMode";
const PROMPT_ORDER_STORAGE_KEY = "germancro.promptOrderSwapped";
const LANGUAGE_SEQUENCE = ["de", "hr", "en"];
const LANGUAGE_FLAGS = {
  de: "🇩🇪",
  hr: "🇭🇷",
  en: "🇬🇧",
};
const LANGUAGE_DOCK_LABELS = {
  de: "DE",
  hr: "HR",
  en: "GB",
};
const LANGUAGE_TITLES = {
  de: "Germancro",
  hr: "Crogerman",
  en: "Mancroger",
};
const promptEl = document.getElementById("promptText");
const promptSub = document.getElementById("promptSub");
const promptPrimaryFlagEl = document.getElementById("promptPrimaryFlag");
const promptSecondaryFlagEl = document.getElementById("promptSecondaryFlag");
const promptSwapBtn = document.getElementById("promptSwapBtn");
const inputFlagEl = document.querySelector(".input-flag");
const siteTitleEl = document.querySelector(".site-title");
const siteTitleRowEl = document.querySelector(".site-title-row");
const heroStageEl = document.getElementById("heroStage");
const phoneGuideBarEl = document.getElementById("phoneGuideBar");
const languageDockEl = document.getElementById("languageDock");
const languageDockButtons = Array.from(document.querySelectorAll(".language-dock-btn"));
const appLoaderEl = document.getElementById("appLoader");
const appLoaderSpinnerEl = document.getElementById("appLoaderSpinner");
const installGuidePanelEl = document.getElementById("installGuidePanel");
const installGuideBrowserPanelEl = document.getElementById("installGuideBrowserPanel");
const installGuideBrowserEl = document.getElementById("installGuideBrowser");
const installGuideStepsEl = document.getElementById("installGuideSteps");
const statLabelStreakEl = document.getElementById("statLabelStreak");
const statLabelRemainingEl = document.getElementById("statLabelRemaining");
const statLabelAccuracyEl = document.getElementById("statLabelAccuracy");
const statLabelWpmEl = document.getElementById("statLabelWpm");
const cardLegendEl = document.getElementById("cardLegend");
const legendCorrectEl = document.getElementById("legendCorrect");
const legendNextEl = document.getElementById("legendNext");
const legendWrongEl = document.getElementById("legendWrong");
const skipCardBtnEl = document.getElementById("skipCardBtn");
const skipCardBtnLabelEl = document.getElementById("skipCardBtnLabel");
const promptHeadTitleEl = document.getElementById("promptHeadTitle");
const inputEl = document.getElementById("answer");
const solutionEl = document.getElementById("solution");
const wordGrid = document.getElementById("wordGrid");
const answerGuideEl = document.getElementById("answerGuide");
const answerGuideLabelEl = document.getElementById("answerGuideLabel");
const answerGuideStatusEl = document.getElementById("answerGuideStatus");
const answerGuideNoteEl = document.getElementById("answerGuideNote");
const feedbackBurstEl = document.getElementById("feedbackBurst");
const progFill = document.getElementById("progressFill");
const categoryEl = document.getElementById("categoryBadge");
const comboPop = document.getElementById("comboPop");
const gameArea = document.getElementById("gameArea");
const sessionEndEl = document.getElementById("sessionEnd");
const mainCard = document.getElementById("mainCard");
const progressTrackEl = document.querySelector(".progress-track");
const statsBarEl = document.querySelector(".stats-bar");
const catPanelEl = document.getElementById("catPanel");
const catCountEl = document.getElementById("catCount");
const catPanelTitleEl = document.getElementById("catPanelTitle");
const difficultyHardBtn = document.getElementById("difficultyHardBtn");
const difficultyMediumBtn = document.getElementById("difficultyMediumBtn");
const difficultyEasyBtn = document.getElementById("difficultyEasyBtn");
const sliderUnitLabelEl = document.getElementById("sliderUnitLabel");
const newGameBtn = document.getElementById("newGameBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsBtnLabelEl = settingsBtn ? settingsBtn.querySelector("span:last-child") : null;
const switchOrderBtn = document.getElementById("switchOrderBtn");
const switchOrderBtnLabelEl = switchOrderBtn ? switchOrderBtn.querySelector("span:last-child") : null;
const searchPanelEl = document.getElementById("searchPanel");
const searchPanelTitleEl = document.getElementById("searchPanelTitle");
const searchPanelSubtitleEl = document.getElementById("searchPanelSubtitle");
const grammarSectionTitleEl = document.getElementById("grammarSectionTitle");
const grammarGridEl = document.getElementById("grammarGrid");
const searchLinksEl = document.getElementById("searchLinks");
const authorPanelEl = document.getElementById("authorPanel");
const authorToggleBtn = document.getElementById("authorToggleBtn");
const authorPanelTitleEl = document.getElementById("authorPanelTitle");

const addCardForm = document.getElementById("addCardForm");
const addCardDeEl = document.getElementById("newCardDe");
const addCardHrEl = document.getElementById("newCardHr");
const addCardEnEl = document.getElementById("newCardEn");
const addCardTopicEl = document.getElementById("newCardTopic");
const addCardSubcategoryEl = document.getElementById("newCardSubcategory");
const addCardScopeEl = document.getElementById("newCardScope");
const authorLabelDeEl = document.getElementById("authorLabelDe");
const authorLabelTopicEl = document.getElementById("authorLabelTopic");
const authorLabelSubcategoryEl = document.getElementById("authorLabelSubcategory");
const authorLabelScopeEl = document.getElementById("authorLabelScope");
const authorLabelHrEl = document.getElementById("authorLabelHr");
const authorLabelEnEl = document.getElementById("authorLabelEn");
const addCardSaveBtn = document.getElementById("addCardSaveBtn");
const exportCardsBtn = document.getElementById("exportCardsBtn");
const addCardStatusEl = document.getElementById("addCardStatus");
const authorModeEl = document.getElementById("authorMode");
const factsPanelTitleEl = document.getElementById("factsPanelTitle");
const factsPanelSubtitleEl = document.getElementById("factsPanelSubtitle");
const factsCountryBtn = document.getElementById("factsCountryBtn");
const factsStatesBtn = document.getElementById("factsStatesBtn");
const factsWorldBtn = document.getElementById("factsWorldBtn");
const statePickerWrap = document.getElementById("statePickerWrap");
const statePickerEl = document.getElementById("statePicker");
const factsContentEl = document.getElementById("factsContent");
const factsPanelEl = document.querySelector(".facts-panel");
const hintBtnEl = document.getElementById("hintBtn");
const enterHintTextEl = document.getElementById("enterHintText");
const sessionEndLabelEl = document.getElementById("sessionEndLabel");
const restartBtnEl = document.getElementById("restartBtn");
const siteFooterLinkEl = document.getElementById("siteFooterLink");
let appLoaderStartedAt = Date.now();
let grammarSliderControllers = [];
let languageDockZoomFrame = 0;
let installGuideLayoutFrame = 0;
const viewportProfile = {
  width: 0,
  height: 0,
  maxObservedWidth: 0,
  maxObservedHeight: 0,
  isPhonePortrait: false,
  initialized: false,
  syncFrame: 0,
  keyboardLayoutLocked: false,
  keyboardLayoutReleaseTimer: 0,
};

function isPhonePortraitLayoutActive() {
  return viewportProfile.isPhonePortrait;
}

function isTouchKeyboardEnvironment() {
  return Boolean(
    window.matchMedia?.("(pointer: coarse)").matches ||
    window.matchMedia?.("(hover: none)").matches ||
    "ontouchstart" in window
  );
}

function setStableViewportCssVars(viewport) {
  if (!viewport) {
    return;
  }

  const width = Math.max(0, Math.round(viewport.width || 0));
  const height = Math.max(0, Math.round(viewport.height || 0));
  document.documentElement.style.setProperty("--app-stable-viewport-width", `${width}px`);
  document.documentElement.style.setProperty("--app-stable-viewport-height", `${height}px`);
}

function lockViewportLayoutForKeyboard() {
  if (!isTouchKeyboardEnvironment()) {
    return;
  }

  viewportProfile.keyboardLayoutLocked = true;
  if (viewportProfile.keyboardLayoutReleaseTimer) {
    window.clearTimeout(viewportProfile.keyboardLayoutReleaseTimer);
    viewportProfile.keyboardLayoutReleaseTimer = 0;
  }
}

function releaseViewportLayoutAfterKeyboard(delay = 420) {
  if (!isTouchKeyboardEnvironment()) {
    scheduleViewportProfileSync();
    return;
  }

  if (viewportProfile.keyboardLayoutReleaseTimer) {
    window.clearTimeout(viewportProfile.keyboardLayoutReleaseTimer);
  }

  viewportProfile.keyboardLayoutReleaseTimer = window.setTimeout(() => {
    viewportProfile.keyboardLayoutReleaseTimer = 0;
    viewportProfile.keyboardLayoutLocked = false;
    scheduleViewportProfileSync();
  }, delay);
}

function activateTouchInputWithoutScroll(event) {
  if (!isTouchKeyboardEnvironment() || !inputEl || document.activeElement === inputEl) {
    return;
  }

  lockViewportLayoutForKeyboard();
  event.preventDefault();
  focusAnswerInputWithoutScroll();
  const caretPosition = inputEl.value.length;
  try {
    inputEl.setSelectionRange(caretPosition, caretPosition);
  } catch {
    // ignore inputs that do not support selection APIs
  }
}

function focusAnswerInputWithoutScroll() {
  if (!inputEl) {
    return;
  }

  try {
    inputEl.focus({ preventScroll: true });
  } catch {
    inputEl.focus();
  }
}

function getViewportSize() {
  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const height = window.innerHeight || document.documentElement.clientHeight || 0;

  return {
    width: Math.max(0, Math.round(width)),
    height: Math.max(0, Math.round(height)),
  };
}

function renderPhoneInstallGuide(browserText, stepsText) {
  if (!phoneGuideBarEl) {
    return;
  }

  const browserLine = document.createElement("span");
  browserLine.className = "phone-guide-bar-browser";
  browserLine.textContent = browserText;

  const stepsLine = document.createElement("span");
  stepsLine.className = "phone-guide-bar-steps";
  stepsLine.textContent = stepsText;

  phoneGuideBarEl.replaceChildren(browserLine, stepsLine);
}

function isSessionEndVisible() {
  return Boolean(sessionEndEl) && window.getComputedStyle(sessionEndEl).display !== "none";
}

function setGameSurfaceMode(showSessionEnd) {
  if (!gameArea || !sessionEndEl) {
    return;
  }

  gameArea.style.display = showSessionEnd ? "none" : "";
  sessionEndEl.style.display = showSessionEnd ? "flex" : "none";
}

function syncViewportProfile() {
  viewportProfile.syncFrame = 0;

  const measuredViewport = getViewportSize();
  const shouldKeepStableViewport =
    viewportProfile.keyboardLayoutLocked &&
    viewportProfile.width > 0 &&
    Math.abs(measuredViewport.width - viewportProfile.width) <= 2;
  const nextViewport = shouldKeepStableViewport
    ? {
        width: viewportProfile.width,
        height: viewportProfile.height,
      }
    : measuredViewport;

  if (!shouldKeepStableViewport) {
    viewportProfile.keyboardLayoutLocked = false;
  }

  viewportProfile.maxObservedWidth = Math.max(viewportProfile.maxObservedWidth, nextViewport.width);
  viewportProfile.maxObservedHeight = Math.max(viewportProfile.maxObservedHeight, nextViewport.height);
  setStableViewportCssVars(nextViewport);

  const widthRatio = viewportProfile.maxObservedWidth > 0
    ? nextViewport.width / viewportProfile.maxObservedWidth
    : 1;
  const heightRatio = viewportProfile.maxObservedHeight > 0
    ? nextViewport.height / viewportProfile.maxObservedHeight
    : 1;
  updateLanguageDockZoom(Math.min(widthRatio, heightRatio), nextViewport);

  const nextPhonePortrait = true;
  const layoutChanged = viewportProfile.isPhonePortrait !== nextPhonePortrait;
  const sizeChanged =
    viewportProfile.width !== nextViewport.width ||
    viewportProfile.height !== nextViewport.height;

  viewportProfile.width = nextViewport.width;
  viewportProfile.height = nextViewport.height;
  viewportProfile.isPhonePortrait = nextPhonePortrait;

  document.body.classList.toggle("layout-phone-portrait", nextPhonePortrait);
  setGameSurfaceMode(isSessionEndVisible());

  if (sizeChanged || layoutChanged) {
    maybeShowInstallGuide();
  }
}

function scheduleViewportProfileSync() {
  if (viewportProfile.syncFrame) {
    return;
  }

  viewportProfile.syncFrame = window.requestAnimationFrame(syncViewportProfile);
}

function initViewportProfile() {
  if (!viewportProfile.initialized) {
    viewportProfile.initialized = true;
    if ("virtualKeyboard" in navigator && navigator.virtualKeyboard) {
      navigator.virtualKeyboard.overlaysContent = true;
    }
    window.addEventListener("load", scheduleViewportProfileSync, { passive: true });
    window.addEventListener("pageshow", syncViewportProfile, { passive: true });
    window.addEventListener("resize", scheduleViewportProfileSync, { passive: true });
    window.addEventListener("orientationchange", scheduleViewportProfileSync, { passive: true });
  }

  if (viewportProfile.syncFrame) {
    window.cancelAnimationFrame(viewportProfile.syncFrame);
    viewportProfile.syncFrame = 0;
  }

  syncViewportProfile();
}

function renderSiteTitleLineContent({ line, startCharIndex }) {
  const fragment = document.createDocumentFragment();
  Array.from(line.text).forEach((letter, index) => {
    const globalIndex = startCharIndex + index;
    const span = document.createElement("span");
    span.className = `site-title-letter band-${Math.min(3, Math.floor(globalIndex / 3) + 1)}`;
    span.dataset.letter = letter;
    span.textContent = letter;
    fragment.appendChild(span);
  });
  return fragment;
}

const siteTitleController = createPretextBlockController({
  element: siteTitleEl,
  maxLines: 1,
  minFontPx: 10,
  maxFontPx: 38,
  lineHeightRatio: 0.82,
  fontFamily: "Tahoma, sans-serif",
  fontWeight: 800,
  targetWidthRatio: 0.98,
  lineClassName: "pretext-line--hero",
  renderLineContent: renderSiteTitleLineContent,
});

const promptController = createPretextBlockController({
  element: promptEl,
  maxLines: 2,
  minFontPx: 15,
  maxFontPx: 20,
  lineHeightRatio: 1.12,
  fontFamily: "Tahoma, sans-serif",
  fontWeight: 400,
  targetWidthRatio: 0.96,
  lineClassName: "pretext-line--prompt",
});

const promptSubController = createPretextBlockController({
  element: promptSub,
  maxLines: 2,
  minFontPx: 10,
  maxFontPx: 13,
  lineHeightRatio: 1.32,
  fontFamily: "Tahoma, sans-serif",
  fontWeight: 700,
  targetWidthRatio: 0.96,
  lineClassName: "pretext-line--prompt",
});

if (statsBarEl && mainCard && progressTrackEl) {
  mainCard.insertBefore(statsBarEl, progressTrackEl);
}

if (authorPanelEl && searchPanelEl && searchPanelEl.parentNode) {
  searchPanelEl.parentNode.insertBefore(authorPanelEl, searchPanelEl);
}

function initAppLoader() {
  if (!appLoaderSpinnerEl) {
    return;
  }

  appLoaderStartedAt = Date.now();
  appLoaderSpinnerEl.innerHTML = "";

  const loaderColors = ["is-black", "is-red", "is-gold"];

  for (let i = 0; i < 3; i += 1) {
    const dot = document.createElement("span");
    dot.className = "app-loader-dot";
    dot.classList.add(loaderColors[i]);
    dot.style.setProperty("--offset", `${(i - 1) * 24}px`);

    appLoaderSpinnerEl.appendChild(dot);
  }
}

function hideAppLoader() {
  if (!appLoaderEl) {
    return;
  }

  const elapsed = Date.now() - appLoaderStartedAt;
  const delay = Math.max(0, 600 - elapsed);

  window.setTimeout(() => {
    appLoaderEl.classList.add("is-hidden");
  }, delay);
}

function setSettingsOpen(isOpen) {
  isSettingsOpen = Boolean(isOpen);

  if (catPanelEl) {
    catPanelEl.classList.toggle("is-hidden", !isSettingsOpen);
  }

  if (settingsBtn) {
    settingsBtn.classList.toggle("active", isSettingsOpen);
    settingsBtn.setAttribute("aria-expanded", String(isSettingsOpen));
  }

  if (languageDockEl) {
    languageDockEl.classList.toggle("is-settings-open", isSettingsOpen);
    const widthRatio = viewportProfile.maxObservedWidth > 0
      ? viewportProfile.width / viewportProfile.maxObservedWidth
      : 1;
    const heightRatio = viewportProfile.maxObservedHeight > 0
      ? viewportProfile.height / viewportProfile.maxObservedHeight
      : 1;
    updateLanguageDockZoom(Math.min(widthRatio, heightRatio), {
      width: viewportProfile.width,
      height: viewportProfile.height,
    });
  }
}

function normalizeTopic(topic) {
  return String(topic || "").trim().toLowerCase();
}

function normalizeSubcategory(subcategory) {
  return SUBCATEGORY_ALIASES[subcategory] || subcategory;
}

function normalizeScope(scope) {
  const normalized = String(scope || "").trim().toLowerCase();
  if (!normalized || normalized === "shared" || normalized === "universal") {
    return "all";
  }
  if (normalized === "en") {
    return "gb";
  }
  return normalized;
}

function getCurrentScopeMode() {
  return MODE_SCOPE_MAP[getTargetLanguage()] || "all";
}

function isCardScopeCompatible(card) {
  return Boolean(card) && (card.scope === "all" || card.scope === getCurrentScopeMode());
}

function getTopicColor(topic) {
  return TOPIC_CONFIG[topic]?.color || "#888";
}

function normalizeField(value) {
  const raw = String(value || "");
  let normalized = "";
  let sawSpace = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    const isSpace = char <= " ";

    if (isSpace) {
      sawSpace = normalized.length > 0;
      continue;
    }

    if (sawSpace) {
      normalized += " ";
      sawSpace = false;
    }

    normalized += char;
  }

  return normalized;
}

function normalizeAnswer(value) {
  const normalized = normalizeField(value);
  let end = normalized.length;

  while (end > 0) {
    const char = normalized[end - 1];
    if (char !== "." && char !== "," && char !== "!" && char !== "?" && char !== ":" && char !== ";") {
      break;
    }
    end -= 1;
  }

  return normalized.slice(0, end).toLowerCase();
}

function getSecureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    return 0;
  }

  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || typeof cryptoApi.getRandomValues !== "function") {
    return 0;
  }

  const range = 0x100000000;
  const limit = range - (range % maxExclusive);
  const values = new Uint32Array(1);

  do {
    cryptoApi.getRandomValues(values);
  } while (values[0] >= limit);

  return values[0] % maxExclusive;
}

function getSecureRandomRange(minInclusive, maxInclusive) {
  if (!Number.isFinite(minInclusive) || !Number.isFinite(maxInclusive)) {
    return minInclusive;
  }

  const min = Math.ceil(Math.min(minInclusive, maxInclusive));
  const max = Math.floor(Math.max(minInclusive, maxInclusive));
  return min + getSecureRandomInt((max - min) + 1);
}

function loadLearningMode() {
  try {
    const saved = localStorage.getItem(LEARNING_MODE_STORAGE_KEY);
    return LANGUAGE_SEQUENCE.includes(saved) ? saved : "de";
  } catch (error) {
    return "de";
  }
}

function loadPromptOrderPreference() {
  try {
    return localStorage.getItem(PROMPT_ORDER_STORAGE_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function saveLearningMode() {
  try {
    localStorage.setItem(LEARNING_MODE_STORAGE_KEY, learningMode);
  } catch (error) {
    // Ignore storage failures and keep the in-memory preference.
  }
}

function savePromptOrderPreference() {
  try {
    localStorage.setItem(PROMPT_ORDER_STORAGE_KEY, String(isPromptOrderSwapped));
  } catch (error) {
    // Ignore storage failures and keep the in-memory preference.
  }
}

function getLocale() {
  return learningMode;
}

function getLocaleBundle(locale = getLocale()) {
  if (!locales) {
    return null;
  }
  return locales[locale] || locales.de || null;
}

function getByPath(object, path) {
  return String(path || "")
    .split(".")
    .reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), object);
}

function formatTemplate(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => (
    params[key] !== undefined && params[key] !== null ? String(params[key]) : ""
  ));
}

function t(path, params = {}) {
  const current = getByPath(getLocaleBundle(), path);
  if (current !== undefined) {
    return formatTemplate(current, params);
  }
  const fallback = getByPath(getLocaleBundle("de"), path);
  if (fallback !== undefined) {
    return formatTemplate(fallback, params);
  }
  return path;
}

function getTopicLabel(topic) {
  return t(`topics.${topic}`);
}

function getSubcategoryLabel(subcategory) {
  return t(`categories.${subcategory}`);
}

function getScopeLabel(scope) {
  return t(`scopes.${scope}`);
}

function renderCardBadge(card) {
  if (!categoryEl || !card) {
    return;
  }

  const color = getTopicColor(card.topic);
  categoryEl.innerHTML = "";

  const topicEl = document.createElement("span");
  topicEl.className = "category-badge-main";
  topicEl.textContent = getTopicLabel(card.topic);

  const metaEl = document.createElement("span");
  metaEl.className = "category-badge-meta";
  metaEl.textContent = `· ${getSubcategoryLabel(card.subcategory)}`;

  categoryEl.append(topicEl, metaEl);
  categoryEl.style.color = color;
  categoryEl.style.borderColor = `${color}55`;
  categoryEl.style.background = `${color}14`;
}

function setTextContent(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setLocalizedText(element, path, params) {
  setTextContent(element, t(path, params));
}

function setLocalizedAriaLabel(element, path, params) {
  if (element) {
    element.setAttribute("aria-label", t(path, params));
  }
}

function canSkipCurrentCard() {
  return sessionCards.length - sessionIndex > 1;
}

function updateSkipCardButtonState() {
  if (!skipCardBtnEl) {
    return;
  }

  skipCardBtnEl.disabled = !canSkipCurrentCard();
}

function renderHintButtonLabel() {
  if (!hintBtnEl) {
    return;
  }

  const textEl = hintBtnEl.querySelector(".hint-btn-text");
  if (textEl && hintBtnEl.querySelector(".button-icon-emoji")) {
    textEl.textContent = t("messages.actions.hint");
    return;
  }

  hintBtnEl.replaceChildren();

  const iconEl = document.createElement("span");
  iconEl.className = "button-icon button-icon-emoji";
  iconEl.setAttribute("aria-hidden", "true");
  iconEl.textContent = String.fromCodePoint(0x1F4A1);

  const labelEl = document.createElement("span");
  labelEl.className = "hint-btn-text";
  labelEl.textContent = t("messages.actions.hint");

  hintBtnEl.append(iconEl, document.createTextNode(" "), labelEl);
  return;

  hintBtnEl.innerHTML = `<span class="button-icon button-icon-emoji" aria-hidden="true">💡</span> <span>${t("messages.actions.hint")}</span>`;
}

function joinLocalizedList(items, conjunction = ", ") {
  return items.filter(Boolean).join(conjunction);
}

function getCardValue(card, language) {
  if (!card) {
    return "";
  }
  return String(card[language] || "").trim();
}

function getTargetLanguage() {
  return learningMode;
}

function getTargetValue(card) {
  return getCardValue(card, getTargetLanguage());
}

function getPromptLanguages() {
  const activeIndex = LANGUAGE_SEQUENCE.indexOf(getTargetLanguage());
  const promptLanguages = [
    LANGUAGE_SEQUENCE[(activeIndex + 1) % LANGUAGE_SEQUENCE.length],
    LANGUAGE_SEQUENCE[(activeIndex + 2) % LANGUAGE_SEQUENCE.length],
  ];

  return isPromptOrderSwapped ? promptLanguages.reverse() : promptLanguages;
}

function cycleLearningMode() {
  const currentIndex = LANGUAGE_SEQUENCE.indexOf(getTargetLanguage());
  learningMode = LANGUAGE_SEQUENCE[(currentIndex + 1) % LANGUAGE_SEQUENCE.length];
}

function renderSiteTitle(language) {
  if (!siteTitleEl) {
    return;
  }

  const title = LANGUAGE_TITLES[language] || LANGUAGE_TITLES.de;
  siteTitleEl.setAttribute("aria-label", title);
  if (siteTitleController) {
    siteTitleController.setText(title, { animate: true });
    return;
  }

  siteTitleEl.textContent = title;
}

function updateLanguageDock() {
  const languageDock = document.getElementById("languageDock");
  if (languageDock) {
    languageDock.setAttribute("aria-label", t("messages.languageDockAria"));
  }
  languageDockButtons.forEach((button) => {
    const language = button.dataset.lang;
    const labelEl = button.querySelector(".language-dock-label");
    if (labelEl) {
      labelEl.textContent = LANGUAGE_DOCK_LABELS[language] || "";
    }
    button.classList.toggle("is-active", language === getTargetLanguage());
    button.setAttribute("aria-pressed", String(language === getTargetLanguage()));
    button.setAttribute("aria-label", t(`messages.languageNames.${language}`));
  });
}

function getLanguageDockZoomScale(dockViewportRatio) {
  const ratio = Number.isFinite(dockViewportRatio) ? dockViewportRatio : 1;

  if (ratio >= 0.9) {
    return 1;
  }

  if (ratio >= 0.72) {
    return Math.max(0.82, Math.min(1, 0.82 + ((ratio - 0.72) / 0.18) * 0.18));
  }

  if (ratio >= 0.52) {
    return Math.max(0.64, Math.min(0.82, 0.64 + ((ratio - 0.52) / 0.2) * 0.18));
  }

  return 0.64;
}

function cancelLanguageDockZoomFrame() {
  if (!languageDockZoomFrame) {
    return;
  }

  window.cancelAnimationFrame(languageDockZoomFrame);
  languageDockZoomFrame = 0;
}

function applyLanguageDockZoomLayout(dockViewportRatio, nextViewport) {
  languageDockZoomFrame = 0;

  if (!languageDockEl) {
    return;
  }

  const ratio = Number.isFinite(dockViewportRatio) ? dockViewportRatio : 1;
  const scale = getLanguageDockZoomScale(ratio);
  const viewportWidth = Math.max(0, Math.round(nextViewport?.width || 0));
  const viewportHeight = Math.max(0, Math.round(nextViewport?.height || 0));

  languageDockEl.style.setProperty("--language-dock-zoom-scale", String(scale));
  const dockRect = languageDockEl.getBoundingClientRect();
  const isTooLarge =
    viewportWidth < 280 ||
    dockRect.width > viewportWidth * 0.24 ||
    dockRect.height > viewportHeight * 0.16;
  const isHidden = ratio < 0.52 && isTooLarge;
  languageDockEl.classList.toggle("is-zoom-hidden", isHidden);
}

function scheduleLanguageDockZoomLayout(dockViewportRatio, nextViewport) {
  if (!languageDockEl) {
    return;
  }

  cancelLanguageDockZoomFrame();
  const scheduledViewport = {
    width: Math.max(0, Math.round(nextViewport?.width || 0)),
    height: Math.max(0, Math.round(nextViewport?.height || 0)),
  };
  languageDockZoomFrame = window.requestAnimationFrame(() => {
    applyLanguageDockZoomLayout(dockViewportRatio, scheduledViewport);
  });
}

function updateLanguageDockZoom(dockViewportRatio, nextViewport) {
  scheduleLanguageDockZoomLayout(dockViewportRatio, nextViewport);
}

function applyLearningTheme() {
  document.body.dataset.learningMode = getTargetLanguage();
  document.documentElement.lang = getLocaleBundle()?.meta?.htmlLang || getTargetLanguage();
  updateLanguageDock();
  renderSiteTitle(getTargetLanguage());
}

function renderGrammarSection() {
  if (!grammarGridEl) {
    return;
  }

  grammarSliderControllers.forEach((controller) => controller?.destroy?.());
  grammarSliderControllers = [];
  grammarGridEl.innerHTML = "";
  const cards = getLocaleBundle()?.grammar?.cards || [];

  cards.forEach((card) => {
    const section = document.createElement("section");
    section.className = "grammar-card";

    const title = document.createElement("div");
    title.className = "grammar-card-title";
    title.textContent = card.title;
    section.appendChild(title);

    if (card?.interaction?.mode === "fixed_first_slider") {
      section.classList.add("grammar-card--interactive");

      const mount = document.createElement("div");
      mount.className = "grammar-slider-mount";
      section.appendChild(mount);
      grammarGridEl.appendChild(section);

      const controller = createGrammarSliderTable({ root: mount, card });
      if (controller) {
        grammarSliderControllers.push(controller);
      }
      return;
    }

    const wrap = document.createElement("div");
    wrap.className = "grammar-table-wrap";

    const table = document.createElement("table");
    table.className = "grammar-table";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    card.columns.forEach((column) => {
      const th = document.createElement("th");
      th.textContent = column;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    card.rows.forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((cell, index) => {
        const td = document.createElement(index === 0 ? "th" : "td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrap.appendChild(table);
    section.appendChild(wrap);
    grammarGridEl.appendChild(section);
  });
}

function renderStaticUi() {
  setLocalizedText(statLabelStreakEl, "messages.stats.streak");
  setLocalizedText(statLabelRemainingEl, "messages.stats.remaining");
  setLocalizedText(statLabelAccuracyEl, "messages.stats.accuracy");
  setLocalizedText(statLabelWpmEl, "messages.stats.wpm");
  setLocalizedAriaLabel(cardLegendEl, "messages.legend.aria");
  setLocalizedText(legendCorrectEl, "messages.legend.correct");
  setLocalizedText(legendNextEl, "messages.legend.next");
  setLocalizedText(legendWrongEl, "messages.legend.wrong");
  setLocalizedText(skipCardBtnLabelEl, "messages.actions.skip");
  if (skipCardBtnEl) {
    skipCardBtnEl.setAttribute("aria-label", t("messages.actions.skip"));
    skipCardBtnEl.setAttribute("title", t("messages.actions.skip"));
  }
  setLocalizedText(promptHeadTitleEl, "messages.prompt.card");
  if (promptSwapBtn) {
    promptSwapBtn.setAttribute("aria-label", t("messages.prompt.swapAria"));
    promptSwapBtn.setAttribute("title", t("messages.prompt.swapTitle"));
  }
  if (inputEl) {
    inputEl.placeholder = t("messages.prompt.placeholder");
  }
  setLocalizedText(answerGuideLabelEl, "messages.guide.label");
  renderHintButtonLabel();
  setLocalizedText(enterHintTextEl, "messages.actions.enterHint");
  setLocalizedText(sessionEndLabelEl, "messages.session.finished");
  setLocalizedText(restartBtnEl, "messages.session.newRound");
  setLocalizedText(catPanelTitleEl, "messages.categories.title");
  setLocalizedText(sliderUnitLabelEl, "messages.categories.unit");
  setLocalizedText(newGameBtn, "messages.categories.newGame");
  setLocalizedText(settingsBtnLabelEl, "messages.actions.settings");
  setLocalizedText(switchOrderBtnLabelEl, "messages.actions.switchPrompt");
  if (switchOrderBtn) {
    switchOrderBtn.setAttribute("aria-label", t("messages.actions.switchPromptAria"));
    switchOrderBtn.setAttribute("title", t("messages.actions.switchPromptAria"));
    switchOrderBtn.setAttribute("aria-pressed", String(isPromptOrderSwapped));
    switchOrderBtn.classList.toggle("active", isPromptOrderSwapped);
  }
  setLocalizedText(difficultyEasyBtn, "difficulty.easy");
  setLocalizedText(difficultyMediumBtn, "difficulty.medium");
  setLocalizedText(difficultyHardBtn, "difficulty.hard");
  setLocalizedText(searchPanelTitleEl, "messages.search.title");
  setLocalizedText(searchPanelSubtitleEl, "messages.search.subtitle");
  setLocalizedText(authorToggleBtn, "messages.search.authorToggle");
  setLocalizedText(grammarSectionTitleEl, "grammar.title");
  setLocalizedText(authorPanelTitleEl, "messages.authoring.title");
  setLocalizedText(authorLabelDeEl, "messages.authoring.labels.de");
  setLocalizedText(authorLabelTopicEl, "messages.authoring.labels.topic");
  setLocalizedText(authorLabelSubcategoryEl, "messages.authoring.labels.subcategory");
  setLocalizedText(authorLabelScopeEl, "messages.authoring.labels.scope");
  setLocalizedText(authorLabelHrEl, "messages.authoring.labels.hr");
  setLocalizedText(authorLabelEnEl, "messages.authoring.labels.en");
  if (addCardDeEl) {
    addCardDeEl.placeholder = t("messages.authoring.placeholders.de");
  }
  if (addCardHrEl) {
    addCardHrEl.placeholder = t("messages.authoring.placeholders.hr");
  }
  if (addCardEnEl) {
    addCardEnEl.placeholder = t("messages.authoring.placeholders.en");
  }
  fillAuthoringSelects();
  setLocalizedText(factsPanelTitleEl, "facts.panelTitle");
  setLocalizedText(factsPanelSubtitleEl, "facts.panelSubtitle");
  setLocalizedText(factsCountryBtn, "facts.tabs.germany");
  setLocalizedText(factsStatesBtn, "facts.tabs.europe");
  setLocalizedText(factsWorldBtn, "facts.tabs.world");
  setLocalizedText(siteFooterLinkEl, "footer");
  renderGrammarSection();
}

function switchLearningMode(nextLanguage) {
  if (!LANGUAGE_SEQUENCE.includes(nextLanguage) || nextLanguage === getTargetLanguage()) {
    return;
  }

  document.body.classList.add("is-language-switching");
  if (siteTitleEl) {
    siteTitleEl.classList.remove("is-changing-in");
    siteTitleEl.classList.add("is-changing-out");
  }

  window.setTimeout(() => {
    learningMode = nextLanguage;
    saveLearningMode();
    applyLearningTheme();
    renderStaticUi();
    maybeShowInstallGuide();
    renderAuthoringMode();
    buildTopicPanel();
    updateStats();
    renderFactsSelection();
    loadCard({ focusInput: false });

    if (siteTitleEl) {
      siteTitleEl.classList.remove("is-changing-out");
      siteTitleEl.classList.add("is-changing-in");
      window.setTimeout(() => siteTitleEl.classList.remove("is-changing-in"), 340);
    }

    window.setTimeout(() => document.body.classList.remove("is-language-switching"), 180);
  }, 85);
}

function renderPrompt(card) {
  if (!card) {
    return;
  }

  const [primaryLanguage, secondaryLanguage] = getPromptLanguages();
  const primaryText = getCardValue(card, primaryLanguage);
  const secondaryText = getCardValue(card, secondaryLanguage);

  if (promptController) {
    promptController.setText(primaryText, { animate: true });
  } else if (promptEl) {
    promptEl.textContent = primaryText;
  }

  if (promptSubController) {
    promptSubController.setText(secondaryText, { animate: true });
  } else if (promptSub) {
    promptSub.textContent = secondaryText;
  }

  if (promptPrimaryFlagEl) {
    promptPrimaryFlagEl.textContent = LANGUAGE_FLAGS[primaryLanguage];
  }
  if (promptSecondaryFlagEl) {
    promptSecondaryFlagEl.textContent = LANGUAGE_FLAGS[secondaryLanguage];
  }
  if (inputFlagEl) {
    inputFlagEl.textContent = LANGUAGE_FLAGS[getTargetLanguage()];
  }
  if (switchOrderBtn) {
    switchOrderBtn.classList.toggle("active", isPromptOrderSwapped);
    switchOrderBtn.setAttribute("aria-pressed", String(isPromptOrderSwapped));
  }
  if (promptSwapBtn) {
    promptSwapBtn.innerHTML = "&#128260;";
    promptSwapBtn.setAttribute("aria-label", t("messages.prompt.swapAria"));
    promptSwapBtn.setAttribute("title", t("messages.prompt.swapTitle"));
  }
  return;
}

function togglePromptOrder() {
  isPromptOrderSwapped = !isPromptOrderSwapped;
  savePromptOrderPreference();

  if (sessionCards.length && sessionCards[sessionIndex]) {
    renderPrompt(sessionCards[sessionIndex]);
    return;
  }

  if (switchOrderBtn) {
    switchOrderBtn.classList.toggle("active", isPromptOrderSwapped);
    switchOrderBtn.setAttribute("aria-pressed", String(isPromptOrderSwapped));
  }
}

function cardKey(card) {
  return [
    normalizeAnswer(card.de),
    normalizeAnswer(card.hr),
    normalizeTopic(card.topic),
    normalizeSubcategory(card.subcategory),
    normalizeScope(card.scope),
  ].join("::");
}

function sanitizeCard(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const card = {
    de: normalizeField(raw.de),
    hr: normalizeField(raw.hr),
    en: normalizeField(raw.en),
    topic: normalizeTopic(normalizeField(raw.topic)),
    subcategory: normalizeSubcategory(normalizeField(raw.subcategory || raw.cat)),
    scope: normalizeScope(normalizeField(raw.scope || "all")),
  };

  if (
    !card.de ||
    !card.hr ||
    !card.en ||
    !TOPIC_OPTIONS.includes(card.topic) ||
    !SUBCATEGORY_OPTIONS.includes(card.subcategory) ||
    !CARD_SCOPE_OPTIONS.includes(card.scope)
  ) {
    return null;
  }

  return card;
}

function mergeCards(...groups) {
  const seen = new Set();
  const merged = [];

  groups.flat().forEach((item) => {
    const card = sanitizeCard(item);
    if (!card) {
      return;
    }

    const key = cardKey(card);
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push(card);
  });

  return merged;
}

async function fetchJson(url, fallback) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return fallback;
    }
    return await response.json();
  } catch (error) {
    return fallback;
  }
}

async function loadLocales() {
  return fetchJson("locales.json", null);
}

async function detectCapabilities() {
  try {
    const response = await fetch("./api/capabilities", { cache: "no-store" });
    if (!response.ok) {
      return { persistentSave: false };
    }
    const data = await response.json();
    return {
      persistentSave: Boolean(data && data.persistentSave),
      storageFile: data && data.storageFile ? data.storageFile : null,
    };
  } catch (error) {
    return { persistentSave: false };
  }
}

function loadSessionCards() {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(sanitizeCard).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function saveSessionCards() {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionOnlyCards, null, 2));
}

function getExtraCardsForExport() {
  return mergeCards(persistentCards, sessionOnlyCards);
}

function setAuthoringFeedback(message, isError) {
  addCardStatusEl.textContent = message;
  addCardStatusEl.classList.toggle("is-error", Boolean(isError));
}

function setAuthoringBusy(isBusy) {
  addCardSaveBtn.disabled = isBusy;
  exportCardsBtn.disabled = isBusy;
  addCardSaveBtn.textContent = isBusy
    ? t("messages.authoring.saveBusy")
    : capabilities.persistentSave
      ? t("messages.authoring.savePersistent")
      : t("messages.authoring.saveSession");
  exportCardsBtn.textContent = t("messages.authoring.export");
}

function renderAuthoringMode() {
  if (capabilities.persistentSave) {
    authorModeEl.classList.add("persistent");
    setAuthoringFeedback(t("messages.authoring.modePersistent"), false);
  } else {
    authorModeEl.classList.remove("persistent");
    setAuthoringFeedback(t("messages.authoring.modeSession"), false);
  }
  setAuthoringBusy(false);
}

function fillSelectOptions(selectEl, values, getLabel, fallbackValue) {
  if (!selectEl) {
    return;
  }

  const currentValue = selectEl.value;
  selectEl.innerHTML = "";

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = getLabel(value);
    selectEl.appendChild(option);
  });

  const nextValue = values.includes(currentValue) ? currentValue : fallbackValue;
  if (nextValue) {
    selectEl.value = nextValue;
  }
}

function fillAuthoringSelects() {
  fillSelectOptions(addCardTopicEl, TOPIC_OPTIONS, getTopicLabel, TOPIC_OPTIONS[0]);
  fillSelectOptions(addCardSubcategoryEl, SUBCATEGORY_OPTIONS, getSubcategoryLabel, SUBCATEGORY_OPTIONS[0]);
  fillSelectOptions(addCardScopeEl, CARD_SCOPE_OPTIONS, getScopeLabel, CARD_SCOPE_OPTIONS[0]);
}

function buildTopicPanel() {
  const container = document.getElementById("catButtons");
  container.innerHTML = "";

  const mixBtn = document.createElement("button");
  mixBtn.className = `cat-btn mixed${selectedTopics === null ? " active" : ""}`;
  if (selectedTopics === null) {
    mixBtn.style.background = "#e8ff47";
  }
  mixBtn.textContent = t("messages.categories.mixed");
  mixBtn.onclick = () => {
    selectedTopics = null;
    buildTopicPanel();
  };
  container.appendChild(mixBtn);

  TOPIC_OPTIONS.forEach((topic) => {
    const color = getTopicColor(topic);
    const isActive = selectedTopics !== null && selectedTopics.has(topic);
    const btn = document.createElement("button");
    btn.className = `cat-btn${isActive ? " active" : ""}`;
    btn.textContent = getTopicLabel(topic);
    btn.style.borderColor = `${color}55`;
    btn.style.color = isActive ? "#000" : color;
    if (isActive) {
      btn.style.background = color;
    }
    btn.onclick = () => {
      if (selectedTopics === null) {
        selectedTopics = new Set();
      }

      if (selectedTopics.has(topic)) {
        selectedTopics.delete(topic);
        if (selectedTopics.size === 0) {
          selectedTopics = null;
        }
      } else {
        selectedTopics.add(topic);
      }

      buildTopicPanel();
    };
    container.appendChild(btn);
  });

  const pool = getPool();
  catCountEl.textContent = `${pool.length} ${t("messages.categories.unit")}`;
  newGameBtn.disabled = pool.length === 0;
}

function getPool() {
  const topicFiltered = selectedTopics === null
    ? allCards
    : allCards.filter((card) => selectedTopics.has(card.topic));
  return topicFiltered.filter(isCardScopeCompatible);
}

function updateSearchLinks(card) {
  searchLinksEl.innerHTML = "";
  const query = String(card.de || card.en || "").trim();

  searchSites.forEach((site) => {
    const link = document.createElement("a");
    link.className = "search-link";
    link.href = site.url(query);
    link.target = "_blank";
    link.rel = "noopener";
    link.innerHTML = `<span class="search-link-icon">${site.icon}</span><span>${site.name}</span>`;
    searchLinksEl.appendChild(link);
  });
}

const FACT_LANGUAGE_MAP = {
  Deutsch: { de: "Deutsch", hr: "njemački", en: "German" },
  Englisch: { de: "Englisch", hr: "engleski", en: "English" },
  Kroatisch: { de: "Kroatisch", hr: "hrvatski", en: "Croatian" },
  Französisch: { de: "Französisch", hr: "francuski", en: "French" },
  Spanisch: { de: "Spanisch", hr: "španjolski", en: "Spanish" },
  Katalanisch: { de: "Katalanisch", hr: "katalonski", en: "Catalan" },
  Baskisch: { de: "Baskisch", hr: "baskijski", en: "Basque" },
  Galicisch: { de: "Galicisch", hr: "galicijski", en: "Galician" },
  Schwedisch: { de: "Schwedisch", hr: "švedski", en: "Swedish" },
  Polnisch: { de: "Polnisch", hr: "poljski", en: "Polish" },
  Ungarisch: { de: "Ungarisch", hr: "mađarski", en: "Hungarian" },
};

FACT_LANGUAGE_MAP.Portugiesisch = { de: "Portugiesisch", hr: "portugalski", en: "Portuguese" };
FACT_LANGUAGE_MAP.Italienisch = { de: "Italienisch", hr: "talijanski", en: "Italian" };
FACT_LANGUAGE_MAP.Raetoromanisch = { de: "Raetoromanisch", hr: "retoromanski", en: "Romansh" };
FACT_LANGUAGE_MAP.Latein = { de: "Latein", hr: "latinski", en: "Latin" };
FACT_LANGUAGE_MAP.Arabisch = { de: "Arabisch", hr: "arapski", en: "Arabic" };
FACT_LANGUAGE_MAP.Chinesisch = { de: "Chinesisch", hr: "kineski", en: "Chinese" };
FACT_LANGUAGE_MAP.Russisch = { de: "Russisch", hr: "ruski", en: "Russian" };
FACT_LANGUAGE_MAP.Hindi = { de: "Hindi", hr: "hindski", en: "Hindi" };
FACT_LANGUAGE_MAP.Persisch = { de: "Persisch", hr: "perzijski", en: "Persian" };
FACT_LANGUAGE_MAP.Indonesisch = { de: "Indonesisch", hr: "indonezijski", en: "Indonesian" };
FACT_LANGUAGE_MAP.Mongolisch = { de: "Mongolisch", hr: "mongolski", en: "Mongolian" };
FACT_LANGUAGE_MAP.Montenegrinisch = { de: "Montenegrinisch", hr: "crnogorski", en: "Montenegrin" };
FACT_LANGUAGE_MAP.Luxemburgisch = { de: "Luxemburgisch", hr: "luksemburski", en: "Luxembourgish" };
FACT_LANGUAGE_MAP.Japanisch = { de: "Japanisch", hr: "japanski", en: "Japanese" };
FACT_LANGUAGE_MAP.Koreanisch = { de: "Koreanisch", hr: "korejski", en: "Korean" };
FACT_LANGUAGE_MAP.Urdu = { de: "Urdu", hr: "urdu", en: "Urdu" };
FACT_LANGUAGE_MAP.Bengalisch = { de: "Bengalisch", hr: "bengalski", en: "Bengali" };
FACT_LANGUAGE_MAP.Amharisch = { de: "Amharisch", hr: "amharski", en: "Amharic" };
FACT_LANGUAGE_MAP.Kasachisch = { de: "Kasachisch", hr: "kazaški", en: "Kazakh" };
FACT_LANGUAGE_MAP.Thai = { de: "Thai", hr: "tajlandski", en: "Thai" };
FACT_LANGUAGE_MAP.Vietnamesisch = { de: "Vietnamesisch", hr: "vijetnamski", en: "Vietnamese" };

FACT_LANGUAGE_MAP.Bosnisch = { de: "Bosnisch", hr: "bosanski", en: "Bosnian" };
FACT_LANGUAGE_MAP.Serbisch = { de: "Serbisch", hr: "srpski", en: "Serbian" };
FACT_LANGUAGE_MAP.Mazedonisch = { de: "Mazedonisch", hr: "makedonski", en: "Macedonian" };
FACT_LANGUAGE_MAP.Albanisch = { de: "Albanisch", hr: "albanski", en: "Albanian" };
FACT_LANGUAGE_MAP.Griechisch = { de: "Griechisch", hr: "grcki", en: "Greek" };
FACT_LANGUAGE_MAP.Bulgarisch = { de: "Bulgarisch", hr: "bugarski", en: "Bulgarian" };
FACT_LANGUAGE_MAP["Türkisch"] = { de: "Türkisch", hr: "turski", en: "Turkish" };
FACT_LANGUAGE_MAP.Tuerkisch = { de: "Türkisch", hr: "turski", en: "Turkish" };
FACT_LANGUAGE_MAP["Rumänisch"] = { de: "Rumänisch", hr: "rumunjski", en: "Romanian" };
FACT_LANGUAGE_MAP.Rumaenisch = { de: "Rumänisch", hr: "rumunjski", en: "Romanian" };
FACT_LANGUAGE_MAP.Ukrainisch = { de: "Ukrainisch", hr: "ukrajinski", en: "Ukrainian" };
FACT_LANGUAGE_MAP.Belarussisch = { de: "Belarussisch", hr: "bjeloruski", en: "Belarusian" };
FACT_LANGUAGE_MAP.Tschechisch = { de: "Tschechisch", hr: "ceski", en: "Czech" };
FACT_LANGUAGE_MAP.Slowakisch = { de: "Slowakisch", hr: "slovacki", en: "Slovak" };
FACT_LANGUAGE_MAP.Slowenisch = { de: "Slowenisch", hr: "slovenski", en: "Slovene" };
FACT_LANGUAGE_MAP.Niederländisch = { de: "Niederländisch", hr: "nizozemski", en: "Dutch" };
FACT_LANGUAGE_MAP.Niederlaendisch = { de: "Niederländisch", hr: "nizozemski", en: "Dutch" };
FACT_LANGUAGE_MAP["Dänisch"] = { de: "Dänisch", hr: "danski", en: "Danish" };
FACT_LANGUAGE_MAP.Daenisch = { de: "Dänisch", hr: "danski", en: "Danish" };
FACT_LANGUAGE_MAP.Finnisch = { de: "Finnisch", hr: "finski", en: "Finnish" };
FACT_LANGUAGE_MAP.Irisch = { de: "Irisch", hr: "irski", en: "Irish" };
FACT_LANGUAGE_MAP["Norwegisch (Nynorsk)"] = { de: "Norwegisch (Nynorsk)", hr: "norveski (nynorsk)", en: "Norwegian (Nynorsk)" };
FACT_LANGUAGE_MAP["Norwegisch (Bokmål)"] = { de: "Norwegisch (Bokmål)", hr: "norveski (bokmal)", en: "Norwegian (Bokmal)" };
FACT_LANGUAGE_MAP.smi = { de: "Sami", hr: "sami", en: "Sami" };

const EXTRA_FACT_LABEL_MAP = {
  Monaco: { de: "Monaco", hr: "Monako", en: "Monaco" },
  Gibraltar: { de: "Gibraltar", hr: "Gibraltar", en: "Gibraltar" },
  Marokko: { de: "Marokko", hr: "Maroko", en: "Morocco" },
  Schottland: { de: "Schottland", hr: "Skotska", en: "Scotland" },
  Wales: { de: "Wales", hr: "Wales", en: "Wales" },
  Litauen: { de: "Litauen", hr: "Litva", en: "Lithuania" },
  Moldawien: { de: "Moldawien", hr: "Moldavija", en: "Moldova" },
  Afghanistan: { de: "Afghanistan", hr: "Afganistan", en: "Afghanistan" },
  Armenien: { de: "Armenien", hr: "Armenija", en: "Armenia" },
  Aserbaidschan: { de: "Aserbaidschan", hr: "Azerbajdzan", en: "Azerbaijan" },
  Angola: { de: "Angola", hr: "Angola", en: "Angola" },
  Belize: { de: "Belize", hr: "Belize", en: "Belize" },
  Bolivien: { de: "Bolivien", hr: "Bolivija", en: "Bolivia" },
  Guatemala: { de: "Guatemala", hr: "Gvatemala", en: "Guatemala" },
  Guyana: { de: "Guyana", hr: "Gvajana", en: "Guyana" },
  Irak: { de: "Irak", hr: "Irak", en: "Iraq" },
  Israel: { de: "Israel", hr: "Izrael", en: "Israel" },
  Jemen: { de: "Jemen", hr: "Jemen", en: "Yemen" },
  Jordanien: { de: "Jordanien", hr: "Jordan", en: "Jordan" },
  Kambodscha: { de: "Kambodscha", hr: "Kambodza", en: "Cambodia" },
  Kamerun: { de: "Kamerun", hr: "Kamerun", en: "Cameroon" },
  Kenia: { de: "Kenia", hr: "Kenija", en: "Kenya" },
  Kirgisistan: { de: "Kirgisistan", hr: "Kirgistan", en: "Kyrgyzstan" },
  Laos: { de: "Laos", hr: "Laos", en: "Laos" },
  Lettland: { de: "Lettland", hr: "Latvija", en: "Latvia" },
  Malaysia: { de: "Malaysia", hr: "Malezija", en: "Malaysia" },
  Mali: { de: "Mali", hr: "Mali", en: "Mali" },
  Nepal: { de: "Nepal", hr: "Nepal", en: "Nepal" },
  Niger: { de: "Niger", hr: "Niger", en: "Niger" },
  Nordkorea: { de: "Nordkorea", hr: "Sjeverna Koreja", en: "North Korea" },
  Panama: { de: "Panama", hr: "Panama", en: "Panama" },
  "Papua-Neuguinea": { de: "Papua-Neuguinea", hr: "Papua Nova Gvineja", en: "Papua New Guinea" },
  Paraguay: { de: "Paraguay", hr: "Paragvaj", en: "Paraguay" },
  "Republik Kongo": { de: "Republik Kongo", hr: "Republika Kongo", en: "Republic of the Congo" },
  Ruanda: { de: "Ruanda", hr: "Ruanda", en: "Rwanda" },
  "San Marino": { de: "San Marino", hr: "San Marino", en: "San Marino" },
  Simbabwe: { de: "Simbabwe", hr: "Zimbabve", en: "Zimbabwe" },
  Somalia: { de: "Somalia", hr: "Somalija", en: "Somalia" },
  Suedsudan: { de: "Südsudan", hr: "Juzni Sudan", en: "South Sudan" },
  Syrien: { de: "Syrien", hr: "Sirija", en: "Syria" },
  "Timor-Leste": { de: "Timor-Leste", hr: "Timor-Leste", en: "Timor-Leste" },
  Tschad: { de: "Tschad", hr: "Cad", en: "Chad" },
  Tunesien: { de: "Tunesien", hr: "Tunis", en: "Tunisia" },
  Turkmenistan: { de: "Turkmenistan", hr: "Turkmenistan", en: "Turkmenistan" },
  Uganda: { de: "Uganda", hr: "Uganda", en: "Uganda" },
  Uruguay: { de: "Uruguay", hr: "Urugvaj", en: "Uruguay" },
  Usbekistan: { de: "Usbekistan", hr: "Uzbekistan", en: "Uzbekistan" },
  "Vereinigte Arabische Emirate": { de: "Vereinigte Arabische Emirate", hr: "Ujedinjeni Arapski Emirati", en: "United Arab Emirates" },
  Atlantik: { de: "Atlantik", hr: "Atlantik", en: "Atlantic Ocean" },
  Mittelmeer: { de: "Mittelmeer", hr: "Sredozemno more", en: "Mediterranean Sea" },
  Nordsee: { de: "Nordsee", hr: "Sjeverno more", en: "North Sea" },
  Ostsee: { de: "Ostsee", hr: "Balticko more", en: "Baltic Sea" },
  "Schwarzes Meer": { de: "Schwarzes Meer", hr: "Crno more", en: "Black Sea" },
  Pazifik: { de: "Pazifik", hr: "Tihi ocean", en: "Pacific Ocean" },
  "Indischer Ozean": { de: "Indischer Ozean", hr: "Indijski ocean", en: "Indian Ocean" },
  "Arktischer Ozean": { de: "Arktischer Ozean", hr: "Arkticki ocean", en: "Arctic Ocean" },
  "Suedlicher Ozean": { de: "Südlicher Ozean", hr: "Juzni ocean", en: "Southern Ocean" },
  "Europaeisches Parlament": { de: "Europäisches Parlament", hr: "Europski parlament", en: "European Parliament" },
  "Europaeische Kommission": { de: "Europäische Kommission", hr: "Europska komisija", en: "European Commission" },
  "Europaeischer Rat": { de: "Europäischer Rat", hr: "Europsko vijece", en: "European Council" },
  "UN-Generalversammlung": { de: "UN-Generalversammlung", hr: "Glavna skupstina UN-a", en: "UN General Assembly" },
  "UN-Sicherheitsrat": { de: "UN-Sicherheitsrat", hr: "Vijece sigurnosti UN-a", en: "UN Security Council" },
  "UN-Sekretariat": { de: "UN-Sekretariat", hr: "Tajnistvo UN-a", en: "UN Secretariat" },
  "Internationaler Gerichtshof": { de: "Internationaler Gerichtshof", hr: "Medunarodni sud pravde", en: "International Court of Justice" },
  Bruessel: { de: "Brüssel", hr: "Bruxelles", en: "Brussels" },
  Strassburg: { de: "Straßburg", hr: "Strasbourg", en: "Strasbourg" },
  Genf: { de: "Genf", hr: "Zeneva", en: "Geneva" },
  Wien: { de: "Wien", hr: "Bec", en: "Vienna" }
};

function deepMergeObjects(base, patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return patch === undefined ? base : patch;
  }

  const output = base && typeof base === "object" && !Array.isArray(base)
    ? { ...base }
    : {};

  Object.entries(patch).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      output[key] = deepMergeObjects(output[key], value);
    } else {
      output[key] = value;
    }
  });

  return output;
}

function getFactsBundle() {
  return getLocaleBundle()?.facts || getLocaleBundle("de")?.facts || {};
}

function getLocalizedCountryNameById(id, fallback = "") {
  return getFactsBundle().names?.countries?.[id] || fallback;
}

function translateCountryOrRegionName(value) {
  const factsBundle = getFactsBundle();
  if (value === "Deutschland") {
    return factsBundle.names?.germany || value;
  }
  if (value === "Europa") {
    return factsBundle.names?.europe || value;
  }
  if (value === "Welt") {
    return factsBundle.names?.world || value;
  }
  const countryEntries = Object.entries(getLocaleBundle("de")?.facts?.names?.countries || {});
  for (const [id, name] of countryEntries) {
    if (name === value) {
      return getLocalizedCountryNameById(id, value);
    }
  }
  if (EXTRA_FACT_LABEL_MAP[value]) {
    return EXTRA_FACT_LABEL_MAP[value][getLocale()] || EXTRA_FACT_LABEL_MAP[value].de;
  }
  return factsBundle.regions?.[value] || value;
}

function translateFactScalar(value) {
  if (!value || typeof value !== "string") {
    return value;
  }

  const factsBundle = getFactsBundle();
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (trimmed === "Ja") {
    return factsBundle.values?.yes || trimmed;
  }
  if (trimmed === "Nein") {
    return factsBundle.values?.no || trimmed;
  }

  if (factsBundle.stateTypes?.[trimmed]) {
    return factsBundle.stateTypes[trimmed];
  }
  if (factsBundle.stateForms?.[trimmed]) {
    return factsBundle.stateForms[trimmed];
  }
  if (factsBundle.regions?.[trimmed]) {
    return factsBundle.regions[trimmed];
  }
  if (FACT_LANGUAGE_MAP[trimmed]) {
    return FACT_LANGUAGE_MAP[trimmed][getLocale()] || FACT_LANGUAGE_MAP[trimmed].de;
  }
  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((part) => translateFactScalar(part.trim()))
      .join(", ");
  }
  return translateCountryOrRegionName(trimmed);
}

function translateFactList(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.map((value) => translateFactScalar(value));
}

function buildGermanyOverview(countryData) {
  return t("facts.values.germanyOverviewText", {
    statesCount: countryData.states_count,
    neighbors: joinLocalizedList(translateFactList(countryData.neighboring_countries)),
  });
}

function buildEuropeOverview(unionData) {
  return t("facts.values.europeOverviewText", {
    memberStates: unionData.states_count,
    capital: translateFactScalar(unionData.capital),
    institutions: joinLocalizedList(translateFactList(unionData.institutions)),
  });
}

function buildWorldOverview(unionData) {
  return t("facts.values.worldOverviewText", {
    memberStates: unionData.member_states,
    headquarters: unionData.headquarters,
    institutions: joinLocalizedList(translateFactList(unionData.institutions)),
  });
}

function buildStateLocationSummary(stateData) {
  return t("facts.values.stateLocationText", {
    name: stateData.name,
    region: translateFactScalar(stateData.region),
    capital: stateData.capital,
  });
}

function buildStateProfileSummary(stateData) {
  return t("facts.values.stateProfileText", {
    name: stateData.name,
    knownFor: joinLocalizedList(translateFactList(stateData.known_for)),
  });
}

function buildStateOverview(stateData) {
  const location = buildStateLocationSummary(stateData);
  const profile = buildStateProfileSummary(stateData);
  if (!location) {
    return profile;
  }
  if (!profile) {
    return location;
  }
  return `${location} ${profile}`;
}

function buildCountryOverview(countryData) {
  const name = getLocalizedCountryNameById(countryData.id, countryData.name);
  const region = translateFactScalar(countryData.region);
  const capital = countryData.capital;

  if (getLocale() === "hr") {
    return `${name} se nalazi u ${region}. Glavni grad je ${capital}.`;
  }
  if (getLocale() === "en") {
    return `${name} is in ${region}. Its capital is ${capital}.`;
  }
  return `${name} liegt in ${region}. Hauptstadt ist ${capital}.`;
}

function isNonEmptyValue(value) {
  if (value === null || value === undefined) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return true;
}

function normalizeFactsCollection(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const country = raw.country && typeof raw.country === "object" ? raw.country : null;
  const states = Array.isArray(raw.states) ? raw.states.filter((state) => state && typeof state === "object") : [];

  if (!country || !isNonEmptyValue(country.name) || states.length === 0) {
    return null;
  }

  const validStates = states.filter((state) => isNonEmptyValue(state.id) && isNonEmptyValue(state.name));
  if (!validStates.length) {
    return null;
  }

  return {
    country,
    states: validStates,
  };
}

async function loadGermanyFacts() {
  const raw = await fetchJson("germany-facts.json", null);
  return normalizeFactsCollection(raw);
}

function normalizeEuropeFacts(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const union = raw.union && typeof raw.union === "object" ? raw.union : null;
  const countries = Array.isArray(raw.countries)
    ? raw.countries.filter((country) => country && typeof country === "object")
    : [];

  if (!union || !isNonEmptyValue(union.name) || !countries.length) {
    return null;
  }

  const validCountries = countries.filter((country) => isNonEmptyValue(country.id) && isNonEmptyValue(country.name));
  if (!validCountries.length) {
    return null;
  }

  return {
    union,
    countries: validCountries,
  };
}

async function loadEuropeFacts() {
  const raw = await fetchJson("europe-facts.json", null);
  const normalized = normalizeEuropeFacts(raw);
  if (!normalized) {
    return normalized;
  }

  normalized.union = {
    ...normalized.union,
    name: "EU",
    official_name: "Europaeische Union",
    capital: "Bruessel",
    largest_city: "Berlin",
    population: "452.162.974 (2026)",
    states_count: "27",
    currency: "EUR",
    language: "24",
  };

  return normalized;
}

async function loadWorldFacts() {
  const raw = await fetchJson("world-facts.json", null);
  const normalized = normalizeEuropeFacts(raw);
  if (!normalized) {
    return normalized;
  }

  normalized.union = {
    ...normalized.union,
    name: "UN",
    official_name: "Vereinte Nationen",
    largest_city: "Jakarta (41.9m, 2025)",
    founded: "1945",
    member_states: "193",
    secretary_general: "Antonio Guterres",
  };

  return normalized;
}

function getFactsImagePath(type, stateId) {
  if (type === "country") {
    return "https://flagcdn.com/de.svg";
  }

  if (type === "state" && isNonEmptyValue(stateId)) {
    return `${FACTS_IMAGE_ROOT}/states/${stateId}.webp`;
  }

  return "";
}

function normalizeFactsField(field) {
  if (Array.isArray(field)) {
    return {
      label: field[0],
      value: field[1],
      featured: false,
    };
  }

  if (field && typeof field === "object") {
    return {
      label: field.label,
      value: field.value,
      featured: Boolean(field.featured),
    };
  }

  return null;
}

function createFactsField(field) {
  const normalized = normalizeFactsField(field);
  if (!normalized) {
    return null;
  }

  const { label, value, featured } = normalized;
  if (!isNonEmptyValue(value)) {
    return null;
  }

  const card = document.createElement("div");
  card.className = "facts-card";
  if (featured) {
    card.classList.add("featured");
  }

  const cardLabel = document.createElement("div");
  cardLabel.className = "facts-card-label";
  cardLabel.textContent = label;

  const cardValue = document.createElement("div");
  cardValue.className = "facts-card-value";
  cardValue.textContent = String(value);

  card.appendChild(cardLabel);
  card.appendChild(cardValue);
  return card;
}

function createFactsList(label, items) {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  const section = document.createElement("section");
  section.className = "facts-list-section";

  const title = document.createElement("div");
  title.className = "facts-list-title";
  title.textContent = label;

  const list = document.createElement("div");
  list.className = "facts-chip-list";

  items
    .filter((item) => isNonEmptyValue(item))
    .forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "facts-chip";
      chip.textContent = String(item);
      list.appendChild(chip);
    });

  if (!list.children.length) {
    return null;
  }

  section.appendChild(title);
  section.appendChild(list);
  return section;
}

function getStatePeopleLists(stateId) {
  const notablePeople = STATE_NOTABLE_PEOPLE[stateId] || {};
  return [
    [t("facts.lists.science"), notablePeople.science],
    [t("facts.lists.politics"), notablePeople.politics],
    [t("facts.lists.art"), notablePeople.art],
  ];
}

function renderFactsView(title, subtitle, imageSrc, fields, lists, tourismUrl = "", officialUrl = "") {
  factsContentEl.innerHTML = "";

  const view = document.createElement("div");
  view.className = "facts-view";

  const head = document.createElement("div");
  head.className = "facts-view-head";

  const titleRow = document.createElement("div");
  titleRow.className = "facts-title-row";

  const flagWrap = document.createElement("div");
  flagWrap.className = "facts-flag-wrap";

  const flagEl = document.createElement("img");
  flagEl.className = "facts-flag";
  flagEl.alt = `${title} flag`;
  flagEl.loading = "lazy";
  flagEl.decoding = "async";
  flagEl.addEventListener("error", () => {
    flagWrap.classList.add("is-fallback");
    flagEl.hidden = true;
  });

  if (isNonEmptyValue(imageSrc)) {
    flagEl.src = imageSrc;
  } else {
    flagWrap.classList.add("is-fallback");
    flagEl.hidden = true;
  }

  flagWrap.appendChild(flagEl);
  titleRow.appendChild(flagWrap);

  const titleCopy = document.createElement("div");
  titleCopy.className = "facts-title-copy";

  const titleBar = document.createElement("div");
  titleBar.className = "facts-title-bar";

  const nameEl = document.createElement("div");
  nameEl.className = "facts-view-name";
  nameEl.textContent = title;
  titleBar.appendChild(nameEl);

  if (isNonEmptyValue(tourismUrl) || isNonEmptyValue(officialUrl)) {
    const linksEl = document.createElement("div");
    linksEl.className = "facts-title-links";

    if (isNonEmptyValue(tourismUrl)) {
      const tourismEl = document.createElement("a");
      tourismEl.className = "facts-title-link";
      tourismEl.href = tourismUrl;
      tourismEl.target = "_blank";
      tourismEl.rel = "noopener noreferrer";
      tourismEl.textContent = t("facts.links.tourism");
      tourismEl.setAttribute("aria-label", t("facts.values.tourismAria", { name: title }));
      linksEl.appendChild(tourismEl);
    }

    if (isNonEmptyValue(officialUrl)) {
      const officialEl = document.createElement("a");
      officialEl.className = "facts-title-link";
      officialEl.href = officialUrl;
      officialEl.target = "_blank";
      officialEl.rel = "noopener noreferrer";
      officialEl.textContent = t("facts.links.official");
      officialEl.setAttribute("aria-label", t("facts.values.officialSiteAria", { name: title }));
      linksEl.appendChild(officialEl);
    }

    titleBar.appendChild(linksEl);
  }

  titleCopy.appendChild(titleBar);

  if (isNonEmptyValue(subtitle)) {
    const subtitleEl = document.createElement("div");
    subtitleEl.className = "facts-view-subtitle";
    subtitleEl.textContent = String(subtitle);
    titleCopy.appendChild(subtitleEl);
  }

  titleRow.appendChild(titleCopy);
  head.appendChild(titleRow);
  view.appendChild(head);

  const grid = document.createElement("div");
  grid.className = "facts-grid";
  fields.forEach((fieldData) => {
    const field = createFactsField(fieldData);
    if (field) {
      grid.appendChild(field);
    }
  });

  if (grid.children.length) {
    view.appendChild(grid);
  }

  lists.forEach(([label, values]) => {
    const list = createFactsList(label, values);
    if (list) {
      view.appendChild(list);
    }
  });

  factsContentEl.appendChild(view);
}

function renderCountryFacts(countryData) {
  renderFactsView(
      t("facts.names.germany"),
      "",
      getFactsImagePath("country"),
    [
      [t("facts.fields.capital"), countryData.capital],
      [t("facts.fields.largestCity"), countryData.largest_city],
      [t("facts.fields.anthem"), countryData.anthem],
      [t("facts.fields.founded"), countryData.founded],
      [t("facts.fields.stateForm"), translateFactScalar(countryData.state_form)],
      [t("facts.fields.nationalDay"), countryData.national_day],
      [t("facts.fields.population"), countryData.population],
      [t("facts.fields.area"), countryData.area_km2],
      [t("facts.fields.statesCount"), countryData.states_count],
      [t("facts.fields.currency"), translateFactScalar(countryData.currency)],
      [t("facts.fields.language"), translateFactScalar(countryData.language)],
      [t("facts.fields.timeZone"), countryData.time_zone],
      [t("facts.fields.callingCode"), countryData.calling_code],
      [t("facts.fields.internetTld"), countryData.internet_tld],
      [t("facts.fields.bordersCount"), countryData.bordering_countries_count],
      [t("facts.fields.gdp"), countryData.gdp_nominal],
      [t("facts.fields.euSince"), countryData.eu_member_since],
      {
        label: t("facts.featured.germanyOverview"),
        value: buildGermanyOverview(countryData),
        featured: true,
      },
    ],
    [
      [t("facts.lists.neighbors"), translateFactList(countryData.neighboring_countries)],
      [t("facts.lists.highlights"), translateFactList(countryData.highlights)],
      [t("facts.lists.nature"), translateFactList(countryData.nature)],
      ],
      TOURISM_LINKS.germany,
      OFFICIAL_LINKS.germany
    );
  }

function renderEuropeOverview(unionData) {
  renderFactsView(
      t("facts.names.europe"),
      "",
      EUROPE_FLAG_IMAGE,
    [
      [t("facts.fields.capital"), translateFactScalar(unionData.capital)],
      [t("facts.fields.anthem"), unionData.anthem],
      [t("facts.fields.founded"), unionData.founded],
      [t("facts.fields.stateForm"), translateFactScalar(unionData.state_form)],
      [t("facts.fields.nationalDay"), unionData.national_day],
      [t("facts.fields.population"), unionData.population],
      [t("facts.fields.area"), unionData.area_km2],
      [t("facts.fields.statesCount"), unionData.states_count],
      [t("facts.fields.currency"), translateFactScalar(unionData.currency)],
      [t("facts.fields.officialLanguages"), unionData.language],
      [t("facts.fields.timeZone"), unionData.time_zone],
      [t("facts.fields.internetTld"), unionData.internet_tld],
      [t("facts.fields.gdp"), unionData.gdp_nominal],
      {
        label: t("facts.featured.europeOverview"),
        value: buildEuropeOverview(unionData),
        featured: true,
      },
    ],
    [
      [t("facts.lists.institutions"), translateFactList(unionData.institutions)],
      [t("facts.lists.highlights"), translateFactList(unionData.highlights)],
      [t("facts.lists.nature"), translateFactList(unionData.nature)],
      [t("facts.lists.seas"), translateFactList(unionData.neighboring_countries)],
      ]
    );
  }

function renderWorldOverview(unionData) {
  renderFactsView(
      t("facts.names.world"),
      "",
      unionData.flag_image || "",
    [
      [t("facts.fields.headquarters"), unionData.headquarters],
      [t("facts.fields.founded"), unionData.founded],
      [t("facts.fields.stateForm"), translateFactScalar(unionData.state_form)],
      [t("facts.fields.nationalDay"), unionData.national_day],
      [t("facts.fields.memberStates"), unionData.member_states],
      [t("facts.fields.officialLanguages"), translateFactScalar(unionData.language)],
      [t("facts.fields.secretaryGeneral"), unionData.secretary_general],
      {
        label: t("facts.featured.worldOverview"),
        value: buildWorldOverview(unionData),
        featured: true,
      },
    ],
    [
      [t("facts.lists.institutions"), translateFactList(unionData.institutions)],
      [t("facts.lists.highlights"), translateFactList(unionData.highlights)],
      [t("facts.lists.nature"), translateFactList(unionData.nature)],
      [t("facts.lists.seas"), translateFactList(unionData.neighboring_countries)],
      ],
      "",
      OFFICIAL_LINKS.world
    );
  }

function renderStateFacts(stateData) {
  renderFactsView(
      stateData.name || "Bundesland",
      "",
      getFactsImagePath("state", stateData.id),
    [
      [t("facts.fields.abbreviation"), stateData.abbreviation],
      [t("facts.fields.stateType"), translateFactScalar(stateData.state_type)],
      [t("facts.fields.region"), translateFactScalar(stateData.region)],
      [t("facts.fields.capital"), stateData.capital],
      [t("facts.fields.largestCity"), stateData.largest_city],
      [t("facts.fields.population"), stateData.population],
      [t("facts.fields.area"), stateData.area_km2],
      [t("facts.fields.joined"), stateData.joined_or_founded],
      [t("facts.fields.headOfGovernment"), stateData.minister_president || stateData.state_head],
      {
        label: t("facts.featured.overview"),
        value: buildStateOverview(stateData),
        featured: true,
      },
    ],
    [
      [t("facts.lists.neighborStates"), translateFactList(stateData.neighboring_states)],
      [t("facts.lists.borders"), translateFactList(stateData.bordering_countries)],
      [t("facts.lists.knownFor"), translateFactList(stateData.known_for)],
      [t("facts.lists.nature"), translateFactList(stateData.nature)],
      ...getStatePeopleLists(stateData.id),
      ],
      TOURISM_LINKS.states[stateData.id] || "",
      OFFICIAL_LINKS.states[stateData.id] || ""
    );
  }

function renderEuropeanCountryFacts(countryData) {
  renderFactsView(
      getLocalizedCountryNameById(countryData.id, countryData.name || "Land"),
      "",
      countryData.flag_image || "",
    [
      [t("facts.fields.capital"), countryData.capital],
      [t("facts.fields.region"), translateFactScalar(countryData.region)],
      [t("facts.fields.stateForm"), translateFactScalar(countryData.state_form)],
      [t("facts.fields.population"), countryData.population],
      [t("facts.fields.area"), countryData.area_km2],
      [t("facts.fields.currency"), translateFactScalar(countryData.currency)],
      [t("facts.fields.language"), translateFactScalar(countryData.language)],
      [t("facts.fields.timeZone"), countryData.time_zone],
      [t("facts.fields.callingCode"), countryData.calling_code],
      [t("facts.fields.internetTld"), countryData.internet_tld],
      [t("facts.fields.landlocked"), translateFactScalar(countryData.landlocked)],
      {
        label: t("facts.featured.overview"),
        value: buildCountryOverview(countryData),
        featured: true,
      },
    ],
    [
      [t("facts.lists.neighbors"), translateFactList(countryData.neighboring_countries)],
      [t("facts.lists.languages"), translateFactList(countryData.languages_list)],
      [t("facts.lists.timezones"), countryData.timezones_list],
      ],
      TOURISM_LINKS.countries[countryData.id] || "",
      OFFICIAL_LINKS.countries[countryData.id] || ""
    );
  }

function renderWorldCountryFacts(countryData) {
  renderFactsView(
      getLocalizedCountryNameById(countryData.id, countryData.name || "Land"),
      "",
      countryData.flag_image || "",
    [
      [t("facts.fields.capital"), countryData.capital],
      [t("facts.fields.region"), translateFactScalar(countryData.region)],
      [t("facts.fields.stateForm"), translateFactScalar(countryData.state_form)],
      [t("facts.fields.population"), countryData.population],
      [t("facts.fields.area"), countryData.area_km2],
      [t("facts.fields.currency"), translateFactScalar(countryData.currency)],
      [t("facts.fields.language"), translateFactScalar(countryData.language)],
      [t("facts.fields.timeZone"), countryData.time_zone],
      [t("facts.fields.callingCode"), countryData.calling_code],
      [t("facts.fields.internetTld"), countryData.internet_tld],
      [t("facts.fields.landlocked"), translateFactScalar(countryData.landlocked)],
      {
        label: t("facts.featured.overview"),
        value: buildCountryOverview(countryData),
        featured: true,
      },
    ],
    [
      [t("facts.lists.neighbors"), translateFactList(countryData.neighboring_countries)],
      [t("facts.lists.languages"), translateFactList(countryData.languages_list)],
      [t("facts.lists.timezones"), countryData.timezones_list],
      ],
      TOURISM_LINKS.countries[countryData.id] || "",
      OFFICIAL_LINKS.countries[countryData.id] || ""
    );
  }

function renderFactsError() {
  factsContentEl.innerHTML = "";
  const error = document.createElement("div");
  error.className = "facts-error";
  error.textContent = t("facts.errors.loadFailed");
  factsContentEl.appendChild(error);
}

function updateFactsModeButtons() {
  const isGermanyMode = factsMode === "germany" || factsMode === "state";
  const isEuropeMode = factsMode === "europe" || factsMode === "europe-country";
  const isWorldMode = factsMode === "world" || factsMode === "world-country";
  factsCountryBtn.classList.toggle("active", isGermanyMode);
  factsStatesBtn.classList.toggle("active", isEuropeMode);
  factsWorldBtn.classList.toggle("active", isWorldMode);
}

function updateStatePickerVisibility() {
  const showGermanyPicker = (factsMode === "germany" || factsMode === "state") && Boolean(germanyFacts);
  const showEuropePicker = (factsMode === "europe" || factsMode === "europe-country") && Boolean(europeFacts);
  const showWorldPicker = (factsMode === "world" || factsMode === "world-country") && Boolean(worldFacts);
  statePickerWrap.classList.toggle("is-open", showGermanyPicker || showEuropePicker || showWorldPicker);
}

function buildFactsPicker() {
  statePickerEl.innerHTML = "";

  const isGermanyMode = factsMode === "germany" || factsMode === "state";
  const isWorldMode = factsMode === "world" || factsMode === "world-country";
  const items = isGermanyMode
    ? (germanyFacts?.states || []).map((state) => ({
        id: state.id,
        label: state.name,
        flagSrc: getFactsImagePath("state", state.id),
        active: state.id === selectedStateId,
        ariaLabel: t("facts.picker.stateButton", { name: state.name }),
        onClick: () => {
          factsMode = "state";
          selectedStateId = state.id;
          renderFactsSelection();
          scrollFactsContentIntoView();
        },
      }))
    : isWorldMode
    ? (worldFacts?.countries || []).map((country) => ({
        id: country.id,
        label: getLocalizedCountryNameById(country.id, country.name),
        flagSrc: country.flag_image || "",
        active: country.id === selectedWorldCountryId,
        ariaLabel: t("facts.picker.countryButton", {
          name: getLocalizedCountryNameById(country.id, country.name),
        }),
        onClick: () => {
          factsMode = "world-country";
          selectedWorldCountryId = country.id;
          renderFactsSelection();
          scrollFactsContentIntoView();
        },
      }))
    : (europeFacts?.countries || []).map((country) => ({
        id: country.id,
        label: getLocalizedCountryNameById(country.id, country.name),
        flagSrc: country.flag_image || "",
        active: country.id === selectedEuropeCountryId,
        ariaLabel: t("facts.picker.countryButton", {
          name: getLocalizedCountryNameById(country.id, country.name),
        }),
        onClick: () => {
          factsMode = "europe-country";
          selectedEuropeCountryId = country.id;
          renderFactsSelection();
          scrollFactsContentIntoView();
        },
      }));

  statePickerEl.setAttribute(
    "aria-label",
    isGermanyMode ? t("facts.picker.statesAria") : t("facts.picker.countriesAria")
  );

  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "state-picker-btn";
    if (item.flagSrc) {
      button.classList.add("has-flag");

      const copy = document.createElement("span");
      copy.className = "state-picker-btn-copy";

      const flag = document.createElement("img");
      flag.className = "state-picker-btn-flag";
      flag.src = item.flagSrc;
      flag.alt = "";
      flag.loading = "lazy";
      flag.decoding = "async";
      flag.addEventListener("error", () => {
        flag.hidden = true;
        button.classList.remove("has-flag");
      });

      const label = document.createElement("span");
      label.className = "state-picker-btn-label";
      label.textContent = item.label;

      copy.appendChild(flag);
      copy.appendChild(label);
      button.appendChild(copy);
    } else {
      button.textContent = item.label;
    }
    button.classList.toggle("active", item.active);
    button.setAttribute("aria-pressed", String(item.active));
    button.setAttribute("aria-label", item.ariaLabel);
    button.addEventListener("click", item.onClick);
    statePickerEl.appendChild(button);
  });
}

function renderFactsSelection() {
  const isGermanyMode = factsMode === "germany" || factsMode === "state";
  const isWorldMode = factsMode === "world" || factsMode === "world-country";

  if (isGermanyMode) {
    if (!germanyFacts) {
      renderFactsError();
      return;
    }

    const activeState = germanyFacts.states.find((state) => state.id === selectedStateId) || null;
    if (factsMode === "state" && activeState) {
      renderStateFacts(activeState);
    } else {
      renderCountryFacts(germanyFacts.country);
    }
  } else if (isWorldMode) {
    if (!worldFacts) {
      renderFactsError();
      return;
    }

    const activeCountry = worldFacts.countries.find((country) => country.id === selectedWorldCountryId) || null;
    if (factsMode === "world-country" && activeCountry) {
      renderWorldCountryFacts(activeCountry);
    } else {
      renderWorldOverview(worldFacts.union);
    }
  } else {
    if (!europeFacts) {
      renderFactsError();
      return;
    }

    const activeCountry = europeFacts.countries.find((country) => country.id === selectedEuropeCountryId) || null;
    if (factsMode === "europe-country" && activeCountry) {
      renderEuropeanCountryFacts(activeCountry);
    } else {
      renderEuropeOverview(europeFacts.union);
    }
  }

  updateFactsModeButtons();
  buildFactsPicker();
  updateStatePickerVisibility();
}

function scrollFactsContentIntoView() {
  const targetEl =
    factsContentEl?.querySelector(".facts-view-head, .facts-error, .facts-view") ||
    factsContentEl ||
    factsPanelEl;
  if (!targetEl) {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const targetTop = Math.max(0, window.scrollY + targetEl.getBoundingClientRect().top - 10);
      window.scrollTo({ top: targetTop, behavior: "smooth" });
    });
  });
}

function scrollFactsPanelTopIntoView() {
  if (!factsPanelEl) {
    return;
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const targetTop = Math.max(0, window.scrollY + factsPanelEl.getBoundingClientRect().top - 10);
      window.scrollTo({ top: targetTop, behavior: "smooth" });
    });
  });
}

function initFactsPanel() {
  updateFactsModeButtons();
  updateStatePickerVisibility();

  factsCountryBtn.addEventListener("click", () => {
    factsMode = "germany";
    selectedStateId = null;
    renderFactsSelection();
    scrollFactsPanelTopIntoView();
  });

  factsStatesBtn.addEventListener("click", () => {
    if (!europeFacts || !europeFacts.countries.length) {
      renderFactsError();
      return;
    }

    factsMode = "europe";
    selectedEuropeCountryId = null;
    renderFactsSelection();
    scrollFactsPanelTopIntoView();
  });

  factsWorldBtn.addEventListener("click", () => {
    if (!worldFacts || !worldFacts.countries.length) {
      renderFactsError();
      return;
    }

    factsMode = "world";
    selectedWorldCountryId = null;
    renderFactsSelection();
    scrollFactsPanelTopIntoView();
  });

  if (!germanyFacts && !europeFacts && !worldFacts) {
    factsCountryBtn.disabled = true;
    factsStatesBtn.disabled = true;
    factsWorldBtn.disabled = true;
    renderFactsError();
    return;
  }

  if (!germanyFacts && europeFacts) {
    factsMode = "europe";
  }

  if (!germanyFacts && !europeFacts && worldFacts) {
    factsMode = "world";
  }

  if (germanyFacts && !europeFacts) {
    factsStatesBtn.disabled = true;
  }

  if (!worldFacts) {
    factsWorldBtn.disabled = true;
  }

  renderFactsSelection();
}

function getCorrectPrefixLength(target, typed) {
  let index = 0;
  while (
    index < typed.length &&
    index < target.length &&
    typed[index].toLowerCase() === target[index].toLowerCase()
  ) {
    index += 1;
  }
  return index;
}

function getHintRevealStep() {
  if (difficulty === "easy") {
    return 3;
  }
  if (difficulty === "medium") {
    return 2;
  }
  return 1;
}

function getHintRevealValue(target, typed) {
  const nextLength = Math.min(target.length, getCorrectPrefixLength(target, typed) + getHintRevealStep());
  return target.slice(0, nextLength);
}

function getGuideSeparatorKind(char) {
  if (char === " ") {
    return "space";
  }
  if (char === ",") {
    return "comma";
  }
  return null;
}

function isGuideSeparatorChar(char) {
  return getGuideSeparatorKind(char) !== null;
}

function getGuideSeparatorLabel(char, { overflow = false } = {}) {
  const kind = getGuideSeparatorKind(char);

  if (kind === "space") {
    return t(overflow ? "messages.guide.extraSeparator" : "messages.guide.separator");
  }

  if (kind === "comma") {
    return t(overflow ? "messages.guide.extraComma" : "messages.guide.comma");
  }

  return char;
}

function getGuideStatusForSeparator(char, word, total) {
  const kind = getGuideSeparatorKind(char);

  if (kind === "space") {
    return t("messages.guide.statusSpace", { word, total });
  }

  if (kind === "comma") {
    return t("messages.guide.statusComma", { word, total });
  }

  return "";
}

function getGuideTokens(target) {
  const tokens = [];
  let wordStart = -1;

  for (let index = 0; index < target.length; index += 1) {
    const char = target[index];

    if (isGuideSeparatorChar(char)) {
      if (wordStart !== -1) {
        tokens.push({
          type: "word",
          start: wordStart,
          end: index,
          text: target.slice(wordStart, index),
        });
        wordStart = -1;
      }

      tokens.push({
        type: "separator",
        start: index,
        end: index + 1,
        char,
        kind: getGuideSeparatorKind(char),
      });
      continue;
    }

    if (wordStart === -1) {
      wordStart = index;
    }
  }

  if (wordStart !== -1) {
    tokens.push({
      type: "word",
      start: wordStart,
      end: target.length,
      text: target.slice(wordStart),
    });
  }

  return tokens;
}

function getGuideWordTokens(target) {
  return getGuideTokens(target)
    .filter((token) => token.type === "word")
    .map((token, index) => ({
      ...token,
      wordNumber: index + 1,
    }));
}

function getGuideWordTokenAt(wordTokens, index) {
  for (const token of wordTokens) {
    if (index >= token.start && index < token.end) {
      return token;
    }
  }

  return null;
}

function getGuidePreviousWordToken(wordTokens, index) {
  let previous = null;

  for (const token of wordTokens) {
    if (token.start >= index) {
      break;
    }
    previous = token;
  }

  return previous;
}

function getCharMeta(target) {
  const hints = new Set();
  const autofill = new Set();
  const hintCountPerWord =
    difficulty === "easy" ? 3 :
    difficulty === "medium" ? 1 :
    0;

  getGuideWordTokens(target).forEach((wordToken) => {
    const word = wordToken.text;

    for (let i = 0; i < hintCountPerWord && i < word.length; i += 1) {
      hints.add(wordToken.start + i);
    }

    let tail = wordToken.end - 1;
    while (tail > wordToken.start && PUNCT.test(target[tail])) {
      autofill.add(tail);
      tail -= 1;
    }
  });

  return { hints, autofill };
}

function initDifficultyControls() {
  document.querySelectorAll(".difficulty-panel button").forEach((btn) => {
    btn.addEventListener("click", () => {
      difficulty = btn.dataset.diff;

      document.querySelectorAll(".difficulty-panel button").forEach((button) => {
        button.classList.remove("active");
      });

      btn.classList.add("active");

      if (sessionCards.length) {
        const target = getTargetValue(sessionCards[sessionIndex]);
        buildWordGrid(target, inputEl.value);
        updateAnswerGuide(target, inputEl.value);
      }
    });
  });
}

function getFreshCorrectIndexes(target, previousTyped, currentTyped) {
  const freshIndexes = new Set();
  const maxLen = Math.max(previousTyped.length, currentTyped.length);

  for (let idx = 0; idx < maxLen; idx += 1) {
    const prevChar = previousTyped[idx];
    const currentChar = currentTyped[idx];
    const targetChar = target[idx];

    if (currentChar === undefined || targetChar === undefined) {
      continue;
    }

    const wasCorrect = prevChar !== undefined && prevChar.toLowerCase() === targetChar.toLowerCase();
    const isCorrect = currentChar.toLowerCase() === targetChar.toLowerCase();

    if (!wasCorrect && isCorrect) {
      freshIndexes.add(idx);
    }
  }

  return freshIndexes;
}

function getFreshWrongIndexes(target, previousTyped, currentTyped) {
  const freshIndexes = new Set();
  const maxLen = Math.max(previousTyped.length, currentTyped.length);

  for (let idx = 0; idx < maxLen; idx += 1) {
    const prevChar = previousTyped[idx];
    const currentChar = currentTyped[idx];
    const targetChar = target[idx];

    if (currentChar === undefined || targetChar === undefined) {
      continue;
    }

    const isWrong = currentChar.toLowerCase() !== targetChar.toLowerCase();
    if (!isWrong) {
      continue;
    }

    if (prevChar === undefined || currentChar !== prevChar || prevChar.toLowerCase() === targetChar.toLowerCase()) {
      freshIndexes.add(idx);
    }
  }

  return freshIndexes;
}

function getGuideProgress(target, typed) {
  const correctPrefixLen = getCorrectPrefixLength(target, typed);
  const wordTokens = getGuideWordTokens(target);
  const totalWords = Math.max(wordTokens.length, 1);
  const hasExtraChars = typed.length > target.length && correctPrefixLen >= target.length;
  const hasWrongChar = typed.length > correctPrefixLen && !hasExtraChars;

  if (hasExtraChars) {
    return {
      state: "error",
      statusText: t("messages.guide.statusTooLong"),
      noteText: t("messages.guide.noteTooLong")
    };
  }

  if (hasWrongChar) {
    const expectedChar = target[correctPrefixLen];
    const separatorStatus = getGuideStatusForSeparator(
      expectedChar,
      getGuidePreviousWordToken(wordTokens, correctPrefixLen)?.wordNumber || 1,
      totalWords,
    );

    if (separatorStatus) {
      return {
        state: "error",
        statusText: separatorStatus,
        noteText: t("messages.guide.noteWrong")
      };
    }

    const currentWordToken =
      getGuideWordTokenAt(wordTokens, correctPrefixLen) ||
      getGuidePreviousWordToken(wordTokens, correctPrefixLen) ||
      wordTokens[0];

    return {
      state: "error",
      statusText: t("messages.guide.statusWrong", {
        word: currentWordToken?.wordNumber || 1,
        total: totalWords,
        char: currentWordToken ? (correctPrefixLen - currentWordToken.start + 1) : 1,
      }),
      noteText: t("messages.guide.noteWrong")
    };
  }

  if (correctPrefixLen >= target.length) {
    return {
      state: "success",
      statusText: t("messages.guide.statusDone", { total: totalWords }),
      noteText: ""
    };
  }

  const nextChar = target[correctPrefixLen];
  const separatorStatus = getGuideStatusForSeparator(
    nextChar,
    getGuidePreviousWordToken(wordTokens, correctPrefixLen)?.wordNumber || 1,
    totalWords,
  );

  if (separatorStatus) {
    return {
      state: "progress",
      statusText: separatorStatus,
      noteText: ""
    };
  }

  const currentWordToken =
    getGuideWordTokenAt(wordTokens, correctPrefixLen) ||
    wordTokens[wordTokens.length - 1] ||
    null;

  return {
    state: "progress",
    statusText: t("messages.guide.statusProgress", {
      word: currentWordToken?.wordNumber || 1,
      total: totalWords,
      char: currentWordToken ? (correctPrefixLen - currentWordToken.start + 1) : 1,
      length: currentWordToken?.text.length || 1,
    }),
    noteText: ""
  };
}

function updateAnswerGuide(target, typed) {
  if (!answerGuideEl || !answerGuideStatusEl || !answerGuideNoteEl) {
    return;
  }

  if (!target) {
    answerGuideEl.classList.remove("is-success", "is-error");
    answerGuideStatusEl.classList.remove("is-success", "is-error");
    answerGuideStatusEl.textContent = "";
    answerGuideNoteEl.textContent = "";
    return;
  }

  const { state, statusText, noteText } = getGuideProgress(target, typed);
  answerGuideEl.classList.toggle("is-success", state === "success");
  answerGuideEl.classList.toggle("is-error", state === "error");
  answerGuideStatusEl.classList.toggle("is-success", state === "success");
  answerGuideStatusEl.classList.toggle("is-error", state === "error");
  answerGuideStatusEl.textContent = statusText;
  answerGuideNoteEl.textContent = noteText;
}

function playAnswerGuideCompleteHit() {
  if (!answerGuideEl) {
    return;
  }

  clearTimeout(answerGuideCompleteTimer);
  answerGuideEl.classList.remove("is-complete-hit");
  void answerGuideEl.offsetWidth;
  answerGuideEl.classList.add("is-complete-hit");
  answerGuideCompleteTimer = setTimeout(() => {
    answerGuideEl.classList.remove("is-complete-hit");
  }, 360);
}

function isExactTypedMatch(target, typed) {
  return typed.length === target.length && getCorrectPrefixLength(target, typed) === target.length;
}

function showFeedbackBurst(kind, isBig = false) {
  if (!feedbackBurstEl) {
    return;
  }

  clearTimeout(feedbackBurstTimer);
  feedbackBurstEl.innerHTML = "";
  feedbackBurstEl.className = `feedback-burst is-${kind}${isBig ? " is-big" : ""}`;

  const pieces = kind === "success"
    ? (isBig
      ? ["🎉", "✨", "⭐", "💥", "🎊", "✨", "⭐", "🎉", "💫", "✨"]
      : ["✨", "⭐", "💫", "✨", "⭐", "✨"])
    : ["✖", "⚡", "✕", "⚠", "✖", "⚡"];
  const spread = isBig ? 92 : 58;
  const verticalLift = kind === "success" ? (isBig ? -96 : -62) : 54;

  pieces.forEach((symbol, index) => {
    const piece = document.createElement("span");
    const angle = (-90 + (180 / Math.max(pieces.length - 1, 1)) * index) * (Math.PI / 180);
    const distance = spread * (0.7 + (index % 3) * 0.16);
    const dx = Math.round(Math.cos(angle) * distance);
    const dy = Math.round(Math.sin(angle) * distance + verticalLift);

    piece.className = "burst-piece";
    piece.textContent = symbol;
    piece.style.setProperty("--dx", `${dx}px`);
    piece.style.setProperty("--dy", `${dy}px`);
    piece.style.setProperty("--rot", `${getSecureRandomRange(-30, 30)}deg`);
    piece.style.animationDelay = `${index * 18}ms`;
    feedbackBurstEl.appendChild(piece);
  });

  feedbackBurstTimer = setTimeout(() => {
    feedbackBurstEl.innerHTML = "";
    feedbackBurstEl.className = "feedback-burst";
  }, isBig ? 980 : 760);
}

function buildWordGrid(
  target,
  typed,
  {
    freshCorrectIndexes = new Set(),
    freshWrongIndexes = new Set(),
    terminalHit = null,
  } = {}
) {
  wordGrid.innerHTML = "";
  const { hints, autofill } = getCharMeta(target);
  const correctPrefixLen = getCorrectPrefixLength(target, typed);
  const caretIndex = typed.length;
  const showTerminalStatus = target.length > 0 && caretIndex >= target.length;
  const terminalStatusKind = showTerminalStatus && isExactTypedMatch(target, typed)
    ? "success"
    : "error";
  const tokens = getGuideTokens(target);

  tokens.forEach((token) => {
    if (token.type === "separator") {
      const separator = document.createElement("div");
      const typedSeparator = typed[token.start];

      separator.className = "word-separator";
      separator.dataset.separatorKind = token.kind;
      separator.textContent = getGuideSeparatorLabel(token.char);

      if (typedSeparator !== undefined) {
        separator.classList.add(typedSeparator === token.char ? "state-ok" : "state-bad");
      } else if (token.start === correctPrefixLen) {
        separator.classList.add("state-next");
      }

      if (freshCorrectIndexes.has(token.start)) {
        separator.classList.add("state-hit");
      }

      if (freshWrongIndexes.has(token.start)) {
        separator.classList.add("state-miss");
      }

      if (token.start === caretIndex) {
        separator.classList.add("state-caret");
      }

      if (!showTerminalStatus && token.end === caretIndex && caretIndex === target.length) {
        separator.classList.add("state-caret-after");
      }

      wordGrid.appendChild(separator);
      return;
    }

    const group = document.createElement("div");
    group.className = "word-group";

    for (let idx = token.start; idx < token.end; idx += 1) {
      const targetChar = target[idx];
      const typedChar = typed[idx];
      const wrap = document.createElement("div");
      const letter = document.createElement("div");
      const line = document.createElement("div");

      wrap.className = "wchar";
      letter.className = "wchar-letter";
      line.className = "wchar-line";

      if (autofill.has(idx)) {
        letter.textContent = targetChar;
        wrap.classList.add("state-auto");
      } else if (typedChar !== undefined) {
        const isCorrectChar = typedChar.toLowerCase() === targetChar.toLowerCase();
        letter.textContent = isCorrectChar ? targetChar : typedChar;
        wrap.classList.add(isCorrectChar ? "state-ok" : "state-bad");
        if (freshCorrectIndexes.has(idx)) {
          wrap.classList.add("state-hit");
        }
        if (freshWrongIndexes.has(idx)) {
          wrap.classList.add("state-miss");
        }
      } else if (difficulty === "easy" && idx >= correctPrefixLen && idx < correctPrefixLen + 3) {
        letter.textContent = targetChar;
        wrap.classList.add("state-hint");
      } else if (hints.has(idx)) {
        letter.textContent = targetChar;
        wrap.classList.add("state-hint");
      } else if (difficulty !== "hard" && idx === correctPrefixLen) {
        letter.textContent = targetChar;
        wrap.classList.add("state-next");
      } else {
        letter.textContent = "_";
        wrap.classList.add("state-hidden");
      }

      if (idx === caretIndex) {
        wrap.classList.add("state-caret");
      }

      if (!showTerminalStatus && idx + 1 === caretIndex && caretIndex === target.length) {
        wrap.classList.add("state-caret-after");
      }

      wrap.appendChild(letter);
      wrap.appendChild(line);
      group.appendChild(wrap);
    }

    wordGrid.appendChild(group);
  });

  if (typed.length > target.length) {
    typed.slice(target.length).split("").forEach((extraChar) => {
      if (isGuideSeparatorChar(extraChar)) {
        const extraSeparator = document.createElement("div");
        extraSeparator.className = "word-separator state-bad is-overflow";
        extraSeparator.dataset.separatorKind = getGuideSeparatorKind(extraChar);
        extraSeparator.textContent = getGuideSeparatorLabel(extraChar, { overflow: true });
        wordGrid.appendChild(extraSeparator);
        return;
      }

      const overflowWrap = document.createElement("div");
      const overflowLetter = document.createElement("div");
      const overflowLine = document.createElement("div");

      overflowWrap.className = "wchar state-bad";
      overflowLetter.className = "wchar-letter";
      overflowLine.className = "wchar-line";
      overflowLetter.textContent = extraChar;
      overflowWrap.appendChild(overflowLetter);
      overflowWrap.appendChild(overflowLine);
      wordGrid.appendChild(overflowWrap);
    });
  }

  if (showTerminalStatus) {
    const terminalStatus = document.createElement("div");
    terminalStatus.className = `answer-guide-terminal-status is-${terminalStatusKind}`;
    if (terminalHit && terminalHit === terminalStatusKind) {
      terminalStatus.classList.add(`is-hit-${terminalHit}`);
    }
    terminalStatus.textContent = terminalStatusKind === "success" ? "♥" : "×";
    terminalStatus.setAttribute("aria-hidden", "true");
    wordGrid.appendChild(terminalStatus);
  } else if (caretIndex > target.length || !target.length) {
    const endCaret = document.createElement("div");
    endCaret.className = "answer-guide-inline-caret";
    endCaret.setAttribute("aria-hidden", "true");
    wordGrid.appendChild(endCaret);
  }

  updateAnswerGuide(target, typed);
}

function shuffle(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = getSecureRandomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function startSession(size) {
  const pool = getPool();
  if (!pool.length) {
    return;
  }

  const count = Math.min(size || SESSION_SIZE, pool.length);
  sessionCards = shuffle(pool).slice(0, count);
  sessionIndex = 0;
  streak = 0;
  bestStreak = 0;
  totalCorrect = 0;
  totalAttempts = 0;
  totalCharsTyped = 0;
  sessionStart = Date.now();
  updateStats();
  setGameSurfaceMode(false);
  loadCard();
  const scrollTarget = heroStageEl || mainCard;
  scrollTarget.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function loadCard(options = {}) {
  const { focusInput = true } = options;
  const card = sessionCards[sessionIndex];
  if (!card) {
    return;
  }

  renderPrompt(card);
  inputEl.value = "";
  inputEl.className = "";
  previousTypedValue = "";
  clearTimeout(answerGuideCompleteTimer);
  answerGuideEl?.classList.remove("is-complete-hit");
  solutionEl.style.display = "none";
  forceCorrection = false;
  progFill.style.width = `${(sessionIndex / sessionCards.length) * 100}%`;

  renderCardBadge(card);
  updateSkipCardButtonState();

  mainCard.classList.add("active");
  buildWordGrid(getTargetValue(card), "");
  updateSearchLinks(card);

  if (focusInput) {
    focusAnswerInputWithoutScroll();
  }
}

function updateStats() {
  const streakEl = document.getElementById("streakNum");
  const correctEl = document.getElementById("correctVal");
  const remainingEl = document.getElementById("remainingVal");
  const accuracyEl = document.getElementById("accuracyVal");
  const wpmEl = document.getElementById("wpmVal");

  if (streakEl) {
    streakEl.textContent = streak;
  }
  if (correctEl) {
    correctEl.textContent = totalCorrect;
  }
  if (remainingEl) {
    remainingEl.textContent = sessionCards.length
      ? String(sessionCards.length - sessionIndex)
      : "—";
  }

  const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : null;
  if (accuracyEl) {
    accuracyEl.textContent = accuracy !== null ? `${accuracy}%` : "—";
  }

  const minutes = (Date.now() - sessionStart) / 60000;
  const wpm = minutes > 0 && totalCharsTyped > 0
    ? Math.round((totalCharsTyped / 5) / minutes)
    : null;
  if (wpmEl) {
    wpmEl.textContent = wpm || "—";
  }
}

function showCombo() {
  if (streak < 3) {
    return;
  }

  comboPop.textContent = t(`combo.${Math.min(streak, 8)}`) || `x${streak}`;
  comboPop.classList.remove("animate");
  void comboPop.offsetWidth;
  comboPop.classList.add("animate");
}

let toastTimer;
function showToast(message) {
  if (!message) {
    return;
  }

  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1400);
}

function isStandaloneMode() {
  return Boolean(
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function detectInstallGuideContext() {
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid;
  const isDesktop = !isMobile;
  const isSamsung = /SamsungBrowser/i.test(ua);
  const isFirefox = /Firefox|FxiOS/i.test(ua);
  const isEdgeAndroid = /EdgA/i.test(ua);
  const isEdgeIOS = /EdgiOS/i.test(ua);
  const isEdgeDesktop = /Edg/i.test(ua) && !isEdgeAndroid && !isEdgeIOS;
  const isEdge = isEdgeAndroid || isEdgeIOS || isEdgeDesktop;
  const isOperaTouch = /OPT/i.test(ua);
  const isOpera = /OPR|Opera/i.test(ua) || isOperaTouch;
  const isChromeIOS = /CriOS/i.test(ua);
  const isChromeDesktopOrAndroid = /Chrome/i.test(ua) && !isSamsung && !isFirefox && !isEdge && !isOpera;
  const isChrome = isChromeIOS || isChromeDesktopOrAndroid;
  const isSafari = /Safari/i.test(ua) && !isChrome && !isFirefox && !isEdge && !isOpera && !isSamsung;
  const isFirefoxIOS = /FxiOS/i.test(ua);
  const isFirefoxDesktop = isFirefox && !isMobile;
  const isFirefoxMobile = isFirefox && isMobile;

  let browserLabel = t("installGuide.fallbackBrowser");
  let installPathKey = "default";

  if (isIOS && isSafari) {
    browserLabel = "Safari";
    installPathKey = "iosShare";
  } else if (isEdgeIOS) {
    browserLabel = "Edge iPhone";
    installPathKey = "iosShare";
  } else if (isIOS && isChromeIOS) {
    browserLabel = "Chrome iOS";
    installPathKey = "iosShare";
  } else if (isFirefoxIOS) {
    browserLabel = "Firefox iPhone";
    installPathKey = "iosShare";
  } else if (isAndroid && isSamsung) {
    browserLabel = "Samsung";
    installPathKey = "samsung";
  } else if (isEdgeAndroid) {
    browserLabel = "Edge Android";
    installPathKey = "edgeAndroid";
  } else if (isAndroid && isOperaTouch) {
    browserLabel = "Opera Touch";
    installPathKey = "opera";
  } else if (isAndroid && isOpera) {
    browserLabel = "Opera";
    installPathKey = "opera";
  } else if (isFirefoxMobile) {
    browserLabel = "Firefox";
    installPathKey = "firefoxMobile";
  } else if (isAndroid && isChromeDesktopOrAndroid) {
    browserLabel = "Chrome";
    installPathKey = "chromeAndroid";
  } else if (isEdgeDesktop) {
    browserLabel = "Edge";
    installPathKey = "edgeDesktop";
  } else if (isDesktop && isOpera) {
    browserLabel = "Opera";
    installPathKey = "default";
  } else if (isDesktop && isChromeDesktopOrAndroid) {
    browserLabel = "Chrome";
    installPathKey = "chromeDesktop";
  } else if (isFirefoxDesktop) {
    browserLabel = "Firefox";
    installPathKey = "firefoxDesktop";
  } else if (isDesktop) {
    browserLabel = t("installGuide.fallbackDesktop");
  } else if (isMobile) {
    browserLabel = t("installGuide.fallbackMobile");
  }

  return { isMobile, isDesktop, browserLabel, installPathKey };
}

function renderInstallGuide() {
  if (!installGuideBrowserEl || !installGuideStepsEl) {
    return;
  }

  const context = detectInstallGuideContext();
  const localizedPath = t(`installGuide.paths.${context.installPathKey}`);
  const resolvedPath = localizedPath === `installGuide.paths.${context.installPathKey}`
    ? t("installGuide.paths.default")
    : localizedPath;
  const browserText = `${context.browserLabel}: ${resolvedPath}`;
  const stepsText = t("installGuide.cta");

  installGuideBrowserEl.textContent = browserText;
  installGuideStepsEl.textContent = stepsText;
  renderPhoneInstallGuide(browserText, stepsText);
}

function setDesktopInstallGuideShellVisible(isVisible) {
  siteTitleRowEl?.classList.toggle("has-install-guides", isVisible);
}

function setInstallGuidePillVisible(element, isVisible) {
  element?.classList.toggle("is-hidden", !isVisible);
}

function measureInstallGuidePillFits(element) {
  if (!element || !element.parentElement) {
    return false;
  }

  const panel = element.parentElement;
  if (panel.classList.contains("is-hidden")) {
    return false;
  }

  if (element.clientWidth <= 0 || element.clientHeight <= 0) {
    return false;
  }

  return element.scrollHeight <= element.clientHeight + 1;
}

function cancelInstallGuideLayoutFrame() {
  if (!installGuideLayoutFrame) {
    return;
  }

  window.cancelAnimationFrame(installGuideLayoutFrame);
  installGuideLayoutFrame = 0;
}

function finalizeDesktopInstallGuideLayout() {
  installGuideLayoutFrame = 0;

  if (!installGuidePanelEl || !installGuideBrowserPanelEl || !installGuideBrowserEl || !installGuideStepsEl || !phoneGuideBarEl) {
    return;
  }

  const context = detectInstallGuideContext();
  if ((!context.isMobile && !context.isDesktop) || isStandaloneMode()) {
    hideInstallGuide();
    return;
  }

  phoneGuideBarEl.classList.add("is-hidden");

  const browserFits = measureInstallGuidePillFits(installGuideBrowserEl);
  const stepsFits = measureInstallGuidePillFits(installGuideStepsEl);

  setInstallGuidePillVisible(installGuideBrowserPanelEl, browserFits);
  setInstallGuidePillVisible(installGuidePanelEl, stepsFits);
  setDesktopInstallGuideShellVisible(browserFits || stepsFits);
}

function applyInstallGuideLayout() {
  installGuideLayoutFrame = 0;

  if (!installGuidePanelEl || !installGuideBrowserPanelEl || !phoneGuideBarEl) {
    return;
  }

  const context = detectInstallGuideContext();
  if ((!context.isMobile && !context.isDesktop) || isStandaloneMode()) {
    hideInstallGuide();
    return;
  }

  renderInstallGuide();

  phoneGuideBarEl.classList.add("is-hidden");
  setDesktopInstallGuideShellVisible(true);
  setInstallGuidePillVisible(installGuideBrowserPanelEl, true);
  setInstallGuidePillVisible(installGuidePanelEl, true);

  installGuideLayoutFrame = window.requestAnimationFrame(finalizeDesktopInstallGuideLayout);
}

function scheduleInstallGuideLayout() {
  cancelInstallGuideLayoutFrame();
  installGuideLayoutFrame = window.requestAnimationFrame(applyInstallGuideLayout);
}

function hideInstallGuide() {
  cancelInstallGuideLayoutFrame();
  setDesktopInstallGuideShellVisible(false);
  setInstallGuidePillVisible(installGuideBrowserPanelEl, false);
  setInstallGuidePillVisible(installGuidePanelEl, false);
  phoneGuideBarEl?.classList.add("is-hidden");
}

function maybeShowInstallGuide() {
  if (!installGuidePanelEl || !installGuideBrowserPanelEl || !phoneGuideBarEl) {
    return;
  }

  const context = detectInstallGuideContext();
  if ((!context.isMobile && !context.isDesktop) || isStandaloneMode()) {
    hideInstallGuide();
    return;
  }

  scheduleInstallGuideLayout();
}

function initInstallGuide() {
  if (!installGuidePanelEl || !installGuideBrowserPanelEl) {
    return;
  }

  window.addEventListener("appinstalled", () => {
    hideInstallGuide();
    showToast(t("messages.toasts.install"));
  });

  maybeShowInstallGuide();
}

function getEncouragement(currentStreak) {
  const value = t(`messages.encouragement.${currentStreak}`);
  return value === `messages.encouragement.${currentStreak}` ? null : value;
}

function showSessionEnd() {
  progFill.style.width = "100%";
  setGameSurfaceMode(true);
  updateSkipCardButtonState();

  const pct = Math.round((totalCorrect / sessionCards.length) * 100);
  document.getElementById("finalScore").textContent = `${pct}%`;

  const secs = Math.round((Date.now() - sessionStart) / 1000);
  const wpm = secs > 0 ? Math.round((totalCharsTyped / 5) / (secs / 60)) : 0;
  document.getElementById("finalDetails").textContent =
    t("messages.session.finalDetails", {
      correct: totalCorrect,
      total: sessionCards.length,
      streak: bestStreak,
      wpm,
      secs,
    });
  document.getElementById("finalEmoji").textContent =
    pct === 100 ? t("messages.session.emojiPerfect") :
    pct >= 80 ? t("messages.session.emojiStrong") :
    pct >= 60 ? t("messages.session.emojiGood") :
    t("messages.session.emojiPractice");
}

function hasDuplicate(card) {
  const key = cardKey(card);
  return allCards.some((existing) => cardKey(existing) === key);
}

function addCardToRuntime(card) {
  allCards = mergeCards(allCards, [card]);
  buildTopicPanel();
}

function downloadCardsUserJson() {
  const cards = getExtraCardsForExport();
  if (!cards.length) {
    setAuthoringFeedback(t("messages.authoring.exportEmpty"), true);
    return;
  }

  const blob = new Blob([`${JSON.stringify(cards, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cards.user.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  setAuthoringFeedback(t("messages.authoring.exportDone"), false);
}

async function handleAddCardSubmit(event) {
  event.preventDefault();

  const card = sanitizeCard({
    topic: addCardTopicEl.value,
    subcategory: addCardSubcategoryEl.value,
    scope: addCardScopeEl.value,
    de: addCardDeEl.value,
    hr: addCardHrEl.value,
    en: addCardEnEl.value,
  });

  if (!card) {
    setAuthoringFeedback(t("messages.authoring.invalid"), true);
    return;
  }

  if (hasDuplicate(card)) {
    setAuthoringFeedback(t("messages.authoring.duplicate"), true);
    return;
  }

  setAuthoringBusy(true);

  try {
    if (capabilities.persistentSave) {
    const response = await fetch("./api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || t("messages.authoring.saveFailed"));
      }

      const savedCard = payload.card || card;
      persistentCards = mergeCards(persistentCards, [savedCard]);
      addCardToRuntime(savedCard);
      setAuthoringFeedback(t("messages.authoring.savedPersistent"), false);
    } else {
      sessionOnlyCards = mergeCards(sessionOnlyCards, [card]);
      saveSessionCards();
      addCardToRuntime(card);
      setAuthoringFeedback(t("messages.authoring.savedSession"), false);
    }

    addCardForm.reset();
    fillAuthoringSelects();
    addCardTopicEl.value = TOPIC_OPTIONS[0];
    addCardSubcategoryEl.value = SUBCATEGORY_OPTIONS[0];
    addCardScopeEl.value = CARD_SCOPE_OPTIONS[0];
    showToast(t("messages.toasts.cardSaved"));
  } catch (error) {
    setAuthoringFeedback(error.message || t("messages.authoring.saveFailed"), true);
  } finally {
    setAuthoringBusy(false);
  }
}

function initAuthoringForm() {
  fillAuthoringSelects();
  addCardForm.addEventListener("submit", handleAddCardSubmit);
  exportCardsBtn.addEventListener("click", downloadCardsUserJson);

  if (authorToggleBtn && authorPanelEl) {
    authorToggleBtn.addEventListener("click", () => {
      const isOpen = !authorPanelEl.classList.contains("is-hidden");
      authorPanelEl.classList.toggle("is-hidden", isOpen);
      authorToggleBtn.classList.toggle("active", !isOpen);
      authorToggleBtn.setAttribute("aria-expanded", String(!isOpen));
    });
  }
}

function initInputEvents() {
  languageDockButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchLearningMode(button.dataset.lang);
    });
  });

  if (skipCardBtnEl) {
    skipCardBtnEl.addEventListener("click", () => {
      if (!canSkipCurrentCard()) {
        return;
      }

      const [currentCard] = sessionCards.splice(sessionIndex, 1);
      sessionCards.push(currentCard);
      loadCard();
    });
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      setSettingsOpen(!isSettingsOpen);
    });
  }

  if (switchOrderBtn) {
    switchOrderBtn.addEventListener("click", () => {
      togglePromptOrder();
    });
  }

  inputEl.addEventListener("input", () => {
    if (!sessionCards.length) {
      return;
    }

    const target = getTargetValue(sessionCards[sessionIndex]);
    const typedValue = inputEl.value;
    const previousPrefix = getCorrectPrefixLength(target, previousTypedValue);
    const currentPrefix = getCorrectPrefixLength(target, typedValue);
    const previousExact = isExactTypedMatch(target, previousTypedValue);
    const currentExact = isExactTypedMatch(target, typedValue);
    const previousAtOrPastEnd = previousTypedValue.length >= target.length;
    const currentAtOrPastEnd = typedValue.length >= target.length;
    const reachedTerminalSuccess = !previousExact && currentExact;
    const reachedTerminalError = currentAtOrPastEnd && !currentExact && (!previousAtOrPastEnd || previousExact);
    const freshCorrectIndexes = getFreshCorrectIndexes(
      target,
      previousTypedValue,
      typedValue
    );
    const freshWrongIndexes = getFreshWrongIndexes(
      target,
      previousTypedValue,
      typedValue
    );

    buildWordGrid(target, typedValue, {
      freshCorrectIndexes,
      freshWrongIndexes,
      terminalHit:
        reachedTerminalSuccess ? "success" :
        reachedTerminalError ? "error" :
        null,
    });

    if (reachedTerminalSuccess) {
      playAnswerGuideCompleteHit();
      showFeedbackBurst("success", false);
    } else if (
      reachedTerminalError ||
      (previousExact && !currentExact && typedValue.length > previousTypedValue.length) ||
      (typedValue.length > previousTypedValue.length && currentPrefix < typedValue.length && currentPrefix <= previousPrefix)
    ) {
      showFeedbackBurst("error", false);
    }

    previousTypedValue = typedValue;
  });

  document.getElementById("hintBtn").addEventListener("click", () => {
    if (!sessionCards.length) {
      return;
    }

    const target = getTargetValue(sessionCards[sessionIndex]);
    const reveal = getHintRevealValue(target, inputEl.value);
    inputEl.value = reveal;
    buildWordGrid(target, reveal, {
      terminalHit: isExactTypedMatch(target, reveal) ? "success" : null,
    });
    if (isExactTypedMatch(target, reveal)) {
      playAnswerGuideCompleteHit();
    }
    previousTypedValue = reveal;
    focusAnswerInputWithoutScroll();
  });

  inputEl.addEventListener("touchstart", activateTouchInputWithoutScroll, { passive: false });

  inputEl.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") {
      activateTouchInputWithoutScroll(event);
    }
  });

  inputEl.addEventListener("focus", () => {
    lockViewportLayoutForKeyboard();
  });

  inputEl.addEventListener("blur", () => {
    releaseViewportLayoutAfterKeyboard();
  });

  inputEl.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || !sessionCards.length) {
      return;
    }

    const card = sessionCards[sessionIndex];
    const target = getTargetValue(card);
    if (normalizeAnswer(inputEl.value) === normalizeAnswer(target)) {
      showFeedbackBurst("success", true);
      totalCharsTyped += target.length;
      if (!forceCorrection) {
        totalCorrect += 1;
        streak += 1;
        if (streak > bestStreak) {
          bestStreak = streak;
        }
        showCombo();
        showToast(getEncouragement(streak));
      }
      totalAttempts += 1;
      inputEl.className = "correct";
      updateStats();
      setTimeout(() => {
        sessionIndex += 1;
        if (sessionIndex >= sessionCards.length) {
          showSessionEnd();
        } else {
          loadCard();
        }
      }, 140);
    } else {
      showFeedbackBurst("error", false);
      if (!forceCorrection) {
        totalAttempts += 1;
        streak = 0;
      }
      inputEl.className = "wrong";
      solutionEl.innerHTML = `<strong>${t("messages.solution.correctPrefix")}</strong> ${target}`;
      solutionEl.style.display = "block";
      forceCorrection = true;
      updateStats();
    }
  });
}

function createFlagColumns() {
  const flagEl = document.getElementById("deFlag");
  for (let i = 0; i < 50; i += 1) {
    const col = document.createElement("div");
    col.className = "de-flag-col";
    col.style.animationDelay = `${-(i / 20) * 3}s`;
    const baseBillow = (i / 4) * 16 + 4;
    const billow = i >= 25 ? baseBillow * 1.3 : baseBillow;
    col.style.setProperty("--billow", `${billow}px`);
    flagEl.appendChild(col);
  }
}

async function initApp() {
  learningMode = loadLearningMode();
  isPromptOrderSwapped = loadPromptOrderPreference();
  const [loadedLocales, baseCards, loadedPersistentCards, currentCapabilities, loadedFacts, loadedEuropeFacts, loadedWorldFacts] = await Promise.all([
    loadLocales(),
    fetchJson("cards.json", []),
    fetchJson("cards.user.json", []),
    detectCapabilities(),
    loadGermanyFacts(),
    loadEuropeFacts(),
    loadWorldFacts(),
  ]);

  locales = deepMergeObjects(loadedLocales || {}, FACTS_LOCALE_PATCHES);
  applyLearningTheme();
  renderStaticUi();
  createFlagColumns();
  initInstallGuide();
  initDifficultyControls();
  initInputEvents();
  initAuthoringForm();
  setSettingsOpen(false);

  capabilities = currentCapabilities;
  germanyFacts = loadedFacts;
  europeFacts = loadedEuropeFacts;
  worldFacts = loadedWorldFacts;
  persistentCards = Array.isArray(loadedPersistentCards)
    ? loadedPersistentCards.map(sanitizeCard).filter(Boolean)
    : [];
  sessionOnlyCards = capabilities.persistentSave ? [] : loadSessionCards();
  allCards = mergeCards(baseCards, persistentCards, sessionOnlyCards);

  renderAuthoringMode();
  initFactsPanel();
  renderStaticUi();
  buildTopicPanel();
  startSession();
}

window.startSession = startSession;
initViewportProfile();
initAppLoader();
initApp()
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    hideAppLoader();
  });
