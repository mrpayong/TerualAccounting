
import { SignIn, useUser } from '@clerk/nextjs'
import React from 'react'

export default function Page() {
  // const { isSignedIn, user, isLoaded } = useUser();
  // const hasLogged = useRef(false);

  // useEffect(() => {
  //   if (isLoaded && isSignedIn && user && !hasLogged.current) {
  //     hasLogged.current = true;
  //     fetch("/api/activityLog", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         action: "SIGN-IN",
  //         args: { userId: user.id, email: user.primaryEmailAddress?.emailAddress },
  //         result: { message: "User signed in successfully" },
  //         timestamp: new Date().toISOString(),
  //       }),
  //     }).catch((err) => {
  //       console.warn("Activity log failed:", err);
  //     });
  //   }
  // }, [isLoaded, isSignedIn, user]);


  return <SignIn />;
}

