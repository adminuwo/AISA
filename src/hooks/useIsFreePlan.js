import useCreditStore from '../userStore/useCreditStore';
import { useUserStore } from '../userStore/useUserStore';
import { getUserData } from '../userStore/userData';

export const useIsFreePlan = () => {
  const storePlanKey = useCreditStore(state => state.planKey);
  const storeUser = useUserStore(state => state.user);
  const localUser = getUserData();

  const user = storeUser || localUser || {};

  // Admin users are never on a free tier
  if (
    user?.role === 'admin' ||
    (user?.email && String(user.email).toLowerCase() === 'admin@uwo24.com') ||
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
