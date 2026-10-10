import { apiClient } from './apiService';

/**
 * AISA Central Wallet Service
 * Connects frontend to AISA backend /api/wallet endpoints (backed by UWO-B & PostgreSQL).
 */
export const walletService = {
  /**
   * Get user's central wallet summary & balances
   */
  async getWallet() {
    const res = await apiClient.get('/wallet/me');
    return res.data?.wallet;
  },

  /**
   * Get paginated transaction history
   */
  async getTransactions(params = {}) {
    const res = await apiClient.get('/wallet/transactions', { params });
    return res.data;
  },

  /**
   * Create central Razorpay topup order
   */
  async createTopup(amountInr) {
    const res = await apiClient.post('/wallet/topup', {
      amount_inr: parseFloat(amountInr),
    });
    return res.data?.topup_order;
  },

  /**
   * Purchase AISA plan using Central Wallet money (Saga)
   */
  async purchasePlan(planCode, billingCycle = 'monthly') {
    const res = await apiClient.post('/wallet/purchase-plan', {
      plan_code: planCode,
      billing_cycle: billingCycle,
    });
    return res.data;
  },

  /**
   * Verify completed Razorpay payment and fulfill topup
   */
  async verifyPayment({ gatewayOrderId, gatewayPaymentId, gatewaySignature }) {
    const res = await apiClient.post('/wallet/verify', {
      gateway_order_id: gatewayOrderId,
      gateway_payment_id: gatewayPaymentId,
      gateway_signature: gatewaySignature,
    });
    return res.data;
  },

  /**
   * Open native Razorpay Checkout in the browser
   */
  async openCheckout(order, user, { onSuccess, onDismiss, onFailure }) {
    if (typeof window === 'undefined') return;

    if (!window.Razorpay) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Razorpay checkout script.'));
        document.body.appendChild(script);
      });
    }

    const options = {
      key: order.razorpay_key_id,
      amount: order.amount_paise,
      currency: order.currency || 'INR',
      name: 'UWO Central Wallet',
      description: `Add ₹${order.amount_inr} to Unified Wallet`,
      order_id: order.gateway_order_id,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      theme: {
        color: '#6366f1',
      },
      handler: async response => {
        try {
          await walletService.verifyPayment({
            gatewayOrderId: response.razorpay_order_id,
            gatewayPaymentId: response.razorpay_payment_id,
            gatewaySignature: response.razorpay_signature,
          });
          if (onSuccess) onSuccess(response);
        } catch (err) {
          if (onFailure) onFailure(err);
        }
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', response => {
      if (onFailure) onFailure(response.error);
    });
    rzp.open();
  },
};
