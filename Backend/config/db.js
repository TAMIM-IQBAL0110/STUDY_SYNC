import mongoose from "mongoose";
import  dotenv from "dotenv";


dotenv.config();

let isConnected = false;

const connectDB = async ()=>{
    if (isConnected) {
        console.log("MongoDB already connected");
        return;
    }
    
    try{
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL environment variable is not set");
        }
        
        await mongoose.connect(process.env.MONGO_URL);
        isConnected = true;
        console.log("✅ MongoDB connected successfully");
    }
    catch(error){
        console.error("❌ MongoDB connection failed:", error.message);
        isConnected = false;
        // Don't exit process, let the app try to reconnect
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;