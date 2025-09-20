"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dir } from "@/lib/bart";
import { minutesToClock, STATIONS } from "@/lib/bart";

type ApiDeparture = {
  minutes: string;
  destination: string;
  platform?: string;
  hexcolor?: string;
};

export default function Home() {
  const [station, setStation] = useState<string>("PHIL");
  const [destinationStation, setDestinationStation] = useState<string>("EMBR");
  const [finalDestination, setFinalDestination] = useState<string>("");
  const [dir, setDir] = useState<Dir>("s");
  const [items, setItems] = useState<ApiDeparture[]>([]);
  const [stationName, setStationName] = useState<string>("Pleasant Hill / Contra Costa Centre");
  const [lastUpdated, setLastUpdated] = useState<string>("—");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // NEW: scheduled duration (mins) from station -> destinationStation
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const [durationErr, setDurationErr] = useState<string | null>(null);

const visibleItems = useMemo(() => {
  const destName = STATIONS.find(s => s.code === destinationStation)?.name;
  if (!destName) return items;

  // Try exact match first (rare, when your chosen dest is a terminal)
  const exact = items.filter(d => d.destination === destName);
  if (exact.length) return exact;

  // Fallback: show all departures (many trips to EMBR/CIVC/POWL/MONT involve trains
  // whose ETD 'destination' is a terminal like SFIA/MLBR/DALY CITY).
  return items;
}, [items, destinationStation]);


  // Fetch ETD rows (your existing function)
  async function load(currentStation: string, currentDir: Dir) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/departures?station=${currentStation}&dir=${currentDir}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
  
      setFinalDestination(data.items[0].destination ?? "");
      setItems(data.items ?? []);
      setStationName(data.station ?? currentStation);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      setError("Failed to fetch data");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // NEW: fetch scheduled duration for (station -> destinationStation)
  useEffect(() => {
    let cancelled = false;
    setDurationErr(null);
    setDurationMin(null);

    (async () => {
      try {
        const res = await fetch(`/api/trip-time?orig=${station}&dest=${destinationStation}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);
        if (!cancelled) setDurationMin(Number(json.durationMin));
      } catch (e: any) {
        if (!cancelled) setDurationErr(e?.message ?? "Failed to load scheduled trip time");
      }
    })();

    return () => { cancelled = true; };
  }, [station, destinationStation]);

  // Initial load + refresh on station/dir change
  useEffect(() => {
    load(station, dir);
    const id = setInterval(() => load(station, dir), 30_000);
    return () => clearInterval(id);
  }, [station, dir, destinationStation]);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl mb-4">SELECT STATION</h1>
      <h1 className="text-2xl font-bold mb-6 overflow-hidden">{`${durationMin !== null ? durationMin : "00"} ${station}  → ${destinationStation}`}</h1>

      {/* Station Selector */}
      <section className="flex flex-col mb-6 gap-2 text-xl">
        <div className="flex flex-col w-full">
          <select
            className="max-w-full border px-2 py-1"
            value={station}
            onChange={(e) => setStation(e.target.value)}
          >
            {STATIONS.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-full mt-2">
          <select
            className="max-w-full border px-2 py-1"
            value={destinationStation}
            onChange={(e) => setDestinationStation(e.target.value)}
          >
            {STATIONS.filter(s => s.code !== station).map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
        </div>

        

        {/* Dir Toggle */}
        <div className="border flex flex-col mt-2">
          <button
            type="button"
            aria-pressed={dir === "s"}
            onClick={() => setDir("s")}
            className={`flex-1 px-4 py-1 text-lg font-medium ${dir === "s" ? "bg-black text-white" : "bg-white text-black"}`}
          >
            South
          </button>
          <button
            type="button"
            aria-pressed={dir === "n"}
            onClick={() => setDir("n")}
            className={`flex-1 px-4 py-1 text-lg font-medium border-l ${dir === "n" ? "bg-black text-white" : "bg-white text-black"}`}
          >
            North
          </button>
        </div>
        <div className="flex mt-2 font-bold tracking-wide">Direction
          <span className="ml-2 font-medium">{`-- ${finalDestination}`}</span>
        </div>
      </section>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Departs</th>
              <th className="px-4 py-2">Leaves</th>
              <th className="px-4 py-2">Arrives</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-red-500">{error}</td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-4">Loading…</td>
              </tr>
            ) : visibleItems.length ? (
              visibleItems.slice(0, 6).map((d, i) => {
                console.log(d)
                const departIn = d.minutes === "Leaving" ? 0 : Number(d.minutes);
                const leavesClock = minutesToClock(String(departIn));
                const arrivesClock =
                  durationMin !== null
                    ? minutesToClock(String(departIn + durationMin))
                    : "—";
                return (
                  <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-2">
                      {d.minutes === "Leaving" ? "Leaving" : `${d.minutes} min`}
                    </td>
                    <td className="px-4 py-2">{leavesClock}</td>
                    <td className="px-4 py-2">{arrivesClock}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-4">No trains found.</td>
              </tr>
            )}
          </tbody>
          {(durationErr || durationMin == null) && !loading && !error && (
            <tfoot>
              <tr>
                <td colSpan={3} className="px-4 py-2 text-sm text-gray-500">
                  {durationErr ? `Trip time unavailable: ${durationErr}` : "Fetching scheduled trip time…"}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-600">Last updated: {lastUpdated}</p>
    </main>
  );
}
