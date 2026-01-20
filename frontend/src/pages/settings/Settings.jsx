import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  FiUser, 
  FiSettings, 
  FiSun, 
  FiMoon,
  FiChevronRight,
  FiBell,
  FiLock,
  FiGlobe,
  FiDatabase,
  FiInfo
} from 'react-icons/fi';
import useAppStore from '../../store/appStore';
import useAuthStore from '../../store/authStore';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useAppStore();
  const { user } = useAuthStore();

  const settingsCategories = [
    {
      title: 'Profile Settings',
      description: 'Manage your personal information and preferences',
      icon: FiUser,
      path: '/settings/profile',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      icon: FiSettings,
      path: '/settings/system',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      requiresAdmin: true,
    },
    {
      title: 'Theme Settings',
      description: 'Customize the appearance and theme',
      icon: theme === 'light' ? FiSun : FiMoon,
      path: '/settings/theme',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Notifications',
      description: 'Manage notification preferences',
      icon: FiBell,
      path: '/settings/notifications',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      comingSoon: true,
    },
    {
      title: 'Security',
      description: 'Password and security settings',
      icon: FiLock,
      path: '/settings/security',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      comingSoon: true,
    },
    {
      title: 'Language & Region',
      description: 'Set language and regional preferences',
      icon: FiGlobe,
      path: '/settings/language',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      comingSoon: true,
    },
    {
      title: 'Data Management',
      description: 'Backup, export, and import data',
      icon: FiDatabase,
      path: '/settings/data',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      requiresAdmin: true,
      comingSoon: true,
    },
    {
      title: 'About',
      description: 'System information and version details',
      icon: FiInfo,
      path: '/settings/about',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      comingSoon: true,
    },
  ];

  // Filter settings based on user role
  const availableSettings = settingsCategories.filter(setting => {
    if (setting.requiresAdmin && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  const handleSettingClick = (setting) => {
    if (setting.comingSoon) {
      return;
    }
    navigate(setting.path);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your account and system preferences
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              title="Toggle theme"
            >
              {theme === 'light' ? (
                <FiMoon className="w-5 h-5 text-gray-700" />
              ) : (
                <FiSun className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <FiUser className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500 capitalize">Role: {user?.role}</p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableSettings.map((setting, index) => {
          const Icon = setting.icon;
          const isDisabled = setting.comingSoon;

          return (
            <div
              key={index}
              onClick={() => handleSettingClick(setting)}
              className={`
                bg-white rounded-lg shadow-sm border border-gray-200 p-6
                transition-all duration-200
                ${
                  isDisabled
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:shadow-md hover:border-blue-300 cursor-pointer'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-lg ${setting.bgColor}`}>
                    <Icon className={`w-6 h-6 ${setting.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      {setting.title}
                      {isDisabled && (
                        <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {setting.description}
                    </p>
                  </div>
                </div>
                {!isDisabled && (
                  <FiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Keep your profile information up to date for better system experience</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Customize your theme to match your preference</span>
          </li>
          {user?.role === 'admin' && (
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>As an admin, you have access to system-wide configuration options</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Settings;
