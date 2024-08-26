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

import taskRouter from './routes/task.routes'
app.use("/api/v1/tasks/",taskRouter)
import userRouter from './routes/user.routes'
app.use('/user/',userRouter)
import subtaskRouter from './routes/subtask.routes'
app.use('/api/v1/subtasks/',subtaskRouter);
import workspaceRouter from './routes/workspace.routes'
app.use('/workspace/',workspaceRouter)
export {app}