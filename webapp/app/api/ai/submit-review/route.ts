import { NextRequest, NextResponse } from "next/server";
import { fetchInternalKnowledge } from "../../../lib/pinuyumayanKbClient";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await fetchInternalKnowledge("/api/internal/ai-article/client-draft/submit-review", {
    method: "POST",
    body
  });
  return NextResponse.json(result);
}
