import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
    const user = await currentUser();
    if (!user){
        return null;
    }
   
    try {
        const loggedInUser = await db.user.findUnique({
            where: {
                clerkUserId: user.id,
            },
        });
        if (loggedInUser){
            return loggedInUser;
        } 
        return {message: "No logged in user."}


        // const newUser = await db.user.create({
        //     data: {
        //         clerkUserId: user.id,
        //         Fname: user.firstName,
        //         Lname: user.lastName,
        //         imageUrl: user.imageUrl,
        //         email: user.emailAddresses[0].emailAddress,
        //         username: user.username,
        //     },
        // });

        // return newUser;
    } catch (error) {
        console.error(error.message);
    }
}