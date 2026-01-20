import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseResults } from '../../hooks/useCourseResults';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import ResultStats from '../../components/results/ResultStats';
import GradeDistribution from '../../components/results/GradeDistribution';

const steps = ['Select Course', 'Configure Settings', 'Calculate Results', 'Review & Save'];

const CourseResultCalculate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { calculateResults, loading } = useCourseResults();
  
  const [activeStep, setActiveStep] = useState(0);
  const [courseOffering, setCourseOffering] = useState('');
  const [gradeScale, setGradeScale] = useState('');
  const [calculationMethod, setCalculationMethod] = useState('weighted');
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [gradeScales, setGradeScales] = useState([]);
  const [calculatedResults, setCalculatedResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch course offerings and grade scales
    fetchCourseOfferings();
    fetchGradeScales();
  }, []);

  const fetchCourseOfferings = async () => {
    // API call to fetch course offerings
    // Mock data for now
    setCourseOfferings([
      { id: 1, course_code: 'CS101', course_title: 'Programming Fundamentals', session: '2025-2026', semester: 'Fall' },
      { id: 2, course_code: 'CS201', course_title: 'Data Structures', session: '2025-2026', semester: 'Fall' },
    ]);
  };

  const fetchGradeScales = async () => {
    // API call to fetch grade scales
    // Mock data for now
    setGradeScales([
      { id: 1, scale_name: 'Standard 4.0 Scale' },
      { id: 2, scale_name: 'CGPA Scale' },
    ]);
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSaveResults();
    } else if (activeStep === 2) {
      handleCalculate();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCalculate = async () => {
    setError('');
    try {
      const results = await calculateResults({
        course_offering_id: courseOffering,
        grade_scale_id: gradeScale,
        calculation_method: calculationMethod,
      });
      setCalculatedResults(results);
      setActiveStep(3);
    } catch (err) {
      setError(err.message || 'Failed to calculate results');
    }
  };

  const handleSaveResults = async () => {
    try {
      // Save results logic
      navigate('/results/course');
    } catch (err) {
      setError(err.message || 'Failed to save results');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Course Offering
              </Typography>
              <TextField
                fullWidth
                select
                label="Course Offering"
                value={courseOffering}
                onChange={(e) => setCourseOffering(e.target.value)}
                required
              >
                <MenuItem value="">Select a course</MenuItem>
                {courseOfferings.map((offering) => (
                  <MenuItem key={offering.id} value={offering.id}>
                    {offering.course_code} - {offering.course_title} ({offering.session} {offering.semester})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Configure Calculation Settings
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Grade Scale"
                value={gradeScale}
                onChange={(e) => setGradeScale(e.target.value)}
                required
              >
                <MenuItem value="">Select grade scale</MenuItem>
                {gradeScales.map((scale) => (
                  <MenuItem key={scale.id} value={scale.id}>
                    {scale.scale_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Calculation Method"
                value={calculationMethod}
                onChange={(e) => setCalculationMethod(e.target.value)}
                required
              >
                <MenuItem value="weighted">Weighted Average</MenuItem>
                <MenuItem value="simple">Simple Average</MenuItem>
                <MenuItem value="best_of">Best of N</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Results will be calculated based on assessment marks and the selected grade scale.
              </Alert>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }}>
              Calculating Results...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This may take a few moments
            </Typography>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Calculated Results
            </Typography>

            {calculatedResults && (
              <>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <ResultStats results={calculatedResults} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <GradeDistribution results={calculatedResults} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Summary
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Total Students
                            </Typography>
                            <Typography variant="h5">
                              {calculatedResults.total_students || 0}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Pass Percentage
                            </Typography>
                            <Typography variant="h5" color="success.main">
                              {calculatedResults.passing_percentage?.toFixed(1) || 0}%
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Average Marks
                            </Typography>
                            <Typography variant="h5">
                              {calculatedResults.average_marks?.toFixed(2) || 0}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Highest Marks
                            </Typography>
                            <Typography variant="h5">
                              {calculatedResults.highest_marks || 0}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Student Results Preview
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll No</TableCell>
                        <TableCell>Student Name</TableCell>
                        <TableCell align="center">Total Marks</TableCell>
                        <TableCell align="center">Percentage</TableCell>
                        <TableCell align="center">Grade</TableCell>
                        <TableCell align="center">GPA</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {calculatedResults.student_results?.slice(0, 10).map((student) => (
                        <TableRow key={student.student_id}>
                          <TableCell>{student.roll_no}</TableCell>
                          <TableCell>{student.student_name}</TableCell>
                          <TableCell align="center">{student.total_marks}</TableCell>
                          <TableCell align="center">{student.percentage?.toFixed(2)}%</TableCell>
                          <TableCell align="center">{student.letter_grade}</TableCell>
                          <TableCell align="center">{student.gpa}</TableCell>
                          <TableCell align="center">{student.pass_status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {calculatedResults.student_results?.length > 10 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Showing 10 of {calculatedResults.student_results.length} students
                  </Typography>
                )}
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Calculate Course Results"
        subtitle="Calculate and review student results"
        backButton
      />

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                loading ||
                (activeStep === 0 && !courseOffering) ||
                (activeStep === 1 && (!gradeScale || !calculationMethod))
              }
              startIcon={
                activeStep === 2 ? (
                  <CalculateIcon />
                ) : activeStep === 3 ? (
                  <SaveIcon />
                ) : null
              }
            >
              {activeStep === steps.length - 1
                ? 'Save Results'
                : activeStep === 2
                ? 'Calculate'
                : 'Next'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseResultCalculate;
