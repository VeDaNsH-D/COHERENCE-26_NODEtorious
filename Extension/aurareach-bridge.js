// Content script injected into the AuraReach website.
// Bridges communication between the web page and the extension background
// using window.postMessage (page <-> content script) and
// chrome.runtime.sendMessage (content script <-> background).

(function () {
    // Inject a small script into the page context to set up window.extensionData
    const script = document.createElement('script');
    script.textContent = `
    (function() {
        window.__aurareach_extension_installed__ = true;

        window.extensionData = {
            leads: [],
            isConnected: false,

            getLeads: function() {
                return new Promise(function(resolve, reject) {
                    var id = 'ar_' + Date.now() + '_' + Math.random();
                    function handler(event) {
                        if (event.data && event.data.type === 'AURAREACH_RESPONSE' && event.data.id === id) {
                            window.removeEventListener('message', handler);
                            if (event.data.error) {
                                reject(new Error(event.data.error));
                            } else {
                                window.extensionData.leads = event.data.leads || [];
                                window.extensionData.isConnected = true;
                                resolve(event.data.leads || []);
                            }
                        }
                    }
                    window.addEventListener('message', handler);
                    window.postMessage({ type: 'AURAREACH_REQUEST', action: 'getLeads', id: id }, '*');

                    // Timeout after 5s
                    setTimeout(function() {
                        window.removeEventListener('message', handler);
                        reject(new Error('Extension not responding'));
                    }, 5000);
                });
            },

            clearLeads: function() {
                return new Promise(function(resolve, reject) {
                    var id = 'ar_' + Date.now() + '_' + Math.random();
                    function handler(event) {
                        if (event.data && event.data.type === 'AURAREACH_RESPONSE' && event.data.id === id) {
                            window.removeEventListener('message', handler);
                            if (event.data.error) {
                                reject(new Error(event.data.error));
                            } else {
                                resolve(event.data.success);
                            }
                        }
                    }
                    window.addEventListener('message', handler);
                    window.postMessage({ type: 'AURAREACH_REQUEST', action: 'clearLeads', id: id }, '*');
                    setTimeout(function() {
                        window.removeEventListener('message', handler);
                        reject(new Error('Extension not responding'));
                    }, 5000);
                });
            },

            ping: function() {
                return new Promise(function(resolve, reject) {
                    var id = 'ar_' + Date.now() + '_' + Math.random();
                    function handler(event) {
                        if (event.data && event.data.type === 'AURAREACH_RESPONSE' && event.data.id === id) {
                            window.removeEventListener('message', handler);
                            window.extensionData.isConnected = true;
                            resolve(true);
                        }
                    }
                    window.addEventListener('message', handler);
                    window.postMessage({ type: 'AURAREACH_REQUEST', action: 'ping', id: id }, '*');
                    setTimeout(function() {
                        window.removeEventListener('message', handler);
                        reject(new Error('Extension not responding'));
                    }, 3000);
                });
            }
        };

        // Dispatch a custom event so React components know the extension is ready
        window.dispatchEvent(new CustomEvent('aurareach-extension-ready'));
    })();
    `;
    document.documentElement.appendChild(script);
    script.remove();

    // Listen for requests from the page and forward to background
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        if (!event.data || event.data.type !== 'AURAREACH_REQUEST') return;

        const { action, id } = event.data;

        chrome.runtime.sendMessage({ action }, (response) => {
            if (chrome.runtime.lastError) {
                window.postMessage({
                    type: 'AURAREACH_RESPONSE',
                    id,
                    error: chrome.runtime.lastError.message
                }, '*');
                return;
            }

            window.postMessage({
                type: 'AURAREACH_RESPONSE',
                id,
                ...response
            }, '*');
        });
    });
})();
