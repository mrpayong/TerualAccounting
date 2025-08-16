import React from 'react'
import SettingsForm from './_components/settings-form'
import { getUserForSysAdmin } from '@/actions/settings'
import { Unica_One } from 'next/font/google';

const fontUnicaOne = Unica_One({
  subsets:["latin"],
  weight: '400',
})

const SettingsPage = () => {
  const Users = getUserForSysAdmin()
  return (
    <div className='p-6'>
      <h1 className={`${fontUnicaOne.className} text-6xl md:text-[5rem]/[1] font-normal mb-6`}>User List</h1>
      <SettingsForm Users={Users}/>
    </div>
  )
}

export default SettingsPage
