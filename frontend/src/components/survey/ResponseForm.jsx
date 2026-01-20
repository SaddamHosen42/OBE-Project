import { QuestionInput } from './QuestionTypes';

const ResponseForm = ({ questions, responses, errors, onChange }) => {
  return (
    <div className="space-y-6">
      {questions.map((question, index) => (
        <div key={question.question_id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {/* Question Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                    Question {index + 1}
                  </span>
                  {question.is_required && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      Required
                    </span>
                  )}
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded capitalize">
                    {question.question_type?.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {question.question_text}
                  {question.is_required && (
                    <span className="text-red-600 ml-1">*</span>
                  )}
                </h3>
                {question.description && (
                  <p className="mt-1 text-sm text-gray-600">{question.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Question Input */}
          <QuestionInput
            question={question}
            value={responses[question.question_id] || ''}
            onChange={(value) => onChange(question.question_id, value)}
            error={errors[question.question_id]}
          />
        </div>
      ))}
    </div>
  );
};

export default ResponseForm;
