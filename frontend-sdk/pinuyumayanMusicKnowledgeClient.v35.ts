export function createPinuyumayanMusicKnowledgeClient(baseUrl: string) {
  const get = async (path: string) => {
    const res = await fetch(`${baseUrl}${path}`);
    if (!res.ok) throw new Error(`KB request failed: ${res.status}`);
    return res.json();
  };
  return {
    cards: () => get('/api/public/true-knowledge/v35/music/cards'),
    searchDocuments: () => get('/api/public/true-knowledge/v35/music/search-documents'),
    sourcePackets: () => get('/api/public/ai-article/v35/music-source-packets'),
    rightsPolicy: () => get('/api/ops/music-youtube/v35/rights-policy'),
    youtubeSearchConfig: () => get('/api/ops/music-youtube/v35/search-config'),
  };
}
