import { NextRequest, NextResponse } from "next/server";
import { kbInternalFetchV24, kbPublicFetchV24 } from "../../../../lib/kbHmacClient.v24";

type Body = { blueprintId: string; userIdea: string; sourcePacketIds?: string[]; tone?: string; targetAudience?: string };

function systemPrompt() {
  return [
    "你是卑南族文化綜合平台的主站 AI 寫作助手。",
    "只能根據後端 source packets 的真實來源與使用者想法產生草稿。",
    "使用者想法只能標示為觀點或草稿方向，不得改寫成史實。",
    "不得把卑南文化遺址、卑南遺址、Beinan Site、Peinan Site 當成卑南族文化來源。",
    "所有史實句必須附 claim_id 或 source_id。",
    "輸出 JSON: {title, summary, sections, citations, warnings}."
  ].join("\n");
}

async function callAiProvider(payload: unknown) {
  const provider = process.env.AI_PROVIDER ?? "mock";
  if (provider === "mock") {
    return { title: "草稿：待審核", summary: "mock 草稿；正式環境請使用 openai 或 kimi。", sections: [], citations: [], warnings: ["mock_provider"] };
  }
  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("Missing OPENAI_API_KEY");
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        input: [
          { role: "system", content: systemPrompt() },
          { role: "user", content: JSON.stringify(payload) }
        ],
        response_format: { type: "json_object" }
      })
    });
    if (!res.ok) throw new Error(`OpenAI failed: ${res.status}`);
    const data = await res.json();
    const text = data.output_text ?? data.output?.[0]?.content?.[0]?.text;
    return typeof text === "string" ? JSON.parse(text) : data;
  }
  if (provider === "kimi") {
    throw new Error("Kimi adapter: connect your Kimi-compatible endpoint here on main-site server runtime.");
  }
  throw new Error(`Unsupported AI_PROVIDER ${provider}`);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;
  if (!body.blueprintId || !body.userIdea) {
    return NextResponse.json({ error: "blueprintId and userIdea are required" }, { status: 400 });
  }
  const sourcePackets = await kbPublicFetchV24(`/api/public/ai-article/v21/source-packets?blueprintId=${encodeURIComponent(body.blueprintId)}`);
  const draft = await callAiProvider({ sourcePackets, userIdea: body.userIdea, tone: body.tone, targetAudience: body.targetAudience });
  const validation = await kbInternalFetchV24("/api/internal/ai-article/v24/client-draft/validate", {
    method: "POST",
    body: { blueprintId: body.blueprintId, sourcePacketIds: body.sourcePacketIds ?? [], draft, userIdeaHashOnly: true }
  });
  return NextResponse.json({ draft, validation, canSubmitReview: (validation as any).ok !== false });
}
