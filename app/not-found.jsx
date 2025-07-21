
import { getUnauthUser } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { OctagonAlert } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const NotFound = async() => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[100vh] 
    px-4 text-center'> 
        <h1 ><OctagonAlert className="h-28 w-28 text-red-600 font-bold mb-4"/></h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
            Oops! You may not have access to this page.
        </p>
        <Link href='/'>
            <Button>Return Home</Button>
        </Link>
    </div>
  )
}

export default NotFound
