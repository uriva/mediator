import type { Metadata } from "next";
import { adminDb } from "@/lib/instant-admin";
import DisputeRoomClient from "./DisputeRoomClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const { disputes } = await adminDb.query({
      disputes: {
        $: { where: { id } },
      },
    });

    if (disputes && disputes.length > 0) {
      const dispute = disputes[0] as any;
      const title = `Mediation: ${dispute.title}`;
      const description = `Join the impartial mediation session for "${dispute.title}". View established facts, submit evidence, and reach a peaceful accord.`;
      const ogUrl = `https://mediator.deno.dev/api/og?title=${encodeURIComponent(
        dispute.title
      )}&category=${encodeURIComponent(
        dispute.category || "Mediation"
      )}&status=${encodeURIComponent(dispute.status || "In Mediation")}`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `https://mediator.deno.dev/dispute/${id}`,
          siteName: "Mediator",
          images: [
            {
              url: ogUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [ogUrl],
        },
      };
    }
  } catch (err) {
    console.error("Failed to generate metadata for dispute:", err);
  }

  return {
    title: "Mediation Session | Mediator",
    description: "Impartial, serene dispute resolution powered by AI.",
  };
}

export default async function DisputePage({ params }: PageProps) {
  const { id } = await params;
  return <DisputeRoomClient disputeId={id} />;
}
