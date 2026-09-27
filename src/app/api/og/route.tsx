import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Peaceful AI Mediation";
    const category = searchParams.get("category") || "Dispute Resolution";
    const status = searchParams.get("status") || "In Mediation";

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
              "radial-gradient(circle at 90% 10%, #E8F0EC 0%, transparent 60%), radial-gradient(circle at 10% 90%, #EFECE6 0%, transparent 50%)",
            padding: "80px 90px",
            fontFamily: "sans-serif",
            border: "16px solid #F0ECE4",
          }}
        >
          {/* Top Brand Pill & Zen Symbol */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "24px",
                  backgroundColor: "#3E6353",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "26px",
                  fontWeight: "bold",
                }}
              >
                ⚖️
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#1C2923",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Mediator
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#5C7066",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                  }}
                >
                  Serene Dispute Resolution
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 22px",
                borderRadius: "9999px",
                backgroundColor: "#E2ECE6",
                border: "1px solid #C4D9CF",
                color: "#2C4C3E",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              {status}
            </div>
          </div>

          {/* Central Dispute Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "960px",
            }}
          >
            <span
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#6B7F74",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {category}
            </span>
            <div
              style={{
                fontSize: title.length > 50 ? "46px" : "56px",
                fontWeight: 700,
                color: "#18241F",
                lineHeight: 1.15,
                letterSpacing: "-1px",
              }}
            >
              {title}
            </div>
          </div>

          {/* Bottom Card Footer */}
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
              Joint fact-finding • Evidentiary verification • Peaceful resolution
            </span>
            <span
              style={{
                fontSize: "18px",
                color: "#3E6353",
                fontWeight: 700,
              }}
            >
              mediator.uriva.deno.net
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
