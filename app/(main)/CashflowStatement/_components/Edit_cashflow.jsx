'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import { updateNetchange, updateCashflow, updateCashflowTransaction, updateEndBalance, updateStartBalance, updateTotalFinancing, updateTotalInvesting, updateTotalOperating } from "@/actions/cashflow";
import Link from "next/link";
import { Check, Loader2, SquarePen, Trash, X } from "lucide-react";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

export default function EditCashflow({ cashflow }) {
  const router = useRouter();
  const [goBack, setGoBack] = useState(false);

  const handleBack = () => {
    setGoBack(true);
    router.back();
  }


  const {
    loading: isLoadingUpdateNet,
    fn: updateNetFn,
    data: updatedNetData,
    error: errorUpdatingNet
  } = useFetch(updateNetchange);

  const [netChangeInput, setNetChangeInput] = useState(0)
  const [netInputField, setNetInputField] = useState(false);
  const [UpdateNetChangeId, setUpdateNetChangeId] = useState("");
  
  const handleUpdateNetChange = () => {
    if(netChangeInput){
      if(isNaN(netChangeInput) || netChangeInput === "" || netChangeInput === null){
        toast.error("[2] Invalid value")
      } else {
        updateNetFn(cashflow.id, netChangeInput)
      }
    } else {
      toast.error("[1] Invalid input")
    }
  }

  const UpdateCancelNetChangeField = () => {
    setNetInputField(false);
    setUpdateNetChangeId("");
  }
  const UpdateActiveNetChangeField = (cashflow) => {
    setNetInputField(true);
    setUpdateNetChangeId(cashflow.id);
    setNetChangeInput(cashflow.netChange);
  }

  useEffect(() => {
    if(updatedNetData && !isLoadingUpdateNet){
      setNetInputField(false);
      toast.success("Gross updated.");
    }
  },[updatedNetData, isLoadingUpdateNet])

    useEffect(() => {
    if(errorUpdatingNet && !isLoadingUpdateNet){
      setNetInputField(false);
      toast.error("Error updating Gross");
    }
  },[errorUpdatingNet, isLoadingUpdateNet])







  const formatTableAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits:3,
      maximumFractionDigits:3,
    }).format((amount));
  };
  const ACTIVITY_ORDER = ["OPERATION", "INVESTMENT", "FINANCING"];

    const sortIncomeExpense = (arr) => {
    return [...arr].sort((a, b) => {
      if (a.type === b.type) return 0;
      if (a.type === "INCOME") return -1;
      return 1;
    });
  };

const groupedTransactions = cashflow.transactions.reduce((acc, tx) => {
  const key = tx.Activity || "OTHER";
  if (!acc[key]) acc[key] = [];
  acc[key].push(tx);
  return acc;
}, {});

Object.keys(groupedTransactions).forEach(key => {
  groupedTransactions[key] = sortIncomeExpense(groupedTransactions[key]);
});

const activityTotal = cashflow.activityTotal || [0,0,0];

