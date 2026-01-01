import React, { useState } from 'react';
import { loadRazorpayScript } from '../utils/razorpayUtils';
import api from '../configs/api';
import toast from 'react-hot-toast';
import { Check, X, CreditCard, Sparkles, Crown } from 'lucide-react';
import { useSelector } from 'react-redux';
import CheckoutModal from './CheckoutModal';

const PLANS = {
    Pro: {
        amount: 49900, // ₹499 in paise
        credits: 5,
        validityMonths: 3,
        name: 'Pro Plan'
    },
    Ultimate: {
        amount: 99900, // ₹999 in paise
        credits: 15,
        validityMonths: 3,
        name: 'Ultimate Plan'
    }
};

const Pricing = ({ onClose, onSuccess }) => {
    const { user } = useSelector(state => state.auth);
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const handleSelectPlan = (planType) => {
        setSelectedPlan({ ...PLANS[planType], type: planType });
    };

    const proceedToPayment = async (couponCode) => {
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
                discountCode: couponCode // Pass coupon code
            });

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "KareerGrowth",
                description: `Upgrade to ${orderData.planName}`,
                image: "/logo.svg", // Ensure this exists
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        // 2. Verify Payment on Backend
                        const verifyData = {
                            orderId: orderData.orderId,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        };

                        const { data: verifyResponse } = await api.post('/api/payment/verify-payment', verifyData);

                        if (verifyResponse.success) {
                            toast.success('Payment successful! Plan upgraded.');
                            if (onSuccess) {
                                onSuccess();
                            } else {
                                if (onClose) onClose();
                                window.location.reload();
                            }
                        } else {
                            toast.error('Payment verification failed.');
                        }
                    } catch (error) {
                        toast.error('Payment verification failed. Please contact support.');
                        console.error(error);
                    }
                },
                prefill: {
                    name: orderData.userName,
                    email: orderData.userEmail,
                    contact: "" // Can add if phone is available
                },
                notes: {
                    address: "KareerGrowth Corporate Office"
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
            // Don't close summary yet, wait for user action or success
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X className="w-6 h-6 text-slate-500" />
                </button>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Upgrade Your Plan</h2>
                    <p className="text-slate-600 max-w-xl mx-auto">
                        Unlock more credits and premium features to accelerate your career growth.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Pro Plan */}
                    <div className="relative group p-8 rounded-3xl border-2 border-slate-100 bg-white hover:border-indigo-500 hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-bl-2xl rounded-tr-2xl uppercase tracking-wider">
                            Popular
                        </div>
                        <div className="mb-6">
                            <Sparkles className="w-10 h-10 text-indigo-600 mb-4" />
                            <h3 className="text-2xl font-bold text-slate-900">Pro Plan</h3>
                            <div className="mt-4 flex items-baseline text-slate-900">
                                <span className="text-4xl font-extrabold tracking-tight">₹499</span>
                                <span className="ml-1 text-xl font-semibold text-slate-500">/6mo</span>
                            </div>
                        </div>
                        <ul className="mb-8 space-y-4 text-slate-600">
                            {[
                                "50 AI Resume Credits",
                                "Access to Premium Templates",
                                "AI Score Analysis",
                                "Priority Email Support",
                                "6 Months Validity"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center">
                                    <Check className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleSelectPlan('Pro')}
                            disabled={loading}
                            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-colors flex items-center justify-center gap-2"
                        >
                            Select Plan
                        </button>
                    </div>

                    {/* Ultimate Plan */}
                    <div className="relative group p-8 rounded-3xl border-2 border-violet-100 bg-slate-50 hover:border-violet-500 hover:shadow-xl transition-all duration-300">
                        <div className="mb-6">
                            <Crown className="w-10 h-10 text-violet-600 mb-4" />
                            <h3 className="text-2xl font-bold text-slate-900">Ultimate Plan</h3>
                            <div className="mt-4 flex items-baseline text-slate-900">
                                <span className="text-4xl font-extrabold tracking-tight">₹999</span>
                                <span className="ml-1 text-xl font-semibold text-slate-500">/year</span>
                            </div>
                        </div>
                        <ul className="mb-8 space-y-4 text-slate-600">
                            {[
                                "200 AI Resume Credits",
                                "All Pro Features",
                                "Lifetime Access to New Templates",
                                "Dedicated Career Advisor",
                                "1 Year Validity"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center">
                                    <Check className="w-5 h-5 text-violet-500 mr-3 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleSelectPlan('Ultimate')}
                            disabled={loading}
                            className="w-full py-4 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg transition-colors flex items-center justify-center gap-2"
                        >
                            Select Plan
                        </button>
                    </div>
                </div>
            </div>

            {/* Check out Modal */}
            {selectedPlan && (
                <CheckoutModal
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                    onProceed={proceedToPayment}
                />
            )}
        </div>
    );
};

export default Pricing;
