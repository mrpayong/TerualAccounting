"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Box from "@mui/material/Box";
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from "@mui/x-charts/Gauge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CalendarCheck, CalendarClock, ChartLine, CircleCheck, ListCheck, Pin, Users } from "lucide-react";
import React, { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line } from 'recharts';
import { useFinancialData } from '../_context/FinancialDataContext';
import { PieChart } from '@mui/x-charts';
import { Zen_Kaku_Gothic_Antique } from 'next/font/google';



function getLast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("default", { month: "short", year: "numeric" }),
    });
  }
  return months;
}





function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400", "500", "700", "900"],
})

const SectionOne = ({accounts, transactions, tasks, AllTransactions, inflows, outflows, entryCounts}) => {
const barChartData = React.useMemo(() => {
  // const categoryMap = {};
  // tasks.forEach(task => {
  //   const category = task.taskCategory || "Uncategorized";
  //   const urgency = task.urgency || "LOW";
  //   if (!categoryMap[category]) {
  //     categoryMap[category] = { taskCategory: category, Low: 0, Medium: 0, High: 0 };
  //   }
  //   if (urgency === "LOW") categoryMap[category].Low += 1;
  //   else if (urgency === "MEDIUM") categoryMap[category].Medium += 1;
  //   else if (urgency === "HIGH") categoryMap[category].High += 1;
  // });
  // return Object.values(categoryMap);

    // Step 1: Count tasks per company
  const companyTaskCounts = {};
  tasks.forEach(task => {
    const company = task.taskCategory || "Uncategorized";
    companyTaskCounts[company] = (companyTaskCounts[company] || 0) + 1;
  });

  // Step 2: Sort companies by task count, get top 3
  const topCompanies = Object.entries(companyTaskCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([company]) => company);

  // Step 3: Aggregate urgency counts for top companies
  const summary = {};
  tasks.forEach(task => {
    const company = task.taskCategory || "Uncategorized";
    if (!topCompanies.includes(company)) return;
    if (!summary[company]) {
      summary[company] = { taskCategory: company, Low: 0, Medium: 0, High: 0 };
    }
    if (task.urgency === "LOW") summary[company].Low += 1;
    else if (task.urgency === "MEDIUM") summary[company].Medium += 1;
    else if (task.urgency === "HIGH") summary[company].High += 1;
  });

  return Object.values(summary);
}, [tasks]);

  
  

  const { selectedAccountId, setSelectedAccountId } = useFinancialData();

    useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId, setSelectedAccountId]);


  const accountTransaction = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );

useEffect(() => {
  if (accounts.length > 0 && !selectedAccountId) {
    setSelectedAccountId(accounts[0].id);
  }
}, [accounts, selectedAccountId]);

    const formatAmount = (amount) => {
        return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const utcYear = date.getUTCFullYear();
        const utcMonth = date.getUTCMonth(); // Month is zero-based
        const utcDay = date.getUTCDate();
      
        // Format the date as "Month Day, Year"
        return new Date(Date.UTC(utcYear, utcMonth, utcDay)).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
    };

// Client Income Summary Line Chart Data filtering
const monthlyRevenue = inflows
  .filter(t => t.accountId === selectedAccountId &&
      t.type === "INCOME" && // Only INCOME transactions
      t.date // Ensure date exists
      )
  .reduce((acc, t) => {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {});

const monthlyRevenueData = Object.entries(monthlyRevenue)
  .map(([key, amount]) => {
    // Format for display, e.g., "Jun 2025"
    const [year, month] = key.split("-");
    const displayMonth = new Date(year, month - 1).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    return {
      month: displayMonth,
      Income: amount,
      _sort: key,
    };
  })
  .sort((a, b) => a._sort.localeCompare(b._sort))
  .map(({ _sort, ...rest }) => rest);


  // top 5 CHART DATA
const [barType, setBarType] = useState("INCOME");

  const transactionsTodayCount = entryCounts.today
  const transactionsYesterdayCount = entryCounts.yesterday

const getTopBarCategories = (data) => {
  if (!Array.isArray(data)) return [];
  const map = {};
  data.forEach((t) => {
    const accName = t.account?.name || "Unknown";
    const key = `${t.category}|||${accName}`;
    map[key] = (map[key] || 0) + Number(t.amount);
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, value]) => {
      const [category, accountName] = key.split("|||");
      return {
        category,
        accountName,
        amount: value,
      };
    });
};

