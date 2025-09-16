"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PieChart } from '@mui/x-charts';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { 
    Cell, 
    Legend, 
    Pie, 
    // PieChart, 
    ResponsiveContainer } from 'recharts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,} from 'recharts';
import { BarChart, Bar } from 'recharts';
import { Zen_Kaku_Gothic_Antique, Zen_Kaku_Gothic_New } from 'next/font/google';

const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets: ['latin'],
  weight: ["400", "500"],
})

const fontZenKakuNew = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: "400",
})

const COLORS = [
    "#FFC345",
    "#F76218",
    "#6CB9E6",
    "#B10065",
    "#FF9E4A",
    "#685DCE",
    "#FF7663",
  ];

export const desktopOS = [
  {
    label: 'Windows',
    value: 72.72,
  },
  {
    label: 'OS X',
    value: 16.38,
  },
  {
    label: 'Linux',
    value: 3.83,
  },
  {
    label: 'Chrome OS',
    value: 2.42,
  },
  {
    label: 'Other',
    value: 4.65,
  },
];

export const mobileOS = [
  {
    label: 'Android',
    value: 70.48,
  },
  {
    label: 'iOS',
    value: 28.8,
  },
  {
    label: 'Other',
    value: 0.71,
  },
];

export const platforms = [
  {
    label: 'Mobile',
    value: 59.12,
  },
  {
    label: 'Desktop',
    value: 40.88,
  },
];

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



const DashboardOverview = ({accounts, transactions}) => {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );

  //filter transactions for selected accounts
  const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId
//  from transactions => take accountId =make it the= selectedAccount Id
  );

  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

    // calculate expense breakdown for current month
    const currentDate = new Date();
    const currentMonthExpenses = accountTransactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
            t.type === "EXPENSE" &&
            transactionDate.getMonth() === currentDate.getMonth() &&
            transactionDate.getFullYear() === currentDate.getFullYear()
        );
    });

    //group expenses by category
    const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
        const category = transaction.category;
        if(!acc[category]){
            acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
    }, {});

    const pieChartData = Object.entries(expensesByCategory).map(
        ([category, amount]) => ({
            name: category,
            value: amount,
        })
    );

    const currentDateForArea = new Date();

const currtDate = new Date();
const startMonth = new Date(currtDate.getFullYear(), currtDate.getMonth() - 2, 1); // Start of 2 months ago
const endMonth = new Date(currtDate.getFullYear(), currtDate.getMonth() + 1, 1);   // Start of next month

  
// Get transactions for the past 3 months, excluding the current month
const pastThreeMonthsTransactions = accountTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startMonth && transactionDate < endMonth;
});
// Group transactions by month and type (Income or Expense)
const groupedTransactions = pastThreeMonthsTransactions.reduce((acc, transaction) => {
  const transactionDate = new Date(transaction.date);
  const month = transactionDate.toLocaleString("default", { month: "short" }); // e.g., "Jan", "Feb"
  const year = transactionDate.getFullYear();
  const key = `${month} ${year}`; // e.g., "Jan 2025"

  if (!acc[key]) {
    acc[key] = { Income: 0, Expense: 0 };
  }

  if (transaction.type === "INCOME") {
    acc[key].Income += transaction.amount;
  } else if (transaction.type === "EXPENSE") {
    acc[key].Expense += transaction.amount;
  }

  return acc;
}, {});

