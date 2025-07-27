"use client";

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TextField } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zen_Kaku_Gothic_Antique } from "next/font/google";

// Custom date formatter
const formatDate = (date) => {
  const options = { month: "short", day: "2-digit" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

// Helper to get the start of the day
const getStartOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// Helper to get the end of the day
const getEndOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

// Helper to subtract days from a date
const subtractDays = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - days);
  return newDate;
};

// Generate an array of dates between two dates
const generateDateRange = (from, to) => {
  const dates = [];
  let currentDate = new Date(from);
  while (currentDate <= to) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700"],
})





const AccountChart = ({ transactions}) => {
  // Default to last 30 days
  const [dateRange, setDateRange] = useState({
    from: getStartOfDay(subtractDays(new Date(), 30)),
    to: getEndOfDay(new Date()),
  });

  // Handle date changes
  const handleDateChange = (key, value) => {
    setDateRange((prev) => ({
      ...prev,
      [key]: value
        ? key === "from"
          ? getStartOfDay(value)
          : getEndOfDay(value)
        : null,
    }));
  };

  // Filter and group transactions by date range
  const filteredData = useMemo(() => {
    const { from, to } = dateRange;

    // Generate all dates in the range
    const allDates = generateDateRange(from, to).map((date) => ({
      date: formatDate(date),
      income: 0,
      expense: 0,
    }));

    // Map transactions to the corresponding dates
    transactions.forEach((transaction) => {
      const transactionDate = formatDate(new Date(transaction.date));
      const dateEntry = allDates.find(
        (entry) => entry.date === transactionDate
      );
      if (dateEntry) {
        if (transaction.type === "INCOME") {
          dateEntry.income += transaction.amount;
        } else if (transaction.type === "EXPENSE") {
          dateEntry.expense += transaction.amount;
        }
      }
    });

    return allDates;
  }, [transactions, dateRange]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  // Format amounts with commas and peso sign
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const chartWidth = useMemo(() => {
    const minWidth = 600;
    const pxPerPoint = 80;
    return Math.max(filteredData.length * pxPerPoint, minWidth);
  }, [filteredData.length]);





  return (
    <>
    <Card>
      <CardHeader className="flex  flex-col sm:flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className={`${fontZenKaku.className} text-3xl font-bold text-gray-800 tracking-wide`}>
            Transaction Overview
        </CardTitle>
        <div className="flex py-2 flex-col sm:flex-row gap-2 justify-between items-center">
         <LocalizationProvider dateAdapter={AdapterDateFns}>
           <DatePicker
              label="From"
              value={dateRange.from}
              timezone="Asia/Manila"
              onChange={(date) => handleDateChange("from", date)}
              slotProps={{
                textField: {
                  className: "w-full sm:w-[200px]",
                  variant: "outlined", // optional, for MUI style
                },
              }}
            />
            <DatePicker
              label="To"
              value={dateRange.to}
              timezone="Asia/Manila"
              onChange={(date) => handleDateChange("to", date)}
              slotProps={{
                textField: {
                  className: "w-full sm:w-[200px]",
                  variant: "outlined", // optional, for MUI style
                },
              }}
            />
          </LocalizationProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-around mb-6 text-sm">
          <div className="text-center">
            <p className={`${fontZenKaku.className} text-base font-normal text-muted-foreground`}>
                <b>Total Income</b>
            </p>
            <p className={`${fontZenKaku.className} tracking-wide text-xl md:text-2xl font-medium text-green-500`}>
              {formatAmount(totals.income)}
            </p>
          </div>
          <div className="text-center">
            <p className={`${fontZenKaku.className} text-base font-normal text-muted-foreground`}>
              <b>Total Expenses</b>
            </p>
            <p className={`${fontZenKaku.className} tracking-wide text-xl md:text-2xl font-medium text-red-500`}>
              {formatAmount(totals.expense)}
            </p>
          </div>
          <div className="text-center">
            <p className={`${fontZenKaku.className} text-base font-normal text-muted-foreground`}>
             <b>Net Change</b>
            </p>
            <p
              className={`${fontZenKaku.className} tracking-wide text-xl md:text-2xl font-medium 
              ${
                totals.income - totals.expense >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {formatAmount(totals.income - totals.expense)}
            </p>
          </div>
        </div>



        <div className="overflow-x-auto w-full">
          <div 
          style={{ minWidth: chartWidth }}>
        {filteredData.length > 0 && transactions.length > 0 ? (
          <ResponsiveContainer
            // width={filteredData.length * 50 } // Dynamic width based on the number of dates
            width="100%"
            height={480}
          >
            <LineChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }} // Adjusted margins
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ 
                  fontSize: 12, 
                  fontFamily: fontZenKaku.style.fontFamily, 
                  fontWeight: "500"
                }} // Smaller font size for X-axis labels
                interval={0} // Show all dates
                angle={-45} // Rotate labels for better readability
                textAnchor="end"
              />
              <YAxis
                tickFormatter={(value) => formatAmount(value)}
                tick={{ 
                  fontFamily: fontZenKaku.style.fontFamily,
                  fontSize: 12,
                  fontWeight: "500"
                }} // Smaller font size for Y-axis labels
              />
              <Tooltip
                formatter={(value) => formatAmount(value)}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  fontFamily: fontZenKaku.style.fontFamily,
                  fontSize: "18px",
                  fontWeight:"500",
                  lineHeight:"1"
                }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                name="Income"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                name="Expense"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className={`${fontZenKaku.className} font-normal text-base text-start lg:text-center text-muted-foreground`}>
            No data available.
          </p>
        )}
        </div>
      </div>
        
      </CardContent>
      </Card>
    </>
  );
};

export default AccountChart;
