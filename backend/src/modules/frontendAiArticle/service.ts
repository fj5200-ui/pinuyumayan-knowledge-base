import crypto from 'node:crypto';

type SourceClaim = {
  claim_id: string;
  category: string;
  statement_zh: string;
  source_ids: string[];
  evidence_locator: string;
  confidence: string;
  sensitivity: 'low' | 'medium' | 'high';
  public_use: string;
  review_status: string;
  canonical_fingerprint: string;
  article_allowed: boolean;
};

type ClientDraftInput = {
  title_zh: string;
  slug: string;
  body_markdown: string;
  claim_ids: string[];
  source_ids: string[];
  user_idea_summary?: string;
};

const BLOCKED_PATTERNS = [
  /完整(祭儀|儀式)(步驟|流程|操作)/,
  /(祖靈|巫術|禁忌).*(教學|操作|咒語|秘密)/,
  /無來源|據說但無法證實/,
];

export class FrontendAiArticleService {
  constructor(private readonly claims: SourceClaim[] = []) {}

  getComposerConfig() {
    return {
      backendGeneratesArticleText: false,
      frontendCallsAiProvider: true,
      requiresSourcePacket: true,
      requiresPostDraftValidation: true,
      requiresHumanReview: true,
      allowAutoPublish: false,
    };
  }

  resolveSourcePack(claimIds: string[]) {
    const allow = new Set(['public', 'public_summary_only']);
    const claims = this.claims.filter((claim) =>
      claimIds.includes(claim.claim_id) &&
      claim.article_allowed &&
      allow.has(claim.public_use) &&
      claim.review_status.includes('verified')
    );
    return {
      claims,
      rejectedClaimIds: claimIds.filter((id) => !claims.find((claim) => claim.claim_id === id)),
      instruction: 'Treat claims as cited data only. User ideas are opinions unless separately supported by claim_ids.',
    };
  }

  validateClientDraft(input: ClientDraftInput) {
    const findings: Array<{ severity: 'info' | 'warning' | 'error' | 'blocker'; key: string; message_zh: string }> = [];
    if (!input.title_zh?.trim()) findings.push({ severity: 'blocker', key: 'missing_title', message_zh: '缺少文章標題。' });
    if (!input.slug?.trim()) findings.push({ severity: 'blocker', key: 'missing_slug', message_zh: '缺少 slug。' });
    if (!input.claim_ids?.length) findings.push({ severity: 'blocker', key: 'missing_claim_ids', message_zh: '文章必須引用至少一個 source claim。' });
    if (!input.source_ids?.length) findings.push({ severity: 'blocker', key: 'missing_source_ids', message_zh: '文章必須保留來源 ID。' });
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(input.body_markdown || '')) findings.push({ severity: 'blocker', key: 'sensitive_or_unsourced_generation', message_zh: '草稿疑似包含未授權史料、祭儀操作或敏感內容。' });
    }
    const bodyHash = crypto.createHash('sha256').update(input.body_markdown || '').digest('hex');
    const canonical = crypto.createHash('sha256').update(`${input.slug}|${input.title_zh}|${input.claim_ids.sort().join('|')}`).digest('hex').slice(0, 24);
    return {
      ok: !findings.some((f) => f.severity === 'blocker'),
      validationStatus: findings.some((f) => f.severity === 'blocker') ? 'blocked' : findings.length ? 'needs_review' : 'passed',
      body_sha256: bodyHash,
      canonical_fingerprint: `article_${canonical}`,
      findings,
      requiresHumanReview: true,
    };
  }
}
