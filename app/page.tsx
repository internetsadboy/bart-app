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
    return `${stationName}`;
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
      <h1 className="text-xl mb-4">SELECT STATION</h1>
      <h1 className="text-2xl font-bold mb-6 overflow-hidden">{title}</h1>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-6 sm:flex-col sm:items-left">
        {/* Station Select */}
        <label className="flex flex-col gap-4">
          
          <select
            className="border border-gray-300 px-3 py-2 text-lg"
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
        <div className="border flex flex-col mb-4">
          <button
            type="button"
            aria-pressed={dir === "s"}
            onClick={() => setDir("s")}
            className={`flex-1 px-4 py-1 text-lg font-medium ${
              dir === "s" ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            North
          </button>
          <button
            type="button"
            aria-pressed={dir === "n"}
            onClick={() => setDir("n")}
            className={`flex-1 px-4 py-1 text-lg font-medium border-l ${
              dir === "n" ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            South
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
