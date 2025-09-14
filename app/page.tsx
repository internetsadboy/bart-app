"use client";

import { useEffect, useState } from "react";
import { fetchDepartures, Departure } from "../lib/fetchDepartures";

function minutesToClock(minutesStr: string) {
  if (minutesStr === "Leaving") return "Now";
  const n = parseInt(minutesStr, 10);
  if (Number.isNaN(n)) return "—";
  const dt = new Date(Date.now() + n * 60_000);
  // show just hour:minute (12h/24h based on user locale)
  return dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function Home() {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("—");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await fetchDepartures();
      setDepartures(data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch {
      setError("Failed to fetch data");
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        BART Departures: Pleasant Hill → SFO
      </h1>

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
            ) : departures.length > 0 ? (
              departures.map((d, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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
                  Loading…
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
