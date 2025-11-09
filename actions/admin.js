"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { geolocation } from "@vercel/functions";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextRequest } from 'next/server'

class UnauthorizedError extends Error {
    constructor (message = "Unauthorized") {
        super(message);
        this.name = "Unauthorized Error";
    }
}

class DatabaseError extends Error {
    constructor(message = "Database Error"){
        super(message);
        this.name = "Database Error"
    }
}



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


async function activityLog({userId, action, args, timestamp}){
  try {
    const dateTime = formatManilaDateTime(timestamp);
    
    const log = await db.activityLog.create({
      data: {
        userId,
        action,
        meta: { args, timestamp: dateTime },
      },
    })
    return {status: 200, success: true}
  } catch (error) {
    // console.log("Activity Log Error[1]: ", error);
    // console.log("Activity Log Error Message: ", error.message);
    return {status: 500, success: false}
  }
}



// checks the user's role if admin
export async function getAdmin() {
    try {
        const {userId} = await auth();
        if (!userId) {
            throw new UnauthorizedError("[ADM]You are not a user. Notifying System Admin");
        }

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if (!user) {
            return {authorized: false, reason: "[ADM]You are not a user. Notifying System Admin"};
        }
        if (user.role !== "ADMIN") {
            return {authorized: false, reason: "[ADM]You are not an Admin. Notifying System Admin"};
        }

        return {authorized: true, data: user};
        
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            console.warn("[ADM]authenticate: ", error.message);
            return { authorized: false, reason: "[ADM]Now handling auth" }
        }
        if (error instanceof DatabaseError) {
            console.error("[ADM]Now handling database", error.message);
            return { authorized: false, reason: "[ADM]Now handling database"};
        }

        // Log unexpected errors and return a generic response
        console.error("[ADM]Unexpected error: ", error);
        return { authorized: false, reason: "[ADM]Unexpected error" };
    }

}

export async function getSysAdmin() {
    try {
        const {userId} = await auth();
        if (!userId) {
            throw new UnauthorizedError("[SYSA]You are not a user. Notifying System Admin");
        }

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if (!user) {
            return {authorized: false, reason: "[SYSA]You are not a user. Notifying System Admin"};
        }
        if (user.role !== "SYSADMIN") {
            return {authorized: false, reason: "[SYSA]You are not a System Admin. Notifying System admin."};
        }

        return {authorized: true};
        
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            console.warn("[SYSA]authenticate: ", error.message);
            return { authorized: false, reason: "Now handling auth" }
        }
        if (error instanceof DatabaseError) {
            console.error("[SYSA]Now handling database", error.message);
            return { authorized: false, reason: "Now handling database"};
        }

        // Log unexpected errors and return a generic response
        console.error("[SYSA]Expected error: ", error);
        return { authorized: false, reason: "Expected error" };
    }
        
}


// export async function activityLog({ action, args, result, timestamp }) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//         throw new UnauthorizedError("Unauthorized");
//     }


//     const user = await db.user.findUnique({
//       where: { clerkUserId: userId },
//     });

//     if (
//       action &&
//       action.toLowerCase().startsWith("delete") &&
//       args &&
//       args.dataToArchive // You must pass the data to archive as args.dataToArchive from your delete server action
//     ) {
//       await createArchiveData({
//         userId: user.id,
//         action,
//         data: args.dataToArchive,
//         reason: args.reason || null,
//         actionSource: args.actionSource || null,
//         relatedIds: args.relatedIds || null,
//       });
//     }

//     const activity = await db.activityLog.create({
//       data: {
//         userId: user.id,
//         action,
//         meta: { args, result, timestamp },
//       },
//     });
   



//     return { success: true };
//   } catch (error) {
//     console.error("Activity log error:", error);
//     return { success: false, error: "Error logging activity" };
//   }
// }

