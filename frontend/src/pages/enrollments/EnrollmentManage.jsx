import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiUser, FiBook, FiCalendar, FiClock } from 'react-icons/fi';
import enrollmentService from '../../services/enrollmentService';
import studentService from '../../services/studentService';
import offeringService from '../../services/offeringService';

const EnrollmentManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    student_id: '',
    course_offering_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'active',
  });
  
  const [students, setStudents] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch students and offerings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsResponse, offeringsResponse] = await Promise.all([
          studentService.getAllStudents({ limit: 1000 }),
          offeringService.getAllOfferings({ limit: 100, orderBy: 'created_at', order: 'DESC' })
        ]);
        
        if (studentsResponse.success) {
          setStudents(studentsResponse.data);
        }
        
        if (offeringsResponse.success) {
          setOfferings(offeringsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, []);

  // Fetch enrollment data if editing
  useEffect(() => {
    if (isEditMode) {
      fetchEnrollment();
    }
  }, [id]);

  const fetchEnrollment = async () => {
    try {
      setIsLoadingData(true);
      const response = await enrollmentService.getEnrollmentById(id);
      
      if (response.success) {
        const enrollment = response.data;
        setFormData({
          student_id: enrollment.student_id || '',
          course_offering_id: enrollment.course_offering_id || '',
          enrollment_date: enrollment.enrollment_date ? enrollment.enrollment_date.split('T')[0] : '',
          status: enrollment.status || 'active',
        });
      }
    } catch (err) {
      console.error('Error fetching enrollment:', err);
      setError('Failed to load enrollment data');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.student_id) {
      errors.student_id = 'Student is required';
    }
    
    if (!formData.course_offering_id) {
      errors.course_offering_id = 'Course offering is required';
    }
    
    if (!formData.enrollment_date) {
      errors.enrollment_date = 'Enrollment date is required';
    }
    
    if (!formData.status) {
      errors.status = 'Status is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const enrollmentData = {
        student_id: parseInt(formData.student_id),
        course_offering_id: parseInt(formData.course_offering_id),
        enrollment_date: formData.enrollment_date,
        status: formData.status,
      };
      
      let response;
      if (isEditMode) {
        // For edit mode, we update the status
        response = await enrollmentService.updateStatus(id, formData.status);
      } else {
        // For create mode, we enroll the student
        response = await enrollmentService.enrollStudent(enrollmentData);
      }
      
      if (response.success) {
        navigate('/enrollments');
      }
    } catch (err) {
      console.error('Error saving enrollment:', err);
      setError(err.message || 'Failed to save enrollment');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/enrollments');
  };

  if (isLoadingData) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Enrollment' : 'New Enrollment'}
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              {isEditMode ? 'Update enrollment information' : 'Enroll a student in a course offering'}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Enrollments
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Enrollment Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline mr-1" />
                Student *
              </label>
              <select
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                disabled={isEditMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.student_id ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                required
              >
                <option value="">-- Select Student --</option>
                {students.map(student => (
                  <option key={student.student_id} value={student.student_id}>
                    {student.student_sid} - {student.student_name} ({student.department_name})
                  </option>
                ))}
              </select>
              {validationErrors.student_id && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.student_id}</p>
              )}
              {isEditMode && (
                <p className="mt-1 text-sm text-gray-500">Student cannot be changed after enrollment</p>
              )}
            </div>

            {/* Course Offering Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiBook className="inline mr-1" />
                Course Offering *
              </label>
              <select
                name="course_offering_id"
                value={formData.course_offering_id}
                onChange={handleChange}
                disabled={isEditMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.course_offering_id ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                required
              >
                <option value="">-- Select Course Offering --</option>
                {offerings.map(offering => (
                  <option key={offering.course_offering_id} value={offering.course_offering_id}>
                    {offering.course_code} - {offering.course_name} ({offering.semester_name}, {offering.academic_session_name})
                  </option>
                ))}
              </select>
              {validationErrors.course_offering_id && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.course_offering_id}</p>
              )}
              {isEditMode && (
                <p className="mt-1 text-sm text-gray-500">Course offering cannot be changed after enrollment</p>
              )}
            </div>

            {/* Enrollment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="inline mr-1" />
                Enrollment Date *
              </label>
              <input
                type="date"
                name="enrollment_date"
                value={formData.enrollment_date}
                onChange={handleChange}
                disabled={isEditMode}
                className={`w-full px-3 py-2 border ${
                  validationErrors.enrollment_date ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                required
              />
              {validationErrors.enrollment_date && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.enrollment_date}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiClock className="inline mr-1" />
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  validationErrors.status ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
              {validationErrors.status && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.status}</p>
              )}
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Information</h3>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>Students can only be enrolled in one section of a course per semester</li>
            <li>Enrollment date should be within the semester dates</li>
            <li>Active enrollments will appear in student's course list</li>
            {isEditMode && (
              <li>Only status can be modified after enrollment. To change student or course, delete and create new enrollment</li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiX className="inline mr-1" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FiSave className="inline mr-1" />
            {isLoading ? 'Saving...' : isEditMode ? 'Update Enrollment' : 'Create Enrollment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnrollmentManage;
