import React from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, CheckCircle2 } from 'lucide-react';

export default function DashboardPreview() {
  return (
    <section className="py-32 relative text-white bg-[#0a0a0c] overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] mb-6 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white to-[#737373]">
              Command your outreach
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto font-light leading-relaxed">
              Monitor campaigns, track replies, and analyze performance from a single beautifully crafted dashboard designed for speed.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto max-w-5xl"
        >
          {/* Dashboard Frame - Ultra Premium */}
          <div className="rounded-[2rem] border border-white/5 bg-[#0d0d12]/90 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden relative z-10">
            {/* OSX-style Top Bar */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.03] bg-white/[0.01]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]/80 flex items-center justify-center group"><div className="w-1.5 h-1.5 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"/></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/80 flex items-center justify-center group"><div className="w-1.5 h-1.5 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"/></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]/80 flex items-center justify-center group"><div className="w-1.5 h-1.5 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"/></div>
              </div>
              <div className="mx-auto text-[11px] font-medium text-white/30 tracking-wider flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-white/5 flex items-center justify-center">⌘</span>
                app.outreach.ai
              </div>
              <div className="w-12" /> {/* Spacer for flex centering */}
            </div>

            {/* Dashboard Content */}
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-6 lg:gap-8 mb-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                  {[
                    { label: 'Leads Contacted', value: '14,208', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Replies Received', value: '1,842', icon: Mail, color: 'text-[#f97316]', bg: 'bg-[#f97316]/10' },
                    { label: 'Meetings Booked', value: '412', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 + (0.1 * i), ease: "easeOut" }}
                      className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <span className="text-[#a1a1aa] text-sm font-medium tracking-wide">{stat.label}</span>
                        <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                          <stat.icon className={`w-4 h-4 ${stat.color} opacity-90`} />
                        </div>
                      </div>
                      <div className="text-3xl font-semibold text-white tracking-tight relative z-10">{stat.value}</div>
                      <div className="mt-2 text-xs text-[#27c93f]/80 font-medium tracking-wide relative z-10">+12% from last week</div>
                      
                      {/* Subtle hover gleam */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.02] to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Chart Mock */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="h-[280px] w-full rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center p-8 relative overflow-hidden group"
              >
                {/* simple chart lines */}
                <div className="w-full h-full flex items-end justify-between gap-3 overflow-hidden">
                  {[30, 50, 40, 70, 60, 90, 80, 100, 85, 110, 95, 120].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.6 + (i * 0.04), ease: [0.16, 1, 0.3, 1] }}
                      className="w-full rounded-t-sm relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[#f97316]/5 to-[#f97316]/40 group-hover:to-[#f97316]/60 transition-colors duration-500" />
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#f97316] opacity-80" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Outer glow behind dashboard */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-accent/5 blur-[120px] -z-10 rounded-[3rem] pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
