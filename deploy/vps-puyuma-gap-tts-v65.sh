#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TRAIN_DIR="${ROOT}/training/formosanbank-puyuma-tts"
DATA_DIR="${PUYUMA_TTS_DATA_DIR:-${TRAIN_DIR}/data}"
OUT_DIR="${PUYUMA_TTS_OUTPUT_DIR:-${TRAIN_DIR}/runs/tts}"
GAP_MANIFEST="${PUYUMA_GAP_MANIFEST:-${ROOT}/data/audio/puyuma_tts_gap_manifest_v65.jsonl}"
APT_INSTALL="${APT_INSTALL:-1}"
DOWNLOAD_AUDIO="${DOWNLOAD_AUDIO:-1}"
INSTALL_TTS_EXTRAS="${INSTALL_TTS_EXTRAS:-0}"
LAUNCH_TTS="${LAUNCH_TTS:-0}"
RESTORE_PATH="${RESTORE_PATH:-}"

if [[ "${APT_INSTALL}" == "1" ]]; then
  apt-get update
  apt-get install -y ffmpeg git python3-venv
fi

cd "${TRAIN_DIR}"
INSTALL_TTS_EXTRAS="${INSTALL_TTS_EXTRAS}" INSTALL_DEV_EXTRAS=1 ./scripts/bootstrap.sh
source .venv/bin/activate

prepare_args=(python -m formosanbank_puyuma.cli prepare --data-dir "${DATA_DIR}")
if [[ "${DOWNLOAD_AUDIO}" == "1" ]]; then
  prepare_args+=(--download-audio)
fi
"${prepare_args[@]}"

python -m formosanbank_puyuma.train_tts \
  --manifest "${DATA_DIR}/processed/tts_train.jsonl" \
  --audio-root "${DATA_DIR}/raw/audio" \
  --output-dir "${OUT_DIR}" \
  --run-name "puyuma-gap-v65"

python "${ROOT}/scripts/build_puyuma_tts_gap_manifest_v65.py" \
  --out "${GAP_MANIFEST}" \
  --summary "${ROOT}/data/audio/puyuma_tts_gap_manifest_v65.generated.json" \
  --doc "${ROOT}/docs/puyuma_tts_gap_fill_v65.generated.md"

if [[ "${LAUNCH_TTS}" == "1" ]]; then
  if [[ -z "${RESTORE_PATH}" ]]; then
    echo "RESTORE_PATH is required when LAUNCH_TTS=1" >&2
    exit 1
  fi
  python -m formosanbank_puyuma.train_tts \
    --manifest "${DATA_DIR}/processed/tts_train.jsonl" \
    --audio-root "${DATA_DIR}/raw/audio" \
    --output-dir "${OUT_DIR}" \
    --run-name "puyuma-gap-v65" \
    --launch \
    --restore-path "${RESTORE_PATH}"
fi

python - <<'PY'
from pathlib import Path
import json

root = Path.cwd().parents[1]
summary = json.loads((root / "data" / "audio" / "puyuma_tts_gap_manifest_v65.generated.json").read_text(encoding="utf-8"))
print(json.dumps({
    "status": "ok",
    "train_dir": str(Path.cwd()),
    "gap_manifest_rows": summary["manifest_rows"],
    "by_dialect": summary["by_dialect"],
    "public_release_allowed": summary["public_release_allowed"],
}, ensure_ascii=False, indent=2))
PY
