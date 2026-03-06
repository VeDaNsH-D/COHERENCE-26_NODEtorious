import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Shuffle, Database, Bot, Rocket, LineChart } from 'lucide-react';

const workflowSteps = [
  {
    icon: Upload,
    title: 'Lead Import',
    description: 'Upload CSV files and structure your outreach database.',
  },
  {
    icon: Shuffle,
    title: 'Data Cleaning',
    description: 'Automatically clean and validate lead information.',
  },
  {
    icon: Database,
    title: 'Lead Enrichment',
    description: 'Enhance lead profiles with additional data.',
  },
  {
    icon: Bot,
    title: 'AI Personalization',
    description: 'Generate tailored outreach messages using AI.',
  },
  {
    icon: Rocket,
    title: 'Campaign Launch',
    description: 'Launch automated outreach workflows.',
  },
  {
    icon: LineChart,
    title: 'Performance Insights',
    description: 'Track replies, engagement and campaign results.',
  },
];

export default function WorkflowViz() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            How the system works
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            A visual overview of our intelligent outreach engine, from raw data to booked meetings.
          </p>
        </motion.div>


        {/* Workflow Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1 * idx, ease: "easeOut" }}
                className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/10 transition-all duration-300">
                  <Icon className="w-6 h-6 text-text-secondary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {step.description}
                </p>
                {/* Hover Glow */}
                <div className="absolute inset-0 -z-10 bg-accent/0 group-hover:bg-accent/5 blur-xl transition-colors duration-500 rounded-2xl" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