export async function getActivityLogs() {
    try {
        const {userId} = await auth();
        if (!userId) {
            throw new UnauthorizedError("Unauthorized user.")
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
        if (!user) {
        return { success: false, error: "User not found." };
        }
        if (user.role !== "ADMIN") {
        return { success: false, error: "Access denied. Only ADMIN can view activity logs." };
        }

        const activityLogs = await db.activityLog.findMany({
            include: {
                user:{
                    select: {
                        Fname: true,
                        Lname: true,
                        email: true,
                    }
                }
            },
            orderBy: {createdAt: "desc"},
            take: 200, // limit for performance 
        })

        
        return {
            success: true,
            data: activityLogs
        }
    } catch (error) {
        console.error("Error retrieving activity logs:", error);
        return {
            success: false,
            error: "An unexpected error occurred while retrieving activity logs.",
        };
    }
}

export async function getStaff() {
    try {
        const {userId} = await auth();
        if (!userId) {
            throw new UnauthorizedError("[STF]You are not a user. Notifying System Admin");
        }

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if (!user) {
            return {authorized: false, reason: "[STF]You are not a user. Notifying System Admin"};
        }
        if (user.role !== "STAFF") {
            console.error("YOU ARE AN UNAUTHORIZED USER.", user)
            return {authorized: false, reason: "[STF]You are not a Staff. Notifying System Admin"};
        }

        return {authorized: true, data: user};
        
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            console.warn("[STF]Unknown User: ", error.message);
            return { authorized: false, reason: "[STF]Unknown User..." }
        }
        if (error instanceof DatabaseError) {
            console.error("[STF]Not a user: ", error.message);
            return { authorized: false, reason: "[STF]Not a user"};
        }

        // Log unexpected errors and return a generic response
        console.error("[STF]Unexpected error: ", error);
        return { authorized: false, reason: "[STF]Unexpected error" };
    }
}

export async function getUnauthUser() {
    const {userId} = await auth();

    if (!userId) {
        // test by removing "!" in the condition above
        const headersList = await headers();
        const ip = JSON.stringify(headersList.get('x-forwarded-for')) || 'Unknown IP'
        
        const city = headersList.get('X-Vercel-IP-City') || headersList.get('X-Vercel-IP-City'.toLowerCase());
        const country = JSON.stringify(headersList.get('X-Vercel-IP-Country'));
        const latitude = JSON.stringify(headersList.get('x-vercel-ip-latitude'));
        const longitude = JSON.stringify(headersList.get('x-vercel-ip-longitude'));
        
        const metaData = JSON.stringify({
            message: "Unauthorized user attempting to access a prohibited pagesss.",
            ip_Add: ip,
            city: city,
            country: country,
            latitude:latitude,
            longitude:longitude
        })
        await db.unauthz.create({
        data: {  
            IP: ip,
            action:"getUnauthUser",
            meta: metaData,
            }
        })
        return { authorized: false, reason: "Non-user attempting to access prohibited page" };
    }

    const user = await db.user.findUnique({
        where: {clerkUserId:userId},
    });

    await activityLog({
        action: "getUnauthUser",
        args: { attemptedUserId: userId, data: user },
        result: {
            message: "User attempting to access prohibited page."
        },
        timestamp: new Date().toISOString(),
    });

    if (!user) {
        return {authorized: false, reason: "Non-user attempting access."};
    }
    if (user.role) {
        return {authorized: false, data: user, reason: "User accessing possible prohibited page."};
    }
    return {authorized: false}; 
}



function formatToPhilippinesTime(isoString) {
  const date = new Date(isoString);

  // Get time in Asia/Manila
  const time = date.toLocaleTimeString('en-PH', {
    timeZone: 'Asia/Manila',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Get date in Asia/Manila
  const [month, day, year] = date.toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/');

  // Format as "HH:mm:ss yyyy-MM-dd"
  return `${time} ${year}-${month}-${day}`;
}

export async function UserSessionLogging({action, args, timestamp}) {
    try {
        if (!action || !args) {
            throw new UnauthorizedError("No actual session ongoing, secure database now.");
        }
        const user = await db.user.findUnique({
            where: { clerkUserId: args.clerkUserId },
        });

        
        const localizedTimestamp = formatToPhilippinesTime(timestamp);

        
        const activity = await db.activityLog.create({
            data: {
                userId: user.id,
                action,
                meta: { args, localizedTimestamp },
            },
        });
        
        if (!activity) {
            throw new Error("Failed to log user session.");
        }
        return { success: true, message: "User session logging success." };
    } catch (error) {
        console.log("User session logging error:", error);
        return { success: false, error: "Error logging user session" };
    }
}

export async function getWebhookSessions() {
    try {
        const {userId} = await auth();
        if (!userId) {
            throw new UnauthorizedError("Unauthorized user.")
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
        if (!user) {
        return { success: false, error: "User not found." };
        }
        if (!user || user.role !== "SYSADMIN") {
        return { success: false, error: "Access denied. Only SYSADMIN can view session logs." };
        }

        const allowedActions = ["SESSION-CREATED", "SESSION-REMOVED", "EMAIL-CREATED"];

        const sessionLogs = await db.activityLog.findMany({
            where: {
                action: { in: allowedActions }
            },
            include: {
                user:{
                    select: {
                        Fname: true,
                        Lname: true,
                        email: true,
                    },
                }
            },
            orderBy: {createdAt: "desc"},
            take: 100,
        })

        return {
            success: true,
            data: sessionLogs
        }
    } catch (error) {
        console.error("Error retrieving activity logs:", error);
        return {
            success: false,
            error: "An unexpected error occurred while retrieving activity logs.",
        };
    }
}

export async function getAccounts() {
    try {
        const {userId} = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if (!user) {
            throw new Error("User not Found");
        }
        if (!user.role === "ADMIN") {
            throw new Error("Unavailable data.");
        }


        const accounts = await db.account.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        Fname: true,
                        Lname: true,
                        role: true,
                    }
                },
                _count: {
                    select: { transactions: true }
                }
            },
            orderBy: {
                createdAt: 'desc', 
            },
        })

        return {success: true, data: accounts}
    } catch (error) {
        console.error('Error fetching accounts:', error)
        throw new Error("Error getting data.")
    }
}

