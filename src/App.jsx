import './App.css';
import NavigationProvider from './Navigation.Provider';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import { clearUser } from './userStore/userData';
//chat
// Global Interceptor for Session Management
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      if (error.response.data?.code === 'SESSION_REVOKED') {
        const currentPath = window.location.pathname || '';
        const isCheckoutOrPayment =
          currentPath.includes('pricing') ||
          currentPath.includes('payment') ||
          currentPath.includes('checkout') ||
          currentPath.includes('subscription');

        // Do not kick user out during payment or subscription checkout flows
        if (!isCheckoutOrPayment) {
          toast.error('Security Alert: You have been logged out remotely.');
          clearUser();
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  console.log('[DEBUG] App component function is executing...');
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-quint',
    });
  }, []);

  return <NavigationProvider />;
}

export default App;
