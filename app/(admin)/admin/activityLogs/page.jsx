import React from 'react'
import ActivityLogTable from './_components/activityLogTable';
import { getActivityLogs, getVoidsForApproval } from '@/actions/admin';
import { Unica_One } from 'next/font/google';

const fontUnicaOne = Unica_One({
  subsets:["latin"],
  weight: "400",
})

async function ActivityLogsPage () {
  const activityLogs = await getActivityLogs();
  const needApprovalVoid = await getVoidsForApproval();
  // console.log(" needApprovalVoid ",  needApprovalVoid )

  return (
    <div className='p-6'>
      <h1 className={`${fontUnicaOne.className} text-6xl md:text-[5rem]/[1] font-normal mb-6`}>Activity Logs</h1>
      <span className='text-gray-500'> Follows Manila Timezone.</span>
      <ActivityLogTable needApprovalVoid={needApprovalVoid} activities={activityLogs}/>
    </div>

  )
}

export default ActivityLogsPage;
