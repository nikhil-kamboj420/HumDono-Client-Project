// pages/NotFound.jsx
import { useNavigate } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="404 - Page Not Found | HumDono"
        description="The page you're looking for doesn't exist. Return to HumDono homepage to find your perfect match."
      />
      
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="card-romantic p-8">
            {/* Logo */}
            <img 
              src="/logo.png" 
              alt="HumDono Logo" 
              className="w-24 h-24 mx-auto mb-6"
            />
            
            {/* 404 */}
            <h1 className="text-6xl font-bold text-passion mb-4">404</h1>
            
            {/* Message */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              Oops! The page you're looking for doesn't exist. 
              Maybe it's time to find your perfect match instead? 💕
            </p>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Go Back
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <HomeIcon className="w-5 h-5" />
                Go Home
              </button>
            </div>
            
            {/* Helpful Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Quick Links:</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  Login
                </button>
                <span className="text-gray-400">•</span>
                <button
                  onClick={() => navigate('/about')}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  About Us
                </button>
                <span className="text-gray-400">•</span>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
