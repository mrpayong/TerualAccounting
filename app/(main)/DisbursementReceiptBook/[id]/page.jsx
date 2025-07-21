import React, { Suspense } from 'react'
import DisbursementReceiptBook from '../_components/DisbursementReceipt_Book'
import { getCashOutflow } from '@/actions/cashflow';
import { BarLoader } from 'react-spinners';
import { getStaff, getUnauthUser } from '@/actions/admin';
import NotFound from '@/app/not-found';

async function DisbursementReceiptBookPage ({params}) {
    const user = await getStaff()
  
    if(!user.authorized){
      await getUnauthUser();
      return NotFound();
    }
    const {id} = await params;
    const outflows = await getCashOutflow(id);
    console.log(outflows)
  return (
    
    <div>
      <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color="#9333ea"/>}>
        <div>
          <DisbursementReceiptBook  outflows={outflows}/>
        </div>
      </Suspense>
    </div>
  )
}

export default DisbursementReceiptBookPage
