import { NextRequest, NextResponse } from "next/server";
import { kbInternalFetchV24 } from "../../../lib/kbHmacClient.v24";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await kbInternalFetchV24("/api/internal/articles/v24/schedule", { method: "POST", body });
  return NextResponse.json(result);
}
