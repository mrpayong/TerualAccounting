
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
export const checkUser = async () => {
    const { userId } = await auth()
    
    if (!userId){
        return null;
    }
    console.log("userId: ",userId)
    try {
        const loggedInUser = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });
        if (loggedInUser){
            return loggedInUser;
        }


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