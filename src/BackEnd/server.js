// server.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer'); // to handle image uploads
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // to allow frontend communication
const axios = require('axios');
const FormData = require('form-data');
const app = express();
const PORT = process.env.PORT || 4000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://Admin:Admin@cluster0.uxdft.mongodb.net/DB11', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// User Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true }, // Added password field
  phone: { type: String, default: null }, // Phone can be null
  balance: { type: Number, default: 5, min: 0, integer: true }, // Default 5, must be int
  faceEncoding: { type: Array, required: true },
  registrationDate: { type: Date, default: Date.now }
});

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, // 'top-up' or 'deduction'
  amount: Number,
  status: String, // 'success' or 'failed'
  time_stamp: { type: Date, default: Date.now },
});

const TripHistorySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bus_number: String,
  route: String,
  departure: String,
  arrival: String,
  price: Number,
  timestamp: { type: Date, default: Date.now },
});

// New GTFS Models
const Route = mongoose.model("Route", new mongoose.Schema({
  route_id: String,
  route_short_name: String,
  route_long_name: String
}));

const Stop = mongoose.model("Stop", new mongoose.Schema({
  stop_id: String,
  stop_name: String,
  stop_lat: Number,
  stop_lon: Number,
  routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }] // Array of routes serving this stop
}));


// New API Endpoints for GTFS
app.get("/api/gtfs/routes", async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch routes" });
  }
});

app.get("/api/gtfs/stops", async (req, res) => {
  try {
    const stops = await Stop.find();
    res.json(stops);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stops" });
  }
});

