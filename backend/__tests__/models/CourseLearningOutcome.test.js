const CourseLearningOutcome = require('../../models/CourseLearningOutcome');
const db = require('../../config/database');

jest.mock('../../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));

describe('CourseLearningOutcome Model', () => {
  let cloModel;

  beforeEach(() => {
    cloModel = new CourseLearningOutcome();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with course_learning_outcomes table', () => {
      expect(cloModel.tableName).toBe('course_learning_outcomes');
    });
  });

  describe('getByCourse', () => {
    it('should retrieve CLOs for a specific course', async () => {
      const mockCLOs = [
        {
          id: 1,
          course_id: 1,
          CLO_ID: 'CLO1',
          CLO_Description: 'Understand programming fundamentals',
          bloom_taxonomy_level_id: 2
        },
        {
          id: 2,
          course_id: 1,
          CLO_ID: 'CLO2',
          CLO_Description: 'Apply data structures',
          bloom_taxonomy_level_id: 3
        }
      ];

      db.query.mockResolvedValue([mockCLOs]);

      const result = await cloModel.getByCourse(1);

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockCLOs);
      expect(result).toHaveLength(2);
    });

    it('should include bloom level when requested', async () => {
      const mockCLOs = [{
        id: 1,
        CLO_ID: 'CLO1',
        bloom_level_name: 'Understand'
      }];

      db.query.mockResolvedValue([mockCLOs]);

      const result = await cloModel.getByCourse(1, {
        includeBloomLevel: true
      });

      expect(result[0]).toHaveProperty('bloom_level_name');
    });

    it('should include PLO mappings when requested', async () => {
      const mockCLOs = [{
        id: 1,
        CLO_ID: 'CLO1',
        plos: ['PLO1', 'PLO2']
      }];

      db.query.mockResolvedValue([mockCLOs]);

      const result = await cloModel.getByCourse(1, {
        includePLOMappings: true
      });

      expect(result).toHaveLength(1);
    });

    it('should handle empty results', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await cloModel.getByCourse(999);

      expect(result).toEqual([]);
    });
  });

  describe('getPLOMappings', () => {
    it('should get PLO mappings for a CLO', async () => {
      const mockMappings = [
        {
          plo_id: 1,
          PLO_ID: 'PLO1',
          PLO_Description: 'Problem solving'
        }
      ];

      db.query.mockResolvedValue([mockMappings]);

      const result = await cloModel.getPLOMappings(1);

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockMappings);
    });

    it('should handle CLO with no PLO mappings', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await cloModel.getPLOMappings(1);

      expect(result).toEqual([]);
    });
  });

  describe('mapToPLO', () => {
    it('should create CLO-PLO mapping', async () => {
      const mockResult = { insertId: 1 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await cloModel.mapToPLO(1, 1);

      expect(db.execute).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    it('should handle duplicate mapping error', async () => {
      db.execute.mockRejectedValue(new Error('Duplicate entry'));

      await expect(cloModel.mapToPLO(1, 1)).rejects.toThrow('Duplicate entry');
    });
  });

  describe('unmapFromPLO', () => {
    it('should remove CLO-PLO mapping', async () => {
      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await cloModel.unmapFromPLO(1, 1);

      expect(db.execute).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if mapping not found', async () => {
      const mockResult = { affectedRows: 0 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await cloModel.unmapFromPLO(999, 999);

      expect(result).toBe(false);
    });
  });

  describe('getAttainment', () => {
    it('should calculate CLO attainment', async () => {
      const mockAttainment = {
        clo_id: 1,
        average_attainment: 78.5,
        target_attainment: 70,
        is_attained: true
      };

      db.query.mockResolvedValue([[mockAttainment]]);

      const result = await cloModel.getAttainment(1);

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockAttainment);
      expect(result.is_attained).toBe(true);
    });

    it('should handle CLO with no attainment data', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await cloModel.getAttainment(1);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new CLO', async () => {
      const newCLO = {
        course_id: 1,
        CLO_ID: 'CLO3',
        CLO_Description: 'Evaluate software designs',
        bloom_taxonomy_level_id: 5,
        weight_percentage: 20,
        target_attainment: 70
      };

      const mockResult = { insertId: 1 };
      db.execute.mockResolvedValue([mockResult]);
      db.query.mockResolvedValue([[{ id: 1, ...newCLO }]]);

      const result = await cloModel.create(newCLO);

      expect(db.execute).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('CLO_ID', 'CLO3');
    });

    it('should validate required fields', async () => {
      const invalidCLO = {
        CLO_Description: 'Missing course_id'
      };

      db.execute.mockRejectedValue(new Error('course_id is required'));

      await expect(cloModel.create(invalidCLO)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update CLO information', async () => {
      const updates = {
        CLO_Description: 'Updated description',
        target_attainment: 75
      };

      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);
      db.query.mockResolvedValue([[{ id: 1, ...updates }]]);

      const result = await cloModel.update(1, updates);

      expect(db.execute).toHaveBeenCalled();
      expect(result).toHaveProperty('CLO_Description', 'Updated description');
    });
  });

  describe('delete', () => {
    it('should delete a CLO', async () => {
      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await cloModel.delete(1);

      expect(result).toBe(true);
    });

    it('should return false if CLO not found', async () => {
      const mockResult = { affectedRows: 0 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await cloModel.delete(999);

      expect(result).toBe(false);
    });
  });

  describe('getByCLOID', () => {
    it('should find CLO by CLO_ID and course', async () => {
      const mockCLO = {
        id: 1,
        course_id: 1,
        CLO_ID: 'CLO1',
        CLO_Description: 'Test description'
      };

      db.query.mockResolvedValue([[mockCLO]]);

      const result = await cloModel.getByCLOID(1, 'CLO1');

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockCLO);
    });

    it('should return null if CLO_ID not found', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await cloModel.getByCLOID(1, 'INVALID');

      expect(result).toBeNull();
    });
  });
});
