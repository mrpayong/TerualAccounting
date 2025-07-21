import { getUserAccount } from '@/actions/admin';
import { getUserAccounts } from '@/actions/dashboard';
import AccountCard from '@/app/(main)/dashboard/_components/account-card';
import CreateAccountDrawer from '@/components/create-account-drawer';
import { AccountCardProvider } from '@/components/loadingCard';
import { Card, CardContent } from '@/components/ui/card';
import React from 'react'
import ClientCard from './_components/clients-card';
import { Plus } from 'lucide-react';
import TestCard from './_components/TestCard';

const ClientsPage = async () => {
    const accounts = await getUserAccount();
    console.log("accounts for admin: ", accounts);

  return (
    <div className='p-6'>
      <div className="flex flex-col justify-start mb-6">
        <span className="text-4xl font-bold">Clients</span>
        <span className="text-sm text-slate-600 p-0">Accounts of the clients that all the users manage.</span>
      </div>
    <div className='space-y-8'>


       {/* OVERVIEW */}


       {/* ACCOUNTS GRID */}
       <AccountCardProvider>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* <CreateAccountDrawer>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border border-green-900">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
                <Plus className="h-10 w-10 mb-2" />
                <p className="text-sm font-medium">Add New Account</p>
              </CardContent>
            </Card>
          </CreateAccountDrawer> */}
{/* we just want the infos of the accounts */}
          {accounts.data.length > 0 &&
            accounts.data.map((account) => (
              // <TestCard key={account.id} account={account} />
              <ClientCard key={account.id} account={account} />
            ))}
        </div>
      </AccountCardProvider>
    </div>
    </div>
  )
}

export default ClientsPage;
