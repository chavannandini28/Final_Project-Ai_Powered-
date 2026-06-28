import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "@/api/apiClient";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Star, DollarSign, Wifi, Waves, Dumbbell, Coffee, Car, Heart, Share2, ArrowLeft, Check } from "lucide-react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function HotelDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get("id");
  const [selectedImage, setSelectedImage] = useState(0);
  const [user, setUser] = useState(null);

  const [hotel, setHotel] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const normalizeHotelImages = (images) => {
    const list = Array.isArray(images) ? images : images ? [images] : [];
    return list.filter((img) =>
      typeof img === "string" &&
      !img.startsWith("data:") &&
      (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("//"))
    );
  };

  const hotelImages = React.useMemo(
    () => normalizeHotelImages(hotel?.images),
    [hotel?.images]
  );

  useEffect(() => {
    if (hotelImages.length > 0 && selectedImage >= hotelImages.length) {
      setSelectedImage(0);
    }
  }, [hotelImages.length, selectedImage]);

  React.useEffect(() => {
    const fetchHotel = async () => {
      if (!hotelId) return;
      
      try {
        setIsLoading(true);
        const hotels = await apiClient.entities.Hotel.find();
        const foundHotel = hotels.find(h => h.id === hotelId);
        setHotel(foundHotel);
      } catch (error) {
        console.error("Error fetching hotel:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHotel();
  }, [hotelId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await apiClient.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log("User not logged in");
      }
    };
    fetchUser();
  }, []);

  const handleBookNow = (platform = 'booking') => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkIn = today.toISOString().split('T')[0];
    const checkOut = tomorrow.toISOString().split('T')[0];
    const hotelName = encodeURIComponent(hotel.name);
    const location = encodeURIComponent(hotel.location);
    
    let url = '';
    if (platform === 'booking') {
      url = `https://www.booking.com/search.html?ss=${location}&checkin=${checkIn}&checkout=${checkOut}`;
    } else if (platform === 'agoda') {
      url = `https://www.agoda.com/search?city=${location}&checkIn=${checkIn}&checkOut=${checkOut}`;
    } else if (platform === 'hotels') {
      url = `https://www.hotels.com/search?destination=${location}&startDate=${checkIn}&endDate=${checkOut}`;
    } else if (platform === 'expedia') {
      url = `https://www.expedia.com/Hotel-Search?destination=${location}&startDate=${checkIn}&endDate=${checkOut}`;
    }
    
    window.open(url, "_blank");
  };

  const amenityIcons = {
    "Free WiFi": Wifi,
    "WiFi": Wifi,
    "Pool": Waves,
    "Gym": Dumbbell,
    "Restaurant": Coffee,
    "Parking": Car,
    "Spa": Star,
  };

  if (isLoading || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("Hotels"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Hotels
        </Button>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid grid-cols-4 gap-4 h-96">
            <div className="col-span-3 relative rounded-2xl overflow-hidden">
              <img
                src={
                  hotelImages[selectedImage] ||
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200"
                }
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-rows-3 gap-4">
              {hotelImages.slice(0, 3).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer ${
                    selectedImage === idx ? "ring-4 ring-blue-600" : ""
                  }`}
                >
                  <img src={img} alt={`${hotel.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
                      <Badge className="bg-yellow-100 text-yellow-900 border-0 capitalize">
                        {hotel.hotel_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg">{hotel.address || hotel.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600 fill-current" />
                    <span className="font-bold text-yellow-900">{hotel.reviews_rating || hotel.rating}</span>
                    <span className="text-yellow-800 text-sm">({hotel.reviews_count} reviews)</span>
                  </div>
                  {hotel.distance_from_center && (
                    <div className="text-gray-600">
                      <span className="font-medium">{hotel.distance_from_center} km</span> from city center
                    </div>
                  )}
                </div>

                {hotel.ai_tags && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {hotel.ai_tags.map((tag, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-800 border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-gray-700 text-lg leading-relaxed">{hotel.description}</p>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="amenities" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-14">
                <TabsTrigger value="amenities" className="text-base">Amenities</TabsTrigger>
                <TabsTrigger value="rooms" className="text-base">Room Types</TabsTrigger>
                <TabsTrigger value="location" className="text-base">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="amenities">
                <Card className="shadow-lg border-0">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold mb-6">Popular Amenities</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {hotel.amenities?.map((amenity, idx) => {
                        const Icon = amenityIcons[amenity] || Check;
                        return (
                          <div key={idx} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium text-gray-900">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rooms">
                <div className="space-y-4">
                  {hotel.room_types?.map((room, idx) => (
                    <Card key={idx} className="shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold mb-2">{room.type}</h4>
                            <div className="flex items-center gap-4 text-gray-600 mb-4">
                              <span>Sleeps {room.capacity}</span>
                              <span>•</span>
                              <span className={room.available ? "text-green-600" : "text-red-600"}>
                                {room.available ? "Available" : "Unavailable"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {room.amenities?.map((amenity, i) => (
                                <Badge key={i} variant="outline">{amenity}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                              ${room.price}
                            </div>
                            <div className="text-sm text-gray-500 mb-4">per night</div>
                            <Button
                              disabled={!room.available}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600"
                              onClick={() => handleBookNow('booking')}
                            >
                              Check Availability
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="location">
                <Card className="shadow-lg border-0">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold mb-6">Location & Nearby</h3>
                    {hotel.coordinates && (
                      <div className="h-96 rounded-xl overflow-hidden mb-4">
                        <MapContainer
                          center={[hotel.coordinates.lat, hotel.coordinates.lng]}
                          zoom={13}
                          style={{ height: "100%", width: "100%" }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          />
                          <Marker position={[hotel.coordinates.lat, hotel.coordinates.lng]}>
                            <Popup>{hotel.name}</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span>{hotel.address || hotel.location}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Card */}
          <div>
            <Card className="shadow-2xl border-0 sticky top-24">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-500 mb-2">Starting from</div>
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    ${hotel.price_per_night}
                  </div>
                  <div className="text-gray-600">per night</div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold">Free Cancellation</span>
                    </div>
                    <p className="text-sm text-green-600">Cancel up to 24 hours before check-in</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <Star className="w-5 h-5" />
                      <span className="font-semibold">Instant Confirmation</span>
                    </div>
                    <p className="text-sm text-blue-600">Get booking confirmation immediately</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleBookNow('booking')}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Book on Booking.com
                  </Button>
                  <Button
                    onClick={() => handleBookNow('agoda')}
                    variant="outline"
                    className="w-full h-12 border-2 hover:bg-red-50"
                  >
                    Book on Agoda
                  </Button>
                  <Button
                    onClick={() => handleBookNow('hotels')}
                    variant="outline"
                    className="w-full h-12 border-2 hover:bg-purple-50"
                  >
                    Book on Hotels.com
                  </Button>
                  <Button
                    onClick={() => handleBookNow('expedia')}
                    variant="outline"
                    className="w-full h-12 border-2 hover:bg-yellow-50"
                  >
                    Book on Expedia
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t text-center text-sm text-gray-600">
                  <p>💳 Secure Payment</p>
                  <p className="mt-2">🔒 Your information is protected</p>
                  <p className="mt-2 text-xs">Search results will open with today's date</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}