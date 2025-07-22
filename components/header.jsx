
import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/nextjs'
import React from 'react'
import Image from "next/image"
import Link from 'next/link'
import { Button } from './ui/button'
import { ArrowLeft, AtomIcon, House, Layout, LayoutDashboard, PenBox } from 'lucide-react'
import { checkUser } from '@/lib/checkUser'
import { Drawer } from './ui/drawer'
import HeaderClient from './HeaderClient'



const Header = async ({isAdminPage = false, SysAdminPage=false}) => {
  const user = await checkUser();

  const isStaff = user?.role === "STAFF";

  const isAdmin = user?.role === "ADMIN";
  const isSysAdmin = user?.role === "SYSADMIN";
  const isSignedIn = !!user;

  console.log("user:", user.role, isSignedIn)

  return (
    // <div className='fixed top-0 w-full bg-gradient-to-r from-sky-300 to-white backdrop-blur-md z-50 border-b'>
    //   <nav className='container max-auto px-4 py-4 flex items-center justify-between'>
    //     <Link href={isAdminPage ? "/admin" : '/'} className='flex items-center'>
    //       <div className="flex items-center gap-1">
    //         <Image
    //           className="h-16 w-auto object-contain"
    //           src={'/try2.png'}
    //           alt="TA logo"
    //           width={60}
    //           height={200}
    //         />
           
    //         <div className="flex flex-col items-start">
    //           <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-gray-300 to-gray-500 bg-clip-text text-transparent">
    //             Teruel
    //           </h1>
    //           <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-400 via-gray-300 to-yellow-500 bg-clip-text text-transparent">
    //             Accounting
    //           </h1>
    //         </div>
    //       </div>
    //         {isAdminPage && (
    //           <span className='text-xs font-extralight'>Admin</span>
    //         )}
    //     </Link>
  
               
      
    //     <div className="flex items-center space-x-4">
    //     <Link href={"/"} className="text-gray-600 hover:text-blue-600 flex items-center gap-2"> 
    //         <Button variant="outline">
    //           <House size={18}/>
    //           <span className='hidden md:inline'>Home</span>
    //         </Button>
    //     </Link>
    //       {isAdminPage 
    //         ? (
    //             <Link href={"/dashboard"} className="text-gray-600 hover:text-blue-600 flex items-center gap-2"> 
    //               <Button variant="outline">
    //                 <ArrowLeft size={18}/>
    //                 <span className='hidden md:inline'>Back to App</span>
    //               </Button>
    //             </Link>
    //           ) 

    //         : (
    //             <SignedIn>

    //               <Link href={"/dashboard"} className="text-gray-600 hover:text-blue-600 flex items-center gap-2"> 
    //                   <Button variant="outline">
    //                   <LayoutDashboard size={18}/>
    //                   <span className='hidden md:inline'>Dashboard</span>
    //                 </Button>
    //               </Link>

    //               <Link href={"/DecisionSupport"} className="text-gray-600 hover:text-blue-600 flex items-center gap-2"> 
    //                   <Button variant="outline">
    //                   <AtomIcon size={18}/>
    //                   <span className='hidden md:inline'>Forecasting</span>
    //                 </Button>
    //               </Link>


    //               {isAdmin &&
    //                 <Link href={"/admin"}> 
    //                     <Button variant="outline" className="flex items-center gap-2">
    //                       <Layout size={18} />
    //                       <span className='hidden md:inline'>Admin Portal</span>
    //                     </Button>
    //                   </Link>
    //                 }

    //             </SignedIn>
    //           )
    //         }



    //     <SignedOut>
    //       <SignInButton>
    //         <Link href={"/sign-in"} className="text-gray-600 hover:text-blue-600 flex items-center gap-2"> 
    //           <Button>
    //             Log In
    //           </Button>
    //           <span className="text-gray-600 hidden md:inline">
    //             <strong>Welcome!</strong>
    //           </span>
    //         </Link>
    //       </SignInButton>
    //     </SignedOut>



        

    //     <SignedIn>
    //       <UserButton 
    //         appearance={{
    //           elements: {
    //             avatarBox: "w-10 h-10",
    //           }
    //         }}/>
    //     </SignedIn>
    //     </div>
    //     </nav>
    // </div>
    

    <HeaderClient
      isAdminPage={isAdminPage}
      isAdmin={isAdmin}
      isStaff = {isStaff}
      isSignedIn={isSignedIn}
      isSysAdmin={isSysAdmin}
      SysAdminPage={SysAdminPage}
    />
    
        
  )
}

export default Header
