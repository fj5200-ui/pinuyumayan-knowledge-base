/**
 * Full corpus import worker entrypoint.
 *
 * This worker must be run as a post-deploy/background job, not in API startup.
 * It is intentionally thin: the canonical parser remains in scripts/build_full_puyuma_web_vocabulary.py
 * so Codex/Kimi can replace this shell bridge with a native queue worker later.
 */
import { spawn } from "node:child_process";

const minEntries = process.env.FULL_CORPUS_MIN_ENTRIES ?? "1000";
const args = ["scripts/build_full_puyuma_web_vocabulary.py", "--download", "--min-entries", minEntries];

const child = spawn("python3", args, { cwd: process.cwd().replace(/\/backend$/, ""), stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 1));
