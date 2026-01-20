import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Network, Save, Download, RefreshCw } from 'lucide-react';
import PLOMappingMatrix from '../../components/plo/PLOMappingMatrix';
import CLO_PLO_Matrix from '../../components/plo/CLO_PLO_Matrix';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const PLOMapping = () => {
  const [searchParams] = useSearchParams();
  const degreeId = searchParams.get('degree');
  
  const [degrees, setDegrees] = useState([]);
  const [selectedDegree, setSelectedDegree] = useState(degreeId || '');
  const [plos, setPLOs] = useState([]);
  const [peos, setPEOs] = useState([]);
  const [clos, setCLOs] = useState([]);
  const [ploToPeoMappings, setPLOToPEOMappings] = useState({});
  const [cloToPloMappings, setCLOToPLOMappings] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('plo-peo'); // 'plo-peo' or 'clo-plo'

  useEffect(() => {
    fetchDegrees();
  }, []);

  useEffect(() => {
    if (selectedDegree) {
      fetchData();
    }
  }, [selectedDegree]);

  const fetchDegrees = async () => {
    try {
      const response = await api.get('/degrees');
      setDegrees(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch degrees:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch PLOs for selected degree
      const plosResponse = await api.get(`/plos?degreeId=${selectedDegree}`);
      const ploData = plosResponse.data.data || [];
      setPLOs(ploData);

      // Fetch PEOs
      const peosResponse = await api.get(`/peos?degreeId=${selectedDegree}`);
      setPEOs(peosResponse.data.data || []);

      // Fetch CLOs that are mapped to these PLOs
      const closResponse = await api.get(`/clos?degreeId=${selectedDegree}`);
      setCLOs(closResponse.data.data || []);

      // Build PLO-PEO mappings
      const ploToPeoMap = {};
      ploData.forEach(plo => {
        if (plo.peo_mappings) {
          plo.peo_mappings.forEach(peo => {
            const key = `${plo.plo_id}-${peo.peo_id}`;
            ploToPeoMap[key] = true;
          });
        }
      });
      setPLOToPEOMappings(ploToPeoMap);

      // Build CLO-PLO mappings
      const cloToPloMap = {};
      closResponse.data.data.forEach(clo => {
        if (clo.plo_mappings) {
          clo.plo_mappings.forEach(plo => {
            const key = `${clo.clo_id}-${plo.plo_id}`;
            cloToPloMap[key] = true;
          });
        }
      });
      setCLOToPLOMappings(cloToPloMap);

    } catch (err) {
      console.error('Failed to fetch mapping data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePLOToPEOMappingChange = (ploId, peoId) => {
    const key = `${ploId}-${peoId}`;
    setPLOToPEOMappings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCLOToPLOMappingChange = (cloId, ploId) => {
    const key = `${cloId}-${ploId}`;
    setCLOToPLOMappings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    if (!selectedDegree) {
      alert('Please select a degree program');
      return;
    }

    setSaving(true);
    try {
      if (activeTab === 'plo-peo') {
        // Save PLO-PEO mappings
        const updates = plos.map(plo => {
          const mappedPEOs = peos
            .filter(peo => ploToPeoMappings[`${plo.plo_id}-${peo.peo_id}`])
            .map(peo => peo.peo_id);
          
          return {
            plo_id: plo.plo_id,
            peo_ids: mappedPEOs
          };
        });

        await api.post('/plos/bulk-update-peo-mappings', { updates });
      } else {
        // Save CLO-PLO mappings
        const updates = clos.map(clo => {
          const mappedPLOs = plos
            .filter(plo => cloToPloMappings[`${clo.clo_id}-${plo.plo_id}`])
            .map(plo => plo.plo_id);
          
          return {
            clo_id: clo.clo_id,
            plo_ids: mappedPLOs
          };
        });

        await api.post('/clos/bulk-update-plo-mappings', { updates });
      }

      alert('Mappings saved successfully!');
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Failed to save mappings:', err);
      alert('Failed to save mappings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    // Export mapping matrix as CSV
    let csv = '';
    let filename = '';

    if (activeTab === 'plo-peo') {
      csv = 'PLO,' + peos.map(peo => peo.peo_code).join(',') + '\n';
      plos.forEach(plo => {
        csv += plo.plo_code + ',';
        csv += peos.map(peo => 
          ploToPeoMappings[`${plo.plo_id}-${peo.peo_id}`] ? '✓' : ''
        ).join(',') + '\n';
      });
      filename = 'plo-peo-mapping.csv';
    } else {
      csv = 'CLO,' + plos.map(plo => plo.plo_code).join(',') + '\n';
      clos.forEach(clo => {
        csv += clo.clo_code + ',';
        csv += plos.map(plo => 
          cloToPloMappings[`${clo.clo_id}-${plo.plo_id}`] ? '✓' : ''
        ).join(',') + '\n';
      });
      filename = 'clo-plo-mapping.csv';
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outcome Mapping</h1>
          <p className="mt-1 text-sm text-gray-500">
            Map PLOs to PEOs and CLOs to PLOs
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={fetchData}
            icon={RefreshCw}
            disabled={!selectedDegree || loading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            icon={Download}
            disabled={!selectedDegree || loading}
          >
            Export
          </Button>
          <Button
            onClick={handleSave}
            icon={Save}
            disabled={!selectedDegree || loading || saving}
          >
            {saving ? 'Saving...' : 'Save Mappings'}
          </Button>
        </div>
      </div>

      {/* Degree Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <Select
          label="Select Degree Program"
          value={selectedDegree}
          onChange={(e) => setSelectedDegree(e.target.value)}
          options={[
            { value: '', label: 'Select a degree program' },
            ...degrees.map(degree => ({
              value: degree.degree_id,
              label: `${degree.degree_code} - ${degree.degree_name}`
            }))
          ]}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('plo-peo')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'plo-peo'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              PLO to PEO Mapping
            </button>
            <button
              onClick={() => setActiveTab('clo-plo')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'clo-plo'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              CLO to PLO Mapping
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : !selectedDegree ? (
            <div className="text-center py-12 text-gray-500">
              <Network className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Please select a degree program to view mappings</p>
            </div>
          ) : activeTab === 'plo-peo' ? (
            <PLOMappingMatrix
              plos={plos}
              peos={peos}
              mappings={ploToPeoMappings}
              onMappingChange={handlePLOToPEOMappingChange}
            />
          ) : (
            <CLO_PLO_Matrix
              clos={clos}
              plos={plos}
              mappings={cloToPloMappings}
              onMappingChange={handleCLOToPLOMappingChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PLOMapping;
