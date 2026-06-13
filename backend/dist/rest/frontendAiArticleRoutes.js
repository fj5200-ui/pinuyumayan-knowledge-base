import { FrontendAiArticleService } from '../modules/frontendAiArticle/service';
const service = new FrontendAiArticleService();
function requireInternalKey(req, res, next) {
    const expected = process.env.PINUYUMAYAN_MAIN_SITE_API_KEY || process.env.MAIN_SITE_API_KEY;
    if (!expected)
        return res.status(500).json({ ok: false, error: { code: 'server_key_not_configured' } });
    if (req.header('x-pinuyumayan-main-site-key') !== expected)
        return res.status(401).json({ ok: false, error: { code: 'unauthorized' } });
    next();
}
export function registerFrontendAiArticleRoutes(app) {
    app.get('/api/public/ai-article/frontend-composer-config', (_req, res) => {
        res.json({ ok: true, data: service.getComposerConfig() });
    });
    app.post('/api/internal/ai-article/source-pack/resolve', requireInternalKey, (req, res) => {
        res.json({ ok: true, data: service.resolveSourcePack(req.body?.claimIds || []) });
    });
    app.post('/api/internal/ai-article/client-draft/validate', requireInternalKey, (req, res) => {
        res.json({ ok: true, data: service.validateClientDraft(req.body || {}) });
    });
    app.post('/api/internal/ai-article/client-draft/submit-review', requireInternalKey, (req, res) => {
        const result = service.validateClientDraft(req.body || {});
        if (!result.ok)
            return res.status(422).json({ ok: false, error: { code: 'draft_validation_failed', findings: result.findings } });
        res.json({ ok: true, data: { review_status: 'queued', validation: result } });
    });
}
