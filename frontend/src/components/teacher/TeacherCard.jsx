import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiBook, FiAward, FiCalendar, FiBriefcase } from 'react-icons/fi';

const TeacherCard = ({ teacher, onView, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onView) {
      onView(teacher.teacher_id);
    } else {
      navigate(`/teachers/${teacher.teacher_id}`);
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
                {teacher.user_name}
              </h3>
              <p className="text-sm text-gray-500">{teacher.employee_id}</p>
            </div>
          </div>
          {teacher.designation_name && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              {teacher.designation_name}
            </span>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          {teacher.user_email && (
            <div className="flex items-center text-sm text-gray-600">
              <FiMail className="mr-2 h-4 w-4" />
              <span>{teacher.user_email}</span>
            </div>
          )}
          {teacher.office_phone && (
            <div className="flex items-center text-sm text-gray-600">
              <FiPhone className="mr-2 h-4 w-4" />
              <span>{teacher.office_phone}</span>
            </div>
          )}
        </div>

        {/* Professional Information */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <FiBriefcase className="mr-1 h-4 w-4" />
              <span>Department</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{teacher.department_name || 'N/A'}</p>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <FiBook className="mr-1 h-4 w-4" />
              <span>Specialization</span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate" title={teacher.specialization}>
              {teacher.specialization || 'N/A'}
            </p>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <FiCalendar className="mr-1 h-4 w-4" />
              <span>Hire Date</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <FiAward className="mr-1 h-4 w-4" />
              <span>Experience</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {teacher.hire_date ? `${new Date().getFullYear() - new Date(teacher.hire_date).getFullYear()} years` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <button
            onClick={handleCardClick}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(teacher.teacher_id);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(teacher);
              }}
              className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherCard;
