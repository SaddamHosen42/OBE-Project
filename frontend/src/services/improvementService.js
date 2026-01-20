import api from './api';

/**
 * Improvement Service
 * Handles API calls for continuous improvement features
 * including dashboard data, gap analysis, and improvement tracking
 */
const improvementService = {
  /**
   * Get dashboard data for continuous improvement
   * @returns {Promise} Dashboard data with metrics, cycles, and improvements
   */
  getDashboard: async () => {
    try {
      const response = await api.get('/improvement/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching improvement dashboard:', error);
      // Return mock data for development
      return {
        success: true,
        data: {
          activeCycles: 2,
          completedActions: 15,
          pendingActions: 8,
          averageImprovement: 12.5,
          currentCycle: {
            id: 1,
            name: 'Fall 2025 Improvement Cycle',
            status: 'active',
            progress: 65,
            startDate: '2025-09-01',
            endDate: '2026-01-15',
            totalActions: 12,
            completedActions: 8,
            milestones: [
              { title: 'Initial Assessment', dueDate: '2025-09-15', completed: true },
              { title: 'Action Plans Created', dueDate: '2025-10-01', completed: true },
              { title: 'Mid-Cycle Review', dueDate: '2025-11-15', completed: true },
              { title: 'Final Assessment', dueDate: '2026-01-10', completed: false }
            ]
          },
          recentImprovements: [
            {
              title: 'Teaching Methods Enhancement',
              description: 'Implemented active learning strategies in CS101',
              improvement: 15,
              date: '2026-01-10'
            },
            {
              title: 'Assessment Tool Improvement',
              description: 'Revised rubrics for better CLO measurement',
              improvement: 10,
              date: '2026-01-05'
            },
            {
              title: 'Lab Infrastructure Upgrade',
              description: 'Added new equipment for practical sessions',
              improvement: 20,
              date: '2025-12-20'
            }
          ],
          gapAnalysis: [
            { code: 'CLO1', target: 75, actual: 82 },
            { code: 'CLO2', target: 75, actual: 68 },
            { code: 'CLO3', target: 75, actual: 72 },
            { code: 'CLO4', target: 75, actual: 55 },
            { code: 'CLO5', target: 75, actual: 78 }
          ],
          upcomingMilestones: [
            { title: 'Final Assessment', dueDate: '2026-01-25', progress: 80 },
            { title: 'Cycle Report Submission', dueDate: '2026-02-01', progress: 40 }
          ]
        }
      };
    }
  },

  /**
   * Get gap analysis data
   * @param {Object} params - Filter parameters (type, departmentId, semesterId)
   * @returns {Promise} Gap analysis data
   */
  getGapAnalysis: async (params = {}) => {
    try {
      const response = await api.get('/improvement/gap-analysis', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching gap analysis:', error);
      // Return mock data for development
      return {
        success: true,
        data: {
          cloGaps: [
            { id: 1, code: 'CLO1', description: 'Apply basic programming concepts', target: 75, actual: 82 },
            { id: 2, code: 'CLO2', description: 'Design algorithms efficiently', target: 75, actual: 68 },
            { id: 3, code: 'CLO3', description: 'Implement data structures', target: 75, actual: 72 },
            { id: 4, code: 'CLO4', description: 'Debug complex programs', target: 75, actual: 55 },
            { id: 5, code: 'CLO5', description: 'Document code professionally', target: 75, actual: 78 }
          ],
          ploGaps: [
            { id: 1, code: 'PLO1', description: 'Engineering knowledge', target: 70, actual: 75 },
            { id: 2, code: 'PLO2', description: 'Problem analysis', target: 70, actual: 65 },
            { id: 3, code: 'PLO3', description: 'Design solutions', target: 70, actual: 68 },
            { id: 4, code: 'PLO4', description: 'Investigation', target: 70, actual: 72 },
            { id: 5, code: 'PLO5', description: 'Modern tool usage', target: 70, actual: 80 }
          ],
          peoGaps: [
            { id: 1, code: 'PEO1', description: 'Professional practice', target: 65, actual: 70 },
            { id: 2, code: 'PEO2', description: 'Lifelong learning', target: 65, actual: 62 },
            { id: 3, code: 'PEO3', description: 'Leadership skills', target: 65, actual: 58 }
          ],
          summary: {
            totalGaps: 13,
            criticalGaps: 2,
            averageGap: 8.5,
            improvementNeeded: 15
          }
        }
      };
    }
  },

  /**
   * Get improvement tracking data
   * @param {Object} params - Filter parameters (status, cycleId)
   * @returns {Promise} Tracking data with cycles and action plans
   */
  getTrackingData: async (params = {}) => {
    try {
      const response = await api.get('/improvement/tracking', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      // Return mock data for development
      return {
        success: true,
        data: {
          cycles: [
            {
              id: 1,
              name: 'Fall 2025 Improvement Cycle',
              status: 'active',
              progress: 65,
              startDate: '2025-09-01',
              endDate: '2026-01-15',
              totalActions: 12,
              completedActions: 8
            },
            {
              id: 2,
              name: 'Spring 2025 Improvement Cycle',
              status: 'completed',
              progress: 100,
              startDate: '2025-01-15',
              endDate: '2025-05-30',
              totalActions: 10,
              completedActions: 10
            }
          ],
          actionPlans: [
            {
              id: 1,
              title: 'Enhance Lab Infrastructure',
              description: 'Upgrade lab equipment and software',
              cycleName: 'Fall 2025',
              type: 'Infrastructure',
              owner: 'Dr. Smith',
              progress: 80,
              status: 'in-progress',
              dueDate: '2026-01-30'
            },
            {
              id: 2,
              title: 'Revise Assessment Methods',
              description: 'Update rubrics and assessment tools',
              cycleName: 'Fall 2025',
              type: 'Assessment',
              owner: 'Prof. Johnson',
              progress: 100,
              status: 'completed',
              dueDate: '2025-12-15'
            },
            {
              id: 3,
              title: 'Faculty Training Program',
              description: 'Professional development workshops',
              cycleName: 'Fall 2025',
              type: 'Faculty Development',
              owner: 'Dr. Williams',
              progress: 45,
              status: 'in-progress',
              dueDate: '2026-02-15'
            }
          ],
          timeline: [
            {
              title: 'Lab Infrastructure Completed',
              description: 'Successfully upgraded all lab equipment',
              date: '2026-01-10',
              status: 'completed',
              improvement: 20,
              type: 'Infrastructure',
              owner: 'Dr. Smith'
            },
            {
              title: 'Assessment Tools Revised',
              description: 'New rubrics implemented across all courses',
              date: '2025-12-15',
              status: 'completed',
              improvement: 15,
              type: 'Assessment',
              owner: 'Prof. Johnson'
            },
            {
              title: 'Faculty Workshop Started',
              description: 'First phase of training program launched',
              date: '2025-11-20',
              status: 'in-progress',
              progress: 45,
              type: 'Faculty Development',
              owner: 'Dr. Williams'
            }
          ],
          stats: {
            totalInitiatives: 23,
            completed: 15,
            inProgress: 5,
            pending: 3,
            successRate: 85
          }
        }
      };
    }
  },

  /**
   * Create a new improvement cycle
   * @param {Object} cycleData - Cycle details
   * @returns {Promise} Created cycle
   */
  createCycle: async (cycleData) => {
    try {
      const response = await api.post('/improvement/cycles', cycleData);
      return response.data;
    } catch (error) {
      console.error('Error creating improvement cycle:', error);
      throw error;
    }
  },

  /**
   * Update an improvement cycle
   * @param {number} cycleId - Cycle ID
   * @param {Object} cycleData - Updated cycle data
   * @returns {Promise} Updated cycle
   */
  updateCycle: async (cycleId, cycleData) => {
    try {
      const response = await api.put(`/improvement/cycles/${cycleId}`, cycleData);
      return response.data;
    } catch (error) {
      console.error('Error updating improvement cycle:', error);
      throw error;
    }
  },

  /**
   * Get cycle details
   * @param {number} cycleId - Cycle ID
   * @returns {Promise} Cycle details
   */
  getCycleDetails: async (cycleId) => {
    try {
      const response = await api.get(`/improvement/cycles/${cycleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cycle details:', error);
      throw error;
    }
  },

  /**
   * Export improvement report
   * @param {Object} params - Export parameters
   * @returns {Promise} Export file
   */
  exportReport: async (params = {}) => {
    try {
      const response = await api.get('/improvement/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting improvement report:', error);
      throw error;
    }
  }
};

export default improvementService;
