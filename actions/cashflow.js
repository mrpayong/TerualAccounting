"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Decimal } from "@prisma/client/runtime/library";
import { format } from "date-fns";
import { Activity } from "lucide-react";
import { revalidatePath } from "next/cache";
import { MessageAttemptFailedDataSerializer } from "svix/dist/models/messageAttemptFailedData";

const serializeTransaction = (obj) => {
  const serialized = {...obj};

  if (obj.balance) {
      serialized.balance = Number(obj);
  }

  if (obj.amount) {
      serialized.amount = Number(obj);
  }

  return serialized;
};

const serializeAmount = (obj) => ({
    ...obj,
    amount: parseFloat(obj.amount.toFixed(2)),
});



function formatManilaDateTime(dateInput) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  }).format(date);
}
async function activityLog({userId, action, args, timestamp}){
  
  try {
    
    const dateTime = formatManilaDateTime(timestamp);
    
    await db.activityLog.create({
      data: {
        userId,
        action,
        meta: { args, timestamp: dateTime },
      },
    })
    return {status: 200, success: true}
  } catch (error) {
    console.error("Activity Log Error[1]: ", error);
    console.error("Activity Log Error Message: ", error.message);
    return {status: 500, success: false}
  }
}

async function archiveEntity({
  userId,
  accountId,
  action,
  entityType,
  entityId,
  data,
}) {
  try {
    await db.archive.create({
      data: {
        userId,
        accountId,
        action,
        entityType,
        entityId,
        data,
      },
    });

    await activityLog({
    userId,
    action,
    args: {data}, 
    timestamp: new Date()
    });
    return {status: 200, success: true}
  } catch (error) {
    console.error("Archive Error Message: ", error.message);
    console.error("Archive Error: ", error.message);
    return {status: 500, success: false}
    
  }
}

export async function getCashOutflow(id) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactionExpenses = await db.account.findUnique({
      where: {
        id,
      },
      include: {
        transactions: {
          where: { type: "EXPENSE" },
          select:{
            Activity: true,
            accountId: true,
            amount: true,
            category: true,
            createdAt: true,
            date: true,
            description: true,
            id: true,
            receiptUrl: true,
            type: true,
            updatedAt: true,
            userId: true,
            refNumber:true,
            particular: true,
          }
        },
      },
    });

    if (!transactionExpenses) {
      throw new Error("Account not found");
    }

    const serializedTransactions = transactionExpenses.transactions.map((transaction) => ({
      ...transaction,
      amount: transaction.amount.toNumber(), // Convert Decimal to number
      date: transaction.date.toISOString(), // Convert Date to string
    }));

    return serializedTransactions;

  } catch (error) {
    console.error("Error fetching account expenses:", error);
    throw new Error("Failed to fetch account expenses", error);
  }
}


export async function getCashInflow(id) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactionIncome = await db.account.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        transactions: {
          where: { type: "INCOME" },
          select:{
            Activity: true,
            accountId: true,
            amount: true,
            category: true,
            createdAt: true,
            date: true,
            description: true,
            id: true,
            receiptUrl: true,
            type: true,
            updatedAt: true,
            userId: true,
            refNumber:true,
            particular: true,
          }
        },
      },
    });

    if (!transactionIncome) {
      throw new Error("Account not found");
    }

    // Serialize the data
    const serializedTransactions = transactionIncome.transactions.map((transaction) => ({
      ...transaction,
      amount: transaction.amount.toNumber(), // Convert Decimal to number
      date: transaction.date.toISOString(), // Convert Date to string
    }));

    return serializedTransactions;
  } catch (error) {
    console.error("Error fetching account Income:", error.message);
    throw new Error("Failed to fetch account Income.");
  }
}


function getLatestSubAccountTransactionDate(subAccounts) {
  let dates = [];
  subAccounts.forEach(subAccount => {
    subAccount.transactions.forEach(tx => {
      if (tx.transaction?.date) {
        dates.push(new Date(tx.transaction.date));
      }
    });
  });
  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map(d => d.getTime())));
}


