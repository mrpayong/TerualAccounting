"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = {...obj};

    if (obj.balance) {
        serialized.balance = obj.balance.toNumber();
    }

    if (obj.amount) {
        serialized.amount = obj.amount.toNumber();
    }

    return serialized;
};

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


//action for creating account
export async function createAccount(data) {
    try {
        const {userId} = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if (!user) {
            throw new Error("User not Found");
        }
        if(user.role != "STAFF"){
            throw new Error("Unavailable action.")
        }
        const existingAccount = await db.account.findUnique({
            where: { name: data.name },
        });
         
        if (existingAccount) {
            return {success: false, code:401, message:"Account name already exists."}
        }
        // Convert balance to float before save
       

        const account = await db.account.create({
            data: {
                ...data,
                userId: user.id,
            },
        });


        const serializedAccount = serializeTransaction(account);

        const updateLog = await activityLog({
        userId: user.id,
        action: "createAccount",
        args: account,
        timestamp: new Date()
        });
        if(updateLog.success === false){
        await db.activityLog.create({
            data: {
            userId: user.id,
            action: "createAccount",
            meta: { message: "Possible System interuption: Failed to log Created Account" },
            }
        })
        }

        revalidatePath("/dashboard");
        return {code:200, success: true, data: serializedAccount};
    } catch (error) {
        console.log("Error creating account: ", error)
        console.log("error message:", error.message)
        return {code:500, success: false};
    }
}


//get user account server action
export async function getUserAccounts() {
    const {userId} = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {clerkUserId: userId},
    });

    if (!user) {
        throw new Error("User not Found");
    }


    //to find acc
    const accounts = await db.account.findMany({                                            
        where: {userId: user.id }, //find acc that belongs to a user
        orderBy: { createdAt: "desc" }, //order by descending to when the acc is created
        include: { //include the count of all transacs
            _count: {   
                select: {
                    transactions: true,
                },
            },
        },
    });

    const serializedAccount = accounts.map(serializeTransaction); //for every transac, serializeTransaction function will run

    return serializedAccount; 
}

export async function getDashboardData() {
    const {userId} = await auth();
    if (!userId) throw new Error ("Unauthorized");

    const user = await db.user.findUnique({
        where: {clerkUserId: userId},
    });

    if (!user) {
        throw new Error ("User not found.");
    }

    // Get all user transactions
    const transactions = await db.transaction.findMany({
        where: {userId: user.id},
        orderBy: {date: "desc"},
    });


    return transactions.map(serializeTransaction);
}