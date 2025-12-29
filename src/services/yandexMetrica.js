/**
 * Yandex Metrica Analytics Service for RoadHelp
 * Frontend analytics tracking
 * 
 * To use:
 * 1. Create counter at https://metrica.yandex.ru
 * 2. Add counter ID to .env: VITE_YANDEX_METRICA_ID=your_counter_id
 */

class YandexMetrica {
  constructor() {
    this.counterId = import.meta.env.VITE_YANDEX_METRICA_ID || null;
    this.initialized = false;
    
    if (this.counterId) {
      this.init();
    } else {
      console.log('📊 Yandex Metrica: Counter ID not configured');
    }
  }

  /**
   * Initialize Yandex Metrica
   */
  init() {
    if (this.initialized || typeof window === 'undefined') return;

    // Create counter script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

      ym(${this.counterId}, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
        trackHash: true
      });
    `;
    document.head.appendChild(script);

    // Create noscript fallback
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${this.counterId}" style="position:absolute; left:-9999px;" alt="" /></div>`;
    document.body.appendChild(noscript);

    this.initialized = true;
    console.log('✅ Yandex Metrica: Initialized');
  }

  /**
   * Track page view
   */
  hit(url, options = {}) {
    if (!this.initialized || !window.ym) return;
    
    window.ym(this.counterId, 'hit', url, {
      title: options.title || document.title,
      referer: options.referer || document.referrer,
      params: options.params || {}
    });
  }

  /**
   * Track goal/event
   */
  reachGoal(goalName, params = {}) {
    if (!this.initialized || !window.ym) {
      console.log('📊 [DEV] Goal:', goalName, params);
      return;
    }
    
    window.ym(this.counterId, 'reachGoal', goalName, params);
    console.log('📊 Goal tracked:', goalName);
  }

  /**
   * Set user params
   */
  setUserParams(params) {
    if (!this.initialized || !window.ym) return;
    
    window.ym(this.counterId, 'userParams', params);
  }

  /**
   * Set user ID for cross-device tracking
   */
  setUserId(userId) {
    if (!this.initialized || !window.ym) return;
    
    window.ym(this.counterId, 'setUserID', String(userId));
  }

  // ============================================
  // RoadHelp Specific Events
  // ============================================

  /**
   * Track registration
   */
  trackRegistration(method = 'email') {
    this.reachGoal('registration', { method });
  }

  /**
   * Track login
   */
  trackLogin(method = 'email') {
    this.reachGoal('login', { method });
  }

  /**
   * Track help request creation
   */
  trackRequestCreated(problemType) {
    this.reachGoal('request_created', { problem_type: problemType });
  }

  /**
   * Track response to request
   */
  trackResponseSent(requestId) {
    this.reachGoal('response_sent', { request_id: requestId });
  }

  /**
   * Track response accepted
   */
  trackResponseAccepted(requestId) {
    this.reachGoal('response_accepted', { request_id: requestId });
  }

  /**
   * Track request completed
   */
  trackRequestCompleted(requestId, duration) {
    this.reachGoal('request_completed', { 
      request_id: requestId,
      duration_minutes: Math.round(duration / 60000)
    });
  }

  /**
   * Track rating submitted
   */
  trackRatingSubmitted(rating) {
    this.reachGoal('rating_submitted', { rating });
  }

  /**
   * Track payment initiated
   */
  trackPaymentInitiated(amount) {
    this.reachGoal('payment_initiated', { amount });
  }

  /**
   * Track payment completed
   */
  trackPaymentCompleted(amount) {
    this.reachGoal('payment_completed', { amount });
  }

  /**
   * Track SOS button pressed
   */
  trackSOSPressed() {
    this.reachGoal('sos_pressed');
  }

  /**
   * Track chat opened
   */
  trackChatOpened(chatType) {
    this.reachGoal('chat_opened', { type: chatType });
  }

  /**
   * Track profile updated
   */
  trackProfileUpdated(fields) {
    this.reachGoal('profile_updated', { fields: fields.join(',') });
  }

  /**
   * Track helper mode toggled
   */
  trackHelperModeToggled(enabled) {
    this.reachGoal('helper_mode_toggled', { enabled });
  }
}

// Singleton instance
const metrica = new YandexMetrica();

export default metrica;

// Vue plugin for easy integration
export const YandexMetricaPlugin = {
  install(app) {
    app.config.globalProperties.$metrica = metrica;
    app.provide('metrica', metrica);
  }
};