app.get("/api/gtfs/search", async (req, res) => {
  try {
    const searchTerm = req.query.q;
    
    // Search stops
    const stops = await Stop.find({ 
      stop_name: { $regex: searchTerm, $options: 'i' } 
    });
    
    // Search routes
    const routes = await Route.find({
      $or: [
        { route_long_name: { $regex: searchTerm, $options: 'i' } },
        { route_short_name: { $regex: searchTerm, $options: 'i' } }
      ]
    });
    
    // Process results
    const results = {
      stops: stops.map(stop => ({
        id: stop._id,
        name: stop.stop_name,
        type: 'stop'
      })),
      routes: routes.map(route => ({
        id: route._id,
        name: route.route_long_name,
        shortName: route.route_short_name,
        type: 'route'
      }))
    };
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const TripHistory = mongoose.model('TripHistory', TripHistorySchema);

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });


// Example of how to update the register endpoint in your Node.js server
app.post('/api/user-register', upload.single('image'), async (req, res) => {
  try {
    const { name,password,phone } = req.body;
    const email = req.body.email || `user_${Date.now()}@example.com`; // Default email
    const imagePath = req.file.path;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    console.log(`Processing registration for ${name} with email ${email}`);
    console.log(`Image saved at: ${imagePath}`)
    
    // Create form data for Python API
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    console.log('Sending image to Python API for face encoding...');
    
    const response = await axios.post('http://localhost:5001/api/encode-face', formData, {
      headers: formData.getHeaders()
    });

    // Check if the Python API returned an encoding
    if (response.data.error || !response.data.encoding) {
      console.error("Face encoding failed:", response.data.error || "No encoding returned");
      return res.status(400).json({ message: "Face encoding failed" });
    }

    const faceEncoding = response.data.encoding;
    console.log("Received face encoding:", faceEncoding); // ✅ Check this output
    
    // Create new user with face encoding
    const newUser = new User({
      name,
      email, 
      password, // Ensure password is provided, will be hashed automatically
      phone: phone || null, // Allow phone to be null
      balance: 5, // Default balance as integer
      faceEncoding
    });
    
    await newUser.save();
    
    // Clean up the uploaded file
    fs.unlinkSync(imagePath);
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: newUser._id
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.get('/api/register-user/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  
  res.json({ success: true, user });
});

app.get('/api/register-user', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from MongoDB
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.post('/api/verify-face', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // Retrieve all stored encodings from the database
    const users = await User.find({}, { _id: 1, faceEncoding: 1 });

    // Add validation and logging
    console.log(`Found ${users.length} users with face encodings`);
    
    // Filter out any invalid encodings
    const validUsers = users.filter(user => {
      const isValid = Array.isArray(user.faceEncoding) && 
                      user.faceEncoding.length === 128 &&
                      user.faceEncoding.every(val => typeof val === 'number');
      
      if (!isValid) {
        console.log(`User ${user._id} has invalid encoding:`, user.faceEncoding);
      }
      
      return isValid;
    });
    
    console.log(`${validUsers.length} users have valid encodings`);
    // Prepare data to send
    const encodings = users.map(user => user.faceEncoding); // Extract all face encodings
    const userIds = users.map(user => user._id.toString());  // Convert ObjectId to string

    // Debug output
    console.log("First encoding sample:", encodings[0] ? encodings[0].slice(0, 5) : "None");
    
    // Send the image and all stored encodings to the Python API for comparison
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));  // Image file
    formData.append('encodings', JSON.stringify(encodings));   // All stored encodings
    formData.append('userIds', JSON.stringify(userIds));       // User IDs

    const response = await axios.post('http://localhost:5001/api/compare-faces', formData, {
      headers: formData.getHeaders()
    });

    fs.unlinkSync(imagePath); // Clean up the uploaded image after processing

    if (response.data.match) {
      // Find the user who matched the encoding
      const matchedUser = await User.findById(response.data.userId);
      return res.json({ match: true, userName: matchedUser.name, userId: matchedUser.id, balance: matchedUser.balance});
    } else {
      return res.json({ match: false });
    }
  } catch (error) {
    console.error("Face verification error:", error);
    res.status(500).json({ message: "Error verifying face" });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      'your_jwt_secret',
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.json({ token, userId: user._id, name: user.name, email: user.email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Middleware to Verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      req.user = decoded; // Store user info in request
      next();
  } catch (error) {
      res.status(403).json({ message: 'Invalid token' });
  }
};

// Protected Dashboard Route
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
      const user = await User.findById(req.user.userId).select("name email balance");

      if (!user) return res.status(404).json({ message: 'User not found' });

      // Fetch transaction history for the user
      const transactions = await Transaction.find({ user_id: req.user.userId }).sort({ time_stamp: -1 });

      // Fetch trip history for the user
      const trips = await TripHistory.find({ user_id: req.user.userId }).sort({ timestamp: -1 });

      res.json({
          message: `Hi ${user.name}, welcome to your dashboard!`,
          user,
          transactions,
          trips
      });

  } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

// Payment Processing Endpoint
app.post('/pay-with-face', async (req, res) => {
  console.log('Request body:', req.body);

  try {
    const { userId, ticketPrice, selectedBus } = req.body; // Extract bus details too

    if (!userId || !ticketPrice || !selectedBus) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Missing userId, ticketPrice, or selectedBus' });
    }
    // Ensure ticketPrice is a number
    const ticketPriceNum = parseFloat(ticketPrice);
    if (isNaN(ticketPriceNum)) {
      return res.status(400).json({ message: 'Invalid ticket price' });
    }
    const user = await User.findById(userId); // Finding the User in the Database

    if (!user) {
      console.log('User not found for userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`User found. Balance: €${user.balance}, Ticket Price: €${ticketPriceNum}`);

    if (user.balance < ticketPriceNum) {
      // Log the failed transaction with 'failure' status
      const transaction = new Transaction({
        user_id: userId,
        type: 'deduction',
        amount: ticketPriceNum,
        status: 'failure', // Transaction failed due to insufficient balance
      });
      await transaction.save();

      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Deduct balance & create transaction on success
    user.balance -= ticketPriceNum;
    await user.save();

    const transaction = new Transaction({
      user_id: userId,
      type: 'deduction',
      amount: ticketPriceNum,
      status: 'success', // Transaction was successful
    });
    await transaction.save();

    // ✅ Store Trip in Trip History
    const trip = new TripHistory({
      user_id: userId,
      bus_number: selectedBus.number,
      route: selectedBus.route,
      departure: `${selectedBus.departureTime} from ${selectedBus.departureLocation}`,
      arrival: `${selectedBus.arrivalTime} at ${selectedBus.arrivalLocation}`,
      price: ticketPriceNum,
    });
    await trip.save();

    res.json({ success: true, remainingBalance: user.balance });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
});

// Define the route to get all transactions
app.get('/transactions', async (req, res) => {
  try {
    // Retrieve all transactions from the database
    const transactions = await Transaction.find()
      .populate('user_id', 'name email') // Populate the user details
      .sort({ time_stamp: -1 }); // Sort by time_stamp in descending order (latest first)

    // Check if there are any transactions
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found.' });
    }

    // Send the transactions as response
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error retrieving transactions.' });
  }
});

// Top-up Endpoint
app.post('/api/top-up', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.balance += parseFloat(amount);
    await user.save();

    const transaction = new Transaction({
      user_id: userId,
      type: 'top-up',
      amount: parseFloat(amount),
      status: 'success',
      time_stamp: new Date(),
    });
    await transaction.save();

    res.json({ message: 'Top-up successful', newBalance: user.balance });
  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json({ message: 'Error processing top-up' });
  }
});

// Get All Trip History
app.get('/trip-history', async (req, res) => {
  try {
    const trips = await TripHistory.find().sort({ _id: -1 }); // Get latest trips first

    if (trips.length === 0) {
      return res.json({ message: "No trips found", trips: [] });
    }

    res.json({ trips });
  } catch (error) {
    console.error("Error fetching all trip history:", error);
    res.status(500).json({ message: "Failed to fetch trip history", error: error.message });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
