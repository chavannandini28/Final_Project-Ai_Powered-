import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle } from "lucide-react";

// List of valid Indian cities (add international cities as needed)
const VALID_CITIES = [
  // Indian Cities
  "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune",
  "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Chandigarh", "Indore", "Visakhapatnam",
  "Kochi", "Goa", "Kerala", "Rajasthan", "Agra", "Varanasi", "Rishikesh",
  "Manali", "Shimla", "Darjeeling", "Ooty", "Munnar", "Coorg", "Udaipur",
  "Jodhpur", "Pushkar", "Jaisalmer", "Mount Abu", "Mysore", "Madurai",
  "Cochin", "Thrissur", "Alleppey", "Kottayam", "Ernakulam", "Thiruvananthapuram",
  "Pondicherry", "Mahabalipuram", "Tirupati", "Hampi", "Gokarna", "Bijapur",
  "Aurangabad", "Nashik", "Lonavala", "Matheran", "Alibaug", "Konkan",
  "Satara", "Mahabaleshwar", "Panchgani", "Solapur",
  
  // International Cities (add as needed)
  "Dubai", "Abu Dhabi", "Paris", "London", "New York", "Bangkok", "Phuket",
  "Bali", "Singapore", "Tokyo", "Maldives", "Barcelona", "Rome", "Amsterdam"
];

export default function CitySearch({ onSearch, onCitySelect, disabled = false, showError = false, errorMessage = "" }) {
  const [searchInput, setSearchInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [validationError, setValidationError] = useState("");

  // Filter cities based on input
  const filteredCities = useMemo(() => {
    if (!searchInput.trim()) return [];
    return VALID_CITIES.filter(city =>
      city.toLowerCase().includes(searchInput.toLowerCase())
    ).slice(0, 8); // Show max 8 suggestions
  }, [searchInput]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    setValidationError("");
    setShowDropdown(true);
  };

  const handleCitySelect = (city) => {
    setSearchInput(city);
    setSelectedCity(city);
    setShowDropdown(false);
    setValidationError("");
    if (onCitySelect) {
      onCitySelect(city);
    }
  };

  const handleBlur = () => {
    // Delay to allow click on dropdown items to register
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleSearch = () => {
    const trimmedInput = searchInput.trim();

    // Validation: Check if city is valid
    if (!trimmedInput) {
      setValidationError("Please enter a city name");
      return;
    }

    const isValidCity = VALID_CITIES.some(
      city => city.toLowerCase() === trimmedInput.toLowerCase()
    );

    if (!isValidCity) {
      setValidationError(`"${trimmedInput}" is not a valid city. Please select from suggestions or try another city.`);
      return;
    }

    setValidationError("");
    setSelectedCity(trimmedInput);
    if (onSearch) {
      onSearch(trimmedInput);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (filteredCities.length > 0 && !selectedCity) {
        // If dropdown is open and user pressed Enter, select first suggestion
        handleCitySelect(filteredCities[0]);
      } else {
        // Otherwise, search
        handleSearch();
      }
    }
  };

  return (
    <div className="relative z-50 w-full overflow-visible">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Input
            placeholder="Search by city (e.g., Goa, Delhi, Dubai)..."
            value={searchInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => searchInput && setShowDropdown(true)}
            onBlur={handleBlur}
            className="h-14 text-lg border-2"
            disabled={disabled}
          />

          {/* Dropdown Suggestions */}
          {showDropdown && filteredCities.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-lg z-[100]">
              {filteredCities.map((city, index) => (
                <button
                  key={index}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCitySelect(city);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{city}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Error message */}
          {validationError && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-red-50 border border-red-200 rounded-lg p-2 z-[100]">
              <div className="flex gap-2 items-start text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            </div>
          )}
        </div>

        <Button
          size="lg"
          onClick={handleSearch}
          disabled={disabled}
          className="h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>

      {/* Display external error if provided */}
      {showError && errorMessage && (
        <div className="mt-2 flex gap-2 items-start text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Info: Show valid cities count */}
      <div className="mt-2 text-xs text-gray-500">
        💡 We support {VALID_CITIES.length} cities. Click input to see suggestions.
      </div>
    </div>
  );
}
