'use client';

import { useEffect, useState } from 'react';
import { createPinuyumayanTrueKnowledgeClientV21 } from '../../frontend-sdk/pinuyumayanTrueKnowledgeClient.v21';

export function FrontendAiComposerV21({ baseUrl }: { baseUrl: string }) {
  const [packets, setPackets] = useState<any[]>([]);
  const [policy, setPolicy] = useState<any>(null);

  useEffect(() => {
    const client = createPinuyumayanTrueKnowledgeClientV21({ baseUrl });
    client.listFrontendSourcePackets().then((data: any) => setPackets(data.packets ?? []));
    client.getForbiddenRelations().then(setPolicy);
  }, [baseUrl]);

  return (
    <section className="rounded-xl border p-4 shadow-sm">
      <h2 className="text-lg font-semibold">前端 AI Composer v21</h2>
      <p className="text-sm opacity-80">文章由前端調用 AI；後端只提供史料包、去重、引用與禁止關聯檢查。</p>
      {policy && <p className="mt-2 text-sm text-red-700">禁止把「卑南文化遺址／卑南遺址」作為卑南族文化知識來源。</p>}
      <ul className="mt-3 space-y-2">
        {packets.map((p) => <li key={p.packet_id} className="rounded border p-2"><strong>{p.title_zh}</strong><br/><span className="text-xs">{p.claim_ids.length} claims</span></li>)}
      </ul>
    </section>
  );
}
