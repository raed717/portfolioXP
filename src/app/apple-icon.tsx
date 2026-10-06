import { ImageResponse } from "next/og";

/** Home-screen icon: the "RG" logo tile from the desktop. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #5bd16b 0%, #1c7fd6 100%)",
        color: "#fff",
        fontSize: 84,
        fontWeight: 800,
        fontFamily: "sans-serif",
      }}
    >
      RG
    </div>,
    size,
  );
}
