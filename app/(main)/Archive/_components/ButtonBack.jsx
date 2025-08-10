"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ButtonBack({id}) {
  const router = useRouter();
  const mainAccountId = id;
  const [isLoading, setIsLoading] = useState(false);

  const handleBackLoading = () => {
    setIsLoading(true);
    router.push(`/account/${mainAccountId}`)
  }

  return (
    <Button 
        type="button" 
        disabled={isLoading}
        variant="outline"
        className="bg-black text-white 
        hover:border-black hover:bg-white hover:text-black
        font-medium hover:font-normal text-sm md:!text-base
        tracking-wide h-5 md:h-9 px-2 md:px-4 py-3 md:py-2"
        onClick={handleBackLoading}>
      { isLoading
        ? (<>
            <Loader2 className="h-5 w-5 animate-spin"/>
            Back
        </>
        )
        : "Back"
      }
    </Button>
  );
}