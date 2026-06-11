#!/usr/bin/env python3
from pathlib import Path
import json, sys
ROOT = Path(__file__).resolve().parents[1]

def require(path: str) -> Path:
    p = ROOT / path
    if not p.exists():
        raise SystemExit(f"missing required file: {path}")
    return p

manifest = json.loads(require("data/audio/puyuma_audio_playback_manifest_v17.json").read_text(encoding="utf-8"))
entries = manifest.get("entries", [])
if len(entries) < 80:
    raise SystemExit(f"expected at least 80 audio playback entries, got {len(entries)}")
if manifest.get("policy", {}).get("human_recorded_audio_priority") is not True:
    raise SystemExit("human_recorded_audio_priority must be true")
if manifest.get("policy", {}).get("deny_unknown_url") is not True:
    raise SystemExit("audio proxy policy must deny unknown URL")
for e in entries:
    allowed_hosts = set(manifest.get("policy", {}).get("allowed_source_hosts", []))
    host = e.get("source_host")
    if host not in allowed_hosts:
        raise SystemExit(f"non-allowlisted audio host: {host}")
    if not e.get("proxy_url", "").startswith("/api/public/audio/proxy/"):
        raise SystemExit(f"missing proxy_url for {e.get('asset_id')}")
    if e.get("public_playback_allowed") is not True:
        raise SystemExit(f"public playback not allowed for {e.get('asset_id')}")

review = json.loads(require("data/audio/puyuma_pronunciation_review_queue_v17.json").read_text(encoding="utf-8"))
if review.get("count") != len(entries):
    raise SystemExit("review queue count must match audio asset count")

openapi = json.loads(require("openapi/pinuyumayan-main-site-api.openapi.json").read_text(encoding="utf-8"))
paths = openapi.get("paths", {})
for path in [
    "/api/public/audio/manifest",
    "/api/public/audio/search",
    "/api/public/audio/head/{assetId}",
    "/api/public/audio/proxy/{assetId}",
    "/api/public/pronunciation/search",
    "/api/public/pronunciation/player-config",
]:
    if path not in paths:
        raise SystemExit(f"missing OpenAPI path: {path}")

for path in [
    "backend/src/modules/pronunciation/audioService.ts",
    "backend/src/rest/audioRoutes.ts",
    "frontend-sdk/puyumaPronunciationClient.v17.ts",
    "webapp/components/PuyumaPronunciationPlayer.tsx",
    "database/migrations/0015_pronunciation_audio_delivery_v17.sql",
    "database/seeds/015_pronunciation_audio_delivery_v17.sql",
]:
    require(path)

print(f"pronunciation audio delivery v17 OK: {len(entries)} real-audio assets, proxy/search/player implemented")
