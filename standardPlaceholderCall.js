import "dotenv/config"
import { checkEnvironment } from "./utils.js"
import OpenAI from 'openai'


const openai = new OpenAI({
    apiKey: process.env.AI_KEY,
    baseURL: process.env.AI_URL,
    dangerouslyAllowBrowser: true
})

checkEnvironment()

// const userPrompt = "Suggest some gifts for someone who loves outsider music like Jandek for example. Don't ask any follow-up questions. Use less than 100 words."

// const userMessage = {
//     role: "user",
//     content: userPrompt
// }



const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL,
    messages: [
        {
            role: "system",
            content: "Don't ask any follow-up questions. Use less than 100 words."
        },
        {
        role: "user",
        content: "Suggest some gifts for someone who loves black metal."
    }]
    // max_completion_tokens: 256
})

console.log(response.choices[0].message.content)