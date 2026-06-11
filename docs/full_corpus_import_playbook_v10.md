# Full Corpus Import Playbook v10

The embedded 80 vocabulary/corpus entries remain a preview subset. The thousand-entry corpus must be imported after deployment.

## Recommended sequence

```bash
./deploy/preflight.sh
DEPLOY_INSTALL_MODE=preview APPLY_DATABASE_BOOTSTRAP=true ./deploy/install.sh
./deploy/healthcheck.sh
FULL_CORPUS_MIN_ENTRIES=1000 IMPORT_SQL_AFTER_BUILD=true ./deploy/postdeploy-full-corpus.sh
```

## Internal enqueue endpoint

For managed environments, enqueue the job after API deployment:

```bash
curl -X POST "$PINUYUMAYAN_KB_API_URL/api/internal/jobs/full-corpus/enqueue"   -H "x-pinuyumayan-main-site-key: $PINUYUMAYAN_MAIN_SITE_API_KEY"   -H "content-type: application/json"   -d '{"minEntries":1000}'
```

The current TypeScript endpoint is a queue placeholder. Production implementation should persist into `job_queue` and run the Python importer in a worker process.
