import { checkEnvironment } from "./utils.js"
import OpenAI from "openai"

// Initialize the OpenAI client using environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true
})

checkEnvironment();


const messages = [ 
  {
    role: "user",
    content: `Suggest some gifts for someone who loves hiphop music. 
    Make these suggestions thoughtful and practical. Your response 
    must be under 100 words. Skip intros and conclusions. 
    Only output gift suggestions.`
  }
]





const response = await openai.chat.completions.create({
  model: process.env.AI_MODEL,
  messages
})


const responseMessage = {
    role: "assistant",
    content: response.choices[0].message.content
}

messages.push(responseMessage)

const secondUserMessage = {
  role: "user",
  content: "make it budget friendly. Only under 40 usd"
}

messages.push(secondUserMessage)

const secondResponse = await openai.chat.completions.create({
  model: process.env.AI_MODEL,
  messages
})

// Extract the model's generated text from the response
console.log(response.choices[0].message.content)
console.log(secondResponse.choices[0].message.content)