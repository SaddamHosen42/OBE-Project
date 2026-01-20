import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import DataTable from '../../components/data/DataTable';
import SearchBar from '../../components/data/SearchBar';
import ExportButton from '../../components/data/ExportButton';
import sessionService from '../../services/sessionService';

const SessionList = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  // Fetch sessions
  const fetchSessions = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        withSemesters: 'true',
      };
      
      if (searchQuery) params.search = searchQuery;
      
      const response = await sessionService.getAllSessions(params);
      
      if (response.success) {
        setSessions(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message || 'Failed to load academic sessions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentPage, itemsPerPage, searchQuery]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle delete
  const handleDeleteClick = (session) => {
    setSessionToDelete(session);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    
    try {
      const response = await sessionService.deleteSession(sessionToDelete.id);
      
      if (response.success) {
        // Refresh the list
        fetchSessions();
        setShowDeleteModal(false);
        setSessionToDelete(null);
        
        // Show success message
        alert('Academic session deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      alert(err.message || 'Failed to delete academic session');
    }
  };

  // Handle set active
  const handleSetActive = async (sessionId) => {
    try {
      const response = await sessionService.setActiveSession(sessionId);
      
      if (response.success) {
        // Refresh the list
        fetchSessions();
        alert('Academic session set as active successfully');
      }
    } catch (err) {
      console.error('Error setting active session:', err);
      alert(err.message || 'Failed to set active academic session');
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
      key: 'session_name',
      label: 'Session Name',
      sortable: true,
      render: (session) => (
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
              <FiCalendar className="text-white" size={20} />
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{session.session_name}</div>
            <div className="text-sm text-gray-500">
              {session.semester_count || 0} semester{(session.semester_count || 0) !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'start_date',
      label: 'Start Date',
      sortable: true,
      render: (session) => formatDate(session.start_date),
    },
    {
      key: 'end_date',
      label: 'End Date',
      sortable: true,
      render: (session) => formatDate(session.end_date),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (session) => (
        <div className="flex items-center gap-2">
          {session.is_active ? (
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
      render: (session) => (
        <div className="flex items-center space-x-2">
          {!session.is_active && (
            <button
              onClick={() => handleSetActive(session.id)}
              className="btn btn-sm btn-success"
              title="Set as Active"
            >
              <FiCheckCircle size={16} />
              Set Active
            </button>
          )}
          <button
            onClick={() => navigate(`/sessions/${session.id}/edit`)}
            className="btn btn-sm btn-primary"
            title="Edit"
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={() => handleDeleteClick(session)}
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
  const exportData = sessions.map(session => ({
    ID: session.id,
    'Session Name': session.session_name,
    'Start Date': formatDate(session.start_date),
    'End Date': formatDate(session.end_date),
    'Status': session.is_active ? 'Active' : 'Inactive',
    'Semester Count': session.semester_count || 0,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiCalendar className="text-indigo-600" />
            Academic Sessions
          </h1>
          <p className="text-gray-600 mt-2">Manage academic years and sessions</p>
        </div>
        <Link to="/sessions/create">
          <button className="btn btn-primary flex items-center gap-2">
            <FiPlus size={20} />
            Add Session
          </button>
        </Link>
      </div>

      {/* Search and Export */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search sessions..."
          />
        </div>
        <ExportButton
          data={exportData}
          filename="academic_sessions"
          disabled={sessions.length === 0}
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
        data={sessions}
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
              Are you sure you want to delete the academic session{' '}
              <span className="font-semibold">{sessionToDelete?.session_name}</span>?
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSessionToDelete(null);
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

export default SessionList;
