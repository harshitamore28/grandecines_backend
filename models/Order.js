const mongoose = require('mongoose');
const { Schema } = mongoose;

// // Order Item Schema (subdocument)
// const orderItemSchema = new Schema({
//   name: { type: String, required: true },        // e.g. "Popcorn"
//   flavour: { type: String },               // e.g. "Cheese flavour, Large size"
//   price: { type: Number, required: true },       // price of one unit
//   qty: { type: Number, required: true },    // how many ordered
// }, { _id: false }); // prevent auto _id for subdocs

// Main Order Schema
const orderSchema = new Schema({
    orderId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // reference to User
  items: { type: Object, required: true },
  total: { type: Number,required:true},             // total price of the order
  instructions: { type: String },                      // optional instructions
  audiNumber: { type: String, enum: ['AUDI 1', 'AUDI 2'], required: true },
  seatNumber: { type: String, required: true },
  showTime: { type: String, required: true },   
  status:{type:String, enum:['PENDING','COMPLETED','CANCELLED'], default:'PENDING'},       // could be Date if you want strict
  reviewed:{type:Boolean, enum:[true,false], default:false}       // could be Date if you want strict
}, { timestamps: true }); // auto adds createdAt, updatedAt

module.exports = mongoose.model('Order', orderSchema);
