export type Dir = "s" | "n";

export interface Departure {
  minutes: string;       // "Leaving" or "7"
  destination: string;   // e.g., "SFO Airport"
}

export function minutesToClock(minutesStr: string) {
  if (minutesStr === "Leaving") return "Now";
  const n = parseInt(minutesStr, 10);
  if (Number.isNaN(n)) return "—";
  const dt = new Date(Date.now() + n * 60_000);
  return dt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24h
  });
}



export const STATIONS: Array<{ code: string; name: string }> = [
  // top five stations are curated
  { code: "PHIL", name: "Pleasant Hill / Contra Costa Center" },
  { code: "EMBR", name: "Embarcadero (SF)" },
  { code: "CIVC", name: "Civic Center / UN Plaza" },
  { code: "16TH", name: "16th St Mission (SF)" },
  { code: "WCRK", name: "Walnut Creek" },
  // the rest are alphabetized
  { code: "12TH", name: "12th St. Oakland City Center"},
  { code: "19TH", name: "19th St. Oakland"},
  { code: "24TH", name: "24th St. Mission (SF)"},
  { code: "ANTC", name: "Antioch"},
  { code: "ASHB", name: "Ashby (Berkeley)"},
  { code: "BALB", name: "Balboa Park (SF)"},
  { code: "BAYF", name: "Bay Fair (San Leandro)"},
  { code: "BERY", name: "Berryessa / North San Jose"},
  { code: "CAST", name: "Castro Valley"},
  { code: "COLM", name: "Colma"},
  { code: "COLS", name: "Coliseum"},
  { code: "CONC", name: "Concord"},
  { code: "DALY", name: "Daly City"},
  { code: "DBRK", name: "Downtown Berkeley"},
  { code: "DELN", name: "El Cerrito del Norte"},
  { code: "DUBL", name: "Dublin/Pleasanton"},
  { code: "FRMT", name: "Fremont"},
  { code: "FTVL", name: "Fruitvale (Oakland)"},
  { code: "GLEN", name: "Glen Park (SF)"},
  { code: "HAYW", name: "Hayward"},
  { code: "LAFY", name: "Lafayette"},
  { code: "LAKE", name: "Lake Merritt (Oakland)"},
  { code: "MCAR", name: "MacArthur (Oakland)"},
  { code: "MLBR", name: "Millbrae"},
  { code: "MLPT", name: "Milpitas"},
  { code: "MONT", name: "Montgomery St. (SF)"},
  { code: "NBRK", name: "North Berkeley"},
  { code: "NCON", name: "North Concord/Martinez"},
  { code: "OAKL", name: "Oakland Int’l Airport"},
  { code: "ORIN", name: "Orinda"},
  { code: "PCTR", name: "Pittsburg Center"},
  { code: "PITT", name: "Pittsburg/Bay Point"},
  { code: "POWL", name: "Powell St. (SF)"},
  { code: "PLZA", name: "El Cerrito Plaza"},
  { code: "RICH", name: "Richmond"},
  { code: "ROCK", name: "Rockridge (Oakland)"},
  { code: "SANL", name: "San Leandro"},
  { code: "SBRN", name: "San Bruno"},
  { code: "SFIA", name: "San Francisco Int’l Airport"},
  { code: "SHAY", name: "South Hayward"},
  { code: "SSAN", name: "South San Francisco"},
  { code: "UCTY", name: "Union City"},
  { code: "WARM", name: "Warm Springs / South Fremont"},
  { code: "WDUB", name: "West Dublin"},
  { code: "WOAK", name: "West Oakland"}
  // add more as needed…
];
