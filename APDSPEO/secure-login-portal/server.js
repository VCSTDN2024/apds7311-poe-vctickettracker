const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const { MongoClient } = require('mongodb');
require('dotenv').config(); 
const cors = require('cors');



const app = express();
const PORT = process.env.PORT || 443;

//app.use(cors());

app.use(cors({
  origin: '*', 
}));


// MongoDB Client setup
const client = new MongoClient("mongodb+srv://st10157363:dJqkoh52dZSWur8s@cluster0.mpqj4xn.mongodb.net/");



// Connect to MongoDB
client.connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// SSL 
const options = {
  key:  fs.readFileSync('APDSPEO\\secure-login-portal\\keys\\privatekey.pem'),
  cert: fs.readFileSync('APDSPEO\\secure-login-portal\\keys\\certificate.pem'),
};

// Middleware
app.use(helmet()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//  ANTI BRUTE FORCE
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
});
app.use(limiter);

// Whitelist RegEx 
const validateInput = (email, password) => {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const passwordPattern = /^[a-zA-Z0-9!@#$%^&*]{6,30}$/;
  return emailPattern.test(email) && passwordPattern.test(password);
};

// HASHING + SALTING function
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};


const generateToken = (user) => {
  //return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return jwt.sign({ id: user._id, email: user.email }, "TEST", { expiresIn: '1h' });
};

// REGISTER route
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Received data:', { email, password });


    if (!email || !password) {
      return res.status(400).json({ error: 'All fields (email, password) are required.' });
    }

    if (!validateInput(email, password)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const db = client.db('blogs');
    const collection = db.collection('user');

    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already in use.' });
    }

    const hashedPassword = await hashPassword(password);

    const result = await collection.insertOne({ email, password: hashedPassword });

    return res.status(201).json({
      message: 'User registered successfully'
    });
  } catch (err) {
    console.error('Error registering user:', err);
    return res.status(500).json({ error: 'Server error: could not register user' });
  }
});


// LOGIN route
app.post('/api/login', limiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Received data:', { email, password });


    if (!email || !password) {
      return res.status(400).json({ error: 'All fields (email, password) are required.' });
    }

    const db = client.db('blogs');
    const collection = db.collection('user');
    const existingUser = await collection.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (isPasswordValid) {
      const token = generateToken(existingUser);
      return res.status(200).json({ message: 'Authenticated successfully', token });
    } else {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Failed login' });
  }
});

       
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server https://localhost:${PORT}`);
});


