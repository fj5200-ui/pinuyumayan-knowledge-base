# v12 Data Lineage and Quality Dashboard

v12 adds lineage events, quality gate runs and governance dashboard snapshots. These records make corpus import and public release reproducible.

## Lineage required fields

- `source_id`
- `source_path`
- `source_row` or XML `TEXT/S` id
- `source_hash`
- `import_run_id`
- `release_batch_id`
- `review_status`

## Quality blockers

- Missing source
- Ambiguous dialect
- Blocked or unknown license
- Missing public review
- Lost source PHON when XML has `<PHON>`
- Audio URL missing without a reason

## Dashboard widgets

The admin dashboard should show release channel counts, full corpus import progress, main-site sync health, quality blockers, API SLO and search export status.