const barData =
  barType === "INCOME"
    ? getTopBarCategories(inflows)
    : getTopBarCategories(outflows);


const last6Months = getLast6Months();

const paddedMonthlyRevenueData = last6Months.map(({ key, label }) => {
  const found = monthlyRevenueData.find(d => d.month === label);
  return found
    ? found
    : { month: label, Income: 0 };
});



const summaryCards = [
  {
    title: "Clients",
    description: "All clients of the firm",
    value: accounts.data.length,
    icon: <Users className="h-8 w-8 text-cyan-600" />,
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
  },
  {
    title: "Tasks",
    description: "Tasks that need to be done",
    value: tasks.length,
    icon: <ListCheck className="h-8 w-8 text-amber-500" />,
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
  },
  {
    title: "Today's Entries",
    description: "Entries from all accounts",
    value: transactionsTodayCount,
    icon: <CalendarCheck className="h-8 w-8 text-emerald-600" />,
    iconBg: "bg-green-100",
    iconText: "text-green-600",
  },
  {
    title: "Yesterday's Entries",
    description: "Entries from all accounts",
    value: transactionsYesterdayCount,
    icon: <CalendarClock className="h-8 w-8 text-violet-700" />,
    iconBg: "bg-violet-200",
    iconText: "text-violet-600",
  },
];

