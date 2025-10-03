import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon, color, subtitle, textColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:border-blue-200 hover-lift">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
              <p className={`text-3xl font-bold mb-1 ${textColor || 'text-gray-900'}`}>{value}</p>
              {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-xl ${color || 'bg-gray-100'} flex-shrink-0`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}