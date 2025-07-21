"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function BackButton({id}) {
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
        className="bg-black text-white hover:border-black hover:bg-white hover:text-black"
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