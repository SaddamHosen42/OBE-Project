import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

/**
 * Create a new QueryClient for testing
 */
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

/**
 * Wrapper for components that need QueryClient
 */
export const QueryWrapper = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

/**
 * Wrapper for components that need Router
 */
export const RouterWrapper = ({ children, initialEntries = ['/'] }) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  );
};

/**
 * Wrapper for components that need both QueryClient and Router
 */
export const AllProvidersWrapper = ({ children, initialEntries = ['/'] }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

/**
 * Custom render with all providers
 */
export const renderWithProviders = (ui, options = {}) => {
  const { initialEntries = ['/'], ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProvidersWrapper initialEntries={initialEntries}>
        {children}
      </AllProvidersWrapper>
    ),
    ...renderOptions,
  });
};

/**
 * Mock localStorage
 */
export const mockLocalStorage = () => {
  const storage = {};
  
  return {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => {
      storage[key] = value;
    },
    removeItem: (key) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach(key => delete storage[key]);
    },
    get storage() {
      return storage;
    }
  };
};

/**
 * Wait for async updates
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
