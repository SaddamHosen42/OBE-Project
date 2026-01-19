import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiBook, 
  FiTarget, 
  FiClipboard, 
  FiBarChart2, 
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiX,
  FiFileText,
  FiCalendar,
  FiAward,
  FiBookOpen
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubmenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const menuItems = [
    {
      key: 'dashboard',
      title: 'Dashboard',
      icon: FiHome,
      path: '/',
    },
    {
      key: 'academics',
      title: 'Academic Structure',
      icon: FiBookOpen,
      submenu: [
        { title: 'Faculties', path: '/faculties', icon: FiBook },
        { title: 'Departments', path: '/departments', icon: FiBook },
        { title: 'Degrees', path: '/degrees', icon: FiAward },
        { title: 'Courses', path: '/courses', icon: FiFileText },
      ]
    },
    {
      key: 'users',
      title: 'User Management',
      icon: FiUsers,
      submenu: [
        { title: 'Faculty Members', path: '/faculty', icon: FiUsers },
        { title: 'Students', path: '/students', icon: FiUsers },
        { title: 'Administrators', path: '/admins', icon: FiUsers },
      ]
    },
    {
      key: 'curriculum',
      title: 'Curriculum',
      icon: FiBook,
      submenu: [
        { title: 'Course Objectives', path: '/course-objectives', icon: FiTarget },
        { title: 'Course Outcomes (CLOs)', path: '/clos', icon: FiTarget },
        { title: 'PLO Mapping', path: '/plo-mapping', icon: FiTarget },
        { title: 'Lesson Plans', path: '/lesson-plans', icon: FiCalendar },
      ]
    },
    {
      key: 'assessment',
      title: 'Assessment',
      icon: FiClipboard,
      submenu: [
        { title: 'Assessment Types', path: '/assessment-types', icon: FiClipboard },
        { title: 'Assessment Components', path: '/assessment-components', icon: FiClipboard },
        { title: 'Rubrics', path: '/rubrics', icon: FiClipboard },
        { title: 'Grades', path: '/grades', icon: FiAward },
      ]
    },
    {
      key: 'reports',
      title: 'Reports & Analytics',
      icon: FiBarChart2,
      submenu: [
        { title: 'CLO Attainment', path: '/reports/clo-attainment', icon: FiBarChart2 },
        { title: 'PLO Attainment', path: '/reports/plo-attainment', icon: FiBarChart2 },
        { title: 'Course Reports', path: '/reports/courses', icon: FiFileText },
        { title: 'Program Reports', path: '/reports/programs', icon: FiFileText },
      ]
    },
    {
      key: 'settings',
      title: 'Settings',
      icon: FiSettings,
      path: '/settings',
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const hasActiveSubmenu = (submenu) => {
    return submenu?.some(item => isActive(item.path));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen w-64 bg-gradient-to-b from-indigo-800 to-indigo-900 text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 shadow-2xl`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-indigo-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-indigo-900 font-bold text-xl">OBE</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">OBE System</h2>
              <p className="text-xs text-indigo-300">Management Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-white hover:bg-indigo-700 p-1 rounded"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => (
            <div key={item.key}>
              {item.submenu ? (
                <>
                  {/* Menu with Submenu */}
                  <button
                    onClick={() => toggleSubmenu(item.key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      hasActiveSubmenu(item.submenu) || expandedMenus[item.key]
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-100 hover:bg-indigo-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={20} />
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    {expandedMenus[item.key] ? (
                      <FiChevronDown size={16} />
                    ) : (
                      <FiChevronRight size={16} />
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {expandedMenus[item.key] && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-indigo-600 pl-2">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive(subItem.path)
                              ? 'bg-white text-indigo-900 font-semibold shadow-md'
                              : 'text-indigo-200 hover:bg-indigo-700/50 hover:text-white'
                          }`}
                        >
                          <subItem.icon size={16} />
                          <span>{subItem.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Single Menu Item */
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-white text-indigo-900 font-semibold shadow-md'
                      : 'text-indigo-100 hover:bg-indigo-700/50'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium text-sm">{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-indigo-700">
          <div className="flex items-center space-x-3 px-4 py-3 bg-indigo-700/50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">AD</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Admin User</p>
              <p className="text-xs text-indigo-300">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
