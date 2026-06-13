export function registerContractRoutes(app) {
    app.get("/api/ops/contract-tests/latest", (_req, res) => {
        res.json({ ok: true, version: "v15", status: "not_run_in_scaffold" });
    });
    app.post("/api/internal/contracts/run", (_req, res) => {
        res.status(202).json({ ok: true, accepted: true, runId: `contract_${Date.now()}` });
    });
}
