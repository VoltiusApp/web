import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete your account — Voltius",
  description:
    "How to delete your Voltius account and the data associated with it, with or without the app installed.",
};

const CONTACT_EMAIL = "contact@voltius.app";
const ACCOUNT_URL = "https://app.voltius.app/account";
const DELETE_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Delete my account")}`;

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="border-b border-[#1e1e2e] px-6 py-4">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
          ← Voltius
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-4">Delete your Voltius account</h1>
        <p className="text-zinc-400 mb-10 leading-relaxed">
          This page explains how to delete your Voltius account and the data associated with it. You
          do not need the app installed to make a request. Voltius is developed by Killian Pavy, who
          is the data controller.
        </p>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <Section title="1. Before you start: cancel any active subscription">
            <p>
              If you have an active Pro subscription, cancel it first from your account page at{" "}
              <a href={ACCOUNT_URL} className="text-cyan-400 hover:underline">
                app.voltius.app/account
              </a>{" "}
              so you are not charged again. Payments are handled by Lemon Squeezy.
            </p>
          </Section>

          <Section title="2. How to request deletion">
            <p>You can delete your account in either of these ways:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong className="text-white">In the app:</strong> open Account / Settings and
                choose <strong className="text-white">Delete account</strong>. This option is
                available from the next release of the app.
              </li>
              <li>
                <strong className="text-white">By email:</strong> write to{" "}
                <a href={DELETE_MAILTO} className="text-cyan-400 hover:underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                from the email address of your account, with the subject{" "}
                <strong className="text-white">&quot;Delete my account&quot;</strong>. We may ask you
                to confirm the request before processing it.
              </li>
            </ul>
          </Section>

          <Section title="3. What is deleted">
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong className="text-white">Your account:</strong> email address and
                authentication data.
              </li>
              <li>
                <strong className="text-white">Your encrypted vault and cloud sync data</strong>{" "}
                stored on our servers.
              </li>
            </ul>
            <p className="mt-2">This data is deleted within 30 days of your request.</p>
          </Section>

          <Section title="4. What is kept, and for how long">
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong className="text-white">Technical logs</strong> (IP address, timestamps,
                request metadata): removed as they roll over, within 30 days.
              </li>
              <li>
                <strong className="text-white">Billing records:</strong> kept for 10 years, as
                required by French law.
              </li>
            </ul>
          </Section>

          <Section title="5. Data on your device">
            <p>
              Hosts, keys and other data stored only locally by the Voltius app are not on our
              servers. Uninstalling the app removes them from your device.
            </p>
          </Section>

          <Section title="6. Contact">
            <p>
              Questions about deletion or your data:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
              . See also our{" "}
              <Link href="/privacy" className="text-cyan-400 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      {children}
    </section>
  );
}
