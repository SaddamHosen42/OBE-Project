import { FiHeart, FiGithub, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">OBE</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">OBE Management System</h3>
                <p className="text-xs text-gray-500">Outcome-Based Education Platform</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              A comprehensive solution for managing Outcome-Based Education (OBE) processes, 
              curriculum planning, assessment tracking, and program evaluation for modern universities.
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                aria-label="GitHub"
              >
                <FiGithub size={20} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                aria-label="Email"
              >
                <FiMail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                  User Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm text-gray-600">
                <FiMapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                <span>University Campus, Education City</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-600">
                <FiPhone size={16} className="shrink-0 text-gray-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-600">
                <FiMail size={16} className="shrink-0 text-gray-400" />
                <span>support@university.edu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>© {currentYear} OBE System. Made with</span>
              <FiHeart size={14} className="text-red-500 fill-current" />
              <span>for education excellence</span>
            </div>

            {/* Links */}
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                Help Center
              </a>
            </div>
          </div>

          {/* System Info */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>System Status: Operational</span>
              </span>
              <span>Version 1.0.0</span>
              <span>Last Updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
