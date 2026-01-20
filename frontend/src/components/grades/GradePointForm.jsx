import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const GradePointForm = ({ gradePoints, setGradePoints, errors = {} }) => {
  const handleAddGradePoint = () => {
    setGradePoints([
      ...gradePoints,
      {
        grade: '',
        min_marks: '',
        max_marks: '',
        grade_point: '',
        description: ''
      }
    ]);
  };

  const handleRemoveGradePoint = (index) => {
    setGradePoints(gradePoints.filter((_, i) => i !== index));
  };

  const handleGradePointChange = (index, field, value) => {
    const updatedGradePoints = [...gradePoints];
    updatedGradePoints[index] = {
      ...updatedGradePoints[index],
      [field]: value
    };
    setGradePoints(updatedGradePoints);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Grade Points</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          icon={Plus}
          onClick={handleAddGradePoint}
        >
          Add Grade Point
        </Button>
      </div>

      {gradePoints.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No grade points added yet</p>
          <Button
            type="button"
            variant="outline"
            icon={Plus}
            onClick={handleAddGradePoint}
          >
            Add First Grade Point
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {gradePoints.map((gradePoint, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900">Grade Point {index + 1}</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  icon={Trash2}
                  onClick={() => handleRemoveGradePoint(index)}
                  className="text-red-600 hover:text-red-700"
                  title="Remove"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Input
                    label="Grade"
                    value={gradePoint.grade}
                    onChange={(e) => handleGradePointChange(index, 'grade', e.target.value)}
                    placeholder="A+"
                    error={errors[`gradePoints.${index}.grade`]}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Min Marks"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={gradePoint.min_marks}
                    onChange={(e) => handleGradePointChange(index, 'min_marks', e.target.value)}
                    placeholder="85.00"
                    error={errors[`gradePoints.${index}.min_marks`]}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Max Marks"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={gradePoint.max_marks}
                    onChange={(e) => handleGradePointChange(index, 'max_marks', e.target.value)}
                    placeholder="100.00"
                    error={errors[`gradePoints.${index}.max_marks`]}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Grade Point"
                    type="number"
                    min="0"
                    step="0.01"
                    value={gradePoint.grade_point}
                    onChange={(e) => handleGradePointChange(index, 'grade_point', e.target.value)}
                    placeholder="4.00"
                    error={errors[`gradePoints.${index}.grade_point`]}
                    required
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-1">
                  <Input
                    label="Description"
                    value={gradePoint.description}
                    onChange={(e) => handleGradePointChange(index, 'description', e.target.value)}
                    placeholder="Excellent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {errors.gradePoints && (
        <p className="text-sm text-red-600">{errors.gradePoints}</p>
      )}
    </div>
  );
};

export default GradePointForm;
