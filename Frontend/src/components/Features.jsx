import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Zap, LayoutDashboard } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Message Generation',
    description: 'Create hyper-personalized outreach instantly based on prospect data and your unique value proposition.',
  },
  {
    icon: Users,
    title: 'Bulk Lead Management',
    description: 'Seamlessly upload, segment, and manage thousands of leads with our intelligent database structuring.',
  },
  {
    icon: Zap,
    title: 'Smart Workflow Automation',
    description: 'Run campaigns with intelligent timing, multi-channel sequences, and auto-follow-ups that never sleep.',
  },
  {
    icon: LayoutDashboard,
    title: 'Analytics Dashboard',
    description: 'Track campaign performance, response rates, and meeting conversions with real-time actionable insights.',
  },
];

export default function Features() {
  return (
    <section className="py-32 relative text-white bg-[#0a0a0c] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-20 max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-accent-purple" />
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-white/80">Capabilities</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] mb-6 leading-[1.1]">
            Everything you need to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#737373]">scale your outreach.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1 * idx, ease: "easeOut" }}
                className="group relative p-8 md:p-12 rounded-[2rem] bg-[#0d0d12] border border-white/5 overflow-hidden transition-colors hover:border-white/10"
              >
                {/* Animated border glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-50" />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-8 border border-white/5 group-hover:bg-white/[0.06] transition-colors">
                    <Icon className="w-6 h-6 text-white/90" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4 tracking-[-0.01em]">
                    {feature.title}
                  </h3>
                  <p className="text-[#a1a1aa] leading-relaxed text-lg font-light">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
