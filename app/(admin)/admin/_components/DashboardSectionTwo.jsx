'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts'
import { Zen_Kaku_Gothic_Antique } from 'next/font/google'

// Tailwind color palette for pie chart
const PIE_COLORS = [
  '#60a5fa', // blue-400
  '#34d399', // green-400
  '#fbbf24', // yellow-400
  '#f87171', // red-400
  '#a78bfa', // purple-400
  '#f472b6', // pink-400
  '#38bdf8', // sky-400
  '#e879f9', 
  '#818cf8'
]

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})


const DashboardSectionTwo = ({ lineChartData, pieChartData }) => {

  const numberFormatter = new Intl.NumberFormat('en-US');

  function formatAccountType(type) {
    switch (type) {
      case "INCORPORATION":
        return "Incorporation";
      case "PARTNERSHIP":
        return "Partnership";
      case "COOPERATIVE":
        return "Cooperative";
      case "ASSOCIATION":
        return "Association";
      case "CORPORATION":
        return "Corporation";
      case "FREELANCE":
        return "Freelance";
      case "PROFESSIONAL":
        return "Professional";
      case "SOLEPROPRIETORSHIP":
        return "Sole Proprietorship";
      case "OTHERS":
        return "Others";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }
  }


  return (
    <div className={`${fontZenKaku.className} grid grid-cols-1 md:grid-cols-2 gap-6 w-full`}>
      {/* Area Chart Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className='font-bold text-xl tracking-wide'>Client Activity Trend</CardTitle>
          <CardDescription className="font-normal p-0">
            Count of transactions of each client of the firm.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[340px]">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] md:min-w-[700px] lg:min-w-0">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={lineChartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fontWeight: 500 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={value => numberFormatter.format(value)}
                  />
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded shadow text-base font-medium">
                            <div>{label}</div>
                            <div className="text-blue-600">
                              Transactions : {numberFormatter.format(payload[0].value)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="transactions"
                    stroke="#2563eb"
                    fill="#60a5fa"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className='font-bold text-xl tracking-wide'>Client Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-6 py-0 h-[320px] flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
              >
                {pieChartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{ fontSize: 13, fontWeight: 500  }}
                formatter={formatAccountType}
              />
              <RechartsTooltip
                content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  const { type, count } = payload[0].payload;
                  return (
                    <div className="bg-white p-2 rounded shadow text-sm font-medium">
                      {`${formatAccountType(type)}: ${count} account${count > 1 ? 's' : ''}`}
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="text-sm flex justify-center text-gray-500 font-normal">
          Clients of the firm based on the type of account. 
        </CardFooter>
      </Card>
    </div>
  )
}

export default DashboardSectionTwo
