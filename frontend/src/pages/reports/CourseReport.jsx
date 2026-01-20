import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Download,
  Printer,
  Filter,
  BookOpen,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import ReportFilter from '../../components/reports/ReportFilter';
import ReportExport from '../../components/reports/ReportExport';
import PrintLayout from '../../components/reports/PrintLayout';
import { Bar, Doughnut } from 'react-chartjs-2';

const CourseReport = () => {
  const { courseOfferingId } = useParams();
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [filters, setFilters] = useState({
    courseOffering: courseOfferingId || '',
    includeStudentDetails: true
  });

  const { report, loading, error } = useReports('course', filters);

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

  const courseInfo = report?.courseInfo || {};
  const statistics = report?.statistics || {};
  const gradeDistribution = report?.gradeDistribution || [];
  const assessmentBreakdown = report?.assessmentBreakdown || [];
  const studentPerformance = report?.studentPerformance || [];

  const gradeChartData = {
    labels: gradeDistribution.map((g) => g.grade),
    datasets: [
      {
        label: 'Number of Students',
        data: gradeDistribution.map((g) => g.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(251, 191, 36, 0.7)',
          'rgba(239, 68, 68, 0.7)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const assessmentChartData = {
    labels: assessmentBreakdown.map((a) => a.type),
    datasets: [
      {
        data: assessmentBreakdown.map((a) => a.percentage),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(251, 146, 60, 0.7)',
          'rgba(168, 85, 247, 0.7)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(251, 146, 60)',
          'rgb(168, 85, 247)'
        ],
        borderWidth: 2
      }
    ]
  };

  const gradeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Grade Distribution'
      }
    }
  };

  const assessmentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      },
      title: {
        display: true,
        text: 'Assessment Weightage'
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Report</h1>
          <p className="mt-1 text-gray-600">
            Comprehensive course performance analysis
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
          reportType="course"
        />
      )}

      {/* Course Information */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Course Information</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-gray-600">Course Code</p>
            <p className="mt-1 font-semibold text-gray-900">{courseInfo.courseCode}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Course Title</p>
            <p className="mt-1 font-semibold text-gray-900">{courseInfo.courseName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Instructor</p>
            <p className="mt-1 font-semibold text-gray-900">{courseInfo.instructor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Semester</p>
            <p className="mt-1 font-semibold text-gray-900">{courseInfo.semester}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Enrolled Students</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.enrolledStudents || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.averageScore || 0}%
              </p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.passRate || 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CLO Attainment</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.avgCLOAttainment || 0}%
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Grade Distribution */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Grade Distribution
          </h2>
          <div style={{ height: '300px' }}>
            <Bar data={gradeChartData} options={gradeChartOptions} />
          </div>
        </div>

        {/* Assessment Breakdown */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Assessment Breakdown
          </h2>
          <div style={{ height: '300px' }}>
            <Doughnut data={assessmentChartData} options={assessmentChartOptions} />
          </div>
        </div>
      </div>

      {/* Student Performance Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Student Performance Summary
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Student Name
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Total Marks
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Percentage
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Grade
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentPerformance.map((student, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {student.rollNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {student.totalMarks}/{student.maxMarks}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {student.percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="inline-flex px-2 text-xs font-semibold leading-5 text-blue-800 bg-blue-100 rounded-full">
                      {student.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'Pass'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {student.status}
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
          reportType="course"
          reportData={report}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Print Layout */}
      {showPrint && (
        <PrintLayout
          reportType="course"
          reportData={report}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
};

export default CourseReport;
