import type { Metadata } from "next";
import { adminDb } from "@/lib/instant-admin";
import InviteClient from "./InviteClient";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { code } = await params;

  try {
    const { disputes } = await adminDb.query({
      disputes: {
        $: { where: { inviteCode: code.toUpperCase() } },
      },
    });

    if (disputes && disputes.length > 0) {
      const dispute = disputes[0] as any;
      const title = `Invitation to Mediate: ${dispute.title}`;
      const description = `You are invited to join an impartial, confidential AI mediation session regarding "${dispute.title}".`;
      const ogUrl = `https://mediator.deno.dev/api/og?title=${encodeURIComponent(
        dispute.title
      )}&category=Mediation+Invitation&status=Awaiting+Participant`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `https://mediator.deno.dev/invite/${code}`,
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
    console.error("Failed to generate metadata for invite:", err);
  }

  return {
    title: "Mediation Invitation | Mediator",
    description: "You have been invited to a private, peaceful dispute mediation room.",
  };
}

export default async function InvitePage({ params }: PageProps) {
  const { code } = await params;
  return <InviteClient inviteCode={code.toUpperCase()} />;
}
