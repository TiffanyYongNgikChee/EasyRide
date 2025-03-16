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
  email: { type: String, required: true, unique: true }, // Make it required
  faceEncoding: { type: Array, required: true },
  registrationDate: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Ticket Model
const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  busRoute: { type: String, required: true },
  ticketPrice: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  isUsed: { type: Boolean, default: false },
  usedDate: { type: Date }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

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
app.post('/api/register', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const email = req.body.email || `user_${Date.now()}@example.com`; // Default email
    const imagePath = req.file.path;

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
      email, // Include email
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

app.get('/api/user/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  
  res.json({ success: true, user });
});

app.get('/api/user', async (req, res) => {
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
      return res.json({ match: true, userName: matchedUser.name });
    } else {
      return res.json({ match: false });
    }
  } catch (error) {
    console.error("Face verification error:", error);
    res.status(500).json({ message: "Error verifying face" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
