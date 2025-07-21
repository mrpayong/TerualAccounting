"use client";
import { subAccountSchema } from "@/app/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { createSubAccount } from "@/actions/accounts";
import useFetch from "@/hooks/use-fetch";


export default function CreateSubAccountButton({ accountId }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(subAccountSchema),
    defaultValues: {
      name: "",
      description: "",
      accountId: accountId || "",
      balance: "",
      parentId: "",
    },
  });

  const { 
    loading: subAccountLoading, 
    fn: createSubAccountFn,
    data: subAccountData,
    error: subAccountError 
    } = useFetch(createSubAccount);


  // Main submission handler
  const onSubmit = async (data) => {
    try {
      console.log("Raw Form Data:", data);
  
      // Sanitize and validate data types
      const sanitizedData = {
        name: String(data.name).trim(),
        description: data.description ? String(data.description).trim() : null,
        accountId: String(data.accountId).trim(),
        parentId: data.parentId ? String(data.parentId).trim() : null,
        balance: data.balance ? Number(data.balance) : null,
      };
  
      // Perform type validation
      if (!sanitizedData.name || typeof sanitizedData.name !== "string") {
        toast.error("Sub-account name must be a valid string.");
        return;
      }
  
      if (sanitizedData.name.length > 50) {
        toast.error("Sub-account name cannot exceed 50 characters.");
        return;
      }
  
      if (!sanitizedData.accountId || typeof sanitizedData.accountId !== "string") {
        toast.error("Account ID must be a valid string.");
        return;
      }
  
      if (sanitizedData.description && typeof sanitizedData.description !== "string") {
        toast.error("Description must be a valid string.");
        return;
      }
  
      if (sanitizedData.description && sanitizedData.description.length > 200) {
        toast.error("Description cannot exceed 200 characters.");
        return;
      }
  
      if (sanitizedData.parentId && typeof sanitizedData.parentId !== "string") {
        toast.error("Parent Sub-Account ID must be a valid string.");
        return;
      }
  
      console.log("Sanitized Data:", sanitizedData);
  
      // Call the server action using useFetch
      const response = await createSubAccountFn(sanitizedData);
      console.log("Response:", response)
      if (subAccountData) {
        toast.success("Sub-account created successfully!");
        reset(); // Reset the form after successful submission
      } else {
        toast.error("Failed to create sub-account.");
      }
    } catch (error) {
      console.error("Error creating sub-account:", error);
      toast.error("An unexpected error occurred:", error);
    }
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full p-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 shadow-md">
          Add Sub-Account
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle>Create Sub-Account</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new sub-account.
          </DialogDescription>
        </DialogHeader>
        <form  onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Sub-Account Name</label>
            <Input
              placeholder="Enter sub-account name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="Enter description (optional)"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              placeholder="Enter parent sub-account ID (optional)"
              {...register("balance")}
            />
            {errors.balance && (
              <p className="text-sm text-red-500">{errors.balance.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Parent Sub-Account ID</label>
            <Input
              placeholder="Enter parent sub-account ID (optional)"
              {...register("parentId")}
            />
            {errors.parentId && (
              <p className="text-sm text-red-500">{errors.parentId.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-blue-500 text-white"
            //   onClick={handleButtonClick}
              disabled={subAccountLoading} // Disable the button while loading
            >
              {subAccountLoading ? "Creating..." : "Create Sub-Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}