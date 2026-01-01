import React, { useState } from 'react';
import { X, Check, Loader2, Tag } from 'lucide-react';
import api from '../configs/api';
import toast from 'react-hot-toast';

const CheckoutModal = ({ plan, onClose, onProceed }) => {
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(null);
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState('');

    const originalPrice = plan.amount / 100; // Convert to Rupees
    // Assume price includes GST for simplicity or add on top. 
    // Requirement says "show GST". Let's assume inclusive or exclusive. 
    // Usually ₹499 is inclusive. Let's show breakdown.
    // Price breakdown: Base + GST = Total
    // Base = Total / 1.18
    const gstRate = 0.18;
    const basePrice = originalPrice / (1 + gstRate);
    const gstAmount = originalPrice - basePrice;

    const discountAmount = discount
        ? (originalPrice * discount.discountPercentage) / 100
        : 0;

    const finalPrice = originalPrice - discountAmount;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setValidating(true);
        setError('');
        setDiscount(null);

        try {
            const { data } = await api.post('/api/payment/validate-discount', { code: couponCode });
            if (data.success) {
                setDiscount(data.discount);
                toast.success(`Coupon Applied! You saved ${data.discount.discountPercentage}%`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid Coupon Code');
            setDiscount(null);
        } finally {
            setValidating(false);
        }
    };

    const handleProceed = () => {
        onProceed(couponCode, finalPrice);
    };

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Plan Details */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg">{plan.name}</h4>
                            <p className="text-slate-500 text-sm">Valid for {plan.validityMonths} months</p>
                        </div>
                        <div className="font-bold text-slate-900 text-lg">
                            ₹{originalPrice.toFixed(2)}
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Breakdown */}
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-slate-600">
                            <span>Base Price</span>
                            <span>₹{basePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>GST (18%)</span>
                            <span>₹{gstAmount.toFixed(2)}</span>
                        </div>

                        {discount && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                                <span className="flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    Discount ({discount.discountPercentage}%)
                                </span>
                                <span>- ₹{discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between pt-3 border-t border-slate-100 font-bold text-lg text-slate-900">
                            <span>Total Amount</span>
                            <span>₹{finalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Coupon Input */}
                    <div className="pt-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                            Have a Promo Code?
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Enter Code"
                                    disabled={discount} // Disable input if applied? Optional.
                                    className={`w-full bg-slate-50 border ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'} rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-900 placeholder:text-slate-400`}
                                />
                                {discount && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                                        <Check className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            {!discount ? (
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={validating || !couponCode}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
                                >
                                    {validating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Apply'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => { setDiscount(null); setCouponCode(''); }}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 rounded-lg transition-colors"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
                        {discount && <p className="text-emerald-600 text-xs mt-2 font-medium">Coupon applied successfully!</p>}
                    </div>

                    {/* Pay Button */}
                    <button
                        onClick={handleProceed}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Pay ₹{finalPrice.toFixed(0)}
                    </button>

                    <p className="text-center text-xs text-slate-400">
                        Secure payment via Razorpay. Encrypted 256-bit SSL.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
