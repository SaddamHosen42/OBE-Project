const pool = require('../config/database');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs').promises;
const path = require('path');

/**
 * ReportService - Handles report generation for OBE system
 */
class ReportService {
  constructor() {
    this.reportsDir = path.join(__dirname, '..', 'reports');
    this.ensureReportsDirectory();
  }

  /**
   * Ensure reports directory exists
   */
  async ensureReportsDirectory() {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating reports directory:', error);
    }
  }

  /**
   * Generate CLO Attainment Report
   * @param {number} courseOfferingId - Course offering ID
   * @param {string} format - Report format (pdf, excel)
   * @returns {Promise<Object>} Report generation result
   */
  async generateCLOAttainmentReport(courseOfferingId, format = 'pdf') {
    try {
      // Get course offering details
      const [courseDetails] = await pool.query(`
        SELECT 
          co.course_offering_id,
          c.course_code,
          c.course_name,
          c.credit_hours,
          s.semester_name,
          asess.session_name,
          asess.start_year,
          asess.end_year,
          d.degree_name,
          dept.department_name
        FROM course_offerings co
        INNER JOIN courses c ON co.course_id = c.course_id
        INNER JOIN semesters s ON co.semester_id = s.semester_id
        INNER JOIN academic_sessions asess ON co.academic_session_id = asess.academic_session_id
        INNER JOIN degrees d ON c.degree_id = d.degree_id
        INNER JOIN departments dept ON d.department_id = dept.department_id
        WHERE co.course_offering_id = ?
      `, [courseOfferingId]);

      if (courseDetails.length === 0) {
        return { success: false, message: 'Course offering not found' };
      }

      const course = courseDetails[0];

      // Get CLO attainment data
      const [cloData] = await pool.query(`
        SELECT 
          ccas.*,
          clo.clo_code,
          clo.clo_description,
          clo.bloom_level
        FROM course_clo_attainment_summary ccas
        INNER JOIN course_learning_outcomes clo ON ccas.clo_id = clo.clo_id
        WHERE ccas.course_offering_id = ?
        ORDER BY clo.clo_code
      `, [courseOfferingId]);

      if (format === 'pdf') {
        return await this.generateCLOAttainmentPDF(course, cloData);
      } else if (format === 'excel') {
        return await this.generateCLOAttainmentExcel(course, cloData);
      } else {
        return { success: false, message: 'Unsupported format' };
      }
    } catch (error) {
      console.error('Error generating CLO attainment report:', error);
      throw error;
    }
  }

  /**
   * Generate CLO Attainment PDF Report
   */
  async generateCLOAttainmentPDF(course, cloData) {
    const filename = `CLO_Attainment_${course.course_code}_${Date.now()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = require('fs').createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('CLO Attainment Report', { align: 'center' });
        doc.moveDown();

        // Course Information
        doc.fontSize(12);
        doc.text(`Course Code: ${course.course_code}`);
        doc.text(`Course Name: ${course.course_name}`);
        doc.text(`Credit Hours: ${course.credit_hours}`);
        doc.text(`Semester: ${course.semester_name}`);
        doc.text(`Academic Session: ${course.session_name} (${course.start_year}-${course.end_year})`);
        doc.text(`Degree: ${course.degree_name}`);
        doc.text(`Department: ${course.department_name}`);
        doc.moveDown();

        // CLO Attainment Table
        doc.fontSize(14).text('CLO Attainment Summary', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(10);
        const tableTop = doc.y;
        const itemHeight = 25;

        // Table Headers
        doc.text('CLO', 50, tableTop);
        doc.text('Description', 100, tableTop, { width: 200 });
        doc.text('Direct', 310, tableTop);
        doc.text('Indirect', 360, tableTop);
        doc.text('Combined', 420, tableTop);
        doc.text('Status', 480, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table Data
        let currentY = tableTop + 20;
        cloData.forEach((clo, index) => {
          doc.text(clo.clo_code, 50, currentY);
          doc.text(clo.clo_description.substring(0, 50) + '...', 100, currentY, { width: 200 });
          doc.text(`${clo.direct_attainment.toFixed(2)}%`, 310, currentY);
          doc.text(`${clo.indirect_attainment.toFixed(2)}%`, 360, currentY);
          doc.text(`${clo.combined_attainment.toFixed(2)}%`, 420, currentY);
          doc.text(clo.attained ? 'Attained' : 'Not Attained', 480, currentY);

          currentY += itemHeight;

          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }
        });

        // Summary Statistics
        doc.moveDown();
        const totalCLOs = cloData.length;
        const attainedCLOs = cloData.filter(c => c.attained).length;
        const attainmentRate = totalCLOs > 0 ? (attainedCLOs / totalCLOs * 100).toFixed(2) : 0;

        doc.fontSize(12);
        doc.text(`\nTotal CLOs: ${totalCLOs}`);
        doc.text(`Attained CLOs: ${attainedCLOs}`);
        doc.text(`Attainment Rate: ${attainmentRate}%`);

        // Footer
        doc.fontSize(8).text(
          `Generated on: ${new Date().toLocaleString()}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

        doc.end();

        stream.on('finish', () => {
          resolve({
            success: true,
            data: {
              filename: filename,
              filepath: filepath,
              format: 'pdf'
            }
          });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate CLO Attainment Excel Report
   */
  async generateCLOAttainmentExcel(course, cloData) {
    const filename = `CLO_Attainment_${course.course_code}_${Date.now()}.xlsx`;
    const filepath = path.join(this.reportsDir, filename);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('CLO Attainment');

    // Title
    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = 'CLO Attainment Report';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Course Information
    let row = 3;
    worksheet.getCell(`A${row}`).value = 'Course Code:';
    worksheet.getCell(`B${row}`).value = course.course_code;
    row++;
    worksheet.getCell(`A${row}`).value = 'Course Name:';
    worksheet.getCell(`B${row}`).value = course.course_name;
    row++;
    worksheet.getCell(`A${row}`).value = 'Semester:';
    worksheet.getCell(`B${row}`).value = course.semester_name;
    row++;
    worksheet.getCell(`A${row}`).value = 'Academic Session:';
    worksheet.getCell(`B${row}`).value = `${course.session_name} (${course.start_year}-${course.end_year})`;
    row += 2;

    // Headers
    const headerRow = worksheet.getRow(row);
    headerRow.values = ['CLO Code', 'Description', 'Direct Attainment', 'Indirect Attainment', 'Combined Attainment', 'Threshold', 'Status'];
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    row++;

    // Data
    cloData.forEach(clo => {
      const dataRow = worksheet.getRow(row);
      dataRow.values = [
        clo.clo_code,
        clo.clo_description,
        `${clo.direct_attainment.toFixed(2)}%`,
        `${clo.indirect_attainment.toFixed(2)}%`,
        `${clo.combined_attainment.toFixed(2)}%`,
        `${clo.threshold.toFixed(2)}%`,
        clo.attained ? 'Attained' : 'Not Attained'
      ];

      // Color code status
      if (clo.attained) {
        dataRow.getCell(7).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF90EE90' }
        };
      } else {
        dataRow.getCell(7).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF6B6B' }
        };
      }

      row++;
    });

    // Summary
    row += 2;
    const totalCLOs = cloData.length;
    const attainedCLOs = cloData.filter(c => c.attained).length;
    const attainmentRate = totalCLOs > 0 ? (attainedCLOs / totalCLOs * 100).toFixed(2) : 0;

    worksheet.getCell(`A${row}`).value = 'Summary:';
    worksheet.getCell(`A${row}`).font = { bold: true };
    row++;
    worksheet.getCell(`A${row}`).value = 'Total CLOs:';
    worksheet.getCell(`B${row}`).value = totalCLOs;
    row++;
    worksheet.getCell(`A${row}`).value = 'Attained CLOs:';
    worksheet.getCell(`B${row}`).value = attainedCLOs;
    row++;
    worksheet.getCell(`A${row}`).value = 'Attainment Rate:';
    worksheet.getCell(`B${row}`).value = `${attainmentRate}%`;

    // Column widths
    worksheet.columns = [
      { width: 12 },
      { width: 50 },
      { width: 18 },
      { width: 18 },
      { width: 20 },
      { width: 12 },
      { width: 15 }
    ];

    await workbook.xlsx.writeFile(filepath);

    return {
      success: true,
      data: {
        filename: filename,
        filepath: filepath,
        format: 'excel'
      }
    };
  }

  /**
   * Generate PLO Attainment Report
   * @param {number} degreeId - Degree/Program ID
   * @param {number} academicSessionId - Academic session ID
   * @param {string} format - Report format
   * @returns {Promise<Object>} Report generation result
   */
  async generatePLOAttainmentReport(degreeId, academicSessionId, format = 'pdf') {
    try {
      // Get program details
      const [programDetails] = await pool.query(`
        SELECT 
          d.degree_id,
          d.degree_name,
          d.degree_level,
          dept.department_name,
          asess.session_name,
          asess.start_year,
          asess.end_year
        FROM degrees d
        INNER JOIN departments dept ON d.department_id = dept.department_id
        CROSS JOIN academic_sessions asess
        WHERE d.degree_id = ? AND asess.academic_session_id = ?
      `, [degreeId, academicSessionId]);

      if (programDetails.length === 0) {
        return { success: false, message: 'Program not found' };
      }

      const program = programDetails[0];

      // Get PLO attainment data
      const [ploData] = await pool.query(`
        SELECT 
          ppas.*,
          plo.plo_code,
          plo.plo_description
        FROM program_plo_attainment_summary ppas
        INNER JOIN program_learning_outcomes plo ON ppas.plo_id = plo.plo_id
        WHERE ppas.degree_id = ? AND ppas.academic_session_id = ?
        ORDER BY plo.plo_code
      `, [degreeId, academicSessionId]);

      if (format === 'pdf') {
        return await this.generatePLOAttainmentPDF(program, ploData);
      } else if (format === 'excel') {
        return await this.generatePLOAttainmentExcel(program, ploData);
      } else {
        return { success: false, message: 'Unsupported format' };
      }
    } catch (error) {
      console.error('Error generating PLO attainment report:', error);
      throw error;
    }
  }

  /**
   * Generate PLO Attainment PDF Report
   */
  async generatePLOAttainmentPDF(program, ploData) {
    const filename = `PLO_Attainment_${program.degree_name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = require('fs').createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('PLO Attainment Report', { align: 'center' });
        doc.moveDown();

        // Program Information
        doc.fontSize(12);
        doc.text(`Program: ${program.degree_name}`);
        doc.text(`Level: ${program.degree_level}`);
        doc.text(`Department: ${program.department_name}`);
        doc.text(`Academic Session: ${program.session_name} (${program.start_year}-${program.end_year})`);
        doc.moveDown();

        // PLO Attainment Table
        doc.fontSize(14).text('PLO Attainment Summary', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(10);
        const tableTop = doc.y;
        const itemHeight = 25;

        // Table Headers
        doc.text('PLO', 50, tableTop);
        doc.text('Description', 100, tableTop, { width: 250 });
        doc.text('Attainment', 360, tableTop);
        doc.text('Threshold', 430, tableTop);
        doc.text('Status', 500, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table Data
        let currentY = tableTop + 20;
        ploData.forEach(plo => {
          doc.text(plo.plo_code, 50, currentY);
          doc.text(plo.plo_description.substring(0, 60) + '...', 100, currentY, { width: 250 });
          doc.text(`${plo.attainment.toFixed(2)}%`, 360, currentY);
          doc.text(`${plo.threshold.toFixed(2)}%`, 430, currentY);
          doc.text(plo.attained ? 'Attained' : 'Not Attained', 500, currentY);

          currentY += itemHeight;

          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }
        });

        // Summary
        doc.moveDown();
        const totalPLOs = ploData.length;
        const attainedPLOs = ploData.filter(p => p.attained).length;
        const attainmentRate = totalPLOs > 0 ? (attainedPLOs / totalPLOs * 100).toFixed(2) : 0;

        doc.fontSize(12);
        doc.text(`\nTotal PLOs: ${totalPLOs}`);
        doc.text(`Attained PLOs: ${attainedPLOs}`);
        doc.text(`Attainment Rate: ${attainmentRate}%`);

        // Footer
        doc.fontSize(8).text(
          `Generated on: ${new Date().toLocaleString()}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

        doc.end();

        stream.on('finish', () => {
          resolve({
            success: true,
            data: {
              filename: filename,
              filepath: filepath,
              format: 'pdf'
            }
          });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate PLO Attainment Excel Report
   */
  async generatePLOAttainmentExcel(program, ploData) {
    const filename = `PLO_Attainment_${program.degree_name.replace(/\s+/g, '_')}_${Date.now()}.xlsx`;
    const filepath = path.join(this.reportsDir, filename);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('PLO Attainment');

    // Title
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'PLO Attainment Report';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Program Information
    let row = 3;
    worksheet.getCell(`A${row}`).value = 'Program:';
    worksheet.getCell(`B${row}`).value = program.degree_name;
    row++;
    worksheet.getCell(`A${row}`).value = 'Department:';
    worksheet.getCell(`B${row}`).value = program.department_name;
    row++;
    worksheet.getCell(`A${row}`).value = 'Academic Session:';
    worksheet.getCell(`B${row}`).value = `${program.session_name} (${program.start_year}-${program.end_year})`;
    row += 2;

    // Headers
    const headerRow = worksheet.getRow(row);
    headerRow.values = ['PLO Code', 'Description', 'Attainment', 'Threshold', 'Status'];
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    row++;

    // Data
    ploData.forEach(plo => {
      const dataRow = worksheet.getRow(row);
      dataRow.values = [
        plo.plo_code,
        plo.plo_description,
        `${plo.attainment.toFixed(2)}%`,
        `${plo.threshold.toFixed(2)}%`,
        plo.attained ? 'Attained' : 'Not Attained'
      ];

      // Color code status
      if (plo.attained) {
        dataRow.getCell(5).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF90EE90' }
        };
      } else {
        dataRow.getCell(5).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF6B6B' }
        };
      }

      row++;
    });

    // Summary
    row += 2;
    const totalPLOs = ploData.length;
    const attainedPLOs = ploData.filter(p => p.attained).length;
    const attainmentRate = totalPLOs > 0 ? (attainedPLOs / totalPLOs * 100).toFixed(2) : 0;

    worksheet.getCell(`A${row}`).value = 'Summary:';
    worksheet.getCell(`A${row}`).font = { bold: true };
    row++;
    worksheet.getCell(`A${row}`).value = 'Total PLOs:';
    worksheet.getCell(`B${row}`).value = totalPLOs;
    row++;
    worksheet.getCell(`A${row}`).value = 'Attained PLOs:';
    worksheet.getCell(`B${row}`).value = attainedPLOs;
    row++;
    worksheet.getCell(`A${row}`).value = 'Attainment Rate:';
    worksheet.getCell(`B${row}`).value = `${attainmentRate}%`;

    // Column widths
    worksheet.columns = [
      { width: 12 },
      { width: 60 },
      { width: 15 },
      { width: 12 },
      { width: 15 }
    ];

    await workbook.xlsx.writeFile(filepath);

    return {
      success: true,
      data: {
        filename: filename,
        filepath: filepath,
        format: 'excel'
      }
    };
  }

  /**
   * Generate Student Transcript
   * @param {number} studentId - Student ID
   * @param {string} format - Report format
   * @returns {Promise<Object>} Transcript generation result
   */
  async generateStudentTranscript(studentId, format = 'pdf') {
    try {
      // Get student details
      const [studentDetails] = await pool.query(`
        SELECT 
          s.*,
          d.degree_name,
          dept.department_name
        FROM students s
        INNER JOIN degrees d ON s.degree_id = d.degree_id
        INNER JOIN departments dept ON d.department_id = dept.department_id
        WHERE s.student_id = ?
      `, [studentId]);

      if (studentDetails.length === 0) {
        return { success: false, message: 'Student not found' };
      }

      const student = studentDetails[0];

      // Get all semester results
      const [semesterResults] = await pool.query(`
        SELECT 
          sr.*,
          s.semester_name
        FROM semester_results sr
        INNER JOIN semesters s ON sr.semester_id = s.semester_id
        WHERE sr.student_id = ?
        ORDER BY s.semester_name
      `, [studentId]);

      // Get all course results
      const [courseResults] = await pool.query(`
        SELECT 
          cr.*,
          c.course_code,
          c.course_name,
          c.credit_hours,
          s.semester_name
        FROM course_results cr
        INNER JOIN course_offerings co ON cr.course_offering_id = co.course_offering_id
        INNER JOIN courses c ON co.course_id = c.course_id
        INNER JOIN semesters s ON co.semester_id = s.semester_id
        WHERE cr.student_id = ?
        ORDER BY s.semester_name, c.course_code
      `, [studentId]);

      if (format === 'pdf') {
        return await this.generateTranscriptPDF(student, semesterResults, courseResults);
      } else {
        return { success: false, message: 'Only PDF format supported for transcripts' };
      }
    } catch (error) {
      console.error('Error generating transcript:', error);
      throw error;
    }
  }

  /**
   * Generate Transcript PDF
   */
  async generateTranscriptPDF(student, semesterResults, courseResults) {
    const filename = `Transcript_${student.registration_no}_${Date.now()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = require('fs').createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('Academic Transcript', { align: 'center' });
        doc.moveDown();

        // Student Information
        doc.fontSize(12);
        doc.text(`Registration No: ${student.registration_no}`);
        doc.text(`Name: ${student.full_name}`);
        doc.text(`Program: ${student.degree_name}`);
        doc.text(`Department: ${student.department_name}`);
        doc.text(`Email: ${student.email}`);
        doc.moveDown();

        // Group courses by semester
        const coursesBySemester = {};
        courseResults.forEach(course => {
          if (!coursesBySemester[course.semester_name]) {
            coursesBySemester[course.semester_name] = [];
          }
          coursesBySemester[course.semester_name].push(course);
        });

        // Display courses by semester
        doc.fontSize(14).text('Semester-wise Results', { underline: true });
        doc.moveDown(0.5);

        Object.keys(coursesBySemester).forEach(semester => {
          doc.fontSize(12).text(semester, { bold: true });
          doc.fontSize(10);

          const courses = coursesBySemester[semester];
          courses.forEach(course => {
            doc.text(
              `${course.course_code} - ${course.course_name} (${course.credit_hours} CH): ${course.letter_grade} (${course.grade_points})`
            );
          });

          const semResult = semesterResults.find(sr => 
            courses[0] && sr.semester_id === courses[0].semester_id
          );

          if (semResult) {
            doc.text(`Semester GPA: ${semResult.gpa}`, { bold: true });
          }

          doc.moveDown();
        });

        // Calculate and display CGPA
        const totalCredits = semesterResults.reduce((sum, sr) => sum + sr.total_credit_hours, 0);
        const totalWeightedGPA = semesterResults.reduce((sum, sr) => sum + (sr.gpa * sr.total_credit_hours), 0);
        const cgpa = totalCredits > 0 ? (totalWeightedGPA / totalCredits).toFixed(2) : 0;

        doc.fontSize(14).text('\nOverall Performance', { underline: true });
        doc.fontSize(12);
        doc.text(`Total Credit Hours: ${totalCredits}`);
        doc.text(`Cumulative GPA: ${cgpa}`);

        // Footer
        doc.fontSize(8).text(
          `Generated on: ${new Date().toLocaleString()}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

        doc.end();

        stream.on('finish', () => {
          resolve({
            success: true,
            data: {
              filename: filename,
              filepath: filepath,
              format: 'pdf'
            }
          });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ReportService();
