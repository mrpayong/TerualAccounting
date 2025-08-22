"use client";
import React, { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowDownNarrowWide, ArrowUpWideNarrow, ArrowLeft, ArrowRight, MoreHorizontal } from 'lucide-react';
import { Zen_Kaku_Gothic_Antique } from 'next/font/google';

const ITEMS_PER_PAGE = 10;

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})


function formatManilaDate(dateInput) {
  if (!dateInput) return "-";
  const date = new Date(dateInput);

  // Convert to Manila time (UTC+8)
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const manilaOffset = 8 * 60 * 60000; // 8 hours in ms
  const manila = new Date(utc + manilaOffset);

  // Format: "Month Day, Year HH:mm"
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = months[manila.getMonth()];
  const day = manila.getDate();
  const year = manila.getFullYear();
  const hh = String(manila.getHours()).padStart(2, "0");
  const min = String(manila.getMinutes()).padStart(2, "0");

  return `${month} ${day}, ${year} ${hh}:${min}`;
}








const ArchiveTable = ({archives}) => {
    const formatTableAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
    }).format(amount);
    };

    const archiveList = Array.isArray(archives?.data) ? archives.data : [];
    
    const filteredArchiveList = archiveList.filter(item =>
        !(item.entityType === "Group Transaction" && item.action !== "deleteSubAccount")
    );

  // State for pagination and filtering
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [sortConfig, setSortConfig] = useState({
    field: "createdAt",
    direction: null, // default: newest first
  });

