import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Download,
  Printer,
  Filter,
  User,
  BookOpen,
  Award,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import ReportFilter from '../../components/reports/ReportFilter';
import ReportExport from '../../components/reports/ReportExport';
import PrintLayout from '../../components/reports/PrintLayout';
import { Line, Radar } from 'react-chartjs-2';

const StudentReport = () => {
  const { studentId } = useParams();
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [filters, setFilters] = useState({
    student: studentId || '',
    academicSession: '',
    includeAllSemesters: true
  });

  const { report, loading, error } = useReports('student', filters);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-100 rounded-lg">
        <p>Error loading report: {error.message}</p>
      </div>
    );
  }

  const studentInfo = report?.studentInfo || {};
  const statistics = report?.statistics || {};
  const semesterWisePerformance = report?.semesterWisePerformance || [];
  const coursePerformance = report?.coursePerformance || [];
  const ploAttainment = report?.ploAttainment || [];

  const performanceTrendData = {
    labels: semesterWisePerformance.map((sem) => sem.semester),
    datasets: [
      {
        label: 'CGPA',
        data: semesterWisePerformance.map((sem) => sem.cgpa),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'SGPA',
        data: semesterWisePerformance.map((sem) => sem.sgpa),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const ploRadarData = {
    labels: ploAttainment.map((plo) => plo.ploCode),
    datasets: [
      {
        label: 'Student Attainment',
        data: ploAttainment.map((plo) => plo.studentAttainment),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: 'Class Average',
        data: ploAttainment.map((plo) => plo.classAverage),
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Report</h1>
          <p className="mt-1 text-gray-600">
            Individual student performance analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            onClick={() => setShowPrint(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <ReportFilter
          filters={filters}
          onFilterChange={setFilters}
          onClose={() => setShowFilter(false)}
          reportType="student"
        />
      )}

      {/* Student Information */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Student Information</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-gray-600">Roll Number</p>
            <p className="mt-1 font-semibold text-gray-900">{studentInfo.rollNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="mt-1 font-semibold text-gray-900">{studentInfo.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Program</p>
            <p className="mt-1 font-semibold text-gray-900">{studentInfo.program}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Batch</p>
            <p className="mt-1 font-semibold text-gray-900">{studentInfo.batch}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current CGPA</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.cgpa || 0}
              </p>
            </div>
            <Award className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Credits Completed</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.creditsCompleted || 0}/{statistics.totalCredits || 0}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Class Rank</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.classRank || 0}/{statistics.totalStudents || 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attendance</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.attendance || 0}%
              </p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Performance Trend */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Academic Performance Trend
          </h2>
          <div style={{ height: '300px' }}>
            <Line
              data={performanceTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 4
                  }
                }
              }}
            />
          </div>
        </div>

        {/* PLO Attainment */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            PLO Attainment Comparison
          </h2>
          <div style={{ height: '300px' }}>
            <Radar
              data={ploRadarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Semester-wise Performance */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Semester-wise Performance
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Semester
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Credits
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  SGPA
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  CGPA
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {semesterWisePerformance.map((sem, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {sem.semester}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm text-gray-900">{sem.credits}</span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {sem.sgpa}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm font-semibold text-blue-600">
                      {sem.cgpa}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      {sem.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Performance */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Course Performance Details
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Course Code
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Course Name
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Credits
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Marks
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Grade
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  GP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coursePerformance.map((course, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {course.courseCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {course.courseName}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm text-gray-900">{course.credits}</span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm text-gray-900">{course.marks}%</span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="inline-flex px-2 text-xs font-semibold leading-5 text-blue-800 bg-blue-100 rounded-full">
                      {course.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {course.gradePoint}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <ReportExport
          reportType="student"
          reportData={report}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Print Layout */}
      {showPrint && (
        <PrintLayout
          reportType="student"
          reportData={report}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
};

export default StudentReport;
