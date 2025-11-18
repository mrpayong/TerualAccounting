"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


async function activityLog({userId, action, args, timestamp}){
  try {
    await db.activityLog.create({
      data: {
        userId,
        action,
        meta: { args, timestamp },
      },
    })
    return {status: 200, success: true}
  } catch (error) {
    console.error("Activity Log Error[1]: ", error);
    console.error("Activity Log Error Message: ", error.message);
    return {status: 500, success: false}
  }
}


function extractFirstJsonObject(text) {
  // Find the first { ... } block using a stack to handle nested braces
  let start = text.indexOf('{');
  if (start === -1) return null;
  let stack = 0;
  let end = start;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') stack++;
    if (text[i] === '}') stack--;
    if (stack === 0) {
      end = i + 1;
      break;
    }
  }
  return text.slice(start, end);
}


export async function getSuggestedWeeklySchedule() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

      const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        role: true,
        id:true
      }
      });

      if (!user) {
        throw new Error("User not found.");
      }
      if (user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    // Fetch all tasks for the user
    console.log("retrieving Tasks Data")
    const tasks = await db.Task.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        taskName: true,
        urgency: true,
        dueDate: true,
        taskCategory: true,
        taskDescription: true,
      },
    });
    console.log("retrieved Tasks Data:", tasks.length)

    console.log("feeding to prompt...")
    // Prepare prompt
    const prompt = `
      You are an expert task management assistant for an accounting firm in the Philippines. 
      Given the following list of tasks, suggest a weekly schedule (Sunday to Saturday) for the user. 
      Prioritize tasks with higher urgency and earlier due dates. 
      Distribute the workload evenly if possible, but urgent tasks should be scheduled earlier in the week. 

      You also have a keen understanding of prioritization.
      Given the current date, the current day of the week, and a comprehensive list of all active tasks
      (including any newly added ones) with their urgency and due dates, by analyzing the given data of task from the database,
      provide only the data-driven suggestion about the most critical and actionable tasks that can realistically be started or completed *today*. 
      Keep it friendly and yet professional and short, do not include the task ID only neccessary and easy-to-read data.

        **Important instructions:**
        - example output of the suggested weekly schedule:
        {
          "Sunday":[
              { "taskId":"1", 
                "taskName":"Prepare financial report", 
                "dueDate":"2024-10-01T00:00:00.000Z", 
                "urgency":"HIGH", 
                "taskDescription":"Prepare the monthly financial report for the client." 
              },
              { "taskId":"2", 
                "taskName":"Review tax documents", 
                "dueDate":"2024-10-02T00:00:00.000Z", 
                "urgency":"MEDIUM", 
                "taskDescription":"Review the client's tax documents for accuracy." 
              }
            ],
            "Monday":[
                { "taskId":"3", 
                  "taskName":"Client meeting", 
                  "dueDate":"2024-10-03T00:00:00.000Z", 
                  "urgency":"HIGH", 
                  "taskDescription":"Meet with the client to discuss their financial situation." 
                }
              ],
            ...,
          }

      Tasks:
      ${JSON.stringify(tasks, null, 2)}


      Only respond with valid JSON in this exact format, Starting from Sunday and ending to Saturday:
      {
        "Day of the Week":[
          "taskId":"string", 
          "taskName":"string", 
          "dueDate":"ISO date string",
          "urgency":"string", 
          "taskDescription":"string",
          ],
        "insight":"string",
      }
      `;

    console.log("prompt success and ready.")
      // Call Gemini
    console.log("cleaning data")
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const jsonBlock = extractFirstJsonObject(cleanedText);


    let schedule;
  
    try {
      schedule = JSON.parse(jsonBlock);
    } catch (err) {
      console.error("Failed to parse Gemini output:", err);
      return {code:501, success:false, message:"Data parsing failed, try again."}
    }

    const updateLog = await activityLog({
      userId: user.id,
      action: "getSuggestedWeeklySchedule",
      args: schedule,
      timestamp: new Date()
    });
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "getSuggestedWeeklySchedule",
          meta: { message: "Possible System interuption: Failed to log AI sugesstion for Weekly Schedule" },
        }
      })
    }

    return {code:200, schedule:schedule, success:true};
  } catch (error) {
    console.log("Error in getSuggestedWeeklySchedule:", error);
    return {code:500, success: false, message: "Failed to generate recommended schedule. Quota limit might have been reached."}
  }
}

