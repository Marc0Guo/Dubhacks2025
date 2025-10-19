inject.js
🧩 Smart Element Context Picker (LLM-Friendly)
Overview
This script lets you select any element on a live webpage and capture its context (text, nearby elements, hierarchy, CSS path, etc.) in a structured JSON format that is easy to send to an LLM or backend API.
It is useful for:
Building AI agents that understand webpages
Collecting context for DOM explanation or automation
Debugging or training data collection for web assistants
How to Use
Open the target webpage.
Open Developer Console (Ctrl+Shift+I or Cmd+Option+I).
Paste the entire script into the console and press Enter.
Move your mouse — hovered elements will be highlighted.
Click any element → the structured context is captured.
View it in:
The console log
The global variable: window.__lastPickedElement
Press ESC to stop the picker.
Output Example
{
  "page": {
    "title": "Amazon Bedrock | us-east-1",
    "url": "https://us-east-1.console.aws.amazon.com/bedrock/home",
    "capturedAt": "2025-10-19T06:16:30.932Z"
  },
  "element": {
    "text": "Chat / Text playground",
    "htmlSnippet": "<span class='awsui_link-text_eymn4_rug8v_6'>Chat / Text playground</span>",
    "cssPath": "div#:r48: > ul > li:nth-child(1) > a > span",
    "tagName": "SPAN"
  },
  "context": {
    "nearestHeading": null,
    "previousBlock": null,
    "nextBlock": "Image / Video playground",
    "ancestorSummary": "Chat / Text playground — Image / Video playground — Watermark detection"
  }
}
Integration Example
// Example: send to your LLM or backend API
fetch("https://your-server.com/api/element", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify(window.__lastPickedElement)
});
Key Features
🖱️ Hover highlight & click capture
🧠 JSON output designed for LLM input
🧩 Includes DOM structure, nearby content, and metadata
💾 Accessible anytime via window.__lastPickedElement
🔒 Safe — runs only in your browser, reads no private data