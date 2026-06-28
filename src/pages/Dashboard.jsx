import React, { useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plane,
  Hotel,
  Package,
  TrendingUp,
  Clock,
  Plus,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await apiClient.auth.me();
        setUser(currentUser);
      } catch (error) {
        window.location.href = "/";
      }
    };
    fetchUser();
  }, []);

  const { data: trips = [] } = useQuery({
    queryKey: ['myTrips'],
    queryFn: () => apiClient.entities.Trip.find(),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => apiClient.entities.Booking.find(),
  });

  const stats = [
    {
      icon: MapPin,
      label: "Total Trips",
      value: trips.length,
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: Hotel,
      label: "Bookings",
      value: bookings.length,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: DollarSign,
      label: "Total Spent",
      value: `$${bookings.reduce((sum, b) => sum + (b.totalPrice || b.total_amount || 0), 0).toFixed(0)}`,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50"
    },
    {
      icon: Clock,
      label: "Upcoming",
      value: trips.filter(t => t.status === "planning" || t.status === "booked").length,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50"
    }
  ];

  const spendingData = (() => {
    // Calculate spending from all trips that have budget/activity data
    const tripsWithSpending = trips.filter(t => t.budget?.total > 0 || t.itinerary?.length > 0);
    
    if (tripsWithSpending.length === 0) {
      return [
        { name: "Hotels", value: 0 },
        { name: "Transport", value: 0 },
        { name: "Food & Activities", value: 0 }
      ];
    }

    // Calculate spending categories by analyzing activities
    let hotels = 0;
    let transport = 0;
    let activities = 0;
    let food = 0;
    let totalBudget = 0;
    let totalActivityCost = 0;

    tripsWithSpending.forEach(trip => {
      totalBudget += trip.budget?.total || 0;

      // Sum activity costs by category
      if (trip.itinerary && Array.isArray(trip.itinerary)) {
        trip.itinerary.forEach(day => {
          if (day.activities && Array.isArray(day.activities)) {
            day.activities.forEach(activity => {
              const cost = activity.cost || 0;
              totalActivityCost += cost;
              
              const title = (activity.title || activity.activity || '').toLowerCase();
              const description = (activity.description || '').toLowerCase();
              
              // Categorize by keywords
              if (title.includes('hotel') || title.includes('accommodation') || title.includes('check-in') || title.includes('checkout')) {
                hotels += cost;
              } else if (title.includes('arrival') || title.includes('departure') || title.includes('flight') || title.includes('transport') || title.includes('train') || title.includes('bus')) {
                transport += cost;
              } else if (title.includes('food') || title.includes('meal') || title.includes('lunch') || title.includes('dinner') || title.includes('breakfast') || title.includes('food')) {
                food += cost;
              } else {
                activities += cost;
              }
            });
          }
        });
      }
    });

    // If we have very little activity cost data, use budget allocation as fallback
    if (totalActivityCost < totalBudget * 0.5) {
      // Use 40% hotels, 30% transport, 20% food, 10% activities distribution
      hotels = hotels || Math.round(totalBudget * 0.4);
      transport = transport || Math.round(totalBudget * 0.3);
      food = food || Math.round(totalBudget * 0.2);
      activities = activities || Math.round(totalBudget * 0.1);
    }

    // Also add from bookings if available
    const bookingHotels = bookings.filter(b => (b.type || b.booking_type) === "hotel").reduce((sum, b) => sum + (b.totalPrice || b.total_amount || 0), 0);
    const bookingFlights = bookings.filter(b => (b.type || b.booking_type) === "flight").reduce((sum, b) => sum + (b.totalPrice || b.total_amount || 0), 0);
    const bookingPackages = bookings.filter(b => (b.type || b.booking_type) === "package").reduce((sum, b) => sum + (b.totalPrice || b.total_amount || 0), 0);

    return [
      { name: "Hotels", value: Math.round(hotels + bookingHotels) },
      { name: "Transport", value: Math.round(transport + bookingFlights) },
      { name: "Food & Activities", value: Math.round(food + activities + bookingPackages) }
    ];
  })();

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name || user.full_name || 'Traveler'}!
              </h1>
              <p className="text-xl text-gray-600">
                Your travel control center
              </p>
            </div>
            <Link to={createPageUrl("TripPlanner")}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 px-6">
                <Plus className="w-5 h-5 mr-2" />
                Plan New Trip
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="shadow-lg border-0 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Spending Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {spendingData.reduce((sum, item) => sum + item.value, 0) > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {spendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-gray-500">
                  <DollarSign className="w-12 h-12 mb-2 text-gray-400" />
                  <p className="text-center text-sm">No spending data available. Save trips to see your spending breakdown.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trips.slice(0, 4).map((trip, idx) => (
                  <div key={trip.id || trip._id || idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{trip.title || trip.destination}</div>
                      <div className="text-sm text-gray-600">
                        {trip.startDate && format(new Date(trip.startDate), "MMM dd, yyyy")}
                      </div>
                    </div>
                    <Badge className={
                      trip.status === "planning" ? "bg-yellow-100 text-yellow-800" :
                      trip.status === "booked" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }>
                      {trip.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Trips and Bookings */}
        <Tabs defaultValue="trips" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 mb-8">
            <TabsTrigger value="trips" className="text-base">My Trips</TabsTrigger>
            <TabsTrigger value="bookings" className="text-base">My Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="trips">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id || trip._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="shadow-lg border-0 hover:shadow-xl transition-all group cursor-pointer"
                    onClick={() => navigate(createPageUrl("TripDetail") + `?id=${trip._id || trip.id}`)}
                  >
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCA0IDEuNzkgNCA0IDQtMS43OSA0LTR6TTI0IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCA0IDEuNzkgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0xMiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCA0IDEuNzkgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/90 text-gray-900 capitalize">{trip.status}</Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-2xl font-bold mb-2">{trip.title || trip.destination}</h3>
                        <div className="flex items-center gap-2 text-sm text-blue-100">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {/* Show route if title contains "to", otherwise show destination */}
                            {trip.title?.toLowerCase().includes(' to ') 
                              ? trip.title.split(':')[1]?.trim() || trip.title 
                              : trip.destination}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Duration</div>
                          <div className="font-semibold flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {trip.startDate && format(new Date(trip.startDate), "MMM dd")}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Travelers</div>
                          <div className="font-semibold flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {trip.travelers ? ((trip.travelers.adults || 0) + (trip.travelers.children || 0)) : 1}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-2xl font-bold text-blue-600">
                          ${trip.budget?.total || trip.budget || 0}
                        </div>
                        <Button variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {trips.length === 0 && (
              <Card className="shadow-lg border-0 p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
                <p className="text-gray-600 mb-6">Start planning your next adventure with AI</p>
                <Link to={createPageUrl("TripPlanner")}>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Plan Your First Trip
                  </Button>
                </Link>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id || booking._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="shadow-lg border-0 hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                            (booking.type || booking.booking_type) === "hotel" ? "from-purple-500 to-pink-500" :
                            (booking.type || booking.booking_type) === "flight" ? "from-blue-500 to-indigo-500" :
                            "from-green-500 to-emerald-500"
                          } flex items-center justify-center`}>
                            {(booking.type || booking.booking_type) === "hotel" ? <Hotel className="w-7 h-7 text-white" /> :
                             (booking.type || booking.booking_type) === "flight" ? <Plane className="w-7 h-7 text-white" /> :
                             <Package className="w-7 h-7 text-white" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{booking.hotel_name || booking.hotelId?.name || "Booking"}</h3>
                              <Badge className="capitalize">{booking.type || booking.booking_type || 'booking'}</Badge>
                            </div>
                            {(booking.checkIn || booking.check_in) && (
                              <div className="text-gray-600 mb-2">
                                {format(new Date(booking.checkIn || booking.check_in), "MMM dd, yyyy")} - {format(new Date(booking.checkOut || booking.check_out), "MMM dd, yyyy")}
                              </div>
                            )}
                            {booking.bookingReference && (
                              <div className="text-sm text-gray-500">
                                Ref: {booking.bookingReference}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 mb-2">
                            ${booking.totalPrice || booking.total_amount || 0}
                          </div>
                          <Badge className={
                            booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                            booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {booking.status || booking.booking_status || 'pending'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {bookings.length === 0 && (
              <Card className="shadow-lg border-0 p-12 text-center">
                <Hotel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-6">Browse hotels and make your first booking</p>
                <Link to={createPageUrl("Hotels")}>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Hotel className="w-4 h-4 mr-2" />
                    Browse Hotels
                  </Button>
                </Link>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}