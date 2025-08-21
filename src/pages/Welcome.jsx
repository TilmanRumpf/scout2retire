import { Link, useNavigate } from 'react-router-dom';
import { uiConfig } from '../styles/uiConfig';
import Logo from '../components/Logo';

export default function Welcome() {
  const navigate = useNavigate();

  // Handler for login button click
  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${uiConfig.colors.page}`}>
      {/* Header */}
      <header className="p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
          <Logo variant="full" className="h-10" />
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className={`text-4xl md:text-5xl font-bold ${uiConfig.colors.heading} mb-4`}>
            Find Your Perfect Retirement Town
          </h1>
          <p className={`text-xl ${uiConfig.colors.body} mb-8`}>
            Scout<span className={uiConfig.colors.accent}>2</span>Retire helps you discover ideal retirement locations based on your lifestyle, budget, and preferences.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/signup"
              className={uiConfig.components.buttonPrimary}
            >
              Get Started
            </Link>
            {/* Replaced Link with button using navigate */}
            <button
              onClick={handleLoginClick}
              className={uiConfig.components.buttonSecondary}
            >
              Log In
            </button>
          </div>
        </div>
        <div className="md:w-1/2 md:pl-12">
          <div className={`${uiConfig.components.card} shadow-xl overflow-hidden`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-lg font-semibold ${uiConfig.colors.heading}`}>Valencia, Spain</h3>
                  <p className={`text-sm ${uiConfig.colors.hint}`}>Mediterranean Coast</p>
                </div>
              </div>
              <p className={`${uiConfig.colors.body} text-sm mb-4`}>
                A vibrant coastal city with excellent healthcare and affordable living.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className={`py-16 ${uiConfig.colors.card}`}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center ${uiConfig.colors.heading} mb-12`}>
            Discover Your Ideal Retirement Destination
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`${uiConfig.colors.input} p-6 rounded-lg`}>
              <h3 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-2`}>
                Personalized Matching
              </h3>
              <p className={uiConfig.colors.body}>
                Our algorithm finds towns that match your lifestyle, climate preferences, budget, and healthcare needs.
              </p>
            </div>
            <div className={`${uiConfig.colors.input} p-6 rounded-lg`}>
              <h3 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-2`}>
                Compare & Contrast
              </h3>
              <p className={uiConfig.colors.body}>
                See how different locations stack up side-by-side on factors that matter most to you.
              </p>
            </div>
            <div className={`${uiConfig.colors.input} p-6 rounded-lg`}>
              <h3 className={`text-xl font-semibold ${uiConfig.colors.heading} mb-2`}>
                Connect & Plan
              </h3>
              <p className={uiConfig.colors.body}>
                Chat with others interested in the same locations and create your retirement timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className={`text-sm ${uiConfig.colors.hint}`}>
                © 2025 Scout2Retire. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}