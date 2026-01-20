import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Network, Save, Download, RefreshCw } from 'lucide-react';
import CLOMappingMatrix from '../../components/clo/CLOMappingMatrix';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const CLOMapping = () => {
  const [searchParams] = useSearchParams();
  const courseOfferingId = searchParams.get('courseOffering');
  
  const [courseOfferings, setCourseOfferings] = useState([]);
  const [selectedCourseOffering, setSelectedCourseOffering] = useState(courseOfferingId || '');
  const [clos, setCLOs] = useState([]);
  const [plos, setPLOs] = useState([]);
  const [mappings, setMappings] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourseOfferings();
    fetchPLOs();
  }, []);

  useEffect(() => {
    if (selectedCourseOffering) {
      fetchCLOs();
    }
  }, [selectedCourseOffering]);

  const fetchCourseOfferings = async () => {
    try {
      const response = await api.get('/course-offerings');
      setCourseOfferings(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch course offerings:', err);
      setError('Failed to load course offerings');
    }
  };

  const fetchCLOs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/clos?courseOffering=${selectedCourseOffering}`);
      const closData = response.data.data || [];
      setCLOs(closData);
      
      // Initialize mappings from existing data
      const initialMappings = {};
      closData.forEach(clo => {
        if (clo.plo_mappings && Array.isArray(clo.plo_mappings)) {
          clo.plo_mappings.forEach(mapping => {
            const key = `${clo.clo_id}-${mapping.plo_id}`;
            initialMappings[key] = true;
          });
        }
      });
      setMappings(initialMappings);
    } catch (err) {
      console.error('Failed to fetch CLOs:', err);
      setError('Failed to load CLOs');
    } finally {
      setLoading(false);
    }
  };

  const fetchPLOs = async () => {
    try {
      const response = await api.get('/plos');
      setPLOs(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch PLOs:', err);
      setError('Failed to load PLOs');
    }
  };

  const handleMappingChange = (cloId, ploId, isChecked) => {
    const key = `${cloId}-${ploId}`;
    setMappings(prev => ({
      ...prev,
      [key]: isChecked
    }));
    // Clear success message when making changes
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Group mappings by CLO
      const cloMappings = {};
      Object.entries(mappings).forEach(([key, isChecked]) => {
        if (isChecked) {
          const [cloId, ploId] = key.split('-');
          if (!cloMappings[cloId]) {
            cloMappings[cloId] = [];
          }
          cloMappings[cloId].push(parseInt(ploId));
        }
      });

      // Update each CLO with its mappings
      const updatePromises = clos.map(clo => {
        const ploMappings = cloMappings[clo.clo_id] || [];
        return api.put(`/clos/${clo.clo_id}`, {
          ...clo,
          plo_mappings: ploMappings
        });
      });

      await Promise.all(updatePromises);
      setSuccess('Mappings saved successfully!');
      
      // Refresh CLOs to get updated data
      await fetchCLOs();
    } catch (err) {
      console.error('Failed to save mappings:', err);
      setError(err.response?.data?.message || 'Failed to save mappings');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    // Prepare data for export
    const exportData = clos.map(clo => {
      const cloPLOs = plos
        .filter(plo => mappings[`${clo.clo_id}-${plo.plo_id}`])
        .map(plo => plo.plo_code)
        .join(', ');
      
      return {
        'CLO Code': clo.clo_code,
        'CLO Description': clo.description,
        'Mapped PLOs': cloPLOs
      };
    });

    // Convert to CSV
    const headers = Object.keys(exportData[0]);
    const csv = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => `"${row[header]}"`).join(',')
      )
    ].join('\n');

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clo-plo-mappings-${selectedCourseOffering}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    if (selectedCourseOffering) {
      fetchCLOs();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500 p-2 rounded-lg">
            <Network className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CLO-PLO Mapping</h1>
            <p className="mt-1 text-sm text-gray-500">
              Map Course Learning Outcomes to Program Learning Outcomes
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            icon={RefreshCw}
            disabled={!selectedCourseOffering || loading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            icon={Download}
            disabled={!selectedCourseOffering || clos.length === 0}
          >
            Export
          </Button>
          <Button
            onClick={handleSave}
            icon={Save}
            disabled={!selectedCourseOffering || saving || clos.length === 0}
          >
            {saving ? 'Saving...' : 'Save Mappings'}
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Course Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <Select
          label="Select Course Offering"
          value={selectedCourseOffering}
          onChange={(e) => setSelectedCourseOffering(e.target.value)}
          options={[
            { value: '', label: 'Choose a course offering' },
            ...courseOfferings.map(co => ({
              value: co.course_offering_id,
              label: `${co.course_code} - ${co.course_name} (${co.semester_name})`
            }))
          ]}
          required
        />
      </div>

      {/* Mapping Matrix */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : selectedCourseOffering ? (
        clos.length > 0 && plos.length > 0 ? (
          <CLOMappingMatrix
            clos={clos}
            plos={plos}
            mappings={mappings}
            onMappingChange={handleMappingChange}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {clos.length === 0 ? 'No CLOs Available' : 'No PLOs Available'}
            </h3>
            <p className="text-gray-500">
              {clos.length === 0 
                ? 'Create CLOs for this course offering to start mapping.'
                : 'Create PLOs to map them with CLOs.'}
            </p>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course Offering</h3>
          <p className="text-gray-500">
            Choose a course offering from the dropdown above to view and manage CLO-PLO mappings.
          </p>
        </div>
      )}

      {/* Mapping Statistics */}
      {selectedCourseOffering && clos.length > 0 && plos.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mapping Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Total CLOs</p>
              <p className="text-2xl font-bold text-gray-900">{clos.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total PLOs</p>
              <p className="text-2xl font-bold text-gray-900">{plos.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Mappings</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(mappings).filter(Boolean).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CLOMapping;
