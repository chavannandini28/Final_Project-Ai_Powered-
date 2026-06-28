import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import apiClient from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, Calendar, Users, Star, Clock, Check, Sparkles, Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import CitySearch from "@/components/CitySearch";

export default function PackagesPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [realTimePackages, setRealTimePackages] = useState([]);
  const [searchingRealTime, setSearchingRealTime] = useState(false);

  const { data: packages, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => apiClient.entities.TravelPackage.find(),
    initialData: [],
  });

  const handleRealTimeSearch = async () => {
    if (!searchTerm) {
      alert("Please enter a destination");
      return;
    }

    setSearchingRealTime(true);
    try {
      const result = await apiClient.integrations.Core.InvokeLLM({
        prompt: `Find real-time travel packages for ${searchTerm}.
        
        CRITICAL REQUIREMENTS:
        - Include actual tour packages from GLOBAL travel companies
        - Search for ${searchTerm} worldwide (could be Indian cities like Goa, Kerala OR international destinations like Paris, Dubai, Maldives)
        - Accurate pricing in USD per person
        - Duration (days/nights)
        - Comprehensive highlights (top attractions, experiences)
        - Detailed inclusions (hotels, meals, transport, sightseeing, visas if international)
        - Package types (honeymoon, family, adventure, pilgrimage, beach, cultural, etc.)
        - Real ratings and review counts
        - Focus on popular ${searchTerm} packages from reputable tour operators
        - Include budget to luxury options
        - Return 15-20 authentic packages
        
        Provide real travel package data with accurate details for ${searchTerm} destination.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            packages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  package_name: { type: "string" },
                  destination: { type: "string" },
                  duration_days: { type: "number" },
                  duration_nights: { type: "number" },
                  price_per_person: { type: "number" },
                  package_type: { type: "string" },
                  rating: { type: "number" },
                  reviews_count: { type: "number" },
                  highlights: { type: "array", items: { type: "string" } },
                  inclusions: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setRealTimePackages(result.packages || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
      alert("Failed to fetch packages. Please try again.");
    } finally {
      setSearchingRealTime(false);
    }
  };

  // Combine database + real-time packages
  const allPackages = [...packages, ...realTimePackages];

  // Real-time destination-based filtering
  const filteredPackages = React.useMemo(() => {
    return allPackages.filter(pkg => {
      const matchesType = selectedType === "all" || pkg.package_type === selectedType;
      const matchesSearch = !searchTerm || 
        pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.package_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [allPackages, selectedType, searchTerm]);

  const packageTypes = [
    { value: "all", label: "All Packages" },
    { value: "honeymoon", label: "Honeymoon" },
    { value: "family", label: "Family" },
    { value: "adventure", label: "Adventure" },
    { value: "weekend", label: "Weekend" },
    { value: "international", label: "International" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Curated by Travel Experts</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Travel Packages
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover handpicked travel packages for every occasion
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mt-8"
          >
            <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
              <CardContent className="p-4">
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
        {/* Filter Tabs */}
        <div className="mb-12">
          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto gap-2 bg-transparent">
              {packageTypes.map((type) => (
                <TabsTrigger
                  key={type.value}
                  value={type.value}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white px-6 py-3"
                >
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Packages Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <CardContent className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg, index) => {
              const uniqueKey = pkg.id || `${pkg.package_name}-${pkg.destination}-${index}`;
              return (
              <motion.div
                key={uniqueKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all group cursor-pointer">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={pkg.images?.[0] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"}
                      alt={pkg.package_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-gray-900 border-0 capitalize">
                        {pkg.package_type}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-2">{pkg.package_name}</h3>
                      <div className="flex items-center gap-2 text-white text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{pkg.destination}</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{pkg.duration_days}D/{pkg.duration_nights}N</span>
                      </div>
                      {pkg.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold text-gray-900">{pkg.rating}</span>
                          <span className="text-sm text-gray-500">({pkg.reviews_count})</span>
                        </div>
                      )}
                    </div>

                    {/* Highlights */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Package Highlights</h4>
                      <div className="space-y-1">
                        {pkg.highlights?.slice(0, 3).map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Inclusions */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pkg.inclusions?.slice(0, 3).map((item, idx) => (
                        <Badge key={`inclusion-${pkg.id || index}-${idx}`} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <div className="text-xs text-gray-500">Starting from</div>
                        <div className="text-2xl font-bold text-blue-600">
                          ${pkg.price_per_person}
                          <span className="text-sm text-gray-500 font-normal">/person</span>
                        </div>
                      </div>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
            })}
          </div>
        )}

        {!isLoading && filteredPackages.length === 0 && (
          <Card className="shadow-lg border-0 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-600">Try selecting a different category</p>
          </Card>
        )}

        {/* Why Choose Our Packages */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our Packages?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Check,
                title: "All-Inclusive",
                description: "Everything you need for a perfect trip, all in one package"
              },
              {
                icon: Star,
                title: "Expert Curated",
                description: "Handpicked destinations and experiences by travel experts"
              },
              {
                icon: Users,
                title: "Flexible Groups",
                description: "Packages designed for solo, couples, families, and groups"
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="text-center shadow-lg border-0 p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}