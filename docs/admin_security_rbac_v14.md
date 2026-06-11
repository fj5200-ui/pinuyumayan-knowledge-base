# v14 Admin Security and RBAC

Do not create default admin credentials. Use `deploy/bootstrap-superadmin.sh` with secrets supplied by the deployment environment.

Recommended production settings:

1. Require MFA for `super_admin`.
2. Use scoped API keys for main-site sync.
3. Rotate API keys before public launch and after any operator change.
4. Audit all superadmin sync, release promote, cache invalidate, full corpus import, and quality gate actions.
5. Use `admin_sessions` and `admin_login_attempts` to detect abnormal access.

Roles and scopes are described in `data/security/admin_rbac_scope_v14.json`.
