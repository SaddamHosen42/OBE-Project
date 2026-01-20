import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiSun,
  FiMoon,
  FiMonitor,
  FiCheck,
  FiEye,
  FiDroplet,
  FiZap
} from 'react-icons/fi';
import useAppStore from '../../store/appStore';

const ThemeSettings = () => {
  const navigate = useNavigate();
  const { theme, setTheme, addNotification } = useAppStore();

  const [selectedTheme, setSelectedTheme] = useState(theme || 'light');
  const [selectedAccentColor, setSelectedAccentColor] = useState('blue');
  const [fontSize, setFontSize] = useState('medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const themes = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean and bright interface',
      icon: FiSun,
      preview: {
        bg: 'bg-white',
        text: 'text-gray-900',
        border: 'border-gray-200',
      },
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Easy on the eyes in low light',
      icon: FiMoon,
      preview: {
        bg: 'bg-gray-900',
        text: 'text-white',
        border: 'border-gray-700',
      },
    },
    {
      id: 'auto',
      name: 'Auto',
      description: 'Matches system preference',
      icon: FiMonitor,
      preview: {
        bg: 'bg-gradient-to-r from-white to-gray-900',
        text: 'text-gray-600',
        border: 'border-gray-400',
      },
      comingSoon: true,
    },
  ];

  const accentColors = [
    { id: 'blue', name: 'Blue', color: 'bg-blue-600', hex: '#2563eb' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-600', hex: '#9333ea' },
    { id: 'green', name: 'Green', color: 'bg-green-600', hex: '#16a34a' },
    { id: 'red', name: 'Red', color: 'bg-red-600', hex: '#dc2626' },
    { id: 'orange', name: 'Orange', color: 'bg-orange-600', hex: '#ea580c' },
    { id: 'pink', name: 'Pink', color: 'bg-pink-600', hex: '#db2777' },
    { id: 'indigo', name: 'Indigo', color: 'bg-indigo-600', hex: '#4f46e5' },
    { id: 'teal', name: 'Teal', color: 'bg-teal-600', hex: '#0d9488' },
  ];

  const fontSizes = [
    { id: 'small', name: 'Small', value: '14px', description: 'Compact interface' },
    { id: 'medium', name: 'Medium', value: '16px', description: 'Default size' },
    { id: 'large', name: 'Large', value: '18px', description: 'Easier to read' },
    { id: 'extra-large', name: 'Extra Large', value: '20px', description: 'Maximum readability' },
  ];

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedAccentColor = localStorage.getItem('accentColor') || 'blue';
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    const savedReducedMotion = localStorage.getItem('reducedMotion') === 'true';
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';

    setSelectedAccentColor(savedAccentColor);
    setFontSize(savedFontSize);
    setReducedMotion(savedReducedMotion);
    setHighContrast(savedHighContrast);
  }, []);

  const handleThemeChange = (themeId) => {
    if (themeId === 'auto') {
      addNotification({
        type: 'info',
        message: 'Auto theme is coming soon',
      });
      return;
    }

    setSelectedTheme(themeId);
    setTheme(themeId);
    addNotification({
      type: 'success',
      message: `Theme changed to ${themeId}`,
    });
  };

  const handleAccentColorChange = (colorId) => {
    setSelectedAccentColor(colorId);
    localStorage.setItem('accentColor', colorId);
    addNotification({
      type: 'success',
      message: 'Accent color updated',
    });
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    // Apply font size to root element
    document.documentElement.style.fontSize = fontSizes.find(f => f.id === size).value;
    addNotification({
      type: 'success',
      message: 'Font size updated',
    });
  };

  const handleReducedMotionToggle = () => {
    const newValue = !reducedMotion;
    setReducedMotion(newValue);
    localStorage.setItem('reducedMotion', newValue.toString());
    
    if (newValue) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    addNotification({
      type: 'success',
      message: `Reduced motion ${newValue ? 'enabled' : 'disabled'}`,
    });
  };

  const handleHighContrastToggle = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', newValue.toString());
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    addNotification({
      type: 'success',
      message: `High contrast ${newValue ? 'enabled' : 'disabled'}`,
    });
  };

  const resetToDefaults = () => {
    setSelectedTheme('light');
    setTheme('light');
    setSelectedAccentColor('blue');
    setFontSize('medium');
    setReducedMotion(false);
    setHighContrast(false);

    localStorage.setItem('accentColor', 'blue');
    localStorage.setItem('fontSize', 'medium');
    localStorage.setItem('reducedMotion', 'false');
    localStorage.setItem('highContrast', 'false');
    
    document.documentElement.style.fontSize = '16px';
    document.documentElement.classList.remove('reduce-motion', 'high-contrast');

    addNotification({
      type: 'success',
      message: 'Theme settings reset to defaults',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Theme Settings</h1>
              <p className="text-gray-600 mt-1">
                Customize the appearance and visual preferences
              </p>
            </div>
          </div>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FiDroplet className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Color Theme</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Choose your preferred color scheme for the interface
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = selectedTheme === themeOption.id;
            const isDisabled = themeOption.comingSoon;

            return (
              <button
                key={themeOption.id}
                onClick={() => handleThemeChange(themeOption.id)}
                disabled={isDisabled}
                className={`
                  relative p-6 rounded-lg border-2 transition-all
                  ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="flex flex-col items-center space-y-3">
                  <div className={`
                    w-16 h-16 rounded-lg flex items-center justify-center
                    ${themeOption.preview.bg} ${themeOption.preview.border} border-2
                  `}>
                    <Icon className={`w-8 h-8 ${themeOption.preview.text}`} />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 flex items-center justify-center space-x-2">
                      <span>{themeOption.name}</span>
                      {isDisabled && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          Soon
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{themeOption.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FiEye className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Accent Color</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Choose an accent color for buttons, links, and highlights
        </p>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {accentColors.map((color) => {
            const isSelected = selectedAccentColor === color.id;

            return (
              <button
                key={color.id}
                onClick={() => handleAccentColorChange(color.id)}
                className="flex flex-col items-center space-y-2 group"
                title={color.name}
              >
                <div
                  className={`
                    w-12 h-12 rounded-lg ${color.color} 
                    transition-all transform group-hover:scale-110
                    ${isSelected ? 'ring-4 ring-offset-2 ring-gray-400' : ''}
                  `}
                >
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiCheck className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600">{color.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Preview:</strong> This is an{' '}
            <span
              className="font-semibold underline"
              style={{ color: accentColors.find(c => c.id === selectedAccentColor)?.hex }}
            >
              example link
            </span>{' '}
            with the selected accent color.
          </p>
        </div>
      </div>

      {/* Font Size */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FiZap className="w-5 h-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-900">Font Size</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Adjust the text size throughout the application
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fontSizes.map((size) => {
            const isSelected = fontSize === size.id;

            return (
              <button
                key={size.id}
                onClick={() => handleFontSizeChange(size.id)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all text-left
                  ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <FiCheck className="w-3 h-3 text-white" />
                  </div>
                )}
                
                <div className="font-semibold text-gray-900 mb-1" style={{ fontSize: size.value }}>
                  {size.name}
                </div>
                <div className="text-xs text-gray-600">{size.description}</div>
                <div className="text-xs text-gray-500 mt-1">{size.value}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessibility Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FiEye className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Accessibility</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Adjust settings for better accessibility
        </p>

        <div className="space-y-4">
          {/* Reduced Motion */}
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Reduced Motion</h3>
              <p className="text-sm text-gray-600">
                Minimize animations and transitions for better focus
              </p>
            </div>
            <button
              onClick={handleReducedMotionToggle}
              className={`
                ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${reducedMotion ? 'bg-blue-600' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${reducedMotion ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* High Contrast */}
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">High Contrast</h3>
              <p className="text-sm text-gray-600">
                Increase contrast between text and background for better readability
              </p>
            </div>
            <button
              onClick={handleHighContrastToggle}
              className={`
                ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${highContrast ? 'bg-blue-600' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${highContrast ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
        <div className="p-6 border-2 border-gray-200 rounded-lg space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sample Heading</h3>
            <p className="text-gray-600">
              This is a sample paragraph to preview how text will appear with your current theme settings.
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Primary Button
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Secondary Button
            </button>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              This is an informational message with the current theme settings applied.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
