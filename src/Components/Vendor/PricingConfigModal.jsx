import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const DEFAULT_PLANS = [
  { id: 'starter', name: 'Starter Monthly', price: 499 },
  { id: 'pro', name: 'Pro Monthly', price: 999 },
  { id: 'business', name: 'Business Monthly', price: 2499 },
];

const PricingConfigModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [currency, setCurrency] = useState(initialData?.currency || 'INR');
  const [selectedPlans, setSelectedPlans] = useState(
    initialData?.selectedPlans || [DEFAULT_PLANS[0]]
  );

  useEffect(() => {
    if (initialData) {
      setCurrency(initialData.currency || 'INR');
      setSelectedPlans(initialData.selectedPlans || [DEFAULT_PLANS[0]]);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const togglePlan = plan => {
    const exists = selectedPlans.some(p => p.id === plan.id);
    if (exists) {
      if (selectedPlans.length > 1) {
        setSelectedPlans(selectedPlans.filter(p => p.id !== plan.id));
      }
    } else {
      setSelectedPlans([...selectedPlans, plan]);
    }
  };

  const handleConfirm = () => {
    if (onSave) {
      onSave({ currency, selectedPlans });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-lg font-bold text-gray-900">Configure Subscription Pricing</h3>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            Currency
          </label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium text-gray-900"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            Select Plans
          </label>
          {DEFAULT_PLANS.map(plan => {
            const active = selectedPlans.some(p => p.id === plan.id);
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => togglePlan(plan)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  active
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div>
                  <div className="text-sm font-bold">{plan.name}</div>
                  <div className="text-xs text-gray-500">
                    {currency} {plan.price}/mo
                  </div>
                </div>
                {active && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700"
          >
            Save Pricing
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingConfigModal;
