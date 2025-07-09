import { useState } from 'react';
import { X } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';
import { SIMPLE_RETIREMENT_ICONS } from '../utils/simpleRetirementIcons';

const CATEGORIES = [
  { id: 'beach', label: 'Beach & Coast', emoji: '🏖️' },
  { id: 'mountain', label: 'Mountains', emoji: '⛰️' },
  { id: 'wine', label: 'Wine & Dining', emoji: '🍷' },
  { id: 'hobbies', label: 'Hobbies', emoji: '🎨' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'social', label: 'Social', emoji: '👥' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘' },
  { id: 'culture', label: 'Learning', emoji: '📚' },
  { id: 'finance', label: 'Planning', emoji: '💰' },
  { id: 'lifestyle', label: 'Home', emoji: '🏡' }
];

const COLORS = [
  '#8fbc8f', // Scout green
  '#4682B4', // Steel blue
  '#20B2AA', // Light sea green
  '#DAA520', // Goldenrod
  '#CD853F', // Peru
  '#BC8F8F', // Rosy brown
  '#9370DB', // Medium purple
  '#FF6347', // Tomato
  '#48D1CC', // Medium turquoise
  '#F4A460', // Sandy brown
  '#DDA0DD', // Plum
  '#87CEEB', // Sky blue
  '#98FB98', // Pale green
  '#FFB6C1', // Light pink
  '#F0E68C', // Khaki
  '#B0C4DE', // Light steel blue
];

export default function IconAvatarSelector({ isOpen, onClose, onSelect }) {
  const [selectedCategory, setSelectedCategory] = useState('beach');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedBg, setSelectedBg] = useState('#F5F5F5');

  if (!isOpen) return null;

  const icons = SIMPLE_RETIREMENT_ICONS[selectedCategory] || {};

  const handleSelect = () => {
    if (selectedIcon) {
      const svg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <circle cx="64" cy="64" r="64" fill="${selectedBg}"/>
        <g transform="translate(32, 32) scale(2.67)" fill="${selectedColor}" stroke="none">
          <path d="${icons[selectedIcon]}"/>
        </g>
      </svg>`;
      
      // Convert SVG to data URL
      const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
      onSelect(dataUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className={`${uiConfig.font.size.xl} ${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>
            Choose Your Retirement Icon
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Categories */}
          <div className="mb-4">
            <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Category
            </h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedIcon(null);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-scout-accent text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-1">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Icons Grid */}
          <div className="mb-4">
            <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Select Icon
            </h3>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {Object.keys(icons).map(iconName => (
                <button
                  key={iconName}
                  onClick={() => setSelectedIcon(iconName)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedIcon === iconName
                      ? 'border-scout-accent bg-scout-accent/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  title={iconName.replace(/_/g, ' ')}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill={selectedColor} xmlns="http://www.w3.org/2000/svg">
                    <path d={icons[iconName]} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-4">
            <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Icon Color
            </h3>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    selectedColor === color
                      ? 'border-gray-800 dark:border-white scale-110'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div className="mb-4">
            <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Background Color
            </h3>
            <div className="flex flex-wrap gap-2">
              {['#FFFFFF', '#F5F5F5', '#E8F5E9', '#E3F2FD', '#FFF3E0', '#FCE4EC', '#F3E5F5', '#E0F2F1'].map(bg => (
                <button
                  key={bg}
                  onClick={() => setSelectedBg(bg)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    selectedBg === bg
                      ? 'border-gray-800 dark:border-white scale-110'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  style={{ backgroundColor: bg }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {selectedIcon && (
            <div className="mb-4 text-center">
              <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                Preview
              </h3>
              <div className="inline-block">
                <svg width="128" height="128" viewBox="0 0 128 128" className="border-4 border-gray-200 dark:border-gray-700 rounded-full">
                  <circle cx="64" cy="64" r="64" fill={selectedBg}/>
                  <g transform="translate(32, 32) scale(2.67)" fill={selectedColor} stroke="none">
                    <path d={icons[selectedIcon]} />
                  </g>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className={uiConfig.components.buttonSecondary}
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedIcon}
            className={`${uiConfig.components.buttonPrimary} ${!selectedIcon ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Use This Icon
          </button>
        </div>
      </div>
    </div>
  );
}