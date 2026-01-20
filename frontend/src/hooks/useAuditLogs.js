import { useQuery } from '@tanstack/react-query';
import auditService from '../services/auditService';

/**
 * useAuditLogs Hook
 * Fetches audit logs with filters and pagination
 * @param {Object} params - Query parameters (page, limit, filters, etc.)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with audit logs data
 */
export const useAuditLogs = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: () => auditService.getAllLogs(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    keepPreviousData: true,
    ...options,
  });
};

/**
 * useAuditLog Hook
 * Fetches a single audit log by ID
 * @param {number} id - Audit log ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result with audit log data
 */
export const useAuditLog = (id, options = {}) => {
  return useQuery({
    queryKey: ['auditLog', id],
    queryFn: () => auditService.getLogById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * useAuditLogsByUser Hook
 * Fetches audit logs for a specific user
 * @param {number} userId - User ID
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 * @returns {Object} Query result with user's audit logs
 */
export const useAuditLogsByUser = (userId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ['auditLogs', 'user', userId, params],
    queryFn: () => auditService.getLogsByUser(userId, params),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
    keepPreviousData: true,
    ...options,
  });
};

/**
 * useAuditLogsByTable Hook
 * Fetches audit logs for a specific table
 * @param {string} tableName - Table name
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 * @returns {Object} Query result with table's audit logs
 */
export const useAuditLogsByTable = (tableName, params = {}, options = {}) => {
  return useQuery({
    queryKey: ['auditLogs', 'table', tableName, params],
    queryFn: () => auditService.getLogsByTable(tableName, params),
    enabled: !!tableName,
    staleTime: 1 * 60 * 1000,
    keepPreviousData: true,
    ...options,
  });
};

/**
 * useAuditLogsByRecord Hook
 * Fetches audit logs for a specific record
 * @param {string} tableName - Table name
 * @param {number} recordId - Record ID
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 * @returns {Object} Query result with record's audit logs
 */
export const useAuditLogsByRecord = (tableName, recordId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ['auditLogs', 'record', tableName, recordId, params],
    queryFn: () => auditService.getLogsByRecord(tableName, recordId, params),
    enabled: !!tableName && !!recordId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * useAuditStatistics Hook
 * Fetches audit log statistics
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 * @returns {Object} Query result with statistics data
 */
export const useAuditStatistics = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['auditStatistics', params],
    queryFn: () => auditService.getStatistics(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * useRecentActivity Hook
 * Fetches recent audit activities
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 * @returns {Object} Query result with recent activities
 */
export const useRecentActivity = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['recentActivity', params],
    queryFn: () => auditService.getRecentActivity(params),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000, // Auto-refetch every minute
    ...options,
  });
};

export default useAuditLogs;
