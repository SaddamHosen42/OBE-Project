import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiDownload, FiArrowLeft, FiPrinter, FiFilter } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MarksTable from '../../components/marks/MarksTable';
import marksService from '../../services/marksService';
import questionService from '../../services/questionService';
import enrollmentService from '../../services/enrollmentService';

const MarksSheet = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  
  // Filters
  const [sortBy, setSortBy] = useState('roll_number'); // roll_number, name, total
  const [sortOrder, setSortOrder] = useState('asc');
  const [showStats, setShowStats] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch questions for the assessment
        const questionsResponse = await questionService.getQuestionsByAssessment(assessmentId);
        if (questionsResponse.success) {
          setQuestions(questionsResponse.data);
        }

        // Fetch enrolled students
        const enrollmentsResponse = await enrollmentService.getEnrollmentsByOffering(
          questionsResponse.data[0]?.course_offering_id
        );
        if (enrollmentsResponse.success) {
          setStudents(enrollmentsResponse.data);
        }

        // Fetch marks sheet
        const marksResponse = await marksService.getMarksSheet(assessmentId);
        if (marksResponse.success) {
          setMarksData(marksResponse.data);
        }

        // Fetch statistics
        const statsResponse = await marksService.getMarksStatistics(assessmentId);
        if (statsResponse.success) {
          setStatistics(statsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
        toast.error('Failed to load marks sheet');
      } finally {
        setIsLoading(false);
      }
    };

    if (assessmentId) {
      fetchData();
    }
  }, [assessmentId]);

  // Sort students based on selected criteria
  const getSortedStudents = () => {
    const studentsWithTotals = students.map(student => {
      const studentMarks = marksData.filter(m => m.student_id === student.student_id);
      const total = studentMarks.reduce((sum, m) => sum + (m.marks_obtained || 0), 0);
      return { ...student, total };
    });

    return studentsWithTotals.sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'roll_number') {
        compareValue = a.roll_number.localeCompare(b.roll_number);
      } else if (sortBy === 'name') {
        compareValue = a.student_name.localeCompare(b.student_name);
      } else if (sortBy === 'total') {
        compareValue = a.total - b.total;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  };

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await marksService.exportMarks(assessmentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `marks_sheet_${assessmentId}_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Marks sheet exported successfully');
    } catch (err) {
      console.error('Error exporting marks:', err);
      toast.error('Failed to export marks sheet');
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error Loading Data</p>
        <p>{error}</p>
      </div>
    );
  }

  const sortedStudents = getSortedStudents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marks Sheet</h1>
          <p className="text-gray-600 mt-1">
            View and export complete marks sheet
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            icon={FiPrinter}
          >
            Print
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            icon={FiDownload}
          >
            Export Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            icon={FiArrowLeft}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 print:hidden">
        <div className="flex items-center gap-4">
          <FiFilter className="text-gray-600" />
          <div className="flex gap-4 flex-1">
            <Select
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="roll_number">Roll Number</option>
              <option value="name">Student Name</option>
              <option value="total">Total Marks</option>
            </Select>
            
            <Select
              label="Order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </Select>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStats}
                  onChange={(e) => setShowStats(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show Statistics</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Info - Print Header */}
      <div className="bg-white rounded-lg shadow p-6 print:shadow-none">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Marks Sheet</h2>
          {assessment && (
            <p className="text-gray-600 mt-1">{assessment.name}</p>
          )}
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-lg shadow print:shadow-none">
        <MarksTable
          students={sortedStudents}
          questions={questions}
          marksData={marksData}
          readonly={true}
          showTotals={true}
        />
      </div>

      {/* Statistics */}
      {showStats && statistics && (
        <div className="bg-white rounded-lg shadow p-6 print:shadow-none">
          <h3 className="text-lg font-semibold mb-4">Statistics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-700">Total Students</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {statistics.total_students}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-green-700">Average Marks</p>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {statistics.average_marks?.toFixed(2)}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-700">Highest Marks</p>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {statistics.highest_marks}
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm font-medium text-orange-700">Lowest Marks</p>
              <p className="text-2xl font-bold text-orange-900 mt-2">
                {statistics.lowest_marks}
              </p>
            </div>
          </div>

          {/* Question-wise statistics */}
          {statistics.question_stats && (
            <div>
              <h4 className="font-semibold mb-3">Question-wise Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statistics.question_stats.map((stat, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <p className="font-medium text-gray-900">
                      Question {stat.question_number}
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average:</span>
                        <span className="font-medium">{stat.average.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Highest:</span>
                        <span className="font-medium">{stat.highest}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lowest:</span>
                        <span className="font-medium">{stat.lowest}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pass Rate:</span>
                        <span className="font-medium">{stat.pass_rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarksSheet;
