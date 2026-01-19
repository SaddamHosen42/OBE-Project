import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * Configures default options for queries and mutations
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time (how long unused/inactive cache data remains in memory)
      gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime in v4)
      
      // Stale time (how long before a query is considered stale)
      staleTime: 1000 * 60 * 1, // 1 minute
      
      // Refetch on window focus
      refetchOnWindowFocus: true,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount
      refetchOnMount: true,
      
      // Retry failed requests
      retry: 1,
      
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Network mode
      networkMode: 'online',
      
      // Keep previous data while fetching new data
      placeholderData: (previousData) => previousData,
      
      // Error handling
      throwOnError: false,
      
      // Refetch interval (disabled by default, enable per query if needed)
      refetchInterval: false,
      
      // Refetch interval in background
      refetchIntervalInBackground: false,
    },
    mutations: {
      // Network mode for mutations
      networkMode: 'online',
      
      // Retry failed mutations
      retry: 0,
      
      // Error handling
      throwOnError: false,
      
      // Global mutation callbacks (can be overridden per mutation)
      onError: (error) => {
        console.error('Mutation error:', error);
      },
      
      onSuccess: (data) => {
        console.log('Mutation success:', data);
      },
    },
  },
});

/**
 * Query Keys Factory
 * Centralized place to define query keys for type safety and consistency
 */
export const queryKeys = {
  // Auth
  auth: {
    user: () => ['auth', 'user'],
    profile: () => ['auth', 'profile'],
  },
  
  // Users
  users: {
    all: () => ['users'],
    list: (filters) => ['users', 'list', filters],
    detail: (id) => ['users', 'detail', id],
  },
  
  // Faculties
  faculties: {
    all: () => ['faculties'],
    list: (filters) => ['faculties', 'list', filters],
    detail: (id) => ['faculties', 'detail', id],
  },
  
  // Departments
  departments: {
    all: () => ['departments'],
    list: (filters) => ['departments', 'list', filters],
    detail: (id) => ['departments', 'detail', id],
    byFaculty: (facultyId) => ['departments', 'faculty', facultyId],
  },
  
  // Courses
  courses: {
    all: () => ['courses'],
    list: (filters) => ['courses', 'list', filters],
    detail: (id) => ['courses', 'detail', id],
    byDepartment: (departmentId) => ['courses', 'department', departmentId],
  },
  
  // Course Offerings
  courseOfferings: {
    all: () => ['course-offerings'],
    list: (filters) => ['course-offerings', 'list', filters],
    detail: (id) => ['course-offerings', 'detail', id],
    byCourse: (courseId) => ['course-offerings', 'course', courseId],
  },
  
  // Students
  students: {
    all: () => ['students'],
    list: (filters) => ['students', 'list', filters],
    detail: (id) => ['students', 'detail', id],
    enrollments: (id) => ['students', 'enrollments', id],
  },
  
  // PLO (Program Learning Outcomes)
  plo: {
    all: () => ['plo'],
    list: (filters) => ['plo', 'list', filters],
    detail: (id) => ['plo', 'detail', id],
    byProgram: (programId) => ['plo', 'program', programId],
  },
  
  // CLO (Course Learning Outcomes)
  clo: {
    all: () => ['clo'],
    list: (filters) => ['clo', 'list', filters],
    detail: (id) => ['clo', 'detail', id],
    byCourse: (courseId) => ['clo', 'course', courseId],
  },
  
  // Assessments
  assessments: {
    all: () => ['assessments'],
    list: (filters) => ['assessments', 'list', filters],
    detail: (id) => ['assessments', 'detail', id],
    byCourse: (courseId) => ['assessments', 'course', courseId],
  },
  
  // Grades
  grades: {
    all: () => ['grades'],
    list: (filters) => ['grades', 'list', filters],
    byStudent: (studentId) => ['grades', 'student', studentId],
    byCourse: (courseId) => ['grades', 'course', courseId],
  },
  
  // Reports
  reports: {
    cloAttainment: (filters) => ['reports', 'clo-attainment', filters],
    ploAttainment: (filters) => ['reports', 'plo-attainment', filters],
    courseReport: (courseId) => ['reports', 'course', courseId],
    programReport: (programId) => ['reports', 'program', programId],
  },
  
  // Dashboard
  dashboard: {
    stats: () => ['dashboard', 'stats'],
    recentActivity: () => ['dashboard', 'recent-activity'],
  },
};

/**
 * Helper function to invalidate related queries
 * @param {string[]} keys - Array of query key patterns to invalidate
 */
export const invalidateQueries = (keys) => {
  keys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
};

/**
 * Helper function to prefetch a query
 * @param {Array} queryKey - Query key
 * @param {Function} queryFn - Query function
 * @param {Object} options - Additional options
 */
export const prefetchQuery = (queryKey, queryFn, options = {}) => {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    ...options,
  });
};

/**
 * Helper function to set query data manually
 * @param {Array} queryKey - Query key
 * @param {*} data - Data to set
 */
export const setQueryData = (queryKey, data) => {
  queryClient.setQueryData(queryKey, data);
};

/**
 * Helper function to get query data
 * @param {Array} queryKey - Query key
 * @returns {*} Query data
 */
export const getQueryData = (queryKey) => {
  return queryClient.getQueryData(queryKey);
};

export default queryClient;
