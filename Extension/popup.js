// Popup Script - Handles UI interactions

const API_BASE_URL = 'http://localhost:8000';

// Storage Keys
const STORAGE_KEYS = {
    SETTINGS: 'intelligenceScout_settings',
    LEADS: 'intelligenceScout_leads',
    ACTIVITY_LOG: 'activityLog'
};

// State
let currentLeadData = null;
let capturedLeads = [];

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    initTabs();
    await loadSettings();
    await loadLeads();
    await initCapture();
});

// Tab Navigation
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${targetTab}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Initialize Capture Tab
async function initCapture() {
    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('content');
    const errorEl = document.getElementById('error');

    loadingEl.style.display = 'flex';
    contentEl.style.display = 'none';
    errorEl.style.display = 'none';

    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.url || !tab.url.includes('linkedin.com')) {
            showError('Please navigate to a LinkedIn profile page to capture lead data.');
            return;
        }

        // Request lead data from content script
        chrome.tabs.sendMessage(tab.id, { action: 'getLeadData' }, (response) => {
            if (chrome.runtime.lastError) {
                showError('Could not connect to LinkedIn page. Try refreshing the page.');
                return;
            }

            if (response && response.leadData) {
                currentLeadData = response.leadData;
                displayLeadData(currentLeadData);
                loadingEl.style.display = 'none';
                contentEl.style.display = 'block';
                generateAIInsight(currentLeadData);
                calculateHumanTiming();
            } else {
                showError('Could not extract lead data. Make sure you are on a LinkedIn profile page.');
            }
        });
    } catch (error) {
        showError('Error initializing capture: ' + error.message);
    }
}

// Display lead data in popup
function displayLeadData(data) {
    document.getElementById('leadName').textContent = data.name || '-';
    document.getElementById('leadRole').textContent = data.role || '-';
    document.getElementById('leadCompany').textContent = data.company || '-';
    
    const urlEl = document.getElementById('leadUrl');
    if (data.profileUrl) {
        urlEl.textContent = 'View Profile';
        urlEl.onclick = () => chrome.tabs.create({ url: data.profileUrl });
    } else {
        urlEl.textContent = '-';
    }

    // Initialize path buttons
    initPathButtons();
    
    // Initialize action buttons
    initActionButtons();
}

// Generate AI Insight
async function generateAIInsight(leadData) {
    const insightEl = document.getElementById('aiInsight');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/generate-insight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
        });

        if (response.ok) {
            const data = await response.json();
            insightEl.innerHTML = `<p><strong>Key Insight:</strong> ${data.insight || 'Based on their role, consider highlighting product efficiency and ROI.'}</p>`;
        } else {
            // Fallback insight based on role
            const insight = generateFallbackInsight(leadData);
            insightEl.innerHTML = `<p><strong>Key Insight:</strong> ${insight}</p>`;
        }
    } catch (error) {
        // Generate local insight when API is unavailable
        const insight = generateFallbackInsight(leadData);
        insightEl.innerHTML = `<p><strong>Key Insight:</strong> ${insight}</p>`;
    }
}

// Generate fallback insight when API is unavailable
function generateFallbackInsight(leadData) {
    const role = (leadData.role || '').toLowerCase();
    
    if (role.includes('ceo') || role.includes('founder') || role.includes('president')) {
        return 'As a top executive, they likely care most about strategic growth and ROI. Lead with high-level business impact.';
    } else if (role.includes('cto') || role.includes('engineer') || role.includes('developer')) {
        return 'Technical decision-maker. Focus on architecture, scalability, and developer experience.';
    } else if (role.includes('marketing') || role.includes('growth')) {
        return 'Marketing focused. Emphasize metrics, conversion rates, and campaign performance.';
    } else if (role.includes('sales') || role.includes('business development')) {
        return 'Sales professional. Highlight how your solution can help them close more deals.';
    } else if (role.includes('product') || role.includes('pm')) {
        return 'Product person. Focus on user experience, feature velocity, and roadmap alignment.';
    }
    
    return 'Research their recent activity and company news to personalize your outreach.';
}

// Calculate human-like timing
function calculateHumanTiming() {
    const meterFill = document.getElementById('meterFill');
    const meterText = document.getElementById('meterText');
    
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    let score = 0;
    let message = '';
    
    // Check if it's a business day (Mon-Fri)
    if (day >= 1 && day <= 5) {
        score += 30;
        
        // Check if it's business hours (9 AM - 5 PM)
        if (hour >= 9 && hour <= 17) {
            score += 50;
            
            // Peak hours bonus (10 AM - 2 PM)
            if (hour >= 10 && hour <= 14) {
                score += 20;
                message = 'Excellent timing! Peak engagement hours.';
            } else {
                message = 'Good timing. Within business hours.';
            }
        } else if (hour >= 7 && hour < 9) {
            score += 20;
            message = 'Early morning - some professionals check emails now.';
        } else if (hour > 17 && hour <= 19) {
            score += 15;
            message = 'After hours - response may be delayed.';
        } else {
            message = 'Outside business hours - consider scheduling for tomorrow.';
        }
    } else {
        score += 10;
        message = 'Weekend - consider scheduling for Monday.';
    }
    
    meterFill.style.width = `${score}%`;
    meterText.textContent = message;
    
    // Color the meter based on score
    if (score >= 80) {
        meterFill.style.background = '#6bcf7f';
    } else if (score >= 50) {
        meterFill.style.background = '#ffd93d';
    } else {
        meterFill.style.background = '#ff6b6b';
    }
}

