import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiUser } from 'react-icons/fi';
import FormInput from '../../components/form/FormInput';
import FormSelect from '../../components/form/FormSelect';
import FormDatePicker from '../../components/form/FormDatePicker';
import studentService from '../../services/studentService';
import departmentService from '../../services/departmentService';
import degreeService from '../../services/degreeService';

const StudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);
  
  const [formData, setFormData] = useState({
    student_id_number: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    department_id: '',
    degree_id: '',
    batch_year: '',
    admission_date: '',
    academic_status: 'active',
    cgpa: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
  });

  // Fetch student data, departments, and degrees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentResponse, deptResponse, degreeResponse] = await Promise.all([
          studentService.getStudentById(id),
          departmentService.getAllDepartments({ limit: 100 }),
          degreeService.getAllDegrees({ limit: 100 })
        ]);
        
        if (studentResponse.success) {
          const student = studentResponse.data;
          setFormData({
            student_id_number: student.student_id_number || '',
            first_name: student.first_name || '',
            last_name: student.last_name || '',
            email: student.email || '',
            phone: student.phone || '',
            date_of_birth: student.date_of_birth ? student.date_of_birth.split('T')[0] : '',
            gender: student.gender || '',
            address: student.address || '',
            city: student.city || '',
            state: student.state || '',
            postal_code: student.postal_code || '',
            country: student.country || '',
            department_id: student.department_id || '',
            degree_id: student.degree_id || '',
            batch_year: student.batch_year || '',
            admission_date: student.admission_date ? student.admission_date.split('T')[0] : '',
            academic_status: student.academic_status || 'active',
            cgpa: student.cgpa || '',
            emergency_contact_name: student.emergency_contact_name || '',
            emergency_contact_phone: student.emergency_contact_phone || '',
            emergency_contact_relation: student.emergency_contact_relation || '',
          });
        }
        
        if (deptResponse.success) setDepartments(deptResponse.data);
        if (degreeResponse.success) setDegrees(degreeResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load student data');
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

      const response = await studentService.updateStudent(id, submitData);
      
      if (response.success) {
        alert('Student updated successfully!');
        navigate(`/students/${id}`);
      }
    } catch (err) {
      console.error('Error updating student:', err);
      setError(err.message || 'Failed to update student');
    } finally {
      setIsSaving(false);
    }
  };

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
          Edit Student
        </h1>
        <p className="text-gray-600 mt-1">Update student information</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Student ID Number"
              name="student_id_number"
              value={formData.student_id_number}
              onChange={handleChange}
              required
              placeholder="e.g., 2024-CS-001"
            />
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
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
            <FormDatePicker
              label="Date of Birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={(value) => handleDateChange('date_of_birth', value)}
            />
            <FormSelect
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select Gender' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            Address Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FormInput
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <FormInput
              label="State/Province"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
            <FormInput
              label="Postal Code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
            />
            <FormInput
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Academic Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            Academic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Department"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              required
              options={[
                { value: '', label: 'Select Department' },
                ...departments.map(dept => ({
                  value: dept.department_id,
                  label: dept.department_name
                }))
              ]}
            />
            <FormSelect
              label="Degree Program"
              name="degree_id"
              value={formData.degree_id}
              onChange={handleChange}
              required
              options={[
                { value: '', label: 'Select Degree' },
                ...degrees.map(degree => ({
                  value: degree.degree_id,
                  label: `${degree.degree_code} - ${degree.degree_name}`
                }))
              ]}
            />
            <FormInput
              label="Batch Year"
              name="batch_year"
              type="number"
              value={formData.batch_year}
              onChange={handleChange}
              required
              placeholder="e.g., 2024"
            />
            <FormDatePicker
              label="Admission Date"
              name="admission_date"
              value={formData.admission_date}
              onChange={(value) => handleDateChange('admission_date', value)}
              required
            />
            <FormSelect
              label="Academic Status"
              name="academic_status"
              value={formData.academic_status}
              onChange={handleChange}
              required
              options={[
                { value: 'active', label: 'Active' },
                { value: 'graduated', label: 'Graduated' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'on_leave', label: 'On Leave' },
                { value: 'withdrawn', label: 'Withdrawn' },
              ]}
            />
            <FormInput
              label="CGPA"
              name="cgpa"
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={formData.cgpa}
              onChange={handleChange}
              placeholder="e.g., 3.50"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
            Emergency Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Contact Name"
              name="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={handleChange}
            />
            <FormInput
              label="Contact Phone"
              name="emergency_contact_phone"
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={handleChange}
            />
            <FormInput
              label="Relation"
              name="emergency_contact_relation"
              value={formData.emergency_contact_relation}
              onChange={handleChange}
              placeholder="e.g., Parent, Sibling"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(`/students/${id}`)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <FiX className="mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
          >
            <FiSave className="mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentEdit;
