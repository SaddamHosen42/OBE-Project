import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiDownload, FiUsers, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import enrollmentService from '../../services/enrollmentService';
import offeringService from '../../services/offeringService';
import studentService from '../../services/studentService';

const BulkEnrollment = () => {
  const navigate = useNavigate();
  const [selectedOffering, setSelectedOffering] = useState('');
  const [offerings, setOfferings] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('active');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [results, setResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const [uploadMethod, setUploadMethod] = useState('manual'); // 'manual' or 'csv'
  const [csvFile, setCsvFile] = useState(null);

  // Fetch offerings and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offeringsResponse, studentsResponse] = await Promise.all([
          offeringService.getAllOfferings({ limit: 100, orderBy: 'created_at', order: 'DESC' }),
          studentService.getAllStudents({ limit: 1000 })
        ]);
        
        if (offeringsResponse.success) {
          setOfferings(offeringsResponse.data);
        }
        
        if (studentsResponse.success) {
          setStudents(studentsResponse.data);
          
          // Extract unique departments
          const uniqueDepts = [...new Set(studentsResponse.data.map(s => s.department_name).filter(Boolean))];
          setDepartments(uniqueDepts);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      }
    };
    
    fetchData();
  }, []);

  // Filter students based on search and department
  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchQuery || 
      student.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_sid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !departmentFilter || student.department_name === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // Handle student selection
  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.student_id));
    }
  };

  // Handle CSV file upload
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCsvFile(file);
      
      // Parse CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header line
        const studentIds = lines.slice(1).map(line => {
          const parts = line.split(',');
          return parts[0]?.trim(); // Assuming first column is student ID or SID
        }).filter(Boolean);
        
        // Match student IDs or SIDs to actual student IDs
        const matchedIds = students
          .filter(s => studentIds.includes(String(s.student_id)) || studentIds.includes(s.student_sid))
          .map(s => s.student_id);
        
        setSelectedStudents(matchedIds);
        setSuccess(`Loaded ${matchedIds.length} students from CSV`);
      };
      
      reader.readAsText(file);
    }
  };

  // Download CSV template
  const downloadTemplate = () => {
    const csvContent = 'student_id,student_sid,student_name\n' +
      '1,CS-2023-001,Example Student\n' +
      '2,CS-2023-002,Another Student\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_enrollment_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResults(null);
    
    if (!selectedOffering) {
      setError('Please select a course offering');
      return;
    }
    
    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const bulkData = {
        course_offering_id: parseInt(selectedOffering),
        student_ids: selectedStudents,
        enrollment_date: enrollmentDate,
        status: status
      };
      
      const response = await enrollmentService.bulkEnroll(bulkData);
      
      if (response.success) {
        setResults(response.data);
        setSuccess(`Successfully enrolled ${response.data.successful?.length || 0} students`);
        setSelectedStudents([]);
      }
    } catch (err) {
      console.error('Error enrolling students:', err);
      setError(err.message || 'Failed to enroll students');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Enrollment</h1>
            <p className="mt-2 text-sm text-gray-700">
              Enroll multiple students in a course offering at once
            </p>
          </div>
          <button
            onClick={() => navigate('/enrollments')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Enrollments
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
          <FiXCircle className="mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md flex items-center">
          <FiCheckCircle className="mr-2" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Offering Selection */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Course Offering</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course Offering *
              </label>
              <select
                value={selectedOffering}
                onChange={(e) => setSelectedOffering(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Select Course Offering --</option>
                {offerings.map(offering => (
                  <option key={offering.course_offering_id} value={offering.course_offering_id}>
                    {offering.course_code} - {offering.course_name} ({offering.semester_name}, {offering.academic_session_name})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enrollment Date
                </label>
                <input
                  type="date"
                  value={enrollmentDate}
                  onChange={(e) => setEnrollmentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Method Selection */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Students</h2>
          
          <div className="mb-4 flex space-x-4">
            <button
              type="button"
              onClick={() => setUploadMethod('manual')}
              className={`flex-1 py-2 px-4 rounded-md ${
                uploadMethod === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FiUsers className="inline mr-2" />
              Manual Selection
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod('csv')}
              className={`flex-1 py-2 px-4 rounded-md ${
                uploadMethod === 'csv'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FiUpload className="inline mr-2" />
              CSV Upload
            </button>
          </div>

          {uploadMethod === 'csv' ? (
            <div>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <FiDownload className="mr-1" />
                  Download CSV Template
                </button>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FiUpload className="mx-auto text-gray-400 w-12 h-12 mb-3" />
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
                >
                  Click to upload CSV file
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  or drag and drop
                </p>
                {csvFile && (
                  <p className="text-sm text-gray-700 mt-2">
                    Selected: {csvFile.name}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Filters */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Select All */}
              <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Select All ({filteredStudents.length})
                  </span>
                </label>
                <span className="text-sm text-gray-600">
                  {selectedStudents.length} selected
                </span>
              </div>

              {/* Student List */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                {filteredStudents.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">No students found</p>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredStudents.map(student => (
                      <label
                        key={student.student_id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.student_id)}
                          onChange={() => handleStudentToggle(student.student_id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-gray-900">{student.student_name}</div>
                          <div className="text-sm text-gray-500">
                            {student.student_sid} • {student.department_name}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {results && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Enrollment Results</h2>
            
            <div className="space-y-3">
              {results.successful && results.successful.length > 0 && (
                <div className="border border-green-200 bg-green-50 rounded-md p-3">
                  <h3 className="text-sm font-medium text-green-800 flex items-center mb-2">
                    <FiCheckCircle className="mr-2" />
                    Successfully Enrolled ({results.successful.length})
                  </h3>
                  <ul className="text-sm text-green-700 list-disc list-inside">
                    {results.successful.map((item, index) => (
                      <li key={index}>{item.student_name || item.student_id}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.failed && results.failed.length > 0 && (
                <div className="border border-red-200 bg-red-50 rounded-md p-3">
                  <h3 className="text-sm font-medium text-red-800 flex items-center mb-2">
                    <FiXCircle className="mr-2" />
                    Failed to Enroll ({results.failed.length})
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {results.failed.map((item, index) => (
                      <li key={index}>
                        <strong>{item.student_name || item.student_id}:</strong> {item.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.warnings && results.warnings.length > 0 && (
                <div className="border border-yellow-200 bg-yellow-50 rounded-md p-3">
                  <h3 className="text-sm font-medium text-yellow-800 flex items-center mb-2">
                    <FiAlertCircle className="mr-2" />
                    Warnings ({results.warnings.length})
                  </h3>
                  <ul className="text-sm text-yellow-700 list-disc list-inside">
                    {results.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/enrollments')}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Enrolling...' : `Enroll ${selectedStudents.length} Students`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkEnrollment;