export async function getCountActLogs() {
    try {
        const {userId} = await auth();
        if (!userId) {
            throw new UnauthorizedError("Unauthorized user.")
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
        if (!user) {
        return { success: false, error: "User not found." };
        }
        if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Access denied. Only ADMIN can view activity logs." };
        }

        
        const activityLogs = await db.activityLog.findMany({
            include: {
                user: true
            },
        })

        const activityCount = activityLogs.length;
        return {
            success: true,
            data: activityCount
        }
    } catch (error) {
        console.error("Error retrieving activity logs:", error);
        return {
            success: false,
            error: "An unexpected error occurred while retrieving activity logs.",
        };
    }
}

export async function getCountCFS() {
    try {
        const {userId} = await auth();
        if (!userId) {
            throw new UnauthorizedError("Unauthorized user.")
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
        if (!user) {
        return { success: false, error: "User not found." };
        }
        if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Access denied. Only ADMIN can view activity logs." };
        }

        
        const activityLogs = await db.cashFlow.findMany({
            include: {
                user: true
            },
        })

        const activityCount = activityLogs.length;
        return {
            success: true,
            data: activityCount
        }
    } catch (error) {
        console.error("Error retrieving CFS count:", error);
        return {
            success: false,
            error: "An unexpected error occurred while retrieving CFS count.",
        };
    }
}

export async function getCountUsers() {
    try {
        const {userId} = await auth();
        if (!userId) {
            throw new UnauthorizedError("Unauthorized user.")
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
        if (!user) {
        return { success: false, error: "User not found." };
        }
        if (user.role !== "ADMIN" && user.role !== "SYSADMIN") {
        return { success: false, error: "Access denied. Only ADMIN can view activity logs." };
        }

        
        const activityLogs = await db.User.count()


        return {
            success: true,
            data: activityLogs
        }
    } catch (error) {
        console.error("Error retrieving activity logs:", error);
        return {
            success: false,
            error: "An unexpected error occurred while retrieving activity logs.",
        };
    }
}

export async function getCountTransactions() {
    try {
        const {userId} = await auth();
        if (!userId) {
            throw new UnauthorizedError("Unauthorized user.")
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
        if (!user) {
        return { success: false, error: "User not found." };
        }
        if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Access denied. Only ADMIN can view activity logs." };
        }

        
        const activityLogs = await db.Transaction.count()

        return {
            success: true,
            data: activityLogs
        }
    } catch (error) {
        console.error("Error retrieving activity logs:", error);
        return {
            success: false,
            error: "An unexpected error occurred while retrieving activity logs.",
        };
    }
}



export async function getUserAccount() {
    try {
        const {userId} = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if (!user) {
            throw new Error("User not Found");
        }
        if (user.role !== "ADMIN") {
            throw new Error("Unavailable data.");
        }

        //to find acc
        const accounts = await db.account.findMany({
            orderBy: { createdAt: "desc" }, //order by descending to when the acc is created
            include: { //include the count of all transacs
                _count: {   
                    select: {
                        transactions: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        Fname: true,
                        Lname: true,
                        role: true,
                    }
                },
            },
        });

        const serializedAccount = accounts.map(serializeTransaction); //for every transac, serializeTransaction function will run

        return {success: true, data: serializedAccount}; 
        // return serializedAccount;
    } catch (error) {
        console.error("Data is unavailable. Query failed.")
        return new Response("Data is unavailable. Query failed.", { status: 500 });
    }
}


export async function getUserRoleCounts() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { role: true }
    });
    if(!user){
        return { success: false, error: "Data Unavailable." };
    }
    if (user.role !== "SYSADMIN") {
      return { success: false, error: "Access denied." };
    }

    const UserRoleCount = await db.user.findMany({
        select: {
            role:  true,
            id: true,
        }
    })

    const roles = ["USER", "ADMIN", "STAFF", "SYSADMIN"];
    const counts = roles.reduce((acc, role) => {
      acc[role] = UserRoleCount.filter(u => u.role === role).length;
      return acc;
    }, { ADMIN: 0, STAFF: 0, SYSADMIN: 0 });

    return { success: true, data: counts };
  } catch (error) {
    console.error("Error fetching user role counts:", error);
    return { success: false, error: "Unable to fetch user role statistics at this time." };
  }
}



