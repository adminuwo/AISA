import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, ArrowUpRight, ArrowDownLeft, ShieldCheck, CreditCard } from 'lucide-react';
import { walletService } from '../services/walletService';
import { getUserData } from '../userStore/userData';

export default function AisaWalletModal({ isOpen, onClose, onBalanceUpdate }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('1');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('topup'); // 'topup' | 'history'
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const user = getUserData();

  const fetchWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await walletService.getWallet();
      setWallet(data);
      if (onBalanceUpdate && data?.balances) {
        onBalanceUpdate(data.balances.total_available_inr);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load wallet.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingTx(true);
    try {
      const res = await walletService.getTransactions({ limit: 15 });
      setTransactions(res.items || []);
    } catch (err) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWallet();
      if (activeTab === 'history') {
        fetchHistory();
      }
    }
  }, [isOpen, activeTab]);

  const handleTopup = async () => {
    const rupees = parseFloat(topupAmount);
    if (isNaN(rupees) || rupees < 1) {
      setError('Minimum top-up amount is ₹1.00');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccessMsg('Initializing secure Razorpay checkout...');

    try {
      const topupOrder = await walletService.createTopup(rupees);
      await walletService.openCheckout(topupOrder, user, {
        onSuccess: async response => {
          setSuccessMsg('Payment successful! Verifying and updating central wallet...');
          // Poll for fulfillment
          setTimeout(async () => {
            await fetchWallet();
            setSuccessMsg(`Successfully added ₹${rupees.toFixed(2)} to your UWO Wallet!`);
            setProcessing(false);
            if (activeTab === 'history') fetchHistory();
          }, 1500);
        },
        onDismiss: () => {
          setProcessing(false);
          setSuccessMsg(null);
        },
        onFailure: err => {
          setError(err?.description || 'Payment was cancelled or failed.');
          setProcessing(false);
          setSuccessMsg(null);
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to initiate top-up.');
      setProcessing(false);
      setSuccessMsg(null);
    }
  };

  if (!isOpen) return null;

  const availableINR = wallet?.balances?.total_available_inr || '0.00';
  const cashINR = wallet?.balances?.cash_balance_inr || '0.00';
  const promoINR = wallet?.balances?.promo_balance_inr || '0.00';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
              🪙
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">UWO Unified Wallet</h3>
              <p className="text-xs text-slate-400">One balance across AISA, AI Legal & AI Ads</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Balance Card */}
        <div className="p-5 pb-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Available Balance
                </span>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                  {loading ? '...' : `₹${availableINR}`}
                </div>
              </div>
              <button
                onClick={fetchWallet}
                disabled={loading}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                title="Refresh balance"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex gap-4 text-xs text-slate-400">
              <div>
                Cash: <span className="text-slate-200 font-medium">₹{cashINR}</span>
              </div>
              <div>
                Promo: <span className="text-slate-200 font-medium">₹{promoINR}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="px-5 flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('topup')}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'topup'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Add Money
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 pt-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'topup' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Select Amount to Top Up
              </label>

              {/* Amount Pills */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {['1', '50', '100', '500'].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopupAmount(amt)}
                    className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                      topupAmount === amt
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="mb-5">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={e => setTopupAmount(e.target.value)}
                    placeholder="Custom amount"
                    min="1"
                    max="50000"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Secured by Razorpay • Instant ledger credit
                </p>
              </div>

              {/* Pay Button */}
              <button
                onClick={handleTopup}
                disabled={processing || loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard size={16} />
                <span>
                  {processing ? 'Processing Checkout...' : `Add ₹${topupAmount} via Razorpay`}
                </span>
              </button>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto pr-1">
              {loadingTx ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Loading ledger transactions...
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No transactions found in central ledger.
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map(tx => (
                    <div
                      key={tx.ledger_id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                            tx.direction === 'CREDIT'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {tx.direction === 'CREDIT' ? (
                            <ArrowDownLeft size={16} />
                          ) : (
                            <ArrowUpRight size={16} />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200">
                            {tx.type} • {tx.app_id}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(tx.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          tx.direction === 'CREDIT' ? 'text-emerald-400' : 'text-slate-300'
                        }`}
                      >
                        {tx.direction === 'CREDIT' ? '+' : '-'}₹{tx.amount_inr}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
