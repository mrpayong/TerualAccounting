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

        const existingAccount = await db.account.findUnique({
            where: { name: data.name },
        });
         
        if (existingAccount) {
            throw new Error("Company name already exists.");
        }
        // Convert balance to float before save
       

        const account = await db.account.create({
            data: {
                ...data,
                userId: user.id,
            },
        });

        const serializedAccount = serializeTransaction(account);

        revalidatePath("/dashboard");
        return {success: true, data: serializedAccount};
    } catch (error) {
        throw new Error(error.message);
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