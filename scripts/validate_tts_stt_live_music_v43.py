#!/usr/bin/env python3
import json, pathlib
root=pathlib.Path.cwd()
required=["data/audio/authorized_speech_review_v43.json","data/audio/model_experiment_workspace_v43.json","data/audio/mos_wer_cer_dashboard_v43.json","data/search/music_live_db_query_v43.json","data/integration/authority_source_live_fetch_v43.json","data/admin/tts_stt_music_dashboard_v43.json","data/security/speech_release_gate_v43.json","data/content/source_grounded_claims_v43_additions.json","backend/src/rest/ttsSttLiveMusicV43Routes.ts","database/migrations/0039_tts_stt_live_music_v43.sql","data/development/next_upgrade_plan_v44.json"]
missing=[p for p in required if not (root/p).exists()]
if missing: raise SystemExit("missing: "+", ".join(missing))
claims=json.loads((root/"data/content/source_grounded_claims_v43_additions.json").read_text(encoding="utf-8"))["claims"]
openapi=json.loads((root/"openapi/pinuyumayan-main-site-api.openapi.json").read_text(encoding="utf-8"))
print(f"tts/stt live music v43 OK: {len(claims)} new claims, {len(openapi.get("paths",{}))} OpenAPI paths, v44 plan included")
