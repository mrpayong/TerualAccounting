import React from 'react'
import ActivityLogTable from './_components/activityLogTable';
import { getActivityLogs } from '@/actions/admin';

async function ActivityLogsPage () {
  const activityLogs = await getActivityLogs();

  return (
    <div className='p-6'>
      <h1 className="text-4xl font-bold mb-6">Activity Logs</h1>
      <ActivityLogTable activities={activityLogs}/>
    </div>

  )
}

export default ActivityLogsPage;
