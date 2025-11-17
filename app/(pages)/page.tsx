'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
    value: 'End-to-end by default',
    detail: 'Chats, calls, and media stay private.',
  },
  { label: 'Platforms', value: 'iOS · Android · Web', detail: 'Built with React Native, Expo, and Next.js.' },
  { label: 'Team', value: 'Syncre Collective', detail: 'Indie builders in Budapest and Berlin.' },
];

const featureCards = [
  {
    accent: 'Chats & groups',
    title: 'Secure conversations',
    copy: '1:1, group, and broadcast chats with disappearing messages, media reactions, and read receipts that you control.',
  },
  {
    accent: 'Voice & video',
    title: 'Crystal-clear calls',
    copy: 'Low-latency calls with optional voice notes so quick updates never require typing.',
  },
  {
    accent: 'Sync',
    title: 'One account everywhere',
    copy: 'Hop between phone, tablet, and web—the same encrypted history follows instantly.',
  },
  {
    accent: 'Status',
    title: 'Presence you can trust',
    copy: 'Share availability, automate focus modes, and pause notifications with one tap.',
  },
];

const useCases = [
  'Stay in touch with close friends without ads or data mining.',
  'Coordinate side projects and indie crews with fast media sharing.',
  'Plan trips, events, or study sessions using shared lists and reminders.',
  'Keep family photos and voice notes synced privately across devices.',
];

const teamMembers = [
  {
    name: 'Benedek Balló',
    role: 'Product & iOS lead',
    note: 'Designs the calm, builds the app and the backend.',
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main
        className={`relative min-h-screen overflow-hidden text-white ${jakarta.variable} ${grotesk.variable}`}
      >
        <section
          id="hero"
          className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center px-6 pt-40 pb-24 text-center"
        >
            <motion.h1
            className="mt-6 text-4xl font-bold leading-tight text-balance sm:text-5xl lg:text-8xl text-white"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
            >
            Syncre
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
            className="mt-20 w-full rounded-[36px] border border-white/10 bg-gradient-to-br from-blue-600/20 via-slate-900/70 to-gray-900/80 px-8 py-12 text-left shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
    <p className="text-sm uppercase tracking-[0.4em] text-blue-200">App motto</p>
    <h2 className="mt-4 text-3xl font-semibold text-white lg:text-4xl">
      Talk freely. Stay close. Own your data.
    </h2>
            <p className="mt-4 max-w-3xl text-base text-gray-200">
              Syncre keeps things simple: beautiful blue gradients, fast syncing, and privacy that is on by default. No
              algorithms, no ads—just a direct line to the people you trust most.
            </p>
          </motion.div>
        </section>

        <section id="features" className="relative z-10 mx-auto w-full max-w-[1100px] px-6 py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/10 to-white/0 p-6 backdrop-blur-2xl"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-blue-200/80">{feature.accent}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-300">{feature.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="app" className="relative z-10 mx-auto w-full max-w-[1100px] px-6 py-20">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl">
            <p className="text-sm uppercase tracking-[0.4em] text-blue-200/80">What&apos;s inside?</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">What Syncre delivers.</h2>
            <p className="mt-4 text-gray-200">
              One calm app for chat, media, presence, and calls—no matter if you open it on iOS, Android, or the web.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-gray-200">
              {useCases.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-blue-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="team" className="relative z-10 mx-auto w-full max-w-[1100px] px-6 py-20">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-900/80 p-10 backdrop-blur-2xl">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-blue-200/80">Team</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Syncre Collective</h2>
                <p className="mt-4 text-gray-200">
                  We&apos;re a small team obsessed with making modern chat both beautiful and private. We work between
                  Budapest and Berlin with open-source tools.
                </p>
                <div className="mt-6 space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-lg font-semibold text-white">{member.name}</p>
                      <p className="text-sm text-blue-200">{member.role}</p>
                      <p className="mt-2 text-sm text-gray-300">{member.note}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-gray-200">
                <p className="text-xs uppercase tracking-[0.4em] text-blue-200/80">Contact</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-white font-semibold">Email</p>
                    <a className="text-blue-200 hover:text-white" href="mailto:info@syncre.xyz">
                      info@syncre.xyz
                    </a>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Account removal</p>
                    <Link className="text-blue-200 hover:text-white" href="/remove-my-account">
                      /remove-my-account
                    </Link>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Privacy</p>
                    <Link className="text-blue-200 hover:text-white" href="/privacy">
                      /privacy
                    </Link>
                  </div>
                </div>
                <p className="mt-6 text-gray-400">
                  Drop us a line if you want to join the beta, found a bug, or want to talk about the backend and
                  security model.
                </p>
              </div>
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
            <p className="text-sm uppercase tracking-[0.4em] text-gray-500">Beta builds</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Download the Syncre beta today</h2>
            <p className="mt-4 text-gray-200">
              The mobile beta is live on GitHub (Android) and TestFlight (iOS). Grab the latest build below—no waitlist.
            </p>
            <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Android beta</p>
                <p className="mt-2 text-sm text-gray-300">
                  Grab the freshest APK directly from our public GitHub releases.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="https://github.com/Syncre-App/Mobile/releases"
                    className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                  >
                    View releases
                  </a>
                  <a
                    href="https://github.com/Syncre-App/Mobile/releases/download/v1.0.7/app-release.apk"
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:-translate-y-0.5 hover:bg-white/90"
                  >
                    <span className="font-semibold text-gray-900">Latest APK</span>
                  </a>
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Apple TestFlight</p>
                <p className="mt-2 text-sm text-gray-300">
                  Join the TestFlight to install the current iOS beta build.
                </p>
                <a
                  href="https://testflight.apple.com/join/nVdAZ54W"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:-translate-y-0.5 hover:bg-white/90"
                >
                  <span className="font-semibold text-gray-900">Open TestFlight</span>
                </a>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Web coming soon</p>
                <p className="mt-2 text-sm text-gray-300">
                  We&apos;re polishing the web client and will share early builds once it&apos;s ready for testers.
                </p>
                <p className="mt-4 text-xs text-gray-500">Sign up so we can ping you when it ships.</p>
              </div>
            </div>
            <Link
              href="/remove-my-account"
              className="mt-8 inline-flex rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/5"
            >
              Need to delete your data?
            </Link>
          </motion.div>
        </section>
        <Footer />
      </main>
    </>
  );
}
