export const dynamic = 'force-dynamic';
'use server';
import React, { Suspense } from 'react'
import DashboardPage from './page';
import {BarLoader} from "react-spinners"
import { getStaff, getUnauthUser, getUnauthUseTest } from '@/actions/admin';
import NotFound from '@/app/not-found';
import { Unica_One } from 'next/font/google';

const fontUnicaOne = Unica_One({
  subsets:["latin"],
  weight: "400",
})

const DashboardLayout = async () => {
  const user = await getStaff();


  if(!user.authorized){
    await getUnauthUser();
    return NotFound()
  }
  if(user.authorized === true){
    await getUnauthUseTest();
    return NotFound()
  }

  return (
    <div className='px-5'>
        <h1 className={`text-6xl md:text-[5rem]/[1] mb-5 w-full ${fontUnicaOne.className} font-normal tracking-wider text-center md:text-start`}>Dashboard</h1>

        {/* Dashboard Page`` */}
        <Suspense 
            fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}>
                <DashboardPage/>   
        </Suspense>

    </div>
  )
}

export default DashboardLayout;
