import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  CreditCard,
  Tag,
  Flame,
  Sparkles,
  Percent,
  Users,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import DeleteConfirmModal from '../../Components/DeleteConfirmModal';
import { LoadingSpinner } from './AdminCommon';

// Helper function to format feature checklist descriptions dynamically matching DB limits
const formatFeatureString = (feature, plan) => {
  if (!feature || !plan) return feature;
  let result = feature;

  // 1. Total AI messages / chat limit / Unlimited Chat
  if (
    /total AI messages/i.test(result) ||
    /total messages/i.test(result) ||
    /AI messages/i.test(result)
  ) {
    if (plan.chatLimit === -1 || plan.chatScope === 'unlimited') {
      return 'Unlimited AI Chat';
    } else {
      result = result.replace(/\d+/, plan.chatLimit ?? 100);
    }
  }

  // 2. Validity
  if (
    /months validity/i.test(result) ||
    /month validity/i.test(result) ||
    /days validity/i.test(result)
  ) {
    const months = Math.round((plan.validityDays || 90) / 30);
    result = result.replace(/\d+/, months);
  }

  // 3. Images/day
  if (/Images\/day/i.test(result)) {
    result = result.replace(/\d+/, plan.imageLimit ?? 0);
  }

  // 4. Carousel/day
  if (/Carousel\/day/i.test(result)) {
    result = result.replace(/\d+/, plan.carouselLimit ?? 0);
  }

  return result;
};

