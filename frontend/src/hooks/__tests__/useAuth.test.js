import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryWrapper } from '../../test/testUtils';
import useAuth from '../useAuth';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

vi.mock('../../services/authService');
vi.mock('../../store/authStore');

describe('useAuth Hook', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    role: 'teacher',
    permissions: ['read:courses', 'write:courses']
  };

  const mockToken = 'mock-token-123';

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    // Mock auth store
    useAuthStore.mockReturnValue({
      user: mockUser,
      token: mockToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns authentication state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: QueryWrapper,
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toEqual(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('checks authentication with stored token', async () => {
    global.localStorage.getItem.mockReturnValue(mockToken);
    authService.getCurrentUser.mockResolvedValue({
      success: true,
      data: mockUser,
    });

    const mockLogin = vi.fn();
    useAuthStore.mockReturnValue({
      ...useAuthStore(),
      login: mockLogin,
      setLoading: vi.fn(),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: QueryWrapper,
    });

    const isAuthenticated = await result.current.checkAuth();

    await waitFor(() => {
      expect(isAuthenticated).toBe(true);
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalledWith(mockUser, mockToken);
    });
  });

  it('returns false when no token is stored', async () => {
    global.localStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), {
      wrapper: QueryWrapper,
    });

    const isAuthenticated = await result.current.checkAuth();

    expect(isAuthenticated).toBe(false);
    expect(authService.getCurrentUser).not.toHaveBeenCalled();
  });

  it('refreshes user data when authenticated', async () => {
    const mockUpdateUser = vi.fn();
    useAuthStore.mockReturnValue({
      ...useAuthStore(),
      isAuthenticated: true,
      updateUser: mockUpdateUser,
      setLoading: vi.fn(),
      setError: vi.fn(),
    });

    authService.getCurrentUser.mockResolvedValue({
      success: true,
      data: { ...mockUser, username: 'updateduser' },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: QueryWrapper,
    });

    await result.current.refreshUser();

    await waitFor(() => {
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalledWith({ ...mockUser, username: 'updateduser' });
    });
  });

  it('checks if user has permission', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: QueryWrapper,
    });

    const hasPermission = result.current.hasPermission('read:courses');
    expect(hasPermission).toBe(true);
  });

  it('returns true for admin on any permission check', () => {
    useAuthStore.mockReturnValue({
      ...useAuthStore(),
      user: { ...mockUser, role: 'admin' },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: QueryWrapper,
    });

    const hasPermission = result.current.hasPermission('any:permission');
    expect(hasPermission).toBe(true);
  });

  it('returns false for permission user does not have', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: QueryWrapper,
    });

    const hasPermission = result.current.hasPermission('admin:only');
    expect(hasPermission).toBe(false);
  });

  it('updates user profile', () => {
    const mockUpdateUser = vi.fn();
    useAuthStore.mockReturnValue({
      ...useAuthStore(),
      updateUser: mockUpdateUser,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: QueryWrapper,
    });

    const updates = { username: 'newusername' };
    result.current.updateUserProfile(updates);

    expect(mockUpdateUser).toHaveBeenCalledWith(updates);
  });
});
