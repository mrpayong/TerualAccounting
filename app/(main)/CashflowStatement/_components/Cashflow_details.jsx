'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MyPDFcfsPage from "../[id]/[cfsID]/pdf/route";
import { Zen_Kaku_Gothic_Antique } from "next/font/google";

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})

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

function CashflowDetails({ cashflow }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(null);
  const [goBack, setGoBack] = useState(false);
  const isSmallScreen = useIsSmallScreen();


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

  const sortIncomeExpense = (arr) => {
  return [...arr].sort((a, b) => {
    if (a.type === b.type) return 0;
    if (a.type === "INCOME") return -1;
    return 1;
  });
};

  // Helper function to get the color class based on transaction type
  const getColorClass = (type) => {
    return type === "INCOME" ? "text-green-500" : "text-red-500";
  };

  // Group sub-accounts and solo transactions by Activity
  const groupedData = {
    OPERATION: sortIncomeExpense([
      ...cashflow.subAccounts.filter(
        (subAccount) =>
          subAccount.transactions.length > 0 &&
          subAccount.transactions[0].Activity === "OPERATION"
      ),
      ...cashflow.transactions.filter(
        (transaction) => transaction.Activity === "OPERATION"
      ),
    ]),
    INVESTMENT: sortIncomeExpense([
      ...cashflow.subAccounts.filter(
        (subAccount) =>
          subAccount.transactions.length > 0 &&
          subAccount.transactions[0].Activity === "INVESTMENT"
      ),
      ...cashflow.transactions.filter(
        (transaction) => transaction.Activity === "INVESTMENT"
      ),
    ]),
    FINANCING: sortIncomeExpense([
      ...cashflow.subAccounts.filter(
        (subAccount) =>
          subAccount.transactions.length > 0 &&
          subAccount.transactions[0].Activity === "FINANCING"
      ),
      ...cashflow.transactions.filter(
        (transaction) => transaction.Activity === "FINANCING"
      ),
    ]),
  };

  const formatTableAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits:3,
      maximumFractionDigits:3,
    }).format((amount));
  };














  return (
    <div className="p-4">
      <Card className={`${fontZenKaku.className} bg-amber-200`}>
        <CardHeader>
          <CardTitle className="!font-bold text-xl md:text-3xl">
            <div className="flex flex-col sm:whitespace-nowrap md:flex-row items-center justify-center sm:justify-between">
              Cashflow Statement Details
              <PDFDownloadLink 
                document={<MyPDFcfsPage cashflow={cashflow} subAccounts={cashflow.subAccounts} transactions={cashflow.transactions} />}
                fileName={`${cashflow.periodCashFlow}_Cashflow_Statement_${cashflow.id}.pdf`}
                >
                
                {({ blob, url, loading, error }) => {
                    if (!loading){
                        return <Button className="bg-black text-white !font-medium !h-7 md:!h-9 !text-xs md:!text-base hover:bg-green-700" >
                        <div className='flex items-center gap-1'>
                        <Download className="mr-0 md:mr-4 h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6"/>
                            {isSmallScreen ? '' :'Download'}
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
              <h4 className="text-base md:text-lg font-bold">
                Operating Activities:
              </h4>
              <ul className="list-none p-0">
                {groupedData.OPERATION.map((item, index) => (
                  <li
                    key={item.id || index} // Use index as fallback for solo transactions
                    className="flex justify-between items-center py-1 border-b border-gray-400 hover:bg-green-400"
                  >
                    <span className="font-medium text-sm md:text-base">
                      {item.name || item.particular || item.description || 'No Transaction Name'} {/* Sub-account name or transaction description */}
                    </span>
                    <span
                      className={`font-medium text-sm md:text-base ${getColorClass(
                        item.type
                      )}`}
                    >
                      {formatTableAmount(item.balance || item.amount)}
                    </span>
                  </li>
                ))}
                <li className="flex justify-between items-center py-1 font-bold border-b border-gray-600">
                  <span className="font-bold text-sm md:text-base">
                    Net Cash from Operating Activities
                  </span>
                  <span className="font-medium text-sm md:text-base">
                    {formatTableAmount(cashflow.activityTotal[0])}
                  </span>
                </li>
              </ul>
            </div>

            {/* Investing Activities */}
            <div>
              <h4 className="text-base md:text-lg font-bold">
                Investing Activities:
              </h4>
              <ul className="list-none p-0">
                {groupedData.INVESTMENT.map((item, index) => (
                  <li
                    key={item.id || index}
                    className="flex justify-between items-center py-1 border-b border-gray-400 hover:bg-green-400"
                  >
                    <span className="font-medium text-sm md:text-base">
                      {item.name || item.particular || item.description || 'No Transaction Name'}
                    </span>
                    <span
                      className={`font-medium text-sm md:text-base ${getColorClass(
                        item.type
                      )}`}
                    >
                      {formatTableAmount(item.balance || item.amount)}
                    </span>
                  </li>
                ))}
                <li className="flex justify-between items-center py-1 font-bold border-b border-gray-600">
                  <span className="font-medium text-sm md:text-base">
                    Net Cash from Investing Activities
                  </span>
                  <span className="font-medium text-sm md:text-base">
                    {formatTableAmount(cashflow.activityTotal[1])}
                  </span>
                </li>
              </ul>
            </div>

            {/* Financing Activities */}
            <div>
              <h4 className="text-base md:text-lg font-bold">
                Financing Activities:
              </h4>
              <ul className="list-none p-0">
                {groupedData.FINANCING.map((item, index) => (
                  <li
                    key={item.id || index}
                    className="flex justify-between items-center py-1 border-b border-gray-400 hover:bg-green-400"
                  >
                    <span className="font-medium text-sm md:text-base">
                      {item.name || item.particular || item.description || 'No Transaction Name'}
                    </span>
                    <span
                      className={`font-medium text-sm md:text-base ${getColorClass(
                        item.type
                      )}`}
                    >
                      {formatTableAmount(item.balance || item.amount)}
                    </span>
                  </li>
                ))}
                <li className="flex justify-between items-center py-1 font-bold border-b border-gray-600">
                  <span className="font-medium text-sm md:text-base">
                    Net Cash from Financing Activities
                  </span>
                  <span className="font-medium text-sm md:text-base">
                    {formatTableAmount(cashflow.activityTotal[2])}
                  </span>
                </li>
              </ul>
            </div>

            {/* Summary */}
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-base md:text-lg">Gross:</span>
                <span className="font-medium text-base md:text-lg">
                  {formatTableAmount(cashflow.netChange)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-base md:text-lg">
                  Beginning Net Cash:
                </span>
                <span className="font-medium text-base md:text-lg">
                  {formatTableAmount(cashflow.startBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-base md:text-lg">Ending Balance:</span>
                <span className="font-medium text-base md:text-lg">
                  {formatTableAmount(cashflow.endBalance)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center gap-2 lg:justify-end justify-center">
            <Button
              onClick={() => handleEditLoading("editCashflow")}
              disabled={isLoading !== null}
              className="mt-4 px-4 py-2 
              flex flex-row justify-between 
              font-medium !text-base
              items-center 
              border border-black hover:border-0
              bg-transparent hover:bg-amber-400
              text-black 
              hover:shadow-md hover:shadow-gray-500/45
              rounded"
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
            className="mt-4 px-4 py-2 
            font-medium !text-base
            flex flex-row justify-between items-center
            bg-black hover:bg-amber-400/30
            text-white hover:text-black
            hover:border hover:border-black
            hover:shadow-md hover:shadow-gray-500/45"
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