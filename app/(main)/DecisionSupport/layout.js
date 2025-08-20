import React, { Suspense } from 'react'
import {BarLoader} from "react-spinners"
import DecisionSupport from './page';
import { getAdmin, getUnauthUser } from '@/actions/admin';
import NotFound from '@/app/not-found';
import { Unica_One } from 'next/font/google';

const fontUnicaOne = Unica_One({
  subsets:["latin"],
  weight: "400",
})

const DashboardLayout = async () => {
  const user = await getAdmin()

  if(!user.authorized){
    await getUnauthUser();
    return NotFound();
  }

  
  return (
    <div className='px-5 bg-gray-50'>
        <h1 className={`text-6xl md:text-[5rem]/[1] px-9 w-full ${fontUnicaOne.className} font-normal tracking-wider text-center md:text-start`}>Decision Support</h1>

        
        <Suspense 
            fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}>
                <DecisionSupport/>   
        </Suspense>

    </div>
  )
}

export default DashboardLayout;
