const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // URL
  price: { type: Number, required: true }, // Cloudinary public ID
  description:{type:String, required: true },
  category: { type: String, required: true },
  status:{type:Boolean, enum:[true,false], default:true}
});

module.exports = mongoose.model('Food', foodSchema);