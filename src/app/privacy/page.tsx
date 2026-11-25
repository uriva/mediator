import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Mediator",
  description:
    "How Mediator (mediator.uriv.me) collects, stores, processes, and deletes mediation rooms, facts, evidence, and account data.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/85 backdrop-blur-md dark:border-neutral-900 dark:bg-neutral-950/85">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[11px] text-white dark:bg-neutral-100 dark:text-neutral-900">
              ᐧ
            </div>
            <span className="text-base font-semibold tracking-tight lowercase">
              mediator
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Back to app
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 space-y-8 px-6 py-12 sm:py-16">
        <header className="space-y-2 border-b border-neutral-100 pb-6 dark:border-neutral-900">
          <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
            Last Updated: November 25, 2026
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            This Privacy Policy describes how Mediator (
            <span className="font-mono text-xs">mediator.uriv.me</span>)
            collects, uses, stores, and deletes information when you use our
            AI-assisted dispute discussion platform.
          </p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
              1. Information We Collect
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-neutral-900 dark:text-neutral-100">
                  Account information:
                </strong>{" "}
                if you sign in with a magic code, your email address and
                authentication session metadata managed through InstantDB. You
                may also participate in rooms without an email account using a
                browser-stored session.
              </li>
              <li>
                <strong className="text-neutral-900 dark:text-neutral-100">
                  Dispute &amp; room content:
                </strong>{" "}
                dispute titles, descriptions, categories, participant names and
                optional emails, invite codes, logged facts and confirmations,
                uploaded evidence files and attachments, proposals, signatures
                or acknowledgments, and generated &ldquo;Settlement
                Agreements.&rdquo;
              </li>
              <li>
                <strong className="text-neutral-900 dark:text-neutral-100">
                  Mediation messages:
                </strong>{" "}
                messages exchanged in the shared mediation room with other
                participants and the AI mediator.
              </li>
              <li>
                <strong className="text-neutral-900 dark:text-neutral-100">
                  Browser localStorage data:
                </strong>{" "}
                local cryptographic keys, participant credentials, conversation
                mappings, and dispute IDs stored in your browser&apos;s{" "}
                <code className="font-mono text-xs">localStorage</code> so you
                can rejoin your mediation rooms.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
              2. Infrastructure &amp; Third-Party Processors
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-neutral-900 dark:text-neutral-100">
                  InstantDB:
                </strong>{" "}
                provides magic-code email authentication and stores disputes,
                participants, facts, evidence files, proposals, and Settlement
                Agreement records.
              </li>
              <li>
                <strong className="text-neutral-900 dark:text-neutral-100">
                  Prompt2Bot &amp; Alice&amp;Bot:
                </strong>{" "}
                power shared room messaging and AI mediation responses. Messages,
                dispute context, submitted facts, and evidence shared in a room
                are transmitted to Prompt2Bot and Alice&amp;Bot (and their
                underlying AI model providers) to facilitate mediation and draft
                proposals or summaries.
              </li>
              <li>
                <strong className="text-neutral-900 dark:text-neutral-100">
                  Cloudflare Workers:
                </strong>{" "}
                hosts the web application and API endpoints and processes
                standard request metadata for delivery and security.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
              3. Room Access &amp; Sharing
            </h2>
            <p>
              Mediation rooms are invite-based rather than listed in a public
              directory. However, anyone who receives a room link or invite code
              can access or join the room and view its shared facts, evidence,
              proposals, and messages. Keep invite links private and share them
              only with intended participants.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
              4. Browser Storage
            </h2>
            <p>
              We use browser <code className="font-mono text-xs">localStorage</code>{" "}
              for essential functionality: remembering your InstantDB session,
              Alice&amp;Bot signing keys, and local dispute IDs. Clearing site
              data deletes these locally stored keys and IDs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
              5. Retention &amp; Deletion
            </h2>
            <p>
              We retain account and dispute data for as long as needed to
              provide access to your mediation rooms. To request deletion of
              your account, dispute room, uploaded evidence files, or Settlement
              Agreement records, contact the operator via{" "}
              <a
                href="https://uriv.me"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-neutral-950 dark:hover:text-neutral-50"
              >
                uriv.me
              </a>{" "}
              with your email address and/or dispute ID or invite code.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
              6. Changes &amp; Contact
            </h2>
            <p>
              We may revise this Privacy Policy from time to time and will
              update the &ldquo;Last Updated&rdquo; date above. Contact the
              operator via{" "}
              <a
                href="https://uriv.me"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-neutral-950 dark:hover:text-neutral-50"
              >
                uriv.me
              </a>{" "}
              with any privacy questions.
            </p>
          </section>
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-xl flex-wrap items-center justify-between gap-3 px-6 pb-8 text-xs text-neutral-400">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-neutral-700 dark:hover:text-neutral-200">
            Home
          </Link>
          <Link href="/privacy" className="text-neutral-700 dark:text-neutral-200">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-neutral-700 dark:hover:text-neutral-200">
            Terms
          </Link>
        </div>
        <span className="font-mono text-[11px]">mediator.uriv.me</span>
      </footer>
    </div>
  );
}
