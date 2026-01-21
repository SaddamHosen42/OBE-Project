const ProgramLearningOutcome = require('../../models/ProgramLearningOutcome');
const db = require('../../config/database');

jest.mock('../../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));

describe('ProgramLearningOutcome Model', () => {
  let ploModel;

  beforeEach(() => {
    ploModel = new ProgramLearningOutcome();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with program_learning_outcomes table', () => {
      expect(ploModel.tableName).toBe('program_learning_outcomes');
    });
  });

  describe('getByDegree', () => {
    it('should retrieve PLOs for a degree', async () => {
      const mockPLOs = [
        {
          id: 1,
          degree_id: 1,
          PLO_ID: 'PLO1',
          PLO_Description: 'Apply knowledge of mathematics'
        },
        {
          id: 2,
          degree_id: 1,
          PLO_ID: 'PLO2',
          PLO_Description: 'Design systems and processes'
        }
      ];

      db.query.mockResolvedValue([mockPLOs]);

      const result = await ploModel.getByDegree(1);

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockPLOs);
      expect(result).toHaveLength(2);
    });

    it('should handle empty results', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await ploModel.getByDegree(999);

      expect(result).toEqual([]);
    });
  });

  describe('getCLOMappings', () => {
    it('should get CLO mappings for a PLO', async () => {
      const mockMappings = [
        {
          clo_id: 1,
          CLO_ID: 'CLO1',
          course_title: 'Programming'
        }
      ];

      db.query.mockResolvedValue([mockMappings]);

      const result = await ploModel.getCLOMappings(1);

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockMappings);
    });
  });

  describe('getAttainment', () => {
    it('should calculate PLO attainment', async () => {
      const mockAttainment = {
        plo_id: 1,
        average_attainment: 82.3,
        target_attainment: 75,
        is_attained: true
      };

      db.query.mockResolvedValue([[mockAttainment]]);

      const result = await ploModel.getAttainment(1);

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockAttainment);
    });
  });

  describe('create', () => {
    it('should create a new PLO', async () => {
      const newPLO = {
        degree_id: 1,
        PLO_ID: 'PLO5',
        PLO_Description: 'Function effectively on teams',
        target_attainment: 75
      };

      const mockResult = { insertId: 1 };
      db.execute.mockResolvedValue([mockResult]);
      db.query.mockResolvedValue([[{ id: 1, ...newPLO }]]);

      const result = await ploModel.create(newPLO);

      expect(db.execute).toHaveBeenCalled();
      expect(result).toHaveProperty('PLO_ID', 'PLO5');
    });
  });

  describe('update', () => {
    it('should update PLO information', async () => {
      const updates = {
        PLO_Description: 'Updated description',
        target_attainment: 80
      };

      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);
      db.query.mockResolvedValue([[{ id: 1, ...updates }]]);

      const result = await ploModel.update(1, updates);

      expect(result).toHaveProperty('PLO_Description', 'Updated description');
    });
  });

  describe('delete', () => {
    it('should delete a PLO', async () => {
      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await ploModel.delete(1);

      expect(result).toBe(true);
    });
  });
});
