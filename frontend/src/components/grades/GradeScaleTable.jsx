import React from 'react';
import { Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import Button from '../ui/Button';

const GradeScaleTable = ({ gradeScales, onView, onEdit, onDelete, onActivate, onDeactivate }) => {
  if (!gradeScales || gradeScales.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No grade scales found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scale Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gradeScales.map((scale) => (
              <tr key={scale.grade_scale_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{scale.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700">{scale.description || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {scale.grade_points_count || 0} grades
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {scale.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {onView && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onView(scale.grade_scale_id)}
                        icon={Eye}
                        title="View Details"
                      />
                    )}
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(scale.grade_scale_id)}
                        icon={Edit}
                        title="Edit"
                      />
                    )}
                    {scale.is_active ? (
                      onDeactivate && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeactivate(scale.grade_scale_id)}
                          icon={XCircle}
                          className="text-orange-600 hover:text-orange-700"
                          title="Deactivate"
                        />
                      )
                    ) : (
                      onActivate && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onActivate(scale.grade_scale_id)}
                          icon={CheckCircle}
                          className="text-green-600 hover:text-green-700"
                          title="Activate"
                        />
                      )
                    )}
                    {onDelete && !scale.is_active && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(scale.grade_scale_id)}
                        icon={Trash2}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradeScaleTable;
