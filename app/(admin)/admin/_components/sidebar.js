"use client";
import { cn } from '@/lib/utils';
import { BookUser, LayoutDashboard, ScrollText, Loader2, Building2 } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation';


const routes = [
    {
        label: "My Dashboard",
        icon: LayoutDashboard,
        href: "/admin"
    },
    {
        label: "Clients",
        icon: Building2,
        href: "/admin/ClientsInfo"
    },
    {
        label: "Activity Log",
        icon: ScrollText,
        href: "/admin/activityLogs"
    },
    {
        label: "User List",
        icon: BookUser,
        href: "/admin/settings"
    },

]

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [loadingHref, setLoadingHref] = useState(null);

    // Listen for route changes to reset loader
    useEffect(() => {
        setLoadingHref(null);
    }, [pathname]);

    // Handler for link click
    const handleNav = (href) => (e) => {
        if (href !== pathname) {
            setLoadingHref(href);
        }
    };

   return (
        <>
            {/* Desktop sidebar */}
            <div className="hidden md:flex pt-7  h-full flex-col overflow-y-auto bg-white shadow-sm border-r">
                <div className="flex flex-col w-full">
                    {routes.map((route) => {
                        const isLoading = loadingHref === route.href;
                        const isAnyLoading = !!loadingHref;
                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={isAnyLoading ? undefined : handleNav(route.href)}
                                tabIndex={isAnyLoading ? -1 : 0}
                                aria-disabled={isAnyLoading}
                                className={cn(
                                    "flex items-center gap-x-2 text-black text-sm font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-100/50",
                                    pathname === route.href
                                        ? "text-blue-700 bg-blue-100/50 hover:bg-blue-100 hover:text-blue-700"
                                        : "",
                                    "h-12",
                                    isAnyLoading ? "pointer-events-none opacity-50" : ""
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                                ) : (
                                    <route.icon className="h-5 w-5" />
                                )}
                                {route.label}
                            </Link>
                        );
                    })}
                </div>
            </div> 

            {/* Mobile bottom nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around items-center h-16">
                {routes.map((route) => {
                    const isLoading = loadingHref === route.href;
                    const isAnyLoading = !!loadingHref;
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            onClick={isAnyLoading ? undefined : handleNav(route.href)}
                            tabIndex={isAnyLoading ? -1 : 0}
                            aria-disabled={isAnyLoading}
                            className={cn(
                                "flex flex-col items-center justify-center text-black text-xs font-medium transition-all",
                                pathname === route.href ? "text-blue-700" : "",
                                "py-1 flex-1",
                                isAnyLoading ? "pointer-events-none opacity-50" : ""
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 mb-1 animate-spin text-slate-600" />
                            ) : (
                                <route.icon className={cn(
                                    "h-6 w-6 mb-1",
                                    pathname === route.href ? "text-blue-700" : "text-black"
                                )} />
                            )}
                            {route.label}
                        </Link>
                    );
                })}
            </div> 
        </>
    );
}

export default Sidebar
