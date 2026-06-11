# Runtime Hardening v10

v10 turns the project from a scaffold into an implementation-ready backend runtime contract.

## Non-negotiable runtime rules

1. API startup must never download or import the full FormosanBank/ePark corpus.
2. Full corpus import runs only as a post-deploy job, worker, or manually enqueued internal job.
3. Public endpoints must only read public-safe views and approved/verified rows.
4. Internal bundle, delta, and job enqueue endpoints require `x-pinuyumayan-main-site-key`.
5. Every error response follows `data/runtime/api_error_contract_v10.json`.
6. Every long-running task must create or update job queue state.

## Main site readiness

The main site should check:

```txt
GET /ready
GET /api/public/knowledge/bootstrap
GET /api/public/knowledge/vocabulary?limit=1
```

The backend should be considered deployable only when `/ready` returns ready and the public bootstrap payload is available.
