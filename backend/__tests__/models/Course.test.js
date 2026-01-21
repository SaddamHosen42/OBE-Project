const Course = require('../../models/Course');
const db = require('../../config/database');

jest.mock('../../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));

describe('Course Model', () => {
  let courseModel;

  beforeEach(() => {
    courseModel = new Course();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with courses table', () => {
      expect(courseModel.tableName).toBe('courses');
    });
  });

  describe('getByDepartment', () => {
    it('should retrieve courses for a department', async () => {
      const mockCourses = [
        {
          id: 1,
          courseCode: 'CSE101',
          courseTitle: 'Introduction to Programming',
          department_id: 1
        },
        {
          id: 2,
          courseCode: 'CSE102',
          courseTitle: 'Data Structures',
          department_id: 1
        }
      ];

      db.query.mockResolvedValue([mockCourses]);

      const result = await courseModel.getByDepartment(1);

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockCourses);
      expect(result).toHaveLength(2);
    });

    it('should include department info when requested', async () => {
      const mockCourses = [{
        id: 1,
        courseCode: 'CSE101',
        department_name: 'Computer Science'
      }];

      db.query.mockResolvedValue([mockCourses]);

      const result = await courseModel.getByDepartment(1, {
        includeDepartment: true
      });

      expect(result[0]).toHaveProperty('department_name');
    });

    it('should handle empty results', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await courseModel.getByDepartment(999);

      expect(result).toEqual([]);
    });
  });

  describe('getByDegree', () => {
    it('should retrieve courses for a degree', async () => {
      const mockCourses = [
        {
          id: 1,
          courseCode: 'CSE101',
          degree_id: 1
        }
      ];

      db.query.mockResolvedValue([mockCourses]);

      const result = await courseModel.getByDegree(1);

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockCourses);
    });
  });

  describe('search', () => {
    it('should search courses by code or title', async () => {
      const mockCourses = [
        {
          id: 1,
          courseCode: 'CSE101',
          courseTitle: 'Programming'
        }
      ];

      db.query.mockResolvedValue([mockCourses]);

      const result = await courseModel.search('CSE');

      expect(db.query).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should handle no search results', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await courseModel.search('NONEXISTENT');

      expect(result).toEqual([]);
    });
  });

  describe('getCLOs', () => {
    it('should get CLOs for a course', async () => {
      const mockCLOs = [
        {
          id: 1,
          CLO_ID: 'CLO1',
          CLO_Description: 'Understand programming basics'
        }
      ];

      db.query.mockResolvedValue([mockCLOs]);

      const result = await courseModel.getCLOs(1);

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockCLOs);
    });
  });

  describe('getAssessments', () => {
    it('should get assessments for a course', async () => {
      const mockAssessments = [
        {
          id: 1,
          name: 'Midterm',
          total_marks: 30
        }
      ];

      db.query.mockResolvedValue([mockAssessments]);

      const result = await courseModel.getAssessments(1);

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockAssessments);
    });
  });

  describe('create', () => {
    it('should create a new course', async () => {
      const newCourse = {
        courseCode: 'CSE303',
        courseTitle: 'Advanced Programming',
        department_id: 1,
        credit: 3
      };

      const mockResult = { insertId: 1 };
      db.execute.mockResolvedValue([mockResult]);
      db.query.mockResolvedValue([[{ id: 1, ...newCourse }]]);

      const result = await courseModel.create(newCourse);

      expect(db.execute).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should validate required fields', async () => {
      const invalidCourse = {
        courseTitle: 'Missing Course Code'
      };

      db.execute.mockRejectedValue(new Error('courseCode is required'));

      await expect(courseModel.create(invalidCourse)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update course information', async () => {
      const updates = {
        courseTitle: 'Updated Title',
        credit: 4
      };

      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);
      db.query.mockResolvedValue([[{ id: 1, ...updates }]]);

      const result = await courseModel.update(1, updates);

      expect(db.execute).toHaveBeenCalled();
      expect(result).toHaveProperty('courseTitle', 'Updated Title');
    });
  });

  describe('delete', () => {
    it('should delete a course', async () => {
      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await courseModel.delete(1);

      expect(result).toBe(true);
    });

    it('should return false if course not found', async () => {
      const mockResult = { affectedRows: 0 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await courseModel.delete(999);

      expect(result).toBe(false);
    });
  });

  describe('getByCode', () => {
    it('should find course by course code', async () => {
      const mockCourse = {
        id: 1,
        courseCode: 'CSE101',
        courseTitle: 'Programming'
      };

      db.query.mockResolvedValue([[mockCourse]]);

      const result = await courseModel.getByCode('CSE101');

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockCourse);
    });

    it('should return null if course code not found', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await courseModel.getByCode('INVALID');

      expect(result).toBeNull();
    });
  });
});
