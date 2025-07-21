
import { getDashboardData, getUserAccounts } from '@/actions/dashboard';
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import React, { Suspense } from 'react'
import AccountCard from './_components/account-card';
import { getCurrentBudget } from '@/actions/budget';
import BudgetProgress from './_components/budget-progress';
import DashboardOverview from './_components/transaction-overview';
import { AccountCardProvider } from '@/components/loadingCard';
import { Zen_Kaku_Gothic_Antique } from 'next/font/google';

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: "700",
})

async function DashboardPage () {
  const accounts = await getUserAccounts();
  


  const transactions = await getDashboardData();


  return ( 
    <div className='space-y-8'>


       {/* OVERVIEW */}
         <Suspense fallback={"Loading overview..."}>
            <DashboardOverview 
              accounts={accounts}
              transactions={transactions || []}
            />
         </Suspense>

       {/* ACCOUNTS GRID */}
       <AccountCardProvider>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border border-green-900">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
                <Plus className="h-10 w-10 mb-2" />
                <p className={`${fontZenKaku.className} text-sm`}>Add New Account</p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>

          {accounts.length > 0 &&
            accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>
      </AccountCardProvider>
    </div>
  )
}

export default DashboardPage;
