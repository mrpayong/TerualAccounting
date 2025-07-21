// "use client";
// import React, { useState } from "react";
// import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { ChevronLeft, ChevronRight, X } from "lucide-react";
// import { format, parseISO, isAfter, isBefore } from "date-fns";
// import { Calendar } from "@/components/ui/calendar";
// import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";
// import { CalendarIcon } from "lucide-react";


// const DisbursementReceiptBook = ({outflows}) => {
//   const [search, setSearch] = useState("");
//   const [filteredData, setFilteredData] = useState(outflows); // Initialize with original data
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: null }); // No sorting by default
//   const [selectedTransaction, setSelectedTransaction] = useState(null);
//   const [filters, setFilters] = useState({ Activity: "", category: "", dateRange: { start: "", end: "" } });
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [dateRange, setDateRange] = useState({ start: "", end: "" }); // State for the date range picker

//   // Handle search
//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearch(value);
//     applyFilters(value, filters);
//   };

//   // Handle sorting
//   const handleSort = (key) => {
//     let direction = "asc";

//     // Toggle between ascending, descending, and no sorting
//     if (sortConfig.key === key) {
//       if (sortConfig.direction === "asc") {
//         direction = "desc";
//       } else if (sortConfig.direction === "desc") {
//         key = null; // Reset sorting
//         direction = null;
//       }
//     }

//     setSortConfig({ key, direction });

//     if (key) {
//       const sortedData = [...filteredData].sort((a, b) => {
//         if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
//         if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
//         return 0;
//       });
//       setFilteredData(sortedData);
//     } else {
//       // Reset to original data when no sorting is applied
//       setFilteredData(outflows);
//     }
//   };

//   // Handle filters
//   const handleFilterChange = (key, value) => {
//     const newFilters = { ...filters, [key]: value === "all" ? "" : value };
//     setFilters(newFilters);
//     applyFilters(search, newFilters);
//   };

//   const applyFilters = (searchValue, filterValues) => {
//     const filtered = outflows.filter((item) => {
//       const matchesSearch =
//         item.description.toLowerCase().includes(searchValue) ||
//         item.date.toLowerCase().includes(searchValue);

//       const matchesActivity = filterValues.Activity
//         ? item.Activity === filterValues.Activity
//         : true;

//       const matchesCategory = filterValues.category
//         ? item.category === filterValues.category
//         : true;

//       const matchesDateRange =
//         filterValues.dateRange.start && filterValues.dateRange.end
//           ? isAfter(parseISO(item.date), parseISO(filterValues.dateRange.start)) &&
//             isBefore(parseISO(item.date), parseISO(filterValues.dateRange.end))
//           : true;

//       return matchesSearch && matchesActivity && matchesCategory && matchesDateRange;
//     });

//     setFilteredData(filtered);
//     setCurrentPage(1); // Reset to the first page when filters are applied
//   };

//   // Handle pagination
//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(Number(e.target.value));
//     setCurrentPage(1); // Reset to the first page when items per page changes
//   };

//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);


//   const uniqueCategories = Array.from(
//     new Set(outflows.map((outflow) => outflow.category))
//   );




//   return (
//     <div className="p-6 bg-white min-h-screen">
//       {/* Header */}
//       <div className="mb-8 bg-gradient-to-r from-gray-50 to-amber-100 p-6 rounded-lg shadow-lg text-center">
//         <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-amber-700">Disbursement Receipt Book</h1>

//       </div>

//       {/* Filters Section */}
//       <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md border border-amber-300">
//   <div className="flex flex-col md:flex-wrap lg:flex-row lg:justify-center items-center gap-4">
//     {/* Search Bar */}
//     <div className="w-full lg:max-w-md">
//       <Input
//         type="text"
//         placeholder="Search"
//         value={search}
//         onChange={handleSearch}
//         className="w-full border-amber-300 focus:ring focus:ring-amber-200"
//       />
//     </div>

