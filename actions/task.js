"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


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


export async function createTasking(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found.");
    }
    if(user.role !== "ADMIN"){
      throw new Error("Unavailable action.")
    }

    console.log("creating method active...")
    const newTask = await db.Task.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    const updateLog = await activityLog({
      userId: user.id,
      action: "createTasking",
      args: newTask,
      timestamp: new Date()
    });
    if(updateLog.success === false){
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: "createTasking",
          meta: { message: "Possible System interruption: Failed to log created Task." },
        }
      })
    }

      revalidatePath("/DecisionSupport");
    return { success: true, data: newTask };
  } catch (error) {
    console.error(error.message)
    throw new Error("!");
  }
}

export async function getTask() {
  const {userId} = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {clerkUserId: userId},
  });

  if(!user) throw new Error("User not found");
  

  const Task = await db.Task.findMany({
    where: { userId: user.id },
  });
  
  if (!Task) throw new Error("Task not found.");

  return Task;
}

export async function bulkDeleteTask(TaskIds) {
    try {
        const {userId} = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if (!user) {
            throw new Error("User not Found");
        }
        if(user.role !== "ADMIN"){
          throw new Error("Unavailable action.")
        }

        // fetching all transactions
        const Task = await db.Task.findMany({
            where: {
                id: { in: TaskIds},
                userId: user.id,
            },
        });
        await db.Task.deleteMany({
            where: {
                id: {in: TaskIds},
                userId: user.id,
            },
        });
        revalidatePath("/DecisionSupport");
        return {success: true};
    } catch (error) {
     console.error("Error in bulkDeleteTransactions:", error);
     throw new Error("!")
    }
}