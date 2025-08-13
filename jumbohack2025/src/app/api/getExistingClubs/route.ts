// app/api/getExistingClubs/route.ts
import { NextResponse, NextRequest } from "next/server";
import { query } from "@/lib/query";

// If your query() uses node 'pg', keep Node runtime:
export const runtime = "nodejs";            // <-- IMPORTANT for 'pg' pools
export const dynamic = "force-dynamic";     // avoid caching, just in case

export async function POST(req: NextRequest) {
  try {
    const { eventID } = await req.json();
    if (!eventID) {
      return NextResponse.json({ message: "Missing eventID" }, { status: 400 });
    }

    const sql = `
      SELECT id, name, category, coordinates, start_time, end_time
      FROM clubs
      WHERE event_id = $1 AND coordinates IS NOT NULL
    `;

    const result = await query(sql, [eventID]);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error("Error fetching clubs:", err);
    // In dev, return the actual error so you can see it:
    const msg =
      process.env.NODE_ENV === "development" && err?.message
        ? err.message
        : "Error fetching clubs";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