export async function getMonthlyActivityLogs() {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new UnauthorizedError("Unauthorized user.");
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
        if (!user) {
            return { success: false, error: "User not found." };
        }
        if (user.role !== "SYSADMIN") {
            return { success: false, error: "Unavailable data." };
        }

        // Calculate the start of this current week(if june 30, this logic take 
        // the current day and count back to know the start of this week)
        const now = new Date();
        const MS_IN_WEEK = 7 * 24 * 60 * 60 * 1000; //compute milliseconds in one week

    // Get start of the current week (Sunday)
        const getStartOfWeek = (now) => {
            const day = now.getDay(); // 0 = Sunday, 6 = Saturday
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);
            start.setDate(now.getDate() - day);
            
            return start;
        };

        const startOfCurrentWeek = getStartOfWeek(now);
        const startOfWeek1 = new Date(startOfCurrentWeek.getTime() - 7 * MS_IN_WEEK);

        // Fetch relevant logs
        const logs = await db.activityLog.findMany({
            where: {
                createdAt: {
                gte: startOfWeek1,
                lte: now,
                },
            },
            select: {
                createdAt: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

    // Initialize result with 8 weeks
    const weekData = Array.from({ length: 8 }, (_, i) => ({
      week: `Week ${i + 1}`,
      count: 0,
    }));

    for (const log of logs) {
      const logDate = new Date(log.createdAt);
      const diffMs = startOfCurrentWeek.getTime() - getStartOfWeek(logDate).getTime();
      const weekDiff = Math.floor(diffMs / MS_IN_WEEK);
      const weekIndex = 7 - weekDiff; // reverse order (Week 1 = oldest)



      if (weekIndex >= 0 && weekIndex < 8) {
        weekData[weekIndex].count += 1;
      }
    }

    return { success: true, data: weekData }
    } catch (error) {
        console.error("Error retrieving activity logs:", error);
        return {
            success: false,
            error: "An unexpected error occurred while retrieving activity logs.",
        };
    }
}

export async function getArchives(accountId){
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new UnauthorizedError("Unauthorized");
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
        if(!user){
            return { success: false, error: "Data Unavailable." };
        }
        if(user.role !== "STAFF"){
            return { success: false, error: "Data Unavailable." };
        }

        const today = new Date();
        const DateNinety = new Date();
        DateNinety.setDate(today.getDate() - 90);


        const archives = await db.archive.findMany({
            where:{ 
                userId: user.id,
                accountId: accountId,
                createdAt:{
                    gte: DateNinety,
                    lte: today,
                },
                entityType: {
                    in: ["CashflowStatement", "Transaction", "Group Transaction"]
                }
            },
            orderBy: {
                createdAt: "desc",
            }
        });

        
        return {success: true, code:200, data: archives};
    } catch (error) {
        console.log("Error returning data", error.message)
        return {
            success: false,
            code: 404,
            message: "An unexpected error occurred while retrieving archives.",
        };
    }
}


export async function getIntruder(){
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new UnauthorizedError("Unauthorized");
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
        if(!user){
            return { success: false, error: "Data Unavailable." };
        }
        if(user.role !== "SYSADMIN"){
            return { success: false, error: "Data Unavailable." };
        }



        const Unauthz = await db.Unauthz.findMany({
            select: {
                IP: true,
                action:true,
                meta: true,
                createdAt:true,
            }
        });

        
        return {success: true, code:200, data: Unauthz};
    } catch (error) {
        console.log("Error returning data", error.message)
        return {
            success: false,
            code: 404,
            message: "An unexpected error occurred while retrieving archives.",
        };
    }
}







