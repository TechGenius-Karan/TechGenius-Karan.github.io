import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema({
  text: {type:String, required:true},
  author: {type:String, required:true},
  category: {type:String, required:true}
});

export default mongoose.model("Quote", quoteSchema);
