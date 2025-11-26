// components/LocationSearch.jsx
import { useState, useEffect, useRef } from 'react';
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function LocationSearch({ value, onChange, placeholder = "Search location..." }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Comprehensive Indian cities list - organized by popularity and regions
  const popularCities = [
    // Metro Cities
    { name: 'Mumbai', state: 'Maharashtra', country: 'India', tier: 1 },
    { name: 'Delhi', state: 'Delhi', country: 'India', tier: 1 },
    { name: 'Bangalore', state: 'Karnataka', country: 'India', tier: 1 },
    { name: 'Hyderabad', state: 'Telangana', country: 'India', tier: 1 },
    { name: 'Chennai', state: 'Tamil Nadu', country: 'India', tier: 1 },
    { name: 'Kolkata', state: 'West Bengal', country: 'India', tier: 1 },
    { name: 'Pune', state: 'Maharashtra', country: 'India', tier: 1 },
    { name: 'Ahmedabad', state: 'Gujarat', country: 'India', tier: 1 },
    
    // Tier 2 Cities
    { name: 'Jaipur', state: 'Rajasthan', country: 'India', tier: 2 },
    { name: 'Surat', state: 'Gujarat', country: 'India', tier: 2 },
    { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Kanpur', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Nagpur', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Indore', state: 'Madhya Pradesh', country: 'India', tier: 2 },
    { name: 'Thane', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Bhopal', state: 'Madhya Pradesh', country: 'India', tier: 2 },
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', tier: 2 },
    { name: 'Pimpri-Chinchwad', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Patna', state: 'Bihar', country: 'India', tier: 2 },
    { name: 'Vadodara', state: 'Gujarat', country: 'India', tier: 2 },
    { name: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Ludhiana', state: 'Punjab', country: 'India', tier: 2 },
    { name: 'Agra', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Nashik', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Faridabad', state: 'Haryana', country: 'India', tier: 2 },
    { name: 'Meerut', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Rajkot', state: 'Gujarat', country: 'India', tier: 2 },
    { name: 'Kalyan-Dombivali', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Vasai-Virar', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Varanasi', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Srinagar', state: 'Jammu and Kashmir', country: 'India', tier: 2 },
    { name: 'Aurangabad', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Dhanbad', state: 'Jharkhand', country: 'India', tier: 2 },
    { name: 'Amritsar', state: 'Punjab', country: 'India', tier: 2 },
    { name: 'Navi Mumbai', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Allahabad', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Ranchi', state: 'Jharkhand', country: 'India', tier: 2 },
    { name: 'Howrah', state: 'West Bengal', country: 'India', tier: 2 },
    { name: 'Coimbatore', state: 'Tamil Nadu', country: 'India', tier: 2 },
    { name: 'Jabalpur', state: 'Madhya Pradesh', country: 'India', tier: 2 },
    { name: 'Gwalior', state: 'Madhya Pradesh', country: 'India', tier: 2 },
    { name: 'Vijayawada', state: 'Andhra Pradesh', country: 'India', tier: 2 },
    { name: 'Jodhpur', state: 'Rajasthan', country: 'India', tier: 2 },
    { name: 'Madurai', state: 'Tamil Nadu', country: 'India', tier: 2 },
    { name: 'Raipur', state: 'Chhattisgarh', country: 'India', tier: 2 },
    { name: 'Kota', state: 'Rajasthan', country: 'India', tier: 2 },
    { name: 'Chandigarh', state: 'Chandigarh', country: 'India', tier: 2 },
    { name: 'Guwahati', state: 'Assam', country: 'India', tier: 2 },
    { name: 'Solapur', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Hubli-Dharwad', state: 'Karnataka', country: 'India', tier: 2 },
    { name: 'Mysore', state: 'Karnataka', country: 'India', tier: 2 },
    { name: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India', tier: 2 },
    { name: 'Bareilly', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Aligarh', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Tiruppur', state: 'Tamil Nadu', country: 'India', tier: 2 },
    { name: 'Moradabad', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Jalandhar', state: 'Punjab', country: 'India', tier: 2 },
    { name: 'Bhubaneswar', state: 'Odisha', country: 'India', tier: 2 },
    { name: 'Salem', state: 'Tamil Nadu', country: 'India', tier: 2 },
    { name: 'Warangal', state: 'Telangana', country: 'India', tier: 2 },
    { name: 'Guntur', state: 'Andhra Pradesh', country: 'India', tier: 2 },
    { name: 'Bhiwandi', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Saharanpur', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Gorakhpur', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Bikaner', state: 'Rajasthan', country: 'India', tier: 2 },
    { name: 'Amravati', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Noida', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Jamshedpur', state: 'Jharkhand', country: 'India', tier: 2 },
    { name: 'Bhilai', state: 'Chhattisgarh', country: 'India', tier: 2 },
    { name: 'Cuttack', state: 'Odisha', country: 'India', tier: 2 },
    { name: 'Firozabad', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Kochi', state: 'Kerala', country: 'India', tier: 2 },
    { name: 'Nellore', state: 'Andhra Pradesh', country: 'India', tier: 2 },
    { name: 'Bhavnagar', state: 'Gujarat', country: 'India', tier: 2 },
    { name: 'Dehradun', state: 'Uttarakhand', country: 'India', tier: 2 },
    { name: 'Durgapur', state: 'West Bengal', country: 'India', tier: 2 },
    { name: 'Asansol', state: 'West Bengal', country: 'India', tier: 2 },
    { name: 'Rourkela', state: 'Odisha', country: 'India', tier: 2 },
    { name: 'Nanded', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Kolhapur', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Ajmer', state: 'Rajasthan', country: 'India', tier: 2 },
    { name: 'Akola', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Gulbarga', state: 'Karnataka', country: 'India', tier: 2 },
    { name: 'Jamnagar', state: 'Gujarat', country: 'India', tier: 2 },
    { name: 'Ujjain', state: 'Madhya Pradesh', country: 'India', tier: 2 },
    { name: 'Loni', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Siliguri', state: 'West Bengal', country: 'India', tier: 2 },
    { name: 'Jhansi', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Ulhasnagar', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Jammu', state: 'Jammu and Kashmir', country: 'India', tier: 2 },
    { name: 'Mangalore', state: 'Karnataka', country: 'India', tier: 2 },
    { name: 'Erode', state: 'Tamil Nadu', country: 'India', tier: 2 },
    { name: 'Belgaum', state: 'Karnataka', country: 'India', tier: 2 },
    { name: 'Ambattur', state: 'Tamil Nadu', country: 'India', tier: 2 },
    { name: 'Tirunelveli', state: 'Tamil Nadu', country: 'India', tier: 2 },
    { name: 'Malegaon', state: 'Maharashtra', country: 'India', tier: 2 },
    { name: 'Gaya', state: 'Bihar', country: 'India', tier: 2 },
    { name: 'Thiruvananthapuram', state: 'Kerala', country: 'India', tier: 2 },
    { name: 'Udaipur', state: 'Rajasthan', country: 'India', tier: 2 },
    { name: 'Maheshtala', state: 'West Bengal', country: 'India', tier: 2 },
    { name: 'Davanagere', state: 'Karnataka', country: 'India', tier: 2 },
    { name: 'Kozhikode', state: 'Kerala', country: 'India', tier: 2 },
    { name: 'Akbarpur', state: 'Uttar Pradesh', country: 'India', tier: 2 },
    { name: 'Kurnool', state: 'Andhra Pradesh', country: 'India', tier: 2 }
  ];

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (searchQuery) => {
    if (!searchQuery.trim()) {
      // Show top tier 1 cities when no search query
      const topCities = popularCities.filter(c => c.tier === 1);
      setSuggestions(topCities);
      return;
    }

    setLoading(true);
    try {
      const query = searchQuery.toLowerCase().trim();
      
      // Smart search algorithm
      const results = popularCities
        .map(city => {
          const cityName = city.name.toLowerCase();
          const stateName = city.state.toLowerCase();
          
          // Calculate relevance score
          let score = 0;
          
          // Exact match gets highest score
          if (cityName === query) score += 100;
          else if (cityName.startsWith(query)) score += 50;
          else if (cityName.includes(query)) score += 25;
          
          // State match
          if (stateName.includes(query)) score += 15;
          
          // Tier bonus (prefer popular cities)
          if (city.tier === 1) score += 10;
          else if (city.tier === 2) score += 5;
          
          return { ...city, score };
        })
        .filter(city => city.score > 0) // Only cities with matches
        .sort((a, b) => {
          // Sort by score first, then alphabetically
          if (b.score !== a.score) return b.score - a.score;
          return a.name.localeCompare(b.name);
        })
        .slice(0, 10); // Show top 10 results

      if (results.length > 0) {
        setSuggestions(results);
      } else {
        // No matches found - allow custom entry
        setSuggestions([
          { name: searchQuery, state: 'Custom Location', country: 'India', tier: 3 }
        ]);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    
    // Debounce search
    clearTimeout(window.locationSearchTimeout);
    window.locationSearchTimeout = setTimeout(() => {
      searchLocations(newQuery);
    }, 300);
  };

  const handleLocationSelect = (location) => {
    const locationString = `${location.name}, ${location.state}`;
    setQuery(locationString);
    onChange(locationString);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    inputRef.current?.focus();
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      return;
    }

    setLoading(true);
    
    // Request geolocation with options
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'HumDono Dating App'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            
            // Extract city and state
            const city = address.city || address.town || address.village || address.county || 'Unknown City';
            const state = address.state || 'Unknown State';
            
            const locationString = `${city}, ${state}`;
            
            setQuery(locationString);
            // Send both city and state as object
            onChange({ city, state });
            setIsOpen(false);
          } else {
            throw new Error('Geocoding failed');
          }
        } catch (error) {
          console.error('❌ Reverse geocoding error:', error);
          // Fallback: use coordinates
          const locationString = `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          setQuery(locationString);
          onChange(locationString);
          setIsOpen(false);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('❌ Geolocation error:', error.code, error.message);
        setLoading(false);
        // No alert - just log to console
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            if (!query) searchLocations('');
          }}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 lg:py-3 text-sm lg:text-base pr-20"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={getCurrentLocation}
            disabled={loading}
            className="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-50"
            title="Use current location"
          >
            <MapPinIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className=" absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-white">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {!query && (
                <div className="px-3 py-2 text-xs font-medium text-gray-300 bg-gray-800 border-b border-gray-700">
                  Popular Cities
                </div>
              )}
              {suggestions.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-800 flex items-center gap-2 border-b border-gray-700 last:border-b-0"
                >
                  <MapPinIcon className="w-4 h-4 text-white flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white">{location.name}</div>
                    <div className="text-sm text-gray-300">{location.state}, {location.country}</div>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="p-3 text-center text-white">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  );
}