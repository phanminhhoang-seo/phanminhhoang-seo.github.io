/**
 * ====================================================================
 * PROFESSIONAL PORTFOLIO JAVASCRIPT
 * Version: 2.0
 * Author: Phan Minh Hoàng
 * Description: Modular, performance-optimized JavaScript with OOP approach
 * ====================================================================
 */

'use strict';

/**
 * ====================================================================
 * 1. CONSTANTS & CONFIGURATION
 * ====================================================================
 */
const CONFIG = {
  // Animation settings
  ANIMATION: {
    AOS_DURATION: 1000,
    AOS_OFFSET: 50,
    AOS_ONCE: true,
    AOS_MIRROR: false,
    TYPING_SPEED: 70,
    TYPING_SPEED_MOBILE: 50,
    BACKSPACE_SPEED: 40,
    BACKSPACE_SPEED_MOBILE: 30,
    BACK_DELAY: 1500,
    START_DELAY: 500,
  },

  // Breakpoints
  BREAKPOINTS: {
    MOBILE: 768,
    SMALL_MOBILE: 480,
    TABLET: 992,
    DESKTOP: 1200,
  },

  // Scroll settings
  SCROLL: {
    HEADER_OFFSET: 80,
    SCROLL_THRESHOLD: 100,
    SMOOTH_SCROLL_DURATION: 800,
  },

  // Debounce/Throttle delays
  DELAYS: {
    RESIZE: 250,
    SCROLL: 100,
  },

  // Selectors
  SELECTORS: {
    HEADER: '.global-header',
    MOBILE_TOGGLE: '.mobile-menu-toggle',
    MAIN_NAV: '.main-nav',
    NAV_LINKS: '.main-nav a',
    TYPING_ELEMENT: '.typing-animation',
    HERO_TITLE: '.hero-content h1',
    BODY: 'body',
  },

  // Classes
  CLASSES: {
    ACTIVE: 'active',
    NO_SCROLL: 'no-scroll',
    SCROLLED: 'scrolled',
    TOUCH_DEVICE: 'touch-device',
  },
};

/**
 * ====================================================================
 * 2. UTILITY FUNCTIONS
 * ====================================================================
 */
const Utils = {
  /**
   * Check if device is mobile
   * @returns {boolean}
   */
  isMobile() {
    return window.innerWidth <= CONFIG.BREAKPOINTS.MOBILE;
  },

  /**
   * Check if device is small mobile
   * @returns {boolean}
   */
  isSmallMobile() {
    return window.innerWidth <= CONFIG.BREAKPOINTS.SMALL_MOBILE;
  },

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function}
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in ms
   * @returns {Function}
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Easing function for smooth scroll
   * @param {number} t - Time
   * @returns {number}
   */
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  /**
   * Get element by selector with error handling
   * @param {string} selector
   * @returns {Element|null}
   */
  getElement(selector) {
    try {
      return document.querySelector(selector);
    } catch (error) {
      console.warn(`Element not found: ${selector}`, error);
      return null;
    }
  },

  /**
   * Get all elements by selector with error handling
   * @param {string} selector
   * @returns {NodeList}
   */
  getAllElements(selector) {
    try {
      return document.querySelectorAll(selector);
    } catch (error) {
      console.warn(`Elements not found: ${selector}`, error);
      return [];
    }
  },
};

/**
 * ====================================================================
 * 3. ANIMATION MODULE
 * ====================================================================
 */
