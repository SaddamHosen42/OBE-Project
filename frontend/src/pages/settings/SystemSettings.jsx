import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSettings,
  FiSave,
  FiX,
  FiEdit,
  FiDatabase,
  FiClock,
  FiMail,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw
} from 'react-icons/fi';
import FormInput from '../../components/form/FormInput';
import FormSelect from '../../components/form/FormSelect';
import FormCheckbox from '../../components/form/FormCheckbox';
import useAuthStore from '../../store/authStore';
import useAppStore from '../../store/appStore';
import api from '../../services/api';

const SystemSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addNotification } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [settings, setSettings] = useState({
    // General Settings
    system_name: 'OBE Management System',
    institution_name: '',
    academic_year: '',
    semester: 'Fall',
    
    // Attainment Settings
    plo_attainment_threshold: 70,
    clo_attainment_threshold: 60,
    indirect_attainment_weight: 30,
    
    // Grading Settings
    passing_grade: 50,
    max_grade: 100,
    grade_scale: 'percentage',
    
    // Email Settings
    email_notifications: true,
    admin_email: '',
    
    // System Settings
    auto_backup: true,
    backup_frequency: 'daily',
    session_timeout: 30,
    max_login_attempts: 5,
    
    // OBE Settings
    enable_indirect_assessment: true,
    enable_course_surveys: true,
    min_survey_responses: 10,
  });

  const semesterOptions = [
    { value: 'Fall', label: 'Fall' },
    { value: 'Spring', label: 'Spring' },
    { value: 'Summer', label: 'Summer' },
  ];

  const gradeScaleOptions = [
    { value: 'percentage', label: 'Percentage (0-100)' },
    { value: 'cgpa', label: 'CGPA (0-4.0)' },
    { value: 'letter', label: 'Letter Grade (A-F)' },
  ];

  const backupFrequencyOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      addNotification({
        type: 'error',
        message: 'Access denied. Admin privileges required.',
      });
      navigate('/settings');
    } else {
      fetchSettings();
    }
  }, [user, navigate]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/settings/system');
      
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load system settings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!settings.system_name.trim()) {
      newErrors.system_name = 'System name is required';
    }

    if (!settings.institution_name.trim()) {
      newErrors.institution_name = 'Institution name is required';
    }

    if (settings.plo_attainment_threshold < 0 || settings.plo_attainment_threshold > 100) {
      newErrors.plo_attainment_threshold = 'Value must be between 0 and 100';
    }

    if (settings.clo_attainment_threshold < 0 || settings.clo_attainment_threshold > 100) {
      newErrors.clo_attainment_threshold = 'Value must be between 0 and 100';
    }

    if (settings.email_notifications && !settings.admin_email) {
      newErrors.admin_email = 'Admin email is required when notifications are enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.put('/settings/system', settings);

      if (response.data.success) {
        setIsEditing(false);
        addNotification({
          type: 'success',
          message: 'System settings updated successfully',
        });
      }
    } catch (error) {
      console.error('Error updating system settings:', error);
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update system settings',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    fetchSettings(); // Reload original settings
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600 mt-1">
                Configure system-wide settings and preferences
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiEdit className="w-4 h-4" />
              <span>Edit Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800">
              <strong>Admin Notice:</strong> Changes to these settings will affect all users in the system.
              Please review carefully before saving.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiSettings className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="System Name"
              name="system_name"
              value={settings.system_name}
              onChange={handleChange}
              error={errors.system_name}
              disabled={!isEditing || isSaving}
              required
            />

            <FormInput
              label="Institution Name"
              name="institution_name"
              value={settings.institution_name}
              onChange={handleChange}
              error={errors.institution_name}
              disabled={!isEditing || isSaving}
              required
            />

            <FormInput
              label="Academic Year"
              name="academic_year"
              value={settings.academic_year}
              onChange={handleChange}
              error={errors.academic_year}
              disabled={!isEditing || isSaving}
              placeholder="e.g., 2025-2026"
            />

            <FormSelect
              label="Current Semester"
              name="semester"
              value={settings.semester}
              onChange={handleChange}
              error={errors.semester}
              disabled={!isEditing || isSaving}
              options={semesterOptions}
            />
          </div>
        </div>

        {/* Attainment Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiCheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Attainment Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              label="PLO Attainment Threshold (%)"
              name="plo_attainment_threshold"
              type="number"
              value={settings.plo_attainment_threshold}
              onChange={handleChange}
              error={errors.plo_attainment_threshold}
              disabled={!isEditing || isSaving}
              min="0"
              max="100"
              required
            />

            <FormInput
              label="CLO Attainment Threshold (%)"
              name="clo_attainment_threshold"
              type="number"
              value={settings.clo_attainment_threshold}
              onChange={handleChange}
              error={errors.clo_attainment_threshold}
              disabled={!isEditing || isSaving}
              min="0"
              max="100"
              required
            />

            <FormInput
              label="Indirect Attainment Weight (%)"
              name="indirect_attainment_weight"
              type="number"
              value={settings.indirect_attainment_weight}
              onChange={handleChange}
              error={errors.indirect_attainment_weight}
              disabled={!isEditing || isSaving}
              min="0"
              max="100"
            />
          </div>

          <div className="mt-4 space-y-3">
            <FormCheckbox
              label="Enable Indirect Assessment"
              name="enable_indirect_assessment"
              checked={settings.enable_indirect_assessment}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
            />

            <FormCheckbox
              label="Enable Course Surveys"
              name="enable_course_surveys"
              checked={settings.enable_course_surveys}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
            />

            {settings.enable_course_surveys && (
              <FormInput
                label="Minimum Survey Responses Required"
                name="min_survey_responses"
                type="number"
                value={settings.min_survey_responses}
                onChange={handleChange}
                error={errors.min_survey_responses}
                disabled={!isEditing || isSaving}
                min="1"
              />
            )}
          </div>
        </div>

        {/* Grading Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiFileText className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Grading Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              label="Passing Grade"
              name="passing_grade"
              type="number"
              value={settings.passing_grade}
              onChange={handleChange}
              error={errors.passing_grade}
              disabled={!isEditing || isSaving}
              min="0"
              max="100"
              required
            />

            <FormInput
              label="Maximum Grade"
              name="max_grade"
              type="number"
              value={settings.max_grade}
              onChange={handleChange}
              error={errors.max_grade}
              disabled={!isEditing || isSaving}
              min="0"
              required
            />

            <FormSelect
              label="Grade Scale"
              name="grade_scale"
              value={settings.grade_scale}
              onChange={handleChange}
              error={errors.grade_scale}
              disabled={!isEditing || isSaving}
              options={gradeScaleOptions}
            />
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiMail className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Email Settings</h2>
          </div>

          <div className="space-y-4">
            <FormCheckbox
              label="Enable Email Notifications"
              name="email_notifications"
              checked={settings.email_notifications}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
            />

            {settings.email_notifications && (
              <FormInput
                label="Admin Email"
                name="admin_email"
                type="email"
                value={settings.admin_email}
                onChange={handleChange}
                error={errors.admin_email}
                disabled={!isEditing || isSaving}
                icon={FiMail}
                placeholder="admin@institution.edu"
                required
              />
            )}
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiDatabase className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">System & Security</h2>
          </div>

          <div className="space-y-4">
            <FormCheckbox
              label="Enable Automatic Backup"
              name="auto_backup"
              checked={settings.auto_backup}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
            />

            {settings.auto_backup && (
              <FormSelect
                label="Backup Frequency"
                name="backup_frequency"
                value={settings.backup_frequency}
                onChange={handleChange}
                error={errors.backup_frequency}
                disabled={!isEditing || isSaving}
                options={backupFrequencyOptions}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Session Timeout (minutes)"
                name="session_timeout"
                type="number"
                value={settings.session_timeout}
                onChange={handleChange}
                error={errors.session_timeout}
                disabled={!isEditing || isSaving}
                min="5"
                max="120"
                icon={FiClock}
              />

              <FormInput
                label="Max Login Attempts"
                name="max_login_attempts"
                type="number"
                value={settings.max_login_attempts}
                onChange={handleChange}
                error={errors.max_login_attempts}
                disabled={!isEditing || isSaving}
                min="3"
                max="10"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <FiX className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FiRefreshCw className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Version:</span>
            <span className="font-medium text-gray-900">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Last Updated:</span>
            <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Database:</span>
            <span className="font-medium text-gray-900">MySQL</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium text-green-600">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
