// lib/fetchDepartures.ts
export interface Departure {
  minutes: string;
  destination: string;
  line: string;
  platform: string;
}

const API_URL =
  "https://api.bart.gov/api/etd.aspx?cmd=etd&orig=PHIL&dir=s&key=MW9S-E7SL-26DU-VV8V&json=y";

export async function fetchDepartures(): Promise<Departure[]> {
  const res = await fetch(API_URL);
  const data = await res.json();

  const station = data.root.station[0];
  const etdList = station.etd || [];

  const estimates: Departure[] = etdList.flatMap((dest: any) =>
    dest.estimate.map((est: any) => ({
      minutes: est.minutes,
      destination: dest.destination,
      line: est.hexcolor,
      platform: est.platform,
    }))
  );

  // Only Yellow line trains (southbound)
  return estimates.filter((e) => e.line.toLowerCase() === "#ffff33").slice(0, 5);
}