export async function createCashflow(transactionIds, take, subAccountIds, accountId, data) {
  try {

    const {userId} = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {clerkUserId: userId},
    });

    if (!user) {
      throw new Error("User not Found");
    }

    if (user.role !== "STAFF") {
      throw new Error("Action unavailable.");
    }

    // fetching all transactions
    let transactions = []; // Initialize transactions as an empty array

    const beginningBalance = take;
    if (isNaN(beginningBalance) || beginningBalance == 0) {
      return{code: 403, success:false, message:'Invalid beginning balance.'} 
    }

    if (transactionIds && transactionIds.length > 0) {
      // Fetch transactions only if transactionIds is provided and not empty
      transactions = await db.transaction.findMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
        take, 
        orderBy: { date: "desc" },
        select: {
          Activity: true,
          type: true,
          description: true,
          amount: true,
          date: true,
          accountId: true,
        },
      });
    }


    let subAccounts = []; // Initialize subAccounts as an empty array

    if (subAccountIds && subAccountIds.length > 0) {
      // Fetch sub-accounts only if subAccountIds is provided and not empty
      subAccounts = await db.SubAccount.findMany({
        where: {
          id: { in: subAccountIds },
          accountId: accountId,
        },
        select: {
          name: true,
          balance: true,
          transactions: {
            orderBy: { transaction: { date: "desc" } },
            select: {
              transaction: {
                select: {
                  date: true,
                  Activity: true,
                  type: true,
                },
              },
            },
          },
        },
      });
    }
    

    const TransactionformattedAmount = transactions.map((transaction) => ({
      ...transaction,
      amount: parseFloat(transaction.amount.toNumber().toFixed(3))
    }));
   

        let transactionDates = [
          ...transactions.map((t) => new Date(t.date)),
          ...subAccounts.flatMap(sa =>
            sa.transactions.map(tx => new Date(tx.transaction.date)).filter(date => !isNaN(date))
          )
        ];


        let earliestDate, latestDate, dateRangeInDays, periodCashFlow;
        if (transactionDates.length > 0) {
          earliestDate = new Date(Math.min(...transactionDates));
          latestDate = new Date(Math.max(...transactionDates));
          dateRangeInDays = (latestDate - earliestDate) / (1000 * 60 * 60 * 24);


          const earliestMonth = earliestDate.getMonth(); // 0 = Jan, 11 = Dec
          const latestMonth = latestDate.getMonth();
          const monthsDiff = Math.abs(latestMonth - earliestMonth) + 1;
          const isFirstHalf = (month) => month >= 0 && month <= 5;
          const isSecondHalf = (month) => month >= 6 && month <= 11;


          switch (true) {
            case (monthsDiff === 6 &&(
                (isFirstHalf(earliestMonth) && isFirstHalf(latestMonth)) ||
                (isSecondHalf(earliestMonth) && isSecondHalf(latestMonth)))):
              periodCashFlow = "SEMI_ANNUAL";
              break;
            case dateRangeInDays <= 1:
              periodCashFlow = "DAILY";
              break;
            case dateRangeInDays <= 7:
              periodCashFlow = "WEEKLY";
              break;
            case dateRangeInDays <= 31:
              periodCashFlow = "MONTHLY";
              break;
            case dateRangeInDays >= 365:
              periodCashFlow = "ANNUAL";
              break;
            case dateRangeInDays >= 120:
              periodCashFlow = "QUARTERLY";
              break;
            default:
              periodCashFlow = "FISCAL_YEAR"; // Default classification for longer ranges
              break;
          }
        } else {
          periodCashFlow = undefined; // Or set a default if needed
        }

        let cashflowDate = new Date(); // Default to now

        if (periodCashFlow === "MONTHLY") {
          const latestTransactionDate = transactions.length > 0 ? new Date(transactions[0].date) : null;
          const latestSubAccountDate = subAccounts.length > 0 ? getLatestSubAccountTransactionDate(subAccounts) : null;

          if (latestTransactionDate && latestSubAccountDate) {
            // Both exist, pick the closest to now
            cashflowDate =
              Math.abs(latestTransactionDate - new Date()) < Math.abs(latestSubAccountDate - new Date())
                ? latestTransactionDate
                : latestSubAccountDate;
          } else if (latestTransactionDate && !latestSubAccountDate) {
            cashflowDate = latestTransactionDate;
          } else if (latestSubAccountDate && !latestTransactionDate) {
            cashflowDate = latestSubAccountDate;
          }
        }

        
    // filter by Activity type
    const OpeTransactions = TransactionformattedAmount.filter(
      (transaction) => transaction.Activity === "OPERATION"
    );
    const InvTransactions = TransactionformattedAmount.filter(
      (transaction) => transaction.Activity === "INVESTMENT"
    );
    const FincTransactions = TransactionformattedAmount.filter(
      (transaction) => transaction.Activity === "FINANCING"
    );



    // Calculate sum of amounts by type (INCOME, EXPENSE) before totalling 
    const OperatingIncomes = (transactions.length > 0 
      ? OpeTransactions.reduce((sum, transaction) => {
        return transaction.type === "INCOME" ? sum + transaction.amount : sum;
        }, 0) 
      : 0) + (subAccounts.length > 0 
                ? subAccounts.reduce((acc, subAccount) => {
                    return acc + (
                      subAccount.transactions.find(
                        (t) => t.transaction.Activity === "OPERATION" && t.transaction.type === "INCOME"
                      )
                    ? subAccount.balance.toNumber()
                    : 0
                    );
                  }, 
                0) 
                
                : 0);



    const OperatingExpenses = (transactions.length > 0 
      ? OpeTransactions.reduce((sum, transaction) => {
        return transaction.type === "EXPENSE" ? sum + transaction.amount : sum;
        }, 0) 
      : 0) + (subAccounts.length > 0 
                ? subAccounts.reduce((acc, subAccount) => {
                    return acc + (
                      subAccount.transactions.find(
                        (t) => t.transaction.Activity === "OPERATION" && t.transaction.type === "EXPENSE"
                      )
                    ? subAccount.balance.toNumber()
                    : 0
                    );
                  }, 
                0) 
                
                : 0);

    const InvestingIncomes = (transactions.length > 0 
      ? InvTransactions.reduce((sum, transaction) => {
        return transaction.type === "INCOME" ? sum + transaction.amount : sum;
        }, 0) 
      : 0) + (subAccounts.length > 0 
                ? subAccounts.reduce((acc, subAccount) => {
                    return acc + (
                      subAccount.transactions.find(
                        (t) => t.transaction.Activity === "INVESTING" && t.transaction.type === "INCOME"
                      )
                    ? subAccount.balance.toNumber()
                    : 0
                    );
                  }, 
                0) 
                
                : 0);

    const InvestingExpenses = (transactions.length > 0 
      ? InvTransactions.reduce((sum, transaction) => {
        return transaction.type === "EXPENSE" ? sum + transaction.amount : sum;
        }, 0) 
      : 0) + (subAccounts.length > 0 
                ? subAccounts.reduce((acc, subAccount) => {
                    return acc + (
                      subAccount.transactions.find(
                        (t) => t.transaction.Activity === "INVESTING" && t.transaction.type === "EXPENSE"
                      )
                    ? subAccount.balance.toNumber()
                    : 0
                    );
                  }, 
                0) 
                
                : 0);
     
    const FinancingIncomes = (transactions.length > 0 
      ? FincTransactions.reduce((sum, transaction) => {
        return transaction.type === "INCOME" ? sum + transaction.amount : sum;
        }, 0) 
      : 0) + (subAccounts.length > 0 
                ? subAccounts.reduce((acc, subAccount) => {
                    return acc + (
                      subAccount.transactions.find(
                        (t) => t.transaction.Activity === "FINANCING" && t.transaction.type === "INCOME"
                      )
                    ? subAccount.balance.toNumber()
                    : 0
                    );
                  }, 
                0) 
                
                : 0);

    const FinancingExpenses = (transactions.length > 0 
      ? FincTransactions.reduce((sum, transaction) => {
        return transaction.type === "EXPENSE" ? sum + transaction.amount : sum;
        }, 0) 
      : 0) + (subAccounts.length > 0 
                ? subAccounts.reduce((acc, subAccount) => {
                    return acc + (
                      subAccount.transactions.find(
                        (t) => t.transaction.Activity === "FINANCING" && t.transaction.type === "EXPENSE"
                      )
                    ? subAccount.balance.toNumber()
                    : 0
                    );
                  }, 
                0) 
                
                : 0);

      const totalOperating = OperatingIncomes - OperatingExpenses;
      const totalInvesting = InvestingIncomes - InvestingExpenses;
      const totalFinancing = FinancingIncomes - FinancingExpenses;


      // --- Calculate netChange ---
      const netChange = totalOperating + totalInvesting + totalFinancing;
      const endingBalance = beginningBalance + netChange

      const NeededData = transactions.map(transaction => ({
        ...transaction,
        amount: parseFloat(transaction.amount), // Convert to string
        date: format(new Date(transaction.date), 'yyyy-MM-dd HH:mm:ss.SSSS')
      }));
  

      // required outputs:
      // 1. Total of each Activity type
      // 2. Net change
      // 3. beginning balance
      // 4. ending balance

      // const one = parseFloat(totalOperating.toFixed(3));
      // const two = parseFloat(totalInvesting.toFixed(3));
      // const three = parseFloat(totalFinancing.toFixed(3));

      const newCashflow = await db.cashFlow.create({
        data: {
          ...data,
          activityTotal: [totalOperating, totalInvesting, totalFinancing],
          netChange: Number(netChange.toFixed(3)),
          startBalance: Number(beginningBalance.toFixed(3)),
          endBalance: Number(endingBalance.toFixed(3)),
          createdAt: new Date(),
          periodCashFlow,

          description: NeededData?.description,
          date: cashflowDate,
          userId: user.id,
          accountId: accountId,
          transactions: transactionIds && transactionIds.length > 0 ? {
            connect: transactionIds.map((id) => ({ id })),
          } : undefined,
          subAccounts: subAccountIds && subAccountIds.length > 0 ? {
            create: subAccountIds.map((id) => ({
              subAccount: {
                connect: { id },
              },
            })),
          } : undefined,
          userId: user?.id,
        },
      });


    
    


    const cashflowWithTransactions = await db.cashFlow.findUnique({
      where: { id: newCashflow.id },
      include: { 
        transactions: transactionIds && transactionIds.length > 0 ? {
            select: {
              Activity: true,
              type: true,
              description: true,
              particular:true,
              amount: true,
              date: true,
              accountId: true,
            },
          } : false,
          subAccounts: subAccountIds && subAccountIds.length > 0 ? {
            select: {
              subAccount: {
                select: {
                  name: true,
                  balance: true,
                  transactions: {
                    select: {
                      transaction: {
                        select: {
                          date: true,
                          Activity: true,
                          type: true,
                        }
                      }
                    }
                  }
                },
              },
            },
          } : false,
      },
    });
   
    
    const convertedTransactions = cashflowWithTransactions.transactions
      ? cashflowWithTransactions.transactions.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount),
       }))
      : [];

    const serializedSubAccounts = cashflowWithTransactions.subAccounts
      ? cashflowWithTransactions.subAccounts.map((subAccount) => ({
        ...subAccount,
        subAccount: {
          ...subAccount.subAccount,
          balance: subAccount.subAccount.balance ? Number(subAccount.subAccount.balance) : null,
        },
        name: subAccount.subAccount.name || null,
        balance: subAccount.subAccount.balance ? Number(subAccount.subAccount.balance) : null,
      }))
      : [];


      

    const convertedCashflow = {
      ...cashflowWithTransactions,
      transactions: convertedTransactions,
      subAccounts: serializedSubAccounts,
    }


    const updateLog = await activityLog({
      userId: user.id,
      action: "createCashflow",
      args: convertedCashflow,
      timestamp: new Date()
    });
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "createCashflow",
          meta: { message: "Possible System interuption: Failed to log Created Cashflow" },
        }
      })
    }

    revalidatePath('/dashboard')
    revalidatePath(`/account/${accountId}`)
    return {
      success: true,
      data: convertedCashflow
    };
  } catch (error) {
    console.error(error.message)
    return {code:500, success:false, message: "Something went wrong. Failed to create cashflow."};
  }
}



