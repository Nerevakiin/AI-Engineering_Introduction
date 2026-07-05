import OpenAI from "openai";
import { autoResizeTextarea, checkEnvironment, setLoading } from "./utils.js";
import { marked } from 'marked'
import DOMPurify from 'dompurify'

checkEnvironment();

// Initialize an OpenAI client for your provider using env vars
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true,
});

// Get UI elements
const giftForm = document.getElementById("gift-form");
const userInput = document.getElementById("user-input");
const outputContent = document.getElementById("output-content");

function start() {
  // Setup UI event listeners
  userInput.addEventListener("input", () => autoResizeTextarea(userInput));
  giftForm.addEventListener("submit", handleGiftRequest);
}

// Initialize messages array with system prompt
const messages = [
  {
    role: "system",
    content: `You are the Gift Genie!
    Make your gift suggestions thoughtful and practical.
    Your response must be under 100 words. 
    Skip intros and conclusions. 
    Only output gift suggestions.`,
  },
];

async function handleGiftRequest(e) {
  // Prevent default form submission
  e.preventDefault();

  // Get user input, trim whitespace, exit if empty
  const userPrompt = userInput.value.trim();
  if (!userPrompt) return;



  // Set loading state
  setLoading(true);

  messages.push({
    role: "user",
    content: userPrompt
  })

  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages,
      stream: true
    })

    // The streaming process
    let giftSuggestionsStream = ""

    for await (const chunk of response) {
      giftSuggestionsStream += response.choices[0].delta.content
      const parsedResponse = marked.parse(giftSuggestionsStream)
      const sanitizedResponse = DOMPurify.sanitize(parsedResponse)
      outputContent.innerHTML = sanitizedResponse
    }

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
