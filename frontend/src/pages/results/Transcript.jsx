import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSemesterResults } from '../../hooks/useSemesterResults';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import TranscriptTemplate from '../../components/results/TranscriptTemplate';

const Transcript = () => {
  const { studentId } = useParams();
  const { getTranscript, loading } = useSemesterResults();
  const transcriptRef = useRef();
  
  const [transcriptData, setTranscriptData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentId) {
      fetchTranscript();
    }
  }, [studentId]);

  const fetchTranscript = async () => {
    setError('');
    try {
      const data = await getTranscript(studentId);
      setTranscriptData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch transcript');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      // In production, this would call an API to generate PDF
      // For now, we'll use the browser's print to PDF feature
      window.print();
    } catch (err) {
      setError('Failed to download transcript');
    }
  };

  const handleEmail = async () => {
    try {
      // API call to send transcript via email
      alert('Transcript will be emailed to the student');
    } catch (err) {
      setError('Failed to send email');
    }
  };

  if (loading && !transcriptData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box className="no-print">
        <PageHeader
          title="Student Transcript"
          subtitle="Official academic transcript"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Print Transcript">
                <IconButton color="primary" onClick={handlePrint}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download PDF">
                <IconButton color="primary" onClick={handleDownload}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Email Transcript">
                <IconButton color="primary" onClick={handleEmail}>
                  <EmailIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
      </Box>

      {transcriptData && (
        <Box ref={transcriptRef}>
          <TranscriptTemplate data={transcriptData} />
        </Box>
      )}

      <Box className="no-print" sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print Transcript
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Download PDF
        </Button>
      </Box>

      {/* Print styles */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default Transcript;
