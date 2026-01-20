import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook for fetching and managing reports
 * @param {string} reportType - Type of report (clo-attainment, plo-attainment, course, program, student, batch)
 * @param {object} filters - Filter parameters for the report
 * @returns {object} Report data, loading state, and error
 */
export const useReports = (reportType, filters = {}) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportType) return;

      setLoading(true);
      setError(null);

      try {
        const endpoint = getReportEndpoint(reportType);
        const response = await api.get(endpoint, { params: filters });
        setReport(response.data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err.response?.data?.message || 'Failed to fetch report');
        
        // Set mock data for development
        if (process.env.NODE_ENV === 'development') {
          setReport(getMockReportData(reportType));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportType, JSON.stringify(filters)]);

  const refresh = () => {
    setReport(null);
    setLoading(true);
  };

  return { report, loading, error, refresh };
};

/**
 * Get the API endpoint for a specific report type
 */
const getReportEndpoint = (reportType) => {
  const endpoints = {
    'clo-attainment': '/api/reports/clo-attainment',
    'plo-attainment': '/api/reports/plo-attainment',
    'course': '/api/reports/course',
    'program': '/api/reports/program',
    'student': '/api/reports/student',
    'batch': '/api/reports/batch'
  };

  return endpoints[reportType] || '/api/reports';
};

/**
 * Mock data for development and testing
 */
