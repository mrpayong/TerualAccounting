"use client";
import { updateBudget } from '@/actions/budget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import useFetch from '@/hooks/use-fetch';
import { Check, Pencil, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const BudgetProgress = ({initialBudget, currentExpenses }) => {
  //   const [isEditing, setIsEditing] = useState(false);
  // const [newBudget, setNewBudget] = useState(
  //   initialBudget?.amount?.toString() || ""
  // );

  // const {
  //   loading: isLoading,
  //   fn: updateBudgetFn, 
  //   data: updatedBudget,
  //   error,
  // } = useFetch(updateBudget);

  // const percentUsed = initialBudget
  //   ? (currentExpenses / initialBudget.amount) * 100
  //   : 0;

  // const handleUpdateBudget = async () => {
  //   const amount = parseFloat(newBudget);
  //   if ( amount <= 0) {
  //     toast.error("Please enter a valid amount");
  //     return;
  //   }
  
  //   // Ensure a valid object is passed
  //   const payload = { amount };
  //   console.log("Calling updateBudgetFn with payload:", payload);
  //   await updateBudgetFn(payload);
  // };

  // const handleCancel = () => {
  //   setNewBudget(initialBudget?.amount?.toString() || "");
  //   setIsEditing(false);
  // };

  // useEffect(() => {
  //   if (updatedBudget?.success) {
  //     setIsEditing(false);
  //     toast.success("Budget updated successfully");
  //   }
  // }, [updatedBudget]);

  // useEffect(() => {
  //   if (error) {
  //     toast.error(error.message || "Failed to update budget");
  //   }
  // }, [error]);



    const [isEditing, setIsEditing] = useState(false);
    const [newBudget, setNewBudget] = useState(
        initialBudget?.amount?.toString() || ""
    );

    const percentUsed = initialBudget
        ? (currentExpenses/initialBudget.amount) * 100
        : 0;

    const {
        loading: isLoading,
        fn: updateBudgetFn,
        data: updatedBudget,
        error,
    } = useFetch(updateBudget);

    const handleUpdateBudget = async () => {
        console.log("handleUpdateBudget called.");
        const amount = parseFloat(newBudget);

        console.log("Parsed amount:", amount);
        console.log("handleUpdateBudget called.(2)");
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please Enter a valid amount.");
            return;
        }
        
        console.log("handleUpdateBudget called.(4)");
        await updateBudgetFn(amount);
       
        if(updateBudgetFn.success){console.log("handleUpdateBudget called.(5)");}
    };
    
    // const {
    //     loading: isLoading,
    //     fn: updateBudgetFn,
    //     data: updatedBudget,
    //     error
    //   } = useFetch(updateBudget);
    
    //   const percentUsed = initialBudget
    //     ? (currentExpenses / initialBudget.amount) * 100
    //     : 0;
    
    //   const handleUpdateBudget = async () => {
    //     console.log(newBudget)
    //     const amount = parseFloat(newBudget);
    
    //     if (isNaN(amount) || amount <= 0) {
    //       toast.error("Please enter a valid amount");
    //       return;
    //     }
    //     console.log(amount," Data Type: ", typeof amount)
    //     await updateBudgetFn(amount);
    //   };

    useEffect(() => {
        if (updatedBudget?.success) {
            setIsEditing(false);
            toast.success("Budget updated successfully.");
        }
    }, [updatedBudget]);

    // useEffect(() => {
    //     if (error) {
    //         toast.error( "Failed to updated budget.");
    //         console.error(error.message)
    //     }
    // }, [error]);

    const handleCancel = () => {
        setNewBudget(initialBudget?.amount?.toString() || "");
        setIsEditing(false);
        console.log("cancel button clicked.");
    }




    

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            
            <div className='flex-1'>
            <CardTitle>Monthly Budget (default account)</CardTitle>
            <div className='flex items-center gap-2 mt-1'>
                {isEditing
                    ? (
                    <div className='flex items-center gap-2'>
                        <Input 
                            type="number"
                            value={newBudget}
                            onChange={(e) => setNewBudget(e.target.value)}
                            className="w-32"
                            placeholder="Enter amount"
                            autoFocus
                            disabled={isLoading}
                        />
                        <Button 
                            variant="ghost"  
                            size="icon" 
                            onClick={handleUpdateBudget}
                            disabled={isLoading}>

                                <Check className="h-4 w-4 text-green-500"/>
                        </Button>
                        <Button 
                            variant="ghost"  
                            size="icon" 
                            onClick={handleCancel}
                            disabled={isLoading}>

                                <X className="h-4 w-4 text-red-500"/>
                        </Button>
                    </div>
                    )
                    : (
                        <>
                            <CardDescription>
                                {initialBudget
                                    ? `₱${currentExpenses.toFixed(2)} of ₱${initialBudget.amount.toFixed(2)} spent`
                                    : "No Budget Set"
                                }
                            </CardDescription>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsEditing(true)}
                                className="h-6 w-6">
                                <Pencil className='h-3 w-3'/>
                            </Button>
                        </>)
                }
                </div>
            </div>
            
        </CardHeader>
        <CardContent>
        {initialBudget && (
          <div className="space-y-2">
            <Progress
              value={percentUsed}
              indicatorColor={
                percentUsed >= 90
                    ? "rgb(239 68 68)"
                    : percentUsed >= 75
                        ? "rgb(251 191 36)"
                        : "rgb(74 222 128)"
            }
            />
            <p className="text-xs text-muted-foreground text-right">
              {percentUsed.toFixed(1)}% used
            </p>
          </div>
        )}
      </CardContent>
      </Card>
    </div>
  )
}

export default BudgetProgress;
