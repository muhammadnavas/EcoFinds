import { AlertCircle, ArrowLeft, CheckCircle, CreditCard, Loader, Lock, ShoppingBag, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Mock payment processing function
const processPayment = async (formData) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock transaction ID
  const transactionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Mock payment scenarios based on card number
  const cardNumber = formData.cardNumber?.replace(/\s/g, '') || '';
  
  if (cardNumber.startsWith('4000')) {
    throw new Error('Payment declined. Please try a different card number.');
  } else if (cardNumber.startsWith('4242')) {
    return {
      success: true,
      transactionId,
      message: 'Demo payment completed successfully! (Visa)',
      cardBrand: 'Visa'
    };
  } else if (cardNumber.startsWith('5555')) {
    return {
      success: true,
      transactionId,
      message: 'Demo payment completed successfully! (Mastercard)',
      cardBrand: 'Mastercard'
    };
  } else {
    return {
      success: true,
      transactionId,
      message: 'Demo payment completed successfully!',
      cardBrand: 'Demo Card'
    };
  }
};

// Payment Form Component
const PaymentForm = ({ onBack, cartItems = [], cartTotal = 0, onPaymentSuccess }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    cardName: user?.name || '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    zipCode: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [showBilling, setShowBilling] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.cardName) newErrors.cardName = 'Cardholder name is required';
    if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.cvv) newErrors.cvv = 'CVV is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Card number validation (basic)
    if (formData.cardNumber && formData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    // Expiry date validation (MM/YY format)
    if (formData.expiryDate && !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    
    // CVV validation
    if (formData.cvv && !/^[0-9]{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    
    // Format expiry date with slash
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    }
    
    // Format CVV (numbers only)
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setPaymentStatus(null);
    
    try {
      // Process payment with mock system
      const result = await processPayment(formData);
      
      // Mock backend confirmation
      const orderData = {
        transactionId: result.transactionId,
        orderItems: cartItems,
        totalAmount: cartTotal,
        finalAmount: parseFloat(getFinalTotal()),
        customerEmail: formData.email,
        customerName: formData.cardName,
        shippingAddress: showBilling ? {
          address: formData.billingAddress,
          city: formData.city,
          zipCode: formData.zipCode
        } : undefined,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };
      
      setPaymentStatus({
        type: 'success',
        message: result.message,
        transactionId: result.transactionId
      });
      
      // Clear cart after successful payment
      onPaymentSuccess && onPaymentSuccess(orderData);
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus({
        type: 'error',
        message: error.message || 'Payment failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTax = () => (cartTotal * 0.08).toFixed(2);
  const getFinalTotal = () => (cartTotal + parseFloat(getTax())).toFixed(2);

  // Success View
  if (paymentStatus?.type === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Shop
            </button>
          </div>
        </div>

        {/* Success Content */}
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-2">{paymentStatus.message}</p>
            <p className="text-sm text-gray-500 mb-8">
              Transaction ID: {paymentStatus.transactionId}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Paid</span>
                  <span>${getFinalTotal()}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onBack}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition duration-200"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Cart
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="lg:order-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${getTax()}</span>
                </div>
                <div className="flex justify-between text-xl font-semibold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>${getFinalTotal()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CreditCard className="h-6 w-6 mr-3" />
                Payment Details
              </h1>

              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Contact Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Card Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Card Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                      />
                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                            errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                        {errors.expiryDate && (
                          <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                            errors.cvv ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="123"
                          maxLength="4"
                        />
                        {errors.cvv && (
                          <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                          errors.cardName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Full name on card"
                      />
                      {errors.cardName && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Billing Address Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowBilling(!showBilling)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showBilling ? '- Hide' : '+ Add'} billing address
                  </button>
                </div>

                {/* Billing Address */}
                {showBilling && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          placeholder="12345"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {paymentStatus?.type === 'error' && (
                  <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700">{paymentStatus.message}</span>
                  </div>
                )}

                {/* Demo Notice */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Demo Payment System</h4>
                      <p className="text-yellow-700 text-sm mb-2">
                        This is a demonstration payment form. No real charges will be made.
                      </p>
                      <p className="text-yellow-600 text-xs">
                        Use any card number except those starting with "4000" to simulate successful payment.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <Lock className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-green-700 text-sm">Your information is handled securely in this demo</span>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition duration-200 flex items-center justify-center space-x-2 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02]'
                  } text-white`}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin h-5 w-5" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      <span>Complete Payment - ${getFinalTotal()}</span>
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  By completing this payment, you agree to our terms of service
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Payment component - simplified without Stripe
const Payment = ({ onBack, cartItems = [], cartTotal = 0, onPaymentSuccess }) => {
  return (
    <PaymentForm 
      onBack={onBack} 
      cartItems={cartItems} 
      cartTotal={cartTotal}
      onPaymentSuccess={onPaymentSuccess}
    />
  );
};

export default Payment;
