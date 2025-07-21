"use client"
import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { format, startOfWeek, addDays } from 'date-fns';
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

function DecisionSupportPage () {
  const [mounted, setMounted] = useState(false);
  const [selectedClient, setSelectedClient] = useState("all");
  const [financialData, setFinancialData] = useState([
    { month: "Jan", revenue: 320, expenses: 120, netProfit: 200 },
    { month: "Feb", revenue: 332, expenses: 132, netProfit: 200 },
    { month: "Mar", revenue: 301, expenses: 101, netProfit: 200 },
    { month: "Apr", revenue: 334, expenses: 134, netProfit: 200 },
    { month: "May", revenue: 390, expenses: 90, netProfit: 300 },
    { month: "Jun", revenue: 330, expenses: 230, netProfit: 100 },
    { month: "Jul", revenue: 320, expenses: 210, netProfit: 110 },
    { month: "Aug", revenue: 340, expenses: 180, netProfit: 160 },
    { month: "Sep", revenue: 356, expenses: 190, netProfit: 166 },
    { month: "Oct", revenue: 378, expenses: 200, netProfit: 178 },
    { month: "Nov", revenue: 398, expenses: 210, netProfit: 188 },
    { month: "Dec", revenue: 420, expenses: 195, netProfit: 225 },
  ]);
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

  // Client financial data
  const [clientFinancialData, setClientFinancialData] = useState([
    {
      id: "abc-corp",
      name: "ABC Corporation",
      revenue: 1250000,
      expenses: 875000,
      profit: 375000,
      cashFlow: 420000,
      debtRatio: 0.32,
      growthRate: 0.08,
    },
    {
      id: "xyz-inc",
      name: "XYZ Inc",
      revenue: 980000,
      expenses: 720000,
      profit: 260000,
      cashFlow: 310000,
      debtRatio: 0.28,
      growthRate: 0.05,
    },
    {
      id: "global-traders",
      name: "Global Traders",
      revenue: 1450000,
      expenses: 1120000,
      profit: 330000,
      cashFlow: 380000,
      debtRatio: 0.41,
      growthRate: 0.07,
    },
    {
      id: "tech-solutions",
      name: "Tech Solutions",
      revenue: 2100000,
      expenses: 1680000,
      profit: 420000,
      cashFlow: 520000,
      debtRatio: 0.25,
      growthRate: 0.12,
    },
    {
      id: "retail-masters",
      name: "Retail Masters",
      revenue: 1680000,
      expenses: 1350000,
      profit: 330000,
      cashFlow: 290000,
      debtRatio: 0.38,
      growthRate: 0.04,
    },
  ]);

  // Task data for bar chart
  const [taskCategorySummary, setTaskCategorySummary] = useState([
    { category: "Tax Filing", count: 12 },
    { category: "Client Meeting", count: 8 },
    { category: "Financial Report", count: 15 },
    { category: "Audit Review", count: 6 },
    { category: "Compliance Check", count: 9 },
  ]);

  // Task urgency data for gauge
  const [taskUrgency, setTaskUrgency] = useState({
    value: 75,
    level: "Medium Priority",
  });

  const gaugeChartRef = useRef(null);
  const taskChartRef = useRef(null);
  const clientFinancialChartRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    // Initialize Financial Chart
    const financialChartElement = document.getElementById("financialChart");
    if (financialChartElement) {
      const financialChart = echarts.init(financialChartElement);
      const financialOption = {
        animation: false,
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            return params
              .map((param) => {
                return `${param.seriesName}: ₱${param.value.toLocaleString()}`;
              })
              .join("<br>");
          },
        },
        legend: {
          data: ["Revenue", "Expenses", "Net Profit"],
        },
        xAxis: {
          type: "category",
          data: financialData.map((item) => item.month),
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: (value) => `₱${value.toLocaleString()}`,
          },
        },
        series: [
          {
            name: "Revenue",
            type: "bar",
            stack: "total",
            data: financialData.map((item) => item.revenue),
            itemStyle: {
              color: "#4ade80",
            },
          },
          {
            name: "Expenses",
            type: "bar",
            stack: "total",
            data: financialData.map((item) => item.expenses),
            itemStyle: {
              color: "#f87171",
            },
          },
          {
            name: "Net Profit",
            type: "line",
            data: financialData.map((item) => item.netProfit),
            itemStyle: {
              color: "#60a5fa",
            },
          },
        ],
      };
      financialChart.setOption(financialOption);
    }

    // Initialize Cash Flow Chart
    const cashFlowChartElement = document.getElementById("cashFlowChart");
    if (cashFlowChartElement) {
      const cashFlowChart = echarts.init(cashFlowChartElement);
      const cashFlowOption = {
        animation: false,
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            return params
              .map((param) => {
                return `${param.seriesName}: ₱${param.value.toLocaleString()}`;
              })
              .join("<br>");
          },
        },
        legend: {
          data: ["Cash In", "Cash Out", "Balance"],
        },
        xAxis: {
          type: "category",
          data: cashFlowData.map((item) => item.week),
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: (value) => `₱${value.toLocaleString()}`,
          },
        },
        series: [
          {
            name: "Cash In",
            type: "line",
            areaStyle: {},
            data: cashFlowData.map((item) => item.cashIn),
            itemStyle: {
              color: "#22c55e",
            },
          },
          {
            name: "Cash Out",
            type: "line",
            areaStyle: {},
            data: cashFlowData.map((item) => item.cashOut),
            itemStyle: {
              color: "#ef4444",
            },
          },
          {
            name: "Balance",
            type: "line",
            data: cashFlowData.map((item) => item.balance),
            itemStyle: {
              color: "#3b82f6",
            },
          },
        ],
      };
      cashFlowChart.setOption(cashFlowOption);
    }

    // Initialize Task Urgency Gauge Chart
    if (gaugeChartRef.current) {
      const gaugeChart = echarts.init(gaugeChartRef.current);
      const gaugeOption = {
        animation: false,
        series: [
          {
            type: "gauge",
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 3,
            axisLine: {
              lineStyle: {
                width: 30,
                color: [
                  [0.33, "#22c55e"], // Low Priority (green)
                  [0.67, "#f59e0b"], // Medium Priority (amber)
                  [1, "#ef4444"], // High Priority (red)
                ],
              },
            },
            pointer: {
              icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
              length: "12%",
              width: 20,
              offsetCenter: [0, "-60%"],
              itemStyle: {
                color: "auto",
              },
            },
            axisTick: {
              length: 12,
              lineStyle: {
                color: "auto",
                width: 2,
              },
            },
            splitLine: {
              length: 20,
              lineStyle: {
                color: "auto",
                width: 5,
              },
            },
            axisLabel: {
              color: "#464646",
              fontSize: 12,
              distance: -60,
              formatter: function (value) {
                if (value === 0) return "Low";
                if (value === 50) return "Medium";
                if (value === 100) return "High";
                return "";
              },
            },
            title: {
              offsetCenter: [0, "-20%"],
              fontSize: 14,
            },
            detail: {
              fontSize: 16,
              offsetCenter: [0, "0%"],
              valueAnimation: true,
              formatter: function (value) {
                if (value <= 33) return "Low Priority";
                if (value <= 67) return "Medium Priority";
                return "High Priority";
              },
              color: "inherit",
            },
            data: [
              {
                value: taskUrgency.value,
                name: "Task Urgency",
              },
            ],
          },
        ],
      };
      gaugeChart.setOption(gaugeOption);
    }

    // Initialize Task Category Bar Chart
    if (taskChartRef.current) {
      const taskChart = echarts.init(taskChartRef.current);
      const taskOption = {
        animation: false,
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          name: "Number of Tasks",
          nameLocation: "middle",
          nameGap: 30,
        },
        yAxis: {
          type: "category",
          data: taskCategorySummary.map((item) => item.category),
        },
        series: [
          {
            name: "Task Count",
            type: "bar",
            data: taskCategorySummary.map((item) => item.count),
            itemStyle: {
              color: function (params) {
                const colorList = [
                  "#4ade80",
                  "#60a5fa",
                  "#f59e0b",
                  "#8b5cf6",
                  "#ec4899",
                ];
                return colorList[params.dataIndex % colorList.length];
              },
            },
            label: {
              show: true,
              position: "right",
              formatter: "{c}",
            },
          },
        ],
      };
      taskChart.setOption(taskOption);
    }

    // Initialize Client Financial Summary Chart
    if (clientFinancialChartRef.current) {
      const clientChart = echarts.init(clientFinancialChartRef.current);
      const clientOption = {
        animation: false,
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: function (params) {
            const client = clientFinancialData.find(
              (c) => c.name === params[0].name,
            );
            if (!client) return "";

            return `
              <div style="font-weight:bold;margin-bottom:5px">${client.name}</div>
              <div>Revenue: ₱${client.revenue.toLocaleString()}</div>
              <div>Expenses: ₱${client.expenses.toLocaleString()}</div>
              <div>Profit: ₱${client.profit.toLocaleString()}</div>
              <div>Cash Flow: ₱${client.cashFlow.toLocaleString()}</div>
              <div>Debt Ratio: ${(client.debtRatio * 100).toFixed(1)}%</div>
              <div>Growth Rate: ${(client.growthRate * 100).toFixed(1)}%</div>
            `;
          },
        },
        legend: {
          data: ["Revenue", "Expenses", "Profit"],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          axisLabel: {
            formatter: (value) => `₱${(value / 1000).toFixed(0)}K`,
          },
        },
        yAxis: {
          type: "category",
          data: clientFinancialData.map((client) => client.name),
          axisLabel: {
            interval: 0,
            rotate: 0,
          },
        },
        series: [
          {
            name: "Revenue",
            type: "bar",
            stack: "total",
            emphasis: {
              focus: "series",
            },
            data: clientFinancialData.map((client) => client.revenue),
            itemStyle: {
              color: "#4ade80",
            },
          },
          {
            name: "Expenses",
            type: "bar",
            stack: "total",
            emphasis: {
              focus: "series",
            },
            data: clientFinancialData.map((client) => client.expenses),
            itemStyle: {
              color: "#f87171",
            },
          },
          {
            name: "Profit",
            type: "bar",
            emphasis: {
              focus: "series",
            },
            data: clientFinancialData.map((client) => client.profit),
            itemStyle: {
              color: "#60a5fa",
            },
          },
        ],
      };
      clientChart.setOption(clientOption);
    }

   }, [
    financialData,
    cashFlowData,
    taskUrgency,
    taskCategorySummary,
    clientFinancialData,
  ]);

  // Generate weekly calendar data
  const generateWeekDays = () => {
    const today = new Date();
    const startDay = startOfWeek(today);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDay, i);
      weekDays.push({
        date: day,
        dayName: format(day, "EEE"),
        dayNumber: format(day, "d"),
        isToday: format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd"),
        tasks: generateTasksForDay(i),
      });
    }
    return weekDays;
  };

  // Generate random tasks for demo
  const generateTasksForDay = (dayIndex) => {
    const taskTypes = [
      { type: "Tax Filing", color: "bg-red-100 text-red-800" },
      { type: "Client Meeting", color: "bg-blue-100 text-blue-800" },
      { type: "Financial Report", color: "bg-green-100 text-green-800" },
      { type: "Audit Review", color: "bg-purple-100 text-purple-800" },
      { type: "Compliance Check", color: "bg-yellow-100 text-yellow-800" },
    ];
    const tasks = [];
    const numTasks = Math.floor(Math.random() * 3) + (dayIndex === 3 ? 3 : 1); // More tasks on Wednesday for demo
    for (let i = 0; i < numTasks; i++) {
      const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      const hour = 9 + Math.floor(Math.random() * 8);
      const minute = Math.random() > 0.5 ? "00" : "30";
      tasks.push({
        id: `task-${dayIndex}-${i}`,
        title: taskType.type,
        time: `${hour}:${minute}`,
        color: taskType.color,
        client: [
          "ABC Corp",
          "XYZ Inc",
          "Global Traders",
          "Tech Solutions",
          "Retail Masters",
        ][Math.floor(Math.random() * 5)],
      });
    }
    return tasks.sort((a, b) => a.time.localeCompare(b.time));
  };

  const weekDays = generateWeekDays();

  // Urgency metrics data
  const urgencyMetrics = [
    {
      title: "Tax Filings Due",
      value: 85,
      color: "bg-red-500",
      description: "3 filings due in the next 7 days",
    },
    {
      title: "Compliance Status",
      value: 92,
      color: "bg-green-500",
      description: "Most clients are compliant with regulations",
    },
    {
      title: "Client Follow-ups",
      value: 68,
      color: "bg-yellow-500",
      description: "7 clients need immediate attention",
    },
    {
      title: "Audit Readiness",
      value: 76,
      color: "bg-blue-500",
      description: "Preparation for quarterly audits in progress",
    },
  ];

  // AI insights data
  const aiInsights = [
    {
      title: "Cash Flow Optimization",
      description:
        "Based on current trends, consider advising ABC Corp to optimize their accounts receivable process to improve cash flow by an estimated 15%.",
      impact: "High",
      impactColor: "bg-red-100 text-red-800",
    },
    {
      title: "Tax Saving Opportunity",
      description:
        "XYZ Inc qualifies for R&D tax credits that could reduce their tax liability by approximately $45,000 this fiscal year.",
      impact: "High",
      impactColor: "bg-red-100 text-red-800",
    },
    {
      title: "Compliance Risk Alert",
      description:
        "Global Traders may face compliance issues with their current inventory valuation method. Recommend switching to FIFO method.",
      impact: "Medium",
      impactColor: "bg-yellow-100 text-yellow-800",
    },
    {
      title: "Expense Anomaly Detected",
      description:
        "Unusual increase in operational expenses for Tech Solutions in the last quarter. Detailed analysis recommended.",
      impact: "Medium",
      impactColor: "bg-yellow-100 text-yellow-800",
    },
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




     
      </main>

    </div>
  );
};

export default DecisionSupportPage;



