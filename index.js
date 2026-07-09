// import OpenAI from "openai";
import { autoResizeTextarea, setLoading, showStream } from "./utils.js";
// import { marked } from 'marked'
// import DOMPurify from 'dompurify'
import { marked } from "https://esm.sh/marked";
import DOMPurify from "https://esm.sh/dompurify";


/* Migrated to the backend
// Initialize an OpenAI client for your provider using env vars
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true,
});
*/

// Get UI elements
const giftForm = document.getElementById("gift-form");
const userInput = document.getElementById("user-input");
const outputContent = document.getElementById("output-content");

function start() {
  // Setup UI event listeners
  userInput.addEventListener("input", () => autoResizeTextarea(userInput));
  giftForm.addEventListener("submit", handleGiftRequest);
}

// The initial system prompt and example shot prompting obj was not commented here cuz way too big. Migrated to the backend.

async function handleGiftRequest(e) {
  // Prevent default form submission
  e.preventDefault();

  // Get user input, trim whitespace, exit if empty
  const userPrompt = userInput.value.trim();
  if (!userPrompt) return;



  // Set loading state
  setLoading(true);

  /* Migrate to the backend
  messages.push({
    role: "user",
    content: `Generate fresh gift ideas for this new user request: ${userPrompt}`
  })
  */

  try {

    // 1. send fetch request to /api/gift
    const response = await fetch('/api/gift', {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ userPrompt })
    })

    showStream()

    const data = await response.json()
    console.log("the data that we have on the font end: ", data)

    // 5. parse response and extract giftSuggestions
    const giftSuggestions = data.giftSuggestions

    // The streaming process
    // let giftSuggestionsStream = ""

    // Convert Markdown to HTML
    const parsedResponse = marked.parse(giftSuggestions)
    // Sanitize the HTML to prevent XSS attacks
    const sanitizedResponse = DOMPurify.sanitize(parsedResponse)
    // Render the result
    outputContent.innerHTML = sanitizedResponse




    // COMMENTED CODE BELOW BECAUSE OF THE MIGRATION TO THE BACKEND.
    /*
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages,
      stream: true,
      temperature: 0,
      top_p: 1,
      // tools: [{type: "web_search"}] WE CAN USE THIS USING THE 'RESPONSES' API, ITS NOT AVAILABLE LIKE THIS WITH CHAT COMPLETIONS.
      // response_format = giftSchema THIS IS HOW IT WOULD BE IF WE IMPORTED THE SCHEMA FOR JSON OUTPUTS
    })

    // An example response with the RESPONSES API
    
    const response = await openai.responses.create({
      model: process.env.AI_MODEL,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [{ type: "web_search_preview" }],
    });
    */



    // The proceedure of taking the response, turn it into Markdown, sanitize it and then present it as parsed and sanitized HTML
    // const giftSuggestions = response.choices[0].message.content
    // const parsedResponse = marked.parse(giftSuggestions)
    // const sanitizedResponse = DOMPurify.sanitize(parsedResponse)
    // outputContent.innerHTML = sanitizedResponse

  } catch (err) {
    console.error("Error sending the ai api call: ", err)
    outputContent.textContent = "There was an issue with the selected model. Change the model and try again. Technical error: " + err.message
  } finally {
    // Clear loading state
    setLoading(false);
  }
}

start();
