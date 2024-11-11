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
const { ObjectId } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 443;

// CORS setup
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// MongoDB Client setup
const client = new MongoClient("mongodb+srv://st10157363:dJqkoh52dZSWur8s@cluster0.mpqj4xn.mongodb.net/");

// Connect to MongoDB
client.connect()
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// SSL configuration
const options = {
  key: fs.readFileSync('secure-login-portal/keys/privatekey.pem'),
  cert: fs.readFileSync('secure-login-portal/keys/certificate.pem'),
};

// Middleware
app.use(helmet()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
});
app.use(limiter);

// Input validation for registration
const validateInput = (email, password, fullName, idNumber, accountNumber) => {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,30}$/;
  const fullNamePattern = /^[A-Za-z\s]+$/; 
  const idNumberPattern = /^\d+$/; 
  const accountNumberPattern = /^\d{4,10}$/; 

  const isEmailValid = emailPattern.test(email);
  const isPasswordValid = passwordPattern.test(password);
  const isFullNameValid = fullNamePattern.test(fullName);
  const isIdNumberValid = idNumberPattern.test(idNumber);
  const isAccountNumberValid = accountNumberPattern.test(accountNumber);

  return isEmailValid && isPasswordValid && isFullNameValid && isIdNumberValid && isAccountNumberValid;
};


// Password hashing function
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Token generation
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "TEST", { expiresIn: '1h' });
};

// Middleware to verify JWT and extract user info
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
    return res.sendStatus(401); 
  }

  jwt.verify(token, process.env.JWT_SECRET || "TEST", (err, user) => {
    if (err) {
      return res.sendStatus(403); 
    }
    req.user = user; 
    next(); 
  });
};

// REGISTER route
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, fullName, idNumber, accountNumber } = req.body;

    userType = "user"; 
    //userType = "admin";

    if (!email || !password || !userType || !fullName || !idNumber || !accountNumber) {
      return res.status(400).json({ error: 'All fields (email, password, fullName, idNumber, accountNumber, userType) are required.' });
    }

    if (!validateInput(email, password,fullName,idNumber,accountNumber)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const validUserTypes = ['admin', 'user'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ error: 'Invalid userType. Must be "admin" or "user".' });
    }

    const db = client.db('blogs');
    const collection = db.collection('user');

    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already in use.' });
    }

    const hashedPassword = await hashPassword(password);
    await collection.insertOne({ email, password: hashedPassword, userType, fullName, idNumber, accountNumber }); 

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
    const { email, password, accountNumber } = req.body;  

    if (!email || !password || !accountNumber) {
      return res.status(400).json({ error: 'All fields (email, password, account number) are required.' });
    }

    const db = client.db('blogs');
    const collection = db.collection('user');
    const existingUser = await collection.findOne({ email, accountNumber });  

    if (!existingUser) {
      return res.status(401).json({ error: 'Invalid email, account number, or password' });
    }
    //const hashedPassword = await hashPassword(password);
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (isPasswordValid) {
      const token = generateToken(existingUser);
      return res.status(200).json({ 
        message: 'Authenticated successfully', 
        token,
        userType: existingUser.userType 
      });
    } else {
      return res.status(401).json({ error: 'Invalid email, account number, or password' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Failed login' });
  }
});

const validatePaymentInput = (amount, currency, paymentMethod) => {
  const validCurrencies = ['USD', 'EUR', 'R']; 
  const validPaymentMethods = ['monero', 'swift', 'paypal']; 

  const isAmountValid = typeof amount === 'number' && amount > 0;
  const isCurrencyValid = validCurrencies.includes(currency);
  const isPaymentMethodValid = validPaymentMethods.includes(paymentMethod);

  return isAmountValid && isCurrencyValid && isPaymentMethodValid;
};

// Submit Payment route
app.post('/api/submit-payment', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body;

    if (!amount || !currency || !paymentMethod) {
      return res.status(400).json({ error: 'All fields (amount, currency, paymentMethod) are required.' });
    }

    if (!validatePaymentInput(amount, currency, paymentMethod)) {
      return res.status(400).json({ error: 'Invalid input. Please ensure the amount, currency, and payment method are valid.' });
    }

    const userId = req.user.id; 

    //just random
    const swiftCode = `SWIFT${Math.floor(100000 + Math.random() * 900000)}`;

    const newPayment = {
      amount,
      currency,
      paymentMethod,
      userId,
      status: 'unresolved',
      createdAt: new Date(),
      swiftCode,  
    };

    const db = client.db('blogs');
    const collection = db.collection('payments');
    await collection.insertOne(newPayment);
    res.status(201).json({ message: 'Payment processed successfully', payment: newPayment });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});


// View Payments route
app.get('/api/view-payments', async (req, res) => {
  try {
    const db = client.db('blogs');
    const paymentsCollection = db.collection('payments');

    const payments = await paymentsCollection.aggregate([
      {
        $match: {
          status: { $ne: 'resolved' }  
        }
      },
      {
        $addFields: {
          userId: { $toObjectId: "$userId" }
        }
      },
      {
        $lookup: {
          from: 'user',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          amount: 1,
          currency: 1,
          paymentMethod: 1,
          status: 1,
          createdAt: 1,
          swiftCode: 1,       
          userId: 1,
          userDetails: {
            _id: 1,
            fullName: 1,
            email: 1,
            accountNumber: 1
          }
        }
      }
    ]).toArray();

    console.log('Payments with User Details:', payments); 

    res.status(200).json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments. Please try again later.' });
  }
});

// UPDATE payment status to "resolved"
app.put('/api/resolve-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required.' });
    }
    if (!ObjectId.isValid(paymentId)) {
      return res.status(400).json({ error: 'Invalid Payment ID format.' });
    }

    const db = client.db('blogs');
    const collection = db.collection('payments');

    const payment = await collection.findOne({ _id: new ObjectId(paymentId) });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found.' });
    }

    await collection.updateOne(
      { _id: new ObjectId(paymentId) },
      { $set: { status: 'resolved' } }
    );

    res.status(200).json({ message: 'Payment verified.' });
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
});