export async function getCashflow(accountId, userId, cashFlowId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const cashflow = await db.cashFlow.findMany({
      where: {accountId}, // Filter by accountId
      orderBy: { createdAt: "desc" }, // Order by descending createdAt
      include: {  
       transactions: {
        select: {
          id: true,
          type: true,
          description: true,
          amount: true,
          Activity: true,
          date: true,
        }
       },
        account: {
          select:{
            name: true,
            id: false,
          },
          
        } // Include associated transactions
      },
    });

    if (!cashflow) {
      // No cashflow records found for the account
      console.log("No cashflow records found for account ID: ", accountId);
      return; // Or handle the case as needed
    }

    // Convert Decimal objects to numbers (if necessary)
    const convertedCashflows = cashflow.map((cf) => {
      const convertedTransactions = cf.transactions.map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount),
        // Convert other Decimal properties if any
      }));


      return {
        ...cf,
        transactions: convertedTransactions,
      };
    });

    return convertedCashflows;
  } catch (error) {
    console.error("Error fetching cashflow:", error);
    throw new Error("Failed to fetch cashflow");
  }
}


export async function getCashflowEnding(accountId){
  try {
    const {userId} = await auth();
    if(!userId){
      throw new Error("Unauthorized.")
    }

    const user = await db.user.findUnique({
      where: {clerkUserId: userId}
    })

    if(!user){
      throw new Error("Unauthorized.")
    }

    if(user.role !== "STAFF"){
      throw new Error("Unavailable data.")
    }

  
    const periods = ["DAILY","SEMI_ANNUAL", "WEEKLY", "MONTHLY", "ANNUAL", "FISCAL_YEAR"]; // Add others if needed


    const latestCashflows = await Promise.all(
      periods.map(async (period) => {
        const cashflow = await db.cashFlow.findFirst({
          where:{
            accountId,
            periodCashFlow: period,
          },
          orderBy: {createdAt: "desc"},
          select: {
            id: true, 
            endBalance: true,
            periodCashFlow: true,
            createdAt: true,
          }
        });
        return cashflow ? {...cashflow} : null
      })
    );
  

 
    return {success: true, latestCashflows: latestCashflows.filter(Boolean)}
  } catch (error) {
    console.log("Error fetching latest cashflow statements.", error.message)
    throw new Error("Error fetching latest cashflow statements.")
  }
}



