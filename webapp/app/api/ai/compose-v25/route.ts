import { NextRequest, NextResponse } from "next/server";
import { signedKbFetchV25 } from "../../../lib/kbHmacClient.v25";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const provider = process.env.AI_PROVIDER ?? "mock";

  // Production: call OpenAI/Kimi from server runtime only. This package keeps a safe mock draft scaffold.
  const draft = {
    title: body.titleHint ?? "卑南族文化文章草稿",
    summary: "這是由主站 server-side AI route 產生的草稿骨架；正式部署時請接 OpenAI/Kimi provider。",
    userIdea: body.userIdea ?? "",
    sourcePacketIds: body.sourcePacketIds ?? [],
    sections: [
      { heading: "真實史料重點", body: "由 source packet 提供，不得把使用者想法當史實。" },
      { heading: "我的想法", body: body.userIdea ?? "" }
    ]
  };

  const validationResp = await signedKbFetchV25("/api/internal/ai-article/v24/client-draft/validate", {
    method: "POST",
    body: { draft, provider, sourcePacketIds: body.sourcePacketIds ?? [] }
  });
  const validation = await validationResp.json();
  return NextResponse.json({ ok: true, provider, draft, validation });
}
