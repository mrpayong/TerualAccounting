"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { TextField, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useEffect, useState } from "react";
import { taskSchema } from "@/app/lib/schema";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/use-fetch";
import { createTask, createTasking } from "@/actions/task";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function TaskForm({ onSubmit, onSuccess, initialValues, users, accounts }) {
  const getPhilippinesDate = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
      });

      const [month, day, year] = formatter.format(now).split("/");
      return new Date(`${year}-${month}-${day}`);
  };
  const fetchedAccounts = accounts.data;

  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    reset, 
    formState: { errors } 
      } = useForm({
        resolver: zodResolver(taskSchema),
        defaultValues:  {
            taskName: "",
            taskCategory: "",
            taskDescription: "",
            urgency: "",
            dueDate: getPhilippinesDate(),
          },
      });

  // For MUI DateCalendar
  const [dueDate, setDueDate] = useState(initialValues?.dueDate || null);

  const date = watch("dueDate")

  const handleClear = () => {
    reset();
    setDueDate(null);
  };

  const {
    loading: taskLoading,
    fn: createTaskFn,
    data: taskData,
    error: taskError,
  } = useFetch(createTasking)

  const handleCreateTask = async (data) => {
    
      console.log("creating...")
      await createTaskFn(data);
   
  };

  useEffect(() => {
    if (taskError) {
      console.error("Error creating task:", taskError);
      toast.error("Failed to create task. Please try again.");
    }
  }, [taskLoading, taskError]);

  useEffect(() => {
    if (taskData) {
      toast.success("Task created successfully.");
      reset();
      if (typeof onSuccess === "function") {
      onSuccess(); // <-- Close the dialog
    }
    }
  }, [taskLoading, taskData, reset, onSuccess]);
























  return (
    <form
      onSubmit={handleSubmit(handleCreateTask)}
      className="w-full"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar on the left */}
        <div className="md:w-[340px] w-full flex flex-col items-center justify-center">
          <div className="w-full bg-gray-300 rounded-xl flex items-center justify-center min-h-[320px]">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateCalendar
                value={date}
                onChange={(date) => {
                  setValue("dueDate", date);
                }}
              />
            </LocalizationProvider>
          </div>
          <div className="mt-2 text-center text-base font-medium">
            Due Date<span className="text-red-500">*</span>
          </div>
        </div>



        {/* Form fields on the right */}
        <div className="md:flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Task Name */}
          <div className="col-span-1 md:col-span-2">
             <label className="block text-sm font-medium mb-1" htmlFor="task-name">
              Task Name <span className="text-red-500">*</span>
            </label>
            <TextField
              label="Task Name"
              {...register("taskName")}
              error={!!errors.taskName}
              helperText={errors.taskName?.message}
              fullWidth
              required
            />
          </div>

          {/* Task Category */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1" htmlFor="task-category">
              Account <span className="text-red-500">*</span>
            </label>

            <Select
              value={watch("taskCategory") || ""}
              onValueChange={val => setValue("taskCategory", val, { shouldValidate: true })}
              required
            >
              <SelectTrigger id="task-category" className={errors.taskCategory ? "border-red-500" : ""}>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent >
                {fetchedAccounts && fetchedAccounts.length > 0 ? (
                  fetchedAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.name} className="cursor-pointer">
                      {account.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled className="cursor-default">
                    No accounts available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.taskCategory && (
              <p className="text-xs text-red-500 mt-1">{errors.taskCategory.message}</p>
            )}
          </div>
       
          {/* Task Description */}
          <div className="col-span-1 md:col-span-2">
            <Textarea
              placeholder="Describe the task.(optional)"
              {...register("taskDescription")}
              rows={3}
            />
            {errors.taskDescription && <p className="text-xs text-red-500 mt-1">{errors.taskDescription.message}</p>}
          </div>
        </div>
      </div>
      {/* Urgency Radio Group */}
      <div className="w-full flex flex-col items-center mt-4 mb-2">
        <label
          htmlFor="urgency-group"
          className="text-xs font-medium text-gray-700 mb-1"
        >
          Urgency <span className="text-red-500">*</span>
          {errors.urgency && (<p className="text-xs text-red-500 mt-1">Select urgency</p>)}
        </label>
        <RadioGroup
          row
          value={watch("urgency") || ""}
          onChange={e => setValue("urgency", e.target.value)}
          className="flex flex-row gap-5 items-center"
        >
          <FormControlLabel
            value="LOW"
            control={
              <Radio
                icon={<span className="w-6 h-6 rounded-full border-2 border-green-400 bg-white inline-block" />}
                checkedIcon={<span className="w-6 h-6 rounded-full border-4 border-green-400 bg-green-700 inline-block" />}
              />
            }
            label={<span className="ml-1">Low Priority</span>}
          />
          <FormControlLabel
            value="MEDIUM"
            control={
              <Radio
                icon={<span className="w-6 h-6 rounded-full border-2 border-yellow-400 bg-white inline-block" />}
                checkedIcon={<span className="w-6 h-6 rounded-full border-4 border-yellow-400 bg-yellow-500 inline-block" />}
              />
            }
            label={<span className="ml-1">Medium Priority</span>}
          />
          <FormControlLabel
            value="HIGH"
            control={
              <Radio
                icon={<span className="w-6 h-6 rounded-full border-2 border-red-400 bg-white inline-block" />}
                checkedIcon={<span className="w-6 h-6 rounded-full border-4 border-red-400 bg-red-600 inline-block" />}
              />
            }
            label={<span className="ml-1">High Priority</span>}
          />
        </RadioGroup>
      </div>
      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-2 mt-4">
        <DialogClose asChild>
          <Button
          variant="outline"
          type="button"
          disabled={taskLoading}
          className="
          bg-white hover:bg-black
          text-black hover:text-white
          border border-black hover:border-0
          hover:shadow-lg hover:shadow-black/20
          md:flex-1"
        >
          Cancel
        </Button>
        </DialogClose>

        <Button
          type="button"
          onClick={handleClear}
          disabled={taskLoading}
          className=" 
          hover:bg-yellow-400 bg-white
          text-black hover:text-white
          border border-yellow-400 hover:border-0
          hover:shadow-lg hover:shadow-yellow-400/50
          md:flex-1"
        >
          Clear all
        </Button>
        <Button
          type="submit"
          className="
          bg-black hover:bg-white
          text-white hover:text-black
          hover:border hover:border-black border-0
          hover:shadow-lg hover:shadow-black/20
           md:flex-1"
          disabled={taskLoading}
          onClick={() => {console.log("tested")}}
        >
          {taskLoading 
            ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </>
              )
            : initialValues 
              ? "Update Task" 
              : "Add Task" }
        </Button>
      </div>
    </form>
  );
}