//import necessary modules
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
//import routes
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes.js');
const userRoutes = require('./routes/userRoutes');
const queriesRoutes = require('./routes/queriesRoutes.js');
const ordersRoutes = require('./routes/ordersRoutes.js');
const foodRoutes = require('./routes/foodRoutes.js');
const notificationsRoutes = require('./routes/notificationsRoutes.js');

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/queries', queriesRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/notifications', notificationsRoutes);
// ✅ Global error handler (last middleware)
app.use(errorHandler);
//DB Connection
mongoose.connect(process.env.MONGO_URI).then(()=>{
  console.log('Connected to MongoDB');
  //Server start
  const PORT = process.env.PORT || 3000;
  app.get("/api/test", (req, res) => res.json({ message: "Hello from server!" }));
app.listen(PORT,"0.0.0.0",  () => {
  console.log(`Server running on port ${PORT}`);
});
}).catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1); // Exit the process with failure
});
// (async () => {
//   await Food.deleteMany(); // clear old data
//   await Food.insertMany(food_list);
//   console.log("Data seeded!");
//   // process.exit();
// })();

