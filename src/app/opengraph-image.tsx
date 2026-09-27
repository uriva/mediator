import { ImageResponse } from "next/og";

export const alt = "Mediator — Serene AI Dispute Resolution";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#F9F8F5",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, #E5EFEA 0%, transparent 55%), radial-gradient(circle at 15% 85%, #EFEBE4 0%, transparent 60%)",
          padding: "80px 90px",
          fontFamily: "sans-serif",
          border: "16px solid #F0ECE4",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "28px",
              backgroundColor: "#3E6353",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "30px",
            }}
          >
            ⚖️
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#1C2923",
              letterSpacing: "-0.5px",
            }}
          >
            Mediator
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "960px",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#5C7569",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Conflict to Harmony
          </span>
          <div
            style={{
              fontSize: "58px",
              fontWeight: 800,
              color: "#16231E",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
            }}
          >
            Serene, Impartial AI Dispute Resolution
          </div>
          <p
            style={{
              fontSize: "24px",
              color: "#4F6359",
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Transform disagreements into mutually agreed facts and lasting conclusions.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "32px",
            borderTop: "2px solid #EAE5DC",
          }}
        >
          <span
            style={{
              fontSize: "20px",
              color: "#56685F",
              fontWeight: 500,
            }}
          >
            Group Mediation • Verifiable Facts • End-to-End Encrypted
          </span>
          <span
            style={{
              fontSize: "20px",
              color: "#3E6353",
              fontWeight: 700,
            }}
          >
            mediator.deno.dev
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
