import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import apiClient from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plane, Train, Bus, Search, Clock, MapPin, DollarSign, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import CityAutocomplete from "@/components/CityAutocomplete";

// List of valid cities for transport
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

export default function TransportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  
  const [activeTab, setActiveTab] = useState(urlParams.get("type") || "flights");
  const [searchData, setSearchData] = useState({
    from: urlParams.get("from") || "",
    to: urlParams.get("to") || "",
    date: null,
    passengers: 1
  });
  const [realTimeResults, setRealTimeResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Auto-search when tab changes if search data exists
  React.useEffect(() => {
    if (searchData.from && searchData.to) {
      handleRealTimeSearch();
    }
  }, [activeTab]);

  const handleRealTimeSearch = async () => {
    if (!searchData.from || !searchData.to) {
      alert("Please enter from and to locations");
      return;
    }

    // Validate cities
    if (!isValidCity(searchData.from)) {
      alert(`"${searchData.from}" is not a valid city. Please select from supported cities.`);
      return;
    }

    if (!isValidCity(searchData.to)) {
      alert(`"${searchData.to}" is not a valid city. Please select from supported cities.`);
      return;
    }

    if (!searchData.date) {
      alert("Please select a date");
      return;
    }

    setSearching(true);
    try {
      console.log(`🔍 Searching ${activeTab} from ${searchData.from} to ${searchData.to}...`);
      
      let result;
      const dateStr = format(searchData.date, 'yyyy-MM-dd');
      
      if (activeTab === "flights") {
        result = await apiClient.search.flights({
          from: searchData.from,
          to: searchData.to,
          departDate: dateStr
        });
        setRealTimeResults(result.flights || []);
      } else if (activeTab === "trains") {
        result = await apiClient.search.trains({
          from: searchData.from,
          to: searchData.to,
          date: dateStr
        });
        setRealTimeResults(result.trains || []);
      } else {
        result = await apiClient.search.buses({
          from: searchData.from,
          to: searchData.to,
          date: dateStr
        });
        setRealTimeResults(result.buses || []);
      }

      console.log(`✅ Found ${result.count || 0} ${activeTab}`);
    } catch (error) {
      console.error(`Error searching ${activeTab}:`, error);
      alert(`Failed to search ${activeTab}. Please try again.`);
    } finally {
      setSearching(false);
    }
  };

  const handleBookingRedirect = (item) => {
    const dateStr = searchData.date ? format(searchData.date, "dd/MM/yyyy") : format(new Date(), "dd/MM/yyyy");
    
    if (activeTab === "flights") {
      // MakeMyTrip with all params
      const url = `https://www.makemytrip.com/flight/search?itinerary=O-${encodeURIComponent(searchData.from)}-${encodeURIComponent(searchData.to)}-${dateStr.replace(/\//g, '')}&tripType=O&paxType=A-${searchData.passengers}_C-0_I-0&cabinClass=E`;
      window.open(url, "_blank");
    } else if (activeTab === "trains") {
      // IRCTC with prefilled data
      const url = `https://www.irctc.co.in/nget/train-search?fromStation=${encodeURIComponent(searchData.from)}&toStation=${encodeURIComponent(searchData.to)}&journeyDate=${dateStr}`;
      window.open(url, "_blank");
    } else {
      // RedBus with date
      const url = `https://www.redbus.in/bus-tickets/${encodeURIComponent(searchData.from.toLowerCase().replace(/\s/g, "-"))}-to-${encodeURIComponent(searchData.to.toLowerCase().replace(/\s/g, "-"))}?onward=${dateStr.replace(/\//g, '-')}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Book Your Journey
            </h1>
            <p className="text-xl text-blue-100">
              Find the best flights, trains, and buses for your trip
            </p>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="flights" className="flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      Flights
                    </TabsTrigger>
                    <TabsTrigger value="trains" className="flex items-center gap-2">
                      <Train className="w-4 h-4" />
                      Trains
                    </TabsTrigger>
                    <TabsTrigger value="buses" className="flex items-center gap-2">
                      <Bus className="w-4 h-4" />
                      Buses
                    </TabsTrigger>
                  </TabsList>

                  <div className="grid md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                      <CityAutocomplete
                        label="From"
                        placeholder="Select departure city"
                        value={searchData.from}
                        onChange={(city) => setSearchData({ ...searchData, from: city })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <CityAutocomplete
                        label="To"
                        placeholder="Select arrival city"
                        value={searchData.to}
                        onChange={(city) => setSearchData({ ...searchData, to: city })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 block">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-start">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {searchData.date ? format(searchData.date, "PP") : "Date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={searchData.date}
                            onSelect={(date) => setSearchData({ ...searchData, date })}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <Button 
                    onClick={handleRealTimeSearch}
                    disabled={searching}
                    className="w-full mt-6 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {searching ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Searching Real-Time Data...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Search {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                      </>
                    )}
                  </Button>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Available {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h2>

        {searching && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        )}

        {!searching && realTimeResults.length === 0 && (
          <Card className="shadow-lg border-0 p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Search to find {activeTab}</h3>
            <p className="text-gray-600">Enter your journey details above and click search</p>
          </Card>
        )}

        <div className="space-y-4">
          {realTimeResults.map((item, index) => {
            // Normalize field names for different transport types
            const operator = item.airline || item.train_name || item.operator || '';
            const number = item.flight_number || item.train_number || item.operator || '';
            const departTime = item.departure_time || '';
            const arrivalTime = item.arrival_time || '';
            const duration = item.duration || '';
            const price = item.price || 0;
            const stops = item.stops !== undefined ? item.stops : 0;
            const classType = item.cabin_class || item.class || item.bus_type || 'Standard';
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg border-0 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            {activeTab === "flights" && <Plane className="w-6 h-6 text-white" />}
                            {activeTab === "trains" && <Train className="w-6 h-6 text-white" />}
                            {activeTab === "buses" && <Bus className="w-6 h-6 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg text-gray-900">{operator}</h3>
                            </div>
                            <p className="text-sm text-gray-500">{number}</p>
                            {item.amenities && (
                              <div className="flex gap-2 mt-2">
                                {item.amenities.slice(0, 3).map((amenity, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">{amenity}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Badge className="ml-auto">{classType}</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Departure</div>
                            <div className="font-semibold text-gray-900">{departTime}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {duration}
                            </div>
                            <div className="h-px bg-gray-300 relative my-2">
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs">
                                {stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? 's' : ''}`}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">Arrival</div>
                            <div className="font-semibold text-gray-900">{arrivalTime}</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center md:text-right">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          ${price}
                        </div>
                        <Button 
                          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600"
                          onClick={() => handleBookingRedirect(item)}
                        >
                          Book on {activeTab === "flights" ? "MakeMyTrip" : activeTab === "trains" ? "IRCTC" : "RedBus"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              icon: Plane,
              title: "Best Prices",
              description: "Compare prices from multiple providers"
            },
            {
              icon: Clock,
              title: "Fast Booking",
              description: "Book your tickets in just a few clicks"
            },
            {
              icon: DollarSign,
              title: "Flexible Payment",
              description: "Multiple payment options available"
            }
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="text-center shadow-lg border-0 p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}