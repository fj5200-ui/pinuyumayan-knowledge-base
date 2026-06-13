import { ok, fail } from "../lib/apiResponse";
import { queryRows, execute } from "../lib/dbQuery";
export function registerVpsDatabaseV26Routes(app) {
    app.get("/api/ops/vps-db/v26/status", async (_req, res) => {
        try {
            const instances = await queryRows(`SELECT instance_key, engine, host_label, database_name, network_scope, status, updated_at FROM vps_database_instances_v26 ORDER BY id`);
            const migrations = await queryRows(`SELECT migration_file, status, started_at, finished_at FROM vps_migration_runs_v26 ORDER BY started_at DESC LIMIT 20`);
            return ok(res, { version: "v26", databaseHostMode: "vps", instances, migrations });
        }
        catch (error) {
            return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable");
        }
    });
    app.post("/api/internal/vps-db/v26/backup-report", async (req, res) => {
        try {
            const { backupKey, instanceKey, storageUri, sha256, sizeBytes, status } = req.body ?? {};
            if (!backupKey || !instanceKey || !storageUri)
                return fail(res, 400, "BAD_REQUEST", "backupKey, instanceKey and storageUri are required");
            await execute(`INSERT INTO vps_database_backups_v26 (backup_key, instance_key, storage_uri, sha256, size_bytes, status, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, IF(? IN ('completed','failed'), NOW(), NULL))
         ON DUPLICATE KEY UPDATE storage_uri=VALUES(storage_uri), sha256=VALUES(sha256), size_bytes=VALUES(size_bytes), status=VALUES(status), completed_at=VALUES(completed_at)`, [backupKey, instanceKey, storageUri, sha256 ?? null, sizeBytes ?? null, status ?? "completed", status ?? "completed"]);
            return ok(res, { version: "v26", recorded: true, backupKey });
        }
        catch (error) {
            return fail(res, 503, "DB_UNAVAILABLE", error instanceof Error ? error.message : "DB unavailable");
        }
    });
    app.get("/api/ops/next-upgrade-plan/v27", (_req, res) => {
        res.json({ ok: true, version: "v27", planFile: "data/development/next_upgrade_plan_v27.json" });
    });
}
