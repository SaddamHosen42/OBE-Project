import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiBook, FiCheckCircle, FiClock } from 'react-icons/fi';
import DataTable from '../../components/data/DataTable';
import SearchBar from '../../components/data/SearchBar';
import ExportButton from '../../components/data/ExportButton';
import semesterService from '../../services/semesterService';

const SemesterList = () => {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState(null);

  // Fetch semesters
  const fetchSemesters = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        withSession: 'true',
      };
      
      if (searchQuery) params.search = searchQuery;
      
      const response = await semesterService.getAllSemesters(params);
      
      if (response.success) {
        setSemesters(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }
    } catch (err) {
      console.error('Error fetching semesters:', err);
      setError(err.message || 'Failed to load semesters');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, [currentPage, itemsPerPage, searchQuery]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle delete
  const handleDeleteClick = (semester) => {
    setSemesterToDelete(semester);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!semesterToDelete) return;
    
    try {
      const response = await semesterService.deleteSemester(semesterToDelete.id);
      
      if (response.success) {
        // Refresh the list
        fetchSemesters();
        setShowDeleteModal(false);
        setSemesterToDelete(null);
        
        // Show success message
        alert('Semester deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting semester:', err);
      alert(err.message || 'Failed to delete semester');
    }
  };

  // Handle activate
  const handleActivate = async (semesterId) => {
    try {
      const response = await semesterService.activateSemester(semesterId);
      
      if (response.success) {
        // Refresh the list
        fetchSemesters();
        alert('Semester activated successfully');
      }
    } catch (err) {
      console.error('Error activating semester:', err);
      alert(err.message || 'Failed to activate semester');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Table columns
  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Semester',
      sortable: true,
      render: (semester) => (
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <FiBook className="text-white" size={20} />
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{semester.name}</div>
            <div className="text-sm text-gray-500">
              Semester {semester.semester_number}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'session_name',
      label: 'Academic Session',
      sortable: true,
      render: (semester) => semester.session_name || '-',
    },
    {
      key: 'start_date',
      label: 'Start Date',
      sortable: true,
      render: (semester) => formatDate(semester.start_date),
    },
    {
      key: 'end_date',
      label: 'End Date',
      sortable: true,
      render: (semester) => formatDate(semester.end_date),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (semester) => (
        <div className="flex items-center gap-2">
          {semester.is_active ? (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 flex items-center gap-1">
              <FiCheckCircle size={14} />
              Active
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 flex items-center gap-1">
              <FiClock size={14} />
              Inactive
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (semester) => (
        <div className="flex items-center space-x-2">
          {!semester.is_active && (
            <button
              onClick={() => handleActivate(semester.id)}
              className="btn btn-sm btn-success"
              title="Activate"
            >
              <FiCheckCircle size={16} />
              Activate
            </button>
          )}
          <button
            onClick={() => navigate(`/semesters/${semester.id}/edit`)}
            className="btn btn-sm btn-primary"
            title="Edit"
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={() => handleDeleteClick(semester)}
            className="btn btn-sm btn-error"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // Export data
  const exportData = semesters.map(semester => ({
    ID: semester.id,
    'Semester Name': semester.name,
    'Semester Number': semester.semester_number,
    'Academic Session': semester.session_name || '-',
    'Start Date': formatDate(semester.start_date),
    'End Date': formatDate(semester.end_date),
    'Status': semester.is_active ? 'Active' : 'Inactive',
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiBook className="text-purple-600" />
            Semesters
          </h1>
          <p className="text-gray-600 mt-2">Manage semesters within academic sessions</p>
        </div>
        <Link to="/semesters/create">
          <button className="btn btn-primary flex items-center gap-2">
            <FiPlus size={20} />
            Add Semester
          </button>
        </Link>
      </div>

      {/* Search and Export */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search semesters..."
          />
        </div>
        <ExportButton
          data={exportData}
          filename="semesters"
          disabled={semesters.length === 0}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={semesters}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirm Deletion</h3>
            <p className="mb-4">
              Are you sure you want to delete the semester{' '}
              <span className="font-semibold">{semesterToDelete?.name}</span>?
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSemesterToDelete(null);
                }}
                className="btn"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterList;
