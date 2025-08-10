"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide } from "lucide-react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

function formatToPhilippinesTime(isoString) {
  const date = new Date(isoString);
  const time = date.toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateStr = date.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  return `${time} ${dateStr}`;
}

const UserSessionTable = ({ sessions = {} }) => {
  // State
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [sortState, setSortState] = useState("asc"); // "asc" | "desc" | "none"
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [fromDateRaw, setFromDateRaw] = useState(null);
  const [toDateRaw, setToDateRaw] = useState(null);

  const activityArray = sessions.data ?? [];

  // Derived: unique actions for filter
  const actionOptions = useMemo(() => {
    const actions = Array.from(new Set(activityArray.map((a) => a.action))).sort();
    return ["all", ...actions];
  }, [activityArray]);

  // Filtering
  const filtered = useMemo(() => {
    let logs = activityArray;
    if (actionFilter !== "all") logs = logs.filter((a) => a.action === actionFilter);
    if (search)
      logs = logs.filter(
        (a) =>
          a.user?.Fname?.toLowerCase().includes(search.toLowerCase()) ||
          a.user?.Lname?.toLowerCase().includes(search.toLowerCase()) ||
          a.user?.email?.toLowerCase().includes(search.toLowerCase())
      );
    if (fromDateRaw) {
      const from = new Date(fromDateRaw);
      logs = logs.filter((a) => new Date(a.createdAt) >= from);
    }
    if (toDateRaw) {
      const to = new Date(toDateRaw);
      to.setHours(23, 59, 59, 999);
      logs = logs.filter((a) => new Date(a.createdAt) <= to);
    }
    return logs;
  }, [activityArray, actionFilter, search, fromDateRaw, toDateRaw]);

  // Sorting (only on Occurred On column)
  const sorted = useMemo(() => {
    if (sortState === "none") return [...filtered];
    return [...filtered].sort((a, b) => {
      const vA = new Date(a.meta?.localizedTimestamp || a.createdAt);
      const vB = new Date(b.meta?.localizedTimestamp || b.createdAt);
      if (sortState === "asc") return vA - vB;
      if (sortState === "desc") return vB - vA;
      return 0;
    });
  }, [filtered, sortState]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated = useMemo(
    () => sorted.slice((currentPage - 1) * perPage, currentPage * perPage),
    [sorted, currentPage, perPage]
  );

  // Reset page if filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, actionFilter, perPage]);

  // Sorting handler for Occurred On
  const handleSort = () => {
    setSortState((prev) => {
      if (prev === "asc") return "desc";
      if (prev === "desc") return "none";
      return "asc";
    });
  };

  // Badge rendering
  function renderSessionBadge(action) {
    switch (action) {
      case "SESSION-CREATED":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-400" variant="outline">
            Logged In
          </Badge>
        );
      case "SESSION-REMOVED":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-400" variant="outline">
            Logged Out
          </Badge>
        );
      case "EMAIL-CREATED":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-400" variant="outline">
            OTP Requested
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-400">
            {action || "Unknown Action"}
          </Badge>
        );
    }
  }

  const actionDisplayNames = {
    "SESSION-CREATED": "Logged In",
    "SESSION-REMOVED": "Logged Out",
    "EMAIL-CREATED": "OTP Requested",
    all: "All Actions",
  };

  const handleClear = () => {
    setSearch("");
    setActionFilter("all");
    setFromDateRaw(null);
    setToDateRaw(null);
  };

  const anyFilterActive =
    search !== "" ||
    actionFilter !== "all" ||
    fromDateRaw !== null ||
    toDateRaw !== null;









  
  // Responsive Table
  return (
    <div className="w-full py-4">
      <div className="flex flex-col lg:flex-row lg:items-end md:justify-between gap-4 mb-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center w-full">
          <div className="flex flex-col md:flex-row gap-1">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Action" />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {actionDisplayNames[action] || action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-full md:w-[240px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <Input
                className="pl-10 w-full border border-gray-300"
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From"
                timezone='Asia/Manila'
                value={fromDateRaw}
                onChange={setFromDateRaw}
                slotProps={{
                  textField: {
                    size: 'small',
                    className: 'w-full sm:w-32 md:w-40 bg-white border border-gray-300 rounded px-2 py-1 text-xs',
                    inputProps: { placeholder: 'Start date' }
                  }
                }}
                disableFuture={false}
                maxDate={toDateRaw}
                format="yyyy-MM-dd"/>
              <DatePicker
                label="To"
                timezone='Asia/Manila'
                value={toDateRaw}
                onChange={setToDateRaw}
                minDate={fromDateRaw}
                slotProps={{
                  textField: {
                    size: 'small',
                    className: 'w-full sm:w-32 md:w-40 bg-white border border-gray-300 rounded px-2 py-1 text-xs',
                    inputProps: { placeholder: 'Start date' }
                  }
                }}
                disableFuture={false}
                format="yyyy-MM-dd"/>
            </LocalizationProvider>
          </div>
        </div>

        <div className="flex gap-2 items-center ">
          {anyFilterActive && (
            <Button className="
              bg-white border border-rose-500
              text-rose-500 hover:bg-rose-500
              hover:text-white hover:border-0
              hover:shadow-md hover:shadow-rose-500/25"
              size="sm"
              onClick={handleClear}
            >
              Clear Filter
            </Button>
          )}
          <Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-100 text-gray-800 font-semibold">
                Activity
              </TableHead>
              <TableHead
                className="bg-gray-100 text-center text-gray-800 font-semibold cursor-pointer select-none"
                onClick={handleSort}
              >
                <span className="flex items-center">
                  Occurred On
                  {sortState === "asc" && (
                    <ArrowUpWideNarrow className="ml-1 text-blue-600" size={18} />
                  )}
                  {sortState === "desc" && (
                    <ArrowDownNarrowWide className="ml-1 text-blue-600" size={18} />
                  )}
                  {sortState === "none" && (
                    <ChevronsUpDown className="ml-1 text-gray-400" size={18} />
                  )}
                </span>
              </TableHead>
              <TableHead className="bg-gray-100 text-gray-800 font-semibold">
                User
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  No activity logs found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((log) => (
                <TableRow key={log.id} className="hover:bg-gray-50">
                  <TableCell>
                    {renderSessionBadge(log.action)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {log.meta?.localizedTimestamp
                      ? log.meta.localizedTimestamp
                      : formatToPhilippinesTime(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    {log.user
                      ? `${log.user.Fname || ""} ${log.user.Lname || ""} (${log.user.email})`
                      : log.userId}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            className="rounded"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 2
            )
            .map((page, idx, arr) => (
              <React.Fragment key={page}>
                {idx > 0 && page - arr[idx - 1] > 1 && (
                  <span className="px-1 text-gray-400">...</span>
                )}
                <Button
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  className="rounded"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              </React.Fragment>
            ))}
          <Button
            variant="outline"
            size="sm"
            className="rounded"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserSessionTable;