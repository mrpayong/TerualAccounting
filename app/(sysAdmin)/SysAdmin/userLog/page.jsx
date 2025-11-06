
import { getIntruder, getWebhookSessions } from '@/actions/admin'
import React from 'react'
import UserSessionTable from './_component/userLogpage'
import { Unica_One, Zen_Kaku_Gothic_Antique } from 'next/font/google';


const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: '400',
})

const fontUnicaOne = Unica_One({
  subsets:["latin"],
  weight: '400',
})

async function UserLog () {

  const sessions = await getWebhookSessions()
  const unauth =  await getIntruder()

  const unauthData = unauth.data;


  return (
    <div className='p-6'>
      <div className="flex flex-col justify-start mb-6">
        <span className={`${fontUnicaOne.className} text-6xl md:text-[5rem]/[1] font-normal`}>User Log</span>
        <span className={`${fontZenKaku.className} font-normal text-sm tracking-wide text-slate-600 p-0`}>These are logs of the sessions of every users.</span>
      </div>
      <UserSessionTable sessions={sessions} unauth={unauthData}/>
    </div>
  )
}

export default UserLog
