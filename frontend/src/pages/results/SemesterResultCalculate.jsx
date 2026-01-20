import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSemesterResults } from '../../hooks/useSemesterResults';
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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import SGPACard from '../../components/results/SGPACard';
import CGPAChart from '../../components/results/CGPAChart';

const steps = ['Select Parameters', 'Configure Settings', 'Calculate Results', 'Review & Save'];

const SemesterResultCalculate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { calculateResults, saveResults, loading } = useSemesterResults();
  
  const [activeStep, setActiveStep] = useState(0);
  const [academicSession, setAcademicSession] = useState('');
  const [semester, setSemester] = useState('');
  const [degree, setDegree] = useState('');
  const [gradeScale, setGradeScale] = useState('');
  const [calculationMethod, setCalculationMethod] = useState('credit_weighted');
  const [includeRepeaters, setIncludeRepeaters] = useState(true);
  const [roundingMethod, setRoundingMethod] = useState('nearest');
  const [calculatedResults, setCalculatedResults] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock data for dropdowns
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [gradeScales, setGradeScales] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    // Mock data - replace with actual API calls
    setSessions([
      { id: 1, name: '2025-2026' },
      { id: 2, name: '2024-2025' },
    ]);
    setSemesters([
      { id: 1, name: 'Fall', semester_number: 1 },
      { id: 2, name: 'Spring', semester_number: 2 },
      { id: 3, name: 'Summer', semester_number: 3 },
    ]);
    setDegrees([
      { id: 1, degree_code: 'BSCS', degree_name: 'Bachelor of Science in Computer Science' },
      { id: 2, degree_code: 'BSSE', degree_name: 'Bachelor of Science in Software Engineering' },
    ]);
    setGradeScales([
      { id: 1, scale_name: 'Standard 4.0 Scale' },
      { id: 2, scale_name: 'CGPA Scale' },
    ]);
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep1()) {
      return;
    }
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

  const validateStep1 = () => {
    if (!academicSession || !semester || !degree || !gradeScale) {
      setError('Please select all required fields');
      return false;
    }
    setError('');
    return true;
  };

  const handleCalculate = async () => {
    setError('');
    setSuccess('');
    try {
      const results = await calculateResults({
        academic_session_id: academicSession,
        semester_id: semester,
        degree_id: degree,
        grade_scale_id: gradeScale,
        calculation_method: calculationMethod,
        include_repeaters: includeRepeaters,
        rounding_method: roundingMethod,
      });
      setCalculatedResults(results);
      setActiveStep(3);
      setSuccess('Results calculated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to calculate results');
    }
  };

  const handleSaveResults = async () => {
    setError('');
    setSuccess('');
    try {
      await saveResults({
        academic_session_id: academicSession,
        semester_id: semester,
        degree_id: degree,
        grade_scale_id: gradeScale,
        results: calculatedResults,
        calculation_method: calculationMethod,
        include_repeaters: includeRepeaters,
        rounding_method: roundingMethod,
      });
      setSuccess('Results saved successfully!');
      setTimeout(() => {
        navigate('/results/semester');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save results');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Academic Session"
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                required
              >
                <MenuItem value="">Select Session</MenuItem>
                {sessions.map((session) => (
                  <MenuItem key={session.id} value={session.id}>
                    {session.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
              >
                <MenuItem value="">Select Semester</MenuItem>
                {semesters.map((sem) => (
                  <MenuItem key={sem.id} value={sem.id}>
                    {sem.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Degree Program"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                required
              >
                <MenuItem value="">Select Degree</MenuItem>
                {degrees.map((deg) => (
                  <MenuItem key={deg.id} value={deg.id}>
                    {deg.degree_code} - {deg.degree_name}
                  </MenuItem>
                ))}
              </TextField>
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
                <MenuItem value="">Select Grade Scale</MenuItem>
                {gradeScales.map((scale) => (
                  <MenuItem key={scale.id} value={scale.id}>
                    {scale.scale_name}
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
              <FormControl component="fieldset">
                <FormLabel component="legend">Calculation Method</FormLabel>
                <RadioGroup
                  value={calculationMethod}
                  onChange={(e) => setCalculationMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="credit_weighted"
                    control={<Radio />}
                    label="Credit Weighted Average"
                  />
                  <FormControlLabel
                    value="simple_average"
                    control={<Radio />}
                    label="Simple Average"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Rounding Method</FormLabel>
                <RadioGroup
                  value={roundingMethod}
                  onChange={(e) => setRoundingMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="nearest"
                    control={<Radio />}
                    label="Round to Nearest (e.g., 3.45 → 3.5)"
                  />
                  <FormControlLabel
                    value="down"
                    control={<Radio />}
                    label="Round Down (e.g., 3.49 → 3.4)"
                  />
                  <FormControlLabel
                    value="up"
                    control={<Radio />}
                    label="Round Up (e.g., 3.41 → 3.5)"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeRepeaters}
                    onChange={(e) => setIncludeRepeaters(e.target.checked)}
                  />
                }
                label="Include repeater students in calculation"
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }}>
              Calculating semester results...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This may take a few moments depending on the number of students
            </Typography>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Results calculated successfully! Review the results below and save when ready.
                </Alert>
              </Grid>
              
              {calculatedResults && (
                <>
                  <Grid item xs={12} md={6}>
                    <SGPACard
                      title="Average SGPA"
                      value={calculatedResults.average_sgpa || 0}
                      trend={calculatedResults.sgpa_trend || 0}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <SGPACard
                      title="Average CGPA"
                      value={calculatedResults.average_cgpa || 0}
                      trend={calculatedResults.cgpa_trend || 0}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <CGPAChart data={calculatedResults.distribution || []} />
                  </Grid>

                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Student Results Summary
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Roll No</TableCell>
                                <TableCell>Student Name</TableCell>
                                <TableCell align="center">Credits</TableCell>
                                <TableCell align="center">SGPA</TableCell>
                                <TableCell align="center">CGPA</TableCell>
                                <TableCell align="center">Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {calculatedResults.student_results?.slice(0, 10).map((result) => (
                                <TableRow key={result.student_id}>
                                  <TableCell>{result.roll_no}</TableCell>
                                  <TableCell>{result.student_name}</TableCell>
                                  <TableCell align="center">{result.credits}</TableCell>
                                  <TableCell align="center">{result.sgpa?.toFixed(2)}</TableCell>
                                  <TableCell align="center">{result.cgpa?.toFixed(2)}</TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      label={result.status}
                                      color={result.status === 'pass' ? 'success' : 'error'}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        {calculatedResults.student_results?.length > 10 && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Showing 10 of {calculatedResults.student_results.length} students
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Calculate Semester Results"
        subtitle="Calculate SGPA and CGPA for students"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              startIcon={
                activeStep === 2 ? (
                  <CalculateIcon />
                ) : activeStep === steps.length - 1 ? (
                  <SaveIcon />
                ) : null
              }
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : activeStep === 2 ? (
                'Calculate'
              ) : activeStep === steps.length - 1 ? (
                'Save Results'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SemesterResultCalculate;
