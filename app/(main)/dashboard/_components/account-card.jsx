"use client";

import { Switch } from '@/components/ui/switch';
import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';
import useFetch from '@/hooks/use-fetch';
import { updateDefaultAccount } from '@/actions/accounts';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useAccountCardContext } from '@/components/loadingCard';
import { Button } from '@/components/ui/button';
import { Zen_Kaku_Gothic_Antique, Orbitron } from 'next/font/google';
import { Badge } from '@/components/ui/badge';
  
const fontZenKaku = Zen_Kaku_Gothic_Antique({
  subsets:["latin"],
  weight: ["400","900"],
})
const fontOrbitron = Orbitron({
  subsets:["latin"],
  weight: "400",
})


function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

const AccountCard = ({account}) => { 
    const {
        name, 
        type, 
        balance, 
        id, 
        _count,
        isDefault, // initially this is false
    } = account;

    const router = useRouter();

    const handleAddTransaction = () => {
      router.push(`/transaction/create?accountId=${account.id}`);
    };



    const { 
        //fetch hook for updating default status
        // this is update default function to be called
        loading: updateDefaultLoading,
        fn: updateDefaultFn,
        data: updatedAccount,
        error,
    } = useFetch(updateDefaultAccount);

    const handleDefaultChange = async (event) => { // this is async bcoz API calling will happen inside
        event.preventDefault(); //prevent refreshing the page 

        // checking if isDefault true/false status
        if (isDefault /*isDefault is currently false*/) {
            //if false nga talaga ang isDefault, throw warning messge kasi dapat true na may default acc
            toast.warning("You need at least 1 default account");
            return; //don't allow toggling off the default account when no other default acc
        }

        await updateDefaultFn(id); //call the update default func on the selected id
    } 

    useEffect(() => {
        if (updatedAccount?.success) {
            toast.success("Default account updated successfully")
        }
    }, [updatedAccount, updateDefaultLoading]);

    useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to update default account");
        }
    }, [error]);


    const { loadingAccountId, setLoadingAccountId } = useAccountCardContext();

  const handleClick = () => {
    if (!loadingAccountId) {
      setLoadingAccountId(id); // Set the loading state for the clicked card
    }
  };

  const isLoading = loadingAccountId === id; // Check if this card is loading
  const isDisabled = !!loadingAccountId; // Disable all cards if any card is loading

  
  
const typenHandle = (type) => {
  switch (type) {
    case "INCORPORATION":
      return "Incorporation";
    case "PARTNERSHIP":
      return "Partnership";
    case "COOPERATIVE":
      return "Cooperative";
    case "ASSOCIATION":
      return "Association";
    case "CORPORATION":
      return "Corporation";
    case "FREELANCE":
      return "Freelance";
    case "PROFESSIONAL":
      return "Professional";
    case "SOLEPROPRIETORSHIP":
      return "Sole Proprietorship";
    case "OTHERS":
      return "Others";
    default:
      return "Undocumented business type";
  }
}
  





  return (
    <Card
    onClick={handleClick}
    className={`hover:shadow-md hover:shadow-gray-400 transition-shadow group relative border border-gray-800
      ${isDisabled ? "pointer-events-none opacity-50" : ""}`
    }
    >
    <Link href={`/account/${id}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`${fontZenKaku.className} text-sm font-normal capitalize tracking-wide`}>
          {formatNumber(account._count.transactions)} Transactions
        </CardTitle>
      </CardHeader>

      <CardContent>
      <div className={`${fontZenKaku.className} font-black text-3xl flex items-center  gap-2 !whitespace-nowrap !overflow-hidden !text-ellipsis`}>
      {name}
  </div>
        <div className="flex flex-row items-center gap-1">
          <Badge variant="outline"className={`mt-1 bg-black/85 text-[#FDBD01] border-black
            ${fontOrbitron.className} tracking-wide md:tracking-wider 
            font-normal text-xs md:text-[0.795rem]/[1rem]`}>
            {typenHandle(type)}
          </Badge>
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
            </>
          ) : (
          ''
          )} 
        </div>       
      </CardContent>

    
    </Link>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        
        <Button
        className={`bg-gray-800/10 hover:bg-gradient-to-r 
                    hover:from-blue-700 hover:to-fuchsia-600 
                    text-black hover:text-white font-semibold 
                    py-2 px-4 rounded-lg 
                    shadow-md hover:shadow-lg 
                    hover:shadow-indigo-500
                    transition-all duration-300 
                    w-full shine-effect
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400
                    border border-black/15 hover:border-none tracking-normal
                  `}
        onClick={handleAddTransaction}
        >
        <Camera/> Add Transaction
      </Button>
      </CardFooter>
  </Card>



  // <div className="border rounded-md p-4 shadow-sm hover:shadow-md transition-shadow">
  //     <h3 className="text-lg font-semibold">{account.name}</h3>
  //     <p className="text-sm text-gray-500">{account.type}</p>
  //     <div className="flex justify-between items-center mt-4">
  //       <p className="text-sm font-medium text-green-500">
  //         Income: ₱{account.income?.toFixed(2) || "0.00"}
  //       </p>
  //       <p className="text-sm font-medium text-red-500">
  //         Expenses: ₱{account.expenses?.toFixed(2) || "0.00"}
  //       </p>
  //     </div>
  //     <Button
  //       className="mt-4 bg-blue-500 text-white hover:bg-blue-600 w-full"
  //       onClick={handleAddTransaction}
  //     >
  //       Add Transaction
  //     </Button>
  //   </div>

  )
}

export default AccountCard;
