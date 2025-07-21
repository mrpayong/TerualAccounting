import React from 'react'
import SettingsForm from './_components/settings-form'
import { getUserForSysAdmin } from '@/actions/settings'

const SettingsPage = () => {
  const Users = getUserForSysAdmin()
  return (
    <div className='p-6'>
      <h1 className="text-4xl font-bold mb-6">User List</h1>
      <SettingsForm Users={Users}/>
    </div>
  )
}

export default SettingsPage
