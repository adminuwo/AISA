/**
 * AISA™ Affiliate Tracker Script
 * Captures affiliate and referral parameters from the URL query string
 * and persists them in localStorage, sessionStorage, and cookies.
 */
(function() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const affiliateId = urlParams.get('ref') || urlParams.get('aff') || urlParams.get('affiliate') || urlParams.get('utm_source');
    
    if (affiliateId) {
      const sanitizedId = encodeURIComponent(affiliateId.trim());
      
      // 1. Persist to localStorage
      localStorage.setItem('aisa_affiliate_id', sanitizedId);
      localStorage.setItem('aisa_affiliate_timestamp', new Date().toISOString());
      
      // 2. Persist to sessionStorage
      sessionStorage.setItem('aisa_affiliate_id', sanitizedId);
      
      // 3. Persist to Cookie (expires in 30 days)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      document.cookie = `aisa_affiliate_id=${sanitizedId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax; Secure`;
      
      console.log('[Affiliate Tracker] Successfully tracked affiliate ID:', sanitizedId);
    }
  } catch (error) {
    console.error('[Affiliate Tracker] Error processing affiliate parameter:', error);
  }
})();
