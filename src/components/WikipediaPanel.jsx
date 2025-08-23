import { useState, useEffect } from 'react';
import { X, ExternalLink, Globe, MapPin } from 'lucide-react';
import { uiConfig } from '../styles/uiConfig';

export default function WikipediaPanel({ townName, country, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [wikiData, setWikiData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && townName) {
      fetchWikipediaData();
    }
  }, [isOpen, townName]);

  const fetchWikipediaData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Search for the town page
      const searchQuery = `${townName} ${country}`;
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) {
        // Try without country if first attempt fails
        const fallbackUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(townName)}`;
        const fallbackResponse = await fetch(fallbackUrl);
        
        if (!fallbackResponse.ok) {
          throw new Error('Town not found on Wikipedia');
        }
        
        const data = await fallbackResponse.json();
        setWikiData(data);
      } else {
        const data = await response.json();
        setWikiData(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* No backdrop - keep main page interactive */}
      
      {/* Panel - 1/4 page from left */}
      <div className={`fixed left-0 top-0 h-full w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 ${uiConfig.colors.card} shadow-2xl z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} border-r ${uiConfig.colors.border}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${uiConfig.colors.border}`}>
          <div className="flex items-center gap-2">
            <Globe className={`w-5 h-5 ${uiConfig.colors.accent}`} />
            <h3 className={`font-semibold ${uiConfig.colors.heading}`}>Wikipedia</h3>
          </div>
        </div>

        {/* Content with space for bottom button */}
        <div className="overflow-y-auto h-[calc(100%-120px)] p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className={`${uiConfig.animation.pulse} ${uiConfig.colors.accent}`}>
                Loading Wikipedia data...
              </div>
            </div>
          )}

          {error && (
            <div className={`p-4 ${uiConfig.colors.statusError} rounded-lg`}>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {wikiData && !loading && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <h2 className={`text-xl font-bold ${uiConfig.colors.heading} mb-2`}>
                  {wikiData.title}
                </h2>
                {wikiData.description && (
                  <p className={`text-sm ${uiConfig.colors.subtitle}`}>
                    {wikiData.description}
                  </p>
                )}
              </div>

              {/* Main image */}
              {wikiData.thumbnail && (
                <img 
                  src={wikiData.thumbnail.source} 
                  alt={wikiData.title}
                  className={`w-full ${uiConfig.layout.radius.lg} shadow-md`}
                />
              )}

              {/* Extract */}
              <div>
                <h3 className={`font-semibold ${uiConfig.colors.heading} mb-2`}>
                  Overview
                </h3>
                <p className={`text-sm ${uiConfig.colors.body} leading-relaxed`}>
                  {wikiData.extract}
                </p>
              </div>

              {/* Coordinates if available */}
              {wikiData.coordinates && (
                <div className={`p-3 ${uiConfig.colors.secondary} rounded-lg`}>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className={`w-4 h-4 ${uiConfig.colors.accent}`} />
                    <span className={`text-sm font-medium ${uiConfig.colors.heading}`}>
                      Coordinates
                    </span>
                  </div>
                  <p className={`text-sm ${uiConfig.colors.body}`}>
                    {wikiData.coordinates.lat.toFixed(4)}°, {wikiData.coordinates.lon.toFixed(4)}°
                  </p>
                </div>
              )}

              {/* Link to full article */}
              <a
                href={wikiData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${wikiData.title.replace(/ /g, '_')}`}
                target="_self"
                className={`block text-center p-3 ${uiConfig.colors.primary} ${uiConfig.colors.primaryText} rounded-lg hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">Read full article on Wikipedia</span>
                </div>
              </a>
            </div>
          )}
        </div>

        {/* Bottom Close Button */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${uiConfig.colors.border} ${uiConfig.colors.card}`}>
          <button
            onClick={onClose}
            className={`w-full py-2 px-4 ${uiConfig.colors.secondary} hover:${uiConfig.colors.tertiary} rounded-lg transition-colors flex items-center justify-center gap-2`}
          >
            <X className="w-4 h-4" />
            <span className="font-medium">Close Wikipedia</span>
          </button>
        </div>
      </div>
    </>
  );
}