function flattenNestedTransactions(subAccount) {
  let transactions = [];

  // If the current sub-account has a transaction, use it
  if (subAccount.transactions && subAccount.transactions.length > 0) {
    const transaction = subAccount.transactions[0]; // Use the single transaction
    transactions.push({
      id: transaction.transaction.id,
      type: transaction.transaction.type,
      Activity: transaction.transaction.Activity,
      amount: Number(transaction.transaction.amount), // Convert Decimal to number
      description: transaction.transaction.description,
      date: transaction.transaction.date.toISOString(), // Convert Date to string
    });
  }

  // If the current sub-account has child sub-accounts, recursively fetch their transactions
  if (subAccount.parentOf && subAccount.parentOf.length > 0) {
    subAccount.parentOf.forEach((childLink) => {
      const childTransactions = flattenNestedTransactions(childLink.child);
      transactions.push(...childTransactions);
    });
  }

  return transactions;
}

export async function getCashflowById(cfsID) {
  try {
    const cashflow = await db.cashFlow.findUnique({
      where: { id: cfsID },
      include: {
        transactions: {
          select: {
            id: true,
            type: true,
            description: true,
            amount: true,
            Activity: true,
            particular:true, 
            date: true,
          },
        },
        subAccounts: {
          select: {
            subAccountId: true,
            subAccount: {
              select: {
                id: true,
                name: true,
                balance: true,
                transactions: {
                  take: 1, // Fetch only one transaction
                  include: {
                    transaction: {
                      select: {
                        id: true,
                        type: true,
                        Activity: true,
                        amount: true,
                        description: true,
                        date: true,
                      },
                    },
                  },
                },
                parentOf: {
                  include: {
                    child: {
                      select: {
                        id: true,
                        name: true,
                        transactions: {
                          take: 1, // Fetch only one transaction for child sub-accounts
                          include: {
                            transaction: {
                              select: {
                                id: true,
                                type: true,
                                Activity: true,
                                amount: true,
                                description: true,
                                date: true,
                              },
                            },
                          },
                        },
                        parentOf: {
                          include: {
                            child: {
                              select: {
                                id: true,
                                name: true,
                                transactions: {
                                  take: 1, // Fetch only one transaction for deeper nested sub-accounts
                                  include: {
                                    transaction: {
                                      select: {
                                        id: true,
                                        type: true,
                                        Activity: true,
                                        amount: true,
                                        description: true,
                                        date: true,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        account: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!cashflow) {
      console.log("Cashflow not found for ID:", cfsID);
      return null;
    }

    // Serialize transactions
    const convertedTransactions = cashflow.transactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
      date: transaction.date.toISOString(),
    }));

    // Serialize sub-accounts
    const convertedSubAccounts = cashflow.subAccounts.map((subAccountRelation) => {
      const subAccount = subAccountRelation.subAccount;

      // Use helper function to flatten transactions
      const transactions = flattenNestedTransactions(subAccount);

      return {
        id: subAccount?.id || subAccountRelation.subAccountId,
        name: subAccount?.name || null,
        balance: subAccount?.balance ? Number(subAccount.balance) : null,
        transactions,
      };
    });

    return {
      ...cashflow,
      transactions: convertedTransactions,
      subAccounts: convertedSubAccounts,
    };
  } catch (error) {
    console.error("Error fetching cashflow by ID:", error);
    throw new Error("Failed to fetch cashflow by ID");
  }
}








export async function deleteCashflow(cashflowId) {
  console.log("THE BACKEND",cashflowId)
  try {
    console.log('Starting delete cashflow: ');

    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }
    if (user.role !== "STAFF") {
      throw new Error('Unavailable action.');
    }

    const cfsId = cashflowId

    const cashflow = await db.cashFlow.findUnique({
      where: {
        id: cfsId,
        userId: user.id,
      },
      select: {
        id: true,
        periodCashFlow: true,
        accountId: true,
        startBalance: true,
        endBalance: true,
        activityTotal: true,
        netChange: true,
        createdAt: true,
      }
    });

    if (!cashflow) {
     return {code:404, success:false, message:'Cashflow not found.'}
    }
    const archive = await archiveEntity({
      userId: user.id,
      accountId: cashflow.accountId,
      action: "deleteCashflowStatement",
      entityType: "CashflowStatement",
      entityId: cashflow.id,
      data: cashflow,
    });
    if(archive.success ===  false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "deleteCashflowStatement",
          meta: { message: "Possible System interruption: Failed to log Deleted Cashflow" },
        } 
      })
    }

    await db.cashFlow.delete({
      where: {
        id: cashflow.id,
      },
    });

    console.log('Cashflow deleted');
    revalidatePath('/CashflowStatement')

    return { code:200, success: true, message: "Cancelled creating Cashflow Statement"};
  } catch (error) {
    console.error('Error cancelling Cashflow creation:', error);
    return { code:500, success: false, message:'Something went wrong.' };
  }
}


export async function updateCashflow(cashflowId, updatedTransactionIds, updatedSubAccountIds) {
  try {
    console.log("[1] update start", cashflowId, updatedTransactionIds, updatedSubAccountIds)
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    // Step 1: Fetch the current cashflow with necessary details
    const existingCashflow = await db.cashFlow.findUnique({
      where: { id: cashflowId },
      include: {
        transactions: true,
        subAccounts: {
          include: {
            subAccount: {
              include: {
                transactions: {
                  include: { transaction: true },
                },
              },
            },
          },
        },
      },
    });

    if (!existingCashflow) throw new Error("Cashflow not found");

    const accountId = existingCashflow.accountId;
    const period = existingCashflow.periodCashFlow;
    const startBalance = existingCashflow.startBalance;

    // Step 2: Fetch updated transactions
    const updatedTransactions = await db.transaction.findMany({
      where: {
        id: { in: updatedTransactionIds },
        userId: user.id,
      },
    });

    const updatedSubAccounts = await db.SubAccount.findMany({
      where: {
        id: { in: updatedSubAccountIds },
        accountId: accountId,
      },
      include: {
        transactions: {
          include: { transaction: true },
        },
      },
    });

    // Helper to sum transactions
    const sumTransactions = (txs, activity, type) =>
      txs
        .filter(t => t.Activity === activity && t.type === type)
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const sumSubAccounts = (subs, activity, type) =>
      subs.reduce((sum, sa) => {
        const match = sa.transactions.some(t => t.transaction.Activity === activity && t.transaction.type === type);
        return match ? sum + parseFloat(sa.balance?.toString() || "0") : sum;
      }, 0);

    // Step 3: Calculate new activity totals
    const totalOperating =
      sumTransactions(updatedTransactions, "OPERATION", "INCOME") -
      sumTransactions(updatedTransactions, "OPERATION", "EXPENSE") +
      sumSubAccounts(updatedSubAccounts, "OPERATION", "INCOME") -
      sumSubAccounts(updatedSubAccounts, "OPERATION", "EXPENSE");

    const totalInvesting =
      sumTransactions(updatedTransactions, "INVESTMENT", "INCOME") -
      sumTransactions(updatedTransactions, "INVESTMENT", "EXPENSE") +
      sumSubAccounts(updatedSubAccounts, "INVESTMENT", "INCOME") -
      sumSubAccounts(updatedSubAccounts, "INVESTMENT", "EXPENSE");

    const totalFinancing =
      sumTransactions(updatedTransactions, "FINANCING", "INCOME") -
      sumTransactions(updatedTransactions, "FINANCING", "EXPENSE") +
      sumSubAccounts(updatedSubAccounts, "FINANCING", "INCOME") -
      sumSubAccounts(updatedSubAccounts, "FINANCING", "EXPENSE");

    const netChange = totalOperating + totalInvesting + totalFinancing;
    const endBalance = startBalance + netChange;

    // Step 4: Update the current cashflow
    await db.cashFlow.update({
      where: { id: cashflowId },
      data: {
        activityTotal: [totalOperating, totalInvesting, totalFinancing],
        netChange,
        endBalance,
        updatedAt: new Date(),
        transactions: {
          set: [], // clear existing
          connect: updatedTransactionIds.map(id => ({ id })),
        },
        subAccounts: {
          deleteMany: {}, // clear all
          create: updatedSubAccountIds.map(id => ({
            subAccount: { connect: { id } },
          })),
        },
      },
    });

    // Step 5: Update subsequent cashflows of same period
    const futureCashflows = await db.cashFlow.findMany({
      where: {
        accountId,
        periodCashFlow: period,
        date: { gt: existingCashflow.date },
      },
      orderBy: { date: "asc" },
    });

    let runningStart = endBalance;

    for (const cf of futureCashflows) {
      const newEnd = runningStart + cf.netChange;
      await db.cashFlow.update({
        where: { id: cf.id },
        data: {
          startBalance: runningStart,
          endBalance: newEnd,
        },
      });
      runningStart = newEnd;
    }


console.log("[2] update end. success.")
    return { success: true, message: "Cashflow updated successfully." };
  } catch (error) {
    console.log("[3] action end. failed.")
    console.error("UPDATE CASHFLOW ERROR:", error);
    throw new Error("Failed to update cashflow");
  }
}


export async function updateNetchange(cfsId, amount){
  try {
    console.log("[1] Auth");
    const {userId} = await auth();

    const user = await db.user.findUnique({
      where: {clerkUserId: userId}
    });

    if(!user){
      throw new Error("Unauthorized.");
    };

    if(user.role !== "STAFF"){
      throw new Error("Unavailable action");
    };

    const cashflow = await db.cashFlow.findUnique({
      where: {id: cfsId},
      select: {
        id: true,
        accountId: true,
        netChange: true,
      }
    });

    console.log("[2]Fetched Cashflow", cashflow);

    if(!cashflow){
      throw new Error("Error fetching this cashflow.");
    }

    const newAmount = Number(amount);
    console.log("[3]Update Net change", cashflow);
    const updatedNetchange = await db.cashFlow.update({
      where: {id: cashflow.id},
      data: {
        netChange: newAmount,
      }
    });

    const updateLog = await activityLog({
      userId: user.id,
      action: "udpateNetChange",
      args: {
        account_ID: cashflow.accountId,
        cashflowId: cashflow.id,
        oldOperatingTotal: cashflow.netChange,
        newOperatingTotal: updatedNetchange.netChange
      },
      timestamp: new Date()
    });
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "udpateNetChange",
          meta: { message: "Possible System interuption: Failed to log Edit Gross" },
        }
      })
    }

    revalidatePath(`/CashflowStatement/${cashflow.accountId}/${cashflow.id}`);

    console.log("[4] Success update");
    console.log("[4]", updatedNetchange);
    return {success: true, data: updatedNetchange};
  } catch (error) {
    console.log("Error updating net change");
    throw new Error("Error udpating Net change");
  }
}

export async function updateStartBalance(cfsId, amount) {
  try {
    console.log("[1] Auth");
    const { userId } = await auth();

    const user = await db.user.findUnique({ 
      where: { clerkUserId: userId } 
    });

    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!user || user.role !== "STAFF") {
      throw new Error("Unavailable action");
    }

    console.log("[2] Fetch Cashflow");
    const cashflow = await db.cashFlow.findUnique({ 
      where: { id: cfsId },
      select: {
        id: true,
        startBalance: true,
        accountId: true,
      }
    });
    if (!cashflow){
      throw new Error("Cashflow not found.");
    }

    console.log("[3] Update balance");

    const newAmount = Number(amount)

    const updatedBeginningBal = await db.cashFlow.update({
      where: { id: cashflow.id },
      data: { startBalance: newAmount }
    });


    const updateLog = await activityLog({
      userId: user.id,
      action: "updateStartBalance",
      args: {
        account_ID: cashflow.accountId,
        cashflowId: cashflow.id,
        oldStartBalance: cashflow.startBalance,
        newStartBalance: updatedBeginningBal.startBalance
      },
      timestamp: new Date()
    });
    
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "updateStartBalance",
          meta: { message: "Possible System interruption: Failed to log Edit Start Balance" },
        }
      })
    }


    revalidatePath(`/CashflowStatement/${cashflow.accountId}/${cashflow.id}`);

    console.log("[4] Success update");
    return { success: true, data: updatedBeginningBal };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


export async function updateEndBalance(cfsId, amount) {
  try {
    console.log("[1] Auth");
    const { userId } = await auth();
    const user = await db.user.findUnique({ 
      where: { clerkUserId: userId } 
    });
    if (!user){
      throw new Error("Unauthorized");
    }
    if (!user || user.role !== "STAFF") {
      throw new Error("Unavailable action");
    }


    console.log("[2] Fetch Cashflow");
    const cashflow = await db.cashFlow.findUnique({ 
      where: { id: cfsId },
      select: {
        id: true,
        endBalance: true,
        accountId: true,
      }
    });
    if (!cashflow){
      throw new Error("Cashflow not found.");
    }

    console.log("[3] Update end balance", cashflow);
    const newAmount = Number(amount);
    const updatedEndBalance = await db.cashFlow.update({
      where: { id: cashflow.id },
      data: { endBalance: newAmount }
    });


    const updateLog = await activityLog({
      userId: user.id,
      action: "updateEndBalance",
      args: {
        account_ID: cashflow.accountId,
        cashflowId: cashflow.id,
        oldEndBalances: cashflow.endBalance,
        newEndBalances: updatedEndBalance.endBalance
      },
      timestamp: new Date()
    });
    
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "updateEndBalance",
          meta: { message: "Possible System interruption: Failed to Edit Ending Balance" },
        }
      })
    }

    console.log("[4] Success update", updatedEndBalance);
    revalidatePath(`/CashflowStatement/${cashflow.accountId}/${cashflow.id}`);
    return { success: true, data: updatedEndBalance };
  } catch (error) {
    console.log("Error udpating Ending balance");
    throw new Error("Error updating Ending balance");
  }
}

