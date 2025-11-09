"use server";
import Header from '@/components/header'
import { notFound } from 'next/navigation'
import React from 'react'
import { getSysAdmin, getUnauthUser} from '@/actions/admin'
import Sidebar from './SysAdmin/_components/sidebar';

const SysAdminLayout = async ({children}) => {
     const SysAdminUser = await getSysAdmin();


    if (!SysAdminUser.authorized){ 
        await getUnauthUser();
        return notFound(); 
    }
  return (
    <div className='h-full'>
      <Header SysAdminPage={true}/>
        <div className="flex h-full md:w-56 sm:w-0 
        flex-col top-20 fixed inset-y-0 z-50">
            <Sidebar/>
        </div>
        <main className='md:pl-56 pt-[80px] h-full'>{children}</main>
    </div>
  )
}

export default SysAdminLayout
