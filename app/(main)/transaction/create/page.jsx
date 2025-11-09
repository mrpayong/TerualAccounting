export const dynamic = 'force-dynamic';
import { getUserAccounts } from '@/actions/dashboard';
import { defaultCategories } from '@/data/category';
import React from 'react'
import AddTransactionForm from '../_components/transaction-form';
import { getTransaction } from '@/actions/transaction';
import { getStaff, getUnauthUser } from '@/actions/admin';
import NotFound from '@/app/not-found';
import { Unica_One } from 'next/font/google';
// import { AddTransactionForm } from '../_components/transaction-form';

const fontUnicaOne = Unica_One({
  subsets:["latin"],
  weight: "400",
})

const AddTransactionPage = async ({ searchParams }) => {
    const user = await getStaff()
    
    if(!user.authorized){
      await getUnauthUser();
      return NotFound();
    }

    const accounts = await getUserAccounts();

    const accountId = (await searchParams)?.accountId;
    const editId = (await searchParams)?.edit;
    
    let initialData = null;
    if (editId) {
      // console.log(editId);
      const transaction = await getTransaction(editId);
      initialData = transaction;
    }
    
  const ScannerUserId = user.data.id;
  return (
    <div className="max-w-3xl mx-auto px-5">
     <h1 className={`text-6xl md:text-[5rem]/[1] mb-5 w-full ${fontUnicaOne.className} font-normal tracking-wider text-center md:text-start`}>{editId ? "Edit" : "Add"} Transaction</h1>
 
      <AddTransactionForm 
        ScannerUserId={ScannerUserId}
        accounts={accounts} 
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
        accountId={accountId}
      />
    </div>
  )
}

export default AddTransactionPage;