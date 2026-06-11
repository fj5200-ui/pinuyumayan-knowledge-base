import { NextRequest, NextResponse } from "next/server";
import { fetchInternalKnowledge } from "../../../lib/pinuyumayanKbClient";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validation = await fetchInternalKnowledge("/api/internal/ai-article/client-draft/validate", {
    method: "POST",
    body
  });
  return NextResponse.json(validation);
}
