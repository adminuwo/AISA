import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apis } from '../types';

const usePayment = () => {
    const [loading, setLoading] = useState(false);

    const loadPaytmScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            // Use 'securegw-stage' for testing, 'securegw' for production
            // Ideally should be dynamic based on env, but for now defaulting to staging URL style or checking env
            // The logic below assumes staging, User needs to swap if production
            script.src = 'https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/YOUR_MID.js';
            // Note: MERCHANT URL PATTERN depends on env. 
            // Better approach: We load the generic checkout JS or let the user configure it.
            // Standard Paytm JS:
            script.src = `https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/${process.env.NEXT_PUBLIC_PAYTM_MID || 'YOUR_MID'}.js`;
            // If REACT_APP_ or VITE_ is used:
            // Since we don't have the MID easily in frontend code without env, we might need to fetch it or rely on it being present.
            // Let's assume the user will configure env VITE_PAYTM_MID

            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = useCallback(async (plan, user, onSuccess) => {
        setLoading(true);
        try {
            // 1. Create Order & Get Token
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

            // 2. Load Paytm JS
            // We need to load script dynamically with the MID returned from backend to ensure correctness
            const loadScript = (mid) => {
                return new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = `https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/${mid}.js`;
                    // WARNING: Hardcoded to STAGING for safety. User needs to change this for prod.
                    // For PROD: https://securegw.paytm.in/...
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.body.appendChild(script);
                });
            }

            const scriptLoaded = await loadScript(orderData.mid);
            if (!scriptLoaded) {
                toast.error('Paytm SDK failed to load');
                setLoading(false);
                return;
            }

            // 3. Initialize Paytm Checkout
            const config = {
                "root": "",
                "flow": "DEFAULT",
                "data": {
                    "orderId": orderData.orderId,
                    "token": orderData.txnToken,
                    "tokenType": "TXN_TOKEN",
                    "amount": orderData.amount
                },
                "handler": {
                    "notifyMerchant": async function (eventName, data) {
                        console.log("notifyMerchant handler function called");
                        console.log("eventName => ", eventName);
                        console.log("data => ", data);

                        if (eventName === 'APP_CLOSED') {
                            setLoading(false);
                        }
                    },
                    "transactionStatus": async function (paymentStatus) {
                        console.log("transactionStatus handler function called");
                        console.log("paymentStatus => ", paymentStatus);

                        // 4. Verify Payment on Backend
                        try {
                            const result = await axios.post(apis.verifyPayment, {
                                ...paymentStatus,
                                plan: plan.name,
                                amount: plan.price
                            }, {
                                headers: { 'Authorization': `Bearer ${user.token}` }
                            });

                            toast.success('Payment Successful! Plan Upgraded.');
                            if (onSuccess) onSuccess(result.data.user);
                        } catch (error) {
                            console.error(error);
                            toast.error('Payment Verification Failed');
                        } finally {
                            setLoading(false);
                            window.Paytm.CheckoutJS.close();
                        }
                    }
                }
            };

            if (window.Paytm && window.Paytm.CheckoutJS) {
                window.Paytm.CheckoutJS.init(config).then(function onSuccess() {
                    // after successfully updating configuration, invoke JS Checkout
                    window.Paytm.CheckoutJS.invoke();
                }).catch(function onError(error) {
                    console.log("error => ", error);
                    toast.error('Paytm Init Error');
                    setLoading(false);
                });
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.details || error.response?.data?.error || 'Something went wrong with payment');
            setLoading(false);
        }
    }, []);

    return { handlePayment, loading };
};

export default usePayment;
