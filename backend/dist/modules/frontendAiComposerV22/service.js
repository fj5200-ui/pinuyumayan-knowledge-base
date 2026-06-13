const FORBIDDEN_TERMS = ['卑南文化遺址', '卑南遺址', '卑南考古遺址', 'Peinan Site', 'Beinan Site'];
export function normalizeFingerprint(parts) {
    return parts.map((p) => p.trim().toLowerCase().replace(/\s+/g, ' ')).join('|');
}
export function findForbiddenRelationHits(text) {
    return FORBIDDEN_TERMS.filter((term) => text.includes(term));
}
export function validateClientDraft(input, allowedClaimIds) {
    const findings = [];
    const missing = input.usedClaimIds.filter((id) => !allowedClaimIds.includes(id));
    if (missing.length)
        findings.push({ code: 'claim_not_in_source_packet', severity: 'blocker', message_zh: `草稿引用了不在史料包內的 claim：${missing.join(', ')}` });
    const forbidden = findForbiddenRelationHits(`${input.title}\n${input.bodyMarkdown}`);
    if (forbidden.length)
        findings.push({ code: 'forbidden_beinan_archaeology_relation', severity: 'blocker', message_zh: `草稿命中禁止關聯詞：${forbidden.join(', ')}` });
    if (!input.usedClaimIds.length || !input.usedSourceIds.length)
        findings.push({ code: 'missing_citations', severity: 'blocker', message_zh: '草稿缺少 usedClaimIds 或 usedSourceIds。' });
    const fingerprintSource = normalizeFingerprint([input.title, input.blueprintId, input.topicKey, ...input.usedClaimIds.sort(), ...input.usedSourceIds.sort()]);
    const hasBlocker = findings.some((f) => f.severity === 'blocker');
    return { decision: hasBlocker ? 'blocked' : 'ready_for_review', findings, fingerprintSource };
}
