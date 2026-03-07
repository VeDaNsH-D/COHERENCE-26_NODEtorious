import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Galaxy from './Galaxy';

const workflowNodes = [
  { label: 'Upload', x: 104, y: 196, width: 160 },
  { label: 'AI Engine', x: 332, y: 132, width: 198 },
  { label: 'Personalization', x: 556, y: 226, width: 244 },
  { label: 'Campaign', x: 770, y: 152, width: 180 },
  { label: 'Results', x: 944, y: 198, width: 144 },
];

const WORKFLOW_VIEWBOX_WIDTH = 1020;
const WORKFLOW_VIEWBOX_HEIGHT = 320;

const getNodeEdge = (node, side) => {
  const halfWidth = node.width / 2;
  return {
    x: side === 'right' ? node.x + halfWidth - 8 : node.x - halfWidth + 8,
    y: node.y,
  };
};

const workflowPaths = workflowNodes.slice(0, -1).map((node, index) => {
  const nextNode = workflowNodes[index + 1];
  const start = getNodeEdge(node, 'right');
  const end = getNodeEdge(nextNode, 'left');
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  // Keep curve tension tied to node spacing so links stay connected if positions shift.
  const controlXOffset = Math.max(18, Math.min(92, deltaX * 0.5));
  const controlYOffset = deltaY * 0.34;

  return [
    `M${start.x} ${start.y}`,
    `C${start.x + controlXOffset} ${start.y + controlYOffset}`,
    `${end.x - controlXOffset} ${end.y - controlYOffset}`,
    `${end.x} ${end.y}`,
  ].join(' ');
});

const floatingCards = [
  {
    label: 'Upload 70%',
    meta: 'Ingestion',
    x: 102,
    y: 70,
    tone: 'from-[#ffc37124] via-[#ffb24f12] to-[#ff7a1805]',
    dot: 'bg-[#ffc371] shadow-[0_0_12px_rgba(255,195,113,0.95)]',
    duration: 5.6,
    delay: 0.1,
  },
  {
    label: 'AI Processing',
    meta: 'Model Pass',
    x: 338,
    y: 42,
    tone: 'from-[#4cc9f024] via-[#4cc9f012] to-[#0b152600]',
    dot: 'bg-[#4cc9f0] shadow-[0_0_12px_rgba(76,201,240,0.95)]',
    duration: 6.1,
    delay: 0.4,
  },
  {
    label: 'Voice Message',
    meta: 'Variant Live',
    x: 666,
    y: 292,
    tone: 'from-[#ff9f5722] via-[#ff7a1814] to-[#0b152600]',
    dot: 'bg-[#ff9f57] shadow-[0_0_12px_rgba(255,159,87,0.95)]',
    duration: 5.7,
    delay: 0.2,
  },
  {
    label: 'Output Generated',
    meta: 'Ready',
    x: 904,
    y: 74,
    tone: 'from-[#8de5ff1f] via-[#4cc9f012] to-[#0b152600]',
    dot: 'bg-[#8de5ff] shadow-[0_0_12px_rgba(141,229,255,0.95)]',
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
            onClick={() => { }}
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
              className="absolute hidden -translate-x-1/2 -translate-y-1/2 md:block"
              style={{
                left: `${(card.x / WORKFLOW_VIEWBOX_WIDTH) * 100}%`,
                top: `${(card.y / WORKFLOW_VIEWBOX_HEIGHT) * 100}%`,
              }}
            >
              <motion.div
                className={`relative min-w-[176px] overflow-hidden rounded-full border border-white/15 bg-gradient-to-br ${card.tone} px-4 py-2.5 text-left shadow-[0_10px_24px_rgba(0,0,0,0.34)] backdrop-blur-xl`}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: card.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: card.delay,
                }}
              >
                <div className="pointer-events-none absolute inset-[1px] rounded-full border border-white/8" />
                <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(110deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.06)_34%,rgba(255,255,255,0)_70%)]" />
                <div className="relative flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${card.dot}`} />
                  <span className="text-[13px] font-medium tracking-[0.01em] text-white/90">{card.label}</span>
                </div>
                <p className="relative mt-1 pl-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">{card.meta}</p>
              </motion.div>
            </motion.div>
          ))}

          <div className="relative mx-auto h-[260px] max-w-5xl md:h-full">
            <div className="pointer-events-none absolute inset-x-[2.5%] top-[12%] hidden h-[72%] rounded-[30px] border border-white/6 bg-[radial-gradient(ellipse_at_center,rgba(14,22,34,0.34),rgba(5,8,14,0)_72%)] md:block" />
            <svg
              viewBox={`0 0 ${WORKFLOW_VIEWBOX_WIDTH} ${WORKFLOW_VIEWBOX_HEIGHT}`}
              className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
              preserveAspectRatio="none"
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
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  opacity="0.8"
                  filter="url(#softGlow)"
                />
              ))}

              {workflowPaths.map((path, index) => (
                <g key={`${path}-packet`}>
                  <circle r="4.2" fill="#ffe0a5" filter="url(#softGlow)">
                    <animateMotion
                      dur={`${3.3 + index * 0.42}s`}
                      repeatCount="indefinite"
                      path={path}
                      begin={`${index * 0.3}s`}
                    />
                  </circle>
                  <circle r="2" fill="#ff8b2a" opacity="0.85" filter="url(#softGlow)">
                    <animateMotion
                      dur={`${3.3 + index * 0.42}s`}
                      repeatCount="indefinite"
                      path={path}
                      begin={`${index * 0.3}s`}
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
                style={{
                  left: `${(node.x / WORKFLOW_VIEWBOX_WIDTH) * 100}%`,
                  top: `${(node.y / WORKFLOW_VIEWBOX_HEIGHT) * 100}%`,
                }}
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.04 }}
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(255, 140, 0, 0.12)',
                      '0 0 34px rgba(255, 140, 0, 0.24)',
                      '0 0 20px rgba(255, 140, 0, 0.12)',
                    ],
                  }}
                  transition={{
                    duration: 3.8,
                    repeat: Infinity,
                    delay: index * 0.28,
                    ease: 'easeInOut',
                  }}
                  className="relative flex h-[72px] items-center justify-center overflow-hidden rounded-full border border-white/12 bg-[linear-gradient(156deg,rgba(17,24,36,0.72)_0%,rgba(9,13,20,0.76)_100%)] px-8 text-base font-medium tracking-[0.01em] text-white/92 backdrop-blur-lg"
                  style={{ width: `${node.width}px` }}
                >
                  <span className="pointer-events-none absolute inset-[1px] rounded-full border border-white/8" />
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(108deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.02)_44%,rgba(255,255,255,0)_76%)]" />
                  <span className="relative">{node.label}</span>
                </motion.div>
                <motion.div
                  className="absolute left-1/2 top-1/2 -z-10 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff7a18]/16 blur-xl"
                  animate={{ opacity: [0.12, 0.35, 0.12], scale: [0.9, 1.14, 0.9] }}
                  transition={{ duration: 3.2, repeat: Infinity, delay: index * 0.22 }}
                />
              </motion.div>
            ))}

            {workflowPaths.map((path) => (
              <svg
                key={`${path}-overlay`}
                viewBox={`0 0 ${WORKFLOW_VIEWBOX_WIDTH} ${WORKFLOW_VIEWBOX_HEIGHT}`}
                className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
                preserveAspectRatio="none"
              >
                <path d={path} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="4 10" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}