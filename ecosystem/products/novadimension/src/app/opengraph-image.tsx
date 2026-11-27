import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "拓維空間NovaDimension";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "linear-gradient(135deg, #fffaf5 0%, #f6efe6 48%, #e8dfd2 100%)",
          color: "#1c1f24",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.22em",
            color: "#1f5fff",
            fontWeight: 700,
          }}
        >
          NOVADIMENSION
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{ fontSize: 72, fontWeight: 700, letterSpacing: "-0.04em" }}
          >
            拓維空間
          </div>
          <div style={{ fontSize: 34, lineHeight: 1.35, maxWidth: 820 }}>
            不用大興土木，用 3D 預覽打造你的理想生活空間
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#5c616a" }}>
          靈感設計 · 2D／3D 設計圖 · IG 諮詢
        </div>
      </div>
    ),
    size,
  );
}