const PlansTab = () => {
  const { t } = useLanguage();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({
    planId: '',
    planName: '',
    priceMonthly: '',
    priceYearly: '',
    validityDays: '',
    features: '',
    isOfferActive: false,
    offerBadge: '',
    offerPriceMonthly: '',
    offerPriceYearly: '',
    offerSubtitle: '',
    offerValidityType: 'first_time',
    offerForFirstTimeOnly: true,
  });

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, planId: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPlans();
      setPlans(Array.isArray(data) ? data : data.plans || []);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const body = {
        planId: form.planId,
        planName: form.planName,
        priceMonthly: Number(form.priceMonthly),
        priceYearly: Number(form.priceYearly),
        validityDays: Number(form.validityDays),
        features: form.features
          .split(',')
          .map(f => f.trim())
          .filter(Boolean),
        isOfferActive: Boolean(form.isOfferActive),
        offerBadge: (form.offerBadge || '').trim(),
        offerPriceMonthly:
          form.offerPriceMonthly !== '' && !isNaN(Number(form.offerPriceMonthly))
            ? Number(form.offerPriceMonthly)
            : null,
        offerPriceYearly:
          form.offerPriceYearly !== '' && !isNaN(Number(form.offerPriceYearly))
            ? Number(form.offerPriceYearly)
            : null,
        offerSubtitle: (form.offerSubtitle || '').trim(),
        offerValidityType: form.offerValidityType || 'first_time',
        offerForFirstTimeOnly: (form.offerValidityType || 'first_time') === 'first_time',
      };

      let data;
      if (editingPlan) {
        data = await apiService.updatePlan(editingPlan._id, body);
      } else {
        data = await apiService.createPlan(body);
      }

      if (data.success) {
        toast.success(editingPlan ? 'Plan updated' : 'Plan created');
        resetForm();
        fetchPlans();
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch (err) {
      toast.error('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.planId) return;
    try {
      await apiService.deletePlan(deleteModal.planId);
      toast.success('Plan deleted');
      setDeleteModal({ isOpen: false, planId: null });
      fetchPlans();
    } catch (err) {
      toast.error('Failed to delete plan');
      setDeleteModal({ isOpen: false, planId: null });
    }
  };

  const startEdit = (plan, focusOffer = false) => {
    setEditingPlan(plan);
    setForm({
      planId: plan.planId || '',
      planName: plan.planName || '',
      priceMonthly: plan.priceMonthly?.toString() || '',
      priceYearly: plan.priceYearly?.toString() || '',
      validityDays: plan.validityDays?.toString() ?? '90',
      features: (plan.features || []).map(f => formatFeatureString(f, plan)).join(', '),
      isOfferActive: focusOffer ? true : Boolean(plan.isOfferActive),
      offerBadge: plan.offerBadge || '',
      offerPriceMonthly: plan.offerPriceMonthly != null ? plan.offerPriceMonthly.toString() : '',
      offerPriceYearly: plan.offerPriceYearly != null ? plan.offerPriceYearly.toString() : '',
      offerSubtitle: plan.offerSubtitle || '',
      offerValidityType:
        plan.offerValidityType ||
        (plan.offerForFirstTimeOnly === false ? 'all_users' : 'first_time'),
      offerForFirstTimeOnly: plan.offerForFirstTimeOnly ?? true,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      planId: '',
      planName: '',
      priceMonthly: '',
      priceYearly: '',
      validityDays: '',
      features: '',
      isOfferActive: false,
      offerBadge: '',
      offerPriceMonthly: '',
      offerPriceYearly: '',
      offerSubtitle: '',
      offerValidityType: 'first_time',
      offerForFirstTimeOnly: true,
    });
    setEditingPlan(null);
    setShowForm(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-maintext">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-subtext">
                    Plan ID
                  </label>
                  <input
                    placeholder="e.g. starter-plan"
                    value={form.planId}
                    onChange={e => setForm(p => ({ ...p, planId: e.target.value }))}
                    className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-subtext">
                    Plan Name
                  </label>
                  <input
                    placeholder="e.g. Starter"
                    value={form.planName}
                    onChange={e => setForm(p => ({ ...p, planName: e.target.value }))}
                    className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-subtext">
                    Monthly Price (₹)
                  </label>
                  <input
                    placeholder="e.g. 499"
                    type="number"
                    value={form.priceMonthly}
                    onChange={e => setForm(p => ({ ...p, priceMonthly: e.target.value }))}
                    className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext no-spinner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-subtext">
                    Yearly Price (₹)
                  </label>
                  <input
                    placeholder="e.g. 4990"
                    type="number"
                    value={form.priceYearly}
                    onChange={e => setForm(p => ({ ...p, priceYearly: e.target.value }))}
                    className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext no-spinner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-subtext">
                    Validity (Days)
                  </label>
                  <input
                    placeholder="e.g. 30"
                    type="number"
                    value={form.validityDays}
                    onChange={e => setForm(p => ({ ...p, validityDays: e.target.value }))}
                    className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext no-spinner"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-subtext">
                  Features List (Comma-separated)
                </label>
                <input
                  placeholder="e.g. Unlimited AI Chat, CashFlow Explorer, Web & Deep Search"
                  value={form.features}
                  onChange={e => setForm(p => ({ ...p, features: e.target.value }))}
                  className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext"
                />
              </div>

              {/* ── Promotional Offer & Discount Section ── */}
              <div className="mt-4 pt-4 border-t border-white/20 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-primary/10 border border-amber-500/20 dark:border-amber-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
                      <Flame className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-maintext flex items-center gap-2">
                        Promotional Offer & Discount
                        {form.isOfferActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-subtext">
                        Give special discounts, festive tags, or flash sale prices on this plan
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isOfferActive}
                      onChange={e => setForm(p => ({ ...p, isOfferActive: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-rose-500"></div>
                  </label>
                </div>

                <AnimatePresence>
                  {form.isOfferActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-1"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-subtext flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-amber-500" /> Offer Badge / Tag
                          </label>
                          <input
                            placeholder="e.g. 50% OFF, Diwali Deal, Save ₹200"
                            value={form.offerBadge}
                            onChange={e => setForm(p => ({ ...p, offerBadge: e.target.value }))}
                            className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-amber-500/50 text-maintext"
                          />
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {[
                              '50% OFF',
                              'Special Offer',
                              'Diwali Deal',
                              'Limited Time',
                              'Save ₹200',
                            ].map(tag => (
                              <button
                                type="button"
                                key={tag}
                                onClick={() => setForm(p => ({ ...p, offerBadge: tag }))}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-white/40 dark:bg-white/10 hover:bg-amber-500/20 hover:text-amber-500 text-subtext transition-all border border-white/10"
                              >
                                +{tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-subtext flex items-center gap-1.5">
                            <Percent className="w-3.5 h-3.5 text-rose-500" /> Offer Monthly Price
                            (₹)
                          </label>
                          <input
                            placeholder="e.g. 299 (Discounted price)"
                            type="number"
                            value={form.offerPriceMonthly}
                            onChange={e =>
                              setForm(p => ({ ...p, offerPriceMonthly: e.target.value }))
                            }
                            className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-rose-500/50 text-maintext no-spinner font-bold text-rose-500"
                          />
                          {form.priceMonthly &&
                            form.offerPriceMonthly &&
                            Number(form.offerPriceMonthly) < Number(form.priceMonthly) && (
                              <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                                ✓ Customers save ₹
                                {Number(form.priceMonthly) - Number(form.offerPriceMonthly)} (
                                {Math.round(
                                  ((Number(form.priceMonthly) - Number(form.offerPriceMonthly)) /
                                    Number(form.priceMonthly)) *
                                    100
                                )}
                                % off)
                              </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-subtext flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary" /> Offer Yearly Price (₹)
                          </label>
                          <input
                            placeholder="e.g. 2990 (Discounted yearly)"
                            type="number"
                            value={form.offerPriceYearly}
                            onChange={e =>
                              setForm(p => ({ ...p, offerPriceYearly: e.target.value }))
                            }
                            className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext no-spinner"
                          />
                        </div>
                      </div>

                      {/* Offer Validity & Target Audience */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-subtext flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-primary" /> Offer Validity & Target
                          Audience
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div
                            onClick={() =>
                              setForm(p => ({
                                ...p,
                                offerValidityType: 'first_time',
                                offerForFirstTimeOnly: true,
                              }))
                            }
                            className={`cursor-pointer p-3 rounded-xl border transition-all flex items-start gap-3 ${
                              form.offerValidityType === 'first_time'
                                ? 'bg-primary/10 border-primary text-maintext shadow-sm'
                                : 'bg-white/10 dark:bg-white/5 border-white/10 text-subtext hover:border-white/20'
                            }`}
                          >
                            <input
                              type="radio"
                              name="offerValidityType"
                              checked={form.offerValidityType === 'first_time'}
                              onChange={() => {}}
                              className="mt-1"
                            />
                            <div>
                              <p className="text-xs font-bold text-maintext flex items-center gap-1.5">
                                First-Time Usage Only
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-bold">
                                  Default
                                </span>
                              </p>
                              <p className="text-[11px] text-subtext leading-tight mt-0.5">
                                Discount applies strictly to the 1st billing cycle for users who
                                haven't bought any paid plan before. Subsequent renewals at regular
                                price.
                              </p>
                            </div>
                          </div>

                          <div
                            onClick={() =>
                              setForm(p => ({
                                ...p,
                                offerValidityType: 'all_users',
                                offerForFirstTimeOnly: false,
                              }))
                            }
                            className={`cursor-pointer p-3 rounded-xl border transition-all flex items-start gap-3 ${
                              form.offerValidityType === 'all_users'
                                ? 'bg-amber-500/10 border-amber-500 text-maintext shadow-sm'
                                : 'bg-white/10 dark:bg-white/5 border-white/10 text-subtext hover:border-white/20'
                            }`}
                          >
                            <input
                              type="radio"
                              name="offerValidityType"
                              checked={form.offerValidityType === 'all_users'}
                              onChange={() => {}}
                              className="mt-1"
                            />
                            <div>
                              <p className="text-xs font-bold text-maintext">
                                All Users (Flash Sale)
                              </p>
                              <p className="text-[11px] text-subtext leading-tight mt-0.5">
                                Open to everyone, including existing paying subscribers who are
                                renewing or upgrading.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-subtext">
                          Offer Tagline / Note (Optional)
                        </label>
                        <input
                          placeholder="e.g. Limited time promotional discount — grab it before it expires"
                          value={form.offerSubtitle}
                          onChange={e => setForm(p => ({ ...p, offerSubtitle: e.target.value }))}
                          className="w-full bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 text-maintext"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-subtext hover:text-maintext hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  {editingPlan ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div
            key={plan._id}
            className={`bg-white/30 dark:bg-white/5 backdrop-blur-xl border ${
              plan.isOfferActive
                ? 'border-amber-500/40 shadow-lg shadow-amber-500/5'
                : 'border-white/20 dark:border-white/10'
            } rounded-2xl p-5 hover:border-primary/30 transition-all relative overflow-hidden`}
          >
            {/* Active Offer Banner on Card */}
            {plan.isOfferActive && (
              <div className="mb-2 flex items-center justify-between flex-wrap gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-rose-500 border border-rose-500/30">
                    <Flame className="w-3 h-3 animate-pulse" />
                    {plan.offerBadge || 'OFFER ACTIVE'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Users className="w-3 h-3" />
                    {plan.offerValidityType === 'all_users' || plan.offerForFirstTimeOnly === false
                      ? 'All Users'
                      : '1st Purchase Only'}
                  </span>
                </div>
                {plan.offerPriceMonthly != null && plan.priceMonthly > plan.offerPriceMonthly && (
                  <span className="text-[10px] text-emerald-500 font-bold">
                    Save ₹{plan.priceMonthly - plan.offerPriceMonthly}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-maintext">{plan.planName}</h4>
                <div className="mt-1 space-y-0.5">
                  {plan.isOfferActive && plan.offerPriceMonthly != null ? (
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-black text-rose-500 leading-none">
                        ₹{plan.offerPriceMonthly}
                        <span className="text-[10px] text-subtext font-normal ml-1">/mo</span>
                      </p>
                      <span className="text-xs text-subtext line-through opacity-70">
                        ₹{plan.priceMonthly}
                      </span>
                    </div>
                  ) : (
                    <p className="text-lg font-black text-primary leading-none">
                      ₹{plan.priceMonthly}
                      <span className="text-[10px] text-subtext font-normal ml-1">/mo</span>
                    </p>
                  )}
                  <p className="text-[10px] text-subtext">
                    {plan.isOfferActive && plan.offerPriceYearly != null ? (
                      <>
                        Yearly:{' '}
                        <span className="text-emerald-500 font-bold">₹{plan.offerPriceYearly}</span>{' '}
                        <span className="line-through opacity-60">₹{plan.priceYearly}</span>
                      </>
                    ) : (
                      <>
                        Yearly: ₹{plan.priceYearly} (₹{Math.round(plan.priceYearly / 12)}/mo)
                      </>
                    )}
                  </p>
                  {plan.isOfferActive && plan.offerSubtitle && (
                    <p className="text-[10px] text-amber-500/90 font-medium italic pt-0.5">
                      "{plan.offerSubtitle}"
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(plan, true)}
                  title="Manage Promotional Offer"
                  className={`p-2 rounded-lg transition-all ${
                    plan.isOfferActive
                      ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
                      : 'hover:bg-amber-500/10 text-subtext hover:text-amber-500'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startEdit(plan)}
                  title="Edit Plan"
                  className="p-2 rounded-lg hover:bg-primary/10 text-subtext hover:text-primary transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteModal({ isOpen: true, planId: plan._id })}
                  title="Delete Plan"
                  className="p-2 rounded-lg hover:bg-red-500/10 text-subtext hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-subtext border-t border-white/10 pt-3">
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
                Validity:{' '}
                <span className="font-semibold text-maintext">{plan.validityDays} days</span>
              </p>
              <p className="flex items-center gap-2 text-[10px] opacity-70">
                <CreditCard className="w-3.5 h-3.5" />
                ID: {plan.planId}
              </p>
            </div>
          </div>
        ))}
        {plans.length === 0 && (
          <p className="text-subtext text-sm col-span-full text-center py-8">
            No plans created yet
          </p>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, planId: null })}
        onConfirm={handleDelete}
        title="Delete Plan?"
        description="Are you sure you want to delete this plan? This action cannot be undone."
      />
    </div>
  );
};

export default PlansTab;
