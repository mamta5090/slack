import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import userRouter from './router/user.route.js'
import cookieParser from 'cookie-parser'
import conversationRoute from './router/conversation.route.js'
import messageRoute from './router/message.route.js'

dotenv.config()

const app = express();
app.use(cors({
    origin: "http://localhost:5173",  
    credentials: true
}))

app.use(express.json());
app.use(cookieParser())

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("server is running")
})

app.use("/api/user", userRouter)
app.use("/api/conversation",conversationRoute)
app.use("/api/message",messageRoute)

connectDB();

app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`)
})
