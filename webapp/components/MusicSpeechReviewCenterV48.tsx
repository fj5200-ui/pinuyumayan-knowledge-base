import React from "react";
import reviewCenter from "../../data/admin/music_speech_review_center_v48.json";
import workbench from "../../data/admin/speech_review_workbench_v48.json";
import analytics from "../../data/search/music_search_analytics_dashboard_v48.json";
import authorityMerge from "../../data/integration/authority_candidate_merge_v48.json";
import modelViz from "../../data/audio/speech_model_visualization_v48.json";
import siteVisual from "../../data/site/main_site_visual_completion_v48.json";

export function MusicSpeechReviewCenterV48() {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 text-stone-950 shadow-sm dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-semibold text-red-700 dark:text-yellow-300">v48 Review / Search / Model Governance</p>
        <h2 className="text-2xl font-bold">音樂與 TTS/STT 上線治理中心</h2>
        <p className="max-w-3xl text-sm text-stone-700 dark:text-stone-300">整合 VPS DB 驗收、審核工作台、搜尋分析、權威候選合併、模型治理可視化與主站視覺驗收。預設不允許公開釋出未授權語音資料。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {reviewCenter.cards.map((card: any) => (
          <article key={card.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
            <h3 className="font-semibold">{card.title}</h3>
            <p className="mt-2 text-xs text-stone-600 dark:text-stone-300">{card.status}</p>
            <code className="mt-3 block overflow-hidden text-ellipsis rounded bg-white px-2 py-1 text-[11px] dark:bg-stone-950">{card.endpoint}</code>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 p-4 dark:border-stone-800">
          <h3 className="font-semibold">審核工作台</h3>
          <p className="mt-2 text-sm">{workbench.summary.total_rows} 筆、批次篩選、附件進度、歷程抽屜；bulk approve: {String(workbench.summary.bulk_approve_allowed)}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 p-4 dark:border-stone-800">
          <h3 className="font-semibold">搜尋分析</h3>
          <p className="mt-2 text-sm">{analytics.daily_metrics.length} 天樣本、zero-result review queue、p95/p99 alert notification。</p>
        </div>
        <div className="rounded-2xl border border-stone-200 p-4 dark:border-stone-800">
          <h3 className="font-semibold">權威候選合併</h3>
          <p className="mt-2 text-sm">{authorityMerge.summary.merge_groups} 組候選，metadata-only，需人工 approve。</p>
        </div>
        <div className="rounded-2xl border border-stone-200 p-4 dark:border-stone-800">
          <h3 className="font-semibold">模型治理 / 主站視覺</h3>
          <p className="mt-2 text-sm">blocked assets: {modelViz.summary.blocked_assets}；routes audited: {siteVisual.summary.routes_audited}。</p>
        </div>
      </div>
    </section>
  );
}

export default MusicSpeechReviewCenterV48;
