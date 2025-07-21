"use server";
import React from 'react'
import ClientInfoCard from '../_components/clientInfoCard';
import { getStaff, getUnauthUser } from '@/actions/admin';
import NotFound from '@/app/not-found';
import { getAccountWithTransactions } from '@/actions/accounts';

async function ClientInfoPage({params})  {
      const user = await getStaff()
    
      if(!user.authorized){
        await getUnauthUser();
        return NotFound();
      }

    const { id } = await params;
    const accountData = await getAccountWithTransactions(id);
    const { ...account } = accountData;

  return (
    <main className="min-h-screen 
        bg-gradient-to-br from-blue-50 
        via-white to-blue-100 py-8 px-2 
        flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <ClientInfoCard accountProfile={account}/>
      </div>
    </main>
  )
}

export default ClientInfoPage;
