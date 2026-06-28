import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import apiClient from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Hotel,
  Plane,
  Train,
  Bus,
  ArrowLeft,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function TripDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tripId = new URLSearchParams(location.search).get("id");

  const [bookingHotels, setBookingHotels] = useState(false);

  // Helper to extract source from title like "Nashik to Sambhajinagar"
  const getSourceFromTitle = (title) => {
    if (!title) return null;
    const match = title.match(/([\w\s]+)\s+to\s+([\w\s]+)/i);
    if (match) return match[1].trim();
    return null;
  };

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const trips = await apiClient.entities.Trip.find();
      return trips.find(t => (t._id || t.id) === tripId);
    },
    enabled: !!tripId,
  });

  const updateTripMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.entities.Trip.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });

  const handleHotelBooking = async () => {
    setBookingHotels(true);
    try {
      const result = await apiClient.integrations.Core.InvokeLLM({
        prompt: `Find real-time hotels in ${trip.destination}, India with exact GPS coordinates.
        
        REQUIREMENTS:
        - Return 10-15 actual hotels
        - Include coordinates, pricing, ratings
        - Focus on hotels near city center and tourist areas
        - Include budget to luxury options`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            hotels: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  location: { type: "string" },
                  price_per_night: { type: "number" },
                  rating: { type: "number" },
                  coordinates: {
                    type: "object",
                    properties: {
                      lat: { type: "number" },
                      lng: { type: "number" }
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Redirect to Hotels page with search pre-filled
      navigate(createPageUrl("Hotels") + `?search=${encodeURIComponent(trip.destination)}`);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setBookingHotels(false);
    }
  };

  const handleTransportBooking = (type) => {
    // Redirect to Transport page with source and destination pre-filled
    const source = getSourceFromTitle(trip.title) || 'Your City';
    navigate(createPageUrl("Transport") + `?from=${encodeURIComponent(source)}&to=${encodeURIComponent(trip.destination)}&type=${type}`);
  };

  const handleMarkComplete = () => {
    updateTripMutation.mutate({
      id: trip._id || trip.id,
      data: { status: "completed" }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Trip not found</h2>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(createPageUrl("Dashboard"))}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Trip Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-2xl border-0 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{trip.title || trip.destination}</h1>
                  <p className="text-blue-100 text-lg">Destination: {trip.destination}</p>
                </div>
                <Badge className={`text-lg px-4 py-2 ${
                  trip.status === "completed" ? "bg-green-500" :
                  trip.status === "booked" ? "bg-blue-500" :
                  "bg-yellow-500"
                }`}>
                  {trip.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                  <Calendar className="w-5 h-5 mb-2" />
                  <div className="text-sm text-blue-100">Dates</div>
                  <div className="font-bold">{(trip.startDate || trip.start_date) && format(new Date(trip.startDate || trip.start_date), "MMM dd")}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                  <Users className="w-5 h-5 mb-2" />
                  <div className="text-sm text-blue-100">Travelers</div>
                  <div className="font-bold">{trip.travelers ? ((trip.travelers.adults || 0) + (trip.travelers.children || 0)) : (trip.travelers_count || 1)}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                  <DollarSign className="w-5 h-5 mb-2" />
                  <div className="text-sm text-blue-100">Budget</div>
                  <div className="font-bold">${trip.budget?.total || trip.budget || 0}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                  <MapPin className="w-5 h-5 mb-2" />
                  <div className="text-sm text-blue-100">Duration</div>
                  <div className="font-bold">{trip.startDate && trip.endDate ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) : 0} days</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Booking Actions */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Book Your Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Hotel Booking */}
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Hotel className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Book Hotels</h3>
                      <p className="text-sm text-gray-600">{getSourceFromTitle(trip.title) || 'Your City'} → {trip.destination}</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    onClick={handleHotelBooking}
                    disabled={bookingHotels}
                  >
                    {bookingHotels ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Hotel className="w-4 h-4 mr-2" />}
                    Find Hotels
                  </Button>
                </CardContent>
              </Card>

              {/* Flight Booking */}
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Plane className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Book Flights</h3>
                      <p className="text-sm text-gray-600">
                        {getSourceFromTitle(trip.title) || 'Your City'} → {trip.destination}
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                    onClick={() => handleTransportBooking("flights")}
                  >
                    <Plane className="w-4 h-4 mr-2" />
                    Search Flights
                  </Button>
                </CardContent>
              </Card>

              {/* Train Booking */}
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Train className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Book Trains</h3>
                      <p className="text-sm text-gray-600">
                        {getSourceFromTitle(trip.title) || 'Your City'} → {trip.destination}
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                    onClick={() => handleTransportBooking("trains")}
                  >
                    <Train className="w-4 h-4 mr-2" />
                    Search Trains
                  </Button>
                </CardContent>
              </Card>

              {/* Bus Booking */}
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Bus className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Book Buses</h3>
                      <p className="text-sm text-gray-600">
                        {getSourceFromTitle(trip.title) || 'Your City'} → {trip.destination}
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600"
                    onClick={() => handleTransportBooking("buses")}
                  >
                    <Bus className="w-4 h-4 mr-2" />
                    Search Buses
                  </Button>
                </CardContent>
              </Card>
            </div>

            {trip.status !== "completed" && (
              <Button
                className="w-full mt-6 h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-lg"
                onClick={handleMarkComplete}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Mark Trip as Complete
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Day-wise Itinerary */}
        {trip.itinerary && trip.itinerary.length > 0 && (
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Day-wise Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {trip.itinerary.map((day, index) => (
                  <motion.div
                    key={day._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-l-4 border-blue-600">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold">Day {day.day}</h3>
                          {day.date && (
                            <span className="text-sm text-gray-600">
                              {format(new Date(day.date), "MMM dd, yyyy")}
                            </span>
                          )}
                        </div>
                        <div className="space-y-3">
                          {day.activities?.map((activity, idx) => (
                            <div key={activity._id || idx} className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                              <div className="text-blue-600 font-semibold min-w-[80px]">{activity.time}</div>
                              <div className="flex-1">
                                <div className="font-semibold">{activity.title}</div>
                                <div className="text-sm text-gray-600">{activity.location}</div>
                                {activity.description && (
                                  <div className="text-sm text-gray-500 mt-1">{activity.description}</div>
                                )}
                              </div>
                              {activity.cost > 0 && (
                                <div className="text-green-600 font-semibold">${activity.cost}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}