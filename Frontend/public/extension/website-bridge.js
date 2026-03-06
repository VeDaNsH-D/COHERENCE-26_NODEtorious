// Website Bridge Fallback
// The extension's content script (aurareach-bridge.js) injects the real
// window.extensionData object. This file only sets up a stub so that
// React components can safely reference window.extensionData without
// errors when the extension is NOT installed.

(function () {
    // If the extension already injected the real bridge, do nothing.
    if (window.__aurareach_extension_installed__) return;

    window.extensionData = {
        leads: [],
        isConnected: false,
        getLeads: function () {
            return Promise.reject(new Error('Extension not installed'));
        },
        clearLeads: function () {
            return Promise.reject(new Error('Extension not installed'));
        },
        ping: function () {
            return Promise.reject(new Error('Extension not installed'));
        }
    };
})();

