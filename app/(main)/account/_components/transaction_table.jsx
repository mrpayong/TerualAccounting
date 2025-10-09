"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Checkbox } from '@/components/ui/checkbox'
import { format, parseJSON } from 'date-fns';
import { categoryColors } from '@/data/category';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { ArrowDownNarrowWide, ArrowUpWideNarrow, ChevronDown, ChevronUp, Clock, Download, Folders, Info, Loader, Loader2, MoreHorizontal, Pen, PlusCircleIcon, RefreshCw, Search, SquareArrowOutUpRight, Trash, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useFetch from '@/hooks/use-fetch';
import { bulkDeleteTransactions, createSubAccount, deleteSubAccount } from '@/actions/accounts';
import { toast } from 'sonner';
import { BarLoader, BeatLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import { createCashflow, deleteCashflow} from '@/actions/cashflow';
import { pdf, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import MyPDFaccountPage from '../[id]/pdf/route';
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
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { subAccountSchema } from "@/app/lib/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components
import { updateManyTransaction } from '@/actions/transaction';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Link from 'next/link';
import { Zen_Kaku_Gothic_Antique } from 'next/font/google';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Box } from '@mui/material';
import { Textarea } from '@/components/ui/textarea';



const RECURRING_INTERVALS = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
};

function useIsSmallScreen(breakpoint = 640) { // Tailwind's 'sm' is 640px
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isSmall;
}

function formatManilaDate(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700"],
})
  



const TransactionTable = ({transactions, id, subAccounts, recentCashflows, relatedIDs}) => { 
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [response, setResponse] = useState(0.00)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBulkEdit, setIsBulkEdit] = useState(false);
    const [isCloseButtonDisabled, setIsCloseButtonDisabled] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSubAccountIds, setSelectedSubAccountIds] = useState([]); // State for selected sub-accounts
    const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
    const [currentSubAccountPage, setCurrentSubAccountPage] = useState(1);
    const [activityFilter, setActivityFilter] = useState("");
    const isSmallScreen = useIsSmallScreen();
    const [fromDateRaw, setFromDateRaw] = useState(null);
    const [toDateRaw, setToDateRaw] = useState(null);
    const [dropdownDisabledId, setDropdownDisabledId] = useState(false);
    const [editLoadingId, setEditLoadingId] = useState(false);
