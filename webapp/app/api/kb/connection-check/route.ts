import { NextResponse } from "next/server";
import { kbInternalFetchV24 } from "../../../../lib/kbHmacClient.v24";

export async function GET() {
  const publicBase = process.env.NEXT_PUBLIC_KB_API_URL;
  const checks: any = { publicBaseConfigured: Boolean(publicBase), publicHealth: null, internalHmac: null };
  if (publicBase) {
    const res = await fetch(`${publicBase}/health`, { cache: "no-store" }).catch(() => null);
    checks.publicHealth = res ? { ok: res.ok, status: res.status } : { ok: false };
  }
  try {
    checks.internalHmac = await kbInternalFetchV24("/api/ops/main-site/v24/connection-check");
  } catch (err: any) {
    checks.internalHmac = { ok: false, error: err.message };
  }
  return NextResponse.json({ ok: checks.publicHealth?.ok === true && !checks.internalHmac?.error, checks });
}
