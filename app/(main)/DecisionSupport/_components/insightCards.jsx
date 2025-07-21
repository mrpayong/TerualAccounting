"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Shadcn Card components
import Box from "@mui/material/Box";
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from "@mui/x-charts/Gauge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Pin } from "lucide-react";

function GaugePointer() {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();

  if (valueAngle === null) {
    // No value to display
    return null;
  }

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="red" />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke="red"
        strokeWidth={3}
      />
    </g>
  );
}

const InsightCards = () => {
  // Sample data for the bar chart
  const barChartData = [
    { category: "Admin", Low: 5, Medium: 10, High: 3 },
    { category: "Finance", Low: 8, Medium: 12, High: 7 },
    { category: "Operations", Low: 4, Medium: 6, High: 5 },
  ];

  return (
    <div className="p-6">
      {/* Grid container for cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Gauge for Urgency */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Urgency Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Box className="flex flex-col items-center">
              {/* Gauge Component */}
              <GaugeContainer
                width={200}
                height={200}
                startAngle={-90}
                endAngle={90}
                value={30} // Example value for Medium Priority
              >
                {/* Green Section (Low Priority) */}
                <GaugeReferenceArc
                  startangle={-90}
                  endangle={-30}
                  color="green"
                  thickness={10}
                />
                {/* Yellow Section (Medium Priority) */}
                <GaugeReferenceArc
                  startangle={-30}
                  endangle={30}
                  color="yellow"
                  thickness={10}
                />
                {/* Red Section (High Priority) */}
                <GaugeReferenceArc
                  startangle={30}
                  endangle={90}
                  color="red"
                  thickness={10}
                />
                {/* Value Arc */}
                <GaugeValueArc />
                {/* Pointer */}
                <GaugePointer />
              </GaugeContainer>
              <p className="mt-4 text-gray-600 text-sm sm:text-base">
                Current Priority: <span className="font-bold">Medium</span>
              </p>
            </Box>
          </CardContent>
        </Card>

        {/* Card 2: Bar Chart for Task Urgency */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Task Urgency Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <Box className="flex flex-col items-center w-full">
              {/* Bar Chart */}
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={barChartData}
                  layout="vertical" // Horizontal bars
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Low" stackId="a" fill="green" />
                  <Bar dataKey="Medium" stackId="a" fill="yellow" />
                  <Bar dataKey="High" stackId="a" fill="red" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Card 3: AI Recommendations */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-bold">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-y-2">
            
              
                <span className="font-medium flex flex-row gap-x-2"><Pin/> Prioritize BIR Form 1701Q due in 5 days</span> 
              
              
                <span className="font-medium flex flex-row gap-x-2"><Pin/> Schedule client meeting with XYZ Corp soon</span> 
              
              
                <span className="font-medium flex flex-row gap-x-2"><Pin/> Follow up on pending documents from ABC Co.</span> 
              
            
            <div className="mt-4">
              <p className="font-semibold text-gray-700">Today's AI Insight:</p>
              <div className="mt-2 p-4 bg-blue-50 text-blue-800 rounded-md">
                Based on deadline analysis, prioritize Quarterly Income Tax Return preparation this week to avoid compliance issues with BIR.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsightCards;