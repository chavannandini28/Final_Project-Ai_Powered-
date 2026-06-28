import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";

const VALID_CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune",
  "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Chandigarh", "Indore", "Visakhapatnam",
  "Kochi", "Goa", "Kerala", "Rajasthan", "Agra", "Varanasi", "Rishikesh",
  "Manali", "Shimla", "Darjeeling", "Ooty", "Munnar", "Coorg", "Udaipur",
  "Jodhpur", "Pushkar", "Jaisalmer", "Mount Abu", "Mysore", "Madurai",
  "Cochin", "Thrissur", "Alleppey", "Kottayam", "Ernakulam", "Thiruvananthapuram",
  "Pondicherry", "Mahabalipuram", "Tirupati", "Hampi", "Gokarna", "Bijapur",
  "Aurangabad", "Nashik", "Lonavala", "Matheran", "Alibaug", "Konkan",
  "Dubai", "Abu Dhabi", "Paris", "London", "New York", "Bangkok", "Phuket",
  "Bali", "Singapore", "Tokyo", "Maldives", "Barcelona", "Rome", "Amsterdam"
];

export default function CityAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Enter city",
  label = ""
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");

  const filteredCities = useMemo(() => {
    if (!inputValue.trim()) return VALID_CITIES.slice(0, 8);
    return VALID_CITIES.filter(city =>
      city.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 8);
  }, [inputValue]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setShowDropdown(true);
  };

  const handleCitySelect = (city) => {
    setInputValue(city);
    onChange(city);
    setShowDropdown(false);
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const handleBlur = () => {
    // Delay to allow click on dropdown items
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="relative w-full z-50">
      {label && <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>}
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="h-12 pr-10"
          autoComplete="off"
        />
        <MapPin className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />

        {/* Dropdown */}
        {showDropdown && filteredCities.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto pointer-events-auto">
            {filteredCities.map((city, index) => (
              <button
                key={index}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCitySelect(city);
                }}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-800">{city}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