//     {/* Filters */}
//     <div className="flex flex-col md:flex-row w-full lg:w-auto gap-4 items-center">
//       {/* Activity Filter */}
//       <Select onValueChange={(value) => handleFilterChange("Activity", value)}>
//         <SelectTrigger className="w-full md:w-40 lg:w-40 border-amber-300 focus:ring focus:ring-amber-200 text-center">
//           {filters.Activity ? filters.Activity : "Activity"}
//         </SelectTrigger>
//         <SelectContent>
//           <SelectItem value="all">All</SelectItem>
//           <SelectItem value="INVESTMENT">Investment</SelectItem>
//           <SelectItem value="OPERATION">Operating</SelectItem>
//           <SelectItem value="FINANCING">Financing</SelectItem>
//         </SelectContent>
//       </Select>

//       {/* Category Filter */}
//       <Select onValueChange={(value) => handleFilterChange("category", value)}>
//         <SelectTrigger className="w-full md:w-40 lg:w-40 border-amber-300 focus:ring focus:ring-amber-200 text-center">
//           {filters.category ? filters.category : "Category"}
//         </SelectTrigger>
//         <SelectContent>
//           <SelectItem value="all">All</SelectItem>
//           <SelectItem value="housing">Housing</SelectItem>
//           <SelectItem value="transportation">Transportation</SelectItem>
//           <SelectItem value="utilities">Utilities</SelectItem>
//           <SelectItem value="entertainment">Entertainment</SelectItem>
//           <SelectItem value="food">Food</SelectItem>
//           <SelectItem value="shopping">Shopping</SelectItem>
//           <SelectItem value="healthcare">Healthcare</SelectItem>
//           <SelectItem value="education">Education</SelectItem>
//           <SelectItem value="personal">Personal</SelectItem>
//           <SelectItem value="travel">Travel</SelectItem>
//           <SelectItem value="insurance">Insurance</SelectItem>
//           <SelectItem value="gifts">Gifts</SelectItem>
//           <SelectItem value="bills">Bills</SelectItem>
//           <SelectItem value="other-expense">Other-expense</SelectItem>
//         </SelectContent>
//       </Select>

//       {/* Date Range Picker */}
//       <div className="flex flex-col md:flex-row w-full lg:w-auto gap-4 items-center">
      
//         <Popover>
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               className="w-full md:w-40 lg:w-40 border-amber-300 focus:ring focus:ring-amber-200 text-center truncate"
//             >
//               <CalendarIcon className="mr-2 h-4 w-4" />
//               {dateRange.start
//                 ? format(parseISO(dateRange.start), "MMM dd, yyyy")
//                 : "From"}
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-auto p-4">
//             <Calendar
//               mode="single"
//               selected={dateRange.start ? parseISO(dateRange.start) : undefined}
//               onSelect={(date) => {
//                 const formattedDate = format(date, "yyyy-MM-dd");
//                 setDateRange((prev) => ({ ...prev, start: formattedDate }));
//                 handleFilterChange("dateRange", { ...dateRange, start: formattedDate });
//               }}
//               initialFocus
//             />
//           </PopoverContent>
//         </Popover>


//         <Popover>
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               className="w-full md:w-40 lg:w-40 border-amber-300 focus:ring focus:ring-amber-200 text-center truncate"
//             >
//               <CalendarIcon className="mr-2 h-4 w-4" />
//               {dateRange.end
//                 ? format(parseISO(dateRange.end), "MMM dd, yyyy")
//                 : "To"}
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-auto p-4">
//             <Calendar
//               mode="single"
//               selected={dateRange.end ? parseISO(dateRange.end) : undefined}
//               onSelect={(date) => {
//                 const formattedDate = format(date, "yyyy-MM-dd");
//                 setDateRange((prev) => ({ ...prev, end: formattedDate }));
//                 handleFilterChange("dateRange", { ...dateRange, end: formattedDate });
//               }}
//               initialFocus
//             />
//           </PopoverContent>
//         </Popover>
//       </div>

