import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const paymentService = {
  // Create payment intent
  createPaymentIntent: async (paymentData) => {
    const response = await api.post('/create-payment-intent', paymentData);
    return response.data;
  },

  // Confirm payment
  confirmPayment: async (confirmationData) => {
    const response = await api.post('/confirm-payment', confirmationData);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (transactionId) => {
    const response = await api.get(`/payment-status/${transactionId}`);
    return response.data;
  },

  // Get user payments
  getUserPayments: async (email, page = 1, limit = 10) => {
    const response = await api.get(`/payments/${email}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Request refund
  refundPayment: async (refundData) => {
    const response = await api.post('/refund-payment', refundData);
    return response.data;
  }
};