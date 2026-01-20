import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, X, Target } from 'lucide-react';
import { usePLOs } from '../../hooks/usePLOs';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import api from '../../services/api';

const PLOCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const degreeId = searchParams.get('degree');
  
  const { createPLO } = usePLOs();
  
  const [formData, setFormData] = useState({
    degree_id: degreeId || '',
    plo_code: '',
    description: '',
    bloom_level_id: '',
    peo_mappings: []
  });
  
  const [degrees, setDegrees] = useState([]);
  const [peos, setPEOs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDegrees();
    fetchPEOs();
  }, []);

  const fetchDegrees = async () => {
    try {
      const response = await api.get('/degrees');
      setDegrees(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch degrees:', err);
    }
  };

  const fetchPEOs = async () => {
    try {
      const response = await api.get('/peos');
      setPEOs(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch PEOs:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.degree_id) {
      newErrors.degree_id = 'Degree is required';
    }
    
    if (!formData.plo_code.trim()) {
      newErrors.plo_code = 'PLO code is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.bloom_level_id) {
      newErrors.bloom_level_id = 'Bloom taxonomy level is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await createPLO(formData);
      navigate(degreeId ? `/plos?degree=${degreeId}` : '/plos');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create PLO');
      console.error('Error creating PLO:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBloomLevelChange = (e) => {
    setFormData(prev => ({
      ...prev,
      bloom_level_id: e.target.value
    }));
    if (errors.bloom_level_id) {
      setErrors(prev => ({
        ...prev,
        bloom_level_id: ''
      }));
    }
  };

  const handlePEOMappingToggle = (peoId) => {
    setFormData(prev => ({
      ...prev,
      peo_mappings: prev.peo_mappings.includes(peoId)
        ? prev.peo_mappings.filter(id => id !== peoId)
        : [...prev.peo_mappings, peoId]
    }));
  };

  const bloomLevels = [
    { value: '', label: 'Select Bloom Level' },
    { value: '1', label: 'Remember' },
    { value: '2', label: 'Understand' },
    { value: '3', label: 'Apply' },
    { value: '4', label: 'Analyze' },
    { value: '5', label: 'Evaluate' },
    { value: '6', label: 'Create' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Target className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Program Learning Outcome</h1>
            <p className="mt-1 text-sm text-gray-500">
              Add a new PLO to your degree program
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* Degree Selection */}
          <div>
            <Select
              label="Degree Program"
              name="degree_id"
              value={formData.degree_id}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Select Degree Program' },
                ...degrees.map(degree => ({
                  value: degree.degree_id,
                  label: `${degree.degree_code} - ${degree.degree_name}`
                }))
              ]}
              required
              error={errors.degree_id}
            />
          </div>

          {/* PLO Code */}
          <div>
            <Input
              label="PLO Code"
              name="plo_code"
              value={formData.plo_code}
              onChange={handleInputChange}
              placeholder="e.g., PLO1, PLO2"
              required
              error={errors.plo_code}
            />
          </div>

          {/* Description */}
          <div>
            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter the PLO description..."
              rows={4}
              required
              error={errors.description}
            />
          </div>

          {/* Bloom Taxonomy Level */}
          <div>
            <Select
              label="Bloom Taxonomy Level"
              name="bloom_level_id"
              value={formData.bloom_level_id}
              onChange={handleBloomLevelChange}
              options={bloomLevels}
              required
              error={errors.bloom_level_id}
            />
            <p className="mt-1 text-sm text-gray-500">
              Select the highest cognitive level for this PLO
            </p>
          </div>

          {/* PEO Mappings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Map to Program Educational Objectives (Optional)
            </label>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
              {peos.length > 0 ? (
                peos.map(peo => (
                  <label
                    key={peo.peo_id}
                    className="flex items-start space-x-3 p-3 bg-white rounded border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.peo_mappings.includes(peo.peo_id)}
                      onChange={() => handlePEOMappingToggle(peo.peo_id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{peo.peo_code}</div>
                      <div className="text-sm text-gray-600">{peo.description}</div>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No PEOs available. Create PEOs first to map them to PLOs.
                </p>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Select the PEOs that this PLO contributes to
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(degreeId ? `/plos?degree=${degreeId}` : '/plos')}
            icon={X}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            icon={Save}
          >
            {loading ? 'Creating...' : 'Create PLO'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PLOCreate;
