"use client";
import React, { useState, useMemo } from "react";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Zen_Kaku_Gothic_Antique } from "next/font/google";

const getDateString = (date) =>
  date.toISOString().slice(0, 10);

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})


const CashReceiptBook = ({ inflows = [] }) => {
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setDate(today.getDate() - 30);  

  // State for date range filtering
  const [dateRange, setDateRange] = useState({
    start: getDateString(lastMonth),
    end: getDateString(today),
  });
  const [showBorders, setShowBorders] = useState(false);
  // Normalize date to remove time component
  const normalizeDate = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0); // Set time to 00:00:00
    return normalized;
  };



  // Filtered data based on the date range
  const filteredData = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return inflows;

    return inflows.filter((inflow) => {
      const transactionDate = normalizeDate(inflow.date);
      const startDate = dateRange.start ? normalizeDate(dateRange.start) : null;
      const endDate = dateRange.end ? normalizeDate(dateRange.end) : null;

      return (
        (!startDate || transactionDate >= startDate) &&
        (!endDate || transactionDate <= endDate)
      );
    });
  }, [inflows, dateRange]);

  // Calculate total credit for the filtered data
  const totalCredit = useMemo(() => {
    return filteredData.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
  }, [filteredData]);

  // Extract unique categories
  const categories = useMemo(() => {
    return [...new Set(inflows.map((inflow) => inflow.category))];
  }, [inflows]);

  // Calculate total amounts for each category based on the filtered data
  const categoryTotals = useMemo(() => {
    const totals = {};
    categories.forEach((category) => {
      totals[category] = filteredData
        .filter((inflow) => inflow.category === category)
        .reduce((sum, inflow) => sum + (inflow.amount || 0), 0);
    });
    return totals;
  }, [categories, filteredData]);

  const resetFilters = () => {
    setDateRange({ start: "", end: "" }); // Reset date range
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString); // Parse the date string
    const utcYear = date.getUTCFullYear();
    const utcMonth = date.getUTCMonth(); // Month is zero-based
    const utcDay = date.getUTCDate();
  
    // Format the date as "Month Day, Year"
    return new Date(Date.UTC(utcYear, utcMonth, utcDay)).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAmount = (amount) => {
      return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      }).format(amount);
  };

  const router = useRouter();

  const [backLoad, setBackLoad] = useState(false)

  const handleBackLoad = () => {
    setBackLoad(true);
    router.push(`/account/${inflows[0].accountId}`);
  };




























  if (!inflows || inflows.length === 0) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <h1 className="text-4xl font-bold text-center text-gray-500">
          No transactions available.
        </h1>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-end items-end mb-3">
        <Button
          variant="outline"
          disabled={backLoad}
          className={`${fontZenKaku.className} border text-black text-xs lg:!text-base border-black font-medium `}
          onClick={handleBackLoad}>
          {backLoad 
            ? (<>
              <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
              Back
              </>) 
            : "Back"
          }
        </Button>
      </div>
      <div className="mb-8 bg-gradient-to-r from-gray-50 to-green-100 p-6 rounded-lg shadow-lg text-center">
        <h1 className={`${fontZenKaku.className} text-4xl sm:text-5xl lg:text-6xl font-black text-green-500`}>
          Cash Receipt Book
        </h1>
      </div>

      {/* Filters Section */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md">
        <div className={`${fontZenKaku.className} flex flex-row items-center justify-around`}>
          <div className="flex flex-col items-center lg:flex-row gap-4">
            {/* Date Range Filter */}
            
            <div className="flex md:flex-row flex-col gap-4 font-medium text-base">
              <div className="flex flex-row gap-5 items-center">
              <label>From</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                className="w-full lg:w-auto border-green-300 focus:ring focus:ring-green-200"
              />
              </div>
              <div className="flex flex-row gap-5 items-center">
              <label>To</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                className="w-full lg:w-auto border-green-300 focus:ring focus:ring-green-200"
              />
              </div>
            </div>

            {(dateRange.start || dateRange.end) && (
              <div>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-2 py-1 
                  lg:px-3 lg:py-1 border border-black text-black 
                  bg-white rounded-lg shadow hover:border-red-500 
                  hover:text-red-500 focus:outline-none focus:ring 
                  focus:ring-red-300 text-sm lg:text-xs font-medium tracking-wide"
                >
                  <X className="h-4 w-4 lg:h-3 lg:w-3" /> {/* Icon */}
                  <span className="hidden md:inline">Clear</span> {/* Text (hidden on small screens) */}
                </button>
              </div>
            )}
          </div>
     
        </div>
      </div>

      
      
      {/* Tables Section */}
      <div className="w-full overflow-x-auto p-2 bg-slate-600/25 backdrop-blur-lg rounded-lg border border-gray-500">
        <div className="grid grid-cols-2 gap-3 min-w-[700px]">
          {/* First Table: General Transaction Details */}
          <div className={`${fontZenKaku.className} bg-white p-6 rounded-lg shadow-md overflow-x-auto`}>
            <h2 className="text-xl font-bold mb-4">Transaction Entries</h2>
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-lime-200">
                  <TableCell className="font-medium !text-base text-emerald-700">Date</TableCell>
                  <TableCell className="font-medium !text-base text-emerald-700">Description</TableCell>
                  <TableCell className="font-medium !text-base text-emerald-700">Particular</TableCell>
                  <TableCell className="font-medium !text-base text-emerald-700 whitespace-nowrap">Reference number</TableCell>
                  <TableCell className="font-medium !text-base text-emerald-700 whitespace-nowrap">Cash in bank (DB)</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="font-medium !text-base">
                {filteredData.map((inflow, index) => (
                  <TableRow
                    key={index}
                    className={`hover:bg-amber-50 ${index % 2 === 0 ? "bg-green-400" : "bg-white"}`}
                  >
                    <TableCell className="max-w-[120px] truncate overflow-hidden whitespace-nowrap">
                      <span title={formatDate(inflow.date) || "N/A"}>
                      {formatDate(inflow.date)}
                      </span>
                    </TableCell>
                    <TableCell
                      className="max-w-[180px] truncate overflow-hidden whitespace-nowrap">
                        <span title={inflow.description || "N/A"}>
                        {inflow.description || "N/A"}</span>
                        </TableCell>
                    <TableCell>{inflow.particular || "N/A"}</TableCell>
                    <TableCell>{inflow.refNumber || "N/A"}</TableCell>
                    <TableCell className="tracking-wide">{formatAmount(inflow.amount) || "0.00"}</TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                <TableRow className="bg-amber-50">
                  <TableCell colSpan={4} className="text-right font-[600]">
                    Total
                  </TableCell>
                  <TableCell className="font-[580] tracking-wide">{formatAmount(totalCredit)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Second Table: Transaction Categories */}
          <div className={`${fontZenKaku.className} bg-white p-6 rounded-lg shadow-md overflow-x-auto`}>
            <div className="flex justify-between items-center mb-4">
              {/* Table Title */}
              <h2 className="text-xl font-bold">Account Titles</h2>

              {/* Toggle Borders Button */}
              <button
                onClick={() => setShowBorders((prev) => !prev)} // Toggle the state
                className={`px-2 py-1 lg:px-3 lg:py-1 rounded-md shadow text-sm lg:text-base font-medium focus:outline-none ${
                  showBorders
                    ? "bg-lime-200 text-black" // Active state
                    : "bg-white text-black border-none hover:bg-lime-200" // Inactive state
                }`}
              >
                {showBorders ? "Hide Grid Lines" : "Show Grid Lines"}
              </button>
            </div>
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-lime-200">
                  {categories.map((category) => (
                    <TableCell 
                      key={category} 
                      className="font-medium text-base text-emerald-700 max-w-[120px] w-[120px] truncate overflow-hidden whitespace-nowrap">
                      {category}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="font-medium !text-base">
                {/* Individual Transactions */}
                {filteredData.map((inflow, index) => (
                  <TableRow
                    key={index}
                    className={`hover:bg-white border-b border-gray-300 ${
                      index % 2 === 0 ? "bg-green-400" : "bg-white"
                    }`}
                  >
                    {categories.map((category) => (
                      <TableCell key={`${index}-${category}`} className={showBorders ? "border-r-2 border-gray-300" : ""}>
                        {inflow.category === category ? `${formatAmount(inflow.amount) || "0.00"}` : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* Total Row for Categories */}
                <TableRow className="bg-white border-t border-gray-300 font-[600]">
                  {categories.map((category) => (
                    <TableCell key={category} className="font-[580] tracking-wide">
                      {formatAmount(categoryTotals[category]) || "0.00"}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashReceiptBook;
