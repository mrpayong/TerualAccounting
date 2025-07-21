// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
"use client"
import React, { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
// import * as echarts from 'echarts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SectionThree = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedClient, setSelectedClient] = useState('all');
  const [financialData, setFinancialData] = useState([
    { month: 'Jan', revenue: 320, expenses: 120, netProfit: 200 },
    { month: 'Feb', revenue: 332, expenses: 132, netProfit: 200 },
    { month: 'Mar', revenue: 301, expenses: 101, netProfit: 200 },
    { month: 'Apr', revenue: 334, expenses: 134, netProfit: 200 },
    { month: 'May', revenue: 390, expenses: 90, netProfit: 300 },
    { month: 'Jun', revenue: 330, expenses: 230, netProfit: 100 },
    { month: 'Jul', revenue: 320, expenses: 210, netProfit: 110 },
    { month: 'Aug', revenue: 340, expenses: 180, netProfit: 160 },
    { month: 'Sep', revenue: 356, expenses: 190, netProfit: 166 },
    { month: 'Oct', revenue: 378, expenses: 200, netProfit: 178 },
    { month: 'Nov', revenue: 398, expenses: 210, netProfit: 188 },
    { month: 'Dec', revenue: 420, expenses: 195, netProfit: 225 }
  ]);
  const [cashFlowData, setCashFlowData] = useState([
    { week: 'Week 1', cashIn: 120, cashOut: 220, balance: 150 },
    { week: 'Week 2', cashIn: 132, cashOut: 182, balance: 232 },
    { week: 'Week 3', cashIn: 101, cashOut: 191, balance: 201 },
    { week: 'Week 4', cashIn: 134, cashOut: 234, balance: 154 },
    { week: 'Week 5', cashIn: 90, cashOut: 290, balance: 190 },
    { week: 'Week 6', cashIn: 230, cashOut: 330, balance: 330 },
    { week: 'Week 7', cashIn: 210, cashOut: 310, balance: 410 },
    { week: 'Week 8', cashIn: 240, cashOut: 320, balance: 340 }
  ]);

  // Client financial data
  const [clientFinancialData, setClientFinancialData] = useState([
    { 
      id: 'abc-corp',
      name: 'ABC Corporation',
      revenue: 1250000,
      expenses: 875000,
      profit: 375000,
      cashFlow: 420000,
      debtRatio: 0.32,
      growthRate: 0.08
    },
    { 
      id: 'xyz-inc',
      name: 'XYZ Inc',
      revenue: 980000,
      expenses: 720000,
      profit: 260000,
      cashFlow: 310000,
      debtRatio: 0.28,
      growthRate: 0.05
    },
    { 
      id: 'global-traders',
      name: 'Global Traders',
      revenue: 1450000,
      expenses: 1120000,
      profit: 330000,
      cashFlow: 380000,
      debtRatio: 0.41,
      growthRate: 0.07
    },
    { 
      id: 'tech-solutions',
      name: 'Tech Solutions',
      revenue: 2100000,
      expenses: 1680000,
      profit: 420000,
      cashFlow: 520000,
      debtRatio: 0.25,
      growthRate: 0.12
    },
    { 
      id: 'retail-masters',
      name: 'Retail Masters',
      revenue: 1680000,
      expenses: 1350000,
      profit: 330000,
      cashFlow: 290000,
      debtRatio: 0.38,
      growthRate: 0.04
    }
  ]);

  // Task data for bar chart
  const [taskCategorySummary, setTaskCategorySummary] = useState([
    { category: 'Tax Filing', count: 12 },
    { category: 'Client Meeting', count: 8 },
    { category: 'Financial Report', count: 15 },
    { category: 'Audit Review', count: 6 },
    { category: 'Compliance Check', count: 9 }
  ]);

  // Task urgency data for gauge
  const [taskUrgency, setTaskUrgency] = useState({
    value: 75,
    level: 'Medium Priority'
  });

  const gaugeChartRef = useRef(null);
  const taskChartRef = useRef(null);
  const clientFinancialChartRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    // Initialize Financial Chart
    const financialChartElement = document.getElementById('financialChart');
    if (financialChartElement) {
      const financialChart = echarts.init(financialChartElement);
      const financialOption = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return params.map((param) => {
              return `${param.seriesName}: ₱${param.value.toLocaleString()}`;
            }).join('<br>');
          }
        },
        legend: {
          data: ['Revenue', 'Expenses', 'Net Profit']
        },
        xAxis: {
          type: 'category',
          data: financialData.map(item => item.month)
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (valued) => `₱${value.toLocaleString()}`
          }
        },
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            stack: 'total',
            data: financialData.map(item => item.revenue),
            itemStyle: {
              color: '#4ade80'
            }
          },
          {
            name: 'Expenses',
            type: 'bar',
            stack: 'total',
            data: financialData.map(item => item.expenses),
            itemStyle: {
              color: '#f87171'
            }
          },
          {
            name: 'Net Profit',
            type: 'line',
            data: financialData.map(item => item.netProfit),
            itemStyle: {
              color: '#60a5fa'
            }
          }
        ]
      };
      financialChart.setOption(financialOption);
    }

    // Initialize Cash Flow Chart
    const cashFlowChartElement = document.getElementById('cashFlowChart');
    if (cashFlowChartElement) {
      const cashFlowChart = echarts.init(cashFlowChartElement);
      const cashFlowOption = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            return params.map((param) => {
              return `${param.seriesName}: ₱${param.value.toLocaleString()}`;
            }).join('<br>');
          }
        },
        legend: {
          data: ['Cash In', 'Cash Out', 'Balance']
        },
        xAxis: {
          type: 'category',
          data: cashFlowData.map(item => item.week)
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (valued) => `₱${value.toLocaleString()}`
          }
        },
        series: [
          {
            name: 'Cash In',
            type: 'line',
            areaStyle: {},
            data: cashFlowData.map(item => item.cashIn),
            itemStyle: {
              color: '#22c55e'
            }
          },
          {
            name: 'Cash Out',
            type: 'line',
            areaStyle: {},
            data: cashFlowData.map(item => item.cashOut),
            itemStyle: {
              color: '#ef4444'
            }
          },
          {
            name: 'Balance',
            type: 'line',
            data: cashFlowData.map(item => item.balance),
            itemStyle: {
              color: '#3b82f6'
            }
          }
        ]
      };
      cashFlowChart.setOption(cashFlowOption);
    }

    // Initialize Task Urgency Gauge Chart
    if (gaugeChartRef.current) {
      const gaugeChart = echarts.init(gaugeChartRef.current);
      const gaugeOption = {
        animation: false,
        series: [{
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 3,
          axisLine: {
            lineStyle: {
              width: 30,
              color: [
                [0.33, '#22c55e'],  // Low Priority (green)
                [0.67, '#f59e0b'],  // Medium Priority (amber)
                [1, '#ef4444']      // High Priority (red)
              ]
            }
          },
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '12%',
            width: 20,
            offsetCenter: [0, '-60%'],
            itemStyle: {
              color: 'auto'
            }
          },
          axisTick: {
            length: 12,
            lineStyle: {
              color: 'auto',
              width: 2
            }
          },
          splitLine: {
            length: 20,
            lineStyle: {
              color: 'auto',
              width: 5
            }
          },
          axisLabel: {
            color: '#464646',
            fontSize: 12,
            distance: -60,
            formatter: function(valued) {
              if (value === 0) return 'Low';
              if (value === 50) return 'Medium';
              if (value === 100) return 'High';
              return '';
            }
          },
          title: {
            offsetCenter: [0, '-20%'],
            fontSize: 14
          },
          detail: {
            fontSize: 16,
            offsetCenter: [0, '0%'],
            valueAnimation: true,
            formatter: function(valued) {
              if (value <= 33) return 'Low Priority';
              if (value <= 67) return 'Medium Priority';
              return 'High Priority';
            },
            color: 'inherit'
          },
          data: [{
            value: taskUrgency.value,
            name: 'Task Urgency'
          }]
        }]
      };
      gaugeChart.setOption(gaugeOption);
    }

    // Initialize Task Category Bar Chart
    if (taskChartRef.current) {
      const taskChart = echarts.init(taskChartRef.current);
      const taskOption = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: 'Number of Tasks',
          nameLocation: 'middle',
          nameGap: 30
        },
        yAxis: {
          type: 'category',
          data: taskCategorySummary.map(item => item.category)
        },
        series: [
          {
            name: 'Task Count',
            type: 'bar',
            data: taskCategorySummary.map(item => item.count),
            itemStyle: {
              color: function(params) {
                const colorList = ['#4ade80', '#60a5fa', '#f59e0b', '#8b5cf6', '#ec4899'];
                return colorList[params.dataIndex % colorList.length];
              }
            },
            label: {
              show: true,
              position: 'right',
              formatter: '{c}'
            }
          }
        ]
      };
      taskChart.setOption(taskOption);
    }

    // Initialize Client Financial Summary Chart
    if (clientFinancialChartRef.current) {
      const clientChart = echarts.init(clientFinancialChartRef.current);
      const clientOption = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            const client = clientFinancialData.find(c => c.name === params[0].name);
            if (!client) return '';
            
            return `
              <div style="font-weight:bold;margin-bottom:5px">${client.name}</div>
              <div>Revenue: ₱${client.revenue.toLocaleString()}</div>
              <div>Expenses: ₱${client.expenses.toLocaleString()}</div>
              <div>Profit: ₱${client.profit.toLocaleString()}</div>
              <div>Cash Flow: ₱${client.cashFlow.toLocaleString()}</div>
              <div>Debt Ratio: ${(client.debtRatio * 100).toFixed(1)}%</div>
              <div>Growth Rate: ${(client.growthRate * 100).toFixed(1)}%</div>
            `;
          }
        },
        legend: {
          data: ['Revenue', 'Expenses', 'Profit']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: (valued) => `₱${(value/1000).toFixed(0)}K`
          }
        },
        yAxis: {
          type: 'category',
          data: clientFinancialData.map(client => client.name),
          axisLabel: {
            interval: 0,
            rotate: 0
          }
        },
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: clientFinancialData.map(client => client.revenue),
            itemStyle: {
              color: '#4ade80'
            }
          },
          {
            name: 'Expenses',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: clientFinancialData.map(client => client.expenses),
            itemStyle: {
              color: '#f87171'
            }
          },
          {
            name: 'Profit',
            type: 'bar',
            emphasis: {
              focus: 'series'
            },
            data: clientFinancialData.map(client => client.profit),
            itemStyle: {
              color: '#60a5fa'
            }
          }
        ]
      };
      clientChart.setOption(clientOption);
    }

   
  }, [financialData, cashFlowData, taskUrgency, taskCategorySummary, clientFinancialData]);

  // Generate weekly calendar data
  const generateWeekDays = () => {
    const today = new Date();
    const startDay = startOfWeek(today);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDay, i);
      weekDays.push({
        date: day,
        dayName: format(day, 'EEE'),
        dayNumber: format(day, 'd'),
        isToday: format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
        tasks: generateTasksForDay(i)
      });
    }
    return weekDays;
  };

  // Generate random tasks for demo
  const generateTasksForDay = (dayIndex) => {
    const taskTypes = [
      { type: 'Tax Filing', color: 'bg-red-100 text-red-800' },
      { type: 'Client Meeting', color: 'bg-blue-100 text-blue-800' },
      { type: 'Financial Report', color: 'bg-green-100 text-green-800' },
      { type: 'Audit Review', color: 'bg-purple-100 text-purple-800' },
      { type: 'Compliance Check', color: 'bg-yellow-100 text-yellow-800' }
    ];
    const tasks = [];
    const numTasks = Math.floor(Math.random() * 3) + (dayIndex === 3 ? 3 : 1); // More tasks on Wednesday for demo
    for (let i = 0; i < numTasks; i++) {
      const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      const hour = 9 + Math.floor(Math.random() * 8);
      const minute = Math.random() > 0.5 ? '00' : '30';
      tasks.push({
        id: `task-${dayIndex}-${i}`,
        title: taskType.type,
        time: `${hour}:${minute}`,
        color: taskType.color,
        client: ['ABC Corp', 'XYZ Inc', 'Global Traders', 'Tech Solutions', 'Retail Masters'][Math.floor(Math.random() * 5)]
      });
    }
    return tasks.sort((a, b) => a.time.localeCompare(b.time));
  };

  const weekDays = generateWeekDays();

  // Urgency metrics data
  const urgencyMetrics = [
    {
      title: 'Tax Filings Due',
      value: 85,
      color: 'bg-red-500',
      description: '3 filings due in the next 7 days'
    },
    {
      title: 'Compliance Status',
      value: 92,
      color: 'bg-green-500',
      description: 'Most clients are compliant with regulations'
    },
    {
      title: 'Client Follow-ups',
      value: 68,
      color: 'bg-yellow-500',
      description: '7 clients need immediate attention'
    },
    {
      title: 'Audit Readiness',
      value: 76,
      color: 'bg-blue-500',
      description: 'Preparation for quarterly audits in progress'
    }
  ];

  


  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
























































  return (
    <div className="min-h-screen bg-gray-50">


      {/* Main Content */}
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6">
  





        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Financial Forecasts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Forecast Chart */}
            <Card>
              <CardHeader className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Financial Forecast</CardTitle>
                    <CardDescription>Based on Cash Flow Statements and Transaction Records</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative inline-block">
                      <Button
                        variant="outline"
                        className="!rounded-button whitespace-nowrap cursor-pointer flex items-center"
                        onClick={() => {
                          const dropdown = document.getElementById('client-dropdown');
                          if (dropdown) {
                            dropdown.classList.toggle('hidden');
                          }
                        }}
                      >
                        {selectedClient === 'all' ? 'All Clients' :
                        selectedClient === 'abc-corp' ? 'ABC Corporation' :
                        selectedClient === 'xyz-inc' ? 'XYZ Inc' : 'Global Traders'}
                        <i className="fas fa-chevron-down ml-2 text-xs"></i>
                      </Button>
                      <div id="client-dropdown" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                        <div className="py-1">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedClient('all');
                              document.getElementById('client-dropdown')?.classList.add('hidden');
                            }}
                          >
                            All Clients
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedClient('abc-corp');
                              document.getElementById('client-dropdown')?.classList.add('hidden');
                            }}
                          >
                            ABC Corporation
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedClient('xyz-inc');
                              document.getElementById('client-dropdown')?.classList.add('hidden');
                            }}
                          >
                            XYZ Inc
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedClient('global-traders');
                              document.getElementById('client-dropdown')?.classList.add('hidden');
                            }}
                          >
                            Global Traders
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                    <span>Cash Receipts</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                    <span>Disbursements</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                    <span>Net Cash Flow</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div id="financialChart" className="w-full h-[350px]"></div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" className="!rounded-button whitespace-nowrap cursor-pointer">
                    <i className="fas fa-download mr-2"></i> Export Data
                  </Button>
                  <Button variant="outline" className="!rounded-button whitespace-nowrap cursor-pointer">
                    <i className="fas fa-file-pdf mr-2"></i> Generate Report
                  </Button>
                </div>
                <Button className="!rounded-button whitespace-nowrap cursor-pointer">
                  <i className="fas fa-sync mr-2"></i> Refresh Data
                </Button>
              </CardFooter>
            </Card>

            {/* Cash Flow Projection */}
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Projection</CardTitle>
                <CardDescription>8-week cash flow forecast based on current data</CardDescription>
              </CardHeader>
              <CardContent>
                <div id="cashFlowChart" className="w-full h-[300px]"></div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Cash In</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Cash Out</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Balance</span>
                  </div>
                </div>
                <Button variant="outline" className="!rounded-button whitespace-nowrap cursor-pointer">
                  <i className="fas fa-info-circle mr-2"></i> Details
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column: Urgency Meters and Calendar */}
          <div className="space-y-6">
            {/* Urgency Meters */}
            <Card>
              <CardHeader>
                <CardTitle>Urgency Metrics</CardTitle>
                <CardDescription>Key indicators requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {urgencyMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-sm">{metric.title}</h4>
                      <span className="text-sm font-bold">{metric.value}%</span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                    <p className="text-xs text-gray-500">{metric.description}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full !rounded-button whitespace-nowrap cursor-pointer">
                  <i className="fas fa-bell mr-2"></i> Set Alerts
                </Button>
              </CardFooter>
            </Card>

            {/* Today's Priority Alert */}
            <Alert className="bg-amber-50 border-amber-200">
              <i className="fas fa-exclamation-triangle text-amber-500 mr-2 text-lg"></i>
              <AlertTitle className="text-amber-800">Today's Priority</AlertTitle>
              <AlertDescription className="text-amber-700">
                Tax filing deadline for ABC Corp is in 2 days. All documentation needs to be finalized today.
              </AlertDescription>
            </Alert>

            {/* Weekly Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Your tasks and appointments for this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {weekDays.map((day) => (
                      <div key={day.dayName} className="space-y-2">
                        <div className={`flex items-center ${day.isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${day.isToday ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <div className="text-center">
                              <div className="text-xs">{day.dayName}</div>
                              <div className="text-sm font-semibold">{day.dayNumber}</div>
                            </div>
                          </div>
                          <span className="font-medium">{format(day.date, 'MMMM d')}</span>
                          {day.isToday && <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">Today</Badge>}
                        </div>
                        {day.tasks.length > 0 ? (
                          <div className="ml-13 pl-10 border-l-2 border-gray-200 space-y-3">
                            {day.tasks.map((task) => (
                              <div key={task.id} className="bg-white rounded-lg border p-3 shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <Badge className={`${task.color} mb-1`}>{task.title}</Badge>
                                    <p className="text-sm font-medium">{task.client}</p>
                                  </div>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{task.time}</span>
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
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button className="w-full !rounded-button whitespace-nowrap cursor-pointer">
                  <i className="fas fa-plus mr-2"></i> Add New Task
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

      </main>


    </div>
  );
};

export default SectionThree;

