import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Zap, ShieldCheck } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../configs/api';
import { loadRazorpayScript } from '../utils/razorpayUtils';

// Redesigned Plans Data aligned with the new minimal style
const defaultPlans = [
    {
        name: "Ultimate",
        price: "999",
        amount: 99900,
        period: "/6 months",
        validityMonths: 6,
        description: "Maximum career impact",
        features: [
            "Everything in Pro",
            "LinkedIn Profile Optimization",
            "1-on-1 Resume Review",
            "Interview Preparation Guide",
            "Lifetime Access to Future Features",
            "Dedicated Career Success Manager"
        ],
        icon: <Crown className="w-5 h-5 text-white" />,
        popular: false,
        theme: "dark",
        type: "Ultimate",
        badge: "Premium"
    },
    {
        name: "Pro",
        price: "499",
        amount: 49900,
        period: "/6 months",
        validityMonths: 6,
        description: "Best for active job seekers",
        features: [
            "All Premium Templates",
            "Unlimited AI Writing",
            "ATS Optimization",
            "PDF Download (No Watermark)",
            "Cover Letter Builder",
            "Priority Support"
        ],
        icon: <Zap className="w-5 h-5 text-slate-800" />,
        popular: true,
        theme: "light",
        type: "Pro",
        badge: "Standard"
    }
];

const SubscriptionPage = () => {
    const { user } = useSelector(state => state.auth);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleProceed = async (couponCode) => {
        setLoading(true);
        try {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error('Razorpay SDK failed to load.');
                setLoading(false);
                return;
            }

            const { data: orderData } = await api.post('/api/payment/create-order', {
                planType: selectedPlan.type,
                discountCode: couponCode
            });

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "KareerGrowth",
                description: `Upgrade to ${orderData.planName}`,
                image: "/logo.svg",
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        const verifyData = {
                            orderId: orderData.orderId,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        };
                        const { data: verifyResponse } = await api.post('/api/payment/verify-payment', verifyData);
                        if (verifyResponse.success) {
                            toast.success('Subscription activated!');
                            window.location.reload();
                        }
                    } catch (error) {
                        toast.error('Payment verification failed.');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: { color: "#111827" }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] md:overflow-hidden overflow-y-auto bg-[#F3F4F6] flex items-center justify-center font-[Inter] py-8 md:py-0">
            <div className="w-full max-w-5xl mx-auto px-4">

                <div className="grid md:grid-cols-2 gap-6 items-center max-w-4xl mx-auto">
                    {defaultPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className={`relative rounded-[32px] p-8 flex flex-col justify-between h-[520px] shadow-sm transition-all duration-300 ${plan.theme === 'dark'
                                ? 'bg-[#0F1115] text-white shadow-2xl ring-1 ring-white/10'
                                : 'bg-white text-slate-900 shadow-xl shadow-slate-200/50'
                                }`}
                        >
                            {/* Header Section */}
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'
                                            }`}>
                                            {plan.icon}
                                        </div>
                                        <h3 className={`text-lg font-semibold ${plan.theme === 'dark' ? 'text-white' : 'text-slate-900'
                                            }`}>
                                            {plan.name}
                                        </h3>
                                    </div>

                                    {plan.badge && (
                                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${plan.theme === 'dark'
                                            ? 'bg-[#2A2D35] text-[#FFD700] border border-[#FFD700]/20'
                                            : 'bg-orange-50 text-orange-500 border border-orange-100'
                                            }`}>
                                            {plan.theme === 'dark' && <Crown className="w-3 h-3 fill-current" />}
                                            {plan.badge}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold tracking-tight">₹{plan.price}</span>
                                        <span className={`text-sm ${plan.theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
                                            }`}>{plan.period}</span>
                                    </div>
                                    <p className={`text-xs mt-2 font-medium ${plan.theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
                                        }`}>
                                        {plan.description}
                                    </p>
                                </div>

                                <hr className={`my-6 border-dashed ${plan.theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
                                    }`} />

                                <div className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className={`mt-0.5 rounded-full p-0.5 ${plan.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-slate-100 text-slate-900'
                                                }`}>
                                                <Check className="w-2.5 h-2.5" />
                                            </div>
                                            <span className={`text-[13px] font-medium leading-tight ${plan.theme === 'dark' ? 'text-gray-300' : 'text-slate-600'
                                                }`}>
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom Section */}
                            <div className="mt-8">
                                <button
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all transform active:scale-[0.98] ${plan.theme === 'dark'
                                        ? 'bg-white text-black hover:bg-gray-100'
                                        : 'bg-black text-white hover:bg-gray-900 shadow-lg shadow-slate-300/50'
                                        }`}
                                >
                                    {plan.theme === 'dark' ? 'Upgrade to Ultimate' : 'Start with Pro'}
                                </button>

                                <p className={`text-[10px] text-center mt-3 flex items-center justify-center gap-1.5 ${plan.theme === 'dark' ? 'text-gray-600' : 'text-slate-400'
                                    }`}>
                                    <ShieldCheck className="w-3 h-3" />
                                    Secure payment via Razorpay
                                </p>
                            </div>

                        </motion.div>
                    ))}
                </div>
            </div>

            {selectedPlan && (
                <CheckoutModal
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                    onProceed={handleProceed}
                />
            )}
        </div>
    );
};

export default SubscriptionPage;
