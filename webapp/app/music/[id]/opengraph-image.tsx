import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image({ params }: { params: { id: string } }) {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", background: "#111", color: "white", padding: 72, border: "24px solid #b91c1c" }}>
      <div style={{ fontSize: 34, color: "#fde68a", marginBottom: 24 }}>Pinuyumayan Music Metadata</div>
      <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>卑南族歌謠／歌曲資料</div>
      <div style={{ fontSize: 28, marginTop: 28, opacity: 0.85 }}>metadata only · no lyrics · no audio download</div>
      <div style={{ fontSize: 22, marginTop: 44, color: "#86efac" }}>{params.id}</div>
    </div>,
    size,
  );
}
