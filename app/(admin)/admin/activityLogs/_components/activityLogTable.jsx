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
import { Loader2, Search, X } from "lucide-react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Zen_Kaku_Gothic_Antique } from "next/font/google";
import useFetch from "@/hooks/use-fetch";
import { approveVoidedTransaction } from "@/actions/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

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
      return "Voided Cashflow Statement";
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
      return "Ungrouped a Group transaction";
    case "deleteCashflowStatement":
      return 'Voided Cashflow Statement';
    case 'udpateNetChange':
      return 'Edited Net Change';
    case 'updateBalanceQuick':
      return 'Quick Edit Balance';
    case "SESSION-CREATED":
      return "Logged In";
    case "SESSION-REMOVED":
      return "Logged Out";
    case "EMAIL-CREATED":
      return "OTP Requested";
    case "deleteUnfinalizedCashflow":
      return "Canceled Cashflow Statement creation"
    case "voidTransaction":
      return "Requested Transaction Void";
    case "approveVoidedTransaction":
      return "Approved Transaction Void";
    default:
      return action;
  }
}

function formatManilaDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Manila",
  }).format(date);
}

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})

const ActivityLogTable = ({activities = {}, needApprovalVoid}) => {
  // State
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [toDateRaw, setToDateRaw] = useState(null);
  const [fromDateRaw, setFromDateRaw] = useState(null);
  const [currentVoidPage, setCurrentVoidPage] = useState(1);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [selectedApproveId, setSelectedApproveId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  const activityArray = activities.data ?? [];
  const voidArray = (needApprovalVoid && needApprovalVoid.data) 
    ? needApprovalVoid.data 
    : [];
  // Derived: unique actions for filter
  // const actionOptions = useMemo(() => {
  //   const actions = Array.from(new Set(activityArray.map((a) => a.action))).sort();
  //   return ["all", ...actions];
  // }, [activityArray]);

  console.log("voidArray: ", voidArray)


  const totalVoidPages = Math.max(1, Math.ceil(voidArray.length / perPage));
  const paginatedVoids = useMemo(
    () => voidArray.slice((currentVoidPage - 1) * perPage, currentVoidPage * perPage),
    [voidArray, currentVoidPage, perPage]
  );

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
  // Date filtering logic
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
    setCurrentVoidPage(1);
  }, [search, actionFilter, perPage]);

  // Sorting handler
  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleClear = () => {
    setSearch("");  
    setActionFilter("all");
    setFromDateRaw(null);
    setToDateRaw(null);
    setCurrentPage(1);
  };
const anyFilterActive =
  search !== "" ||
  actionFilter !== "all" ||
  fromDateRaw !== null ||
  toDateRaw !== null;

  const {
    loading: approvingVoidLoading,
    fn: approveFn,
    data: approveData,
  } = useFetch(approveVoidedTransaction)



  const handleApproveVoid = (transactionId) => {
    if (!transactionId) return;
    setSelectedApproveId(transactionId);
    setIsApproveDialogOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedApproveId) return;
    if (approvingVoidLoading) return;
    // optional extra validation: ensure id exists in voidArray
    const exists = voidArray.find((v) => v.id === selectedApproveId);
    if (!exists) {
      toast.error("Approve: transaction id not found");
      setIsApproveDialogOpen(false);
      setSelectedApproveId(null);
      return;
    }

    approveFn(selectedApproveId);
    setIsApproveDialogOpen(false);
  };

  useEffect(() => {
    if (approveData && !approvingVoidLoading) {
      if(approveData.code === 200 && approveData.success === true){
        setIsDetailsOpen(false);
        toast.success("Transaction voided successfully");
      }
      if(approveData.code === 500 && approveData.success === false){
        toast.error("Error, consult system admin.");
      }
      if(approveData.code === 404 && approveData.success === false){
        toast.error("Transaction not found");
      }
    }
  }, [approveData, approvingVoidLoading]);


  const handleViewDetails = (log) => {
    setSelectedDetails(log || null);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedDetails(null);
  };

console.log("selectedDetails: ", selectedDetails)
    const formatAmount = (amount) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(amount);
    };

    const getGerundActivity = (activity) => {
      switch (activity) {
        case "OPERATION":
          return "Operating";
        case "INVESTMENT":
          return "Investing";
        case "FINANCING":
          return "Financing";
        default:
          return activity; // Fallback to raw data if no match
      }
    };

