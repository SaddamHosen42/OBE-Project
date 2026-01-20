import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Download,
  Printer,
  Filter,
  Users,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import ReportFilter from '../../components/reports/ReportFilter';
import ReportExport from '../../components/reports/ReportExport';
import PrintLayout from '../../components/reports/PrintLayout';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const BatchReport = () => {
  const { batch } = useParams();
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [filters, setFilters] = useState({
    batch: batch || '',
    degree: '',
    compareWithOtherBatches: true
  });

  const { report, loading, error } = useReports('batch', filters);

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

  const batchInfo = report?.batchInfo || {};
  const statistics = report?.statistics || {};
  const cgpaDistribution = report?.cgpaDistribution || [];
  const semesterProgress = report?.semesterProgress || [];
  const batchComparison = report?.batchComparison || [];
  const topPerformers = report?.topPerformers || [];

  const cgpaChartData = {
    labels: cgpaDistribution.map((item) => item.range),
    datasets: [
      {
        label: 'Number of Students',
        data: cgpaDistribution.map((item) => item.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(251, 191, 36, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(34, 197, 94, 0.7)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(251, 191, 36)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 2
      }
    ]
  };

  const progressChartData = {
    labels: semesterProgress.map((sem) => sem.semester),
    datasets: [
      {
        label: 'Average CGPA',
        data: semesterProgress.map((sem) => sem.avgCGPA),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Pass Rate %',
        data: semesterProgress.map((sem) => sem.passRate),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };

  const comparisonChartData = {
    labels: batchComparison.map((batch) => batch.batchYear),
    datasets: [
      {
        label: 'Average CGPA',
        data: batchComparison.map((batch) => batch.avgCGPA),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Report</h1>
          <p className="mt-1 text-gray-600">
            Batch-wise performance comparison and analysis
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
          reportType="batch"
        />
      )}

      {/* Batch Information */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Batch Information</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-gray-600">Batch</p>
            <p className="mt-1 font-semibold text-gray-900">{batchInfo.batch}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Program</p>
            <p className="mt-1 font-semibold text-gray-900">{batchInfo.program}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Semester</p>
            <p className="mt-1 font-semibold text-gray-900">{batchInfo.currentSemester}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="mt-1 font-semibold text-gray-900">{batchInfo.totalStudents}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average CGPA</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.avgCGPA || 0}
              </p>
            </div>
            <Award className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.activeStudents || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
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
              <p className="text-sm text-gray-600">Courses Completed</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {statistics.coursesCompleted || 0}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* CGPA Distribution */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            CGPA Distribution
          </h2>
          <div style={{ height: '300px' }}>
            <Doughnut
              data={cgpaChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Batch Comparison */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Batch Comparison
          </h2>
          <div style={{ height: '300px' }}>
            <Bar
              data={comparisonChartData}
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
      </div>

      {/* Semester Progress */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Semester-wise Progress
        </h2>
        <div style={{ height: '300px' }}>
          <Line
            data={progressChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  beginAtZero: true,
                  max: 4,
                  title: {
                    display: true,
                    text: 'CGPA'
                  }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Pass Rate %'
                  },
                  grid: {
                    drawOnChartArea: false
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Top Performers
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Rank
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Student Name
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  CGPA
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Credits Completed
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPerformers.map((student, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : index === 1
                            ? 'bg-gray-100 text-gray-800'
                            : index === 2
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        } font-bold`}
                      >
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {student.rollNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm font-bold text-blue-600">
                      {student.cgpa}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {student.creditsCompleted}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      Active
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
          reportType="batch"
          reportData={report}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Print Layout */}
      {showPrint && (
        <PrintLayout
          reportType="batch"
          reportData={report}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
};

export default BatchReport;
