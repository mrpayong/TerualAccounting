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
import { Search, ChevronsUpDown, ArrowUpWideNarrow, ArrowDownNarrowWide, X } from "lucide-react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Zen_Kaku_Gothic_Antique } from "next/font/google";

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

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})

const UserSessionTable = ({ sessions = {}, unauth }) => {
  // State
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [sortState, setSortState] = useState("asc"); // "asc" | "desc" | "none"
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [fromDateRaw, setFromDateRaw] = useState(null);
  const [toDateRaw, setToDateRaw] = useState(null);

  const activityArray = sessions.data ?? [];

  const [unauthPage, setUnauthPage] = useState(1);
  const [unauthPerPage, setUnauthPerPage] = useState(5);
  const [unauthFromRaw, setUnauthFromRaw] = useState(null);
  const [unauthToRaw, setUnauthToRaw] = useState(null);

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
          <Badge className="bg-green-100 text-green-700 border-green-400 font-medium text-sm" variant="outline">
            Logged In
          </Badge>
        );
      case "SESSION-REMOVED":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-400 font-medium text-sm" variant="outline">
            Logged Out
          </Badge>
        );
      case "EMAIL-CREATED":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-400 font-medium text-sm" variant="outline">
            OTP Requested
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-400 font-medium text-sm">
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

  const safeParseMeta = (raw) => {
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch (e) {
      try {
        const cleaned = raw.replace(/\\"/g, '"').replace(/\\'+/g, "'");
        return JSON.parse(cleaned);
      } catch (e2) {
        return { raw: String(raw) };
      }
    }
  };

  // Normalize unauth entries for the unauth table (memoized to avoid re-parsing on each render)
  const unauthList = useMemo(() => {
    if (!Array.isArray(unauth)) return [];
    return unauth.map((u, idx) => {
      const meta = safeParseMeta(u.meta);
      // prefer meta.ip_Add or top-level IP; strip extra quotes if present
      const rawIp = u.IP || meta.ip_Add || meta.IP || meta.ip || "";
      const ip = String(rawIp).replace(/^"+|"+$/g, "");

      const cleanVal = (v) => 
        String(v ?? "")
          .replace(/^"+|"+$/g, "")
          .replace(/\\+/g, "")
          .trim();
      const latitude = cleanVal(meta.latitude ?? meta.lat ?? meta.Latitude ?? meta.Lat);
      const longitude = cleanVal(meta.longitude ?? meta.lon ?? meta.Longitude ?? meta.Long);
      return {
        id: u.id ?? `unauth-${idx}`,
        ip,
        action: u.action ?? "UNAUTH",
        createdAt: u.createdAt ?? meta.createdAt ?? new Date().toISOString(),
        city: meta.city || meta.City || "",
        country: meta.country || meta.Country || "",
        latitude,
        longitude,
        meta,
      };
    });
  }, [unauth]);

  const unauthFiltered = useMemo(() => {
    if (!unauthList.length) return [];
    const from = unauthFromRaw ? new Date(unauthFromRaw).setHours(0, 0, 0, 0) : null;
    const to = unauthToRaw ? (() => { const d = new Date(unauthToRaw); d.setHours(23,59,59,999); return d.getTime(); })() : null;
    return unauthList.filter((e) => {
      if (!e.createdAt) return false;
      const t = new Date(e.createdAt).getTime();
      if (from !== null && t < from) return false;
      if (to !== null && t > to) return false;
      return true;
    });
  }, [unauthList, unauthFromRaw, unauthToRaw]);

  const unauthTotalPages = Math.max(1, Math.ceil(unauthFiltered.length / unauthPerPage));
  const unauthPaginated = useMemo(
    () => unauthFiltered.slice((unauthPage - 1) * unauthPerPage, unauthPage * unauthPerPage),
    [unauthFiltered, unauthPage, unauthPerPage]
  );

  useEffect(() => {
    setUnauthPage(1);
  }, [unauthFiltered.length, unauthPerPage]);

  // Clamp unauthPage if total pages shrink
  useEffect(() => {
    if (unauthPage > unauthTotalPages) setUnauthPage(unauthTotalPages);
  }, [unauthTotalPages, unauthPage]);

  function actionFormat(action){
    if(action === "getUnauthUser")
      return "Unauthorized Access Attempt"
  }


























  
  // Responsive Table
  return (
    <div className={`${fontZenKaku.className} w-full py-4`}>
      {/* Filter Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-4">
        <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center">
          <div className="flex flex-col lg:flex-row lg:flex-wrap gap-2">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="font-medium !text-base w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Action" />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((action) => (
                  <SelectItem className="font-medium !text-base"  key={action} value={action}>
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
                className="pl-10 w-full font-normal !text-base border border-gray-300"
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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


          <div className="">
            {anyFilterActive && (
              <Button className="
                bg-white border border-rose-500
                text-rose-500 hover:bg-rose-500
                hover:text-white hover:border-0
                hover:shadow-md hover:shadow-rose-500/25"
                size="sm"
                onClick={handleClear}
              >
                 <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-center ">
          <Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}>
            <SelectTrigger className="w-[110px] font-normal text-base">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((n) => (
                <SelectItem className='!font-normal text-base' key={n} value={n.toString()}>
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
          <TableHeader className="font-bold text-lg">
            <TableRow> 
              <TableHead className="bg-gray-100 text-gray-800">
                Activity
              </TableHead>
              <TableHead
                className="bg-gray-100 text-center text-gray-800 cursor-pointer select-none"
                onClick={handleSort}
              >
                <span className="flex items-center whitespace-nowrap">
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
              <TableHead className="bg-gray-100 text-gray-800">
                User
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="font-medium text-base text-center py-8">
                  No activity logs found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((log) => (
                <TableRow key={log.id} className="font-medium text-sm hover:bg-gray-50">
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
            className="rounded font-medium text-sm"
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
                  className="rounded font-medium text-sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              </React.Fragment>
            ))}
          <Button
            variant="outline"
            size="sm"
            className="rounded font-medium text-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

            {/* Unauthenticated access attempts table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Nonusers Access Attempts</h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
          <div className="flex items-center gap-2">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From"
                value={unauthFromRaw}
                onChange={setUnauthFromRaw}
                slotProps={{
                  textField: {
                    size: "small",
                    className: "w-full sm:w-36 bg-white border border-gray-300 rounded px-2 py-1 text-xs",
                  },
                }}
                disableFuture={false}
                format="yyyy-MM-dd"
              />
              <DatePicker
                label="To"
                value={unauthToRaw}
                onChange={setUnauthToRaw}
                slotProps={{
                  textField: {
                    size: "small",
                    className: "w-full sm:w-36 bg-white border border-gray-300 rounded px-2 py-1 text-xs",
                  },
                }}
                disableFuture={false}
                minDate={unauthFromRaw}
                format="yyyy-MM-dd"
              />
            </LocalizationProvider>
            <Button size="sm" variant="outline" onClick={() => { setUnauthFromRaw(null); setUnauthToRaw(null); }}>
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Select value={unauthPerPage.toString()} onValueChange={(v) => setUnauthPerPage(Number(v))}>
              <SelectTrigger className="w-[90px] font-normal text-sm">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((n) => (
                  <SelectItem key={n} value={n.toString()} className="!text-sm">
                    {n} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        
        <div className="overflow-x-auto rounded-lg border bg-white">
          <Table>
            <TableHeader className="font-bold text-md">
              <TableRow>
                <TableHead className="bg-gray-100 text-gray-800">IP Address</TableHead>
                <TableHead className="bg-gray-100 text-center text-gray-800">Action</TableHead>
                <TableHead className="bg-gray-100 text-center text-gray-800">Occurred On</TableHead>
                <TableHead className="bg-gray-100 text-gray-800 hidden sm:table-cell">City</TableHead>
                <TableHead className="bg-gray-100 text-gray-800 hidden sm:table-cell">Coordinates</TableHead>
                <TableHead className="bg-gray-100 text-gray-800 hidden sm:table-cell">Country</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unauthFiltered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="font-medium text-base text-center py-8">
                    No unauthenticated attempts recorded.
                  </TableCell>
                </TableRow>
              ) : (
                unauthPaginated.map((entry) => (
                  <TableRow key={entry.id} className="font-medium text-sm hover:bg-gray-50">
                    <TableCell className="whitespace-nowrap">{entry.ip || "Unknown IP"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-400 font-medium text-sm">
                        {actionFormat(entry.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-center">
                      {entry.createdAt ? formatToPhilippinesTime(entry.createdAt) : "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {entry.latitude || entry.longitude
                        ? `Lat.:${entry.latitude || "-"}, Long.:${entry.longitude || "-"}`
                        : "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{entry.city || "-"}</TableCell>
                    <TableCell className="hidden sm:table-cell">{entry.country || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {unauthList.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {(() => {
              const total = unauthList.length;
              const start = total === 0 ? 0 : (unauthPage - 1) * unauthPerPage + 1;
              const end = Math.min(total, unauthPage * unauthPerPage);
              return `Showing ${start}–${end} of ${total} unauth attempts`;
            })()}
          </div>

          <div className="flex items-center gap-2">

            <Button
              variant="outline"
              size="sm"
              onClick={() => setUnauthPage((p) => Math.max(1, p - 1))}
              disabled={unauthPage === 1}
            >
              Prev
            </Button>

            <div className="text-sm px-2">
              Page {unauthPage} / {unauthTotalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setUnauthPage((p) => Math.min(unauthTotalPages, p + 1))}
              disabled={unauthPage === unauthTotalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}


    </div>
  );
};

export default UserSessionTable;