import React from 'react';
import { Check, Plus, Minus } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const CLOMappingForm = ({ clos, mappings, totalMarks, onChange }) => {
  const handleToggleCLO = (cloId) => {
    const existingMapping = mappings.find(m => m.clo_id === cloId);
    
    if (existingMapping) {
      // Remove mapping
      onChange(mappings.filter(m => m.clo_id !== cloId));
    } else {
      // Add mapping with 0 marks
      onChange([...mappings, { clo_id: cloId, marks_allocated: 0 }]);
    }
  };

  const handleMarksChange = (cloId, marks) => {
    const value = parseFloat(marks) || 0;
    onChange(
      mappings.map(m => 
        m.clo_id === cloId 
          ? { ...m, marks_allocated: value }
          : m
      )
    );
  };

  const isMapped = (cloId) => mappings.some(m => m.clo_id === cloId);
  
  const getMappedMarks = (cloId) => {
    const mapping = mappings.find(m => m.clo_id === cloId);
    return mapping?.marks_allocated || 0;
  };

  const totalAllocated = mappings.reduce((sum, m) => sum + parseFloat(m.marks_allocated || 0), 0);
  const remaining = totalMarks - totalAllocated;
  const isOverAllocated = totalAllocated > totalMarks;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900">Total Marks</p>
          <p className="text-2xl font-bold text-blue-700">{totalMarks}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-900">Allocated</p>
          <p className={`text-2xl font-bold ${isOverAllocated ? 'text-red-700' : 'text-green-700'}`}>
            {totalAllocated.toFixed(2)}
          </p>
        </div>
        <div className={`border rounded-lg p-4 ${
          isOverAllocated 
            ? 'bg-red-50 border-red-200' 
            : remaining === 0 
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <p className={`text-sm font-medium ${
            isOverAllocated ? 'text-red-900' : remaining === 0 ? 'text-green-900' : 'text-yellow-900'
          }`}>
            Remaining
          </p>
          <p className={`text-2xl font-bold ${
            isOverAllocated ? 'text-red-700' : remaining === 0 ? 'text-green-700' : 'text-yellow-700'
          }`}>
            {remaining.toFixed(2)}
          </p>
        </div>
      </div>

      {isOverAllocated && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Warning: Total allocated marks exceed the assessment total marks!
        </div>
      )}

      {/* CLO List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Available CLOs</h3>
        
        {clos.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No CLOs available for this course offering</p>
          </div>
        ) : (
          <div className="space-y-2">
            {clos.map(clo => {
              const mapped = isMapped(clo.clo_id);
              const marksAllocated = getMappedMarks(clo.clo_id);

              return (
                <div
                  key={clo.clo_id}
                  className={`border rounded-lg p-4 transition-all ${
                    mapped 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleCLO(clo.clo_id)}
                        className={`mt-1 p-1 rounded-full transition-colors ${
                          mapped
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        {mapped ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{clo.clo_code}</h4>
                          {clo.bloom_level_name && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              {clo.bloom_level_name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{clo.description}</p>
                      </div>
                    </div>

                    {mapped && (
                      <div className="ml-4 flex items-center space-x-2">
                        <div className="w-32">
                          <Input
                            type="number"
                            value={marksAllocated}
                            onChange={(e) => handleMarksChange(clo.clo_id, e.target.value)}
                            placeholder="Marks"
                            min="0"
                            max={totalMarks}
                            step="0.5"
                            className="text-sm"
                          />
                        </div>
                        <span className="text-sm text-gray-500">marks</span>
                      </div>
                    )}
                  </div>

                  {mapped && marksAllocated > 0 && (
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <div className="flex items-center justify-between text-xs text-blue-700">
                        <span>Contribution to total</span>
                        <span className="font-semibold">
                          {((marksAllocated / totalMarks) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Summary */}
      {mappings.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Selected CLOs ({mappings.length})
          </h4>
          <div className="space-y-2">
            {mappings.map(mapping => {
              const clo = clos.find(c => c.clo_id === mapping.clo_id);
              if (!clo) return null;

              return (
                <div
                  key={mapping.clo_id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700">{clo.clo_code}</span>
                  <span className="font-semibold text-gray-900">
                    {mapping.marks_allocated} marks
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CLOMappingForm;
