import { Bell, Search, User, ChevronRight, LogOut, Settings, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppSelector, useAppDispatch } from '@/store/useStoreHook'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocation, Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { logout } from '@/features/auth/staff/slices/StaffAuthSlice'
import { useSignOutMutation } from '@/features/auth/staff/apis/StaffAuthAPI'

export function Header() {
    const { user } = useAppSelector(state => state.staffAuth)
    const location = useLocation()
    const dispatch = useAppDispatch()
    const [signOut] = useSignOutMutation()

    // Generate breadcrumbs/title based on path
    const getPageTitle = () => {
        const path = location.pathname
        if (path.includes('dashboard')) return 'Dashboard'
        if (path.includes('scheduler')) return 'Scheduler'
        if (path.includes('customers')) return 'Customers'
        if (path.includes('staff')) return 'Staff Management'
        if (path.includes('admin')) return 'Admin Management'
        return 'Overview'
    }

    const handleLogout = async () => {
        try {
            await signOut().unwrap()
        } catch (e) { console.error(e) }
        finally {
            dispatch(logout())
        }
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 transition-all">
            <div className="flex flex-1 items-center gap-2">
                {/* Breadcrumb Mock */}
                <div className="flex items-center text-sm text-muted-foreground ml-10 md:ml-0">
                    <span className="hover:text-foreground transition-colors cursor-pointer">App</span>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <span className="font-medium text-foreground">{getPageTitle()}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block w-64 group">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full bg-secondary/50 pl-8 md:w-[200px] lg:w-[300px] border-transparent focus:bg-background focus:border-input transition-all"
                    />
                </div>

                <Button variant="ghost" size="icon" className="relative hover:bg-secondary/80">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)]">
                                <User className="h-5 w-5 text-[hsl(var(--primary))]" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.first_name} {user?.last_name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/app/settings">
                                <UserCircle className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={ROUTES.ADMIN}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Admin</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
