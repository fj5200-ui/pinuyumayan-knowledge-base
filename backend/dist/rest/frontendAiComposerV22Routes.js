import { validateClientDraft } from '../modules/frontendAiComposerV22/service';
export function registerFrontendAiComposerV22Routes(app) {
    app.get('/api/public/ai-article/v22/provider-adapters', (_req, res) => {
        res.json({ ok: true, version: 'v22', providers: ['local_mock_adapter', 'openai_responses_adapter', 'kimi_chat_adapter'] });
    });
    app.get('/api/public/ai-article/v22/source-packets', (_req, res) => {
        res.json({ ok: true, version: 'v22', message: 'Load data/ai/frontend_source_packets_v22.json in production service.' });
    });
    app.post('/api/internal/ai-article/v22/client-draft/validate', (req, res) => {
        const result = validateClientDraft(req.body, req.body.allowedClaimIds ?? []);
        res.status(result.decision === 'blocked' ? 422 : 200).json({ ok: result.decision !== 'blocked', ...result });
    });
    app.post('/api/internal/ai-article/v22/citation-check', (req, res) => {
        const usedClaimIds = req.body.usedClaimIds ?? [];
        const usedSourceIds = req.body.usedSourceIds ?? [];
        res.json({ ok: usedClaimIds.length > 0 && usedSourceIds.length > 0, usedClaimCount: usedClaimIds.length, usedSourceCount: usedSourceIds.length });
    });
    app.post('/api/internal/ai-article/v22/duplicate-cooldown-check', (_req, res) => {
        res.json({ ok: true, decision: 'requires_database_check', policy: 'same_claim_set_30_days + same_topic_10_days' });
    });
    app.get('/api/admin/ai-article/v22/review-dashboard', (_req, res) => {
        res.json({ ok: true, version: 'v22', widgets: ['draft_queue', 'citation_integrity', 'duplicate_cooldown', 'forbidden_relation', 'sensitivity_gate'] });
    });
}
