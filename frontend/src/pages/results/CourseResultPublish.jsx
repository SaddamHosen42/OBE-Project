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
  Alert,
  Checkbox,
  FormControlLabel,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
} from '@mui/material';
import {
  Publish as PublishIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import ResultStats from '../../components/results/ResultStats';
import GradeDistribution from '../../components/results/GradeDistribution';

const CourseResultPublish = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getResultById, publishResult, loading } = useCourseResults();
  
  const [result, setResult] = useState(null);
  const [publishChecks, setPublishChecks] = useState({
    verifiedMarks: false,
    reviewedGrades: false,
    approvedByHOD: false,
    notifyStudents: true,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    sendEmail: true,
    sendSMS: false,
    includeDetailedReport: true,
  });
  const [publishDate, setPublishDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    if (id) {
      loadResult();
    }
  }, [id]);

  const loadResult = async () => {
    try {
      const data = await getResultById(id);
      setResult(data);
      checkPublishWarnings(data);
      
      // Set default publish date to today
      const today = new Date().toISOString().split('T')[0];
      setPublishDate(today);
    } catch (err) {
      setError(err.message || 'Failed to load result');
    }
  };

  const checkPublishWarnings = (resultData) => {
    const warningsList = [];

    if (resultData.status !== 'calculated') {
      warningsList.push('Results are not in calculated state');
    }

    if (resultData.passing_percentage < 50) {
      warningsList.push(`Low passing percentage: ${resultData.passing_percentage.toFixed(1)}%`);
    }

    if (resultData.total_students === 0) {
      warningsList.push('No students enrolled in this course');
    }

    if (!resultData.reviewed_by) {
      warningsList.push('Results have not been reviewed');
    }

    setWarnings(warningsList);
  };

  const handleCheckboxChange = (field) => {
    setPublishChecks((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleNotificationChange = (field) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const canPublish = () => {
    return (
      publishChecks.verifiedMarks &&
      publishChecks.reviewedGrades &&
      publishChecks.approvedByHOD &&
      publishDate &&
      result?.status === 'calculated'
    );
  };

  const handlePublish = async () => {
    if (!canPublish()) {
      setError('Please complete all required checks before publishing');
      return;
    }

    try {
      await publishResult(id, {
        publish_date: publishDate,
        remarks,
        notification_settings: publishChecks.notifyStudents ? notificationSettings : null,
      });
      navigate('/results/course');
    } catch (err) {
      setError(err.message || 'Failed to publish results');
    }
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
        title="Publish Course Results"
        subtitle={`${result.course_code} - ${result.course_title}`}
        backButton
      />

      <Grid container spacing={3}>
        {/* Warnings and Alerts */}
        {warnings.length > 0 && (
          <Grid item xs={12}>
            <Alert severity="warning" icon={<WarningIcon />}>
              <Typography variant="subtitle2" gutterBottom>
                Please review the following warnings:
              </Typography>
              <List dense>
                {warnings.map((warning, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemText primary={`• ${warning}`} />
                  </ListItem>
                ))}
              </List>
            </Alert>
          </Grid>
        )}

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        {/* Result Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Result Summary
              </Typography>
              <ResultStats results={result} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Grade Distribution
              </Typography>
              <GradeDistribution results={result} />
            </CardContent>
          </Card>
        </Grid>

        {/* Publishing Checklist */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pre-Publish Checklist
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    {publishChecks.verifiedMarks ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CancelIcon color="disabled" />
                    )}
                  </ListItemIcon>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={publishChecks.verifiedMarks}
                        onChange={() => handleCheckboxChange('verifiedMarks')}
                      />
                    }
                    label="All marks have been verified and are accurate"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {publishChecks.reviewedGrades ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CancelIcon color="disabled" />
                    )}
                  </ListItemIcon>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={publishChecks.reviewedGrades}
                        onChange={() => handleCheckboxChange('reviewedGrades')}
                      />
                    }
                    label="Grade assignments have been reviewed"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {publishChecks.approvedByHOD ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CancelIcon color="disabled" />
                    )}
                  </ListItemIcon>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={publishChecks.approvedByHOD}
                        onChange={() => handleCheckboxChange('approvedByHOD')}
                      />
                    }
                    label="Results approved by HOD/Coordinator"
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                label="Publish Date"
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Remarks (Optional)"
                multiline
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any remarks or notes about this publication..."
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Student Notifications
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={publishChecks.notifyStudents}
                    onChange={() => handleCheckboxChange('notifyStudents')}
                  />
                }
                label="Notify students when results are published"
              />

              {publishChecks.notifyStudents && (
                <Box sx={{ ml: 4, mt: 2 }}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color={notificationSettings.sendEmail ? 'primary' : 'disabled'} />
                      </ListItemIcon>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={notificationSettings.sendEmail}
                            onChange={() => handleNotificationChange('sendEmail')}
                          />
                        }
                        label="Send Email Notification"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SmsIcon color={notificationSettings.sendSMS ? 'primary' : 'disabled'} />
                      </ListItemIcon>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={notificationSettings.sendSMS}
                            onChange={() => handleNotificationChange('sendSMS')}
                          />
                        }
                        label="Send SMS Notification"
                      />
                    </ListItem>
                    <ListItem>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={notificationSettings.includeDetailedReport}
                            onChange={() => handleNotificationChange('includeDetailedReport')}
                          />
                        }
                        label="Include detailed grade report in email"
                      />
                    </ListItem>
                  </List>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    {result.total_students || 0} students will be notified
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {canPublish()
                ? 'Ready to publish results'
                : 'Complete all required checks to enable publishing'}
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/results/course')}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PublishIcon />}
                onClick={handlePublish}
                disabled={!canPublish() || loading}
              >
                Publish Results
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseResultPublish;
