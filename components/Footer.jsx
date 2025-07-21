import React from 'react'

const Footer = () => {
  return (
    <div 
        className={`top-0 w-full bg-white backdrop-blur-md 
        z-50 border-b rounded-b-lg  transition-colors 
        duration-300`}>
            <footer className="bg-blue-50 py-0">
              <div className="container mx-auto px-4 text-center text-gray-600">
                <p className='text-xs'>© 2025 Financial Management System. All rights reserved.</p>
              </div>

            </footer>
      
    </div>
  )
}

export default Footer
