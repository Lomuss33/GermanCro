export const searchSites = [
  { name: "dict.cc", icon: "C", url: (w) => `https://www.dict.cc/?s=${encodeURIComponent(w)}` },
  { name: "Google", icon: "G", url: (w) => `https://www.google.com/search?q=${encodeURIComponent(`${w} auf Deutsch`)}` },
  { name: "Linguee", icon: "L", url: (w) => `https://www.linguee.de/deutsch-englisch/search?query=${encodeURIComponent(w)}` },
  { name: "Leo", icon: "L", url: (w) => `https://dict.leo.org/german-english/${encodeURIComponent(w)}` },
];
