import CONFIG from "./config.js"

const apiKey = CONFIG.apiKey;

async function getSummary(text, userPrompt = "") {
  const baseInstruction = userPrompt
    ? userPrompt
    : "Summarize the following in 3-5 plain simple sentences anyone can understand"

  const fullPrompt = `${baseInstruction}. Reply with plain text only, no markdown, no headings, no bullet points. Text to summarize: ${text}`

	const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
  },
  body: JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
  { 
    role: "user", 
    content: fullPrompt
  }
]
  })

})
	let data = await response.json();
	const result = data.content?.[0]?.text ?? "No Summary Provided";
	return result;
}

const data = await getSummary(`If for some reason you don't see a toggle in the new Outlook for Windows, try these troubleshooting steps:

Make sure you try to launch classic Outlook for Windows from the Windows Start Menu, not the new Outlook for Windows. The classic Outlook for Windows is referenced as "Outlook (classic)" in the app list. 

From the Windows Start Menu, type "Registry Editor" in the search box and select the Registry Editor app.

Navigate to the following path: Computer/HKEY_CURRENT_USER/Software/Microsoft/Office/16.0/Outlook/Preferences

Scroll to the bottom of the list to and double click on UseNewOutlook.

Enter 0 in the Value Data field.

Attempt to launch classic Outlook for Windows from the Windows Start Menu.`, "What am i supposed to do with this");
console.log(data);