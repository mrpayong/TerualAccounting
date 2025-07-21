"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

      console.log("creating method active...")
      const newTask = await db.Task.create({
        data: {
          ...data,
          userId: user.id,
        },
      });

      revalidatePath("/DecisionSupport");
    return { success: true, data: newTask };
  } catch (error) {
    console.error(error.message)
    throw new Error(error.message);
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
        console.log("User found:", user);

        // fetching all transactions
        const Task = await db.Task.findMany({
            where: {
                id: { in: TaskIds},
                userId: user.id,
            },
        });
            console.log("Fetched Task:", Task);


        await db.$transaction(async (tx) => {
           
            await tx.Task.deleteMany({
                where: {
                    id: {in: TaskIds},
                    userId: user.id,
                },
            });

            console.log("Transactions deleted");
        });
        

        revalidatePath("/DecisionSupport");
        return {success: true};
    } catch (error) {
     console.error("Error in bulkDeleteTransactions:", error);
        return {success: false, error: error.message};
    }
}