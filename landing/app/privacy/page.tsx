import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Voltius",
};

const EFFECTIVE_DATE = "April 23, 2026";
const CONTACT_EMAIL = "contact@voltius.app";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="border-b border-[#1e1e2e] px-6 py-4">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
          ← Voltius
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-zinc-500 mb-2">Last updated: {EFFECTIVE_DATE}</p>
        <h1 className="text-3xl font-bold mb-10">Privacy Policy</h1>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <Section title="1. Who we are">
            <p>
              Killian Pavy, acting as an individual, is the data controller for information collected
              through voltius.app and the Voltius application.
            </p>
            <p className="mt-2">
              Contact:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Section>

          <Section title="2. Data we collect">
            <p>We collect only what is necessary to provide the Service:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong className="text-white">Account data:</strong> your email address.
              </li>
              <li>
                <strong className="text-white">Authentication:</strong> a derived key — your master
                password is never transmitted or stored.
              </li>
              <li>
                <strong className="text-white">Billing:</strong> handled by Lemon Squeezy. We receive a
                customer ID and subscription status; we do not store payment card details.
              </li>
              <li>
                <strong className="text-white">Vault data:</strong> stored encrypted on our servers.
                We cannot read its contents.
              </li>
              <li>
                <strong className="text-white">Technical logs:</strong> IP address, timestamps, and
                HTTP request metadata for security and abuse prevention. Retained for 30 days.
              </li>
            </ul>
          </Section>

          <Section title="3. Legal basis and purpose (GDPR)">
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#1e1e2e] text-white">
                    <th className="text-left py-2 pr-6">Purpose</th>
                    <th className="text-left py-2 pr-6">Data</th>
                    <th className="text-left py-2">Legal basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e2e]">
                  <Row p="Account management" d="Email, auth key" b="Contract performance" />
                  <Row p="Payment processing" d="Email, Lemon Squeezy customer ID" b="Contract performance" />
                  <Row p="Security / abuse prevention" d="IP, logs" b="Legitimate interest" />
                  <Row p="Transactional emails" d="Email" b="Contract performance" />
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="4. Data retention">
            <ul className="list-disc pl-6 space-y-1">
              <li>Account data: until account deletion, plus 30 days for billing dispute purposes.</li>
              <li>Encrypted vault: deleted within 30 days of account deletion.</li>
              <li>Technical logs: 30-day rolling window.</li>
              <li>Billing records: 10 years (French legal obligation).</li>
            </ul>
          </Section>

          <Section title="5. Data sharing">
            <p>We do not sell your data. We share it only with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong className="text-white">Lemon Squeezy</strong> — payment processing (USA;
                adequacy decision / SCCs apply).
              </li>
              <li>
                <strong className="text-white">
                  <span className="text-zinc-400 italic">Oracle France</span>
                </strong>{" "}
                — server infrastructure.
              </li>
            </ul>
          </Section>

          <Section title="6. Your rights (GDPR)">
            <p>As a data subject you have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong className="text-white">Access</strong> the data we hold about you.</li>
              <li><strong className="text-white">Rectify</strong> inaccurate data.</li>
              <li><strong className="text-white">Erase</strong> your data ("right to be forgotten").</li>
              <li><strong className="text-white">Port</strong> your data in a machine-readable format.</li>
              <li><strong className="text-white">Object</strong> to processing based on legitimate interest.</li>
              <li><strong className="text-white">Restrict</strong> processing in certain circumstances.</li>
            </ul>
            <p className="mt-3">
              Exercise your rights by emailing{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
              . You also have the right to lodge a complaint with the{" "}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline"
              >
                CNIL
              </a>{" "}
              (French data-protection authority).
            </p>
          </Section>

          <Section title="7. Security">
            <p>
              Vault data is end-to-end encrypted with a key derived from your master password, which
              is never transmitted. All data in transit is protected by TLS. Our servers never have
              access to the plaintext contents of your vault.
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>
              The voltius.app website does not use tracking or advertising cookies. The account portal
              uses session cookies strictly necessary for authentication. No consent banner is required
              for strictly-necessary cookies under the ePrivacy Directive.
            </p>
          </Section>

          <Section title="9. Changes">
            <p>
              We will notify you of material changes by email at least 14 days in advance.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Data-protection questions:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
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

function Row({ p, d, b }: { p: string; d: string; b: string }) {
  return (
    <tr>
      <td className="py-2 pr-6">{p}</td>
      <td className="py-2 pr-6">{d}</td>
      <td className="py-2">{b}</td>
    </tr>
  );
}
