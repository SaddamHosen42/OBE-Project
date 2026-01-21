const BaseModel = require('../../models/BaseModel');
const db = require('../../config/database');

// Mock the database module
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));

describe('BaseModel', () => {
  let testModel;
  const tableName = 'test_table';

  beforeEach(() => {
    testModel = new BaseModel(tableName);
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with table name', () => {
      expect(testModel.tableName).toBe(tableName);
      expect(testModel.db).toBe(db);
    });

    it('should throw error if table name is not provided', () => {
      expect(() => new BaseModel()).toThrow('Table name is required');
    });
  });

  describe('findAll', () => {
    it('should retrieve all records from table', async () => {
      const mockData = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' }
      ];
      db.query.mockResolvedValue([mockData]);

      const result = await testModel.findAll();

      expect(db.query).toHaveBeenCalledWith(
        `SELECT * FROM ${tableName}`,
        []
      );
      expect(result).toEqual(mockData);
    });

    it('should apply orderBy and order options', async () => {
      const mockData = [{ id: 1 }];
      db.query.mockResolvedValue([mockData]);

      await testModel.findAll({
        orderBy: 'created_at',
        order: 'DESC'
      });

      expect(db.query).toHaveBeenCalledWith(
        `SELECT * FROM ${tableName} ORDER BY created_at DESC`,
        []
      );
    });

    it('should apply limit and offset for pagination', async () => {
      const mockData = [{ id: 1 }];
      db.query.mockResolvedValue([mockData]);

      await testModel.findAll({
        limit: 10,
        offset: 20
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        expect.arrayContaining([10])
      );
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      db.query.mockRejectedValue(error);

      await expect(testModel.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should retrieve record by id', async () => {
      const mockData = { id: 1, name: 'Test' };
      db.query.mockResolvedValue([[mockData]]);

      const result = await testModel.findById(1);

      expect(db.query).toHaveBeenCalledWith(
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [1]
      );
      expect(result).toEqual(mockData);
    });

    it('should return null if record not found', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await testModel.findById(999);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      db.query.mockRejectedValue(new Error('Database error'));

      await expect(testModel.findById(1)).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const newData = { name: 'New Test', value: 100 };
      const mockResult = { insertId: 1 };
      db.execute.mockResolvedValue([mockResult]);
      db.query.mockResolvedValue([[{ id: 1, ...newData }]]);

      const result = await testModel.create(newData);

      expect(db.execute).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
    });

    it('should handle empty data object', async () => {
      await expect(testModel.create({})).rejects.toThrow();
    });

    it('should handle database errors during creation', async () => {
      db.execute.mockRejectedValue(new Error('Creation failed'));

      await expect(testModel.create({ name: 'Test' })).rejects.toThrow('Creation failed');
    });
  });

  describe('update', () => {
    it('should update existing record', async () => {
      const updateData = { name: 'Updated Name' };
      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);
      db.query.mockResolvedValue([[{ id: 1, ...updateData }]]);

      const result = await testModel.update(1, updateData);

      expect(db.execute).toHaveBeenCalled();
      expect(result).toHaveProperty('name', 'Updated Name');
    });

    it('should return null if record not found', async () => {
      const mockResult = { affectedRows: 0 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await testModel.update(999, { name: 'Test' });

      expect(result).toBeNull();
    });

    it('should handle database errors during update', async () => {
      db.execute.mockRejectedValue(new Error('Update failed'));

      await expect(testModel.update(1, { name: 'Test' })).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete record by id', async () => {
      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await testModel.delete(1);

      expect(db.execute).toHaveBeenCalledWith(
        `DELETE FROM ${tableName} WHERE id = ?`,
        [1]
      );
      expect(result).toBe(true);
    });

    it('should return false if record not found', async () => {
      const mockResult = { affectedRows: 0 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await testModel.delete(999);

      expect(result).toBe(false);
    });

    it('should handle database errors during deletion', async () => {
      db.execute.mockRejectedValue(new Error('Deletion failed'));

      await expect(testModel.delete(1)).rejects.toThrow('Deletion failed');
    });
  });

  describe('count', () => {
    it('should return count of all records', async () => {
      db.query.mockResolvedValue([[{ count: 42 }]]);

      const result = await testModel.count();

      expect(db.query).toHaveBeenCalledWith(
        `SELECT COUNT(*) as count FROM ${tableName}`,
        []
      );
      expect(result).toBe(42);
    });

    it('should return count with where conditions', async () => {
      db.query.mockResolvedValue([[{ count: 10 }]]);

      const result = await testModel.count({ status: 'active' });

      expect(result).toBe(10);
    });
  });

  describe('exists', () => {
    it('should return true if record exists', async () => {
      db.query.mockResolvedValue([[{ count: 1 }]]);

      const result = await testModel.exists(1);

      expect(result).toBe(true);
    });

    it('should return false if record does not exist', async () => {
      db.query.mockResolvedValue([[{ count: 0 }]]);

      const result = await testModel.exists(999);

      expect(result).toBe(false);
    });
  });
});
