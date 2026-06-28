import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, DollarSign, Utensils, Navigation, Hotel, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function TripItinerary({ data }) {
  return (
    <div className="space-y-6">
      {data.daily_itinerary?.map((day, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="shadow-lg border-0 overflow-hidden">
            {/* Day Location Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-3xl font-bold">Day {day.day}</h3>
                    {day.distance_from_previous && index > 0 && (
                      <Badge className="bg-white/20 text-white border-0">
                        <Navigation className="w-3 h-3 mr-1" />
                        {day.distance_from_previous} km • {day.travel_time}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-blue-100 mb-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-xl font-semibold">{day.city_location}</span>
                  </div>
                  {day.why_visit && (
                    <p className="text-blue-100 text-sm">{day.why_visit}</p>
                  )}
                </div>
                <Badge className="bg-white text-blue-600 px-4 py-2">
                  {day.activities?.length || 0} Activities
                </Badge>
              </div>
              
              {index < data.daily_itinerary.length - 1 && (
                <div className="flex items-center gap-2 text-blue-200 text-sm mt-3">
                  <ArrowRight className="w-4 h-4" />
                  <span>Next: {data.daily_itinerary[index + 1].city_location}</span>
                </div>
              )}
            </div>

            <CardContent className="p-6">
              <p className="text-lg text-gray-700 mb-6 font-medium">{day.title}</p>

              {/* Activities */}
              <div className="space-y-4 mb-6">
                {day.activities?.map((activity, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-all border border-blue-100">
                    <div className="flex flex-col items-center min-w-[80px]">
                      <Clock className="w-5 h-5 text-blue-600 mb-1" />
                      <span className="text-sm font-semibold text-blue-900">{activity.time}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg">{activity.activity}</h4>
                          <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">{activity.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 font-semibold">
                          <DollarSign className="w-4 h-4" />
                          <span>{activity.estimated_cost}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Accommodation */}
              {day.accommodation && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Hotel className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Overnight Stay</h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{day.accommodation.hotel_name}</div>
                      <div className="text-sm text-gray-600">{day.accommodation.area}</div>
                    </div>
                    <div className="text-green-600 font-semibold">${day.accommodation.estimated_cost}/night</div>
                  </div>
                </div>
              )}

              {/* Meals */}
              {day.meals && day.meals.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-orange-600" />
                    Recommended Meals
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    {day.meals.map((meal, idx) => (
                      <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="font-semibold text-orange-900 capitalize mb-1">{meal.meal_type}</div>
                        <div className="text-sm text-gray-700 mb-2">{meal.recommendation}</div>
                        <div className="text-green-600 font-semibold text-sm">${meal.estimated_cost}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}