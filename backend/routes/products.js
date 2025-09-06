const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Optional auth middleware - should be passed from main server
const optionalAuth = (req, res, next) => {
  // This will be overridden when the route is used with middleware
  next();
};

// Get all products with enhanced search functionality
router.get('/', async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 0; // 0 means no limit
		const skip = (page - 1) * limit;
		
		// Search parameters
		const searchQuery = req.query.search || '';
		const category = req.query.category;
		const minPrice = parseFloat(req.query.minPrice);
		const maxPrice = parseFloat(req.query.maxPrice);
		const sortBy = req.query.sortBy || 'createdAt';
		const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
		
		// Build search filter
		let searchFilter = {};
		
		// Text search across multiple fields
		if (searchQuery.trim()) {
			const searchRegex = new RegExp(searchQuery.trim(), 'i');
			searchFilter.$or = [
				{ title: searchRegex },
				{ description: searchRegex },
				{ category: searchRegex },
				{ sellerName: searchRegex }
			];
		}
		
		// Category filter
		if (category && category !== 'all') {
			searchFilter.category = category;
		}
		
		// Price range filter
		if (!isNaN(minPrice) || !isNaN(maxPrice)) {
			searchFilter.price = {};
			if (!isNaN(minPrice)) {
				searchFilter.price.$gte = minPrice;
			}
			if (!isNaN(maxPrice)) {
				searchFilter.price.$lte = maxPrice;
			}
		}
		
		// Build query
		let query = Product.find(searchFilter).populate('seller', 'username');
		
		// Apply pagination
		if (limit > 0) {
			query = query.skip(skip).limit(limit);
		}
		
		// Apply sorting
		const sortOptions = {};
		sortOptions[sortBy] = sortOrder;
		query = query.sort(sortOptions);
		
		// Execute query
		const products = await query;
		const totalProducts = await Product.countDocuments(searchFilter);
		
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
		
		// Search analytics (if search query was provided)
		let searchAnalytics = null;
		if (searchQuery.trim()) {
			searchAnalytics = {
				query: searchQuery.trim(),
				totalResults: totalProducts,
				categories: await getSearchResultsByCategory(searchFilter),
				priceRange: await getSearchPriceRange(searchFilter)
			};
		}
		
		res.json({ 
			success: true,
			data: formattedProducts,
			pagination: {
				currentPage: page,
				totalPages: limit > 0 ? Math.ceil(totalProducts / limit) : 1,
				totalProducts: totalProducts,
				hasNext: limit > 0 ? page < Math.ceil(totalProducts / limit) : false,
				hasPrev: page > 1
			},
			searchAnalytics: searchAnalytics,
			appliedFilters: {
				search: searchQuery,
				category: category,
				minPrice: minPrice,
				maxPrice: maxPrice,
				sortBy: sortBy,
				sortOrder: sortOrder === 1 ? 'asc' : 'desc'
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

// Helper function to get search results by category
async function getSearchResultsByCategory(baseFilter) {
	try {
		const categoryStats = await Product.aggregate([
			{ $match: baseFilter },
			{ $group: { _id: '$category', count: { $sum: 1 } } },
			{ $sort: { count: -1 } }
		]);
		return categoryStats.map(stat => ({
			category: stat._id,
			count: stat.count
		}));
	} catch (error) {
		console.error('Error getting category stats:', error);
		return [];
	}
}

// Helper function to get price range of search results
async function getSearchPriceRange(baseFilter) {
	try {
		const priceStats = await Product.aggregate([
			{ $match: baseFilter },
			{ 
				$group: { 
					_id: null, 
					minPrice: { $min: '$price' }, 
					maxPrice: { $max: '$price' },
					avgPrice: { $avg: '$price' }
				} 
			}
		]);
		return priceStats.length > 0 ? {
			min: priceStats[0].minPrice,
			max: priceStats[0].maxPrice,
			average: Math.round(priceStats[0].avgPrice * 100) / 100
		} : null;
	} catch (error) {
		console.error('Error getting price range:', error);
		return null;
	}
}

// Get search suggestions
router.get('/search/suggestions', async (req, res) => {
	try {
		const query = req.query.q || '';
		const limit = parseInt(req.query.limit) || 10;
		
		if (query.length < 2) {
			return res.json({
				success: true,
				data: {
					products: [],
					categories: [],
					keywords: []
				}
			});
		}
		
		const searchRegex = new RegExp(query.trim(), 'i');
		
		// Get product suggestions
		const productSuggestions = await Product.find({
			$or: [
				{ title: searchRegex },
				{ description: searchRegex }
			]
		})
		.select('title category price')
		.limit(limit)
		.sort({ createdAt: -1 });
		
		// Get category suggestions
		const categorySuggestions = await Product.distinct('category', {
			category: searchRegex
		});
		
		// Get popular keywords/terms
		const keywordSuggestions = await Product.aggregate([
			{
				$match: {
					$or: [
						{ title: searchRegex },
						{ description: searchRegex }
					]
				}
			},
			{
				$project: {
					words: {
						$split: [
							{ $toLower: '$title' },
							' '
						]
					}
				}
			},
			{ $unwind: '$words' },
			{
				$match: {
					words: searchRegex,
					words: { $not: { $in: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'a', 'an'] } }
				}
			},
			{ $group: { _id: '$words', count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 5 }
		]);
		
		res.json({
			success: true,
			data: {
				products: productSuggestions.map(p => ({
					title: p.title,
					category: p.category,
					price: p.price
				})),
				categories: categorySuggestions.slice(0, 5),
				keywords: keywordSuggestions.map(k => k._id).filter(word => word.length > 2)
			}
		});
	} catch (error) {
		console.error('Error getting search suggestions:', error);
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error.message
		});
	}
});

// Get search analytics and popular searches
router.get('/search/analytics', async (req, res) => {
	try {
		// Get popular categories
		const popularCategories = await Product.aggregate([
			{ $group: { _id: '$category', count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 10 }
		]);
		
		// Get recent products for trending keywords
		const recentProducts = await Product.find()
			.select('title category')
			.sort({ createdAt: -1 })
			.limit(50);
		
		// Extract trending keywords from recent products
		const keywordCounts = {};
		recentProducts.forEach(product => {
			const words = product.title.toLowerCase().split(' ');
			words.forEach(word => {
				const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
				if (cleanWord.length > 3 && !['the', 'and', 'with', 'for', 'this', 'that', 'from', 'they', 'have', 'were', 'been', 'their'].includes(cleanWord)) {
					keywordCounts[cleanWord] = (keywordCounts[cleanWord] || 0) + 1;
				}
			});
		});
		
		const trendingKeywords = Object.entries(keywordCounts)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 10)
			.map(([word]) => word);
		
		// Get price statistics
		const priceStats = await Product.aggregate([
			{
				$group: {
					_id: null,
					avgPrice: { $avg: '$price' },
					minPrice: { $min: '$price' },
					maxPrice: { $max: '$price' },
					totalProducts: { $sum: 1 }
				}
			}
		]);
		
		res.json({
			success: true,
			data: {
				popularCategories: popularCategories.map(cat => ({
					category: cat._id,
					count: cat.count
				})),
				trendingKeywords: trendingKeywords,
				priceStats: priceStats[0] || {
					avgPrice: 0,
					minPrice: 0,
					maxPrice: 0,
					totalProducts: 0
				}
			}
		});
	} catch (error) {
		console.error('Error getting search analytics:', error);
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

// Review Routes

// Get all reviews for a product
router.get('/:id/reviews', async (req, res) => {
	try {
		const Review = require('../models/Review');
		const Product = require('../models/Product');
		
		// Check if product exists
		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found'
			});
		}
		
		// Pagination
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;
		
		// Get reviews with pagination
		const reviews = await Review.find({ product: req.params.id })
			.populate('user', 'username')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);
		
		const totalReviews = await Review.countDocuments({ product: req.params.id });
		
		res.json({
			success: true,
			data: reviews,
			pagination: {
				currentPage: page,
				totalPages: Math.ceil(totalReviews / limit),
				totalReviews: totalReviews,
				hasNext: page < Math.ceil(totalReviews / limit),
				hasPrev: page > 1
			}
		});
	} catch (error) {
		console.error('Error fetching reviews:', error);
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

// Add a review for a product (requires authentication)
router.post('/:id/reviews', async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required'
			});
		}

		const Review = require('../models/Review');
		const Product = require('../models/Product');
		
		// Check if product exists
		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found'
			});
		}
		
		const { rating, title, comment } = req.body;
		
		// Validation
		if (!rating || !comment) {
			return res.status(400).json({
				success: false,
				message: 'Rating and comment are required'
			});
		}
		
		if (rating < 1 || rating > 5) {
			return res.status(400).json({
				success: false,
				message: 'Rating must be between 1 and 5'
			});
		}
		
		if (comment.trim().length < 10) {
			return res.status(400).json({
				success: false,
				message: 'Comment must be at least 10 characters long'
			});
		}
		
		// Check if user already reviewed this product
		const existingReview = await Review.findOne({
			product: req.params.id,
			user: req.user._id
		});
		
		if (existingReview) {
			return res.status(400).json({
				success: false,
				message: 'You have already reviewed this product'
			});
		}
		
		// Create review
		const review = new Review({
			product: req.params.id,
			user: req.user._id,
			rating: parseInt(rating),
			title: title ? title.trim() : '',
			comment: comment.trim(),
			verified: true // Set to true since user is authenticated
		});
		
		await review.save();
		
		// Populate user info for response
		await review.populate('user', 'username');
		
		// Update product review stats
		await product.calculateReviewStats();
		
		res.status(201).json({
			success: true,
			message: 'Review added successfully',
			data: review
		});
	} catch (error) {
		console.error('Error creating review:', error);
		if (error.name === 'CastError') {
			return res.status(400).json({
				success: false,
				message: 'Invalid product ID'
			});
		}
		if (error.code === 11000) {
			return res.status(400).json({
				success: false,
				message: 'You have already reviewed this product'
			});
		}
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error.message
		});
	}
});

