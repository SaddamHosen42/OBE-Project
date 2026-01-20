import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import Button from './Button';

/**
 * Confirmation dialog component
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  confirmLoading = false,
  icon,
  className = ''
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    if (!confirmLoading) {
      onClose();
    }
  };

  const variantIcons = {
    danger: (
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    ),
    warning: (
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    ),
    info: (
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    success: (
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )
  };

  const confirmButtonVariant = {
    danger: 'danger',
    warning: 'warning',
    info: 'primary',
    success: 'success'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className={className}
      showCloseButton={false}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="mb-4">
          {icon || variantIcons[variant]}
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>

        {/* Message */}
        <div className="text-sm text-gray-500 mb-6">
          {message}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 justify-center">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={confirmLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmButtonVariant[variant]}
            onClick={handleConfirm}
            loading={confirmLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'warning', 'info', 'success']),
  confirmLoading: PropTypes.bool,
  icon: PropTypes.node,
  className: PropTypes.string
};

export default ConfirmDialog;
