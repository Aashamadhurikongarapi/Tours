const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require('cors');
const vendorRoutes = require('./routes/vendor');
const userRoutes = require('./routes/user');

const app = express();

const port = 4000;
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/vendor', vendorRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log("Successfully connected to MongoDB"))
    .catch((error)=>console.log(error))

app.listen(4000, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/', (req, res) => {
    res.send("WELCOME TO TRAVEL_TOURS");
});
