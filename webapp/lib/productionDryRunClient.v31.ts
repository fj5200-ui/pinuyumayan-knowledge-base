export type ProductionDryRunReadiness = {
  ok: boolean;
  version: "v31";
  blockers?: string[];
  recommendation?: string;
};

export function createProductionDryRunClient(baseUrl: string) {
  const root = baseUrl.replace(/\/$/, "");
  return {
    async readiness(): Promise<ProductionDryRunReadiness> {
      const res = await fetch(`${root}/api/ops/dry-run/v31/readiness`, { cache: "no-store" });
      if (!res.ok) throw new Error(`v31 readiness failed: ${res.status}`);
      return res.json();
    },
    async checklist() {
      const res = await fetch(`${root}/api/ops/dry-run/v31/checklist`, { cache: "no-store" });
      if (!res.ok) throw new Error(`v31 checklist failed: ${res.status}`);
      return res.json();
    },
    async hmacCoverage() {
      const res = await fetch(`${root}/api/ops/security/v31/hmac-route-coverage`, { cache: "no-store" });
      if (!res.ok) throw new Error(`v31 hmac coverage failed: ${res.status}`);
      return res.json();
    }
  };
}
