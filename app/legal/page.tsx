import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Notice — Voltius",
};

const CONTACT_EMAIL = "contact@voltius.app";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="border-b border-[#1e1e2e] px-6 py-4">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
          ← Voltius
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Legal Notice</h1>
        <p className="text-sm text-zinc-500 mb-10">
          Mentions légales — Article 6 de la loi n°2004-575 du 21 juin 2004
        </p>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <Section title="Publisher">
            <dl className="space-y-2 text-sm">
              <Def term="Name" val="Killian Pavy" />
              <Def term="Legal form" val="Individual (Particulier)" />
              {/* TODO: add your address — required by French law for online publishing */}
              <Def term="Address" val={<span className="text-zinc-400 italic">[Address]</span>} />
              <Def
                term="Email"
                val={
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                }
              />
            </dl>
          </Section>

          <Section title="Director of publication">
            <p>Killian Pavy</p>
          </Section>

          <Section title="Hosting">
            {/* TODO: insert your hosting provider's legal details */}
            <dl className="space-y-2 text-sm">
              <Def term="Provider" val="[Provider name]" />
              <Def term="Address" val="[Provider address]" />
              <Def term="Website" val="[Provider website]" />
            </dl>
          </Section>

          <Section title="Intellectual property">
            <p>
              The Voltius client is open-source software distributed under the{" "}
              <a
                href="https://www.gnu.org/licenses/agpl-3.0.html"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline"
              >
                AGPLv3 licence
              </a>
              . The Voltius name, logo, and server-side components are proprietary and may not be
              reproduced or reused without written authorisation.
            </p>
          </Section>

          <Section title="Personal data">
            <p>
              See our{" "}
              <Link href="/privacy" className="text-cyan-400 hover:underline">
                Privacy Policy
              </Link>{" "}
              for details on how we process personal data in accordance with the GDPR (Regulation
              2016/679) and the French loi Informatique et Libertés.
            </p>
          </Section>

          <Section title="Contact">
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:underline">
              {CONTACT_EMAIL}
            </a>
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

function Def({ term, val }: { term: string; val: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-36 text-zinc-500 shrink-0">{term}</dt>
      <dd>{val}</dd>
    </div>
  );
}
