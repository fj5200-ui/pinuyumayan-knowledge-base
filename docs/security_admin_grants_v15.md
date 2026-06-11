# Admin Permission Grants v15

Admin permissions should be scoped and auditable. Avoid permanent global grants unless the role is a real super administrator.

## Rules

- Every manual grant needs a reason.
- Temporary grants need an expiry time.
- Sensitive actions require re-authentication.
- Release promotion and full corpus import should require MFA for production.
- Security events must be logged to `security_audit_events_v15`.