// relation checker
async function isTransactionInCashflow(cashflowId, transactionId) {
  try {
    const cashflowRelation = await db.cashFlow.findUnique({
      where: { id: cashflowId },
        select: {
          transactions: {
            where: { id: transactionId },
            select: { id: true }
          }
        }
      });
    
    if (!cashflowRelation){
      return {success: false, message: "[3] Relation not found"};
    }
      
    return {success: true};
  } catch (error) {
    console.error("[3] Error checking transaction in cashflow:", error);
    return { success: false, message: "[3] Relation not found, error", error: error.message };
  }
}

export async function updateCashflowTransaction(cfsId, transactionId, amount) {
  try {

    const { userId } = await auth();

    const user = await db.user.findUnique({ 
      where: { clerkUserId: userId } 
    });
    if (!user) {
      throw new Error("Unauthorized");
    }
    if (!user || user.role !== "STAFF") {
      throw new Error("Unavailable action");
    }

    
    const currCashflow = await db.cashFlow.findUnique({
      where: {id: cfsId},
      select: {
        id: true,
        accountId: true,
        transactions: {
          select: {
            id: true, 
            type: true, 
            Activity: true,
            amount: true,
          }
        }
      }
    })

    const transaction = await db.transaction.findUnique({
      where: { 
        id: transactionId, 
        userId: user.id 
      },
      select: {
        id: true,
      }
    });
    
    if (!transaction || !currCashflow) {
      throw new Error("[2] Data not found.");
    }


    const isRelated = await isTransactionInCashflow(currCashflow.id, transaction.id);

    if (!isRelated.success) {
      throw new Error("[3] Transaction is not related to this cashflow.");
    }

   
    let newType = amount < 0 
      ? "EXPENSE" 
      : "INCOME";

    const updatedTransaction = await db.transaction.update({
      where: { id: transaction.id },
      data: {
        amount: Math.abs(Number(amount)),
        type: newType
      }
    });

    console.log("[5] Fetching updated transaction")
    const returnUpdated = await db.transaction.findUnique({
      where: {id: updatedTransaction.id},
      select: {
        id: true,
        type: true,
        amount: true,
        Activity: true
      }
    })
    console.log("[5] Fetched", returnUpdated)

    const formattedUpdatedTransaction = {
      ...returnUpdated,
      amount: Number(returnUpdated.amount),
    }
    const updateLog = await activityLog({
      userId: user.id,
      action: "updateCashflowTransaction",
      args: {
        account_ID: currCashflow.accountId,
        cashflowId: currCashflow.id,
        oldTransactionData: {
          oldAmount: transaction.amount,
          oldType: transaction.type,
        },
        newTransactionData: {
          newAmount: updatedTransaction.amount,
          newType: updatedTransaction.type,
        }
      },
      timestamp: new Date()
    });
    
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "updateCashflowTransaction",
          meta: { message: "Possible System interruption: Failed to log Edit Transaction of Cashflow" },
        }
      })
    }
    revalidatePath(`/CashflowStatement/${currCashflow.accountId}/${currCashflow.id}`)

    console.log("[6] Success updating transaction")
    return { success: true, data: formattedUpdatedTransaction};
  } catch (error) {
    return { success: false, error: error.message };
  }
}






