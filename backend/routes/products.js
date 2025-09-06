const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
	try {
		const products = await Product.find().populate('seller', 'username').sort({ createdAt: -1 });
		
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
		
		res.json({ products: formattedProducts });
	} catch (error) {
		console.error('Error fetching products:', error);
		res.status(500).json({ message: 'Server error' });
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
			message: 'Product created successfully',
			product: responseProduct 
		});
	} catch (error) {
		console.error('Error creating product:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;
