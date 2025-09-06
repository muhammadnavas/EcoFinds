import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AlertCircle, ArrowLeft, CheckCircle, CreditCard, Loader, Lock, ShoppingBag, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key');

// Card Element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
};

// Real payment processing with Stripe
const processPayment = async (stripe, elements, formData, clientSecret) => {
  const cardElement = elements.getElement(CardElement);

  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: formData.cardName,
        email: formData.email,
        address: formData.billingAddress ? {
          line1: formData.billingAddress,
          city: formData.city,
          postal_code: formData.zipCode,
        } : undefined,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    paymentIntent,
    transactionId: paymentIntent.id,
    message: 'Payment processed successfully!'
  };
};

// Payment Form Component
const PaymentForm = ({ onBack, cartItems = [], cartTotal = 0, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    cardName: user?.name || '',
    billingAddress: '',
    city: '',
    zipCode: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [showBilling, setShowBilling] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Create payment intent when component mounts
  useEffect(() => {
    if (cartTotal > 0) {
      createPaymentIntent();
    }
  }, [cartTotal]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: cartTotal,
          currency: 'usd',
          email: user?.email || formData.email,
          customerName: user?.name || formData.cardName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setTransactionId(data.transactionId);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setPaymentStatus({
        type: 'error',
        message: 'Failed to initialize payment. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.cardName) newErrors.cardName = 'Cardholder name is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Check if Stripe elements are ready
    if (!stripe || !elements) {
      newErrors.card = 'Payment system not ready. Please wait a moment.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    if (!stripe || !elements || !clientSecret) {
      setPaymentStatus({
        type: 'error',
        message: 'Payment system not ready. Please wait a moment and try again.'
      });
      return;
    }
    
    setLoading(true);
    setPaymentStatus(null);
    
    try {
      // Process payment with Stripe
      const result = await processPayment(stripe, elements, formData, clientSecret);
      
      // Confirm payment with backend
      const confirmResponse = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ecofinds-token')}`
        },
        body: JSON.stringify({
          paymentIntentId: result.paymentIntent.id,
          transactionId: transactionId,
          orderItems: cartItems,
          shippingAddress: showBilling ? {
            address: formData.billingAddress,
            city: formData.city,
            zipCode: formData.zipCode
          } : undefined
        }),
      });

      if (!confirmResponse.ok) {
        throw new Error('Payment confirmation failed');
      }

      const confirmData = await confirmResponse.json();
      
      setPaymentStatus({
        type: 'success',
        message: result.message,
        transactionId: confirmData.payment.transactionId,
        paymentIntent: result.paymentIntent
      });
      
      // Clear cart after successful payment would be handled by parent component
      onPaymentSuccess && onPaymentSuccess(confirmData);
      
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
                        Card Details
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition duration-200">
                        <CardElement options={cardElementOptions} />
                      </div>
                      {errors.card && (
                        <p className="mt-1 text-sm text-red-600">{errors.card}</p>
                      )}
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

                {/* Security Notice */}
                <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <Lock className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-green-700 text-sm">Your payment information is secure and encrypted</span>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !stripe || !elements}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition duration-200 flex items-center justify-center space-x-2 ${
                    loading || !stripe || !elements
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

// Main Payment component wrapper with Stripe provider
const Payment = ({ onBack, cartItems = [], cartTotal = 0, onPaymentSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm 
        onBack={onBack} 
        cartItems={cartItems} 
        cartTotal={cartTotal}
        onPaymentSuccess={onPaymentSuccess}
      />
    </Elements>
  );
};

export default Payment;
