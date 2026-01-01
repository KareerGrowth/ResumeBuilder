import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Zap, Crown } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../configs/api';
import { loadRazorpayScript } from '../utils/razorpayUtils';

// Note: Reusing plans data. In a real app, this might come from config or API.
const defaultPlans = [
    {
        name: "Pro",
        price: "499",
        amount: 49900,
        validityMonths: 6,
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
        color: "indigo",
        type: "Pro"
    },
    {
        name: "Ultimate",
        price: "999",
        amount: 99900,
        validityMonths: 12,
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
        color: "purple",
        type: "Ultimate"
    }
];

const SubscriptionPage = () => {
    const { user } = useSelector(state => state.auth);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
    };

    const handleProceed = async (couponCode) => {
        setLoading(true);
        try {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                setLoading(false);
                return;
            }

            // 1. Create Order on Backend
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
                            toast.success('Payment successful! Subscription activated.');
                            window.location.reload(); // Refresh to show new credits/status
                        } else {
                            toast.error('Payment verification failed.');
                        }
                    } catch (error) {
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                notes: { address: "KareerGrowth Corporate Office" },
                theme: { color: "#4f46e5" }
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
        <div className="p-4 md:p-8 animate-fade-in pb-20 md:pb-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Upgrade Your Plan
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                        Choose the perfect plan to accelerate your career growth. <br className="hidden md:block" />
                        Unlock premium features and AI credits.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {defaultPlans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 flex flex-col ${plan.popular
                                    ? 'border-indigo-500 shadow-xl shadow-indigo-100'
                                    : 'border-slate-100 hover:border-slate-300 hover:shadow-lg'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        Popular
                                    </span>
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${plan.popular ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'
                                }`}>
                                {plan.icon}
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                            <p className="text-slate-500 text-sm mb-6 h-10">{plan.description}</p>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-extrabold text-slate-900">₹{plan.price}</span>
                                <span className="text-slate-500 font-medium">
                                    /{plan.validityMonths === 12 ? 'year' : '6mo'}
                                </span>
                            </div>

                            <div className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                            <Check className={`w-3 h-3 ${plan.popular ? 'text-indigo-600' : 'text-slate-600'}`} />
                                        </div>
                                        <span className="text-sm text-slate-700 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSelectPlan(plan)}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-[0.98] ${plan.popular
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                                    }`}
                            >
                                Upgrade to {plan.name}
                            </button>
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
