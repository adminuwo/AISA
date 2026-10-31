import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPlans,
  getCreditPackages,
  purchasePlan,
  buyCredits,
  createSubscriptionOrder,
  getSubscriptionDetails,
} from '../services/pricingService';
import './Pricing.css';
import {
  Check,
  X,
  ShieldAlert,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Video,
  Search,
  Users,
  ChevronRight,
  ArrowLeft,
  MoreHorizontal,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '../userStore/useUserStore';
import { updateUser, getUserData } from '../userStore/userData';
import { useLanguage } from '../context/LanguageContext';

import useCreditStore from '../userStore/useCreditStore';

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
      if (plan.chatScope === 'daily') return `${plan.chatLimit ?? 50} AI Messages / day`;
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

// Map old DB plan names to new display names
const PLAN_NAME_MAP = {
  free: 'Free',
  'free plan': 'Free',
  starter: 'Starter',
  'starter plan': 'Starter',
  pro: 'Pro',
  'pro plan': 'Pro',
  business: 'Business',
  'business plan': 'Business',
};

const getDisplayPlanName = planName => {
  if (!planName) return '';
  return PLAN_NAME_MAP[planName.toLowerCase()] || planName;
};

// Category / Scope label matching reference UI (e.g. "= Design Subscription", "= Retainer", "= 0 -> MVP")
const getPlanCategoryLabel = plan => {
  const name = (plan.planName || '').toLowerCase();
  if (name.includes('free')) return '= Free Access';
  if (name.includes('creator') || name.includes('starter')) return '= Design Subscription';
  if (name.includes('startup')) return '= Retainer';
  if (name.includes('enterprise') || name.includes('business')) return '= 0 → MVP';
  return `= ${getDisplayPlanName(plan.planName)}`;
};

// Subtitle tagline matching reference UI
const getPlanSubtitle = plan => {
  const isFree = plan.priceMonthly === 0 && plan.priceYearly === 0;
  if (isFree) return 'One request at a time';
  const name = (plan.planName || '').toLowerCase();
  if (name.includes('creator') || name.includes('starter'))
    return 'Essential tools for solo creators';
  if (name.includes('startup')) return 'Double your delivery 2x';
  if (name.includes('enterprise') || name.includes('business'))
    return 'Fitting your individual project needs';
  return 'Tailored for your AI workflow';
};

// Typography helper matching reference UI (e.g. "Nano" in bold sans, "dose" in elegant italic serif)
const renderPlanDisplayName = planName => {
  const displayName = getDisplayPlanName(planName);
  const parts = displayName.trim().split(' ');
  if (parts.length > 1) {
    return (
      <span className="plan-name-combo">
        <span className="plan-name-bold">{parts[0]}</span>
        <span className="plan-name-italic">{parts.slice(1).join(' ')}</span>
      </span>
    );
  }
  const suffixMap = {
    free: 'tier',
    creator: 'dose',
    startup: 'dose',
    enterprise: 'dose',
  };
  const suffix = suffixMap[displayName.toLowerCase()] || 'dose';
  return (
    <span className="plan-name-combo">
      <span className="plan-name-bold">{displayName}</span>
      <span className="plan-name-italic">{suffix}</span>
    </span>
  );
};

// Dynamically ensure Razorpay checkout script is loaded
const loadRazorpaySDK = () => {
  return new Promise(resolve => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      setTimeout(() => resolve(!!window.Razorpay), 1500);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Pricing = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [packages, setPackages] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentPlanName, setCurrentPlanName] = useState('');
  const user = useUserStore(state => state.user);
  const userState = { user };
  const setUserState = useUserStore(state => state.setUser);

  // Identify admin user to prevent free tier default
  const localUser = getUserData();
  const currentUser = user || localUser || {};
  const userEmail = String(currentUser?.email || localUser?.email || '')
    .toLowerCase()
    .trim();
  const userRole = String(currentUser?.role || localUser?.role || '')
    .toLowerCase()
    .trim();
  const isAdmin =
    userRole === 'admin' ||
    userRole === 'super_admin' ||
    userRole === 'superadmin' ||
    userEmail === 'admin@uwo24.com' ||
    userEmail === 'sanskar@uwo24.com' ||
    userEmail === 'sakshi@uwo24.com' ||
    userEmail.endsWith('@uwo24.com');

  const [activeCard, setActiveCard] = useState(0);
  const gridRef = useRef(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 1024
  );
  const [isTabletCarousel, setIsTabletCarousel] = useState(
    typeof window !== 'undefined' && window.innerWidth > 768 && window.innerWidth <= 1024
  );
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [billingSubmitted, setBillingSubmitted] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [billingForm, setBillingForm] = useState({
    billingName: '',
    companyName: '',
    gstin: '',
    addressLine1: '',
    city: '',
    state: 'Maharashtra',
    postalCode: '',
    country: 'IN',
  });

  useEffect(() => {
    if (userState?.user) {
      const details = userState.user.billingDetails || {};
      setBillingForm({
        billingName: details.billingName || userState.user.name || '',
        companyName: details.companyName || '',
        gstin: details.gstin || '',
        addressLine1: details.addressLine1 || '',
        city: details.city || '',
        state: details.state || 'Maharashtra',
        postalCode: details.postalCode || '',
        country: details.country || 'IN',
      });
      if (details.billingName && details.addressLine1) {
        setBillingSubmitted(true);
      }
    }
  }, [userState?.user]);

  useEffect(() => {
    fetchPricingData();
    fetchCurrentPlan();

    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      const tablet = window.innerWidth > 768 && window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsTabletCarousel(tablet);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Mobile/Tablet: track active card via scroll position ──
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !isMobile) return;
    const handleScroll = () => {
      const card = grid.querySelector('.pricing-card');
      const cardWidth = card ? card.clientWidth : grid.clientWidth * 0.85;
      const idx = Math.round(grid.scrollLeft / (cardWidth + 12));
      setActiveCard(Math.max(0, Math.min(idx, plans.length - 1)));
    };
    grid.addEventListener('scroll', handleScroll, { passive: true });
    return () => grid.removeEventListener('scroll', handleScroll);
  }, [plans.length, isMobile]);

  const scrollToCard = idx => {
    const grid = gridRef.current;
    if (!grid) return;
    const card = grid.querySelector('.pricing-card');
    const cardWidth = card ? card.clientWidth : grid.clientWidth * 0.85;
    grid.scrollTo({ left: idx * (cardWidth + 12), behavior: 'smooth' });
  };

  const getActiveToken = () => {
    const token =
      getUserData()?.token ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('accessToken') ||
      '';
    return token && token !== 'undefined' && token !== 'null' ? token : '';
  };

  const fetchCurrentPlan = async () => {
    const token = getActiveToken();
    if (!token) {
      setCurrentPlanName('');
      return;
    }
    if (isAdmin) {
      setCurrentPlanName('Admin');
      return;
    }
    try {
      const data = await getSubscriptionDetails();
      if (data.success) {
        if (data.subscription?.planId?.planName) {
          setCurrentPlanName(data.subscription.planId.planName);
        } else if (data.plan?.planKey && data.plan.planKey !== 'Plan_0') {
          const keyMap = {
            Plan_1: 'Creator',
            Plan_2: 'Startup',
            Plan_3: 'Enterprise',
            admin: 'Admin',
          };
          setCurrentPlanName(keyMap[data.plan.planKey] || data.plan.planKey);
        } else if (data.founderStatus) {
          setCurrentPlanName('Founder');
        } else {
          setCurrentPlanName(isAdmin ? 'Admin' : 'Free');
        }
      } else {
        setCurrentPlanName(isAdmin ? 'Admin' : 'Free');
      }
    } catch (err) {
      console.error(err);
      setCurrentPlanName(isAdmin ? 'Admin' : 'Free');
    }
  };

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      const [plansData, packagesData] = await Promise.all([getPlans(), getCreditPackages()]);
      setPlans(plansData.plans || []);
      setPackages(packagesData.packages || []);
    } catch (error) {
      toast.error(t('failedToLoadPricingInfo') || 'Failed to load pricing information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setBillingCycle(prev => (prev === 'monthly' ? 'yearly' : 'monthly'));
  };

  const renderQuotaSummary = plan => {
    if (!plan) return [];
    const isFree = plan.priceMonthly === 0 && plan.priceYearly === 0;

    if (isFree) {
      const chatLabel =
        plan.chatScope === 'unlimited' || plan.chatLimit === -1
          ? 'Unlimited AI Chat'
          : plan.chatScope === 'daily'
            ? `${plan.chatLimit ?? 50} Messages / day`
            : `${plan.chatLimit ?? 100} Total Messages`;

      return [
        {
          text: chatLabel,
          icon: <Zap size={14} />,
          locked: false,
        },
        {
          text: t('paidPlansOnly') || 'Paid plans only',
          icon: <ImageIcon size={14} />,
          locked: true,
        },
        {
          text: t('paidPlansOnly') || 'Paid plans only',
          icon: <Video size={14} />,
          locked: true,
        },
      ];
    }

    const chatText =
      plan.chatScope === 'unlimited' || plan.chatLimit === -1
        ? 'Unlimited AI Chat'
        : plan.chatScope === 'daily'
          ? `${plan.chatLimit ?? 50} AI Messages / day`
          : `${plan.chatLimit ?? 100} AI Messages`;

    const hasImages = Boolean(plan.imageLimit && plan.imageLimit > 0);
    const imageText = hasImages ? `${plan.imageLimit} Images / day` : 'Images (Pro+ only)';

    const hasCarousels = Boolean(plan.carouselLimit && plan.carouselLimit > 0);
    const hasVideos = Boolean(plan.videoLimit && plan.videoLimit > 0);
    const videoText = hasCarousels
      ? `${plan.carouselLimit} Carousel Ads / day`
      : hasVideos
        ? `${plan.videoLimit} Videos / day`
        : 'AI Ads & Video (Pro+ only)';

    return [
      {
        text: chatText,
        icon: <Zap size={14} />,
        locked: false,
      },
      {
        text: imageText,
        icon: <ImageIcon size={14} />,
        locked: !hasImages,
      },
      {
        text: videoText,
        icon: <Video size={14} />,
        locked: !hasCarousels && !hasVideos,
      },
    ];
  };

  const executeUpgrade = async (plan, billingDetails) => {
    try {
      setProcessing(true);

      const isSdkLoaded = await loadRazorpaySDK();
      if (!isSdkLoaded && typeof window !== 'undefined' && !window.Razorpay) {
        toast.error(
          'Payment gateway SDK failed to load. Please check your internet connection or ad-blocker.'
        );
        setProcessing(false);
        return;
      }

      const isOfferEligible = plan.isEligibleForOffer !== false;
      const hasOffer =
        Boolean(plan.isOfferActive) &&
        isOfferEligible &&
        ((billingCycle === 'yearly' &&
          plan.offerPriceYearly != null &&
          plan.offerPriceYearly >= 0) ||
          (billingCycle === 'monthly' &&
            plan.offerPriceMonthly != null &&
            plan.offerPriceMonthly >= 0));

      const totalAmount = hasOffer
        ? billingCycle === 'yearly'
          ? (plan.offerPriceYearly ?? plan.priceYearly)
          : plan.offerPriceMonthly
        : billingCycle === 'yearly'
          ? plan.priceYearly
          : plan.priceMonthly;

      const basePrice = Math.round((totalAmount / 1.18) * 100) / 100;
      const gstAmount = Math.round((totalAmount - basePrice) * 100) / 100;

      // Print breakdown in console as requested
      console.log('========================================');
      console.log('[CHECKOUT] GST INVOICE CALCULATION (GST INCLUSIVE)');
      console.log(`Plan Name:   ${plan.planName} ${hasOffer ? '(Offer Active)' : ''}`);
      console.log(`Base Price (excl. GST):  ₹${basePrice}`);
      console.log(`GST (18% inclusive):     ₹${gstAmount}`);
      console.log(`Total (Inclusive):       ₹${totalAmount}`);
      console.log('Billing Details:', billingDetails);
      console.log('========================================');

      const orderRes = await createSubscriptionOrder({ planId: plan._id, billingCycle });
      if (orderRes.isFree) {
        const res = await purchasePlan(plan._id, billingCycle, null, billingDetails);
        toast.success(`Successfully upgraded to ${plan.planName}!`);
        const updatedUser = updateUser({
          credits: res.credits,
          founderStatus:
            plan.planName.toLowerCase() === 'founder plan' ? true : userState?.user?.founderStatus,
        });
        setUserState({ user: updatedUser });
        useCreditStore.getState().syncCredits();
        setProcessing(false);
        return;
      }

      if (!orderRes.success || !orderRes.order) {
        throw new Error(orderRes.message || 'Failed to create payment order');
      }

      const razorpayKey =
        orderRes.key || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SBFlInxBiRfOGd';

      const options = {
        key: razorpayKey,
        amount: orderRes.order.amount,
        currency: 'INR',
        name: 'AISA™',
        description: `Upgrade to ${plan.planName}`,
        order_id: orderRes.order.id,
        handler: async function (response) {
          try {
            const res = await purchasePlan(
              plan._id,
              billingCycle,
              response.razorpay_payment_id,
              billingDetails
            );
            toast.success(`Successfully upgraded to ${plan.planName}!`);
            const updatedUser = updateUser({
              credits: res.credits,
              founderStatus:
                plan.planName.toLowerCase() === 'founder plan'
                  ? true
                  : userState?.user?.founderStatus,
            });
            setUserState({ user: updatedUser });
            useCreditStore.getState().syncCredits();
            fetchCurrentPlan();
            const is99Purchase =
              Boolean(res?.requiresProfessionOnboarding) ||
              Boolean(res?.is99Plan) ||
              Math.round(Number(totalAmount)) === 99;
            if (is99Purchase) {
              window.dispatchEvent(
                new CustomEvent('aisa_99_plan_activated', {
                  detail: {
                    planName: plan.planName || '₹99 Plan',
                    amount: totalAmount,
                  },
                })
              );
            }
          } catch (e) {
            console.error('[purchasePlan Error]', e);
            toast.error(e.response?.data?.message || 'Failed to complete upgrade after payment.');
          }
        },
        prefill: {
          name: billingDetails?.billingName || userState?.user?.name || 'User',
          email: userState?.user?.email || '',
        },
        theme: { color: 'var(--color-primary)' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed: ' + (response?.error?.description || 'Transaction cancelled'));
      });
      rzp.open();
    } catch (err) {
      console.error('[Pricing Upgrade Error]', err);
      if (err.response?.status === 401) {
        toast.error('Your session expired. Please log in again to complete your upgrade.');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Upgrade failed. Please try again.';
      toast.error(errMsg);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpgrade = async plan => {
    const token = getActiveToken();
    if (!token) {
      toast.error(t('pleaseLoginToUpgrade') || 'Please login to upgrade your plan');
      navigate('/login');
      return;
    }

    const isOfferEligible = plan.isEligibleForOffer !== false;
    const hasOffer =
      Boolean(plan.isOfferActive) &&
      isOfferEligible &&
      ((billingCycle === 'yearly' && plan.offerPriceYearly != null && plan.offerPriceYearly >= 0) ||
        (billingCycle === 'monthly' &&
          plan.offerPriceMonthly != null &&
          plan.offerPriceMonthly >= 0));

    const price = hasOffer
      ? billingCycle === 'yearly'
        ? (plan.offerPriceYearly ?? plan.priceYearly)
        : plan.offerPriceMonthly
      : billingCycle === 'yearly'
        ? plan.priceYearly
        : plan.priceMonthly;

    if (price === 0) {
      executeUpgrade(plan, null);
    } else {
      setSelectedPlanForUpgrade(plan);
      setBillingModalOpen(true);
    }
  };

  const handleBuyCredits = async pkg => {
    const token = getActiveToken();
    if (!token) {
      toast.error(t('pleaseLoginToPurchaseCredits') || 'Please login to purchase credits');
      navigate('/login');
      return;
    }
    try {
      setProcessing(true);

      const isSdkLoaded = await loadRazorpaySDK();
      if (!isSdkLoaded && typeof window !== 'undefined' && !window.Razorpay) {
        toast.error(
          'Payment gateway SDK failed to load. Please check your internet connection or ad-blocker.'
        );
        setProcessing(false);
        return;
      }

      const orderRes = await createSubscriptionOrder({ packageId: pkg._id });

      if (orderRes.isFree) {
        const res = await buyCredits(pkg._id);
        toast.success(`Purchased ${pkg.credits} credits!`);
        const updatedUser = updateUser({ credits: res.credits });
        setUserState({ user: updatedUser });
        setShowUpsell(false);
        setProcessing(false);
        return;
      }

      const razorpayKey =
        orderRes.key || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SBFlInxBiRfOGd';

      const options = {
        key: razorpayKey,
        amount: orderRes.order.amount,
        currency: 'INR',
        name: 'AISA™',
        description: `Buy ${pkg.credits} Credits`,
        order_id: orderRes.order.id,
        handler: async function (response) {
          try {
            const res = await buyCredits(pkg._id);
            toast.success(`Purchased ${pkg.credits} credits!`);
            const updatedUser = updateUser({ credits: res.credits });
            setUserState({ user: updatedUser });
            setShowUpsell(false);
          } catch (e) {
            console.error('[buyCredits Error]', e);
            toast.error(e.response?.data?.message || 'Failed to complete purchase after payment.');
          }
        },
        prefill: {
          name: userState?.user?.name || 'User',
          email: userState?.user?.email || '',
        },
        theme: { color: 'var(--color-primary)' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed: ' + (response?.error?.description || 'Transaction cancelled'));
      });
      rzp.open();
    } catch (err) {
      console.error('[Buy Credits Error]', err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Purchase failed. Please try again.';
      toast.error(errMsg);
    } finally {
      setProcessing(false);
    }
  };

  const renderComparisonTable = () => {
    if (!plans.length) return null;

    const getFeatureValue = (featureKey, plan) => {
      const isFree = plan.priceMonthly === 0 && plan.priceYearly === 0;
      const planKey = (plan.planId || '').toLowerCase();

      switch (featureKey) {
        case 'chat':
          if (isFree) {
            return (
              <span className="matrix-check">
                <Check size={16} />
              </span>
            );
          }
          return <span className="matrix-badge emerald">✓ {t('priority')}</span>;

        case 'generate_image':
          if (plan.imageLimit > 0) {
            return (
              <span className="matrix-badge indigo">
                ✓ {t('ultraHD')} ({plan.imageLimit}/day)
              </span>
            );
          }
          return <span className="matrix-dash">—</span>;

        case 'edit_image':
          if (plan.editImageAllowed) {
            return (
              <span className="matrix-check">
                <Check size={16} />
              </span>
            );
          }
          return <span className="matrix-dash">—</span>;

        case 'web_search':
        case 'deep_search':
        case 'code_writer':
        case 'convert_audio':
          if (planKey !== 'plan_0' && !isFree) {
            return (
              <span className="matrix-check">
                <Check size={16} />
              </span>
            );
          }
          return <span className="matrix-dash">—</span>;

        case 'convert_docs':
          if (planKey === 'plan_1') {
            return <span className="matrix-badge slate">{t('advanced')}</span>;
          }
          if (planKey === 'plan_2') {
            return <span className="matrix-badge violet">{t('expert')}</span>;
          }
          if (planKey === 'plan_3') {
            return (
              <span className="matrix-badge blue">
                {t('pro')} + {t('team')}
              </span>
            );
          }
          return <span className="matrix-dash">—</span>;

        case 'ai_legal':
          if (!isFree) {
            return (
              <span className="matrix-check">
                <Check size={16} />
              </span>
            );
          }
          return <span className="matrix-dash">—</span>;

        case 'ai_cashflow':
          if (plan.cashflowAllowed) {
            return (
              <span className="matrix-check">
                <Check size={16} />
              </span>
            );
          }
          return <span className="matrix-dash">—</span>;

        case 'ai_ads':
          if (plan.carouselLimit > 0) {
            return (
              <span className="matrix-check">
                <Check size={16} />
              </span>
            );
          }
          return <span className="matrix-dash">—</span>;

        default:
          return null;
      }
    };

    const comparisonData = [
      { feature: 'AI Chat Engine', key: 'chat' },
      { feature: 'Ultra HD Image Generation', key: 'generate_image' },
      { feature: 'AI Canvas & Image Editing', key: 'edit_image' },
      { feature: 'Live Web Search', key: 'web_search' },
      { feature: 'Deep Research Agent', key: 'deep_search' },
      { feature: 'Code Writer & Debugger', key: 'code_writer' },
      { feature: 'Audio & Speech Synthesizer', key: 'convert_audio' },
      { feature: 'Document Parsing & OCR', key: 'convert_docs' },
      { feature: 'AI Legal™ Contract Review', key: 'ai_legal' },
      { feature: 'AI Cashflow™ Financial Analysis', key: 'ai_cashflow' },
      { feature: 'AI Ads & Carousel Generator', key: 'ai_ads' },
    ];

    return (
      <div className="comparison-section">
        <div className="comparison-card">
          {/* Card Header matching reference style */}
          <div className="comparison-card-header">
            <div className="comparison-top-badge">
              <span className="comparison-pill-dot" />
              <span>Full Capabilities Breakdown</span>
            </div>
            <h2 className="comparison-card-title">Compare Plans Details</h2>
            <p className="comparison-card-subtitle">
              A transparent, side-by-side comparison of tools, daily limits, and advanced features
              across every tier.
            </p>
          </div>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="feature-col-th">
                    <span className="feature-th-title">Features & Capabilities</span>
                  </th>
                  {plans.map(p => {
                    const isFree = p.priceMonthly === 0 && p.priceYearly === 0;
                    const priceVal = isFree
                      ? 0
                      : billingCycle === 'yearly'
                        ? p.priceYearlyPerMonth || p.priceMonthly
                        : p.priceMonthly;

                    return (
                      <th key={p._id} className={`plan-col-th ${p.isPopular ? 'popular-col' : ''}`}>
                        {p.isPopular && <div className="col-popular-ribbon">Most Value</div>}
                        <div className="col-plan-title">{renderPlanDisplayName(p.planName)}</div>
                        <div className="col-price-row">
                          <span className="col-curr">₹</span>
                          <span className="col-amount">{priceVal.toLocaleString('en-IN')}</span>
                          <span className="col-cycle">/mo</span>
                        </div>
                        <button
                          className={`col-action-pill ${p.isPopular ? 'popular-btn' : 'standard-btn'}`}
                          onClick={() => handleUpgrade(p)}
                          disabled={processing}
                        >
                          {isFree ? 'Start Free' : p.isPopular ? 'Get Started' : 'Choose Plan'}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {comparisonData.map(row => (
                  <tr key={`comp-row-${row.key}`}>
                    <td className="feature-name-cell">
                      <div className="feature-name-group">
                        <span className="feature-dot" />
                        <span className="feature-title">{row.feature}</span>
                      </div>
                    </td>
                    {plans.map(plan => (
                      <td
                        key={`${plan._id}-${row.key}`}
                        className={`value-cell ${plan.isPopular ? 'popular-col' : ''}`}
                      >
                        {getFeatureValue(row.key, plan)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="comparison-card-footer">
            <span className="swipe-hint-text">
              💡 Swipe horizontally on smaller screens to compare all 4 plans
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        Loading incredible pricing...
      </div>
    );
  }

  return (
    <div className="pricing-page">
      <button onClick={() => navigate(-1)} className="back-button">
        <ArrowLeft size={18} />
        <span>{t('back')}</span>
      </button>

      <div className="pricing-header">
        <div className="pricing-top-pill">
          <span className="pricing-top-pill-dot" />
          <span>Transparent pricing, with top tier AI partner</span>
        </div>
        <h1>{t('unlockAIPotential')}</h1>
        <p>{t('choosePerfectPlan')}</p>

        <div className="billing-toggle">
          <span className={`billing-label ${billingCycle === 'monthly' ? 'active' : ''}`}>
            {t('monthly')}
          </span>
          <div className={`toggle-switch ${billingCycle}`} onClick={handleToggle}></div>
          <span className={`billing-label ${billingCycle === 'yearly' ? 'active' : ''}`}>
            {t('yearly')}
          </span>
          {billingCycle === 'yearly' && <span className="save-badge">{t('saveBadge')}</span>}
        </div>
      </div>

      {/* ── Mobile swipe hint ── */}
      {isTabletCarousel && (
        <div className="pricing-swipe-hint" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
          <span>Swipe to explore plans</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}

      <div className="pricing-grid" ref={gridRef}>
        {plans.map(plan => {
          const isFounder =
            plan.planName.toLowerCase().includes('startup pro') ||
            plan.planName.toLowerCase().includes('startup');
          const isFree = plan.priceMonthly === 0 && plan.priceYearly === 0;
          const isCurrentPlan = (() => {
            const pn = plan.planName.toLowerCase().trim();
            const pid = (plan.planId || '').toLowerCase().trim();
            const isEnterprise =
              pid === 'plan_3' || pn.includes('enterprise') || pn.includes('business');

            if (isAdmin) {
              return isEnterprise;
            }

            if (!currentPlanName) return false;
            const cName = currentPlanName.toLowerCase().trim();
            if (cName.includes('admin') || cName.includes('unlimited')) {
              return isEnterprise;
            }
            if (cName === 'startup pro' || cName === 'startup' || cName === 'plan_2')
              return pn.includes('startup') || pid === 'plan_2' || pn.includes('pro');
            if (cName === 'free' || cName === 'free tier' || cName === 'plan_0') return isFree;
            if (cName === 'plan_1' || cName === 'creator' || cName === 'starter')
              return pid === 'plan_1' || pn.includes('starter') || pn.includes('creator');
            if (cName === 'plan_3' || cName === 'business' || cName === 'enterprise')
              return isEnterprise;
            return pid === cName || pn.includes(cName) || cName.includes(pn.split(' ')[0]);
          })();

          // Check if an active promotional offer is configured AND user is eligible
          const isOfferEligible = plan.isEligibleForOffer !== false;
          const isFirstTimeOfferOnly =
            plan.offerForFirstTimeOnly !== false && plan.offerValidityType !== 'all_users';

          const hasOffer =
            Boolean(plan.isOfferActive) &&
            isOfferEligible &&
            !isFree &&
            ((billingCycle === 'monthly' &&
              plan.offerPriceMonthly != null &&
              plan.offerPriceMonthly >= 0) ||
              (billingCycle === 'yearly' &&
                plan.offerPriceYearly != null &&
                plan.offerPriceYearly >= 0));

          // If plan has an active offer but user already claimed first-time offer
          const isOfferClaimed =
            Boolean(plan.isOfferActive) && !isOfferEligible && isFirstTimeOfferOnly && !isFree;

          const regularMonthly = plan.priceMonthly;
          const regularYearly = plan.priceYearly || 0;

          // Calculate effective prices with offer support
          const displayPrice = hasOffer
            ? billingCycle === 'yearly'
              ? Math.round((plan.offerPriceYearly ?? regularYearly) / 12)
              : plan.offerPriceMonthly
            : billingCycle === 'yearly'
              ? plan.priceYearlyPerMonth || plan.priceMonthly
              : plan.priceMonthly;

          const totalYearlyAmount =
            hasOffer && plan.offerPriceYearly != null
              ? plan.offerPriceYearly
              : plan.priceYearly || 0;

          const displayCredits =
            billingCycle === 'yearly' ? plan.creditsYearly || plan.credits : plan.credits;
          const displayValidity =
            billingCycle === 'yearly'
              ? (plan.validityYearly || 12) + ' Months'
              : (plan.validityMonthly || 1) + ' Month';

          const hasTopBadge = Boolean(
            isCurrentPlan || hasOffer || isOfferClaimed || plan.badge || plan.isPopular
          );

          return (
            <div
              key={plan._id}
              className={`pricing-card ${hasTopBadge ? 'has-top-badge' : ''} ${plan.isPopular ? 'popular' : ''} ${isFree ? 'free-tier-card' : ''} ${isCurrentPlan ? 'current-plan-card' : ''} ${hasOffer ? 'has-offer-card' : ''}`}
              onClick={() => {
                if (!isCurrentPlan && !processing) {
                  handleUpgrade(plan);
                }
              }}
              role={!isCurrentPlan ? 'button' : undefined}
              tabIndex={!isCurrentPlan ? 0 : undefined}
              onKeyDown={e => {
                if (!isCurrentPlan && !processing && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleUpgrade(plan);
                }
              }}
            >
              {/* Top Floating Badge */}
              {isCurrentPlan && (
                <div className="card-top-pill-badge current-plan">
                  {isAdmin ? '⚡ ADMIN UNLIMITED ACCESS' : `✓ ${t('currentPlan')}`}
                </div>
              )}
              {!isCurrentPlan && hasOffer && (
                <div className="card-top-pill-badge offer-pill">
                  🔥 {plan.offerBadge || 'SPECIAL OFFER'}
                </div>
              )}
              {!isCurrentPlan && !hasOffer && isOfferClaimed && (
                <div
                  className="card-top-pill-badge claimed-pill"
                  title="First-time promotional offer has already been claimed on this account"
                >
                  Offer Claimed
                </div>
              )}
              {!isCurrentPlan && !hasOffer && !isOfferClaimed && plan.isPopular && (
                <div className="card-top-pill-badge popular-pill">MOST VALUE TO PRICE</div>
              )}
              {!isCurrentPlan &&
                !hasOffer &&
                !isOfferClaimed &&
                !plan.isPopular &&
                plan.badge &&
                plan.badge.toLowerCase() !== plan.planName.toLowerCase() && (
                  <div className={`card-top-pill-badge ${isFounder ? 'launch-pill' : ''}`}>
                    {plan.badge}
                  </div>
                )}

              {/* Card Header Top Row: Category Label + More Options */}
              <div className="card-header-top-row">
                <span className="card-category-tag">{getPlanCategoryLabel(plan)}</span>
                <span className="card-options-dots" title="Plan tier details">
                  <MoreHorizontal size={15} />
                </span>
              </div>

              {/* Plan Title & Tagline */}
              <div className="card-title-block">
                <h3 className="card-main-title">{renderPlanDisplayName(plan.planName)}</h3>
                <p className="card-subtitle-text">{getPlanSubtitle(plan)}</p>
              </div>

              {/* Signature Action + Price Row (Side by Side) */}
              <div className="card-action-price-row">
                {/* Left side: Pill CTA Button */}
                <div className="card-btn-col">
                  {isCurrentPlan ? (
                    <button className="card-pill-btn current-plan-btn" disabled>
                      {isAdmin ? '✓ Admin Access' : `✓ ${t('currentPlan')}`}
                    </button>
                  ) : (
                    <button
                      className={`card-pill-btn ${plan.isPopular ? 'popular-action-btn' : 'standard-action-btn'}`}
                      onClick={e => {
                        e.stopPropagation();
                        handleUpgrade(plan);
                      }}
                      disabled={processing}
                    >
                      {displayPrice === 0
                        ? t('startForFree') || 'Start Free'
                        : plan.isPopular
                          ? 'Get Started'
                          : getDisplayPlanName(plan.planName).toLowerCase().includes('enterprise')
                            ? 'Get Started'
                            : 'Get Started'}
                    </button>
                  )}
                </div>

                {/* Right side: Price */}
                <div className="card-price-col">
                  {!isFree && (hasOffer || billingCycle === 'yearly') && (
                    <div className="price-struck-row">
                      <span className="strike-amount">
                        ₹
                        {billingCycle === 'yearly'
                          ? Math.round(regularYearly / 12)
                          : regularMonthly}
                      </span>
                      <span className="discount-tag-pill">
                        {hasOffer
                          ? plan.offerBadge ||
                            `${Math.round(
                              ((regularMonthly - (plan.offerPriceMonthly ?? regularMonthly)) /
                                regularMonthly) *
                                100
                            )}% OFF`
                          : '30% OFF'}
                      </span>
                    </div>
                  )}
                  <div className="price-figure-row">
                    <span className="price-curr">₹</span>
                    <span className="price-num">{displayPrice.toLocaleString('en-IN')}</span>
                    <span className="price-cycle">/mo</span>
                  </div>
                  <div className="price-sub-note">
                    {displayPrice === 0
                      ? 'Free forever'
                      : billingCycle === 'yearly'
                        ? `Billed ₹${totalYearlyAmount.toLocaleString('en-IN')}/yr`
                        : 'Pause or cancel anytime'}
                  </div>
                  {hasOffer && plan.offerSubtitle && (
                    <div className="card-offer-subtitle">{plan.offerSubtitle}</div>
                  )}
                  {isOfferClaimed && (
                    <div className="card-offer-claimed-text">Offer claimed • Standard renewal</div>
                  )}
                </div>
              </div>

              {/* Lower Tray: Clean Features Checklist matching reference UI */}
              <div className="card-features-tray">
                <ul className="card-features-checklist">
                  {(plan.features || [])
                    .filter(feature => !/video/i.test(feature))
                    .map((feature, i) => {
                      const formattedFeature = formatFeatureString(feature, plan);
                      return (
                        <li key={`feat-${plan._id || plan.planId || 'p'}-${feature}-${i}`}>
                          <Check size={14} className="feature-check" />
                          <span className="feature-text">
                            {formattedFeature.replace(/^AISA\s+/i, '')}
                          </span>
                        </li>
                      );
                    })}
                </ul>

                {!isFree && (
                  <div className="card-validity-tag">
                    <ShieldAlert size={12} />
                    <span>
                      {t('validityLabel')} {displayValidity}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Climate & Green AI Sustainability Banner (Matching Reference UI) ── */}
      <div className="pricing-climate-banner">
        <span className="pricing-climate-leaf">🌱</span>
        <span>
          AISA™ contributes 1% of your subscription to green AI & carbon removal through Stripe
          Climate
        </span>
      </div>

      {/* ── Mobile dot indicators ── */}
      {plans.length > 0 && isMobile && (
        <div className="pricing-dots" role="tablist" aria-label="Plan selector">
          {plans.map((_, i) => (
            <button
              key={i}
              className={`pricing-dot${activeCard === i ? ' active' : ''}`}
              onClick={() => scrollToCard(i)}
              role="tab"
              aria-selected={activeCard === i}
              aria-label={`Plan ${i + 1}`}
            />
          ))}
        </div>
      )}

      {renderComparisonTable()}

      {/* ── Billing Information Modal (Matching Plan Card UI) ── */}
      {billingModalOpen &&
        selectedPlanForUpgrade &&
        (() => {
          const isOfferEligible = selectedPlanForUpgrade.isEligibleForOffer !== false;
          const hasOffer =
            Boolean(selectedPlanForUpgrade.isOfferActive) &&
            isOfferEligible &&
            ((billingCycle === 'monthly' &&
              selectedPlanForUpgrade.offerPriceMonthly != null &&
              selectedPlanForUpgrade.offerPriceMonthly >= 0) ||
              (billingCycle === 'yearly' &&
                selectedPlanForUpgrade.offerPriceYearly != null &&
                selectedPlanForUpgrade.offerPriceYearly >= 0));

          const regularPrice =
            billingCycle === 'yearly'
              ? selectedPlanForUpgrade.priceYearly
              : selectedPlanForUpgrade.priceMonthly;

          const effectivePrice = hasOffer
            ? billingCycle === 'yearly'
              ? (selectedPlanForUpgrade.offerPriceYearly ?? regularPrice)
              : selectedPlanForUpgrade.offerPriceMonthly
            : regularPrice;

          const displayPrice = hasOffer
            ? billingCycle === 'yearly'
              ? Math.round((selectedPlanForUpgrade.offerPriceYearly ?? regularPrice) / 12)
              : selectedPlanForUpgrade.offerPriceMonthly
            : billingCycle === 'yearly'
              ? selectedPlanForUpgrade.priceYearlyPerMonth || selectedPlanForUpgrade.priceMonthly
              : selectedPlanForUpgrade.priceMonthly;

          const discountPercent =
            hasOffer && regularPrice > 0
              ? Math.round(
                  ((regularPrice - (selectedPlanForUpgrade.offerPriceMonthly ?? regularPrice)) /
                    regularPrice) *
                    100
                )
              : billingCycle === 'yearly'
                ? 30
                : 0;

          const displayValidity =
            billingCycle === 'yearly'
              ? (selectedPlanForUpgrade.validityYearly || 12) + ' Months'
              : (selectedPlanForUpgrade.validityMonthly || 1) + ' Month';

          const isPopular = selectedPlanForUpgrade.isPopular;

          return (
            <div
              className="billing-modal-backdrop"
              onClick={e => {
                if (e.target === e.currentTarget) setBillingModalOpen(false);
              }}
            >
              <div
                className={`billing-modal-card ${isPopular ? 'popular-modal' : ''}`}
                role="dialog"
                aria-modal="true"
              >
                {/* Top Floating Pill Badge matching plan card aesthetic */}
                {hasOffer && (
                  <div className="card-top-pill-badge offer-pill">
                    🔥 {selectedPlanForUpgrade.offerBadge || `${discountPercent}% OFF`}
                  </div>
                )}
                {!hasOffer && isPopular && (
                  <div className="card-top-pill-badge popular-pill">MOST VALUE TO PRICE</div>
                )}
                {!hasOffer && !isPopular && (
                  <div className="card-top-pill-badge checkout-pill">✓ Secure Checkout</div>
                )}

                {/* Card Header Top Row: Category Label + Close Button */}
                <div className="card-header-top-row">
                  <span className="card-category-tag">
                    {getPlanCategoryLabel(selectedPlanForUpgrade)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBillingModalOpen(false)}
                    className="modal-close-btn"
                    aria-label="Close checkout modal"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Plan Title & Subtitle matching reference typography */}
                <div className="card-title-block">
                  <h3 className="card-main-title">
                    {renderPlanDisplayName(selectedPlanForUpgrade.planName)}
                  </h3>
                  <p className="card-subtitle-text">{getPlanSubtitle(selectedPlanForUpgrade)}</p>
                </div>

                {/* Signature Action + Price Row Container */}
                <div className="modal-summary-box">
                  <div className="modal-summary-left">
                    <div className="modal-cycle-badge">
                      <Zap size={13} />
                      <span>{billingCycle === 'yearly' ? 'Annual Plan' : 'Monthly Plan'}</span>
                    </div>
                    <div className="modal-validity-tag">
                      <ShieldAlert size={12} />
                      <span>
                        {t('validityLabel')} {displayValidity}
                      </span>
                    </div>
                  </div>

                  <div className="modal-summary-right card-price-col">
                    {(hasOffer || billingCycle === 'yearly') && (
                      <div className="price-struck-row">
                        <span className="strike-amount">
                          ₹
                          {billingCycle === 'yearly' ? Math.round(regularPrice / 12) : regularPrice}
                        </span>
                        <span className="discount-tag-pill">
                          {hasOffer
                            ? selectedPlanForUpgrade.offerBadge || `${discountPercent}% OFF`
                            : '30% OFF'}
                        </span>
                      </div>
                    )}
                    <div className="price-figure-row">
                      <span className="price-curr">₹</span>
                      <span className="price-num">{displayPrice.toLocaleString('en-IN')}</span>
                      <span className="price-cycle">/mo</span>
                    </div>
                    <div className="price-sub-note">
                      {billingCycle === 'yearly'
                        ? `Billed ₹${Number(effectivePrice).toLocaleString('en-IN')}/yr`
                        : 'Pause or cancel anytime'}
                    </div>
                    <div className="modal-gst-tag">Includes 18% GST (Tax inclusive)</div>
                  </div>
                </div>

                {/* Quick Perks Checklist */}
                <ul className="modal-perks-list">
                  <li>
                    <Check size={14} className="feature-check" />
                    <span>Instant plan activation directly to your account</span>
                  </li>
                  <li>
                    <Check size={14} className="feature-check" />
                    <span>Unlimited priority access to AI models & features</span>
                  </li>
                  <li>
                    <Check size={14} className="feature-check" />
                    <span>Pause, upgrade or cancel anytime with one click</span>
                  </li>
                </ul>

                {/* Primary & Secondary Action Buttons */}
                <div className="modal-actions-stack">
                  <button
                    type="button"
                    onClick={() => {
                      setBillingModalOpen(false);
                      executeUpgrade(selectedPlanForUpgrade, billingForm);
                    }}
                    className="modal-pay-btn"
                    disabled={processing}
                  >
                    <Lock size={15} />
                    <span>Proceed to Payment (Card / UPI / NetBanking)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillingModalOpen(false)}
                    className="modal-cancel-btn"
                  >
                    Cancel Order
                  </button>
                </div>

                {/* Trust & Sustainability Footer */}
                <div className="modal-trust-footer">
                  <div className="modal-methods-note">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span>256-bit encrypted checkout via Razorpay</span>
                  </div>
                  <div className="modal-climate-note">
                    <span className="pricing-climate-leaf">🌱</span>
                    <span>1% contributes to carbon removal through Stripe Climate</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Upsell modal removed since credits packages are deprecated */}
    </div>
  );
};

export default Pricing;
