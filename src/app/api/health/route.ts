import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "Chocobliss by Tasnim",
    timestamp: new Date().toISOString(),
  });
}
