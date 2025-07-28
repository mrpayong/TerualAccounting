import React from 'react'
import DashboardSectionOne from './_components/DashboardSectionOne'
import { getAccounts, getActivityLogs, getCountActLogs, getCountCFS, getCountTransactions, getCountUsers } from '@/actions/admin';
import DashboardSectionTwo from './_components/DashboardSectionTwo';
import DashboardSectionThree from './_components/DashboardSectionThree';
import { getUser } from '@/actions/settings';



const AdminPage = async () => {
  const activityLogs = await getCountActLogs();
  const activityList = await getActivityLogs();
  const CfsLogs = await getCountCFS();
  const accounts = await getAccounts();
  const Users = await getCountUsers();
  const transactions = await getCountTransactions();
  const userList = await getUser();

  const activityCount = activityLogs.data;
  const CfsCount = CfsLogs.data;
  const accountCount = accounts.data.length;
  const UserCount = Users.data;
  const transactionCount = transactions.data;
  console.log("accounts and transactions: ",accounts,)


  const typeCounts = accounts.data.reduce((acc, account) => {
  acc[account.type] = (acc[account.type] || 0) + 1;
  return acc;
  }, {});
  // Convert to array for chart libraries
  const pieChartData = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
  }));
  


  const lineChartData = accounts.data.map(account => ({
    name: account.name,
    transactions: account._count.transactions,
    id: account.id,
  }))

  const recentActivityLogs = [...activityList.data]
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  .slice(0, 5);

  const roleCounts = userList.data.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

// Convert to array for easy mapping in UI
  const roleCountList = Object.entries(roleCounts).map(([role, count]) => ({
    role,
    count,
  }));




  


  return (
    <div className='p-6'>
      <div className="flex flex-col justify-start mb-6">
        <span className="text-4xl font-bold">Admin Dashboard</span>
        <span className="text-sm text-slate-600 p-0">Reports of all recents activities.</span>
      </div>
      <DashboardSectionOne transactionCount={transactionCount} CfsCount={CfsCount} UserCount={UserCount} activityCount={activityCount} accountCount={accountCount}/>
      <DashboardSectionTwo lineChartData={lineChartData} pieChartData={pieChartData}/>
      <DashboardSectionThree roleCountList={roleCountList} recentActivityLogs={recentActivityLogs}/>
    </div>
  // data analytics for sessions counts
  // instructions for admin abilities

    
  )
}

export default AdminPage;
