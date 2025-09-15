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
  const [dir, setDir] = useState<Dir>("s");
  const [items, setItems] = useState<ApiDeparture[]>([]);
  const [stationName, setStationName] = useState<string>("Pleasant Hill / Contra Costa Centre");
  const [lastUpdated, setLastUpdated] = useState<string>("—");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    return `BART Departures: ${stationName} ${dir === "s" ? "→ Southbound" : "→ Northbound"}`;
  }, [stationName, dir]);

  async function load(currentStation: string, currentDir: Dir) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/departures?station=${currentStation}&dir=${currentDir}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();

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

  // Initial load + refresh on station/dir change
  useEffect(() => {
    load(station, dir);
    const id = setInterval(() => load(station, dir), 30_000);
    return () => clearInterval(id);
  }, [station, dir]);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Station Select */}
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium">Station</span>
          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={station}
            onChange={(e) => setStation(e.target.value)}
          >
            {STATIONS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        {/* Dir Toggle */}
        <div className="inline-flex rounded-lg border overflow-hidden w-fit">
          <button
            type="button"
            aria-pressed={dir === "s"}
            onClick={() => setDir("s")}
            className={`px-4 py-2 text-sm font-medium ${
              dir === "s" ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            Southbound
          </button>
          <button
            type="button"
            aria-pressed={dir === "n"}
            onClick={() => setDir("n")}
            className={`px-4 py-2 text-sm font-medium border-l ${
              dir === "n" ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            Northbound
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Departs</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Destination</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-4">
                  Loading…
                </td>
              </tr>
            ) : items.length ? (
              items.slice(0, 6).map((d, i) => (
                <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-4 py-2">
                    {d.minutes === "Leaving" ? "Leaving" : `${d.minutes} min`}
                  </td>
                  <td className="px-4 py-2">{minutesToClock(d.minutes)}</td>
                  <td className="px-4 py-2">{d.destination}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-4">
                  No trains found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-600">Last updated: {lastUpdated}</p>
    </main>
  );
}
