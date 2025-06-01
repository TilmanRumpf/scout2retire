import { Link, useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  // Handler for login button click
  const handleLoginClick = (e) => {
    e.preventDefault();
    console.log("Login button clicked");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            Scout<span className="text-green-600">2</span>Retire
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Find Your Perfect Retirement Town
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Scout<span className="text-green-600">2</span>Retire helps you discover ideal retirement locations based on your lifestyle, budget, and preferences.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/signup"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-center transition-colors"
            >
              Get Started
            </Link>
            {/* Replaced Link with button using navigate */}
            <button
              onClick={handleLoginClick}
              className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium rounded-lg text-center border border-gray-300 dark:border-gray-600 transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
        <div className="md:w-1/2 md:pl-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Valencia, Spain</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Mediterranean Coast</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                A vibrant coastal city with excellent healthcare and affordable living.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            Discover Your Ideal Retirement Destination
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Personalized Matching
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our algorithm finds towns that match your lifestyle, climate preferences, budget, and healthcare needs.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Compare & Contrast
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                See how different locations stack up side-by-side on factors that matter most to you.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Connect & Plan
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Chat with others interested in the same locations and create your retirement timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 Scout2Retire. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}