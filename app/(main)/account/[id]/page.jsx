import { notFound } from "next/navigation";
import React, { Suspense } from "react";

import { BarLoader } from "react-spinners";
import { getAccountWithTransactions, getSubAccounts, getSubAccTransactionRel } from "@/actions/accounts";
import AccountChart from "../_components/account-chart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCashflow, getCashflowEnding } from "@/actions/cashflow";
// import { TransactionTable } from '..//_components/transaction_table';
import TransactionTable from "..//_components/transaction_table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MenuIcon } from "lucide-react";
import CreateSubAccountButton from "../_components/create_sub-account";
import SideNavBar from "@/components/sideNav";
import AccountLineChart from "../_components/account-LineChart";
import { getStaff, getUnauthUser } from "@/actions/admin";
import NotFound from "@/app/not-found";
import { useSession, useUser } from "@clerk/nextjs";
import { Unica_One, Zen_Kaku_Gothic_Antique } from "next/font/google";

const fontUnicaOne = Unica_One({
  subsets:["latin"],
  weight: "400",
})
const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: "400",
})

async function AccountsPage({ params }) {
  // const user = await getStaff();
  

  // if(!user.authorized){
  //   await getUnauthUser();
  //   return NotFound();
  // }
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);
  const subAccounts = await getSubAccounts(id);
  const recentCashflows = await getCashflowEnding(id)
  const SubAccTransactionRel = await getSubAccTransactionRel(id);

  console.log("SubAccTransactionRel:", SubAccTransactionRel)
  const relatedIDs = SubAccTransactionRel.data.map(rel => rel.transactionId);
  
  // const recentCashflows = fetchedCashflows.latestCashflows;

  const { transactions, ...account } = accountData; //extract transacs and acc data
  // console.info("THE ACCOUNT DATUM:  ",accountData)

  // const cashflow = await getCashflow(id);

  if (!accountData) {
    notFound();
  }

  function formatNumberWithCommas(number) {
    return Number(number).toLocaleString();
  }

 return (
    <div className="space-y-8 px-5">
      <div className="flex flex-col md:flex-row sm:justify-between">
        <div className="md:flex items-center">
          <SideNavBar accountId={id} />
        </div>
        <div className="text-center">

          <h1 className={`text-6xl md:text-[5rem]/[1] ${fontUnicaOne.className} font-normal tracking-wide md:tracking-widest capitalize`}>
            {account.name}
          </h1>
          <p className={`${fontZenKaku.className} text-md text-gray-500`}>
            {formatNumberWithCommas(account._count.transactions)} Transactions
          </p>
        </div>
        <div></div>
      </div>

      {/* Chart Section */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountChart id={id} transactions={transactions} />
        {/* <AccountLineChart transactions={transactions} /> */}
      </Suspense>

      {/* Transaction Table */}
      <Suspense
        fallback={
          <BarLoader className="mt-4" width={"100%"} color={"#9333ea"} />
        }
      >
        <TransactionTable
          relatedIDs={relatedIDs}
          recentCashflows={recentCashflows}
          transactions={transactions}
          id={id}
          subAccounts={subAccounts}
        />
      </Suspense>
    </div>
  );
}

export default AccountsPage;
