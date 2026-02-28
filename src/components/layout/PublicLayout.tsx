import { Link, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function PublicLayout() {
    return (
        <div className="flex min-h-screen flex-col font-sans">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-8">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
                            <span className="text-lg">E</span>
                        </div>
                        <span className="font-heading hidden md:inline-block">Everfresh</span>
                    </Link>
                    <nav className="flex gap-6 text-sm font-medium">
                        <Link to="/" className="transition-colors hover:text-foreground/80 text-foreground/60">Home</Link>
                        <Link to="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">About</Link>
                        <Link to="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60">Contact</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Link to="/auth/signin">
                            <Button size="sm">Sign In</Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="border-t bg-muted/50">
                <div className="container px-4 md:px-8 py-8 md:py-12">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Everfresh</h3>
                            <p className="text-sm text-muted-foreground w-64">Premium cleaning services for your home and office. Experience the freshness.</p>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Everfresh Cleaning. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