// Removed duplicate declaration of rowsPerPage
const rowsPerPage = 10; // Default rows per page
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
      } = useForm({
        resolver: zodResolver(subAccountSchema),
        defaultValues: {
          name: "",
          description: "",
          accountId: id,
        //   balance: "",
          parentName: "",
        },
      });

    //filtering hooks
    const [sortConfig, setSortConfig] = useState({
        field: "date",
        direction: "desc",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [recurringFilter, setRecurringFilter] = useState("");

    // Pagination hooks
    const [currentPage, setCurrentPage] = useState(1);


    // const {
    //     loading: deleteLoading,
    //     fn: deleteFn,
    //     data: deleted,
    // } = useFetch(bulkDeleteTransactions);


    //bulk delete function API
    const {
        loading: deleteLoading,
        fn: deleteFn,
        data: deleted,
      } = useFetch(bulkDeleteTransactions);

    const [reason, setReason] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [TransactionIdToDelete, setTransactionIdToDelete] = useState("");
    const [yesBtnStatus, setYesBtnStatus] = useState(false);
    
    const handleDeletingModal = (T_id) =>{ // delete button(menu dropdwn)
      setDeleteModalOpen(true);
      setTransactionIdToDelete(T_id)
      console.log("id: ", T_id)
      if(TransactionIdToDelete !== ""){
        setDeleteModalOpen(true)
      }
    }
    const handleCancelDeletingModal = () =>{ //cancle button
      setReason("")
      if(TransactionIdToDelete !== ""){
        setTransactionIdToDelete("")
        setDeleteModalOpen(false)
      }
    }

    const acount_id = id;
    const handleSingleDelete = async () => { //Confirm Delete button
      if(reason === "" || !reason || reason === null){
        toast.error("Reason of deletion is required.");
      }
      
      if (TransactionIdToDelete && reason && acount_id){
        deleteFn([TransactionIdToDelete], acount_id, JSON.stringify(reason));
      }
    }

    const [openBulkDltModal, setOpenBulkDltModal] = useState(false);
    const handleBulkDeleteModal = () => {
      setOpenBulkDltModal(true);
    }

    const handleCancelBulkDeleteModal = () => {
      setOpenBulkDltModal(false);
      setReason("")
    }

    const handleBulkDelete = async () => {
      if(reason === "" || !reason || reason === null){
        toast.error("Reason of deletion is required.");
      }
      setDeleteModalOpen(false);
      if (selectedIds && reason && acount_id) {
        deleteFn(selectedIds, acount_id, JSON.stringify(reason));
          // Call the delete function with selected IDs
      }
    };

    useEffect(() =>{
      if(deleted && !deleteLoading){
        if(deleted?.code === 200 && deleted?.success === true){
          setTransactionIdToDelete("")
          setReason("")
          setDeleteModalOpen(false);
          setOpenBulkDltModal(false);
          toast.success("Deleted Successfully!");
        }
        if(deleted?.code === 500 && deleted?.success === false){
          setReason("");
          setDeleteModalOpen(false);
          setTransactionIdToDelete("");
          toast.error("Error Deleting Transaction.");
        }
      }
    }, [deleted, deleteLoading])

  
    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactions];

        // Apply search filter
        if(searchTerm) {
            const searchLower = searchTerm.toLowerCase();
        result = result.filter((transaction) =>
            (transaction.particular?.toLowerCase().includes(searchLower) ||
             transaction.description?.toLowerCase().includes(searchLower) ||
             transaction.refNumber?.toLowerCase().includes(searchLower) ||
             transaction.category?.toLowerCase().includes(searchLower)
            )
        );
        }

        // Apply recurring filter
        if (activityFilter) {
          result = result.filter((transaction) => transaction.Activity === activityFilter);
        }

        // Apply Type Filter
        if (typeFilter) {
            result = result.filter((transaction) => transaction.type === typeFilter);
        }

        // Apply Sorting
        result.sort((a, b) => {
          let comparison = 0;
          
          function getSignedAmount(tx) {
            return tx.type === "EXPENSE" ? -Math.abs(tx.amount) : Math.abs(tx.amount);
          }

          switch (sortConfig.field) {
              case "date":
                  comparison = new Date(a.date) - new Date(b.date);
                  break;
              case "amount": 
                  comparison = getSignedAmount(a) - getSignedAmount(b);
                  break;
              case "category":
                  comparison = a.category.localeCompare(b.category);
                  break;
              case "createdAt":
                      comparison = new Date(a.createdAt) - new Date(b.createdAt);
                      break;
              default:
                  comparison = 0;
          }
          
          return sortConfig.direction === "asc" ? comparison : -comparison; 
        })

        if (fromDateRaw || toDateRaw) {
          result = result.filter((transaction) => {
            const txnDate = new Date(transaction.date);
            // Zero out time for comparison
            const txnDateOnly = new Date(txnDate.getFullYear(), txnDate.getMonth(), txnDate.getDate());
            const fromDateOnly = fromDateRaw ? new Date(fromDateRaw.getFullYear(), fromDateRaw.getMonth(), fromDateRaw.getDate()) : null;
            const toDateOnly = toDateRaw ? new Date(toDateRaw.getFullYear(), toDateRaw.getMonth(), toDateRaw.getDate()) : null;

            const afterFrom = fromDateOnly ? txnDateOnly >= fromDateOnly : true;
            const beforeTo = toDateOnly ? txnDateOnly <= toDateOnly : true;
            return afterFrom && beforeTo;
          });
        }
        return result;
    },[transactions, searchTerm, typeFilter, activityFilter, sortConfig, fromDateRaw, toDateRaw])
    useEffect(() => {
      setCurrentTransactionPage(1);
    }, [searchTerm, typeFilter, activityFilter, fromDateRaw, toDateRaw]);
    const handleSort = (field) => {
        // setSortConfig((current) => ({
        //     field,
        //     direction: 
        //         current.field == field && current.direction === "asc"
        //             ? "desc"
        //             : "asc",
        // }));


        setSortConfig((current) => {
          if (current.field === field) {
            // Cycle through "asc", "desc", and "disabled"
            const nextDirection =
              current.direction === "asc"
                ? "desc"
                : current.direction === "desc"
                ? null // Disable sorting
                : "asc";
            return { field: nextDirection ? field : null, direction: nextDirection };
          }
          // Default to ascending if a new field is clicked
          return { field, direction: "asc" };
        });
    };

    const handleSelect = (id) => {
        setSelectedIds((current) =>
          current.includes(id)
            ? current.filter((item) => item !== id) // Deselect
            : [...current, id] // Select
        );
      };

    const handleSelectAll = () => {
      const allIds = filteredAndSortedTransactions.map((t) => t.id);
      setSelectedIds((current) =>
        allIds.every((id) => current.includes(id))
          ? current.filter((id) => !allIds.includes(id)) // Deselect all
          : [...current, ...allIds.filter((id) => !current.includes(id))] // Select all
      );
    };
    
    


    const handleClearFilters = () => {
        setSearchTerm("");
        setTypeFilter("");
        setRecurringFilter("");
        setSelectedIds([]);
        setActivityFilter("")
        setFromDateRaw(null);
        setToDateRaw(null);
    }

    const {
        loading: cfsLoading,
        fn: cfsFn,
        data: forCfs,
        error: errorCfs
    } = useFetch(createCashflow)




    const handleSample = (event) => {
      setResponse(event.target.value)
    }




    const resetForm = () => {
        setResponse(0.00);
      };
    const handleCashflow = async (e) => {
        e.preventDefault();
            if (response === 0) {
              toast.error(`Beginning balance must not be zero.`);
              return;
            }
            console.log("selectedIds:", selectedIds)
            const eligibleSelectedIds = selectedIds.filter(id => !relatedIDs.includes(id));
            
            console.log("eligibleSelectedIds:", eligibleSelectedIds)
            if (eligibleSelectedIds === null || eligibleSelectedIds.length === 0 && selectedSubAccountIds.length === 0) {
              toast.error(`Select transactions.`);
              return;
            }
        
          //   console.log("TAKEN DATA: ", "start balance: ", response);
          //   console.log("Selected Transactions: ", selectedIds);
          //   // Create the cashflow
          //   await cfsFn(selectedIds, parseFloat(response));
          if (response !== null || eligibleSelectedIds.length !== 0){
              await cfsFn(eligibleSelectedIds, parseFloat(response), selectedSubAccountIds, id);
          }
      }; 

      useEffect(() => {
        if (forCfs && forCfs.success) {
          setSelectedIds([])
          setSelectedSubAccountIds([])
          toast.success("Cashflow statement created successfully.");
    
          // Ensure forCfs.data.transactions is defined
          if (forCfs.data && Array.isArray(forCfs.data.transactions)) {
            setIsModalOpen(true);
            setSelectedPeriod(null);
            setResponse(0.00);
          } 
        }
        if(forCfs?.code === 403 && forCfs.success === false){
          toast.error("Invalid beginning balance.");
        }
        if(forCfs?.code === 500 && forCfs.success === false){
          toast.error("Something went wrong. Failed to create cashflow.");
        }
        if(forCfs?.code === 422 && forCfs.success === false){
          console.log('message: ', forCfs.message)
          toast.error("Ensure groups have transactions. An empty group was selected.");
        }
      }, [forCfs]);
     

      useEffect(() => {
        if (errorCfs) {
          toast.error("Failed to create Cashflow statement.");
          console.error("Error while producing CFS:");
        }
      }, [errorCfs]);


      const handleConfirm = () => {
        setIsModalOpen(false);
        setResponse(0.00);
        setSelectedIds([]);
      }


    
    const handlePdfDownload = async() => { // make a DELETE SERVER ACTION FOR THIS SO THAT WHEN CLOSED CREATED CFS IS DELETED
        // try {
        //     const doc = (
        //         <Document>
        //           <MyPDFaccountPage cashflow={forCfs.data} transactions={forCfs.data.transactions} />
        //         </Document>
        //       );
          
        //       const asPdf = pdf();
        //       asPdf.updateContainer(doc);
          
        //       const blob = await asPdf.toBlob();
          
        //       const url = window.URL.createObjectURL(blob);
        //       const a = document.createElement('a');
        //       a.href = url;
        //       a.download = `cashflow-statement-${id}.pdf`;
        //       document.body.appendChild(a);
        //       a.click();
          
        //       window.URL.revokeObjectURL(url);
        //       document.body.removeChild(a);
        //     toast.success("PDF exported")
        // } catch (error) {
        //     console.error("Error during PDF export: ", error);
        //     toast.error("Failed exporting PDF.")
        // }
        setIsModalOpen(false);
        setResponse(0.00);
        setSelectedIds([]);
    }

    const {
      loading: loadingCfsDelete, 
      fn: cfsDeleteFn, 
      data: cfsDeleteData,
      error: errorCfsDelete
    } = useFetch(deleteCashflow)

    const handleCancelPDFdownload = async() => {
      setIsModalOpen(false);
      if (forCfs && forCfs.data && forCfs.data.id) {
        toast.warning("Cancelling Cashflow Statement creation.")
        // Call the delete function with the ID of the cashflow statement
        await cfsDeleteFn(forCfs.data.id);
      }
    }

    useEffect(() => {
        if (cfsDeleteData?.code === 200 && cfsDeleteData.success) {
          toast.info("Cancelled creation of Cashflow Statement.");
          setIsModalOpen(false);
        }
        if (cfsDeleteData?.code === 404 && cfsDeleteData.success === false) {
          toast.error("Cashflow not found.");
          setIsModalOpen(false);
        }
        if (cfsDeleteData?.code === 500 && cfsDeleteData.success === false) {
          toast.error("Something went wrong.");
          setIsModalOpen(false);
        }
      }, [cfsDeleteData]);

    useEffect(() => {
      if (errorCfsDelete) {
        toast.error("Failed to delete Cashflow statement.");
        console.error("Error while deleting CFS:", errorCfsDelete.message);
      }
    }, [errorCfsDelete]);


      const { 
        loading: subAccountLoading, 
        fn: createSubAccountFn,
        data: subAccountData,
        error: subAccountError,
        } = useFetch(createSubAccount);

        const onSubmit = async (data) => {
              // Sanitize and validate data types
              const sanitizedData = {
                ...data,
                name: String(data.name).trim(),
                description: data.description ? String(data.description).trim() : null,
                parentName: data.parentName ? String(data.parentName).trim() : null,
              };
               await createSubAccountFn(selectedIds, sanitizedData, id);
        };

        useEffect(() => {
          if (!!subAccountData?.success === true && !subAccountLoading) {
            if(subAccountData?.code === 200){
              console.log("Success")
              toast.success("Done!");
            }
            if(subAccountData?.code === 201){
              console.log("Success")
              toast.success("Transaction inserted successfully!");
            }
            setSelectedIds([]);
            reset(); // Reset the form after successful submission
            setIsDialogOpen(false); // Close the dialog
          }
        }, [subAccountData, subAccountLoading]);

        useEffect(() => {
          if (subAccountError && !subAccountLoading) {
            console.error("Error grouping transactions:", subAccountError.message);
            toast.error(subAccountError.message)
            toast.error("Failed to create group. Wrong Inputs.");
          }
        }, [subAccountError, subAccountLoading,]);

        useEffect(() => {
          if(!!subAccountData?.success === false 
            && subAccountData?.success === false &&
            subAccountData?.code === 500
            ){
            console.log("subAccountData.message", subAccountData?.message)
            toast.error("Transactions already related to this Group. Check selected transactions.")
          }
          if(subAccountData?.code === 423){
            console.log("Select Transactions with same type (INFLOW or OUTFLOW).")
            toast.error("Select Transactions with same type (INFLOW or OUTFLOW).")
          }
          if(subAccountData?.code === 424){
            console.log("Transactions must be same Activity types.")
            toast.error("Transactions must be same Activity types.")
          }
          if(subAccountData?.code === 425){
            console.log("Invalid amount.")
            toast.error("Invalid amount.")
          }
          if(subAccountData?.code === 426){
            console.log("No existing Parent group.")
            toast.error("No existing Parent group.")
          }
          if(subAccountData?.code === 428){
            console.log("Activity type mismatch with Parent Group.")
            toast.error("Activity type mismatch with Parent Group.")
          }
          if(subAccountData?.code === 429){
            console.log("Transaction type mismatch with Parent Group.")
            toast.error("Transaction type mismatch with Parent Group.")
          }
          if(subAccountData?.code === 430){
            console.log("Code:430, Error creating group. Consult System Admin.")
            toast.error("Error creating group. Consult System Admin.")
          }
          if(subAccountData?.code === 505){
            console.log("Code:505, System Error.")
            toast.error("Error creating group. Consult System Admin.")
          }
          if(subAccountData?.code === 422){
            console.log("Code:422, System Error.")
            toast.error('The New Group Name already exists.')
          }
        }, [subAccountData])

    const filteredAndSortedSubAccounts = useMemo(() => {
        if (!Array.isArray(subAccounts?.data)) return [];
      
        let result = [...subAccounts.data];
      
        // Add filtering or sorting logic here if needed
        // For now, we return the subAccounts as is
      
        return result;
      }, [subAccounts]);
      
      // Handle select all for sub-accounts
      const handleSelectAllSubAccounts = () => {
        const currentPageIds = paginatedSubAccounts.map((subAccount) => subAccount.id);
        setSelectedSubAccountIds((current) =>
          currentPageIds.every((id) => current.includes(id))
            ? current.filter((id) => !currentPageIds.includes(id)) // Deselect all on the current page
            : [...current, ...currentPageIds.filter((id) => !current.includes(id))] // Select all on the current page
        );
      };
      const handleSelectSubAccount = (id) => {
        setSelectedSubAccountIds((current) =>
          current.includes(id)
            ? current.filter((item) => item !== id) // Deselect
            : [...current, id] // Select
        );
      };
      
      

      const totalTransactionPages = Math.ceil(filteredAndSortedTransactions.length / rowsPerPage);
      const totalSubAccountPages = Math.ceil(filteredAndSortedSubAccounts.length / rowsPerPage);
      
      const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
        <div className={`${fontZenKaku.className} flex justify-between items-center mt-4`}>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="font-medium !text-base"
          >
            Previous
          </Button>
          <span className="font-medium !text-base">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="font-medium !text-base"
          >
            Next
          </Button>
        </div>
      );
      const paginatedTransactions = useMemo(() => {
        const startIndex = (currentTransactionPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredAndSortedTransactions.slice(startIndex, endIndex);
      }, [filteredAndSortedTransactions, currentTransactionPage]);
      
      const paginatedSubAccounts = useMemo(() => {
        const startIndex = (currentSubAccountPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredAndSortedSubAccounts.slice(startIndex, endIndex);
      }, [filteredAndSortedSubAccounts, currentSubAccountPage]);


      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      };

      function formatUtcDateFriendly(dateString) {
        if (!dateString) return "";
        const d = new Date(dateString);
        const month = d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
        const day = d.getUTCDate();
        const year = d.getUTCFullYear();
        return `${month} ${day}, ${year}`;
      }

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

      function formatUtcDateWithTime(dateString) {
        if (!dateString) return "";
        const d = new Date(dateString);
        const month = d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
        const day = d.getUTCDate();
        const year = d.getUTCFullYear();
        const hour = d.getUTCHours().toString().padStart(2, "0");
        const minute = d.getUTCMinutes().toString().padStart(2, "0");
        const second = d.getUTCSeconds().toString().padStart(2, "0");
        return `${month} ${day}, ${year}, ${hour}:${minute}:${second} UTC`;
      }

      function typeFormat(type){
        if(type === "EXPENSE"){
          return "OUTFLOW"
        }
        if(type === "INCOME"){
          return "INFLOW"
        }
      }
      const TransactionDetailshandler = (transaction) => {
        if (typeof window === "undefined") return;
        const formatDateTime = (dateString) => {
          const date = new Date(dateString);
          return date.toLocaleString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        };
        const formatAmount = (amount) => {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
          }).format(amount);
        };
        const amountColor = transaction.type === "EXPENSE" ? "text-red-500" : "text-green-500";

        Swal.fire({
          title: `<h2 class="${fontZenKaku.className} tracking-wide text-2xl md:text-3xl font-bold text-blue-600">
                    ${transaction.particular || "Transaction Details"}
                  </h2>`,
          html: `
            <div class="${fontZenKaku.className} text-left space-y-2">
              <p class="font-medium !text-lg"><label class='font-bold !text-lg'>Date of transaction:</label> ${formatDate(transaction.date)}</p>
              <p class="font-medium !text-lg"><label class='font-bold !text-lg'>Amount:</label><span class="${amountColor}"> ${formatAmount(transaction.amount)}</span></p>
              <p class="font-medium !text-lg"><label class='font-bold !text-lg'>Type:</label> ${typeFormat(transaction.type)}</p>
              <p class="font-medium !text-lg"><label class='font-bold !text-lg'>Reference number:</label> ${transaction.refNumber || "N/A"}</p>
              <p class="font-medium !text-lg"><label class='font-bold !text-lg'>Account title:</label> ${transaction.category || "N/A"}</p>
              <p class="font-medium !text-lg"><label class='font-bold !text-lg'>Activity type:</label> ${getGerundActivity(transaction.Activity) || "N/A"}</p>
              <p class="font-medium !text-lg"><label class='font-bold !text-lg'>Description:</label> ${transaction.description || "No description provided."}</p>
              <p class="font-medium !text-lg"><label class='font-bold !text-lg'>Recorded on:</label> ${formatUtcDateWithTime(transaction.createdAt) || "N/A"}</p>           
            </div>
            <div class="text-center mt-4">
              <p class="text-xs text-neutral-400 italic">
                digital ID: ${transaction.id || "N/A"}
              </p>
            </div>
          `,
          showCloseButton: true,
          showConfirmButton: false,
          customClass: {
            popup: "max-w-lg w-full p-6 rounded-lg shadow-lg",
            title: "text-blue-500",
            htmlContainer: "text-gray-700",
          },
        });
      };

      const formatTableAmount = (amount) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "PHP",
        }).format(amount);
      };




      const {
        loading: updateLoading,
        fn: updateFn,
        data: updatedData,
        error: updateError
      } = useFetch(updateManyTransaction)

      const [ActivityType, setActivityType] = useState("")
      const handleUpdate = async () => {
        setIsBulkEdit(false)
        const result = await Swal.fire({
          title: `Are you sure?`,
          text: `You are about to update ${selectedIds.length} transactions.`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
        });
      
        if (result.isConfirmed) {
          console.log("Updating transactions with IDs:", selectedIds);
          updateFn(selectedIds, ActivityType); // Call the delete function with selected IDs
        }
      }

      useEffect(() => {
        if (updatedData && !updateLoading){
          console.log("Success editing Activity types");
          toast.success("Success editing Activity types");
          setSelectedIds([]);
          setActivityType("")
        }
      }, [updatedData, updateLoading])

      useEffect(() => {
        if(updateError && !updateLoading){
          console.log("Error editing Activity types");
          toast.error("Error editing Activity types");
        }
      }, [updateError, updateLoading])

      // disable create group button
      const groupName = watch("name");
      const parentGroupName = watch("parentName");

      const isCreateGroupDisabled =
        (!groupName && !parentGroupName) ||
        (parentGroupName && selectedIds.length === 0);


      const PERIOD_LABELS = [
        { label: "Previous Daily", value: "DAILY" }, 
        { label: "Previous Weekly", value: "WEEKLY" },
        { label: "Previous Semi Annual", value: "SEMI_ANNUAL" },
        { label: "Previous Monthly", value: "MONTHLY" },
        { label: "Previous Annual", value: "ANNUAL" },
        { label: "Previous Quarterly", value: "QUARTERLY" },
        { label: "Previous Fiscal", value: "FISCAL_YEAR" },
      ];



      const periodCashflowMap = useMemo(() => {
        const map = {};
        (recentCashflows?.latestCashflows || []).forEach(cf => {
          map[cf.periodCashFlow] = cf;
        });
        return map;
      }, [recentCashflows]);

      const existingPeriodLabels = PERIOD_LABELS.filter(({ value }) => periodCashflowMap[value]);

      const [selectedPeriod, setSelectedPeriod] = useState(null);

      const handleCheckboxChange = (period) => {
        if (selectedPeriod === period) {
          setSelectedPeriod(null); // Uncheck
          setResponse("");         // Clear input
        } else {
          setSelectedPeriod(period);
          setResponse(periodCashflowMap[period]?.endBalance ?? "");
        }
      };





      const [openSubAccountInfoId, setOpenSubAccountInfoId] = useState(null);
      const [groupDeleteDialog, setGroupDeleteDialog] = useState(false);
      const [groupToDeleteId, setGroupToDeleteId] = useState("");



      const {
        loading: deleteGroupLoading,
        fn: deleteGroupFn,
        data: deletedGroup,
        error: deleteGroupError
      } = useFetch(deleteSubAccount)

      const handleGroupToDeleteId = (id) => {
        setGroupToDeleteId(id);
        if(groupToDeleteId !== ""){
          setGroupDeleteDialog(true);
        }
      }

      const handleCancelGroupToDeleteId = () => {
        setGroupToDeleteId("");
        if(groupToDeleteId !== ""){
          setGroupDeleteDialog(false);
        }
      }

      const handleDeleteGroup = async () => {
        if(!groupToDeleteId){
          toast.error("Error deleting group.")
        } else {
          deleteGroupFn(groupToDeleteId, id);
          setGroupToDeleteId(null)
        }
      }


      useEffect(() => {
        if (deletedGroup && !deleteGroupLoading){
          setGroupToDeleteId("")
          console.log("Success deleting group.");
          toast.success("Success deleting group.");
          toast.info("Check Group Transaction to ensure accurate amounts.", {
            duration: 180000,
            action: {
              label: "Okay",
              onClick: () => toast.dismiss(), // Dismiss toast on button click
            }
          });
        }
      }, [deletedGroup, deleteGroupLoading])

      useEffect(() => {
        if(deleteGroupError && !deleteGroupLoading){
          setGroupToDeleteId("")
          console.log("Error deleting group.");
          toast.error("Error deleting group.");
        }
      }, [deleteGroupError, deleteGroupLoading])

