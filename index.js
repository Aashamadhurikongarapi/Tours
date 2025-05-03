const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const vendorRoutes = require('./routes/vendor');

const app = express();

const port = 4000;
dotenv.config();

// Middleware
app.use(express.json());

// Routes
app.use('/vendor', vendorRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log("Successfully connected to MongoDB"))
    .catch((error)=>console.log(error))

app.listen(4000, () => {
  console.log(`Server is running on port ${port}`);
});

app.use('/Home', (req, res) => {
    res.send("WELCOME TO TRAVEL_TOURS");
});
