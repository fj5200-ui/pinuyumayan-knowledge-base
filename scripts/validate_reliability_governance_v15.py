#!/usr/bin/env python3
import json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
  'database/migrations/0012_observability_scaling_governance_v15.sql',
  'data/runtime/runtime_hardening_v15.json',
  'data/integration/main_site_sla_v15.json',
  'data/integration/main_site_contract_tests_v15.json',
  'data/database/corpus_reconciliation_plan_v15.json',
  'data/search/search_relevance_config_v15.json',
  'data/security/admin_security_policy_v15.json',
  'data/ops/observability_dashboard_v15.json',
  'data/deployment/upgrade_plan_v15.json',
  'backend/src/rest/observabilityRoutes.ts',
  'backend/src/rest/contractRoutes.ts',
  'backend/src/rest/corpusReconciliationRoutes.ts',
  'frontend-sdk/pinuyumayanKnowledgeClient.v15.ts',
  'docs/upgrade_v15_reliability_governance.md',
  'scripts/run_main_site_contract_tests_v15.py'
]
SQL_TABLES = [
  'api_contract_test_runs','api_contract_test_results','endpoint_slo_results','public_payload_snapshots_v15',
  'knowledge_delivery_incidents','corpus_ingest_watermarks','corpus_reconciliation_runs','corpus_reconciliation_findings',
  'search_index_versions_v15','search_relevance_evaluations','admin_permission_grants_v15','security_audit_events_v15'
]
OPENAPI_PATHS = [
  '/api/ops/slo','/api/ops/observability-dashboard','/api/ops/contract-tests/latest','/api/internal/contracts/run',
  '/api/admin/corpus/reconciliation','/api/internal/corpus/reconcile/enqueue','/api/admin/data-quality/reports/latest',
  '/api/public/knowledge/payload-snapshot/latest'
]

def fail(msg):
    print('ERROR:', msg)
    sys.exit(1)

def main():
    missing = [p for p in REQUIRED if not (ROOT/p).exists()]
    if missing: fail('missing files: ' + ', '.join(missing))
    sql = (ROOT/'database/migrations/0012_observability_scaling_governance_v15.sql').read_text(encoding='utf-8')
    for table in SQL_TABLES:
        if not re.search(r'CREATE TABLE IF NOT EXISTS\s+' + re.escape(table) + r'\b', sql):
            fail(f'missing SQL table {table}')
    spec = json.loads((ROOT/'openapi/pinuyumayan-main-site-api.openapi.json').read_text(encoding='utf-8'))
    paths = spec.get('paths', {})
    for path in OPENAPI_PATHS:
        if path not in paths: fail(f'missing OpenAPI path {path}')
    if len(paths) < 47: fail(f'expected at least 47 OpenAPI paths, got {len(paths)}')
    contract = json.loads((ROOT/'data/integration/main_site_contract_tests_v15.json').read_text(encoding='utf-8'))
    cases = sum(len(s.get('cases', [])) for s in contract.get('suites', []))
    if cases < 10: fail('expected at least 10 contract cases')
    recon = json.loads((ROOT/'data/database/corpus_reconciliation_plan_v15.json').read_text(encoding='utf-8'))
    if recon.get('minimum_full_corpus_entries', 0) < 1000: fail('full corpus minimum must be >= 1000')
    print(f"reliability governance v15 OK: {len(REQUIRED)} files, {len(SQL_TABLES)} SQL tables, {len(paths)} OpenAPI paths, {cases} contract cases")

if __name__ == '__main__':
    main()
