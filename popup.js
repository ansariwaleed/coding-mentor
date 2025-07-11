class CodingMentorPopup {
    constructor() {
        this.currentQuestion = '';
        this.currentHintLevel = 0;
        this.maxHintLevel = 3;
        this.hintLevels = ['general', 'specific', 'example'];
        this.apiKey = '';
        this.mode = 'auto';
        
        this.initializeElements();
        this.loadStoredData();
        this.bindEvents();
    }

    initializeElements() {
        this.elements = {
            apiKeySection: document.getElementById('apiKeySection'),
            apiKeyInput: document.getElementById('apiKeyInput'),
            saveApiKeyBtn: document.getElementById('saveApiKey'),
            autoModeBtn: document.getElementById('autoMode'),
            manualModeBtn: document.getElementById('manualMode'),
            statusMessage: document.getElementById('statusMessage'),
            questionDisplay: document.getElementById('questionDisplay'),
            autoModeControls: document.getElementById('autoModeControls'),
            manualModeControls: document.getElementById('manualModeControls'),
            extractBtn: document.getElementById('extractBtn'),
            manualInput: document.getElementById('manualInput'),
            submitManualBtn: document.getElementById('submitManualBtn'),
            hintLevel: document.getElementById('hintLevel'),
            chatContainer: document.getElementById('chatContainer'),
            nextHintBtn: document.getElementById('nextHintBtn'),
            resetHintsBtn: document.getElementById('resetHintsBtn'),
            clearChatBtn: document.getElementById('clearChatBtn')
        };
    }

    async loadStoredData() {
        try {
            const data = await chrome.storage.local.get(['apiKey', 'chatHistory', 'currentQuestion', 'currentHintLevel']);
            
            if (data.apiKey) {
                this.apiKey = data.apiKey;
                this.elements.apiKeySection.classList.add('hidden');
            }
            
            if (data.currentQuestion) {
                this.currentQuestion = data.currentQuestion;
                this.updateQuestionDisplay();
            }
            
            if (data.currentHintLevel !== undefined) {
                this.currentHintLevel = data.currentHintLevel;
                this.updateHintLevel();
            }
            
            if (data.chatHistory) {
                this.loadChatHistory(data.chatHistory);
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }

    bindEvents() {
        this.elements.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.elements.autoModeBtn.addEventListener('click', () => this.switchMode('auto'));
        this.elements.manualModeBtn.addEventListener('click', () => this.switchMode('manual'));
        this.elements.extractBtn.addEventListener('click', () => this.extractQuestion());
        this.elements.submitManualBtn.addEventListener('click', () => this.submitManualQuestion());
        this.elements.nextHintBtn.addEventListener('click', () => this.getNextHint());
        this.elements.resetHintsBtn.addEventListener('click', () => this.resetHints());
        this.elements.clearChatBtn.addEventListener('click', () => this.clearChat());
        
        this.elements.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });
        
        this.elements.manualInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.submitManualQuestion();
        });
    }

    async saveApiKey() {
        const apiKey = this.elements.apiKeyInput.value.trim();
        if (!apiKey) {
            this.showStatus('Please enter a valid API key', 'error');
            return;
        }

        this.apiKey = apiKey;
        await chrome.storage.local.set({ apiKey });
        this.elements.apiKeySection.classList.add('hidden');
        this.showStatus('API key saved successfully!', 'success');
    }

    switchMode(mode) {
        this.mode = mode;
        
        if (mode === 'auto') {
            this.elements.autoModeBtn.classList.add('active');
            this.elements.manualModeBtn.classList.remove('active');
            this.elements.autoModeControls.classList.remove('hidden');
            this.elements.manualModeControls.classList.add('hidden');
        } else {
            this.elements.manualModeBtn.classList.add('active');
            this.elements.autoModeBtn.classList.remove('active');
            this.elements.manualModeControls.classList.remove('hidden');
            this.elements.autoModeControls.classList.add('hidden');
        }
    }

    async extractQuestion() {
        if (!this.apiKey) {
            this.showStatus('Please set your API key first', 'error');
            return;
        }

        this.elements.extractBtn.disabled = true;
        this.elements.extractBtn.textContent = 'Extracting...';
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractQuestion' });
            
            if (response && response.success) {
                this.currentQuestion = response.question;
                this.updateQuestionDisplay();
                this.addChatMessage('user', `New question: ${this.currentQuestion}`);
                this.resetHints();
                this.showStatus('Question extracted successfully!', 'success');
                await this.saveCurrentState();
            } else {
                this.showStatus(response?.error || 'Failed to extract question from current page', 'error');
            }
        } catch (error) {
            console.error('Error extracting question:', error);
            this.showStatus('Error extracting question. Make sure you\'re on a supported coding platform.', 'error');
        } finally {
            this.elements.extractBtn.disabled = false;
            this.elements.extractBtn.textContent = 'Extract Question';
        }
    }

    async submitManualQuestion() {
        const question = this.elements.manualInput.value.trim();
        if (!question) {
            this.showStatus('Please enter a question', 'error');
            return;
        }

        if (!this.apiKey) {
            this.showStatus('Please set your API key first', 'error');
            return;
        }

        this.currentQuestion = question;
        this.updateQuestionDisplay();
        this.addChatMessage('user', question);
        this.resetHints();
        this.elements.manualInput.value = '';
        this.showStatus('Question submitted successfully!', 'success');
        await this.saveCurrentState();
    }

    async getNextHint() {
        if (!this.apiKey) {
            this.showStatus('Please set your API key first', 'error');
            return;
        }

        if (!this.currentQuestion) {
            this.showStatus('Please extract or enter a question first', 'error');
            return;
        }

        if (this.currentHintLevel >= this.maxHintLevel) {
            this.showStatus('All hints have been provided', 'info');
            return;
        }

        this.elements.nextHintBtn.disabled = true;
        this.elements.nextHintBtn.textContent = 'Getting hint...';

        try {
            const hintType = this.hintLevels[this.currentHintLevel];
            const hint = await this.requestHint(this.currentQuestion, hintType);
            
            this.addChatMessage('assistant', hint);
            this.currentHintLevel++;
            this.updateHintLevel();
            await this.saveCurrentState();
        } catch (error) {
            console.error('Error getting hint:', error);
            this.addChatMessage('error', 'Error getting hint. Please try again.');
            this.showStatus('Error getting hint from API', 'error');
        } finally {
            this.elements.nextHintBtn.disabled = false;
            this.elements.nextHintBtn.textContent = 'Next Hint';
        }
    }

    async requestHint(question, hintType) {
        const prompt = this.createPrompt(question, hintType);
        
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + this.apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('API key is invalid or has insufficient permissions');
            } else if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`API request failed with status ${response.status}`);
            }
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format from API');
        }
    }

    createPrompt(question, hintType) {
        const basePrompt = `You are a coding mentor helping a student solve the following problem:\n\n${question}\n\n`;
        
        switch (hintType) {
            case 'general':
                return basePrompt + 'Provide a general hint about the approach or algorithm needed to solve this problem. Don\'t give away the solution, but point them in the right direction. Keep it concise and encouraging.';
            case 'specific':
                return basePrompt + 'Provide a more specific hint about the implementation details or key insights needed. You can mention specific data structures or techniques, but still don\'t give the complete solution.';
            case 'example':
                return basePrompt + 'Provide a detailed example or pseudocode that shows how to approach this problem. You can be quite specific now, but still encourage the student to implement it themselves.';
            default:
                return basePrompt + 'Provide a helpful hint to solve this problem.';
        }
    }

    resetHints() {
        this.currentHintLevel = 0;
        this.updateHintLevel();
        this.saveCurrentState();
    }

    async clearChat() {
        this.elements.chatContainer.innerHTML = `
            <div class="chat-message assistant">
                Hello! I'm your coding mentor. Extract a question or enter one manually, and I'll provide progressive hints to help you solve it step by step.
            </div>
        `;
        this.currentQuestion = '';
        this.currentHintLevel = 0;
        this.updateQuestionDisplay();
        this.updateHintLevel();
        await chrome.storage.local.remove(['chatHistory', 'currentQuestion', 'currentHintLevel']);
    }

    updateQuestionDisplay() {
        if (this.currentQuestion) {
            this.elements.questionDisplay.textContent = this.currentQuestion;
            this.elements.questionDisplay.classList.remove('empty');
            this.elements.nextHintBtn.disabled = false;
        } else {
            this.elements.questionDisplay.textContent = 'No question extracted yet. Click "Extract Question" to get started.';
            this.elements.questionDisplay.classList.add('empty');
            this.elements.nextHintBtn.disabled = true;
        }
    }

    updateHintLevel() {
        if (this.currentHintLevel === 0) {
            this.elements.hintLevel.textContent = 'Ready for hints';
        } else if (this.currentHintLevel >= this.maxHintLevel) {
            this.elements.hintLevel.textContent = 'All hints provided';
            this.elements.nextHintBtn.disabled = true;
        } else {
            this.elements.hintLevel.textContent = `Hint level: ${this.currentHintLevel}/${this.maxHintLevel}`;
        }
    }

    addChatMessage(type, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.textContent = message;
        this.elements.chatContainer.appendChild(messageDiv);
        this.elements.chatContainer.scrollTop = this.elements.chatContainer.scrollHeight;
        
        this.saveChatHistory();
    }

    async saveChatHistory() {
        const messages = Array.from(this.elements.chatContainer.children).map(msg => ({
            type: msg.className.replace('chat-message ', ''),
            text: msg.textContent
        }));
        await chrome.storage.local.set({ chatHistory: messages });
    }

    loadChatHistory(history) {
        this.elements.chatContainer.innerHTML = '';
        history.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${msg.type}`;
            messageDiv.textContent = msg.text;
            this.elements.chatContainer.appendChild(messageDiv);
        });
        this.elements.chatContainer.scrollTop = this.elements.chatContainer.scrollHeight;
    }

    async saveCurrentState() {
        await chrome.storage.local.set({
            currentQuestion: this.currentQuestion,
            currentHintLevel: this.currentHintLevel
        });
    }

    showStatus(message, type) {
        this.elements.statusMessage.textContent = message;
        this.elements.statusMessage.className = `status ${type}`;
        this.elements.statusMessage.classList.remove('hidden');
        
        setTimeout(() => {
            this.elements.statusMessage.classList.add('hidden');
        }, 3000);
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CodingMentorPopup();
});