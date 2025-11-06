// import { createMiddleware } from "@arcjet/next";
import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { geolocation, ipAddress } from "@vercel/functions";
import { NextResponse } from "next/server";
import NotFound from "./app/not-found";
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
      // NotFound();
    }
    return NextResponse.next();
});

function unauthCatch(req){
    // Geolocation/IP logic
    // const ip = ipAddress(req);
    // // const loc = geolocation(req);
    // // const {country} = geolocation(req);
    // const response = NextResponse.next();
    // response.headers.set('x-forwarded-for', ip || '');
    // // response.headers.set('X-Vercel-IP-City', loc || '');
    // // response.headers.set('X-Vercel-IP-Country', country || '');
    // return response;


     // Use NextRequest.geo (available in Edge middleware) and request headers.
    // req is a NextRequest in middleware runtime.
    const geo = (req && req.geo) || {};

    // copy existing request headers and add geo headers
    const forwarded = new Headers(req.headers);
    // preserve existing x-forwarded-for if present, else try req.ip (Edge may provide)
    const existingFwd = forwarded.get("x-forwarded-for") || forwarded.get("x-real-ip") || (req.ip ? String(req.ip) : "");
    if (existingFwd) forwarded.set("x-forwarded-for", existingFwd);

    forwarded.set("x-geo-city", geo.city || "");
    forwarded.set("x-geo-country", geo.country || "");
    forwarded.set("x-geo-region", geo.region || "");
    forwarded.set("x-geo-latitude", String(geo.latitude ?? ""));
    forwarded.set("x-geo-longitude", String(geo.longitude ?? ""));

    // Return NextResponse.next with modified request headers so downstream server code sees them.
    return NextResponse.next({ request: { headers: forwarded } });
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
