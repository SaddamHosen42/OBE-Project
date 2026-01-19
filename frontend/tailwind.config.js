/** @type {import('tailwindcss').Config} */
export default {














































































































































































































}  }    animation-delay: 600ms;  .animation-delay-600 {  }    animation-delay: 400ms;  .animation-delay-400 {  }    animation-delay: 200ms;  .animation-delay-200 {  }    text-wrap: balance;  .text-balance {@layer utilities {/* Utility Classes */}  }    @apply bg-primary-50 text-primary-600 border-r-4 border-primary-600;  .sidebar-item-active {  }    @apply flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors cursor-pointer;  .sidebar-item {  }    @apply fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm transition-transform duration-300;  .sidebar {  /* Sidebar Styles */  }    @apply bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4;  .modal {  }    @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;  .modal-overlay {  /* Modal Overlay */  }    @apply bg-danger-50 border border-danger-200 text-danger-800;  .alert-danger {  }    @apply bg-warning-50 border border-warning-200 text-warning-800;  .alert-warning {  }    @apply bg-success-50 border border-success-200 text-success-800;  .alert-success {  }    @apply bg-primary-50 border border-primary-200 text-primary-800;  .alert-info {  }    @apply p-4 rounded-md;  .alert {  /* Alert Styles */  }    @apply px-6 py-4 whitespace-nowrap text-sm;  .table-cell {  }    @apply hover:bg-gray-50 transition-colors;  .table-row {  }    @apply bg-gray-50;  .table-header {  }    @apply min-w-full divide-y divide-gray-200;  .table {  /* Table Styles */  }    @apply bg-secondary-100 text-secondary-800;  .badge-secondary {  }    @apply bg-danger-100 text-danger-800;  .badge-danger {  }    @apply bg-warning-100 text-warning-800;  .badge-warning {  }    @apply bg-success-100 text-success-800;  .badge-success {  }    @apply bg-primary-100 text-primary-800;  .badge-primary {  }    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;  .badge {  /* Badge Styles */  }    @apply px-6 py-4 bg-gray-50 border-t border-gray-200;  .card-footer {  }    @apply px-6 py-4;  .card-body {  }    @apply px-6 py-4 border-b border-gray-200;  .card-header {  }    @apply bg-white rounded-lg shadow-md overflow-hidden;  .card {  /* Card Styles */  }    @apply border-danger-500 focus:ring-danger-500 focus:border-danger-500;  .input-error {  }    @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm;  .input {  /* Input Styles */  }    @apply px-6 py-3 text-base;  .btn-lg {  }    @apply px-3 py-1.5 text-xs;  .btn-sm {  }    @apply bg-success-600 text-white hover:bg-success-700 focus:ring-success-500;  .btn-success {  }    @apply bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500;  .btn-danger {  }    @apply border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500;  .btn-outline {  }    @apply bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500;  .btn-secondary {  }    @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;  .btn-primary {  }    @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;  .btn {  /* Button Variants */@layer components {/* Component Styles */}  }    @apply outline-none ring-2 ring-primary-500 ring-offset-2;  *:focus-visible {  /* Focus Styles */  }    @apply bg-gray-400;  ::-webkit-scrollbar-thumb:hover {  }    @apply bg-gray-300 rounded-full;  ::-webkit-scrollbar-thumb {  }    @apply bg-gray-100;  ::-webkit-scrollbar-track {  }    @apply w-3 h-3;  ::-webkit-scrollbar {  /* Custom Scrollbar */  }    font-feature-settings: 'rlig' 1, 'calt' 1;    @apply bg-gray-50 text-gray-900 antialiased;  body {    }    @apply scroll-smooth;  html {    }    @apply border-border;  * {@layer base {/* Base Styles */@tailwind utilities;  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
