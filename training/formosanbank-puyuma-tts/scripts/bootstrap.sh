#!/usr/bin/env bash
set -euo pipefail

PYTHON_BIN="${PYTHON_BIN:-python3}"
INSTALL_TRANSLATE_EXTRAS="${INSTALL_TRANSLATE_EXTRAS:-0}"
INSTALL_TTS_EXTRAS="${INSTALL_TTS_EXTRAS:-0}"
INSTALL_DEV_EXTRAS="${INSTALL_DEV_EXTRAS:-1}"

if ! command -v "${PYTHON_BIN}" >/dev/null 2>&1; then
  echo "Python executable not found: ${PYTHON_BIN}" >&2
  exit 1
fi

if [[ ! -d .venv ]]; then
  "${PYTHON_BIN}" -m venv .venv
fi

source .venv/bin/activate
python -m pip install --upgrade pip

extras=()
if [[ "${INSTALL_TRANSLATE_EXTRAS}" == "1" ]]; then
  extras+=("translate")
fi
if [[ "${INSTALL_TTS_EXTRAS}" == "1" ]]; then
  extras+=("tts")
fi
if [[ "${INSTALL_DEV_EXTRAS}" == "1" ]]; then
  extras+=("dev")
fi

package="."
if [[ ${#extras[@]} -gt 0 ]]; then
  joined="$(IFS=,; echo "${extras[*]}")"
  package=".[${joined}]"
fi

python -m pip install -e "${package}"

if ! command -v nvidia-smi >/dev/null 2>&1; then
  echo "No GPU detected. This host is suitable for data prep and config generation, not full TTS training." >&2
fi

echo "Bootstrap complete. Activate with: source .venv/bin/activate"
