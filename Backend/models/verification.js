import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 900 }, // 900s = 15 minutes
});

export default mongoose.model("Verification", verificationSchema);