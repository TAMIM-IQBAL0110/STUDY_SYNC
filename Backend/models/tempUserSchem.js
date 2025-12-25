import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    createAt: {type: Date, default:Date.now,expires:900} // auto delete after 15 minutes
});

export default mongoose.model("TempUser",tempUserSchema);