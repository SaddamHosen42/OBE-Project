import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSemesterResults } from '../../hooks/useSemesterResults';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Calculate as CalculateIcon,
  Visibility as ViewIcon,
  Publish as PublishIcon,
  Description as TranscriptIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';

const SemesterResultList = () => {
  const navigate = useNavigate();
  const { results, loading, deleteResult } = useSemesterResults();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const columns = [
    {
      field: 'student_roll_no',
      headerName: 'Roll No',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.row.student_roll_no}
        </Typography>
      ),
    },
    {
      field: 'student_name',
      headerName: 'Student Name',
      flex: 2,
    },
    {
      field: 'degree_name',
      headerName: 'Degree',
      flex: 1.5,
    },
    {
      field: 'session',
      headerName: 'Session',
      flex: 1,
    },
    {
      field: 'semester_name',
      headerName: 'Semester',
      flex: 1,
    },
    {
      field: 'sgpa',
      headerName: 'SGPA',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) =>
        params.value ? params.value.toFixed(2) : 'N/A',
    },
    {
      field: 'cgpa',
      headerName: 'CGPA',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) =>
        params.value ? params.value.toFixed(2) : 'N/A',
    },
    {
      field: 'total_credits',
      headerName: 'Credits',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => {
        const statusColors = {
          draft: 'default',
          calculated: 'info',
          published: 'success',
          finalized: 'primary',
        };
        return (
          <Chip
            label={params.value}
            color={statusColors[params.value] || 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/results/semester/${params.row.id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Transcript">
            <IconButton
              size="small"
              color="info"
              onClick={() => navigate(`/results/transcript/${params.row.student_id}`)}
            >
              <TranscriptIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.status === 'calculated' && (
            <Tooltip title="Publish">
              <IconButton
                size="small"
                color="success"
                onClick={() => navigate(`/results/semester/publish/${params.row.id}`)}
              >
                <PublishIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.student_roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.student_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSession = !filterSession || result.session === filterSession;
    const matchesSemester = !filterSemester || result.semester_name === filterSemester;
    const matchesStatus = !filterStatus || result.status === filterStatus;
    return matchesSearch && matchesSession && matchesSemester && matchesStatus;
  });

  const handleCalculate = () => {
    navigate('/results/semester/calculate');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this semester result?')) {
      try {
        await deleteResult(id);
      } catch (error) {
        console.error('Error deleting result:', error);
      }
    }
  };

  return (
    <Box>
      <PageHeader
        title="Semester Results"
        subtitle="View and manage semester-wise student results"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<CalculateIcon />}
            onClick={handleCalculate}
          >
            Calculate Results
          </Button>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by roll no or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                size="small"
                label="Session"
                value={filterSession}
                onChange={(e) => setFilterSession(e.target.value)}
              >
                <MenuItem value="">All Sessions</MenuItem>
                <MenuItem value="2025-2026">2025-2026</MenuItem>
                <MenuItem value="2024-2025">2024-2025</MenuItem>
                <MenuItem value="2023-2024">2023-2024</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                size="small"
                label="Semester"
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
              >
                <MenuItem value="">All Semesters</MenuItem>
                <MenuItem value="Fall">Fall</MenuItem>
                <MenuItem value="Spring">Spring</MenuItem>
                <MenuItem value="Summer">Summer</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                size="small"
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="calculated">Calculated</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="finalized">Finalized</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                Total Results: {filteredResults.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <DataTable
        rows={filteredResults}
        columns={columns}
        loading={loading}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Box>
  );
};

export default SemesterResultList;
