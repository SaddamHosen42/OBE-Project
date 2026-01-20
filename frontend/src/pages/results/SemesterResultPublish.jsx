import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSemesterResults } from '../../hooks/useSemesterResults';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
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
  Chip,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Publish as PublishIcon,
  Email as EmailIcon,
  Preview as PreviewIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import SGPACard from '../../components/results/SGPACard';

const SemesterResultPublish = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getResultById, publishResult, loading } = useSemesterResults();
  
  const [result, setResult] = useState(null);
  const [publishDate, setPublishDate] = useState('');
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [notifyParents, setNotifyParents] = useState(false);
  const [makePublic, setMakePublic] = useState(true);
  const [publishNotes, setPublishNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResultData();
    }
    // Set default publish date to today
    const today = new Date().toISOString().split('T')[0];
    setPublishDate(today);
  }, [id]);

  const fetchResultData = async () => {
    try {
      const data = await getResultById(id);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch result data');
    }
  };

  const handlePublishClick = () => {
    if (!publishDate) {
      setError('Please select a publish date');
      return;
    }
    setConfirmDialog(true);
  };

  const handlePublish = async () => {
    setConfirmDialog(false);
    setError('');
    setSuccess('');
    
    try {
      await publishResult(id, {
        publish_date: publishDate,
        notify_students: notifyStudents,
        notify_parents: notifyParents,
        make_public: makePublic,
        notes: publishNotes,
      });
      setSuccess('Results published successfully!');
      setTimeout(() => {
        navigate('/results/semester');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to publish results');
    }
  };

  const handlePreview = () => {
    // Open preview in new window or modal
    window.open(`/results/semester/${id}/preview`, '_blank');
  };

  if (loading && !result) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Publish Semester Results"
        subtitle="Review and publish semester results to students"
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

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <SGPACard
            title="Total Students"
            value={result?.total_students || 0}
            icon="people"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SGPACard
            title="Average SGPA"
            value={result?.average_sgpa || 0}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SGPACard
            title="Average CGPA"
            value={result?.average_cgpa || 0}
          />
        </Grid>

        {/* Publication Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Publication Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Publish Date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Session: {result?.session_name}
                    <br />
                    Semester: {result?.semester_name}
                    <br />
                    Degree: {result?.degree_name}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={notifyStudents}
                        onChange={(e) => setNotifyStudents(e.target.checked)}
                      />
                    }
                    label="Send email notification to students"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={notifyParents}
                        onChange={(e) => setNotifyParents(e.target.checked)}
                      />
                    }
                    label="Send email notification to parents/guardians"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={makePublic}
                        onChange={(e) => setMakePublic(e.target.checked)}
                      />
                    }
                    label="Make results visible in student portal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Publication Notes (Optional)"
                    value={publishNotes}
                    onChange={(e) => setPublishNotes(e.target.value)}
                    placeholder="Add any notes or instructions for students..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Preview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Results Summary
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={handlePreview}
                >
                  Full Preview
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

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
                    {result?.student_results?.slice(0, 5).map((studentResult) => (
                      <TableRow key={studentResult.student_id}>
                        <TableCell>{studentResult.roll_no}</TableCell>
                        <TableCell>{studentResult.student_name}</TableCell>
                        <TableCell align="center">{studentResult.credits}</TableCell>
                        <TableCell align="center">{studentResult.sgpa?.toFixed(2)}</TableCell>
                        <TableCell align="center">{studentResult.cgpa?.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={studentResult.status}
                            color={studentResult.status === 'pass' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {result?.student_results?.length > 5 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Showing 5 of {result.student_results.length} students. Click "Full Preview" to see all results.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/results/semester')}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PublishIcon />}
              onClick={handlePublishClick}
              disabled={loading || !publishDate}
            >
              {loading ? <CircularProgress size={24} /> : 'Publish Results'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Publication</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Once published, results will be visible to students. Please ensure all data is correct.
          </Alert>
          <Typography variant="body2">
            Are you sure you want to publish semester results for:
          </Typography>
          <Box sx={{ mt: 2, pl: 2 }}>
            <Typography variant="body2">
              • Session: <strong>{result?.session_name}</strong>
            </Typography>
            <Typography variant="body2">
              • Semester: <strong>{result?.semester_name}</strong>
            </Typography>
            <Typography variant="body2">
              • Degree: <strong>{result?.degree_name}</strong>
            </Typography>
            <Typography variant="body2">
              • Total Students: <strong>{result?.total_students}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              • Publish Date: <strong>{publishDate}</strong>
            </Typography>
            {notifyStudents && (
              <Typography variant="body2">
                • Email notifications will be sent to students
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            variant="contained"
            color="primary"
            startIcon={<CheckCircleIcon />}
          >
            Confirm & Publish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SemesterResultPublish;
