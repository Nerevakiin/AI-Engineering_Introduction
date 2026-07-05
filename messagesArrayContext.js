import { checkEnvironment } from "./utils.js"
import OpenAI from "openai"

// Initialize the OpenAI client using environment variables
const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true
})

checkEnvironment();



// 1. Write the First message
const messages = [ 
  {
    role: "user",
    content: `Suggest some gifts for someone who loves hiphop music. 
    Make these suggestions thoughtful and practical. Your response 
    must be under 100 words. Skip intros and conclusions. 
    Only output gift suggestions.`
  }
]



// 2. Make the call and Send the first message and wait for response
const response = await openai.chat.completions.create({
  model: process.env.AI_MODEL,
  messages
})


// 3. Get the response and put it in a message with role of "assistant"
const responseMessage = {
    role: "assistant",
    content: response.choices[0].message.content
}

// 4. Push the response into the messages array
messages.push(responseMessage)


// 5. Create a second user message
const secondUserMessage = {
  role: "user",
  content: "make it budget friendly. Only under 40 usd"
}

// 6. Push it into the messages array
messages.push(secondUserMessage)


// 7. Make the second call and send the second message along with the first user message and assistant response 
const secondResponse = await openai.chat.completions.create({
  model: process.env.AI_MODEL,
  messages
})

// Log both the first and the second messages
console.log(response.choices[0].message.content)
console.log(secondResponse.choices[0].message.content)