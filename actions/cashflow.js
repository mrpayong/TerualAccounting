"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Decimal } from "@prisma/client/runtime/library";
import { format } from "date-fns";
import { Activity } from "lucide-react";
import { revalidatePath } from "next/cache";

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



// export async function getCashInflow(id) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       throw new Error("Unauthorized");
//     }

//     const user = await db.user.findUnique({
//       where: { clerkUserId: userId },
//     });

//     if (!user) {
//       throw new Error("User not found");
//     }

//     const transactionIncome = await db.account.findUnique({
//       where: {
//         id,
//         userId: user.id,
//       },
//       include: {
//         transactions: {
//           where: { type: "INCOME" },
//         },
//       },
//     });

//     if (!transactionIncome) {
//       throw new Error("Account not found");
//     }

//     return transactionIncome.transactions;

//   } catch (error) {
//     console.error("Error fetching account Income:", error.message);
//     throw new Error("Failed to fetch account Income.");
//   }
// }
//////////////////////////////////////////////////////////////////////////////////
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
    console.log("User found:", user);





    // fetching all transactions
    let transactions = []; // Initialize transactions as an empty array

    const beginningBalance = take;
    if (isNaN(beginningBalance) || beginningBalance == 0) {
      throw new Error("Invalid beginning balance.") 
    }

    if (transactionIds && transactionIds.length > 0) {
      // Fetch transactions only if transactionIds is provided and not empty
      transactions = await db.transaction.findMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
        take, 
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
            select: {
              transaction: {
                select: {
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
   

    const transactionDates = transactions.map((t) => new Date(t.date));
    const earliestDate = new Date(Math.min(...transactionDates));
    const latestDate = new Date(Math.max(...transactionDates));
    const dateRangeInDays = (latestDate - earliestDate) / (1000 * 60 * 60 * 24);

    let periodCashFlow;

    switch (true) {
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

    console.log(totalOperating)

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
              date: new Date(),
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

      console.log("tru",serializedSubAccounts)

      

    const convertedCashflow = {
      ...cashflowWithTransactions,
      transactions: convertedTransactions,
      subAccounts: serializedSubAccounts,
    }

    revalidatePath('/dashboard')
    revalidatePath(`/account/${accountId}`)
    return {
      success: true,
      data: convertedCashflow
    };
  } catch (error) {
    console.error(error.message)
    throw new Error(error);
    
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

  
    const periods = ["DAILY", "WEEKLY", "MONTHLY", "ANNUAL", "FISCAL_YEAR"]; // Add others if needed


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



// export async function getCashflowById(cfsID) {
//   try {
//     const cashflow = await db.cashFlow.findUnique({
//       where: { id: cfsID }, // Fetch by cashflow ID
//       include: {
//         transactions: {
//           select: {
//             id: true,
//             type: true,
//             description: true,
//             amount: true,
//             Activity: true,
//             date: true,
//           },
//         },
//         subAccounts: {
//           select: {
//             subAccountId: true,
//             subAccount: {
//               select: {
//                 id: true, // Include sub-account ID
//                 name: true,
//                 balance: true,
//                 transactions: {
//                   select: {
//                     transaction: {
//                       select: {
//                         type: true,
//                         Activity: true
//                       }
//                     }
//                   },
//                 },
//               },
//             },
//           },
//         },
//         account: {
//           select: {
//             name: true,
//           },
//         },
//       },
//     });

//     if (!cashflow) {
//       console.log("Cashflow not found for ID:", cfsID);
//       return null;
//     }

//     console.log("sub account in cashflow:", cashflow);

//     // Convert Decimal objects to numbers and Date objects to strings
//     const convertedTransactions = cashflow.transactions.map((transaction) => ({
//       ...transaction,
//       amount: Number(transaction.amount), // Convert Decimal to number
//       date: transaction.date.toISOString(), // Convert Date to string
//     }));

//     const convertedSubAccounts = cashflow.subAccounts.map((subAccountRelation) => ({
//       id: subAccountRelation.subAccount?.id || subAccountRelation.subAccountId, // Use subAccountId as fallback
//       name: subAccountRelation.subAccount?.name || null, // Safely access the name
//       balance: subAccountRelation.subAccount?.balance
//         ? Number(subAccountRelation.subAccount.balance)
//         : null, // Safely access and convert balance
//         transactions: subAccountRelation.subAccount?.transactions.map((transaction) => ({
    
//           type: transaction.type,
//           Activity: transaction.Activity,
//         })),
//     }));

//     console.log("converted sub accounts: ", convertedSubAccounts) 
//     return {
//       ...cashflow,
//       transactions: convertedTransactions,
//       subAccounts: convertedSubAccounts,
//     };
//   } catch (error) {
//     console.error("Error fetching cashflow by ID:", error);
//     throw new Error("Failed to fetch cashflow by ID");
//   }
// }

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



// export async function recalculateCashflowTotals(cashflowId) {
//   console.log("[3.1] Recalculate balances")
//   // 1. Fetch the current cashflow to get accountId, periodCashFlow, and createdAt
//   const current = await db.cashFlow.findUnique({
//     where: { id: cashflowId },
//     select: {
//       id: true,
//       accountId: true,
//       periodCashFlow: true,
//       createdAt: true,
//     }
//   });
//   if (!current) throw new Error("Cashflow not found.");

//   // 2. Fetch all cashflows for this account and period, ordered by createdAt ASC
//   const cashflows = await db.cashFlow.findMany({
//     where: {
//       accountId: current.accountId,
//       periodCashFlow: current.periodCashFlow,
//     },
//     orderBy: { createdAt: "asc" }
//   });

//   // 3. Find the index of the current cashflow in the sequence
//     console.log("[3.2] Recalculate balances")
//   const startIdx = cashflows.findIndex(cf => cf.id === cashflowId);
//   if (startIdx === -1) throw new Error("Cashflow not found in sequence.");

//   // 4. For each cashflow from the current to the last, recalculate and update
//   let prevEndBalance = null;
//   for (let i = startIdx; i < cashflows.length; i++) {
//     const cf = cashflows[i];

//     // Fetch transactions and subAccounts for this cashflow
//     const fullCF = await db.cashFlow.findUnique({
//       where: { id: cf.id },
//       include: {
//         transactions: {
//           select: {
//             Activity: true,
//             type: true,
//             amount: true,
//           },
//         },
//         subAccounts: {
//           select: {
//             subAccount: {
//               select: {
//                 balance: true,
//                 transactions: {
//                   select: {
//                     transaction: {
//                       select: {
//                         Activity: true,
//                         type: true,
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     // Use previous period's endBalance as startBalance if not the first in sequence
//     let startBalance = i === 0 ? Number(fullCF.startBalance) : prevEndBalance;

//     // Calculate activity totals
//     const activities = ["OPERATION", "INVESTMENT", "FINANCING"];
//     let activityTotal = [];

//   console.log("[3.3] Recalculate balances")
//     for (const activity of activities) {
//       // Direct transactions
//       const income = fullCF.transactions
//         .filter(t => t.Activity === activity && t.type === "INCOME")
//         .reduce((sum, t) => sum + Number(t.amount), 0);
//       const expense = fullCF.transactions
//         .filter(t => t.Activity === activity && t.type === "EXPENSE")
//         .reduce((sum, t) => sum + Number(t.amount), 0);

//       // SubAccount balances
//       let subAccountIncome = 0;
//       let subAccountExpense = 0;
//       for (const rel of fullCF.subAccounts) {
//         const sub = rel.subAccount;
//         if (!sub || !sub.transactions || sub.transactions.length === 0) continue;
//         const t = sub.transactions[0].transaction;
//         if (t.Activity === activity) {
//           if (t.type === "INCOME") subAccountIncome += Number(sub.balance);
//           if (t.type === "EXPENSE") subAccountExpense += Number(sub.balance);
//         }
//       }

//       const total = (income + subAccountIncome) - (expense + subAccountExpense);
//       activityTotal.push(Number(total.toFixed(3)));
//     }

//       console.log("[3.4] Recalculate balances")
//     // Net change and end balance
//     const netChange = activityTotal.reduce((a, b) => a + b, 0);
//     const endBalance = Number((startBalance + netChange).toFixed(3));

//     // Update the cashflow record
//     await db.cashFlow.update({
//       where: { id: cf.id },
//       data: {
//         activityTotal,
//         netChange: Number(netChange.toFixed(3)),
//         startBalance: Number(startBalance.toFixed(3)),
//         endBalance,
//       },
//     });

//     prevEndBalance = endBalance;
//   }
//   console.log("[3.5] Success Recalculate balances")
//   return { success: true };
// }


























// export async function updateCashflow({ cashflowId, transactionId, newAmount }) {
//   try {
//     const { userId } = await auth();
//     if (!userId) throw new Error("Unauthorized");

//     // 1. Fetch the cashflow and check if the transaction is related
//     const cashflow = await db.cashFlow.findUnique({
//       where: { id: cashflowId },
//       include: { transactions: { select: { id: true } } },
//     });
//     if (!cashflow) throw new Error("Cashflow not found.");

//     const isRelated = cashflow.transactions.some(tx => tx.id === transactionId);
//     if (!isRelated) throw new Error("Transaction is not related to this cashflow.");

//     // 2. Update the transaction amount
//     await db.transaction.update({
//       where: { id: transactionId },
//       data: { amount: Number(newAmount) },
//     });

//     // 3. Recalculate this cashflow and all subsequent cashflows
//     let recalc = await recalculateCashflowTotals(cashflowId);

//     let prevEndBalance = null;
//     if (recalc && recalc.data && typeof recalc.data.endBalance === "number") {
//       prevEndBalance = recalc.data.endBalance;
//     } else {
//       // fallback: fetch updated cashflow for endBalance
//       const updated = await db.cashFlow.findUnique({ where: { id: cashflowId }, select: { endBalance: true } });
//       prevEndBalance = updated.endBalance;
//     }

//     const currentCashflow = await db.cashFlow.findUnique({ 
//       where: { id: cashflowId } 
//     });

//     const subsequentCashflows = await db.cashFlow.findMany({
//       where: {
//         accountId: currentCashflow.accountId,
//         periodCashFlow: currentCashflow.periodCashFlow,
//         createdAt: { gt: currentCashflow.createdAt }
//       },
//       orderBy: { createdAt: "asc" }
//     });

//     for (const cfs of subsequentCashflows) {
//       recalc = await recalculateCashflowTotals(cfs.id, prevEndBalance);
//       prevEndBalance = recalc && recalc.data && typeof recalc.data.endBalance === "number"
//         ? recalc.data.endBalance
//         : (await db.cashFlow.findUnique({ where: { id: cfs.id }, select: { endBalance: true } })).endBalance;
//     }

//     return { success: true };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// }




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

    return;
  } catch (error) {
    console.error("Error archiving entity:", error);
    return { success: false, error: error.message || "Archiving failed" };
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
    console.log('User found:', user);

    const cfsId = cashflowId
    console.log('Cashflow IDs:', cfsId);

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
      throw new Error('Cashflow not found or unauthorized');
    }
        await archiveEntity({
          userId: user.id,
          accountId: cashflow.accountId,
          action: "deleteCashflowStatement",
          entityType: "CashflowStatement",
          entityId: cashflow.id,
          data: cashflow,
        });

    await db.cashFlow.delete({
      where: {
        id: cashflow.id,
      },
    });

    console.log('Cashflow deleted');
    revalidatePath('/CashflowStatement')

    return { success: true, message: "Cancelled creating Cashflow Statement"};
  } catch (error) {
    console.error('Error cancelling Cashflow creation:', error);
    return { success: false, error: error.message };
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


export async function udpateNetchange(cfsId, amount){
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

    const cashflow = await db.cashFlow.findUnique(
      { where: { id: cfsId } 
    });
    if (!cashflow) throw new Error("Cashflow not found.");

    const activityTotal = Array.isArray(cashflow.activityTotal)
      ? [...cashflow.activityTotal]
      : [0, 0, 0];

    activityTotal[0] = Number(newValue);

    const updated = await db.cashFlow.update({
      where: { id: cfsId },
      data: { activityTotal }
    });

    revalidatePath(`/CashflowStatement/${cashflow.accountId}/${cashflow.id}`);
    return { success: true, data: updated };
  } catch (error) {
    throw new Error("Error updating activity total")
  }
}

export async function updateTotalInvesting(cfsId, newValue) {
  try {
    const { userId } = await auth();
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user || user.role !== "STAFF") throw new Error("Unavailable action");

    const cashflow = await db.cashFlow.findUnique({ where: { id: cfsId } });
    if (!cashflow) throw new Error("Cashflow not found.");

    const activityTotal = Array.isArray(cashflow.activityTotal)
      ? [...cashflow.activityTotal]
      : [0, 0, 0];

    activityTotal[1] = Number(newValue);

    const updated = await db.cashFlow.update({
      where: { id: cfsId },
      data: { activityTotal }
    });

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
        where: { id: cfsId } 
      }
    );
    if (!cashflow) throw new Error("Cashflow not found.");



    const activityTotal = Array.isArray(cashflow.activityTotal)
      ? [...cashflow.activityTotal]
      : [0, 0, 0];

    activityTotal[2] = Number(newValue);

    const updated = await db.cashFlow.update({
      where: { id: cfsId },
      data: { 
        activityTotal
      }
    });

    revalidatePath(`/CashflowStatement/${cashflow.accountId}/${cashflow.id}`);
    return { success: true, data: updated };
  } catch (error) {
    throw new Error("Error updating activity total")
  }
}


export async function udpateBalanceQuick(cfsId, netChange, begBalance, endBal){
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



    
    revalidatePath(`/CashflowStatement/${cashflow.accountId}`);
    revalidatePath(`/CashflowStatement/${cashflow.accountId}/${cashflow.id}`);
    console.log("[4] Success udpate", updatedCashflowBalance)
    return { success: true}
  } catch (error) {
    console.log("Error quick balance update");
    return { success: false, error: error.message };
  }
}