// Update a review (requires authentication and ownership)
router.put('/:productId/reviews/:reviewId', async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required'
			});
		}

		const Review = require('../models/Review');
		const Product = require('../models/Product');
		
		const review = await Review.findOne({
			_id: req.params.reviewId,
			product: req.params.productId
		});
		
		if (!review) {
			return res.status(404).json({
				success: false,
				message: 'Review not found'
			});
		}
		
		// Check if user owns this review
		if (review.user.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				success: false,
				message: 'You can only edit your own reviews'
			});
		}
		
		const { rating, title, comment } = req.body;
		
		// Validation
		if (rating && (rating < 1 || rating > 5)) {
			return res.status(400).json({
				success: false,
				message: 'Rating must be between 1 and 5'
			});
		}
		
		if (comment && comment.trim().length < 10) {
			return res.status(400).json({
				success: false,
				message: 'Comment must be at least 10 characters long'
			});
		}
		
		// Update review
		if (rating) review.rating = parseInt(rating);
		if (title !== undefined) review.title = title.trim();
		if (comment) review.comment = comment.trim();
		
		await review.save();
		await review.populate('user', 'username');
		
		// Update product review stats
		const product = await Product.findById(req.params.productId);
		if (product) {
			await product.calculateReviewStats();
		}
		
		res.json({
			success: true,
			message: 'Review updated successfully',
			data: review
		});
	} catch (error) {
		console.error('Error updating review:', error);
		if (error.name === 'CastError') {
			return res.status(400).json({
				success: false,
				message: 'Invalid ID'
			});
		}
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error.message
		});
	}
});

// Delete a review (requires authentication and ownership)
router.delete('/:productId/reviews/:reviewId', async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required'
			});
		}

		const Review = require('../models/Review');
		const Product = require('../models/Product');
		
		const review = await Review.findOne({
			_id: req.params.reviewId,
			product: req.params.productId
		});
		
		if (!review) {
			return res.status(404).json({
				success: false,
				message: 'Review not found'
			});
		}
		
		// Check if user owns this review
		if (review.user.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				success: false,
				message: 'You can only delete your own reviews'
			});
		}
		
		await Review.findByIdAndDelete(req.params.reviewId);
		
		// Update product review stats
		const product = await Product.findById(req.params.productId);
		if (product) {
			await product.calculateReviewStats();
		}
		
		res.json({
			success: true,
			message: 'Review deleted successfully'
		});
	} catch (error) {
		console.error('Error deleting review:', error);
		if (error.name === 'CastError') {
			return res.status(400).json({
				success: false,
				message: 'Invalid ID'
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
