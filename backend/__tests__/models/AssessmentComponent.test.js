const AssessmentComponent = require('../../models/AssessmentComponent');
const db = require('../../config/database');

jest.mock('../../config/database', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));

describe('AssessmentComponent Model', () => {
  let assessmentModel;

  beforeEach(() => {
    assessmentModel = new AssessmentComponent();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with assessment_components table', () => {
      expect(assessmentModel.tableName).toBe('assessment_components');
    });
  });

  describe('getByCourse', () => {
    it('should retrieve assessments for a course', async () => {
      const mockAssessments = [
        {
          id: 1,
          course_id: 1,
          name: 'Midterm Exam',
          total_marks: 30
        },
        {
          id: 2,
          course_id: 1,
          name: 'Final Exam',
          total_marks: 50
        }
      ];

      db.query.mockResolvedValue([mockAssessments]);

      const result = await assessmentModel.getByCourse(1);

      expect(db.query).toHaveBeenCalled();
      expect(result).toEqual(mockAssessments);
    });
  });

  describe('getCLOMappings', () => {
    it('should get CLO mappings for assessment', async () => {
      const mockMappings = [
        { clo_id: 1, CLO_ID: 'CLO1' },
        { clo_id: 2, CLO_ID: 'CLO2' }
      ];

      db.query.mockResolvedValue([mockMappings]);

      const result = await assessmentModel.getCLOMappings(1);

      expect(result).toEqual(mockMappings);
    });
  });

  describe('create', () => {
    it('should create a new assessment', async () => {
      const newAssessment = {
        course_id: 1,
        name: 'Quiz 1',
        total_marks: 10,
        weightage: 5
      };

      const mockResult = { insertId: 1 };
      db.execute.mockResolvedValue([mockResult]);
      db.query.mockResolvedValue([[{ id: 1, ...newAssessment }]]);

      const result = await assessmentModel.create(newAssessment);

      expect(result).toHaveProperty('id');
    });
  });

  describe('update', () => {
    it('should update assessment information', async () => {
      const updates = { total_marks: 15 };

      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);
      db.query.mockResolvedValue([[{ id: 1, ...updates }]]);

      const result = await assessmentModel.update(1, updates);

      expect(result).toHaveProperty('total_marks', 15);
    });
  });

  describe('delete', () => {
    it('should delete an assessment', async () => {
      const mockResult = { affectedRows: 1 };
      db.execute.mockResolvedValue([mockResult]);

      const result = await assessmentModel.delete(1);

      expect(result).toBe(true);
    });
  });
});
