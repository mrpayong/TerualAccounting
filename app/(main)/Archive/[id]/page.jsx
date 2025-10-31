"use server";
import React from 'react'
import ArchiveTable from '../_components/ArchiveTable'
import ButtonBack from '../_components/ButtonBack';
import { getArchives, getStaff, getUnauthUser } from '@/actions/admin';
import NotFound from '@/app/not-found';
import NotFound404 from '@/app/404';
import { Zen_Kaku_Gothic_Antique } from 'next/font/google';
import { toast } from 'sonner';

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})

async function ArchivePage ({ params }) {
  const {id} = await params;

  const user = await getStaff();


  if(!user.authorized){
    await getUnauthUser();
    return NotFound();
  }

  const archives = await getArchives(id);
  if(archives.code === 404 || archives.success === false){
    return NotFound404();
  }
//comment

  return (
    <div className='flex flex-col justify-center mx-6'>
      <div className={`${fontZenKaku.className} flex flex-col justify-center`}>
        <div className="flex justify-start">
          <ButtonBack id={id}/>
        </div>
         <label className='text-center font-bold text-6xl tracking-normal'>Archive</label>
        <label className='text-center my-2 font-normal text-base text-slate-400'>Here are your deleted transactions, groups, Cashflow Statments of this account.</label>
      </div>
     <ArchiveTable archives={archives}/>
      
    </div>
  )
}

export default ArchivePage;
