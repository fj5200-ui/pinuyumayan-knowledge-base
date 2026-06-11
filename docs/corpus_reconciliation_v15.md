# Full Corpus Reconciliation v15

The full corpus pipeline can ingest CSV and XML sources. XML sources may include `<FORM>`, `<PHON>`, `<TRANSL>` and `<AUDIO>` fields. v15 adds reconciliation outputs so the database can prove what was imported.

## Checks

- Source manifest count
- Entries imported by dialect
- Audio URL coverage
- Source PHON coverage
- Duplicate candidates
- License blockers
- Dialect mismatch
- Parse errors

## Promotion policy

`full_corpus_candidate` may become `full_corpus_verified` only when blocker findings are resolved.
Public channel promotion requires source, license and data quality gates to pass.
