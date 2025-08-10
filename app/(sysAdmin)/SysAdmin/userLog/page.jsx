
import { getWebhookSessions } from '@/actions/admin'
import React from 'react'
import UserSessionTable from './_component/userLogpage'

async function UserLog () {
  const sessions = await getWebhookSessions()

  return (
    <div className='p-6'>
      <div className="flex flex-col justify-start mb-6">
        <span className="text-4xl font-bold">User Log</span>
        <span className="text-sm text-slate-600 p-0">These are logs of the sessions of every users.</span>
      </div>
      <UserSessionTable sessions={sessions}/>
    </div>
  )
}

export default UserLog
