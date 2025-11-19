import React from 'react'
import SysDashboardSectionOne from './_components/SysDashboardSectionOne'
import SysDashboardSectionTwo from './_components/SysDashboardSectionTwo'
import SysDashboardSectionThree from './_components/SysDashboardSectionThree'
import { getCountUsers, getMonthlyActivityLogs, getSessionList, getUserRoleCounts, getWebhookSessions } from '@/actions/admin'
import { Unica_One, Zen_Kaku_Gothic_Antique } from 'next/font/google'


const fontUnicaOne = Unica_One({
  subsets:["latin"],
  weight: "400",
})

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: '400',
})

const SysAdminPage = async () => {
  const UserRoleCount = await getUserRoleCounts();
  const SessionList =  await getWebhookSessions();
  const Users = await getCountUsers();
  const activities = await getMonthlyActivityLogs();


  const userCount = Users.data;

  
   // Defensive: ensure data is an array
  const allSessions = Array.isArray(SessionList?.data) ? SessionList.data : [];

  // Sort by meta.localizedTimestamp (or fallback to createdAt if needed)
  const sortedSessions = allSessions
    .slice()
    .sort((a, b) => {
      const aTime = a.meta?.localizedTimestamp
        ? new Date(a.meta.localizedTimestamp.replace(/(\d{2}:\d{2}:\d{2}) (\d{4}-\d{2}-\d{2})/, '$2T$1'))
        : new Date(a.createdAt);
      const bTime = b.meta?.localizedTimestamp
        ? new Date(b.meta.localizedTimestamp.replace(/(\d{2}:\d{2}:\d{2}) (\d{4}-\d{2}-\d{2})/, '$2T$1'))
        : new Date(b.createdAt);
      return bTime - aTime;
    });

  // Take the 5 most recent and map to required fields
  const recentSessions = sortedSessions.slice(0, 5).map(session => ({
    action: session.action,
    Fname: session.user?.Fname || '',
    Lname: session.user?.Lname || '',
    localizedTimestamp: session.meta?.localizedTimestamp || '',
  }));


  const sessionCounts = allSessions.reduce(
    (acc, session) => {
      switch (session.action) {
        case "SESSION-CREATED":
          acc.signIn += 1;
          break;
        case "SESSION-REMOVED":
          acc.signOut += 1;
          break;
        case "EMAIL-CREATED":
          acc.otpRequest += 1;
          break;
        default:
          break;
      }
      return acc;
    },
    { signIn: 0, signOut: 0, otpRequest: 0 }
  );

  return (
    <div className='p-6'>
      <div className="flex flex-col justify-start mb-6">
        <span className={`${fontUnicaOne.className} text-5xl lg:text-[5rem]/[1] font-normal`}>System Admin Dashboard</span>
        <span className={`${fontZenKaku.className} font-normal text-sm tracking-wide text-slate-600 p-0`}>Reports of all recents system activities.</span>
      </div>
      <SysDashboardSectionOne userCount={userCount} sessionCounts={sessionCounts} />
      <SysDashboardSectionTwo activities={activities}/>
      <SysDashboardSectionThree UserRoleCount={UserRoleCount} recentSessions={recentSessions}/>
    </div>
  )
}

export default SysAdminPage;




