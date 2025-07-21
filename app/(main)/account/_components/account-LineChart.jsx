"use client";

import React, { useState, useMemo } from "react";
import { LineChart } from "@mui/x-charts";
import { TextField } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

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









const AccountLineChart = ({ transactions }) => {
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

    // Filter transactions within the selected date range
    const filtered = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        t.date && // Ensure the date field exists
        !isNaN(transactionDate) && // Ensure the date is valid
        (!from || transactionDate >= from) &&
        (!to || transactionDate <= to)
      );
    });

    // Group transactions by date and calculate totals for income and expense
    const grouped = filtered.reduce((acc, transaction) => {
      const date = transaction.date
        ? formatDate(new Date(transaction.date)) // Use custom date formatter
        : "Unknown"; // Fallback for missing dates

      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }

      if (transaction.type === "INCOME") {
        acc[date].income += transaction.amount;
      } else if (transaction.type === "EXPENSE") {
        acc[date].expense += transaction.amount;
      }
      return acc;
    }, {});

    // Convert grouped data to an array and sort by date
    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions, dateRange]);










  
  return (
    <div className="space-y-6">
      {/* Date Pickers */}
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="From"
            value={dateRange.from}
            onChange={(date) => handleDateChange("from", date)}
            // renderInput={(params) => (
            //   <TextField {...params} className="w-full sm:w-[200px]" />
            // )}
            slotProps={{ textField: { variant: 'outlined' } }}
          />
          <DatePicker
            label="To"
            value={dateRange.to}
            onChange={(date) => handleDateChange("to", date)}
            // renderInput={(params) => (
            //   <TextField {...params} className="w-full sm:w-[200px]" />
            // )}
            slotProps={{ textField: { variant: 'outlined' } }}
          />
        </LocalizationProvider>
      </div>

      {/* Line Chart */}
      <div className="h-[300px] sm:h-[400px] md:h-[300px] lg:h-[400px]">
        {filteredData.length > 0 ? (
          <LineChart
            xAxis={[
              {
                dataKey: "date",
                scaleType: "band",
                label: "Date",
              },
            ]}
            series={[
              {
                dataKey: "income",
                label: "Income",
                color: "#22c55e",
              },
              {
                dataKey: "expense",
                label: "Expense",
                color: "#ef4444",
              },
            ]}
            height={300}
            dataset={filteredData}
            grid={{ horizontal: true, vertical: true }}
          />
        ) : (
          <p className="text-center text-muted-foreground">
            No data available for the selected date range.
          </p>
        )}
      </div>
    </div>
  );
};

export default AccountLineChart;
