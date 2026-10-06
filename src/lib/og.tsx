import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

export function renderOg(title: string, kicker = "Texas A&M Baja SAE") {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background: "#14181d",
          color: "#ffffff",
          borderBottom: "24px solid #500000",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#9fb3c8", textTransform: "uppercase" }}>{kicker}</div>
        <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, marginTop: 16, textTransform: "uppercase" }}>{title}</div>
      </div>
    ),
    ogSize,
  );
}