const AnimationModule = {
  /**
   * Initialize AOS (Animate On Scroll) library
   */
  initAOS() {
    if (typeof AOS === 'undefined') {
      console.warn('AOS library not loaded');
      return;
    }

    try {
      AOS.init({
        duration: CONFIG.ANIMATION.AOS_DURATION,
        once: CONFIG.ANIMATION.AOS_ONCE,
        mirror: CONFIG.ANIMATION.AOS_MIRROR,
        offset: CONFIG.ANIMATION.AOS_OFFSET,
        disable: () => window.innerWidth < 320, // Disable on very small screens
      });
      console.log('✓ AOS initialized successfully');
    } catch (error) {
      console.error('AOS initialization failed:', error);
    }
  },

  /**
   * Initialize Typed.js for typing animation
   */
  initTypingAnimation() {
    if (typeof Typed === 'undefined') {
      console.warn('Typed.js library not loaded');
      return;
    }

    const typingElement = Utils.getElement(CONFIG.SELECTORS.TYPING_ELEMENT);
    if (!typingElement) return;

    // Get strings based on language
    const lang = document.documentElement.lang || 'vi';
    const strings = this.getTypingStrings(lang);

    // Set container height
    this.setContainerHeight();

    const isMobile = Utils.isMobile();

    try {
      new Typed(CONFIG.SELECTORS.TYPING_ELEMENT, {
        strings,
        typeSpeed: isMobile
          ? CONFIG.ANIMATION.TYPING_SPEED_MOBILE
          : CONFIG.ANIMATION.TYPING_SPEED,
        backSpeed: isMobile
          ? CONFIG.ANIMATION.BACKSPACE_SPEED_MOBILE
          : CONFIG.ANIMATION.BACKSPACE_SPEED,
        backDelay: CONFIG.ANIMATION.BACK_DELAY,
        startDelay: CONFIG.ANIMATION.START_DELAY,
        loop: true,
        showCursor: true,
        cursorChar: '|',
        autoInsertCss: true,
        preStringTyped: this.onPreStringTyped.bind(this),
        onStringTyped: this.onStringTyped.bind(this),
      });
      console.log('✓ Typing animation initialized');
    } catch (error) {
      console.error('Typed.js initialization failed:', error);
    }
  },

  /**
   * Get typing strings based on language
   * @param {string} lang - Language code
   * @returns {Array}
   */
  getTypingStrings(lang) {
    const strings = {
      vi: [
        'Phan Minh Hoàng',
        'một chuyên gia SEO',
        'một chuyên gia tối ưu hóa tìm kiếm',
      ],
      en: [
        'Phan Minh Hoang',
        'an SEO specialist',
        'a search optimization expert',
        'a digital creator',
      ],
    };
    return strings[lang] || strings.vi;
  },

  /**
   * Set container height for typing animation
   */
  setContainerHeight() {
    const heroTitle = Utils.getElement(CONFIG.SELECTORS.HERO_TITLE);
    if (heroTitle) {
      const baseHeight = Utils.isMobile() ? 120 : 180;
      heroTitle.style.minHeight = `${baseHeight}px`;
    }
  },

  /**
   * Callback before typing each string
   * @param {number} arrayPos
   * @param {Object} self
   */
  onPreStringTyped(arrayPos, self) {
    const container = self.el.parentElement;
    if (container) {
      container.style.minHeight = `${container.offsetHeight}px`;
    }
  },

  /**
   * Callback after typing each string
   * @param {number} arrayPos
   * @param {Object} self
   */
  onStringTyped(arrayPos, self) {
    if (Utils.isMobile()) {
      const container = self.el.parentElement;
      if (container) {
        container.style.minHeight = '120px';
      }
    }
  },

  /**
   * Refresh AOS animations
   */
  refreshAOS() {
    if (typeof AOS !== 'undefined' && typeof AOS.refresh === 'function') {
      AOS.refresh();
    }
  },
};

/**
 * ====================================================================
 * 4. NAVIGATION MODULE
 * ====================================================================
 */
const NavigationModule = {
  mobileToggle: null,
  mainNav: null,
  navLinks: [],
  body: null,

  /**
   * Initialize navigation
   */
  init() {
    this.cacheDOM();
    this.bindEvents();
    console.log('✓ Navigation initialized');
  },

  /**
   * Cache DOM elements
   */
  cacheDOM() {
    this.mobileToggle = Utils.getElement(CONFIG.SELECTORS.MOBILE_TOGGLE);
    this.mainNav = Utils.getElement(CONFIG.SELECTORS.MAIN_NAV);
    this.navLinks = Utils.getAllElements(CONFIG.SELECTORS.NAV_LINKS);
    this.body = Utils.getElement(CONFIG.SELECTORS.BODY);
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    if (!this.mobileToggle || !this.mainNav) return;

    // Mobile toggle click
    this.mobileToggle.addEventListener('click', this.toggleMenu.bind(this));

    // Nav links click
    this.navLinks.forEach((link) => {
      link.addEventListener('click', this.handleLinkClick.bind(this));
    });

    // Click outside to close
    document.addEventListener('click', this.handleOutsideClick.bind(this));

    // Touch gestures
    this.initTouchGestures();
  },

  /**
   * Toggle mobile menu
   * @param {Event} e
   */
  toggleMenu(e) {
    e.preventDefault();
    e.stopPropagation();

    const isActive = this.mobileToggle.classList.toggle(CONFIG.CLASSES.ACTIVE);
    this.mainNav.classList.toggle(CONFIG.CLASSES.ACTIVE);
    this.body.classList.toggle(CONFIG.CLASSES.NO_SCROLL);

    // Update ARIA attributes
    this.mobileToggle.setAttribute('aria-expanded', isActive);
    this.mainNav.setAttribute('aria-hidden', !isActive);
  },

  /**
   * Handle nav link click
   */
  handleLinkClick() {
    setTimeout(() => {
      this.closeMenu();
    }, 100);
  },

  /**
   * Handle click outside menu
   * @param {Event} e
   */
  handleOutsideClick(e) {
    if (
      !this.mobileToggle.contains(e.target) &&
      !this.mainNav.contains(e.target)
    ) {
      this.closeMenu();
    }
  },

  /**
   * Close mobile menu
   */
  closeMenu() {
    this.mobileToggle?.classList.remove(CONFIG.CLASSES.ACTIVE);
    this.mainNav?.classList.remove(CONFIG.CLASSES.ACTIVE);
    this.body?.classList.remove(CONFIG.CLASSES.NO_SCROLL);

    // Update ARIA attributes
    this.mobileToggle?.setAttribute('aria-expanded', 'false');
    this.mainNav?.setAttribute('aria-hidden', 'true');
  },

  /**
   * Initialize touch gestures for mobile menu
   */
  initTouchGestures() {
    if (!this.mainNav) return;

    let startY = 0;

    this.mainNav.addEventListener(
      'touchstart',
      (e) => {
        startY = e.touches[0].clientY;
      },
      { passive: true }
    );

    this.mainNav.addEventListener(
      'touchmove',
      (e) => {
        const currentY = e.touches[0].clientY;
        const diffY = startY - currentY;

        // Swipe up to close
        if (diffY > 50) {
          this.closeMenu();
        }
      },
      { passive: true }
    );
  },
};