export async function updateTotalOperating(cfsId, newValue) {
  try {
    const { userId } = await auth();
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user || user.role !== "STAFF") throw new Error("Unavailable action");

    const cashflow = await db.cashFlow.findUnique({ 
      where: { id: cfsId },
      select: {
        id: true,
        accountId: true,
        activityTotal: true, 
      }
      
    });
    if (!cashflow) throw new Error("Cashflow not found.");

    const activityTotal = cashflow.activityTotal

    const newActivityTotal = [activityTotal[0] = Number(newValue), 
    activityTotal[1]=activityTotal[1], activityTotal[2]=activityTotal[2]]

    console.log("update", newActivityTotal)
    const updated = await db.cashFlow.update({
      where: { id: cfsId },
      data: { activityTotal: newActivityTotal }
    });

    const updateLog = await activityLog({
      userId: user.id,
      action: "updateTotalOperating",
      args: {
        account_ID: cashflow.accountId,
        cashflowId: cashflow.id,
        oldOperatingTotal: cashflow.activityTotal[0],
        newOperatingTotal: updated.activityTotal[0]
      },
      timestamp: new Date()
    });
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "updateTotalOperating",
          meta: { message: "Possible System interruption: Failed to log Edit Total Operating" },
        }
      })
    }

    revalidatePath(`/CashflowStatement/${cashflow.accountId}/${cashflow.id}`);
    return { success: true, data: updated };
  } catch (error) {
    console.log("error: ", error)
    throw new Error("Error updating activity total")
  }
}

