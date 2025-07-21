import { getUserAccounts } from '@/actions/dashboard';
import { defaultCategories } from '@/data/category';
import React from 'react'
import AddTransactionForm from '../_components/transaction-form';
import { getTransaction } from '@/actions/transaction';
import { getStaff, getUnauthUser } from '@/actions/admin';
import NotFound from '@/app/not-found';
// import { AddTransactionForm } from '../_components/transaction-form';


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
      console.info(transaction)
    }
    

  return (
    <div className="max-w-3xl mx-auto px-5">
     <h1 className="text-5xl gradient-title mb-8">{editId ? "Edit" : "Add"} Transaction</h1>
 
      <AddTransactionForm 
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