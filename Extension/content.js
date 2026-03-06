// Content Script - Injected into LinkedIn pages

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getLeadData') {
        const leadData = extractLeadData();
        sendResponse({ leadData });
    }
});

// Extract lead information from LinkedIn profile
function extractLeadData() {
    const leadData = {
        name: '',
        role: '',
        company: '',
        email: '',
        profileUrl: window.location.href,
        recentPost: ''
    };
    
    // Check if we're on a profile page
    const isProfilePage = window.location.href.includes('/in/');
    if (!isProfilePage) {
        return leadData;
    }
    
    // Extract name - try multiple selectors (LinkedIn changes these frequently)
    const nameSelectors = [
        'h1.text-heading-xlarge',
        'h1.inline.t-24',
        '.pv-top-card--list li:first-child',
        'h1[data-anonymize="person-name"]',
        '.ph5 h1',
        'section.artdeco-card h1',
        'h1'
    ];
    
    for (const selector of nameSelectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent.trim()) {
            leadData.name = el.textContent.trim();
            break;
        }
    }
    
    // Extract role/headline - try multiple selectors
    const roleSelectors = [
        '.text-body-medium.break-words',
        'div.text-body-medium',
        '.pv-top-card--list-bullet li',
        '[data-anonymize="headline"]',
        '.ph5 .text-body-medium',
        '.pv-text-details__left-panel .text-body-medium'
    ];
    
    for (const selector of roleSelectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent.trim()) {
            leadData.role = el.textContent.trim();
            break;
        }
    }
    
    // Extract company from current position - look in experience section or headline
    const companySelectors = [
        '.pv-top-card--experience-list-item',
        '.pv-top-card-v2-ctas a[href*="company"]',
        'a[data-field="experience_company_logo"]',
        '.experience-item a[href*="company"]',
        'section[data-section="experience"] a[href*="company"]'
    ];
    
    for (const selector of companySelectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent.trim()) {
            leadData.company = el.textContent.trim();
            break;
        }
    }
    
    // Alternative: Look for company in the headline
    if (!leadData.company && leadData.role) {
        const roleText = leadData.role;
        const atIndex = roleText.lastIndexOf(' at ');
        if (atIndex !== -1) {
            leadData.company = roleText.substring(atIndex + 4).trim();
            leadData.role = roleText.substring(0, atIndex).trim();
        } else {
            // Try splitting by common patterns
            const patterns = [' @ ', ' | ', ' - '];
            for (const pattern of patterns) {
                if (roleText.includes(pattern)) {
                    const parts = roleText.split(pattern);
                    if (parts.length >= 2) {
                        leadData.role = parts[0].trim();
                        leadData.company = parts[parts.length - 1].trim();
                        break;
                    }
                }
            }
        }
    }
    
    // Try to extract email (if visible in contact info)
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (emailLink) {
        leadData.email = emailLink.href.replace('mailto:', '');
    }
    
    // Extract recent activity/post if available
    const postSelectors = [
        '.feed-shared-update-v2__description',
        '.update-components-text',
        '[data-urn*="activity"] .break-words'
    ];
    
    for (const selector of postSelectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent.trim()) {
            leadData.recentPost = el.textContent.trim().substring(0, 200);
            break;
        }
    }
    
    // Inject action button if data found
    if (leadData.name) {
        injectActionButton();
    }
    
    return leadData;
}

// Inject "Send to AuraReach" button on LinkedIn profile
function injectActionButton() {
    // Check if we're on a profile page
    if (!window.location.href.includes('/in/')) {
        return;
    }
    
    // Check if button already exists
    if (document.getElementById('aurareach-action-btn')) {
        return;
    }
    
    // Create button
    const button = document.createElement('button');
    button.id = 'aurareach-action-btn';
    button.className = 'aurareach-btn';
    button.innerHTML = '✨ Send to AuraReach';
    button.title = 'Add this lead to your AuraReach workflow';
    
    // Style the button to match LinkedIn's style
    button.style.cssText = `
        padding: 8px 16px;
        margin-left: 8px;
        margin-top: 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 24px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        display: inline-flex;
        align-items: center;
        gap: 4px;
        z-index: 9999;
    `;
    
    // Add hover effect
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
    });
    
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Extract and send lead data
        const leadData = extractLeadData();
        
        // Send to background script
        chrome.runtime.sendMessage(
            { action: 'enrollLead', leadData: leadData },
            (response) => {
                button.innerHTML = '✅ Sent!';
                button.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                setTimeout(() => {
                    button.innerHTML = '✨ Send to AuraReach';
                    button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }, 2000);
            }
        );
    });
    
    // Try multiple approaches to find the right container
    const containerSelectors = [
        // Modern LinkedIn profile action buttons
        '.pv-top-card-v2-ctas',
        '.pvs-profile-actions',
        '.pv-top-card-v3__profile-actions',
        // Older selectors
        '.pv-top-card-v2-section__actions',
        '.ph5 .mt2',
        // Generic approach - find the area with Connect/Message buttons
        '.artdeco-card .display-flex.align-items-center',
        // Fallback to profile header area
        '.scaffold-layout__main section:first-child .ph5',
        '.pv-top-card',
        'section.artdeco-card'
    ];
    
    let inserted = false;
    
    for (const selector of containerSelectors) {
        const container = document.querySelector(selector);
        if (container && !inserted) {
            try {
                // Find the Connect or Message button to insert next to
                const actionBtns = container.querySelectorAll('button');
                if (actionBtns.length > 0) {
                    const lastBtn = actionBtns[actionBtns.length - 1];
                    if (lastBtn.parentElement) {
                        lastBtn.parentElement.appendChild(button);
                        inserted = true;
                        break;
                    }
                }
                
                // If no buttons found, just append to container
                if (!inserted) {
                    container.appendChild(button);
                    inserted = true;
                    break;
                }
            } catch (error) {
                // Continue to next selector
            }
        }
    }
    
    // Ultimate fallback: append near the h1 name
    if (!inserted) {
        const nameHeading = document.querySelector('h1');
        if (nameHeading) {
            // Create a wrapper div for better positioning
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'margin-top: 8px;';
            wrapper.appendChild(button);
            
            // Try to insert after the heading's parent container
            const parentSection = nameHeading.closest('div');
            if (parentSection) {
                parentSection.appendChild(wrapper);
            }
        }
    }
}

// Watch for page changes (LinkedIn is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        // Reinject button on profile change
        setTimeout(() => {
            injectActionButton();
        }, 500);
    }
}).observe(document, { subtree: true, childList: true });

// Initial extraction and button injection
window.addEventListener('load', () => {
    setTimeout(() => {
        extractLeadData();
        injectActionButton();
    }, 1000);
});

// Reinject when DOM changes significantly
new MutationObserver(() => {
    injectActionButton();
}).observe(document.body, { 
    childList: true, 
    subtree: true 
});
