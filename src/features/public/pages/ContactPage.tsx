import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ContactPage() {
    return (
        <div className="container py-12 px-4 mx-auto max-w-2xl">
            <h1 className="font-heading text-4xl font-bold text-center mb-8">Contact Us</h1>
            <div className="rounded-lg border bg-card p-8 shadow-sm">
                <form className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="john@example.com" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <textarea
                            id="message"
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="How can we help you?"
                        />
                    </div>
                    <Button className="w-full">Send Message</Button>
                </form>
            </div>
        </div>
    )
}
