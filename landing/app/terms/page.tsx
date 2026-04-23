import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Voltius",
};

const EFFECTIVE_DATE = "April 23, 2026";
const CONTACT_EMAIL = "contact@voltius.app";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="border-b border-[#1e1e2e] px-6 py-4">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
          ← Voltius
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-zinc-500 mb-2">Last updated: {EFFECTIVE_DATE}</p>
        <h1 className="text-3xl font-bold mb-10">Terms of Service</h1>

        <div className="space-y-10 text-zinc-300 leading-relaxed">
          <Section title="1. Acceptance">
            <p>
              By creating an account or using Voltius (the "Service"), you agree to be bound by these
              Terms of Service. If you do not agree, do not use the Service.
            </p>
          </Section>

          <Section title="2. Description of service">
            <p>
              Voltius is a local-first SSH client that optionally synchronises encrypted vault data
              across your devices via a cloud backend. The core application is open-source under the
              AGPLv3 licence. A paid subscription unlocks additional cloud-sync and premium features.
            </p>
          </Section>

          <Section title="3. Eligibility and account">
            <p>
              You must be at least 18 years old to create an account. You are responsible for
              maintaining the confidentiality of your master password. Because your vault is
              end-to-end encrypted,{" "}
              <strong className="text-white">
                we cannot recover your data if you lose your master password.
              </strong>
            </p>
          </Section>

          <Section title="4. Subscriptions and payment">
            <p>
              Paid plans are billed on a monthly or annual basis via our payment processor (Lemon
              Squeezy). Prices are in USD and exclude applicable taxes (VAT or sales tax may be added
              at checkout). Subscriptions renew automatically unless cancelled before the renewal
              date. No refunds are issued for partial periods, except as required by applicable law.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1 text-sm">
              <li>
                <strong className="text-white">Free</strong> — $0, no account required.
              </li>
              <li>
                <strong className="text-white">Pro</strong> — $7/month (billed annually) or
                $9/month (billed monthly). Includes a 14-day free trial, no credit card required.
              </li>
              <li>
                <strong className="text-white">Teams</strong> — $15/user/month (billed annually) or
                $18/user/month (billed monthly), 3-user minimum. Includes a 14-day free trial,
                credit card required.
              </li>
              <li>
                <strong className="text-white">Business</strong> — $30/user/month. Contact us for
                custom contracts and self-hosted deployment.
              </li>
            </ul>
          </Section>

          <Section title="5. Acceptable use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the Service for any unlawful purpose or to access systems you are not authorised to access.</li>
              <li>Attempt to reverse-engineer or extract proprietary server-side components.</li>
              <li>Resell or sublicense access to the Service without written permission.</li>
              <li>Transmit malware, spam, or content that violates third-party rights.</li>
            </ul>
          </Section>

          <Section title="6. Intellectual property">
            <p>
              The Voltius client application is licensed under the AGPLv3. The Voltius name, logo, and
              server-side components remain the exclusive property of Killian Pavy.
              Nothing in these Terms transfers any intellectual-property rights to you.
            </p>
          </Section>

          <Section title="7. Data and privacy">
            <p>
              Your vault data is end-to-end encrypted — we cannot read, access, or recover its
              contents. Our collection and use of personal data is described in our{" "}
              <Link href="/privacy" className="text-cyan-400 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </Section>

          <Section title="8. Disclaimer and limitation of liability">
            <p>
              The Service is provided "as is" without warranties of any kind. To the maximum extent
              permitted by law, we shall not be liable for indirect, incidental, or consequential
              damages arising from your use of the Service. Our total liability shall not exceed the
              amount you paid in the twelve months preceding the claim.
            </p>
          </Section>

          <Section title="9. Suspension and termination">
            <p>
              We may suspend or terminate your account if you materially breach these Terms. You may
              cancel your subscription at any time from your account settings. Upon termination, your
              encrypted vault data will be deleted from our servers within 30 days.
            </p>
          </Section>

          <Section title="10. Changes to these Terms">
            <p>
              We may update these Terms from time to time. We will notify you by email or in-app
              notice at least 14 days before material changes take effect. Continued use of the
              Service after that date constitutes acceptance.
            </p>
          </Section>

          <Section title="11. Governing law">
            <p>
              These Terms are governed by French law. Any dispute shall be submitted to the exclusive
              jurisdiction of the courts of{" "}
              <span className="text-zinc-400 italic">Miramas</span>, France, unless mandatory consumer
              protection laws in your country of residence provide otherwise.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              Questions about these Terms? Email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
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
