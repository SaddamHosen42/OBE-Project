import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Award, Target, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import { useDegrees } from '../../hooks/useDegrees';
import { usePEOs } from '../../hooks/usePEOs';
import { usePLOs } from '../../hooks/usePLOs';
import { useCourses } from '../../hooks/useCourses';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OBEDashboard = () => {
  const navigate = useNavigate();
  const [selectedDegree, setSelectedDegree] = useState('');
  
  const { degrees } = useDegrees();
  const { peos, loading: peosLoading } = usePEOs(selectedDegree);
  const { plos, loading: plosLoading } = usePLOs(selectedDegree);
  const { courses, loading: coursesLoading } = useCourses(selectedDegree);

  const loading = peosLoading || plosLoading || coursesLoading;

  // Calculate mapping statistics
  const calculateStats = () => {
    const peoPloMappings = peos?.reduce((sum, peo) => 
      sum + (peo.plo_mappings?.length || 0), 0) || 0;
    
    const ploCloMappings = plos?.reduce((sum, plo) => 
      sum + (plo.clo_mappings?.length || 0), 0) || 0;
    
    const cloCoMappings = courses?.reduce((sum, course) => 
      sum + (course.clo_count || 0), 0) || 0;

    return {
      peoPloMappings,
      ploCloMappings,
      cloCoMappings,
      totalPEOs: peos?.length || 0,
      totalPLOs: plos?.length || 0,
      totalCourses: courses?.length || 0
    };
  };

  const stats = calculateStats();

  const mappingCards = [
    {
      title: 'PEO - PLO Mapping',
      description: 'Map Program Educational Objectives to Program Learning Outcomes',
      icon: Award,
      color: 'blue',
      stats: `${stats.totalPEOs} PEOs → ${stats.totalPLOs} PLOs`,
      mappingCount: stats.peoPloMappings,
      route: '/obe/peo-plo-mapping'
    },
    {
      title: 'CLO - PLO Mapping',
      description: 'Map Course Learning Outcomes to Program Learning Outcomes',
      icon: Target,
      color: 'green',
      stats: `${stats.totalPLOs} PLOs`,
      mappingCount: stats.ploCloMappings,
      route: '/obe/clo-plo-mapping'
    },
    {
      title: 'CLO - Course Mapping',
      description: 'View Course Learning Outcomes mapped to Courses',
      icon: BookOpen,
      color: 'purple',
      stats: `${stats.totalCourses} Courses`,
      mappingCount: stats.cloCoMappings,
      route: '/obe/clo-co-mapping'
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      bgLight: 'bg-blue-50',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      bgLight: 'bg-green-50',
      border: 'border-green-200'
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      bgLight: 'bg-purple-50',
      border: 'border-purple-200'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">OBE Mapping Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and visualize Outcome-Based Education mappings across all levels
        </p>
      </div>

      {/* Degree Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <Select
          label="Select Degree Program"
          value={selectedDegree}
          onChange={(e) => setSelectedDegree(e.target.value)}
          options={[
            { value: '', label: 'All Degree Programs' },
            ...(degrees?.map(degree => ({
              value: degree.degree_id,
              label: `${degree.degree_code} - ${degree.degree_name}`
            })) || [])
          ]}
        />
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!loading && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <Award className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Program Educational Objectives</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalPEOs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Program Learning Outcomes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalPLOs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Courses</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mapping Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mappingCards.map((card) => {
              const colors = colorClasses[card.color];
              const Icon = card.icon;
              
              return (
                <div
                  key={card.title}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  <div className={`${colors.bg} p-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {card.description}
                    </p>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Available:</span>
                        <span className="font-medium text-gray-900">{card.stats}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Total Mappings:</span>
                        <span className={`font-semibold ${colors.text}`}>
                          {card.mappingCount}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => navigate(`${card.route}${selectedDegree ? `?degree=${selectedDegree}` : ''}`)}
                      icon={ArrowRight}
                    >
                      Manage Mappings
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* OBE Hierarchy Overview */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Network className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">OBE Hierarchy Overview</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="bg-blue-100 rounded-full p-4">
                    <Award className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">PEO</p>
                  <p className="text-xs text-gray-500">Program Educational</p>
                  <p className="text-xs text-gray-500">Objectives</p>
                </div>

                <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />

                <div className="flex flex-col items-center space-y-2">
                  <div className="bg-green-100 rounded-full p-4">
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">PLO</p>
                  <p className="text-xs text-gray-500">Program Learning</p>
                  <p className="text-xs text-gray-500">Outcomes</p>
                </div>

                <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />

                <div className="flex flex-col items-center space-y-2">
                  <div className="bg-purple-100 rounded-full p-4">
                    <BookOpen className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">CLO</p>
                  <p className="text-xs text-gray-500">Course Learning</p>
                  <p className="text-xs text-gray-500">Outcomes</p>
                </div>

                <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />

                <div className="flex flex-col items-center space-y-2">
                  <div className="bg-yellow-100 rounded-full p-4">
                    <TrendingUp className="h-8 w-8 text-yellow-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Assessment</p>
                  <p className="text-xs text-gray-500">Direct & Indirect</p>
                  <p className="text-xs text-gray-500">Evaluation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/peos')}
              >
                Manage PEOs
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/plos')}
              >
                Manage PLOs
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/courses')}
              >
                Manage Courses
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OBEDashboard;
