import { useState } from 'react';
import { X, Plus, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uiConfig } from '../styles/uiConfig';

export default function ComparisonToolbar({ towns, onRemoveTown, maxTowns = 3 }) {
  const navigate = useNavigate();
  const [isRemoving, setIsRemoving] = useState(null);

  const handleRemove = (townId) => {
    setIsRemoving(townId);
    setTimeout(() => {
      onRemoveTown(townId);
      setIsRemoving(null);
    }, 300);
  };

  const canAddMore = towns.length < maxTowns;

  return (
    <div className={`sticky top-[84px] z-20 ${uiConfig.colors.card} border-b ${uiConfig.colors.border} shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Mobile-first design with horizontal scroll */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {/* Town count indicator */}
          <div className={`flex-shrink-0 text-sm font-medium ${uiConfig.colors.hint} hidden sm:block`}>
            Comparing {towns.length} of {maxTowns}
          </div>
          
          {/* Mobile count (smaller) */}
          <div className={`flex-shrink-0 text-xs font-medium ${uiConfig.colors.hint} sm:hidden`}>
            {towns.length}/{maxTowns}
          </div>

          {/* Town pills */}
          <div className="flex gap-2 items-center">
            {towns.map((town) => (
              <div
                key={town.id}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full
                  ${uiConfig.colors.surface} border ${uiConfig.colors.borderLight}
                  transition-all duration-300 ease-out
                  ${isRemoving === town.id ? 'scale-90 opacity-50' : 'scale-100 opacity-100'}
                  hover:border-gray-300 dark:hover:border-gray-600
                  group
                `}
              >
                <MapPin className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                <span className={`text-sm font-medium ${uiConfig.colors.body} whitespace-nowrap`}>
                  {town.name}
                </span>
                <button
                  onClick={() => handleRemove(town.id)}
                  className={`
                    ml-1 p-0.5 rounded-full
                    ${uiConfig.colors.muted} hover:${uiConfig.colors.error}
                    transition-colors duration-200
                    group-hover:scale-110
                  `}
                  aria-label={`Remove ${town.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add town button */}
            {canAddMore && (
              <button
                onClick={() => navigate('/favorites')}
                className={`
                  flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full
                  bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800
                  hover:bg-sky-100 dark:hover:bg-sky-900/30
                  transition-all duration-200 ease-out
                  hover:scale-105 active:scale-95
                  group
                `}
              >
                <Plus className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:rotate-90 transition-transform duration-200" />
                <span className="text-sm font-medium text-sky-700 dark:text-sky-300 whitespace-nowrap">
                  Add Town
                </span>
              </button>
            )}

            {/* Max reached message */}
            {!canAddMore && (
              <div className={`
                flex-shrink-0 text-sm ${uiConfig.colors.hint} italic
                px-3 py-2
              `}>
                Maximum reached
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile helper text */}
      <div className={`sm:hidden text-center py-1 text-xs ${uiConfig.colors.hint} border-t ${uiConfig.colors.borderLight}`}>
        Swipe to see all • Tap × to remove
      </div>
    </div>
  );
}