const isSmallScreen = useMediaQuery("(max-width: 1280px)");









  return (
    <div>
      {/* <div className="w-full"> */}
        {/* Mobile: horizontal scroll, Desktop: grid */}
        <div className="w-full">
          <div className={
            isSmallScreen
            ? "flex gap-6 mb-8 min-w-0 overflow-x-auto"
            : "grid grid-cols-4 gap-6 mb-8 min-w-0"
          }>
            {summaryCards.map((card) => (
              <Card
                key={card.title}
                className={
                  isSmallScreen
                    ? "border-none my-2 shadow-md hover:shadow-lg transition-shadow duration-300 min-w-[260px] max-w-xs flex-shrink-0"
                    : "border-none my-2 shadow-md hover:shadow-lg transition-shadow duration-300"
                }
              >
              <div className='flex items-center flex-row justify-between px-2'>
                <div>
                    <CardHeader className={`${fontZenKaku.className} pb-0 px-4`}>
                      <CardTitle className="text-sm !font-bold md:text-xl">
                        <span>{card.title}</span>
                      </CardTitle>
                      <CardDescription className="text-sm font-normal tracking-wide text-gray-500">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className={`${fontZenKaku.className} pt-0 px-4`}>
                      <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mt-1 break-words">
                        {card.value}
                      </h3>
                    </CardContent>
                  </div>
                  <div
                    className={`h-14 w-14 rounded-full flex items-center justify-center ${card.iconBg} ${card.iconText} mt-2 md:mt-0`}
                  >
                    {card.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      {/* </div> */}







      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 items-stretch">
        {/* Top 5 Income Bar Chart Card */}
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 h-full min-h-[320px] flex flex-col">
          <CardHeader className={`${fontZenKaku.className}`}>
            <CardTitle className="text-xl !font-bold">
              Top 5 {barType === "INCOME" ? "Income" : "Expense"}
            </CardTitle>
            <CardDescription className="text-sm font-normal tracking-wide">
              Account titles across all accounts with largest accumulated amounts.
            </CardDescription>
            <div className="mt-2 flex gap-2">
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  barType === "INCOME"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500 hover:bg-green-50"
                }`}
                onClick={() => setBarType("INCOME")}
              >
                Show Income
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  barType === "EXPENSE"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-500 hover:bg-red-50"
                }`}
                onClick={() => setBarType("EXPENSE")}
              >
                Show Expense
              </button>
            </div>
          </CardHeader>
          <CardContent className={`${fontZenKaku.className} flex-1 flex flex-col justify-end`}>
            <div className="w-full h-[320px] overflow-x-auto sm:overflow-x-visible">
              <div className="min-w-[500px] sm:min-w-0 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12, fill: "#4B5563", fontWeight:'500' }}
                    interval={0}
                    angle={-30} // Make labels horizontal
                    textAnchor="end"
                    height={60} // Adjust for label space
                  />
                  <YAxis
                    tickFormatter={(value) => formatAmount(value)}
                    tick={{ fontSize: 12, fontWeight:'500' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const { accountName, amount } = payload[0].payload;
                        return (
                          <div className="bg-white rounded shadow px-3 py-2 text-xs">
                            <div className="font-medium text-base">{accountName}</div>
                            <div>
                              amount: <span className="font-medium text-base">{formatAmount(amount)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill={barType === "INCOME" ? "#4ade80" : "#ef4444"}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Summary Card */}
        <Card className="border-none shadow-md overflow-hidden h-full min-h-[320px] flex flex-col">
          <CardHeader className={`${fontZenKaku.className} bg-white border-b border-gray-100`}>
            <CardTitle className="text-xl !font-bold">Task Summary</CardTitle>
            <CardDescription className="text-sm font-normal tracking-wide">
              Quantity of tasks per account with the respect to urgency levels.
            </CardDescription>
          </CardHeader>
          <CardContent className={`${fontZenKaku.className} flex-1 flex flex-col justify-end pt-6 pb-4`}>
            <div className="w-full h-[320px] overflow-x-auto sm:overflow-x-visible">
              <div className="min-w-[500px] sm:min-w-0 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" 
                    tick={{ fontSize: 12, fill: '#4B5563', fontWeight:'500' }}
                    allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="taskCategory"
                      tick={{ fontSize: 12, fill: '#4B5563', fontWeight:'500' }}
                    />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white rounded shadow px-3 py-2">
                                <div className="font-bold text-base mb-1">{label}</div>
                                {payload.map((entry, idx) => (
                                  <div key={idx} className="flex justify-between text-base font-medium mb-1">
                                    <span className='font-meidum text-base' style={{ color: entry.color }}>{entry.name}:</span>
                                    <span className='font-meidum text-base'>{entry.value}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    <Legend />
                    <Bar dataKey="Low" stackId="a" fill="#22c55e" name="Low" />
                    <Bar dataKey="Medium" stackId="a" fill="#fde047" name="Medium" />
                    <Bar dataKey="High" stackId="a" fill="#ef4444" name="High" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Financial Summary */}
      <Card className="mb-8 border-none shadow-md overflow-hidden">
        <CardHeader className={`${fontZenKaku.className} bg-white border-b border-gray-100 pb-2`}>
          <div className="
            flex justify-between 
            flex-col-reverse md:flex-row 
            gap-2 md:gap-0
            items-center">
            <div>
              <CardTitle className="!font-bold text-xl text-center md:text-start">Client Inflow Summary</CardTitle>
              <CardDescription className="text-sm font-normal tracking-wide">
                Semiannual total inflows per month 
                {/* (Add outflows to me) */}
              </CardDescription>
            </div>
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger className="font-medium text-base w-[150px]">
                  <SelectValue placeholder="Select Account"/>
              </SelectTrigger>
              <SelectContent>
                  {accounts.data.map((account) => (
                      <SelectItem className='!font-normal text-base' key={account.id} value={account.id}>
                          {account.name} 
                      </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className={`${fontZenKaku.className} pt-5 pb-4`}>
          {/* <div
            className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]"
          > */}
          <div className="w-full h-[320px] lg:h-[400px] overflow-x-auto sm:overflow-x-visible">
            <div className="min-w-[500px] sm:min-w-0 h-full">
              {monthlyRevenueData.length > 0 
              ? (<ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={paddedMonthlyRevenueData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fontWeight:'500' }}/>
                  <YAxis 
                    tickFormatter={(value) => formatAmount(value)}
                    tick={{ fontSize: 12, fontWeight:'500' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white rounded shadow px-3 py-2">
                            <div className="font-medium text-base mb-1">{label}</div>
                            {payload.map((entry, idx) => (
                              <div key={idx} className="flex justify-between text-base font-medium mb-1">
                                <span style={{ color: entry.color }}>{entry.name}:</span>
                                <span>{formatAmount(entry.value)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Income" 
                    stroke="#4ade80" 
                    dot={false}
                    />
                </LineChart>
              </ResponsiveContainer>) 
              : (<div className="flex items-center font-bold text-base md:text-lg justify-center h-full text-gray-400">
                  No inflows.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SectionOne;