/**
 * ====================================================================
 * 5. SCROLL MODULE
 * ====================================================================
 */
const ScrollModule = {
  header: null,

  /**
   * Initialize scroll functionality
   */
  init() {
    this.header = Utils.getElement(CONFIG.SELECTORS.HEADER);
    this.bindEvents();
    this.initSmoothScroll();
    console.log('✓ Scroll module initialized');
  },

  /**
   * Bind scroll events
   */
  bindEvents() {
    const throttledScroll = Utils.throttle(
      this.handleScroll.bind(this),
      CONFIG.DELAYS.SCROLL
    );

    window.addEventListener('scroll', throttledScroll, { passive: true });
  },

  /**
   * Handle scroll event
   */
  handleScroll() {
    if (!this.header) return;

    if (window.scrollY > CONFIG.SCROLL.SCROLL_THRESHOLD) {
      this.header.classList.add(CONFIG.CLASSES.SCROLLED);
    } else {
      this.header.classList.remove(CONFIG.CLASSES.SCROLLED);
    }
  },

  /**
   * Initialize smooth scrolling for anchor links
   */
  initSmoothScroll() {
    const anchorLinks = Utils.getAllElements('a[href^="#"]');

    anchorLinks.forEach((anchor) => {
      anchor.addEventListener('click', this.handleAnchorClick.bind(this));
    });
  },

  /**
   * Handle anchor link click
   * @param {Event} e
   */
  handleAnchorClick(e) {
    const href = e.currentTarget.getAttribute('href');

    // Skip empty or just # hrefs
    if (!href || href === '#') return;

    // Only handle same-page links
    if (e.currentTarget.pathname !== window.location.pathname) return;

    e.preventDefault();

    const targetElement = Utils.getElement(href);
    if (targetElement) {
      const headerHeight = this.header?.offsetHeight || 60;
      const additionalOffset = Utils.isMobile() ? 20 : 40;
      this.smoothScrollToElement(
        targetElement,
        headerHeight + additionalOffset
      );
    }
  },

  /**
   * Smooth scroll to element
   * @param {Element} targetElement
   * @param {number} offset
   */
  smoothScrollToElement(targetElement, offset = CONFIG.SCROLL.HEADER_OFFSET) {
    if (!targetElement) return;

    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    // Use native smooth scroll if supported
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else {
      // Fallback for older browsers
      this.smoothScrollFallback(offsetPosition);
    }
  },

  /**
   * Smooth scroll fallback for older browsers
   * @param {number} targetPosition
   */
  smoothScrollFallback(targetPosition) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = CONFIG.SCROLL.SMOOTH_SCROLL_DURATION;
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const ease = Utils.easeInOutCubic(progress / duration);

      window.scrollTo(0, startPosition + distance * ease);

      if (progress < duration) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  },
};

/**
 * ====================================================================
 * 6. RESPONSIVE MODULE
 * ====================================================================
 */
