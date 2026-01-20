import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  Chip,
  Box,
  TextField,
  InputAdornment,
  Typography,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const ResultTable = ({ results }) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('roll_no');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const filteredResults = results.filter((student) =>
    student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedResults = stableSort(filteredResults, getComparator(order, orderBy));
  const paginatedResults = sortedResults.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getGradeColor = (grade) => {
    const gradeColors = {
      'A+': 'success',
      'A': 'success',
      'A-': 'success',
      'B+': 'info',
      'B': 'info',
      'B-': 'info',
      'C+': 'warning',
      'C': 'warning',
      'C-': 'warning',
      'D': 'warning',
      'F': 'error',
    };
    return gradeColors[grade] || 'default';
  };

  const getStatusColor = (status) => {
    return status === 'Pass' ? 'success' : 'error';
  };

  const headCells = [
    { id: 'roll_no', label: 'Roll No', align: 'left' },
    { id: 'student_name', label: 'Student Name', align: 'left' },
    { id: 'total_marks', label: 'Total Marks', align: 'center' },
    { id: 'percentage', label: 'Percentage', align: 'center' },
    { id: 'letter_grade', label: 'Grade', align: 'center' },
    { id: 'gpa', label: 'GPA', align: 'center' },
    { id: 'pass_status', label: 'Status', align: 'center' },
  ];

  if (!results || results.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No results available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name or roll number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={() => handleRequestSort(headCell.id)}
                  >
                    {headCell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedResults.map((student) => (
              <TableRow key={student.student_id} hover>
                <TableCell>{student.roll_no}</TableCell>
                <TableCell>{student.student_name}</TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="medium">
                    {student.total_marks}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {student.percentage?.toFixed(2)}%
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={student.letter_grade}
                    color={getGradeColor(student.letter_grade)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="medium">
                    {student.gpa}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={student.pass_status}
                    color={getStatusColor(student.pass_status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredResults.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

ResultTable.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      student_id: PropTypes.number.isRequired,
      roll_no: PropTypes.string.isRequired,
      student_name: PropTypes.string.isRequired,
      total_marks: PropTypes.number,
      percentage: PropTypes.number,
      letter_grade: PropTypes.string,
      gpa: PropTypes.number,
      pass_status: PropTypes.string,
    })
  ).isRequired,
};

export default ResultTable;
