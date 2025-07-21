"use client";
import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
import { Search } from "lucide-react";


function getActionLabel(action) {
  switch (action) {
    // Create
    case "createTransaction":
      return "Created Transaction";
    case "createTasking":
      return "Created Task";
    case "createUser":
      return "Created User";
    case "createAccount":
      return "Created Account";
    case "createSubAccount":
      return "Created Group Transaction";
    case "createCashflow":
      return "Created Cashflow";
    // Update
    case "updateTransaction":
      return "Transaction updated";
    case "updateUserRole":
      return "User role updated";
    case "updateCashflow":
      return "Cashflow updated";
    case "udpateBalanceQuick":
      return "Quick Edit Cashflow";
    // Delete
    case "deleteUser":
      return "User deleted";
    case "deleteCashflow":
      return "Cashflow deleted";
    case "bulkDeleteTransactions":
      return "Transactions deleted";
    case "bulkDeleteTask":
      return "Task deleted";
    case "scanReceipt":
      return "Scanned receipt(AI)";
    // Default
    case "updateUserEmail":
      return "Updated Email";
    case "updateUser":
      return "Updated User";
    case "getUserForSysAdmin":
      return "Visited User List";
    case "getUser":
      return "Visited User List";
    case "n":
      return "Visited User List";
    case "getOverallFinancialDataAnalysis":
      return "Overall Financial Analysis(AI)";
    case "getInflowOutflowForecast":
      return "Inflow & Outflow Forecast(AI)";
    case "getCashflowForecast":
      return "Cashflow Forecast(AI)";
    case "updateCashflowTransaction":
      return "Edited Cashflow";
    case "updateTotalOperating":
      return "Edited Operating Total";
    case "udpateNetchange":
      return "Edited Gross";
    case "updateStartBalance":
      return "Edited Beginning Balance";
    case "updateEndBalance":
      return "Edited Ending Balance";
    case "updateTotalInvesting":
      return "Edited Investing Total";
    case "updateTotalFinancing":
      return "Edited Financing Total";
    case "getSuggestedWeeklySchedule":
      return "Recommended Schedule(AI)";
    case "deleteSubAccountTransactionRelation":
      return "Removed transaction from a group";
    case "updateManyTransaction":
      return "Edited Activity type";
    case "updateSubAccountBalance":
      return "Edited Group's Balance";
    case "updateClientInfo":
      return "Edited Client Information";
    case "deleteSubAccount":
      return "Deleted a Group transaction";
    default:
      return action;
  }
}


const ActivityLogTable = ({activities = {}}) => {
  // State
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const activityArray = activities.data ?? [];
  // Derived: unique actions for filter
  // const actionOptions = useMemo(() => {
  //   const actions = Array.from(new Set(activityArray.map((a) => a.action))).sort();
  //   return ["all", ...actions];
  // }, [activityArray]);


  const actionOptions = useMemo(() => {
    const actions = Array.from(new Set(activityArray.map((a) => a.action)));
    const grouped = [];
    let hasGet = false;
    actions.forEach(action => {
      if (typeof action === "string" && action.startsWith("get")) {
        hasGet = true;
      } else {
        grouped.push(action);
      }
    });
    // "all" is always first
    const result = ["all", ...grouped.sort()];
    // if (hasGet) result.push("get*"); 
    // Use a special value for all "get" actions
    return result;
  }, [activityArray]);


  // Filtering
const filtered = useMemo(() => {
  let logs = activityArray;
  if (actionFilter !== "all") {
    if (actionFilter === "get*") {
      logs = logs.filter((a) => typeof a.action === "string" && a.action.startsWith("get"));
    } else {
      logs = logs.filter((a) => a.action === actionFilter);
    }
  }
  if (search)
    logs = logs.filter(
      (a) =>
        a.action?.toLowerCase().includes(search.toLowerCase()) ||
        getActionLabel(a.action).toLowerCase().includes(search.toLowerCase()) ||
        a.user?.Fname?.toLowerCase().includes(search.toLowerCase()) ||
        a.user?.Lname?.toLowerCase().includes(search.toLowerCase()) ||
        a.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        a.userId?.toLowerCase().includes(search.toLowerCase())
    );
  return logs;
}, [activityArray, actionFilter, search]);

  // Sorting
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let vA = a[sortKey];
      let vB = b[sortKey];
      if (sortKey === "createdAt") {
        vA = new Date(vA);
        vB = new Date(vB);
      }
      if (vA < vB) return sortDir === "asc" ? -1 : 1;
      if (vA > vB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

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

  // Sorting handler
  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };











  return (
    <div className="w-full  py-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by Action" />
            </SelectTrigger>
            <SelectContent>
              {actionOptions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action === "all"
                    ? "All Actions"
                    :  getActionLabel(action)}
                </SelectItem>
              ))}
              
            </SelectContent>
          </Select>
          <div className="relative w-full md:w-[240px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <Input
              className="pl-10 w-full border-0"
              placeholder="Search user or activity"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((n) => (
                <SelectItem key={n} value={n.toString()}>{n} / page</SelectItem>
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
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("action")}
              >
                <span className="flex items-center">
                  Activity
                  {sortKey === "action" && (
                    <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>
                  )}
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("createdAt")}
              >
                <span className="flex items-center">
                  Occurred On
                  {sortKey === "createdAt" && (
                    <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>
                  )}
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("userId")}
              >
                <span className="flex items-center">
                  User
                  {sortKey === "userId" && (
                    <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>
                  )}
                </span>
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
                    <Badge variant="outline" className="font-medium">
                      {getActionLabel(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {log.createdAt
                      ? format(new Date(log.createdAt), "MMM dd, yyyy HH:mm:ss")
                      : ""}
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

export default ActivityLogTable;