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
  CartesianGrid,
} from 'recharts'


const SysDashboardSectionTwo = ({ activities }) => {

   const chartData = Array.isArray(activities?.data) ? activities.data : [];

  return (
    <div className="flex-auto h-full w-full">
      {/* Area Chart Card */}
      <Card className="w-full">
        <CardHeader className="pb-0">
          <CardTitle className="text-bold text-2xl">System Activity Overview</CardTitle>
          <CardDescription className="p-0">
            Overview of activities of the users.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[360px] overflow-y-visible">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] md:min-w-[700px] lg:min-w-0">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 14 }}
                    formatter={(value) => [`${value}`, 'Logs']}
                  />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="none"
                    fill="#8b5cf6"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SysDashboardSectionTwo
