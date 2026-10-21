import useCreditStore from '../userStore/useCreditStore';
import { useUserStore } from '../userStore/useUserStore';
import { getUserData } from '../userStore/userData';

export const useIsFreePlan = () => {
  const storePlanKey = useCreditStore(state => state.planKey);
  const storeUser = useUserStore(state => state.user);
  const localUser = getUserData();

  const user = storeUser || localUser || {};

  // Extract role and email from user object or decode from stored JWT
  let role = String(user?.role || '')
    .toLowerCase()
    .trim();
  let email = String(user?.email || '')
    .toLowerCase()
    .trim();

  if (!role || !email) {
    try {
      const rawToken =
        user?.token ||
        localStorage.getItem('token') ||
        localStorage.getItem('auth_token') ||
        localStorage.getItem('uwo_access_token');
      if (rawToken && rawToken.includes('.')) {
        const payload = JSON.parse(atob(rawToken.split('.')[1]));
        if (!role && payload.role) role = String(payload.role).toLowerCase().trim();
        if (!email && payload.email) email = String(payload.email).toLowerCase().trim();
      }
    } catch (e) {}
  }

  // Admin users and internal team are never on a free tier
  if (
    role === 'admin' ||
    role === 'super_admin' ||
    role === 'superadmin' ||
    email.endsWith('@uwo24.com') ||
    ['admin@uwo24.com', 'sanskar@uwo24.com', 'sakshi@uwo24.com'].includes(email) ||
    storePlanKey === 'admin'
  ) {
    return false;
  }

  const rawPlan =
    user?.planType ||
    user?.subscription?.planKey ||
    (user?.plan && user.plan !== 'Basic' ? user.plan : null) ||
    storePlanKey ||
    'free';
  const cleanPlan = String(rawPlan).toLowerCase();

  const isFree =
    cleanPlan === 'free' ||
    cleanPlan === 'plan_0' ||
    cleanPlan === 'guest' ||
    cleanPlan === 'basic';
  return isFree;
};

export const triggerUpgradeModal = (toolName = 'Premium Feature', customMessage = '') => {
  window.dispatchEvent(
    new CustomEvent('premium_required', {
      detail: {
        toolName,
        customMessage:
          customMessage ||
          `This feature is reserved for paid plan subscribers. Upgrade your plan to unlock all premium AI tools and features.`,
      },
    })
  );
};

export default useIsFreePlan;
