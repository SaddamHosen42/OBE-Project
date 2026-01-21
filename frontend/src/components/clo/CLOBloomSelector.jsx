import React from 'react';
import { Brain, Info } from 'lucide-react';

const CLOBloomSelector = ({ selectedLevel, onLevelChange, error }) => {
  const bloomLevels = [
    {
      id: 1,
      name: 'Remember',
      description: 'Recall facts and basic concepts',
      color: 'blue',
      keywords: ['Define', 'List', 'Recall', 'Identify', 'Name', 'State']
    },
    {
      id: 2,
      name: 'Understand',
      description: 'Explain ideas or concepts',
      color: 'green',
      keywords: ['Describe', 'Explain', 'Summarize', 'Interpret', 'Discuss']
    },
    {
      id: 3,
      name: 'Apply',
      description: 'Use information in new situations',
      color: 'yellow',
      keywords: ['Apply', 'Implement', 'Execute', 'Use', 'Demonstrate']
    },
    {
      id: 4,
      name: 'Analyze',
      description: 'Draw connections among ideas',
      color: 'orange',
      keywords: ['Analyze', 'Compare', 'Contrast', 'Examine', 'Categorize']
    },
    {
      id: 5,
      name: 'Evaluate',
      description: 'Justify a decision or course of action',
      color: 'red',
      keywords: ['Evaluate', 'Justify', 'Critique', 'Assess', 'Judge']
    },
    {
      id: 6,
      name: 'Create',
      description: 'Produce new or original work',
      color: 'purple',
      keywords: ['Create', 'Design', 'Construct', 'Develop', 'Formulate']
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      selectedBorder: 'border-blue-500',
      selectedBg: 'bg-blue-500',
      text: 'text-blue-700',
      hoverBg: 'hover:bg-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      selectedBorder: 'border-green-500',
      selectedBg: 'bg-green-500',
      text: 'text-green-700',
      hoverBg: 'hover:bg-green-100'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      selectedBorder: 'border-yellow-500',
      selectedBg: 'bg-yellow-500',
      text: 'text-yellow-700',
      hoverBg: 'hover:bg-yellow-100'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      selectedBorder: 'border-orange-500',
      selectedBg: 'bg-orange-500',
      text: 'text-orange-700',
      hoverBg: 'hover:bg-orange-100'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      selectedBorder: 'border-red-500',
      selectedBg: 'bg-red-500',
      text: 'text-red-700',
      hoverBg: 'hover:bg-red-100'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      selectedBorder: 'border-purple-500',
      selectedBg: 'bg-purple-500',
      text: 'text-purple-700',
      hoverBg: 'hover:bg-purple-100'
    }
  };

  return (
    <div className="space-y-4">
      {/* Bloom's Taxonomy Pyramid Visual */}
      <div className="bg-gradient-to-b from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Bloom's Taxonomy</h3>
        </div>
        <p className="text-xs text-gray-600 text-center">
          Select the cognitive level that best describes this learning outcome
        </p>
      </div>

      {/* Bloom Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bloomLevels.map((level) => {
          const colors = colorClasses[level.color];
          const isSelected = selectedLevel === level.id.toString() || selectedLevel === level.id;
          
          return (
            <button
              key={level.id}
              type="button"
              onClick={() => onLevelChange(level.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${colors.bg} ${colors.hoverBg}
                ${isSelected 
                  ? `${colors.selectedBorder} ring-2 ring-offset-2 ring-${level.color}-500` 
                  : `${colors.border} hover:border-${level.color}-400`
                }
                ${error ? 'border-red-500' : ''}
              `}
            >
              {/* Level Number Badge */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`
                    inline-flex items-center justify-center h-8 w-8 rounded-full text-white text-sm font-bold
                    ${isSelected ? colors.selectedBg : `${colors.border} bg-white ${colors.text}`}
                  `}
                >
                  {level.id}
                </span>
                {isSelected && (
                  <div className={`h-6 w-6 rounded-full ${colors.selectedBg} flex items-center justify-center`}>
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Level Name */}
              <h4 className={`font-semibold mb-1 ${colors.text}`}>{level.name}</h4>

              {/* Description */}
              <p className="text-xs text-gray-600 mb-3">{level.description}</p>

              {/* Keywords */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">Action Verbs:</p>
                <div className="flex flex-wrap gap-1">
                  {level.keywords.slice(0, 3).map((keyword, index) => (
                    <span
                      key={index}
                      className={`inline-block px-2 py-0.5 text-xs rounded ${
                        isSelected ? 'bg-white text-gray-700' : 'bg-white text-gray-600'
                      }`}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Choosing the Right Level</p>
          <p className="text-blue-700">
            Select the highest cognitive level that students are expected to demonstrate. 
            Lower levels are implied (e.g., students who can "Analyze" can also "Remember" and "Understand").
          </p>
        </div>
      </div>

      {/* Hierarchy Reference */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Cognitive Complexity Hierarchy</h4>
        <div className="flex items-center justify-center space-x-2">
          {bloomLevels.map((level, index) => (
            <React.Fragment key={level.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${selectedLevel === level.id.toString() || selectedLevel === level.id
                      ? `${colorClasses[level.color].selectedBg} text-white`
                      : `${colorClasses[level.color].bg} ${colorClasses[level.color].text}`
                    }
                  `}
                >
                  {level.id}
                </div>
                <span className="text-xs text-gray-600 mt-1">{level.name}</span>
              </div>
              {index < bloomLevels.length - 1 && (
                <div className="text-gray-400">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Lower Order Thinking Skills ← → Higher Order Thinking Skills
        </p>
      </div>
    </div>
  );
};

export default CLOBloomSelector;
