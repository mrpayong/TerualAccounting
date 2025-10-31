
import { Button } from '@/components/ui/button'
import { OctagonAlert } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const NotFound404 = async() => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[100vh] 
    px-4 text-center'> 
        <h1 ><OctagonAlert className="h-28 w-28 text-red-600 font-bold mb-4"/></h1>
        <h2 className="text-2xl font-semibold mb-4">Data Unavailable</h2>
        <p className="text-gray-600 mb-8">
            Error fetching data.
        </p>
        <Link href='/'>
            <Button>Return Home</Button>
        </Link>
    </div>
  )
}

export default NotFound404;
