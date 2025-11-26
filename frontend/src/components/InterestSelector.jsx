// components/InterestSelector.jsx
import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

const COMMON_INTERESTS = [
  'Music',
  'Movies',
  'Travel',
  'Cooking',
  'Reading',
  'Sports',
  'Gaming',
  'Photography',
  'Dancing',
  'Fitness',
  'Art',
  'Technology'
];

export default function InterestSelector({ value, onChange, placeholder = "e.g. Music, Hiking, Cooking" }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
    // Parse existing interests
    if (value) {
      const interests = value.split(',').map(s => s.trim()).filter(Boolean);
      setSelectedInterests(interests);
    }
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

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleInterestClick = (interest) => {
    let newInterests;
    if (selectedInterests.includes(interest)) {
      // Remove interest
      newInterests = selectedInterests.filter(i => i !== interest);
    } else {
      // Add interest
      newInterests = [...selectedInterests, interest];
    }
    
    setSelectedInterests(newInterests);
    const newValue = newInterests.join(', ');
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedInterests([]);
    onChange('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full p-3 rounded-xl border border-[#ff4c91] bg-white text-black pr-20"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600"
              type="button"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-[#cc0033] hover:text-[#ff1971]"
            type="button"
          >
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#ff4c91] rounded-xl shadow-lg max-h-60 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-medium text-[#77001c] bg-pink-50 border-b border-[#ff4c91]">
            Select Common Interests
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            {COMMON_INTERESTS.map((interest) => (
              <button
                key={interest}
                onClick={() => handleInterestClick(interest)}
                type="button"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedInterests.includes(interest)
                    ? 'bg-[#cc0033] text-white'
                    : 'bg-pink-50 text-[#77001c] hover:bg-pink-100'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
