const Query = require('../models/Query');
const User = require('../models/User');
exports.postQuery = async (req, res) => {
  try {
    const newQuery = new Query({
      user: req.body.userId||null,
      type: req.body.type,
      message: req.body.message,
    });
    const myQuery = await newQuery.save();
     // Update user's queries array
    await User.findByIdAndUpdate(
      req.body.userId,
      { $push: { queries: myQuery._id } },
      { new: true }
    );

    res.status(201).json(myQuery);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.getAllQueries = async (req, res) => {
      try {
        const queries = await Query.find().populate("user", "name phone").sort({ createdAt: -1 });
        res.json(queries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch queries" });
  }
};
exports.deleteQuery = async(req,res) => {
  try {
    // Find the query first to get user information
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ error: "Query not found" });
    }

    // If query belongs to a user, remove it from user's queries array
    if (query.user) {
      await User.findByIdAndUpdate(
        query.user,
        { $pull: { queries: req.params.id } },
        { new: true }
      );
    }

    // Delete the query from queries collection
    await Query.findByIdAndDelete(req.params.id);

    res.json({ message: "Query deleted successfully" });
  } catch (err) {
    console.error("Error deleting query:", err);
    res.status(500).json({ error: "Failed to delete query" });
  }
}