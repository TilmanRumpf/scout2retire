import { useState } from 'react';
import { X, Shuffle, Heart, Star } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';
import { LUCIDE_RETIREMENT_ICONS, AVATAR_COLORS, ICON_PRESETS, getRandomPreset } from '../utils/lucideRetirementIcons';
import IconAvatar from './IconAvatar';
import useAvatarFavorites from '../hooks/useAvatarFavorites';
import { useAuth } from '../contexts/AuthContext';

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

export default function IconAvatarSelector({ isOpen, onClose, onSelect }) {
  const [selectedCategory, setSelectedCategory] = useState('beach');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS.iconColors[0]);
  const [selectedBg, setSelectedBg] = useState(AVATAR_COLORS.backgroundColors[1]);
  const [showPresets, setShowPresets] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  
  const { user } = useAuth();
  const { favorites = [], addFavorite, removeFavorite, isFavorite } = useAvatarFavorites(user?.id);

  if (!isOpen) return null;

  const categoryIcons = LUCIDE_RETIREMENT_ICONS[selectedCategory] || {};

  const handleRandomize = () => {
    const preset = getRandomPreset();
    setSelectedCategory(preset.category);
    setSelectedIcon(preset.icon);
    setSelectedColor(preset.color);
    setSelectedBg(preset.bg);
  };

  const handlePresetSelect = (preset) => {
    setSelectedCategory(preset.category);
    setSelectedIcon(preset.icon);
    setSelectedColor(preset.color);
    setSelectedBg(preset.bg);
    setShowPresets(false);
  };

  const handleSelect = () => {
    if (selectedIcon && categoryIcons[selectedIcon]) {
      // Instead of generating a data URL, we'll store the icon reference
      const iconRef = `icon:${selectedCategory}:${selectedIcon}:${selectedColor}:${selectedBg}`;
      onSelect(iconRef);
      onClose();
    }
  };

  const handleAddToFavorites = () => {
    if (selectedIcon && categoryIcons[selectedIcon]) {
      const iconRef = `icon:${selectedCategory}:${selectedIcon}:${selectedColor}:${selectedBg}`;
      addFavorite({
        dataUrl: iconRef,
        category: selectedCategory,
        icon: selectedIcon,
        color: selectedColor,
        bg: selectedBg,
        name: selectedIcon.replace(/([A-Z])/g, ' $1').trim()
      });
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
          <div className="flex gap-2">
            <button
              onClick={handleRandomize}
              className="flex items-center gap-2 px-3 py-2 bg-scout-accent text-white rounded-lg hover:bg-scout-accent/90 transition-colors"
              title="Random icon"
            >
              <Shuffle size={18} />
              Random
            </button>
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="View presets"
            >
              <Heart size={18} />
              Presets
            </button>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="View favorites"
            >
              <Star size={18} />
              Favorites ({favorites.length})
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Favorites Gallery */}
          {showFavorites && (
            <div className="mb-6">
              <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-3`}>
                Your Favorite Icons
              </h3>
              {favorites.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No favorites yet. Click the star button on any icon to save it.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {favorites.map((fav, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSelect(fav.dataUrl);
                        onClose();
                      }}
                      className="relative flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-scout-accent transition-all"
                    >
                      <div className="w-16 h-16">
                        <IconAvatar iconData={fav.dataUrl} size={64} />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                        {fav.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(fav.dataUrl);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preset Gallery */}
          {showPresets && (
            <div className="mb-6">
              <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-3`}>
                Popular Preset Combinations
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {ICON_PRESETS.map((preset, index) => {
                  const IconComponent = LUCIDE_RETIREMENT_ICONS[preset.category]?.[preset.icon];
                  if (!IconComponent || typeof IconComponent !== 'function') {
                    console.warn(`Missing icon: ${preset.category}.${preset.icon}`);
                    return null;
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handlePresetSelect(preset)}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-scout-accent transition-all"
                    >
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: preset.bg }}
                      >
                        <IconComponent size={32} color={preset.color} strokeWidth={1.5} />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {Object.entries(categoryIcons).map(([iconName, IconComponent]) => {
                if (!IconComponent || typeof IconComponent !== 'function') {
                  console.warn(`Missing icon in ${selectedCategory}: ${iconName}`);
                  return null;
                }
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-scout-accent bg-scout-accent/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    title={iconName.replace(/([A-Z])/g, ' $1').trim()}
                  >
                    <IconComponent 
                      size={32} 
                      color={isSelected ? selectedColor : '#6b7280'} 
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-4">
            <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
              Icon Color
            </h3>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.iconColors.map(color => (
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
              {AVATAR_COLORS.backgroundColors.map(bg => (
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
          {selectedIcon && categoryIcons[selectedIcon] && (
            <div className="mb-4 text-center">
              <h3 className={`${uiConfig.font.size.sm} ${uiConfig.font.weight.medium} ${uiConfig.colors.body} mb-2`}>
                Preview
              </h3>
              <div className="inline-block relative">
                <div 
                  className="w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center"
                  style={{ backgroundColor: selectedBg }}
                >
                  {(() => {
                    const IconComponent = categoryIcons[selectedIcon];
                    return <IconComponent size={64} color={selectedColor} strokeWidth={1.5} />;
                  })()}
                </div>
                <button
                  onClick={handleAddToFavorites}
                  className="absolute -top-2 -right-2 p-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 transition-colors"
                  title="Add to favorites"
                >
                  <Star size={16} fill="white" />
                </button>
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