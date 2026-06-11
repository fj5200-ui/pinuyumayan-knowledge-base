import { NextRequest, NextResponse } from "next/server";
import { signedKbFetchV25 } from "../../../../lib/kbHmacClient.v25";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const resp = await signedKbFetchV25("/api/admin/articles/v25/review-action", { method: "POST", body });
  const data = await resp.json();
  return NextResponse.json(data, { status: resp.status });
}
