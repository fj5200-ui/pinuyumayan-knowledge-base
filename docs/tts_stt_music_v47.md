# TTS/STT + Music v47

Generated: 2026-06-12T17:47:00+08:00

v47 upgrades v46 from contract-level production governance into operational workflows.

## Included

- Review action UI contract for 80 queue rows.
- HMAC nonce bridge for internal write actions.
- Evidence upload metadata record endpoint.
- Transactional review action endpoint.
- MySQL transaction integration test plan for commit, rollback, idempotency and immutable audit.
- `/api/public/search/music/v43` now attempts to write v47 query logs when MySQL is available.
- Authority source live-fetch adapters remain metadata-only and disabled by default unless `AUTHORITY_FETCH_LIVE=1`.
- Speech model governance report includes WER/CER/MOS trend contract, lineage graph and signoff history.
- Main music search page receives day-mode contrast and card/chip polish.

## Safety defaults

- Public release remains disabled.
- Bulk approve remains disabled.
- Authority candidates are metadata-only and never auto-public.
- No lyrics or audio download flows are introduced.