const selectedSoloTransactions = useMemo(() => {
  // Only include transactions from the Transaction model that are selected
  return filteredAndSortedTransactions.filter(txn => selectedIds.includes(txn.id));
}, [filteredAndSortedTransactions, selectedIds]);


const handleDownloadCDBExcel = () => {
  const dbCategories = [...new Set(selectedSoloTransactions.map(txn => txn.category))];
  const header = [
    "Date",
    "Description",
    "Particular",
    "Reference Number",
    "Cash In Bank",
    ...dbCategories
  ];

  // Only format date, not numbers
  const rows = selectedSoloTransactions.map(txn => {
    const dbCols = dbCategories.map(cat => (txn.category === cat ? txn.amount : ""));
    return [
      formatManilaDate(txn.date),
      txn.description || "",
      txn.particular || "",
      txn.refNumber,
      txn.amount, // raw number
      ...dbCols
    ];
  });

  const totalCashInBank = selectedSoloTransactions.reduce((sum, txn) => sum + Number(txn.amount), 0);
  const totalDBs = dbCategories.map(cat =>
    selectedSoloTransactions
      .filter(txn => txn.category === cat)
      .reduce((sum, txn) => sum + Number(txn.amount), 0)
  );
  const totalsRow = ["", "", "", "TOTAL", totalCashInBank, ...totalDBs];

  const data = [header, ...rows, totalsRow];

  // Create worksheet and workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "CDB");

  // Auto-width columns
  const wscols = header.map((h, i) => ({
    wch: Math.max(
      h.length,
      ...rows.map(row => (row[i] ? row[i].toString().length : 0)),
      totalsRow[i] ? totalsRow[i].toString().length : 0
    ) + 2 // add some padding
  }));
  ws["!cols"] = wscols;

  // Export
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "cash_book.xlsx");
};


