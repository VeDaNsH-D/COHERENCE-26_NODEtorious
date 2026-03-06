import React, { useEffect, useState } from 'react';
import apiService from '../services/api';

export default function ExtensionImportBanner() {
  const [available, setAvailable] = useState(false);
  const [importing, setImporting] = useState(false);
  const [leadCount, setLeadCount] = useState(0);

  useEffect(() => {
    // If the extension content script already injected the bridge, detect immediately
    if (window.__aurareach_extension_installed__) {
      checkLeads();
      return;
    }

    // Otherwise wait for the custom event fired by the bridge content script
    const handler = () => checkLeads();
    window.addEventListener('aurareach-extension-ready', handler);

    // Also try after a short delay in case the event already fired
    const timeout = setTimeout(() => checkLeads(), 1500);

    return () => {
      window.removeEventListener('aurareach-extension-ready', handler);
      clearTimeout(timeout);
    };
  }, []);

  const checkLeads = async () => {
    try {
      if (!window.extensionData?.getLeads) return;
      const leads = await window.extensionData.getLeads();
      if (leads && leads.length > 0) {
        setAvailable(true);
        setLeadCount(leads.length);
      }
    } catch {
      // Extension not installed or no leads
    }
  };

  if (!available) return null;

  const handleImport = async () => {
    if (!window.extensionData?.getLeads) return;
    setImporting(true);
    try {
      const leads = await window.extensionData.getLeads();
      if (!leads || leads.length === 0) {
        alert('No leads captured in extension.');
        return;
      }

      const data = await apiService.post('/api/sync-leads', { leads });

      alert(`Successfully imported ${data.syncedCount ?? leads.length} lead(s)${data.duplicates ? ` (${data.duplicates} duplicates skipped)` : ''}.`);

      // Clear leads from extension storage after successful sync
      if (window.extensionData.clearLeads) {
        await window.extensionData.clearLeads().catch(() => { });
      }

      setAvailable(false);
      setLeadCount(0);

      // Notify other components (e.g. LeadUpload) to refresh their lead list
      window.dispatchEvent(new CustomEvent('leads-imported'));
    } catch (e) {
      alert(`Error importing leads: ${e.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <div>
          <div className="font-semibold text-sm">Intelligence Scout Connected</div>
          <div className="text-xs text-white/80">
            {leadCount} lead{leadCount !== 1 ? 's' : ''} ready to import from your browser extension.
          </div>
        </div>
      </div>
      <button
        onClick={handleImport}
        disabled={importing}
        className="text-xs font-semibold bg-white text-indigo-600 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {importing ? 'Importing…' : 'Import Leads'}
      </button>
    </div>
  );
}