// Define display labels for Activity
const ACTIVITY_LABELS = {
  OPERATION: "Operating Activities",
  INVESTMENT: "Investing Activities",
  FINANCING: "Financing Activities",
  OTHER: "Other Activities"
};






  const {
    loading: isLoadingUpdateBegBal,
    fn: updateStartBalanceFn,
    data: updatedStartBalance,
    error: errorStartBalance
  } = useFetch(updateStartBalance);

  const [StartBalanceInput, setStartBalanceInput] = useState(0)
  const [StartBalanceInputField, setStartBalanceInputField] = useState(false);
  const [UpdateStartBalanceId, setUpdateStartBalanceId] = useState("");
  
  const handleUpdateStartBalance = () => {
    if(StartBalanceInput){
      if(isNaN(StartBalanceInput) || StartBalanceInput === "" || StartBalanceInput === null){
        toast.error("[2] Invalid value")
      } else {
        updateStartBalanceFn(cashflow.id, StartBalanceInput)
      }
    } else {
      toast.error("[1] Invalid input")
    }
  }

  const UpdateCancelStartBalanceField = () => {
    setStartBalanceInputField(false);
    setUpdateStartBalanceId("");
  }

  const UpdateActiveStartBalanceField = (cashflow) => {
    setStartBalanceInputField(true);
    setUpdateStartBalanceId(cashflow.id);
    setStartBalanceInput(cashflow.startBalance);
  }

  useEffect(() => {
    if(updatedStartBalance && !isLoadingUpdateBegBal){
      setStartBalanceInputField(false);
      toast.success("Beginning Balance updated.");
    }
  },[updatedStartBalance, isLoadingUpdateBegBal])

    useEffect(() => {
    if(errorStartBalance && !isLoadingUpdateBegBal){
      setStartBalanceInputField(false);
      toast.error("Error updating Beginning Balance");
    }
  },[errorStartBalance, isLoadingUpdateBegBal])





  
  const {
    loading: isLoadingEndBal,
    fn: updateEndBalFn,
    data: updatedEndBal,
    error: errorEndBal
  } = useFetch(updateEndBalance);

  const [EndBalInput, setEndBalInput] = useState(0)
  const [EndBalInputField, setEndBalInputField] = useState(false);
  const [UpdateEndBalId, setUpdateEndBalId] = useState("");
  
  const handleEndBal = () => {
    if(EndBalInput){
      if(isNaN(EndBalInput) || EndBalInput === "" || EndBalInput === null){
        toast.error("[2] Invalid value")
      } else {
        updateEndBalFn(cashflow.id, EndBalInput)
      }
    } else {
      toast.error("[1] Invalid input")
    }
  }

  const UpdateCancelEndBalField = () => {
    setEndBalInputField(false);
    setUpdateEndBalId("");
  }

  const UpdateActiveEndBalField = (cashflow) => {
    setEndBalInputField(true);
    setUpdateEndBalId(cashflow.id);
    setEndBalInput(cashflow.endBalance);
  }

  useEffect(() => {
    if(updatedEndBal && !isLoadingEndBal){
      setEndBalInputField(false);
      toast.success("Net change updated successfully.");
    }
  },[updatedEndBal, isLoadingEndBal])

    useEffect(() => {
    if(errorEndBal && !isLoadingEndBal){
      setEndBalInputField(false);
      toast.error("Error updating net change");
    }
  },[errorEndBal, isLoadingEndBal])



  
  const {
    loading: isLoadingTotalOp,
    fn: updateTotalOpFn,
    data: updatedTotalOp,
    error: errorTotalOp
  } = useFetch(updateTotalOperating);

  const [TotalOpInput, setTotalOpInput] = useState(0)
  const [TotalOpInputField, setTotalOpInputField] = useState(false);
  const [UpdateOpId, setUpdateOpId] = useState("");

  const handleTotalOp = () => {
    if(TotalOpInput){
      if(isNaN(TotalOpInput) || TotalOpInput === "" || TotalOpInput === null){
        toast.error("[2] Invalid value")
      } else {
        updateTotalOpFn(cashflow.id, TotalOpInput)
      }
    } else {
      toast.error("[1] Invalid input")
    }
  }

  const UpdateCancelOpField = () => {
    setTotalOpInputField(false);
    setUpdateOpId("");
  }

  const UpdateActiveOpField = (cashflow) => {
    setTotalOpInputField(true);
    setUpdateOpId(cashflow.id);
    setTotalOpInput(cashflow.activityTotal[0]);
  }

  useEffect(() => {
    if(updatedTotalOp && !isLoadingTotalOp){
      setTotalOpInputField(false);
      toast.success("Total Operating updated successfully.");
    }
  },[updatedTotalOp, isLoadingTotalOp]);

    useEffect(() => {
    if(errorTotalOp && !isLoadingTotalOp){
      setTotalOpInputField(false);
      toast.error("Error updating Total Operating");
    }
  },[errorTotalOp, isLoadingTotalOp]);







  const {
    loading: isLoadingTotalInv,
    fn: updateTotalInvFn,
    data: updatedTotalInv,
    error: errorTotalInv
  } = useFetch(updateTotalInvesting);

  const [TotalInvInput, setTotalInvInput] = useState(0)
  const [TotalInvInputField, setTotalInvInputField] = useState(false);
  const [UpdateInvId, setUpdateInvId] = useState("");

  const handleTotalInv = () => {
    if(TotalInvInput){
      if(isNaN(TotalInvInput) || TotalInvInput === "" || TotalInvInput === null){
        toast.error("[2] Total Op Invalid value")
      } else {
        updateTotalInvFn(cashflow.id, TotalInvInput)
      }
    } else {
      toast.error("[1] Total Op Invalid input")
    }
  }

  const UpdateCancelInvField = () => {
    setTotalInvInputField(false);
    setUpdateInvId("");
  }

  const UpdateActiveInvField = (cashflow) => {
    setTotalInvInputField(true);
    setUpdateInvId(cashflow.id);
    setTotalInvInput(cashflow.activityTotal[1]);
  }

  useEffect(() => {
    if(updatedTotalInv && !isLoadingTotalInv){
      setTotalInvInputField(false);
      toast.success("Total Investing updated.");
    }
  },[updatedTotalInv, isLoadingTotalInv]);

    useEffect(() => {
    if(errorTotalInv && !isLoadingTotalInv){
      setTotalInvInputField(false);
      toast.error("Error updating Total Investing");
    }
  },[errorTotalInv, isLoadingTotalInv]);






  

 const {
    loading: isLoadingTotalFnc,
    fn: updateTotalFncFn,
    data: updatedTotalFnc,
    error: errorTotalFnc
  } = useFetch(updateTotalFinancing);

  const [TotalFncInput, setTotalFncInput] = useState(0)
  const [TotalFncInputField, setTotalFncInputField] = useState(false);
  const [UpdateFncId, setUpdateFncId] = useState("");

  const handleTotalFnc = () => {
    if(TotalFncInput){
      if(isNaN(TotalFncInput) || TotalFncInput === "" || TotalFncInput === null){
        toast.error("[2] Total Fnc invalid value")
      } else {
        updateTotalFncFn(cashflow.id, TotalFncInput)
      }
    } else {
      toast.error("[1] Total Fnc invalid input")
    }
  }

  const UpdateCancelFncField = () => {
    setTotalFncInputField(false);
    setUpdateFncId("");
  }

  const UpdateActiveFncField = (cashflow) => {
    setTotalFncInputField(true);
    setUpdateFncId(cashflow.id);
    setTotalFncInput(cashflow.activityTotal[2]);
  }

  useEffect(() => {
    if(updatedTotalFnc && !isLoadingTotalFnc){
      setTotalFncInputField(false);
      toast.success("Total Financing updated.");
    }
  },[updatedTotalFnc, isLoadingTotalFnc]);

    useEffect(() => {
    if(errorTotalFnc && !isLoadingTotalFnc){
      setTotalFncInputField(false);
      toast.error("Error updating Total Financing");
    }
  },[errorTotalFnc, isLoadingTotalFnc]);



   const {
    loading: isLoadingUpdateTransaction,
    fn: updateUpdateTransactionFn,
    data: updatedUpdateTransaction,
    error: errorUpdateTransaction
  } = useFetch(updateCashflowTransaction);

  const [UpdateTransactionInput, setUpdateTransactionInput] = useState(0)
  const [UpdateTransactionInputField, setUpdateTransactionInputField] = useState(false);
  const [UpdateTransactionId, setUpdateTransactionId] = useState("");
  
  const handleUpdateTransaction = () => {
    if(UpdateTransactionInput){
      if(isNaN(UpdateTransactionInput) || UpdateTransactionInput === "" || UpdateTransactionInput === null){
        toast.error("[2] Error Updating Transaction value")
      } else {
        updateUpdateTransactionFn(cashflow.id, UpdateTransactionId, UpdateTransactionInput)
      }
    } else {
      toast.error("[1] Error Updating Transaction input")
    }
  }

  const UpdateCancelTransationField = () => {
    setUpdateTransactionInputField(false);
    setUpdateTransactionId("");
  }
  const UpdateActiveTransationField = (transaction) => {
    setUpdateTransactionInputField(true);
    setUpdateTransactionId(transaction.id);
    setUpdateTransactionInput(transaction.amount);
  }

  useEffect(() => {
    if(updatedUpdateTransaction && !isLoadingUpdateTransaction){
      setUpdateTransactionInputField(false);
      toast.success("Transaction updated.");
    }
  },[updatedUpdateTransaction, isLoadingUpdateTransaction]);

    useEffect(() => {
    if(errorUpdateTransaction && !isLoadingUpdateTransaction){
      setUpdateTransactionInputField(false);
      toast.error("Error updating Transaction");
    }
  },[errorUpdateTransaction, isLoadingUpdateTransaction]);





  const GroupAccountId = cashflow.accountId;
  const [isRoutLoad, setIsRouteLoad] = useState(false);
  const handleRouteSubAccount = () => {
    setIsRouteLoad(true);
  }














  return (
    <div className="mt-4 overflow-x-auto w-ful">
      <div className="min-w-[400px]">

      {/* Transactions Section */}
        <div className="mb-6">
          {/* <div className="flex flex-row "> */}
          <h2 className="text-xl text-center items-center gap-3 justify-center border-black border-b-2 border-t-2 font-bold">Transactions</h2>
          {/* </div> */}
          
          {ACTIVITY_ORDER.filter(activity => groupedTransactions[activity])
            .map(activity => (
              <div key={activity} className="mb-4">
                <h3 className="text-lg font-bold">{ACTIVITY_LABELS[activity] || activity}</h3>
                <ul>
                  {groupedTransactions[activity].map((transaction) => (
                    <li key={transaction.id} className="flex flex-row justify-between items-center hover:bg-green-400">
                      <span className="text-base font-medium flex flex-row gap-2 items-center">
                        {transaction.particular || transaction.description || <span className="italic text-gray-400">No description</span>} 
                        {UpdateTransactionInputField && UpdateTransactionId === transaction.id
                          ? (isLoadingUpdateTransaction
                              ? (<Loader2 className="w-4 h-4 animate-spin"/>)
                              : (
                            <input
                            type="number"
                            name="amount"
                            value={UpdateTransactionInput}
                            onChange={e => setUpdateTransactionInput(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-25 font-mono"
                          /> )
                          )
                          : (
                              <span
                                className={
                                  transaction.type === "EXPENSE"
                                    ? "text-red-500 font-mono tracking-wide"
                                    : transaction.type === "INCOME"
                                    ? "text-green-600 font-mono tracking-wide"
                                    : ""
                                }
                              >
                                {transaction.type === "EXPENSE" ? "-" : ""}
                                {formatTableAmount(transaction.amount)}
                            </span>
                            )
                            
                        }
                      </span>
                      
                      {UpdateTransactionInputField && UpdateTransactionId === transaction.id
                        ? ( <div className="flex flex-row gap-2 items-center">
                              <Button 
                                variant="ghost"
                                onClick={UpdateCancelTransationField}>
                                <X className="text-red-600"/>
                              </Button>
                              <Button 
                                onClick={handleUpdateTransaction}
                                variant="ghost">
                                <Check className="text-green-600"/>
                              </Button>
                            </div>)
                        : (
                          <Button
                            onClick={() => UpdateActiveTransationField(transaction)}
                            variant="ghost"
                            className="text-yellow-500 hover:text-purple-600"
                            > 
                            <SquarePen  />
                            </Button>
                        )
                      }
                    
                    </li>
                  ))}
                </ul>


              </div>
          ))}
        </div>

        {/* Sub-Accounts Section */}
        <div className="mb-5">
          <h2 className="text-xl text-center border-black border-b-2 border-t-2 font-bold">Grouped Transactions</h2>
          <ul className="mt-2">
            {cashflow.subAccounts.map((subAccount) => (
              <li key={subAccount.id} className="flex flex-row justify-between items-center hover:bg-green-400">
                <span className="text-base font-medium">{subAccount.name} - {formatTableAmount(subAccount.balance)}</span>
                {isRoutLoad 
                  ?(
                  <Loader2 className="animate-spin h-4 w-4"/>
                  ) 
                  : (
                    <Link
                      href={`/SubAccounts/${GroupAccountId}`}
                      onClick={handleRouteSubAccount}
                      className="text-yellow-500 hover:text-purple-600 mr-4"
                    >
                    <SquarePen className="w-5 h-5"/>
                    </Link>                    
                  )}

              </li>
            ))}
          </ul>
        </div>


        <div>
          <h2 className="text-xl font-bold text-center border-black border-b-2 border-t-2">
            Cashflow Statement Balances
          </h2>
          <ul className="mt-2 mb-4">
            <li className="flex justify-between items-center hover:bg-green-400">
              <span className="flex flex-row items-center gap-2 text-base font-bold">Total Operating 
              {TotalOpInputField && UpdateOpId === cashflow.id
                ? (
                  isLoadingTotalOp
                  ? (<Loader2 className="h-4 w-4 animate-spin"/>)
                  : <input
                    type="number"
                    value={TotalOpInput}
                    onChange={e => setTotalOpInput(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-25 font-mono"
                  />
                )
              :(
                  <span className={
                    activityTotal[0] > 0
                      ? "font-mono text-green-600"
                      : activityTotal[0] < 0
                      ? "font-mono text-red-500"
                      : "font-mono text-black"}>
                    {formatTableAmount(activityTotal[0])}
                  </span>
                )
              }
              </span>
              {TotalOpInputField && UpdateOpId === cashflow.id
                ? (
                  <div className="flex flex-row gap-2 items-center ml-2">
                    <Button variant="ghost" onClick={UpdateCancelOpField}>
                      <X className="text-red-600" />
                    </Button>
                    <Button variant="ghost" onClick={handleTotalOp}>
                      <Check className="text-green-600" />
                    </Button>
                  </div>
                )
                : (
           
                  <Button
                    onClick={() => UpdateActiveOpField(cashflow)}
                    variant="ghost"
                    className="text-yellow-500 hover:text-purple-600 ml-2"
                  >
                    <SquarePen />
                  </Button>
                )}
            </li>
            <li className="flex justify-between items-center hover:bg-green-400">
              <span className="flex flex-row items-center gap-2 text-base font-bold">Total Investing
                {TotalInvInputField && UpdateInvId === cashflow.id
                  ? (
                    isLoadingTotalInv
                      ? (<Loader2 className="h-4 w-4 animate-spin" />)
                      : <input
                          type="number"
                          value={TotalInvInput}
                          onChange={e => setTotalInvInput(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 w-25 font-mono"
                        />
                  )
                  : (
                    <span className={
                      activityTotal[1] > 0
                        ? "font-mono text-green-600"
                        : activityTotal[1] < 0
                        ? "font-mono text-red-500"
                        : "font-mono text-black"
                    }>
                      {formatTableAmount(activityTotal[1])}
                    </span>
                  )
                }
              </span>
              {TotalInvInputField && UpdateInvId === cashflow.id
                ? (
                  <div className="flex flex-row gap-2 items-center ml-2">
                    <Button variant="ghost" onClick={UpdateCancelInvField}>
                      <X className="text-red-600" />
                    </Button>
                    <Button variant="ghost" onClick={handleTotalInv}>
                      <Check className="text-green-600" />
                    </Button>
                  </div>
                )
                : (
                  <Button
                    onClick={() => UpdateActiveInvField(cashflow)}
                    variant="ghost"
                    className="text-yellow-500 hover:text-purple-600 ml-2"
                  >
                    <SquarePen />
                  </Button>
                )}
            </li>
            <li className="flex justify-between items-center hover:bg-green-400">
              <span className="flex flex-row items-center gap-2 text-base font-bold">Total Financing
                {TotalFncInputField && UpdateFncId === cashflow.id
                  ? (
                    isLoadingTotalFnc
                      ? (<Loader2 className="h-4 w-4 animate-spin" />)
                      : <input
                          type="number"
                          value={TotalFncInput}
                          onChange={e => setTotalFncInput(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 w-25 font-mono"
                        />
                  )
                  : (
                    <span className={
                      activityTotal[2] > 0
                        ? "font-mono text-green-600"
                        : activityTotal[2] < 0
                        ? "font-mono text-red-500"
                        : "font-mono text-black"
                    }>
                      {formatTableAmount(activityTotal[2])}
                    </span>
                  )
                }
              </span>
              {TotalFncInputField && UpdateFncId === cashflow.id
                ? (
                  <div className="flex flex-row gap-2 items-center ml-2">
                    <Button variant="ghost" onClick={UpdateCancelFncField}>
                      <X className="text-red-600" />
                    </Button>
                    <Button variant="ghost" onClick={handleTotalFnc}>
                      <Check className="text-green-600" />
                    </Button>
                  </div>
                )
                : (
                  <Button
                    onClick={() => UpdateActiveFncField(cashflow)}
                    variant="ghost"
                    className="text-yellow-500 hover:text-purple-600 ml-2"
                  >
                    <SquarePen />
                  </Button>
                )}
            </li>

            <div className="mt-4">
              <li className="flex justify-between items-center hover:bg-green-400">
                <span className="flex flex-row items-center gap-2 text-base font-bold">Beginning Balance
                  {StartBalanceInputField && UpdateStartBalanceId === cashflow.id
                    ? (
                      isLoadingUpdateBegBal
                        ? (<Loader2 className="h-4 w-4 animate-spin" />)
                        : <input
                            type="number"
                            value={StartBalanceInput}
                            onChange={e => setStartBalanceInput(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-25 font-mono"
                          />
                    )
                    : (
                      <span className={
                        cashflow.startBalance > 0
                          ? "font-mono text-green-600"
                          : cashflow.startBalance < 0
                          ? "font-mono text-red-500"
                          : "font-mono text-black"
                      }>
                        {formatTableAmount(cashflow.startBalance)}
                      </span>
                    )
                  }
                </span>
                {StartBalanceInputField && UpdateStartBalanceId === cashflow.id
                  ? (
                    <div className="flex flex-row gap-2 items-center ml-2">
                      <Button variant="ghost" onClick={UpdateCancelStartBalanceField}>
                        <X className="text-red-600" />
                      </Button>
                      <Button variant="ghost" onClick={handleUpdateStartBalance}>
                        <Check className="text-green-600" />
                      </Button>
                    </div>
                  )
                  : (
                    <Button
                      onClick={() => UpdateActiveStartBalanceField(cashflow)}
                      variant="ghost"
                      className="text-yellow-500 hover:text-purple-600 ml-2"
                    >
                      <SquarePen />
                    </Button>
                  )}
              </li>

              <li className="flex justify-between items-center hover:bg-green-400">
                <span className="flex flex-row items-center gap-2 text-base font-bold">Gross
                  {netInputField && UpdateNetChangeId === cashflow.id
                    ? (
                      isLoadingUpdateNet
                        ? (<Loader2 className="h-4 w-4 animate-spin" />)
                        : <input
                            type="number"
                            value={netChangeInput}
                            onChange={e => setNetChangeInput(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-25 font-mono"
                          />
                    )
                    : (
                      <span className={
                        cashflow.netChange > 0
                          ? "font-mono text-green-600"
                          : cashflow.netChange < 0
                          ? "font-mono text-red-500"
                          : "font-mono text-black"
                      }>
                        {formatTableAmount(cashflow.netChange)}
                      </span>
                    )
                  }
                </span>
                {netInputField && UpdateNetChangeId === cashflow.id
                  ? (
                    <div className="flex flex-row gap-2 items-center ml-2">
                      <Button variant="ghost" onClick={UpdateCancelNetChangeField}>
                        <X className="text-red-600" />
                      </Button>
                      <Button variant="ghost" onClick={handleUpdateNetChange}>
                        <Check className="text-green-600" />
                      </Button>
                    </div>
                  )
                  : (
                    <Button
                      onClick={() => UpdateActiveNetChangeField(cashflow)}
                      variant="ghost"
                      className="text-yellow-500 hover:text-purple-600 ml-2"
                    >
                      <SquarePen />
                    </Button>
                  )}
              </li>

              <li className="flex justify-between items-center hover:bg-green-400">
                <span className="flex flex-row items-center gap-2 text-base font-bold">Ending Balance
                  {EndBalInputField && UpdateEndBalId === cashflow.id
                    ? (
                      isLoadingEndBal
                        ? (<Loader2 className="h-4 w-4 animate-spin" />)
                        : <input
                            type="number"
                            value={EndBalInput}
                            onChange={e => setEndBalInput(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-25 font-mono"
                          />
                    )
                    : (
                      <span className={
                        cashflow.endBalance > 0
                          ? "font-mono text-green-600"
                          : cashflow.endBalance < 0
                          ? "font-mono text-red-500"
                          : "font-mono text-black"
                      }>
                        {formatTableAmount(cashflow.endBalance)}
                      </span>
                    )
                  }
                </span>
                {EndBalInputField && UpdateEndBalId === cashflow.id
                  ? (
                    <div className="flex flex-row gap-2 items-center ml-2">
                      <Button variant="ghost" onClick={UpdateCancelEndBalField}>
                        <X className="text-red-600" />
                      </Button>
                      <Button variant="ghost" onClick={handleEndBal}>
                        <Check className="text-green-600" />
                      </Button>
                    </div>
                  )
                  : (
                    <Button
                      onClick={() => UpdateActiveEndBalField(cashflow)}
                      variant="ghost"
                      className="text-yellow-500 hover:text-purple-600 ml-2"
                    >
                      <SquarePen />
                    </Button>
                  )}
              </li>
            </div>
          </ul>
        </div>


        <div className="flex justify-end">
          <Button 
          className="ml-0 mt-4
          bg-black hover:bg-transparent
          text-white hover:text-black 
          hover:border hover:border-black
          font-medium hover:font-normal text-base tracking-wide"
          onClick={handleBack}
          disabled={goBack}>
            {goBack
              ? (<><Loader2 className="h-4 w-4 animate-spin"/> Done</>)
              : "Done"
            }
          </Button>
        </div>
      </div>

      
    </div>
  );
}