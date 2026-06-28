import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Sparkles,
  Map,
  Hotel,
  Plane,
  Shield,
  Zap,
  Globe,
  TrendingUp,
  Users,
  Star,
  MapPin,
  Calendar as CalendarIcon,
  ArrowRight,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import CitySearch from "@/components/CitySearch";
import CityAutocomplete from "@/components/CityAutocomplete";

export default function HomePage() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    destination: "",
    startDate: null,
    travelers: 1
  });
  const [dateOpen, setDateOpen] = useState(false);

  // Valid cities list
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

  const isValidCity = (city) => {
    return VALID_CITIES.some(c => c.toLowerCase() === city.toLowerCase());
  };

  const handleSearch = () => {
    if (!searchData.destination) {
      alert("Please enter a destination");
      return;
    }

    // Validate destination city
    if (!isValidCity(searchData.destination)) {
      alert(`"${searchData.destination}" is not a valid destination. Please select from supported cities.`);
      return;
    }

    navigate(createPageUrl("TripPlanner"), { 
      state: { 
        destination: searchData.destination,
        startDate: searchData.startDate,
        travelers: searchData.travelers
      } 
    });
  };

  const features = [
    {
      icon: Sparkles,
      title: "AI Trip Planning",
      description: "Get personalized itineraries powered by advanced AI",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Book hotels, flights & packages in seconds",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "100% secure transactions with full protection",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Access to destinations worldwide",
      color: "from-orange-500 to-red-500"
    }
  ];

  const popularDestinations = [
    { name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800", trips: "2.5K" },
    { name: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800", trips: "1.8K" },
    { name: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800", trips: "3.2K" },
    { name: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800", trips: "2.1K" },
    { name: "New York", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800", trips: "2.8K" },
    { name: "Maldives", country: "Maldives", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800", trips: "1.5K" }
  ];

  const stats = [
    { icon: Users, value: "500K+", label: "Happy Travelers" },
    { icon: MapPin, value: "1000+", label: "Destinations" },
    { icon: Hotel, value: "50K+", label: "Hotels" },
    { icon: Star, value: "4.9", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 animate-gradient">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCA0IDEuNzkgNCA0IDQtMS43OSA0LTR6TTI0IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCA0IDEuNzkgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0xMiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCA0IDEuNzkgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-medium">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Your Dream Journey<br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Experience intelligent travel planning with AI-powered itineraries, instant bookings, and personalized recommendations
            </p>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl overflow-visible">
                <CardContent className="p-6 overflow-visible">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-visible">
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">Where to?</label>
                      </div>
                      <CityAutocomplete
                        value={searchData.destination}
                        onChange={(city) => setSearchData({ ...searchData, destination: city })}
                        placeholder="Enter destination (e.g., Goa, Delhi, Dubai)"
                      />
                      <p className="text-xs text-gray-500 mt-1">💡 Popular: Goa, Kerala, Rajasthan, Paris, Dubai, Bangkok</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">When?</label>
                      </div>
                      <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 justify-start text-left border-2 hover:border-blue-500"
                          >
                            {searchData.startDate ? format(searchData.startDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={searchData.startDate}
                            onSelect={(date) => {
                              setSearchData({ ...searchData, startDate: date });
                              setDateOpen(false);
                            }}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">Travelers</label>
                      </div>
                      <Input
                        type="number"
                        min="1"
                        value={searchData.travelers}
                        onChange={(e) => setSearchData({ ...searchData, travelers: parseInt(e.target.value) || 1 })}
                        className="h-12 text-lg border-2 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleSearch}
                    className="w-full mt-6 h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Plan My Trip with AI
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#f8fafc"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="text-center bg-white shadow-xl border-0 hover:shadow-2xl transition-all">
                  <CardContent className="p-6">
                    <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose AI Power Tours?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of travel planning with cutting-edge AI technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all group cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Popular Destinations
            </h2>
            <p className="text-xl text-gray-600">
              Explore the world's most breathtaking locations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.map((dest, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-1">{dest.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-white/90">{dest.country}</p>
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                          <span className="text-white text-sm font-medium">{dest.trips} trips</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Card className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 border-0 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCA0IDEuNzkgNCA0IDQtMS43OSA0LTR6TTI0IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCA0IDEuNzkgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0xMiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCA0IDEuNzkgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <CardContent className="p-12 md:p-16 text-center relative z-10">
            <Sparkles className="w-16 h-16 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who trust AI Power Tours for their journey
            </p>
            <Button
              onClick={() => navigate(createPageUrl("TripPlanner"))}
              size="lg"
              className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-gray-100 shadow-xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Plan Your Trip Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}