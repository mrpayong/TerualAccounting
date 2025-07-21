
import { Inter} from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import Footer from "@/components/Footer";

const inter = Inter({subsets:["latin"]});

export const metadata = {
  title: "Teruel Accounting",
  description: "Teruel Accounting Firm Financial Management System",
};



export default function RootLayout({ children }) {
  

  return (
    <ClerkProvider>
        <html lang="en">
          <body
            className={`${inter.className}`}
          >
              <Header />
                <main className="min-h-screen relative z-0">
                 
                      {children}
                    
                  
                </main>
            <Toaster richColors/>
            
            {/* <footer className="bg-blue-50 py-4">
               <div className="container mx-auto px-4 text-center text-gray-600">
                <p className="text-xs">© 2025 Financial Management System. All rights reserved.</p>
              </div>  


            </footer> */}
            <Footer/>
          </body>
        </html>
    </ClerkProvider>
  );
}