//       {/* Clear Filters Button */}
//       {(search || filters.Activity || filters.category || dateRange.start || dateRange.end) && (
//         <div className="flex items-center">
//           {/* Small Screen Button */}
//           <Button
//             variant="outline"
//             className="block md:hidden w-full text-red-600 border-red-300 hover:bg-red-100"
//             onClick={() => {
//               setSearch("");
//               setFilters({ Activity: "", category: "", dateRange: { start: "", end: "" } });
//               setDateRange({ start: "", end: "" });
//               applyFilters("", { Activity: "", category: "", dateRange: { start: "", end: "" } });
//             }}
//           >
//             Clear Filters
//           </Button>

//           {/* Medium and Large Screen Button */}
//           <Button
//             variant="outline"
//             className="hidden md:flex items-center justify-center text-red-600 border-red-300 hover:bg-red-100"
//             onClick={() => {
//               setSearch("");
//               setFilters({ Activity: "", category: "", dateRange: { start: "", end: "" } });
//               setDateRange({ start: "", end: "" });
//               applyFilters("", { Activity: "", category: "", dateRange: { start: "", end: "" } });
//             }}
//           >
//             <X className="h-5 w-5" />
//           </Button>
//         </div>
//       )}
//     </div>
//   </div>
// </div>

//       {/* Table Section */}
//       <div className="bg-white p-6 rounded-lg shadow-md relative">
//         <div className="absolute top-0 left-0 w-full h-full border-t-2 border-l-2 border-amber-300 rounded-lg pointer-events-none"></div>
//         <Table className="w-full">
//           <TableHeader>
//             <TableRow className="bg-amber-100 sticky top-0 z-10">
//               {/* Date Column */}
//               <TableCell
//                 onClick={() => handleSort("date")}
//                 className="cursor-pointer font-semibold text-amber-700 border-b border-gray-200"
//               >
//                 <div className="inline-flex items-center gap-2">
//                   Date
//                   {sortConfig.key === "date" && (
//                     sortConfig.direction === "asc" ? (
//                       <ArrowDownWideNarrow className="h-4 w-4 text-amber-700" />
//                     ) : (
//                       <ArrowUpWideNarrow className="h-4 w-4 text-amber-700" />
//                     )
//                   )}
//                 </div>
//               </TableCell>

//               {/* Description Column */}
//               <TableCell
//                 onClick={() => handleSort("description")}
//                 className="cursor-pointer font-semibold text-amber-700 border-b border-gray-200"
//               >
//                 <div className="inline-flex items-center gap-2">
//                   Description
//                   {sortConfig.key === "description" && (
//                     sortConfig.direction === "asc" ? (
//                       <ArrowDownWideNarrow className="h-4 w-4 text-amber-700" />
//                     ) : (
//                       <ArrowUpWideNarrow className="h-4 w-4 text-amber-700" />
//                     )
//                   )}
//                 </div>
//               </TableCell>



//               {uniqueCategories.length > 0 &&
//                 uniqueCategories.map((category, index) => (
//                   <TableCell
//                     key={index}
//                     // onClick={() => handleSort("date")}
//                     className="cursor-pointer font-semibold text-amber-700 border-b border-gray-200"
//                   >
//                     <div className="inline-flex items-center gap-2">
//                       {category} (CR)
//                     </div>
//                   </TableCell>
//                 ))
//               }

