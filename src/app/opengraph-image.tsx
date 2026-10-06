import { ImageResponse } from "next/og";
import { person } from "@/data";
import { SITE_HOST } from "@/lib/site";

/**
 * Social preview (1200×630) for every page: an XP-style window with the owner's name and role.
 * Colours are literal here because the image is rendered outside the CSS cascade.
 */
export const alt = `${person.name}, ${person.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #2a63c9 0%, #7bb3ef 60%, #5fb236 60%, #2f7a1f 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: 1000,
          display: "flex",
          flexDirection: "column",
          border: "6px solid #0831d9",
          borderTop: "none",
          borderRadius: "16px 16px 0 0",
          background: "#ece9d8",
          boxShadow: "6px 6px 30px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
            padding: "0 24px",
            borderRadius: "12px 12px 0 0",
            background:
              "linear-gradient(180deg, #3d95ff 0%, #0a5fe0 20%, #0a5fe0 80%, #3d95ff 100%)",
            color: "#fff",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          <span>about_me.txt - Notepad</span>
          <span
            style={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#e0462b",
              border: "2px solid #fff",
              borderRadius: 6,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22">
              <path d="M3 3l16 16M19 3L3 19" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            margin: 24,
            padding: "40px 44px",
            background: "#fff",
            border: "2px solid #7f9db9",
            color: "#000",
          }}
        >
          <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -1 }}>{person.name}</div>
          <div style={{ fontSize: 40, color: "#0a5fe0", fontWeight: 700 }}>{person.role}</div>
          <div style={{ fontSize: 28, color: "#444", lineHeight: 1.35 }}>{person.tagline}</div>
          <div style={{ fontSize: 26, color: "#2e8b57", marginTop: 8 }}>
            {`${SITE_HOST} · ${person.location}`}
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
