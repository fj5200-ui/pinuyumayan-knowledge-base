export type ConnectionCheck = {
  version: "v24";
  publicApi: "ok" | "unknown";
  internalApi: "requires_hmac";
  forbiddenRelationGuard: "enabled";
  articleGeneration: "main_site_server_route_only";
};

export function getMainSiteRuntimeStatusV24(): ConnectionCheck {
  return {
    version: "v24",
    publicApi: "ok",
    internalApi: "requires_hmac",
    forbiddenRelationGuard: "enabled",
    articleGeneration: "main_site_server_route_only"
  };
}

export function validateClientDraftV24(draft: any) {
  const text = JSON.stringify(draft ?? {}).toLowerCase();
  const forbidden = ["卑南文化遺址", "卑南遺址", "beinan site", "peinan site", "peinan archaeological site"];
  const hits = forbidden.filter((term) => text.includes(term.toLowerCase()));
  return {
    ok: hits.length === 0,
    findings: hits.map((term) => ({ type: "forbidden_relation", severity: "block", term })),
    requiredReview: true
  };
}
