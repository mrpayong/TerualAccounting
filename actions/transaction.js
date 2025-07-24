"use server";
import aj from "@/lib/arcjet";
import { ValidationError } from "@/lib/errors";
import { db } from "@/lib/prisma";
import { request }  from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
    ...obj,
    amount: obj.amount.toNumber(),
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


export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }
    if (user.role !== "STAFF"){
      throw new Error("Unauthorized action.")
    }



    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    const existingTransaction = await db.transaction.findUnique({
      where: { refNumber: data.refNumber },
    });
    if (existingTransaction) {
      throw new Error("Reference number already exists.");
    }

    

    // Calculate new balance
    // const balanceChange = data.type === "EXPENSE" 
    //   ? -data.amount 
    //   : data.amount;
    // const newBalance = Number(account.balance) + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? null
              :  calculateNextRecurringDate(data.date, data.recurringInterval)
        },
      });


      return newTransaction;
    });
 
     const updateLog = await activityLog({
      userId: user.id,
      action: "createTransaction",
      args: transaction,
      timestamp: new Date()
    });
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "createTransaction",
          meta: { message: "Possible System interruption: Failed to log Created Transaction" },
        }
      })
    }

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);
    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    console.error("Error creating transaction.",error.message)
    throw new Error("!");
    
  }
}

function calculateNextRecurringDate(startDate, interval) {
    const date = new Date(startDate);   
// helper function to calculate for next recurring date
    switch (interval) {
        case "DAILY":
            date.setDate(date.getDate() + 1);
            break;
        case "WEEKLY":
            date.setDate(date.getDate() + 7);
            break;
        case "MONTHLY":
            date.setMonth(date.getMonth() + 1);
            break;
        case "YEARLY":
            date.setFullYear(date.getFullYear() + 1);
            break;
    }

    return date;
}

export async function scanReceipt(file){
  try {
    console.log("[1]")
    const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

    // converts file into ArrayBuffer
    console.log("IN BACKEND SCANNING: ", file)
    const arrayBuffer = await file.arrayBuffer();
    
    // convert arrayBuffer to base64
    console.log("[2]")
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
        - Total amount (just the number)
        - Date (in ISO format)
        - Description or items purchased (brief summary)
        - Merchant/store name
        - reference number
        - suggest the type of transaction
        - suggested type of transaction (one of: EXPENSE, INCOME)
        - suggest the Activity type of transaction
        - suggested Activity of transaction (one of: OPERATION, INVESTEMENT, FINANCING)
        - suggest a particular name for the purpose of the transaction, this is for the recording in the Cash Receipt Book or Disbursement Book.
        - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal care,travel,insurance,gifts,bills,other-expense )
        - Include travel route in receipt of Transportation 
        - BIR Authority to Print number, this is a mandatory requirement.
        
        Only respond with valid JSON in this exact format:
        {
          "amount": number,
          "refNumber": "string",
          "date": "ISO date string",
          "description": "string",
          "merchantName": "string",
          "category": "string"
          "particular": "string"
          "type": "string"
          "Activity": "string"
          "printNumber": "string
        }

     
        If it's not a receipt, return an empty object`;

        console.log("[3]")
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      }, 
      prompt,
    ]);
console.log("[4]")
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    

console.log("[5]")
      const data = JSON.parse(cleanedText);
      console.log("Parsed data:", data);
      if (!data.printNumber || data.printNumber.trim() === "") {
        throw new ValidationError("System: No BIR Authority to Print number detected.");
      }

console.log("[6]")

    const updateLog = await activityLog({
      userId: user.id || "Authorized User",
      action: "scanReceipt",
      args: data,
      timestamp: new Date()
    });
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "scanReceipt",
          meta: { message: "Possible System interruption: Failed to log Scanned Receipt" },
        }
      })
    }
      return{
        amount: parseFloat(data.amount),
        refNumber: data.refNumber,
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
        particular: data.particular,
        type: data.type,
        Activity: data.Activity,
        printNumber: data.printNumber,
      }
    
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error("Validation Error:", error.message);
      throw error; // Re-throw the custom error
    }
    console.error("Error scanning the receipt:", error.message);
    throw new Error("!");
  }
}


export async function getTransaction(id) {
  const {userId} = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {clerkUserId: userId},
  });

  if(!user) throw new Error("User not found");
  

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,

    }
  });
  
  console.log(transaction)
  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}




export async function updateTransaction(id, data) {
  try {
    const {userId} = await auth();
    if (!userId) throw new Error("Unauthorized");
  
    const user = await db.user.findUnique({
      where: {clerkUserId: userId},
    });
  
    if(!user) throw new Error("User not found");

    if (user.role !== "STAFF"){
      throw new Error("Action unavailable.")
    }


    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: { account: true },
    });

    if (!originalTransaction) throw new Error("Transaction not found.");
  


    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id
        },
        data: {
          ...data, 
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? null
              : calculateNextRecurringDate(data.date, data.recurringInterval)
        },
      });

      //update account balance
      // await tx.account.update({
      //   where: {id: data.accountId},
      //   data: {
      //     // balance: {
      //     //   increment: netBalanceChange,
      //     // },
      //   },
      // });

      return updated;
    });

    const updateLog = await activityLog({
      userId: user.id,
      action: "updateTransaction",
      args:{
        account_ID: data.accountId,
        oldData: originalTransaction,
        newData: transaction
      },
      timestamp: new Date()
    });
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "updateTransaction",
          meta: { message: "Possible System interruption: Failed to log Edited Transaction." },
        }
      })
    }


    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return {success: true, data: serializeAmount(transaction)};
  } catch (error) {
    console.log("Error update transaction: ", error)
    console.log("Error update transaction: ", error.message)
    throw new Error("!");
  }
}

export async function updateManyTransaction(transactionIds, ActivityType){
  try {
    console.log("[1] Auth")
    const {userId} = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {clerkUserId: userId}
    })

    if (!user){
      throw new Error("Action unavailable.")
    }
    if(user.role !== "STAFF"){
      throw new Error("Action unavailable.")
    }


    console.log("[1] Auth passed")
    console.log(transactionIds, ActivityType)
    console.log("[2] Fetch transactions")
    const transactions = await db.transaction.findMany({
      where: {
          id: { in: transactionIds},
          userId: user.id,
      },
      select:{
        id: true,
        accountId: true,
        refNumber: true,
        Activity: true,
      }
    })
    console.log("[2] Fetched")

    console.log("[3] Update Method")
    const updatedTransactions = await db.transaction.updateMany({
      where: {
        id: { in: transactionIds}, // Array of transaction IDs to update
        userId: user.id,
      },
      data: {
        Activity: ActivityType, // The new value for the Activity field
      },
    });

    for (const transaction of transactions) {
      const updateLog = await activityLog({
        userId: user.id,
        action: "updateManyTransaction",
        args: {
          refNumber: transaction.refNumber,
          account_ID: transaction.accountId,
          oldActivity: transaction.Activity,
          newActivity: ActivityType,
        },
        timestamp: new Date()
      });
      if(updateLog.success === false){
        await db.activityLog.create({
          data: {
            userId: user.id,
            action: "updateManyTransaction",
            meta: { message: `Possible System interruption: Failed to log Edited Activity Type of Transaction.` },
          }
        })
      }
    }

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transactions[0].accountId}`);

    console.log("[4] Update Success", updatedTransactions)
    return {success: true}
  } catch (error) {
    console.log("Error editing Activity Type.", error.message)
    throw new Error("!")
  }
}

