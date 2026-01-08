import mongoose from "mongoose";

const TASK_STATUS = ["Pending", "Completed"];


const taskSchema = new mongoose.Schema({
    user:{type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,},
    taskName:{type:String,required :true,trim:true,},
    category:{type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true},
    date:{type:Date,required:true},
    startTime:{type:Number, required:true},// minutes from midnight
    description:{type:String,trim:true,maxLength:100},
    status:{type:String,enum:TASK_STATUS, default:"Pending"},
    reminder:{type:Boolean,default:false}
},{timestamps:true});

export default mongoose.model("Task",taskSchema);