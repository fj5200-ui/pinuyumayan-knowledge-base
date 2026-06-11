export type ReleaseChannelKey = "public" | "preview" | "full_corpus_candidate" | "full_corpus_verified" | "internal_review";

export interface ReleaseChannelSummary {
  channel: ReleaseChannelKey;
  displayName: string;
  isPublic: boolean;
  requiresReview: boolean;
  description: string;
  allowedClients: string[];
}

export const RELEASE_CHANNELS: ReleaseChannelSummary[] = [
  { channel: "public", displayName: "Public", isPublic: true, requiresReview: true, description: "Approved public knowledge for the main site.", allowedClients: ["main_site", "mobile_app", "search_worker"] },
  { channel: "preview", displayName: "Preview", isPublic: false, requiresReview: true, description: "Pre-release approved data for staging and editorial preview.", allowedClients: ["main_site", "admin_console", "search_worker"] },
  { channel: "full_corpus_candidate", displayName: "Full Corpus Candidate", isPublic: false, requiresReview: true, description: "Imported corpus records awaiting QA, deduplication and licensing checks.", allowedClients: ["admin_console", "corpus_worker"] },
  { channel: "full_corpus_verified", displayName: "Full Corpus Verified", isPublic: true, requiresReview: true, description: "Corpus records approved for public learning use.", allowedClients: ["main_site", "mobile_app", "search_worker"] },
  { channel: "internal_review", displayName: "Internal Review", isPublic: false, requiresReview: false, description: "Internal review queue and curation notes.", allowedClients: ["admin_console"] }
];

export function listReleaseChannels(clientKey?: string): ReleaseChannelSummary[] {
  if (!clientKey) return RELEASE_CHANNELS.filter((channel) => channel.isPublic);
  return RELEASE_CHANNELS.filter((channel) => channel.allowedClients.includes(clientKey));
}

export function canClientReadChannel(clientKey: string, channel: string): boolean {
  return RELEASE_CHANNELS.some((item) => item.channel === channel && item.allowedClients.includes(clientKey));
}

export function assertPublicSafeChannel(channel: string): void {
  const found = RELEASE_CHANNELS.find((item) => item.channel === channel);
  if (!found || !found.isPublic) {
    throw new Error(`Release channel is not public safe: ${channel}`);
  }
}

