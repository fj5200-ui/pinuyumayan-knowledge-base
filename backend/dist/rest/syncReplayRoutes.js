import { requireApiScopes } from "../security/apiScopes";
export function registerSyncReplayRoutes(app) {
    app.post("/api/internal/main-site/sync/replay", requireApiScopes(["knowledge:read", "sync:replay"]), (req, res) => {
        const since = req.body?.since ?? req.query.since ?? null;
        const until = req.body?.until ?? req.query.until ?? null;
        return res.status(202).json({
            ok: true,
            replayKey: `replay_${Date.now()}`,
            status: "queued",
            since,
            until,
            maxWindowDays: 30
        });
    });
}
