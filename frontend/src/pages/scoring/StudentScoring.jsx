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
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useRubricScoring } from '../../hooks/useRubricScoring';
import ScoreLevelSelector from '../../components/scoring/ScoreLevelSelector';

const StudentScoring = () => {
  const { assessmentId, studentId } = useParams();
  const navigate = useNavigate();
  const {
    rubrics,
    student,
    scores,
    loading,
    error,
    fetchStudentScoring,
    saveScore,
  } = useRubricScoring(assessmentId, studentId);

  const [localScores, setLocalScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (assessmentId && studentId) {
      fetchStudentScoring();
    }
  }, [assessmentId, studentId, fetchStudentScoring]);

  useEffect(() => {
    // Initialize local scores from fetched scores
    if (scores && scores.length > 0) {
      const scoresMap = {};
      scores.forEach((score) => {
        scoresMap[score.rubric_id] = {
          scoreLevel: score.score_level,
          comments: score.comments || '',
          id: score.id,
        };
      });
      setLocalScores(scoresMap);
    }
  }, [scores]);

  const handleScoreChange = (rubricId, scoreLevel) => {
    setLocalScores((prev) => ({
      ...prev,
      [rubricId]: {
        ...prev[rubricId],
        scoreLevel,
      },
    }));
  };

  const handleCommentsChange = (rubricId, comments) => {
    setLocalScores((prev) => ({
      ...prev,
      [rubricId]: {
        ...prev[rubricId],
        comments,
      },
    }));
  };

  const handleSaveScore = async (rubricId) => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const scoreData = localScores[rubricId];
      await saveScore({
        id: scoreData?.id,
        student_id: parseInt(studentId),
        rubric_id: rubricId,
        assessment_id: parseInt(assessmentId),
        score_level: scoreData.scoreLevel,
        comments: scoreData.comments,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving score:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const savePromises = rubrics.map(async (rubric) => {
        const scoreData = localScores[rubric.id];
        if (scoreData && (scoreData.scoreLevel !== null && scoreData.scoreLevel !== undefined)) {
          return saveScore({
            id: scoreData?.id,
            student_id: parseInt(studentId),
            rubric_id: rubric.id,
            assessment_id: parseInt(assessmentId),
            score_level: scoreData.scoreLevel,
            comments: scoreData.comments,
          });
        }
      });

      await Promise.all(savePromises);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving scores:', err);
    } finally {
      setSaving(false);
    }
  };

  const calculateTotalScore = () => {
    if (!rubrics) return { total: 0, max: 0, weighted: 0 };

    let totalScore = 0;
    let maxScore = 0;
    let weightedScore = 0;

    rubrics.forEach((rubric) => {
      const score = localScores[rubric.id];
      if (score && score.scoreLevel !== null && score.scoreLevel !== undefined) {
        totalScore += score.scoreLevel;
        weightedScore += (score.scoreLevel / rubric.max_score) * rubric.weightage;
      }
      maxScore += rubric.max_score;
    });

    return {
      total: totalScore,
      max: maxScore,
      weighted: weightedScore.toFixed(2),
      percentage: maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(1) : 0,
    };
  };

  const getCompletionStats = () => {
    if (!rubrics) return { completed: 0, total: 0, percentage: 0 };

    const total = rubrics.length;
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

  const totalScore = calculateTotalScore();
  const stats = getCompletionStats();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(`/assessments/${assessmentId}/scoring`)}
          sx={{ textDecoration: 'none' }}
        >
          Rubric Scoring
        </Link>
        <Typography color="text.primary">Student Scoring</Typography>
      </Breadcrumbs>

      {/* Header with Student Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/assessments/${assessmentId}/scoring`)}
              variant="outlined"
            >
              Back
            </Button>
            {student && (
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {student.first_name} {student.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Roll No: {student.roll_no} | Reg No: {student.registration_no}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveAll}
            disabled={saving || Object.keys(localScores).length === 0}
          >
            {saving ? 'Saving...' : 'Save All'}
          </Button>
        </Box>

        {saveSuccess && (
          <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircleIcon />}>
            Scores saved successfully!
          </Alert>
        )}
      </Paper>

      {/* Score Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Score
              </Typography>
              <Typography variant="h4">
                {totalScore.total} / {totalScore.max}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalScore.percentage}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Weighted Score
              </Typography>
              <Typography variant="h4">{totalScore.weighted}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Rubrics Completed
              </Typography>
              <Typography variant="h4">
                {stats.completed} / {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progress
              </Typography>
              <Typography variant="h4">{stats.percentage}%</Typography>
              {stats.percentage === '100.0' && (
                <Chip
                  label="Complete"
                  color="success"
                  size="small"
                  icon={<CheckCircleIcon />}
                  sx={{ mt: 1 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Rubric Scoring */}
      {rubrics && rubrics.length > 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Rubric Scoring
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {rubrics.map((rubric) => (
              <Grid item xs={12} key={rubric.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box flex={1}>
                        <Typography variant="h6" gutterBottom>
                          {rubric.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {rubric.description}
                        </Typography>
                        <Box display="flex" gap={1} mb={2}>
                          <Chip size="small" label={`Max Score: ${rubric.max_score}`} />
                          <Chip
                            size="small"
                            label={`Weightage: ${rubric.weightage}%`}
                            color="primary"
                          />
                        </Box>
                      </Box>
                    </Box>

                    {/* Score Level Selector */}
                    <ScoreLevelSelector
                      rubric={rubric}
                      selectedLevel={localScores[rubric.id]?.scoreLevel}
                      onLevelChange={(level) => handleScoreChange(rubric.id, level)}
                    />

                    {/* Comments */}
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Comments (Optional)"
                      value={localScores[rubric.id]?.comments || ''}
                      onChange={(e) => handleCommentsChange(rubric.id, e.target.value)}
                      sx={{ mt: 2 }}
                      placeholder="Add any additional comments or feedback..."
                    />

                    {/* Save Individual Score */}
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SaveIcon />}
                        onClick={() => handleSaveScore(rubric.id)}
                        disabled={
                          saving ||
                          !localScores[rubric.id] ||
                          localScores[rubric.id].scoreLevel === null ||
                          localScores[rubric.id].scoreLevel === undefined
                        }
                      >
                        Save Score
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ) : (
        <Alert severity="info" icon={<AssessmentIcon />}>
          No rubrics found for this assessment.
        </Alert>
      )}
    </Container>
  );
};

export default StudentScoring;
