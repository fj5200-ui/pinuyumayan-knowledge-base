import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.PINUYUMAYAN_KB_API_URL!;
  const res = await fetch(`${baseUrl}/api/ops/data-mode/v27/status`, { cache: "no-store" });
  return NextResponse.json(await res.json(), { status: res.status });
}
