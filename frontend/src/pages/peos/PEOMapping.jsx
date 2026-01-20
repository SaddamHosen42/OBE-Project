import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Award, Target } from 'lucide-react';
import { usePEOs } from '../../hooks/usePEOs';
import { usePLOs } from '../../hooks/usePLOs';
import PEO_PLO_Matrix from '../../components/peo/PEO_PLO_Matrix';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Select from '../../components/common/Select';
import { useDegrees } from '../../hooks/useDegrees';

const PEOMapping = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const degreeIdParam = searchParams.get('degree');
  
  const [selectedDegree, setSelectedDegree] = useState(degreeIdParam || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { degrees } = useDegrees();
  const { peos, loading: peosLoading } = usePEOs(selectedDegree);
  const { plos, loading: plosLoading } = usePLOs(selectedDegree);

  const handleMappingUpdate = async (mappings) => {
    setLoading(true);
    setError(null);
    try {
      // Save mappings via API
      // This would need to be implemented in the backend
      console.log('Saving mappings:', mappings);
      // await api.post('/peos/mappings', { mappings });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save mappings');
      console.error('Error saving mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (peosLoading || plosLoading) {
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
            onClick={() => navigate(-1)}
            icon={ArrowLeft}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PEO-PLO Mapping</h1>
            <p className="mt-1 text-sm text-gray-500">
              Map Program Educational Objectives to Program Learning Outcomes
            </p>
          </div>
        </div>
      </div>

      {/* Degree Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <Select
          label="Select Degree Program"
          value={selectedDegree}
          onChange={(e) => setSelectedDegree(e.target.value)}
          options={[
            { value: '', label: 'Select Degree' },
            ...(degrees?.map(degree => ({
              value: degree.degree_id,
              label: `${degree.degree_code} - ${degree.degree_name}`
            })) || [])
          ]}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {selectedDegree && (
        <>
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <Award className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Program Educational Objectives</p>
                  <p className="text-2xl font-semibold text-gray-900">{peos?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Program Learning Outcomes</p>
                  <p className="text-2xl font-semibold text-gray-900">{plos?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mapping Matrix */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Mapping Matrix</h2>
              <p className="mt-1 text-sm text-gray-500">
                Select the relationships between PEOs and PLOs
              </p>
            </div>

            <div className="p-6">
              <PEO_PLO_Matrix
                peos={peos || []}
                plos={plos || []}
                onMappingChange={handleMappingUpdate}
              />
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                icon={Save}
                disabled={loading}
                onClick={() => handleMappingUpdate({})}
              >
                {loading ? 'Saving...' : 'Save Mappings'}
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Mapping Guide</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click on matrix cells to create or remove PEO-PLO mappings</li>
              <li>• Active mappings are highlighted in blue</li>
              <li>• Ensure each PEO maps to at least one PLO</li>
              <li>• Review mappings periodically to maintain alignment</li>
            </ul>
          </div>
        </>
      )}

      {!selectedDegree && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Select a degree program to view and manage PEO-PLO mappings
          </p>
        </div>
      )}
    </div>
  );
};

export default PEOMapping;
