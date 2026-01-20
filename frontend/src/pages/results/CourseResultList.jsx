import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseResults } from '../../hooks/useCourseResults';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Calculate as CalculateIcon,
  Visibility as ViewIcon,
  Publish as PublishIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';

const CourseResultList = () => {
  const navigate = useNavigate();
  const { results, loading, deleteResult } = useCourseResults();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const columns = [
    {
      field: 'course_code',
      headerName: 'Course Code',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium">
          {params.row.course_code}
        </Typography>
      ),
    },
    {
      field: 'course_title',
      headerName: 'Course Title',
      flex: 2,
    },
    {
      field: 'session',
      headerName: 'Session',
      flex: 1,
      renderCell: (params) => `${params.row.session} - ${params.row.semester}`,
    },
    {
      field: 'total_students',
      headerName: 'Students',
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
      field: 'passing_percentage',
      headerName: 'Pass %',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) =>
        params.value ? `${params.value.toFixed(1)}%` : 'N/A',
    },
    {
      field: 'average_marks',
      headerName: 'Average',
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) =>
        params.value ? params.value.toFixed(2) : 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={0.5}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleView(params.row.result_id)}
            title="View Details"
          >
            <ViewIcon fontSize="small" />
          </IconButton>
          {params.row.status === 'draft' && (
            <IconButton
              size="small"
              color="secondary"
              onClick={() => handleCalculate(params.row.result_id)}
              title="Calculate Results"
            >
              <CalculateIcon fontSize="small" />
            </IconButton>
          )}
          {params.row.status === 'calculated' && (
            <IconButton
              size="small"
              color="success"
              onClick={() => handlePublish(params.row.result_id)}
              title="Publish Results"
            >
              <PublishIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const handleView = (id) => {
    navigate(`/results/course/${id}`);
  };

  const handleCalculate = (id) => {
    navigate(`/results/course/calculate/${id}`);
  };

  const handlePublish = (id) => {
    navigate(`/results/course/publish/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      await deleteResult(id);
    }
  };

  const filteredResults = results?.filter((result) => {
    const matchesSearch =
      !searchTerm ||
      result.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.course_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSession = !filterSession || result.session === filterSession;
    const matchesStatus = !filterStatus || result.status === filterStatus;
    return matchesSearch && matchesSession && matchesStatus;
  });

  return (
    <Box>
      <PageHeader
        title="Course Results"
        subtitle="View and manage course results"
        action={
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={() => navigate('/results/course/calculate')}
          >
            Calculate New Results
          </Button>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search courses..."
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
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Academic Session"
                value={filterSession}
                onChange={(e) => setFilterSession(e.target.value)}
              >
                <MenuItem value="">All Sessions</MenuItem>
                <MenuItem value="2023-2024">2023-2024</MenuItem>
                <MenuItem value="2024-2025">2024-2025</MenuItem>
                <MenuItem value="2025-2026">2025-2026</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
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
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setFilterSession('');
                  setFilterStatus('');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <DataTable
            rows={filteredResults || []}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.result_id}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseResultList;
