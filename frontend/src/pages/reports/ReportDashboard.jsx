import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  TrendingUp,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  FileBarChart,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import ReportCard from '../../components/reports/ReportCard';

const ReportDashboard = () => {
  const [filter, setFilter] = useState({
    academicSession: '',
    semester: '',
    department: ''
  });

  const reportCategories = [
    {
      title: 'CLO Attainment Reports',
      description: 'Course Learning Outcome attainment analysis',
      icon: TrendingUp,
      color: 'blue',
      link: '/reports/clo-attainment',
      count: 12
    },
    {
      title: 'PLO Attainment Reports',
      description: 'Program Learning Outcome attainment analysis',
      icon: BarChart3,
      color: 'green',
      link: '/reports/plo-attainment',
      count: 8
    },
    {
      title: 'Course Reports',
      description: 'Detailed course performance and statistics',
      icon: BookOpen,
      color: 'purple',
      link: '/reports/course',
      count: 45
    },
    {
      title: 'Program Reports',
      description: 'Overall program assessment and analytics',
      icon: GraduationCap,
      color: 'indigo',
      link: '/reports/program',
      count: 5
    },
    {
      title: 'Student Reports',
      description: 'Individual student performance analysis',
      icon: Users,
      color: 'orange',
      link: '/reports/student',
      count: 234
    },
    {
      title: 'Batch Reports',
      description: 'Batch-wise performance comparison',
      icon: FileBarChart,
      color: 'pink',
      link: '/reports/batch',
      count: 15
    }
  ];

  const recentReports = [
    {
      id: 1,
      title: 'Fall 2025 CLO Attainment Report',
      type: 'CLO Attainment',
      generatedDate: '2026-01-18',
      generatedBy: 'Dr. Ahmed Khan'
    },
    {
      id: 2,
      title: 'CS Department PLO Analysis',
      type: 'PLO Attainment',
      generatedDate: '2026-01-17',
      generatedBy: 'Dr. Sarah Ali'
    },
    {
      id: 3,
      title: 'SE-301 Course Performance',
      type: 'Course Report',
      generatedDate: '2026-01-16',
      generatedBy: 'Dr. Fatima Hassan'
    },
    {
      id: 4,
      title: 'Batch 2022 Progress Report',
      type: 'Batch Report',
      generatedDate: '2026-01-15',
      generatedBy: 'Admin User'
    }
  ];

  const quickStats = [
    { label: 'Total Reports', value: '319', change: '+12%', trend: 'up' },
    { label: 'This Month', value: '28', change: '+8%', trend: 'up' },
    { label: 'Pending', value: '5', change: '-2', trend: 'down' },
    { label: 'Scheduled', value: '12', change: '+4', trend: 'up' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Generate and view OBE assessment reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="p-6 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <div className="flex items-baseline justify-between mt-2">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <span
                className={`flex items-center text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Report Categories */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Report Categories
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reportCategories.map((category, index) => (
            <ReportCard key={index} category={category} />
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
          <Link
            to="/reports/history"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View All
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Report Title
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Generated Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Generated By
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-3 text-gray-400" />
                        <div className="text-sm font-medium text-gray-900">
                          {report.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 text-xs font-semibold leading-5 text-blue-800 bg-blue-100 rounded-full">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(report.generatedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {report.generatedBy}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <button className="mr-3 text-blue-600 hover:text-blue-900">
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;
