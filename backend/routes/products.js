const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

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
		const { title, description, category, price, imageUrl, sellerName } = req.body;
		
		// Validation
		if (!title || !description || !category || !price) {
			return res.status(400).json({ message: 'All fields are required' });
		}
		
		if (price <= 0) {
			return res.status(400).json({ message: 'Price must be greater than 0' });
		}
		
		// For now, create a dummy user ID for the seller
		// In a real app, this would come from authentication
		const mongoose = require('mongoose');
		const dummySellerId = new mongoose.Types.ObjectId();
		
		const product = new Product({
			title: title.trim(),
			description: description.trim(),
			category,
			price: parseFloat(price),
			seller: dummySellerId,
			sellerName: sellerName || 'Anonymous',
			imageUrl: imageUrl || 'https://via.placeholder.com/300x200?text=Product+Image',
		});
		
		await product.save();
		
		// Return the saved product with proper seller info
		const responseProduct = {
			...product.toObject(),
			seller: { username: sellerName || 'Anonymous' }
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

module.exports = router;
