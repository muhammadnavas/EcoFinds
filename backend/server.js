const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecofinds');

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

// Cart Schema
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  selectedItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: Number,
    quantity: Number,
    seller: String,
    sellerId: mongoose.Schema.Types.ObjectId
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    address: String,
    city: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  customerEmail: String,
  customerName: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Order = mongoose.model('Order', orderSchema);

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

// Confirm Payment and Create Order
app.post('/api/confirm-payment', authMiddleware, async (req, res) => {
  try {
    const { paymentIntentId, transactionId, orderItems, shippingAddress } = req.body;
    const userId = req.user.id;

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

    // Create order if payment succeeded and orderItems provided
    let order = null;
    if (paymentIntent.status === 'succeeded' && orderItems && orderItems.length > 0) {
      const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = totalAmount * 0.08; // 8% tax
      const finalAmount = totalAmount + tax;

      order = new Order({
        userId,
        items: orderItems.map(item => ({
          productId: item._id || item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          seller: item.seller,
          sellerId: item.sellerId
        })),
        totalAmount,
        tax,
        finalAmount,
        paymentId: paymentIntentId,
        transactionId,
        status: 'confirmed',
        shippingAddress: shippingAddress || {},
        customerEmail: payment.email,
        customerName: payment.customerName
      });

      await order.save();

      // Clear the user's cart after successful order
      try {
        const userCart = await Cart.findOne({ userId });
        if (userCart) {
          // Remove ordered items from cart
          const orderedProductIds = orderItems.map(item => item._id || item.productId);
          userCart.items = userCart.items.filter(
            cartItem => !orderedProductIds.includes(cartItem.productId.toString())
          );
          userCart.selectedItems = userCart.selectedItems.filter(
            selectedId => !orderedProductIds.includes(selectedId.toString())
          );
          await userCart.save();
        }
      } catch (cartError) {
        console.error('Error clearing cart after order:', cartError);
        // Don't fail the order creation if cart clearing fails
      }
    }

    res.json({
      success: true,
      payment: {
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amount,
        email: payment.email
      },
      order: order ? {
        orderId: order._id,
        status: order.status,
        totalAmount: order.totalAmount,
        finalAmount: order.finalAmount,
        items: order.items
      } : null,
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

// Cart Routes
// Get user's cart
app.get('/api/cart', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart) {
      cart = new Cart({ userId, items: [], selectedItems: [] });
      await cart.save();
    }

    // Filter out items where productId is null (deleted products)
    const validItems = cart.items.filter(item => item.productId);
    
    // If we found invalid items, update the cart to remove them
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      // Also clean up selectedItems that reference deleted products
      const validProductIds = validItems.map(item => item.productId._id.toString());
      cart.selectedItems = cart.selectedItems.filter(id => validProductIds.includes(id.toString()));
      await cart.save();
    }

    res.json({
      items: validItems.map(item => ({
        _id: item.productId._id,
        id: item.productId._id, // Keep for compatibility
        name: item.productId.name,
        price: item.productId.price,
        image: item.productId.imageUrl || item.productId.image,
        seller: item.productId.seller,
        sellerId: item.productId.userId,
        quantity: item.quantity,
        addedDate: item.addedAt,
        inStock: item.productId.inStock !== false,
        condition: item.productId.condition || 'Good',
        category: item.productId.category,
        description: item.productId.description,
        originalPrice: item.productId.originalPrice,
        productId: item.productId._id
      })),
      selectedItems: cart.selectedItems
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// Add item to cart
app.post('/api/cart/add', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [], selectedItems: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        productId,
        quantity,
        addedAt: new Date()
      });
    }

    await cart.save();

    res.json({
      message: 'Item added to cart successfully',
      item: {
        productId,
        quantity: existingItemIndex >= 0 
          ? cart.items[existingItemIndex].quantity 
          : quantity
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
});

// Update item quantity in cart
app.put('/api/cart/update', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity < 0) {
      return res.status(400).json({ message: 'Invalid product ID or quantity' });
    }

    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      // Also remove from selected items
      cart.selectedItems = cart.selectedItems.filter(id => id.toString() !== productId);
    } else {
      // Update quantity
      const itemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );

      if (itemIndex >= 0) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        return res.status(404).json({ message: 'Item not found in cart' });
      }
    }

    await cart.save();

    res.json({
      message: 'Cart updated successfully',
      quantity
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

// Remove item from cart
app.delete('/api/cart/remove', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove item from cart
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    
    // Also remove from selected items
    cart.selectedItems = cart.selectedItems.filter(id => id.toString() !== productId);

    await cart.save();

    res.json({
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
});

// Clear entire cart
app.delete('/api/cart/clear', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.selectedItems = [];
    await cart.save();

    res.json({
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

// Update selected items in cart
app.put('/api/cart/select', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedItems } = req.body;

    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.selectedItems = selectedItems || [];
    await cart.save();

    res.json({
      message: 'Selected items updated successfully',
      selectedItems: cart.selectedItems
    });
  } catch (error) {
    console.error('Error updating selected items:', error);
    res.status(500).json({ message: 'Failed to update selected items' });
  }
});

// Order Routes
// Get user's orders
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get specific order
app.get('/api/orders/:orderId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate('items.productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Update order status (for admin or seller)
app.put('/api/orders/:orderId/status', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // For now, allow users to cancel their own orders
    // In a real app, you'd have more complex permissions
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow cancellation if order is not shipped/delivered
    if (status === 'cancelled' && ['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel shipped or delivered orders' });
    }

    order.status = status;
    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order: {
        orderId: order._id,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// Get order statistics for user
app.get('/api/orders/stats/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Order.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalAmount' }
        }
      }
    ]);

    const summary = {
      total: 0,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalSpent: 0
    };

    stats.forEach(stat => {
      summary[stat._id] = stat.count;
      summary.total += stat.count;
      if (stat._id !== 'cancelled') {
        summary.totalSpent += stat.totalAmount;
      }
    });

    res.json(summary);
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ message: 'Failed to fetch order statistics' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'EcoFinds API is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

