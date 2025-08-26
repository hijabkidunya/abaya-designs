export default function FeaturesSection() {
    return (
        <section className="py-12 px-4">
            <div className="container mx-auto max-w-screen-2xl px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                            <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                        <p className="text-muted-foreground">
                            Carefully selected fabrics and materials for lasting comfort
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                            <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
                        <p className="text-muted-foreground">Quick and secure delivery to your doorstep worldwide</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                            <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Customer Love</h3>
                        <p className="text-muted-foreground">Trusted by thousands of satisfied customers globally</p>
                    </div>
                </div>
            </div>
        </section>
    )
} 