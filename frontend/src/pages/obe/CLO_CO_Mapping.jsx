import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, GraduationCap, Download, Eye } from 'lucide-react';
import { useCourses } from '../../hooks/useCourses';
import { useCLO } from '../../hooks/useCLO';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Select from '../../components/common/Select';
import { useDegrees } from '../../hooks/useDegrees';

const CLO_CO_Mapping = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const degreeIdParam = searchParams.get('degree');
  
  const [selectedDegree, setSelectedDegree] = useState(degreeIdParam || '');
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const { degrees } = useDegrees();
  const { courses, loading: coursesLoading } = useCourses(selectedDegree);
  const { clos, loading: closLoading } = useCLO(selectedCourse);

  const selectedCourseData = courses?.find(c => c.course_id === parseInt(selectedCourse));

  const handleExport = () => {
    console.log('Exporting CLO-Course mappings');
  };

  const handleViewDetails = (cloId) => {
    navigate(`/clos/${cloId}`);
  };

  if (coursesLoading || closLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const bloomLevels = {
    1: { name: 'Remember', color: 'bg-blue-100 text-blue-800' },
    2: { name: 'Understand', color: 'bg-green-100 text-green-800' },
    3: { name: 'Apply', color: 'bg-yellow-100 text-yellow-800' },
    4: { name: 'Analyze', color: 'bg-orange-100 text-orange-800' },
    5: { name: 'Evaluate', color: 'bg-red-100 text-red-800' },
    6: { name: 'Create', color: 'bg-purple-100 text-purple-800' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/obe/dashboard')}
            icon={ArrowLeft}
          >
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CLO-Course Mapping</h1>
            <p className="mt-1 text-sm text-gray-500">
              View Course Learning Outcomes for each course
            </p>
          </div>
        </div>
        {selectedCourse && (
          <Button
            onClick={handleExport}
            variant="outline"
            icon={Download}
          >
            Export
          </Button>
        )}
      </div>

      {/* Selection Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Select Degree Program"
            value={selectedDegree}
            onChange={(e) => {
              setSelectedDegree(e.target.value);
              setSelectedCourse('');
            }}
            options={[
              { value: '', label: 'Select Degree' },
              ...(degrees?.map(degree => ({
                value: degree.degree_id,
                label: `${degree.degree_code} - ${degree.degree_name}`
              })) || [])
            ]}
          />

          <Select
            label="Select Course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!selectedDegree}
            options={[
              { value: '', label: 'Select Course' },
              ...(courses?.map(course => ({
                value: course.course_id,
                label: `${course.course_code} - ${course.course_name}`
              })) || [])
            ]}
          />
        </div>
      </div>

      {selectedDegree && selectedCourse && (
        <>
          {/* Course Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCourseData?.course_code} - {selectedCourseData?.course_name}
                </h2>
                {selectedCourseData?.course_description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedCourseData.course_description}
                  </p>
                )}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Credit Hours</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedCourseData?.credit_hours || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Course Type</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedCourseData?.course_type || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Level</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedCourseData?.course_level || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">CLOs</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {clos?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CLOs List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Course Learning Outcomes</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {clos?.length || 0} outcomes defined for this course
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {clos && clos.length > 0 ? (
                <div className="space-y-4">
                  {clos.map((clo, index) => {
                    const bloomLevel = bloomLevels[clo.bloom_level_id] || { 
                      name: 'Unknown', 
                      color: 'bg-gray-100 text-gray-800' 
                    };

                    return (
                      <div
                        key={clo.clo_id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <BookOpen className="h-5 w-5 text-purple-600" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                {clo.clo_code}
                              </h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${bloomLevel.color}`}>
                                {bloomLevel.name}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-3">{clo.description}</p>

                            {/* PLO Mappings */}
                            {clo.plo_mappings && clo.plo_mappings.length > 0 && (
                              <div className="flex items-center space-x-2 flex-wrap">
                                <span className="text-xs text-gray-500">Maps to PLOs:</span>
                                {clo.plo_mappings.map((plo, pIdx) => (
                                  <span
                                    key={pIdx}
                                    className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md font-medium"
                                  >
                                    {plo.plo_code}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(clo.clo_id)}
                            icon={Eye}
                            title="View Details"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No CLOs defined for this course yet.</p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate(`/courses/${selectedCourse}/clos/create`)}
                  >
                    Add CLO
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Bloom Taxonomy Distribution */}
          {clos && clos.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bloom's Taxonomy Distribution
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {Object.entries(bloomLevels).map(([level, data]) => {
                  const count = clos.filter(c => c.bloom_level_id === parseInt(level)).length;
                  const percentage = clos.length > 0 ? Math.round((count / clos.length) * 100) : 0;

                  return (
                    <div key={level} className="text-center">
                      <div className={`${data.color} rounded-lg p-4 mb-2`}>
                        <p className="text-2xl font-bold">{count}</p>
                      </div>
                      <p className="text-xs font-medium text-gray-700">{data.name}</p>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {(!selectedDegree || !selectedCourse) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {!selectedDegree 
              ? 'Select a degree program to begin' 
              : 'Select a course to view its learning outcomes'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CLO_CO_Mapping;
