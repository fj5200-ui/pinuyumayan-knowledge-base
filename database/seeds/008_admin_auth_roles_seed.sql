-- 008_admin_auth_roles_seed.sql
-- Safe seed: roles, scopes and sync client permissions only. No plaintext credentials.

INSERT INTO admin_roles (role_key, name_zh, description, immutable)
VALUES
  ('super_admin', '超級管理員', '最高權限；可管理知識庫、語料匯入、主站同步、API client、審核與發布。', 1),
  ('knowledge_admin', '知識庫管理員', '管理 facts、content items、source citations 與 release channel。', 0),
  ('corpus_admin', '語料管理員', '管理 FormosanBank/ePark 匯入、音檔、G2P/IPA/TTS metadata。', 0),
  ('reviewer', '內容審核員', '審核公開內容與敏感內容摘要。', 0),
  ('main_site_sync', '主站同步服務帳號', '主站後端同步 bundle/delta/export，不可登入後台 UI。', 1)
ON DUPLICATE KEY UPDATE name_zh=VALUES(name_zh), description=VALUES(description);

INSERT INTO admin_permissions (permission_key, name_zh, description)
VALUES
  ('admin:login','登入後台','允許登入後台'),
  ('admin:manage_users','管理後台帳號','新增、停用、重設後台帳號'),
  ('admin:sync_main_site','同步主站超管','同步後台超管身分到主站'),
  ('audit:read','讀取稽核紀錄','查看後台與同步稽核紀錄')
ON DUPLICATE KEY UPDATE name_zh=VALUES(name_zh), description=VALUES(description);
