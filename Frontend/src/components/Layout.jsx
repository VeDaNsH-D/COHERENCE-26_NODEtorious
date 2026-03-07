import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Plus, Search, Upload } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage = location.pathname === '/';
  const isWorkflowPage = location.pathname === '/workflows';

  if (isAuthPage) {
    return children;
  }

  // Workflows uses an immersive full-screen canvas with its own internal tooling UI.
  if (isWorkflowPage) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-bg-primary text-text-primary">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen text-text-primary overflow-hidden"
      style={{
        background: `radial-gradient(circle at 20% 20%, rgba(255,120,0,0.15), transparent 40%),
                     radial-gradient(circle at 80% 60%, rgba(0,180,255,0.15), transparent 40%),
                     #0b0f17`,
      }}
    >
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(prev => !prev)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-white/[0.06] bg-black/30 backdrop-blur-xl px-6 py-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none" />
          <div className="relative z-10 flex w-full items-center gap-3">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                placeholder="Search leads, workflows, campaigns..."
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/35 focus:border-white/20 focus:bg-white/[0.06]"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => navigate('/workflows')}
                className="hover-lift hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/80 transition hover:bg-white/[0.1] md:inline-flex"
              >
                <Plus className="h-4 w-4" />
                New Workflow
              </button>
              <button
                onClick={() => navigate('/leads')}
                className="hover-lift hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/80 transition hover:bg-white/[0.1] lg:inline-flex"
              >
                <Upload className="h-4 w-4" />
                Upload Leads
              </button>

              <button className="hover-lift relative rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-white/70 transition hover:bg-white/[0.08]">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-400" />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
