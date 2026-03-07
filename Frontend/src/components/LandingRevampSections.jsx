import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Radar, Bot, ShieldCheck, Gauge, ArrowUpRight } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';
import { useParallax } from '../hooks/useParallax';

const pillars = [
  {
    icon: Radar,
    title: 'Prospect Signal Detection',
    description: 'Track trigger events and profile fit signals so campaigns target people with real buying intent.',
  },
  {
    icon: Bot,
    title: 'Adaptive AI Messaging',
    description: 'Every touchpoint adjusts tone, depth, and CTA based on role, stage, and previous thread context.',
  },
  {
    icon: Gauge,
    title: 'Campaign Pacing Engine',
    description: 'Keep deliverability healthy with dynamic send windows, daily limits, and automated cooldown rules.',
  },
  {
    icon: ShieldCheck,
    title: 'Built-in Safety Controls',
    description: 'Guardrails for compliance, suppression logic, and handoff routing keep operations reliable at scale.',
  },
];

const stats = [
  { label: 'Leads Processed', value: 24847, suffix: '+' },
  { label: 'Reply Intent Score', value: 78, suffix: '/100' },
  { label: 'Auto Handoffs', value: 312, suffix: '/day' },
];

const brands = ['GrowthLoop', 'ScaleForge', 'Pipeline Labs', 'SignalNest', 'Outbound IQ', 'Velocity Ops'];

const launchSteps = [
  {
    title: 'Import and score your audience',
    text: 'Bring leads from CRM or CSV, then auto-score for fit and timing before launch.',
  },
  {
    title: 'Generate high-precision sequences',
    text: 'Build touchpoints with AI drafts, approved prompts, and per-segment personalization constraints.',
  },
  {
    title: 'Run with intelligent pacing',
    text: 'Campaigns self-adjust around inbox health, timezone windows, and reply velocity patterns.',
  },
  {
    title: 'Route and optimize in real time',
    text: 'High-intent replies are escalated to reps instantly while low-value threads stay automated.',
  },
];

const flowStages = [
  { name: 'Capture', text: 'Import leads and detect intent signals.' },
  { name: 'Personalize', text: 'Generate role-aware messaging paths.' },
  { name: 'Orchestrate', text: 'Run adaptive pacing and follow-ups.' },
  { name: 'Convert', text: 'Route hot replies directly to reps.' },
];

function StatCard({ item, delay }) {
  const { count, ref } = useCountUp(item.value, 1800);
  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -6 }}
      className="rounded-2xl border border-white/12 bg-white/[0.04] p-5"
    >
      <p className="text-xs uppercase tracking-[0.14em] text-white/55">{item.label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-white">
        {count.toLocaleString()}
        <span className="ml-1 text-lg text-cyan-100/80">{item.suffix}</span>
      </p>
    </motion.article>
  );
}

