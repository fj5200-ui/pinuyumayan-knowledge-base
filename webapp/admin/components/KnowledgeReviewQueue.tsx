export type ReviewTask = {
  task_id: string;
  entity_type: 'kb_fact' | 'puyuma_corpus_entry' | string;
  entity_id: string;
  priority: 'high' | 'normal' | 'low' | string;
  review_type: string;
  reason_zh?: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested' | string;
};

export function KnowledgeReviewQueue({ tasks }: { tasks: ReviewTask[] }) {
  const pending = tasks.filter((task) => task.status === 'pending');
  return (
    <section className="rounded-2xl border p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">知識庫審核工作台</h2>
        <span className="text-sm opacity-70">待審核 {pending.length} 筆</span>
      </div>
      <div className="space-y-2">
        {pending.map((task) => (
          <article key={task.task_id} className="rounded-xl border p-3">
            <div className="flex items-center justify-between gap-3">
              <strong>{task.entity_type}｜{task.entity_id}</strong>
              <span className="rounded-full border px-2 py-1 text-xs">{task.priority}</span>
            </div>
            <p className="mt-2 text-sm opacity-80">{task.reason_zh ?? task.review_type}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

