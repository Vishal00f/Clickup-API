import express from "express" ;
import cookieParser from "cookie-parser"
import cors from 'cors'

const app =express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb" }))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import taskRouter from './routes/task.route'
app.use("/api/v1/tasks/",taskRouter)
import userRouter from './routes/user.route'
app.use('/user/',userRouter)
export {app}