export async function updateTotalInvesting(cfsId, newValue) {
  try {
    const { userId } = await auth();
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user || user.role !== "STAFF") throw new Error("Unavailable action");

    const cashflow = await db.cashFlow.findUnique({ 
      where: { id: cfsId },
      select: {
        id: true,
        accountId: true,
        activityTotal: true,
      }
    });
    if (!cashflow) throw new Error("Cashflow not found.");

    const activityTotal = cashflow.activityTotal

    const newActivityTotal = [
      activityTotal[0] = activityTotal[0],
      activityTotal[1] = Number(newValue),
      activityTotal[2] = activityTotal[2]]

    const updated = await db.cashFlow.update({
      where: { id: cfsId },
      data: { activityTotal: newActivityTotal }
    });

        const updateLog = await activityLog({
      userId: user.id,
      action: "updateTotalInvesting",
      args: {
        cashflowId: cashflow.id,
        account_ID: cashflow.accountId,
        oldInvestingTotal: cashflow.activityTotal[1],
        newInvestingTotal: updated.activityTotal[1]
      },
      timestamp: new Date()
    });
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "updateTotalInvesting",
          meta: { message: "Possible System interruption: Failed to log Edit Total Investing" },
        }
      })
    }

    revalidatePath(`/CashflowStatement/${cashflow.accountId}/${cashflow.id}`);
    return { success: true, data: updated };
  } catch (error) {
    throw new Error("Error updating activity total")
  }
}

