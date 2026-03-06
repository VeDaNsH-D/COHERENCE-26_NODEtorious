import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Galaxy from './Galaxy';

const workflowNodes = [
  { label: 'Upload', x: 100, y: 182 },
  { label: 'AI Engine', x: 300, y: 108 },
  { label: 'Personalization', x: 520, y: 214 },
  { label: 'Campaign', x: 740, y: 126 },
  { label: 'Results', x: 920, y: 182 },
];

const workflowPaths = [
  'M100 182 C170 176 210 130 300 108',
  'M300 108 C380 112 430 198 520 214',
  'M520 214 C600 214 665 142 740 126',
  'M740 126 C810 120 860 166 920 182',
];

const floatingCards = [
  {
    label: 'Upload 70%',
    style:
      'top-[44%] left-[3%] md:top-[45%] md:left-[8%] border-[#ffc37133] shadow-[0_0_28px_rgba(255,195,113,0.22)]',
    duration: 5.6,
    delay: 0.1,
  },
  {
    label: 'AI Processing',
    style:
      'top-[30%] left-[23%] md:top-[26%] md:left-[28%] border-[#4cc9f033] shadow-[0_0_28px_rgba(76,201,240,0.2)]',
    duration: 6.1,
    delay: 0.4,
  },
  {
    label: 'Voice Message',
    style:
      'top-[70%] right-[28%] md:top-[73%] md:right-[31%] border-[#ff7a1833] shadow-[0_0_28px_rgba(255,122,24,0.22)]',
    duration: 5.7,
    delay: 0.2,
  },
  {
    label: 'Output Generated',
    style:
      'top-[39%] right-[2%] md:top-[40%] md:right-[8%] border-[#4cc9f033] shadow-[0_0_28px_rgba(76,201,240,0.2)]',
    duration: 6.3,
    delay: 0.6,
  },
];

