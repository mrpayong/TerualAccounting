import React from 'react'
import SettingsForm from './_components/settings-form'


const SettingsPage = () => {
  return (
    <div className='p-6'>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <SettingsForm />
      {/* view detailes: about which accounts a user handles. IN CLIENT PAGE */}
    </div>
  )
}

export default SettingsPage
