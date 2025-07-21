'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MyPDFcfsPage from "../[id]/[cfsID]/pdf/route";



function CashflowDetails({ cashflow }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(null);
  const [goBack, setGoBack] = useState(false);

  // const handleBack = () => {
  //   setGoBack(true);
  //   router.back();
  // }

  // const handleEditLoading = () => {
  //   setIsLoading(true);
  //   router.push(`/CashflowStatement/${cashflow.accountId}/${cashflow.id}/edit`)
  // }
  const handleEditLoading = (buttonId) => {
  setIsLoading(buttonId);
  if (buttonId === "editCashflow") {
    router.push(`/CashflowStatement/${cashflow.accountId}/${cashflow.id}/edit`);
  }
  if (buttonId === "back") {
    router.back();
  }
};

  if (!cashflow) {
    return <p>No cashflow details available.</p>;
  }


  // Helper function to get the color class based on transaction type
  const getColorClass = (type) => {
    return type === "INCOME" ? "text-green-500" : "text-red-500";
  };

  // Group sub-accounts and solo transactions by Activity
  const groupedData = {
    OPERATION: [
      ...cashflow.subAccounts.filter(
        (subAccount) =>
          subAccount.transactions.length > 0 &&
          subAccount.transactions[0].Activity === "OPERATION"
      ),
      ...cashflow.transactions.filter(
        (transaction) => transaction.Activity === "OPERATION"
      ),
    ],
    INVESTMENT: [
      ...cashflow.subAccounts.filter(
        (subAccount) =>
          subAccount.transactions.length > 0 &&
          subAccount.transactions[0].Activity === "INVESTMENT"
      ),
      ...cashflow.transactions.filter(
        (transaction) => transaction.Activity === "INVESTMENT"
      ),
    ],
    FINANCING: [
      ...cashflow.subAccounts.filter(
        (subAccount) =>
          subAccount.transactions.length > 0 &&
          subAccount.transactions[0].Activity === "FINANCING"
      ),
      ...cashflow.transactions.filter(
        (transaction) => transaction.Activity === "FINANCING"
      ),
    ],
  };

  const formatTableAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };















  return (
    <div className="p-4">
      <Card className="bg-lime-200">
        <CardHeader>
          <CardTitle className="text-lg sm:text-2xl">
            <div className="flex flex-row items-center justify-between">
              Cashflow Statement Details

              <PDFDownloadLink 
                document={<MyPDFcfsPage cashflow={cashflow} subAccounts={cashflow.subAccounts} transactions={cashflow.transactions} />}
                fileName={`${cashflow.periodCashFlow}_Cashflow_Statement_${cashflow.id}.pdf`}
                >
                
                {({ blob, url, loading, error }) => {
                    if (!loading){
                        return <Button className="bg-black text-white hover:bg-green-700" >
                        <div className='flex items-center gap-1'>
                        <Download className="mr-2 sm:mr-3 md:mr-4 h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6"/>
                            Download
                        </div></Button>
                    }
                    else if (loading){<Loader2 className="h-4 w-4 animate-spin"/>,"Downloading PDF."}
                    }
                }

                </PDFDownloadLink>
            </div>
            
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Operating Activities */}
            <div>
              <h4 className="text-md sm:text-lg font-semibold">
                Operating Activities:
              </h4>
              <ul className="list-none p-0">
                {groupedData.OPERATION.map((item, index) => (
                  <li
                    key={item.id || index} // Use index as fallback for solo transactions
                    className="flex justify-between items-center py-1 border-b border-gray-400 hover:bg-green-400"
                  >
                    <span className="text-sm sm:text-base">
                      {item.name || item.description} {/* Sub-account name or transaction description */}
                    </span>
                    <span
                      className={`text-sm sm:text-base ${getColorClass(
                        item.type
                      )}`}
                    >
                      {formatTableAmount(item.balance?.toFixed(3) || item.amount.toFixed(3))}
                    </span>
                  </li>
                ))}
                <li className="flex justify-between items-center py-1 font-bold border-b border-gray-600">
                  <span className="text-sm sm:text-base">
                    Net Cash from Operating Activities
                  </span>
                  <span className="text-sm sm:text-base">
                    {formatTableAmount(cashflow.activityTotal[0].toFixed(3))}
                  </span>
                </li>
              </ul>
            </div>

            {/* Investing Activities */}
            <div>
              <h4 className="text-md sm:text-lg font-semibold">
                Investing Activities:
              </h4>
              <ul className="list-none p-0">
                {groupedData.INVESTMENT.map((item, index) => (
                  <li
                    key={item.id || index}
                    className="flex justify-between items-center py-1 border-b border-gray-400 hover:bg-green-400"
                  >
                    <span className="text-sm sm:text-base">
                      {item.name || item.description}
                    </span>
                    <span
                      className={`text-sm sm:text-base ${getColorClass(
                        item.type
                      )}`}
                    >
                      {formatTableAmount(item.balance?.toFixed(3) || item.amount.toFixed(3))}
                    </span>
                  </li>
                ))}
                <li className="flex justify-between items-center py-1 font-bold border-b border-gray-600">
                  <span className="text-sm sm:text-base">
                    Net Cash from Investing Activities
                  </span>
                  <span className="text-sm sm:text-base">
                    {formatTableAmount(cashflow.activityTotal[1].toFixed(3))}
                  </span>
                </li>
              </ul>
            </div>

            {/* Financing Activities */}
            <div>
              <h4 className="text-md sm:text-lg font-semibold">
                Financing Activities:
              </h4>
              <ul className="list-none p-0">
                {groupedData.FINANCING.map((item, index) => (
                  <li
                    key={item.id || index}
                    className="flex justify-between items-center py-1 border-b border-gray-400 hover:bg-green-400"
                  >
                    <span className="text-sm sm:text-base">
                      {item.name || item.description}
                    </span>
                    <span
                      className={`text-sm sm:text-base ${getColorClass(
                        item.type
                      )}`}
                    >
                      {formatTableAmount(item.balance?.toFixed(3) || item.amount.toFixed(3))}
                    </span>
                  </li>
                ))}
                <li className="flex justify-between items-center py-1 font-bold border-b border-gray-600">
                  <span className="text-sm sm:text-base">
                    Net Cash from Financing Activities
                  </span>
                  <span className="text-sm sm:text-base">
                    {formatTableAmount(cashflow.activityTotal[2].toFixed(3))}
                  </span>
                </li>
              </ul>
            </div>

            {/* Summary */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">Gross:</span>
                <span className="text-sm sm:text-base">
                  {formatTableAmount(cashflow.netChange.toFixed(3))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">
                  Beginning Net Cash:
                </span>
                <span className="text-sm sm:text-base">
                  {formatTableAmount(cashflow.startBalance.toFixed(3))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base">Ending Balance:</span>
                <span className="text-sm sm:text-base">
                  {formatTableAmount(cashflow.endBalance.toFixed(3))}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center gap-2 lg:justify-end justify-center">
            <Button
              onClick={() => handleEditLoading("editCashflow")}
              disabled={isLoading !== null}
              className="mt-4 px-4 py-2 flex flex-row justify-between items-center bg-amber-400 text-black rounded"
            >
              {isLoading === "editCashflow" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Edit Cashflow
                </>
              ) : (
                "Edit Cashflow"
              )}
            </Button>
          <Button 
            className="mt-4 px-4 py-2 flex flex-row justify-between items-center"
            onClick={() => handleEditLoading("back")}
            disabled={isLoading !== null}>
            {isLoading === "back" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Back
                </>
              ) : (
                "Back"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default CashflowDetails;