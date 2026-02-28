import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
    return (
        <>
            <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32 bg-gradient-to-br from-background to-secondary/20">
                <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto px-4">
                    <h1 className="font-heading text-3xl font-bold sm:text-5xl md:text-6xl lg:text-7xl text-primary">
                        Sparkling Clean,<br /> Every Time.
                    </h1>
                    <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                        Experience the ultimate freshness with our premium cleaning services.
                        Professional, reliable, and tailored to your needs.
                    </p>
                    <div className="space-x-4">
                        <Link to="/auth/signin">
                            <Button size="lg" className="rounded-full px-8">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </Link>
                        <Link to="/about">
                            <Button size="lg" variant="outline" className="rounded-full px-8">Learn More</Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="container space-y-6 py-12 md:py-24 lg:py-32 px-4 mx-auto">
                <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                    {[
                        { title: "Deep Cleaning", desc: "Thorough sanitization for every corner." },
                        { title: "Eco-Friendly", desc: "Safe products for your family and pets." },
                        { title: "Certified Staff", desc: "Vetted professionals you can trust." }
                    ].map((feature, i) => (
                        <div key={i} className="relative overflow-hidden rounded-lg border bg-background p-2">
                            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                                <CheckCircle2 className="h-12 w-12 text-primary" />
                                <div className="space-y-2">
                                    <h3 className="font-bold">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}
