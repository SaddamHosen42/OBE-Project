import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Divider,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useRubricScoring } from '../../hooks/useRubricScoring';
import RubricScoreCard from '../../components/scoring/RubricScoreCard';

const RubricScoring = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const {
    rubrics,
    students,
    scores,
    loading,
    error,
    fetchRubricsAndStudents,
    saveScore,
    saveAllScores,
  } = useRubricScoring(assessmentId);

  const [localScores, setLocalScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (assessmentId) {
      fetchRubricsAndStudents();
    }
  }, [assessmentId, fetchRubricsAndStudents]);

  useEffect(() => {
    // Initialize local scores from fetched scores
    if (scores && scores.length > 0) {
      const scoresMap = {};
      scores.forEach((score) => {
        const key = `${score.student_id}-${score.rubric_id}`;
        scoresMap[key] = {
          scoreLevel: score.score_level,
          comments: score.comments || '',
          id: score.id,
        };
      });
      setLocalScores(scoresMap);
    }
  }, [scores]);

  const handleScoreChange = (studentId, rubricId, scoreLevel, comments) => {
    const key = `${studentId}-${rubricId}`;
    setLocalScores((prev) => ({
      ...prev,
      [key]: {
        scoreLevel,
        comments,
        id: prev[key]?.id,
      },
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const scoresToSave = Object.entries(localScores).map(([key, value]) => {
        const [studentId, rubricId] = key.split('-');
        return {
          id: value.id,
          student_id: parseInt(studentId),
          rubric_id: parseInt(rubricId),
          assessment_id: parseInt(assessmentId),
          score_level: value.scoreLevel,
          comments: value.comments,
        };
      });

      await saveAllScores(scoresToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving scores:', err);
    } finally {
      setSaving(false);
    }
  };

  const getCompletionStats = () => {
    if (!students || !rubrics) return { completed: 0, total: 0, percentage: 0 };

    const total = students.length * rubrics.length;
    const completed = Object.keys(localScores).filter(
      (key) => localScores[key].scoreLevel !== null && localScores[key].scoreLevel !== undefined
    ).length;

    return {
      completed,
      total,
      percentage: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const stats = getCompletionStats();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/assessments')}
          sx={{ textDecoration: 'none' }}
        >
          Assessments
        </Link>
        <Typography color="text.primary">Rubric Scoring</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/assessments')}
              variant="outlined"
            >
              Back
            </Button>
            <Box>
              <Typography variant="h4" gutterBottom>
                Rubric Scoring
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Score students using rubric criteria
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveAll}
              disabled={saving || Object.keys(localScores).length === 0}
            >
              {saving ? 'Saving...' : 'Save All Scores'}
            </Button>
          </Box>
        </Box>

        {/* Progress Stats */}
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <AssessmentIcon color="primary" />
              <Box flex={1}>
                <Typography variant="h6">Scoring Progress</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.completed} of {stats.total} scores completed ({stats.percentage}%)
                </Typography>
              </Box>
              <Chip
                label={`${stats.percentage}%`}
                color={stats.percentage === '100.0' ? 'success' : 'primary'}
                size="large"
              />
            </Box>
          </CardContent>
        </Card>

        {saveSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            All scores saved successfully!
          </Alert>
        )}
      </Paper>

      {/* Rubrics Info */}
      {rubrics && rubrics.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Assessment Rubrics ({rubrics.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {rubrics.map((rubric) => (
              <Grid item xs={12} md={6} key={rubric.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {rubric.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {rubric.description}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip size="small" label={`Max Score: ${rubric.max_score}`} />
                      <Chip
                        size="small"
                        label={`Weightage: ${rubric.weightage}%`}
                        color="primary"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Student Scoring Grid */}
      {students && students.length > 0 ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Student Scoring ({students.length} students)
          </Typography>
          <Grid container spacing={2}>
            {students.map((student) => (
              <Grid item xs={12} key={student.id}>
                <RubricScoreCard
                  student={student}
                  rubrics={rubrics}
                  scores={localScores}
                  onScoreChange={handleScoreChange}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Alert severity="info">
          No students enrolled in this assessment. Please check the enrollment data.
        </Alert>
      )}
    </Container>
  );
};

export default RubricScoring;
