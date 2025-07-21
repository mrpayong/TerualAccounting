import { z } from "zod";

export const accountSchema = z.object({
    name: z.string().min(1, "Company name is required."),
    type: z.enum([
        "FREELANCE", //isIndiv
        "PROFESSIONAL", //isIndiv
        "SOLEPROPRIETORSHIP", //isIndiv

        "INCORPORATION",
        "PARTNERSHIP",
        "COOPERATIVE",
        "ASSOCIATION",
        "CORPORATION",

        "OTHERS"
    ],{ required_error: "Please select a business type." }),
    isIndividual: z.boolean({required_error: "required"}).default(false),

    
    street: z.string().min(1, "Street is required."),
    buildingNumber: z.string().min(1, "House/Building number is required."),
    town: z.string().min(1, "Barangay is required."),
    city: z.string().min(1, "City is required."),
    zip: z.string().min(1, "Zip code is required."),
    province: z.string().min(1, "Province is required."),
    region: z.string().min(1, "Region is required."), 

    businessLine: z.string().min(0, "Line of business is required."),
    tin: z.tuple([
        z.string().regex(/^\d{3}$/, "First TIN segment must be 3 digits"),
        z.string().regex(/^\d{3}$/, "Second TIN segment must be 3 digits"),
        z.string().regex(/^\d{3}$/, "Third TIN segment must be 3 digits"),
        z.string().regex(/^\d{5}$/, "Fourth TIN segment must be 5 digits"),
    ]),
    RDO: z.string().min(1, "RDO code is required."),
    birthDate: z.coerce.date({required_error: "Date is required"}),
    contactNumber: z.coerce.string() // Ensures it's an integer
    .refine((value) => value.toString().length === 11, "Fill in the contact number corretly."),

    email: z.string().min(1, "Email is required."),
    isHeadOffice: z.boolean().default(false),
    branchCount: z.coerce.number().optional(),
    owner: z.string().min(1, "Name of owner is required."),
})

export const subAccountSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    accountId: z.string().min(1, "Mother group is required"),
    balance: z.string().optional().nullable(),
    parentName: z.string().optional(), // Validate parent name
  });

export const userSchema = z.object({
    email: z.string().min(1, "Email is required."),
    Fname: z.string().min(1, "First name is required"),
    Lname: z.string().min(1, "Last name is required"),
    username: z.string().min(5, "Please enter a username."),
    role: z.enum(["ADMIN", "SYSADMIN", "USER", "STAFF"])
})

export const taskSchema = z.object({
    // statusOfTask: z.enum(["COMPLETED", "PROGRESS", "PLANNING", "RESEARCH"], {
    //     required_error: "Task status is required",
    //     }),
    urgency: z.enum(["LOW", "MEDIUM", "HIGH"], {
        required_error: "Urgency is required",
        }),
    taskName: z.string().min(1, "Task name is required"),
    taskCategory: z.string().min(1, "Task category is required"),
    taskDescription: z.string().optional(),
    dueDate: z.date({required_error: "Due date is required"}),
});

export const transactionSchema = z.object({
    type: z.enum(["INCOME", "EXPENSE"]),
    Activity: z.enum(["OPERATION", "INVESTMENT", "FINANCING"]),
    amount: z.string().min(1, "Amount is required"),
    refNumber: z.string().min(1, "Reference number is required"),
    printNumber: z.string().min(1, "Print number is required"),
    description: z.string().optional(),
    particular: z.string().optional(),
    date: z.date({required_error: "Date is required"}),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(["DAILY","WEEKLY", "MONTHLY", "YEARLY"]).optional(),
}).superRefine((data, ctx) => {
    if(data.isRecurring && !data.recurringInterval){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Recurring interval is required for recurring transactions",
            path: ["recurringInterval"],
        });
    }
});