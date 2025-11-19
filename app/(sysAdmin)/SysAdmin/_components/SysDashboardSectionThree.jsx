"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Progress } from "@/components/ui/progress"
import { CircleUserRound } from "lucide-react";
import { Zen_Kaku_Gothic_Antique } from 'next/font/google';


const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})

const ROLE_COLORS = {
  ADMIN: "bg-emerald-500",
  STAFF: "bg-sky-500",
  SYSADMIN: "bg-yellow-400",
};

const roles = ["ADMIN", "STAFF", "SYSADMIN"];

function formatToPhilippinesTime(isoString) {
  const date = new Date(isoString);
  const time = date.toLocaleTimeString("en-PH", {
    timeZone: "Asia/Manila",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateStr = date.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  return `${time} ${dateStr}`;
}

const SysDashboardSectionThree = ({ UserRoleCount, recentSessions }) => {

  const roleCounts = UserRoleCount?.data || {};
  const total = Object.values(roleCounts).reduce((sum, n) => sum + n, 0) || 1; // avoid division by zero

  // Prepare segments for the progress bar
  const segments = roles.map(role => ({
    role,
    count: roleCounts[role] || 0,
    percent: ((roleCounts[role] || 0) / total) * 100,
    color: ROLE_COLORS[role],
  }));

  function formatSessionAction(action) {
  switch (action) {
    case "SESSION-CREATED":
      return "Log In";
    case "SESSION-REMOVED":
      return "Log Out";
    case "EMAIL-CREATED":
      return "OTP Requested";
    default:
      return "Unknown Session";
  }
}


  return (
    <div className={`${fontZenKaku.className} flex flex-col gap-6 w-full mt-6`}>
      {/* Roles Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className='!font-bold text-xl'>User roles</CardTitle>
          <CardDescription className='font-normal text-sm tracking-wide'>
            Breakdown of user roles
          </CardDescription>
        </CardHeader>
        <CardContent>
        <div
            className="w-full h-5 rounded-full bg-gray-100 flex overflow-hidden"
            role="progressbar"
            aria-label="User roles distribution"
            aria-valuenow={total}
            aria-valuemax={total}
          >
            {segments.map(
              ({ role, percent, color }, idx) =>
                percent > 0 && (
                  <div
                    key={role}
                    className={`${color} h-full`}
                    style={{
                      width: `${percent}%`,
                      transition: "width 0.5s",
                    }}
                    aria-label={role}
                  />
                )
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-xs text-gray-700">
          {segments.map(({ role, count, color }) => (
            <div key={role} className="flex items-center gap-1">
              <span className={`inline-block w-3 h-3 rounded-sm ${color}`} />
              <span className="font-medium text-base">{role}</span>
              <span className="font-medium text-base">- {count}</span>
            </div>
          ))}
        </CardFooter>
      </Card>

      {/* Recent Sessions List */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className='!font-bold text-xl'>Recent Sessions</CardTitle>
          <CardDescription className='font-normal text-sm tracking-wide'>
            Most recent sessions by users. (PHT).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {recentSessions && recentSessions.length > 0 ? (
              recentSessions.map((session, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 py-3"
                >
                  <CircleUserRound className="w-7 h-7 text-gray-400 shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium text-base text-gray-900 truncate">
                        {session.Fname} {session.Lname}
                      </span>
                      <span className="font-medium text-sm text-gray-500 mt-1 sm:mt-0 whitespace-nowrap">
                        {formatToPhilippinesTime(session.localizedTimestamp)}
                      </span>
                    </div>
                    <span className="font-medium text-sm text-blue-500 uppercase tracking-wide">
                      {formatSessionAction(session.action)}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="py-3 text-gray-400 text-center font-medium text-sm">No recent sessions found.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default SysDashboardSectionThree