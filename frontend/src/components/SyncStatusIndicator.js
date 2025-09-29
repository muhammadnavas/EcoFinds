import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFeedback } from '../context/FeedbackContext';

const SyncStatusIndicator = () => {
  const { loadingStates } = useFeedback();
  const { isSyncing } = useCart();
  const { user } = useAuth();

  // Don't show sync status for guest users
  if (!user) return null;

  const hasActiveOperations = Object.keys(loadingStates).some(key => 
    key.startsWith('add-to-cart') || 
    key.startsWith('remove-from-cart') || 
    key.startsWith('update-quantity') ||
    key.startsWith('clear-cart')
  );

  if (!isSyncing && !hasActiveOperations) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <div>
            <p className="text-sm font-medium text-blue-800">Syncing cart...</p>
            <p className="text-xs text-blue-600">Your changes are being saved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncStatusIndicator;