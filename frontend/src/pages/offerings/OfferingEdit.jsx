import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import FormInput from '../../components/form/FormInput';
import FormTextarea from '../../components/form/FormTextarea';
import FormSelect from '../../components/form/FormSelect';
import offeringService from '../../services/offeringService';
import courseService from '../../services/courseService';
import sessionService from '../../services/sessionService';
import semesterService from '../../services/semesterService';

const OfferingEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    courseId: '',
    semesterId: '',
    sessionId: '',
    teacherId: '',
    section: '',
    capacity: '',
    room: '',
    schedule: '',
    status: 'Active',
    startDate: '',
    endDate: '',
    notes: '',
  });
  
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [apiError, setApiError] = useState('');

  // Fetch courses, sessions, and semesters for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseResponse, sessionResponse, semesterResponse] = await Promise.all([
          courseService.getAllCourses({ limit: 1000 }),
          sessionService.getAllSessions({ limit: 100 }),
          semesterService.getAllSemesters({ limit: 100 }),
        ]);

        if (courseResponse.success) setCourses(courseResponse.data);
        if (sessionResponse.success) setSessions(sessionResponse.data);
        if (semesterResponse.success) setSemesters(semesterResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchData();
  }, []);

  // Fetch offering data
  useEffect(() => {
    const fetchOffering = async () => {
      try {
        const response = await offeringService.getOfferingById(id);
        
        if (response.success) {
          const offering = response.data;
          setFormData({
            courseId: offering.courseId || '',
            semesterId: offering.semesterId || '',
            sessionId: offering.sessionId || '',
            teacherId: offering.teacherId || '',
            section: offering.section || '',
            capacity: offering.capacity || '',
            room: offering.room || '',
            schedule: offering.schedule || '',
            status: offering.status || 'Active',
            startDate: offering.startDate ? offering.startDate.split('T')[0] : '',
            endDate: offering.endDate ? offering.endDate.split('T')[0] : '',
            notes: offering.notes || '',
          });
        }
      } catch (error) {
        console.error('Error fetching offering:', error);
        setApiError(error.message || 'Failed to load offering data');
      } finally {
        setIsFetching(false);
      }
    };
    
    if (id) {
      fetchOffering();
    }
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
    if (!formData.courseId) {
      newErrors.courseId = 'Course is required';
    }
    
    if (!formData.semesterId) {
      newErrors.semesterId = 'Semester is required';
    }

    if (!formData.sessionId) {
      newErrors.sessionId = 'Academic session is required';
    }

    if (!formData.section.trim()) {
      newErrors.section = 'Section is required';
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
        courseId: parseInt(formData.courseId),
        semesterId: parseInt(formData.semesterId),
        sessionId: parseInt(formData.sessionId),
        teacherId: formData.teacherId ? parseInt(formData.teacherId) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      };

      const response = await offeringService.updateOffering(id, submitData);
      
      if (response.success) {
        // Navigate to offering view
        navigate(`/offerings/${id}`, {
          state: { message: 'Course offering updated successfully' }
        });
      }
    } catch (error) {
      console.error('Error updating offering:', error);
      setApiError(error.message || 'Failed to update course offering');
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = ['Active', 'Inactive', 'Scheduled', 'Completed'];

  // Show loading state
  if (isFetching || isFetchingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Course Offering</h1>
          <p className="text-gray-600">Update offering information</p>
        </div>
        <Link to={`/offerings/${id}`} className="btn btn-ghost">
          <FiArrowLeft size={20} />
          Back to Details
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
                <FormSelect
                  label="Course"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  error={errors.courseId}
                  options={[
                    { value: '', label: 'Select Course' },
                    ...courses.map(course => ({
                      value: course.id,
                      label: `${course.courseCode} - ${course.courseTitle}`
                    }))
                  ]}
                  required
                />
                <FormInput
                  label="Section"
                  name="section"
                  type="text"
                  value={formData.section}
                  onChange={handleChange}
                  error={errors.section}
                  placeholder="e.g., A, B, 01"
                  required
                />
              </div>
            </div>

            {/* Session and Semester */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Academic Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Academic Session"
                  name="sessionId"
                  value={formData.sessionId}
                  onChange={handleChange}
                  error={errors.sessionId}
                  options={[
                    { value: '', label: 'Select Session' },
                    ...sessions.map(session => ({
                      value: session.id,
                      label: session.name
                    }))
                  ]}
                  required
                />
                <FormSelect
                  label="Semester"
                  name="semesterId"
                  value={formData.semesterId}
                  onChange={handleChange}
                  error={errors.semesterId}
                  options={[
                    { value: '', label: 'Select Semester' },
                    ...semesters.map(semester => ({
                      value: semester.id,
                      label: semester.name
                    }))
                  ]}
                  required
                />
              </div>
            </div>

            {/* Instructor and Capacity */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Class Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Teacher ID (Optional)"
                  name="teacherId"
                  type="number"
                  value={formData.teacherId}
                  onChange={handleChange}
                  error={errors.teacherId}
                  placeholder="Enter teacher ID"
                />
                <FormInput
                  label="Capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  error={errors.capacity}
                  placeholder="e.g., 40"
                />
                <FormInput
                  label="Room"
                  name="room"
                  type="text"
                  value={formData.room}
                  onChange={handleChange}
                  error={errors.room}
                  placeholder="e.g., Room 101"
                />
              </div>
            </div>

            {/* Schedule and Status */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Schedule"
                  name="schedule"
                  type="text"
                  value={formData.schedule}
                  onChange={handleChange}
                  error={errors.schedule}
                  placeholder="e.g., Mon/Wed 9:00-10:30"
                />
                <FormSelect
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  error={errors.status}
                  options={statusOptions.map(status => ({
                    value: status,
                    label: status
                  }))}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Duration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                />
                <FormInput
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  error={errors.endDate}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
              <FormTextarea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                error={errors.notes}
                placeholder="Any additional notes about this offering..."
                rows={4}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link to={`/offerings/${id}`} className="btn btn-ghost">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiSave size={20} />
                    Update Offering
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

export default OfferingEdit;
