"use client";

import { scanReceipt } from '@/actions/transaction';
import { Button } from '@/components/ui/button';
import useFetch from '@/hooks/use-fetch';
import { Camera, CircleCheck, Loader2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';

const ReceiptScanner = ({onScanComplete, scannedReceipt, ScannerUserId}) => {
    const fileInputRef = useRef();
    const [isClient, setIsClient] = useState(false);
        useEffect(() => {
            setIsClient(true)
          }, [])

    const {
        loading: scanReceiptLoading,
        fn: scanReceiptFn,
        data: scannedData,
        error: scanError
    } = useFetch(scanReceipt);

    const handleReceiptScan = async(file) => {
        if(file.size > 50 * 1024 *1024) {
            toast.error(`AI scanner: File size exceeds limit.`);
            return;
        }
        console.log("File size: ", file.size,"byte", "<", 50 * 1024 *1024);
       
        await scanReceiptFn(file, ScannerUserId);
    };

    useEffect(() => {
        if(scannedData && !scanReceiptLoading) {
            onScanComplete(scannedData);
            toast.success("AI scanner: Receipt scanned successfully");
        }
    }, [scanReceiptLoading, scannedData]);



    useEffect(() => {
        if(scanError && !scanReceiptLoading) {
            toast.error("AI scanner: Scanning Failed.",scanError.message);
            console.log("Error scanning receipt 2 ", scanError);
        }
    }, [scanError])






    
  return (
    <div>

{isClient && (<><input 
        type="file" 
        ref={fileInputRef}
        className='hidden'
        accept='image/*'
        capture="environment"
        onChange={(e) => {
            const file = e.target.files?.[0];
            if(file) handleReceiptScan(file)
            }}
        />
    
       
    
  
    
    <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanReceiptLoading}
            className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 
            animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
            >
                {scanReceiptLoading
                    ? (<>
                        <Loader2 className='mr-2 animate-spin'/> 
                        Scanning Receipt </>
                    )
                    : (<>
                            <Camera className='mr-2'/> 
                               Scan Receipt with AI {scannedReceipt ?(<CircleCheck  className='text-green-400'/>) : ""}
                        </>
                    )
                }
        </Button>
   
        </> )}
         


    </div>
  )
}

export default ReceiptScanner;
