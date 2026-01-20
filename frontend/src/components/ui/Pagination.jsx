import React from 'react';
import PropTypes from 'prop-types';

/**
 * Pagination component for navigating through pages
 */
const Pagination = ({
  currentPage = 1,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  disabled = false,
  className = ''
}) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !disabled) {
      onPageChange(page);
    }
  };

  const getVisiblePages = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis-start');
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const baseButtonClasses = 'px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  const enabledButtonClasses = 'text-gray-700 hover:bg-gray-100';
  const disabledButtonClasses = 'text-gray-400 cursor-not-allowed';
  const activeButtonClasses = 'bg-blue-600 text-white hover:bg-blue-700';

  const visiblePages = getVisiblePages();

  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`} aria-label="Pagination">
      {/* First Page Button */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || disabled}
          className={`${baseButtonClasses} ${
            currentPage === 1 || disabled ? disabledButtonClasses : enabledButtonClasses
          }`}
          aria-label="First page"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Previous Page Button */}
      {showPrevNext && (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
          className={`${baseButtonClasses} ${
            currentPage === 1 || disabled ? disabledButtonClasses : enabledButtonClasses
          }`}
          aria-label="Previous page"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Page Numbers */}
      {visiblePages.map((page, index) => {
        if (typeof page === 'string' && page.startsWith('ellipsis')) {
          return (
            <span key={page} className="px-3 py-2 text-gray-500">
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            disabled={disabled}
            className={`${baseButtonClasses} ${
              page === currentPage
                ? activeButtonClasses
                : disabled
                ? disabledButtonClasses
                : enabledButtonClasses
            }`}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      {/* Next Page Button */}
      {showPrevNext && (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || disabled}
          className={`${baseButtonClasses} ${
            currentPage === totalPages || disabled ? disabledButtonClasses : enabledButtonClasses
          }`}
          aria-label="Next page"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Last Page Button */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || disabled}
          className={`${baseButtonClasses} ${
            currentPage === totalPages || disabled ? disabledButtonClasses : enabledButtonClasses
          }`}
          aria-label="Last page"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm-6 0a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  showFirstLast: PropTypes.bool,
  showPrevNext: PropTypes.bool,
  maxVisiblePages: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default Pagination;
