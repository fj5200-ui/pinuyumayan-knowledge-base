-- v51 model renderer seed
INSERT IGNORE INTO speech_model_governance_pdf_renders_v51 (render_id, actor_id, renderer, status, artifact_path, watermark, render_json) VALUES ('renderer-v51-seed', 'system-seed', 'playwright_pdf', 'contract_only_requires_vps', 'exports/model_governance_report_v51.pdf', 'BLOCKED - evidence incomplete', JSON_OBJECT('version','v51'));
