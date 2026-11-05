import { ImageResponse } from "next/og";
export const alt = "Zeebaran — A good orchard starts here.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#faf8f5",
        color: "#292524",
        width: "100%",
        height: "100%",
        padding: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontSize: 36, color: "#A51D2D" }}>zeebaran.</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 76,
          letterSpacing: -3,
        }}
      >
        <span>A good orchard</span>
        <span style={{ color: "#A51D2D" }}>starts here.</span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 22,
          justifyContent: "space-between",
        }}
      >
        <span>Fruit trees & orchard installation</span>
        <span>Anantnag, Kashmir</span>
      </div>
    </div>,
    size,
  );
}
