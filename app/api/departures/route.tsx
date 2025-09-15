import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const station = (searchParams.get("station") || "PHIL").toUpperCase();
  const dir = (searchParams.get("dir") || "s").toLowerCase();

  if (!["s", "n"].includes(dir)) {
    return NextResponse.json({ error: "Invalid dir. Use 's' or 'n'." }, { status: 400 });
  }

  const key = process.env.BART_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Missing BART_API_KEY" }, { status: 500 });
  }

  const url = `https://api.bart.gov/api/etd.aspx?cmd=etd&orig=${station}&dir=${dir}&key=${key}&json=y`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch BART data" }, { status: 502 });
  }

  const raw = await res.json();

  // Normalize a compact shape for the client
  const stationNode = raw?.root?.station?.[0];
  const etd = stationNode?.etd ?? [];

  const items = etd.flatMap((dest: any) =>
    (dest.estimate ?? []).map((est: any) => ({
      minutes: est.minutes,          // string: "Leaving" or "7"
      destination: dest.destination, // "SFO Airport", "Daly City", etc.
      platform: est.platform,
      hexcolor: est.hexcolor,
    }))
  );

  return NextResponse.json({
    station: stationNode?.name ?? station,
    dir,
    items,
    timestamp: raw?.root?.time ?? new Date().toLocaleString(),
  });
}
