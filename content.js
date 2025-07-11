class QuestionExtractor {
    constructor() {
        this.platformSelectors = {
            'leetcode.com': {
                question: [
                    '[data-track-load="description_content"]',
                    '.question-content',
                    '[data-cy="question-detail-main-tabs"] .elfjS',
                    '.content__u3I1 .question-content',
                    '[data-track-load="description_content"] .content__u3I1',
                    '.xFUwe',
                    '.question-content .content__u3I1',
                    '.css-1jqueqk',
                    '.description__24sA'
                ],
                title: [
                    '[data-cy="question-title"]',
                    '.question-title',
                    'h1[data-cy="question-title"]',
                    '.css-v3d350',
                    '.question-title a',
                    'h1.mr-2'
                ]
            },
            'hackerrank.com': {
                question: [
                    '.problem-statement',
                    '.challenge-text',
                    '.problem-statement-text',
                    '.challenge-body-html',
                    '.problem-statement .challenge-text',
                    '.challenge-problem-statement',
                    '.problem-statement-content'
                ],
                title: [
                    '.ui-icon-heading',
                    '.challenge-title',
                    'h1.challenge-title',
                    '.challenge-title h1',
                    '.problem-title'
                ]
            },
            'checkio.org': {
                question: [
                    '.description',
                    '.mission-description',
                    '.story',
                    '.description-section',
                    '.mission-description .description',
                    '.task-description',
                    '.mission .description'
                ],
                title: [
                    '.mission-title',
                    'h1.title',
                    '.title',
                    '.mission-title h1',
                    '.task-title'
                ]
            },
            'codeforces.com': {
                question: [
                    '.problem-statement',
                    '.legend',
                    '.problem-statement .legend',
                    '.problem-statement-text',
                    '.problem-statement .header + div',
                    '.problem-statement .problem-statement-text',
                    '.ttypography'
                ],
                title: [
                    '.problem-statement .title',
                    '.header .title',
                    'h1.title',
                    '.problem-statement .header .title',
                    '.title'
                ]
            },
            'codewars.com': {
                question: [
                    '.markdown',
                    '.description',
                    '.kata-description',
                    '.markdown-prose',
                    '.description .markdown',
                    '.kata-description .markdown',
                    '.description-section'
                ],
                title: [
                    '.kata-title',
                    'h1.kata-title',
                    '.title',
                    '.kata-header .title',
                    '.kata-title h1'
                ]
            },
            'codingame.com': {
                question: [
                    '.statement',
                    '.statement-section',
                    '.problem-statement',
                    '.statement-body',
                    '.statement .statement-section',
                    '.problem-statement .statement',
                    '.statement-text'
                ],
                title: [
                    '.statement-title',
                    'h1.statement-title',
                    '.title',
                    '.statement .title',
                    '.statement-title h1'
                ]
            }
        };
        
        this.setupMessageListener();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'extractQuestion') {
                this.extractQuestion()
                    .then(result => sendResponse(result))
                    .catch(error => sendResponse({ success: false, error: error.message }));
                return true; // Indicates we will send a response asynchronously
            }
        });
    }

    async extractQuestion() {
        try {
            const hostname = window.location.hostname;
            const platform = this.detectPlatform(hostname);
            
            if (!platform) {
                throw new Error(`Unsupported platform: ${hostname}. Supported platforms: LeetCode, HackerRank, CheckiO, Codeforces, Codewars, Codingame`);
            }

            console.log(`Extracting question from ${platform}`);
            
            // Wait for page to load if needed
            await this.waitForPageLoad();

            const selectors = this.platformSelectors[platform];
            
            // Try to extract title first
            const title = await this.extractWithRetry(selectors.title, 3);
            
            // Then extract question content
            const question = await this.extractWithRetry(selectors.question, 3);

            if (!question && !title) {
                throw new Error(`Could not extract question from this page. Make sure you're on a problem page and the content has loaded.`);
            }

            const fullQuestion = this.formatQuestion(title, question, platform);
            
            console.log(`Successfully extracted question from ${platform}`);
            
            return {
                success: true,
                question: fullQuestion,
                platform: platform,
                url: window.location.href,
                title: title
            };
        } catch (error) {
            console.error('Question extraction error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    detectPlatform(hostname) {
        // Check if hostname matches any of our supported platforms
        for (const platform in this.platformSelectors) {
            if (hostname.includes(platform)) {
                return platform;
            }
        }
        return null;
    }

    async extractWithRetry(selectors, maxRetries = 3) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const text = this.extractText(selectors);
            if (text && text.length > 20) { // Ensure meaningful content
                return text;
            }
            
            if (attempt < maxRetries - 1) {
                console.log(`Extraction attempt ${attempt + 1} failed, retrying...`);
                await this.sleep(1000 * (attempt + 1)); // Progressive delay
            }
        }
        return '';
    }

    extractText(selectors) {
        if (!selectors || !Array.isArray(selectors)) {
            return '';
        }

        for (const selector of selectors) {
            try {
                const element = document.querySelector(selector);
                if (element) {
                    let text = this.getElementText(element);
                    text = this.cleanText(text);
                    
                    // Filter out very short or empty text
                    if (text.length > 20) {
                        console.log(`Found content with selector: ${selector}`);
                        return text;
                    }
                }
            } catch (error) {
                console.warn(`Error with selector ${selector}:`, error);
                continue;
            }
        }
        return '';
    }

    getElementText(element) {
        // Try different methods to get text content
        let text = '';
        
        // Method 1: textContent (most reliable)
        text = element.textContent || '';
        
        // Method 2: innerText (respects styling)
        if (!text || text.length < 20) {
            text = element.innerText || '';
        }
        
        // Method 3: innerHTML as fallback (then strip HTML)
        if (!text || text.length < 20) {
            const innerHTML = element.innerHTML || '';
            text = innerHTML.replace(/<[^>]*>/g, ' '); // Strip HTML tags
        }
        
        return text;
    }

    cleanText(text) {
        if (!text) return '';
        
        return text
            .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
            .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
            .replace(/\t/g, ' ') // Replace tabs with spaces
            .trim()
            .substring(0, 3000); // Limit length to avoid too long questions
    }

    formatQuestion(title, question, platform) {
        let formattedQuestion = '';
        
        if (title) {
            formattedQuestion += `**Problem Title:** ${title}\n\n`;
        }
        
        if (question) {
            formattedQuestion += `**Problem Description:**\n${question}`;
        }
        
        if (!formattedQuestion) {
            formattedQuestion = `Question from ${platform} (${window.location.href})`;
        }
        
        // Add platform context
        formattedQuestion += `\n\n**Platform:** ${platform}\n**URL:** ${window.location.href}`;
        
        return formattedQuestion;
    }

    async waitForPageLoad() {
        // Wait for the page to be fully loaded
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // Additional wait for dynamic content
        await this.sleep(500);
    }

    async waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Debug method to help with selector development
    debugSelectors(platform) {
        if (!this.platformSelectors[platform]) {
            console.log(`Platform ${platform} not supported`);
            return;
        }
        
        const selectors = this.platformSelectors[platform];
        console.log(`Debugging selectors for ${platform}:`);
        
        console.log('Title selectors:');
        selectors.title.forEach((selector, index) => {
            const element = document.querySelector(selector);
            console.log(`${index + 1}. ${selector} - ${element ? 'FOUND' : 'NOT FOUND'}`);
            if (element) {
                console.log(`   Text: "${element.textContent?.substring(0, 100)}..."`);
            }
        });
        
        console.log('Question selectors:');
        selectors.question.forEach((selector, index) => {
            const element = document.querySelector(selector);
            console.log(`${index + 1}. ${selector} - ${element ? 'FOUND' : 'NOT FOUND'}`);
            if (element) {
                console.log(`   Text: "${element.textContent?.substring(0, 100)}..."`);
            }
        });
    }

    // Method to test extraction on current page
    testExtraction() {
        const hostname = window.location.hostname;
        const platform = this.detectPlatform(hostname);
        
        if (platform) {
            console.log(`Testing extraction on ${platform}`);
            this.debugSelectors(platform);
            this.extractQuestion().then(result => {
                console.log('Extraction result:', result);
            });
        } else {
            console.log(`Current platform ${hostname} is not supported`);
        }
    }
}

// Initialize the question extractor
const extractor = new QuestionExtractor();

// Add debug methods to window for development
if (typeof window !== 'undefined') {
    window.codingMentorDebug = {
        testExtraction: () => extractor.testExtraction(),
        debugSelectors: (platform) => extractor.debugSelectors(platform)
    };
}

// Log that the content script is loaded
console.log('Coding Mentor Extension: Content script loaded on', window.location.hostname);