const nodemailer = require('nodemailer');
const pool = require('../config/database');

/**
 * EmailService - Handles email notifications for the OBE system
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@obeproject.edu';
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      // Configure transporter based on environment variables
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Verify transporter configuration
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter.verify((error, success) => {
          if (error) {
            console.error('Email transporter verification failed:', error);
          } else {
            console.log('Email service is ready to send messages');
          }
        });
      } else {
        console.warn('SMTP credentials not configured. Email service will not function.');
      }
    } catch (error) {
      console.error('Error initializing email transporter:', error);
    }
  }

  /**
   * Send a generic email
   * @param {Object} options - Email options {to, subject, text, html}
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(options) {
    try {
      if (!this.transporter) {
        return { success: false, message: 'Email service not configured' };
      }

      const mailOptions = {
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Log email in database
      await this.logEmail(options.to, options.subject, 'sent', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Log failed email
      await this.logEmail(options.to, options.subject, 'failed', null, error.message);

      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Log email in database (optional - for audit trail)
   */
  async logEmail(to, subject, status, messageId = null, errorMessage = null) {
    try {
      await pool.query(`
        INSERT INTO email_logs (recipient, subject, status, message_id, error_message)
        VALUES (?, ?, ?, ?, ?)
      `, [to, subject, status, messageId, errorMessage]);
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }

  /**
   * Send grade notification to student
   * @param {number} studentId - Student ID
   * @param {number} courseOfferingId - Course offering ID
   * @returns {Promise<Object>} Send result
   */
  async sendGradeNotification(studentId, courseOfferingId) {
    try {
      // Get student details
      const [student] = await pool.query(`
        SELECT email, full_name
        FROM students
        WHERE student_id = ?
      `, [studentId]);

      if (student.length === 0) {
        return { success: false, message: 'Student not found' };
      }

      // Get course and grade details
      const [result] = await pool.query(`
        SELECT 
          c.course_code,
          c.course_name,
          cr.letter_grade,
          cr.percentage,
          cr.grade_points,
          s.semester_name
        FROM course_results cr
        INNER JOIN course_offerings co ON cr.course_offering_id = co.course_offering_id
        INNER JOIN courses c ON co.course_id = c.course_id
        INNER JOIN semesters s ON co.semester_id = s.semester_id
        WHERE cr.student_id = ? AND cr.course_offering_id = ?
      `, [studentId, courseOfferingId]);

      if (result.length === 0) {
        return { success: false, message: 'Grade not found' };
      }

      const course = result[0];

      const subject = `Grade Published: ${course.course_code} - ${course.course_name}`;
      const html = `
        <h2>Grade Notification</h2>
        <p>Dear ${student[0].full_name},</p>
        <p>Your grade for the following course has been published:</p>
        <table border="1" cellpadding="10" cellspacing="0">
          <tr>
            <td><strong>Course Code:</strong></td>
            <td>${course.course_code}</td>
          </tr>
          <tr>
            <td><strong>Course Name:</strong></td>
            <td>${course.course_name}</td>
          </tr>
          <tr>
            <td><strong>Semester:</strong></td>
            <td>${course.semester_name}</td>
          </tr>
          <tr>
            <td><strong>Grade:</strong></td>
            <td>${course.letter_grade}</td>
          </tr>
          <tr>
            <td><strong>Percentage:</strong></td>
            <td>${course.percentage.toFixed(2)}%</td>
          </tr>
          <tr>
            <td><strong>Grade Points:</strong></td>
            <td>${course.grade_points}</td>
          </tr>
        </table>
        <p>You can view your detailed results by logging into the student portal.</p>
        <br>
        <p>Best regards,<br>Academic Office</p>
      `;

      return await this.sendEmail({
        to: student[0].email,
        subject: subject,
        html: html
      });
    } catch (error) {
      console.error('Error sending grade notification:', error);
      throw error;
    }
  }

  /**
   * Send assessment reminder to students
   * @param {number} assessmentId - Assessment ID
   * @param {number} daysBefore - Days before assessment
   * @returns {Promise<Object>} Send result
   */
  async sendAssessmentReminder(assessmentId, daysBefore = 3) {
    try {
      // Get assessment details
      const [assessment] = await pool.query(`
        SELECT 
          a.*,
          c.course_code,
          c.course_name,
          at.type_name
        FROM assessments a
        INNER JOIN course_offerings co ON a.course_offering_id = co.course_offering_id
        INNER JOIN courses c ON co.course_id = c.course_id
        INNER JOIN assessment_types at ON a.assessment_type_id = at.assessment_type_id
        WHERE a.assessment_id = ?
      `, [assessmentId]);

      if (assessment.length === 0) {
        return { success: false, message: 'Assessment not found' };
      }

      const assess = assessment[0];

      // Get enrolled students
      const [students] = await pool.query(`
        SELECT s.email, s.full_name
        FROM students s
        INNER JOIN course_enrollments ce ON s.student_id = ce.student_id
        WHERE ce.course_offering_id = ?
      `, [assess.course_offering_id]);

      if (students.length === 0) {
        return { success: false, message: 'No students enrolled' };
      }

      const subject = `Reminder: Upcoming ${assess.type_name} - ${assess.assessment_title}`;
      
      const results = [];
      for (const student of students) {
        const html = `
          <h2>Assessment Reminder</h2>
          <p>Dear ${student.full_name},</p>
          <p>This is a reminder that you have an upcoming assessment:</p>
          <table border="1" cellpadding="10" cellspacing="0">
            <tr>
              <td><strong>Course:</strong></td>
              <td>${assess.course_code} - ${assess.course_name}</td>
            </tr>
            <tr>
              <td><strong>Assessment Type:</strong></td>
              <td>${assess.type_name}</td>
            </tr>
            <tr>
              <td><strong>Assessment Title:</strong></td>
              <td>${assess.assessment_title}</td>
            </tr>
            <tr>
              <td><strong>Date:</strong></td>
              <td>${new Date(assess.assessment_date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Total Marks:</strong></td>
              <td>${assess.total_marks}</td>
            </tr>
            <tr>
              <td><strong>Weightage:</strong></td>
              <td>${assess.weightage}%</td>
            </tr>
          </table>
          <p>Please prepare accordingly and arrive on time.</p>
          <br>
          <p>Best regards,<br>Academic Office</p>
        `;

        const result = await this.sendEmail({
          to: student.email,
          subject: subject,
          html: html
        });

        results.push({
          email: student.email,
          success: result.success
        });
      }

      const successCount = results.filter(r => r.success).length;

      return {
        success: true,
        message: `Reminders sent to ${successCount} out of ${students.length} students`,
        results: results
      };
    } catch (error) {
      console.error('Error sending assessment reminder:', error);
      throw error;
    }
  }

  /**
   * Send enrollment confirmation to student
   * @param {number} enrollmentId - Enrollment ID
   * @returns {Promise<Object>} Send result
   */
  async sendEnrollmentConfirmation(enrollmentId) {
    try {
      // Get enrollment details
      const [enrollment] = await pool.query(`
        SELECT 
          s.email,
          s.full_name,
          c.course_code,
          c.course_name,
          c.credit_hours,
          sem.semester_name,
          asess.session_name
        FROM course_enrollments ce
        INNER JOIN students s ON ce.student_id = s.student_id
        INNER JOIN course_offerings co ON ce.course_offering_id = co.course_offering_id
        INNER JOIN courses c ON co.course_id = c.course_id
        INNER JOIN semesters sem ON co.semester_id = sem.semester_id
        INNER JOIN academic_sessions asess ON co.academic_session_id = asess.academic_session_id
        WHERE ce.enrollment_id = ?
      `, [enrollmentId]);

      if (enrollment.length === 0) {
        return { success: false, message: 'Enrollment not found' };
      }

      const enroll = enrollment[0];

      const subject = `Course Enrollment Confirmation: ${enroll.course_code}`;
      const html = `
        <h2>Enrollment Confirmation</h2>
        <p>Dear ${enroll.full_name},</p>
        <p>Your enrollment has been successfully confirmed for the following course:</p>
        <table border="1" cellpadding="10" cellspacing="0">
          <tr>
            <td><strong>Course Code:</strong></td>
            <td>${enroll.course_code}</td>
          </tr>
          <tr>
            <td><strong>Course Name:</strong></td>
            <td>${enroll.course_name}</td>
          </tr>
          <tr>
            <td><strong>Credit Hours:</strong></td>
            <td>${enroll.credit_hours}</td>
          </tr>
          <tr>
            <td><strong>Semester:</strong></td>
            <td>${enroll.semester_name}</td>
          </tr>
          <tr>
            <td><strong>Academic Session:</strong></td>
            <td>${enroll.session_name}</td>
          </tr>
        </table>
        <p>Please check your course schedule and attend classes regularly.</p>
        <br>
        <p>Best regards,<br>Academic Office</p>
      `;

      return await this.sendEmail({
        to: enroll.email,
        subject: subject,
        html: html
      });
    } catch (error) {
      console.error('Error sending enrollment confirmation:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} resetToken - Password reset token
   * @param {string} resetUrl - Password reset URL
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordResetEmail(email, resetToken, resetUrl) {
    try {
      const subject = 'Password Reset Request';
      const html = `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password.</p>
        <p>Please click the link below to reset your password:</p>
        <p><a href="${resetUrl}?token=${resetToken}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Reset Password</a></p>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}?token=${resetToken}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>OBE System</p>
      `;

      return await this.sendEmail({
        to: email,
        subject: subject,
        html: html
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   * @param {string} email - User email
   * @param {string} fullName - User full name
   * @param {string} role - User role
   * @param {string} temporaryPassword - Temporary password
   * @returns {Promise<Object>} Send result
   */
  async sendWelcomeEmail(email, fullName, role, temporaryPassword) {
    try {
      const subject = 'Welcome to OBE Management System';
      const html = `
        <h2>Welcome to OBE Management System</h2>
        <p>Dear ${fullName},</p>
        <p>Your account has been created successfully!</p>
        <table border="1" cellpadding="10" cellspacing="0">
          <tr>
            <td><strong>Email:</strong></td>
            <td>${email}</td>
          </tr>
          <tr>
            <td><strong>Role:</strong></td>
            <td>${role}</td>
          </tr>
          <tr>
            <td><strong>Temporary Password:</strong></td>
            <td>${temporaryPassword}</td>
          </tr>
        </table>
        <p><strong>Important:</strong> Please change your password after your first login for security reasons.</p>
        <p>You can access the system at: [PORTAL_URL]</p>
        <br>
        <p>Best regards,<br>System Administrator</p>
      `;

      return await this.sendEmail({
        to: email,
        subject: subject,
        html: html
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Send CLO/PLO attainment report to faculty
   * @param {string} facultyEmail - Faculty email
   * @param {string} facultyName - Faculty name
   * @param {string} reportType - Report type (CLO/PLO)
   * @param {string} reportPath - Path to report file
   * @returns {Promise<Object>} Send result
   */
  async sendAttainmentReport(facultyEmail, facultyName, reportType, reportPath) {
    try {
      const subject = `${reportType} Attainment Report Generated`;
      const html = `
        <h2>${reportType} Attainment Report</h2>
        <p>Dear ${facultyName},</p>
        <p>The ${reportType} attainment report you requested has been generated successfully.</p>
        <p>Please find the report attached to this email.</p>
        <p>You can also download it from the system portal.</p>
        <br>
        <p>Best regards,<br>OBE System</p>
      `;

      const mailOptions = {
        to: facultyEmail,
        subject: subject,
        html: html,
        attachments: [
          {
            filename: path.basename(reportPath),
            path: reportPath
          }
        ]
      };

      return await this.sendEmail(mailOptions);
    } catch (error) {
      console.error('Error sending attainment report:', error);
      throw error;
    }
  }

  /**
   * Batch send emails to multiple recipients
   * @param {Array} recipients - Array of recipient objects {email, name, data}
   * @param {string} subject - Email subject
   * @param {Function} templateFunction - Function to generate HTML for each recipient
   * @returns {Promise<Object>} Batch send result
   */
  async batchSendEmails(recipients, subject, templateFunction) {
    try {
      const results = [];

      for (const recipient of recipients) {
        const html = templateFunction(recipient);
        const result = await this.sendEmail({
          to: recipient.email,
          subject: subject,
          html: html
        });

        results.push({
          email: recipient.email,
          success: result.success,
          messageId: result.messageId
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const successCount = results.filter(r => r.success).length;

      return {
        success: true,
        message: `Sent ${successCount} out of ${recipients.length} emails`,
        results: results
      };
    } catch (error) {
      console.error('Error in batch email sending:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
