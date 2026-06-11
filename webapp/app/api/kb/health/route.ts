import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.PINUYUMAYAN_KB_API_URL ?? process.env.NEXT_PUBLIC_KB_API_URL;
  if (!baseUrl) return NextResponse.json({ ok: false, error: "missing kb url" }, { status: 500 });
  const res = await fetch(`${baseUrl}/health`, { cache: "no-store" });
  return NextResponse.json({ ok: res.ok, status: res.status });
}
