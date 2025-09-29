// Push Notification Service for EcoFinds
class PushNotificationService {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.permission = Notification.permission;
  }

  // Initialize push notification service
  async init() {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Request permission for notifications
  async requestPermission() {
    if (!this.isSupported) {
      return 'unsupported';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    if (this.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission;
  }

  // Subscribe to push notifications
  async subscribe() {
    if (!this.registration) {
      await this.init();
    }

    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission not granted for push notifications');
      }
    }

    // VAPID public key (you'll need to generate this)
    const publicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9HVA-pUqmOyugbwN5uN9wvE6kgr1J_8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8';

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer(subscription) {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      console.log('Subscription sent to server successfully');
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
  }

  // Remove subscription from server
  async removeSubscriptionFromServer(subscription) {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }

      console.log('Subscription removed from server successfully');
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  }

  // Show local notification
  showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      return;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'ecofinds-notification',
      renotify: true,
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss.png'
        }
      ]
    };

    const notificationOptions = { ...defaultOptions, ...options };

    if (this.registration) {
      this.registration.showNotification(title, notificationOptions);
    } else {
      new Notification(title, notificationOptions);
    }
  }

  // Predefined notification types for EcoFinds
  async notifyNewProduct(product) {
    this.showNotification('New Product Added!', {
      body: `${product.title} - ₹${(product.price * 83).toLocaleString('en-IN')}`,
      icon: product.imageUrl || '/favicon.ico',
      tag: `new-product-${product._id}`,
      data: { productId: product._id, type: 'new-product' },
      actions: [
        { action: 'view-product', title: 'View Product' },
        { action: 'add-to-cart', title: 'Add to Cart' }
      ]
    });
  }

  async notifyPriceChange(product, oldPrice, newPrice) {
    const priceChangeType = newPrice < oldPrice ? 'reduced' : 'increased';
    this.showNotification(`Price ${priceChangeType.charAt(0).toUpperCase() + priceChangeType.slice(1)}!`, {
      body: `${product.title}: ₹${(oldPrice * 83).toLocaleString('en-IN')} → ₹${(newPrice * 83).toLocaleString('en-IN')}`,
      icon: product.imageUrl || '/favicon.ico',
      tag: `price-change-${product._id}`,
      data: { productId: product._id, type: 'price-change' },
      actions: [
        { action: 'view-product', title: 'View Product' },
        { action: 'buy-now', title: 'Buy Now' }
      ]
    });
  }

  async notifyLowStock(product, quantity) {
    this.showNotification('Low Stock Alert!', {
      body: `${product.title} - Only ${quantity} left in stock`,
      icon: product.imageUrl || '/favicon.ico',
      tag: `low-stock-${product._id}`,
      data: { productId: product._id, type: 'low-stock' },
      urgency: 'high',
      actions: [
        { action: 'buy-now', title: 'Buy Now' },
        { action: 'view-product', title: 'View Product' }
      ]
    });
  }

  async notifyOrderUpdate(order, status) {
    this.showNotification('Order Update', {
      body: `Your order #${order.id} is now ${status}`,
      icon: '/favicon.ico',
      tag: `order-${order.id}`,
      data: { orderId: order.id, type: 'order-update' },
      actions: [
        { action: 'track-order', title: 'Track Order' },
        { action: 'view-order', title: 'View Details' }
      ]
    });
  }

  async notifyNewMessage(message) {
    this.showNotification('New Message', {
      body: `${message.sender}: ${message.text.substring(0, 50)}${message.text.length > 50 ? '...' : ''}`,
      icon: message.senderAvatar || '/favicon.ico',
      tag: `message-${message.id}`,
      data: { messageId: message.id, type: 'new-message' },
      actions: [
        { action: 'reply', title: 'Reply' },
        { action: 'view-conversation', title: 'View Conversation' }
      ]
    });
  }

  // Utility function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Check if user has notifications enabled
  isSubscribed() {
    return this.permission === 'granted' && this.registration;
  }

  // Get current subscription
  async getSubscription() {
    if (!this.registration) {
      return null;
    }

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;