// const handleEditTransaction = (transactionId) => {
//   setDropdownDisabledId(true);
//   setEditLoadingId(true);
//   router.push(`/transaction/create?edit=${transactionId}`);
// };

  const [tableBg, setTableBg] = useState(null)

  const tableBgHandler = (id) => {
    setTableBg(id)
  }

  function formatNumberWithCommas(number) {
    return Number(number).toLocaleString();
  }
















    
  return (
    
    <div className='space-y-4'>
       {deleteLoading && (<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>)}
       {updateLoading  && (<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>)}
       {subAccountLoading && (<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>)}
       {deleteGroupLoading && (<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>)}
       {cfsLoading && (<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>)}
       {editLoadingId && (<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>)}
      {/* FILTERS */}
        <div className="lg:flex flex-row items-center justify-between gap-4 mb-4">
          <div className="flex flex-col 
            sm:flex-row py-2 sm:items-center gap-4 justify-start lg:overflow-y-hidden
            md:overflow-x-auto md:max-w-full  md:gap-3">

              <div className='flex flex-col sm:flex-row gap-4'>
                <div className='relative flex'>
                    <Search className='absolute left-2 top-2.5 h-4 text-muted-foreground'/>
                    <Input 
                        className={`${fontZenKaku.className} font-normal pl-8 !text-base w-full md:w-64 lg:w-80 ml-1`}
                        placeholder="Search Ref#, Particular, Account title"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className='flex flex-col lg:flex-row md:flex-row gap-2'>
                  <Select  value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className={`${fontZenKaku.className} font-bold bg-gradient-to-r 
                                        from-blue-500/10 to-purple-500/10 text-blue-400 hover:text-blue-300
                                          border border-blue-500/30 hover:border-blue-500/50
                                          shadow-lg shadow-blue-500/20
                                          transition-all duration-300
                                          px-6 py-3 rounded-full
                                          text-sm tracking-wide
                                          flex items-center gap-2
                                          hover:scale-105
                                          justify-center 
                                          text-center`}>
                          <SelectValue placeholder="All Types"/>
                      </SelectTrigger>

                      <SelectContent>
                          <SelectItem className={`${fontZenKaku.className} font-medium `} value='INCOME'>Inflow</SelectItem>
                          <SelectItem className={`${fontZenKaku.className} font-medium `} value='EXPENSE'>Outflow</SelectItem>
                      </SelectContent>
                  </Select>

                  <Select
                    value={activityFilter}
                    onValueChange={(value) => setActivityFilter(value)}
                    className="w-[140px] text-sm"
                  >
                    <SelectTrigger
                      className={`${fontZenKaku.className} font-bold bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 hover:text-blue-300
                                  border border-blue-500/30 hover:border-blue-500/50
                                  shadow-lg shadow-blue-500/20
                                  transition-all duration-300
                                  px-6 py-3 rounded-full text-sm
                                  flex items-center gap-2
                                  hover:scale-105
                                  justify-center tracking-wide
                                  text-center`}>
                      <SelectValue placeholder="All Activities" />
                    </SelectTrigger>

                    <SelectContent>
                      {/* <SelectItem value="">All Activities</SelectItem> */}
                      <SelectItem className={`${fontZenKaku.className} font-medium`} value="OPERATION">Operating</SelectItem>
                      <SelectItem className={`${fontZenKaku.className} font-medium`} value="INVESTMENT">Investing</SelectItem>
                      <SelectItem className={`${fontZenKaku.className} font-medium`} value="FINANCING">Financing</SelectItem>
                    </SelectContent>
                  </Select>

                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box className="flex flex-col sm:flex-row gap-2 w-full">
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
                        format="yyyy-MM-dd"
                      />
                      <DatePicker
                        label="To"
                        value={toDateRaw}
                        timezone='Asia/Manila'
                        onChange={setToDateRaw}
                        slotProps={{
                          textField: {
                            size: 'small',
                            className: 'w-full sm:w-32 md:w-40 bg-white border border-gray-300 rounded px-2 py-1 text-xs',
                            inputProps: { placeholder: 'End date' }
                          }
                        }}
                        disableFuture={false}
                        format="yyyy-MM-dd"
                        minDate={fromDateRaw}
                      />
                    </Box>
                  </LocalizationProvider>
                  {(searchTerm || typeFilter || activityFilter || fromDateRaw || toDateRaw) && (
                      <Button
                          variant="outline"
                          size="icon"
                          onClick={handleClearFilters}
                          title="Clear Filters"
                              ><X className='h-4 w-5'/></Button>
                  )}


                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                      variant="outline"
                      className={cn(
                          "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 hover:text-blue-300",
                          "border border-blue-500/30 hover:border-blue-500/50",
                          "shadow-lg shadow-blue-500/20",
                          "transition-all duration-300",
                          "px-4 sm:px-6 py-2 sm:py-3 rounded-full",
                          "text-sm",
                          "flex items-center gap-2",
                          "hover:scale-105",
                          "w-full sm:w-auto",
                          `${fontZenKaku.className} font-bold` //Make it full width on small screen
                      )}>
                        <PlusCircleIcon/> Cashflow Statement
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-6 bg-white/2 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl "
                      align="center"
                      style={{ zIndex: 0 }}
                    >
                      <div className="flex flex-col gap-2 mb-2">
                        <h2 className={`${fontZenKaku.className} font-medium text-lg text-black`}>Generate Cashflow Statement</h2>
                        <div >
                          {/* <ul className="grid grid-rows-4 md:grid-rows-none md:grid-cols-2 gap-1">
                            {existingPeriodLabels.length === 0 ? (
                              <li className="text-gray-400">No previous periods found.</li>
                              ) : (
                                existingPeriodLabels.map(({ label, value }) => (
                              <li key={value} className="flex flex-row items-center gap-1">
                                <Checkbox
                                  checked={selectedPeriod === value}
                                  onCheckedChange={() => handleCheckboxChange(value)}
                                  disabled={!periodCashflowMap[value]}
                                  id={`checkbox-${value}`}
                                />
                                 <label htmlFor={`checkbox-${value}`} className={`${fontZenKaku.className} font-normal`}>
                                    {label}
                                  </label>
                                
                                  <span className={`${fontZenKaku.className} font-medium ml-1 text-xs text-gray-500`}>
                                    (₱{Number(periodCashflowMap[value].endBalance).toLocaleString()})
                                  </span>
                                
                              </li>))
                              )}
                          </ul> */}

      <label className={`${fontZenKaku.className} font-normal mb-1 block`}>Beginning Balance</label>
      <select
        className={`${fontZenKaku.className} font-normal w-full p-2 border border-gray-300 rounded bg-white`}
        value={selectedPeriod || (response === "" ? "" : "custom")}
        onChange={e => {
          if (e.target.value === "custom") {
            setSelectedPeriod(null);
            setResponse("");
          } else {
            setSelectedPeriod(e.target.value);
            setResponse(periodCashflowMap[e.target.value]?.endBalance ?? "");
          }
        }}
      >
        <option value="" disabled>Select previous period or custom</option>
        {existingPeriodLabels.map(({ label, value }) => (
          <option key={value} value={value}>
            {label} (₱{Number(periodCashflowMap[value].endBalance).toLocaleString()})
          </option>
        ))}
        <option value="custom">Other (Enter manually)</option>
      </select>
      {(!selectedPeriod || selectedPeriod === "custom") && (
        <Input
          type="number"
          step="0.01"
          value={response}
          onChange={handleSample}
          placeholder="Enter beginning balance"
          className={`${fontZenKaku.className} font-normal !text-base mt-2`}
        />
      )}
    </div>
  </div>
  <form onSubmit={handleCashflow} className="space-y-4">
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <Button
        variant="outline"
        className={`${fontZenKaku.className} font-bold bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 hover:text-blue-300
            border border-blue-500/30 hover:border-blue-500/50
            shadow-lg shadow-blue-500/20
            transition-all duration-300
            px-6 py-3 rounded-full !text-base
            flex items-center gap-2
            hover:scale-105`}
        size="sm"
        type="submit"
        disabled={cfsLoading || !response || selectedIds.length === 0 && selectedSubAccountIds.length === 0}
      >
        {!cfsLoading
          ? ("Generate")
          : (<><Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-500" /> <span className="text-gray-500">Generating</span></>)
        }
      </Button>
    </div>
  </form>
                      <p className={`${fontZenKaku.className} font-normal text-[0.85rem]/[1rem] text-gray-700 mt-4 tracking-wide`}>
                        Choose previous ending balance from respective period.<br/> 
                        Enter new beginning balance for new period only.
                      </p>
                    </PopoverContent>
                  </Popover>

                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogContent onInteractOutside={e => e.preventDefault()} 
                        className="[&>button:last-child]:hidden rounded-md sm:max-w-[90%] md:max-w-[70%] lg:max-w-[60%] 
                        xl:max-w-[50%] max-h-[90vh]">
                      <DialogHeader>
                          <DialogTitle>Cashflow Statement PDF</DialogTitle>
                      </DialogHeader>
                        {cfsLoading
                          ? (
                              <div className="flex justify-center items-center h-48">
                                <BeatLoader color="#36d7b7" />
                                <h1>LOADING</h1>
                              </div> 
                          ) 
                          : ( 
                            <>
                            {isSmallScreen 
                              ? (
                                <div className="flex justify-center gap-2 align-baseline">
                                  {forCfs && forCfs.data && Array.isArray(forCfs.data.transactions)
                                    ? ( 
                                        <PDFDownloadLink 
                                          document={<MyPDFaccountPage cashflow={forCfs.data} subAccounts={forCfs.data.subAccounts} transactions={forCfs.data.transactions} />}
                                          fileName={`Cashflow_Statement_${forCfs.data.id}.pdf`}
                                        >
                                          {({ blob, url, loading, error }) => {
                                            if (!loading){
                                              return <Button className="
                                                bg-white text-black
                                                border border-green-600 hover:border-0
                                                hover:bg-green-600 hover:text-white" onClick={handlePdfDownload} disabled={loading}>
                                              <div className='flex items-center gap-1'>
                                              <Download className="mr-2 sm:mr-3 md:mr-4 h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6"/>
                                                  Download
                                              </div></Button>
                                            }
                                            else if (loading){
                                              <Loader/>,"Downloading PDF."
                                            }
                                          }}
                                        </PDFDownloadLink>
                                    )
                                    : ("SOMETHINGS'S WRONG")
                                  }

                                  {!loadingCfsDelete 
                                    ? <Button 
                                        className='
                                        bg-white text-black
                                          border border-red-600 hover:border-0
                                          hover:bg-red-600 hover:text-white'
                                        onClick={handleCancelPDFdownload}> Cancel </Button>
                                    : <Button variant="destructive" disabled={true}>Cancelling<Loader2  className="mr-2 h-4 w-4 animate-spin text-gray-500" /></Button>
                                  }
                                  <Button variant="outline" 
                                      className="bg-white text-black border-black 
                                      hover:border-0 hover:bg-black 
                                      hover:text-white" 
                                      onClick={() => setIsModalOpen(false)}>
                                    Save only
                                  </Button>
                                </div>
                              ) 
                              : (<>
                                  <PDFViewer style={{ width: '100%', height: '500px' }} showToolbar={false}>
                                    {forCfs && forCfs.data && Array.isArray(forCfs.data.transactions) 
                                      ? (<MyPDFaccountPage cashflow={forCfs.data} subAccounts={forCfs.data.subAccounts} transactions={forCfs.data.transactions} />) 
                                      : (<div>No transactions available for the Cashflow Statement.</div>)
                                    }
                                  </PDFViewer> 
                                  <div className="flex justify-center gap-2 align-baseline">
                                    {forCfs && forCfs.data && Array.isArray(forCfs.data.transactions)
                                      ? ( 
                                          <PDFDownloadLink 
                                            document={<MyPDFaccountPage cashflow={forCfs.data} subAccounts={forCfs.data.subAccounts} transactions={forCfs.data.transactions} />}
                                            fileName={`Cashflow_Statement_${forCfs.data.id}.pdf`}
                                          >
                                            {({ blob, url, loading, error }) => {
                                              if (!loading){
                                                return <Button className="bg-white text-green-500
                                                border border-green-500 hover:border-0
                                                hover:bg-green-500 hover:text-white" 
                                                onClick={handlePdfDownload} disabled={loading}>
                                                <div className='flex items-center gap-1'>
                                                <Download className="mr-2 sm:mr-3 md:mr-4 h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6"/>
                                                    Download
                                                </div></Button>
                                              }
                                              else if (loading){
                                                <Loader/>,"Downloading PDF."
                                              }
                                            }}
                                          </PDFDownloadLink>
                                      )
                                      : ("SOMETHINGS'S WRONG")
                                    }

                                    {!loadingCfsDelete 
                                      ? <Button className='
                                          bg-white text-red-600
                                          border border-red-600 hover:border-0
                                          hover:bg-red-600 hover:text-white' onClick={handleCancelPDFdownload}>Cancel</Button>
                                      : <Button variant="destructive" disabled={true}>Cancelling<Loader2  className="mr-2 h-4 w-4 animate-spin text-gray-500" /></Button>
                                    }
                                    <Button 
                                        variant="outline" 
                                        className="bg-white text-black border-black 
                                        hover:border-0 hover:bg-black 
                                        hover:text-white" 
                                        onClick={() => setIsModalOpen(false)}>
                                      Save only
                                    </Button>
                                  </div>
                                </>
                              )
                            }
                            </>
                          )
                        }
                      <div className="flex justify-around items-center">
                        <DialogFooter>
                          <DialogDescription className={`${fontZenKaku.className} text-black font-medium tracking-normal text-sm text-center`}>
                          {cfsLoading
                            ? "Re-assessing your last entry..."
                            : isSmallScreen
                              ? "PDF ready, download to view. Downloading also saves in Cashflow."
                              : "Preview of generated cashflow statement. Downloading also saves in Cashflow."
                          }
                          </DialogDescription>
                        </DialogFooter>
                      </div>
                      </DialogContent>
                  </Dialog>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                        className={`${fontZenKaku.className} font-bold
                        bg-white hover:bg-blue-600 
                          text-black hover:text-white
                          border border-blue-600 hover:border-0
                          hover:shadow-lg hover:shadow-blue-800/20`}
                        disabled={isDialogOpen || subAccountLoading || deleteGroupLoading} 
                        >
                        Group transactions
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-lg sm:max-w-[90%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] max-h-[90vh]">
                        <DialogHeader>
                        <DialogTitle className={`${fontZenKaku.className} font-bold`}>Group transactions</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                          <div>
                              <label className={`${fontZenKaku.className} !text-base font-medium`}>New group name</label>
                              <input
                              type="text"
                              {...register("name")}
                              className={`${fontZenKaku.className} font-normal w-full p-2 border border-gray-300 rounded` }
                              placeholder="Enter group name"
                              />
                              {errors.name && (<p className={`${fontZenKaku.className} !text-base text-red-500`}>{errors.name.message}</p>)}
                          </div>

                          <div>
                              <label className={`${fontZenKaku.className} !text-base font-medium`}>Description</label>
                              <textarea
                              {...register("description")}
                              className={`${fontZenKaku.className} font-normal w-full p-2 border border-gray-300 rounded`}
                              placeholder="Enter description (optional)"
                              />
                              {errors.description && (
                              <p className={`${fontZenKaku.className} !text-base text-red-500`}>{errors.description.message}</p>
                              )}
                          </div>

                          <div>
                              <label className={`${fontZenKaku.className} !text-base font-medium`}>Parent group's name</label>
                              <input
                              type="text"
                              {...register("parentName")}
                              className={`${fontZenKaku.className} w-full p-2 border border-gray-300 rounded`}
                              placeholder="Enter parent group name (optional)"
                              />
                              {errors.parentName && (
                              <p className={`${fontZenKaku.className} !text-base text-red-500`}>{errors.parentName.message}</p>
                              )}
                          </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={subAccountLoading || isCreateGroupDisabled} 
                            className={`${fontZenKaku.className} md:!text-base text-sm bg-blue-500 text-white`}>
                            {subAccountLoading
                              ? (<><Loader2  className="mr-2 h-4 w-4 animate-spin text-blue-300" />Creating group</>)
                              : "Create group"
                            }
                            </Button>
                        </div>
                        </form>
                        <DialogFooter className="flex md:justify-start md:items-center">
                          <DialogDescription className={`${fontZenKaku.className} tracking-wide md:flex md:flex-row grid grid-rows-2 items-center text-xs lg:text-sm whitespace-nowrap`}>
                            <span className='flex flex-row'>
                            <Link href='/' className='flex flex-row items-center gap-[0.5] 
                              underline underline-offset-4 hover:text-blue-600 mr-1 ' target="_blank">
                            <SquareArrowOutUpRight className='h-3 w-3' />Read</Link>
                            <b className='mr-1 whitespace-nowrap'>Group Transaction</b>
                            </span>
                            guide for smoother experience of grouping transactions.
                          </DialogDescription>
                        </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {selectedIds.length > 0 && (
                    <>
                    <Dialog open={isBulkEdit} onOpenChange={setIsBulkEdit}>
                      <DialogTrigger asChild>
                          <Button
                          className={`${fontZenKaku.className} font-bold
                          bg-white hover:bg-yellow-300
                          text-black hover:text-white
                          border border-yellow-300 hover:border-0
                          hover:shadow-lg hover:shadow-yellow-500/20
                          px-4 py-2 rounded `}
                          disabled={isDialogOpen || subAccountLoading || deleteGroupLoading} // Disable if no transactions are selected
                          >
                          Edit Activity type
                          </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[90%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] max-h-[90vh]">
                          <DialogHeader>
                          <DialogTitle className={`${fontZenKaku.className} font-bold`}>Edit Activity Type</DialogTitle>
                          <DialogDescription className={`${fontZenKaku.className} font-medium`}>Select Activity Type to edit opted transactions.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={async (e) => {
                              e.preventDefault();
                              await handleUpdate();
                            }} className="space-y-4">
                              
                            <div className="flex flex-col gap-1">
                              <label htmlFor="Activity" className={`${fontZenKaku.className} text-base font-medium text-gray-700`}>Activity</label>
                              <select
                                id="Activity"
                                className={`${fontZenKaku.className} text-base font-medium w-full border rounded px-2 py-2 bg-neutral-50 ${
                                  ActivityType ? "text-black" : "text-gray-400"
                                }`}
                                onChange={(e) => setActivityType(e.target.value)}
                                value={ActivityType}
                                required
                                disabled={updateLoading}
                              >
                                <option className="text-base font-medium text-gray-400" value="">Select Activity type</option>
                                <option className="text-base font-medium text-blue-500" value="OPERATION">Operating</option>
                                <option className="text-base font-medium text-purple-500" value="FINANCING">Financing</option>
                                <option className="text-base font-medium text-yellow-500" value="INVESTMENT">Investing</option>
                              </select>
                            </div>
                          <div className="flex justify-end">
                              <Button type="submit" disabled={updateLoading} 
                                className={`${fontZenKaku.className} !text-base font-medium 
                                bg-white hover:bg-yellow-500 
                                text-black hover:text-white
                                border border-yellow-500 hover:border-none`}>
                              {updateLoading
                                ? (<><Loader2  className="mr-2 h-4 w-4 animate-spin text-blue-300" />Editing Activity</>)
                                : "Edit Activity"
                              }
                              </Button>
                          </div>
                          </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={handleDownloadCDBExcel}
                      className={`${fontZenKaku.className} font-bold !text-base
                        bg-white hover:bg-green-600 
                          text-black hover:text-white
                          border border-green-600 hover:border-0
                          hover:shadow-lg hover:shadow-green-800/20`}>
                      <Download className="mr-2 h-4 w-4 font-bold" />
                      Download .xlsx
                    </Button>
                  </>)}
                </div>
              </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {cfsLoading || deleteLoading || selectedIds && selectedIds.length > 0 && (
                <div className="fixed bottom-4 right-4 z-50">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDeleteModal}
                  className={`bg-red-500/90 hover:bg-red-500 text-white
                    border border-red-500/30 hover:border-red-500/50
                    shadow-lg shadow-red-500/20
                    transition-all duration-300
                    px-4 py-2 rounded-full
                    font-medium !text-base tracking-wide
                    flex items-center gap-2 hover:scale-105
                    ${fontZenKaku.className}`}
                >
                  <Trash className="h-4 w-4" />
                  <span>Delete {formatNumberWithCommas(selectedIds.length)} transactions</span> 
                </Button>
              </div>
            )}
            <Dialog open={openBulkDltModal} onOpenChange={setOpenBulkDltModal}>
              <DialogContent className={`${fontZenKaku.className} [&>button:last-child]:hidden`}>
              <DialogHeader>
                  <DialogTitle className="tracking-wide font-bold text-2xl text-center">Delete {selectedIds.length} transaction?</DialogTitle>
                  <DialogDescription className="text-[14.5px]/[22px] text-center">
                    Provide a reason for deleting these transactions. 
                  </DialogDescription>
              </DialogHeader>
              <Textarea 
                required
                value={reason}
                onChange={(e)=> setReason(e.target.value)}
                placeholder="Type your reason here."
              />
              <div className="flex flex-col md:flex-row gap-2 justify-center">  
              <DialogFooter>
                    <Button 
                    type="button"
                    variant="outline"
                    onClick={handleBulkDelete}
                    className="border-2 border-green-400 
                    hover:border-0 hover:bg-green-400 
                    font-medium !text-base 
                    text-green-400 hover:text-white">
                      Yes
                    </Button>
                  
                    <DialogClose asChild>
                      <Button
                        onClick={handleCancelBulkDeleteModal}
                        type="button"
                        variant="outline"
                        className="w-auto
                        font-medium !text-base
                        border-rose-600 hover:border-0 hover:bg-rose-600 
                        text-rose-600 hover:text-white"
                        >Cancel
                      </Button>
                    </DialogClose>
                
              </DialogFooter></div>
                
              </DialogContent>
            </Dialog>
          </div>

        </div> 




      {/* TRANSACTIONS */}
      <Tabs defaultValue='transactions'>
        <TabsList  className={`${fontZenKaku.className} 
          flex flex-row gap-x-2 
          overflow-x-auto md:overflow-x-visible
          whitespace-nowrap
          border-b border-gray-200 mb-4
          w-full
          bg-neutral-300
          rounded-t-md
          px-2 h-12 py-2 shadow-sm
          `}>
          <TabsTrigger disabled={dropdownDisabledId || deleteLoading || deleteGroupLoading} value="transactions" className="font-medium !text-base flex-shrink-0 px-4 py-2">Transactions tab</TabsTrigger>
          <TabsTrigger disabled={dropdownDisabledId || deleteLoading || deleteGroupLoading} value="subAccounts" className="font-medium !text-base flex-shrink-0 px-4 py-2">Grouped transactions tab</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <div className="rounded-md border overflow-x-auto">

            <Table>
              <TableHeader className={`bg-slate-300 ${fontZenKaku.className} `}>
                <TableRow>
                  <TableHead className="w-[50px] text-center">
                    <Checkbox
                      onCheckedChange={handleSelectAll}
                      checked={
                        paginatedTransactions.every((t) => selectedIds.includes(t.id)) &&
                        paginatedTransactions.length > 0
                      }
                    />
                  </TableHead>
                  <TableHead className="text-left cursor-pointer text-base"
                    onClick={() => handleSort("date")}
                  ><div className="flex items-center">
                  Transaction date
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUpWideNarrow className="ml-1 h-4 w-4" />
                    ) : (
                      <ArrowDownNarrowWide className="ml-1 h-4 w-4" />
                    ))}
                </div>
                  </TableHead>
                  <TableHead className="text-left text-base">Particular</TableHead>
                  <TableHead className="text-left cursor-pointer text-base"
                    onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center">
                          Account title
                          {sortConfig.field === "category" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUpWideNarrow className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDownNarrowWide className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                  </TableHead>
                  <TableHead className="text-center w-[150px] text-base">Activity type</TableHead>
                  <TableHead className="text-right cursor-pointer text-base"
                    onClick={() => handleSort("amount")}>
                      <div className="flex items-center justify-end">
                          Amount
                          {sortConfig.field === "amount" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUpWideNarrow className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDownNarrowWide className="ml-1 h-4 w-4" />
                            ))}
                        </div>
                  </TableHead>
                  <TableHead className="text-center text-base hover:cursor-pointer"
                    onClick={() => handleSort("createdAt")}>
                      <div className="flex justify-center">
                        Recorded on
                        {sortConfig.field === "createdAt" &&
                          (sortConfig.direction === "asc" ? (
                            <ArrowUpWideNarrow className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDownNarrowWide className="ml-1 h-4 w-4" />
                        ))}
                      </div>
                  </TableHead>
                  <TableHead className="text-center text-base">Reference number</TableHead>
                  <TableHead className="text-center text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`bg-zinc-200 ${fontZenKaku.className} font-medium text-base`}>
                {paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      No Transactions Found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}
                      className={
                        tableBg === transaction.id
                          ? "bg-sky-100 transition-colors"
                          : ""
                      }
                    >
                      <TableCell className="text-center">
                        <Checkbox
                          onCheckedChange={() => handleSelect(transaction.id)}
                          checked={selectedIds.includes(transaction.id)}
                        />
                      </TableCell>
                      <TableCell className="text-left">{formatDate(transaction.date)}</TableCell>
                      <TableCell className="text-left">{transaction.particular || "No assigned particular"}</TableCell>
                      <TableCell className="text-left">{transaction.category}</TableCell>
                      
                      <TableCell
                          className={cn(
                                "text-center font-medium",
                                {
                                OPERATION: "text-blue-500",
                                INVESTMENT: "text-yellow-500",
                                FINANCING: "text-purple-500",
                                }[transaction.Activity] || "text-gray-500" // Default color if no match
                            )}
                          >
                            {getGerundActivity(transaction.Activity)}
                          </TableCell>
                      <TableCell className={cn(
                              "text-right font-medium tracking-wide",
                              transaction.type === "EXPENSE"
                                ? "text-red-500"
                                : "text-green-500"
                            )}>
                        {transaction.type === "EXPENSE" ? "-" : "+"}
                        {formatTableAmount(transaction.amount.toFixed(2))}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatUtcDateFriendly(transaction.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        {transaction.refNumber}
                      </TableCell>
                      <TableCell className='flex justify-around'>
                        <Popover>
                          <PopoverTrigger asChild className="text-black hover:[box-shadow:inset_0_2px_8px_0_rgba(0,0,0,0.3)]">
                            <Button variant="outline"
                            disabled={subAccountLoading || deleteGroupLoading}
                              className="px-2 py-1 h-8 w-8 flex border-none shadow-none items-center justify-center bg-transparent"
                              aria-label="Open user actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            align="end"
                            className={`${fontZenKaku.className} w-56 max-w-xs sm:max-w-sm md:max-w-md p-4 rounded-xl shadow-lg bg-white`}
                            sideOffset={8}>

                            <div className="flex flex-col gap-2">
                            {/* <Button
                              onClick={() => handleEditTransaction(transaction.id)}
                              variant="outline"
                              className="flex items-center gap-2 
                              text-yellow-500 border-yellow-500 
                              hover:text-black 
                                hover:border-0
                                bg-transaparent hover:!bg-yellow-400/45 hover:!backdrop-blur-0
                                hover:shadow-md hover:shadow-gray-500 
                              ">
                              <span className="flex items-center">
                                <Pen className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true" />
                                <span className="ml-2 text-xs sm:text-sm md:text-base font-medium">Edit</span>
                              </span>
                            </Button> */}
                          
                            <Button
                                onClick={() => handleDeletingModal(transaction.id)}
                                variant="outline"
                                className="flex items-center gap-2 text-rose-600 border-rose-600 hover:bg-rose-600 hover:text-white hover:border-0">
                                <span className="flex items-center">
                                  <Trash className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true" />
                                  <span className="ml-2 text-xs sm:text-sm md:text-base font-medium">Delete</span>
                                </span>
                              </Button>

                              <Button
                                onClick={() => TransactionDetailshandler(transaction)} 
                                variant="outline"
                                className="flex items-center gap-2 text-blue-700 border-blue-700 hover:bg-blue-700 hover:text-white hover:border-0"
                              >
                                <span className="flex items-center">
                                  <Info className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true"/>
                                  <span className="ml-2 text-xs sm:text-sm md:text-base font-medium">Details</span>
                                </span>
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>

                        <Dialog open={TransactionIdToDelete === transaction.id} onOpenChange={(open) => setTransactionIdToDelete(open ? transaction.id : null)}>
                            <DialogContent className={`${fontZenKaku.className} [&>button:last-child]:hidden`}>
                            <DialogHeader>
                                <DialogTitle className="tracking-wide font-bold text-2xl text-center">Delete this transaction?</DialogTitle>
                                <DialogDescription className="text-[14.5px]/[22px] text-center">
                                  Provide a reason for deleting this transaction. 
                                </DialogDescription>
                            </DialogHeader>
                            <Textarea 
                              required
                              disabled={deleteLoading}
                              value={reason}
                              onChange={(e)=> setReason(e.target.value)}
                              placeholder="Type your reason here."
                            />
                            <div className="flex flex-col md:flex-row gap-2 justify-center">  
                            <DialogFooter>
                                  <Button 
                                  type="button"
                                  variant="outline"
                                  disabled={deleteLoading}
                                  onClick={handleSingleDelete}
                                  className="border-2 border-green-400 
                                  hover:border-0 hover:bg-green-400 
                                  font-medium !text-base 
                                  text-green-400 hover:text-white">
                                    Yes
                                  </Button>
                                
                                  <DialogClose asChild>
                                    <Button
                                      disabled={deleteLoading}
                                      onClick={handleCancelDeletingModal}
                                      type="button"
                                      variant="outline"
                                      className="w-auto
                                      font-medium !text-base
                                      border-rose-600 hover:border-0 hover:bg-rose-600 
                                      text-rose-600 hover:text-white"
                                      >Cancel
                                    </Button>
                                  </DialogClose>
                              
                            </DialogFooter></div>
                              
                            </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <PaginationControls
              currentPage={currentTransactionPage}
              totalPages={totalTransactionPages}
              onPageChange={setCurrentTransactionPage}
            />
          </div>
        </TabsContent>

        <TabsContent value="subAccounts">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className={`${fontZenKaku.className}`}>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      onCheckedChange={handleSelectAllSubAccounts}
                      checked={
                        paginatedSubAccounts.every((subAccount) =>
                          selectedSubAccountIds.includes(subAccount.id)
                        ) && paginatedSubAccounts.length > 0
                      }
                    />
                  </TableHead>
                  <TableHead className="tracking-wide font-medium !text-base">Name</TableHead>
                  <TableHead className="tracking-wide text-left font-medium !text-base">Amount</TableHead>
                  <TableHead className="tracking-wide text-right font-medium !text-base">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`${fontZenKaku.className}`}>
                {paginatedSubAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No group found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSubAccounts.map((subAccount) => (
                    <TableRow key={subAccount.id}>
                      <TableCell>
                        <Checkbox
                          onCheckedChange={() => handleSelectSubAccount(subAccount.id)}
                          checked={selectedSubAccountIds.includes(subAccount.id)}
                        />
                      </TableCell>
                      <TableCell className="!text-base font-medium">{subAccount.name}</TableCell>
                      <TableCell className="text-left !text-base font-medium">
                        {formatTableAmount(subAccount.balance?.toFixed(2)) || "0.00"}
                      </TableCell>
                      <TableCell className="flex justify-end items-end">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline"
                            disabled={subAccountLoading || deleteGroupLoading}
                              className="px-2 py-1 h-8 w-8 flex border-0 items-center justify-center"
                              aria-label="Open user actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            align="end"
                            className={`${fontZenKaku.className} w-56 max-w-xs sm:max-w-sm md:max-w-md p-4 rounded-xl shadow-lg bg-white`}
                            sideOffset={8}>

                            <div className="flex flex-col gap-2">
                          
                            <Button
                                onClick={() => handleGroupToDeleteId(subAccount.id)}
                                variant="outline"
                                className="flex items-center gap-2 text-rose-600 border-rose-600 hover:bg-rose-600 hover:text-white hover:border-0">
                                <span className="flex items-center">
                                  <Trash className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true" />
                                  <span className="ml-2 text-xs sm:text-sm md:text-base font-medium">Delete</span>
                                </span>
                              </Button>

                              <Button
                                onClick={() => setOpenSubAccountInfoId(subAccount.id)}
                                variant="outline"
                                className="flex items-center gap-2 text-blue-700 border-blue-700 hover:bg-blue-700 hover:text-white hover:border-0"
                              >
                                <span className="flex items-center">
                                  <Info className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" aria-hidden="true"/>
                                  <span className="ml-2 text-xs sm:text-sm md:text-base font-medium">Details</span>
                                </span>
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>

                      <Dialog open={openSubAccountInfoId === subAccount.id} onOpenChange={(open) => setOpenSubAccountInfoId(open ? subAccount.id : null)}>
                          <DialogContent className={`${fontZenKaku.className} rounded-lg [&>button:last-child]:hidden`}>
                          <DialogHeader>
                              <DialogTitle className="tracking-wide font-bold text-2xl md:text-3xl text-center text-blue-600">Group Transaction Details</DialogTitle>
                              <DialogDescription className="font-normal text-sm text-center">
                                  These details are only about this opened group.
                              </DialogDescription>
                          </DialogHeader>
                            <div className="flex">
                              <div className="flex-1">
                                <p className="font-medium text-base text-gray-700">
                                  <label className='!font-bold !text-medium md:!text-lg'>Name:</label> {subAccount.name}
                                </p>
                                <p className="font-medium text-base text-gray-700">
                                  <label className='!font-bold !text-medium md:!text-lg'>Amount:</label> {formatTableAmount(subAccount.balance?.toFixed(2)) || "0.00"}
                                </p>
                                <p className="font-medium text-base text-gray-700">
                                  <label className='!font-bold !text-medium md:!text-lg'>Parent of:</label> {`${subAccount.children.length} groups` || "No child group"}
                                </p>
                                <p className="font-medium text-base text-gray-700">
                                  <label className='!font-bold !text-medium md:!text-lg'>Transactions in this group only:</label> {subAccount.transactions.length || "No Transactions"}
                                </p>
                                <p className="font-medium text-base text-gray-700">
                                  <label className='!font-bold !text-medium md:!text-lg'>Description:</label> {subAccount.description || "No description available"}
                                </p>
                                <p className="font-medium text-base text-gray-700">
                                  <label className='!font-bold !text-medium md:!text-lg'>Created On:</label> {formatUtcDateWithTime(subAccount.createdAt) || "No date"}
                                </p>
                                <p className="font-medium text-base text-gray-700">
                                  <label className='!font-bold !text-medium md:!text-lg'>Updated Last:</label> {subAccount?.updatedAt ? formatUtcDateWithTime(subAccount.updatedAt) : "No date"}
                                </p>
                              </div>
                            </div>
                          <DialogClose asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-auto
                              border-black hover:border-0 hover:bg-black hover:text-white"
                              >Close
                            </Button>
                          </DialogClose>
                          </DialogContent>
                          
                      </Dialog>
                          
                      <Dialog open={groupToDeleteId === subAccount.id} onOpenChange={(open) => setGroupToDeleteId(open ? subAccount.id : null)}>
                          <DialogContent className={`${fontZenKaku.className} [&>button:last-child]:hidden`}>
                          <DialogHeader>
                              <DialogTitle className="tracking-wide font-bold text-2xl text-center">Delete this group?</DialogTitle>
                              <DialogDescription className="text-[14.5px]/[22px] text-center">
                                  Deleting this group will not delete other related child groups. 
                              </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col md:flex-row gap-2 justify-center">
                          <DialogFooter>
                                <Button 
                                disabled={deleteGroupLoading}
                                type="button"
                                variant="outline"
                                onClick={handleDeleteGroup}
                                className="border-2 border-green-400 
                                hover:border-0 hover:bg-green-400 
                                font-medium !text-base 
                                text-green-400 hover:text-white">
                                  Yes
                                </Button>
                              
                                <DialogClose asChild>
                                  <Button
                                    disabled={deleteGroupLoading}
                                    onClick={handleCancelGroupToDeleteId}
                                    type="button"
                                    variant="outline"
                                    className="w-auto
                                    font-medium !text-base
                                    border-rose-600 hover:border-0 hover:bg-rose-600 
                                    text-rose-600 hover:text-white"
                                    >Cancel
                                  </Button>
                                </DialogClose>
                            
                          </DialogFooter></div>
                            
                          </DialogContent>
                      </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <PaginationControls
              currentPage={currentSubAccountPage}
              totalPages={totalSubAccountPages}
              onPageChange={setCurrentSubAccountPage}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      
    </div>
    
  )
}
export default TransactionTable

