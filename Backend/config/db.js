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
        
        console.log("🔄 Attempting MongoDB connection...");
        await mongoose.connect(process.env.MONGO_URL, {
            connectTimeoutMS: 10000,
            socketTimeoutMS: 10000,
        });
        isConnected = true;
        console.log("✅ MongoDB connected successfully");
    }
    catch(error){
        console.error("❌ MongoDB connection failed:", error.message);
        isConnected = false;
        // Retry connection after 5 seconds
        console.log("🔄 Retrying MongoDB connection in 5 seconds...");
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;