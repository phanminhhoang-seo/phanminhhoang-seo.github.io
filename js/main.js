document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize AOS Library
    AOS.init({
        duration: 1000,
        once: true,
        mirror: false,
        offset: 50, // Thêm offset để animation trigger sớm hơn trên mobile
        disable: function() {
            // Disable AOS trên màn hình quá nhỏ để tránh lag
            return window.innerWidth < 320;
        }
    });

    // 2. Typed.js Effect for Hero Title - OPTIMIZED FOR MOBILE
    const typedStringsVi = [
        "Phan Minh Hoàng",
        "một chuyên gia SEO", 
        "một chuyên gia tối ưu hóa tìm kiếm",
        "một người sáng tạo kỹ thuật số"
    ];
    
    const typedStringsEn = [
        "Phan Minh Hoang",
        "an SEO specialist",
        "a search optimization expert", 
        "a digital creator"
    ];

    let currentTypedStrings;
    if (document.documentElement.lang === 'vi') {
        currentTypedStrings = typedStringsVi;
    } else {
        currentTypedStrings = typedStringsEn;
    }

    // Kiểm tra mobile trước khi sử dụng
    const isMobile = window.innerWidth <= 768;

    // Initialize Typed.js với cải thiện cho mobile
    const typingElement = document.querySelector('.typing-animation');
    if (typingElement) {
        // Đảm bảo container có chiều cao cố định
        const heroContent = document.querySelector('.hero-content h1');
        if (heroContent) {
            // Tính chiều cao dựa trên kích thước màn hình
            const baseHeight = isMobile ? 120 : 180;
            heroContent.style.minHeight = baseHeight + 'px';
        }

        new Typed('.typing-animation', {
            strings: currentTypedStrings,
            typeSpeed: isMobile ? 50 : 70, // Nhanh hơn trên mobile
            backSpeed: isMobile ? 30 : 40,
            backDelay: 1500,
            startDelay: 500,
            loop: true,
            showCursor: true,
            cursorChar: '|',
            autoInsertCss: true,
            // Thêm callback để đảm bảo layout ổn định
            preStringTyped: function(arrayPos, self) {
                // Đảm bảo container không thay đổi kích thước
                const container = self.el.parentElement;
                if (container) {
                    container.style.minHeight = container.offsetHeight + 'px';
                }
            },
            onStringTyped: function(arrayPos, self) {
                // Reset container height nếu cần
                const container = self.el.parentElement;
                if (container && window.innerWidth <= 768) {
                    container.style.minHeight = '120px';
                }
            }
        });
    }

    // 3. Mobile Menu Toggle - ENHANCED VERSION
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;

    if (mobileToggle && mainNav) {
        // Toggle menu khi click hamburger
        mobileToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            body.classList.toggle('no-scroll');
        });

        // Đóng menu khi click vào link
        const navLinks = document.querySelectorAll('.main-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Delay để animation diễn ra mượt mà
                setTimeout(() => {
                    mobileToggle.classList.remove('active');
                    mainNav.classList.remove('active');
                    body.classList.remove('no-scroll');
                }, 100);
            });
        });

        // Đóng menu khi click ra ngoài
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !mainNav.contains(e.target)) {
                mobileToggle.classList.remove('active');
                mainNav.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        });

        // Đóng menu khi swipe (touch gesture)
        let startY = 0;
        mainNav.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
        }, {passive: true});

        mainNav.addEventListener('touchmove', function(e) {
            const currentY = e.touches[0].clientY;
            const diffY = startY - currentY;
            
            // Nếu swipe up > 50px thì đóng menu
            if (diffY > 50) {
                mobileToggle.classList.remove('active');
                mainNav.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        }, {passive: true});
    }

    // 4. Smooth Scrolling - OPTIMIZED
    function smoothScrollToElement(targetElement, offset = 80) {
        if (!targetElement) return;
        
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        // Sử dụng requestAnimationFrame cho smooth scroll tự tạo nếu trình duyệt không hỗ trợ
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        } else {
            // Fallback cho trình duyệt cũ
            const startPosition = window.pageYOffset;
            const distance = offsetPosition - startPosition;
            const duration = 800;
            let start = null;

            function step(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const ease = easeInOutCubic(progress / duration);
                
                window.scrollTo(0, startPosition + (distance * ease));
                
                if (progress < duration) {
                    window.requestAnimationFrame(step);
                }
            }
            
            window.requestAnimationFrame(step);
        }
    }

    // Easing function
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Apply smooth scrolling to navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Chỉ xử lý internal links
            if (href === '#' || href === '') return;
            
            // Chỉ xử lý nếu link nằm trên cùng trang
            if (this.pathname === window.location.pathname) {
                e.preventDefault();
                
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerHeight = document.querySelector('.global-header')?.offsetHeight || 60;
                    const additionalOffset = window.innerWidth <= 768 ? 20 : 40;
                    
                    smoothScrollToElement(targetElement, headerHeight + additionalOffset);
                }
            }
        });
    });

    // 5. Responsive Text Adjustment
    function adjustTextForMobile() {
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        
        // Điều chỉnh font size cho hero title
        const heroTitle = document.querySelector('.hero-content h1');
        if (heroTitle) {
            if (isSmallMobile) {
                heroTitle.style.fontSize = '28px';
                heroTitle.style.lineHeight = '1.2';
                heroTitle.style.minHeight = '100px';
            } else if (isMobile) {
                heroTitle.style.fontSize = '36px';
                heroTitle.style.lineHeight = '1.2';
                heroTitle.style.minHeight = '120px';
            } else {
                heroTitle.style.fontSize = '';
                heroTitle.style.lineHeight = '';
                heroTitle.style.minHeight = '';
            }
        }

        // Điều chỉnh padding cho các section
        const sections = document.querySelectorAll('.hero-section, .skills-section, .projects-section, .experience-section, .contact-section');
        sections.forEach(section => {
            if (isMobile) {
                section.style.paddingTop = '40px';
                section.style.paddingBottom = '40px';
            } else {
                section.style.paddingTop = '';
                section.style.paddingBottom = '';
            }
        });

        // Điều chỉnh grid cho mobile
        const grids = document.querySelectorAll('.skills-grid, .projects-grid, .other-projects-grid, .interests-grid');
        grids.forEach(grid => {
            if (isMobile) {
                grid.style.gridTemplateColumns = '1fr';
                grid.style.gap = '20px';
                grid.style.padding = '0 10px';
            }
        });
    }

    // 6. Optimized Resize Handler
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Đóng mobile menu khi chuyển về desktop
            if (window.innerWidth > 768) {
                const mobileToggle = document.querySelector('.mobile-menu-toggle');
                const mainNav = document.querySelector('.main-nav');
                if (mobileToggle && mainNav) {
                    mobileToggle.classList.remove('active');
                    mainNav.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }
            }
            
            // Điều chỉnh text cho mobile
            adjustTextForMobile();
            
            // Refresh AOS if needed
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        }, 250);
    });

    // 7. Performance Optimizations
    
    // Lazy loading cho images (nếu có)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Debounced scroll handler
    let scrollTimeout;
    let isScrolling = false;
    
    window.addEventListener('scroll', function() {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                // Header background change on scroll
                const header = document.querySelector('.global-header');
                if (header) {
                    if (window.scrollY > 100) {
                        header.style.backgroundColor = 'rgba(26, 26, 26, 0.95)';
                        header.style.backdropFilter = 'blur(10px)';
                    } else {
                        header.style.backgroundColor = '#1a1a1a';
                        header.style.backdropFilter = 'none';
                    }
                }
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, {passive: true});

    // 8. Initial setup
    adjustTextForMobile();

    // 9. Error handling
    window.addEventListener('error', function(e) {
        console.warn('JS Error caught:', e.error);
        // Fallback behavior nếu có lỗi
    });

    // 10. Touch optimization for mobile
    if ('ontouchstart' in window) {
        // Thêm class cho touch devices
        document.body.classList.add('touch-device');
        
        // Tối ưu touch events
        document.addEventListener('touchstart', function() {}, {passive: true});
        document.addEventListener('touchmove', function() {}, {passive: true});
    }

    console.log('Portfolio website loaded successfully with mobile optimizations!');
});
