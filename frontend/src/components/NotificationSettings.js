import { useEffect, useState } from 'react';
import pushNotificationService from '../utils/pushNotificationService';

const NotificationSettings = ({ onClose, isMobile = false }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    newProducts: true,
    priceChanges: true,
    lowStock: true,
    orderUpdates: true,
    messages: true,
    promotions: false
  });

  useEffect(() => {
    checkNotificationStatus();
    loadSettings();
  }, []);

  const checkNotificationStatus = async () => {
    setIsSupported(pushNotificationService.isSupported);
    setPermission(pushNotificationService.permission);
    setIsSubscribed(pushNotificationService.isSubscribed());
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      await pushNotificationService.init();
      const permission = await pushNotificationService.requestPermission();
      
      if (permission === 'granted') {
        await pushNotificationService.subscribe();
        setIsSubscribed(true);
        setPermission('granted');
        
        // Show test notification
        pushNotificationService.showNotification('Notifications Enabled!', {
          body: 'You\'ll now receive updates from EcoFinds',
          icon: '/favicon.ico',
          tag: 'welcome-notification'
        });
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      alert('Failed to enable notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setLoading(true);
    try {
      await pushNotificationService.unsubscribe();
      setIsSubscribed(false);
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      alert('Failed to disable notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (setting, value) => {
    const newSettings = { ...settings, [setting]: value };
    saveSettings(newSettings);
  };

  const handleTestNotification = () => {
    pushNotificationService.showNotification('Test Notification', {
      body: 'This is a test notification from EcoFinds!',
      icon: '/favicon.ico',
      tag: 'test-notification'
    });
  };

  const NotificationToggle = ({ setting, label, description }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{label}</h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={settings[setting]}
          onChange={(e) => handleSettingChange(setting, e.target.checked)}
          className="sr-only peer"
          disabled={!isSubscribed}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
      </label>
    </div>
  );

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isMobile ? 'items-end' : ''}`}>
      <div className={`bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${
        isMobile ? 'rounded-b-none' : ''
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your push notification preferences</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSupported ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚫</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Not Supported</h3>
              <p className="text-gray-500">
                Push notifications are not supported in your browser.
              </p>
            </div>
          ) : permission === 'denied' ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Notifications Blocked</h3>
              <p className="text-gray-500 mb-4">
                You've blocked notifications for this site. To enable them, please:
              </p>
              <ol className="text-sm text-gray-600 text-left max-w-sm mx-auto space-y-1">
                <li>1. Click the lock icon in your address bar</li>
                <li>2. Set notifications to "Allow"</li>
                <li>3. Refresh the page</li>
              </ol>
            </div>
          ) : !isSubscribed ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Enable Notifications</h3>
              <p className="text-gray-500 mb-6">
                Get notified about new products, price changes, and order updates.
              </p>
              <button
                onClick={handleEnableNotifications}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enabling...
                  </>
                ) : (
                  'Enable Notifications'
                )}
              </button>
            </div>
          ) : (
            <div>
              {/* Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-green-600 mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Notifications Enabled</h4>
                    <p className="text-sm text-green-700">You'll receive updates based on your preferences below</p>
                  </div>
                </div>
              </div>

              {/* Notification Categories */}
              <div className="space-y-1 mb-6">
                <NotificationToggle
                  setting="newProducts"
                  label="New Products"
                  description="Get notified when new products match your interests"
                />
                <NotificationToggle
                  setting="priceChanges"
                  label="Price Changes"
                  description="Alert me when product prices change significantly"
                />
                <NotificationToggle
                  setting="lowStock"
                  label="Low Stock Alerts"
                  description="Notify me when items in my wishlist are running low"
                />
                <NotificationToggle
                  setting="orderUpdates"
                  label="Order Updates"
                  description="Keep me informed about my order status"
                />
                <NotificationToggle
                  setting="messages"
                  label="Messages"
                  description="Notify me about new messages from sellers"
                />
                <NotificationToggle
                  setting="promotions"
                  label="Promotions & Deals"
                  description="Alert me about special offers and discounts"
                />
              </div>

              {/* Test Button */}
              <div className="flex gap-3">
                <button
                  onClick={handleTestNotification}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Test Notification
                </button>
                <button
                  onClick={handleDisableNotifications}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Disabling...' : 'Disable All'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;