import { NextResponse } from "next/server";
import { query } from "../../../lib/query";

export async function POST(request: Request) {
  try {
    const { eventId } = await request.json(); // Extract eventId from request body
    if (!eventId) {
      return NextResponse.json(
        { message: "eventId is required" },
        { status: 400 }
      );
    }

    const result = await query(
      "SELECT id, name, category, coordinates, description FROM clubs WHERE event_id = $1",
      [eventId]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching clubs:", error);
    return NextResponse.json(
      { message: "Error fetching clubs" },
      { status: 500 }
    );
  }
}
