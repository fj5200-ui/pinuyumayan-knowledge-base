"use client";
import { useEffect, useState } from "react";

export function MainSiteKbConnectionPanelV24() {
  const [state, setState] = useState<any>(null);
  useEffect(() => { fetch("/api/kb/connection-check").then(r=>r.json()).then(setState); }, []);
  return <pre className="rounded border p-3 text-xs overflow-auto">{JSON.stringify(state, null, 2)}</pre>;
}
