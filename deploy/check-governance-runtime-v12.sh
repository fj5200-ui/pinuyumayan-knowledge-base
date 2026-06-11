#!/usr/bin/env bash
set -euo pipefail
python3 scripts/validate_governance_runtime_v12.py
python3 scripts/validate_openapi_contract.py
python3 scripts/validate_data_delivery_governance_v11.py

