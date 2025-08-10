import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Zen_Kaku_Gothic_Antique } from 'next/font/google'



const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})

function getActionLabel(action) {
  switch (action) {
    // Create
    case "createTransaction":
      return "Created Transaction";
    case "createTasking":
      return "Created Task";
    case "createUser":
      return "Created User";
    case "createAccount":
      return "Created Account";
    case "createSubAccount":
      return "Created Group Transaction";
    case "createCashflow":
      return "Created Cashflow";
    // Update
    case "updateTransaction":
      return "Transaction updated";
    case "updateUserRole":
      return "User role updated";
    case "updateCashflow":
      return "Cashflow updated";
    case "udpateBalanceQuick":
      return "Quick Edit Cashflow";
    // Delete
    case "deleteUser":
      return "User deleted";
    case "deleteCashflow":
      return "Cashflow deleted";
    case "bulkDeleteTransactions":
      return "Transactions deleted";
    case "bulkDeleteTask":
      return "Task deleted";
    case "scanReceipt":
      return "Scanned receipt(AI)";
    // Default
    case "updateUserEmail":
      return "Updated Email";
    case "updateUser":
      return "Updated User";
    case "getUserForSysAdmin":
      return "Visited User List";
    case "getUser":
      return "Visited User List";
    case "n":
      return "Visited User List";
    case "getOverallFinancialDataAnalysis":
      return "Overall Financial Analysis(AI)";
    case "getInflowOutflowForecast":
      return "Inflow & Outflow Forecast(AI)";
    case "getCashflowForecast":
      return "Cashflow Forecast(AI)";
    case "updateCashflowTransaction":
      return "Edited Cashflow";
    case "updateTotalOperating":
      return "Edited Operating Total";
    case "udpateNetchange":
      return "Edited Gross";
    case "updateStartBalance":
      return "Edited Beginning Balance";
    case "updateEndBalance":
      return "Edited Ending Balance";
    case "updateTotalInvesting":
      return "Edited Investing Total";
    case "updateTotalFinancing":
      return "Edited Financing Total";
    case "getSuggestedWeeklySchedule":
      return "Recommended Schedule(AI)";
    case "deleteSubAccountTransactionRelation":
      return "Removed transaction from a group";
    case "updateManyTransaction":
      return "Edited Activity type";
    case "updateSubAccountBalance":
      return "Edited Group's Balance";
    case "updateClientInfo":
      return "Edited Client Information";
    case "deleteSubAccount":
      return "Deleted a Group transaction";
    case "deleteCashflowStatement":
      return 'Deleted Cashflow Statement';
    default:
      return action;
  }
}


const DashboardSectionThree = ({ recentActivityLogs, roleCountList }) => {
  return (
    <div className={`${fontZenKaku.className} grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6`}>
      {/* Roles Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className='font-bold text-xl tracking-wide'>Users</CardTitle>
          <CardDescription className='font-normal'>
            Number of users per role in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {roleCountList.map(({ role, count }) => (
              <li key={role} className="flex justify-between py-2">
                <span className="font-medium !text-base capitalize">{role}</span>
                <span className="font-medium !text-base">{count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recent Activities Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className='font-bold text-xl tracking-wide'>Recent Activities</CardTitle>
          <CardDescription className='font-normal'>
            Most recent activities by users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {recentActivityLogs.map((log, idx) => (
              <li key={log.id || idx} className="py-2">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-medium text-base">{getActionLabel(log.action)}</span>
                  <span className="font-medium text-gray-500 text-sm mt-1 sm:mt-0">
                    {new Date(log.timestamp || log.createdAt).toLocaleString()}
                  </span>
                </div>
                {log.user && (
                  <span className="font-medium text-sm text-gray-400">
                    {log.user.Fname} {log.user.Lname}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardSectionThree