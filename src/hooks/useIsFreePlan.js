import useCreditStore from '../userStore/useCreditStore';
import { useUserStore } from '../userStore/useUserStore';
import { getUserData } from '../userStore/userData';

export const useIsFreePlan = () => {
  const storePlanKey = useCreditStore(state => state.planKey);
  const storeUser = useUserStore(state => state.user);
  const localUser = getUserData();

  const user = storeUser || localUser || {};
  const rawPlan = user?.planType || user?.subscription?.planKey || storePlanKey || 'free';
  const cleanPlan = String(rawPlan).toLowerCase();

  const isFree = cleanPlan === 'free' || cleanPlan === 'plan_0' || cleanPlan === 'guest';
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