export async function updateTotalFinancing(cfsId, newValue) {
  try {
    const { userId } = await auth();
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user || user.role !== "STAFF") throw new Error("Unavailable action");

    const cashflow = await db.cashFlow.findUnique({ 
        where: { id: cfsId },
        select: {
          id: true,
          accountId: true,
          activityTotal: true,
        }
    });
    if (!cashflow) throw new Error("Cashflow not found.");


    const activityTotal = cashflow.activityTotal

    const newActivityTotal = [
      activityTotal[0] = activityTotal[0],
      activityTotal[1] = activityTotal[1],
      activityTotal[2] = Number(newValue)]

    const updated = await db.cashFlow.update({
      where: { id: cfsId },
      data: { 
        activityTotal: newActivityTotal
      }
    });


    const updateLog = await activityLog({
      userId: user.id,
      action: "updateTotalFinancing",
      args: {
        cashflowId: cashflow.id,
        account_ID: cashflow.accountId,
        oldFinancingTotal: cashflow.activityTotal[2],
        newFinancingTotal: updated.activityTotal[2]
      },
      timestamp: new Date()
    });
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "updateTotalFinancing",
          meta: { message: "Possible System interruption: Failed to log Edit Total Financing" },
        }
      })
    }

    revalidatePath(`/CashflowStatement/${cashflow.accountId}/${cashflow.id}`);
    return { success: true, data: updated };
  } catch (error) {
    throw new Error("Error updating activity total")
  }
}


export async function updateBalanceQuick(cfsId, netChange, begBalance, endBal){
  try {
    console.log("[1] Auth")
    console.log("[1]", cfsId, netChange, begBalance, endBal)
    console.log("[1]", typeof cfsId, typeof netChange, typeof begBalance, typeof endBal)
    const { userId } = await auth();

    const user = await db.user.findUnique({
      where: { clerkUserId: userId}
    });

    if(!user){
      throw new Error("Unauthorized");
    };

    if(user.role !== "STAFF"){
      throw new Error("Unavailable action");
    };

    console.log("[2] Fetching cashflow")
    const cashflow = await db.cashFlow.findUnique({
      where: { id: cfsId },
      select: {
        id: true,
        accountId: true,
        netChange: true,
        startBalance: true,
        endBalance: true,
      }
    });

    
    if(!cashflow){
      throw new Error("[2] Cashflow do not exist")
    }

    console.log("[3] Update Balances")
    const currNetChange = Number(netChange);
    const currStartBalance = Number(begBalance);
    const currEndBalance = Number(endBal);



    
    const updatedCashflowBalance = await db.cashFlow.update({
      where: {id: cashflow.id},
      data: {
        netChange: currNetChange,
        startBalance: currStartBalance,
        endBalance: currEndBalance
      },
    });

    const updateLog = await activityLog({
      userId: user.id,
      action: "updateBalanceQuick",
      args: {
        cashflowId: cashflow.id,
        account_ID: cashflow.accountId,
        oldBalances: {
          net: cashflow.netChange, 
          beginning: cashflow.startBalance, 
          ending: cashflow.endBalance
        },
        newBalances: {
          net: updatedCashflowBalance.netChange, 
          beginning: updatedCashflowBalance.startBalance, 
          ending: updatedCashflowBalance.endBalance
        }
      },
      timestamp: new Date()
    });
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "updateBalanceQuick",
          meta: { message: "Possible System interruption: Failed to log Quick Edit Balance" },
        }
      })
    }

    revalidatePath(`/CashflowStatement/${cashflow.accountId}`);
    revalidatePath(`/CashflowStatement/${cashflow.accountId}/${cashflow.id}`);
    console.log("[4] Success udpate", updatedCashflowBalance)
    return { success: true}
  } catch (error) {
    console.log("Error quick balance update");
    return { success: false, error: error.message };
  }
}
