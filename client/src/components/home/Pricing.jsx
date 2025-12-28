import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Zap, Crown } from 'lucide-react';

const plans = [
    {
        name: "Free",
        price: "0",
        description: "Perfect for getting started with your first resume.",
        features: [
            "1 Resume Template",
            "Basic Formatting",
            "PDF Download (Watermarked)",
            "3 AI Bullet Points/day",
        ],
        notIncluded: [
            "Premium Templates",
            "Unlimited AI Writing",
            "Cover Letter Builder",
        ],
        icon: <Zap className="w-6 h-6" />,
        popular: false,
        color: "slate"
    },
    {
        name: "Pro",
        price: "499",
        description: "Everything you need to land your dream job.",
        features: [
            "All Premium Templates",
            "Unlimited AI Writing",
            "ATS Optimization",
            "PDF Download (No Watermark)",
            "Cover Letter Builder",
            "Priority Support"
        ],
        notIncluded: [],
        icon: <Sparkles className="w-6 h-6" />,
        popular: true,
        color: "indigo"
    },
    {
        name: "Ultimate",
        price: "999",
        description: "For serious job seekers needing maximum impact.",
        features: [
            "Everything in Pro",
            "LinkedIn Profile Optimization",
            "1-on-1 Resume Review",
            "Interview Preparation Guide",
            "Lifetime Access"
        ],
        notIncluded: [],
        icon: <Crown className="w-6 h-6" />,
        popular: false,
        color: "purple"
    }
];

const Pricing = () => {
    return (
        <section id="pricing" className="py-12 lg:py-20 bg-slate-50 relative overflow-hidden scroll-mt-0 min-h-screen flex flex-col justify-center">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-2xl mx-auto mb-10"
                >
                    <span className="text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-2 block">Simple Pricing</span>
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">Invest in your career <br /> without breaking the bank</h2>
                    <p className="text-slate-600 text-lg">Transparent pricing tailored for Indian job seekers.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                            className={`relative bg-white rounded-2xl p-6 border hover:shadow-2xl transition-all duration-300 flex flex-col ${plan.popular ? 'border-indigo-500 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50' : 'border-slate-200 shadow-sm'}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Most Popular
                                </div>
                            )}

                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${plan.popular ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                {plan.icon}
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                            <p className="text-slate-500 text-xs mb-4 min-h-[2.5rem]">{plan.description}</p>

                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-3xl font-bold text-slate-900">₹{plan.price}</span>
                                {plan.price !== "0" && <span className="text-slate-500 text-xs">/month</span>}
                            </div>

                            <div className="space-y-2.5 mb-6 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                        <Check className={`w-4 h-4 shrink-0 ${plan.popular ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                                {plan.notIncluded.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                                        <X className="w-4 h-4 shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${plan.popular
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                    : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
                                }`}>
                                {plan.price === "0" ? "Get Started" : "Choose Plan"}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