//               {/* Actions Column */}
//               <TableCell className="font-semibold text-amber-700 border-b border-gray-200">
//                 Actions
//               </TableCell>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {paginatedData.length > 0 ? (
//               paginatedData.map((transaction) => (
//                 <TableRow key={transaction.id} className="hover:bg-amber-50">
//                   <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
//                   <TableCell>{transaction.description}</TableCell>
//                   <TableCell>
//                     <Dialog>
//                       <DialogTrigger asChild>
//                         <Button
//                           variant="outline"
//                           className="text-emerald-700 border-emerald-300 hover:bg-emerald-100"
//                           onClick={() => setSelectedTransaction(transaction)}
//                         >
//                           View
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent aria-describedby={`transaction-details-description-${transaction.id}`}>
//                         <DialogHeader>
//                           <DialogTitle className="text-blue-800">Transaction Details</DialogTitle>
//                           {/* Add a unique ID for the description */}
//                           <div
//                             id={`transaction-details-description-${transaction.id}`}
//                             className="text-gray-600 text-sm"
//                           >
//                             Detailed information about the selected transaction is displayed below.
//                           </div>
//                         </DialogHeader>
//                         <div className="space-y-2">
//                           <p>
//                             <strong>Date:</strong>{" "}
//                             {new Date(transaction.date).toLocaleDateString()}
//                           </p>
//                           <p>
//                             <strong>Description:</strong> {transaction.description}
//                           </p>
//                           <p>
//                             <strong>Amount:</strong> ₱{transaction.amount}
//                           </p>
//                           <p>
//                             <strong>Category:</strong> {transaction.category}
//                           </p>
//                           <p>
//                             <strong>Activity:</strong> {transaction.Activity}
//                           </p>
//                         </div>
//                       </DialogContent>
//                     </Dialog>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={3} className="text-center py-6">
//                   <span className="text-gray-500 text-sm md:text-base">
//                     No data matching the filters
//                   </span>
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Pagination Section */}
//       <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-md">
//         <div>
          
//           <Input
//             id="itemsPerPage"
//             type="number"
//             min="1"
//             value={itemsPerPage}
//             onChange={handleItemsPerPageChange}
//             className="w-20 border-amber-300 focus:ring focus:ring-amber-200"
//           />
//           <label htmlFor="itemsPerPage" className="mr-2 font-medium text-amber-700">
//             per page
//           </label>
//         </div>
//         <div className="flex items-center gap-2 text-sm text-amber-700">
//           {/* Previous Button */}
//           <Button
//             variant="outline"
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage((prev) => prev - 1)}
//             className="text-amber-700 border-amber-300 hover:bg-amber-100 px-3 py-1 flex items-center justify-center"
//           >
//             <ChevronLeft
//               className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7"
//             />
//           </Button>

//           {/* Page Indicator */}
//           <span className="font-medium">
//             <span className="hidden sm:inline">Page </span>
//             {currentPage} of {totalPages}
//           </span>

//           {/* Next Button */}
//           <Button
//             variant="outline"
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage((prev) => prev + 1)}
//             className="text-amber-700 border-amber-300 hover:bg-amber-100 px-3 py-1 flex items-center justify-center"
//           >
//             <ChevronRight
//               className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7"
//             />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DisbursementReceiptBook;



























"use client";
import React, { useState, useMemo } from "react";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const getDateString = (date) =>
  date.toISOString().slice(0, 10);

