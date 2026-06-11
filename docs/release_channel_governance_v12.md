# v12 Release Channel Governance

v12 introduces a formal release channel model so the backend database can serve several consumers without exposing unfinished or restricted material.

## Channels

- `public`: approved knowledge for the main site.
- `preview`: approved pre-release content for staging.
- `full_corpus_candidate`: imported FormosanBank/ePark rows waiting for QA, deduplication, dialect mapping and license review.
- `full_corpus_verified`: corpus rows approved for public learning use.
- `internal_review`: review queue and curation notes.

## Promotion gates

A record can move from `full_corpus_candidate` to `full_corpus_verified` only after source path, audio URL/no-audio reason, deduplication, license review, dialect resolution and source PHON preservation checks pass.

A record can move from `preview` to `public` only after content review, citation check, sensitivity check and SEO/public summary check pass.

## Main site rule

The main site must query public-safe views or public API endpoints. It must not connect directly to the database tables because raw tables may include internal review notes or restricted content.

