'use client'
import { UserButton, useClerk } from '@clerk/nextjs'

const UserButtonWithLogging = () => {
  const { signOut } = useClerk()

  const handleCustomSignOut = async () => {
    // Log the sign-out event
    await fetch('/api/activityLog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SIGN-OUT',
        result: { message: 'User signed out via UserButton' },
        timestamp: new Date().toISOString(),
      }),
    })

    // Then sign out
    await signOut({ redirectUrl: '/' })
  }

  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action 
          label="signOut" 
          onClick={handleCustomSignOut}
        />
      </UserButton.MenuItems>
    </UserButton>
  )
}

export default UserButtonWithLogging