export async function getInflowOutflowForecast(accountId){
  try {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      role: true,
      id: true
    }
  });

  if (!user) {
    throw new Error("User not found.");
  }
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Fetch all transactions for the user
  console.log("retrieving Transactions Data")
  const inflows = await db.Transaction.findMany({
      where: { 
        accountId, 
        type: "INCOME" 
      },
      select: { 
        amount: true, 
        date: true, 
      },
      orderBy: { date: "asc" },
    });

    // Fetch EXPENSE transactions
    const outflows = await db.Transaction.findMany({
      where: { 
        accountId, 
        type: "EXPENSE" 
      },
      select: { 
        amount: true, 
        date: true, 
      },
      orderBy: { date: "asc" },
    });

function accumulateByMonth(transactions) {
  const monthly = {};
  for (const tx of transactions) {
    const month = tx.date.toISOString().slice(0, 7); // "YYYY-MM"
    if (!monthly[month]) {
      monthly[month] = { amount: 0, count: 0 };
    }
    monthly[month].amount += Number(tx.amount);
    monthly[month].count += 1;
  }
  // Return sorted array of { month, amount, count }
  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, amount: data.amount, count: data.count }));
}


  const monthlyInflows = accumulateByMonth(inflows);
  const monthlyOutflows = accumulateByMonth(outflows);
  console.log("feeding to prompt...")
  // Prepare prompt
  const prompt = `
  You are an expert financial analyst for an accounting firm in the Philippines.
  Given the following monthly inflow (income) and outflow (expense) data, forecast the total inflows 
  and outflows for the next quarter (3 months) using the Moving Average method.

  **Important instructions:**
  - You must use the equation of the Moving Average type of Financial Forecasting.
  - Do not skip a month in forecasting.
  - The forecast will always begin on the month after the month of the last historical transaction data.
  - Output must be a JSON object.
  - Only include two arrays: "inflowForecast" and "outflowForecast".
  - Each array should contain three objects, one for each of the next three months, with "month" (YYYY-MM) and "amount" (number).
  - Do not include any explanations, insights, or extra text outside the JSON.

  Example output, do not imitate this with future forecast this is only an example:
  {
    "inflowForecast": [
      { "month": "2025-07", "amount": 12345 },
      { "month": "2025-08", "amount": 23456 },
      { "month": "2025-09", "amount": 34567 }
    ],
    "outflowForecast": [
      { "month": "2025-07", "amount": 5432 },
      { "month": "2025-08", "amount": 6543 },
      { "month": "2025-09", "amount": 7654 }
    ]
  }

  Historical Monthly Inflows:
  ${JSON.stringify(monthlyInflows, null, 2)}

  Historical Monthly Outflows:
  ${JSON.stringify(monthlyOutflows, null, 2)}

  Only respond with valid JSON in this exact format:
  {
    "inflowForecast": [
      { "month": "YYYY-MM", "amount": "number" },
      ...
    ],
    "outflowForecast": [
      { "month": "YYYY-MM", "amount": "number" },
      ...
    ]
  }
  `;


  const result = await model.generateContent([prompt]);
  const response = await result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
  const forecast = JSON.parse(cleanedText);


  const limitedMonthlyInflows = monthlyInflows.slice(-6);
  const limitedMonthlyOutflows = monthlyOutflows.slice(-6);
  console.log('limitedMonthlyInflows', limitedMonthlyInflows)
  console.log('limitedMonthlyOutflows', limitedMonthlyOutflows)

  const updateLog = await activityLog({
    userId: user.id,
    action: "getInflowOutflowForecast",
    args: {
      acccount_ID: accountId,
      historical: {
        inflows: limitedMonthlyInflows,
        outflows: limitedMonthlyOutflows,
      },
      inflowForecast: forecast.inflowForecast,
      outflowForecast: forecast.outflowForecast,
    },
    timestamp: new Date()
  });
  if(updateLog.success === false){
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: "getInflowOutflowForecast",
        meta: { message: "Possible System interruption: Failed to log AI Forecasting of Inflows and Outflows" },
      }
    })
  }

    return {
      code:200,
      historical: {
        inflows: limitedMonthlyInflows,
        outflows: limitedMonthlyOutflows,
      },
      inflowForecast: forecast.inflowForecast,
      outflowForecast: forecast.outflowForecast,
    };
  } catch (error) {
    console.log("Error in getInflowOutflowForecast:", error);
    return {code:500, success: false, message: "Failed to generate inflow/outflow forecast."}
  }
}

