import { PLANS } from "@shared/plans";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Showcase from "./components/Showcase";
import Pricing from "./components/Pricing";
import Download from "./components/Download";
import Footer from "./components/Footer";
import { GITHUB_REPO_URL } from "./lib/github";
import { SITE_NAME, SITE_URL } from "./lib/site";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "A blazing fast, local-first SSH & SFTP client built with Rust and Tauri. E2EE sync, SFTP drag & drop, Docker, plugins, and more. Free forever.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Windows, macOS, Linux, Android",
    downloadUrl: `${GITHUB_REPO_URL}/releases/latest`,
    sameAs: [GITHUB_REPO_URL],
    offers: PLANS.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: plan.annualPrice,
      priceCurrency: "USD",
      url: `${SITE_URL}/#pricing`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Showcase />
        <Pricing />
        <Download />
      </main>
      <Footer />
    </>
  );
}
