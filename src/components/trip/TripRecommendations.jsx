import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Package, Utensils, Shield, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function TripRecommendations({ data }) {
  if (!data) {
    return (
      <Card className="shadow-lg border-0 p-12 text-center">
        <p className="text-gray-600">Recommendations not available</p>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">

      {/* Packing List */}
      {data.packing_list && data.packing_list.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg border-0 h-full">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Packing List
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {data.packing_list.map((item, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="px-3 py-2 text-sm border-purple-200 hover:bg-purple-50"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Food Recommendations */}
      {data.food_recommendations && data.food_recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Local Food Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {data.food_recommendations.map((food, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200"
                  >
                    <p className="text-sm text-gray-700">{typeof food === 'string' ? food : food.dish || food}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Safety Tips */}
      {data.safety_tips && data.safety_tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg border-0 h-full">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Safety Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {data.safety_tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Hidden Gems */}
      {data.hidden_gems && data.hidden_gems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-lg border-0 h-full">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Hidden Gems
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {data.hidden_gems.map((gem, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200"
                  >
                    <p className="text-sm text-gray-700">{typeof gem === 'string' ? gem : gem.name || gem}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Travel Modes */}
      {data.travel_modes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="md:col-span-2"
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <CardTitle>Travel Mode Options</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                {data.travel_modes.map((mode, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200"
                  >
                    <div className="font-bold text-lg text-gray-900 mb-2">{mode.mode}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-900">{mode.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-medium text-gray-900">${mode.cost}</span>
                      </div>
                      <div className="mt-3 p-2 bg-white rounded text-xs text-indigo-700">
                        {mode.recommendation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}