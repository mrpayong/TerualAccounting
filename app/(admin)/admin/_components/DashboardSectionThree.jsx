import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

const DashboardSectionThree = ({ recentActivityLogs, roleCountList }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
      {/* Roles Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Number of users per role in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {roleCountList.map(({ role, count }) => (
              <li key={role} className="flex justify-between py-2">
                <span className="capitalize">{role}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="text-xs text-gray-500">
          All roles with their corresponding user count.
        </CardFooter>
      </Card>

      {/* Recent Activities Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Most recent activities by users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {recentActivityLogs.map((log, idx) => (
              <li key={log.id || idx} className="py-2">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-gray-500 text-xs mt-1 sm:mt-0">
                    {new Date(log.timestamp || log.createdAt).toLocaleString()}
                  </span>
                </div>
                {log.user && (
                  <span className="text-xs text-gray-400">
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