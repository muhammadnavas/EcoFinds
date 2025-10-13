# 🌱 EcoFinds - Sustainable Marketplace

**EcoFinds** is a modern, sustainable marketplace built with React and Node.js where users can buy and sell eco-friendly products. The platform promotes circular economy principles by giving pre-owned items a second life while connecting environmentally conscious buyers and sellers.

![EcoFinds Logo](./frontend/public/logo192.png)

## 🚀 Features

### 🛒 **Core Marketplace Functionality**
- **Product Browsing** - Search and filter products by category, price, condition, and location
- **Advanced Search** - Smart filtering with multiple criteria and sorting options
- **Product Categories** - Electronics, Fashion, Home & Garden, Books, Sports, and more
- **Product Details** - Comprehensive product pages with images, descriptions, and seller info

### 👤 **User Management**
- **Authentication** - Secure user registration and login system
- **User Profiles** - Customizable profiles with bio, location, and contact info
- **Dashboard** - Personal dashboard for managing listings, orders, and account

### 🛍️ **Shopping Experience**
- **Shopping Cart** - Add products to cart with quantity management
- **Wishlist** - Save favorite items for later
- **Product Comparison** - Compare multiple products side-by-side
- **Reviews & Ratings** - User feedback system for products and sellers

### 💰 **Selling Tools**
- **Easy Listing** - Simple product listing with image upload and descriptions
- **Inventory Management** - Track your listings, sales, and performance
- **Seller Analytics** - View sales statistics and buyer interactions

### 📱 **Modern UI/UX**
- **Responsive Design** - Mobile-first design with touch optimization
- **Dark/Light Mode** - User preference theme switching
- **Real-time Updates** - Live notifications and status updates
- **Progressive Web App** - Installable web app with offline capabilities

## 🛠️ Technology Stack

### **Frontend**
- **React 19.1.1** - Modern React with hooks and context
- **React Router v6** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Context API** - State management for auth, cart, wishlist

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing and security

### **Development Tools**
- **VS Code** - Recommended IDE with extensions
- **ESLint** - Code linting and formatting
- **Git** - Version control system

## 📦 Installation & Setup

### Prerequisites
Make sure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/muhammadnavas/EcoFinds.git
cd EcoFinds
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Add your MongoDB URI, JWT secret, etc.
```

#### Environment Variables (.env)
```env
MONGODB_URI=mongodb://localhost:27017/ecofinds
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create environment file (optional)
cp .env.example .env
```

### 4. Database Setup
```bash
# Make sure MongoDB is running
# The application will automatically create the database and collections
```

### 5. Start Development Servers

#### Terminal 1 - Backend Server
```bash
cd backend
npm start
# Server will start on http://localhost:5000
```

#### Terminal 2 - Frontend Server
```bash
cd frontend
npm start
# App will open on http://localhost:3000
```

## 🎯 Usage Guide

### **For Buyers**
1. **Browse Products** - Visit the homepage to see featured products
2. **Search & Filter** - Use the search bar and filters to find specific items
3. **View Categories** - Explore products by category
4. **Product Details** - Click on any product to see full details
5. **Add to Cart** - Add desired items to your shopping cart
6. **Checkout** - Complete your purchase with secure payment

### **For Sellers**
1. **Create Account** - Register and complete your profile
2. **List Products** - Click "Sell Item" to create new listings
3. **Manage Listings** - Use your dashboard to track and edit listings
4. **Respond to Buyers** - Answer questions and manage orders
5. **Track Performance** - Monitor your sales and ratings

### **Key Pages**
- **/** - Homepage with featured products and search
- **/categories** - Browse all product categories
- **/sell** - Create new product listings (requires login)
- **/cart** - Shopping cart and checkout
- **/profile** - User profile and account settings
- **/dashboard** - Seller dashboard and analytics
- **/help** - Help center with FAQ and support

## 🔧 Configuration

### **Frontend Configuration**
```javascript
// src/config.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### **Backend Configuration**
```javascript
// backend/config.js
module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  // Add other config options
};
```

## 🧪 Testing

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Run Backend Tests
```bash
cd backend
npm test
```

## 📱 Mobile Development

The application is fully responsive and includes:
- **Touch-optimized interfaces**
- **Mobile-first design**
- **Swipe gestures for product browsing**
- **Progressive Web App (PWA) features**

## 🚀 Deployment

### **Frontend Deployment (Netlify/Vercel)**
```bash
cd frontend
npm run build
# Upload build folder to your hosting service
```

### **Backend Deployment (Heroku/Railway)**
```bash
# Add Procfile in backend directory
echo "web: node server.js" > Procfile

# Deploy to your chosen platform
```

### **Environment Variables for Production**
- Set `NODE_ENV=production`
- Update `MONGODB_URI` to production database
- Set secure `JWT_SECRET`
- Configure CORS for production domains

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Code Style Guidelines**
- Use ESLint configuration provided
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Getting Help**
- **Documentation** - Check this README and inline comments
- **Issues** - Open an issue on GitHub
- **Discussions** - Use GitHub Discussions for questions
- **Email** - Contact support@ecofinds.com

### **Common Issues**

**Q: Cannot connect to database**
```bash
# Make sure MongoDB is running
mongod
# Or check your MONGODB_URI in .env
```

**Q: Port already in use**
```bash
# Kill process on port 3000/5000
npx kill-port 3000
npx kill-port 5000
```

**Q: Build fails**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📊 Project Statistics

- **Frontend**: ~50 components and pages
- **Backend**: RESTful API with ~20 endpoints
- **Database**: MongoDB with 8+ collections
- **Features**: 15+ major features implemented
- **Mobile Responsive**: 100% mobile optimized

## 🔄 Version History

### **v1.0.0** (Current)
- ✅ Complete marketplace functionality
- ✅ User authentication and profiles
- ✅ Shopping cart and wishlist
- ✅ Product management system
- ✅ Mobile-responsive design
- ✅ Demo payment system
- ✅ Help center and documentation

### **Upcoming Features**
- 🔄 Real payment integration
- 🔄 Chat messaging system
- 🔄 Order tracking
- 🔄 Advanced analytics
- 🔄 Push notifications
- 🔄 Multi-language support

## 🌍 Sustainability Impact

EcoFinds contributes to environmental sustainability by:
- **Extending Product Lifecycles** - Giving items a second chance
- **Reducing Waste** - Preventing items from ending up in landfills
- **Promoting Conscious Consumption** - Encouraging thoughtful purchasing
- **Supporting Local Communities** - Connecting local buyers and sellers

---

**Built with 💚 for a sustainable future**

*EcoFinds - Where sustainability meets marketplace innovation*