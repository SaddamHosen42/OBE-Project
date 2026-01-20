import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Grid,
  Chip,
  IconButton,
  Collapse,
  Divider,
  TextField,
  Button,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ScoreLevelSelector from './ScoreLevelSelector';

const RubricScoreCard = ({ student, rubrics, scores, onScoreChange }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const getStudentScores = () => {
    if (!rubrics || !scores) return [];

    return rubrics.map((rubric) => {
      const key = `${student.id}-${rubric.id}`;
      const score = scores[key];
      return {
        rubric,
        scoreLevel: score?.scoreLevel,
        comments: score?.comments || '',
      };
    });
  };

  const calculateTotalScore = () => {
    const studentScores = getStudentScores();
    let totalScore = 0;
    let maxScore = 0;
    let scoredRubrics = 0;

    studentScores.forEach(({ rubric, scoreLevel }) => {
      maxScore += rubric.max_score;
      if (scoreLevel !== null && scoreLevel !== undefined) {
        totalScore += scoreLevel;
        scoredRubrics++;
      }
    });

    return {
      total: totalScore,
      max: maxScore,
      percentage: maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(1) : 0,
      completed: scoredRubrics,
      totalRubrics: rubrics.length,
    };
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleViewDetails = () => {
    navigate(`/scoring/student/${student.id}`);
  };

  const scoreStats = calculateTotalScore();
  const isComplete = scoreStats.completed === scoreStats.totalRubrics;

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {/* Student Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2} flex={1}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6">
                {student.first_name} {student.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Roll No: {student.roll_no} | Reg No: {student.registration_no}
              </Typography>
            </Box>
          </Box>

          {/* Score Summary */}
          <Box display="flex" alignItems="center" gap={2}>
            <Box textAlign="center">
              <Typography variant="h6">
                {scoreStats.total} / {scoreStats.max}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Score
              </Typography>
            </Box>

            <Box textAlign="center">
              <Typography variant="h6">{scoreStats.percentage}%</Typography>
              <Typography variant="caption" color="text.secondary">
                Percentage
              </Typography>
            </Box>

            <Box textAlign="center">
              <Chip
                label={`${scoreStats.completed}/${scoreStats.totalRubrics}`}
                color={isComplete ? 'success' : 'default'}
                size="small"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Completed
              </Typography>
            </Box>

            <IconButton onClick={handleToggleExpand} size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Expanded Content */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            {getStudentScores().map(({ rubric, scoreLevel, comments }, index) => (
              <Grid item xs={12} key={rubric.id}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {rubric.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {rubric.description}
                      </Typography>
                      <Box display="flex" gap={1}>
                        <Chip size="small" label={`Max: ${rubric.max_score}`} />
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
                    selectedLevel={scoreLevel}
                    onLevelChange={(level) => onScoreChange(student.id, rubric.id, level, comments)}
                  />

                  {/* Comments */}
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Comments (Optional)"
                    value={comments}
                    onChange={(e) =>
                      onScoreChange(student.id, rubric.id, scoreLevel, e.target.value)
                    }
                    sx={{ mt: 2 }}
                    size="small"
                    placeholder="Add feedback for this rubric..."
                  />
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Action Buttons */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={handleViewDetails}
            >
              View Details
            </Button>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

RubricScoreCard.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    roll_no: PropTypes.string.isRequired,
    registration_no: PropTypes.string.isRequired,
  }).isRequired,
  rubrics: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      max_score: PropTypes.number.isRequired,
      weightage: PropTypes.number.isRequired,
    })
  ).isRequired,
  scores: PropTypes.object.isRequired,
  onScoreChange: PropTypes.func.isRequired,
};

export default RubricScoreCard;
