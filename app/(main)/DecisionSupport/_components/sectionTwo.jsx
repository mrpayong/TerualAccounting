"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarPlot, ChartContainer, ChartsXAxis, ChartsYAxis, LineChart, LinePlot, MarkPlot } from '@mui/x-charts';
import { taskSchema } from '@/app/lib/schema';
import { useForm } from 'react-hook-form';
import useFetch from '@/hooks/use-fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from "sonner";
import { Bot, Brain, Info, Loader2, Minus, Square } from "lucide-react";
import { createTasking } from '@/actions/task';
import { getCashflowForecast, getInflowOutflowForecast, getOverallFinancialDataAnalysis, getSuggestedWeeklySchedule } from '@/actions/decisionSupport';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import { Area, AreaChart, ResponsiveContainer, Tooltip as AreaTooltip, CartesianGrid, XAxis, YAxis, Legend, ReferenceLine, BarChart, Bar } from "recharts"
import { useFinancialData } from '../_context/FinancialDataContext';
import { BarLoader } from 'react-spinners';
import { Skeleton } from '@/components/ui/skeleton';



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

const ChartSkeleton = ({ height = "h-[350px]" }) => (
  <CardContent className={`flex flex-col justify-end w-full ${height} p-4`}>
    <div className="flex items-end h-full w-full gap-2">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`
            bg-gradient-to-t from-blue-200 to-violet-100
            animate-pulse
            rounded
            w-full
            ${i % 2 === 0 ? "h-2/3" : "h-1/3"}
            sm:h-1/2
          `}
          style={{ minWidth: "10px", maxWidth: "32px" }}
        />
      ))}
    </div>
    <div className="flex justify-between mt-2">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-2 w-6 bg-blue-100 rounded animate-pulse"
        />
      ))}
    </div>
  </CardContent>
);

function formatDatePH(date) {
  // e.g. "June 1"
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
  });
  return formatter.format(date);
}

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

const daysOfWeek = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];


const SectionTwo = ({ accounts, transactions }) => {
    const financialChartRef = useRef(null);
    const cashFlowChartRef = useRef(null);
    const [selectedClient, setSelectedClient] = useState("all");
    const [addNew, setAddNew] = useState(false);
    const [users, setUsers] = useState([]);

    const formatAmount = (amount) => {
      return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      }).format(amount);
    };

    const formatMonthYear = (monthStr) => {
      // monthStr is "YYYY-MM"
      const [year, month] = monthStr.split("-");
      const date = new Date(`${year}-${month}-01`);
      return date.toLocaleString("en-US", { month: "long", year: "numeric" });
    };


  const [cashFlowData, setCashFlowData] = useState([
    { week: "Week 1", cashIn: 120, cashOut: 220, balance: 150 },
    { week: "Week 2", cashIn: 132, cashOut: 182, balance: 232 },
    { week: "Week 3", cashIn: 101, cashOut: 191, balance: 201 },
    { week: "Week 4", cashIn: 134, cashOut: 234, balance: 154 },
    { week: "Week 5", cashIn: 90, cashOut: 290, balance: 190 },
    { week: "Week 6", cashIn: 230, cashOut: 330, balance: 330 },
    { week: "Week 7", cashIn: 210, cashOut: 310, balance: 410 },
    { week: "Week 8", cashIn: 240, cashOut: 320, balance: 340 },
  ]);



 

const getPhilippinesDate = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
      });

      const [month, day, year] = formatter.format(now).split("/");
      return new Date(`${year}-${month}-${day}`);
  };

  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    reset, 
    formState: { errors } 
      } = useForm({
        resolver: zodResolver(taskSchema),
        defaultValues:  {
            taskName: "",
            taskCategory: "",
            taskDescription: "",
            urgency: "MEDIUM",
            dueDate: getPhilippinesDate(),
          },
      });

  // For MUI DateCalendar
  const [dueDate, setDueDate] = useState( null);

  const handleClear = () => {
    reset();
    setDueDate(null);
  };

  const {
    loading: taskLoading,
    fn: createTaskFn,
    data: taskData,
    error: taskError,
  } = useFetch(createTasking)



    const onSubmit = async (data) => {
      console.log("creating task...")
      await createTaskFn(data);
  };

  useEffect(() => {
    if (taskError) {
      console.error("Error creating task:", taskError);
      toast.error("Failed to create task. Please try again.");
    }
  }, [taskLoading, taskError]);

  useEffect(() => {
    if (taskData) {
      console.log("Task created successfully:", taskData);
      toast.success("Task created successfully.");
      reset();
    }
  }, [taskLoading, taskData]);

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
    if (AIschedData) {
      console.log("AI Schedule Data:", AIschedData);
      toast.success("AI schedule generated successfully.");
    }
  }, [schedLoading, AIschedData])


  
