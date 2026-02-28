import { Link, useLocation } from 'react-router-dom'
import {
    LogOut,
    Menu,
    X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppSelector } from '@/store/useStoreHook'

import { MAIN_NAV, PEOPLE_NAV, SYSTEM_NAV } from '@/config/navigation'

interface SidebarProps {
    className?: string
}

interface SidebarContentProps {
    collapsed?: boolean
    userRoles: string[]
    relevantMainNav: any[]
    relevantPeopleNav: any[]
    relevantSystemNav: any[]
    location: any
    setIsOpen: (open: boolean) => void
}

function SidebarContent({
    collapsed = false,
    userRoles,
    relevantMainNav,
    relevantPeopleNav,
    relevantSystemNav,
    location,
    setIsOpen
}: SidebarContentProps) {
    const isActive = (path: string) => location.pathname === path
    const activeRouteStyles = "text-white"
    const inactiveRouteStyles = "text-gray-400 group-hover:text-white"

    const renderNavItem = (item: any) => {
        const active = isActive(item.path)

        const LinkContent = (
            <Link
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                    "relative group flex items-center rounded-lg transition-all duration-200 hover:bg-[hsl(var(--sidebar-accent))]",
                    collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
                )}
            >
                {active && (
                    <motion.div
                        layoutId="activeNavIndicator"
                        className={cn(
                            "absolute left-0 top-0 h-full w-1 rounded-r bg-[hsl(var(--primary))]",
                            collapsed ? "h-8 top-1/2 -translate-y-1/2" : ""
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}

                <item.icon className={cn(
                    "transition-colors",
                    active ? "text-[hsl(var(--primary))]" : inactiveRouteStyles,
                    collapsed ? "h-6 w-6" : "h-5 w-5"
                )} />

                {!collapsed && (
                    <span className={cn(
                        "transition-colors text-sm font-medium",
                        active ? activeRouteStyles : inactiveRouteStyles
                    )}>
                        {item.label}
                    </span>
                )}
            </Link>
        )

        if (collapsed) {
            return (
                <Tooltip delayDuration={0} key={item.path}>
                    <TooltipTrigger asChild>
                        {LinkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
                        {item.label}
                    </TooltipContent>
                </Tooltip>
            )
        }

        return <div key={item.path}>{LinkContent}</div>
    }

    return (
        <div className="flex h-full flex-col bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] shadow-xl overflow-hidden">
            {/* Brand */}
            <div className={cn(
                "flex h-16 items-center border-b border-[hsl(var(--sidebar-border))]",
                collapsed ? "justify-center px-0" : "px-6"
            )}>
                <Link to={userRoles.includes('admin') || userRoles.includes('super_admin') ? "/app/dashboard" : "/app/staff"} className="flex items-center gap-3 font-bold text-xl text-white group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.2)] transition-transform group-hover:scale-105">
                        <span className="text-lg font-bold">E</span>
                    </div>
                    {!collapsed && <span className="font-heading tracking-tight">Everfresh</span>}
                </Link>
            </div>

            {/* Nav Content */}
            <div className={cn(
                "flex-1 overflow-y-auto py-6 space-y-8 scrollbar-thin scrollbar-thumb-[hsl(var(--sidebar-border))] hover:scrollbar-thumb-gray-600",
                collapsed ? "px-2" : "px-4"
            )}>
                <TooltipProvider>
                    {/* Main Group */}
                    {relevantMainNav.length > 0 && (
                        <div className="space-y-1">
                            {!collapsed && <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Platform</h4>}
                            {relevantMainNav.map(renderNavItem)}
                        </div>
                    )}

                    {/* People Group */}
                    {relevantPeopleNav.length > 0 && (
                        <div className="space-y-1">
                            {!collapsed && <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Management</h4>}
                            {relevantPeopleNav.map(renderNavItem)}
                        </div>
                    )}

                    {/* System Group */}
                    {relevantSystemNav.length > 0 && (
                        <div className="space-y-1">
                            {!collapsed && <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">System</h4>}
                            {relevantSystemNav.map(renderNavItem)}
                        </div>
                    )}
                </TooltipProvider>
            </div>

            {/* Footer / Sign Out */}
            <div className={cn(
                "border-t border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))]",
                collapsed ? "p-2" : "p-4"
            )}>
                {collapsed ? (
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-full h-10 justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Sign Out</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="font-medium">Sign Out</span>
                    </Button>
                )}
            </div>
        </div>
    )
}

export function Sidebar({ className }: SidebarProps) {
    const location = useLocation()
    const [isOpen, setIsOpen] = useState(false)

    const toggleSidebar = () => setIsOpen(!isOpen)

    const { user } = useAppSelector((state: any) => state.staffAuth)

    // Role-based navigation filtering
    const userRoles = user?.roles || []

    const hasPermission = (item: any) => {
        return item.allowedRoles.some((role: string) => userRoles.includes(role))
    }

    const relevantMainNav = MAIN_NAV.filter(hasPermission)
    const relevantPeopleNav = PEOPLE_NAV.filter(hasPermission)
    const relevantSystemNav = SYSTEM_NAV.filter(hasPermission)

    return (
        <>
            {/* Mobile Trigger */}
            <div className="fixed top-4 left-4 z-50 md:hidden">
                <Button size="icon" variant="outline" onClick={toggleSidebar} className="bg-background shadow-md border-border">
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar (Drawer) */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-[260px] bg-[hsl(var(--sidebar-background))] transition-transform duration-300 ease-in-out md:hidden",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <SidebarContent
                    collapsed={false}
                    userRoles={userRoles}
                    relevantMainNav={relevantMainNav}
                    relevantPeopleNav={relevantPeopleNav}
                    relevantSystemNav={relevantSystemNav}
                    location={location}
                    setIsOpen={setIsOpen}
                />
            </div>

            {/* Desktop Sidebar (Static Collapsed) */}
            <aside
                className={cn(
                    "hidden md:block sticky top-0 h-screen w-[70px] border-r border-border bg-[hsl(var(--sidebar-background))]",
                    className
                )}
            >
                <SidebarContent
                    collapsed={true}
                    userRoles={userRoles}
                    relevantMainNav={relevantMainNav}
                    relevantPeopleNav={relevantPeopleNav}
                    relevantSystemNav={relevantSystemNav}
                    location={location}
                    setIsOpen={setIsOpen}
                />
            </aside>
        </>
    )
}
