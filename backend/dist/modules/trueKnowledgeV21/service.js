import v21Claims from '../../../data/content/source_grounded_claims_v21_merged.json';
import v21Cards from '../../../data/content/public_source_grounded_cards_v21.json';
import v21Packets from '../../../data/ai/frontend_source_packets_v21.json';
import forbiddenRelations from '../../../data/security/forbidden_knowledge_relations_v21.json';
export function listV21Claims() {
    return v21Claims.claims;
}
export function listV21Cards() {
    return v21Cards.cards;
}
export function listV21FrontendSourcePackets() {
    return v21Packets.packets;
}
export function getForbiddenRelationPolicy() {
    return forbiddenRelations;
}
export function validateBlockedRelations(input) {
    const text = [input.title, input.body, ...(input.sourceIds ?? []), ...(input.tags ?? [])].filter(Boolean).join('\n');
    const findings = forbiddenRelations.blocked_terms
        .filter((term) => text.includes(term))
        .map((term) => ({ blockedTerm: term, action: 'block', messageZh: '卑南文化遺址／卑南遺址不可作為卑南族文化知識來源。' }));
    return { ok: findings.length === 0, findings };
}