const ResponsiveModule = {
  /**
   * Initialize responsive functionality
   */
  init() {
    this.adjustLayout();
    this.bindEvents();
    console.log('✓ Responsive module initialized');
  },

  /**
   * Bind resize events
   */
  bindEvents() {
    const debouncedResize = Utils.debounce(
      this.handleResize.bind(this),
      CONFIG.DELAYS.RESIZE
    );

    window.addEventListener('resize', debouncedResize);
  },

  /**
   * Handle window resize
   */
  handleResize() {
    // Close mobile menu when switching to desktop
    if (window.innerWidth > CONFIG.BREAKPOINTS.MOBILE) {
      NavigationModule.closeMenu();
    }

    this.adjustLayout();
    AnimationModule.refreshAOS();
  },

  /**
   * Adjust layout based on screen size
   */
  adjustLayout() {
    this.adjustTextForMobile();
    this.adjustSectionsForMobile();
  },

  /**
   * Adjust text sizes for mobile
   */
  adjustTextForMobile() {
    const heroTitle = Utils.getElement(CONFIG.SELECTORS.HERO_TITLE);
    if (!heroTitle) return;

    if (Utils.isSmallMobile()) {
      heroTitle.style.fontSize = '28px';
      heroTitle.style.lineHeight = '1.2';
      heroTitle.style.minHeight = '100px';
    } else if (Utils.isMobile()) {
      heroTitle.style.fontSize = '36px';
      heroTitle.style.lineHeight = '1.2';
      heroTitle.style.minHeight = '120px';
    } else {
      heroTitle.style.fontSize = '';
      heroTitle.style.lineHeight = '';
      heroTitle.style.minHeight = '';
    }
  },

  /**
   * Adjust section padding for mobile
   */
  adjustSectionsForMobile() {
    const sections = Utils.getAllElements(
      '.hero-section, .skills-section, .projects-section, .experience-section, .contact-section'
    );

    sections.forEach((section) => {
      if (Utils.isMobile()) {
        section.style.paddingTop = '40px';
        section.style.paddingBottom = '40px';
      } else {
        section.style.paddingTop = '';
        section.style.paddingBottom = '';
      }
    });
  },
};

/**
 * ====================================================================
 * 7. PERFORMANCE MODULE
 * ====================================================================
 */
const PerformanceModule = {
  /**
   * Initialize performance optimizations
   */
  init() {
    this.initLazyLoading();
    this.detectTouchDevice();
    console.log('✓ Performance module initialized');
  },

  /**
   * Initialize lazy loading for images
   */
  initLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported');
      return;
    }

    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    const lazyImages = Utils.getAllElements('img[data-src]');
    lazyImages.forEach((img) => imageObserver.observe(img));
  },

  /**
   * Detect and mark touch devices
   */
  detectTouchDevice() {
    if ('ontouchstart' in window) {
      document.body.classList.add(CONFIG.CLASSES.TOUCH_DEVICE);

      // Optimize touch events
      document.addEventListener('touchstart', () => {}, { passive: true });
      document.addEventListener('touchmove', () => {}, { passive: true });
    }
  },
};

/**
 * ====================================================================
 * 8. ERROR HANDLER MODULE
 * ====================================================================
 */
const ErrorHandler = {
  /**
   * Initialize error handling
   */
  init() {
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener(
      'unhandledrejection',
      this.handleRejection.bind(this)
    );
    console.log('✓ Error handler initialized');
  },

  /**
   * Handle JavaScript errors
   * @param {ErrorEvent} event
   */
  handleError(event) {
    console.error('JavaScript Error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });

    // Prevent default error handling
    // event.preventDefault();
  },

  /**
   * Handle unhandled promise rejections
   * @param {PromiseRejectionEvent} event
   */
  handleRejection(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    // event.preventDefault();
  },
};

/**
 * ====================================================================
 * 9. APPLICATION CONTROLLER
 * ====================================================================
 */
const App = {
  /**
   * Initialize the application
   */
  init() {
    console.log('🚀 Initializing Portfolio Application...');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  },

  /**
   * Start the application
   */
  start() {
    try {
      // Initialize all modules
      ErrorHandler.init();
      AnimationModule.initAOS();
      AnimationModule.initTypingAnimation();
      NavigationModule.init();
      ScrollModule.init();
      ResponsiveModule.init();
      PerformanceModule.init();

      console.log('✅ Portfolio application loaded successfully!');
      console.log(`📱 Device: ${Utils.isMobile() ? 'Mobile' : 'Desktop'}`);
      console.log(`🌐 Language: ${document.documentElement.lang || 'vi'}`);
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
    }
  },
};

/**
 * ====================================================================
 * 10. START APPLICATION
 * ====================================================================
 */
App.init();

/**
 * ====================================================================
 * 11. EXPORT FOR MODULE USAGE (Optional)
 * ====================================================================
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    App,
    Utils,
    AnimationModule,
    NavigationModule,
    ScrollModule,
    ResponsiveModule,
    PerformanceModule,
    ErrorHandler,
  };
}

/**
 * ====================================================================
 * END OF SCRIPT
 * ====================================================================
 */