const DisbursementReceiptBook = ({ outflows = [] }) => {
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
    if (!dateRange.start && !dateRange.end) return outflows;

    return outflows.filter((outflow) => {
      const transactionDate = normalizeDate(outflow.date);
      const startDate = dateRange.start ? normalizeDate(dateRange.start) : null;
      const endDate = dateRange.end ? normalizeDate(dateRange.end) : null;

      return (
        (!startDate || transactionDate >= startDate) &&
        (!endDate || transactionDate <= endDate)
      );
    });
  }, [outflows, dateRange]);

  // Calculate total credit for the filtered data
  const totalCredit = useMemo(() => {
    return filteredData.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
  }, [filteredData]);

  // Extract unique categories
  const categories = useMemo(() => {
    return [...new Set(outflows.map((outflow) => outflow.category))];
  }, [outflows]);

  // Calculate total amounts for each category based on the filtered data
  const categoryTotals = useMemo(() => {
    const totals = {};
    categories.forEach((category) => {
      totals[category] = filteredData
        .filter((outflow) => outflow.category === category)
        .reduce((sum, outflow) => sum + (outflow.amount || 0), 0);
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
    router.push(`/account/${outflows[0].accountId}`);
  };





























  // Fallback UI for empty outflows
  if (!outflows || outflows.length === 0) {
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
      <div className="mb-8 bg-gradient-to-r from-gray-50 to-teal-100 p-6 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-teal-300">
          Disbursement Receipt Book
        </h1>
      </div>

      {/* Filters Section */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col lg:flex-row gap-4">
          {/* Date Range Filter */}
          <div className="flex gap-4">
            From
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="w-full lg:w-auto border-teal-300 focus:ring focus:ring-teal-200"
            />
            To
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="w-full lg:w-auto border-teal-300 focus:ring focus:ring-teal-200"
            />
          </div>

          {(dateRange.start || dateRange.end) && (
            <div>
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-2 py-1 lg:px-3 lg:py-1 border border-black text-black bg-white rounded-lg shadow hover:border-red-500 hover:text-red-500 focus:outline-none focus:ring focus:ring-red-300 text-sm lg:text-xs"
              >
                <X className="h-4 w-4 lg:h-3 lg:w-3" /> {/* Icon */}
                <span className="hidden md:inline">Clear</span> {/* Text (hidden on small screens) */}
              </button>
            </div>
            )}
          </div>
          <Button
          variant="outline"
          disabled={backLoad}
          className="border text-black border-black"
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
        
      </div>

      
      
      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* First Table: General Transaction Details */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-lg font-bold mb-4">Transaction Entries</h2>
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-teal-100">
                <TableCell className="font-semibold text-slate-700">Date</TableCell>
                <TableCell className="font-semibold text-slate-700">Description</TableCell>
                <TableCell className="font-semibold text-slate-700">Particular</TableCell>
                <TableCell className="font-semibold text-slate-700 max-w-[130px] w-[130px] truncate overflow-hidden whitespace-nowrap"
                >Reference number</TableCell>
                <TableCell className="font-semibold text-slate-700 max-w-[150px] w-[150px] truncate overflow-hidden whitespace-nowrap"
                >Cash in bank (CR)</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((outflow, index) => (
                <TableRow
                  key={index}
                  className={`hover:bg-white ${index % 2 === 0 ? "bg-teal-300" : "bg-white"}`}
                >
                  <TableCell
                    className="max-w-[120px] w-[120px] truncate overflow-hidden whitespace-nowrap"
                  >{formatDate(outflow.date)}</TableCell>
                  <TableCell
                    className="max-w-[180px] truncate overflow-hidden whitespace-nowrap"
                  >{outflow.description || "N/A"}</TableCell>
                  <TableCell>{outflow.particular || "N/A"}</TableCell>
                  <TableCell>{outflow.refNumber || "N/A"}</TableCell>
                  <TableCell>{formatAmount(outflow.amount) || "0.00"}</TableCell>
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow className="bg-white font-bold">
                <TableCell colSpan={4} className="text-right">
                  Total
                </TableCell>
                <TableCell>{formatAmount(totalCredit)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Second Table: Transaction Categories */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          {/* Table Title */}
          <h2 className="text-lg font-bold">Account Titles</h2>

          {/* Toggle Borders Button */}
          <button
            onClick={() => setShowBorders((prev) => !prev)} // Toggle the state
            className={`px-2 py-1 lg:px-3 lg:py-1 rounded-md shadow text-xs lg:text-sm font-medium focus:outline-none ${
              showBorders
                ? "bg-teal-100 text-black" // Active state
                : "bg-white text-black border-none hover:bg-teal-100" // Inactive state
            }`}
          >
            {showBorders ? "Hide Grid Lines" : "Show Grid Lines"}
          </button>
        </div>



          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-teal-100">
                {categories.map((category) => (
                  <TableCell key={category} className="font-semibold text-slate-700">
                    {category}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Individual Transactions */}
              {filteredData.map((outflow, index) => (
                <TableRow
                  key={index}
                  className={`hover:bg-white border-b border-gray-300 ${
                    index % 2 === 0 ? "bg-teal-300" : "bg-white"
                  }`}
                >
                  {categories.map((category) => (
                    <TableCell key={`${index}-${category}`} className={showBorders ? "border-r-2 border-gray-300" : ""}>
                      {outflow.category === category ? `${formatAmount(outflow.amount) || "0.00"}` : ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {/* Total Row for Categories */}
              <TableRow className="bg-whtie font-bold border-t border-gray-300">
                {categories.map((category) => (
                  <TableCell key={category}>
                    {formatAmount(categoryTotals[category]) || "0.00"}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DisbursementReceiptBook;
