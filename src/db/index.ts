import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "../contants";
dotenv.config({path:'.env'})
const connectToDb =async ()=>{
    try {
        const connectionInstance =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`mongodb server connnected || DB host ${connectionInstance.connection.host}`)
    }
     catch (error) {
        console.log("mongodb connection error")
        process.exit(1)
    }
}
export default connectToDb