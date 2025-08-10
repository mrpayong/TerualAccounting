"use client";
import useFetch from "@/hooks/use-fetch";
import { Check, PenLine, PenOff, TriangleAlert, X, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteSubAccountTransactionRelation, updateSubAccountBalance } from "../../../../actions/accounts";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import { Zen_Kaku_Gothic_Antique } from "next/font/google";

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})

const SubAccount = ({ subAccount, level = 0}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    }).format(amount);
  };

  // console.log("[1]", subAccount);
  const [removingTransactionId, setRemovingTransactionId] = useState("");
  
  const {
    loading: removeTransactionLoading, 
    fn: removeTransactionFn, 
    data: removedData, 
    error: removeTransactionError
  } = useFetch(deleteSubAccountTransactionRelation);

  const handleRemoveTransaction = async (transactionId) => {
    console.warn("transactionId", transactionId)
    setRemovingTransactionId(transactionId)
    if (!transactionId || !subAccount.id || transactionId === null) {
      toast.error("Invalid action");
      return;
    }
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Remove transaction from ${subAccount.name} ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes",
    });

    if (result.isConfirmed) {
      removeTransactionFn(subAccount.id, transactionId);
    }
    return;
  };

  useEffect(() => {
    if(removedData && !removeTransactionLoading){
      console.log("You removed a transaction");
      setRemovingTransactionId("")
      toast.success("Transaction removed.");
    }
  }, [removedData, removeTransactionLoading])
  
    useEffect(() => {
    if(removeTransactionError && !removeTransactionLoading){
      console.log("You removed a transaction", removingTransactionId);
      console.warn("No Id: ", removingTransactionId);
      toast.error("Transaction not removed.");
    }
  }, [removeTransactionError, removeTransactionLoading])

  const {
    loading: updateBalanceLoading,
    fn: updateBalanceFn,
    data: udpatedBalanceData,
    error: udpateBalanceError,
  } = useFetch(updateSubAccountBalance);


  const [labelControl, setLabelControl] = useState(false); //for input field state
  const [subAccountBalance, setSubAccountBalance] = useState(0); //for subAcc balance value
  const [subAccountId, setSubAccountId] = useState(null); //for sub acc ID
  const [balanceEditButton, setBalanceEditButton] = useState(false); // balance edit button
  const [disableEditButton, setDisableEditButton] = useState(false) // for loading and success handling


  const handleActiveBalanceField = () => {
    setBalanceEditButton(true);
    setLabelControl(true);
    setSubAccountBalance(subAccount.balance);
    setSubAccountId(subAccount.id);
  }
  
  const handleCancelBalanceField = () => {
    setBalanceEditButton(false)
    setLabelControl(false);
    setSubAccountBalance(0);
    setSubAccountId("");
  }

  const handleUpdateBalance = () => {
    const newBalance = Number(subAccountBalance)
    try {
      if(isNaN(newBalance)){
        toast.error("Invalid value");
        return;
      } else {
        setBalanceEditButton(false)
        setSubAccountId("");
        setLabelControl(false);
        console.log("updated", subAccount.id, newBalance, typeof newBalance)
        console.warn("subAccountId", subAccountId)
        updateBalanceFn(newBalance, subAccount.id)
      }
    } catch (error) {
     toast.error("Error passing data"); 
    }
  }


  useEffect(() => {
    if(udpatedBalanceData && !updateBalanceLoading){
      console.log("You removed a transaction");
      toast.success("Sub Account Updated.");
    }
  }, [udpatedBalanceData, updateBalanceLoading])
  
    useEffect(() => {
    if(udpateBalanceError && !updateBalanceLoading){
      console.log("You removed a transaction");
      toast.error("Error updating.");
    }
  }, [udpateBalanceError, updateBalanceLoading])





  


  const getTotalAmount = (account) => {
    // Sum transactions for this account
    const transactionSum = account.transactions.reduce(
      (sum, t) => sum + (Number(t.amount) || 0),
      0
    );
    // Sum balances of all children recursively
    const childrenSum = (account.children || []).reduce(
      (sum, child) => sum + getTotalAmount(child),
      0
    );
    // Return total for this account
    return transactionSum + childrenSum;
  };