function cleanReason(raw) {
  // raw is guaranteed non-empty string per your note
  let s = String(raw).trim();

  // Remove common wrapping quotes (plain or escaped)
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  } else if (s.startsWith('\\"') && s.endsWith('\\"')) {
    s = s.slice(2, -2);
  }

  // Unescape common sequences produced by JSON.stringify
  s = s
    .replace(/\\\\/g, "\\")   // unescape double-backslashes first
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");

  // Decode unicode escapes like \uXXXX if present
  s = s.replace(/\\u([0-9A-Fa-f]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));

  return s;
}









  return (
    <div className="w-full py-4">
      {/* Filter Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-4">
        <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center">
          <div className="flex flex-col lg:flex-row lg:flex-wrap gap-2">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className={`${fontZenKaku.className} font-medium !text-base w-full md:w-[180px]`}>
                <SelectValue placeholder="Filter by Action" />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((action) => (
                  <SelectItem className={`${fontZenKaku.className} font-medium !text-base`} key={action} value={action}>
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
                className={`${fontZenKaku.className} font-normal !text-base pl-10 w-full border-0`}
                placeholder="Search user or activity"
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


        
        <div className="flex gap-2 items-center">
          <Select value={perPage.toString()} onValueChange={(v) => setPerPage(Number(v))}>
            <SelectTrigger className={`${fontZenKaku.className} font-normal text-base w-[110px]`}>
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((n) => (
                <SelectItem className={`${fontZenKaku.className} font-normal text-base`} key={n} value={n.toString()}>{n} / page</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <Table className={`${fontZenKaku.className}`}>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none font-bold text-base tracking-wide"
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
                className="cursor-pointer select-none font-bold text-base tracking-wide"
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
                className="cursor-pointer select-none font-bold text-base tracking-wide"
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
                    <Badge variant="outline" className="font-medium text-sm tracking-wide">
                      {getActionLabel(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium text-sm">
                    {formatManilaDate(log.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
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
        <div className={`${fontZenKaku.className} flex flex-wrap justify-center md:justify-end items-center gap-2 mt-6 mb-2`}>
          <Button
            variant="outline"
            size="sm"
            className="rounded font-medium !text-base"
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
                  className="rounded font-medium !text-base"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              </React.Fragment>
            ))}
          <Button
            variant="outline"
            size="sm"
            className="rounded font-medium !text-base"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

        {Array.isArray(voidArray) && voidArray.length > 0 && (
          <div className="overflow-x-auto rounded-lg border bg-white mt-4">
            <div className="flex flex-col p-4">
              <h1 className={`${fontZenKaku.className} font-bold text-xl `}>Void Request List</h1>
              {approvingVoidLoading && (<Loader2 className="h-4 w-4 animate-spin mr-2" />)}
              <span className={`${fontZenKaku.className} text-gray-500 font-normal `}>You can view each transaction details here 
                before approving to void. Voided transactions go to the archive page of their respective accounts.</span>
            </div>
            <Table className={`${fontZenKaku.className}`}>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold text-base tracking-wide">Requested On</TableHead>
                  <TableHead className="font-bold text-base tracking-wide">User</TableHead>
                  <TableHead className="font-bold text-base tracking-wide"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVoids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No voids needing approval.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedVoids.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell className="whitespace-nowrap font-medium text-sm">
                        { log.voidingDate
                        ? formatManilaDate(log.voidingDate)
                        : "-"
                      }
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {log.user
                          ? `${log.user.Fname || ""} ${log.user.Lname || ""} (${log.user.email})`
                          : log.userId}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        <div className="flex gap-3">
                          <Button disabled={approvingVoidLoading} className="bg-violet-500 text-white hover:bg-violet-600" onClick={() => handleApproveVoid(log.id)}>
                            Approve
                          </Button>
                          <Button onClick={() => handleViewDetails(log)} className="bg-sky-500 text-white hover:bg-sky-600">
                            View Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>


                  ))
                )}
              </TableBody>
            </Table>
            {/* Voids pagination controls */}
            {totalVoidPages > 1 && (
              <div className={`${fontZenKaku.className} flex flex-wrap justify-center md:justify-end items-center gap-2 mt-4 mb-2`}>
                <Button variant="outline" size="sm" className="rounded font-medium !text-base" disabled={currentVoidPage === 1} onClick={() => setCurrentVoidPage((p) => Math.max(1, p - 1))}>Prev</Button>
                {Array.from({ length: totalVoidPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalVoidPages || Math.abs(page - currentVoidPage) <= 2)
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && page - arr[idx - 1] > 1 && <span className="px-1 text-gray-400">...</span>}
                      <Button variant={page === currentVoidPage ? "default" : "outline"} size="sm" className="rounded font-medium !text-base" onClick={() => setCurrentVoidPage(page)}>{page}</Button>
                    </React.Fragment>
                  ))}
                <Button variant="outline" size="sm" className="rounded font-medium !text-base" disabled={currentVoidPage === totalVoidPages} onClick={() => setCurrentVoidPage((p) => Math.min(totalVoidPages, p + 1))}>Next</Button>
              </div>
            )}
          </div>
        )}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent className="[&>button]:hidden rounded-lg max-w-md">
            <DialogHeader>
              <DialogTitle className='text-center'>Approve voiding transaction?</DialogTitle>
              <DialogDescription className='text-center'>
                <span>This will go straight to archives of the account it came from.</span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div  className="flex gap-2 items-center justify-evenly w-full">
                <Button
                  variant="outline"
                  className="border-black bg-white text-black hover:text-white hover:bg-black"
                  onClick={() => {
                    setIsApproveDialogOpen(false);
                    setSelectedApproveId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-violet-600 text-white hover:border
                  hover:border-violet-600 hover:bg-white 
                  hover:text-violet-600"
                  onClick={() => void handleConfirmApprove()}
                  disabled={approvingVoidLoading}>
                  Yes, Approve
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="[&>button]:hidden p-0 rounded-lg w-full max-w-screen-lg"> 
            <div className="flex flex-col h-[90vh] md:h-auto max-w-screen-lg w-full">
              <DialogHeader className="px-4 py-3">
                <DialogTitle>Transaction details</DialogTitle>
                <DialogDescription>Review the transaction details for voiding below.</DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-4 bg-white">
                {/* Top grid: 3 columns on lg, 2 on sm, stacked on xs */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <div className="text-sm text-gray-500">Activity Type</div>
                    <div className="font-medium">{getGerundActivity(selectedDetails?.Activity ?? selectedDetails?.activity)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Transaction Account Title</div>
                    <div className="font-medium">{selectedDetails?.category ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Amount</div>
                    <div className={cn(
                      "text-left font-medium tracking-wide",
                      (selectedDetails?.type ?? "").toString().toUpperCase() === "EXPENSE" ? "text-red-500" : "text-green-500"
                    )}>
                      {selectedDetails?.amount != null
                        ? `${(selectedDetails?.type ?? "").toString().toUpperCase() === "EXPENSE" ? "-" : "+"}${formatAmount(selectedDetails.amount)}`
                        : "-"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="font-medium">{selectedDetails?.date ? formatManilaDate(selectedDetails.date) : "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Recorded On</div>
                    <div className="font-medium">{selectedDetails?.createdAt ? formatManilaDate(selectedDetails.createdAt) : "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Reference Number</div>
                    <div className="font-medium break-words">{selectedDetails?.refNumber ?? "-"}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">Particular</div>
                    <div className="font-medium">{selectedDetails?.particular ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Sold By</div>
                    <div className="font-medium">{selectedDetails?.printNumber ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Account Of</div>
                    <div className="font-medium">{selectedDetails?.account?.name ?? "-"}</div>
                  </div>
                </div>

                {/* Description area */}
                <div className="mt-4">
                  <div className="text-sm text-gray-500">Description</div>
                  <div className="font-medium break-words mt-1">
                    <Textarea
                      value={selectedDetails?.description ?? ""}
                      readOnly
                      className="w-full max-w-full font-medium break-words resize-none h-28 sm:h-36"
                      aria-label="Transaction description (read only)"
                    />
                  </div>
                </div>

                {/* Footer info: void requester  reason */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mt-4">
                  <div>
                    <div className="text-sm text-gray-500">Void request by:</div>
                    <div className="font-medium">
                      {selectedDetails?.user
                        ? `${selectedDetails.user.Fname ?? ""} ${selectedDetails.user.Lname ?? ""}`.trim() || "-"
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Reason To Void</div>
                    <div className="font-medium break-words">{cleanReason(selectedDetails?.reason) ?? "-"}</div>
                  </div>
                </div>
              </div>
            </div>
              <DialogFooter className="m-2 bg-gray-50 flex !justify-center">
                <Button 
                  className="bg-black text-white hover:bg-white 
                  hover:text-black hover:border hover:border-black"
                  onClick={() => { closeDetails(); }}>
                  Close
                </Button>
              </DialogFooter>
            
          </DialogContent>
        </Dialog>




    </div>
  );
};

export default ActivityLogTable;