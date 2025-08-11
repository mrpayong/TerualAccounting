


"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDown, ArrowUp, ChartLine, Check, CircleArrowUp, CircleX, Loader2, Pen, PenOff, Plus, Square, SquareArrowDown, SquareArrowUp, Trash, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteCashflow, updateBalanceQuick } from "@/actions/cashflow";
import useFetch from "@/hooks/use-fetch";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
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
import Swal from "sweetalert2";
import { Zen_Kaku_Gothic_Antique } from "next/font/google";

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})


function Cashflow ({cashflows, name}) {
  const router = useRouter(); // For navigation
  const period = [...new Set(cashflows.map(c => c.periodCashFlow))];
  const [activeTab, setActiveTab] = useState(period[0] || ""); // Default to the first period or empty string
  const [isLoading, setIsLoading] = useState(false);
  const [cardClickedLoad, setCardClickedLoad] = useState(false);


const cashflowRecords = cashflows;
// console.log("cashflowRecords", cashflowRecords[2]);
const Name = name; // Fallback to a default name if not available


const accumulatedAmounts = cashflowRecords.reduce(
    (totals, record) => {
      if (record.activityTotal && Array.isArray(record.activityTotal)) {
        totals.operating += record.activityTotal[0] || 0; // Operating
        totals.investing += record.activityTotal[1] || 0; // Investing
        totals.financing += record.activityTotal[2] || 0; // Financing
      }
      return totals;
    },
    { operating: 0, investing: 0, financing: 0 }
  );
  const filteredRecords = cashflowRecords.filter(
    (record) => record.periodCashFlow === activeTab
  );


  const handleCardLoad = () => {
    setCardClickedLoad(true)
  }

  const handleTabChange = (value) => {
    
    setIsLoading(true);
    setActiveTab(value);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };



  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  const formatAmount = (amount) => {
      return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const {
    loading: updateBalLoading,
    fn: updateBalanceFn,
    data: updatedBalanceData,
    error: updateBalanceError,
  } = useFetch(updateBalanceQuick);

  const [updateBalanceField, setUpdateBalanceField] = useState(false)
  const [updateCfsId, setCfsId] = useState("");
  const [updateBegBal, setUpdateBegBal] = useState(0);
  const [updateEndBal, setUpdateEndBal] = useState(0);
  const [updateNetChange, setUpdateNetChange] = useState(0);
  const [editButton, setEditButton] = useState(false);
  const [editButtonShow, setEditButtonShow] = useState(false)

  const handleButtonShow = () => {
    setEditButtonShow(true);
  }
  
  const handleButtonNoShow = () => {
    setEditButtonShow(false);
  }

  const handleEditButton = (id, record) => {
    setUpdateBalanceField(true);
    setCfsId(id);
    setUpdateBegBal(record.startBalance);
    setUpdateEndBal(record.endBalance);
    setUpdateNetChange(record.netChange);
  }
  const handleCancelEditButton = (id) => {
    setCfsId("")
    setUpdateBalanceField(false);
    setEditButton(false)
  }

const handleSwitchChange = (checked) => {
  setEditButtonShow(checked);
  setEditButton(checked);
    if (checked) {
    toast.warning("Turn off Quick Edit Mode to view individual cashflow statement.", {
      duration: 180000,
      className: "tracking-wide",
      actionButtonStyle: {
        backgroundColor: "transparent",
        color: "white",
        border: "1px solid black",
        padding: "8px 16px",
        borderRadius: "4px",
      },
      icon: <PenOff className="text-rose-600 h-4 w-4"/>,
      action: {
        label: "Okay",
        onClick: () => toast.dismiss(), // Dismiss toast on button click
      },
      style: {
        background: '#d97706',
        color: 'white'
      }
    });
  }
  if (!checked) {
    setUpdateBalanceField(false); // Reset input field state
    setCfsId("");                 // Reset editing card state
  }
};

  const handleActiveBalanceField = () => {
    // setCfsId(record.id);
    // setUpdateBegBal(record.startBalance);
    // setUpdateEndBal(record.endBalance);
    // setUpdateNetChange(record.netChange);
    setCardClickedLoad(true)
    if (updateCfsId) {
      updateBalanceFn(
        updateCfsId, 
        updateNetChange, 
        updateBegBal, 
        updateEndBal
      )
    } else {
      console.log("Error Quick update");
    }
  }

  // const handleCancelBalanceField = () => {
  //   setUpdateBalanceField(false);
  //   setCfsId("");
  // }

  // const handleUpdateBalance = () => {
  //   if (updateCfsId || updateBegBal || updateEndBal || updateNetChange) {
  //     updateBalanceFn(
  //       updateCfsId, 
  //       updateNetChange, 
  //       updateBegBal, 
  //       updateEndBal
  //     )
  //   } else {
  //     console.log("Error Quick update");
  //   }
  // }

  useEffect(() => {
    if(updatedBalanceData && !updateBalLoading){
      setCardClickedLoad(false)
      setUpdateBalanceField(false);
      setCfsId("");               
      setEditButton(false);
      toast.success("Transaction updated.");
    }
  },[updatedBalanceData, updateBalLoading]);

  useEffect(() => {
    if(updateBalanceError && !updateBalLoading){
      setCardClickedLoad(false)
      setUpdateBalanceField(false);
      setCfsId("");               
      setEditButton(false);
      toast.error("Error updating Transaction");
    }
  },[updateBalanceError, updateBalLoading]);
  
   

  const [backLoad, setBackLoad] = useState(false)

  const handleBackLoad = () => {
    setBackLoad(true);
    router.push(`/account/${cashflowRecords[0].accountId}`)
  };


  const {
    loading: deleteCFSLoading,
    fn: deleteCFSfn,
    data: deletedCFS,
    error: deleteCFSError,
  } = useFetch(deleteCashflow);

  

  const [deleteCfsId, setDeleteCfsId] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleDeleteCfsId = (id) =>{
    setDeleteCfsId(id);
    setOpenDeleteDialog(true);
  }

  const handleCancelDeleteCfsId = () =>{
    setDeleteCfsId("id");
    setOpenDeleteDialog(false);
  }

  const handleDeleteCFS = () => {
    setOpenDeleteDialog(false);
    if (deleteCfsId) {
      deleteCFSfn(deleteCfsId);
      setCardClickedLoad(true);
    } else {
      console.log("Error deleting Cashflow Statement");
    } 
  }

  useEffect(() => {
    if(deletedCFS && !deleteCFSLoading){
      setCardClickedLoad(false)
      setDeleteCfsId("")
      toast.success("Deleted Cashflow.");
    }
  },[deletedCFS, deleteCFSLoading]);

  useEffect(() => {
    if(deleteCFSError && !deleteCFSLoading){
      setCardClickedLoad(false)
      setOpenDeleteDialog(false)
      setDeleteCfsId("")
      toast.error("Error Deleting Cashflow");
    }
  },[deleteCFSError, deleteCFSLoading]);




  const deterimeTimeFrame = (period) => {
    switch (period) {
      case "DAILY":
        return "Daily";
      case "SEMI_ANNUAL":
        return "Semi Annual";
      case "WEEKLY":
        return "Weekly";
      case "MONTHLY":
        return "Monthly";
      case "ANNUAL":
        return "Annual";
      case "QUARTERLY":
        return "Quarterly";
      case "FISCAL_YEAR":
        return "Fiscal"
      default:
        "" // Default classification for longer ranges
        break;
    }
  }


  // const [unclickableNotify, setUnclickableNotify] = useState(false);

  // const handleUnclickable = () => {
  //   if(unclickableNotify){
  //     toast.info("Turn off Quick Edit Mode to access individual cashflow statement.", {
  //     duration: 180000,
  //     actionButtonStyle: {
  //       backgroundColor: "transparent", // Green background
  //       color: "blue", // White text
  //       border: "1px solid skyblue", 
  //       padding: "8px 16px", // Padding for the button
  //       borderRadius: "4px", // Rounded corners
  //     },
  //     action: {
  //       label: "Okay",
  //     }
  //     })
  //   }
  //   return;
  // }



  const PERIODS = ["DAILY", "WEEKLY", "MONTHLY", "SEMI_ANNUAL", "ANNUAL", "QUARTERLY", "FISCAL_YEAR"];
  const existingPeriods = PERIODS.filter(period =>
    cashflowRecords.some(record => record.periodCashFlow === period)
  );
















  return (


    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${fontZenKaku.className} mb-8`}>
          <div className="flex flex-row items-center justify-between">
            <h1 className="text-2xl md:text-5xl font-black text-blue-900 mb-2">
              Cashflow Statements
            </h1>
            <Button
              variant="outline"
              disabled={backLoad}
              className="border border-black bg-blue-50
              hover:bg-black hover:border-none
              text-black hover:text-white !h-7 md:!h-9
              !text-xs md:!text-sm px-2 py-1 md:px-4 md:py-2
              hover:shadow-md hover:shadow-black/45 transition-all duration-300"
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
          
          <p className="text-xs md:text-base text-blue-600">
            These are cashflow statements of {Name}
          </p>
        </div>

        {/* Accumulated Amounts */}
        {/* correct the values */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white transform hover:scale-105 transition-all duration-300">
            <h3 className="text-sm font-medium text-blue-600 mb-2">
              Accumulated Operating Activities
            </h3>
            <p className="text-3xl font-bold text-blue-900">
                {formatAmount(accumulatedAmounts.operating)}
            </p>
          </Card>

          <Card className="p-6 border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-white transform hover:scale-105 transition-all duration-300">
            <h3 className="text-sm font-medium text-amber-600 mb-2">
              Accumulated Investing Activities
            </h3>
            <p className="text-3xl font-bold text-amber-900">
            {formatAmount(accumulatedAmounts.investing)}
            </p>
          </Card>

          <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-100 to-white transform hover:scale-105 transition-all duration-300">
            <h3 className="text-sm font-medium text-blue-700 mb-2">
              Accumulated Financing Activities
            </h3>
            <p className="text-3xl font-bold text-blue-900">
                {formatAmount(accumulatedAmounts.financing)}
            </p>
          </Card>
        </div> */}


        










        {/* Transactions Table */}
        <div className={`${fontZenKaku.className} bg-white rounded-xl shadow-lg p-6 border border-blue-100`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-row items-center justify-center gap-2">
              <h2 className="text-2xl font-bold text-blue-900 capitalize">
                {deterimeTimeFrame(activeTab)} Cashflows
              </h2>
               {cardClickedLoad
                  ? (<Loader2 className="h-5 w-5 text-gray-500 animate-spin"/>) 
                  : ("")
                }
            </div>
            {cashflows.length === 0
              ? ("")
              : ( <div className="flex font-medium items-center space-x-2 whitespace-nowrap">
                  <label className="text-sm md:text-base">Quick Edit Mode</label>
                  <Switch 
                      checked={editButtonShow}
                      onCheckedChange={handleSwitchChange}
                      className="data-[state=checked]:bg-blue-700"
                    />
                </div>)
            }
          </div>

          <Tabs
            defaultValue="daily"
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="w-full overflow-x-auto md:overflow-x-visible">
            <TabsList className="grid grid-cols-5 min-w-[500px] gap-2 bg-blue-50 p-1 rounded-lg mb-6">
              {existingPeriods.map(
                (period) => (
                  <TabsTrigger
                    key={period}
                    value={period}
                    disabled={cardClickedLoad}
                    className="font-medium !text-base whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    {deterimeTimeFrame(period.charAt(0).toUpperCase() + period.slice(1))}
                  </TabsTrigger>
                )
              )}
            </TabsList>
            </div>
          </Tabs>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center space-x-4 p-4 border border-blue-100 rounded-lg"
                >
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-8 w-[100px]" />
                </div>
              ))}
            </div>
          ) : (cashflows.length === 0 
                  ? (
                    <div className="flex flex-col items-center justify-center h-[500px]">
                      <CircleX className="h-16 w-16 text-red-500 mb-4" />
                      <p className="text-lg text-gray-600">
                        No cashflow statements found.
                      </p>
                    </div>
                  )
                  :(
                    <div className="h-[500px] w-full overflow-y-auto overflow-x-auto md:overflow-x-hidden">
                      <div className="space-y-4 min-w-[600px] md:min-w-0">
                      {filteredRecords.length === 0 
                        ? (<span className="text-slate-600">Pick a period.</span>)
                        : (
                            filteredRecords.map((record) => (
                              // <Link >
                                <Card
                                  key={record.id}
                                  onClick={
                                    !editButtonShow // Only clickable when not editing
                                      ? () => {
                                          setCardClickedLoad(true);
                                          router.push(`/CashflowStatement/${record?.accountId}/${record?.id}`);
                                        }
                                      : undefined
                                  }
                                  className="p-6 transition-all duration-300 hover:shadow-lg cursor-pointer border border-blue-100 hover:border-blue-300 bg-white"
                                >
                                  <div className="flex items-center justify-between">
                                    {/* LEFT SIDE */}
                                    <div className="flex items-start space-x-4">
                                      <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center bg-sky-100`}
                                      >{editButtonShow
                                        ? (<>
                                            <Dialog onOpenChange={setOpenDeleteDialog}>
                                              <DialogTrigger asChild>
                                                <Button 
                                                  className="border-0 bg-none rounded-full hover:bg-sky-100 
                                                  bg-opacity-100 z-10" 
                                                  onClick={() => handleDeleteCfsId(record.id)}
                                                  variant="ghost">
                                                    <Trash className="h-6 w-6 text-red-600 cursor-pointer"/>
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
                                                <DialogHeader>
                                                  <DialogTitle >
                                                    <label className="font-medium font-base flex justify-center">
                                                      Delete this Cashflow Statement?
                                                    </label>
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <div className="flex justify-center">
                                                <DialogFooter>
                                                  <DialogClose asChild>
                                                    <Button
                                                      disabled={deleteCFSLoading}
                                                      className="font-medium !text-base
                                                      bg-white border border-black text-black
                                                      hover:bg-black hover:border-none hover:text-white" 
                                                      onClick={handleCancelDeleteCfsId}
                                                      variant="outline">Cancel</Button>
                                                  </DialogClose>
                                                  <Button
                                                    disabled={deleteCFSLoading}
                                                    onClick={handleDeleteCFS}
                                                    type="button"
                                                    variant="outline"
                                                    className="w-auto font-medium !text-base
                                                    border-rose-600 hover:border-0 hover:bg-rose-600 
                                                    text-rose-600 hover:text-white"
                                                    >Delete
                                                  </Button>
                                                </DialogFooter>
                                                </div>
                                              </DialogContent>
                                            </Dialog>
                                          
                                          </>
                                          )
                                        : (
                                          <>{record.netChange > 0 ? (
                                            <SquareArrowUp className="text-green-600" />
                                          ) : record.netChange < 0 ? (
                                            <SquareArrowDown className="text-red-600" />
                                          ) : (
                                            <Square className="text-zinc-500" />
                                          )}</>
                                        )
                                        
                                      }
                                          
                                      </div>
                                      <div className="flex flex-col py-4 justify-center">
                                        <span className="font-medium text-base text-blue-600">
                                            Created On: {formatDate(record.createdAt)}
                                          </span>
                                      </div>
                                          
                                    
                                    </div>



                                    {/* RIGHT SIDE */}
                                    <div className="flex items-center space-x-4">
                                      {updateBalanceField && updateCfsId === record.id
                                        ? (
                                          <input 
                                          type="number" 
                                          disabled={updateBalLoading}
                                          onChange={e => setUpdateBegBal(e.target.value)}
                                          value={updateBegBal}
                                          className="border border-gray-300 border-b-black rounded
                                          px-2 py-1 w-20 sm:w-24 md:w-28 font-mono text-xs 
                                          focus:outline-none focus:ring-2 
                                          focus:ring-blue-200 transition"
                                          />
                                          )
                                        : (
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger>
                                                  <span className="font-medium text-base text-blue-700 bg-blue-100 px-2 py-1 rounded-lg cursor-pointer">
                                                    {formatAmount(record.startBalance)}
                                                  </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-gradient-to-br from-blue-50 to-blue-200 text-blue-900 p-4 rounded-lg shadow-md border border-blue-300">
                                                  <p className="font-medium text-sm">
                                                    <strong className="text-gold-600">Beginning Balance:</strong> {formatAmount(record.startBalance)}
                                                  </p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          )
                                      } 
                                    

                                    {/* Tooltip for Ending Balance */}
                                    {updateBalanceField && updateCfsId === record.id
                                        ? (
                                          <input 
                                          type="number" 
                                          disabled={updateBalLoading}
                                          onChange={e => setUpdateEndBal(e.target.value)}
                                          value={updateEndBal}
                                          className="border border-gray-300 border-b-black rounded
                                          px-2 py-1 w-20 sm:w-24 md:w-28 font-mono text-xs 
                                          focus:outline-none focus:ring-2 
                                          focus:ring-blue-200 transition"/>
                                          )
                                        : (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <span className="font-medium text-base text-blue-700 bg-blue-100 px-2 py-1 rounded-lg cursor-pointer">
                                            {formatAmount(record.endBalance)}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gradient-to-br from-blue-50 to-blue-200 text-blue-900 p-4 rounded-lg shadow-md border border-blue-300">
                                          <p className="font-medium text-sm">
                                            <strong className="text-gold-600">Ending Balance:</strong> {formatAmount(record.endBalance)}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider> 
                                  )}
                                    

                                    {updateBalanceField && updateCfsId === record.id
                                        ? (
                                          <input 
                                          type="number" 
                                          disabled={updateBalLoading}
                                          onChange={e => setUpdateNetChange(e.target.value)}
                                          value={updateNetChange}
                                          className="border border-gray-300 border-b-black rounded
                                          px-2 py-1 w-20 sm:w-24 md:w-28 font-mono text-xs 
                                          focus:outline-none focus:ring-2 
                                          focus:ring-blue-200 transition"/>
                                          )
                                        : (
                                      <span
                                        className={`font-medium text-xl ${
                                          record.netChange > 0
                                            ? "text-green-600"
                                            : record.netChange < 0
                                              ? "text-red-600"
                                              : "text-black"
                                        }`}
                                      >
                                        {record.netChange > 0 ? "+" : ""}
                                        {formatAmount(record.netChange)}
                                      </span>
                                      )}
                                      <div className={`
                                        flex flex-roW
                                        ${editButtonShow ? "gap-2" : ""}
                                        `}>
                                        {editButtonShow
                                          ? (
                                            updateCfsId === record.id ? (
                                              <>
                                                <Button 
                                                  variant="outline"
                                                  disabled={updateBalLoading}
                                                  className="border-2 border-green-300 group hover:border-white hover:bg-green-400"
                                                  onClick={handleActiveBalanceField}>
                                                  <Check className="h-5 w-5 text-green-400 group-hover:text-white" />
                                                </Button>
                                                <Button 
                                                  disabled={updateBalLoading}
                                                  variant="destructive"
                                                  onClick={handleCancelEditButton}>
                                                  <PenOff className="h-5 w-5" />
                                                </Button>
                                              </>
                                            ) : (
                                              <Button
                                                variant="outline"
                                                className="border-2 border-yellow-400 group text-lg hover:border-white hover:bg-yellow-400"
                                                onClick={() => handleEditButton(record.id, record)}>
                                                <Pen className="w-5 h-5  text-yellow-400 group-hover:text-white" />
                                              </Button>
                                            )
                                          )
                                          : ""
                                        }
                                        

                                        
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              // </Link>
                            ))
                        )
                      }
                      </div>
                    </div>
                    )
                )}
        </div>
      </div>
    </div>
  );
};

export default Cashflow;
