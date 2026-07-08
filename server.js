import express from 'express'

const app = express()
app.use(express.json())

const PORT = 3001

// handle the api request from the front end
app.post("/api/gift", (req, res) => {
    const { userPrompt } = req.body 
    console.log(userPrompt)

    res.json({ message: `You asked for: "${userPrompt}" ` })
})

app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}`)
})