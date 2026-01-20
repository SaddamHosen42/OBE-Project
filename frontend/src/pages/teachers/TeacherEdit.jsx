import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiUser } from 'react-icons/fi';
import FormInput from '../../components/form/FormInput';
import FormSelect from '../../components/form/FormSelect';
import FormDatePicker from '../../components/form/FormDatePicker';
import teacherService from '../../services/teacherService';
import departmentService from '../../services/departmentService';

const TeacherEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    department_id: '',
    designation: '',
    office_location: '',
    office_phone: '',
    hire_date: '',
    specialization: '',
    qualifications: '',
    bio: '',
  });

  // Fetch teacher data and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teacherResponse, deptResponse] = await Promise.all([
          teacherService.getTeacherById(id),
          departmentService.getAllDepartments({ limit: 100 })
        ]);
        
        if (teacherResponse.success) {
          const teacher = teacherResponse.data;
          setFormData({
            employee_id: teacher.employee_id || '',
            department_id: teacher.department_id || '',
            designation: teacher.designation || '',
            office_location: teacher.office_location || '',
            office_phone: teacher.office_phone || '',
            hire_date: teacher.hire_date ? teacher.hire_date.split('T')[0] : '',
            specialization: teacher.specialization || '',
            qualifications: teacher.qualifications || '',
            bio: teacher.bio || '',
          });
        }
        
        if (deptResponse.success) setDepartments(deptResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load teacher data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      // Clean up empty fields
      const submitData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          submitData[key] = formData[key];
        }
      });

      const response = await teacherService.updateTeacher(id, submitData);
      
      if (response.success) {
        alert('Teacher updated successfully!');
        navigate(`/teachers/${id}`);
      }
    } catch (err) {
      console.error('Error updating teacher:', err);
      setError(err.message || 'Failed to update teacher');
    } finally {
      setIsSaving(false);
    }
  };

  const designationOptions = [
    { value: '', label: 'Select Designation' },
    { value: 'Professor', label: 'Professor' },
    { value: 'Associate Professor', label: 'Associate Professor' },
    { value: 'Assistant Professor', label: 'Assistant Professor' },
    { value: 'Lecturer', label: 'Lecturer' },
    { value: 'Senior Lecturer', label: 'Senior Lecturer' },
    { value: 'Instructor', label: 'Instructor' },
    { value: 'Teaching Assistant', label: 'Teaching Assistant' },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FiUser className="mr-3" />
          Edit Teacher
        </h1>
        <p className="text-gray-600 mt-1">Update teacher information</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Teacher Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            Teacher Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Employee ID"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              required
              placeholder="e.g., EMP-2024-001"
            />
            <FormSelect
              label="Department"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              required
              options={[
                { value: '', label: 'Select Department' },
                ...departments.map(dept => ({
                  value: dept.department_id.toString(),
                  label: dept.name,
                })),
              ]}
            />
            <FormSelect
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              required
              options={designationOptions}
            />
            <FormDatePicker
              label="Hire Date"
              name="hire_date"
              value={formData.hire_date}
              onChange={(value) => handleDateChange('hire_date', value)}
              required
            />
          </div>
        </div>

        {/* Office Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            Office Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Office Location"
              name="office_location"
              value={formData.office_location}
              onChange={handleChange}
              placeholder="e.g., Building A, Room 201"
            />
            <FormInput
              label="Office Phone"
              name="office_phone"
              type="tel"
              value={formData.office_phone}
              onChange={handleChange}
              placeholder="e.g., +1-234-567-8900"
            />
          </div>
        </div>

        {/* Academic Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            Academic Information
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <FormInput
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g., Machine Learning, Database Systems"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualifications
              </label>
              <textarea
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Ph.D. in Computer Science, M.Sc. in Software Engineering"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief biography or description..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(`/teachers/${id}`)}
            className="flex items-center px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isSaving}
          >
            <FiX className="mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            disabled={isSaving}
          >
            <FiSave className="mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherEdit;
