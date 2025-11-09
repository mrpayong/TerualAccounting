
"use server";
export const dynamic = 'force-dynamic';
import { getStaff, getUnauthUser } from '@/actions/admin'
import NotFound from '@/app/not-found';
import React from 'react'

const CFSlayout = async ({children}) => {

    const user = await getStaff();
    
    if(!user.authorized){
        await getUnauthUser()
        return NotFound();
    }
  return (
    <>
          {children}
</>
  
  )
}

export default CFSlayout
