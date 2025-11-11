'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
});

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-grotesk',
});

const heroHighlights = [
  {
    label: 'Encryption',
    value: 'Double ratchet + MLS',
    detail: 'Post-quantum ready keys rotate with every sync.',
  },
  {
    label: 'Sync latency',
    value: '<120 ms',
    detail: 'Edge relays keep conversations feeling instant.',
  },
  {
    label: 'Privacy model',
    value: 'Zero ads, zero tracking',
    detail: 'Metadata minimised. No pixels, no guessing.',
  },
];

const featureCards = [
  {
    accent: 'Continuity',
    title: 'Handoff without thinking about it',
    copy: 'Pick up a conversation on any device and every tap, scroll, and cursor position follows.',
    stat: 'State restore under 500 ms',
  },
  {
    accent: 'Presence',
    title: 'Live activity layers',
    copy: 'Act on invites, share media, or confirm payments inline. Less app switching, more doing.',
    stat: 'Context cards for any message',
  },
  {
    accent: 'Media',
    title: 'Depth-crafted sharing',
    copy: 'Lossless photos, Dolby spatial audio notes, and HDR video with adaptive blur for previews.',
    stat: 'Local on-device effects',
  },
  {
    accent: 'Trust',
    title: 'Transparent firmware',
    copy: 'Open-source clients, reproducible builds, and remote attestation before every log in.',
    stat: 'Public attest proofs',
  },
];

const securityStack = [
  {
    title: 'End-to-end by default',
    detail: 'Modern Signal-style double ratchet + Messaging Layer Security (MLS) for groups.',
  },
  {
    title: 'Ephemeral routing',
    detail: 'Metadata minimized with rotating relays and sealed sender addresses.',
  },
  {
    title: 'Zero-knowledge storage',
    detail: 'Attachments in Drive or local disk use envelope encryption with customer-held keys.',
  },
];

const craftSteps = [
  {
    title: 'Design the conversation',
    detail: 'Frictionless flows, tactile haptics, typography that lets content breathe.',
  },
  {
    title: 'Secure every edge',
    detail: 'Transport, storage, identity, recovery—all auditable and documented.',
  },
  {
    title: 'Ship with intention',
    detail: 'Tight feedback loops with our private beta community guide every release.',
  },
];

const aboutHighlights = [
  {
    title: 'Mobile-first Syncre app',
    detail:
      'Built inside the Mobile workspace with React Native and Expo so iOS and Android stay in lockstep, even for native modules.',
  },
  {
    title: 'Backend that respects privacy',
    detail:
      'Express, WebSocket, and MySQL services in Backend/ keep end-to-end encryption effortless while routing push tokens securely.',
  },
  {
    title: 'Website as the open door',
    detail:
      'This Next.js site surfaces the roadmap, support addresses, and documentation so anyone can evaluate Syncre before installing.',
  },
];

const platformStats = [
  { label: 'Platforms', value: 'iOS · Android · Web' },
  { label: 'Stack', value: 'React Native · Next.js · Express · MySQL' },
  { label: 'Security', value: 'End-to-end encryption + secure storage' },
];

