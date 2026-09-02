import axios from 'axios';
import { API, apis } from '../types';
import { getUserData } from '../userStore/userData';

const getAuthHeaders = () => {
  const token =
    getUserData()?.token ||
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('accessToken') ||
    '';

  const cleanToken = token && token !== 'undefined' && token !== 'null' ? token : '';
  return {
    Authorization: cleanToken ? `Bearer ${cleanToken}` : '',
  };
};

export const getPlans = async () => {
  const response = await axios.get(`${API}/pricing/plans`);
  return response.data;
};

export const getCreditPackages = async () => {
  const response = await axios.get(`${API}/pricing/packages`);
  return response.data;
};

export const getSubscriptionDetails = async () => {
  const response = await axios.get(`${API}/subscription`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const purchasePlan = async (
  planId,
  billingCycle,
  paymentId = null,
  billingDetails = null
) => {
  const response = await axios.post(
    `${API}/subscription/purchase`,
    { planId, billingCycle, paymentId, billingDetails },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const buyCredits = async packageId => {
  const response = await axios.post(
    `${API}/subscription/buy-credits`,
    { packageId },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const createSubscriptionOrder = async orderData => {
  const response = await axios.post(`${API}/subscription/create-order`, orderData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getCreditHistory = async () => {
  const response = await axios.get(apis.subscription.history, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
