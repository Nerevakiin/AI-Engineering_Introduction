import express from 'express'
import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Check that environment variables are configured
 */
function checkEnvironment() {
  if (!process.env.AI_URL) {
    throw new Error(
      "Missing AI_URL. This tells us which AI provider you're using."
    );
  }
  if (!process.env.AI_MODEL) {
    throw new Error("Missing AI_MODEL. The AI request needs a model name.");
  }
  if (!process.env.AI_KEY) {
    throw new Error("Missing AI_KEY. Your API key is not being picked up.");
  }
  console.log("AI provider URL:", process.env.AI_URL);
  console.log("AI model:", process.env.AI_MODEL);
}


const app = express()
app.use(express.json())

dotenv.config()

const PORT = 3001


// Serve the front end files specifically! IMPORTANT!
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})
app.get("/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "style.css"))
})
app.get("/index.js", (req, res) => {
  res.sendFile(path.join(__dirname, "index.js"));
});
app.get("/utils.js", (req, res) => {
  res.sendFile(path.join(__dirname, "utils.js"));
});



// Initialize an OpenAI client for your provider using env vars
const openai = new OpenAI({
    apiKey: process.env.AI_KEY,
    baseURL: process.env.AI_URL
    // dangerouslyAllowBrowser: true,
});

// Initialize messages array with system prompt
const messages = [
    {
        role: "system",
        content: `You are the Gift Genie!
    Make your gift suggestions thoughtful and practical.
    The user will describe the gift's recipient. 
    Your response must be in structured Markdown. 
    Skip intros and conclusions. 
    Only output gift suggestions.
    Enforce the following structure for every response:
    1. Every gift should have a clear heading title.
    2. Every gift should have a short and clear explaination on the why each gift is right for the person given.
    3. End every response with a "Questions for you" h2 heading section with a follow-up question that would help improve recommendations
    
    Take close attention to the context given. Be aware of user's limitations and restrictions.
    If a location or constraint is mentioned, adapt the ideas
    If there are specific constrained mentioned or implied, Add a short section under each gift that guides the user on how to get the gift in that constrained context.`,
    },

    // "Few Shot Prompting" or "Examples" is injecting into the first message and system prompt a mock conversation that
    // looks like it's already ongoing in order to show to the model what an appropriate and good response really looks like.
    {
        role: "user",
        content: `dubai airport. last minute gifts for niece (arts & crafts) and nephew who loves football`
    },
    {
        role: "assistant",
        content: `
    ### Travel Art Kit for Niece (Compact & Portable)

      A small, kid-friendly arts & crafts item that's easy to pack and perfect for a quick creative distraction during travel.

      **How to get it:**
      1. Head to Dubai International Airport (DXB) and proceed to Terminal 3 Departures.
      2. Visit Dubai Duty Free or a nearby WHSmith that carries kids’ stationery.
      3. Ask for compact arts & crafts kits or a coloring book with pencils.
      4. Choose a lightweight option suitable for carry-on.
      5. Request gift wrapping if available.

      ---

      ### Mini Football Keychain for Nephew

      A light, inexpensive football-themed souvenir that’s easy to carry and perfect for an airport purchase.

      **How to get it:**
      1. Visit Dubai Duty Free or a souvenir shop near the gates.
      2. Ask for football-themed keychains or small sports souvenirs.
      3. Check toy or sports sections if needed.
      4. Purchase and pack securely.

      ---

      ## Questions for you
      1. What are the ages of your niece and nephew?
      2. Do you have a budget per gift?
      3. Are you departing from Terminal 3?
      4. Does your nephew support a specific team?
    `
    },
    {
        role: "user",
        content: "gift ideas for a big black metal fan"
    },
    {
        role: "assistant",
        content: `
    ### Vinyl Reissue of a Genre Classic

A well-pressed reissue of a foundational album — Darkthrone's *A Blaze in the Northern Sky*, Emperor's *In the Nightside Eclipse*, or Bathory's early work — feeds the collector instinct that runs deep in this scene.

---

### *Lords of Chaos* or *Black Metal: Evolution of the Cult*

*Lords of Chaos* is the notorious, sensational history of the Norwegian scene. Dayal Patterson's *Evolution of the Cult* is the deeper, more respectful oral history.

---

### High-Quality Headphones or a Turntable

The genre's raw, atmospheric production rewards good gear — layered textures and ambient passages that a phone speaker flattens. Best if they don't already have a setup.

---

### Official Band Shirt or Battle Jacket Blank

A shirt from the band's own store (never a bootleg) shows you did the homework. A blank denim or leather jacket lets them build their own battle vest over time. Caution: some bands carry ideological baggage, so know who you're buying.

---

### Atmospheric Extras — Incense, Candles, Winter Decor

The genre leans into cold, forest, and ritual imagery. Quality incense, black taper candles, or nature-themed decor works even when you're unsure of their favorite bands.

---

### Concert or Festival Tickets

An experience beats an object for a devoted fan. A local show or a destination festival becomes a memory rather than clutter.

---

## Questions for you

1. Who are their favorite bands or subgenres? (Atmospheric, raw/lo-fi, symphonic, and DSBM fans want very different things.)
2. What's your budget range?
3. Do they already collect vinyl, or have a turntable?
4. Is this someone who wears merch openly, or keeps their fandom more private?
5. Any location or date you're working around, so I can add exact buying steps?
    `
    }
];




// handle the api request from the front end
app.post("/api/gift", async (req, res) => {

    try {

        // 2. extract userPrompt from req.body and add to messages
        const { userPrompt } = req.body
        console.log("Hello from the server, this is the userprompt, and the body: ", userPrompt, req.body)

        messages.push({
            role: "user",
            content: userPrompt
        })

        // 3. send chat completions request
        const aiResponse = await openai.chat.completions.create({
            model: process.env.AI_MODEL,
            messages,
            stream: true
        })

        // Tell the browser this is a plain text stream
        res.setHeader("Content-Type", "text/plain; charset=utf-8")

        // 4. extract content and send back as json
        let giftSuggestions = ""

        for await (const chunk of aiResponse) {
            giftSuggestions += chunk.choices[0].delta.content
        }

        res.status(200).json({ giftSuggestions: giftSuggestions })


    } catch (error) {
        console.log("error when sending the ai response: ", error)
        res.status(501).json({ error: "Not implemented" });
    }

})

app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}`)
})