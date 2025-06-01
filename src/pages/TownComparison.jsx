import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function TownComparison() {
  const location = useLocation();
  const [towns, setTowns] = useState([]);
  const [activeCategory, setActiveCategory] = useState('overview');

  // Mock data for towns (in a real app, this would come from an API)
  const allTowns = [
    {
      id: 1,
      name: 'Valencia',
      country: 'Spain',
      description: 'A vibrant coastal city with excellent healthcare and affordable living.',
      cost_index: 1800,
      healthcare_score: 9,
      safety_score: 8,
      image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      climate: {
        avg_temp_summer: 30,
        avg_temp_winter: 12,
        rainfall: 'Low',
        humidity: 'Moderate'
      },
      lifestyle: {
        nightlife: 8,
        culture: 9,
        food: 9,
        outdoor: 8
      }
    },
    {
      id: 2,
      name: 'Lisbon',
      country: 'Portugal',
      description: 'Beautiful coastal capital with rich history and moderate cost of living.',
      cost_index: 2000,
      healthcare_score: 8,
      safety_score: 7,
      image_url: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      climate: {
        avg_temp_summer: 28,
        avg_temp_winter: 11,
        rainfall: 'Moderate',
        humidity: 'Moderate'
      },
      lifestyle: {
        nightlife: 9,
        culture: 8,
        food: 9,
        outdoor: 7
      }
    },
    {
      id: 3,
      name: 'Chiang Mai',
      country: 'Thailand',
      description: 'Cultural northern city with very low cost of living and warm climate.',
      cost_index: 1200,
      healthcare_score: 7,
      safety_score: 7,
      image_url: 'https://images.unsplash.com/photo-1598096969068-ad16bcf5c688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      climate: {
        avg_temp_summer: 34,
        avg_temp_winter: 20,
        rainfall: 'High',
        humidity: 'High'
      },
      lifestyle: {
        nightlife: 7,
        culture: 9,
        food: 10,
        outdoor: 8
      }
    },
  ];

  // Categories for comparison tabs
  const categories = [
    { id: 'overview', label: 'Overview' },
    { id: 'climate', label: 'Climate' },
    { id: 'cost', label: 'Cost of Living' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'safety', label: 'Safety' }
  ];

  // Parse town IDs from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const townId = params.get('town');
    
    if (townId) {
      // In a real app, you would fetch the town data from an API
      // For now, we'll filter from our mock data
      const selectedTown = allTowns.find(town => town.id === Number(townId));
      if (selectedTown) {
        setTowns([selectedTown]);
      }
    } else {
      // If no towns specified, show the first 2 towns as default
      setTowns(allTowns.slice(0, 2));
    }
  }, [location.search]);

  // Helper to get content for the active category
  const getCategoryContent = (town, category) => {
    switch (category) {
      case 'overview':
        return (
          <div>
            <p className="mb-3">{town.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                ${town.cost_index}/mo
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                Health: {town.healthcare_score}/10
              </span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                Safety: {town.safety_score}/10
              </span>
            </div>
          </div>
        );
      case 'climate':
        return (
          <div className="space-y-2">
            <p><span className="font-medium">Summer:</span> {town.climate.avg_temp_summer}°C</p>
            <p><span className="font-medium">Winter:</span> {town.climate.avg_temp_winter}°C</p>
            <p><span className="font-medium">Rainfall:</span> {town.climate.rainfall}</p>
            <p><span className="font-medium">Humidity:</span> {town.climate.humidity}</p>
          </div>
        );
      case 'cost':
        return (
          <div className="space-y-2">
            <p><span className="font-medium">Monthly Estimate:</span> ${town.cost_index}</p>
            <p><span className="font-medium">Housing:</span> ~${Math.round(town.cost_index * 0.4)}/month</p>
            <p><span className="font-medium">Food:</span> ~${Math.round(town.cost_index * 0.3)}/month</p>
            <p><span className="font-medium">Other:</span> ~${Math.round(town.cost_index * 0.3)}/month</p>
          </div>
        );
      case 'lifestyle':
        return (
          <div className="space-y-2">
            <p><span className="font-medium">Nightlife:</span> {town.lifestyle.nightlife}/10</p>
            <p><span className="font-medium">Culture:</span> {town.lifestyle.culture}/10</p>
            <p><span className="font-medium">Food:</span> {town.lifestyle.food}/10</p>
            <p><span className="font-medium">Outdoor Activities:</span> {town.lifestyle.outdoor}/10</p>
          </div>
        );
      case 'healthcare':
        return (
          <div className="space-y-2">
            <p><span className="font-medium">Overall Rating:</span> {town.healthcare_score}/10</p>
            <p><span className="font-medium">Public Healthcare:</span> {town.healthcare_score >= 8 ? 'Excellent' : town.healthcare_score >= 6 ? 'Good' : 'Basic'}</p>
            <p><span className="font-medium">Private Options:</span> {town.healthcare_score >= 7 ? 'Many available' : 'Limited'}</p>
            <p><span className="font-medium">English-speaking Doctors:</span> {town.country === 'Thailand' ? 'In tourist areas' : 'Widely available'}</p>
          </div>
        );
      case 'safety':
        return (
          <div className="space-y-2">
            <p><span className="font-medium">Overall Rating:</span> {town.safety_score}/10</p>
            <p><span className="font-medium">Crime Rate:</span> {town.safety_score >= 8 ? 'Low' : town.safety_score >= 6 ? 'Moderate' : 'High'}</p>
            <p><span className="font-medium">Tourist Safety:</span> {town.safety_score >= 7 ? 'Very safe for tourists' : 'Exercise normal precautions'}</p>
            <p><span className="font-medium">Natural Disasters:</span> {town.name === 'Chiang Mai' ? 'Seasonal flooding possible' : 'Low risk'}</p>
          </div>
        );
      default:
        return 'No information available for this category';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center">
              <Link to="/welcome" className="text-xl font-bold text-gray-800 dark:text-white mr-4">
                Scout<span className="text-green-600">2</span>Retire
              </Link>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                Compare Towns
              </h1>
            </div>
            
            {/* Category tabs */}
            <div className="flex overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 space-x-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
                    activeCategory === category.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Town comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {towns.map((town) => (
            <div key={town.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Town header with image */}
              <div className="relative h-40">
                {town.image_url ? (
                  <img
                    src={town.image_url}
                    alt={town.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <button className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Town name and country */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {town.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {town.country}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(
                      town.name + ', ' + town.country
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400 text-sm hover:underline"
                  >
                    View on Map
                  </a>
                </div>
              </div>

              {/* Category content */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {categories.find(cat => cat.id === activeCategory)?.label || 'Information'}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {getCategoryContent(town, activeCategory)}
                </div>
              </div>

              {/* View details button */}
              <div className="p-4 pt-0">
                <Link
                  to={`/discover?town=${town.id}`}
                  className="w-full block py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm text-center"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          ))}

          {/* Add town card if less than 3 towns */}
          {towns.length < 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 min-h-[300px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                Add another town to compare
              </p>
              <Link
                to="/discover"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                Select from Towns
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}