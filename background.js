// Service Worker for the Coding Mentor Extension
class CodingMentorBackground {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                console.log('Coding Mentor Extension installed');
                this.initializeExtension();
            } else if (details.reason === 'update') {
                console.log('Coding Mentor Extension updated');
                this.handleUpdate();
            }
        });

        // Handle messages from content scripts and popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Indicates we will send a response asynchronously
        });

        // Handle tab updates to inject content script if needed
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.handleTabUpdate(tabId, tab);
            }
        });
    }

    async initializeExtension() {
        try {
            // Initialize default settings
            const defaultSettings = {
                hintLevel: 0,
                maxHintLevel: 3,
                chatHistory: [],
                currentQuestion: '',
                lastUsed: Date.now()
            };

            // Only set defaults if they don't exist
            const existing = await chrome.storage.local.get(Object.keys(defaultSettings));
            const toSet = {};
            
            for (const [key, value] of Object.entries(defaultSettings)) {
                if (existing[key] === undefined) {
                    toSet[key] = value;
                }
            }

            if (Object.keys(toSet).length > 0) {
                await chrome.storage.local.set(toSet);
            }

            console.log('Extension initialized successfully');
        } catch (error) {
            console.error('Error initializing extension:', error);
        }
    }

    async handleUpdate() {
        try {
            // Handle any migration or cleanup tasks on update
            console.log('Extension updated successfully');
        } catch (error) {
            console.error('Error handling update:', error);
        }
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'checkPlatform':
                    sendResponse(await this.checkPlatform(sender.tab));
                    break;
                
                case 'validateApiKey':
                    sendResponse(await this.validateApiKey(request.apiKey));
                    break;
                
                case 'logError':
                    this.logError(request.error, sender.tab);
                    sendResponse({ success: true });
                    break;
                
                case 'updateBadge':
                    this.updateBadge(request.text, sender.tab.id);
                    sendResponse({ success: true });
                    break;
                
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async checkPlatform(tab) {
        const supportedPlatforms = [
            'leetcode.com',
            'hackerrank.com',
            'checkio.org',
            'codeforces.com',
            'codewars.com',
            'codingame.com'
        ];

        if (!tab || !tab.url) {
            return { supported: false, platform: null };
        }

        const hostname = new URL(tab.url).hostname;
        const platform = supportedPlatforms.find(p => hostname.includes(p));

        return {
            supported: !!platform,
            platform: platform || null,
            url: tab.url
        };
    }

    async validateApiKey(apiKey) {
        try {
            // Test the API key with a simple request
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: 'Hello, can you respond with just "API key is valid"?'
                            }]
                        }],
                        generationConfig: {
                            maxOutputTokens: 10,
                        }
                    })
                }
            );

            return {
                valid: response.ok,
                status: response.status,
                error: response.ok ? null : await response.text()
            };
        } catch (error) {
            return {
                valid: false,
                status: 0,
                error: error.message
            };
        }
    }

    logError(error, tab) {
        console.error('Extension Error:', {
            error: error,
            tab: tab ? { id: tab.id, url: tab.url } : null,
            timestamp: new Date().toISOString()
        });
    }

    updateBadge(text, tabId) {
        if (chrome.action && chrome.action.setBadgeText) {
            chrome.action.setBadgeText({
                text: text || '',
                tabId: tabId
            });
        }
    }

    async handleTabUpdate(tabId, tab) {
        try {
            const platformCheck = await this.checkPlatform(tab);
            
            if (platformCheck.supported) {
                // Update badge to show the extension is active on this platform
                this.updateBadge('✓', tabId);
            } else {
                // Clear badge on unsupported sites
                this.updateBadge('', tabId);
            }
        } catch (error) {
            console.error('Error handling tab update:', error);
        }
    }

    // Cleanup method for when the extension is disabled/uninstalled
    async cleanup() {
        try {
            // Clear all badges
            if (chrome.action && chrome.action.setBadgeText) {
                const tabs = await chrome.tabs.query({});
                for (const tab of tabs) {
                    chrome.action.setBadgeText({ text: '', tabId: tab.id });
                }
            }
            
            console.log('Extension cleanup completed');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}

// Initialize the background script
new CodingMentorBackground();

// Handle extension lifecycle
chrome.runtime.onSuspend.addListener(() => {
    console.log('Extension being suspended');
});

// Clean up on extension disable/uninstall
chrome.management.onDisabled.addListener((info) => {
    if (info.id === chrome.runtime.id) {
        console.log('Extension disabled, performing cleanup');
    }
});

// Handle browser startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Browser startup detected');
});