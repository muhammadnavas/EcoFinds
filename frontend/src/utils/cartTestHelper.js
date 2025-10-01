// Cart functionality test helper
// This file helps test cart operations in both guest and authenticated modes

export const testCartFunctionality = {
  // Test data
  mockProduct: {
    _id: 'test-product-123',
    name: 'Test Eco Product',
    price: 29.99,
    image: '/test-image.jpg',
    seller: 'Test Seller',
    condition: 'Good',
    inStock: true
  },

  // Test cart operations
  async testGuestCart(cartContext) {
    console.log('🧪 Testing Guest Cart Functionality');
    
    try {
      // Test adding item
      console.log('📝 Testing add to cart...');
      const addResult = await cartContext.addToCart(this.mockProduct, 2);
      console.log('Add result:', addResult);
      
      // Test getting quantity
      const quantity = cartContext.getItemQuantity('test-product-123');
      console.log('Current quantity:', quantity);
      
      // Test updating quantity
      console.log('📝 Testing quantity update...');
      const updateResult = await cartContext.updateQuantity('test-product-123', 3);
      console.log('Update result:', updateResult);
      
      // Test selection
      console.log('📝 Testing item selection...');
      cartContext.toggleSelectItem('test-product-123');
      console.log('Selected items:', Array.from(cartContext.selectedItems));
      
      // Test localStorage persistence
      const cartData = JSON.parse(localStorage.getItem('ecofinds-cart') || '{}');
      console.log('📝 localStorage cart data:', cartData);
      
      console.log('✅ Guest cart tests completed');
      return true;
    } catch (error) {
      console.error('❌ Guest cart test failed:', error);
      return false;
    }
  },

  async testAuthenticatedCart(cartContext, authContext) {
    console.log('🧪 Testing Authenticated Cart Functionality');
    
    if (!authContext.user) {
      console.log('⚠️ User not authenticated, skipping auth tests');
      return false;
    }

    try {
      // Test cart sync
      console.log('📝 Testing cart sync...');
      await cartContext.loadCartFromBackend();
      
      // Test adding item when authenticated
      console.log('📝 Testing authenticated add to cart...');
      const addResult = await cartContext.addToCart(this.mockProduct, 1);
      console.log('Authenticated add result:', addResult);
      
      // Test backend persistence
      console.log('📝 Current cart state:', {
        items: cartContext.items.length,
        loading: cartContext.loading,
        syncing: cartContext.syncing
      });
      
      console.log('✅ Authenticated cart tests completed');
      return true;
    } catch (error) {
      console.error('❌ Authenticated cart test failed:', error);
      return false;
    }
  },

  // Test cart migration (guest -> authenticated)
  async testCartMigration(cartContext, authContext) {
    console.log('🧪 Testing Cart Migration');
    
    try {
      // First add items as guest
      await this.testGuestCart(cartContext);
      
      // Check if user login triggers migration
      console.log('📝 Cart state before potential migration:', {
        guestItems: cartContext.items.length,
        localStorage: localStorage.getItem('ecofinds-cart') ? 'exists' : 'empty'
      });
      
      console.log('✅ Migration test setup completed');
      console.log('💡 To complete test: log in and observe cart sync');
      return true;
    } catch (error) {
      console.error('❌ Migration test failed:', error);
      return false;
    }
  },

  // Comprehensive test suite
  async runAllTests(cartContext, authContext) {
    console.log('🚀 Starting comprehensive cart tests...');
    console.log('Current user status:', authContext.user ? 'Authenticated' : 'Guest');
    
    const results = {
      guest: false,
      authenticated: false,
      migration: false
    };
    
    // Always test guest functionality
    results.guest = await this.testGuestCart(cartContext);
    
    // Test authenticated functionality if user is logged in
    if (authContext.user) {
      results.authenticated = await this.testAuthenticatedCart(cartContext, authContext);
    }
    
    // Test migration setup
    results.migration = await this.testCartMigration(cartContext, authContext);
    
    console.log('🏁 Test Results:', results);
    return results;
  }
};

// Console helper for manual testing
window.testCart = testCartFunctionality;