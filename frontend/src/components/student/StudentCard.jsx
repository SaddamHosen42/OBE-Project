import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiBook, FiAward, FiCalendar } from 'react-icons/fi';

const StudentCard = ({ student, onView, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    graduated: 'bg-blue-100 text-blue-800',
    suspended: 'bg-red-100 text-red-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  };

  const handleCardClick = () => {
    if (onView) {
      onView(student.student_id);
    } else {
      navigate(`/students/${student.student_id}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <FiUser className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                onClick={handleCardClick}
              >
                {student.first_name} {student.last_name}
              </h3>
              <p className="text-sm text-gray-500">{student.student_id_number}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[student.academic_status] || 'bg-gray-100 text-gray-800'}`}>
            {student.academic_status?.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          {student.email && (
            <div className="flex items-center text-sm text-gray-600">
              <FiMail className="mr-2 h-4 w-4" />
              <span>{student.email}</span>
            </div>
          )}
          {student.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <FiPhone className="mr-2 h-4 w-4" />
              <span>{student.phone}</span>
            </div>
          )}
        </div>

        {/* Academic Information */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <FiBook className="mr-1 h-4 w-4" />
              <span>Department</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{student.department_name || 'N/A'}</p>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <FiBook className="mr-1 h-4 w-4" />
              <span>Degree</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{student.degree_code || 'N/A'}</p>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <FiCalendar className="mr-1 h-4 w-4" />
              <span>Batch</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{student.batch_year || 'N/A'}</p>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <FiAward className="mr-1 h-4 w-4" />
              <span>CGPA</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {student.cgpa ? student.cgpa.toFixed(2) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <button
            onClick={handleCardClick}
            className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            View Details
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(student.student_id)}
              className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(student)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
