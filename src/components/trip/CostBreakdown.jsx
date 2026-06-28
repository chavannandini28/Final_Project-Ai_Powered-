import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plane, Hotel, Utensils, Activity, ShoppingBag, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function CostBreakdown({ data }) {
  if (!data || !data.total) {
    return (
      <Card className="shadow-lg border-0 p-12 text-center">
        <p className="text-gray-600">Cost breakdown not available</p>
      </Card>
    );
  }

  const categories = [
    {
      icon: Plane,
      label: "Transportation",
      amount: data.transportation?.total || 0,
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      icon: Hotel,
      label: "Accommodation",
      amount: data.accommodation?.total || 0,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      icon: Utensils,
      label: "Food & Dining",
      amount: data.food?.total || 0,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    },
    {
      icon: Activity,
      label: "Activities",
      amount: data.activities || 0,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Total Cost Card */}
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-lg text-blue-100 mb-2">Total Estimated Cost</div>
            <div className="text-5xl font-bold mb-4">${data.total.toFixed(2)}</div>
            <div className="text-sm text-blue-200">
              Complete trip budget breakdown
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const percentage = (category.amount / data.total) * 100;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{category.label}</div>
                      {category.details && (
                        <div className="text-xs text-gray-500">{category.details}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">${category.amount.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </motion.div>
            );
          })}
        </CardContent>
      </Card>


    </div>
  );
}