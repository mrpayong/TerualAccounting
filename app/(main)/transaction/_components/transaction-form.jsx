"use client";
import { 
    createTransaction, 
    updateTransaction } from '@/actions/transaction';
import { transactionSchema } from '@/app/lib/schema';
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { PopoverContent } from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { CalendarIcon, Camera, Loader, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ReceiptScanner from './receipt-scanner';
import { cn } from '@/lib/utils';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const AddTransactionForm = ({
    accounts, 
    categories,
    editMode =  false,
    initialData = null,
    accountId,
    ScannerUserId
}) => {
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const [isClient, setIsClient] = useState(true);
    const [scannedReceipt, setScannedReceipt] = useState(null);
    useEffect(() => {
        setIsClient(false)
      }, [])

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

    const {
        register,
        setValue,
        handleSubmit,
        formState: {errors},
        watch,
        getValues,
        reset,
    } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: 
            editMode && initialData 
            ? {
                type: initialData.type,
                Activity: initialData.Activity,
                refNumber: initialData.refNumber,
                amount: initialData.amount.toString(),
                description: initialData.description,
                accountId: initialData.accountId,
                category: initialData.category,
                printNumber: initialData.printNumber,
                particular: initialData.particular,
                date: new Date(initialData.date),
                isRecurring: initialData.isRecurring,
                ...(initialData.recurringInterval && {
                    recurringInterval: initialData.recurringInterval,
                }),
            }
            : {
            type: "",
            refNumber: "",
            particular: "",
            Activity: "",
            amount: "",
            description: "",
            category: "",
            printNumber: "Manually encoded",
            accountId: accountId || accounts.find((ac) => ac.id)?.id,
            date: getPhilippinesDate(),
            isRecurring: false,
        },
    });

    const {
        loading: transactionLoading,
        fn: transactionFn,
        data: transactionResult,
    } = useFetch(editMode ? updateTransaction : createTransaction);

    const type = watch("type");
    const activityType = watch("Activity");
    const isRecurring = watch("isRecurring");
    const date = watch("date");
    const printNumber = watch("printNumber");

    const filteredCategories = categories.filter(
        (category) => category.type === type
    );
    
    const onSubmit = async (data) => {
        
        const formData = {
            ...data,
            amount: parseFloat(data.amount),
        };
        
        const sign = Math.sign(formData.amount)
        if(formData.type === "EXPENSE" && sign !== -1){
            toast.error(`Type and amount mismatch. Expense and ${formData.amount}. Add "-".`)
            return;
        }
       if(formData.type === "INCOME" && sign !== 1){
            toast.error(`Type and amount mismatch. Income and ${formData.amount}.`)
            return;
        }
        if (editMode) {
            transactionFn(editId, formData);
            setButtonsDisabled(true);
        } else{
            transactionFn(formData);
            setButtonsDisabled(true);
        }
    };
  
    useEffect(() => {
        if (transactionResult?.code === 200 && transactionResult?.success && !transactionLoading) {
            toast.success(
                editMode
                    ? "Transaction updated successfully."
                    : "Transaction created successfully.", {
                        duration: editMode
                            ? 1000
                            : 0
                    }
                );
            reset();
            
        editMode
            ? setTimeout(() => {
                const promise = () => new Promise((resolve) => setTimeout(() => resolve({ name: 'Sonner' }), 2000));
                router.push(`/account/${transactionResult.data.accountId}`);
                toast.promise(promise, { loading: 'Going back, please wait.'});
            }, 1000)
            : setButtonsDisabled(false);
        }
    }, [transactionResult, transactionLoading, editMode]);




        useEffect(() => {
        if (transactionResult?.success === false) {
            if(transactionResult.code === 402){
                toast.error("Reference number already exists.");
                setButtonsDisabled(false);
                return;
            }
            if(transactionResult.code === 403){
                toast.error("Account not found.");
                setButtonsDisabled(false);
                return;
            }
            if (transactionResult.code === 500) {
                toast.error("Something went wrong. Please try again.");
                setButtonsDisabled(false);
                return;
            }
        }
    }, [transactionResult]);

    // const handleScanComplete = (scannedData) => {
    //     console.log(scannedData);
    //     if(scannedData){
    //         setValue("amount", scannedData.amount.toString());
    //         setValue("date", new Date(scannedData.date));

    //         if (scannedData.description){
    //             setValue("description", scannedData.description);
    //         }
    //         if(scannedData.category){
    //             setValue("category", scannedData.category);
    //         }
    //         toast.success("Receipt scanned successfully");
    //     }
    // };


      const formatDate = (dateString) => {
        const date = new Date(dateString); // Parse the date string
        const utcYear = date.getUTCFullYear();
        const utcMonth = date.getUTCMonth(); // Month is zero-based
        const utcDay = date.getUTCDate();
      
        // Format the date as "Month Day, Year"
        return new Date(Date.UTC(utcYear, utcMonth, utcDay)).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      };

    const handleScanComplete = (scannedData) => {
        console.log("Scanned Data: ", scannedData);
        if (scannedData) {
          if(scannedData.code === 401) {
            setScannedReceipt(null);
            return;
          } 
          if(scannedData.code === 500) {
            setScannedReceipt(null);
            return;
          } 
          setValue("amount", scannedData.amount.toString());
          console.log("amount scanning success")

          setValue("date", new Date(scannedData.date));
          console.log("date scanning success")
          
          setValue("refNumber",scannedData.refNumber);
          setValue("particular", scannedData.particular);
          setValue("type", scannedData.type || "");
          setValue("Activity", scannedData.Activity || "");
          setValue("printNumber", scannedData.printNumber || "");

          if (scannedData.description) {
            setValue("description", scannedData.description);
            console.log("description scanning success")
          }
          if (scannedData.category) {
            setValue("category", scannedData.category);
          }
          setScannedReceipt(scannedData);
        }
      };

     




    








      


  return (
    <form 
        className='space-y-6'
        onSubmit={handleSubmit(onSubmit)}>
      {/* AI RECEIPT SCANNER */}
      
      {!editMode && <ReceiptScanner scannedReceipt={scannedReceipt} ScannerUserId={ScannerUserId} onScanComplete={handleScanComplete}/>}

      {isClient ? ('This is never prerendered') : ( 
        <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
                <label className='text-sm font-medium'>Transaction type</label>
                <Select
                onValueChange={(value) => setValue("type", value)}
                value={type}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select type"/>
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INCOME">Income</SelectItem>
                    </SelectContent>
                </Select>

                {errors.type && (
                    <p className="text-sm text-red-500">Select transaction type</p>
                )}
            </div> 
            <div className='space-y-2'>
                <label className='text-sm font-medium'>Activity type</label>
                <Select
                onValueChange={(value) => setValue("Activity", value)}
                value={activityType}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select activity"/>
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="OPERATION">Operating Activity</SelectItem>
                        <SelectItem value="INVESTMENT">Investing Activity</SelectItem>
                        <SelectItem value="FINANCING">Financing Activity</SelectItem>
                    </SelectContent>
                </Select>

                {errors.Activity && (
                    <p className="text-sm text-red-500">Select Activity type</p>
                )}
            </div> 
        </div>
    )}

        {isClient ? ('This is never prerendered') : (  <div className='grid gap-6 md:grid-cols-2'> 
                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Amount(₱)</label>
                    <Input
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        {...register("amount")}
                    />
                    {errors.amount && (
                        <p className="text-sm text-red-500">{errors.amount.message}</p>
                    )}
                </div>
                
                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Reference number</label>
                    <Input
                        type="text" 
                        placeholder="Reference number"
                        {...register("refNumber")}
                    />

                    {errors.refNumber && (
                        <p className="text-sm text-red-500">{errors.refNumber.message}</p>
                    )}
                </div> 
               

                <div className='space-y-2'>
                    <label className='text-sm font-medium'>Company Name</label>
                    <Select
                        onValueChange={(value) => setValue("accountId", value)}
                        defaultValue={getValues("accountId")}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select account"/>
                        </SelectTrigger>

                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem
                                    key={account.id}
                                    value={account.id}>
                                        
                                        {account.name} 
                                        {/* (₱{parseFloat(account.balance)}) */}
                                </SelectItem>
                            ))}

                            {isClient && (<CreateAccountDrawer>
                                <Button 
                                    variant="ghost"
                                    className="w-full select-none items-center text-sm outline-none"
                                    >Create Account</Button>
                            </CreateAccountDrawer>)}

                        </SelectContent>
                    </Select>

                    {errors.accountId && (
                        <p className="text-sm text-red-500">{errors.accountId.message}</p>
                    )}
            </div>
            <div className='space-y-2'>
                    <label className='text-sm font-medium'>Particular</label>
                    <Input
                        type="text" 
                        placeholder="Particular"
                        {...register("particular")}
                    />

                    {errors.particular && (
                        <p className="text-sm text-red-500">{errors.particular.message}</p>
                    )}
                </div>
            </div>
        )}


        {isClient ? ('This is never prerendered') :(<div className='space-y-2'>
            <label className='text-sm font-medium'>Account title</label>
            <Input
                {...register("category")}
                placeholder="Account title"
            />
            {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
        </div> )}
        {/* category */}
    
        {isClient ? ('This is never prerendered') :(
        <div className='space-y-2'>
            <label className='text-sm font-medium'>Date of transaction</label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <div className="space-y-2">
                    {/* <label className="text-sm font-medium">Date of transaction</label> */}
                    <DatePicker
                    timezone="Asia/Manila"
                    label={date ? formatDate(date) : "Pick a date"}
                    value={date} // Watch the "date" field from react-hook-form
                    onChange={(date) => {
                        setValue("date", date); // Update the form state with the selected date
                    }}
                    
                    />
                    {errors.date && (
                    <p className="text-sm text-red-500">{errors.date.message}</p>
                    )}
                </div>
            </LocalizationProvider>
            
            {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
            )}

        </div>)}

        {/* <div className='hidden'>
                    <label className='text-sm font-medium'>printNumber</label>
                    <Input
                        type="text" 
                        placeholder="printNumber"
                        {...register("printNumber")}
                    />

                    {errors.printNumber && (
                        <p className="text-sm text-red-500">{errors.printNumber.message}</p>
                    )}
                </div> */}
            {/* date */}

            {isClient ? ('This is never prerendered') :(
            <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <textarea
                id="description"
                placeholder="Enter a detailed description"
                {...register("description")}
                className="w-full h-32 p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                ></textarea>

                {errors.description &&
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                }
            </div> )}
            {/* desc */}

            {/* {isClient ? ('This is never prerendered') :(<div className='flex items-center justify-between rounded-lg border p-3'>
            <div className="space-y-0 5">
                <label className='text-sm font-medium cursor-pointer'>
                Recurring Transaction
                </label>

                <p className='text-sm text-muted-foreground'>
                    Set up a recurring schedule for this transaction
                </p>
            </div>


            <Switch
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
                checked={isRecurring}
            />    
        </div>  )} */}



        {/* recurring */}

        {/* {isRecurring && (
            
            <div className='space-y-2'>
                <label className='text-sm font-medium'>Recurring Interval</label>
                <Select
                    onValueChange={(value) => setValue("recurringInterval", value)}
                    defaultValue={getValues("recurringInterval")}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Interval"/>
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                </Select>

                {errors.recurringInterval && (
                    <p className="text-sm text-red-500">{errors.recurringInterval.message}</p>
                )}
            </div>  
        )} */}


        {isClient ? ('This is never prerendered') :(
            <div className='flex gap-4'>
            <Button
                type="button"
                variant="outline"
                className="w-full border border-black hover:bg-neutral-900 hover:text-white
                hover:shadow-md hover:shadow-black/30"
                disabled={transactionLoading || buttonsDisabled}
                onClick={() => {setButtonsDisabled(true); router.back();}}>
                    Back 
            </Button>

            <Button
                type="button"
                variant="outline"
                disabled={transactionLoading 
                    || editMode === true 
                    || buttonsDisabled
                }
                className="w-full
                bg-white text-yellow-500
                hover:bg-yellow-500 hover:text-black
                hover:border-0 border border-yellow-500
                hover:shadow-md hover:shadow-yellow-500/50"
                onClick={() => {reset(); setScannedReceipt(null);}} // Reset the form fields
            >
                Reset
            </Button>

            <Button
                type="submit"
                className="w-full
                hover:bg-green-500 hover:text-white
                bg-white text-black
                hover:border-0 border border-green-500
                hover:shadow-md hover:shadow-green-500/50"

                disabled={transactionLoading || buttonsDisabled}>
                    {transactionLoading
                        ? (<>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                            {editMode 
                                ? "Updating"
                                : "Creating"
                            }
                        </>)
                        : editMode 
                            ? ("Update Transaction") 
                            : ("Create Transaction")
                    }
            </Button>
        </div>  )}

   
    </form>
  )
}

export default AddTransactionForm;
