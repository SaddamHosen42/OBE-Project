import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Grid,
} from '@mui/material';

const TranscriptTemplate = ({ data }) => {
  const {
    student,
    institution,
    degree,
    semesters,
    summary,
  } = data;

  return (
    <Card sx={{ maxWidth: 900, mx: 'auto', my: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {institution?.name || 'University Name'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {institution?.address || 'University Address'}
          </Typography>
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            OFFICIAL TRANSCRIPT
          </Typography>
          <Divider sx={{ my: 2 }} />
        </Box>

        {/* Student Information */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Student Name:</strong> {student?.name}
            </Typography>
            <Typography variant="body2">
              <strong>Roll Number:</strong> {student?.roll_no}
            </Typography>
            <Typography variant="body2">
              <strong>Registration Number:</strong> {student?.registration_no}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Degree Program:</strong> {degree?.name}
            </Typography>
            <Typography variant="body2">
              <strong>Department:</strong> {degree?.department}
            </Typography>
            <Typography variant="body2">
              <strong>Session:</strong> {student?.session}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Semester-wise Results */}
        {semesters?.map((semester, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {semester.semester_name} - {semester.session}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell><strong>Course Code</strong></TableCell>
                    <TableCell><strong>Course Title</strong></TableCell>
                    <TableCell align="center"><strong>Credits</strong></TableCell>
                    <TableCell align="center"><strong>Grade</strong></TableCell>
                    <TableCell align="center"><strong>Grade Points</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {semester.courses?.map((course, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{course.course_code}</TableCell>
                      <TableCell>{course.course_title}</TableCell>
                      <TableCell align="center">{course.credits}</TableCell>
                      <TableCell align="center"><strong>{course.grade}</strong></TableCell>
                      <TableCell align="center">{course.grade_points?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell colSpan={2} align="right">
                      <strong>Semester Totals:</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>{semester.total_credits}</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>SGPA: {semester.sgpa?.toFixed(2)}</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>CGPA: {semester.cgpa?.toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />

        {/* Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Academic Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Total Credits Earned:</strong> {summary?.total_credits}
              </Typography>
              <Typography variant="body2">
                <strong>Cumulative GPA (CGPA):</strong> {summary?.cgpa?.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Total Semesters:</strong> {summary?.total_semesters}
              </Typography>
              <Typography variant="body2">
                <strong>Academic Status:</strong> {summary?.status}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Grading Scale */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Grading Scale
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell><strong>Grade</strong></TableCell>
                  <TableCell><strong>Grade Points</strong></TableCell>
                  <TableCell><strong>Marks Range</strong></TableCell>
                  <TableCell><strong>Performance</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>A</TableCell>
                  <TableCell>4.00</TableCell>
                  <TableCell>85-100</TableCell>
                  <TableCell>Excellent</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>B+</TableCell>
                  <TableCell>3.50</TableCell>
                  <TableCell>80-84</TableCell>
                  <TableCell>Very Good</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>B</TableCell>
                  <TableCell>3.00</TableCell>
                  <TableCell>75-79</TableCell>
                  <TableCell>Good</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>C+</TableCell>
                  <TableCell>2.50</TableCell>
                  <TableCell>70-74</TableCell>
                  <TableCell>Above Average</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>C</TableCell>
                  <TableCell>2.00</TableCell>
                  <TableCell>65-69</TableCell>
                  <TableCell>Average</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>D</TableCell>
                  <TableCell>1.00</TableCell>
                  <TableCell>50-64</TableCell>
                  <TableCell>Pass</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>F</TableCell>
                  <TableCell>0.00</TableCell>
                  <TableCell>0-49</TableCell>
                  <TableCell>Fail</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Footer */}
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Divider sx={{ mb: 1, width: '70%', mx: 'auto' }} />
                <Typography variant="body2">
                  Controller of Examinations
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Signature & Stamp
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Divider sx={{ mb: 1, width: '70%', mx: 'auto' }} />
                <Typography variant="body2">
                  Registrar
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Signature & Stamp
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
            Date of Issue: {new Date().toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
            This is a computer-generated transcript and does not require a signature if verified electronically.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

TranscriptTemplate.propTypes = {
  data: PropTypes.shape({
    student: PropTypes.shape({
      name: PropTypes.string,
      roll_no: PropTypes.string,
      registration_no: PropTypes.string,
      session: PropTypes.string,
    }),
    institution: PropTypes.shape({
      name: PropTypes.string,
      address: PropTypes.string,
    }),
    degree: PropTypes.shape({
      name: PropTypes.string,
      department: PropTypes.string,
    }),
    semesters: PropTypes.arrayOf(
      PropTypes.shape({
        semester_name: PropTypes.string,
        session: PropTypes.string,
        total_credits: PropTypes.number,
        sgpa: PropTypes.number,
        cgpa: PropTypes.number,
        courses: PropTypes.arrayOf(
          PropTypes.shape({
            course_code: PropTypes.string,
            course_title: PropTypes.string,
            credits: PropTypes.number,
            grade: PropTypes.string,
            grade_points: PropTypes.number,
          })
        ),
      })
    ),
    summary: PropTypes.shape({
      total_credits: PropTypes.number,
      cgpa: PropTypes.number,
      total_semesters: PropTypes.number,
      status: PropTypes.string,
    }),
  }).isRequired,
};

export default TranscriptTemplate;