const handleSort = (field) => {
  setSortConfig((prev) => {
    if (prev.field !== field) {
      return { field, direction: null }; // default
    }
    if (prev.direction === null) {
      return { field, direction: "asc" };
    }
    if (prev.direction === "asc") {
      return { field, direction: "desc" };
    }
    return { field, direction: null }; // back to default
  });
};


  // Filtering logic
  const filteredArchives = useMemo(() => {
    let result = filteredArchiveList.filter((item) => {
      if (!item.createdAt) return false;
      const created = new Date(item.createdAt);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      if (from && created < from) return false;
      if (to && created > to) return false;
      return true;
    });

    // Sorting
    if (sortConfig.field === "createdAt") {
      result = result.sort((a, b) => {
        const aDate = new Date(a.createdAt);
        const bDate = new Date(b.createdAt);
        if (sortConfig.direction === "asc") return aDate - bDate;
        // Default and "desc" both sort descending
        return bDate - aDate;
      });
    }
    return result;
  }, [archiveList, fromDate, toDate, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(filteredArchives.length / ITEMS_PER_PAGE);
  const paginatedArchives = filteredArchives.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  console.log("archives", archives)
  // Handlers
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleFromDate = (e) => {
    setFromDate(e.target.value);
    setPage(1);
  };
  const handleToDate = (e) => {
    setToDate(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
  setFromDate("");
  setToDate("");
  setPage(1);
};










  return (
    <div className="w-full">
      {/* Filter Controls */}
      <div className={`${fontZenKaku.className} flex flex-col sm:flex-row gap-4 mb-4 items-center`}>
        <div className="flex items-center gap-2">
          <label htmlFor="from-date" className="font-medium text-base">
            FROM
          </label>
          <Input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={handleFromDate}
            className="max-w-[160px] font-medium !text-base"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="to-date" className="font-medium text-base">
            TO
          </label>
          <Input
            id="to-date"
            type="date"
            value={toDate}
            onChange={handleToDate}
            className="max-w-[160px] font-medium !text-base"
          />
        </div>
        {(fromDate || toDate) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearFilters}
            className="mt-2 sm:mt-0 border hover:border-rose-600 
            text-black hover:text-rose-600 font-medium tracking-wide
            hover:bg-transparent" 
            type="button"
          >
            Clear Filter
          </Button>
        )}
      </div>

        <div className="overflow-x-auto rounded-lg border">
        <Table className={`${fontZenKaku.className}`}>
          <TableHeader>
            <TableRow>
              <TableHead
                className="font-bold text-base cursor-pointer select-none"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  Date of Action
                  {sortConfig.field === "createdAt" && (
                    sortConfig.direction === "asc" ? (
                      <ArrowUpWideNarrow className="h-4 w-4 text-blue-600" />
                    ) : sortConfig.direction === "desc" ? (
                      <ArrowDownNarrowWide className="h-4 w-4 text-blue-600" />
                    ) : (
                      <ArrowDownNarrowWide className="h-4 w-4 text-gray-400" /> // default
                    )
                  )}
                </div>
              </TableHead>
              <TableHead className='font-bold text-base'>Name/Description</TableHead>
              <TableHead className='font-bold text-base'>Action</TableHead>
              <TableHead className="font-bold text-base text-end px-4">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedArchives.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="font-bold text-base text-center py-8">
                  No data to display.
                </TableCell>
              </TableRow>
            ) : (
              paginatedArchives.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className='font-normal !text-base'>
                    {item.createdAt
                        ? formatManilaDate(item.createdAt)
                        : "-"}
                  </TableCell>
                  <TableCell className='font-normal !text-base'>
                    {item.entityType === "Group Transaction"
                      ? item.data.name || "no data"
                      : item.entityType === "Transaction"
                        ? item.data.particular || item.data.description || "no data"
                        : "no data"
                    }
                  </TableCell>
                  <TableCell className='font-normal !text-base'>
                    {(() => {
                        switch (item.action) {
                          case "deleteTransaction":
                            return "Deleted Transaction";
                          case "bulkDeleteTransaction":
                            return "Deleted Transaction";
                          case "deleteSubAccount":
                            return "Deleted Group Transactions";
                          case "deleteCashflowStatement":
                            return "Deleted Cashflow Statement";
                          default:
                            return item.action || "-";
                        }
                      })()}
                  </TableCell>
                  <TableCell className='text-end'>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="border-0" variant="outline">
                            <MoreHorizontal className="mr-2 h-4 w-4"/>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className={`${fontZenKaku.className} rounded-md [&>button]:hidden sm:max-w-[425px]`}>
                        <DialogHeader>
                            <DialogTitle className='text-center !font-bold'>Archive Details</DialogTitle>
                            <DialogDescription className='text-center font-normal tracking-wide'>
                                Details of your deleted data.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2 py-2">
                        {/* Transaction fields */}
                        {item.entityType === "Transaction" && (
                            <>
                            <div>
                                <span className="font-medium text-base">Recorded On:</span>{" "}
                                <span className='font-normal text-base'>{formatManilaDate(item.data.createdAt)}</span>
                            </div>
                            <div>
                                <span className="font-medium text-base">Amount:</span>{" "}
                                <span className='font-normal text-base'>{formatTableAmount(item.data.amount)}</span>
                            </div>
                            <div>
                                <span className="font-medium text-base">Ref. Number:</span>{" "}
                                <span className='font-normal text-base'>{item.data.refNumber}</span>
                            </div>
                            <div>
                                <span className="font-medium text-base">Particular:</span>{" "}
                                <span className='font-normal text-base'>{item.data.particular}</span>
                            </div>
                            <div>
                                <span className="font-medium text-base">Description:</span>{" "}
                                <span className='font-normal text-base'>{item.data.description}</span>
                            </div>
                            <div>
                                <span className="font-medium text-base">Account ID:</span>{" "}
                                <span className='font-normal text-base'>{item.data.accountId}</span>
                            </div>
                            <div>
                                <span className="font-medium text-base">Transaction ID:</span>{" "}
                                <span className='font-normal text-base'>{item.data.id}</span>
                            </div>
                            </>
                        )}

                        {/* SubAccount fields */}
                        {item.entityType === "Group Transaction" && (
                            <>
                            <div>
                                <span className="font-medium text-base">Name:</span>{" "}
                                <span className='font-normal text-base'>{item.data.name}</span>
                            </div>
                            <div>
                                <span className="font-medium text-base">Created On:</span>{" "}
                                <span className='font-normal text-base'>{formatManilaDate(item.data.createdAt)}</span>
                            </div>
                            <div>
                                <span className="font-medium text-base">Description:</span>{" "}
                                <span className='font-normal text-base'>{item.data.description}</span>
                            </div>
                            <div>
                                <span className="font-medium text-base">Balance:</span>{" "}
                                <span className='font-normal text-base'>{formatTableAmount(item.data.balance)}</span>
                            </div>
                            <div>
                                <span className="font-medium text-base">Account ID:</span>{" "}
                                <span className='font-normal text-base'>{item.data.accountId}</span>
                            </div>
                            <div>
                                <span className="font-medium text-base">SubAccount ID:</span>{" "}
                                <span className='font-normal text-base'>{item.data.id}</span>
                            </div>
                            {typeof item.data.transactionCount !== "undefined" && (
                                <div>
                                <span className="font-medium text-base">Transaction Count:</span>{" "}
                                <span className='font-normal text-base'>{item.data.transactionCount}</span>
                                </div>
                            )}
                            </>
                        )}
                        {item.entityType === "CashflowStatement" && (
                          <>
                            <div>
                              <span className="font-semibold">Period:</span>{" "}
                              <span>{item.data.periodCashFlow}</span>
                            </div>
                            <div>
                              <span className="font-semibold">Created On:</span>{" "}
                              <span>{formatManilaDate(item.data.createdAt)}</span>
                            </div>
                            <div>
                              <span className="font-semibold">Net Change:</span>{" "}
                              <span>{formatTableAmount(item.data.netChange)}</span>
                            </div>
                            <div>
                              <span className="font-semibold">Start Balance:</span>{" "}
                              <span>{formatTableAmount(item.data.startBalance)}</span>
                            </div>
                            <div>
                              <span className="font-semibold">End Balance:</span>{" "}
                              <span>{formatTableAmount(item.data.endBalance)}</span>
                            </div>
                            <div>
                              <span className="font-semibold">Account ID:</span>{" "}
                              <span>{item.data.accountId}</span>
                            </div>
                            <div>
                              <span className="font-semibold">Cashflow ID:</span>{" "}
                              <span>{item.data.id}</span>
                            </div>
                            <div>
                              <span className="font-semibold">Activity Totals:</span>
                              <ul className="list-disc list-inside ml-4">
                                {Array.isArray(item.data.activityTotal) && item.data.activityTotal.map((amt, idx) => (
                                  <li className="list-none"key={idx}>{formatTableAmount(amt)}</li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}

                        {/* Fallback for unknown entity types */}
                        {item.entityType !== "Transaction" && item.entityType !== "Group Transaction" && item.entityType !== "CashflowStatement" && (
                            <pre className="whitespace-pre-wrap text-xs max-w-[200px] overflow-x-auto">
                            {JSON.stringify(item.data, null, 2)}
                            </pre>
                        )}
                        </div>
                      <DialogFooter>
                          <DialogClose asChild>
                            <Button 
                              className='
                              font-medium hover:font-normal text-sm md:!text-base
                              hover:bg-rose-600 hover:text-white 
                              border border-black hover:border-0 tracking-wide'
                              variant="outline">Close</Button>
                          </DialogClose>
                      </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>
                <div className="flex justify-between items-center">
                  <span className="text-xs">
                    Page {page} of {totalPages || 1}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      disabled={page === 1}
                    >
                      <ArrowLeft />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      disabled={page === totalPages || totalPages === 0}
                    >
                      <ArrowRight />
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}

export default ArchiveTable
