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

// export async function createTransaction(data) {
//     try {
//         const {userId} = await auth();
//         if(!userId) throw new Error("Unauthorized");

//         // arcjet to add rate limiting
//         const req = await request();

//         const decision = await aj.protect(req, {
//           userId,
//           requested: 1,
//         });

//         if (decision.isDenied()) {
//           if(decision.reason.isRateLimit()){
//             const {remaining, reset} = decision.reason;
//             console.error({
//               code: "RATE_LIMIT_EXCEEDED",
//               details: {
//                 remaining,
//                 resetInSeconds: reset,
//               },
//             });

//             throw new Error("Too many requests. Please try again later.");
//           }

//             throw new Error("Requested blocked.");
//         }

//         const user = await db.user.findUnique({
//             where: {clerkUserId: userId}, 
//         });

//         if(!user) {
//             throw new Error("User not found.");
//         }


//         console.log("initializing account to create transaction");
//         const account = await db.account.findUnique({
//             where: {
//                 id: data.accountId, //ID of account
//                 userId: user.id, //ID of user
//             },
//         });

//         if(!account){
//             throw new Error("Account not found.");
//         }
//         console.log("user info checked.")
        
//        // calculate balance change
//         console.log("Calculating initial balance");
//         const balanceChange = data.type === "EXPENSE"
//             ? -data.amount
//             : data.amount;
//         const newBalance = account.balance.toNumber() + balanceChange;
//         console.log("Initial balance calculated")

//         console.log("creating a new transaction...");
//         const transaction = await db.$transaction(async(tx) => {
//             const newTransaction = await tx.transaction.create({
//                 data: {
//                     ...data,
//                     userId: user.id,
//                     nextRecurringDate: //where the date will be assigned
//                         data.isRecurring && data.recurringInterval
//                             ? calculateNextRecurringDate(data.date, data.recurringInterval) //code to get date
//                             : null,
//                 },
//             });
//         console.log("New transaction created.");

//             console.log("updating balance in current account...")
//             await tx.account.update({
//                 where: { id: data.accountId },
//                 data: { balance: newBalance },
//             });

//             // await tx.account.update({
//             //     where: { id: data.accountId },
//             //     data: { balance: newBalance },
//             //   });
//             console.log("New balance updated.")

//             return newTransaction;
//         });
//         console.log("updated balance.")

//         revalidatePath("/dashboard");
//         revalidatePath(`/account/${transaction.accountId}`);

//         return {success: true, data: serializeAmount(transaction)};

//     } catch (error) {
//         console.error(error);   
//         throw new Error(error.message);
//     }
// }



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

      await tx.account.update({
        where: { id: data.accountId },
        data: { 
          // balance: newBalance 
        },
      });
      return newTransaction;
    });
 

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    console.error("Error creating transaction.",error.message)
    throw new Error(error.message);
    
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
    throw new Error("System: Failed to scan receipt");
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



// export async function getTransaction(id) {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//   });

//   if (!user) throw new Error("User not found");

//   const transaction = await db.transaction.findUnique({
//     where: {
//       id,
//       userId: user.id,
//     },
//   });

//   if (!transaction) throw new Error("Transaction not found");

//   return serializeAmount(transaction);
// }



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

    //calculate balance change
    // const oldBalanceChange = originalTransaction.type === "EXPENSE"
    //   ? -originalTransaction.amount.toNumber()
    //   : originalTransaction.amount.toNumber();

    // const newBalanceChange = data.type === "EXPENSE"
    //   ? -data.amount
    //   : data.amount ;

    // const netBalanceChange = newBalanceChange - oldBalanceChange;

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

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return {success: true, data: serializeAmount(transaction)};
  } catch (error) {
    throw new Error(error.message);
  }
}




// export async function updateTransaction(id, data) {
//   try {
//     const { userId } = await auth();
//     if (!userId) throw new Error("Unauthorized");

//     const user = await db.user.findUnique({
//       where: { clerkUserId: userId },
//     });

//     if (!user) throw new Error("User not found");

//     // Get original transaction to calculate balance change
//     const originalTransaction = await db.transaction.findUnique({
//       where: {
//         id,
//         userId: user.id,
//       },
//       include: {
//         account: true,
//       },
//     });

//     if (!originalTransaction) throw new Error("Transaction not found");

//     // Calculate balance changes
//     const oldBalanceChange =
//       originalTransaction.type === "EXPENSE"
//         ? -originalTransaction.amount.toNumber()
//         : originalTransaction.amount.toNumber();

//     const newBalanceChange =
//       data.type === "EXPENSE" ? -data.amount : data.amount;

//     const netBalanceChange = newBalanceChange - oldBalanceChange;

//     // Update transaction and account balance in a transaction
//     const transaction = await db.$transaction(async (tx) => {
//       const updated = await tx.transaction.update({
//         where: {
//           id,
//           userId: user.id,
//         },
//         data: {
//           ...data,
//           nextRecurringDate:
//             data.isRecurring && data.recurringInterval
//               ? calculateNextRecurringDate(data.date, data.recurringInterval)
//               : null,
//         },
//       });

//       // Update account balance
//       await tx.account.update({
//         where: { id: data.accountId },
//         data: {
//           balance: {
//             increment: netBalanceChange,
//           },
//         },
//       });

//       return updated;
//     });

//     revalidatePath("/dashboard");
//     revalidatePath(`/account/${data.accountId}`);

//     return { success: true, data: serializeAmount(transaction) };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// }

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
        Activity: true,
      }
    })
    console.log("[2] Fetched")
    console.log("[2]", transactions[0], "[...]")

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

        revalidatePath("/dashboard");
        revalidatePath("/account/[id]");

    console.log("[4] Update Success", updatedTransactions)
    return {success: true}
  } catch (error) {
    console.log("Error editing Activity Type.")
    throw new Error("Error editing Activity type", error.message)
  }
}

