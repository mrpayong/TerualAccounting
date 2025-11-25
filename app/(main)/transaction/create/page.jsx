import { getUserAccounts } from '@/actions/dashboard';
import { defaultCategories } from '@/data/category';
import React from 'react'
import AddTransactionForm from '../_components/transaction-form';
import { getTransaction } from '@/actions/transaction';
import { getStaff, getUnauthUser } from '@/actions/admin';
import NotFound from '@/app/not-found';
import { Unica_One, Zen_Kaku_Gothic_Antique } from 'next/font/google';
// import { AddTransactionForm } from '../_components/transaction-form';

const fontUnicaOne = Unica_One({
  subsets:["latin"],
  weight: "400",
})

const fontZenkakuGothicAntique = Zen_Kaku_Gothic_Antique({
  subsets: ['latin'],
  weight: '500',
});

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
      <div className="flex flex-col mb-4">
        <h1 className={`text-6xl md:text-[5rem]/[0.5] mb-2 w-full ${fontUnicaOne.className} font-normal tracking-wider text-center md:text-start`}>Add Transaction</h1>
        <p className={`${fontZenkakuGothicAntique.className} text-base font-medium text-gray-500`}>AI used with the scanner can make mistakes. Review the form before adding transaction.</p>
      </div>
     
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