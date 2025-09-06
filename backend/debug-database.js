const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecofinds');

// Import models (with basic schemas for checking)
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
}));

const Product = mongoose.model('Product', new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  seller: String,
}));

const Category = mongoose.model('Category', new mongoose.Schema({
  name: String,
  slug: String,
  productCount: Number,
  icon: String,
}));

const Cart = mongoose.model('Cart', new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  items: Array,
}));

const Order = mongoose.model('Order', new mongoose.Schema({
  orderId: String,
  status: String,
  totalAmount: Number,
}));

async function debugDatabase() {
  try {
    console.log('🔍 EcoFinds Database Debug Report');
    console.log('=======================================\n');
    
    // Check Users
    const userCount = await User.countDocuments();
    console.log(`👥 Users: ${userCount}`);
    if (userCount > 0) {
      const users = await User.find({}).select('username email').limit(3);
      users.forEach(user => console.log(`   - ${user.username} (${user.email})`));
      if (userCount > 3) console.log(`   ... and ${userCount - 3} more`);
    }
    console.log();
    
    // Check Products
    const productCount = await Product.countDocuments();
    console.log(`📦 Products: ${productCount}`);
    if (productCount > 0) {
      // Show products by category
      const productsByCategory = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, products: { $push: '$name' } } },
        { $sort: { count: -1 } }
      ]);
      
      productsByCategory.forEach(group => {
        console.log(`   📂 ${group._id}: ${group.count} products`);
        group.products.slice(0, 2).forEach(name => console.log(`      - ${name}`));
        if (group.products.length > 2) console.log(`      ... and ${group.products.length - 2} more`);
      });
    }
    console.log();
    
    // Check Categories
    const categoryCount = await Category.countDocuments();
    console.log(`🏷️  Categories: ${categoryCount}`);
    if (categoryCount > 0) {
      const categories = await Category.find({}).sort({ productCount: -1 });
      categories.forEach(cat => {
        console.log(`   ${cat.icon || '🏷️'} ${cat.name} (${cat.slug}): ${cat.productCount || 0} products`);
      });
    }
    console.log();
    
    // Check Carts
    const cartCount = await Cart.countDocuments();
    console.log(`🛒 Carts: ${cartCount}`);
    if (cartCount > 0) {
      const carts = await Cart.find({}).populate('userId', 'username');
      for (let cart of carts) {
        const username = cart.userId?.username || 'Unknown';
        console.log(`   - ${username}: ${cart.items?.length || 0} items`);
      }
    }
    console.log();
    
    // Check Orders
    const orderCount = await Order.countDocuments();
    console.log(`📋 Orders: ${orderCount}`);
    if (orderCount > 0) {
      const ordersByStatus = await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$totalAmount' } } },
        { $sort: { count: -1 } }
      ]);
      
      ordersByStatus.forEach(group => {
        console.log(`   - ${group._id}: ${group.count} orders ($${group.totalAmount?.toFixed(2) || 0})`);
      });
    }
    console.log();
    
    // Category-Product Mismatch Check
    console.log('🔍 Category-Product Alignment Check:');
    const productCategories = await Product.distinct('category');
    const registeredCategories = await Category.find({}).select('name');
    const registeredCategoryNames = registeredCategories.map(cat => cat.name);
    
    console.log('   Product categories:', productCategories);
    console.log('   Registered categories:', registeredCategoryNames);
    
    const missingCategories = productCategories.filter(cat => !registeredCategoryNames.includes(cat));
    const unusedCategories = registeredCategoryNames.filter(cat => !productCategories.includes(cat));
    
    if (missingCategories.length > 0) {
      console.log(`   ⚠️  Missing category records: ${missingCategories.join(', ')}`);
    }
    if (unusedCategories.length > 0) {
      console.log(`   ℹ️  Unused categories: ${unusedCategories.join(', ')}`);
    }
    if (missingCategories.length === 0 && unusedCategories.length === 0) {
      console.log('   ✅ All categories are properly aligned!');
    }
    
    console.log('\n=======================================');
    console.log('🎯 Debug completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during database debug:', error);
  }
}

// Run the debug
debugDatabase().then(() => {
  mongoose.connection.close();
});
