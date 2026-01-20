import React, { useState } from 'react';
import { Check } from 'lucide-react';

const AssessmentTypeSelector = ({ types, selectedTypeId, onSelect, error }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Group types by category
  const groupedTypes = types.reduce((acc, type) => {
    const category = type.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(type);
    return acc;
  }, {});

  const categories = Object.keys(groupedTypes);

  // Filter types based on selected category
  const filteredTypes = selectedCategory === 'all' 
    ? types 
    : groupedTypes[selectedCategory] || [];

  const categoryColors = {
    Formative: 'bg-green-100 text-green-800 hover:bg-green-200',
    Summative: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Types
          </button>
          {categories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedCategory === category
                  ? categoryColors[category]?.replace('hover:', '') || 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Assessment Type Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTypes.map(type => {
          const isSelected = selectedTypeId === type.assessment_type_id;
          const categoryColor = categoryColors[type.category] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';

          return (
            <button
              key={type.assessment_type_id}
              type="button"
              onClick={() => onSelect(type.assessment_type_id)}
              className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="bg-blue-500 rounded-full p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-start justify-between pr-8">
                  <h4 className="font-semibold text-gray-900">{type.name}</h4>
                </div>
                
                {type.category && (
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    type.category === 'Formative' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {type.category}
                  </span>
                )}

                {type.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {type.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filteredTypes.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No assessment types available</p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default AssessmentTypeSelector;