function MagneticButton({ children, className, onClick }) {
  const [isHovering, setIsHovering] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    setOffset({
      x: x * 0.18,
      y: y * 0.18,
    });
  };

  const handleLeave = () => {
    setIsHovering(false);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleLeave}
      animate={{
        x: offset.x,
        y: offset.y,
        scale: isHovering ? 1.04 : 1,
      }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.6 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  const mouseRatioX = useMotionValue(0.5);
  const mouseRatioY = useMotionValue(0.5);
  const cursorX = useMotionValue(-300);
  const cursorY = useMotionValue(-300);

  const smoothRatioX = useSpring(mouseRatioX, { stiffness: 70, damping: 20, mass: 0.7 });
  const smoothRatioY = useSpring(mouseRatioY, { stiffness: 70, damping: 20, mass: 0.7 });
  const smoothCursorX = useSpring(cursorX, { stiffness: 140, damping: 25, mass: 0.8 });
  const smoothCursorY = useSpring(cursorY, { stiffness: 140, damping: 25, mass: 0.8 });

  const orangeLightX = useTransform(smoothRatioX, (v) => (v - 0.5) * 70);
  const orangeLightY = useTransform(smoothRatioY, (v) => (v - 0.5) * 40);
  const blueLightX = useTransform(smoothRatioX, (v) => (0.5 - v) * 70);
  const blueLightY = useTransform(smoothRatioY, (v) => (0.5 - v) * 40);
  const haloX = useTransform(smoothCursorX, (v) => v - 150);
  const haloY = useTransform(smoothCursorY, (v) => v - 150);

  const handleMouseMove = (event) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const ratioX = Math.max(0, Math.min(1, localX / rect.width));
    const ratioY = Math.max(0, Math.min(1, localY / rect.height));

    mouseRatioX.set(ratioX);
    mouseRatioY.set(ratioY);
    cursorX.set(localX);
    cursorY.set(localY);
  };

  const handleMouseLeave = () => {
    mouseRatioX.set(0.5);
    mouseRatioY.set(0.5);
    cursorX.set(-300);
    cursorY.set(-300);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#050505] px-6 pb-16 pt-32 text-white"
    >
      <div className="absolute inset-0 z-0 opacity-70">
        <Galaxy
          mouseRepulsion
          mouseInteraction
          density={0.5}
          glowIntensity={0.12}
          saturation={0.12}
          hueShift={32}
          twinkleIntensity={0.22}
          rotationSpeed={0.06}
          repulsionStrength={3}
          autoCenterRepulsion={0}
          starSpeed={0.48}
          speed={1}
        />
      </div>

      <motion.div
        style={{ x: orangeLightX, y: orangeLightY }}
        className="pointer-events-none absolute left-[-10%] top-[8%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,122,24,0.26),rgba(255,122,24,0)_62%)]"
      />
      <motion.div
        style={{ x: blueLightX, y: blueLightY }}
        className="pointer-events-none absolute right-[-10%] top-[28%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(76,201,240,0.2),rgba(76,201,240,0)_62%)]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:110px_110px] opacity-20" />

      <motion.div
        style={{ x: haloX, y: haloY }}
        className="pointer-events-none absolute h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(255,195,113,0.28),rgba(255,195,113,0)_70%)] blur-[80px] opacity-25"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9 }}
          className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-6xl"
        >
          Outreach automation powered by intelligent AI.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.8, delay: 0.08 }}
          className="mt-4 max-w-2xl text-base text-white/60 md:text-lg"
        >
          Upload leads, generate personalized outreach, and launch automated campaigns.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.8, delay: 0.16 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <MagneticButton
            onClick={() => navigate('/signup')}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7a18] to-[#ffc371] px-8 py-4 text-sm font-semibold text-[#201207] shadow-[0_0_36px_rgba(255,122,24,0.5)] transition hover:shadow-[0_0_56px_rgba(255,122,24,0.72)]"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </MagneticButton>

          <MagneticButton
            onClick={() => {}}
            className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-medium text-white/90 backdrop-blur-md shadow-[0_0_20px_rgba(76,201,240,0.14)] transition hover:border-white/25 hover:bg-white/10"
          >
            See Workflow
          </MagneticButton>
        </motion.div>

        <div className="relative mt-12 w-full max-w-6xl py-6 md:h-[360px]">
          {floatingCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, delay: 0.42 + index * 0.09 }}
              className={`absolute hidden md:block ${card.style}`}
            >
              <motion.div
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-md"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: card.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: card.delay,
                }}
              >
                {card.label}
              </motion.div>
            </motion.div>
          ))}

          <div className="relative mx-auto h-[260px] max-w-5xl md:h-full">
            <svg
              viewBox="0 0 1020 320"
              className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="pipelineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff7a18" />
                  <stop offset="50%" stopColor="#ffc371" />
                  <stop offset="100%" stopColor="#4cc9f0" />
                </linearGradient>
                <filter id="softGlow">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {workflowPaths.map((path) => (
                <path
                  key={path}
                  d={path}
                  fill="none"
                  stroke="url(#pipelineGlow)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.65"
                  filter="url(#softGlow)"
                />
              ))}

              {workflowPaths.map((path, index) => (
                <g key={`${path}-packet`}>
                  <circle r="4" fill="#ffc371" filter="url(#softGlow)">
                    <animateMotion
                      dur={`${3 + index * 0.4}s`}
                      repeatCount="indefinite"
                      path={path}
                      begin={`${index * 0.35}s`}
                    />
                  </circle>
                  <circle r="2.5" fill="#ff7a18" opacity="0.9" filter="url(#softGlow)">
                    <animateMotion
                      dur={`${2.6 + index * 0.3}s`}
                      repeatCount="indefinite"
                      path={path}
                      begin={`${index * 0.2}s`}
                    />
                  </circle>
                </g>
              ))}
            </svg>

            <div className="relative mx-auto flex h-full max-w-5xl flex-col items-center gap-4 md:hidden">
              {workflowNodes.map((node, index) => (
                <motion.div
                  key={node.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.55 }}
                  transition={{ duration: 0.55, delay: 0.3 + index * 0.1 }}
                  className="rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-medium tracking-wide text-white backdrop-blur-lg shadow-[0_0_20px_rgba(255,140,0,0.25)]"
                >
                  {node.label}
                </motion.div>
              ))}
            </div>

            {workflowNodes.map((node, index) => (
              <motion.div
                key={node.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={{ duration: 0.55, delay: 0.34 + index * 0.12 }}
                className="absolute hidden -translate-x-1/2 -translate-y-1/2 md:block"
                style={{ left: `${(node.x / 1020) * 100}%`, top: `${(node.y / 320) * 100}%` }}
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.04 }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(255, 140, 0, 0.18)',
                      '0 0 38px rgba(255, 140, 0, 0.32)',
                      '0 0 20px rgba(255, 140, 0, 0.18)',
                    ],
                  }}
                  transition={{
                    duration: 3.8,
                    repeat: Infinity,
                    delay: index * 0.28,
                    ease: 'easeInOut',
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-medium tracking-wide text-white backdrop-blur-lg"
                >
                  {node.label}
                </motion.div>
                <motion.div
                  className="absolute left-1/2 top-1/2 -z-10 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff7a18]/25 blur-xl"
                  animate={{ opacity: [0.18, 0.45, 0.18], scale: [0.92, 1.12, 0.92] }}
                  transition={{ duration: 3.2, repeat: Infinity, delay: index * 0.22 }}
                />
              </motion.div>
            ))}

            {workflowPaths.map((path, index) => (
              <svg
                key={`${path}-overlay`}
                viewBox="0 0 1020 320"
                className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
                preserveAspectRatio="xMidYMid meet"
              >
                <path d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 8" />
                <motion.circle
                  r="3"
                  fill="#4cc9f0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.3 }}
                >
                  <animateMotion
                    dur={`${4 + index * 0.6}s`}
                    repeatCount="indefinite"
                    path={path}
                    begin={`${index * 0.4}s`}
                  />
                </motion.circle>
              </svg>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
