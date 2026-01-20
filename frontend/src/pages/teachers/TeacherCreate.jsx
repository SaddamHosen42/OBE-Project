import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiUser } from 'react-icons/fi';
import FormInput from '../../components/form/FormInput';
import FormSelect from '../../components/form/FormSelect';
import FormDatePicker from '../../components/form/FormDatePicker';
import teacherService from '../../services/teacherService';
import departmentService from '../../services/departmentService';

const TeacherCreate = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    user_id: '',
    department_id: '',
    designation: '',
    office_location: '',
    office_phone: '',
    hire_date: '',
    specialization: '',
    qualifications: '',
    bio: '',
    // User fields (if creating user along with teacher)
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  // Fetch departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const deptResponse = await departmentService.getAllDepartments({ limit: 100 });
        
        if (deptResponse.success) setDepartments(deptResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, []);

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
    setIsLoading(true);
    setError('');

    try {
      // Clean up empty fields
      const submitData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          submitData[key] = formData[key];
        }
      });

      const response = await teacherService.createTeacher(submitData);
      
      if (response.success) {
        alert('Teacher created successfully!');
        navigate('/teachers');
      }
    } catch (err) {
      console.error('Error creating teacher:', err);
      setError(err.message || 'Failed to create teacher');
    } finally {
      setIsLoading(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FiUser className="mr-3" />
          Create New Teacher
        </h1>
        <p className="text-gray-600 mt-1">Add a new teacher to the system</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* User Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            User Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Min 8 characters"
            />
            <FormInput
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

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
            onClick={() => navigate('/teachers')}
            className="flex items-center px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            <FiX className="mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            disabled={isLoading}
          >
            <FiSave className="mr-2" />
            {isLoading ? 'Creating...' : 'Create Teacher'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherCreate;
