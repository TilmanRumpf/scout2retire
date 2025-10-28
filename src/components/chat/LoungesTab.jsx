import { Search, Users, MapPin, Home, ChevronLeft } from 'lucide-react';
import { uiConfig } from '../../styles/uiConfig';
import { toggleFavorite, fetchFavorites } from '../../utils/townUtils.jsx';
import toast from 'react-hot-toast';

/**
 * LoungesTab - Displays Retirement/Country/Town lounges
 * Extracted from Chat.jsx
 */
export default function LoungesTab({
  user,
  loungeView,
  setLoungeView,
  chatType,
  activeThread,
  activeTown,
  unreadByType,
  countryLikes,
  favorites,
  allCountries,
  allTowns,
  loungesSearchTerm,
  setLoungesSearchTerm,
  townLoungeSearchTerm,
  setTownLoungeSearchTerm,
  showCountryAutocomplete,
  setShowCountryAutocomplete,
  showTownAutocomplete,
  setShowTownAutocomplete,
  countryDropdownPos,
  setCountryDropdownPos,
  townDropdownPos,
  setTownDropdownPos,
  countrySearchRef,
  countryInputRef,
  townSearchRef,
  townInputRef,
  setSelectedCountry,
  setFavorites,
  onSwitchToLoungeChat,
  onSwitchToCountryLoungeChat,
  onSwitchToTownChat,
  onToggleCountryLike
}) {
  return (
    <div className="space-y-4">
      {/* Main Lounge List */}
      {!loungeView && (
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md} overflow-hidden`}>
          <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
            <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Lounges</h2>
          </div>
          <div className="p-2 space-y-1">
            {/* Retirement Lounge */}
            <button
              onClick={onSwitchToLoungeChat}
              className={`w-full text-left px-4 py-3 ${uiConfig.layout.radius.md} ${uiConfig.animation.transition} ${
                chatType === 'lounge' ? uiConfig.colors.badge : `${uiConfig.states.hover}`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <div>
                    <div className={uiConfig.font.weight.medium}>Retirement Lounge</div>
                    <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>General discussion</div>
                  </div>
                </div>
                {unreadByType.lounge > 0 && (
                  <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                    {unreadByType.lounge}
                  </div>
                )}
              </div>
            </button>

            {/* Country Lounge */}
            <button
              onClick={() => setLoungeView('country')}
              className={`w-full text-left px-4 py-3 ${uiConfig.layout.radius.md} ${uiConfig.states.hover} ${uiConfig.animation.transition}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" />
                  <div>
                    <div className={uiConfig.font.weight.medium}>Country Lounge</div>
                    <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>Chat by country</div>
                  </div>
                </div>
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </div>
            </button>

            {/* Town Lounge */}
            <button
              onClick={() => setLoungeView('town')}
              className={`w-full text-left px-4 py-3 ${uiConfig.layout.radius.md} ${uiConfig.states.hover} ${uiConfig.animation.transition}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5" />
                  <div>
                    <div className={uiConfig.font.weight.medium}>Town Lounge</div>
                    <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>Chat by town</div>
                  </div>
                </div>
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Country Lounge Subsection */}
      {loungeView === 'country' && (
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md}`}>
          <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
            <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Country Lounge</h2>
          </div>
          <div className="max-h-96 overflow-y-auto relative">
            {/* User's Liked Countries */}
            {countryLikes.length > 0 && (
              <>
                <div className={`px-4 py-2 ${uiConfig.font.size.xs} ${uiConfig.font.weight.semibold} ${uiConfig.colors.hint} uppercase`}>
                  My Countries
                </div>
                {countryLikes.map(countryLike => {
                  const country = countryLike.country_name;
                  const isActive = chatType === 'lounge' && activeThread?.topic === country;

                  return (
                    <div
                      key={`liked-${country}`}
                      className={`flex items-center justify-between px-4 py-3 border-b ${uiConfig.colors.borderLight} ${isActive ? uiConfig.colors.badge : uiConfig.states.hover} ${uiConfig.animation.transition}`}
                    >
                      <button
                        onClick={() => {
                          onSwitchToCountryLoungeChat(country);
                        }}
                        className="flex-1 text-left"
                      >
                        {country}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCountryLike(country);
                        }}
                        className="p-1.5 ml-2"
                        aria-label="Unlike country"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </>
            )}

            {/* Search Bar */}
            <div className={`p-3 sticky top-0 ${uiConfig.colors.card} border-b ${uiConfig.colors.borderLight} z-30`}>
              <div className="relative" ref={countrySearchRef}>
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${uiConfig.colors.hint}`} />
                <input
                  ref={countryInputRef}
                  type="text"
                  placeholder="Search lounges..."
                  value={loungesSearchTerm}
                  onChange={(e) => {
                    setLoungesSearchTerm(e.target.value);
                    if (e.target.value.length > 0) {
                      const rect = e.target.getBoundingClientRect();
                      setCountryDropdownPos({
                        top: rect.bottom + 4,
                        left: rect.left,
                        width: rect.width
                      });
                      setShowCountryAutocomplete(true);
                    } else {
                      setShowCountryAutocomplete(false);
                    }
                  }}
                  onFocus={() => {
                    if (loungesSearchTerm.length > 0) {
                      const rect = countryInputRef.current.getBoundingClientRect();
                      setCountryDropdownPos({
                        top: rect.bottom + 4,
                        left: rect.left,
                        width: rect.width
                      });
                      setShowCountryAutocomplete(true);
                    }
                  }}
                  autoComplete="off"
                  className={`w-full h-10 pl-10 pr-4 ${uiConfig.layout.radius.full} ${uiConfig.colors.input} ${uiConfig.font.size.sm}`}
                />
              </div>
            </div>

            {/* Autocomplete Dropdown */}
            {showCountryAutocomplete && loungesSearchTerm && (
              <div
                className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.lg} border ${uiConfig.colors.borderLight} max-h-60 overflow-y-auto`}
                style={{
                  position: 'fixed',
                  top: `${countryDropdownPos.top}px`,
                  left: `${countryDropdownPos.left}px`,
                  width: `${countryDropdownPos.width}px`,
                  zIndex: 9999
                }}
              >
                {allCountries
                  .filter(country =>
                    country.toLowerCase().includes(loungesSearchTerm.toLowerCase()) &&
                    !countryLikes.some(c => c.country_name === country)
                  )
                  .slice(0, 10)
                  .map(country => (
                    <button
                      key={country}
                      onClick={() => {
                        onToggleCountryLike(country);
                        setLoungesSearchTerm('');
                        setShowCountryAutocomplete(false);
                        toast.success(`Added ${country} to My Countries`);
                      }}
                      className={`w-full text-left px-4 py-2.5 ${uiConfig.states.hover} ${uiConfig.animation.transition} border-b ${uiConfig.colors.borderLight} last:border-b-0`}
                    >
                      <span className={uiConfig.font.size.sm}>{country}</span>
                    </button>
                  ))
                }
                {allCountries.filter(country =>
                  country.toLowerCase().includes(loungesSearchTerm.toLowerCase()) &&
                  !countryLikes.some(c => c.country_name === country)
                ).length === 0 && (
                  <div className={`px-4 py-3 ${uiConfig.colors.hint} ${uiConfig.font.size.sm} text-center`}>
                    {countryLikes.some(c => c.country_name.toLowerCase().includes(loungesSearchTerm.toLowerCase()))
                      ? "Already in My Countries"
                      : "No countries found"}
                  </div>
                )}
              </div>
            )}

            {/* All Countries */}
            {allCountries
              .filter(country =>
                !countryLikes.some(c => c.country_name === country) &&
                (loungesSearchTerm === '' || country.toLowerCase().includes(loungesSearchTerm.toLowerCase()))
              )
              .map(country => {
                const isActive = chatType === 'lounge' && activeThread?.topic === country;
                return (
                  <div
                    key={country}
                    className={`flex items-center justify-between px-4 py-3 border-b ${uiConfig.colors.borderLight} ${isActive ? uiConfig.colors.badge : uiConfig.states.hover} ${uiConfig.animation.transition}`}
                  >
                    <button
                      onClick={() => {
                        onSwitchToCountryLoungeChat(country);
                      }}
                      className="flex-1 text-left"
                    >
                      {country}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCountryLike(country);
                      }}
                      className="p-1.5 ml-2"
                      aria-label="Like country"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Town Lounge Subsection */}
      {loungeView === 'town' && (
        <div className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.md}`}>
          <div className={`p-4 border-b ${uiConfig.colors.borderLight}`}>
            <h2 className={`${uiConfig.font.weight.semibold} ${uiConfig.colors.heading}`}>Town Lounge</h2>
          </div>
          <div className="max-h-96 overflow-y-auto relative">
            {/* Favorited Towns */}
            {favorites.length > 0 && (
              <>
                <div className={`px-4 py-2 ${uiConfig.font.size.xs} ${uiConfig.font.weight.semibold} ${uiConfig.colors.hint} uppercase`}>
                  My Favorite Towns
                </div>
                {favorites
                  .map(f => allTowns.find(t => t.id === f.town_id))
                  .filter(Boolean)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(town => {
                    const isActive = chatType === 'town' && activeTown?.id === town.id;
                    return (
                      <div
                        key={`fav-${town.id}`}
                        className={`flex items-center justify-between px-4 py-3 border-b ${uiConfig.colors.borderLight} ${isActive ? uiConfig.colors.badge : uiConfig.states.hover} ${uiConfig.animation.transition}`}
                      >
                        <button
                          onClick={() => onSwitchToTownChat(town)}
                          className="flex-1 text-left"
                        >
                          <div className={uiConfig.font.weight.medium}>{town.town_name}</div>
                          <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>{town.country}</div>
                        </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const result = await toggleFavorite(user.id, town.id, town.town_name, town.country);
                          if (result.success) {
                            const updatedFavorites = await fetchFavorites(user.id, 'TownLounge');
                            if (updatedFavorites.success) {
                              setFavorites(updatedFavorites.favorites);
                              toast.success(`Removed ${town.town_name} from favorites`);
                            }
                          }
                        }}
                        className="p-1.5 ml-2"
                        aria-label="Unlike town"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  );
                  })}
              </>
            )}

            {/* Search Bar */}
            <div className={`p-3 sticky top-0 ${uiConfig.colors.card} border-b ${uiConfig.colors.borderLight} z-30`}>
              <div className="relative" ref={townSearchRef}>
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${uiConfig.colors.hint}`} />
                <input
                  ref={townInputRef}
                  type="text"
                  placeholder="Search towns..."
                  value={townLoungeSearchTerm}
                  onChange={(e) => {
                    setTownLoungeSearchTerm(e.target.value);
                    if (e.target.value.length > 0) {
                      const rect = e.target.getBoundingClientRect();
                      setTownDropdownPos({
                        top: rect.bottom + 4,
                        left: rect.left,
                        width: rect.width
                      });
                      setShowTownAutocomplete(true);
                    } else {
                      setShowTownAutocomplete(false);
                    }
                  }}
                  onFocus={() => {
                    if (townLoungeSearchTerm.length > 0) {
                      const rect = townInputRef.current.getBoundingClientRect();
                      setTownDropdownPos({
                        top: rect.bottom + 4,
                        left: rect.left,
                        width: rect.width
                      });
                      setShowTownAutocomplete(true);
                    }
                  }}
                  autoComplete="off"
                  className={`w-full h-10 pl-10 pr-4 ${uiConfig.layout.radius.full} ${uiConfig.colors.input} ${uiConfig.font.size.sm}`}
                />
              </div>
            </div>

            {/* Autocomplete Dropdown */}
            {showTownAutocomplete && townLoungeSearchTerm && (
              <div
                className={`${uiConfig.colors.card} ${uiConfig.layout.radius.lg} ${uiConfig.layout.shadow.lg} border ${uiConfig.colors.borderLight} max-h-60 overflow-y-auto`}
                style={{
                  position: 'fixed',
                  top: `${townDropdownPos.top}px`,
                  left: `${townDropdownPos.left}px`,
                  width: `${townDropdownPos.width}px`,
                  zIndex: 9999
                }}
              >
                {allTowns
                  .filter(town =>
                    town.town_name.toLowerCase().includes(townLoungeSearchTerm.toLowerCase()) ||
                    town.country.toLowerCase().includes(townLoungeSearchTerm.toLowerCase())
                  )
                  .slice(0, 10)
                  .map(town => (
                    <button
                      key={town.id}
                      onClick={() => {
                        onSwitchToTownChat(town);
                        setTownLoungeSearchTerm('');
                        setShowTownAutocomplete(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 ${uiConfig.states.hover} ${uiConfig.animation.transition} border-b ${uiConfig.colors.borderLight} last:border-b-0`}
                    >
                      <div className={uiConfig.font.size.sm}>{town.town_name}</div>
                      <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>{town.country}</div>
                    </button>
                  ))
                }
                {allTowns.filter(town =>
                  town.town_name.toLowerCase().includes(townLoungeSearchTerm.toLowerCase()) ||
                  town.country.toLowerCase().includes(townLoungeSearchTerm.toLowerCase())
                ).length === 0 && (
                  <div className={`px-4 py-3 ${uiConfig.colors.hint} ${uiConfig.font.size.sm} text-center`}>
                    No towns found
                  </div>
                )}
              </div>
            )}

            {/* All Towns */}
            {allTowns
              .filter(town =>
                !favorites.some(f => f.town_id === town.id) &&
                (townLoungeSearchTerm === '' ||
                  town.town_name.toLowerCase().includes(townLoungeSearchTerm.toLowerCase()) ||
                  town.country.toLowerCase().includes(townLoungeSearchTerm.toLowerCase()))
              )
              .map(town => {
                const isActive = chatType === 'town' && activeTown?.id === town.id;
                return (
                  <div
                    key={town.id}
                    className={`flex items-center justify-between px-4 py-3 border-b ${uiConfig.colors.borderLight} ${isActive ? uiConfig.colors.badge : uiConfig.states.hover} ${uiConfig.animation.transition}`}
                  >
                    <button
                      onClick={() => onSwitchToTownChat(town)}
                      className="flex-1 text-left"
                    >
                      <div className={uiConfig.font.weight.medium}>{town.town_name}</div>
                      <div className={`${uiConfig.font.size.xs} ${uiConfig.colors.hint}`}>{town.country}</div>
                    </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const result = await toggleFavorite(user.id, town.id, town.town_name, town.country);
                      if (result.success) {
                        const updatedFavorites = await fetchFavorites(user.id, 'TownLounge');
                        if (updatedFavorites.success) {
                          setFavorites(updatedFavorites.favorites);
                          toast.success(`Added ${town.town_name} to favorites`);
                        }
                      }
                    }}
                    className="p-1.5 ml-2"
                    aria-label="Like town"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
