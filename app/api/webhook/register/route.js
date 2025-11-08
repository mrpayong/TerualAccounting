import { UserSessionLogging } from '@/actions/admin';
import { db } from '@/lib/prisma';
import { verifyWebhook } from '@clerk/nextjs/webhooks'

export async function POST(data) {
    const event = await verifyWebhook(data);

    console.log("Received Clerk webhook event:", event);

    const ClerkUserId =  event.data.user_id;
    
    if(!ClerkUserId) {
        console.error("No user_id found in the event data");
        return new Response("No user_id found in the event data", { status: 400 });
    }


  let args = {};
  const eventType = event.type;
  if ((eventType === "session.created" || eventType === "session.removed") && !ClerkUserId) {
    console.error("No user_id found in the event data");
    return new Response("No user_id found in the event data", { status: 400 });
  }

    let userEmail = "";
    if (eventType === "email.created") {
      userEmail = event.data.to_email_address;
    }  

    const emailOnQueue = userEmail;
    const eventData = event.data;
    

    const user = await db.User.findUnique({ 
        where: {clerkUserId: ClerkUserId },
        select: { 
          email: true, 
          Fname: true, 
          Lname: true
        }
      }
    );
    if (!user) {
      console.error("User not found in database for clerkUserId:", ClerkUserId);
      return new Response("User not found in database", { status: 404 });
    }
  
  switch (eventType) {
    case "session.created":
      args = {
        clerkUserId: ClerkUserId,
        email: user.email,
        Fname: user.Fname,
        Lname: user.Lname,
        status: eventData.status, 
      };
      break;
    case "session.removed":
      args = {
        clerkUserId: ClerkUserId,
        email: user.email,
        Fname: user.Fname,
        Lname: user.Lname,
        status: eventData.status, // e.g., "active" or "removed"
      };
      break;

    case "email.created":
      args = {
        email: emailOnQueue,
        clerkUserId: ClerkUserId,
        status: eventData.status, // e.g., "active" or "removed"
      };
      break;

    default:
      args = {};
      console.log(`Unhandled event type: ${eventType}`);
      return new Response("Event ignored", { status: 400 });
  }

   
   await WebhookSessionLog({
    action: eventType.toUpperCase().replace('.', '-'),
    args,
    timestamp: new Date().toISOString(),
   })
  //   const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  //   await fetch(`/api/sessionLog`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     action: eventType.toUpperCase().replace('.', '-'),
  //     args,
  //     timestamp: new Date().toISOString(),
  //   }),
  // });
  return new Response("Webhook processed successfully", { status: 200 });
    
}

async function WebhookSessionLog({action, args, res, timestamp}) {
  try {
    const result = await UserSessionLogging({action, args, res, timestamp});
    if (!result.success) {
      return new Response(result.error || "Failed", { status: 500 });
    }
    return Response.json({ success: true });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
