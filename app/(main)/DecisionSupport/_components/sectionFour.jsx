"use client"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Brain, Loader2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react'
import { useFinancialData } from '../_context/FinancialDataContext';
import { Zen_Kaku_Gothic_Antique } from 'next/font/google';
import useFetch from '@/hooks/use-fetch';
import { getSuggestedWeeklySchedule } from '@/actions/decisionSupport';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

function getStartOfWeekPH(date) {
  const phDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const day = phDate.getDay();
  phDate.setDate(phDate.getDate() - day);
  phDate.setHours(0, 0, 0, 0);
  return phDate;
}

function addDaysPH(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const daysOfWeek = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];


function formatTimePH(date) {
  // e.g. "15:00"
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(date);
}

function formatDatePH(date) {
  // e.g. "June 1"
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
  });
  return formatter.format(date);
}

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})

const SectionFour = () => {

  const { overallAnalysis, overallAnalysisLoading } = useFinancialData();

  const {
    loading: schedLoading,
    fn: AIschedulingFn,
    data: AIschedData,
  } = useFetch(getSuggestedWeeklySchedule);


  const AIgenerateSchedHandler = async () => {
    try {
     await AIschedulingFn();
      
      // You can add toast or UI feedback here if needed
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("Failed to generate AI schedule.");
    }
  }

    useEffect(() => {
      if(AIschedData && !schedLoading){
        if (AIschedData.code === 200) {
          console.log("AI Schedule Data:", AIschedData);
          toast.success("AI schedule generated successfully.");
        }
      }
    }, [schedLoading, AIschedData])

    useEffect(() => {
      if(AIschedData){
        if (AIschedData.code === 500) {
          console.log("Error:", AIschedData.message);
          toast.error("AI request quota limit might have been reached. Try again later.");
        }
        if (AIschedData.code === 501) {
          console.log("Error:", AIschedData.message);
          toast.error("Failed to generate suggested schedule. Try again.");
        }
      }
    }, [AIschedData])
  
  
  console.log("AIschedData", AIschedData)
    
    function mapAIScheduleToWeekDays(AIschedData) {
        const today = new Date();
        const startDay = getStartOfWeekPH(today);
        const scheduleData = AIschedData?.schedule || {};
        return daysOfWeek.map((day, i) => {
          const date = addDaysPH(startDay, i);
          const aiTasks = (scheduleData?.[day] || []).map((task, idx) => ({
            id: task.taskId || `ai-task-${day}-${idx}`,
            description: task.taskDescription || "no description",
            taskName: task.taskName || "No task Name",
            time: task.dueDate ? formatTimePH(new Date(task.dueDate)) : "no due date",
            color:
              task.urgency === "HIGH"
                ? "bg-red-100 text-red-800"
                : task.urgency === "MEDIUM"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-100 text-blue-800",
              urgencyLabel:
                task.urgency === "HIGH"
                  ? "High Priority"
                  : task.urgency === "MEDIUM"
                    ? "Medium Priority"
                    : "Low Priority",
          }));
          return {
            date,
            dayName: day.slice(0, 3),
            dayNumber: date.getDate().toString(),
            isToday: date.toLocaleDateString("en-US", { timeZone: "Asia/Manila" }) === today.toLocaleDateString("en-US", { timeZone: "Asia/Manila" }),
            tasks: aiTasks,
          };
        });
    }
  
    // --- WHICH WEEKDAYS TO DISPLAY ---
    const displayedWeekDays = useMemo(() => {
      if (AIschedData && typeof AIschedData === "object" && AIschedData?.code === 200) {
        return mapAIScheduleToWeekDays(AIschedData);
      }
      // fallback to static demo data if no AI data yet
      const today = new Date();
      const startDay = getStartOfWeekPH(today);
      return daysOfWeek.map((day, i) => {
        const date = addDaysPH(startDay, i);
        return {
          date,
          dayName: day.slice(0, 3),
          dayNumber: date.getDate().toString(),
          isToday: date.toLocaleDateString("en-US", { timeZone: "Asia/Manila" }) === today.toLocaleDateString("en-US", { timeZone: "Asia/Manila" }),
          tasks: [],
        };
      });
    }, [AIschedData]);
  
      const aiInsight = AIschedData?.schedule?.insight || "Click 'Schedule task' for an insight."; 


  return (
   <div className="mt-6">
      <Card>
        <CardHeader className={`${fontZenKaku.className} p-4`}>
          <div className="flex flex-col-reverse md:flex-row md:justify-between gap-2 items-center">
            <div>
              <CardTitle className="!font-bold text-xl text-center md:text-start">Forecast Analysis</CardTitle>
              <CardDescription className="font-nomral text-sm tracking-wide text-center md:text-start">
                Recommendations based on AI's financial data analysis.
              </CardDescription>
            </div>
            <Badge
               className="
                shine-effect
                flex items-center gap-1
                bg-black text-white
                px-2 py-0.5
                rounded-full
                
                transition
                hover:bg-gradient-to-r hover:from-blue-500 hover:to-violet-500
                hover:shadow-lg hover:shadow-blue-500/60
                cursor-pointer
                relative
                overflow-hidden
              "
            >
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
              <span className="!text-xs sm:!text-sm md:!text-base
                !font-medium tracking-wide truncate">AI Generated</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className={`${fontZenKaku.className}`}>
          {overallAnalysisLoading ? (
            <div className="flex flex-col items-center justify-center h-56 w-full relative">
              {/* Animated gradient ring */}
              <span className="relative flex h-16 w-16 mb-4">
                <span className="animate-spin absolute inline-flex h-full w-full rounded-full bg-gradient-to-tr from-blue-400 via-violet-400 to-blue-400 opacity-30"></span>
                <span className="relative inline-flex rounded-full h-16 w-16 bg-white items-center justify-center border-4 border-blue-400">
                  <Loader2 className="text-blue-500 animate-spin" size={32} />
                </span>
              </span>
              {/* Loading text */}
              <span className="text-blue-700 font-semibold mb-4 text-center text-base md:text-lg">
                Collecting data and making analysis.
              </span>
              {/* Shimmer skeleton bar */}
              <div className="w-full max-w-xs">
                <div className="h-4 rounded bg-gradient-to-r from-blue-100 via-violet-100 to-blue-100 animate-pulse" />
              </div>
            </div>
          ) : overallAnalysis?.success ? (
            <div className="w-full overflow-x-auto lg:overflow-x-visible">
              <div className="grid gap-4
                grid-flow-col grid-rows-1 auto-cols-[85vw] sm:auto-cols-[340px]
                lg:grid-cols-2 lg:grid-rows-2 lg:auto-cols-fr"
              >
                {overallAnalysis.insights?.map((insight, index) => (
                  <Card
                    key={insight.id || index}
                    className="
                      border-l-4 border-l-blue-500
                      transition hover:shadow-xl hover:-translate-y-1
                      duration-200 bg-white rounded-xl cursor-pointer
                      h-full
                    "
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="font-bold text-base sm:text-lg lg:text-xl">
                          {insight.recommendationTitle}
                        </CardTitle>
                        <Badge className={
                          insight.impactLevel === "HIGH IMPACT"
                            ? "font-medium bg-red-100 text-red-800 text-center"
                            : insight.impactLevel === "MEDIUM IMPACT"
                              ? "font-medium bg-yellow-100 text-yellow-800 text-center"
                              : "font-medium bg-blue-100 text-blue-800 text-center"
                        }>
                          {insight.impactLevel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="font-medium text-xs sm:text-sm lg:text-base text-gray-600">
                        {insight.detail}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40">
              <span className="font-bold text-base md:text-lg text-gray-400">No analysis generated yet.</span>
            </div>
          )}
        </CardContent>
      </Card>




      <Card className="w-full flex flex-col mt-4">
        <CardHeader className={`${fontZenKaku.className}`}>
          <CardTitle className='!font-bold text-base'>Weekly Schedule</CardTitle>
          <CardDescription className='!font-normal text-sm tracking-wide'>
            Your tasks and appointments for this week.{" "}
            <Popover>
              <PopoverTrigger className={`${fontZenKaku.className} underline text-muted-foreground !text-blue-600 
              !font-normal cursor-pointer hover:!font-bold hover:no-underline`}>
                Show AI Priority Insight.
              </PopoverTrigger>
              <PopoverContent>
                <Alert className={`${fontZenKaku.className} bg-sky-200 border-sky-500 `}>
                  <AlertTitle className="!font-bold text-base text-zinc-500 flex items-center gap-2">
                    <Info className="h-6 w-6 text-sky-500" />
                    {AIschedData
                      ? "AI says the ideal priority today:"
                      : "Ideal Priority Today"
                    }
                  </AlertTitle>
                  <AlertDescription className="font-normal text-base text-zinc-500">
                    {aiInsight}
                  </AlertDescription>
                </Alert>
              </PopoverContent>
            </Popover>
          </CardDescription>
        </CardHeader>
        {/* Make CardContent take all available vertical space and arrange children in a column */}
        <CardContent className={`${fontZenKaku.className} flex-1 flex flex-col p-0`}>
          <ScrollArea className="h-[42vh] max-h-[500px] min-h-[300px] overflow-auto pr-4">
            <div className="space-y-4 px-6 pt-4 pb-2">
              {schedLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))
              ) : (
                displayedWeekDays.map((day) => (
                  <div key={day.dayName} className="space-y-2">
                    <div className={`flex items-center ${day.isToday ? "text-blue-600 font-bold" : "text-gray-700"}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${day.isToday ? "bg-blue-100" : "bg-gray-100"}`}>
                        <div className="text-center">
                          <div className="font-medium text-xs">{day.dayName}</div>
                          <div className="text-base font-medium">{day.dayNumber}</div>
                        </div>
                      </div>
                      <span className="font-medium text-base">{formatDatePH(day.date)}</span>
                      {day.isToday && (
                        <Badge className="font-normal text-base ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Today
                        </Badge>
                      )}
                    </div>
                    {day.tasks.length > 0 ? (
                      <div className="ml-13 pl-10 border-l-2 border-gray-200 space-y-3">
                        {day.tasks.map((task) => (
                          <div key={task.id} className="bg-white rounded-lg border p-3 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div className='flex flex-col'>
                                <Badge className={`!font-medium !text-xs ${task.color} mb-1`}>
                                        {task.urgencyLabel}
                                      </Badge>
                                <Popover>
                                  <PopoverTrigger className="!text-base !font-medium">
                                    {task.taskName}
                                  </PopoverTrigger>
                                  <PopoverContent className="!font-medium !text-sm max-w-xs">
                                    {task.description}
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="ml-13 pl-10 border-l-2 border-gray-200 py-2">
                        <p className="font-bold text-base text-gray-500">No scheduled tasks</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            type="button"
            onClick={AIgenerateSchedHandler}
            disabled={schedLoading}
            className={`${fontZenKaku.className}
              w-full !rounded-button whitespace-nowrap 
              shine-effect
              flex items-center gap-1
              bg-black text-white
              text-sm md:!text-base font-medium
              tracking-wide transition
              hover:bg-gradient-to-r hover:from-blue-500 hover:to-violet-500
              hover:shadow-lg hover:shadow-blue-500/60
              cursor-pointer
              relative
              overflow-hidden
            `}>
            {schedLoading
              ? <Loader2 className="animate-spin h-4 w-4 mr-2"/>
              : <Bot className='mr-2'/> 
            } Schedule task with AI
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default SectionFour
