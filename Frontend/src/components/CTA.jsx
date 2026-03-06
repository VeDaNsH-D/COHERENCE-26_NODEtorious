import React from 'react';
import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section className="py-32 relative overflow-hidden flex items-center justify-center min-h-[60vh] bg-[#0a0a0c]">
      {/* Intense Background Glow */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#05050a] via-[#0a0a0c] to-[#0a0a0c] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-full max-h-[1000px] bg-gradient-to-tr from-accent-purple/15 via-accent/15 to-transparent blur-[120px] z-0 rounded-full opacity-60 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto p-12 md:p-24 rounded-[3rem] bg-[#0d0d12]/80 backdrop-blur-3xl border border-white/5 relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
        >
          {/* inner dynamic glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
          </div>

          <div className="absolute inset-0 rounded-[3rem] ring-1 ring-inset ring-white/5 pointer-events-none" />
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-[-0.03em] text-white mb-8 relative z-10 leading-[1.05]">
            Start smarter <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e2e2e2] to-[#737373]">outreach today.</span>
          </h2>
          
          <p className="text-xl text-[#a1a1aa] max-w-2xl mx-auto mb-12 relative z-10 font-light leading-relaxed">
            Join thousands of growth teams booking more meetings with intelligent automation designed for scale.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 relative z-10">
            <button className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-black font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] hover:bg-neutral-200 transition-all shadow-xl">
              Get Started
            </button>
            <button className="w-full sm:w-auto px-10 py-5 rounded-full bg-transparent border border-[#333333] text-white font-medium text-sm hover:bg-white/5 transition-all backdrop-blur-md">
              Book Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
