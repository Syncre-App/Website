import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Privacy · Syncre',
  description:
    'Learn how Syncre collects, uses, and protects your data across the app, backend, and support channels.',
};

const sections = [
  {
    title: 'What we collect',
    body: [
      'Account essentials: display name, username or phone number, and encrypted authentication tokens.',
      'Diagnostics you opt into sharing, such as crash traces or performance metrics inside the mobile client.',
      'Support conversations you initiate with the Syncre team so we can follow up on requests.',
      'Encrypted message payloads and attachments are only stored long enough to deliver them to recipients.',
    ],
  },
  {
    title: 'How we use data',
    body: [
      'Operate the Syncre platform, sync conversations across devices, and detect abuse or spam.',
      'Improve performance, reliability, and accessibility based on anonymized diagnostics.',
      'Provide support when you email us and keep records required by law or platform policies.',
    ],
  },
  {
    title: 'What we never do',
    body: [
      'Sell personal data, run ads, or build shadow profiles.',
      'Scan message contents for marketing or profiling purposes.',
      'Share identifiable information with partners without your explicit consent or a valid legal request.',
    ],
  },
  {
    title: 'How long we keep data',
    body: [
      'Account data stays active while you use Syncre. When you leave, it is scheduled for deletion within 30 days unless law requires otherwise.',
      'Delivery buffers keep undelivered messages for a maximum of 30 days before secure deletion.',
      'Audit logs that prove security and abuse prevention are kept for up to 12 months in cold storage.',
    ],
  },
  {
    title: 'Your controls',
    body: [
      'Access: request a copy of your account data at any time via info@syncre.xyz.',
      'Rectify: update profile details directly in the app or contact us for help.',
      'Delete: follow the instructions on /remove-my-account to erase your data.',
      'Appeal: challenge automated actions such as spam detection by replying to our emails.',
    ],
  },
];

const legalNotes = [
  'Syncre relies on end-to-end encryption (E2EE). The private keys stay on your device; our servers only process encrypted blobs.',
  'If we ever change this policy, we will update the change log here and notify beta participants via the app and email.',
  'Questions, privacy concerns, or regulatory requests should go to info@syncre.xyz. We answer within 10 business days.',
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-[#020203] px-6 pt-40 pb-16 text-white">
        <section className="mx-auto w-full max-w-3xl">
          <p className="text-sm uppercase tracking-[0.4em] text-gray-500">Privacy</p>
          <h1 className="mt-5 text-4xl font-semibold">How Syncre respects your data.</h1>
          <p className="mt-4 text-gray-300">
            We keep the policy short, readable, and aligned with modern privacy expectations. Syncre is built to collect
            as little as possible, encrypt everything we must handle, and give you direct lines to ask questions.
          </p>
          <p className="mt-2 text-sm text-gray-500">Last updated: 14 February 2025</p>
        </section>
        <section className="mx-auto mt-12 w-full max-w-3xl space-y-10">
          {sections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-gray-200">
                {section.body.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-white" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
        <section className="mx-auto mt-12 w-full max-w-3xl rounded-3xl border border-white/10 bg-[#050505] p-8 text-sm text-gray-300">
          <h2 className="text-xl font-semibold text-white">Need something else?</h2>
          <p className="mt-3">
            Email <a href="mailto:info@syncre.xyz" className="text-white underline">info@syncre.xyz</a> with the details of your request, the platform you use, and any reference
            numbers from the app. We handle GDPR, CCPA, and similar regional requests in the same inbox.
          </p>
          <ul className="mt-4 space-y-2">
            {legalNotes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </section>
        <Footer />
      </main>
    </>
  );
}
