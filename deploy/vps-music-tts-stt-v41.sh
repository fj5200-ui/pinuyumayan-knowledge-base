#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
python3 scripts/build_tts_stt_training_manifest_v41.py
python3 scripts/youtube_metadata_worker_v41.py --query "卑南族 歌謠" --query "卑南族 古調" --out data/generated/youtube_metadata_candidates_v41.generated.json ${YOUTUBE_LIVE:+--live}
python3 scripts/build_music_fulltext_seed_v41.py
mysql "$DATABASE_URL" < database/migrations/0037_tts_stt_music_ops_v41.sql
mysql "$DATABASE_URL" < database/seeds/037_tts_stt_music_ops_v41.sql
mysql "$DATABASE_URL" < data/search/music_fulltext_seed_v41.generated.sql
printf 'v41 VPS music/TTS/STT ops completed. Review generated reports before public release.\n'
