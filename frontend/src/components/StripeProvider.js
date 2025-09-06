import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51S4IBvRtDfLtjhKBIWRwVI7VZV71Q6FsxTbLWbItgJC9l2TEzp9vXVDQnwCHgbmIqzTOduYgs91siCKVlC4X2Lco00ODM7oUIQ');

const StripeProvider = ({ children }) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider;