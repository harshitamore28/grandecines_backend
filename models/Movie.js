const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  name: { type: String, required: true },
  poster: { type: String, required: true }, // URL
  public_id: { type: String, required: true }, // Cloudinary public ID
  releaseType:{type:String, enum: ['now','upcoming'], required: true },
  rating: { type: Number},
  timings: { type: [String]},
  release:{type: Date}
});

module.exports = mongoose.model('Movie', movieSchema);