// export async function getCashflowForecast(accountId) {
//   try {
//     const { userId } = await auth();
//     if (!userId) throw new Error("Unauthorized");

//     // Find user in DB
//     const user = await db.user.findUnique({
//       where: { clerkUserId: userId },
//       select: {
//         role: true,
//         id: true
//       }
//     });
//     if (!user) throw new Error("User not found.");
//     if (user.role !== "ADMIN") {
//       throw new Error("Unauthorized");
//     }

//     // Fetch only monthly cashflow statements for the user, selecting only date and netChange
//     const cashflows = await db.cashFlow.findMany({
//       where: {
//         accountId,
//         periodCashFlow: "MONTHLY",
//       },
//       orderBy: { date: "asc" },
//       select: {
//         date: true,
//         netChange: true,
//         startBalance: true,
//         endBalance: true,
//         activityTotal: true,
//       },
//     });

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    

//     // Prepare prompt for Gemini
//     const prompt = `
//       You are an expert financial data analyst in an Accounting firm in the Philippines with clients that are also located in the Philippines. 
//       Given the cashflow data with monthly gross cashflow (netChange) values, 
//       forecast the gross cashflow for the next quarter (3 months) using the Moving Average method.
//       The activityTotal is an array of the total activities it is: [totalOperating, totalInvesting, totalFinancing].
//       Make an insight about the cashflow trends and potential accounting legal compliance issues that may 
//       come up base on the historical cashflow data provided to prevent penalties and compliance issues with the Bureau of Internal Revenue. 
//       List at least four possible financial legal compliance issues base on the historical cashflow data provided. 
//       If no possible financial legal compliance issues can be seen, then make suggestion for improvements, do not give suggestion for improvement 
//       if there are visible financial legal compliance issues. Keep it short and professional.
//       Return the forecast as a JSON object with each forecasted month and amount, and a brief insight.
      
//       **Important instructions:**
//       - You must use the equation of the Moving Average type of Financial Forecasting.
//       - Do not skip a month in forecasting.
//       - The forecast will always begin on the month after the date of the last historical cashflow data.
//       - The "issuesOrImprovements" field must be an array of at least four short phrases (not sentences).
//       - Do not use full sentences. Each array item should be a phrase only.
//       - Do not include explanations or extra text outside the JSON.
//       - Example output:
//       {
//         "forecast": [
//           { "month": "2025-07", "amount": 12345 },
//           { "month": "2025-08", "amount": 23456 },
//           { "month": "2025-09", "amount": 34567 }
//         ],
//         "insight": "Steady cashflow growth observed.",
//         "issuesOrImprovements": [
//           "Delayed VAT remittance",
//           "Incomplete expense documentation",
//           "Unreconciled bank statements",
//           "Late tax filing"
//         ]
//       }
//       Gross Cashflow Data:
//       ${JSON.stringify(cashflows, null, 2)}

//       Only respond with valid JSON in this exact format:
//       {
//         "forecast": [
//           { "month": "YYYY-MM", "amount": "number" },
//           ...
//         ],
//         "insight": "string",
//         "issuesOrImprovements": [
//           "string",
//           "string",
//           "string",
//           "string",
//           ...
//         ]
//       }
//       `;

//     // Call Gemini 1.5 Flash

//     const result = await model.generateContent([prompt]);
//     const response = await result.response;
//     const text = response.text();
//     const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

//     // Parse and return the forecast
//     const forecast = JSON.parse(cleanedText);
    

//     const updateLog = await activityLog({
//       userId: user.id,
//       action: "getCashflowForecast",
//       args: {
//         account_ID: accountId,
//         historical: cashflows.map(cf => ({
//           month: cf.date.toISOString().slice(0, 7), // "YYYY-MM"
//           netChange: cf.netChange,
//         })),
//         forecast: forecast.forecast,
//         insight: forecast.insight,
//         issuesOrImprovements: forecast.issuesOrImprovements,
//       },
//       timestamp: new Date()
//     });
//     if(updateLog.success === false){
//       await db.activityLog.create({
//         data: {
//           userId: user.id,
//           action: "getCashflowForecast",
//           meta: { message: "Possible System interruption: Failed to log AI Forecast of Cashflows" },
//         }
//       })
//     }
//     return {
//       code: 200,
//       historical: cashflows.map(cf => ({
//         month: cf.date.toISOString().slice(0, 7), // "YYYY-MM"
//         netChange: cf.netChange,
//       })),
//       forecast: forecast.forecast,
//       insight: forecast.insight,
//       issuesOrImprovements: forecast.issuesOrImprovements,
//     };
//   } catch (error) {
//     console.log("Error in getCashflowForecast:", error);
//     return {code:500, success: false, message: "Failed to generate net change forecast."}
//   }
// }



