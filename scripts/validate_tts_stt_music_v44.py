#!/usr/bin/env python3
from __future__ import annotations
import json
import re
from pathlib import Path

root = Path.cwd()
required = [
    "data/audio/speech_asset_authorization_v44.json",
    "data/audio/tts_stt_export_contract_v44.json",
    "data/audio/exports/v44/train.jsonl",
    "data/audio/exports/v44/dev.jsonl",
    "data/audio/exports/v44/test.jsonl",
    "data/audio/exports/v44/blocked_candidates.jsonl",
    "data/audio/exports/v44/model_card.generated.json",
    "data/search/music_fulltext_db_contract_v44.json",
    "data/search/music_search_documents_v44.seed.json",
    "data/integration/authority_source_worker_v44.json",
    "data/integration/authority_source_candidates_v44.generated.json",
    "data/admin/music_speech_review_center_v44.json",
    "data/site/main_site_music_tts_pages_v44.json",
    "data/development/next_upgrade_plan_v45.json",
    "backend/src/rest/ttsSttLiveMusicV43Routes.ts",
    "backend/src/rest/ttsSttMusicV44Routes.ts",
    "frontend-sdk/ttsSttMusicClient.v44.ts",
    "webapp/components/MusicSpeechReviewCenterV44.tsx",
    "webapp/app/music/search/page.tsx",
    "webapp/app/music/[id]/page.tsx",
    "webapp/app/tts-stt/page.tsx",
    "database/migrations/0040_tts_stt_music_v44.sql",
    "database/seeds/040_tts_stt_music_v44.sql",
    "database/seeds/040_speech_asset_authorization_v44.generated.sql",
    "database/seeds/040_music_search_documents_v44.generated.sql",
    "database/seeds/040_authority_source_candidates_v44.generated.sql",
    "deploy/vps-tts-stt-v44.sh",
    "docs/tts_stt_music_v44.md",
    "docs/music_search_db_v44.md",
    "docs/next_upgrade_plan_v45.md",
]
missing = [p for p in required if not (root / p).exists()]
if missing:
    raise SystemExit("missing required v44 files: " + ", ".join(missing))

review = json.loads((root / "data/audio/speech_asset_authorization_v44.json").read_text(encoding="utf-8"))
items = review.get("items", [])
if len(items) != 80:
    raise SystemExit(f"expected 80 speech authorization items, got {len(items)}")
for item in items:
    for key in ["asset_id", "source_audio_url", "source_license", "speaker_consent_status", "dialect_code", "transcript_text", "alignment_status", "review_status"]:
        if key not in item:
            raise SystemExit(f"speech authorization item missing {key}: {item.get('asset_id')}")
    if item.get("allowed_for_train_export") or item.get("allowed_for_dev_export") or item.get("allowed_for_test_export"):
        raise SystemExit(f"unapproved item was allowed into export: {item.get('asset_id')}")

blocked_lines = (root / "data/audio/exports/v44/blocked_candidates.jsonl").read_text(encoding="utf-8").splitlines()
if len(blocked_lines) != 80:
    raise SystemExit(f"expected 80 blocked JSONL rows, got {len(blocked_lines)}")
for split in ["train", "dev", "test"]:
    if (root / f"data/audio/exports/v44/{split}.jsonl").read_text(encoding="utf-8").strip():
        raise SystemExit(f"{split}.jsonl should be empty until review gates pass")

model = json.loads((root / "data/audio/exports/v44/model_card.generated.json").read_text(encoding="utf-8"))
if model.get("public_release_allowed") is not False:
    raise SystemExit("model card must keep public_release_allowed=false")
if model.get("training_ready") != 0:
    raise SystemExit("training_ready must be 0 before authorization gates pass")

route = (root / "backend/src/rest/ttsSttLiveMusicV43Routes.ts").read_text(encoding="utf-8")
for snippet in ["music_search_documents_v43", "MATCH(title, artist, community", "mode: \"mysql_fulltext\"", "json_static_fallback_database_unavailable"]:
    if snippet not in route:
        raise SystemExit(f"v43 search route missing DB implementation snippet: {snippet}")

speech_seed = (root / "database/seeds/040_speech_asset_authorization_v44.generated.sql").read_text(encoding="utf-8")
if speech_seed.count("INSERT INTO speech_asset_authorization_v44") != 80:
    raise SystemExit("speech authorization SQL seed must include 80 inserts")

migration = (root / "database/migrations/0040_tts_stt_music_v44.sql").read_text(encoding="utf-8")
for table in ["speech_asset_authorization_v44", "music_search_documents_v43", "authority_source_candidates_v44", "main_site_page_contracts_v44"]:
    if table not in migration:
        raise SystemExit(f"migration missing table {table}")
if "FULLTEXT KEY ft_music_search_v43" not in migration:
    raise SystemExit("migration missing FULLTEXT index")

api = json.loads((root / "openapi/pinuyumayan-main-site-api.openapi.json").read_text(encoding="utf-8"))
for path in [
    "/api/ops/speech-training/v44/authorized-review",
    "/api/ops/search/music/v44/db-contract",
    "/api/admin/music-speech/v44/review-center",
    "/api/public/music/v44/metadata/{id}",
    "/api/public/speech/v44/tts-stt-info",
    "/api/ops/next-upgrade-plan/v45",
]:
    if path not in api.get("paths", {}):
        raise SystemExit(f"OpenAPI missing {path}")

pages = json.loads((root / "data/site/main_site_music_tts_pages_v44.json").read_text(encoding="utf-8"))
paths = {r.get("path") for r in pages.get("routes", [])}
if paths != {"/music/search", "/music/[id]", "/tts-stt"}:
    raise SystemExit(f"unexpected main site page contract paths: {paths}")

candidates = json.loads((root / "data/integration/authority_source_candidates_v44.generated.json").read_text(encoding="utf-8"))
if candidates.get("count", 0) < 3:
    raise SystemExit("authority source candidate worker generated too few candidates")
for c in candidates.get("candidates", []):
    if c.get("public_auto_release") is not False:
        raise SystemExit("authority candidate must not auto release publicly")

plan = json.loads((root / "data/development/next_upgrade_plan_v45.json").read_text(encoding="utf-8"))
if len(plan.get("items", [])) != 6:
    raise SystemExit("v45 plan must include 6 next-step items")

print(
    "tts/stt music v44 OK: "
    f"{len(items)} speech assets reviewed as blocked candidates, "
    f"{len(blocked_lines)} blocked export rows, "
    f"{candidates.get('count')} authority candidates, "
    f"{len(api.get('paths', {}))} OpenAPI paths"
)
