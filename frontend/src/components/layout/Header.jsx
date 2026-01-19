import { useState } from 'react';
import { 
  FiMenu, 
  FiBell, 
  FiMail, 
  FiSearch, 
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown
} from 'react-icons/fi';

const Header = ({ toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'New Assessment Submitted',
      message: 'John Doe submitted CSC101 Midterm',
      time: '5 min ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Course Updated',
      message: 'Database Systems syllabus updated',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Report Generated',
      message: 'PLO Attainment Report ready',
      time: '2 hours ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Menu Toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <FiMenu size={24} className="text-gray-700" />
          </button>

          {/* Search Bar */}
          <div className="hidden md:block">
            <div className={`relative transition-all duration-300 ${searchFocused ? 'w-96' : 'w-64'}`}>
              <FiSearch 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Search courses, students, reports..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200">
              Quick Add
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              Generate Report
            </button>
          </div>

          {/* Messages */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <FiMail size={20} className="text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FiBell size={20} className="text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                        notification.unread ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1 ml-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">AD</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <FiChevronDown size={16} className="text-gray-600" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">admin@university.edu</p>
                </div>
                <div className="py-2">
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                    <FiUser size={16} />
                    <span>My Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                    <FiSettings size={16} />
                    <span>Settings</span>
                  </button>
                </div>
                <div className="border-t border-gray-200 py-2">
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150">
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-6 pb-4">
        <div className="relative">
          <FiSearch 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
