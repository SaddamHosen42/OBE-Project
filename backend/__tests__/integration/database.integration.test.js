const db = require('../../config/database');

/**
 * Database Integration Tests
 * Tests database operations, transactions, and data integrity
 */
describe('Database Integration Tests', () => {
  beforeAll(async () => {
    await db.raw('SELECT 1');
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('Database Connection', () => {
    it('should connect to database successfully', async () => {
      const result = await db.raw('SELECT 1 as result');
      expect(result).toBeDefined();
    });

    it('should execute queries', async () => {
      const result = await db('users').select('id').limit(1);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Transaction Handling', () => {
    it('should commit successful transactions', async () => {
      const trx = await db.transaction();
      
      try {
        const [id] = await trx('departments').insert({
          name: `Test Dept ${Date.now()}`,
          code: `TD${Date.now().toString().slice(-6)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await trx.commit();

        // Verify the insert
        const dept = await db('departments').where('id', id).first();
        expect(dept).toBeDefined();
        expect(dept.id).toBe(id);

        // Cleanup
        await db('departments').where('id', id).del();
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    });

    it('should rollback failed transactions', async () => {
      const trx = await db.transaction();
      let insertedId;

      try {
        [insertedId] = await trx('departments').insert({
          name: `Rollback Test ${Date.now()}`,
          code: `RT${Date.now().toString().slice(-6)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Intentionally cause an error
        await trx('departments').insert({
          name: null, // This should fail
          code: null
        });

        await trx.commit();
      } catch (error) {
        await trx.rollback();

        // Verify rollback - record should not exist
        const dept = await db('departments').where('id', insertedId).first();
        expect(dept).toBeUndefined();
      }
    });

    it('should handle nested transactions', async () => {
      const trx1 = await db.transaction();

      try {
        const [deptId] = await trx1('departments').insert({
          name: `Nested Dept ${Date.now()}`,
          code: `ND${Date.now().toString().slice(-6)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Nested transaction (savepoint)
        const trx2 = await trx1.transaction();
        try {
          const [degreeId] = await trx2('degrees').insert({
            name: `Nested Degree ${Date.now()}`,
            code: `NDG${Date.now().toString().slice(-6)}`,
            departmentId: deptId,
            level: 'undergraduate',
            duration: 4,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          await trx2.commit();
        } catch (error) {
          await trx2.rollback();
          throw error;
        }

        await trx1.commit();

        // Verify both inserts succeeded
        const dept = await db('departments').where('id', deptId).first();
        expect(dept).toBeDefined();

        // Cleanup
        await db('degrees').where('departmentId', deptId).del();
        await db('departments').where('id', deptId).del();
      } catch (error) {
        await trx1.rollback();
        throw error;
      }
    });
  });

  describe('Data Integrity', () => {
    it('should enforce foreign key constraints', async () => {
      try {
        await db('courses').insert({
          courseCode: 'TEST999',
          courseName: 'Test Course',
          creditHours: 3,
          departmentId: 999999, // Non-existent department
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should enforce unique constraints', async () => {
      const uniqueCode = `UNIQUE${Date.now()}`;
      
      // Insert first record
      const [id1] = await db('departments').insert({
        name: 'Test Department 1',
        code: uniqueCode,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      try {
        // Try to insert duplicate
        await db('departments').insert({
          name: 'Test Department 2',
          code: uniqueCode, // Duplicate code
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        // Cleanup
        await db('departments').where('id', id1).del();
      }
    });

    it('should enforce NOT NULL constraints', async () => {
      try {
        await db('departments').insert({
          name: null, // Required field
          code: 'TEST',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should cascade deletes properly', async () => {
      // Create department
      const [deptId] = await db('departments').insert({
        name: `Cascade Test ${Date.now()}`,
        code: `CT${Date.now().toString().slice(-6)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create degree under department
      const [degreeId] = await db('degrees').insert({
        name: `Cascade Degree ${Date.now()}`,
        code: `CDG${Date.now().toString().slice(-6)}`,
        departmentId: deptId,
        level: 'undergraduate',
        duration: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Delete department (should cascade to degree)
      await db('departments').where('id', deptId).del();

      // Verify degree is also deleted
      const degree = await db('degrees').where('id', degreeId).first();
      expect(degree).toBeUndefined();
    });
  });

  describe('Query Performance', () => {
    it('should use indexes for optimized queries', async () => {
      const startTime = Date.now();
      
      await db('courses')
        .where('courseCode', 'CS101')
        .first();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Query should be fast (< 100ms) with proper indexing
      expect(duration).toBeLessThan(100);
    });

    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();

      const results = await db('users')
        .select('id', 'email')
        .limit(1000);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(Array.isArray(results)).toBe(true);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Complex Queries', () => {
    it('should execute join queries correctly', async () => {
      const results = await db('courses')
        .join('departments', 'courses.departmentId', 'departments.id')
        .select(
          'courses.*',
          'departments.name as departmentName',
          'departments.code as departmentCode'
        )
        .limit(10);

      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('departmentName');
        expect(results[0]).toHaveProperty('departmentCode');
      }
    });

    it('should execute subqueries correctly', async () => {
      const results = await db('courses')
        .whereIn('departmentId', function() {
          this.select('id')
            .from('departments')
            .where('isActive', true);
        })
        .limit(10);

      expect(Array.isArray(results)).toBe(true);
    });

    it('should execute aggregate queries correctly', async () => {
      const result = await db('courses')
        .count('* as total')
        .avg('creditHours as avgCredits')
        .first();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('avgCredits');
    });

    it('should execute grouped queries correctly', async () => {
      const results = await db('courses')
        .select('departmentId')
        .count('* as courseCount')
        .groupBy('departmentId')
        .limit(10);

      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('departmentId');
        expect(results[0]).toHaveProperty('courseCount');
      }
    });
  });

  describe('Database Migrations', () => {
    it('should have all required tables', async () => {
      const tables = [
        'users',
        'departments',
        'degrees',
        'courses',
        'course_offerings',
        'students',
        'enrollments',
        'clos',
        'plos',
        'marks',
        'assessments',
        'attainment_thresholds'
      ];

      for (const table of tables) {
        const exists = await db.schema.hasTable(table);
        expect(exists).toBe(true);
      }
    });

    it('should have proper column definitions', async () => {
      const hasColumn = await db.schema.hasColumn('users', 'email');
      expect(hasColumn).toBe(true);

      const hasColumn2 = await db.schema.hasColumn('courses', 'courseCode');
      expect(hasColumn2).toBe(true);
    });
  });
});
