import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import router from './router';
import useLoadingStore from './store/useLoadingStore';
import './App.css';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/**
 * Main App Component
 * Provides routing and query client context to the entire application
 */
function App() {
  const { isLoading, loadingMessage } = useLoadingStore();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <div>
                <p className="font-semibold text-lg">Loading...</p>
                {loadingMessage && (
                  <p className="text-sm text-gray-600 mt-1">{loadingMessage}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Main Router */}
      <RouterProvider router={router} />
    </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
