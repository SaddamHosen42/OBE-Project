import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiBook, FiArrowLeft } from 'react-icons/fi';
import FormInput from '../../components/form/FormInput';
import FormTextarea from '../../components/form/FormTextarea';
import FormSelect from '../../components/form/FormSelect';
import courseService from '../../services/courseService';
import departmentService from '../../services/departmentService';
import degreeService from '../../services/degreeService';

const CourseCreate = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    courseCode: '',
    courseTitle: '',
    creditHours: '',
    contactHours: '',
    departmentId: '',
    degreeId: '',
    type: '',
    level: '',
    semester: '',
    isElective: false,
    prerequisiteCourseId: null,
    description: '',
    objectives: '',
    outlineContent: '',
  });
  
  const [departments, setDepartments] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [apiError, setApiError] = useState('');

  // Fetch departments, degrees, and courses for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptResponse, degreeResponse, courseResponse] = await Promise.all([
          departmentService.getAllDepartments({ limit: 100 }),
          degreeService.getAllDegrees({ limit: 100 }),
          courseService.getAllCourses({ limit: 1000 }),
        ]);

        if (deptResponse.success) setDepartments(deptResponse.data);
        if (degreeResponse.success) setDegrees(degreeResponse.data);
        if (courseResponse.success) setCourses(courseResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchData();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Clear API error when user starts typing
    if (apiError) {
      setApiError('');
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
    }
    
    if (!formData.courseTitle.trim()) {
      newErrors.courseTitle = 'Course title is required';
    }

    if (!formData.creditHours || formData.creditHours <= 0) {
      newErrors.creditHours = 'Valid credit hours are required';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        creditHours: parseFloat(formData.creditHours),
        contactHours: formData.contactHours ? parseFloat(formData.contactHours) : null,
        departmentId: parseInt(formData.departmentId),
        degreeId: formData.degreeId ? parseInt(formData.degreeId) : null,
        level: formData.level || null,
        semester: formData.semester || null,
        prerequisiteCourseId: formData.prerequisiteCourseId || null,
      };

      const response = await courseService.createCourse(submitData);
      
      if (response.success) {
        // Navigate to course list
        navigate('/courses', { 
          state: { message: 'Course created successfully' } 
        });
      }
    } catch (error) {
      console.error('Error creating course:', error);
      setApiError(error.message || 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  const courseTypes = ['Core', 'Elective', 'Lab', 'Project', 'Capstone', 'Internship'];
  const levels = [1, 2, 3, 4, 5, 6, 7, 8];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
          <p className="text-gray-600">Add a new course to the catalog</p>
        </div>
        <Link to="/courses" className="btn btn-ghost">
          <FiArrowLeft size={20} />
          Back to List
        </Link>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      {/* Form */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Course Code"
                  name="courseCode"
                  type="text"
                  value={formData.courseCode}
                  onChange={handleChange}
                  error={errors.courseCode}
                  placeholder="e.g., CS101"
                  required
                />
                <FormInput
                  label="Course Title"
                  name="courseTitle"
                  type="text"
                  value={formData.courseTitle}
                  onChange={handleChange}
                  error={errors.courseTitle}
                  placeholder="e.g., Introduction to Programming"
                  required
                />
              </div>
            </div>

            {/* Credit and Contact Hours */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Credits & Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Credit Hours"
                  name="creditHours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.creditHours}
                  onChange={handleChange}
                  error={errors.creditHours}
                  placeholder="e.g., 3"
                  required
                />
                <FormInput
                  label="Contact Hours"
                  name="contactHours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.contactHours}
                  onChange={handleChange}
                  error={errors.contactHours}
                  placeholder="e.g., 4"
                />
              </div>
            </div>

            {/* Department and Degree */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Department & Program</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Department"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  error={errors.departmentId}
                  options={[
                    { value: '', label: 'Select Department' },
                    ...departments.map(dept => ({
                      value: dept.id,
                      label: dept.name
                    }))
                  ]}
                  disabled={isFetchingData}
                  required
                />
                <FormSelect
                  label="Degree Program (Optional)"
                  name="degreeId"
                  value={formData.degreeId}
                  onChange={handleChange}
                  error={errors.degreeId}
                  options={[
                    { value: '', label: 'Select Degree' },
                    ...degrees.map(degree => ({
                      value: degree.id,
                      label: degree.name
                    }))
                  ]}
                  disabled={isFetchingData}
                />
              </div>
            </div>

            {/* Course Classification */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Classification</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormSelect
                  label="Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  error={errors.type}
                  options={[
                    { value: '', label: 'Select Type' },
                    ...courseTypes.map(type => ({
                      value: type,
                      label: type
                    }))
                  ]}
                />
                <FormSelect
                  label="Level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  error={errors.level}
                  options={[
                    { value: '', label: 'Select Level' },
                    ...levels.map(level => ({
                      value: level.toString(),
                      label: `Level ${level}`
                    }))
                  ]}
                />
                <FormSelect
                  label="Semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  error={errors.semester}
                  options={[
                    { value: '', label: 'Select Semester' },
                    ...semesters.map(sem => ({
                      value: sem.toString(),
                      label: `Semester ${sem}`
                    }))
                  ]}
                />
              </div>
            </div>

            {/* Elective and Prerequisites */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label cursor-pointer justify-start space-x-2">
                    <input
                      type="checkbox"
                      name="isElective"
                      checked={formData.isElective}
                      onChange={handleChange}
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text">This is an elective course</span>
                  </label>
                </div>
                <FormSelect
                  label="Prerequisite Course (Optional)"
                  name="prerequisiteCourseId"
                  value={formData.prerequisiteCourseId || ''}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'No Prerequisite' },
                    ...courses.map(course => ({
                      value: course.id,
                      label: `${course.courseCode} - ${course.courseTitle}`
                    }))
                  ]}
                  disabled={isFetchingData}
                />
              </div>
            </div>

            {/* Description and Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Details</h3>
              <div className="space-y-4">
                <FormTextarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={errors.description}
                  placeholder="Provide a detailed description of the course..."
                  rows={3}
                />
                <FormTextarea
                  label="Course Objectives"
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleChange}
                  error={errors.objectives}
                  placeholder="List the main learning objectives..."
                  rows={4}
                />
                <FormTextarea
                  label="Outline Content"
                  name="outlineContent"
                  value={formData.outlineContent}
                  onChange={handleChange}
                  error={errors.outlineContent}
                  placeholder="Provide the course outline/syllabus..."
                  rows={6}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link to="/courses" className="btn btn-ghost">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || isFetchingData}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiBook size={20} />
                    Create Course
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseCreate;
