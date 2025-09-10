const Counter = require("../models/Counter");

async function getNextSequence(name) {
  const counter = await Counter.findOneAndUpdate(
    { id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // create if not exists
  );
  return counter.seq;
}

module.exports = getNextSequence;
