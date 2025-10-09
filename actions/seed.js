"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";

const ACCOUNT_ID = "eeb76e30-ec63-419c-b2f0-f596a1bbf1df";
const USER_ID = "eeb76e30-ec63-419c-b2f0-f596a1bbf1df";

// Categories with their typical amount ranges 
// const CATEGORIES = {
//   INCOME: [
//     { name: "salary", range: [5000, 8000] },
//     { name: "freelance", range: [1000, 3000] },
//     { name: "investments", range: [500, 2000] },
//     { name: "other-income", range: [100, 1000] }, 
//   ],
//   EXPENSE: [
//     { name: "housing", range: [1000, 2000] },
//     { name: "transportation", range: [100, 500] },
//     { name: "groceries", range: [200, 600] },
//     { name: "utilities", range: [100, 300] },
//     { name: "entertainment", range: [50, 200] },
//     { name: "food", range: [50, 150] },
//     { name: "shopping", range: [100, 500] },
//     { name: "healthcare", range: [100, 1000] }, 
//     { name: "education", range: [200, 1000] },
//     { name: "travel", range: [500, 2000] },
//   ],
// };


// Construction-ready categories and realistic ranges (PHP)
const CATEGORIES = {
  INCOME: [
    { name: "wedding-shoot", range: [15000, 80000] },
    { name: "pre-nup-shoot", range: [8000, 30000] },
    { name: "corporate-event-shoot", range: [10000, 50000] },
    { name: "portrait-session", range: [2000, 15000] },
    { name: "product-photography", range: [3000, 20000] },
    { name: "freelance-gig", range: [2000, 15000] },
    { name: "stock-photo-sales", range: [500, 5000] },
    { name: "video-shoot", range: [10000, 40000] },
    { name: "social-media-content-shoot", range: [3000, 15000] },
    { name: "other-service-income", range: [1000, 10000] },
  ],

  EXPENSE: [
    // Operating
    { name: "transportation", range: [500, 5000] },
    { name: "meals-and-snacks", range: [200, 2000] },
    { name: "utilities", range: [500, 3000] },
    { name: "internet", range: [1000, 3000] },
    { name: "printing-and-albums", range: [1000, 10000] },
    { name: "props-and-backdrops", range: [500, 5000] },
    { name: "software-subscriptions", range: [500, 2500] }, // Adobe, Lightroom
    { name: "marketing-and-ads", range: [500, 8000] },
    { name: "office-supplies", range: [200, 2000] },

    // Financing
    { name: "loan-repayment", range: [2000, 15000] },
    { name: "interest-expense", range: [500, 3000] },

    // Investing (CAPEX)
    { name: "camera-purchase", range: [30000, 120000] },
    { name: "lens-purchase", range: [20000, 80000] },
    { name: "lighting-equipment", range: [5000, 30000] },
    { name: "laptop-or-pc-upgrade", range: [20000, 80000] },
    { name: "studio-rental-or-renovation", range: [10000, 50000] },
  ],
};


const CATEGORY_ACTIVITY = {
  // Income
  "wedding-shoot": "OPERATION",
  "pre-nup-shoot": "OPERATION",
  "corporate-event-shoot": "OPERATION",
  "portrait-session": "OPERATION",
  "product-photography": "OPERATION",
  "freelance-gig": "OPERATION",
  "stock-photo-sales": "OPERATION",
  "video-shoot": "OPERATION",
  "social-media-content-shoot": "OPERATION",
  "other-service-income": "OPERATION",

  // Expenses (Operating)
  "transportation": "OPERATION",
  "meals-and-snacks": "OPERATION",
  "utilities": "OPERATION",
  "internet": "OPERATION",
  "printing-and-albums": "OPERATION",
  "props-and-backdrops": "OPERATION",
  "software-subscriptions": "OPERATION",
  "marketing-and-ads": "OPERATION",
  "office-supplies": "OPERATION",

  // Expenses (Financing)
  "loan-repayment": "FINANCING",
  "interest-expense": "FINANCING",

  // Expenses (Investing)
  "camera-purchase": "INVESTMENT",
  "lens-purchase": "INVESTMENT",
  "lighting-equipment": "INVESTMENT",
  "laptop-or-pc-upgrade": "INVESTMENT",
  "studio-rental-or-renovation": "INVESTMENT",
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
function getRandomActivityType(category) {
  // const activityTypes = ["OPERATION", "INVESTMENT", "FINANCING"];
  // return activityTypes[Math.floor(Math.random() * activityTypes.length)];
  return CATEGORY_ACTIVITY[category] || "OPERATION";
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

function getMidnightDate(baseDate) {
  const d = new Date(baseDate);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function seedTransactions() {
  try {
    const START_DATE = new Date("2020-01-01T00:00:00");
    const today = getMidnightDate(new Date());
    const daysBetween = Math.floor((today - START_DATE)/(1000 * 60 * 60 * 24));
    // Generate 90 days of transactions
    const transactions = [];
    let totalBalance = 0;

    for (let i = daysBetween; i >= 0; i--) {
      const date = getMidnightDate(subDays(today, i));

      // Generate 1-3 transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        // 40% chance of income, 60% chance of expense
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);
        const activity = getRandomActivityType(category); // Get random activity type
        const refNumber = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${j}${crypto.randomUUID().slice(0, 6)}`;
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
    console.log("Error seeding transactions:", error.message, error);
    return { success: false, error: error.message };
  }
}