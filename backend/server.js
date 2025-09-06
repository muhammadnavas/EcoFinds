const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecofinds', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  bio: {
    type: String,
    maxlength: 500,
    default: '',
  },
  location: {
    type: String,
    maxlength: 100,
    default: '',
  },
  phone: {
    type: String,
    maxlength: 20,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

// Product model
const Product = require('./models/Product');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Optional auth middleware - doesn't fail if no token provided
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });
    
    await user.save();
    
    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    },
  });
});
// Payment Schema
const paymentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: String,
  transactionId: { type: String, unique: true },
  customerName: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

// Routes

// Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', email, customerName } = req.body;

    // Validate required fields
    if (!amount || !email) {
      return res.status(400).json({ 
        error: 'Amount and email are required' 
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        email,
        customerName: customerName || ''
      }
    });

    // Generate unique transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save payment record to database
    const payment = new Payment({
      email,
      amount,
      currency,
      stripePaymentIntentId: paymentIntent.id,
      transactionId,
      customerName,
      status: 'pending'
    });

    await payment.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      transactionId,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error.message 
    });
  }
});

// Confirm Payment
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, transactionId } = req.body;

    if (!paymentIntentId || !transactionId) {
      return res.status(400).json({ 
        error: 'Payment Intent ID and Transaction ID are required' 
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find payment record in database
    const payment = await Payment.findOne({ 
      transactionId,
      stripePaymentIntentId: paymentIntentId 
    });

    if (!payment) {
      return res.status(404).json({ 
        error: 'Payment record not found' 
      });
    }

    // Update payment status based on Stripe status
    let status = 'pending';
    if (paymentIntent.status === 'succeeded') {
      status = 'completed';
    } else if (paymentIntent.status === 'payment_failed') {
      status = 'failed';
    }

    payment.status = status;
    payment.updatedAt = new Date();
    await payment.save();

    res.json({
      success: true,
      payment: {
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amount,
        email: payment.email
      },
      stripeStatus: paymentIntent.status
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ 
      error: 'Failed to confirm payment',
      message: error.message 
    });
  }
});

// Get Payment Status
app.get('/api/payment-status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId });

    if (!payment) {
      return res.status(404).json({ 
        error: 'Payment not found' 
      });
    }

    res.json({
      transactionId: payment.transactionId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      email: payment.email,
      customerName: payment.customerName,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    });

  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment status',
      message: error.message 
    });
  }
});

// List User Payments
app.get('/api/payments/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ email })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({ email });

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payments',
      message: error.message 
    });
  }
});

// Webhook endpoint for Stripe events
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await updatePaymentStatus(paymentIntent.id, 'completed');
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await updatePaymentStatus(failedPayment.id, 'failed');
      console.log('Payment failed:', failedPayment.id);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

// Helper function to update payment status
async function updatePaymentStatus(stripePaymentIntentId, status) {
  try {
    await Payment.updateOne(
      { stripePaymentIntentId },
      { 
        status, 
        updatedAt: new Date() 
      }
    );
  } catch (error) {
    console.error('Error updating payment status:', error);
  }
}

// Refund Payment
app.post('/api/refund-payment', async (req, res) => {
  try {
    const { transactionId, amount, reason = 'requested_by_customer' } = req.body;

    if (!transactionId) {
      return res.status(400).json({ 
        error: 'Transaction ID is required' 
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ transactionId });

    if (!payment) {
      return res.status(404).json({ 
        error: 'Payment not found' 
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Can only refund completed payments' 
      });
    }

    // Create refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
      reason
    });

    // Update payment status
    payment.status = 'refunded';
    payment.updatedAt = new Date();
    await payment.save();

    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      },
      payment: {
        transactionId: payment.transactionId,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ 
      error: 'Failed to process refund',
      message: error.message 
    });
  }
});


// Update user profile
app.put('/api/auth/update-profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, bio, location, phone } = req.body;
    const userId = req.user._id;

    // Validation
    if (!username && !email && !bio && !location && !phone) {
      return res.status(400).json({ message: 'At least one field is required to update' });
    }

    // Check if username or email already exists (if being updated)
    const updateData = {};
    
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      updateData.username = username.trim();
    }

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updateData.email = email.toLowerCase().trim();
    }

    // Add other fields if provided
    if (bio !== undefined) updateData.bio = bio.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (phone !== undefined) updateData.phone = phone.trim();

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        location: updatedUser.location,
        phone: updatedUser.phone,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Product routes with proper authentication middleware
const productRoutes = require('./routes/products');

// Create router for products with conditional auth
const productRouter = express.Router();

// Apply auth middleware to routes that need it
productRouter.use('/:id/reviews', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    return authMiddleware(req, res, next);
  }
  return optionalAuthMiddleware(req, res, next);
});

productRouter.use('/', (req, res, next) => {
  if (req.path === '/my-listings' || (req.method === 'DELETE' && req.path.match(/^\/[a-f\d]{24}$/i))) {
    return authMiddleware(req, res, next);
  }
  return optionalAuthMiddleware(req, res, next);
});

// Apply product routes
productRouter.use('/', productRoutes);

app.use('/api/products', productRouter);

// Category routes
const categoryRoutes = require('./routes/categories');
app.use('/api/categories', categoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'EcoFinds API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

