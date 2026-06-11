import React from 'react';

export type ReviewFinding = { code: string; severity: 'info' | 'warning' | 'blocker'; message_zh: string };

export function AdminArticleReviewDashboardV22({ findings = [] }: { findings?: ReviewFinding[] }) {
  const blockers = findings.filter((f) => f.severity === 'blocker');
  return (
    <section className="rounded-2xl border p-4 shadow-sm">
      <h2 className="text-xl font-semibold">AI 文章審核 Dashboard v22</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-xl border p-3"><b>引用完整性</b><p>{findings.filter(f => f.code.includes('citation') || f.code.includes('claim')).length}</p></div>
        <div className="rounded-xl border p-3"><b>去重冷卻</b><p>{findings.filter(f => f.code.includes('duplicate')).length}</p></div>
        <div className="rounded-xl border p-3"><b>禁止關聯</b><p>{findings.filter(f => f.code.includes('beinan')).length}</p></div>
        <div className="rounded-xl border p-3"><b>敏感內容</b><p>{findings.filter(f => f.code.includes('sensitivity')).length}</p></div>
        <div className="rounded-xl border p-3"><b>阻擋</b><p>{blockers.length}</p></div>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {findings.map((f, i) => <li key={i} className="rounded-xl border p-2"><b>{f.severity}</b>｜{f.code}｜{f.message_zh}</li>)}
      </ul>
    </section>
  );
}
