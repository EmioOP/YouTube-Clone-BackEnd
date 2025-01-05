import { DB_NAME } from "../constants.js";
import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`MongoDB connection failed`,error.message)
        process.exit(1)
    }
}

export default connectDB