import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Remove My Account · Syncre',
  description: 'Instructions for deleting your Syncre account and requesting data erasure.',
};

const steps = [
  {
    title: 'Prepare your request',
    detail:
      'From the email inbox associated with your Syncre login, gather your username (or phone number) and the devices you currently use.',
  },
  {
    title: 'Email info@syncre.xyz',
    detail:
      'Send a message to info@syncre.xyz using the subject “Syncre account deletion”. Include your account identifier, device list, and whether you need an export before deletion.',
  },
  {
    title: 'Confirm ownership',
    detail:
      'We reply within 3 business days with a verification challenge. Respond to that email from the same inbox to prove you control the account.',
  },
  {
    title: 'Deletion window',
    detail:
      'Once verified, we queue your account for erasure. Messages, attachments, and backups are deleted within 7 days, with audit logs purged after 30 days.',
  },
];

const postDeletion = [
  'You will lose access to all conversations, media, and beta builds tied to the deleted account.',
  'Contacts will see you disappear from their roster; we do not notify them automatically.',
  'You can rejoin Syncre later with a fresh registration. The deleted data cannot be restored.',
];

export default function RemoveMyAccountPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-[#020203] px-6 pt-40 pb-16 text-white">
        <section className="mx-auto w-full max-w-3xl">
          <p className="text-sm uppercase tracking-[0.4em] text-gray-500">Account removal</p>
          <h1 className="mt-5 text-4xl font-semibold">Delete your Syncre account & data.</h1>
          <p className="mt-4 text-gray-300">
            We currently process deletion requests through a secure email workflow while the self-service portal is in
            development. Follow the steps below to ensure we can verify and execute the request quickly.
          </p>
        </section>
        <section className="mx-auto mt-10 w-full max-w-3xl space-y-6">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold">
                  {index + 1}
                </span>
                <div>
                  <h2 className="text-2xl font-semibold">{step.title}</h2>
                  <p className="mt-2 text-sm text-gray-200">{step.detail}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
        <section className="mx-auto mt-12 w-full max-w-3xl rounded-3xl border border-white/10 bg-[#050505] p-8">
          <h2 className="text-xl font-semibold text-white">What happens after deletion?</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-300">
            {postDeletion.map((note) => (
              <li key={note} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-white" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-400">
            Regulatory timelines: GDPR data erasure is completed within 30 days. CCPA requests follow the same window,
            and we will confirm completion via email.
          </p>
        </section>
        <section className="mx-auto mt-12 w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-gray-300">
          <h2 className="text-xl font-semibold text-white">Need an export first?</h2>
          <p className="mt-3">
            Mention “data export” in your email if you want a copy of your messages and profile before deletion. We send
            a one-time download link that expires after 7 days. After the export window closes, we complete the erasure.
          </p>
          <p className="mt-3">
            Still unsure? Email <a href="mailto:info@syncre.xyz" className="text-white underline">info@syncre.xyz</a> and we will guide you through the process.
          </p>
        </section>
        <Footer />
      </main>
    </>
  );
}
