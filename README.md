# Coding Mentor Chrome Extension

A minimalist and modern Chrome Extension designed to be your personal coding mentor, providing progressive hints and guidance without giving away the full solution. Built with the powerful Google Gemini API, this tool aims to foster better problem-solving skills for Python learners and beyond.

## Features

* **Intelligent Question Extraction:** Automatically detects and extracts coding problems from popular online platforms (e.g., LeetCode, HackerRank) directly from your active browser tab.

* **Flexible Manual Input:** Don't have a problem on a specific site? Simply type in any coding question, concept, or debugging query directly into the extension.

* **Progressive Hinting System:** Receive subtle, step-by-step hints that guide you towards the solution, encouraging independent thought and learning. The hints become progressively more detailed if you request more assistance.

* **Interactive Chat Interface:** A clean, scrollable chat window displays your questions and the mentor's hints, keeping a clear history of your problem-solving process.

* **Dark Theme & Minimalist Design:** A sleek, modern dark theme with a code-like text style for an comfortable and focused learning environment.

* **API Key Management:** Securely save your Google Gemini API key within the extension for seamless interaction.

* **Session Controls:**

    * **Next Hint:** Request the next level of guidance.

    * **Reset Hints:** Clear the current hint progress for the active question and start over.

    * **Clear Chat:** Erase the entire chat history.

## How It Works

The core intelligence of the Coding Mentor lies in its integration with the **Google Gemini API**. When you extract or submit a question, the extension sends your query to the Gemini model. The model is prompted to act as a coding mentor, providing hints based on the `hintLevel` and the ongoing conversation history. This ensures that the assistance is always progressive and tailored to your learning journey.

The extension is designed to be lean, focusing on the core interaction between you and the AI mentor.

## Installation & Setup

To use the Coding Mentor Chrome Extension, you'll need to load it as an unpacked extension in your Chrome browser and provide your Google Gemini API key.

1.  **Download the Code:**

    * Download the entire project folder (e.g., as a ZIP file) and extract it to a convenient location on your computer.

2.  **Get Your Google Gemini API Key:**

    * Go to the [Google AI Studio](https://aistudio.google.com/app/apikey) (or the Google Cloud Console if you prefer).

    * Create a new API key.

    * **Important:** Keep this key secure and do not share it publicly.

3.  **Load as Unpacked Extension in Chrome:**

    * Open Google Chrome.

    * Type `chrome://extensions` in the address bar and press Enter.

    * Enable **"Developer mode"** using the toggle switch in the top right corner.

    * Click on **"Load unpacked"** button.

    * Navigate to the folder where you extracted the extension code (the folder containing `manifest.json`, `popup.html`, `popup.js`, etc.).

    * Select that folder and click "Select Folder".

    * The "Coding Mentor" extension icon should now appear in your browser's toolbar. You might need to click the puzzle piece icon and "pin" it for easy access.

4.  **Configure API Key in the Extension:**

    * Click on the "Coding Mentor" extension icon in your Chrome toolbar.

    * In the pop-up window, enter your Google Gemini API key into the input field.

    * Click "Save API Key". Your key will be securely stored locally.

## Usage

1.  **Open the Extension:** Click the "Coding Mentor" icon in your Chrome toolbar.

2.  **Select Mode:**

    * **Auto Extract (Default):** Navigate to a coding problem website (e.g., LeetCode). Click the "Extract Question" button. The extension will attempt to pull the problem description into the "Question Display" area.

    * **Manual Input:** If you're not on a specific problem page, or want to ask a general coding question, switch to "Manual Input" mode. Type your question into the text area and click "Submit Question".

3.  **Get Hints:**

    * Once a question is loaded, click the "Next Hint" button. The AI mentor will provide a subtle hint in the chat window.

    * Keep clicking "Next Hint" to receive more detailed guidance if needed.

4.  **Manage Your Session:**

    * **Reset Hints:** If you want to try a different approach or feel stuck, click "Reset Hints" to clear the current hint level and start fresh for the same question.

    * **Clear Chat:** Use "Clear Chat" to wipe the entire conversation history.

## Future Enhancements & Refinement

This project is a work in progress, and I'm continuously looking for ways to improve it. Planned future enhancements and areas for refinement include:

* **Improved Question Extraction:** Enhance the accuracy and compatibility of question extraction across a wider range of coding platforms.

* **Code Formatting in Chat:** Implement syntax highlighting and better formatting for code snippets within the chat messages.

* **User Feedback & Rating:** Allow users to rate hints or provide feedback to help improve the mentor's responses.

* **Customizable Hint Levels:** Offer options for users to define how subtle or detailed they want the hints to be.

* **Offline Capability (Limited):** Explore caching mechanisms for basic functionality.

* **More Robust Error Handling:** Provide more user-friendly messages for API errors or network issues.

## Technologies Used

* **HTML5:** Structure of the extension's UI.

* **CSS3:** Styling and layout, including a custom dark theme.

* **JavaScript (ES6+):** Core logic, DOM manipulation, and API integration.

* **Google Gemini API:** The generative AI model providing the mentoring intelligence.

* **Chrome Extension APIs:** For browser interaction (e.g., `chrome.tabs`, `chrome.scripting`, `chrome.storage.local`).

* **Google Fonts:** `Inter` for primary text and `Fira Code`/`JetBrains Mono` for code-like text.

## Contributing

Contributions are welcome! If you have suggestions for features, bug fixes, or design improvements, please feel free to open an issue or submit a pull request.

## License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE)
