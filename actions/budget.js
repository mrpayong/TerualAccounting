"use server";
import {db} from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// export async function getCurrentBudget(accountId){ //for fetching current budget
//     console.log(" getCurrentBudget: identifying user...")
//     try {
//         const {userId} = await auth();
//         if (!userId) throw new Error("Unauthorized");

//         const user = await db.user.findUnique({
//             where: {clerkUserId: userId},
//         });

//         if (!user) {
//             throw new Error("User not found");
//         }

//         console.log("getCurrentBudget: user identified, calculating budget...")
//         // finding the budget
//         const budget = await db.budget.findFirst({
//             //finding the budget by userId, to find budget of a user
//             where: {
//                 userId: user.id,
//             },
//         });

     
//         // getting current month's expense
//         const currentDate = new Date();
//         const startOfMonth = new Date(
//             currentDate.getFullYear(),
//             currentDate.getMonth(),
//             1
//         );
//         const endOfMonth = new Date(
//             currentDate.getFullYear(),
//             currentDate.getMonth() +1,
//             0
//         );
   
     

       
//         // calculate all expenses
//         const expenses = await db.transaction.aggregate({
//             where: {
//                 userId: user.id,
//                 type: "EXPENSE",
//                 date:{
//                     gte: startOfMonth,
//                     lte: endOfMonth,
//                 },
//                 accountId,
//             }, 
//             _sum: {
//                 amount: true,
//             },
            
//         });

        
//         console.log("getCurrentBudget: remaining budget calculated.", expenses._sum)
//         // calculating with respect to budget
//         return {
//             budget: budget
//                 ? {...budget, amount: budget.amount.toNumber()}
//                 : null,

//             currentExpenses: expenses._sum.amount
//                 ? expenses._sum.amount.toNumber()
//                 : 0,
//         };
//     } catch (error) {
//         console.error("Error fetching budget:", error);
//         throw error;
//     }
// }

export async function getCurrentBudget(accountId) {
    try {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
  
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
  
      if (!user) {
        throw new Error("User not found");
      }
  
      const budget = await db.Budget.findFirst({
        where: {
          userId: user.id,
        },
      });
      console.log("User ID:", user.id, "Budget found:", budget);
      
      

    // Get current month's expenses
    const currentDate = new Date();
    const startOfMonth = new Date(Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      1,
      0, 0, 0, 0
    ));
    const endOfMonth = new Date(Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth() + 1,
      0,
      23, 59, 59, 999
    ));

      const expenses = await db.Transaction.aggregate({
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: {
            gte: startOfMonth.toISOString(),
            lte: endOfMonth.toISOString(),
          },
          accountId,
        }, 
        _sum: {
          amount: true}
      });
      console.info(expenses._sum, accountId, " getCurrBudget")
      console.log("Account ID:", accountId, "Transactions found:", expenses);
      console.log("Date range:", {
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString()
      });
      return {
        budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
        currentExpenses:expenses._sum.amount ? expenses._sum.amount.toNumber() : 0,
      };
    } catch (error) {
      console.error("Error fetching budget:", error);
      throw error;
    }
  }

// export async function updateBudget(amount){ //for updating the budget
//     try {
//         console.log("updateBudget: identifying user...");
//         const {userId} = await auth();
//         if (!userId) throw new Error("Unauthorized");

//         const user = await db.user.findUnique({
//             where: {clerkUserId: userId},
//         });

//         if (!user) {
//             throw new Error("User not found.");
//         }

//         // updating the budget. 
//         // 'upsert()' if there is no budget then will create.
//         // if there is then will update
//         const budget = await db.budget.upsert({
//             where: {
//                 userId: user.id,
//             },
            
//             update: {
//                 amount,
//             },
//             create: {
//                 userId: user.id,
//                 amount,
//             },
//         });
        
//         revalidatePath("/dashboard");
//         return { 
//             success: true,
//             date: {...budget, amount: budget.amount.toNumber()}, 
            
//         };
//     } catch (error) {
//         console.error("Error updating budget:", error);
//         return {success: false, error: error.message};
//     }
// }


export async function updateBudget(amount) {
    try {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
  
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
  
      if (!user) throw new Error("User not found");

      
      console.log("UPSERTING PLEASE WAIT...");
      // Update or create budget
      const budget = await db.Budget.upsert({
        where: {
          userId: user.id,
        },
        create: {
          userId: user.id,
          amount,
          lastAlertSent: new Date()
        },
        update: {
          amount,
        },
        
      });
      console.log(budget, " updateBudget");
      
  
      revalidatePath("/dashboard");
      return {
        success: true,
        data: { ...budget, amount: budget.amount.toNumber() },
      };
    } catch (error) {
      console.error("Error updating budget:", error);
      return { success: false, error };
    }
  }