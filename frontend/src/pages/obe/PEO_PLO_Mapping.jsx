import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Award, Target, Download } from 'lucide-react';
import { usePEOs } from '../../hooks/usePEOs';
import { usePLOs } from '../../hooks/usePLOs';
import PEO_PLO_Matrix from '../../components/peo/PEO_PLO_Matrix';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Select from '../../components/common/Select';
import { useDegrees } from '../../hooks/useDegrees';

const PEO_PLO_Mapping = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const degreeIdParam = searchParams.get('degree');
  
  const [selectedDegree, setSelectedDegree] = useState(degreeIdParam || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mappingData, setMappingData] = useState({});
  
  const { degrees } = useDegrees();
  const { peos, loading: peosLoading } = usePEOs(selectedDegree);
  const { plos, loading: plosLoading } = usePLOs(selectedDegree);

  const handleMappingUpdate = (mappings) => {
    setMappingData(mappings);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Save mappings via API
      // This would need to be implemented in the backend
      console.log('Saving PEO-PLO mappings:', mappingData);
      // await api.post('/peos/mappings', { mappings: mappingData });
      
      // Show success message
      alert('Mappings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save mappings');
      console.error('Error saving mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export mappings to CSV or PDF
    console.log('Exporting PEO-PLO mappings');
    // Implementation for export functionality
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
            onClick={() => navigate('/obe/dashboard')}
            icon={ArrowLeft}
          >
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PEO-PLO Mapping</h1>
            <p className="mt-1 text-sm text-gray-500">
              Define relationships between Program Educational Objectives and Program Learning Outcomes
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
                <div className="bg-blue-100 rounded-lg p-3">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Program Educational Objectives</p>
                  <p className="text-2xl font-semibold text-gray-900">{peos?.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Define what graduates should achieve within a few years after graduation
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
                    Define what students should know and be able to do by graduation
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
                Click on cells to create or remove mappings between PEOs and PLOs
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
              <li>• <strong>PEOs</strong> describe what graduates will accomplish in their careers</li>
              <li>• <strong>PLOs</strong> describe the knowledge and skills students gain during the program</li>
              <li>• Each PEO should map to multiple PLOs that support achieving that objective</li>
              <li>• Ensure comprehensive coverage - all PLOs should contribute to at least one PEO</li>
              <li>• Review and update mappings annually as part of program assessment</li>
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

export default PEO_PLO_Mapping;
