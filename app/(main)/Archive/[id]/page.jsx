"use server";
import React from 'react'
import ArchiveTable from '../_components/ArchiveTable'
import ButtonBack from '../_components/ButtonBack';
import { getArchives, getStaff, getUnauthUser } from '@/actions/admin';
import NotFound from '@/app/not-found';

async function ArchivePage ({ params }) {
  const {id} = await params;

  const user = await getStaff();


  if(!user.authorized){
    await getUnauthUser();
    return NotFound();
  }

  const archives = await getArchives(id);

  return (
    <div className='flex flex-col justify-center mx-6'>
      <div className="flex flex-col justify-center">
        <div className="flex justify-start">
          <ButtonBack id={id}/>
        </div>
         <label className='text-center font-bold text-6xl tracking-normal'>Archive</label>
        <label className='text-center my-2 text-sm text-slate-400'>Here are your deleted transactions and groups of this account.</label>
      </div>
     <ArchiveTable archives={archives}/>
      
    </div>
  )
}

export default ArchivePage;
