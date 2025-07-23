"use server";
import Header from '@/components/header'
import React from 'react'
import { getAdmin, getSysAdmin, getUnauthUser } from '@/actions/admin'
import { getUser } from '@/actions/settings';
import Sidebar from './admin/_components/sidebar';
import NotFound from '../not-found';

const AdminLayout = async ({children}) => {
    const User = await getAdmin()

    if (!User.authorized){ 
        await getUnauthUser()
        return NotFound(); 
    }
    
  return (
    
    <div className='h-full'>
      <Header isAdminPage={true}/>
        <div className="flex h-full md:w-56 sm:w-0 
        flex-col top-20 fixed inset-y-0 z-50">
            <Sidebar/>
        </div>
        <main className='md:pl-56 pt-[80px] h-full'>{children}</main>
    </div>

  )
}

export default AdminLayout
