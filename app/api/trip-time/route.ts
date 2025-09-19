import { NextRequest, NextResponse } from "next/server";

const BART_KEY = process.env.BART_API_KEY!;

function pick<T=any>(obj: any, ...keys: string[]): T | undefined {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined) return v as T;
  }
  return undefined;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orig = searchParams.get("orig");
    const dest = searchParams.get("dest");
    if (!orig || !dest) {
      return NextResponse.json({ error: "Missing orig/dest" }, { status: 400 });
    }

    const url =
      `https://api.bart.gov/api/sched.aspx?cmd=depart` +
      `&orig=${orig}&dest=${dest}&date=now&time=now&b=0&a=2&l=1&json=y&key=${BART_KEY}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `BART error ${res.status}` }, { status: 502 });
    }

    const data = await res.json();

    // The JSON can be either:
    // root.schedule.request.trip (object or array)
    // or with arrays at each level: root.schedule[0].request[0].trip
    // and attributes live under "@...".
    const schedule =
      pick<any>(data?.root, "schedule") ??
      (Array.isArray(data?.root?.schedule) ? data.root.schedule[0] : undefined);

    const request =
      pick<any>(schedule, "request") ??
      (Array.isArray(schedule?.request) ? schedule.request[0] : undefined);

    let trip = request?.trip;
    if (!trip) {
      return NextResponse.json({ error: "No trips returned" }, { status: 502 });
    }
    const trips = Array.isArray(trip) ? trip : [trip];

    // Map to numeric minutes from either "tripTime" or "@tripTime"
    const mins: number[] = trips
      .map((t: any) => {
        const raw = pick<string>(t, "tripTime", "@tripTime");
        const n = Number(raw);
        return Number.isFinite(n) ? n : NaN;
      })
      .filter((n) => Number.isFinite(n));

    if (!mins.length) {
      // Optional: log to server console for quick debugging
      // console.log("BART trip payload (no numeric tripTime):", JSON.stringify(data, null, 2));
      return NextResponse.json({ error: "Invalid tripTime" }, { status: 502 });
    }

    const durationMin = Math.min(...mins); // choose fastest option
    return NextResponse.json({ durationMin });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
