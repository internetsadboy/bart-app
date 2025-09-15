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
    second: "2-digit",
    hour12: false, // 24h
  });
}

export const STATIONS: Array<{ code: string; name: string }> = [
  { code: "PHIL", name: "Pleasant Hill / Contra Costa Centre" },
  { code: "EMBR", name: "Embarcadero (SF)" },
  { code: "CIVC", name: "Civic Center / UN Plaza" },
  { code: "POWL", name: "Powell St (SF)" },
  { code: "DALY", name: "Daly City" },
  { code: "SFIA", name: "SFO Airport" },
  { code: "MLBR", name: "Millbrae" },
  // add more as needed…
];