// Initialize path buttons
function initPathButtons() {
    const pathBtns = document.querySelectorAll('.path-btn');
    
    pathBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            pathBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update insight based on selected path
            const path = btn.dataset.path;
            updatePathInsight(path);
        });
    });
}

// Update insight based on selected outreach path
function updatePathInsight(path) {
    const insightEl = document.getElementById('aiInsight');
    const leadRole = currentLeadData?.role || '';
    
    const insights = {
        technical: `<p><strong>Technical Approach:</strong> Focus on architecture, APIs, and developer experience. Mention specific tech stack alignments with ${currentLeadData?.company || 'their company'}.`,
        business: `<p><strong>Business Approach:</strong> Emphasize ROI, efficiency gains, and competitive advantages. Reference relevant case studies.`,
        executive: `<p><strong>Executive Approach:</strong> Lead with strategic value and market positioning. Keep the message concise and high-level.`
    };
    
    insightEl.innerHTML = insights[path] || insights.business;
}

// Initialize action buttons
function initActionButtons() {
    document.getElementById('saveBtn').addEventListener('click', saveLead);
    document.getElementById('enrollBtn').addEventListener('click', enrollLead);
    document.getElementById('viewDetailsBtn').addEventListener('click', viewFullProfile);
}

// Save lead to local storage
async function saveLead() {
    const saveBtn = document.getElementById('saveBtn');
    const successEl = document.getElementById('success');
    const successText = document.getElementById('successText');
    
    if (!currentLeadData || !currentLeadData.name) {
        showError('No lead data to save.');
        return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    try {
        // Add timestamp and ID
        const leadToSave = {
            ...currentLeadData,
            id: Date.now(),
            capturedAt: new Date().toISOString(),
            selectedPath: document.querySelector('.path-btn.active')?.dataset.path || 'business'
        };
        
        // Get existing leads
        const result = await chrome.storage.local.get(STORAGE_KEYS.LEADS);
        const leads = result[STORAGE_KEYS.LEADS] || [];
        
        // Check for duplicates
        const exists = leads.some(l => l.profileUrl === leadToSave.profileUrl);
        if (exists) {
            showError('This lead has already been saved.');
            saveBtn.disabled = false;
            saveBtn.textContent = '💾 Save to Collection';
            return;
        }
        
        // Add new lead
        leads.push(leadToSave);
        await chrome.storage.local.set({ [STORAGE_KEYS.LEADS]: leads });
        
        // Update UI
        successText.textContent = 'Lead saved to collection!';
        successEl.style.display = 'block';
        saveBtn.textContent = '✅ Saved!';
        
        // Update leads count
        await loadLeads();
        
        setTimeout(() => {
            successEl.style.display = 'none';
            saveBtn.textContent = '💾 Save to Collection';
            saveBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        showError('Failed to save lead: ' + error.message);
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Save to Collection';
    }
}

// Enroll lead directly
async function enrollLead() {
    const enrollBtn = document.getElementById('enrollBtn');
    const successEl = document.getElementById('success');
    const successText = document.getElementById('successText');
    
    if (!currentLeadData || !currentLeadData.name) {
        showError('No lead data to enroll.');
        return;
    }
    
    enrollBtn.disabled = true;
    enrollBtn.textContent = 'Sending...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/enroll-lead`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...currentLeadData,
                source: 'extension',
                selectedPath: document.querySelector('.path-btn.active')?.dataset.path || 'business',
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            successText.textContent = 'Lead enrolled in workflow!';
            successEl.style.display = 'block';
            enrollBtn.textContent = '✅ Enrolled!';
        } else {
            throw new Error('API returned error');
        }
        
        setTimeout(() => {
            successEl.style.display = 'none';
            enrollBtn.textContent = '✨ Send Directly';
            enrollBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        showError('Failed to enroll. Is the backend running?');
        enrollBtn.disabled = false;
        enrollBtn.textContent = '✨ Send Directly';
    }
}

// View full profile
function viewFullProfile() {
    if (currentLeadData?.profileUrl) {
        chrome.tabs.create({ url: currentLeadData.profileUrl });
    }
}

// Show error message
function showError(message) {
    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('content');
    const errorEl = document.getElementById('error');
    const errorText = document.getElementById('errorText');
    
    loadingEl.style.display = 'none';
    contentEl.style.display = 'none';
    errorEl.style.display = 'block';
    errorText.textContent = message;
}

// Load leads from storage
async function loadLeads() {
    const result = await chrome.storage.local.get(STORAGE_KEYS.LEADS);
    capturedLeads = result[STORAGE_KEYS.LEADS] || [];
    
    // Update count
    document.getElementById('leadsCount').textContent = capturedLeads.length;
    document.getElementById('leadsStatus').textContent = `${capturedLeads.length} leads collected`;
    
    // Render leads list
    renderLeadsList();
    
    // Show/hide bulk actions
    const bulkActions = document.getElementById('leadsBulkActions');
    if (capturedLeads.length > 0) {
        bulkActions.style.display = 'block';
        initBulkActions();
    } else {
        bulkActions.style.display = 'none';
    }
}

// Render leads list
function renderLeadsList() {
    const container = document.getElementById('leadsContainer');
    
    if (capturedLeads.length === 0) {
        container.innerHTML = '<p class="empty-state">No leads captured yet. Go to LinkedIn and click "Save to Collection" on profiles!</p>';
        return;
    }
    
    container.innerHTML = capturedLeads.map(lead => `
        <div class="lead-card" data-id="${lead.id}">
            <div class="lead-card-header">
                <div>
                    <div class="lead-card-name">${escapeHtml(lead.name)}</div>
                    <div class="lead-card-meta">${escapeHtml(lead.role || '')} ${lead.company ? 'at ' + escapeHtml(lead.company) : ''}</div>
                </div>
            </div>
            <div class="lead-card-actions">
                <button class="lead-card-btn view-btn" data-url="${escapeHtml(lead.profileUrl)}">View</button>
                <button class="lead-card-btn enroll-btn" data-id="${lead.id}">Enroll</button>
                <button class="lead-card-btn delete" data-id="${lead.id}">Delete</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    container.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => chrome.tabs.create({ url: btn.dataset.url }));
    });
    
    container.querySelectorAll('.enroll-btn').forEach(btn => {
        btn.addEventListener('click', () => enrollLeadById(parseInt(btn.dataset.id)));
    });
    
    container.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', () => deleteLeadById(parseInt(btn.dataset.id)));
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// Delete lead by ID
async function deleteLeadById(id) {
    capturedLeads = capturedLeads.filter(l => l.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEYS.LEADS]: capturedLeads });
    await loadLeads();
}

// Enroll lead by ID
async function enrollLeadById(id) {
    const lead = capturedLeads.find(l => l.id === id);
    if (!lead) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/enroll-lead`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...lead,
                source: 'extension',
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            // Remove from local storage after successful enrollment
            await deleteLeadById(id);
            alert('Lead enrolled successfully!');
        } else {
            throw new Error('API error');
        }
    } catch (error) {
        alert('Failed to enroll lead. Is the backend running?');
    }
}

// Initialize bulk actions
function initBulkActions() {
    document.getElementById('syncBtn').addEventListener('click', syncAllLeads);
    document.getElementById('clearBtn').addEventListener('click', clearAllLeads);
}

// Sync all leads to backend
async function syncAllLeads() {
    const syncBtn = document.getElementById('syncBtn');
    syncBtn.disabled = true;
    syncBtn.textContent = 'Syncing...';
    
    let successCount = 0;
    let failCount = 0;
    
    for (const lead of capturedLeads) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/enroll-lead`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...lead,
                    source: 'extension-sync',
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            failCount++;
        }
    }
    
    if (successCount > 0) {
        // Clear synced leads
        await chrome.storage.local.set({ [STORAGE_KEYS.LEADS]: [] });
        await loadLeads();
    }
    
    alert(`Sync complete: ${successCount} succeeded, ${failCount} failed`);
    
    syncBtn.disabled = false;
    syncBtn.textContent = '🔄 Sync to Website';
}

// Clear all leads
async function clearAllLeads() {
    if (confirm('Are you sure you want to delete all captured leads?')) {
        await chrome.storage.local.set({ [STORAGE_KEYS.LEADS]: [] });
        await loadLeads();
    }
}

// Load settings
async function loadSettings() {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
    const settings = result[STORAGE_KEYS.SETTINGS] || {};
    
    // Apply settings to UI
    document.getElementById('apiUrl').value = settings.apiUrl || API_BASE_URL;
    document.getElementById('autoCapture').checked = settings.autoCapture !== false;
    document.getElementById('aiInsights').checked = settings.aiInsights !== false;
    document.getElementById('humanTiming').checked = settings.humanLikeDelay !== false;
    
    // Initialize settings buttons
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('exportBtn').addEventListener('click', exportLeads);
}

// Save settings
async function saveSettings() {
    const settings = {
        apiUrl: document.getElementById('apiUrl').value || API_BASE_URL,
        autoCapture: document.getElementById('autoCapture').checked,
        aiInsights: document.getElementById('aiInsights').checked,
        humanLikeDelay: document.getElementById('humanTiming').checked,
        enabled: true
    };
    
    await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: settings });
    alert('Settings saved!');
}

// Export leads as JSON
async function exportLeads() {
    const result = await chrome.storage.local.get(STORAGE_KEYS.LEADS);
    const leads = result[STORAGE_KEYS.LEADS] || [];
    
    const dataStr = JSON.stringify(leads, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurareach-leads-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}
