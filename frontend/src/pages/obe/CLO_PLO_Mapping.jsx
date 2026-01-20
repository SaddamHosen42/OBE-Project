import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Target, BookOpen, Download } from 'lucide-react';
import { usePLOs } from '../../hooks/usePLOs';
import { useCLO } from '../../hooks/useCLO';
import MappingMatrix from '../../components/obe/MappingMatrix';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Select from '../../components/common/Select';
import { useDegrees } from '../../hooks/useDegrees';
import { useCourses } from '../../hooks/useCourses';

const CLO_PLO_Mapping = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const degreeIdParam = searchParams.get('degree');
  
  const [selectedDegree, setSelectedDegree] = useState(degreeIdParam || '');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mappingData, setMappingData] = useState({});
  
  const { degrees } = useDegrees();
  const { courses } = useCourses(selectedDegree);
  const { plos, loading: plosLoading } = usePLOs(selectedDegree);
  const { clos, loading: closLoading } = useCLO(selectedCourse);

  const handleMappingUpdate = (mappings) => {
    setMappingData(mappings);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Saving CLO-PLO mappings:', mappingData);
      // await api.post('/clos/plo-mappings', { mappings: mappingData });
      alert('Mappings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save mappings');
      console.error('Error saving mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    console.log('Exporting CLO-PLO mappings');
  };

  if (plosLoading || closLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">CLO-PLO Mapping</h1>
            <p className="mt-1 text-sm text-gray-500">
              Map Course Learning Outcomes to Program Learning Outcomes
            </p>
          </div>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          icon={Download}
        >
          Export
        </Button>
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {selectedDegree && selectedCourse && (
        <>
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 rounded-lg p-3">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Course Learning Outcomes</p>
                  <p className="text-2xl font-semibold text-gray-900">{clos?.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Specific outcomes students achieve in this course
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-lg p-3">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Program Learning Outcomes</p>
                  <p className="text-2xl font-semibold text-gray-900">{plos?.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Overall program outcomes supported by this course
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mapping Matrix */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Mapping Matrix</h2>
              <p className="mt-1 text-sm text-gray-500">
                Define how course outcomes contribute to program outcomes
              </p>
            </div>

            <div className="p-6">
              <MappingMatrix
                rows={clos || []}
                columns={plos || []}
                rowKey="clo_id"
                columnKey="plo_id"
                rowLabel="clo_code"
                columnLabel="plo_code"
                rowIcon={BookOpen}
                columnIcon={Target}
                onMappingChange={handleMappingUpdate}
              />
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate('/obe/dashboard')}
              >
                Cancel
              </Button>
              <Button
                icon={Save}
                disabled={loading}
                onClick={handleSave}
              >
                {loading ? 'Saving...' : 'Save Mappings'}
              </Button>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Mapping Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• <strong>CLOs</strong> are specific, measurable outcomes for individual courses</li>
              <li>• <strong>PLOs</strong> are broader outcomes achieved across the entire program</li>
              <li>• Each CLO should support one or more PLOs</li>
              <li>• Strong mappings indicate direct contribution to program outcomes</li>
              <li>• Review mappings to ensure comprehensive PLO coverage across all courses</li>
            </ul>
          </div>
        </>
      )}

      {(!selectedDegree || !selectedCourse) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {!selectedDegree 
              ? 'Select a degree program to begin' 
              : 'Select a course to view and manage CLO-PLO mappings'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CLO_PLO_Mapping;
