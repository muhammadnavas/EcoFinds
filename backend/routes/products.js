const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Optional auth middleware - should be passed from main server
const optionalAuth = (req, res, next) => {
  // This will be overridden when the route is used with middleware
  next();
};

// Get all products
router.get('/', async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 0; // 0 means no limit
		const skip = (page - 1) * limit;
		
		let query = Product.find().populate('seller', 'username');
		
		if (limit > 0) {
			query = query.skip(skip).limit(limit);
		}
		
		const products = await query.sort({ createdAt: -1 });
		const totalProducts = await Product.countDocuments();
		
		// Map products to ensure seller info is properly formatted
		const formattedProducts = products.map(product => {
			const productObj = product.toObject();
			return {
				...productObj,
				seller: {
					username: productObj.sellerName || productObj.seller?.username || 'Anonymous'
				}
			};
		});
		
		res.json({ 
			success: true,
			data: formattedProducts,
			pagination: {
				currentPage: page,
				totalPages: limit > 0 ? Math.ceil(totalProducts / limit) : 1,
				totalProducts: totalProducts,
				hasNext: limit > 0 ? page < Math.ceil(totalProducts / limit) : false,
				hasPrev: page > 1
			}
		});
	} catch (error) {
		console.error('Error fetching products:', error);
		res.status(500).json({ 
			success: false,
			message: 'Server error',
			error: error.message 
		});
	}
});

// Get single product by ID
router.get('/:id', async (req, res) => {
	try {
		const product = await Product.findById(req.params.id).populate('seller', 'username');
		
		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found'
			});
		}
		
		// Format product to ensure seller info is properly formatted
		const productObj = product.toObject();
		const formattedProduct = {
			...productObj,
			seller: {
				username: productObj.sellerName || productObj.seller?.username || 'Anonymous'
			}
		};
		
		res.json({
			success: true,
			data: formattedProduct
		});
	} catch (error) {
		console.error('Error fetching product:', error);
		if (error.name === 'CastError') {
			return res.status(400).json({
				success: false,
				message: 'Invalid product ID'
			});
		}
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error.message
		});
	}
});

// Create a new product
router.post('/', async (req, res) => {
	try {
		const { title, description, category, price, imageUrl, images, sellerName } = req.body;
		
		// Validation
		if (!title || !description || !category || !price) {
			return res.status(400).json({ message: 'All fields are required' });
		}
		
		if (price <= 0) {
			return res.status(400).json({ message: 'Price must be greater than 0' });
		}
		
		// Process images array - filter out empty strings and ensure we have valid URLs
		let processedImages = [];
		if (images && Array.isArray(images)) {
			processedImages = images.filter(img => img && img.trim().length > 0);
		}
		
		// If no images provided, use imageUrl or default
		if (processedImages.length === 0) {
			if (imageUrl && imageUrl.trim().length > 0) {
				processedImages = [imageUrl.trim()];
			} else {
				processedImages = ['https://via.placeholder.com/300x200?text=Product+Image'];
			}
		}
		
		// Determine seller information
		let sellerId;
		let finalSellerName;
		
		if (req.user) {
			// User is authenticated - use their information
			sellerId = req.user._id;
			finalSellerName = req.user.username;
		} else {
			// User is not authenticated - create dummy seller ID and use provided name
			const mongoose = require('mongoose');
			sellerId = new mongoose.Types.ObjectId();
			finalSellerName = sellerName || 'Anonymous';
		}
		
		const product = new Product({
			title: title.trim(),
			description: description.trim(),
			category,
			price: parseFloat(price),
			seller: sellerId,
			sellerName: finalSellerName,
			imageUrl: processedImages[0], // Use first image as main imageUrl for backward compatibility
			images: processedImages,
		});
		
		await product.save();
		
		// Return the saved product with proper seller info
		const responseProduct = {
			...product.toObject(),
			seller: { username: finalSellerName }
		};
		
		res.status(201).json({ 
			success: true,
			message: 'Product created successfully',
			data: responseProduct 
		});
	} catch (error) {
		console.error('Error creating product:', error);
		res.status(500).json({ 
			success: false,
			message: 'Server error',
			error: error.message 
		});
	}
});

// Get user's own listings (requires authentication)
router.get('/my-listings', async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required'
			});
		}

		const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });

		// Format products for response
		const formattedProducts = products.map(product => {
			const productObj = product.toObject();
			return {
				...productObj,
				seller: {
					username: productObj.sellerName || req.user.username
				}
			};
		});

		res.json({
			success: true,
			data: formattedProducts
		});
	} catch (error) {
		console.error('Error fetching user listings:', error);
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error.message
		});
	}
});

// Delete a product (requires authentication and ownership)
router.delete('/:id', async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required'
			});
		}

		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found'
			});
		}

		// Check if the user owns this product
		if (product.seller.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				success: false,
				message: 'You can only delete your own products'
			});
		}

		await Product.findByIdAndDelete(req.params.id);

		res.json({
			success: true,
			message: 'Product deleted successfully'
		});
	} catch (error) {
		console.error('Error deleting product:', error);
		if (error.name === 'CastError') {
			return res.status(400).json({
				success: false,
				message: 'Invalid product ID'
			});
		}
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error.message
		});
	}
});

module.exports = router;
