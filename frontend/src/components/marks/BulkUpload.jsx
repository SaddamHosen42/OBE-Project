import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FiUpload, FiFile, FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import * as XLSX from 'xlsx';

const BulkUpload = ({ 
  assessmentId,
  students = [], 
  questions = [],
  onUpload,
  onCancel
}) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState('');

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, []);

  // Process the uploaded file
  const processFile = async (uploadedFile) => {
    setParseError('');
    setFile(uploadedFile);

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(uploadedFile.type)) {
      setParseError('Invalid file type. Please upload Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    setIsProcessing(true);

    try {
      const data = await readFile(uploadedFile);
      const parsedData = parseMarksData(data);
      
      if (parsedData.length > 0) {
        onUpload(parsedData);
      } else {
        setParseError('No valid data found in the file.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setParseError(error.message || 'Failed to process file.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Read file content
  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  // Parse marks data from file
  const parseMarksData = (data) => {
    const marksArray = [];
    const errors = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because index starts at 0 and header is row 1

      // Get student by roll number or student ID
      const student = students.find(
        s => s.roll_number === row.roll_number || s.student_id === row.student_id
      );

      if (!student) {
        errors.push(`Row ${rowNum}: Student not found`);
        return;
      }

      // Process marks for each question
      questions.forEach(question => {
        const questionKey = `q${question.question_number}`;
        const marks = row[questionKey];

        if (marks !== undefined && marks !== null && marks !== '') {
          const marksNum = parseFloat(marks);

          if (isNaN(marksNum)) {
            errors.push(`Row ${rowNum}: Invalid marks for Q${question.question_number}`);
            return;
          }

          if (marksNum < 0) {
            errors.push(`Row ${rowNum}: Negative marks for Q${question.question_number}`);
            return;
          }

          if (marksNum > question.total_marks) {
            errors.push(
              `Row ${rowNum}: Marks exceed maximum for Q${question.question_number} (${question.total_marks})`
            );
            return;
          }

          marksArray.push({
            student_id: student.student_id,
            question_id: question.question_id,
            assessment_component_id: parseInt(assessmentId),
            marks_obtained: marksNum,
          });
        }
      });
    });

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    return marksArray;
  };

  // Remove file
  const handleRemoveFile = () => {
    setFile(null);
    setParseError('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <FiUpload className="mx-auto text-4xl text-gray-400 mb-4" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {file ? 'File Selected' : 'Upload Marks File'}
          </p>
          <p className="text-sm text-gray-600">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Supported formats: Excel (.xlsx, .xls) or CSV
          </p>
        </div>

        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        
        <label
          htmlFor="file-upload"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          Choose File
        </label>
      </div>

      {/* Selected File Info */}
      {file && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <FiFile className="text-blue-600 text-xl flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                {isProcessing && (
                  <p className="text-sm text-blue-600 mt-1 flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Processing file...
                  </p>
                )}
                {!isProcessing && !parseError && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-2">
                    <FiCheckCircle />
                    File processed successfully
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-gray-400 hover:text-gray-600"
              disabled={isProcessing}
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>
      )}

      {/* Parse Error */}
      {parseError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <FiAlertCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Error Processing File</p>
              <p className="text-sm text-red-800 mt-1 whitespace-pre-line">{parseError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <FiAlertCircle className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">File Format:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>First column: <strong>roll_number</strong> (student roll number)</li>
              <li>Subsequent columns: <strong>q1, q2, q3, ...</strong> (marks for each question)</li>
              <li>Header row must be present</li>
              <li>Leave cells empty for questions not answered</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

BulkUpload.propTypes = {
  assessmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  students: PropTypes.array.isRequired,
  questions: PropTypes.array.isRequired,
  onUpload: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export default BulkUpload;
