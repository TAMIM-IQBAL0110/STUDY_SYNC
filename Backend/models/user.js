import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: false,select:false },
  isVerified:{type: Boolean,default:false},
  profileImageUrl: { type: String, default: null },
  bio: { type: String, default: '' }
}, { timestamps: true });

// hash password before saving
userSchema.pre("save",async function (next){
  // only hash if password is changed
  if(!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password,salt);
  next();
});

// compare password 
userSchema.methods.comparePassword = async function (enteredPassword){
  return await bcrypt.compare(enteredPassword,this.password);
}


export default mongoose.model("User",userSchema);