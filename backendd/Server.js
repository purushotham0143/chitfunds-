const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const session=require('express-session');
const fs = require('fs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URL;
const secret = process.env.SESSION_SECRET;


const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';



mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(' Connected to MongoDB'))
  .catch((err) => console.error(' MongoDB connection error:', err));

//  Schema and Models
const memberSchema = new mongoose.Schema({
  id: String,
  name: String,
  address: String,
  phone: String,
  photo: String,
  editable: Boolean,
  paid: Boolean,
  paymentDate: String,
  paidMonths: [
    {
      name: String,
      year: Number,
    }
  ],
  status: {
    type: String,
    enum: ["In Progress", "Completed"],
    default: "In Progress"
  }
});

// Then use it inside the chitFundSchema:
const chitFundSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  members: Number,
  amount: Number,
  selectedNumbers: [String],
  chitSongDate: String,
  memberDetails: [memberSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const localChitSchema = new mongoose.Schema({
  chitName: String,
  monthNumber: String,
  remainingMonths: String,
  chitSongAmount: String,
  balanceAmount: String,
  amountToPay: String,
  createdAt: { type: Date, default: Date.now },
});
const LocalChit = mongoose.model('LocalChit', localChitSchema, 'LocalChits');

const loginSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], required: true },
  photo: { type: String }, //  NEW: store base64 or file URL
});

const LoginUser = mongoose.model('LoginUser', loginSchema, 'LoginDetails');
//  What is the secret key?
// The secret key is a string used by Express-session to sign the session ID cookie. It ensures that the cookie is tamper-proof, 
// meaning no one can modify the cookie data on the client side without invalidating the session

app.use(session({
  secret: secret, // required for signing session ID cookies
  resave: false,  // don't save session if unmodified
  saveUninitialized: true, // save new sessions
  rolling: false,  // resets maxAge on every request if true
  cookie: {
    secure: isProduction,  // true only in production (HTTPS)
    httpOnly: true,        // prevent client-side JS from accessing the cookie
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    sameSite: isProduction ? 'none' : 'lax' // 'none' for cross-origin on Vercel
  }
}))

//  Middleware
// When you have eployed on the versal give that url also here
app.use(cors({
  origin: isProduction
     ? process.env.FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_DEV,
  credentials: true,
}));

// Increase body size limit for large base64 image uploads
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use('/uploads', express.static('uploads'));


// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.get('/',(req,res)=>{
  res.send("Hello Purushootham");
})

//  File Upload Endpoint
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.json({ filePath: `http://localhost:${PORT}/uploads/${req.file.filename}` });
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { name, password, role } = req.body;

  try {
    const user = await LoginUser.findOne({ name, password, role });
    if (user) {
      // store user data in session
      req.session.user = {
        id: user._id,
        name: user.name,
        role: user.role,
      };
      res.json({ success: true, user: req.session.user });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
//  Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.clearCookie('connect.sid'); // clear cookie
    res.json({ message: 'Logged out successfully' });
  });
});

//If you have authenticated routes, you should manually check if req.session.user exists: 
app.get('/api/protected', (req, res) => {
  // console.log("Session object:", req.session);
  if (!req.session.user) {
    return res.status(401).json({ message: 'Session expired' });
  }
  res.json({ user: req.session.user });
});

// Save chit details 
app.post('/api/localchit', async (req, res) => {
  try {
    const newChit = new LocalChit(req.body);
    await newChit.save();
    res.status(201).json({ success: true, chit: newChit });
  } catch (error) {
    console.error("Error saving chit:", error);
    res.status(500).json({ success: false, message: "Failed to save chit" });
  }
});

// Get all chit Details 
app.get('/api/localchit', async (req, res) => {
  try {
    const chits = await LocalChit.find().sort({ createdAt: -1 });
    res.json(chits);
  } catch (error) {
    console.error("Error fetching chits:", error);
    res.status(500).json({ message: "Failed to fetch chits" });
  }
});

// Add New User Endpoint
app.post('/api/addmember', async (req, res) => {
  const { name, password, role } = req.body;
  if (!name || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const existingUser = await LoginUser.findOne({ name });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const newUser = new LoginUser({ name, password, role });
    await newUser.save();
    res.status(201).json({ success: true, message: 'User added successfully' });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ success: false, message: 'Server error while adding member' });
  }
});

//  Save Chit Fund
const ChitFund = mongoose.model('ChitFund', chitFundSchema, 'ChitFunds');
app.post('/api/savechit', async (req, res) => {
  const chitData = req.body;
  // console.log("New chit fund received:", chitData);

  try {
    const newChit = new ChitFund(chitData);
    const savedChit = await newChit.save();
    // console.log(" Chit fund saved:", savedChit);
    res.status(201).json(savedChit);
  } catch (error) {
    console.error(' Error saving chit:', error);
    res.status(500).json({ success: false, message: 'Failed to save chit' });
  }
});

//  GET chits by chitSongDate
app.get("/api/getchitsong/:number", async (req, res) => {
  const { number } = req.params;
  try {
    const chits = await ChitFund.find({ chitSongDate: number });
    res.status(200).json(chits);
  } catch (error) {
    console.error("Error fetching chits by song date:", error);
    res.status(500).json({ error: "Failed to fetch chits" });
  }
});

//  PUT /api/updatechit/:id
app.put("/api/updatechit/:id", async (req, res) => {
  const { id } = req.params;
  const updatedChit = req.body;
//  console.log("photo is camed here",updatedChit);
  try {
    const result = await ChitFund.findOneAndUpdate({ id }, updatedChit, {
      new: true,
    });

    if (!result) {
      return res.status(404).json({ message: "Chit not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating chit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


//  Use LoginUser model to update photo
app.put("/api/users/:id/upload-photo", async (req, res) => {
  const { id } = req.params;
  const { photo } = req.body;

  try {
    const user = await LoginUser.findByIdAndUpdate(
      id,
      { photo },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Photo updated successfully", user });
  } catch (err) {
    console.error("Error updating photo:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Delete Chit Fund by ID
app.delete("/api/deletechit/:id", async (req, res) => {
  const { id } = req.params;
  // console.log(" Requested to delete chit with id:", id);

  try {
    const result = await ChitFund.deleteOne({ id });

    if (result.deletedCount === 0) {
      // console.log(" No chit found with this ID");
      return res.status(404).json({ message: "Chit not found" });
    }

    // console.log(" Chit deleted successfully:", result);
    res.status(200).json({ message: "Chit deleted" });
  } catch (error) {
    console.error(" Delete error:", error);
    res.status(500).json({ error: "Failed to delete chit" });
  }
});

//  Start Server
app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
});