// Format data for the AreaChart and reverse the order
const areaChartData = Object.entries(groupedTransactions)
  .map(([month, values]) => ({
    name: month,
    Income: values.Income,
    Expense: values.Expense,
  })).reverse(); // Reverse the order so the most recent month appears last




  // Filter income transactions
    const incomeTransactions = accountTransactions.filter((t) => t.type === "INCOME");

    // Group income by category
    const incomeByCategory = incomeTransactions.reduce((acc, transaction) => {
    const category = transaction.category || "Uncategorized";
    if (!acc[category]) {
        acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
    }, {});

    // Get the top 5 categories with the highest income
    const topIncomeCategories = Object.entries(incomeByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount) // Sort by amount in descending order
    .slice(0, 5); // Take the top 5 categories


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

    const expensePieLabel = new Date()
    expensePieLabel.setMonth(expensePieLabel.getMonth() - 1); // Set to last month
    const expensePieLabelString = expensePieLabel.toLocaleString("default", { month: "long" });

    const valueFormatter = (item) => formatAmount(item.value);

    const [chartSize, setChartSize] = useState(200); // Default size for small screens

    useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth >= 1024) {
        // Large screens (lg: breakpoint)
        setChartSize(300);
        } else if (window.innerWidth >= 768) {
        // Medium screens (md: breakpoint)
        setChartSize(250);
        } else {
        // Small screens
        setChartSize(200);
        }
    };

    // Set initial size
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
    }, []);

    const formatYAxisValue = (value) => {
        return new Intl.NumberFormat("en-US").format(value);
    };
    

    const isSmallScreen = useMediaQuery("(max-width: 1280px)");


      
























    return (
    <div  className='flex flex-col gap-5'>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader className="flex flex-col-reverse gap-1 md:gap-0 md:flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className={`${fontZenKaku.className} font-normal text-sm sm:text-base md:text-lg lg:text-xl`}>
                        Highest source of income last month
                    </CardTitle>

                    <Select
                        value={selectedAccountId}
                        onValueChange={setSelectedAccountId}
                    >
                        <SelectTrigger className={`${fontZenKaku.className} font-medium w-[140px]`}>
                            <SelectValue placeholder="Select Account"/>
                        </SelectTrigger>

                        <SelectContent>

                            {accounts.map((account) => (
                                <SelectItem className={`${fontZenKaku.className}  font-normal `} key={account.id} value={account.id}>
                                    {account.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>


                    
                </CardHeader>

                <CardContent className='!pb-1 !mb-5'>
                    <div className="overflow-x-auto w-full">
                        <div className='space-y-4'>
                        {topIncomeCategories.length === 0 ? (
                            <p className={`${fontZenKakuNew.className} text-center text-muted-foreground py-4`}>
                                No income data available.
                            </p>
                            ) : (
                                 <div className="w-full">
                                    <div className="min-w-[500px]">
                            {/* <div className="h-[300px] w-full"> */}
                                <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={topIncomeCategories}
                                    margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 15,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="category"
                                        tick={{
                                            fontFamily: "Verdana, sans-serif",
                                            fontSize: isSmallScreen ? "10px" : "12px", // Default font size for small screens
                                            fontWeight: "400",
                                            className: "text-xs sm:text-sm md:text-base", // Tailwind responsive classes
                                        }}
                                        angle={-30}
                                        textAnchor="end"
                                    />
                                    <YAxis
                                        tick={{
                                            fontFamily: "Verdana, sans-serif",
                                            fontSize: "12px", // Default font size for small screens
                                            fontWeight: "500",
                                            className: "text-sm sm:text-base md:text-lg", // Tailwind responsive classes
                                        }}
                                    />
                                    <Tooltip
                                        formatter={(value) => formatAmount(value)}
                                        contentStyle={{
                                            fontFamily: "Verdana, sans-serif",
                                            fontSize: "14px", // Tooltip font size
                                        }}
                                    />
                                    <Bar dataKey="amount" fill="#67A60A" />
                                </BarChart>
                                </ResponsiveContainer>
                            </div> </div>
                            )}
                        </div>    
                    </div>
                </CardContent>    
            </Card>

            
            <Card>
                <CardHeader>
                    <CardTitle className={`${fontZenKaku.className} font-normal text-sm sm:text-base md:text-lg lg:text-xl`}>
                        Monthly Expense Breakdown 
                    </CardTitle>    
                </CardHeader>

                <CardContent className="p-0 pb-5">
                    {pieChartData.length === 0 
                        ? (
                            <p className={`${fontZenKakuNew.className} text-center text-muted-foreground py-4`}>
                                No expenses this month.
                            </p>
                        )
                        : (
                                <PieChart
                                    series={[
                                        {
                                            data: pieChartData.map((entry) => ({
                                            id: entry.name,
                                            value: entry.value,
                                            label: entry.name,
                                            })),
                                            highlightScope: { fade: 'global', highlight: 'item' }, // Enable hover and highlight
                                            faded: {
                                            innerRadius: 30, // Adjust inner radius for faded slices
                                            additionalRadius: -30, // Reduce size of faded slices
                                            color: 'gray', // Set faded slice color
                                            },
                                            valueFormatter,
                                        },
                                    ]}
                                    height={chartSize} // Adjust height for responsiveness
                                    width={chartSize} // Adjust width for responsiveness
                                    legend={{
                                        position: 'right', // Position legend to the right
                                        alignItems: 'center',
                                        itemStyle: {
                                            fontFamily: "Verdana, sans-serif",
                                            fontSize: "12px", // Legend font size
                                            fontWeight: "400",
                                            className: "font-verdana text-sm sm:text-base md:text-lg lg:text-xl text-gray-800", // Tailwind classes for Verdana and responsive text
                                        },
                                    }}
                                    tooltip={{
                                        className: "font-verdana text-xs sm:text-sm md:text-base", // Tailwind responsive classes
                                        style: {
                                        fontFamily: "Verdana, sans-serif",
                                        fontSize: "12px", // Tooltip font size
                                        },
                                    }}
                                />
                        )
                    }
                </CardContent>    
            </Card>
        </div>

        
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className={`${fontZenKaku.className} font-normal text-sm sm:text-base md:text-lg lg:text-xl`}>
                    Income vs Expense 
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0 pb-5">
                    {areaChartData.length === 0 ? (
                    <p className={`${fontZenKakuNew.className} text-center text-muted-foreground py-4`}>
                        No data available for the past 3 months.
                    </p>
                    ) : (
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={areaChartData}
                            margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                            }}
                        >
                            <defs>
                                {/* Expense Color */}
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#BF0413" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#BF0413" stopOpacity={0}/>
                                </linearGradient>
                                {/* Income Color */}
                                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#26A646" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#26A646" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name"
                                tick={{
                                fontFamily: "Verdana, sans-serif", // Use Verdana font
                                fontSize: "10px", 
                                fontWeight: "400", 
                                className: "text-xs sm:text-sm md:text-base",
                                }}
                                tickFormatter={(value) => value} // Ensure proper formatting
                            />
                            <YAxis
                                domain={[0, 150000]} // Cap Y-axis values at 150,000
                                tick={{
                                    fontFamily: "Verdana, sans-serif", // Use Verdana font
                                    fontSize: "10px", // Slightly larger font size for Y-axis
                                    fontWeight: "500", // Medium weight
                                    className: "text-sm sm:text-base md:text-lg",
                                }}
                                tickFormatter={formatYAxisValue}
                            />
                            <Tooltip 
                                formatter={(value) => formatAmount(value)} 
                                contentStyle={{
                                fontFamily: "Verdana, sans-serif",
                                fontSize: "12px", // Tooltip font size
                                }}
                            />
                            <Legend
                                wrapperStyle={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                marginTop: "10px",
                                fontFamily: "Verdana, sans-serif",
                                fontSize: "12px", // Legend font size
                                }}
                                className="text-xs sm:text-sm md:text-base" // Tailwind responsive classes
                            />
                            <Area
                            type="monotone"
                            dataKey="Income"
                            stroke="#26A646"
                            fillOpacity={1} 
                            fill="url(#colorPv)"
                            />
                            <Area
                            type="monotone"
                            dataKey="Expense"
                            stroke="#BF0413"
                            fillOpacity={1} 
                            fill="url(#colorUv)"
                            />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    )}
                </CardContent>
            </Card>
        
    </div>
  )
}

export default DashboardOverview;
