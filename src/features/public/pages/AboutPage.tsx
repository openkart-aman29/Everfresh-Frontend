export default function AboutPage() {
    return (
        <div className="container py-12 px-4 mx-auto max-w-4xl">
            <h1 className="font-heading text-4xl font-bold text-center mb-8">About Everfresh</h1>
            <div className="prose prose-lg dark:prose-invert mx-auto">
                <p className="text-muted-foreground text-lg text-center mb-12">
                    We are dedicated to bringing purity and freshness to your environment.
                </p>
                <div className="grid gap-8 md:grid-cols-2">
                    <div className="rounded-lg border p-8 bg-card">
                        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                        <p className="text-muted-foreground">To provide top-tier cleaning services that prioritize health, sustainability, and customer satisfaction.</p>
                    </div>
                    <div className="rounded-lg border p-8 bg-card">
                        <h2 className="text-2xl font-bold mb-4">Our Team</h2>
                        <p className="text-muted-foreground">A group of passionate, certified professionals who treat your home with the same care as their own.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
