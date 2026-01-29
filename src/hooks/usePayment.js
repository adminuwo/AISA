import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apis } from '../types';

const usePayment = () => {
    const [loading, setLoading] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = useCallback(async (plan, user, onSuccess) => {
        setLoading(true);
        try {
            // 1. Create Order
            const { data: orderData } = await axios.post(apis.createOrder, {
                plan: plan.id,
                amount: plan.price
            }, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });

            // Handle Free Plan direct update
            if (orderData.amount === 0) {
                toast.success('Plan updated to Basic successfully!');
                if (onSuccess) onSuccess(orderData.user);
                setLoading(false);
                return;
            }

            // 2. Load Razorpay Script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error('Razorpay SDK failed to load');
                setLoading(false);
                return;
            }

            // 3. Open Razorpay Checkout
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "AI-MALL",
                description: `Upgrade to ${plan.name} Plan`,
                image: "/Logo.svg",
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post(apis.verifyPayment, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan: plan.id,
                            amount: orderData.amount
                        }, {
                            headers: { 'Authorization': `Bearer ${user.token}` }
                        });

                        if (verifyRes.status === 200) {
                            toast.success('Payment Successful! Plan Upgraded.');
                            if (onSuccess) onSuccess(verifyRes.data.user);
                        } else {
                            toast.error('Payment Verification Failed');
                        }
                    } catch (error) {
                        console.error("Verification Error:", error);
                        toast.error('Payment Verification Failed');
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                notes: {
                    address: "AI-MALL Corporate Office",
                },
                theme: {
                    color: "#6366f1",
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Something went wrong with payment');
            setLoading(false);
        }
    }, []);

    return { handlePayment, loading };
};

export default usePayment;
