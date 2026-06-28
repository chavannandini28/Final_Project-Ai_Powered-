import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import apiClient from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Hotel, MapPin, Star, DollarSign, Search, Filter, SlidersHorizontal, Loader2, Map } from "lucide-react";
import { motion } from "framer-motion";
import HotelsMap from "@/components/hotels/HotelsMap";
import CitySearch from "@/components/CitySearch";

export default function HotelsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or map
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    rating: "all",
    hotelType: "all",
    sortBy: "rating"
  });
  const [showFilters, setShowFilters] = useState(false);

  const [realTimeHotels, setRealTimeHotels] = useState([]);
  const [searchingRealTime, setSearchingRealTime] = useState(false);

  const getValidImageUrl = (images, fallback) => {
    const list = Array.isArray(images) ? images : images ? [images] : [];
    const url = list.find((img) =>
      typeof img === "string" &&
      !img.startsWith("data:") &&
      (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("//"))
    );
    return url || fallback;
  };

  const { data: hotels, isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => apiClient.entities.Hotel.find(),
    initialData: [],
  });

  // Auto-search if search param in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && !realTimeHotels.length) {
      setSearchTerm(searchParam);
      setTimeout(() => handleRealTimeSearch(), 500);
    }
  }, []);

  const handleRealTimeSearch = async () => {
    if (!searchTerm) {
      alert("Please enter a city name");
      return;
    }

    console.log('🚀 SEARCH BUTTON CLICKED');
    console.log('🔍 Search term:', searchTerm);
    
    setSearchingRealTime(true);
    try {
      console.log('📡 Calling API:', `${import.meta.env.VITE_API_URL || 'https://ai-power-tours-production.up.railway.app/api'}/search/hotels?city=${searchTerm}`);
      const result = await apiClient.search.hotels(searchTerm);
      console.log('📦 Raw API response:', result);
      console.log('✅ Success:', result.success);
      console.log('📊 Hotels count:', result.hotels?.length);
      console.log('🏨 First hotel:', result.hotels?.[0]);

      if (result.success && result.hotels && result.hotels.length > 0) {
        console.log('✅ Setting realTimeHotels state with', result.hotels.length, 'hotels');
        setRealTimeHotels(result.hotels);
        console.log('✅ State updated successfully');
      } else {
        console.warn('⚠️ No hotels in response:', result);
        alert(`No hotels found for ${searchTerm}. Try a different city or check the spelling.`);
      }
    } catch (error) {
      console.error("❌ Error fetching hotels:", error);
      console.error("❌ Error stack:", error.stack);
      alert("Failed to fetch hotels: " + (error.message || 'Unknown error'));
    } finally {
      setSearchingRealTime(false);
      console.log('🏁 Search completed');
    }
  };

  // Combine database + real-time hotels
  const allHotels = [...hotels, ...realTimeHotels];
  
  console.log('🔢 Database hotels:', hotels.length);
  console.log('🔢 Real-time hotels:', realTimeHotels.length);
  console.log('🔢 Total hotels:', allHotels.length);

  // Real-time city-based filtering
  const filteredHotels = React.useMemo(() => {
    return allHotels.filter(hotel => {
      // Handle location - database hotels have object, API hotels have string
      const locationStr = typeof hotel.location === 'string' 
        ? hotel.location 
        : `${hotel.location?.city || ''} ${hotel.location?.country || ''} ${hotel.location?.address || ''}`;
      
      const matchesSearch = !searchTerm || 
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        locationStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Handle price - database hotels, scraper results, and API hotels may use different fields
      const pricePerNight = Number(
        hotel.price_per_night ||
        hotel.price?.perNight ||
        hotel.price_base ||
        hotel.roomTypes?.[0]?.price ||
        hotel.room_types?.[0]?.price ||
        0
      );
      const matchesPrice = pricePerNight >= filters.priceRange[0] && 
        pricePerNight <= filters.priceRange[1];
      
      const matchesRating = filters.rating === "all" || 
        hotel.rating >= parseInt(filters.rating);
      
      const matchesType = filters.hotelType === "all" || 
        hotel.hotel_type === filters.hotelType;

      return matchesSearch && matchesPrice && matchesRating && matchesType;
    }).sort((a, b) => {
      const priceA = Number(a.price_per_night || a.price?.perNight || a.price_base || a.roomTypes?.[0]?.price || a.room_types?.[0]?.price || 0);
      const priceB = Number(b.price_per_night || b.price?.perNight || b.price_base || b.roomTypes?.[0]?.price || b.room_types?.[0]?.price || 0);
      
      if (filters.sortBy === "price_low") return priceA - priceB;
      if (filters.sortBy === "price_high") return priceB - priceA;
      if (filters.sortBy === "rating") return (b.reviews_rating || b.rating || 0) - (a.reviews_rating || a.rating || 0);
      return 0;
    });
  }, [allHotels, searchTerm, filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl text-blue-100">
              Discover amazing hotels across India with real-time pricing & map locations
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="relative z-40 bg-white/95 backdrop-blur-xl border-0 shadow-2xl overflow-visible">
              <CardContent className="p-6 overflow-visible">
                <CitySearch 
                  onSearch={handleRealTimeSearch}
                  onCitySelect={setSearchTerm}
                  disabled={searchingRealTime}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <Card className="shadow-lg border-0 sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({
                      priceRange: [0, 1000],
                      rating: "all",
                      hotelType: "all",
                      sortBy: "rating"
                    })}
                  >
                    Reset
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <Label className="mb-3 block font-semibold">
                      Price per Night: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    </Label>
                    <Slider
                      min={0}
                      max={1000}
                      step={10}
                      value={filters.priceRange}
                      onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
                      className="mb-2"
                    />
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <Label className="mb-3 block font-semibold">Minimum Rating</Label>
                    <Select
                      value={filters.rating}
                      onValueChange={(value) => setFilters({ ...filters, rating: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Hotel Type */}
                  <div>
                    <Label className="mb-3 block font-semibold">Property Type</Label>
                    <Select
                      value={filters.hotelType}
                      onValueChange={(value) => setFilters({ ...filters, hotelType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="resort">Resort</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="hostel">Hostel</SelectItem>
                        <SelectItem value="boutique">Boutique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <Label className="mb-3 block font-semibold">Sort By</Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Highest Rating</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hotels Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredHotels.length} Properties Found
              </h2>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-blue-600" : ""}
                >
                  <Hotel className="w-4 h-4 mr-2" />
                  Grid View
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  onClick={() => setViewMode("map")}
                  className={viewMode === "map" ? "bg-blue-600" : ""}
                >
                  <Map className="w-4 h-4 mr-2" />
                  Map View
                </Button>
              </div>
            </div>

            {viewMode === "map" ? (
              <HotelsMap 
                hotels={filteredHotels.filter(h => h.coordinates)} 
                onHotelClick={(hotel) => navigate(createPageUrl("HotelDetail") + `?id=${hotel.id}`)}
              />
            ) : isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-64 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-6 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredHotels.map((hotel, index) => (
                  <motion.div
                    key={hotel.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
                      onClick={() => {
                        if (!hotel.id) {
                          // Real-time hotel - redirect to Booking.com
                          const url = `https://www.booking.com/search.html?ss=${encodeURIComponent(hotel.location || hotel.name)}&checkin=${format(new Date(), 'yyyy-MM-dd')}&checkout=${format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')}`;
                          window.open(url, "_blank");
                        } else {
                          // Database hotel - go to detail page
                          navigate(createPageUrl("HotelDetail") + `?id=${hotel.id}`);
                        }
                      }}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={getValidImageUrl(
                            hotel.images,
                            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
                          )}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          {hotel.ai_tags?.slice(0, 2).map((tag, idx) => (
                            <Badge key={idx} className="bg-blue-600 text-white border-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {hotel.hotel_type && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-white/90 text-gray-900 border-0 capitalize">
                              {hotel.hotel_type}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {hotel.name}
                          </h3>
                          <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 text-yellow-600 fill-current" />
                            <span className="font-bold text-yellow-900">{hotel.reviews_rating || hotel.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {typeof hotel.location === 'string' 
                              ? hotel.location 
                              : `${hotel.location?.city || ''}${hotel.location?.country ? ', ' + hotel.location.country : ''}`}
                          </span>
                        </div>

                        {hotel.amenities && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <div className="text-sm text-gray-500">Starting from</div>
                            <div className="text-2xl font-bold text-blue-600">
                              ${Number(hotel.price_per_night || hotel.price?.perNight || hotel.price_base || hotel.roomTypes?.[0]?.price || hotel.room_types?.[0]?.price || 0)}
                              <span className="text-sm text-gray-500 font-normal">/night</span>
                            </div>
                          </div>
                          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                            {hotel.id ? "View Details" : "Book Now"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {!isLoading && filteredHotels.length === 0 && (
              <Card className="shadow-lg border-0 p-12 text-center">
                <Hotel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Label = ({ children, className, ...props }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);