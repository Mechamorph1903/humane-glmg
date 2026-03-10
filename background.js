// background.js
// This is the silent brain of the extension.
// It runs in the background even when the popup is closed.
//
// Its one job:
//   Receive text from popup.js, call the Claude API, return the summary
//
// Why here and not in popup.js?
//   Because Manifest V3 restricts where external API calls can be made.
//   background.js (the service worker) is the safe place for fetch() calls.
//
// It talks to popup.js using chrome.runtime.onMessage.addListener()
//test

// ─── LOAD API KEY FROM CONFIG ─────────────────────────────────────────────────
// config.js is gitignored - each team member has their own copy locally
// Never paste your actual API key anywhere else in the code

// TODO: import or reference CONFIG from config.js
// const API_KEY = CONFIG.apiKey
importScripts("config.js")


// ─── THE MAIN FUNCTION: GET SUMMARY FROM CLAUDE ──────────────────────────────
// This is the function the whole backend role is about.
// Receives a string of text, returns a plain-language summary string.

//I did some code to test my popups in the console
// AI SUMMARY FUNCTION
// This function sends webpage text to Claude
// and returns a plain-language summary.
//
// Called when popup.js sends:
// { type: "GET_SUMMARY", text: "..." }
//
// NOTE FOR TEAM: You can also delete all this and write your actual getsummary function.
// I just used this to test popup.jss
// This part is the AI integration layer.
// If you want to adjust prompt quality or model settings, this is the place to do it.


async function getSummary(text) {

  // Prompt sent to Claude
  const prompt =
    "Summarize the following webpage content in 3-5 plain simple sentences anyone can understand:\n\n" +
    text.substring(0, 12000)

  // Claude Messages API request
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": CONFIG.apiKey,
      "anthropic-version": "2023-06-01",
          
      // Required for Chrome extensions calling Claude directly
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  })

  const data = await response.json()

  // Helpful debug logs when creating popup.
  console.log("CLAUDE RESPONSE:", data)
  console.log("CLAUDE STATUS:", response.status)

  // Basic validation of Claude response
  if (!data || !data.content) {
    console.error("Claude raw response:", data)
    throw new Error("Claude response invalid")
}

const textBlock = data.content.find(block => block.type === "text")

if (!textBlock) {
  console.error("Claude content blocks:", data.content)
  throw new Error("Claude returned no text block")
}

// Return summary text to popup.js
return textBlock.text

}


// ─── THE SPEAK FUNCTION: READ TEXT ALOUD ─────────────────────────────────────
// Uses the browser's built-in Web Speech API - no API key needed.
// Receives a summary string and reads it aloud with controls.

function speak(text, rate = 1) {
  // TODO:
  // 1. Cancel any speech already playing
  // 2. Create a new SpeechSynthesisUtterance with the text
  // 3. Set the rate (speed) from the slider value
  // 4. Pick the most natural sounding available voice
  // 5. Call window.speechSynthesis.speak()
}

function pauseSpeech() {
  // TODO: window.speechSynthesis.pause()
}

function stopSpeech() {
  // TODO: window.speechSynthesis.cancel()
}


// ─── LISTEN FOR MESSAGES FROM POPUP.JS ───────────────────────────────────────
// popup.js sends a message with the text it wants summarized
// This listener receives it, calls getSummary(), and sends the result back

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // AI SUMMARY REQUEST
  // Called when popup.js sends page or selection text
  if (message.type === "GET_SUMMARY") {
    getSummary(message.text)
     .then(summary => {
      sendResponse({ summary })
    })
    .catch(err => {
      console.error("Claude error:", err)
      sendResponse({ summary: null })
    })
  }

  // IMPORTANT: return true to keep the message channel open for async response
  return true 
})
