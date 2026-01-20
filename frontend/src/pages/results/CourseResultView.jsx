import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseResults } from '../../hooks/useCourseResults';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Edit as EditIcon,
  Publish as PublishIcon,
  Print as PrintIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import ResultTable from '../../components/results/ResultTable';
import ResultStats from '../../components/results/ResultStats';
import GradeDistribution from '../../components/results/GradeDistribution';

const CourseResultView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getResultById, exportResults, loading } = useCourseResults();
  
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadResult();
    }
  }, [id]);

  const loadResult = async () => {
    try {
      const data = await getResultById(id);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to load result');
    }
  };

  const handleExport = async (format) => {
    try {
      await exportResults(id, format);
    } catch (err) {
      setError(err.message || 'Failed to export results');
    }
  };

  const handlePublish = () => {
    navigate(`/results/course/publish/${id}`);
  };

  const handleEdit = () => {
    navigate(`/results/course/calculate/${id}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      calculated: 'info',
      published: 'success',
      finalized: 'primary',
    };
    return colors[status] || 'default';
  };

  if (loading || !result) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Course Result Details"
        subtitle={`${result.course_code} - ${result.course_title}`}
        backButton
        action={
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('pdf')}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('excel')}
            >
              Export Excel
            </Button>
            {result.status === 'draft' && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            )}
            {result.status === 'calculated' && (
              <Button
                variant="contained"
                startIcon={<PublishIcon />}
                onClick={handlePublish}
              >
                Publish
              </Button>
            )}
          </Box>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Course Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Course Code
              </Typography>
              <Typography variant="h6">{result.course_code}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Course Title
              </Typography>
              <Typography variant="h6">{result.course_title}</Typography>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Session
              </Typography>
              <Typography variant="h6">
                {result.session} - {result.semester}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Chip
                label={result.status}
                color={getStatusColor(result.status)}
                sx={{ mt: 0.5 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Instructor
              </Typography>
              <Typography variant="body1">{result.instructor_name || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Department
              </Typography>
              <Typography variant="body1">{result.department_name || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Calculation Date
              </Typography>
              <Typography variant="body1">
                {result.calculation_date
                  ? new Date(result.calculation_date).toLocaleDateString()
                  : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Published Date
              </Typography>
              <Typography variant="body1">
                {result.publish_date
                  ? new Date(result.publish_date).toLocaleDateString()
                  : 'Not Published'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Student Results" />
          <Tab label="Statistics" />
          <Tab label="Grade Distribution" />
          <Tab label="CLO Attainment" />
        </Tabs>

        <CardContent>
          {/* Tab 0: Student Results */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Student Results
              </Typography>
              <ResultTable results={result.student_results || []} />
            </Box>
          )}

          {/* Tab 1: Statistics */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Result Statistics
              </Typography>
              <ResultStats results={result} />
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Performance Metrics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Highest Marks
                          </Typography>
                          <Typography variant="h6">
                            {result.highest_marks || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Lowest Marks
                          </Typography>
                          <Typography variant="h6">
                            {result.lowest_marks || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Standard Deviation
                          </Typography>
                          <Typography variant="h6">
                            {result.std_deviation?.toFixed(2) || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Median
                          </Typography>
                          <Typography variant="h6">
                            {result.median_marks || 0}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Grade Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            A Grades
                          </Typography>
                          <Typography variant="h6">
                            {result.grade_counts?.A || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            B Grades
                          </Typography>
                          <Typography variant="h6">
                            {result.grade_counts?.B || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            C Grades
                          </Typography>
                          <Typography variant="h6">
                            {result.grade_counts?.C || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            F Grades
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            {result.grade_counts?.F || 0}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Tab 2: Grade Distribution */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Grade Distribution
              </Typography>
              <GradeDistribution results={result} />
            </Box>
          )}

          {/* Tab 3: CLO Attainment */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                CLO Attainment Analysis
              </Typography>
              <Alert severity="info">
                CLO attainment data will be displayed here based on assessment results.
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseResultView;