const totalAmount = getTotalAmount(subAccount);


  const isBalanceMismatch =
    subAccount.balance !== null &&
    Math.abs(Number(subAccount.balance) - totalAmount) > 0.009; // Allowing for floating point rounding












  return (
    <>
    
      {/* Table Row for Sub-Account */}
      {(updateBalanceLoading || removeTransactionLoading) && (
        <tr>
          <td colSpan={3} className="py-2 px-4">
            <BarLoader 
              className="ml-2"
              color="#3b82f6"
              width={50}
              height={5}
            />
          </td>
        </tr>
      )}
      <tr
        className={`border-b ${
          level % 2 === 0 ? "bg-blue-50" : "bg-white"
        } 
        `}
      >
        <td className={`${fontZenKaku.className} py-2 px-4`}>
          <div
            className="flex items-center"
            style={{ marginLeft: `${level * 20}px` }} // Indentation for hierarchy
          >
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-500 hover:underline mr-2"
            >
              {isExpanded ? <ChevronUp className="text-xs"/> : <ChevronDown className="text-xs"/>}
            </button>
            <span className="font-medium text-lg text-blue-900">{subAccount.name}</span>
            
          </div>
        </td>
        <td className={`${fontZenKaku.className} font-medium py-2 px-4 text-sm text-gray-500`}>
          <label>Transactions + Grouped child: </label>
          <label className="tracking-wide">{formatAmount(totalAmount)}</label>
        </td>
        <td className={`${fontZenKaku.className} py-2 px-4 flex flex-row items-center text-gold-600 font-medium`}>
          {labelControl && subAccountId === subAccount.id
            ? (
              <input
                type="number"
                onChange={(e) => setSubAccountBalance(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 w-32"
                value={subAccountBalance}
              />
              
              )
            : (
              <label className="tracking-wide text-base">
                {subAccount.balance !== null ? formatAmount(subAccount.balance) : "N/A"}
              </label>
            )
          }
          </td>
          {isBalanceMismatch && (
          <td className="py-2 px-4 text-gray-500">
            <div className="flex flex-row gap-2 items-center px-2">
              {balanceEditButton
                ? (
                  <button
                  onClick={handleUpdateBalance}>
                  <Check className="text-green-500"/>
                </button>
                ) 
                : (
                  <TriangleAlert className="text-yellow-400 h-4 w-4 ml-2" title="Balance does not match transaction total"/>
                )
              }
            
            {balanceEditButton
              ? (
                <button
                  onClick={handleCancelBalanceField}>
                  <PenOff className="text-rose-500"/>
                </button>
              ) : (
                <button
                onClick={handleActiveBalanceField}>
                  <PenLine className="text-yellow-400"/>
                </button>
              )
            }
            
            </div>
          
        </td>)}
      </tr>

      {/* Expanded Details */}
      {isExpanded && (
        <>
          {/* Transactions */}
          {subAccount.transactions.length > 0 && (
            <tr className={`${fontZenKaku.className} bg-gray-50`}>
              <td colSpan="3" className="py-2 px-4">
                <h4 className="text-lg font-medium tracking-wide text-blue-800">Transactions list</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                  {subAccount.transactions.map((transaction) => (
                    <li className="list-none grid grid-cols-3 justify-center py-2" key={transaction.id}>
                      <p className="font-medium text-base text-start ml-2">{transaction.description}</p>
                      <p className="font-medium text-base text-center">{formatAmount(transaction.amount)}</p>
                      <p className="text-center mr-2">
                      <button 
                        onClick={() => handleRemoveTransaction(transaction.id)}
                        className="hover:bg-gray-200 items-center">
                          <X className="text-rose-600 h-3 w-3"/>
                      </button>
                      </p>
                    </li>
                    
                  ))}
                  <li className="list-none grid grid-cols-3 justify-center py-2 font-medium text-[1.1rem]/[1rem] border-t border-gray-200">
                    <span className="text-start ml-2">Total</span>
                    <span className="text-center">
                      {formatAmount(
                        subAccount.transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
                      )}
                    </span>
                    <span>

                    </span>
                  </li>
                </ul>
                
              </td>
            </tr>
          )}

          {/* Child Sub-Accounts */}
          {subAccount.children &&
            subAccount.children.length > 0 &&
            subAccount.children.map((child) => (
              <SubAccount key={child.id} subAccount={child} level={level + 1} />
            ))}
        </>
      )}
    </>
  );
};

const SubAccountTable = ({ subAccounts }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
          <tr>
            <th className="py-2 px-4 text-left text-blue-900 font-semibold">
              Name
            </th>
            <th className="py-2 px-4 text-left text-blue-900 font-semibold">
              Description
            </th>
            <th className="py-2 px-4 text-left text-blue-900 font-semibold">
              Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {subAccounts.map((subAccount) => (
            <SubAccount key={subAccount.id} subAccount={subAccount} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubAccount;




























