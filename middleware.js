// import { createMiddleware } from "@arcjet/next";
import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { geolocation, ipAddress } from "@vercel/functions";
import { NextResponse } from "next/server";
// import arcjet, { detectBot, shield } from "arcjet";


const isProtectedRoute = createRouteMatcher([
    "/admin(.*)",
    "/SysAdmin(.*)",
    "/dashboard(.*)",
    "/transaction(.*)",

    "/account/:path*",
    "/Archive(.*)",
    "/CashflowStatement(.*)",
    "/CashReceiptBook(.*)",
    "/ClientInfo(.*)",
    "/DecisionSupport(.*)",
    "/DisbursementReceiptBook(.*)",
    "/SubAccounts(.*)",
]);



const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({mode: "LIVE"}),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"]
    }),
  ],
});

const clerk = clerkMiddleware(async (auth, req) => {
    const {userId} = await auth();
    if (!userId && isProtectedRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    return NextResponse.next();
});

function unauthCatch(req){
    // Geolocation/IP logic
    const ip = ipAddress(req);
    const geo = geolocation(req);
    const response = NextResponse.next();
    response.headers.set('x-real-ip', ip || '');
    response.headers.set('x-geo-city', geo.city || '');
    response.headers.set('x-geo-country', geo.country || '');
    return response;
}

export default createMiddleware(aj, clerk, unauthCatch);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