export async function getOverallFinancialDataAnalysis(inflowOutflowForecast) {
  try {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      role: true, // Include role to check if user is ADMIN
      id: true
    }
  });

  if (!user) {
    throw new Error("User not found.");
  }
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  console.log(" inflowOutflowForecast[3]: ",  inflowOutflowForecast.historical.inflows)

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  
  console.log("feeding to prompt...")
  const prompt = `
    You are a skilled and professional financial data analyst working in an Accounting firm based in the Philippines, 
    serving clients who are also based in the Philippines. You specialize in interpreting financial forecasts and historical trends, 
    with a focus on practical, high-impact business recommendations relevant to the local economic context. One of the objectives and goals Accounting firm 
    is to give advises to their clients that are focused on the client's legal obligations towards Bureau of Internal Revenue. The Accounting firm also 
    advises on managing other factors involved in the client's finances to prevent legal compliance issues and have better management of the client's 
    finances to lessen or prevent unnecessary expenses resulting to boosting the income of the client.


    The forecasted data provided are calculated from the historical financial data using the Moving Average type of financial forecasting. Using the data 
    provided — which includes the forecast of detailed inflow and outflow — generate exactly **four (4)** strategic recommendations. These will be presented to 
    decision-makers through a hybrid Decision Support System. Your recommendations must be **data-driven**, 
    **concise**, and **actionable** within the operational realities of businesses in the Philippines. Only make recommendations that are relevant to the provided 
    financial data. To be inline with the Accounting firm's objective and goals make recommendations about the cashflow trends and potential accounting 
    legal compliance issues that may come up base on the historical cashflow data provided to prevent penalties and compliance issues with the 
    Bureau of Internal Revenue. If no possible financial legal compliance issues can be seen, then make suggestion for improvements, do not give suggestion 
    for improvement if there are visible financial legal compliance issues.

    IMPORTANT: Your output MUST NOT include any recommendations, commentary, or advice about:
    - How the forecast was generated
    - Improving, adjusting, or questioning the forecasting models or methods
    - Using different forecasting techniques in the future

    Your role is ONLY to interpret the financial and historical data provided and give actionable business insights. 
    If you attempt to discuss forecasting methods, your answer will be considered invalid.

    Each recommendation must include:
    - A **id** that will always be unique. This will serves as an ID of each recommendation for easier frontend configurations. This field will always start from 1 for the first object in the array and 4 for the last object in the array.
    - An **impact level**: One of "HIGH IMPACT", "MEDIUM IMPACT", or "LOW IMPACT"
    - A **short, actionable recommendation title**
    - A **recommendation detail** (maximum of two sentences), grounded in the provided forecast and historical data

    ### Example Output Format (strictly JSON):
    {
      { "id": 1,
        "recommendationTitle": Negotiate Lower Operating Costs,
        "detail": Identify areas where operating expenses can be reduced, such as renegotiating supplier contracts or streamlining processes. This will improve profitability and free up cash.,
        "impactLevel": HIGH IMPACT
      }
    }

    Here is the inflow/outflow forecast data:
    ${JSON.stringify(inflowOutflowForecast, null, 2)}

    
    If a recommendation relates to improving or changing the forecasting model/method, 
    DO NOT include it in the output. Only output recommendations directly tied to the provided data.
    Respond ONLY with the valid JSON object:
    {
      "insights": [
        { "id": 1,
          "recommendationTitle": "string",
          "detail": "string",
          "impactLevel": "string"
        },
        {"id": 2,
          "recommendationTitle": "string",
          "detail": "string",
          "impactLevel": "string"
        },
        {"id": 3,
          "recommendationTitle": "string",
          "detail": "string",
          "impactLevel": "string"
        },
        {"id": 4,
          "recommendationTitle": "string",
          "detail": "string",
          "impactLevel": "string"
        }
      ]
    }
    `;
  // Call Gemini
  const result = await model.generateContent([prompt]);
  const response = await result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  // Parse and return the insights
  const insights = JSON.parse(cleanedText);
  console.log("Parsed Gemini insights:", insights);


  const insightsArr = Array.isArray(insights.insights) ? insights.insights : [];

  const updateLog = await activityLog({
    userId: user.id,
    action: "getOverallFinancialDataAnalysis",
    args: {
      insights: insightsArr.map(r => ({
        id: r.id,
        recommendationTitle: r.recommendationTitle,
        detail: r.detail,
        impactLevel: r.impactLevel,
      })),
    },
    timestamp: new Date()
  });
  if(updateLog.success === false){
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: "getOverallFinancialDataAnalysis",
        meta: { message: "Possible System interruption: Failed to log AI Overall Analysis" },
      }
    })
  }