export default function Home() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: canvasRef,
    offset: ['start start', 'end end'],
  });

  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  return (
    <>
      <Navbar />
      <main
        ref={canvasRef}
        className={`relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white ${jakarta.variable} ${grotesk.variable}`}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 blur-[140px]"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(37,99,235,0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.3), transparent 45%), radial-gradient(circle at 50% 80%, rgba(15,23,42,0.7), transparent 60%)',
            y: glowY,
            opacity: glowOpacity,
          }}
        />
        <section
          id="hero"
          className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center px-6 pt-40 pb-24 text-center"
        >
          <motion.span
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Private beta · Apple-inspired calm
          </motion.span>
          <motion.h1
            className="mt-6 text-4xl font-semibold leading-tight text-balance sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
          >
            The privacy-first messenger draped in Syncre&apos;s original deep blues.
          </motion.h1>
          <motion.p
            className="mt-6 max-w-3xl text-lg text-gray-300"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
          >
            Syncre is a secure, cross-platform communication app built inside our Mobile workspace with React Native and
            Expo. The familiar gradient, softened glass, and blue accents mirror the very first Syncre mockups while the
            experience scales beautifully across iOS, Android, and web.
          </motion.p>
          <motion.p
            className="mt-4 max-w-3xl text-base text-gray-400"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: 'easeOut' }}
          >
            Behind the calm UI lives an Express + WebSocket backend, MySQL persistence, and end-to-end encryption so
            private groups, media drops, and device handoffs stay fast and trustworthy.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <a
              href="mailto:info@syncre.xyz?subject=Syncre%20Early%20Access"
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:-translate-y-0.5 hover:bg-blue-500"
            >
              Get early access
            </a>
            <Link
              href="/privacy"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Explore our privacy promise
            </Link>
          </motion.div>

          <motion.div
            className="mt-16 grid w-full gap-6 text-left sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {heroHighlights.map((item) => (
              <motion.div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                <p className="mt-2 text-sm text-gray-400">{item.detail}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-20 w-full overflow-hidden rounded-[36px] border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-1 shadow-[0_30px_120px_rgba(0,0,0,0.65)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="rounded-[32px] bg-[#050505]/90 px-8 py-12 backdrop-blur-3xl">
              <p className="text-sm uppercase tracking-[0.4em] text-gray-500">Designed like hardware</p>
              <h2 className="mt-4 text-3xl font-semibold text-white lg:text-4xl">
                Motion that breathes, depth that responds, interactions choreographed with haptics.
              </h2>
              <p className="mt-4 max-w-3xl text-base text-gray-300">
                The interface gently tilts with your scroll, glass surfaces react to ambient light, and typography stays
                crisp on every display. Syncre borrows the calm of Apple&apos;s best product launches and turns it into a
                daily habit.
              </p>
            </div>
          </motion.div>
        </section>

        <section id="about" className="relative z-10 mx-auto w-full max-w-[1100px] px-6 py-16">
          <div className="rounded-[36px] border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-900/80 p-10 backdrop-blur-2xl">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-blue-300/80">About Syncre</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">
                  The same Syncre colors, now with a deeper story about the app.
                </h2>
                <p className="mt-4 text-gray-200">
                  Syncre was born as a minimal blue-and-slate mobile client. Today it is a full stack platform: the
                  Mobile workspace handles the React Native + Expo experience, Backend/ exposes REST and WebSocket
                  routes, and this Website workspace keeps legal docs, account removal steps, and landing content in
                  sync.
                </p>
                <ul className="mt-6 space-y-4 text-sm text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-400" />
                    Mobile clients ship secure storage, biometrics, offline send queues, and native camera effects.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-400" />
                    Backend services in <code className="rounded bg-white/10 px-1 text-white/90">Backend/src</code> keep
                    E2E encryption, push notifications, and friend presence locked down.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-400" />
                    Website/ documents privacy, account removal, and the product roadmap so anyone can evaluate Syncre.
                  </li>
                </ul>
              </div>
              <div className="grid gap-6">
                {aboutHighlights.map((item) => (
                  <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-gray-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {platformStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-4 text-center"
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-400">{stat.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="product" className="relative z-10 mx-auto w-full max-w-[1100px] px-6 py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              className="rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl"
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
              <p className="text-sm uppercase tracking-[0.4em] text-gray-500">Product system</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">One fluid surface across every Apple device.</h2>
              <p className="mt-4 text-gray-300">
                Built with Expo, React Native, and a shared design language. Syncre adapts to iOS, iPadOS, macOS, and
                the web with pixel-perfect layouts, dynamic color, and buttery 120 Hz-ready transitions.
              </p>
              <ul className="mt-6 space-y-4 text-sm text-gray-200">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                  Adaptive typography with SF-friendly metrics.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                  Real-time collaboration canvas for lists, ideas, and approvals.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                  Inline media editor with depth estimation and portrait relighting.
                </li>
              </ul>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-2">
              {featureCards.map((feature) => (
                <motion.div
                  key={feature.title}
                  className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/10 to-white/0 p-6 backdrop-blur-2xl"
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-500">{feature.accent}</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-300">{feature.copy}</p>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">{feature.stat}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="relative z-10 mx-auto w-full max-w-[1100px] px-6 py-24">
          <motion.div
            className="rounded-[36px] border border-white/10 bg-[#050607]/80 p-10 backdrop-blur-3xl"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-gray-500">Security stack</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Auditable, encrypted, and transparent.</h2>
              </div>
              <span className="text-sm text-gray-400">
                Infrastructure lives in the Backend workspace—documented in <span className="text-white">Backend/docs</span>.
              </span>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {securityStack.map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-300">{item.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#2a2f39] to-[#0f1114] p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Live monitoring</p>
                <h3 className="mt-3 text-2xl font-semibold">Signal health dashboards</h3>
                <p className="mt-3 text-sm text-gray-300">
                  Real-time audits, anomaly detection, and firmware attestation before devices get push tokens.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#171a20] to-[#050505] p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Developer trust</p>
                <h3 className="mt-3 text-2xl font-semibold">Open keys, open docs</h3>
                <p className="mt-3 text-sm text-gray-300">
                  Each release comes with signed artifacts, schema diffs, and a curl-ready changelog to test instantly.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="relative z-10 mx-auto w-full max-w-[1100px] px-6 py-24">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl">
            <p className="text-sm uppercase tracking-[0.4em] text-gray-500">How we build</p>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {craftSteps.map((step) => (
                <div key={step.title}>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Step</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm text-gray-300">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="early-access"
          className="relative z-10 mx-auto w-full max-w-[1000px] px-6 pb-24"
        >
          <motion.div
            className="rounded-[36px] border border-white/10 bg-gradient-to-br from-white/15 via-white/5 to-transparent p-10 text-center backdrop-blur-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm uppercase tracking-[0.4em] text-gray-500">Early access</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Join the private beta</h2>
            <p className="mt-4 text-gray-200">
              Tell us about your team, the platforms you use, and what you expect from a private messenger. We respond to
              every request.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:info@syncre.xyz?subject=Syncre%20Early%20Access&body=Hi%20Syncre%20team,%0D%0A%0D%0AWe%27d%20love%20to%20join%20the%20beta.%20Here%27s%20our%20use%20case..."
                className="rounded-full bg-black px-8 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/40 ring-1 ring-white/20 transition hover:-translate-y-0.5"
              >
                Email info@syncre.xyz
              </a>
              <Link
                href="/remove-my-account"
                className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/5"
              >
                Need to delete your data?
              </Link>
            </div>
          </motion.div>
        </section>
        <Footer />
      </main>
    </>
  );
}
