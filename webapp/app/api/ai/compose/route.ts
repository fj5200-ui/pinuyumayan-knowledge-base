import { NextRequest, NextResponse } from "next/server";
import { fetchPublicKnowledge, fetchInternalKnowledge } from "../../../lib/pinuyumayanKbClient";

type ComposeRequest = {
  blueprintId: string;
  userIdea: string;
  sourcePacketIds?: string[];
};

function buildSystemPrompt() {
  return [
    "你是卑南族文化綜合平台的前端 AI 寫作助手。",
    "只能根據 source packets 的真實來源與使用者想法寫草稿。",
    "使用者想法只能標示為觀點/想法，不得改寫成史實。",
    "不得使用卑南文化遺址/卑南遺址/Beinan Site 作為卑南族文化來源。",
    "每個史實段落必須保留 source_id 或 claim_id。",
    "輸出為 JSON：{title, summary, sections, citations, warnings}."
  ].join("\n");
}

async function callMockProvider(payload: unknown) {
  return {
    title: "草稿標題：請於後台審核後發布",
    summary: "這是 mock provider 草稿。正式環境請改用 OpenAI 或 Kimi server-side provider。",
    sections: [
      { heading: "使用者想法", body: "已收到使用者想法，需與 source packets 一起檢查。" },
      { heading: "引用來源", body: "請檢查 citations 是否完整。" }
    ],
    citations: [],
    warnings: ["mock_provider_only"]
  };
}

async function callProvider(payload: { system: string; sourcePackets: unknown; userIdea: string }) {
  const provider = process.env.AI_PROVIDER ?? "mock";

  if (provider === "mock") return callMockProvider(payload);

  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("Missing OPENAI_API_KEY");
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        input: [
          { role: "system", content: payload.system },
          { role: "user", content: JSON.stringify({ sourcePackets: payload.sourcePackets, userIdea: payload.userIdea }) }
        ],
        response_format: { type: "json_object" }
      })
    });
    if (!res.ok) throw new Error(`OpenAI compose failed: ${res.status}`);
    const data = await res.json();
    const text = data.output_text ?? data.output?.[0]?.content?.[0]?.text;
    return typeof text === "string" ? JSON.parse(text) : data;
  }

  if (provider === "kimi") {
    const key = process.env.KIMI_API_KEY;
    if (!key) throw new Error("Missing KIMI_API_KEY");
    throw new Error("Kimi adapter placeholder: wire your Kimi-compatible chat endpoint here.");
  }

  throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ComposeRequest;
  if (!body.blueprintId || !body.userIdea) {
    return NextResponse.json({ error: "blueprintId and userIdea are required" }, { status: 400 });
  }

  const sourcePackets = await fetchPublicKnowledge(`/api/public/ai-article/v21/source-packets?blueprintId=${encodeURIComponent(body.blueprintId)}`);
  const draft = await callProvider({ system: buildSystemPrompt(), sourcePackets, userIdea: body.userIdea });

  const validation = await fetchInternalKnowledge("/api/internal/ai-article/client-draft/validate", {
    method: "POST",
    body: {
      blueprintId: body.blueprintId,
      sourcePacketIds: body.sourcePacketIds ?? [],
      draft,
      userIdeaHashOnly: true
    }
  });

  return NextResponse.json({ draft, validation });
}
