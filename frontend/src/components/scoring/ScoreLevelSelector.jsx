import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';

const ScoreLevelSelector = ({ rubric, selectedLevel, onLevelChange }) => {
  const handleLevelChange = (event, newLevel) => {
    if (newLevel !== null) {
      onLevelChange(newLevel);
    }
  };

  // Generate score levels based on max_score
  const generateScoreLevels = () => {
    const levels = [];
    for (let i = 0; i <= rubric.max_score; i++) {
      levels.push({
        value: i,
        label: i.toString(),
        description: getScoreDescription(i, rubric.max_score),
      });
    }
    return levels;
  };

  // Get descriptive label for score level
  const getScoreDescription = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;

    if (percentage === 0) return 'Not Achieved';
    if (percentage <= 25) return 'Beginning';
    if (percentage <= 50) return 'Developing';
    if (percentage <= 75) return 'Proficient';
    if (percentage < 100) return 'Advanced';
    return 'Exemplary';
  };

  // Get color based on score
  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;

    if (percentage === 0) return 'error';
    if (percentage <= 25) return 'error';
    if (percentage <= 50) return 'warning';
    if (percentage <= 75) return 'info';
    if (percentage < 100) return 'primary';
    return 'success';
  };

  const scoreLevels = generateScoreLevels();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2" color="text.secondary">
          Select Score Level
        </Typography>
        {selectedLevel !== null && selectedLevel !== undefined && (
          <Chip
            label={`${selectedLevel} / ${rubric.max_score}`}
            color={getScoreColor(selectedLevel, rubric.max_score)}
            size="small"
            icon={<CheckCircleIcon />}
          />
        )}
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <ToggleButtonGroup
          value={selectedLevel}
          exclusive
          onChange={handleLevelChange}
          aria-label="score level"
          fullWidth
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            '& .MuiToggleButtonGroup-grouped': {
              margin: 0.5,
              border: 1,
              '&:not(:first-of-type)': {
                borderRadius: 1,
                borderLeft: 1,
              },
              '&:first-of-type': {
                borderRadius: 1,
              },
            },
          }}
        >
          {scoreLevels.map((level) => (
            <Tooltip
              key={level.value}
              title={
                <Box>
                  <Typography variant="caption" display="block" fontWeight="bold">
                    {level.description}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Score: {level.value} / {rubric.max_score}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {((level.value / rubric.max_score) * 100).toFixed(0)}%
                  </Typography>
                </Box>
              }
              arrow
              placement="top"
            >
              <ToggleButton
                value={level.value}
                aria-label={`score ${level.value}`}
                sx={{
                  minWidth: { xs: 60, sm: 80 },
                  flexDirection: 'column',
                  py: 2,
                  '&.Mui-selected': {
                    bgcolor: `${getScoreColor(level.value, rubric.max_score)}.light`,
                    color: `${getScoreColor(level.value, rubric.max_score)}.dark`,
                    '&:hover': {
                      bgcolor: `${getScoreColor(level.value, rubric.max_score)}.main`,
                      color: 'white',
                    },
                  },
                }}
              >
                {selectedLevel === level.value ? (
                  <CheckCircleIcon
                    color={getScoreColor(level.value, rubric.max_score)}
                    sx={{ mb: 0.5 }}
                  />
                ) : (
                  <RadioButtonUncheckedIcon
                    color="action"
                    sx={{ mb: 0.5 }}
                  />
                )}
                <Typography variant="h6" fontWeight="bold">
                  {level.label}
                </Typography>
                <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.65rem' }}>
                  {level.description}
                </Typography>
              </ToggleButton>
            </Tooltip>
          ))}
        </ToggleButtonGroup>

        {/* Score Guide */}
        <Box mt={2} p={2} bgcolor="background.default" borderRadius={1}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Score Guide:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip label="0% - Not Achieved" size="small" color="error" variant="outlined" />
            <Chip label="1-25% - Beginning" size="small" color="error" variant="outlined" />
            <Chip label="26-50% - Developing" size="small" color="warning" variant="outlined" />
            <Chip label="51-75% - Proficient" size="small" color="info" variant="outlined" />
            <Chip label="76-99% - Advanced" size="small" color="primary" variant="outlined" />
            <Chip label="100% - Exemplary" size="small" color="success" variant="outlined" />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

ScoreLevelSelector.propTypes = {
  rubric: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    max_score: PropTypes.number.isRequired,
  }).isRequired,
  selectedLevel: PropTypes.number,
  onLevelChange: PropTypes.func.isRequired,
};

ScoreLevelSelector.defaultProps = {
  selectedLevel: null,
};

export default ScoreLevelSelector;
