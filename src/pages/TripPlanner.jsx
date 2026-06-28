import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "@/api/apiClient";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sparkles,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Loader2,
  Save,
  Clock,
  Navigation,
  Plane
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";
import TripItinerary from "@/components/trip/TripItinerary";
import CostBreakdown from "@/components/trip/CostBreakdown";
import TripRecommendations from "@/components/trip/TripRecommendations";
import RouteMap from "@/components/trip/RouteMap";
import CitySearch from "@/components/CitySearch";
import CityAutocomplete from "@/components/CityAutocomplete";

export default function TripPlannerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const [formData, setFormData] = useState({
    source: "",
    destination: location.state?.destination || "",
    startDate: location.state?.startDate || null,
    endDate: null,
    travelers: location.state?.travelers || 1,
    travelType: "family",
    interests: [],
    budget: 5000,
    budgetCategory: "moderate"
  });

  const interestsOptions = [
    "Adventure", "Relaxing", "Heritage", "Luxury", "Beach", 
    "Mountain", "Wildlife", "Food", "Photography", "Shopping"
  ];

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

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleGenerateTrip = async () => {
    if (!formData.source || !formData.destination || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields");
      return;
    }

    if (!user) {
      apiClient.auth.redirectToLogin(window.location.pathname);
      return;
    }

    setLoading(true);

    try {
      const days = differenceInDays(formData.endDate, formData.startDate) + 1;

      // Call backend trip planner endpoint (scraping-based, no AI API needed)
      const response = await fetch('http://localhost:5000/api/ai/generate-trip-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startingCity: formData.source,
          destination: formData.destination,
          startDate: format(formData.startDate, 'yyyy-MM-dd'),
          endDate: format(formData.endDate, 'yyyy-MM-dd'),
          numTravelers: formData.travelers,
          travelType: formData.travelType,
          budget: formData.budget,
          budgetCategory: formData.budgetCategory,
          interests: formData.interests
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();

      console.log('Trip Plan Response:', result);

      // Validate response
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate trip plan');
      }

      if (!result.tripPlan) {
        throw new Error('Invalid trip plan format from backend');
      }

      // Backend now provides daily_itinerary directly with full structure
      const total = typeof result.tripPlan.budget === 'number' 
        ? result.tripPlan.budget 
        : parseInt(result.tripPlan.budget?.replace(/[₹$,]/g, '') || 0);
      
      const accommodation = typeof result.tripPlan.costBreakdown?.accommodation === 'number'
        ? result.tripPlan.costBreakdown.accommodation
        : parseInt(result.tripPlan.costBreakdown?.accommodation?.replace(/[₹$,]/g, '') || 0);

      const food = typeof result.tripPlan.costBreakdown?.food === 'number'
        ? result.tripPlan.costBreakdown.food
        : parseInt(result.tripPlan.costBreakdown?.food?.replace(/[₹$,]/g, '') || 0);

      const activities = typeof result.tripPlan.costBreakdown?.activities === 'number'
        ? result.tripPlan.costBreakdown.activities
        : parseInt(result.tripPlan.costBreakdown?.activities?.replace(/[₹$,]/g, '') || 0);

      const transport = typeof result.tripPlan.costBreakdown?.transport === 'number'
        ? result.tripPlan.costBreakdown.transport
        : parseInt(result.tripPlan.costBreakdown?.transport?.replace(/[₹$,]/g, '') || 0);

      // Calculate total distance from daily_itinerary
      const totalDistance = (result.tripPlan.daily_itinerary || []).reduce((sum, day) => {
        return sum + (day.distance_from_previous || 0);
      }, 0);

      const transformed = {
        trip_summary: {
          title: result.tripPlan.title,
          description: `${days}-day trip with real-time recommendations`,
          duration_days: days,
          distance_km: Math.round(totalDistance),
          travel_time: result.tripPlan.duration
        },
        daily_itinerary: result.tripPlan.daily_itinerary || [],
        cost_breakdown: {
          total: total,
          accommodation: { total: accommodation },
          food: { total: food },
          activities: activities,
          transportation: { total: transport }
        },
        packing_list: ['Sunscreen', 'Comfortable shoes', 'Hat', 'Water bottle', 'Phone charger', 'ID documents', 'Credit card', 'Travel guides', 'Camera', 'Light jacket'],
        safety_tips: result.tripPlan.tips?.slice(0, 5) || ['Book in advance', 'Stay alert', 'Use safe transport', 'Keep copies of documents', 'Travel insurance recommended'],
        food_recommendations: ['Local cuisine', 'Street food', 'Restaurant dining', 'Cafe experience', 'Cooking classes'],
        hidden_gems: ['Secret viewpoint', 'Local market', 'Heritage site', 'Nature trail', 'Traditional village'],
        route_map: result.tripPlan.route_map || {},
        transportOptions: result.tripPlan.transportOptions || {}
      };

      setGeneratedTrip(transformed);
    } catch (error) {
      console.error("Error generating trip:", error);
      alert("Failed to generate trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!generatedTrip) return;

    setSaving(true);
    try {
      // Transform daily itinerary to match Trip model schema
      const itinerary = generatedTrip.daily_itinerary?.map(day => ({
        day: day.day,
        date: new Date(formData.startDate.getTime() + (day.day - 1) * 24 * 60 * 60 * 1000),
        activities: day.activities?.map(act => {
          // Parse cost: remove currency symbols and convert to number
          let cost = 0;
          const costValue = act.estimated_cost || act.cost || '0';
          if (typeof costValue === 'string') {
            cost = parseInt(costValue.replace(/[₹$,]/g, ''), 10) || 0;
          } else {
            cost = Number(costValue) || 0;
          }
          return {
            time: act.time,
            title: act.activity || `${act.time} Activity`,
            description: act.description || act.activity || '',
            location: act.location || day.city_location,
            cost: cost
          };
        }) || []
      })) || [];

      await apiClient.entities.Trip.create({
        title: generatedTrip.trip_summary.title,
        destination: formData.destination,
        startDate: format(formData.startDate, "yyyy-MM-dd"),
        endDate: format(formData.endDate, "yyyy-MM-dd"),
        status: "planning",
        budget: {
          total: formData.budget,
          spent: 0
        },
        travelers: {
          adults: formData.travelers,
          children: 0
        },
        itinerary: itinerary,
        notes: generatedTrip.trip_summary.description
      });

      alert("Trip saved successfully!");
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error saving trip:", error);
      alert("Failed to save trip: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-blue-900 font-medium">AI-Powered Trip Planning</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let our AI create a personalized itinerary tailored to your preferences
          </p>
        </motion.div>

        {/* Trip Planning Form */}
        {!generatedTrip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Source */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-blue-600" />
                      Starting From *
                    </Label>
                    <CityAutocomplete
                      label=""
                      placeholder="Select your city"
                      value={formData.source}
                      onChange={(city) => setFormData({ ...formData, source: city })}
                    />
                  </div>

                  {/* Destination */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Destination *
                    </Label>
                    <CityAutocomplete
                      label=""
                      placeholder="Where do you want to go?"
                      value={formData.destination}
                      onChange={(city) => setFormData({ ...formData, destination: city })}
                    />
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                      Start Date *
                    </Label>
                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-12 justify-start">
                          {formData.startDate ? format(formData.startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => {
                            setFormData({ ...formData, startDate: date });
                            setStartDateOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                      End Date *
                    </Label>
                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-12 justify-start">
                          {formData.endDate ? format(formData.endDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => {
                            setFormData({ ...formData, endDate: date });
                            setEndDateOpen(false);
                          }}
                          disabled={(date) => !formData.startDate || date < formData.startDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Travelers */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      Number of Travelers
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.travelers}
                      onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) || 1 })}
                      className="h-12"
                    />
                  </div>

                  {/* Travel Type */}
                  <div className="space-y-2">
                    <Label>Travel Type</Label>
                    <Select value={formData.travelType} onValueChange={(value) => setFormData({ ...formData, travelType: value })}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo</SelectItem>
                        <SelectItem value="couple">Couple</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="friends">Friends</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <span className="text-xl text-blue-600">$</span>
                      Budget
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                      className="h-12"
                    />
                  </div>

                  {/* Budget Category */}
                  <div className="space-y-2">
                    <Label>Budget Category</Label>
                    <Select value={formData.budgetCategory} onValueChange={(value) => setFormData({ ...formData, budgetCategory: value })}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                        <SelectItem value="ultra_luxury">Ultra Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Interests */}
                <div className="mt-6 space-y-2">
                  <Label>Travel Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {interestsOptions.map((interest) => (
                      <Badge
                        key={interest}
                        variant={formData.interests.includes(interest) ? "default" : "outline"}
                        className={`cursor-pointer px-4 py-2 ${
                          formData.interests.includes(interest)
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "hover:bg-blue-50"
                        }`}
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateTrip}
                  disabled={loading}
                  className="w-full mt-8 h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Your Perfect Trip...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate AI Trip Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Generated Trip Results */}
        {generatedTrip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Trip Header */}
            <Card className="shadow-2xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{generatedTrip.trip_summary.title}</h2>
                    <p className="text-blue-100 text-lg">{generatedTrip.trip_summary.description}</p>
                  </div>
                  <Button
                    onClick={handleSaveTrip}
                    disabled={saving}
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Trip
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                    <Clock className="w-5 h-5 mb-2" />
                    <div className="text-sm text-blue-100">Duration</div>
                    <div className="text-lg font-bold">{generatedTrip.trip_summary.duration_days} Days</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                    <Navigation className="w-5 h-5 mb-2" />
                    <div className="text-sm text-blue-100">Distance</div>
                    <div className="text-lg font-bold">{generatedTrip.trip_summary.distance_km} km</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                    <Plane className="w-5 h-5 mb-2" />
                    <div className="text-sm text-blue-100">Travel Time</div>
                    <div className="text-lg font-bold">{generatedTrip.trip_summary.travel_time}</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                    <div className="text-xl text-blue-200 mb-2">$</div>
                    <div className="text-sm text-blue-100">Est. Cost</div>
                    <div className="text-lg font-bold">${generatedTrip.cost_breakdown.total.toFixed(0)}</div>
                  </div>
                </div>
              </div>
            </Card>

            <Tabs defaultValue="route" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-14">
                <TabsTrigger value="route" className="text-base">Route Map</TabsTrigger>
                <TabsTrigger value="itinerary" className="text-base">Day-wise Plan</TabsTrigger>
                <TabsTrigger value="costs" className="text-base">Costs</TabsTrigger>
                <TabsTrigger value="recommendations" className="text-base">Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="route">
                <RouteMap itinerary={generatedTrip.daily_itinerary} routeMap={generatedTrip.route_map} />
              </TabsContent>

              <TabsContent value="itinerary">
                <TripItinerary data={generatedTrip} />
              </TabsContent>

              <TabsContent value="costs">
                <CostBreakdown data={generatedTrip.cost_breakdown} />
              </TabsContent>

              <TabsContent value="recommendations">
                <TripRecommendations data={generatedTrip} />
              </TabsContent>
            </Tabs>

            <Button
              onClick={() => setGeneratedTrip(null)}
              variant="outline"
              className="w-full h-12"
            >
              Create Another Trip
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}