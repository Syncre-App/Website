import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Terms · Syncre',
  description: 'End User License Agreement and acceptable use rules for the Syncre apps and services.',
};

const promises = [
  'Run Syncre for personal or business messaging while respecting local laws and platform rules.',
  'Keep credentials and devices secure; notify us if you suspect compromise or unauthorized access.',
  'Use the service for lawful purposes only—no harassment, hateful conduct, spam, or illegal content.',
  'Understand that end-to-end encryption protects your content; backups and exports remain your responsibility.',
];

const boundaries = [
  'No automated scraping, reverse engineering, or attacks against the API, clients, or infrastructure.',
  'Do not upload malware, child exploitation, or other prohibited material. Repeated abuse can lead to bans.',
  'Respect rate limits and fair-use: excessive traffic, unsolicited bulk messages, or fraud are grounds for removal.',
  'Report safety issues via in-app tools or email so we can take action quickly.',
];

const operations = [
  'Availability: Syncre is a beta service; outages or maintenance windows may occur without notice.',
  'Suspension: We may suspend or terminate accounts that violate these terms or legal requirements.',
  'Data removal: Follow /remove-my-account for erasure. Deleted accounts remove friends and messages after the grace window.',
  'Updates: We may change features or these terms. Continued use after changes means you accept the new terms.',
];

const licensing = [
  'License: You receive a non-transferable, revocable license to install and use Syncre apps.',
  'Ownership: All trademarks and app assets remain the property of Syncre. No resale or sublicensing.',
  'Third-party code: Open-source components remain under their respective licenses as noted in app settings.',
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-[#020203] px-6 pt-40 pb-16 text-white">
        <section className="mx-auto w-full max-w-3xl">
          <p className="text-sm uppercase tracking-[0.4em] text-gray-500">Terms of use</p>
          <h1 className="mt-5 text-4xl font-semibold">Syncre End User License Agreement.</h1>
          <p className="mt-4 text-gray-300">
            These terms explain what you can expect from Syncre and what we expect from you. By creating an account or
            continuing to use the apps, you agree to this EULA and the acceptable use rules below.
          </p>
          <p className="mt-2 text-sm text-gray-500">Last updated: 14 February 2025</p>
        </section>

        <section className="mx-auto mt-12 w-full max-w-3xl space-y-8">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <h2 className="text-2xl font-semibold">Your responsibilities</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-200">
              {promises.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-white" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <h2 className="text-2xl font-semibold">Boundaries & enforcement</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-200">
              {boundaries.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-white" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <h2 className="text-2xl font-semibold">Service operations</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-200">
              {operations.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-white" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <h2 className="text-2xl font-semibold">Licensing</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-200">
              {licensing.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-white" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="mx-auto mt-12 w-full max-w-3xl rounded-3xl border border-white/10 bg-[#050505] p-8 text-sm text-gray-300">
          <h2 className="text-xl font-semibold text-white">Need help or want to appeal?</h2>
          <p className="mt-3">
            Email <a href="mailto:info@syncre.xyz" className="text-white underline">info@syncre.xyz</a> with your account
            ID and the issue you are experiencing. For urgent safety matters, use the in-app report button and we will respond as fast as possible.
          </p>
        </section>
        <Footer />
      </main>
    </>
  );
}
