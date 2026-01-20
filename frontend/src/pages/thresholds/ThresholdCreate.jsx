import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Target, ArrowLeft, Save } from 'lucide-react';
import { useThresholds } from '../../hooks/useThresholds';
import { useDegrees } from '../../hooks/useDegrees';
import ThresholdForm from '../../components/thresholds/ThresholdForm';
import ThresholdPreview from '../../components/thresholds/ThresholdPreview';
import Button from '../../components/common/Button';

const ThresholdCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const degreeIdParam = searchParams.get('degree');
  
  const { createThreshold } = useThresholds();
  const { degrees } = useDegrees();
  
  const [formData, setFormData] = useState({
    degree_id: degreeIdParam || '',
    threshold_type: 'CLO',
    level_name: '',
    min_percentage: 0,
    max_percentage: 100,
    is_attained: true
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.degree_id) {
      newErrors.degree_id = 'Degree is required';
    }
    
    if (!formData.threshold_type) {
      newErrors.threshold_type = 'Threshold type is required';
    }
    
    if (!formData.level_name.trim()) {
      newErrors.level_name = 'Level name is required';
    }
    
    const minPercent = parseFloat(formData.min_percentage);
    const maxPercent = parseFloat(formData.max_percentage);
    
    if (isNaN(minPercent) || minPercent < 0 || minPercent > 100) {
      newErrors.min_percentage = 'Min percentage must be between 0 and 100';
    }
    
    if (isNaN(maxPercent) || maxPercent < 0 || maxPercent > 100) {
      newErrors.max_percentage = 'Max percentage must be between 0 and 100';
    }
    
    if (!isNaN(minPercent) && !isNaN(maxPercent) && minPercent > maxPercent) {
      newErrors.min_percentage = 'Min percentage cannot be greater than max percentage';
      newErrors.max_percentage = 'Max percentage cannot be less than min percentage';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    try {
      await createThreshold({
        ...formData,
        degree_id: parseInt(formData.degree_id),
        min_percentage: parseFloat(formData.min_percentage),
        max_percentage: parseFloat(formData.max_percentage)
      });
      
      navigate('/thresholds');
    } catch (err) {
      console.error('Failed to create threshold:', err);
      setErrors({
        submit: err.response?.data?.message || 'Failed to create threshold. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/thresholds');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Attainment Threshold</h1>
            <p className="text-gray-600 mt-1">
              Define a new threshold level for outcome attainment evaluation
            </p>
          </div>
        </div>
        <Target className="w-12 h-12 text-blue-500" />
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <ThresholdForm
                formData={formData}
                errors={errors}
                onChange={handleChange}
                degrees={degrees}
              />

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={loading}
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Threshold
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="lg:col-span-1">
            <ThresholdPreview
              threshold={formData}
              degrees={degrees}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ThresholdCreate;
