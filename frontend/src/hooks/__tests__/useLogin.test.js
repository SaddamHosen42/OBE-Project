import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AllProvidersWrapper } from '../../test/testUtils';
import useLogin from '../useLogin';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

vi.mock('../../services/authService');
vi.mock('../../store/authStore');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('useLogin Hook', () => {
  const mockLogin = vi.fn();
  const mockSetLoading = vi.fn();
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.mockReturnValue({
      login: mockLogin,
      setLoading: mockSetLoading,
      setError: mockSetError,
    });

    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: AllProvidersWrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
  });

  it('successfully logs in user', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
    };
    const mockToken = 'mock-token';

    authService.login.mockResolvedValue({
      success: true,
      data: { user: mockUser, token: mockToken },
    });

    const { result } = renderHook(() => useLogin(), {
      wrapper: AllProvidersWrapper,
    });

    const credentials = {
      identifier: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    };

    const response = await result.current.login(credentials);

    await waitFor(() => {
      expect(response.success).toBe(true);
      expect(authService.login).toHaveBeenCalledWith({
        identifier: credentials.identifier,
        password: credentials.password,
      });
      expect(mockLogin).toHaveBeenCalledWith(mockUser, mockToken);
      expect(result.current.success).toBe(true);
    });
  });

  it('handles login failure', async () => {
    const errorMessage = 'Invalid credentials';
    authService.login.mockResolvedValue({
      success: false,
      message: errorMessage,
    });

    const { result } = renderHook(() => useLogin(), {
      wrapper: AllProvidersWrapper,
    });

    const credentials = {
      identifier: 'test@example.com',
      password: 'wrongpassword',
    };

    const response = await result.current.login(credentials);

    await waitFor(() => {
      expect(response.success).toBe(false);
      expect(response.error).toBe(errorMessage);
      expect(result.current.error).toBe(errorMessage);
      expect(mockSetError).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('stores rememberMe preference', async () => {
    authService.login.mockResolvedValue({
      success: true,
      data: { user: {}, token: 'token' },
    });

    const { result } = renderHook(() => useLogin(), {
      wrapper: AllProvidersWrapper,
    });

    await result.current.login({
      identifier: 'test@example.com',
      password: 'password',
      rememberMe: true,
    });

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('rememberMe', 'true');
    });
  });

  it('removes rememberMe when not selected', async () => {
    authService.login.mockResolvedValue({
      success: true,
      data: { user: {}, token: 'token' },
    });

    const { result } = renderHook(() => useLogin(), {
      wrapper: AllProvidersWrapper,
    });

    await result.current.login({
      identifier: 'test@example.com',
      password: 'password',
      rememberMe: false,
    });

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('rememberMe');
    });
  });

  it('calls onSuccess callback on successful login', async () => {
    const onSuccess = vi.fn();
    const mockData = { user: {}, token: 'token' };

    authService.login.mockResolvedValue({
      success: true,
      data: mockData,
    });

    const { result } = renderHook(() => useLogin(), {
      wrapper: AllProvidersWrapper,
    });

    await result.current.login(
      { identifier: 'test@example.com', password: 'password' },
      { onSuccess }
    );

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('calls onError callback on login failure', async () => {
    const onError = vi.fn();
    const errorMessage = 'Login failed';

    authService.login.mockResolvedValue({
      success: false,
      message: errorMessage,
    });

    const { result } = renderHook(() => useLogin(), {
      wrapper: AllProvidersWrapper,
    });

    await result.current.login(
      { identifier: 'test@example.com', password: 'password' },
      { onError }
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('handles network errors', async () => {
    const networkError = new Error('Network error');
    authService.login.mockRejectedValue(networkError);

    const { result } = renderHook(() => useLogin(), {
      wrapper: AllProvidersWrapper,
    });

    const response = await result.current.login({
      identifier: 'test@example.com',
      password: 'password',
    });

    await waitFor(() => {
      expect(response.success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  it('sets loading state during login', async () => {
    authService.login.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} }), 100))
    );

    const { result } = renderHook(() => useLogin(), {
      wrapper: AllProvidersWrapper,
    });

    const loginPromise = result.current.login({
      identifier: 'test@example.com',
      password: 'password',
    });

    // Should be loading
    expect(result.current.isLoading).toBe(true);
    expect(mockSetLoading).toHaveBeenCalledWith(true);

    await loginPromise;

    // Should stop loading
    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });
});
