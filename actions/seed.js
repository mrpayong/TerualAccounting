"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";

const ACCOUNT_ID = "7534306e-5c41-4db9-9abc-9ecadb014d48";
const USER_ID = "0e59c147-d65c-4dd4-b651-2047939fdb29";

// Categories with their typical amount ranges 
const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] }, 
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] }, 
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};

// Helper to generate random amount within a range
function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// Helper to get random category with amount
function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

// Helper to get random activity type
function getRandomActivityType() {
  const activityTypes = ["OPERATION", "INVESTMENT", "FINANCING"];
  return activityTypes[Math.floor(Math.random() * activityTypes.length)];
}

function generateRefNumber(index, date) {
  const randomNumber = Math.floor(Math.random() * (999 - 100) + 100); // Generate a random number between 84756 and 100000
  // const randomSuffix = String(index).padStart(3, "0"); // Ensure a 3-digit suffix
  const randomNumber2 = Math.floor(Math.random() * (999 - 100) + 100); // Generate a random number between 84756 and 100000
  const randomNumber3 = Math.floor(Math.random() * (9 - 1) + 1); // Generate a random number between 84756 and 100000
  return `${randomNumber}${randomNumber2}${randomNumber3}`;
}

function generatePrintNumber(index, date) {
  const randomNumber = Math.floor(Math.random() * (99 - 100000000) + 100000000); 
  return `${randomNumber}`;
}

export async function seedTransactions() {
  try {
    // Generate 90 days of transactions
    const transactions = [];
    let totalBalance = 0;

    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);

      // Generate 1-3 transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        // 40% chance of income, 60% chance of expense
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);
        const activity = getRandomActivityType(); // Get random activity type
        const refNumber = generateRefNumber();
        const printNumber = generatePrintNumber();


        const transaction = {
          id: crypto.randomUUID(),
          type,
          amount,
          description: `${
            type === "INCOME" ? "Received" : "Paid for"
          } ${category}`,
          date,
          category,
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: date,
          updatedAt: date,
          Activity: activity,
          refNumber,
          printNumber,
        };

        totalBalance += type === "INCOME" ? amount : -amount;
        transactions.push(transaction);
      }
    }

    // Insert transactions in batches and update account balance
    await db.$transaction(async (tx) => {
      // Clear existing transactions
      await tx.transaction.deleteMany({
        where: { accountId: ACCOUNT_ID },
      });

      // Insert new transactions
      await tx.transaction.createMany({
        data: transactions,
      });
    });

    return {
      success: true,
      message: `Created ${transactions.length} transactions`,
    };
  } catch (error) {
    console.error("Error seeding transactions:", error.message);
    return { success: false, error: error.message };
  }
}