return {
  code:200,
  success: true,
  insights: insightsArr.map(r => ({
    id: r.id,
    recommendationTitle: r.recommendationTitle,
    detail: r.detail,
    impactLevel: r.impactLevel,
  })),
};

  } 
  catch (err) {
    let errorMsg = "Internal server error";
    if (err instanceof SyntaxError) {
      errorMsg = "Failed to parse Gemini response";
    } else if (err.message && err.message.includes("Unauthorized")) {
      errorMsg = "Unauthorized";
    } else if (err.message && err.message.includes("User not found")) {
      errorMsg = "User not found";
    }
    // Optionally log the error for debugging
    console.error("getOverallFinancialDataAnalysis error:", err);
    return { code:500, success: false, error: errorMsg };
  }
}

export async function getAllInflows() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      role: true
    }
  });

  if (!user) {
    throw new Error("User not found.");
  }
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Fetch all inflow transactions for the user
  const inflows = await db.Transaction.findMany({
    where: { 
      // userId: user.id,
      type: "INCOME" 
    },
    select: { 
      category: true,
      amount: true, 
      accountId: true,
      type: true,
      date: true,
      account: {
        select: {
          name: true
        }
      },
    },
    orderBy: { date: "asc" },
  });
  const inflowsSerialize = inflows.map(inflow => ({
    ...inflow,
    amount: Number(inflow.amount),
  }))

  return inflowsSerialize;
}

export async function getAllOutflows() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      role: true
    }
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.role !== "ADMIN") {
  throw new Error("Unauthorized");
  }

  // Fetch all outflow transactions for the user
  const outflows = await db.Transaction.findMany({
    where: { 
      userId: user.id,
      type: "EXPENSE" 
    },
    select: { 
      category: true,
      amount: true, 
      accountId: true,
      account: {
        select: {
          name: true
        }
      },
    },
    orderBy: { date: "asc" },
  });

  const outflowsSerialize = outflows.map(outflow => ({
    ...outflow,
    amount: Number(outflow.amount),
  }))

  return outflowsSerialize;
 
}

export async function getAllTransactions() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found.");
  }  
  
  if (user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }


  const transactions = await db.Transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { 
      amount: true,
      category: true,
      createdAt: true,
    },
  });

  const transactionSerialize = transactions.map(transaction => ({
    ...transaction,
    amount: Number(transaction.amount),
  }));

  return transactionSerialize;
}



// export async function getDSSincomesData() {
//     const {userId} = await auth();
//     if (!userId) throw new Error ("Unauthorized");

//     const user = await db.user.findUnique({
//         where: {clerkUserId: userId},
//     });

//     if (!user) {
//         throw new Error ("User not found.");
//     }

//     // Get all user transactions
//     const transactions = await db.transaction.findMany({
//         where: {type: "INCOME"},
//         orderBy: {date: "desc"},
//     });
//     console.log("getDSSincomesData", transactions[0], transactions[1])


//     return transactions.map(serializeTransaction);
// }


export async function entryCount() {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1; // JS months are 0-based
  const todayDate = today.getDate();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yestYear = yesterday.getFullYear();
  const yestMonth = yesterday.getMonth() + 1;
  const yestDate = yesterday.getDate();

  // Helper for date-only comparison in SQL (Postgres syntax)
  const formatDate = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const todayStr = formatDate(todayYear, todayMonth, todayDate);
  const yestStr = formatDate(yestYear, yestMonth, yestDate);

  // Count for today
  const todayCount = await db.Transaction.count({
    where: {
      createdAt: {
        gte: new Date(`${todayStr}T00:00:00`),
        lt: new Date(`${todayStr}T23:59:59.999`)
      }
    }
  });

  // Count for yesterday
  const yesterdayCount = await db.Transaction.count({
    where: {
      createdAt: {
        gte: new Date(`${yestStr}T00:00:00`),
        lt: new Date(`${yestStr}T23:59:59.999`)
      }
    }
  });

  return {
    today: todayCount,
    yesterday: yesterdayCount,
  };
}