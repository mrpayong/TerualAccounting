import React from 'react'
import SettingsForm from './_components/settings-form'
import { Unica_One } from 'next/font/google'

const fontUnicaOne = Unica_One({
  subsets:["latin"],
  weight: "400",
})


const SettingsPage = () => {
  return (
    <div className='p-6'>
      <h1 className={`${fontUnicaOne.className} text-6xl md:text-[5rem]/[1] font-normal mb-6`}>User List</h1>
      <SettingsForm />
      {/* view detailes: about which accounts a user handles. IN CLIENT PAGE */}
    </div>
  )
}

export default SettingsPage
