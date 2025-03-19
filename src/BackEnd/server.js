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

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);

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
      return res.json({ match: true, userName: matchedUser.name, userId: matchedUser.id, balance: matchedUser.balance });
    } else {
      return res.json({ match: false });
    }
  } catch (error) {
    console.error("Face verification error:", error);
    res.status(500).json({ message: "Error verifying face" });
  }
});

// Payment Processing Endpoint
app.post('/pay-with-face', async (req, res) => {
  try {
    const { userId, ticketPrice } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.balance < ticketPrice) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Deduct balance & create transaction
    user.balance -= ticketPrice;
    await user.save();

    const transaction = new Transaction({
      user_id: userId,
      type: 'deduction',
      amount: ticketPrice,
      status: 'success',
    });
    await transaction.save();

    res.json({ success: true, remainingBalance: user.balance });
  } catch (error) {
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