const getMockReportData = (reportType) => {
  const mockData = {
    'clo-attainment': {
      courseInfo: {
        courseCode: 'SE-301',
        courseName: 'Software Engineering',
        semester: 'Fall 2025',
        totalStudents: 45
      },
      statistics: {
        averageAttainment: 75.5,
        cloAchieved: 5,
        totalCLOs: 6,
        highestAttainment: 85,
        highestCLO: 'CLO-1',
        lowestAttainment: 65,
        lowestCLO: 'CLO-4'
      },
      cloAttainment: [
        {
          cloCode: 'CLO-1',
          description: 'Apply software engineering principles',
          directAttainment: 80,
          indirectAttainment: 85,
          overallAttainment: 82.5
        },
        {
          cloCode: 'CLO-2',
          description: 'Design software systems',
          directAttainment: 75,
          indirectAttainment: 78,
          overallAttainment: 76.5
        },
        {
          cloCode: 'CLO-3',
          description: 'Implement software solutions',
          directAttainment: 72,
          indirectAttainment: 75,
          overallAttainment: 73.5
        },
        {
          cloCode: 'CLO-4',
          description: 'Test and validate software',
          directAttainment: 65,
          indirectAttainment: 68,
          overallAttainment: 66.5
        },
        {
          cloCode: 'CLO-5',
          description: 'Document software processes',
          directAttainment: 78,
          indirectAttainment: 80,
          overallAttainment: 79
        },
        {
          cloCode: 'CLO-6',
          description: 'Work effectively in teams',
          directAttainment: 82,
          indirectAttainment: 85,
          overallAttainment: 83.5
        }
      ]
    },
    'plo-attainment': {
      programInfo: {
        programName: 'BS Software Engineering',
        department: 'Computer Science',
        academicSession: '2025-2026',
        totalStudents: 180
      },
      statistics: {
        averageAttainment: 72.8,
        ploAchieved: 10,
        totalPLOs: 12,
        highestAttainment: 85,
        highestPLO: 'PLO-1',
        lowestAttainment: 62,
        lowestPLO: 'PLO-8'
      },
      ploAttainment: [
        {
          ploCode: 'PLO-1',
          description: 'Engineering knowledge',
          mappedCLOs: 15,
          attainment: 85,
          target: 70,
          trend: 5
        },
        {
          ploCode: 'PLO-2',
          description: 'Problem analysis',
          mappedCLOs: 12,
          attainment: 78,
          target: 70,
          trend: 3
        },
        {
          ploCode: 'PLO-3',
          description: 'Design/development of solutions',
          mappedCLOs: 18,
          attainment: 75,
          target: 70,
          trend: 2
        }
      ],
      trendData: [
        { semester: 'Fall 2023', averageAttainment: 68 },
        { semester: 'Spring 2024', averageAttainment: 70 },
        { semester: 'Fall 2024', averageAttainment: 71 },
        { semester: 'Spring 2025', averageAttainment: 72.8 }
      ]
    },
    'course': {
      courseInfo: {
        courseCode: 'SE-301',
        courseName: 'Software Engineering',
        instructor: 'Dr. Ahmed Khan',
        semester: 'Fall 2025'
      },
      statistics: {
        enrolledStudents: 45,
        averageScore: 76.5,
        passRate: 88.9,
        avgCLOAttainment: 75.5
      },
      gradeDistribution: [
        { grade: 'A', count: 12 },
        { grade: 'B', count: 18 },
        { grade: 'C', count: 10 },
        { grade: 'D', count: 3 },
        { grade: 'F', count: 2 }
      ],
      assessmentBreakdown: [
        { type: 'Quizzes', percentage: 20 },
        { type: 'Assignments', percentage: 20 },
        { type: 'Midterm', percentage: 25 },
        { type: 'Final', percentage: 35 }
      ],
      studentPerformance: []
    },
    'program': {
      programInfo: {
        programName: 'BS Software Engineering',
        department: 'Computer Science',
        accreditation: 'PEC Accredited',
        academicSession: '2025-2026'
      },
      statistics: {
        totalStudents: 180,
        totalCourses: 42,
        avgPLOAttainment: 72.8,
        graduationRate: 92
      },
      ploAttainment: [],
      enrollmentTrend: [
        { year: '2022', enrolled: 160, graduated: 145 },
        { year: '2023', enrolled: 170, graduated: 152 },
        { year: '2024', enrolled: 180, graduated: 158 }
      ],
      peoAssessment: [
        { peoCode: 'PEO-1', achievementLevel: 4.2 },
        { peoCode: 'PEO-2', achievementLevel: 4.0 },
        { peoCode: 'PEO-3', achievementLevel: 3.8 }
      ]
    },
    'student': {
      studentInfo: {
        rollNumber: '2022-SE-001',
        name: 'Ali Ahmed',
        program: 'BS Software Engineering',
        batch: '2022'
      },
      statistics: {
        cgpa: 3.65,
        creditsCompleted: 90,
        totalCredits: 132,
        classRank: 5,
        totalStudents: 45,
        attendance: 92
      },
      semesterWisePerformance: [
        { semester: 'Fall 2022', credits: 18, sgpa: 3.45, cgpa: 3.45, status: 'Pass' },
        { semester: 'Spring 2023', credits: 18, sgpa: 3.60, cgpa: 3.52, status: 'Pass' },
        { semester: 'Fall 2023', credits: 18, sgpa: 3.70, cgpa: 3.58, status: 'Pass' },
        { semester: 'Spring 2024', credits: 18, sgpa: 3.75, cgpa: 3.62, status: 'Pass' },
        { semester: 'Fall 2024', credits: 18, sgpa: 3.80, cgpa: 3.65, status: 'Pass' }
      ],
      coursePerformance: [],
      ploAttainment: []
    },
    'batch': {
      batchInfo: {
        batch: '2022',
        program: 'BS Software Engineering',
        currentSemester: '6th',
        totalStudents: 45
      },
      statistics: {
        avgCGPA: 3.42,
        activeStudents: 43,
        passRate: 95.6,
        coursesCompleted: 25
      },
      cgpaDistribution: [
        { range: '0.0-2.0', count: 2 },
        { range: '2.0-2.5', count: 5 },
        { range: '2.5-3.0', count: 12 },
        { range: '3.0-3.5', count: 18 },
        { range: '3.5-4.0', count: 8 }
      ],
      semesterProgress: [
        { semester: 'Fall 2022', avgCGPA: 3.15, passRate: 93 },
        { semester: 'Spring 2023', avgCGPA: 3.25, passRate: 94 },
        { semester: 'Fall 2023', avgCGPA: 3.32, passRate: 95 },
        { semester: 'Spring 2024', avgCGPA: 3.38, passRate: 95 },
        { semester: 'Fall 2024', avgCGPA: 3.42, passRate: 96 }
      ],
      batchComparison: [
        { batchYear: '2020', avgCGPA: 3.25 },
        { batchYear: '2021', avgCGPA: 3.35 },
        { batchYear: '2022', avgCGPA: 3.42 },
        { batchYear: '2023', avgCGPA: 3.38 }
      ],
      topPerformers: [
        { rollNumber: '2022-SE-001', name: 'Ali Ahmed', cgpa: 3.85, creditsCompleted: 90, status: 'Active' },
        { rollNumber: '2022-SE-012', name: 'Fatima Hassan', cgpa: 3.80, creditsCompleted: 90, status: 'Active' },
        { rollNumber: '2022-SE-025', name: 'Usman Khan', cgpa: 3.75, creditsCompleted: 90, status: 'Active' }
      ]
    }
  };

  return mockData[reportType] || null;
};

export default useReports;
