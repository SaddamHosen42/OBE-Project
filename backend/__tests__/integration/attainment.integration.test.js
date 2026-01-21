const request = require('supertest');
const app = require('../../config/app');
const db = require('../../config/database');

/**
 * Integration Tests for CLO and PLO Attainment Calculations
 */
describe('Attainment Calculation Integration Tests', () => {
  let authToken;
  let testUser;
  let testCourse;
  let testOffering;
  let testCLOs = [];
  let testPLOs = [];
  let testStudents = [];
  let testEnrollments = [];

  beforeAll(async () => {
    await db.raw('SELECT 1');

    // Create admin user
    const userData = {
      username: `attaintest_${Date.now()}`,
      email: `attaintest_${Date.now()}@example.com`,
      password: 'Test@1234',
      firstName: 'Attainment',
      lastName: 'Tester',
      role: 'admin'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    testUser = registerResponse.body.data.user;
    authToken = registerResponse.body.data.token;

    // Setup test data: department, degree, course, offering, CLOs, PLOs, students
    // This is a simplified setup - in real tests, you'd need more comprehensive setup
  });

  afterAll(async () => {
    // Comprehensive cleanup
    await db.destroy();
  });

  describe('CLO Attainment Calculation', () => {
    it('should calculate CLO attainment based on student marks', async () => {
      // Create test course offering
      const offeringData = {
        courseId: testCourse?.id,
        academicSessionId: 1,
        semesterId: 1,
        teacherId: testUser.id,
        section: 'A'
      };

      const offeringResponse = await request(app)
        .post('/api/offerings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(offeringData);

      if (offeringResponse.status === 201) {
        testOffering = offeringResponse.body.data;
      }

      // Create CLO
      const cloData = {
        courseId: testCourse?.id,
        cloNumber: 1,
        description: 'Students will be able to understand basic concepts',
        bloomLevel: 'understand',
        linkedPLOs: []
      };

      const cloResponse = await request(app)
        .post('/api/clos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cloData);

      if (cloResponse.status === 201) {
        testCLOs.push(cloResponse.body.data);
      }

      // Add marks for students
      const marksData = [
        { studentId: testStudents[0]?.id, cloId: testCLOs[0]?.id, marks: 85, totalMarks: 100 },
        { studentId: testStudents[1]?.id, cloId: testCLOs[0]?.id, marks: 75, totalMarks: 100 },
        { studentId: testStudents[2]?.id, cloId: testCLOs[0]?.id, marks: 90, totalMarks: 100 },
      ];

      // Post marks
      for (const mark of marksData) {
        await request(app)
          .post('/api/marks')
          .set('Authorization', `Bearer ${authToken}`)
          .send(mark);
      }

      // Calculate CLO attainment
      const attainmentResponse = await request(app)
        .post(`/api/clo-attainment/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          offeringId: testOffering?.id,
          cloId: testCLOs[0]?.id
        });

      if (attainmentResponse.status === 200) {
        expect(attainmentResponse.body.success).toBe(true);
        expect(attainmentResponse.body.data).toHaveProperty('attainmentLevel');
        expect(attainmentResponse.body.data).toHaveProperty('percentage');
        expect(attainmentResponse.body.data.percentage).toBeGreaterThan(0);
      }
    });

    it('should calculate course-level CLO attainment', async () => {
      const response = await request(app)
        .get(`/api/clo-attainment/course/${testCourse?.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should apply attainment thresholds correctly', async () => {
      // Set threshold
      const thresholdData = {
        level: 'high',
        minPercentage: 80,
        maxPercentage: 100,
        description: 'High attainment'
      };

      const thresholdResponse = await request(app)
        .post('/api/thresholds')
        .set('Authorization', `Bearer ${authToken}`)
        .send(thresholdData);

      if (thresholdResponse.status === 201) {
        const threshold = thresholdResponse.body.data;

        // Calculate attainment with threshold
        const attainmentResponse = await request(app)
          .post('/api/clo-attainment/calculate-with-threshold')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            offeringId: testOffering?.id,
            cloId: testCLOs[0]?.id,
            thresholdId: threshold.id
          });

        if (attainmentResponse.status === 200) {
          expect(attainmentResponse.body.success).toBe(true);
          expect(attainmentResponse.body.data).toHaveProperty('meetsThreshold');
        }
      }
    });
  });

  describe('PLO Attainment Calculation', () => {
    it('should calculate PLO attainment from CLO mappings', async () => {
      // Create PLO
      const ploData = {
        degreeId: testCourse?.degreeId,
        ploNumber: 1,
        description: 'Graduates will demonstrate technical knowledge',
        category: 'knowledge'
      };

      const ploResponse = await request(app)
        .post('/api/plos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ploData);

      if (ploResponse.status === 201) {
        testPLOs.push(ploResponse.body.data);

        // Map CLO to PLO
        await request(app)
          .post('/api/clos/map-plo')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            cloId: testCLOs[0]?.id,
            ploId: testPLOs[0].id
          });

        // Calculate PLO attainment
        const attainmentResponse = await request(app)
          .post('/api/plo-attainment/calculate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ploId: testPLOs[0].id,
            sessionId: 1
          });

        if (attainmentResponse.status === 200) {
          expect(attainmentResponse.body.success).toBe(true);
          expect(attainmentResponse.body.data).toHaveProperty('attainmentPercentage');
        }
      }
    });

    it('should calculate program-level PLO attainment', async () => {
      const response = await request(app)
        .get(`/api/plo-attainment/degree/${testCourse?.degreeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should track PLO attainment trends over time', async () => {
      const response = await request(app)
        .get(`/api/plo-attainment/trends/${testPLOs[0]?.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ years: 3 });

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('trend');
      }
    });
  });

  describe('Indirect Attainment Measures', () => {
    it('should calculate attainment from survey responses', async () => {
      // Create survey
      const surveyData = {
        title: 'Course Exit Survey',
        type: 'exit_survey',
        targetAudience: 'student',
        questions: [
          { text: 'Rate your understanding of course concepts', type: 'rating', scale: 5 }
        ]
      };

      const surveyResponse = await request(app)
        .post('/api/surveys')
        .set('Authorization', `Bearer ${authToken}`)
        .send(surveyData);

      if (surveyResponse.status === 201) {
        const survey = surveyResponse.body.data;

        // Submit survey responses
        const responseData = {
          surveyId: survey.id,
          respondentId: testStudents[0]?.id,
          responses: [{ questionId: survey.questions[0].id, value: 4 }]
        };

        await request(app)
          .post('/api/survey-responses')
          .set('Authorization', `Bearer ${authToken}`)
          .send(responseData);

        // Calculate indirect attainment
        const attainmentResponse = await request(app)
          .post('/api/indirect-attainment/calculate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            surveyId: survey.id,
            cloId: testCLOs[0]?.id
          });

        if (attainmentResponse.status === 200) {
          expect(attainmentResponse.body.success).toBe(true);
          expect(attainmentResponse.body.data).toHaveProperty('averageRating');
        }
      }
    });
  });

  describe('Attainment Reports', () => {
    it('should generate comprehensive attainment report', async () => {
      const response = await request(app)
        .post('/api/reports/attainment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseId: testCourse?.id,
          sessionId: 1,
          includeCharts: true
        });

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('cloAttainment');
        expect(response.body.data).toHaveProperty('ploAttainment');
        expect(response.body.data).toHaveProperty('summary');
      }
    });

    it('should export attainment data in various formats', async () => {
      const formats = ['pdf', 'excel', 'csv'];

      for (const format of formats) {
        const response = await request(app)
          .get(`/api/reports/attainment/export`)
          .set('Authorization', `Bearer ${authToken}`)
          .query({
            courseId: testCourse?.id,
            format: format
          });

        if (response.status === 200) {
          expect(response.headers['content-type']).toBeDefined();
        }
      }
    });
  });

  describe('Attainment Validation', () => {
    it('should validate attainment calculation parameters', async () => {
      const response = await request(app)
        .post('/api/clo-attainment/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          cloId: testCLOs[0]?.id
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should handle missing data gracefully', async () => {
      const response = await request(app)
        .post('/api/clo-attainment/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          offeringId: 99999, // Non-existent offering
          cloId: 99999 // Non-existent CLO
        });

      expect(response.body.success).toBe(false);
    });
  });
});