export default function LandingRevampSections() {
  const parallax = useParallax(0.08);

  return (
    <div className="relative overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-[#4cc9f026] blur-[100px]"
        style={{ y: -parallax }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-[28rem] h-80 w-80 rounded-full bg-[#ff7a1822] blur-[110px]"
        style={{ y: parallax * 1.2 }}
      />

      <section id="features" className="section relative pt-14 pb-12">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75 }}
            className="mb-12 flex flex-wrap items-end justify-between gap-6"
          >
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-200/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                The Flow
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.03em] text-white md:text-6xl">
                From raw leads to booked conversations, one connected system.
              </h2>
            </div>
            <p className="max-w-lg text-white/68 leading-7">
              The page now tells one story top-to-bottom: capture data, generate message quality, execute safely, and convert faster.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="workflow" className="section pt-4 pb-14">
        <div className="container">
          <div className="mb-10 grid gap-4 md:grid-cols-4">
            {flowStages.map((stage, i) => (
              <motion.article
                key={stage.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-white/12 bg-white/[0.04] p-5"
              >
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-200/40 bg-cyan-200/10 text-xs font-bold text-cyan-100">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-white">{stage.name}</h3>
                <p className="mt-2 text-sm leading-6 text-white/68">{stage.text}</p>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="container">
          <div className="brand-marquee-wrap rounded-2xl border border-white/12 bg-white/[0.03]">
            <div className="brand-marquee-track">
              {[...brands, ...brands].map((brand, idx) => (
                <span key={`${brand}-${idx}`} className="brand-chip">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="dashboard" className="section pt-8 pb-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7 }}
            className="mb-10 grid gap-5 md:grid-cols-2"
          >
            {pillars.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, delay: i * 0.08 }}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className="group relative overflow-hidden rounded-3xl border border-white/15 bg-[linear-gradient(160deg,#0f1a25dd_0%,#091119e8_44%,#1b1009dc_100%)] p-7 md:p-9"
                >
                  <div className="absolute right-0 top-0 h-36 w-36 translate-x-12 -translate-y-10 rounded-full bg-cyan-200/10 blur-3xl transition-transform duration-500 group-hover:scale-125" />
                  <div className="relative z-10">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06]">
                      <Icon className="h-5 w-5 text-cyan-100" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-[-0.02em] text-white">{item.title}</h3>
                    <p className="mt-3 text-white/70 leading-7">{item.description}</p>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7 }}
            className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <div className="rounded-[2rem] border border-white/15 bg-[linear-gradient(150deg,#101a24e6_0%,#080d13f0_100%)] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Live Ops Snapshot</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-white md:text-5xl">
                Real-time campaign activity at a glance.
              </h3>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {stats.map((item, idx) => (
                  <StatCard key={item.label} item={item} delay={idx * 0.08} />
                ))}
              </div>

              <div className="mt-8 h-44 rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="mb-4 text-xs uppercase tracking-[0.14em] text-white/45">7 Day Activity</p>
                <div className="grid h-[118px] grid-cols-7 items-end gap-2">
                  {[54, 68, 61, 84, 76, 59, 73].map((value, idx) => (
                    <motion.div
                      key={`bar-${idx}`}
                      className="relative rounded-md bg-white/10"
                      style={{ height: `${value}%` }}
                      initial={{ scaleY: 0, opacity: 0.55 }}
                      whileInView={{ scaleY: 1, opacity: 1 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.6, delay: idx * 0.07, ease: 'easeOut' }}
                    >
                      <motion.div
                        className="absolute inset-x-0 bottom-0 rounded-md bg-gradient-to-t from-[#ff7a18] to-[#4cc9f0]"
                        animate={{ opacity: [0.55, 1, 0.55] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: idx * 0.15 }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-[#0b1017e6] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">Execution Loop</p>
              <div className="mt-6 space-y-4">
                {launchSteps.map((step, idx) => (
                  <motion.article
                    key={step.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.55, delay: idx * 0.08 }}
                    whileHover={{ x: 4 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h4 className="text-lg font-bold text-white">{step.title}</h4>
                      <span className="text-xs font-semibold tracking-[0.18em] text-cyan-100/80">0{idx + 1}</span>
                    </div>
                    <p className="text-sm leading-6 text-white/68">{step.text}</p>
                  </motion.article>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="security" className="section pt-0 pb-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {['GDPR Ready', 'SOC 2 Alignment', 'Role-based Access', 'Audit Logs'].map((item) => (
              <span key={item} className="rounded-full border border-white/20 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/75">
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="howitworks" className="section pt-0 pb-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7 }}
            className="rounded-[2rem] border border-white/15 bg-[linear-gradient(135deg,#132637cc_0%,#0b121aef_50%,#2a170acd_100%)] p-8 md:p-12"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80">Conversion CTA</p>
            <h3 className="mt-4 max-w-4xl text-3xl font-black leading-[1.07] tracking-[-0.03em] text-white md:text-5xl">
              Launch campaigns that feel personal, not robotic.
            </h3>
            <p className="mt-4 max-w-2xl text-white/72 leading-7">
              Build your first workflow in minutes and watch every stage adapt to real response behavior.
            </p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 rounded-full border border-cyan-100/40 bg-cyan-200/90 px-7 py-3 text-sm font-bold uppercase tracking-[0.11em] text-[#051118] transition hover:bg-cyan-100"
              >
                Start Free
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="/extension/intelligence-scout-extension.zip"
                className="inline-flex items-center rounded-full border border-white/25 bg-white/[0.06] px-7 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-white/82 transition hover:border-white/45 hover:text-white"
              >
                Download Extension
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
