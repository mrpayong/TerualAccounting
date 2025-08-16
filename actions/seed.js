"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";

const ACCOUNT_ID = "7534306e-5c41-4db9-9abc-9ecadb014d48";
const USER_ID = "0e59c147-d65c-4dd4-b651-2047939fdb29";

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
    { name: "wholesale-orders", range: [50000, 500000] },
    { name: "retail-sales", range: [1000, 20000] },
    { name: "export-sales", range: [100000, 2000000] },
    { name: "custom-uniform-orders", range: [20000, 300000] },
    { name: "online-sales", range: [500, 20000] },
    { name: "scrap-fabric-sales", range: [500, 10000] },
    { name: "rental-income-equipment", range: [5000, 50000] },
    { name: "interest-income", range: [500, 5000] },
    { name: "owner-investment", range: [20000, 500000] },
    { name: "loan-proceeds", range: [100000, 1000000] },
  ],

  EXPENSE: [
    // Operating expenses
    { name: "fabric-and-textiles", range: [5000, 200000] },
    { name: "thread-and-accessories", range: [1000, 30000] },
    { name: "labor-payroll", range: [10000, 300000] },
    { name: "subcontracting-services", range: [20000, 200000] },
    { name: "dyes-and-chemicals", range: [2000, 50000] },
    { name: "utilities", range: [1000, 20000] },
    { name: "packaging-materials", range: [500, 20000] },
    { name: "logistics-and-delivery", range: [2000, 50000] },
    { name: "machine-repairs", range: [5000, 100000] },
    { name: "rent-factory-or-showroom", range: [20000, 200000] },
    { name: "marketing-and-advertising", range: [2000, 80000] },
    { name: "office-expenses", range: [1000, 20000] },
    { name: "training-and-seminars", range: [1000, 20000] },
    { name: "insurance", range: [2000, 30000] },
    { name: "taxes-and-permits", range: [2000, 50000] },

    // Financing outflows
    { name: "loan-repayment", range: [20000, 500000] },
    { name: "interest-expense", range: [2000, 50000] },

    // Investing (CAPEX)
    { name: "sewing-machine-purchase", range: [20000, 300000] },
    { name: "embroidery-machine-purchase", range: [50000, 800000] },
    { name: "delivery-vehicle-purchase", range: [200000, 2000000] },
    { name: "factory-renovation", range: [100000, 1500000] },
    { name: "software-and-it-systems", range: [10000, 200000] },
  ],
};


const CATEGORY_ACTIVITY = {
  // Income
  "wholesale-orders": "OPERATION",
  "retail-sales": "OPERATION",
  "export-sales": "OPERATION",
  "custom-uniform-orders": "OPERATION",
  "online-sales": "OPERATION",
  "scrap-fabric-sales": "OPERATION",
  "rental-income-equipment": "OPERATION",
  "interest-income": "INVESTMENT",
  "owner-investment": "FINANCING",
  "loan-proceeds": "FINANCING",

  // Expenses (Operating)
  "fabric-and-textiles": "OPERATION",
  "thread-and-accessories": "OPERATION",
  "labor-payroll": "OPERATION",
  "subcontracting-services": "OPERATION",
  "dyes-and-chemicals": "OPERATION",
  "utilities": "OPERATION",
  "packaging-materials": "OPERATION",
  "logistics-and-delivery": "OPERATION",
  "machine-repairs": "OPERATION",
  "rent-factory-or-showroom": "OPERATION",
  "marketing-and-advertising": "OPERATION",
  "office-expenses": "OPERATION",
  "training-and-seminars": "OPERATION",
  "insurance": "OPERATION",
  "taxes-and-permits": "OPERATION",

  // Expenses (Financing)
  "loan-repayment": "FINANCING",
  "interest-expense": "FINANCING",

  // Expenses (Investing / CAPEX)
  "sewing-machine-purchase": "INVESTMENT",
  "embroidery-machine-purchase": "INVESTMENT",
  "delivery-vehicle-purchase": "INVESTMENT",
  "factory-renovation": "INVESTMENT",
  "software-and-it-systems": "INVESTMENT",
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