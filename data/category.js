export const defaultCategories = [
    // Income Categories
    {
      id: "salary",
      name: "salary",
      type: "INCOME",
      color: "#22c55e", // green-500
      icon: "Wallet",
    },
    {
      id: "freelance",
      name: "freelance",
      type: "INCOME",
      color: "#06b6d4", // cyan-500
      icon: "Laptop",
    },
    {
      id: "investments",
      name: "investments",
      type: "INCOME",
      color: "#6366f1", // indigo-500
      icon: "TrendingUp",
    },
    {
      id: "business",
      name: "business",
      type: "INCOME",
      color: "#ec4899", // pink-500
      icon: "Building",
    },
    {
      id: "rental",
      name: "rental",
      type: "INCOME",
      color: "#f59e0b", // amber-500
      icon: "Home",
    },
    {
      id: "other-income",
      name: "Other Income",
      type: "INCOME",
      color: "#64748b", // slate-500
      icon: "Plus",
    },
  
    // Expense Categories
    {
      id: "housing",
      name: "housing",
      type: "EXPENSE",
      color: "#ef4444", // red-500
      icon: "Home",
      subcategories: ["Rent", "Mortgage", "Property Tax", "Maintenance"],
    },
    {
      id: "transportation",
      name: "transportation",
      type: "EXPENSE",
      color: "#f97316", // orange-500
      icon: "Car",
      subcategories: ["Fuel", "Public Transport", "Maintenance", "Parking"],
    },
    {
      id: "groceries",
      name: "groceries",
      type: "EXPENSE",
      color: "#84cc16", // lime-500
      icon: "Shopping",
    },
    {
      id: "utilities",
      name: "utilities",
      type: "EXPENSE",
      color: "#06b6d4", // cyan-500
      icon: "Zap",
      subcategories: ["Electricity", "Water", "Gas", "Internet", "Phone"],
    },
    {
      id: "entertainment",
      name: "entertainment",
      type: "EXPENSE",
      color: "#8b5cf6", // violet-500
      icon: "Film",
      subcategories: ["Movies", "Games", "Streaming Services"],
    },
    {
      id: "food",
      name: "food",
      type: "EXPENSE",
      color: "#f43f5e", // rose-500
      icon: "UtensilsCrossed",
    },
    {
      id: "shopping",
      name: "shopping",
      type: "EXPENSE",
      color: "#ec4899", // pink-500
      icon: "ShoppingBag",
      subcategories: ["Clothing", "Electronics", "Home Goods"],
    },
    {
      id: "healthcare",
      name: "healthcare",
      type: "EXPENSE",
      color: "#14b8a6", // teal-500
      icon: "HeartPulse",
      subcategories: ["Medical", "Dental", "Pharmacy", "Insurance"],
    },
    {
      id: "education",
      name: "education",
      type: "EXPENSE",
      color: "#6366f1", // indigo-500
      icon: "GraduationCap",
      subcategories: ["Tuition", "Books", "Courses"],
    },
    {
      id: "personal",
      name: "personal Care",
      type: "EXPENSE",
      color: "#d946ef", // fuchsia-500
      icon: "Smile",
      subcategories: ["Haircut", "Gym", "Beauty"],
    },
    {
      id: "travel",
      name: "travel",
      type: "EXPENSE",
      color: "#0ea5e9", // sky-500
      icon: "Plane",
    },
    {
      id: "insurance",
      name: "insurance",
      type: "EXPENSE",
      color: "#64748b", // slate-500
      icon: "Shield",
      subcategories: ["Life", "Home", "Vehicle"],
    },
    {
      id: "gifts",
      name: "gifts & donations",
      type: "EXPENSE",
      color: "#f472b6", // pink-400
      icon: "Gift",
    },
    {
      id: "bills",
      name: "bills & fees",
      type: "EXPENSE",
      color: "#fb7185", // rose-400
      icon: "Receipt",
      subcategories: ["Bank Fees", "Late Fees", "Service Charges"],
    },
    {
      id: "other-expense",
      name: "other expenses",
      type: "EXPENSE",
      color: "#94a3b8", // slate-400
      icon: "MoreHorizontal",
    },
  ];
  
  export const categoryColors = defaultCategories.reduce((acc, category) => {
    acc[category.id] = category.color;
    return acc;
  }, {});