function mapAIScheduleToWeekDays(AIschedData) {
    const today = new Date();
    const startDay = getStartOfWeekPH(today);
    return daysOfWeek.map((day, i) => {
      const date = addDaysPH(startDay, i);
      const aiTasks = (AIschedData?.[day] || []).map((task, idx) => ({
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
    if (AIschedData && typeof AIschedData === "object") {
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

    const aiInsight = AIschedData?.insight || "Click generate for an insight.";


const [isResponsive, setIsResponsive] = useState(true);
 const sizingProps = isResponsive ? {} : { width: 500, height: 300 };


  const [areaChartData, setAreaChartData] = useState([]);
  const { selectedAccountId, setCashflowData, setInflowOutflowData, setOverallAnalysis, setOverallAnalysisLoading } = useFinancialData();
  const {
      loading: cfsForecastLoading,
      fn: cfsForecastFn,
      data: cfsForecastData,
    } = useFetch(getCashflowForecast);

  const {
    loading: inflowOutflowloading,
    fn: inflowOutflowfn,
    data: inflowOutflowdata,
  } = useFetch(getInflowOutflowForecast)

  const {
    loading: overallFinancialDataLoading,
    fn: overallFinancialDataFn,
    data: overallFinancialDataAnalysis,
  } = useFetch(getOverallFinancialDataAnalysis)

  const [forecastLoading, setForecastLoading] = useState(false)
  const cfsForecastHandler = async () => {
     if (!selectedAccountId) {
      toast.error("Please select an account first.");
      return;
    }
    setForecastLoading(true);
    setOverallAnalysisLoading(true);
    try {
     
     await cfsForecastFn(selectedAccountId);
     await inflowOutflowfn(selectedAccountId);
      await overallFinancialDataFn(
        cfsForecastData || [],
        cfsForecastData || [],);
  } catch (error) {
    console.error("Error generating schedule:", error);
    toast.error("Failed to generate AI schedule.");
    setOverallAnalysisLoading(false);
      setForecastLoading(false);
  }
  }
  useEffect(() => {
    if (cfsForecastData?.success === false) {
      toast.error("AI rate limit might have been reached.");
      console.log("Overall Financial Data Analysis:", cfsForecastData);
    }
  }, [cfsForecastData]);

  useEffect(() => {
    if (inflowOutflowdata?.success === false) {
      toast.error("AI rate limit might have been reached.");
      console.log("Overall Financial Data Analysis:", inflowOutflowdata);
    }
  }, [inflowOutflowdata]);


  useEffect(() => {
    if (cfsForecastData) {
      // Combine historical and forecast data
      setForecastLoading(false)
      const historical = (cfsForecastData.historical || []).map(d => ({
        month: d.month,
        netChange: d.netChange,
        isForecast: false,
      }));
      console.log("Historical Data:", historical);
      const forecast = (cfsForecastData.forecast || []).map(d => ({
        month: d.month,
        netChange: d.amount,
        isForecast: true,
      }));
      console.log("Forecast Data:", forecast);
      setAreaChartData([...historical, ...forecast]);
      setCashflowData(cfsForecastData);
      toast.success("Cashflow forecast generated.")
    }
  }, [cfsForecastData]);

  const [barChartData, setBarChartData] = useState([]);
  useEffect(() => {
    if (inflowOutflowdata) {
      setForecastLoading(false)
       const monthsSet = new Set([
      ...(inflowOutflowdata.historical.inflows || []).map(d => d.month),
      ...(inflowOutflowdata.historical.outflows || []).map(d => d.month),
      ...(inflowOutflowdata.inflowForecast || []).map(d => d.month),
      ...(inflowOutflowdata.outflowForecast || []).map(d => d.month),
    ]);
    const allMonths = Array.from(monthsSet).sort();

    // Merge inflow/outflow for each month
    const merged = allMonths.map(month => {
      const histIn = (inflowOutflowdata.historical.inflows || []).find(d => d.month === month);
      const histOut = (inflowOutflowdata.historical.outflows || []).find(d => d.month === month);
      const forIn = (inflowOutflowdata.inflowForecast || []).find(d => d.month === month);
      const forOut = (inflowOutflowdata.outflowForecast || []).find(d => d.month === month);
      const isForecast = !!(forIn || forOut);
      return {
        month,
        inflow: histIn?.amount ?? forIn?.amount ?? 0,
        outflow: histOut?.amount ?? forOut?.amount ?? 0,
        isForecast,
      };
    });

    setBarChartData(merged);
    setInflowOutflowData(inflowOutflowdata);
      console.log("Inflow/Outflow Data:", inflowOutflowdata);
      
    }
  }, [inflowOutflowdata])

  const firstForecast = barChartData.find(d => d.isForecast);
const forecastStartMonth = firstForecast ? firstForecast.month : null;


  useEffect(() => {
    if (overallFinancialDataAnalysis) {
      setForecastLoading(false)
      setOverallAnalysisLoading(false);
      setOverallAnalysis(overallFinancialDataAnalysis);
      console.log("Overall Financial Data Analysis:", overallFinancialDataAnalysis);
    }
  }, [overallFinancialDataLoading, overallFinancialDataAnalysis]);

    useEffect(() => {
    if (overallFinancialDataAnalysis?.success === false) {
      setForecastLoading(false)
      setOverallAnalysisLoading(false);
      setOverallAnalysis(overallFinancialDataAnalysis);
      toast.error("AI rate limit might have been reached.");
      console.log("Overall Financial Data Analysis:", overallFinancialDataAnalysis);
    }
  }, [ overallFinancialDataAnalysis]);





const xProp = areaChartData.find(d => d.isForecast)?.month


































  return (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left Column: Financial Forecasts */}
    <div className="lg:col-span-2 space-y-6">
      {/* Financial Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast of Cashflow</CardTitle>
          <CardDescription>
            Forecasting growth rate from average gross based on provided cashflow records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full md:px-4">
            {cfsForecastLoading || forecastLoading ? (
                <ChartSkeleton height="h-[350px]" />
              ) : (
              <div className="w-full h-[350px] overflow-x-auto sm:overflow-x-visible">
                <div className="min-w-[600px] sm:min-w-0 h-full">
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                      data={areaChartData}
                      // margin={{ top: 30, right: 30, left: 20, bottom: 30 }}
                    >
                      <defs>
                        <linearGradient id="colorNetChange" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="month"
                        tickFormatter={formatMonthYear}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tickFormatter={formatAmount}
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      

                    
                      <AreaTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                                <div className="font-semibold text-gray-700">{formatMonthYear(label)}</div>
                                <div className="text-blue-600 font-bold">
                                  Gross: {formatAmount(payload[0].value)}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="netChange"
                        stroke="#2563eb"
                        fill="url(#colorNetChange)"
                        name="Gross"
                        isAnimationActive={false}
                        dot={false}
                        connectNulls
                        strokeWidth={2}
                      />
                      <CartesianGrid strokeDasharray="3 3" />
                      {areaChartData.find(d => d.isForecast) && (
                        <ReferenceLine
                          x={xProp}
                          stroke="#fbbf24"
                          strokeDasharray="3 3"
                          label={{ value: "Forecast", position: "insideTopRight", fill: "#fbbf24" }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer> 
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end bg-gray-50 border-t border-gray-100 py-4">
          
          <Button 
            className="
            !rounded-button whitespace-nowrap 
            shine-effect
            flex items-center gap-1
            bg-black text-white
            text-sm font-semibold
            transition
            hover:bg-gradient-to-r hover:from-blue-500 hover:to-violet-500
            hover:shadow-lg hover:shadow-blue-500/60
            cursor-pointer
            relative
            overflow-hidden
            "
            type="button"
            disabled={cfsForecastLoading}
            onClick={cfsForecastHandler}>
              {cfsForecastLoading
                ? <Loader2 className="animate-spin h-4 w-4 mr-2"/>
                : <Brain/> 
              }
              {cfsForecastData ? "Regenerate" : "Generate AI powered forecast"} 
          </Button>
        </CardFooter>
      </Card>

      {/* Cash Flow Projection */}
      <Card>
        <CardHeader>
          <CardTitle>Inflow and Outflow Forecast</CardTitle>
          <CardDescription>
            The forecast inflow and outflow of cash based on historical data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full px-2 md:px-4 h-[350px]">
            {inflowOutflowloading || forecastLoading ? (
                <ChartSkeleton height="h-[350px]" />
              ) : (
              <div className="w-full h-[350px] overflow-x-auto sm:overflow-x-visible">
                <div className="min-w-[600px] sm:min-w-0 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <XAxis dataKey="month" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatMonthYear} 
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={60}/>
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatAmount} 
                        width={80}/>
                      <AreaTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white rounded-lg shadow-lg p-4">
                                <div className="text-lg mb-2">{formatMonthYear(label)}</div>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center text-sm">
                                    <span>Inflow:</span>
                                    <span className="ml-2 text-green-600">{formatAmount(payload[0].value)}</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <span>Outflow:</span>
                                    <span className="ml-2 text-red-600">{formatAmount(payload[1].value)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}/>
                      <Legend />
                      <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} />
                      <Bar dataKey="inflow" name="Inflow" fill="#22c55e" />
                      <Bar dataKey="outflow" name="Outflow" fill="#ef4444" />
                      {forecastStartMonth && (
                        <ReferenceLine
                          x={forecastStartMonth}
                          stroke="#6366f1"
                          strokeDasharray="6 3"
                          label={{
                            value: "Forecast",
                            position: "insideTopRight",
                            fill: "#6366f1",
                            fontWeight: "bold",
                            fontSize: 12,
                          }}
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer> 
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <span className='text-sm text-neutral-500 p-1'>Forecast starts at blue broken line</span>
        </CardFooter>
      </Card>
    </div>

    {/* Right Column: Urgency Meters and Calendar */}
    <div className="space-y-6 flex flex-col h-full lg:min-h-[700px]">
        {/* AI CFS forecast insight */}
      <div className="flex flex-col gap-4 h-auto lg:min-h-[340px]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Insight on the Forecast</CardTitle>
            <CardDescription className="text-xs">
              {cfsForecastData
                ? "Here's what the AI thinks base on the historical data and it's forecast."
                : "Generate the forecast to see AI's insights."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {cfsForecastData?.insight && (
              <Alert className="mt-4 bg-blue-50 border-blue-200 h-full">
                <AlertTitle className="flex flex-row items-center"><Brain className='h-4 w-4 mr-2'/> AI Insight</AlertTitle>
                <AlertDescription>{cfsForecastData.insight}</AlertDescription>
                {cfsForecastData.issuesOrImprovements && cfsForecastData.issuesOrImprovements.length > 0 && (
                  <div className="mt-2">
                    <ul className="list-disc list-inside space-y-1">
                      {cfsForecastData.issuesOrImprovements.map((issue, index) => (
                        <li key={index}>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Alert>
            )}
          </CardContent>
        </Card>
        <Alert className="bg-sky-200 border-sky-500 h-full">
          <AlertTitle className="text-zinc-500 flex items-center gap-2">
            <Info className="h-6 w-6 text-sky-500" />
            {AIschedData
              ? "AI says the ideal priority today:"
              : "Ideal Priority Today"
            }
          </AlertTitle>
          <AlertDescription className="text-zinc-500">
            {aiInsight}
          </AlertDescription>
        </Alert>
      </div>

        {/* Weekly Calendar */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            Your tasks and appointments for this week
          </CardDescription>
        </CardHeader>
        {/* Make CardContent take all available vertical space and arrange children in a column */}
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 min-h-[300px] max-h-[500px] pr-4">
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
                          <div className="text-xs">{day.dayName}</div>
                          <div className="text-base font-semibold">{day.dayNumber}</div>
                        </div>
                      </div>
                      <span className="font-medium text-base">{formatDatePH(day.date)}</span>
                      {day.isToday && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Today
                        </Badge>
                      )}
                    </div>
                    {day.tasks.length > 0 ? (
                      <div className="ml-13 pl-10 border-l-2 border-gray-200 space-y-3">
                        {day.tasks.map((task) => (
                          <div key={task.id} className="bg-white rounded-lg border p-3 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge className={`${task.color} mb-1`}>
                                        {task.urgencyLabel}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs text-xs">
                                      {task.description}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <p className="text-sm font-medium">{task.taskName}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="ml-13 pl-10 border-l-2 border-gray-200 py-2">
                        <p className="text-sm text-gray-500 italic">No scheduled tasks</p>
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
            className="
              w-full !rounded-button whitespace-nowrap 
              shine-effect
              flex items-center gap-1
              bg-black text-white
              text-sm font-semibold
              transition
              hover:bg-gradient-to-r hover:from-blue-500 hover:to-violet-500
              hover:shadow-lg hover:shadow-blue-500/60
              cursor-pointer
              relative
              overflow-hidden
            ">
            {schedLoading
              ? <Loader2 className="animate-spin h-4 w-4 mr-2"/>
              : <Bot className='mr-2'/> 
            } Schedule task with AI
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
  )
}

export default SectionTwo
